"use client";

import React from "react";
import type { RoomWall } from "@prisma/client";
import type { DesignerUnit } from "@/components/designer/types";
import { getCategoryColor } from "@/components/designer/template-palette";

/**
 * Side-view (elevation) of a single wall. Renders the wall rectangle, the
 * window and door cutouts, and any DesignerUnit bound to this wall as a
 * draggable rectangle positioned along the wall's length.
 *
 * Coordinate system: x = mm along wall (0 → wall.length), y = mm from floor
 * (0 → wall.height). The SVG viewBox is in mm, so we can pass raw values.
 */

const PADDING = 200; // mm of breathing room around the wall

const UPPER_CABINET_BASE_HEIGHT = 1400;
const TALL_CABINET_BASE_HEIGHT = 0;

export type ElevationUnit = DesignerUnit & {
  /** Floor-to-bottom height in mm. Derived from category if not set. */
  baseHeight: number;
};

export function defaultBaseHeight(category: string): number {
  switch (category) {
    case "UPPER_CABINET":
      return UPPER_CABINET_BASE_HEIGHT;
    case "TALL_CABINET":
      return TALL_CABINET_BASE_HEIGHT;
    default:
      return 0;
  }
}

export function ElevationView({
  wall,
  units,
  selectedId,
  onSelect,
  onMove,
  onDelete,
}: {
  wall: RoomWall;
  units: DesignerUnit[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, nextOffset: number) => void;
  onDelete: (id: string) => void;
}) {
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const [dragging, setDragging] = React.useState<{
    id: string;
    pointerStartX: number;
    offsetStart: number;
  } | null>(null);

  // viewBox dims (mm space + padding so labels don't clip)
  const vbW = wall.length + PADDING * 2;
  const vbH = wall.height + PADDING * 2;

  function clientToMm(clientX: number): number {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const scale = vbW / rect.width;
    return (clientX - rect.left) * scale;
  }

  function handlePointerDown(
    e: React.PointerEvent,
    unit: DesignerUnit,
  ) {
    e.stopPropagation();
    onSelect(unit.id);
    setDragging({
      id: unit.id,
      pointerStartX: clientToMm(e.clientX),
      offsetStart: unit.wallOffset ?? 0,
    });
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const unit = units.find((u) => u.id === dragging.id);
    if (!unit) return;
    const dx = clientToMm(e.clientX) - dragging.pointerStartX;
    let next = dragging.offsetStart + dx;
    // Snap to 10mm
    next = Math.round(next / 10) * 10;
    const min = 0;
    const max = Math.max(0, wall.length - unit.width);
    next = Math.max(min, Math.min(max, next));
    onMove(unit.id, next);
  }

  function handlePointerUp() {
    setDragging(null);
  }

  // background — empty area click deselects
  function handleSvgClick(e: React.MouseEvent) {
    if (e.target === svgRef.current) onSelect(null);
  }

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`${-PADDING} ${-PADDING} ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
        className="block w-full select-none"
        style={{ maxHeight: "60vh" }}
        onClick={handleSvgClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <defs>
          <pattern
            id="elev-grid"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 100 0 L 0 0 0 100"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeWidth="2"
            />
          </pattern>
          <linearGradient id="floor-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(167,139,250,0.06)" />
            <stop offset="100%" stopColor="rgba(167,139,250,0.18)" />
          </linearGradient>
        </defs>

        {/* Background grid */}
        <rect
          x={-PADDING}
          y={-PADDING}
          width={vbW}
          height={vbH}
          fill="url(#elev-grid)"
        />

        {/* Floor band */}
        <rect
          x={-PADDING}
          y={wall.height}
          width={vbW}
          height={PADDING}
          fill="url(#floor-grad)"
        />

        {/* Ceiling line */}
        <line
          x1={0}
          y1={0}
          x2={wall.length}
          y2={0}
          stroke="currentColor"
          strokeOpacity="0.3"
          strokeDasharray="20 10"
          strokeWidth="2"
        />

        {/* Wall rectangle */}
        <rect
          x={0}
          y={0}
          width={wall.length}
          height={wall.height}
          fill="rgba(255,255,255,0.02)"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="4"
          vectorEffect="non-scaling-stroke"
        />

        {/* Window cutout */}
        {wall.hasWindow &&
        wall.windowOffset !== null &&
        wall.windowWidth !== null &&
        wall.windowHeight !== null &&
        wall.windowSill !== null ? (
          <g>
            <rect
              x={wall.windowOffset}
              y={wall.height - wall.windowSill - wall.windowHeight}
              width={wall.windowWidth}
              height={wall.windowHeight}
              fill="rgba(56,189,248,0.18)"
              stroke="#38bdf8"
              strokeWidth="3"
              strokeDasharray="14 6"
            />
            <text
              x={wall.windowOffset + wall.windowWidth / 2}
              y={wall.height - wall.windowSill - wall.windowHeight / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="60"
              fontWeight="700"
              fill="#38bdf8"
              opacity="0.7"
            >
              نافذة
            </text>
          </g>
        ) : null}

        {/* Door cutout */}
        {wall.hasDoor &&
        wall.doorOffset !== null &&
        wall.doorWidth !== null &&
        wall.doorHeight !== null ? (
          <g>
            <rect
              x={wall.doorOffset}
              y={wall.height - wall.doorHeight}
              width={wall.doorWidth}
              height={wall.doorHeight}
              fill="rgba(244,114,182,0.18)"
              stroke="#f472b6"
              strokeWidth="3"
              strokeDasharray="14 6"
            />
            <text
              x={wall.doorOffset + wall.doorWidth / 2}
              y={wall.height - wall.doorHeight / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="60"
              fontWeight="700"
              fill="#f472b6"
              opacity="0.7"
            >
              باب
            </text>
          </g>
        ) : null}

        {/* Length ruler (top) */}
        <line
          x1={0}
          y1={-80}
          x2={wall.length}
          y2={-80}
          stroke="currentColor"
          strokeOpacity="0.4"
          strokeWidth="2"
        />
        <line
          x1={0}
          y1={-100}
          x2={0}
          y2={-60}
          stroke="currentColor"
          strokeOpacity="0.4"
          strokeWidth="2"
        />
        <line
          x1={wall.length}
          y1={-100}
          x2={wall.length}
          y2={-60}
          stroke="currentColor"
          strokeOpacity="0.4"
          strokeWidth="2"
        />
        <text
          x={wall.length / 2}
          y={-110}
          textAnchor="middle"
          fontSize="70"
          fontWeight="700"
          fill="currentColor"
          opacity="0.7"
        >
          {Math.round(wall.length)} مم
        </text>

        {/* Height ruler (right) */}
        <line
          x1={wall.length + 80}
          y1={0}
          x2={wall.length + 80}
          y2={wall.height}
          stroke="currentColor"
          strokeOpacity="0.4"
          strokeWidth="2"
        />
        <text
          x={wall.length + 100}
          y={wall.height / 2}
          fontSize="70"
          fontWeight="700"
          fill="currentColor"
          opacity="0.7"
          transform={`rotate(90 ${wall.length + 100} ${wall.height / 2})`}
          textAnchor="middle"
        >
          {Math.round(wall.height)} مم
        </text>

        {/* Units */}
        {units.map((unit) => {
          const offset = unit.wallOffset ?? 0;
          const baseHeight = unit.baseHeight ?? defaultBaseHeight(unit.category);
          const y = wall.height - baseHeight - unit.height;
          const color = getCategoryColor(unit.category);
          const selected = unit.id === selectedId;
          return (
            <g
              key={unit.id}
              onPointerDown={(e) => handlePointerDown(e, unit)}
              style={{ cursor: dragging?.id === unit.id ? "grabbing" : "grab" }}
            >
              <rect
                x={offset}
                y={y}
                width={unit.width}
                height={unit.height}
                fill={color}
                fillOpacity={selected ? 0.55 : 0.4}
                stroke={selected ? "#ffffff" : color}
                strokeWidth={selected ? 6 : 3}
                strokeOpacity={selected ? 1 : 0.8}
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={offset + unit.width / 2}
                y={y + unit.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="50"
                fontWeight="700"
                fill="white"
                opacity="0.9"
                pointerEvents="none"
              >
                {unit.templateName}
              </text>
              <text
                x={offset + unit.width / 2}
                y={y + unit.height / 2 + 60}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="36"
                fontWeight="500"
                fill="white"
                opacity="0.7"
                pointerEvents="none"
              >
                {Math.round(unit.width)}×{Math.round(unit.height)} مم
              </text>
            </g>
          );
        })}
      </svg>

      {/* Delete shortcut helper */}
      {selectedId ? (
        <div className="pointer-events-none absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-1 text-[10px] text-white/80 backdrop-blur">
          اضغط Delete لحذف الوحدة المحددة · Esc لإلغاء التحديد
        </div>
      ) : null}

      {/* Keyboard binding shim */}
      <KeyBindings
        active={!!selectedId}
        onDelete={() => selectedId && onDelete(selectedId)}
        onEsc={() => onSelect(null)}
      />
    </div>
  );
}

function KeyBindings({
  active,
  onDelete,
  onEsc,
}: {
  active: boolean;
  onDelete: () => void;
  onEsc: () => void;
}) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!active) return;
      const target = e.target as HTMLElement | null;
      // Don't fire when typing in inputs
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onDelete();
      } else if (e.key === "Escape") {
        onEsc();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onDelete, onEsc]);
  return null;
}
