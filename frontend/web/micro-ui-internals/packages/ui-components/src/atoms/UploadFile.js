import React, { useEffect, useRef, useState, Fragment } from "react";
import PropTypes from "prop-types";
import ButtonSelector from "./ButtonSelector";
import { useTranslation } from "react-i18next";
import Chip from "./Chip";
import ErrorMessage from "./ErrorMessage";
import { getUserType } from "../utils/digitUtils";
import TextInput from "./TextInput";

const getRandomId = () => {
  return Math.floor((Math.random() || 1) * 139);
};

const UploadFile = (props) => {
  const { t } = useTranslation();
  const inpRef = useRef();
  const [hasFile, setHasFile] = useState(false);
  const [prevSate, setprevSate] = useState(null);
  const user_type = getUserType();

  // Extract file types from accept prop for tooltip
  const getTooltipContent = () => {
    // If allowedFileTypes is provided, use it
    if (props.allowedFileTypes && props.allowedFileTypes.length > 0) {
      const formattedTypes = props.allowedFileTypes.map(type => {
        // Clean up and format each file type
        const cleanType = type.trim().toUpperCase();

        // Handle special cases
        if (cleanType === 'PDF' || cleanType === 'PNG' || cleanType === 'JPEG' || cleanType === 'JPG') {
          return cleanType;
        }
        if (cleanType.includes('MSWORD')) return 'DOC';
        if (cleanType.includes('OPENXMLFORMATS-OFFICEDOCUMENT')) {
          if (cleanType.includes('WORDPROCESSINGML')) return 'DOCX';
          if (cleanType.includes('SPREADSHEETML')) return 'XLSX';
          if (cleanType.includes('PRESENTATIONML')) return 'PPTX';
          return 'OFFICE';
        }

        if (cleanType.includes('WORDPROCESSINGML') || cleanType.includes('DOCX')) return 'DOCX';
        if (cleanType.includes('SPREADSHEETML') || cleanType.includes('XLSX')) return 'XLSX';
        if (cleanType.includes('MSWORD')) return 'DOC';

        return cleanType;
      });

      const uniqueTypes = [...new Set(formattedTypes.filter(Boolean))];

      if (uniqueTypes.length > 0) {
        return uniqueTypes.join(', ');
      }
    }

    // Fallback to parsing the accept prop
    if (!props.accept) return "PDF, PNG, JPEG, JPG";

    const acceptTypes = props.accept.split(',').map(type => {
      // Clean up the type string
      const cleanType = type.trim();

      // Handle MIME types
      if (cleanType.includes('/')) {
        if (cleanType === 'image/*') return 'IMAGE FILES';

        const parts = cleanType.split('/');
        const subtype = parts[1].toUpperCase();

        // Handle specific MIME types
        if (subtype.includes('PDF')) return 'PDF';
        if (subtype.includes('PNG')) return 'PNG';
        if (subtype.includes('JPEG') || subtype.includes('JPG')) return 'JPEG';
        if (subtype.includes('MSWORD')) return 'DOC';
        if (subtype.includes('OPENXMLFORMATS')) {
          if (subtype.includes('WORDPROCESSINGML')) return 'DOCX';
          if (subtype.includes('SPREADSHEETML')) return 'XLSX';
        }

        return subtype;
      }

      // Handle file extensions
      if (cleanType.startsWith('.')) {
        return cleanType.substring(1).toUpperCase();
      }

      return cleanType.toUpperCase();
    });

    // Filter out duplicates and empty entries
    const uniqueTypes = [...new Set(acceptTypes.filter(type => type && type !== '*'))];

    return uniqueTypes.length > 0 ? uniqueTypes.join(', ') : "PDF, PNG, JPEG, JPG";
  };

  // Helper function to get icon for file type
  const getFileTypeIcon = (type) => {
    const fileType = type.toLowerCase();

    if (fileType === 'pdf') {
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H8C6.9 2 6 2.9 6 4V16C6 17.1 6.9 18 8 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H8V4H20V16ZM4 6H2V20C2 21.1 2.9 22 4 22H18V20H4V6ZM16 12V9C16 8.45 15.55 8 15 8H13V13H15C15.55 13 16 12.55 16 12ZM14 9H15V12H14V9ZM18 11H19V10H18V9H19V8H17V13H18V11ZM10 11H11C11.55 11 12 10.55 12 10V9C12 8.45 11.55 8 11 8H9V13H10V11ZM10 9H11V10H10V9Z" fill="#D14343"/>
        </svg>
      );
    }

    if (fileType === 'png' || fileType === 'jpeg' || fileType === 'jpg' || fileType.includes('image')) {
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14.14 11.86L11.14 15.73L9 13.14L6 17H18L14.14 11.86Z" fill="#0B7D74"/>
        </svg>
      );
    }

    if (fileType === 'doc' || fileType === 'docx' || fileType.includes('word')) {
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="#2D63EB"/>
        </svg>
      );
    }

    if (fileType === 'xls' || fileType === 'xlsx' || fileType.includes('excel')) {
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="#0B7D74"/>
        </svg>
      );
    }

    // CAD file icons
    if (fileType === 'dwg' || fileType === 'dxf' || fileType === 'skp' || fileType === 'pla' || fileType === 'pln' || fileType === 'rvt' || fileType === 'rfa') {
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V7H9V17ZM13 17H11V7H13V17ZM17 17H15V7H17V17Z" fill="#FF6B00"/>
        </svg>
      );
    }

    // Archive file icons
    if (fileType === 'zip' || fileType === 'rar' || fileType === '7z') {
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6H12L10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6ZM20 18H4V8H20V18ZM16 12H8V10H16V12ZM16 16H8V14H16V16Z" fill="#6B7280"/>
        </svg>
      );
    }

    // Default icon for other file types
    return (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 2C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2H6ZM13 9V3.5L18.5 9H13Z" fill="#505A5F"/>
      </svg>
    );
  };

  const handleChange = () => {
    if (inpRef.current.files[0]) {
      setHasFile(true);
      setprevSate(inpRef.current.files[0]);
    } else setHasFile(false);
  };

  const handleDelete = () => {
    inpRef.current.value = "";
    props.onDelete();
  };

  const handleEmpty = () => {
    if (inpRef.current.files.length <= 0 && prevSate !== null) {
      inpRef.current.value = "";
      props.onDelete();
    }
  };

  if (props.uploadMessage && inpRef.current.value) {
    handleDelete();
    setHasFile(false);
  }

  useEffect(() => handleEmpty(), [inpRef?.current?.files]);

  useEffect(() => handleChange(), [props.message]);

  const showHint = props?.showHint || false;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {/* {showHint && <p className="digit-cell-text">{t(props?.hintText)}</p>} */}
      <div style={{ display: "flex", gap: "12px" }}>
        <div style={{ height: "100%", width: "100%", maxWidth: "450px" }}>
          <TextInput type="text" value={`${props?.uploadedFiles?.length} ${t("CS_COMMON_FILES_UPLOADED")}`} name="file" disabled={true} />
        </div>
        <div
          className={`digit-upload-file ${props?.customClass ? props?.customClass : ""} ${
            user_type === "employee" ? "" : "digit-upload-file-max-width"
          } ${props.disabled ? " disabled" : ""}`}
          style={props?.style}
        >
          <div className="upload-button">{t("CS_COMMON_UPLOAD_FILE")}</div>
          <input
            className={props.disabled ? "disabled" : "" + "digit-input-mirror-selector-button"}
            ref={inpRef}
            type="file"
            id={props.id || `document-${getRandomId()}`}
            name="file"
            multiple={props.multiple}
            accept={props.accept}
            disabled={props.disabled}
            onChange={(e) => props.onUpload(e)}
            onClick={(event) => {
              if (!props?.enableButton) {
                event.preventDefault();
              } else {
                const { target = {} } = event || {};
                target.value = "";
              }
            }}
            required={props.required}
          />
        </div>
      </div>
      <div className="digit-upload-file-button-wrap">
        <div className="digit-tag-container-wrapper">
          {props?.uploadedFiles?.map((file, index) => {
            const fileDetailsData = file[1];
            return (
              <div className="digit-tag-container">
                <Chip
                  key={index}
                  hideClose={false}
                  text={file[0]}
                  onClick={(e) => props?.removeTargetedFile(fileDetailsData, e)}
                  t={t}
                  index={index+1}
                />
              </div>
            );
          })}
        </div>
        {/* {props?.uploadedFiles.length === 0 && <h2 className="digit-file-upload-status">{props.message}</h2>} */}
      </div>
      {props.iserror && <ErrorMessage message={props.iserror} />}
      {props?.showHintBelow && <p className="digit-cell-text">{t(props?.hintText)}</p>}
    </div>
  );
};
UploadFile.propTypes = {
  hintText: PropTypes.string,
  customClass: PropTypes.string,
  uploadedFiles: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object]))),
  enableButton: PropTypes.bool,
  required: PropTypes.bool,
  showHint: PropTypes.bool,
  buttonType: PropTypes.string,
  onUpload: PropTypes.func.isRequired,
  removeTargetedFile: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  iserror: PropTypes.string,
  showHintBelow: PropTypes.bool,
  message: PropTypes.string,
  disabled: PropTypes.bool,
  inputStyles: PropTypes.object,
  multiple: PropTypes.bool,
  accept: PropTypes.string,
  allowedFileTypes: PropTypes.array,
  id: PropTypes.string,
};

export default UploadFile;
