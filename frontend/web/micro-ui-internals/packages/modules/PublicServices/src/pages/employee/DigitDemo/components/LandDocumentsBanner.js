import React from "react";
import { LuTriangleAlert } from "react-icons/lu";

const LandDocumentsBanner = () => {
  return (
    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
        <LuTriangleAlert className="h-5 w-5 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-900 mb-0.5">Information importante</p>
        <p className="text-sm text-amber-800 leading-relaxed">
          Cette section est réservée aux informations relatives aux documents fonciers
        </p>
      </div>
    </div>
  );
};

export default LandDocumentsBanner;
