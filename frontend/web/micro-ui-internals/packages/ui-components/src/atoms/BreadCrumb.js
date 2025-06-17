import React, { useEffect, useState, Fragment } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import ConfirmationModal from "../molecules/ConfirmationModal";

const BreadCrumb = (props) => {
  const [expanded, setExpanded] = useState(false);
  const [crumbsToDisplay, setCrumbsToDisplay] = useState([...props?.crumbs]);
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (props?.maxItems && props?.crumbs.length > props?.maxItems && !expanded) {
      const startCrumbs = props.crumbs.slice(0, props?.itemsBeforeCollapse || Math.ceil(props.maxItems / 2));
      const endCrumbs = props.crumbs.slice(-1 * (props?.itemsAfterCollapse || Math.floor(props.maxItems / 2)));

      let updatedCrumbs = startCrumbs.concat([{ show: true, content: props?.expandText || "..." }], endCrumbs);
      setCrumbsToDisplay(updatedCrumbs);
    } else {
      setCrumbsToDisplay([...props.crumbs]);
    }
  }, [props.crumbs, props.maxItems, expanded, props.itemsBeforeCollapse, props.itemsAfterCollapse, props?.expandText]);

  function handleRedirect(path) {
    const host = window.location.origin;
    window.location.href = `${host}${path}`;
  }

  function isLast(index) {
    let validCrumbs = crumbsToDisplay?.filter((crumb) => crumb?.show === true);
    const allHaveSameInternalLink = validCrumbs.every((crumb) => crumb.internalLink === validCrumbs[0].internalLink);
    const allHaveSameExternalLink = validCrumbs.every((crumb) => crumb.externalLink === validCrumbs[0].externalLink);

    if (allHaveSameInternalLink || allHaveSameExternalLink) {
      return index === validCrumbs.length - 1;
    }

    return (
      validCrumbs?.findIndex((ob) => {
        const linkToCheck = ob?.externalLink || ob?.internalLink;
        const currentLink = crumbsToDisplay?.[index]?.externalLink || crumbsToDisplay?.[index]?.internalLink;
        return linkToCheck === currentLink;
      }) ===
      validCrumbs?.length - 1
    );
  }

  const handleCrumbClick = () => {
    setExpanded(!expanded);
  };

  const handleBackClick = () => {
    // Check if we're on the BPA form page
    if (location.pathname.includes("/publicservices/BPA/BPA_PCO/Apply")) {
      const formData = JSON.parse(localStorage.getItem("formData") || "{}");

      if (Object.keys(formData).length > 1) {
        setShowBackConfirmation(true);
        return;
      }
    }
    window.history.back();
    // setTimeout(() => {
    //   window.location.reload();
    // }, 1000);
  };

  const handleConfirmBack = () => {
    setShowBackConfirmation(false);
    window.history.back();
  };

  const handleCancelBack = () => {
    setShowBackConfirmation(false);
  };

  const validCrumbsMain = crumbsToDisplay?.filter((crumb) => crumb?.show === true);

  return (
    <>
      <ol className={`digit-bread-crumb ${props?.className ? props?.className : ""}`} style={props?.style}>
        {validCrumbsMain?.length > 1 && (
          <div className="digit-bread-crumb-back-icon" onClick={handleBackClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_41_3825)">
                <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill="#0B0C0C" />
              </g>
              <defs>
                <clipPath id="clip0_41_3825">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        )}

        {validCrumbsMain?.map((crumb, ci) => {
          if (!crumb?.show) return null;
          if (crumb?.isBack)
            return (
              <li key={ci} style={props?.itemStyle} className="digit-bread-crumb--item back-crumb-item">
                <span onClick={handleBackClick}>{crumb.content}</span>
              </li>
            );

          return (
            <Fragment key={ci}>
              <li style={props?.itemStyle} className="digit-bread-crumb--item">
                {isLast(ci) || (!crumb?.internalLink && !crumb?.externalLink) ? (
                  <span
                    className={`digit-bread-crumb-content ${isLast(ci) ? "current" : "default"}`}
                    style={props?.spanStyle}
                    onClick={crumb.content === "..." || crumb.content === props?.expandText ? handleCrumbClick : null}
                  >
                    {crumb?.icon && crumb.icon}
                    {crumb.content}
                  </span>
                ) : crumb?.externalLink ? (
                  <Link className="digit-bread-crumb-content" onClick={() => handleRedirect(crumb?.externalLink)}>
                    {crumb?.icon && crumb.icon}
                    {crumb.content}
                  </Link>
                ) : (
                  <Link onClick={() => handleRedirect(crumb?.internalLink)} className="digit-bread-crumb-content">
                    {crumb?.icon && crumb.icon}
                    {crumb.content}
                  </Link>
                )}
                {!isLast(ci) && <div className="digit-bread-crumb-seperator">{props?.customSeparator ? props?.customSeparator : "/"}</div>}
              </li>
            </Fragment>
          );
        })}
      </ol>

      <ConfirmationModal
        isOpen={showBackConfirmation}
        onClose={handleCancelBack}
        onConfirm={handleConfirmBack}
        title="CONFIRM_BACK_TITLE"
        message="CONFIRM_BACK_MESSAGE"
        confirmText="CONFIRM_BACK_YES"
        cancelText="CONFIRM_BACK_NO"
      />
    </>
  );
};

BreadCrumb.propTypes = {
  crumbs: PropTypes.array,
  className: PropTypes.string,
  style: PropTypes.object,
  spanStyle: PropTypes.object,
  customSeparator: PropTypes.element,
  maxItems: PropTypes.number,
  itemsAfterCollapse: PropTypes.number,
  itemsBeforeCollapse: PropTypes.number,
  expandText: PropTypes.string,
};

export default BreadCrumb;
