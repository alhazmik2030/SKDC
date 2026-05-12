import { makeStubAdapter } from "./_stub";

export default makeStubAdapter({
  id: "biesse-rover-nesting",
  name: "Biesse Rover (Nesting)",
  manufacturer: "BIESSE",
  category: "NESTING_CNC",
  capabilities: ["STRAIGHT_CUT", "CURVED_CUT", "BORE", "POCKET"],
  outputFormat: "BIESSE_CIX",
  channel: "FILE_DOWNLOAD",
});
