import type { MachineAdapter, Manufacturer, MachineCategory, MachineCapability, MachineFormat, MachineChannel } from "../types";

/**
 * Helper to declare a not-yet-implemented adapter as a placeholder.
 * Throws a clear error if anyone tries to encode/transmit with it.
 */
export function makeStubAdapter(meta: {
  id: string;
  name: string;
  manufacturer: Manufacturer;
  category: MachineCategory;
  capabilities: MachineCapability[];
  outputFormat: MachineFormat;
  channel: MachineChannel;
}): MachineAdapter {
  return {
    ...meta,
    encode() {
      throw new Error(
        `[stub] Adapter "${meta.id}" is planned but not implemented yet. ` +
        `See lib/machines/registry.ts to enable when ready.`,
      );
    },
  };
}
