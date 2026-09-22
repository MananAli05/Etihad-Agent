import React, { useRef, useState } from 'react';
import { BRAND, GRID, INK_MUTED } from './tokens';

const H = 150;
const PAD_T = 12;
const PAD_B = 22;
const PAD_L = 26;

/**
 * Leads created per day, as an area with a crosshair.
 *
 * One measure on one axis. Counts are whole numbers, so the y ticks are too -
 * a "2.5 leads" gridline would be nonsense.
 */
export default function TrendArea({ data }) {
  const wrap = useRef(null);
  const [hover, setHover] = useState(null);
  const [width, setWidth] = useState(600);

  React.useEffect(() => {
    if (!wrap.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);

  const plotW = Math.max(120, width - PAD_L - 8);
  const plotH = H - PAD_T - PAD_B;
  const max = Math.max(1, ...data.map((d) => d.count));
  // Whole-number ticks only.
  const ticks = max <= 4 ? Array.from({ length: max + 1 }, (_, i) => i) : [0, Math.round(max / 2), max];

  const x = (i) => PAD_L + (data.length <= 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
  const y = (v) => PAD_T + plotH - (v / max) * plotH;

  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.count)}`).join(' ');
  const area = `${line} L ${x(data.length - 1)} ${PAD_T + plotH} L ${x(0)} ${PAD_T + plotH} Z`;

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = e.clientX - rect.left - PAD_L;
    const i = Math.round((rel / plotW) * (data.length - 1));
    setHover(i >= 0 && i < data.length ? i : null);
  };

  return (
    <div ref={wrap} className="relative">
      <svg
        width="100%"
        height={H}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label="Leads created per day over the last 30 days"
      >
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND} stopOpacity="0.16" />
            <stop offset="100%" stopColor={BRAND} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Solid hairline grid, one shade off the surface. */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD_L} x2={PAD_L + plotW} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
            <text
              x={PAD_L - 6}
              y={y(t)}
              textAnchor="end"
              dominantBaseline="middle"
              className="text-[9px] tabular-nums"
              fill={INK_MUTED}
            >
              {t}
            </text>
          </g>
        ))}

        <path d={area} fill="url(#trendFill)" />
        <path d={line} fill="none" stroke={BRAND} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {hover !== null && (
          <>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD_T}
              y2={PAD_T + plotH}
              stroke={BRAND}
              strokeWidth="1"
              opacity="0.35"
            />
            {/* 2px surface ring so the marker reads over the line. */}
            <circle cx={x(hover)} cy={y(data[hover].count)} r="4.5" fill={BRAND} stroke="#ffffff" strokeWidth="2" />
          </>
        )}

        {/* Only the ends are labelled; the tooltip carries the rest. */}
        <text x={PAD_L} y={H - 6} className="text-[9px]" fill={INK_MUTED}>
          {data[0]?.label}
        </text>
        <text x={PAD_L + plotW} y={H - 6} textAnchor="end" className="text-[9px]" fill={INK_MUTED}>
          {data[data.length - 1]?.label}
        </text>
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-white shadow-lg whitespace-nowrap"
          style={{ left: x(hover), top: y(data[hover].count) - 8, backgroundColor: '#252323' }}
        >
          {data[hover].label}: {data[hover].count} {data[hover].count === 1 ? 'lead' : 'leads'}
        </div>
      )}
    </div>
  );
}
