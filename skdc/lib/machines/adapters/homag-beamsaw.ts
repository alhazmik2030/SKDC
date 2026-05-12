import { makeStubAdapter } from "./_stub";

export default makeStubAdapter({
  id: "homag-beamsaw",
  name: "Homag Beam Saw",
  manufacturer: "HOMAG",
  category: "BEAM_SAW",
  capabilities: ["STRAIGHT_CUT"],
  outputFormat: "WOODWOP_MPR",
  channel: "FILE_DOWNLOAD",
});
