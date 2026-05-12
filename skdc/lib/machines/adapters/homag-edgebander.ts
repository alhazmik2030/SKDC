import { makeStubAdapter } from "./_stub";

export default makeStubAdapter({
  id: "homag-edgebander",
  name: "Homag Edge Bander",
  manufacturer: "HOMAG",
  category: "EDGE_BANDER",
  capabilities: ["EDGE_BAND"],
  outputFormat: "CSV",
  channel: "FILE_DOWNLOAD",
});
