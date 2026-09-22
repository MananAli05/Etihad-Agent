import React, { useEffect, useRef, useState } from 'react';
import { BRAND, GRID, INK, INK_MUTED } from './tokens';

const ROW = 34;
const BAR = 14;
const LABEL_W = 100;
const VALUE_W = 62;

/**
 * Horizontal bars for the lead pipeline.
 *
 * Stages are ordered and the only measure is a count, so every bar wears the
 * same hue: shading bars by their own length would spend the colour channel
 * repeating what the length already says.
 *
 * Widths are measured rather than expressed as percentages - an SVG rect's
 * width attribute takes a length, not a CSS calc(), so a percentage-based
 * layout silently collapses.
 */
export default function PipelineBars({ data, total }) {
  const wrap = useRef(null);
  const [width, setWidth] = useState(520);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    if (!wrap.current) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);

  const trackW = Math.max(60, width - LABEL_W - VALUE_W);
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div ref={wrap} className="relative">
      <svg width="100%" height={data.length * ROW + 6} role="img" aria-label="Lead count by pipeline stage">
        {data.map((d, i) => {
          const y = i * ROW + 5;
          const isHot = hover === i;
          const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;

          return (
            <g key={d.status} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              {/* Hit target, deliberately taller than the 14px bar. */}
              <rect x={0} y={y - 5} width={Math.max(width, 1)} height={ROW} fill="transparent" />

              <text
                x={0}
                y={y + BAR / 2}
                dominantBaseline="middle"
                fontSize="11"
                fontWeight="500"
                fill={isHot ? BRAND : INK_MUTED}
              >
                {d.status}
              </text>

              <rect x={LABEL_W} y={y} width={trackW} height={BAR} rx="4" fill={GRID} />

              {d.count > 0 && (
                <rect
                  x={LABEL_W}
                  y={y}
                  width={Math.max(4, (d.count / max) * trackW)}
                  height={BAR}
                  rx="4"
                  fill={BRAND}
                  opacity={isHot ? 1 : 0.9}
                />
              )}

              <text
                x={LABEL_W + trackW + VALUE_W - 4}
                y={y + BAR / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="11"
                fontWeight="600"
                fill={d.count > 0 ? INK : INK_MUTED}
              >
                {d.count}
                <tspan fill={INK_MUTED} fontWeight="400">{`  ${pct}%`}</tspan>
              </text>
            </g>
          );
        })}
      </svg>

      {hover !== null && data[hover].count > 0 && (
        <div
          className="pointer-events-none absolute -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-white shadow-lg whitespace-nowrap"
          style={{ top: hover * ROW + 12, left: LABEL_W + 8, backgroundColor: '#252323' }}
        >
          {data[hover].status}: {data[hover].count} of {total}
        </div>
      )}
    </div>
  );
}
