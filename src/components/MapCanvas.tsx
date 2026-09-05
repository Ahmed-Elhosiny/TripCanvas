import { useMemo, useState } from 'react';
import type { CityId } from '../types';
import { CITIES } from '../types';
import { CITY_BOUNDS, haversineKm, project } from '../lib/geo';
import type { Coord } from '../lib/geo';

const W = 1000;
const H = 700;

/* ---------------- stylized geography per city (lng/lat pairs) ---------------- */

interface CityGeo {
  rivers: [number, number][][];
  parks: [number, number][][];
  lagoon?: boolean;
  islands?: [number, number][][];
}

const GEO: Record<CityId, CityGeo> = {
  rome: {
    rivers: [
      [[12.443, 41.923], [12.456, 41.917], [12.4655, 41.909], [12.465, 41.903], [12.470, 41.8985], [12.478, 41.896], [12.477, 41.890], [12.471, 41.883], [12.463, 41.877]],
    ],
    parks: [
      [[12.477, 41.918], [12.489, 41.921], [12.499, 41.915], [12.493, 41.908], [12.481, 41.910]],
    ],
  },
  florence: {
    rivers: [
      [[11.237, 43.7715], [11.246, 43.769], [11.254, 43.7695], [11.261, 43.768], [11.267, 43.766], [11.273, 43.7655]],
    ],
    parks: [
      [[11.237, 43.775], [11.244, 43.779], [11.249, 43.776], [11.244, 43.772]],
      [[11.2465, 43.7645], [11.2525, 43.7655], [11.2535, 43.7598], [11.2475, 43.759]],
    ],
  },
  venice: {
    rivers: [],
    parks: [],
    lagoon: true,
    islands: [
      [[12.314, 45.4425], [12.323, 45.446], [12.333, 45.4445], [12.344, 45.442], [12.346, 45.437], [12.340, 45.4335], [12.330, 45.4328], [12.321, 45.4345], [12.315, 45.438]],
      [[12.319, 45.4308], [12.331, 45.4298], [12.339, 45.4282], [12.331, 45.4262], [12.320, 45.428]],
      [[12.348, 45.459], [12.356, 45.457], [12.356, 45.4525], [12.348, 45.4535]],
    ],
  },
  paris: {
    rivers: [
      [[2.283, 48.8535], [2.298, 48.8565], [2.312, 48.854], [2.326, 48.8533], [2.340, 48.8515], [2.352, 48.853], [2.362, 48.852], [2.373, 48.8545]],
    ],
    parks: [
      [[2.283, 48.876], [2.290, 48.887], [2.299, 48.882], [2.296, 48.868], [2.287, 48.866]],
      [[2.321, 48.8655], [2.328, 48.866], [2.328, 48.8625], [2.321, 48.862]],
      [[2.3335, 48.8485], [2.3405, 48.849], [2.3405, 48.8448], [2.3335, 48.8445]],
    ],
  },
  tokyo: {
    rivers: [
      [[139.789, 35.727], [139.7925, 35.714], [139.796, 35.701], [139.7915, 35.689], [139.7955, 35.676], [139.790, 35.660], [139.7945, 35.647]],
    ],
    parks: [
      [[139.691, 35.683], [139.701, 35.684], [139.703, 35.6755], [139.693, 35.674]],
      [[139.707, 35.6935], [139.716, 35.694], [139.7155, 35.688], [139.7075, 35.6875]],
      [[139.771, 35.721], [139.781, 35.722], [139.781, 35.7145], [139.772, 35.714]],
    ],
  },
  kyoto: {
    rivers: [
      [[135.767, 35.047], [135.7655, 35.033], [135.770, 35.019], [135.768, 35.003], [135.772, 34.989], [135.769, 34.973], [135.7735, 34.957]],
    ],
    parks: [
      [[135.7575, 35.029], [135.7645, 35.031], [135.7645, 35.0215], [135.7575, 35.0205]],
    ],
  },
  osaka: {
    rivers: [
      [[135.477, 34.706], [135.477, 34.7005], [135.492, 34.697], [135.506, 34.699], [135.521, 34.694], [135.537, 34.696]],
      [[135.5025, 34.711], [135.5015, 34.692], [135.504, 34.672], [135.5005, 34.650], [135.502, 34.643]],
    ],
    parks: [
      [[135.5195, 34.693], [135.5305, 34.693], [135.5305, 34.6845], [135.5205, 34.684]],
    ],
  },
};

/* ---------------- helpers ---------------- */

function toCoord(pair: [number, number]): Coord {
  return { lat: pair[1], lng: pair[0] };
}

function smoothPath(points: { x: number; y: number }[], closed = false): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;
  let d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    d += ` Q${points[i].x.toFixed(1)},${points[i].y.toFixed(1)} ${midX.toFixed(1)},${midY.toFixed(1)}`;
  }
  const last = points[points.length - 1];
  d += ` L${last.x.toFixed(1)},${last.y.toFixed(1)}`;
  return closed ? `${d} Z` : d;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedOf(city: CityId): number {
  return city.split('').reduce((s, c) => s + c.charCodeAt(0) * 7, 3);
}

