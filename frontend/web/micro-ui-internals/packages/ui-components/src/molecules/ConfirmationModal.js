import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Yes",
  cancelText = "No"
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <Fragment>
      <div className="modal-overlay">
        <div className="modal-container">
          <h2 className="modal-title">{t(title)}</h2>
          <p className="modal-message">{t(message)}</p>
          <div className="modal-actions">
            <button className="btn-cancel" onClick={onClose}>
              {t(cancelText)}
            </button>
            <button className="btn-confirm" onClick={onConfirm}>
              {t(confirmText)}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-container {
          background-color: #fff;
          padding: 24px;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
        }

        .modal-title {
          font-size: 24px;
          margin-bottom: 16px;
          color: #0B0C0C;
        }

        .modal-message {
          font-size: 16px;
          margin-bottom: 24px;
          color: #505A5F;
        }

        .modal-actions {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          gap: 16px;
        }

        .btn-cancel {
          padding: 8px 24px;
          border: 1px solid #22a4d9;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          background-color: #fff;
          color: #22a4d9;
          cursor: pointer;
        }

        .btn-cancel:hover {
          background-color: #f8f8f8;
        }

        .btn-confirm {
          padding: 8px 24px;
          background-color: #22a4d9;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
        }

        .btn-confirm:hover {
          background-color: #006156;
        }
      `}</style>
    </Fragment>
  );
};

export default ConfirmationModal;
