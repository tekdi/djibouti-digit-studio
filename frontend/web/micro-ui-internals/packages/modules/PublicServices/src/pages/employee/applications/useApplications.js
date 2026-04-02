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

  // Cache keys for localStorage
  const CACHE_KEY = `employee_applications_cache`;
  const TIMESTAMP_KEY = `employee_applications_timestamp`;
  const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

  // Normalize application from the new /public-service/v1/application endpoint
  // into the shape components expect (businessObject + ProcessInstance)
  const normalizeApplication = (app) => {
    // processInstance is an array - take the last entry for current state
    // Fall back to nested responseData processInstance if top-level is null
    const processInstances = app.processInstance
      || app.serviceDetails?.responseData?.Application?.processInstance
      || [];
    const latestProcessInstance = processInstances.length > 0
      ? processInstances[processInstances.length - 1]
      : null;

    // Top-level applicants may have empty name/mobileNumber;
    // the real applicant data lives in serviceDetails.responseData.Application.applicants
    const responseApplicants = app.serviceDetails?.responseData?.Application?.applicants || [];
    const topApplicants = app.applicants || [];
    // Prefer responseData applicants if they have a name, otherwise fall back to top-level
    const applicants = responseApplicants.length > 0 && responseApplicants[0]?.name
      ? responseApplicants
      : topApplicants;

    return {
      businessObject: {
        applicationNumber: app.applicationNumber,
        businessService: app.businessService,
        module: app.module,
        serviceCode: app.serviceCode,
        status: app.status,
        channel: app.channel,
        applicants: applicants,
        auditDetails: app.auditDetails || {},
        workflow: app.workflow || {},
        additionalDetails: app.additionalDetails || {},
        address: app.address || {},
        documents: app.documents || [],
        serviceDetails: app.serviceDetails || {},
      },
      ProcessInstance: latestProcessInstance
        ? {
            ...latestProcessInstance,
            state: latestProcessInstance.state || {},
            assignes: latestProcessInstance.assignes || [],
            assignees: latestProcessInstance.assignees || [],
          }
        : { state: { applicationStatus: app.workflowStatus }, assignes: [], assignees: [] },
    };
  };

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
          const cached = JSON.parse(cachedApplications);
          setApplications(cached);
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

  // Fetch applications using the public-service application endpoint
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
      console.log("Fetching employee applications from /public-service/v1/application");

      const response = await axios.get(
        `/public-service/v1/application`,
        {
          params: { tenantId: tenantId },
          headers: {
            "X-Tenant-Id": tenantId,
            "auth-token": userDetails?.access_token,
          },
        }
      );

      const applicationsData = response?.data?.Application || [];

      // Normalize into the shape components expect
      const normalizedData = applicationsData.map(normalizeApplication);

      // Remove duplicates based on applicationNumber
      const uniqueApplications = normalizedData.filter((item, index, self) => {
        const appNumber = item.businessObject?.applicationNumber;
        return index === self.findIndex((a) => a.businessObject?.applicationNumber === appNumber);
      });

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