/* ---------------- marker types ---------------- */

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  color: string;
  index?: number;
  kind: 'place' | 'stop';
}

interface MapCanvasProps {
  city: CityId;
  markers: MapMarker[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  route?: Coord[];
  routeKey?: string;
  dimOthers?: boolean;
  className?: string;
}

export function MapCanvas({ city, markers, selectedId, onSelect, route, routeKey = '', dimOthers = true, className = '' }: MapCanvasProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const bounds = CITY_BOUNDS[city];
  const geo = GEO[city];

  const proj = useMemo(() => {
    const pt = (c: Coord) => project(c, bounds, W, H);
    return pt;
  }, [bounds]);

  const base = useMemo(() => {
    const rnd = mulberry32(seedOf(city));
    const roads: string[] = [];
    if (!geo.lagoon) {
      for (let i = 0; i < 12; i += 1) {
        const y = 40 + (i * (H - 80)) / 11 + (rnd() - 0.5) * 26;
        const pts = Array.from({ length: 7 }, (_, j) => ({
          x: (j * W) / 6,
          y: y + (rnd() - 0.5) * 18,
        }));
        roads.push(smoothPath(pts));
      }
      for (let i = 0; i < 14; i += 1) {
        const x = 30 + (i * (W - 60)) / 13 + (rnd() - 0.5) * 22;
        const pts = Array.from({ length: 6 }, (_, j) => ({
          x: x + (rnd() - 0.5) * 16,
          y: (j * H) / 5,
        }));
        roads.push(smoothPath(pts));
      }
    }
    const rivers = geo.rivers.map((r) => smoothPath(r.map((p) => proj(toCoord(p)))));
    const parks = geo.parks.map((p) => smoothPath(p.map((c) => proj(toCoord(c))), true));
    const islands = geo.islands?.map((p) => smoothPath(p.map((c) => proj(toCoord(c))), true)) ?? [];
    return { roads, rivers, parks, islands };
  }, [city, geo, proj]);

  const routePts = useMemo(
    () => (route && route.length > 1 ? route.map((c) => proj(c)) : null),
    [route, proj],
  );

  const scaleInfo = useMemo(() => {
    const kmAcross = haversineKm({ lat: (bounds.n + bounds.s) / 2, lng: bounds.w }, { lat: (bounds.n + bounds.s) / 2, lng: bounds.e });
    const kmPer100 = (kmAcross / W) * 100;
    const nice = kmPer100 > 2 ? Math.round(kmPer100) : Math.round(kmPer100 * 2) / 2;
    return { km: nice, px: (100 / kmPer100) * nice };
  }, [bounds]);

  const cityMeta = CITIES[city];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className={`block h-full w-full select-none ${className}`}
      role="img"
      aria-label={`Stylized map of ${cityMeta.name} with ${markers.length} pinned places`}
    >
      {/* ground (oversized so letterbox bands read as paper) */}
      <rect x={-2000} y={-2000} width={W + 4000} height={H + 4000} fill={geo.lagoon ? '#B9CFC6' : '#EDEADF'} />
      <rect x={-2000} y={-2000} width={W + 4000} height={H + 4000} fill="url(#paperDots)" opacity="0.5" />
      <defs>
        <pattern id="paperDots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill={geo.lagoon ? '#9DB8AE' : '#DAD7C6'} />
        </pattern>
      </defs>

      {/* graticule */}
      <g stroke={geo.lagoon ? '#7FA396' : '#101B16'} strokeOpacity={geo.lagoon ? 0.25 : 0.07} strokeDasharray="1 7" strokeWidth="1.2">
        {[0.2, 0.4, 0.6, 0.8].map((f) => (
          <line key={`v${f}`} x1={W * f} y1={0} x2={W * f} y2={H} />
        ))}
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={`h${f}`} x1={0} y1={H * f} x2={W} y2={H * f} />
        ))}
      </g>

      {/* parks */}
      {base.parks.map((d, i) => (
        <path key={`park${i}`} d={d} fill={geo.lagoon ? '#A9C4B9' : '#D9E3CD'} stroke={geo.lagoon ? '#8FB0A3' : '#C3D2B4'} strokeWidth="1.5" />
      ))}

      {/* islands (Venice) */}
      {base.islands.map((d, i) => (
        <path key={`isle${i}`} d={d} fill="#E9E5D5" stroke="#D5D0BC" strokeWidth="2" />
      ))}

      {/* roads */}
      <g fill="none" stroke={geo.lagoon ? '#A9C4B9' : '#DFDBCA'} strokeWidth="2.4" strokeLinecap="round">
        {base.roads.map((d, i) => (
          <path key={`road${i}`} d={d} />
        ))}
      </g>

      {/* rivers */}
      <g fill="none" strokeLinecap="round">
        {base.rivers.map((d, i) => (
          <g key={`river${i}`}>
            <path d={d} stroke="#A9C6BE" strokeWidth="15" />
            <path d={d} stroke="#C2D9D2" strokeWidth="8" />
          </g>
        ))}
      </g>

      {/* coordinate ticks */}
      <g fontFamily="var(--font-mono)" fontSize="11" fill={geo.lagoon ? '#5E8274' : '#8A8778'}>
        <text x={14} y={22}>{bounds.n.toFixed(2)}°N</text>
        <text x={14} y={H - 12}>{bounds.s.toFixed(2)}°N</text>
        <text x={W - 78} y={H - 12}>{bounds.e.toFixed(2)}°E</text>
        <text x={W - 78} y={22}>{bounds.w.toFixed(2)}°E</text>
      </g>

      {/* city watermark */}
      <text
        x={W - 26}
        y={H - 40}
        textAnchor="end"
        fontFamily="var(--font-display)"
        fontStyle="italic"
        fontWeight="600"
        fontSize="92"
        fill={geo.lagoon ? '#41685B' : '#1C3830'}
        opacity={geo.lagoon ? 0.3 : 0.1}
      >
        {cityMeta.name}
      </text>

      {/* compass */}
      <g transform={`translate(${W - 52}, 58)`} opacity="0.85">
        <circle r="22" fill="none" stroke={geo.lagoon ? '#41685B' : '#40604E'} strokeWidth="1.4" />
        <path d="M0,-15 L5,6 L0,2 L-5,6 Z" fill="var(--color-persimmon)" />
        <text y="-30" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fontWeight="bold" fill={geo.lagoon ? '#41685B' : '#40604E'}>
          N
        </text>
      </g>

      {/* scale bar */}
      <g transform={`translate(26, ${H - 44})`}>
        <line x1="0" y1="0" x2={scaleInfo.px} y2="0" stroke={geo.lagoon ? '#41685B' : '#40604E'} strokeWidth="2.5" />
        <line x1="0" y1="-5" x2="0" y2="5" stroke={geo.lagoon ? '#41685B' : '#40604E'} strokeWidth="2" />
        <line x1={scaleInfo.px} y1="-5" x2={scaleInfo.px} y2="5" stroke={geo.lagoon ? '#41685B' : '#40604E'} strokeWidth="2" />
        <text x={scaleInfo.px + 10} y="4" fontFamily="var(--font-mono)" fontSize="12" fontWeight="bold" fill={geo.lagoon ? '#41685B' : '#40604E'}>
          {scaleInfo.km} km
        </text>
      </g>

      {/* route */}
      {routePts && (
        <g key={routeKey}>
          <path d={smoothPath(routePts)} pathLength={1} fill="none" stroke="#FAF9F2" strokeWidth="7" strokeLinecap="round" opacity="0.85" className="route-draw" />
          <path
            d={smoothPath(routePts)}
            fill="none"
            stroke="var(--color-persimmon)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeDasharray="8 8"
            className="route-ants"
          />
          <circle cx={routePts[0].x} cy={routePts[0].y} r="7" fill="var(--color-pine)" stroke="#FAF9F2" strokeWidth="2.5" />
        </g>
      )}

      {/* markers */}
      {markers.map((m) => {
        const { x, y } = proj({ lat: m.lat, lng: m.lng });
        const isSelected = selectedId === m.id;
        const isHovered = hovered === m.id;
        const dimmed = dimOthers && selectedId !== null && selectedId !== undefined && !isSelected;
        const scale = isSelected ? 1.25 : isHovered ? 1.12 : 1;
        const labelW = m.label.length * 6.4 + 22;
        return (
          <g
            key={m.id}
            transform={`translate(${x.toFixed(1)}, ${y.toFixed(1)})`}
            className="cursor-pointer"
            opacity={dimmed ? 0.45 : 1}
            style={{ transition: 'opacity 250ms ease' }}
            onMouseEnter={() => setHovered(m.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect?.(m.id)}
          >
            {isSelected && <circle r="16" fill={m.color} opacity="0.4" className="pulse-ring" />}
            <g transform={`scale(${scale})`} style={{ transition: 'transform 200ms cubic-bezier(0.2,0.7,0.2,1)' }}>
              {m.kind === 'place' ? (
                <>
                  <path d="M0,4 C-8,-6 -11,-10 -11,-16 A11,11 0 1 1 11,-16 C11,-10 8,-6 0,4 Z" fill={m.color} stroke="#FAF9F2" strokeWidth="2.4" transform="translate(0,10)" />
                  <circle cy="-6" r="3.6" fill="#FAF9F2" />
                </>
              ) : (
                <>
                  <circle r="13" fill={m.color} stroke="#FAF9F2" strokeWidth="3" />
                  <text y="4.5" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fontWeight="bold" fill="#FAF9F2">
                    {m.index ?? ''}
                  </text>
                </>
              )}
            </g>
            {(isHovered || isSelected) && (
              <g transform={`translate(0, ${m.kind === 'place' ? -34 : -30})`} className="pointer-events-none">
                <rect x={-labelW / 2} y={-15} width={labelW} height={21} rx={5} fill="var(--color-ink)" opacity="0.92" />
                <text y={0} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fontWeight="bold" fill="var(--color-chalk)">
                  {m.label}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
