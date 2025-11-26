import React, { useState } from "react";
import PropTypes from "prop-types";
import { LuX, LuDownload, LuFileText, LuEye } from "react-icons/lu";

const PDFPreview = ({ fileUrl, fileName, onClose, onDownload }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-djibouti-primary to-djibouti-primary-dark text-white">
          <div className="flex items-center gap-3">
            <LuFileText className="h-6 w-6" />
            <div>
              <h3 className="text-lg font-semibold">{fileName || "Aperçu PDF"}</h3>
              <p className="text-sm text-white/80">Prévisualisation du document</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                onClick={onDownload}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title="Télécharger"
              >
                <LuDownload className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              title="Fermer"
            >
              <LuX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden relative bg-gray-100">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-djibouti-primary border-t-transparent mb-4"></div>
                <p className="text-gray-600 font-medium">Chargement du PDF...</p>
              </div>
            </div>
          )}

          {error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                  <LuFileText className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Erreur de chargement
                </h4>
                <p className="text-gray-600 mb-4">{error}</p>
                {onDownload && (
                  <button
                    onClick={onDownload}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-djibouti-primary text-white rounded-lg hover:bg-djibouti-primary-dark transition-colors"
                  >
                    <LuDownload className="h-4 w-4" />
                    Télécharger le fichier
                  </button>
                )}
              </div>
            </div>
          ) : (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0"
              title="PDF Preview"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setError("Impossible de charger le PDF. Veuillez essayer de le télécharger.");
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <LuEye className="h-4 w-4" />
            <span>Mode prévisualisation</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

PDFPreview.propTypes = {
  fileUrl: PropTypes.string.isRequired,
  fileName: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onDownload: PropTypes.func,
};

export default PDFPreview;

