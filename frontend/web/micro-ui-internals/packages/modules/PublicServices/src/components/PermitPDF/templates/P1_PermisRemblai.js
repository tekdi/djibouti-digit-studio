import React from "react";

const DATUH_LOGO_URL = "https://res.cloudinary.com/djykaulgo/image/upload/v1777182370/datuh-logo_y8vx0s.png";

const formatDate = (ts) => {
  if (!ts) return "……/……/………";
  return new Date(ts).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatYear = (ts) => {
  if (!ts) return "…";
  return String(new Date(ts).getFullYear());
};

const padSequence = (n) => String(n || "").replace(/^.*?(\d+).*$/, "$1").padStart(2, "0");

const P1_PermisRemblai = React.forwardRef((props, ref) => {
  const { response } = props;
  const createdDate = response?.auditDetails?.createdTime;

  // Applicant
  const rootApplicant = response?.applicants?.[0];
  const nestedApplicant = response?.serviceDetails?.responseData?.Application?.applicants?.[0];
  const applicant = rootApplicant?.name ? rootApplicant : (nestedApplicant || rootApplicant) || {};
  const civility = applicant.civility || applicant.gender || "Monsieur";
  const civilityLabel = String(civility).toLowerCase().startsWith("mada") ? "Madame" : "Monsieur";
  const applicantName = applicant.name || "…………………………";

  // Terrain
  const terrain = response?.serviceDetails?.terrainDetails?.[0] || {};
  const location = terrain.terrainLocation || "…………………………";
  const lotNumber = terrain.lotNumber || terrain.plotNumber || "…";
  const surface = terrain.terrainSurface || "………";
  const titleNum = terrain.landTitleNumber || "………";

  // Agent checklist data (filled by Brigade Topographe)
  const agent = response?.additionalDetails?.agentChecklist || {};
  const cotes = (agent.cotesTable && agent.cotesTable.length > 0) ? agent.cotesTable : [];
  const tech = agent.technicalInfo || {};
  const voieReference = tech.voieReference || "Voie d'emprise";
  const coteVoie = tech.coteVoieNiveauMer || "…";
  const volumeRemblai = tech.volumeRemblai || "……";
  const hauteurMoyenne = tech.hauteurMaximale || "……";
  const nombreCouches = tech.nombreCouches || "…";

  // Permit number — prefer the agent-filled fiche number, otherwise build
  // one from the application sequence number.
  const ficheNumber = response?.additionalDetails?.instructionSheet?.pcoNumber
    || response?.additionalDetails?.atarrInstructionSheet?.pcoNumber
    || response?.additionalDetails?.pcsInstructionSheet?.pcoNumber;
  const appNo = response?.applicationNumber || "";
  const seqMatch = appNo.match(/(\d+)/);
  const seq = seqMatch ? padSequence(seqMatch[1]) : "…";
  const year = formatYear(createdDate);
  const permitNumber = ficheNumber || `${seq}/${year}`;

  // Reference number for top-left (DATUH/SDATU/BT/AYY/HHR style).
  const refNumber = `DATUH/SDATU/BT/${year}`;

  return (
    <div ref={ref} style={pageStyle}>
      <div style={outerBorder}>
        <div style={innerBorder}>

          {/* Top line: reference number + République de Djibouti */}
          <table style={headerTopTable}>
            <tbody>
              <tr>
                <td style={headerTopLeft}>
                  <span>N°........</span>
                  <span style={highlight}>{refNumber} du {formatDate(createdDate)}</span>
                </td>
                <td style={headerTopRight}>
                  <div style={{ fontWeight: "bold" }}>République de Djibouti</div>
                  <div>Unité-Égalité-paix</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Header: Ministry block (left) | DATUH logo (right) */}
          <table style={headerTable}>
            <tbody>
              <tr>
                <td style={headerMinistryCell}>
                  <div style={ministryTitle}>Ministère de la Ville,</div>
                  <div style={ministryTitle}>De l'Urbanisme et de l'Habitat</div>
                  <div style={asterisks}>**********************</div>
                  <div style={ministryTitle}>Direction de l'Aménagement du Territoire</div>
                  <div style={ministryTitle}>de l'Urbanisme et de l'Habitat</div>
                  <div style={asterisks}>**********************</div>
                  <div style={ministryTitle}>Sous-direction de l'Aménagement</div>
                  <div style={ministryTitle}>du Territoire et de l'Urbanisme</div>
                  <div style={asterisks}>**********************</div>
                  <div style={ministryTitle}>Brigade Topographie</div>
                </td>
                <td style={headerLogoCell}>
                  <img
                    src={DATUH_LOGO_URL}
                    alt="DATUH"
                    crossOrigin="anonymous"
                    style={{ width: "120px", height: "auto", display: "block", margin: "0 auto" }}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Issuance line */}
          <div style={{ fontStyle: "italic", margin: "10px 0 8px 0", fontSize: "10px" }}>
            DATUH, le ……………..
          </div>

          {/* Title bar */}
          <div style={titleBar}>
            <span>PERMIS DE REMBLAI N°</span>
            <span style={highlight}>{permitNumber}</span>
          </div>

          {/* Body intro */}
          <div style={bodyParagraph}>
            Suite à une demande de <span style={highlight}>{civilityLabel} {applicantName}</span>, en date du{" "}
            <span style={highlight}>{formatDate(createdDate)}</span>. La Direction de l'Aménagement du
            Territoire de l'Urbanisme et de l'Habitat lui délivre un Permis de Remblai pour sa parcelle{" "}
            <span style={highlight}>de {surface} m² sise à Djibouti-Lotissement {location} Lot n°{lotNumber}, Objet du Titre Foncier n°{titleNum}.</span>
          </div>
          <div style={{ ...bodyParagraph, marginBottom: "8px" }}>
            Les côtes de remblai à respecter sont fixées comme suit :
          </div>

          {/* Côtes table — 4 columns, with Voie de référence merged across rows */}
          <table style={cotesTable}>
            <thead>
              <tr>
                <th style={thBlack}>N°</th>
                <th style={thBlack}>côtes relevées</th>
                <th style={thBlack}>côtes du projet</th>
                <th style={thBlack}>Voie de référence</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3, 4].map((i) => {
                const row = cotes[i] || {};
                const labels = [
                  "Angle Nord-est",
                  "Angle Nord Ouest",
                  "Angle Sud-est",
                  "Angle Sud-ouest",
                  "Hauteur Moyenne",
                ];
                const releve = row.cotesRelevees ? `${labels[i]} : ${row.cotesRelevees}` : labels[i];
                const projet = row.cotesDuProjet || "";
                return (
                  <tr key={i}>
                    <td style={tdBlack}><span style={highlight}>{i + 1}</span></td>
                    <td style={tdBlackLeft}><span style={highlight}>{releve}</span></td>
                    <td style={tdBlackLeft}>{projet ? <span style={highlight}>{projet}</span> : ""}</td>
                    {i === 0 && (
                      <td style={voieCell} rowSpan={5}>
                        <div style={highlight}>{voieReference} {coteVoie}m</div>
                        <div style={highlight}>Située au Sud du terrain.</div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Technical highlights */}
          <div style={techBlock}>
            <div><span style={highlight}>Côte de la voie : {coteVoie}m</span> par rapport au niveau 0 de la mer</div>
            <div><span style={highlight}>Le volume de remblai nécessaire est estimé à {volumeRemblai}m³.</span></div>
          </div>

          {/* Body — discharge / extraction / tests */}
          <div style={bodyParagraph}>
            &nbsp;&nbsp;&nbsp;&nbsp;Les matériaux constituants d'éventuel décaissement du terrain naturel devront être déversés
            systématiquement à la décharge publique.
          </div>
          <div style={bodyParagraph}>
            Les matériaux constitutifs du remblai doivent obligatoirement provenir d'un site d'extraction prévu à cet effet.
          </div>
          <div style={bodyParagraph}>
            &nbsp;&nbsp;&nbsp;&nbsp;Avant la décharge des travaux, vous devez prendre contact avec le Laboratoire Central du Bâtiment et de
            l'Équipement pour qu'il puisse réaliser des essais après chaque couche de remblai.
          </div>
          <div style={bodyParagraph}>
            Les remblais seront arrosés et compactés par couche de 0.25 m d'épaisseur maximum.
          </div>
          <div style={bodyParagraph}>
            Dès l'achèvement des travaux, une demande doit être adressée à la Direction de l'Aménagement du Territoire, de
            l'Urbanisme et de l'Habitat pour la délivrance d'un Certificat de Conformité de Remblai qui sera remis après :
          </div>
          <ul style={bulletList}>
            <li>Contrôle des côtes de nivellement,</li>
            <li>Contrôle du taux de compactage de chaque couche effectué par le Laboratoire Central du Bâtiment et de l'Équipement,</li>
            <li>Remise à mes services d'une copie de l'autorisation d'extraction des matériaux de remblai délivré par la Mairie de Djibouti ainsi que le récépissé de versement des droits d'extraction.</li>
          </ul>

          {/* Signature block */}
          <div style={signatureBlock}>
            <div style={highlight}>Le Directeur de l'Aménagement du Territoire</div>
            <div style={highlight}>De l'Urbanisme et de l'Habitat</div>
            <div style={{ marginTop: "55px", ...highlight, fontWeight: "bold" }}>HABIB IBRAHIM MOHAMED</div>
          </div>

          {/* Footer */}
          <table style={footerTable}>
            <tbody>
              <tr>
                <td style={footerLeft}>
                  <div style={{ fontWeight: "bold" }}>Ampliations :</div>
                  <div>- DATUH</div>
                  <div>- SDATU</div>
                  <div>- Brigade Topographie</div>
                </td>
                <td style={footerRight}>
                  <div style={pageNumberBox}>1/1</div>
                </td>
              </tr>
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
});

P1_PermisRemblai.displayName = "P1_PermisRemblai";
export default P1_PermisRemblai;

// ─── Page ───
const pageStyle = {
  width: "794px",
  minHeight: "1123px",
  fontFamily: "'Times New Roman', Times, serif",
  fontSize: "11px",
  lineHeight: "1.4",
  color: "#000",
  backgroundColor: "#fff",
  margin: "0 auto",
  boxSizing: "border-box",
  padding: "0",
};

const outerBorder = { border: "1.5px solid #000", padding: "0", minHeight: "1123px" };
const innerBorder = { padding: "20px 28px", minHeight: "1110px" };

// ─── Highlight (was yellow in reference image to mark dynamic fields;
// rendered without a background in the actual permit) ───
const highlight = {};

// ─── Top line ───
const headerTopTable = { width: "100%", borderCollapse: "collapse", marginBottom: "4px", fontSize: "10.5px" };
const headerTopLeft = { width: "60%", textAlign: "left", padding: 0, verticalAlign: "top" };
const headerTopRight = { width: "40%", textAlign: "right", padding: 0, verticalAlign: "top", fontStyle: "italic" };

// ─── Header (ministry + logo) ───
const headerTable = { width: "100%", borderCollapse: "collapse", marginBottom: "4px" };
const headerMinistryCell = { width: "65%", verticalAlign: "top", padding: 0, lineHeight: "1.45" };
const headerLogoCell = { width: "35%", verticalAlign: "middle", padding: 0, textAlign: "center" };
const ministryTitle = { fontWeight: "bold", fontSize: "11px" };
const asterisks = { fontWeight: "bold", letterSpacing: "1px", fontSize: "10px", margin: "1px 0" };

// ─── Title bar ───
const titleBar = {
  textAlign: "center",
  fontSize: "14px",
  fontWeight: "bold",
  borderTop: "2.5px solid #000",
  borderBottom: "2.5px solid #000",
  padding: "6px 0",
  margin: "8px 0 10px 0",
};

// ─── Body ───
const bodyParagraph = {
  fontSize: "11px",
  lineHeight: "1.55",
  textAlign: "justify",
  marginBottom: "6px",
};

// ─── Côtes table ───
const cotesTable = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "10.5px",
  marginBottom: "8px",
};
const thBlack = {
  border: "1.5px solid #000",
  padding: "5px 6px",
  fontWeight: "bold",
  textAlign: "center",
  fontSize: "11px",
};
const tdBlack = {
  border: "1.5px solid #000",
  padding: "4px 6px",
  textAlign: "center",
  fontSize: "10.5px",
  height: "26px",
};
const tdBlackLeft = {
  border: "1.5px solid #000",
  padding: "4px 6px",
  textAlign: "left",
  fontSize: "10.5px",
  height: "26px",
};
const voieCell = {
  border: "1.5px solid #000",
  padding: "6px 8px",
  textAlign: "left",
  fontSize: "10.5px",
  verticalAlign: "top",
  width: "26%",
};

// ─── Technical highlights ───
const techBlock = {
  fontSize: "11px",
  lineHeight: "1.6",
  margin: "6px 0 10px 0",
  paddingLeft: "8px",
};

// ─── Bullet list ───
const bulletList = {
  margin: "0 0 8px 30px",
  paddingLeft: "10px",
  fontSize: "11px",
  lineHeight: "1.55",
};

// ─── Signature ───
const signatureBlock = {
  textAlign: "center",
  marginTop: "20px",
  marginBottom: "20px",
  fontSize: "11px",
  lineHeight: "1.5",
};

// ─── Footer ───
const footerTable = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "8px",
  fontSize: "10px",
};
const footerLeft = {
  width: "70%",
  verticalAlign: "bottom",
  padding: 0,
  lineHeight: "1.4",
};
const footerRight = {
  width: "30%",
  verticalAlign: "bottom",
  padding: 0,
  textAlign: "right",
};
const pageNumberBox = {
  display: "inline-block",
  border: "1px solid #000",
  padding: "2px 14px",
  fontSize: "10px",
};
