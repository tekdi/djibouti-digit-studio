const express = require("express");
const router = express.Router();
const config = require("../config");
const { getPublicServiceApplicationDetails, create_pdf, getBaseMDMSData, search_mdms_v2 } = require("../api");
const { asyncMiddleware } = require("../utils/asyncMiddleware");
const { logger } = require("../logger");

/**
 * Helper to render a standardized error response
 */
function renderError(res, message, status = 500) {
  res.status(status).send({ errorMessage: message });
}

/**
 * Helper to fetch service configuration from MDMS
 */
async function getServiceConfig(tenantId, serviceCode, requestInfo) {
  const request = {
    RequestInfo: requestInfo,
    MdmsCriteria: {
      tenantId: tenantId,
      schemaCode: "Studio.ServiceConfiguration",
      filters: {
        service: serviceCode
      }
    },
  };
  const response = await search_mdms_v2(request);
  return response?.data?.mdms || [];
}

/**
 * Endpoint: POST /generate
 * Description: Generates a PDF for a given service application
 * Query Params:
 *  - tenantId (string, required)
 *  - applicationNumber (string, required)
 *  - pdfKey (string, required)
 *  - serviceCode (string, optional)
 * Body:
 *  - RequestInfo (object, required)
 */
router.post(
  "/pdf",
  asyncMiddleware(async (req, res) => {
    const { tenantId, applicationNumber, pdfKey, serviceCode } = req.query;
    const requestBody = req.body;

    // Basic validations for required parameters
    if (!requestBody) return renderError(res, "requestBody cannot be null", 400);
    if (!tenantId) return renderError(res, "tenantId is mandatory to generate the receipt", 400);
    if (!applicationNumber) return renderError(res, "applicationNumber is mandatory to generate the receipt", 400);
    if (!pdfKey) return renderError(res, "pdfKey is mandatory to generate the receipt", 400);

    try {
      let applicationDetails, mdmsData;

      // Fetch application details and base MDMS data
      try {
        applicationDetails = await getPublicServiceApplicationDetails(tenantId, serviceCode, applicationNumber, requestBody?.RequestInfo);
        mdmsData = await getBaseMDMSData(tenantId);
      } catch (err) {
        logger.error(`Error fetching details for application ${applicationNumber} with service ${serviceCode}`);
        logger.error(err);
        return renderError(res, "Failed to query details of the application", 500);
      }

      const application = applicationDetails?.Application;

      // Proceed only if application exists
      if (application?.length > 0) {
        try {
          // Fetch Service Configuration
          const serviceConfigs = await getServiceConfig(tenantId, application[0]?.businessService, requestBody?.RequestInfo);
          logger.info(`Fetched serviceConfigs: ${JSON.stringify(serviceConfigs)}`);

          const currentServiceConfig = serviceConfigs.find(config => config.data.service === application[0]?.businessService);

          if (!currentServiceConfig) {
            return renderError(res, `Service Configuration not found for ${application[0]?.businessService}`, 400);
          }

          const pdfConfig = currentServiceConfig.data.pdf?.find(p => p.key === pdfKey);
          logger.info(`Found pdfConfig: ${JSON.stringify(pdfConfig)}`);
          if (!pdfConfig) {
            return renderError(res, `PDF Key ${pdfKey} is not configured for this service`, 400);
          }

          const currentState = application[0]?.processInstance?.[0]?.state?.state;
          if (!pdfConfig.states.includes(currentState)) {
            return renderError(res, `PDF ${pdfKey} is not allowed`, 400);
          }
        } catch (err) {
          logger.error("Error validating PDF configuration", err);
          return renderError(res, "Failed to validate PDF configuration", 500);
        }

        try {
          logger.info(`Generating PDF with key ${pdfKey} for application ${applicationNumber}`);

          const PDFGenerateObject = {
            PublicService: [
              {
                ...applicationDetails,
                ...mdmsData,
              },
            ],
          }
          logger.info(`PDFGenerateObject data: ${JSON.stringify(PDFGenerateObject)}`);

          // Call PDF generation service
          const pdfResponse = await create_pdf(
            tenantId,
            pdfKey,
            PDFGenerateObject,
            requestBody
          );

          // Send the PDF as downloadable response
          const filename = `${pdfKey}_${Date.now()}`;
          res.writeHead(200, {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=${filename}.pdf`,
          });
          pdfResponse.data.pipe(res);
        } catch (err) {
          logger.error("Error generating PDF", err);
          return renderError(res, "Failed to generate PDF for application", 500);
        }
      } else {
        // No matching application found
        return renderError(res, "No application found for the given applicationNumber", 404);
      }
    } catch (err) {
      logger.error("Unexpected error during PDF generation", err);
      return renderError(res, "Something went wrong", 500);
    }
  })
);

module.exports = router;
