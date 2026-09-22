import React, { useState } from 'react';
import { CATEGORICAL, GRID, INK_MUTED, SURFACE } from './tokens';

const SIZE = 168;
const THICK = 26;
const R = (SIZE - THICK) / 2;
const C = SIZE / 2;
// Segments are separated by a gap of surface, not by an outline.
const GAP_DEG = 2;

function arc(startDeg, endDeg) {
  const sweep = endDeg - startDeg;
  const toXY = (deg) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [C + R * Math.cos(rad), C + R * Math.sin(rad)];
  };
  const [x1, y1] = toXY(startDeg);
  const [x2, y2] = toXY(endDeg);
  return `M ${x1} ${y1} A ${R} ${R} 0 ${sweep > 180 ? 1 : 0} 1 ${x2} ${y2}`;
}

/**
 * Lead sources as a donut.
 *
 * Only sources with leads are drawn - an arc of zero is not a category the
 * reader needs to see. The legend beside it carries every source with its
 * count and share in text, which is also the relief the palette's contrast
 * warning requires: identity never rests on colour alone.
 */
export default function SourceDonut({ data, total }) {
  const [hover, setHover] = useState(null);

  // Keep each source's palette slot fixed by its position in the source list,
  // so filtering or a change in ranking never repaints the others.
  const present = data
    .map((d, i) => ({ ...d, color: CATEGORICAL[i % CATEGORICAL.length] }))
    .filter((d) => d.count > 0);

  let cursor = 0;
  const segments = present.map((d) => {
    const share = d.count / total;
    const span = share * 360;
    const seg = { ...d, start: cursor, end: cursor + span, share };
    cursor += span;
    return seg;
  });

  const active = hover !== null ? segments.find((s) => s.key === hover) : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} role="img" aria-label="Lead share by source">
          <circle cx={C} cy={C} r={R} fill="none" stroke={GRID} strokeWidth={THICK} />

          {segments.map((s) => {
            const dim = hover !== null && hover !== s.key;
            const shared = {
              stroke: s.color,
              strokeWidth: THICK,
              fill: 'none',
              opacity: dim ? 0.3 : 1,
              onMouseEnter: () => setHover(s.key),
              onMouseLeave: () => setHover(null),
              style: { transition: 'opacity 120ms' }
            };

            // A lone source covers the whole ring, and an arc whose start and
            // end land on the same point draws nothing at all. Use a circle.
            if (segments.length === 1) {
              return <circle key={s.key} cx={C} cy={C} r={R} {...shared} />;
            }

            return (
              <path
                key={s.key}
                d={arc(s.start + GAP_DEG / 2, Math.max(s.start + GAP_DEG / 2, s.end - GAP_DEG / 2))}
                strokeLinecap="butt"
                {...shared}
              />
            );
          })}
        </svg>

        {/* The centre carries the headline rather than repeating a label. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold tabular-nums text-charcoal">
            {active ? active.count : total}
          </span>
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
            {active ? active.name : 'Total'}
          </span>
        </div>
      </div>

      {/* Legend doubles as the table view: every source, count and share. */}
      <ul className="w-full space-y-1.5">
        {data.map((d, i) => {
          const color = CATEGORICAL[i % CATEGORICAL.length];
          const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
          const muted = d.count === 0;
          return (
            <li
              key={d.key}
              className={`flex items-center gap-2.5 text-[11px] ${muted ? 'opacity-45' : ''}`}
              onMouseEnter={() => !muted && setHover(d.key)}
              onMouseLeave={() => setHover(null)}
            >
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: muted ? GRID : color }}
              />
              <span className="font-medium text-charcoal flex-1 truncate">{d.name}</span>
              <span className="tabular-nums font-semibold text-charcoal">{d.count}</span>
              <span className="tabular-nums text-gray-400 w-9 text-right">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
