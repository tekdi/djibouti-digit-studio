import React from "react";
import { useHistory } from "react-router-dom";
import { LuClock, LuCircleCheck, LuArrowRight } from "react-icons/lu";

const ServiceCard = ({ service, servicesData }) => {
  const history = useHistory();
  const ServiceIcon = service.icon;
  const serviceInfo = service.serviceInfo;

  const handleCardClick = () => {
    // Navigate to the service detail page with all necessary data
    const serviceData = servicesData?.Services?.find(s => s.businessService === service.businessService);
    if (serviceData) {
      history.push(`/${window.contextPath}/citizen/publicservices/service/${service.businessService}`, {
        serviceData: serviceData
      });
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-djibouti-primary hover:border-opacity-30 transition-all group cursor-pointer" onClick={handleCardClick}>
      {/* Card Header */}
      <div className="p-4 sm:p-6 pb-3 sm:pb-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-djibouti-primary-light flex items-center justify-center flex-shrink-0 group-hover:bg-djibouti-primary group-hover:bg-opacity-15 transition-colors">
            <ServiceIcon className="w-5 h-5 sm:w-7 sm:h-7 text-djibouti-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight mb-1.5 sm:mb-2 group-hover:text-djibouti-primary transition-colors">
            {serviceInfo.ref} - {serviceInfo.name}
            </h3>
            <p
              className="text-xs sm:text-sm text-gray-600 leading-relaxed overflow-hidden"
              title={serviceInfo.description}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis'
              }}
            >
              {serviceInfo.description}
            </p>
          </div>
        </div>
      </div>

      {/* Card Footer — stacks on mobile, inline on sm+ */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Features */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1 whitespace-nowrap">
              <LuClock className="w-3 h-3 flex-shrink-0" />
              <span>Rapide</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap">
              <LuCircleCheck className="w-3 h-3 flex-shrink-0" />
              <span>En ligne</span>
            </div>
          </div>

          {/* View Details Button — full-width on mobile, inline on sm+ */}
          <div className="inline-flex items-center justify-center gap-2 bg-djibouti-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-djibouti-primary-dark transition-colors group/btn w-full sm:w-auto whitespace-nowrap">
            <span>Voir les détails</span>
            <LuArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
