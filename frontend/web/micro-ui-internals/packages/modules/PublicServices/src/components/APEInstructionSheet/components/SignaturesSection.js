import React from "react";
import PropTypes from "prop-types";

const ROWS = [
  { key: "engineer", role: "Agent / ingénieur SCC Privée", title: "Ingénieur chargé du contrôle" },
  { key: "chef", role: "Chef de service SCC Privée", title: "Validation technique" },
  { key: "subDirector", role: "Sous-Directeur de la SDECC", title: "Validation finale / certificat" },
];

const SignaturesSection = ({ values, onChange, isDisabled }) => {
  const handle = (rowKey, field) => (e) =>
    onChange(rowKey, { ...(values[rowKey] || {}), [field]: e.target.value });

  return (
    <div className="mb-8">
      <div className="mb-4 pb-2 border-b-2 border-djibouti-primary/20">
        <h3 className="text-xl font-bold text-gray-900">III. Signatures</h3>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5">
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">Signataire</th>
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">Nom</th>
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">Fonction</th>
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => {
              const v = values[r.key] || {};
              return (
                <tr key={r.key}>
                  <td className="border border-gray-200 p-3 text-sm font-medium text-gray-800">{r.role}</td>
                  <td className="border border-gray-200 p-2">
                    <input
                      type="text"
                      value={v.name || ""}
                      onChange={handle(r.key, "name")}
                      disabled={isDisabled}
                      placeholder="Nom complet"
                      className="w-full px-2 py-1.5 bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded text-sm focus:border-djibouti-primary focus:outline-none disabled:bg-gray-50"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-sm text-gray-600 italic">{r.title}</td>
                  <td className="border border-gray-200 p-2">
                    <input
                      type="date"
                      value={v.date || ""}
                      onChange={handle(r.key, "date")}
                      disabled={isDisabled}
                      className="w-full px-2 py-1.5 bg-white text-gray-900 border border-gray-200 rounded text-sm focus:border-djibouti-primary focus:outline-none disabled:bg-gray-50"
                    />
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

SignaturesSection.propTypes = {
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
};

export default SignaturesSection;
