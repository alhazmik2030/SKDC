import type { RoomShape } from "@prisma/client";

/**
 * Top-down SVG diagram for each room shape.
 * Walls labelled A (front, south) → B (right) → C (back) → D (left), clockwise.
 * Island shown as a centered dashed rectangle.
 *
 * The viewBox is 100×80 (10mm grid in design space, abstracted). The labels
 * sit just outside each wall so they don't collide with units later.
 */
export function ShapePreviewSVG({
  shape,
  size = 120,
  showLabels = true,
}: {
  shape: RoomShape;
  size?: number;
  showLabels?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 80"
      width={size}
      height={(size * 80) / 100}
      role="img"
      aria-hidden="true"
      className="overflow-visible"
    >
      <defs>
        <pattern
          id="shape-grid"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 10 0 L 0 0 0 10"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100" height="80" fill="url(#shape-grid)" />
      <ShapeBody shape={shape} showLabels={showLabels} />
    </svg>
  );
}

function ShapeBody({
  shape,
  showLabels,
}: {
  shape: RoomShape;
  showLabels: boolean;
}) {
  // Wall coordinates (front-down convention — y grows downward in SVG).
  // A: bottom edge (front), B: right edge, C: top edge (back), D: left edge.
  const A = { x1: 10, y1: 65, x2: 90, y2: 65, lx: 50, ly: 75 };
  const B = { x1: 90, y1: 65, x2: 90, y2: 15, lx: 95, ly: 40 };
  const C = { x1: 90, y1: 15, x2: 10, y2: 15, lx: 50, ly: 8 };
  const D = { x1: 10, y1: 15, x2: 10, y2: 65, lx: 5, ly: 40 };

  const stroke = "currentColor";
  const wallProps = {
    stroke,
    strokeWidth: 2.5,
    strokeLinecap: "round" as const,
  };

  const label = (x: number, y: number, text: string) =>
    showLabels ? (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="6"
        fontWeight="700"
        fill={stroke}
        opacity="0.6"
      >
        {text}
      </text>
    ) : null;

  switch (shape) {
    case "SINGLE_WALL":
      return (
        <>
          <line x1={A.x1} y1={A.y1} x2={A.x2} y2={A.y2} {...wallProps} />
          {label(A.lx, A.ly, "A")}
        </>
      );

    case "L_SHAPE":
      return (
        <>
          <line x1={A.x1} y1={A.y1} x2={A.x2} y2={A.y2} {...wallProps} />
          <line x1={B.x1} y1={B.y1} x2={B.x2} y2={B.y2} {...wallProps} />
          {label(A.lx, A.ly, "A")}
          {label(B.lx, B.ly, "B")}
        </>
      );

    case "U_SHAPE":
      return (
        <>
          <line x1={A.x1} y1={A.y1} x2={A.x2} y2={A.y2} {...wallProps} />
          <line x1={B.x1} y1={B.y1} x2={B.x2} y2={B.y2} {...wallProps} />
          <line x1={C.x1} y1={C.y1} x2={C.x2} y2={C.y2} {...wallProps} />
          {label(A.lx, A.ly, "A")}
          {label(B.lx, B.ly, "B")}
          {label(C.lx, C.ly, "C")}
        </>
      );

    case "CLOSED":
      return (
        <>
          <rect
            x="10"
            y="15"
            width="80"
            height="50"
            fill="none"
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {label(A.lx, A.ly, "A")}
          {label(B.lx, B.ly, "B")}
          {label(C.lx, C.ly, "C")}
          {label(D.lx, D.ly, "D")}
        </>
      );

    case "ISLAND":
      return (
        <>
          <rect
            x="10"
            y="15"
            width="80"
            height="50"
            fill="none"
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <rect
            x="38"
            y="33"
            width="24"
            height="14"
            fill="none"
            stroke={stroke}
            strokeWidth="1.8"
            strokeDasharray="2 1.5"
            opacity="0.85"
          />
          {label(A.lx, A.ly, "A")}
          {label(B.lx, B.ly, "B")}
          {label(C.lx, C.ly, "C")}
          {label(D.lx, D.ly, "D")}
        </>
      );

    case "CUSTOM":
    default:
      return (
        <text
          x="50"
          y="42"
          textAnchor="middle"
          fontSize="8"
          fill={stroke}
          opacity="0.5"
        >
          ?
        </text>
      );
  }
}
