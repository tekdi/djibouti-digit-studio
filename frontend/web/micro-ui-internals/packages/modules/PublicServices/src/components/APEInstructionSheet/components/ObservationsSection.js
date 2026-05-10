import React from "react";
import PropTypes from "prop-types";

const ObservationsSection = ({
  engineerObservations,
  chefObservations,
  onEngineerChange,
  onChefChange,
  isDisabled,
}) => {
  return (
    <React.Fragment>
      <div className="mb-8">
        <div className="mb-4 pb-2 border-b-2 border-djibouti-primary/20">
          <h3 className="text-xl font-bold text-gray-900">IV. Observations de l'ingénieur SDECC</h3>
          <p className="text-sm text-gray-500 mt-1">À renseigner obligatoirement en cas de non-conformité, de pièce manquante ou de demande de complément.</p>
        </div>
        <textarea
          value={engineerObservations || ""}
          onChange={(e) => onEngineerChange(e.target.value)}
          disabled={isDisabled}
          rows={5}
          placeholder="Saisir les observations techniques relatives aux documents, aux ouvrages contrôlés ou aux essais de laboratoire…"
          className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg text-sm focus:border-djibouti-primary focus:outline-none focus:ring-2 focus:ring-djibouti-primary/20 disabled:bg-gray-50 resize-y"
        />
      </div>

      <div className="mb-8">
        <div className="mb-4 pb-2 border-b-2 border-djibouti-primary/20">
          <h3 className="text-xl font-bold text-gray-900">V. Observations du chef de service SCC Privée</h3>
          <p className="text-sm text-gray-500 mt-1">Validation, réserve, demande de complément ou orientation du dossier.</p>
        </div>
        <textarea
          value={chefObservations || ""}
          onChange={(e) => onChefChange(e.target.value)}
          disabled={isDisabled}
          rows={5}
          placeholder="Saisir les observations du chef de service SCC Privée…"
          className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg text-sm focus:border-djibouti-primary focus:outline-none focus:ring-2 focus:ring-djibouti-primary/20 disabled:bg-gray-50 resize-y"
        />
      </div>
    </React.Fragment>
  );
};

ObservationsSection.propTypes = {
  engineerObservations: PropTypes.string,
  chefObservations: PropTypes.string,
  onEngineerChange: PropTypes.func.isRequired,
  onChefChange: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
};

export default ObservationsSection;
