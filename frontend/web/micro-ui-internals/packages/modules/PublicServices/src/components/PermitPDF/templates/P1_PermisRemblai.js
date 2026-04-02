import React from "react";

var formatDate = function (ts) {
  if (!ts) return "……/……/………";
  return new Date(ts).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

var P1_PermisRemblai = React.forwardRef(function (props, ref) {
  var response = props.response;
  var createdDate = response?.auditDetails?.createdTime;

  // Applicant
  var rootApplicant = response?.applicants?.[0];
  var nestedApplicant = response?.serviceDetails?.responseData?.Application?.applicants?.[0];
  var applicant = (rootApplicant?.name) ? rootApplicant : (nestedApplicant || rootApplicant);
  var name = applicant?.name || "…………………………";

  // Terrain
  var terrain = response?.serviceDetails?.terrainDetails?.[0] || {};
  var location = terrain.terrainLocation || "…………………………";
  var surface = terrain.terrainSurface || "………";
  var titleNum = terrain.landTitleNumber || "………";

  // Agent checklist data
  var agent = response?.additionalDetails?.agentChecklist || {};
  var cotes = (agent.cotesTable && agent.cotesTable.length > 0) ? agent.cotesTable : [];
  var tech = agent.technicalInfo || {};

  return (
    <div ref={ref} style={pageStyle}>
      <div style={outerBorder}>
        <div style={innerBorder}>

          {/* ═══════ YELLOW BANNER ═══════ */}
          <div style={bannerStyle}>
            <div style={{ fontWeight: "bold", fontSize: "7.5px" }}>SOUS COUVERT DE MONSIEUR LE MINISTRE</div>
            <div style={{ fontSize: "7px" }}>DE L'URBANISME ET DE L'HABITAT</div>
          </div>

          {/* ═══════ HEADER: Ministry | Emblem | Republic ═══════ */}
          <table style={{ width: "100%", borderCollapse: "collapse", margin: "8px 0" }}>
            <tbody>
              <tr>
                {/* Left - Ministry */}
                <td style={{ width: "38%", verticalAlign: "top", padding: 0, lineHeight: "1.35" }}>
                  <div style={{ fontWeight: "bold", fontSize: "8.5px", textDecoration: "underline" }}>MINISTERE DE L'URBANISME</div>
                  <div style={{ fontWeight: "bold", fontSize: "8.5px", textDecoration: "underline" }}>DE L'URBANISME ET DE L'HABITAT</div>
                  <div style={{ fontSize: "7.5px", marginTop: "5px" }}>Direction de l'Aménagement</div>
                  <div style={{ fontSize: "7.5px" }}>du Territoire et de l'Urbanisme</div>
                  <div style={{ fontSize: "7.5px", marginTop: "5px", fontStyle: "italic" }}>Brigade Topographe</div>
                </td>
                {/* Center - Emblem */}
                <td style={{ width: "24%", textAlign: "center", verticalAlign: "middle", padding: 0 }}>
                  <div style={{ width: "60px", height: "60px", margin: "0 auto", border: "1px solid #bbb", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", color: "#333" }}>
                    &#9733;
                  </div>
                </td>
                {/* Right - Republic */}
                <td style={{ width: "38%", textAlign: "right", verticalAlign: "top", padding: 0, lineHeight: "1.35" }}>
                  <div style={{ fontWeight: "bold", fontSize: "10px" }}>République de Djibouti</div>
                  <div style={{ fontStyle: "italic", fontSize: "8.5px", marginTop: "2px" }}>Unité Égalité Paix</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ═══════ REF & DATE ═══════ */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5px", margin: "6px 0 2px 0" }}>
            <div>
              <strong>Réf N° : </strong>
              <span style={dottedUnderline}>{response?.applicationNumber || "……/……"}</span>
            </div>
            <div><strong>DATUS</strong></div>
          </div>
          <div style={{ fontSize: "9.5px", marginBottom: "12px" }}>
            <strong>DATE : </strong>
            <span style={dottedUnderline}>{formatDate(createdDate)}</span>
          </div>

          {/* ═══════ TITLE BAR ═══════ */}
          <div style={titleBar}>
            <strong>PERMIS DE REMBLAI {formatDate(createdDate)}</strong>
          </div>

          {/* ═══════ BODY PARAGRAPHS ═══════ */}
          <div style={bodyStyle}>
            <p style={paraIndent}>
              Vu à nos bureaux de <b>Djibouti</b>, en date du <b>DATUS</b>, la Direction de l'Aménagement
              du Territoire et de l'Urbanisme, rattachée au Ministère de l'Urbanisme et de l'Habitat,
            </p>
            <p style={paraIndent}>
              Vu la demande formulée par <b>Mr/Mme {name}</b> en vue de remblayer un terrain de{" "}
              <b>{surface} m²</b> situé à <b>{location}</b>,
              inscrit au titre foncier N° <b>{titleNum}</b>.
            </p>
            <p style={paraIndent}>
              Vu le rapport d'inspection et de vérification de la côte de remblai sur le site par la brigade topographe de la DATUS,
            </p>
            <p style={paraIndent}>
              <b>Autorise Mr/Mme {name}</b> à procéder à un remblai d'un terrain d'une superficie de{" "}
              <b>{surface} m²</b> au lieu-dit <b>{location}</b>,
              à condition de respecter les côtes indiquées dans le tableau ci-dessous et de se conformer aux prescriptions techniques
              de la Direction.
            </p>
          </div>

          {/* ═══════ CÔTES TABLE ═══════ */}
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thGold}>N°</th>
                <th style={thGold}>CÔTES RELEVÉES</th>
                <th style={thGold}>CÔTES DU PROJET</th>
                <th style={thGold}>OBSERVATION</th>
              </tr>
            </thead>
            <tbody>
              {cotes.length > 0 ? cotes.map(function (row, i) {
                return (
                  <tr key={i}>
                    <td style={tdCell}>{i + 1}</td>
                    <td style={tdCell}>{row.cotesRelevees || ""}</td>
                    <td style={tdCell}>{row.cotesDuProjet || ""}</td>
                    <td style={tdCell}>{row.observation || ""}</td>
                  </tr>
                );
              }) : [1, 2, 3, 4].map(function (n) {
                return (
                  <tr key={n}>
                    <td style={tdCell}>{n}</td>
                    <td style={tdCell}></td>
                    <td style={tdCell}></td>
                    <td style={tdCell}></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* ═══════ INFORMATIONS TECHNIQUES ═══════ */}
          <div style={{ margin: "14px 0", borderLeft: "3px solid #2980b9", paddingLeft: "12px" }}>
            <div style={{ fontWeight: "bold", fontSize: "11px", marginBottom: "8px" }}>
              Informations techniques complémentaires
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
              <tbody>
                <tr>
                  <td style={techLabel}>Voie de référence</td>
                  <td style={techValue}>{tech.voieReference || "N/A"}</td>
                  <td style={techLabel}>Côte de la voie / niveau mer</td>
                  <td style={techValue}>{tech.coteVoieNiveauMer || "N/A"}</td>
                </tr>
                <tr>
                  <td style={techLabel}>Volume de remblai nécessaire (m³)</td>
                  <td style={techValue}>{tech.volumeRemblai || "N/A"}</td>
                  <td style={techLabel}>Hauteur maximale</td>
                  <td style={techValue}>{tech.hauteurMaximale || "N/A"}</td>
                </tr>
                <tr>
                  <td style={techLabel}>Nombre de couches</td>
                  <td style={techValue}>{tech.nombreCouches || "N/A"}</td>
                  <td style={techLabel}></td>
                  <td style={techValue}></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ═══════ NB BOX ═══════ */}
          <div style={nbBox}>
            <div style={{ fontWeight: "bold", marginBottom: "3px" }}>NB :</div>
            <div>- Le présent permis est valable pour une durée d'un (1) an à compter de sa date de délivrance.</div>
            <div>- Le bénéficiaire devra respecter les normes et côtes prescrites sous peine de sanctions.</div>
            <div>- Toute modification du projet devra faire l'objet d'une nouvelle demande.</div>
          </div>

          {/* ═══════ SIGNATURES ═══════ */}
          <table style={{ width: "100%", marginTop: "25px", fontSize: "9.5px" }}>
            <tbody>
              <tr>
                <td style={{ width: "45%", textAlign: "center", verticalAlign: "top", padding: 0 }}>
                  <div style={{ fontStyle: "italic" }}>Brigade Topographe</div>
                  <div style={{ marginTop: "55px" }}>____________________</div>
                </td>
                <td style={{ width: "10%" }}></td>
                <td style={{ width: "45%", textAlign: "center", verticalAlign: "top", padding: 0 }}>
                  <div style={{ fontWeight: "bold" }}>Le Directeur de l'Aménagement du Territoire</div>
                  <div style={{ fontWeight: "bold" }}>et de l'Urbanisme</div>
                  <div style={{ marginTop: "55px" }}>____________________</div>
                </td>
              </tr>
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
});

// ─── Page ───
var pageStyle = {
  width: "794px", minHeight: "1123px", padding: "8px",
  fontFamily: "'Times New Roman', Times, serif",
  fontSize: "11px", lineHeight: "1.45", color: "#000", backgroundColor: "#fff",
  margin: "0 auto", boxSizing: "border-box",
};

// ─── Borders ───
var outerBorder = { border: "3px double #000", padding: "3px", minHeight: "1107px" };
var innerBorder = { border: "1px solid #000", padding: "18px 28px 15px 28px", minHeight: "1095px" };

// ─── Banner ───
var bannerStyle = {
  backgroundColor: "#EAC87D", border: "1px solid #C4A44A",
  padding: "3px 8px", textAlign: "center",
  fontSize: "7.5px", lineHeight: "1.3", marginBottom: "6px",
};

// ─── Dotted underline for blanks ───
var dottedUnderline = {
  borderBottom: "1px dotted #000", display: "inline-block",
  minWidth: "140px", paddingBottom: "1px",
};

// ─── Title ───
var titleBar = {
  textAlign: "center", fontSize: "14px", letterSpacing: "1px",
  borderTop: "2px solid #000", borderBottom: "2px solid #000",
  padding: "5px 0", margin: "0 0 12px 0",
};

// ─── Body ───
var bodyStyle = { fontSize: "10.5px", lineHeight: "1.65", textAlign: "justify", marginBottom: "10px" };
var paraIndent = { textIndent: "35px", marginBottom: "6px" };

// ─── Côtes Table ───
var tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: "9.5px", marginBottom: "2px" };
var thGold = {
  border: "1.5px solid #000", padding: "5px 6px",
  backgroundColor: "#EAC87D", fontWeight: "bold",
  textAlign: "center", fontSize: "8.5px", textTransform: "uppercase",
};
var tdCell = {
  border: "1px solid #000", padding: "4px 6px",
  textAlign: "center", fontSize: "9.5px", minHeight: "20px",
};

// ─── Technical Info ───
var techLabel = {
  padding: "4px 6px", fontSize: "8.5px", color: "#555",
  borderBottom: "1px solid #eee", width: "25%", verticalAlign: "top",
};
var techValue = {
  padding: "4px 6px", fontSize: "10.5px", fontWeight: "bold",
  borderBottom: "1px solid #eee", width: "25%", verticalAlign: "top",
};

// ─── NB Box ───
var nbBox = {
  border: "1.5px solid #000", padding: "8px 12px",
  fontSize: "9.5px", lineHeight: "1.55", marginBottom: "5px",
};

P1_PermisRemblai.displayName = "P1_PermisRemblai";
export default P1_PermisRemblai;
