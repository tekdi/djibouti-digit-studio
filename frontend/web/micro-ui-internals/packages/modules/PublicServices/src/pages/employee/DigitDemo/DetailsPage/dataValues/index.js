// Import all service data files
import { p1Data } from './p1';
import { p2Data } from './p2';
import { p4Data } from './p4';
import { p7Data } from './p7';
import { p8Data } from './p8';
import { p13Data } from './p13';

// Export all data as a single object
export const serviceData = {
  'BPA_PCO': p1Data,  // Construction Permit
  'BPA_PCS': p2Data,  // Extension Permit
  'BPA_PL': p4Data,   // Layout Permit
  'BPA_PF': p7Data,   // Project File
  'BPA_PS': p8Data,   // Elevation Permit
  'BPA_CCG': p13Data, // Certificate of Conformity
};

// Helper function to get data by service type
export const getServiceData = (serviceType) => {
  return serviceData[serviceType] || null;
};
