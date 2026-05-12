"use client";

import * as React from "react";
import { Stage, Layer, Rect, Line, Text, Group } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { DesignerState, DesignerUnit } from "./types";

const SCALE = 0.15; // 1mm = 0.15 px (room 4000mm → 600px)
const GRID_MM = 100; // 10cm grid

export interface Canvas2DProps {
  design: DesignerState;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMoveUnit: (id: string, x: number, y: number) => void;
}

export function Canvas2D({ design, selectedId, onSelect, onMoveUnit }: Canvas2DProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ w: 800, h: 600 });

  React.useEffect(() => {
    if (!stageRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);

  const roomW = design.room.width * SCALE;
  const roomD = design.room.depth * SCALE;

  // Center the room in the canvas.
  const offsetX = Math.max((size.w - roomW) / 2, 16);
  const offsetY = Math.max((size.h - roomD) / 2, 16);

  const onDragEnd = (id: string) => (e: KonvaEventObject<DragEvent>) => {
    const xMm = (e.target.x() - offsetX) / SCALE;
    const yMm = (e.target.y() - offsetY) / SCALE;
    onMoveUnit(id, snap(xMm), snap(yMm));
  };

  function snap(value: number): number {
    return Math.round(value / 10) * 10;
  }

  return (
    <div
      ref={stageRef}
      className="relative h-full w-full overflow-hidden rounded-2xl bg-white/[0.02]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onSelect(null);
      }}
    >
      <Stage width={size.w} height={size.h}>
        <Layer>
          {/* Grid */}
          {drawGrid(size.w, size.h, GRID_MM * SCALE)}

          {/* Room outline */}
          <Rect
            x={offsetX}
            y={offsetY}
            width={roomW}
            height={roomD}
            stroke="rgba(167, 139, 250, 0.6)"
            strokeWidth={2}
            dash={[6, 6]}
            fill="rgba(167, 139, 250, 0.04)"
          />
          <Text
            x={offsetX + 6}
            y={offsetY + 6}
            text={`الغرفة ${design.room.width} × ${design.room.depth} مم`}
            fontSize={11}
            fill="rgba(255,255,255,0.5)"
          />

          {/* Units */}
          {design.units.map((u) => (
            <UnitShape
              key={u.id}
              unit={u}
              offsetX={offsetX}
              offsetY={offsetY}
              selected={u.id === selectedId}
              onSelect={() => onSelect(u.id)}
              onDragEnd={onDragEnd(u.id)}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

function drawGrid(w: number, h: number, step: number) {
  const lines: React.ReactNode[] = [];
  for (let x = 0; x < w; x += step) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, h]}
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={1}
      />,
    );
  }
  for (let y = 0; y < h; y += step) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, w, y]}
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={1}
      />,
    );
  }
  return lines;
}

function UnitShape({
  unit,
  offsetX,
  offsetY,
  selected,
  onSelect,
  onDragEnd,
}: {
  unit: DesignerUnit;
  offsetX: number;
  offsetY: number;
  selected: boolean;
  onSelect: () => void;
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
}) {
  const x = offsetX + unit.x * SCALE;
  const y = offsetY + unit.y * SCALE;
  const w = unit.width * SCALE;
  const h = unit.depth * SCALE;

  return (
    <Group
      x={x}
      y={y}
      rotation={unit.rotation}
      draggable
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
    >
      <Rect
        width={w}
        height={h}
        fill={unit.color}
        opacity={selected ? 0.95 : 0.75}
        stroke={selected ? "#fff" : "rgba(255,255,255,0.4)"}
        strokeWidth={selected ? 2 : 1}
        cornerRadius={3}
        shadowColor={selected ? unit.color : "transparent"}
        shadowBlur={selected ? 16 : 0}
        shadowOpacity={0.8}
      />
      <Text
        x={4}
        y={4}
        width={w - 8}
        text={unit.templateName}
        fontSize={9}
        fill="white"
        ellipsis
        wrap="none"
      />
      <Text
        x={4}
        y={h - 14}
        text={`${unit.width}×${unit.depth}`}
        fontSize={8}
        fill="rgba(255,255,255,0.7)"
      />
    </Group>
  );
}
