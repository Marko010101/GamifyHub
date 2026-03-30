import type { WheelSegment } from '@/types/wheel'

type PreviewSegment = Pick<WheelSegment, 'label' | 'color' | 'weight'> & { id?: string }

interface WheelPreviewProps {
  segments: PreviewSegment[]
  backgroundColor?: string
  borderColor?: string
  size?: number
}

interface SegmentAngle {
  start: number
  end: number
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function buildArcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const start = polarToCartesian(cx, cy, r, startDeg)
  const end = polarToCartesian(cx, cy, r, endDeg)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return [
    `M ${cx} ${cy}`,
    `L ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
    'Z',
  ].join(' ')
}

function weightsToAngles(segments: PreviewSegment[]): SegmentAngle[] {
  const total = segments.reduce((sum, s) => sum + (s.weight || 0), 0)
  if (total === 0) return segments.map(() => ({ start: 0, end: 0 }))
  let cursor = 0
  return segments.map((s) => {
    const start = cursor
    const sweep = (s.weight / total) * 360
    cursor += sweep
    return { start, end: cursor }
  })
}

interface SegmentLabelProps {
  cx: number
  cy: number
  r: number
  startDeg: number
  endDeg: number
  label: string
}

function SegmentLabel({ cx, cy, r, startDeg, endDeg, label }: SegmentLabelProps) {
  const midDeg = (startDeg + endDeg) / 2
  const pos = polarToCartesian(cx, cy, r, midDeg)
  const rotation = midDeg - 90
  const displayLabel = label.length > 9 ? `${label.slice(0, 8)}…` : label

  return (
    <text
      x={pos.x}
      y={pos.y}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={11}
      fontWeight={600}
      fill="#ffffff"
      stroke="rgba(0,0,0,0.3)"
      strokeWidth={0.5}
      paintOrder="stroke"
      transform={`rotate(${rotation.toFixed(1)}, ${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`}
    >
      {displayLabel}
    </text>
  )
}

export function WheelPreview({
  segments,
  backgroundColor = '#1a237e',
  borderColor = '#ffd700',
  size = 300,
}: WheelPreviewProps) {
  const cx = size / 2
  const cy = size / 2
  const outerR = size / 2 - 4
  const innerR = outerR - 2
  const labelR = innerR * 0.65

  const validSegments = segments.filter(
    (s) => s.label && s.color && s.weight > 0,
  )

  if (validSegments.length === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={outerR} fill={backgroundColor} stroke={borderColor} strokeWidth={3} />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={13} fill="rgba(255,255,255,0.6)">
          Add segments to preview
        </text>
      </svg>
    )
  }

  const angles = weightsToAngles(validSegments)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: 'block' }}
    >
      {/* Background circle */}
      <circle cx={cx} cy={cy} r={outerR} fill={backgroundColor} />

      {/* Segments */}
      {validSegments.map((seg, i) => {
        const { start, end } = angles[i]
        const sweep = end - start
        if (sweep <= 0) return null
        return (
          <g key={seg.id ?? i}>
            <path
              d={buildArcPath(cx, cy, innerR, start, end)}
              fill={seg.color || '#cccccc'}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={1}
            />
            {sweep > 15 && (
              <SegmentLabel
                cx={cx}
                cy={cy}
                r={labelR}
                startDeg={start}
                endDeg={end}
                label={seg.label}
              />
            )}
          </g>
        )
      })}

      {/* Outer border ring */}
      <circle
        cx={cx}
        cy={cy}
        r={outerR}
        fill="none"
        stroke={borderColor}
        strokeWidth={4}
      />

      {/* Center hub */}
      <circle cx={cx} cy={cy} r={14} fill="white" stroke={borderColor} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={5} fill={borderColor} />

      {/* Pointer triangle at top */}
      <polygon
        points={`${cx},${cy - outerR - 2} ${cx - 8},${cy - outerR + 12} ${cx + 8},${cy - outerR + 12}`}
        fill={borderColor}
      />
    </svg>
  )
}
