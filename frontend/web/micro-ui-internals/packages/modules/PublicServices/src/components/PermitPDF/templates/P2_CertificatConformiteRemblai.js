import React from "react";

const DATUH_LOGO_URL = "https://res.cloudinary.com/djykaulgo/image/upload/v1777182370/datuh-logo_y8vx0s.png";

const formatDate = (val) => {
  if (!val) return "……/……/………";
  // Accept ISO strings, yyyy-mm-dd or epoch ms
  let d;
  if (typeof val === "number") d = new Date(val);
  else if (/^\d{4}-\d{2}-\d{2}/.test(val)) d = new Date(val);
  else d = new Date(val);
  if (isNaN(d.getTime())) return val; // fallback to raw string
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatYear = (val) => {
  if (!val) return "…";
  const d = new Date(val);
  return isNaN(d.getTime()) ? "…" : String(d.getFullYear());
};

const padSequence = (n) => String(n || "").replace(/^.*?(\d+).*$/, "$1").padStart(2, "0");

const P2_CertificatConformiteRemblai = React.forwardRef((props, ref) => {
  const { response } = props;

  // Demande date — when the citizen filed the CCR application.
  const createdDate = response?.auditDetails?.createdTime;

  // CCR-specific data filled by the agent (Brigade Topographe).
  const ccr = response?.additionalDetails?.ccrChecklist || {};

  // Applicant — prefer the explicit beneficiary name from the checklist; fall back to the
  // applicant on the application record.
  const rootApplicant = response?.applicants?.[0];
  const nestedApplicant = response?.serviceDetails?.responseData?.Application?.applicants?.[0];
  const applicant = rootApplicant?.name ? rootApplicant : (nestedApplicant || rootApplicant) || {};
  const civility = applicant.civility || applicant.gender || "Monsieur";
  const civilityLabel = String(civility).toLowerCase().startsWith("mada") ? "Madame" : "Monsieur";
  const beneficiaryName = ccr.beneficiaryName || applicant.name || "…………………………";

  // Permit / certificate identifiers.
  const ccrNumber = ccr.ccrNumber || (() => {
    const appNo = response?.applicationNumber || "";
    const seqMatch = appNo.match(/(\d+)/);
    const seq = seqMatch ? padSequence(seqMatch[1]) : "…";
    const year = formatYear(createdDate);
    return `${seq}/${year}`;
  })();
  const prNumber = ccr.prNumber || "…………";
  const prDeliveryDate = ccr.prDeliveryDate;

  // Reference number for top-left.
  const year = formatYear(createdDate);
  const refNumber = `DATUH/SDATU/BT/${year}/NDM`;

  // Lab tests — pad to at least 2 entries so the layout matches the template.
  const labTests = (ccr.labTests && ccr.labTests.length > 0) ? ccr.labTests : [];

  // Body texts.
  const location = ccr.location || "…………………………";
  const lotNumbers = ccr.lotNumbers || "…………";
  const landTitleNumber = ccr.landTitleNumber || "………";
  const siteVisitDate = ccr.siteVisitDate;

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
                  <div style={ministryTitle}>de l'urbanisme et de l'Habitat</div>
                  <div style={asterisks}>**********************</div>
                  <div style={ministryTitle}>Direction de l'Aménagement du Territoire,</div>
                  <div style={ministryTitle}>de l'Urbanisme et de l'Habitat</div>
                  <div style={asterisks}>**********************</div>
                  <div style={ministryTitle}>Sous-direction de l'Aménagement</div>
                  <div style={ministryTitle}>du Territoire et de l'Urbanisme</div>
                  <div style={asterisks}>**********************</div>
                  <div style={ministryTitle}>Bureau Topographie</div>
                  <div style={{ marginTop: "4px", fontStyle: "italic" }}>
                    DATUH N°<span style={highlight}>…………..</span>
                  </div>
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
          <div style={{ textAlign: "right", margin: "6px 0 8px 0", fontSize: "10.5px", fontStyle: "italic" }}>
            <span style={highlight}>Djibouti, le {formatDate(createdDate)}</span>
          </div>

          {/* Title bar */}
          <div style={titleBar}>
            <span>CERTIFICAT DE CONFORMITÉ DE REMBLAI N°</span>
            <span style={highlight}>{ccrNumber}</span>
          </div>

          {/* "Vu" section */}
          <div style={vuBlock}>
            <div style={bodyParagraph}>
              <strong>Vu</strong> le Permis de Remblai N°
              <span style={highlight}>{prNumber}</span>
              {prDeliveryDate ? (
                <React.Fragment>, délivré le <span style={highlight}>{formatDate(prDeliveryDate)}</span></React.Fragment>
              ) : null}
            </div>
            <div style={bodyParagraph}>
              <strong>Vu</strong> la demande en date du <span style={highlight}>{formatDate(createdDate)}</span>
            </div>
            <div style={bodyParagraph}>
              <strong>Vu</strong> les avis du Laboratoire central du bâtiment et l'équipement.
            </div>
            {labTests.length > 0 ? (
              <div style={{ paddingLeft: "30px", marginTop: "2px" }}>
                {labTests.map((test, i) => (
                  <div key={i} style={bodyParagraph}>
                    - le test relatif à la <span style={highlight}>{test.couche || "……"}</span> couche effectué{" "}
                    <span style={highlight}>{test.surface || "………"}m²</span> le{" "}
                    <span style={highlight}>{formatDate(test.date)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ paddingLeft: "30px", marginTop: "2px" }}>
                <div style={bodyParagraph}>- le test relatif à la Première couche effectué ………m² le ……/……/………</div>
                <div style={bodyParagraph}>- le test relatif à la deuxième et dernière couche effectué ………m² le ……/……/………</div>
              </div>
            )}
          </div>

          {/* Delivery paragraph */}
          <div style={{ ...bodyParagraph, marginTop: "8px" }}>
            <strong>Un Certificat de Conformité de Remblai</strong> est délivré par <strong>la Direction de l'Aménagement du Territoire,
            de l'Urbanisme et de l'Habitat</strong> à <span style={highlight}>{civilityLabel} {beneficiaryName}</span>
          </div>
          <div style={bodyParagraph}>Pour sa parcelle :</div>
          <div style={{ paddingLeft: "30px" }}>
            <div style={bodyParagraph}>- Sise ; <span style={highlight}>{location}</span></div>
            <div style={bodyParagraph}>- lot n°<span style={highlight}>{lotNumbers}</span></div>
            <div style={bodyParagraph}>- Objet du Titre Foncier n°<span style={highlight}>{landTitleNumber}</span></div>
          </div>

          {/* Visit date paragraph */}
          <div style={{ ...bodyParagraph, marginTop: "8px" }}>
            Il est porté à la connaissance de toute personne qu'elle demeure responsable des terrassements ultérieurs à la
            délivrance du présent certificat, susceptibles de modifier les côtes constatées le jour de la visite de terrain qui
            a eu lieu <span style={highlight}>le {formatDate(siteVisitDate)}</span> en présence de la Brigade Topographique de la Direction de l'Aménagements du
            Territoire, de l'Urbanisme et de l'Habitat.
          </div>

          {/* Reservations paragraphs */}
          <div style={{ ...bodyParagraph, marginTop: "8px" }}>
            <strong>La Direction de l'Aménagement du Territoire, de l'Urbanisme et de l'Habitat</strong> se garde la réserve de
            procéder à une visite de terrain ultérieure à la date de délivrance du Certificat de Conformité de Remblai afin
            de vérifier l'exécution ou non de remblais supplémentaire.
          </div>
          <div style={bodyParagraph}>
            En cas de constatation du non respect des côtes de remblai certifiées lors de la visite de terrain mentionnée
            ci-dessus, la Direction de l'Aménagement du Territoire de l'Urbanisme et de l'Habitat suspendra
            l'instruction de la demande de Permis de Construire ou de toute autre autorisation de mise en valeur de la
            parcelle concernée.
          </div>

          <div style={{ ...bodyParagraph, marginTop: "8px" }}>
            <span style={{ marginRight: "8px" }}>•</span>
            En foi de quoi, le présent <strong>Certificat de Conformité de Remblai</strong> est délivré à{" "}
            <span style={highlight}>{civilityLabel} {beneficiaryName}.</span> <span style={highlight}>Servir</span> et faire valoir ce que de droit.
          </div>

          {/* Bullet break before signatures */}
          <div style={{ marginTop: "10px" }}>
            <span style={{ marginRight: "8px" }}>•</span>
          </div>

          {/* Signatures — Chef Brigade Topographe (left) + Sous Directeur (right) */}
          <table style={signatureRowTable}>
            <tbody>
              <tr>
                <td style={signatureCellLeft}>
                  <div style={{ ...highlight, fontWeight: "bold" }}>Le Chef de la Brigade Topographe</div>
                  <div style={{ marginTop: "55px", ...highlight, fontWeight: "bold" }}>ABDOURAHMAN YONIS YOUSSOUF</div>
                </td>
                <td style={signatureCellRight}>
                  <div style={{ ...highlight, fontWeight: "bold" }}>Le Sous Directeur de l'Aménagement</div>
                  <div style={{ ...highlight, fontWeight: "bold" }}>du Territoire et de l'Urbanisme</div>
                  <div style={{ marginTop: "40px", ...highlight, fontWeight: "bold" }}>MOHAMED ALI KAOURAH</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Director signature centered below */}
          <div style={{ ...signatureBlock, marginTop: "30px" }}>
            <div style={{ ...highlight, fontWeight: "bold" }}>Le Directeur de l'Aménagement du Territoire</div>
            <div style={{ ...highlight, fontWeight: "bold" }}>de l'Urbanisme et l'Habitat</div>
            <div style={{ marginTop: "40px", ...highlight, fontWeight: "bold" }}>HABIB IBRAHIM MOHAMED</div>
          </div>

        </div>
      </div>
    </div>
  );
});

P2_CertificatConformiteRemblai.displayName = "P2_CertificatConformiteRemblai";
export default P2_CertificatConformiteRemblai;

// ─── Styles (inline so the html-to-iframe printer keeps everything) ───
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

// Highlight is intentionally empty in production (was yellow in the reference image
// to mark dynamic fields).
const highlight = {};

const headerTopTable = { width: "100%", borderCollapse: "collapse", marginBottom: "4px", fontSize: "10.5px" };
const headerTopLeft = { width: "60%", textAlign: "left", padding: 0, verticalAlign: "top" };
const headerTopRight = { width: "40%", textAlign: "right", padding: 0, verticalAlign: "top", fontStyle: "italic" };

const headerTable = { width: "100%", borderCollapse: "collapse", marginBottom: "4px" };
const headerMinistryCell = { width: "65%", verticalAlign: "top", padding: 0, lineHeight: "1.45" };
const headerLogoCell = { width: "35%", verticalAlign: "middle", padding: 0, textAlign: "center" };
const ministryTitle = { fontWeight: "bold", fontSize: "11px" };
const asterisks = { fontWeight: "bold", letterSpacing: "1px", fontSize: "10px", margin: "1px 0" };

const titleBar = {
  textAlign: "center",
  fontSize: "13px",
  fontWeight: "bold",
  borderTop: "2.5px solid #000",
  borderBottom: "2.5px solid #000",
  padding: "6px 0",
  margin: "8px 0 10px 0",
};

const bodyParagraph = {
  fontSize: "11px",
  lineHeight: "1.55",
  textAlign: "justify",
  marginBottom: "4px",
};

const vuBlock = {
  marginBottom: "6px",
};

const signatureBlock = {
  textAlign: "center",
  marginTop: "20px",
  marginBottom: "10px",
  fontSize: "11px",
  lineHeight: "1.5",
};

const signatureRowTable = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px",
  fontSize: "11px",
};
const signatureCellLeft = {
  width: "50%",
  textAlign: "left",
  verticalAlign: "top",
  padding: "0 8px 0 0",
  lineHeight: "1.5",
};
const signatureCellRight = {
  width: "50%",
  textAlign: "right",
  verticalAlign: "top",
  padding: "0 0 0 8px",
  lineHeight: "1.5",
};
