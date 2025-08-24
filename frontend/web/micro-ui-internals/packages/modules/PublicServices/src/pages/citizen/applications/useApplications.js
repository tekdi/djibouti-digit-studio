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
  const uuid = userDetails?.info?.uuid;
  const indId = individualDetails && individualDetails?.Individual?.[0]?.individualId;

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
      console.log("Fetching applications with params:", {
        tenantId,
        userId: indId,
        status: "ACTIVE",
        createdBy: uuid,
        forceRefresh
      });

      const response = await axios.get(`/public-service/v1/application`, {
        params: {
          tenantId: tenantId,
          userId: indId,
          status: "ACTIVE",
          createdBy: uuid
        },
        headers: {
          "X-Tenant-Id": tenantId,
          "auth-token": userDetails?.access_token,
        },
      });

      console.log("API Response:", response?.data);
      const applicationsData = response?.data?.Application || [];
      setApplications(applicationsData);
      setLastFetchTime(Date.now());
      setError(null);
      
      // Save to cache
      saveToCache(applicationsData);
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
