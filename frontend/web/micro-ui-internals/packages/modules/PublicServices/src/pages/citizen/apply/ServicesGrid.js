import React from "react";
import ServiceCard from "./ServiceCard";

const ServicesGrid = ({ 
  detailsConfig, 
  searchTerm, 
  selectedFilter, 
  isCitizen, 
  getServiceIcon,
  getServiceInfo,
  servicesData
}) => {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
      {detailsConfig?.map((product, productIndex) => (
        <React.Fragment key={productIndex}>
          {product?.businessServices
            ?.filter((bs) => {
              if (isCitizen) {
                return (
                  bs.businessService === "BPA_PCO_SIMPLE" ||
                  bs.businessService === "BPA_PCS" ||
                  bs.businessService === "BPA_PL" ||
                  bs.businessService === "BPA_PD" ||
                  bs.businessService === "BPA_PF" ||
                  bs.businessService === "BPA_ATARR" ||
                  bs.businessService === "BPA_APE" ||
                  bs.businessService === "BPA_PV" ||
                  bs.businessService === "BPA_CCG" ||
                  bs.businessService === "BPA_CCP" ||
                  bs.businessService === "BPA_CCE" ||
                  bs.businessService === "BPA_CCR" ||
                  bs.businessService === "BPA_PR"
                );
              }
              return true; // show all for architects
            })
            ?.filter((bs) => {
              const serviceInfo = getServiceInfo(bs.businessService);
              
              // Filter by category
              if (selectedFilter !== "all" && serviceInfo.category !== selectedFilter) {
                return false;
              }
              
              // Filter by search term
              if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return (
                  serviceInfo.name.toLowerCase().includes(searchLower) ||
                  serviceInfo.description.toLowerCase().includes(searchLower) ||
                  serviceInfo.ref.toLowerCase().includes(searchLower)
                );
              }
              
              return true;
            })
            ?.sort((a, b) => {
              const refA = getServiceInfo(a.businessService).ref;
              const refB = getServiceInfo(b.businessService).ref;
              // Extract number from ref (e.g., "P1" -> 1)
              const numA = parseInt(refA.replace('P', ''));
              const numB = parseInt(refB.replace('P', ''));
              return numA - numB;
            })
            ?.map((service, serviceIndex) => {
              const ServiceIcon = getServiceIcon(service.businessService);
              const serviceInfo = getServiceInfo(service.businessService);

              return (
                <ServiceCard
                  key={service.businessService}
                  service={{
                    ...service,
                    icon: ServiceIcon,
                    serviceInfo: serviceInfo
                  }}
                  servicesData={servicesData}
                />
              );
            })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ServicesGrid;
