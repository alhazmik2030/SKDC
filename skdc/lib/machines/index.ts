/**
 * SKDC Machines — public API.
 *
 * Anything outside `lib/machines/` should import from here, NOT from
 * specific adapters. This keeps the architecture pluggable.
 */
export type {
  MachineAdapter,
  MachineCategory,
  MachineCapability,
  MachineFormat,
  MachineChannel,
  Manufacturer,
  CutPlan,
  CutPiece,
  SheetStock,
  NestedSheet,
  PiecePlacement,
  PieceOperation,
  PieceFace,
  EdgeBand,
  EncodedOutput,
  TransmitResult,
} from "./types";

export { MachineEncodingError, UnsupportedCapabilityError } from "./types";

export {
  MACHINE_REGISTRY,
  listReady,
  listByCategory,
  listByManufacturer,
  findAdapter,
  loadAdapter,
} from "./registry";
