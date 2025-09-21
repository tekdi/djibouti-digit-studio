import { useState, useEffect, useRef } from "react";
import axios from "axios";

const useApplications = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use refs to prevent infinite re-renders
  const isFetching = useRef(false);
  const hasInitialized = useRef(false);

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const userDetails = Digit.UserService.getUser();

  // Hardcoded business services array to avoid API issues
  const businessServicesList = [
    "BPA_PD",
    "BPA_ATARR",
    "BPA_PCO",
    "BPA_PCO_SDECC",
    "BPA_PCO_DGDCF",
    "BPA_PCO_ONEAD",
    "BPA_PCO_DNPC",
    "BPA_PCO_EDD",
    "BPA_PCO_INSPD",
    "BPA_PR",
    "BPA_CCP",
    "BPA_APE",
    "BPA_PF",
    "BPA_PL_ADR",
    "BPA_PCO_SIMPLE",
    "BPA_PCS",
    "BPA_PV",
    "BPA_CCE",
    "BPA_CCG",
    "BPA_PS",
    "BPA_CCR",
    "BPA_PL",
  ];

  // Cache keys for localStorage
  const CACHE_KEY = `employee_applications_cache`;
  const TIMESTAMP_KEY = `employee_applications_timestamp`;
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
          console.log("Loading cached employee applications data from localStorage");
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
      console.log("Employee applications data cached to localStorage");
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  };

  // Fetch applications - using the inbox endpoint like in modulePageComponent.js
  const fetchApplications = async (forceRefresh = false) => {
    if (isFetching.current) {
      console.log("Already fetching applications");
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
      console.log("Fetching employee applications with inbox endpoint");

      // Use hardcoded business services list
      const servicesList = businessServicesList;

      // Use the inbox endpoint with correct structure - only RequestInfo and inbox
      const response = await axios.post(
        `/inbox/v2/_search`,
        {
          RequestInfo: {
            apiId: "Rainmaker",
            authToken: userDetails?.access_token,
            userInfo: userDetails?.info,
            msgId: `${Date.now()}|${Digit.StoreData.getCurrentLanguage()}`,
            plainAccessRequest: {},
          },
          inbox: {
            limit: 10,
            offset: 0,
            tenantId: tenantId,
            processSearchCriteria: {
              businessService: servicesList,
              moduleName: "public-services",
              tenantId: tenantId,
            },
            moduleSearchCriteria: {
              businessService: servicesList,
              module: "BPA",
              sortOrder: "DESC",
            },
          },
        },
        {
          headers: {
            "X-Tenant-Id": tenantId,
            "auth-token": userDetails?.access_token,
          },
        }
      );

             console.log("Inbox API Response:", response?.data);
       const applicationsData = response?.data?.items || [];
       
       // Remove duplicates based on applicationNumber (from Data object)
       const uniqueApplications = applicationsData.filter((item, index, self) => 
         index === self.findIndex(a => a.Data?.applicationNumber === item.Data?.applicationNumber)
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
        status: error.response?.status,
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

    fetchApplications();
  }, []);

  // Auto-refetch every 3 minutes (180000 ms)
  useEffect(() => {
    if (!hasInitialized.current) return;

    const intervalId = setInterval(() => {
      console.log("Auto-refreshing employee applications after 3 minutes");
      refreshApplications();
    }, 180000); // 3 minutes

    return () => clearInterval(intervalId);
  }, []);

  return {
    applications,
    isLoading,
    isRefreshing,
    error,
    refreshApplications,
    lastFetchTime,
  };
};

export default useApplications;
