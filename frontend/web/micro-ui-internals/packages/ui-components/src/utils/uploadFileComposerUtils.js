let documentFileTypeMappings = {
  docx: "vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  png: "png",
  pdf: "pdf",
  jpeg: "jpeg",
  jpg: "jpeg",
  xls: "vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "csv",
  dwg: "acad|x-acad|dwg|x-dwg|vnd.dwg|autocad",
  dxf: "dxf|x-dxf|plain",
  skp: "skp|vnd.sketchup.skp|octet-stream",
  pla: "pla|octet-stream",
  pln: "pln|octet-stream",
  rvt: "rvt|vnd.autodesk.revit|octet-stream",
  rfa: "rfa|octet-stream",
  zip: "zip|x-zip|x-zip-compressed",
  rar: "rar|x-rar|x-rar-compressed|vnd.rar",
  sevenz: "7z|x-7z-compressed",
};

export const getRegex = (allowedFormats) => {
  // if(allowedFormats?.length) {
  //   const obj = { "expression" : `/(.*?)(${allowedFormats?.join('|')})$/`}
  //   const stringified = JSON.stringify(obj);
  //   console.log(new RegExp(JSON.parse(stringified).expression.slice(1, -1)));
  //   return new RegExp(JSON.parse(stringified).expression.slice(1, -1));
  // } else if(docConfig?.allowedFileTypes?.length) {
  //   const obj = { "expression" : `/(.*?)(${docConfig?.allowedFileTypes?.join('|')})$/`}
  //   const stringified = JSON.stringify(obj);
  //   console.log(new RegExp(JSON.parse(stringified).expression.slice(1, -1)))
  //   return new RegExp(JSON.parse(stringified).expression.slice(1, -1));
  // }
  // return /(.*?)(pdf|docx|jpeg|jpg|png|msword|openxmlformats-officedocument|wordprocessingml|document|spreadsheetml|sheet)$/
  if (allowedFormats?.length) {
    let exceptedFileTypes = [];
    allowedFormats?.forEach((allowedFormat) => {
      exceptedFileTypes.push(documentFileTypeMappings[allowedFormat]);
    });
    exceptedFileTypes = exceptedFileTypes.join("|");
    return new RegExp(`(${exceptedFileTypes})$`, "i");
  }
  return /(pdf|docx|jpeg|jpg|png|msword|openxmlformats-officedocument|wordprocessingml|document|spreadsheetml|sheet|dwg|dxf|skp|pla|pln|rvt|rfa|zip|rar)$/i;
};

// export { documentFileTypeMappings, getRegex };
