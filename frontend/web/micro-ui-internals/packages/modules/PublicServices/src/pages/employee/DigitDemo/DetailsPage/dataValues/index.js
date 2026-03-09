// Import all service data files
import { p1Data } from './p1';
import { p2Data } from './p2';
import { p3Data } from './p3';
import { p4Data } from './p4';
import { p5Data } from './p5';
import { p6Data } from './p6';
import { p7Data } from './p7';
import { p8Data } from './p8';
import { p9Data } from './p9';
import { p10Data } from './p10';
import { p11Data } from './p11';
import { p12Data } from './p12';
import { p13Data } from './p13';
import { p13CceData } from './p13Cce';
import { p14Data } from './p14';
import { p15Data } from './p15';

// Export all data as a single object
export const serviceData = {
  'BPA_PCO': p1Data,           // Construction Permit
  'BPA_PCO_SIMPLE': p2Data,    // Simple Construction Permit
  'BPA_PR': p3Data,            // Fill Permit
  'BPA_PL': p4Data,            // Layout Permit
  'BPA_PCS': p5Data,           // Simplified Construction Permit
  'BPA_PD': p6Data,            // Demolition Permit
  'BPA_PF': p7Data,            // Project File
  'BPA_PS': p8Data,            // Elevation Permit
  'BPA_ATARR': p9Data,         // Extension Construction Permit
  'BPA_CCR': p10Data,          // Backfill Verification Certificate
  'BPA_CCE': p13CceData,       // P13 - Certificat de Conformité Electrique (CCE)
  'BPA_CCP': p12Data,          // Construction Progress Certificate
  'BPA_CCG': p13Data,          // Certificate of Conformity
  'BPA_PV': p14Data,           // Project Validation
  'BPA_APE': p15Data,          // Execution Permit
};

// Helper function to get data by service type
export const getServiceData = (serviceType) => {
  return serviceData[serviceType] || null;
};
