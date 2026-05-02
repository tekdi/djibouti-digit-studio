/**
 * Print the rendered React permit template via a hidden iframe on the
 * current page — no new tab, no popup. Browser print dialog appears in
 * the current window; the user can pick "Save as PDF" from it.
 */
export const generatePermitPDF = (elementRef, fileName) => {
  if (!elementRef || !elementRef.current) {
    console.error("PDF element ref is null");
    return;
  }

  const content = elementRef.current.innerHTML;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(
    "<!DOCTYPE html><html><head><title>" + (fileName || "Permis") + "</title>" +
    "<style>" +
    "* { margin: 0; padding: 0; box-sizing: border-box; }" +
    "body { font-family: 'Times New Roman', Times, serif; }" +
    "img { max-width: 100%; }" +
    "@media print {" +
    "  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }" +
    "  @page { size: A4; margin: 0; }" +
    "}" +
    "</style></head><body>" +
    content +
    "</body></html>"
  );
  doc.close();

  // Wait one tick for the iframe document — and the embedded DATUH logo —
  // to finish loading before invoking print, otherwise the dialog may show
  // a permit with a missing image.
  const triggerPrint = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      console.error("Print failed:", e);
    } finally {
      // Remove the iframe after the print dialog has had time to close.
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 1500);
    }
  };

  const img = doc.querySelector("img");
  if (img && !img.complete) {
    img.addEventListener("load", triggerPrint, { once: true });
    img.addEventListener("error", triggerPrint, { once: true });
    setTimeout(triggerPrint, 1500); // hard fallback
  } else {
    setTimeout(triggerPrint, 100);
  }
};
