import React from "react";
import PropTypes from "prop-types";
import { FINAL_OPINION_OPTIONS } from "../documentsData";

const FinalCommentsAndOpinion = ({
  formData,
  errors,
  isViewMode,
  isEditMode,
  handleInputChange,
}) => {
  return (
    <div className="space-y-6 mb-8">
      {/* Comments Textarea */}
      <div>
        <label className="block mb-3 font-semibold text-base text-gray-800">
          Commentaires <span className="text-gray-500 font-normal">(Optionnel)</span>
        </label>
        {isViewMode && !isEditMode ? (
          <div className="w-full min-h-[120px] p-4 border-2 border-gray-200 rounded-xl text-sm font-inherit bg-gray-50 text-gray-700 leading-relaxed">
            {formData.finalComments || "Aucun commentaire fourni."}
          </div>
        ) : (
          <textarea
            value={formData.finalComments}
            onChange={(e) => handleInputChange("finalComments", e.target.value)}
            placeholder="Entrez vos commentaires généraux sur la conformité du projet..."
            className="w-full min-h-[120px] p-4 border-2 border-gray-200 rounded-xl text-sm font-inherit resize-y transition-all duration-200 outline-none focus:border-djibouti-primary focus:shadow-[0_0_0_3px_rgba(15,103,105,0.1)]"
          />
        )}
      </div>

      {/* Final Opinion Radio */}
      <div>
        <label className="block mb-3 font-semibold text-base text-gray-800">
          Avis final <span className="text-red-500">*</span>
        </label>
        {isViewMode && !isEditMode ? (
          <div className="flex items-center gap-2">
            {formData.finalOpinion && (
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ${
                  formData.finalOpinion === "FAVORABLE"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {FINAL_OPINION_OPTIONS.find((o) => o.value === formData.finalOpinion)?.label}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-6">
            {FINAL_OPINION_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                    formData.finalOpinion === option.value
                      ? option.value === "FAVORABLE"
                        ? "bg-emerald-500"
                        : "bg-red-500"
                      : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                      formData.finalOpinion === option.value
                        ? "translate-x-6"
                        : "translate-x-0"
                    }`}
                  />
                </div>
                <span
                  className={`text-base font-semibold transition-colors ${
                    formData.finalOpinion === option.value
                      ? option.value === "FAVORABLE"
                        ? "text-emerald-700"
                        : "text-red-700"
                      : "text-gray-500"
                  }`}
                >
                  {option.label}
                </span>
                <input
                  type="radio"
                  name="finalOpinion"
                  value={option.value}
                  checked={formData.finalOpinion === option.value}
                  onChange={(e) => handleInputChange("finalOpinion", e.target.value)}
                  className="sr-only"
                />
              </label>
            ))}
          </div>
        )}
        {errors.finalOpinion && (
          <p className="text-red-500 text-xs mt-1">{errors.finalOpinion}</p>
        )}
      </div>
    </div>
  );
};

FinalCommentsAndOpinion.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

export default FinalCommentsAndOpinion;







