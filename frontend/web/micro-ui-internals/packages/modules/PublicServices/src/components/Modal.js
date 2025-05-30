import React, { Fragment, useEffect } from "react";
import PopUp from "./PopUp";
// import HeaderBar from "../atoms/HeaderBar";
// import ButtonSelector from "../atoms/ButtonSelector";
// import Toast from "../atoms/Toast";
import { Toast } from "@egovernments/digit-ui-components";
import HeaderBar from "../../../../ui-components/src/atoms/HeaderBar";

const Modal = ({
  headerBarMain,
  headerBarEnd,
  popupStyles,
  children,
  actionCancelLabel,
  actionCancelOnSubmit,
  actionSaveLabel,
  actionSaveOnSubmit,
  error,
  setError,
  formId,
  isDisabled,
  hideSubmit,
  style = {},
  popupModuleMianStyles,
  headerBarMainStyle,
  isOBPSFlow = false,
  popupModuleActionBarStyles = {}
}) => {
  /**
   * TODO: It needs to be done from the desgin changes
   */
  const mobileView = Digit.Utils.browser.isMobile() ? true : false;

  useEffect(() => {
    document.body.style.overflowY = 'hidden';
    return () => {
      document.body.style.overflowY = 'auto';
    }
  }, []);

  // Add keyframes for animationdiv
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes modalSlideIn {
        from {
          transform: translateY(-20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Fragment>
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <HeaderBar
            style={{ display:'flex', alignItems:'center', fontSize:'16px', fontWeight:'600', wordBreak:'break-word'}}
              main={headerBarMain}
            />
          </div>
          <div style={{overflowY:'auto', width:'100%'}}>
            {children}
          </div>
          <div className="modal-actions">
            {actionCancelLabel && (
              <button
                className="btn-cancel"
                onClick={actionCancelOnSubmit}
              >
                {actionCancelLabel}
              </button>
            )}
            {!hideSubmit && (
              <button
                className="btn-confirm"
                onClick={actionSaveOnSubmit}
                form={formId}
                disabled={isDisabled}
              >
                {actionSaveLabel}
              </button>
            )}
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
          width: 50%;
          ${popupStyles}
          }

        .modal-header {
          margin-bottom: 16px;
          width: 100%;
          margin: 10px auto 10px auto;
          ${headerBarMainStyle}
        }

        .modal-content {
          margin-bottom: 24px;
          width: 100%;
          margin: 10px auto 10px auto;
          ${popupModuleMianStyles}
        }

        .modal-actions {
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          gap: 16px;
          width: 100%;
          margin: 10px auto 10px auto;
          ${popupModuleActionBarStyles}
        }

        .btn-cancel {
          min-width: 80px;
          padding: 8px 24px;
          border: 1px solid #00796B;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          background-color: #fff;
          color: #00796B;
          cursor: pointer;
          word-break: break-word;
          ${style}
        }

        .btn-cancel:hover {
          background-color: #f8f8f8;
        }

        .btn-confirm {
          min-width: 80px;
          padding: 8px 24px;
          background-color: #00796B;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          word-break: break-word;
          ${style}
        }

        .btn-confirm:hover {
          background-color: #006156;
        }

        .btn-confirm:disabled {
          background-color: #D6D5D4;
          cursor: not-allowed;
        }
      `}</style>

      {error && <Toast label={error} onClose={() => setError(null)} error />}
    </Fragment>
  );
};

export default Modal;
