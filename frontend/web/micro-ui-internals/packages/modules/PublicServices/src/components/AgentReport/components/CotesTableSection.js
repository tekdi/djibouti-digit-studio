import React from "react";
import PropTypes from "prop-types";
import { LuPlus, LuTrash2 } from "react-icons/lu";

export const CotesTableSection = ({
  cotesTable,
  isViewMode,
  isEditMode,
  handleCoteRowChange,
  addCoteRow,
  removeCoteRow,
}) => {
  const isEditable = !isViewMode || isEditMode;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-djibouti-primary rounded-full" />
          <h3 className="text-lg font-bold text-gray-900">Tableau des côtes PR</h3>
        </div>
        {isEditable && (
          <button
            onClick={addCoteRow}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-djibouti-primary border border-djibouti-primary/30 bg-djibouti-primary/5 hover:bg-djibouti-primary/10 transition-all duration-200"
          >
            <LuPlus className="h-4 w-4" />
            Ajouter une ligne
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                N°
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Côtes relevées
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Côtes du projet
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Observation
              </th>
              {isEditable && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {cotesTable.map((row, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-500">
                  {index + 1}
                </td>
                <td className="px-4 py-3">
                  {isEditable ? (
                    <input
                      type="text"
                      value={row.cotesRelevees}
                      onChange={(e) => handleCoteRowChange(index, "cotesRelevees", e.target.value)}
                      placeholder="-"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-djibouti-primary/20 focus:border-djibouti-primary transition-all"
                    />
                  ) : (
                    <span className="text-sm text-gray-700">{row.cotesRelevees || "-"}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {isEditable ? (
                    <input
                      type="text"
                      value={row.cotesDuProjet}
                      onChange={(e) => handleCoteRowChange(index, "cotesDuProjet", e.target.value)}
                      placeholder="-"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-djibouti-primary/20 focus:border-djibouti-primary transition-all"
                    />
                  ) : (
                    <span className="text-sm text-gray-700">{row.cotesDuProjet || "-"}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {isEditable ? (
                    <input
                      type="text"
                      value={row.observation}
                      onChange={(e) => handleCoteRowChange(index, "observation", e.target.value)}
                      placeholder="-"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-djibouti-primary/20 focus:border-djibouti-primary transition-all"
                    />
                  ) : (
                    <span className="text-sm text-gray-700">{row.observation || "-"}</span>
                  )}
                </td>
                {isEditable && (
                  <td className="px-4 py-3">
                    {cotesTable.length > 1 && (
                      <button
                        onClick={() => removeCoteRow(index)}
                        className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        <LuTrash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

CotesTableSection.propTypes = {
  cotesTable: PropTypes.array.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  handleCoteRowChange: PropTypes.func.isRequired,
  addCoteRow: PropTypes.func.isRequired,
  removeCoteRow: PropTypes.func.isRequired,
};
