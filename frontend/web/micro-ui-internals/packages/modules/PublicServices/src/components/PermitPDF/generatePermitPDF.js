export const generatePermitPDF = (elementRef, fileName) => {
  if (!elementRef || !elementRef.current) {
    console.error("PDF element ref is null");
    return;
  }

  var content = elementRef.current.innerHTML;

  var printWindow = window.open("", "_blank");
  printWindow.document.write(
    "<!DOCTYPE html><html><head><title>" + (fileName || "Permis") + "</title>" +
    "<style>" +
    "* { margin: 0; padding: 0; box-sizing: border-box; }" +
    "body { font-family: 'Times New Roman', Times, serif; }" +
    "@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { size: A4; margin: 0; } }" +
    "</style>" +
    "</head><body>" +
    content +
    "</body></html>"
  );
  printWindow.document.close();

  // Wait for content to render then print
  printWindow.onload = function () {
    printWindow.focus();
    printWindow.print();
  };

  // Fallback if onload doesn't fire
  setTimeout(function () {
    printWindow.focus();
    printWindow.print();
  }, 500);
};
