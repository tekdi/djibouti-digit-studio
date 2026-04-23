import React from "react";
import PropTypes from "prop-types";
import { CONFORMITY_LIST, CONFORMITY_OBSERVATION_OPTIONS } from "../documentsData";

const ConformityTable = ({
  formData,
  isViewMode,
  isEditMode,
  handleConformityChange,
  getColorClass,
}) => {
  return (
    <div>
      <div className="mt-10 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Conformité du projet</h3>
        <p className="text-sm text-gray-500 mb-4">
          Vérifiez la conformité technique, réglementaire et du projet
        </p>
      </div>

      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5">
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 w-12">
                #
              </th>
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 min-w-[260px]">
                Point de contrôle
              </th>
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 min-w-[200px]">
                Prescriptions réglementaires
              </th>
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 min-w-[200px]">
                Prescriptions du projet
              </th>
              <th className="border border-gray-200 p-3 text-center text-sm font-semibold text-gray-700 min-w-[220px]">
                Observations
              </th>
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 min-w-[220px]">
                Commentaires
              </th>
            </tr>
          </thead>
          <tbody>
            {CONFORMITY_LIST.map((item) => {
              const conformityData = formData.conformity.find((c) => c.id === item.id) || {
                technicalPrescription: "",
                regulatoryPrescription: "",
                projectPrescription: "",
                observation: "",
                textInput: "",
              };

              const isDisabled = isViewMode && !isEditMode;
              const needsTextInput = item.hasTextInput && conformityData.observation === "OUI";

              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border border-gray-200 p-3 text-center text-sm font-medium text-gray-600">
                    {item.id}
                  </td>
                  <td className="border border-gray-200 p-3 text-sm text-gray-700">
                    {item.label}
                  </td>
                  <td className="border border-gray-200 p-3">
                    {isViewMode && !isEditMode ? (
                      <div className="text-sm text-gray-700">
                        {conformityData.regulatoryPrescription || "-"}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={conformityData.regulatoryPrescription}
                        onChange={(e) =>
                          handleConformityChange(item.id, "regulatoryPrescription", e.target.value)
                        }
                        placeholder="..."
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-djibouti-primary transition-colors"
                      />
                    )}
                  </td>
                  <td className="border border-gray-200 p-3">
                    {isViewMode && !isEditMode ? (
                      <div className="text-sm text-gray-700">
                        {conformityData.projectPrescription || "-"}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={conformityData.projectPrescription}
                        onChange={(e) =>
                          handleConformityChange(item.id, "projectPrescription", e.target.value)
                        }
                        placeholder="..."
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-djibouti-primary transition-colors"
                      />
                    )}
                  </td>
                  <td className="border border-gray-200 p-3">
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                      {CONFORMITY_OBSERVATION_OPTIONS.map((option) => {
                        const isChecked = conformityData.observation === option.value;
                        const shouldShow =
                          (item.id === 5 || item.id === 6 || item.id === 13)
                            ? (option.value === "NON" || option.value === "OUI")
                            : (option.value === "CONFORME" || option.value === "NON_CONFORME");

                        if (!shouldShow) return null;

                        return (
                          <label
                            key={option.value}
                            className={`flex items-center gap-2 cursor-pointer ${
                              isDisabled ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name={`conformity-${item.id}`}
                              checked={isChecked}
                              onChange={() =>
                                !isDisabled && handleConformityChange(item.id, "observation", option.value)
                              }
                              disabled={isDisabled}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <span className={`text-xs font-medium ${getColorClass(option.color)}`}>
                              {option.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </td>
                  <td className="border border-gray-200 p-3">
                    {isViewMode && !isEditMode ? (
                      <div className="text-sm text-gray-700">
                        {conformityData.textInput || "—"}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={conformityData.textInput || ""}
                        onChange={(e) =>
                          handleConformityChange(item.id, "textInput", e.target.value)
                        }
                        placeholder={item.textInputLabel || "Commentaires..."}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-djibouti-primary transition-colors"
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

ConformityTable.propTypes = {
  formData: PropTypes.object.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  handleConformityChange: PropTypes.func.isRequired,
  getColorClass: PropTypes.func.isRequired,
};

export default ConformityTable;

