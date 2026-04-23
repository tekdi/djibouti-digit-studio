import { useState, useEffect, useRef } from "react";
import axios from "axios";

const useApplications = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [individualDetails, setIndividualDetails] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use refs to prevent infinite re-renders
  const hasFetchedIndividual = useRef(false);
  const isFetching = useRef(false);
  const hasInitialized = useRef(false);

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const userDetails = Digit.UserService.getUser();
  console.log("userDetails", userDetails);
  const uuid = userDetails?.info?.uuid;
  const indId = individualDetails && individualDetails?.Individual?.[0]?.individualId;
  // Architects submit on behalf of citizens — their own applicants[].userId points at the
  // citizen (not themselves), so filtering by userId would hide their submissions. For
  // architects we fall back to createdBy = their uuid (pre-fix behavior). Plain citizens
  // keep the userId filter so they see apps submitted on their behalf.
  const isArchitect = userDetails?.info?.roles?.some((r) => r.code === "BPA_ARCHITECT");

  // Cache keys for localStorage
  const CACHE_KEY = `applications_cache_${uuid}`;
  const TIMESTAMP_KEY = `applications_timestamp_${uuid}`;
  const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

  // Load cached data from localStorage
  const loadCachedData = () => {
    try { 
      const cachedApplications = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(TIMESTAMP_KEY);
      
      if (cachedApplications && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const now = Date.now();
        
                 // Check if cache is still valid (less than 1 hour old)
        if (now - timestamp < CACHE_DURATION) {
          console.log("Loading cached applications data from localStorage");
          setApplications(JSON.parse(cachedApplications));
          setLastFetchTime(timestamp);
          setIsLoading(false);
          return true; // Cache is valid
        } else {
          console.log("Cache expired, will fetch fresh data");
          // Clear expired cache
          localStorage.removeItem(CACHE_KEY);
          localStorage.removeItem(TIMESTAMP_KEY);
        }
      }
    } catch (error) {
      console.error("Error loading cached data:", error);
      // Clear corrupted cache
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(TIMESTAMP_KEY);
    }
    return false; // No valid cache
  };

  // Save data to localStorage cache
  const saveToCache = (data) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
      console.log("Applications data cached to localStorage");
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  };

  // Fetch individual details
  const fetchIndividualDetails = async () => {
    if (!uuid || hasFetchedIndividual.current) return;
    
    hasFetchedIndividual.current = true;
    
    try {
      const response = await axios.post(`/health-individual/v1/_search?tenantId=${tenantId}&limit=1&offset=0`, {
        "RequestInfo": {
          apiId: "Rainmaker",
          authToken: userDetails?.access_token,
          userInfo: userDetails?.info,
          msgId: `${Date.now()}|${Digit.StoreData.getCurrentLanguage()}`,
        },
        "Individual": {
          "userUuid": [uuid]
        }
      });
      setIndividualDetails(response?.data);
    } catch (error) {
      console.error("Error fetching individual details:", error);
      setError("Failed to fetch user details");
    }
  };

  // Fetch applications
  const fetchApplications = async (forceRefresh = false) => {
    if (!indId || !uuid || isFetching.current) {
      console.log("Missing required data or already fetching:", { indId, uuid, isFetching: isFetching.current });
      return;
    }

    // If not forcing refresh, try to load from cache first
    if (!forceRefresh) {
      const cacheValid = loadCachedData();
      if (cacheValid) {
        return; // Cache was loaded successfully
      }
    }

    isFetching.current = true;

    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await axios.get(`/public-service/v1/application`, {
        params: isArchitect
          ? {
              // Architects: filter by createdBy so they see everything THEY submitted
              // (including on-behalf-of-citizen applications whose applicants[].userId
              // points at the citizen, not at them).
              tenantId: tenantId,
              createdBy: uuid,
            }
          : {
              // Citizens: filter by userId (individual id) so they see applications
              // submitted on their behalf by architects. Do NOT filter by status=ACTIVE
              // (backend leaves top-level status empty on architect-submitted records)
              // or by createdBy (that's the architect, not the citizen).
              tenantId: tenantId,
              userId: indId,
            },
        headers: {
          "X-Tenant-Id": tenantId,
          "auth-token": userDetails?.access_token,
        },
      });

      console.log("API Response:", response?.data);
      const applicationsData = response?.data?.Application || [];
      
      // Remove duplicates based on applicationNumber
      const uniqueApplications = applicationsData.filter((app, index, self) => 
        index === self.findIndex(a => a.applicationNumber === app.applicationNumber)
      );
      
      console.log(`Filtered ${applicationsData.length - uniqueApplications.length} duplicate applications`);
      setApplications(uniqueApplications);
      setLastFetchTime(Date.now());
      setError(null);
      
      // Save to cache
      saveToCache(uniqueApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setApplications([]);
      setError("Failed to fetch applications");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isFetching.current = false;
    }
  };

  // Refresh applications (force new API call)
  const refreshApplications = () => {
    // Clear cache when forcing refresh
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(TIMESTAMP_KEY);
    fetchApplications(true);
  };

  // Initial data fetch - only run once
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    const initializeData = async () => {
      await fetchIndividualDetails();
    };
    initializeData();
  }, []);

  // Fetch applications when individual details are available
  useEffect(() => {
    if (indId && hasInitialized.current) {
      fetchApplications();
    }
  }, [indId]);

  // Background auto-refetch was removed — silent polling mid-session caused
  // random page reloads and occasional logouts while testing. Users click the
  // refresh button if they want fresh data.

  return {
    applications,
    isLoading,
    isRefreshing,
    error,
    refreshApplications,
    lastFetchTime
  };
};

export default useApplications;
