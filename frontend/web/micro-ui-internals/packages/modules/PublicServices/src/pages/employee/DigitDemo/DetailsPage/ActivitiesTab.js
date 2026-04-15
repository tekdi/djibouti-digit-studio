import React from "react";
import { useTranslation } from "react-i18next";

var COMMISSIONER_NAMES = {
  SDECC: "SDECC", DGDCF: "DGDCF", ONEAD: "ONEAD", INSPD: "INSPD",
  EDD: "EDD", DNPC: "DNPC", DCT: "DCT",
};

var getCommissionerName = function (bs) {
  if (!bs) return null;
  var last = bs.split("_").pop();
  return COMMISSIONER_NAMES[last] || null;
};

// Workflow actions that represent a commissioner's verdict on an application.
// When an entry uses one of these actions AND is scoped to a commissioner's
// businessService (e.g. BPA_PCO_SIMPLE_SDECC), we show the verdict label
// ("Avis Favorable par SDECC") instead of the generic "Demande envoyée au SDECC".
var VERDICT_ACTIONS_FAVORABLE = ["CONFORM_APPLICATION", "APPROVE", "APPROVE_APPLICATION"];
var VERDICT_ACTIONS_DEFAVORABLE = ["NON_CONFORM", "REJECT_APPLICATION", "REJECT"];
var getVerdictForAction = function (action) {
  if (VERDICT_ACTIONS_FAVORABLE.indexOf(action) !== -1) return "Avis Favorable";
  if (VERDICT_ACTIONS_DEFAVORABLE.indexOf(action) !== -1) return "Avis D\u00e9favorable";
  return null;
};

var ActivitiesTab = function (props) {
  var timeline = props.timeline, response = props.response, isCitizen = props.isCitizen;
  var t = useTranslation().t;

  var formatDate = function (inst) {
    var epoch = inst?.auditDetails?.lastModifiedEpoch || inst?.auditDetails?.createdTime;
    if (!epoch) return inst?.auditDetails?.created || "";
    return new Date(epoch).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
      " \u00e0 " + new Date(epoch).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  var getDisplayAction = function (inst) {
    if (inst?.performedAction === "EDIT" && inst?.status === "AGENT_NOT_ASSIGNED") return "Demande soumise";
    return t("WF_" + (response?.module || "").toUpperCase() + "_" + (response?.businessService || "").toUpperCase() + "_" + inst?.performedAction);
  };

  // Deduplicate and group parallel entries
  var dedupeAndGroup = function (entries) {
    if (!entries || entries.length === 0) return [];
    var reversed = entries.slice().reverse();

    // Step 1: deduplicate by (epoch + action + businessService)
    var seen = {};
    var deduped = [];
    for (var i = 0; i < reversed.length; i++) {
      var e = reversed[i];
      var epoch = e?.auditDetails?.lastModifiedEpoch || e?.auditDetails?.createdTime || 0;
      var key = epoch + "_" + (e?.performedAction || "") + "_" + (e?.businessService || "");
      if (!seen[key]) {
        seen[key] = true;
        deduped.push(e);
      }
    }

    // Step 2: group parallel commissioner entries (same epoch within 5s, CREATE or SEND_TO_COMMISSIONER action)
    var result = [];
    var i = 0;
    while (i < deduped.length) {
      var current = deduped[i];
      var curEpoch = current?.auditDetails?.lastModifiedEpoch || current?.auditDetails?.createdTime || 0;
      var curAction = current?.performedAction || "";

      // Collect all entries at the same timestamp (within 5s) that are commissioner-related
      var j = i + 1;
      var sameTimeEntries = [current];
      while (j < deduped.length) {
        var next = deduped[j];
        var nextEpoch = next?.auditDetails?.lastModifiedEpoch || next?.auditDetails?.createdTime || 0;
        if (Math.abs(curEpoch - nextEpoch) < 5000) {
          sameTimeEntries.push(next);
          j++;
        } else {
          break;
        }
      }

      // Only group entries when they represent a "send to commissioners" fan-out:
      //   - multiple entries at the same timestamp
      //   - OR a single SEND_TO_COMMISSIONER action.
      // Commissioner verdict actions (CONFORM_APPLICATION / NON_CONFORM / ...) are
      // rendered as individual entries so we can show "Avis Favorable par SDECC"
      // instead of the misleading "Demande envoyée au SDECC".
      var names = [];
      var hasSendFanout = false;
      for (var k = 0; k < sameTimeEntries.length; k++) {
        var e2 = sameTimeEntries[k];
        var cn = getCommissionerName(e2?.businessService);
        if (cn && names.indexOf(cn) === -1) names.push(cn);
        var a2 = e2?.performedAction || "";
        if (a2 === "SEND_TO_COMMISSIONER") hasSendFanout = true;
      }
      var isMultiCommissionerFanout = names.length > 1; // truly parallel fan-out
      if ((hasSendFanout || isMultiCommissionerFanout) && names.length > 0) {
        // Group everything at this timestamp into one "sent to commissioners" entry
        result.push({ type: "parallel", representative: current, commissionerNames: names });
        i = j;
      } else {
        result.push({ type: "single", instance: current });
        i++;
      }
    }

    return result;
  };

  var grouped = Array.isArray(timeline) ? dedupeAndGroup(timeline) : [];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-black text-gray-900 mb-4">Historique des activit\u00e9s</h3>
      <div className="relative">
        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200 z-0"></div>
        {grouped.map(function (entry, index) {
          var isLast = index === grouped.length - 1;
          var inst = entry.type === "parallel" ? entry.representative : entry.instance;

          var label;
          if (entry.type === "parallel") {
            label = "Demande envoy\u00e9e au " + entry.commissionerNames.join(", ");
          } else {
            // Commissioner verdict action (CONFORM_APPLICATION, NON_CONFORM, ...)
            // scoped to a commissioner's businessService — show the verdict.
            var action = inst?.performedAction || inst?.action;
            var verdictLabel = getVerdictForAction(action);
            var cn = getCommissionerName(inst?.businessService);
            if (verdictLabel && cn) {
              label = verdictLabel + " par " + cn;
            } else {
              label = getDisplayAction(inst);
            }
          }

          return (
            <div key={index} className="flex items-start mb-6">
              <div className={"flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium mr-4 relative z-10 " +
                (isLast ? "border-djibouti-primary bg-djibouti-primary text-white" : "border-gray-300 bg-white text-gray-500")}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={"text-sm font-medium " + (isLast ? "text-djibouti-primary" : "text-gray-900")}>
                    {label}
                  </h4>
                  <span className="text-xs text-gray-500">{formatDate(inst)}</span>
                </div>
                {!isCitizen && inst?.assigner?.name && (
                  <p className="text-xs text-gray-500">Par : {inst.assigner.name}</p>
                )}
                {inst?.comment && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-1">{t("COMMENT")}</p>
                    <p className="text-xs text-gray-600">"{inst.comment}"</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivitiesTab;
