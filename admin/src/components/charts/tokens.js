/**
 * Chart tokens.
 *
 * The categorical slots are the validated default palette from the dataviz
 * method, in their documented order - that ordering is the colourblind-safety
 * mechanism, not decoration, so slots are assigned by fixed index and never
 * cycled or re-sorted by value.
 *
 * Verified against the white card surface with the palette validator:
 * lightness band, chroma floor, CVD separation (worst adjacent dE 9.1) and
 * normal-vision floor (worst adjacent dE 19.6) all pass. Contrast warns for
 * aqua, yellow and magenta, which obliges visible labels - every chart using
 * these ships a legend carrying the count and share in text.
 */

// Fixed order. Slot i always belongs to the same source, whatever the counts.
export const CATEGORICAL = [
  '#2a78d6', // blue
  '#eb6834', // orange
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#e87ba4', // magenta
  '#008300', // green
];

// Single-series marks wear the brand colour: one measure, one hue, no identity
// to encode.
export const BRAND = '#651F2B';
export const BRAND_SOFT = 'rgba(101, 31, 43, 0.10)';

export const SURFACE = '#ffffff';
export const GRID = '#EFEDE9';
export const INK = '#252323';
export const INK_MUTED = '#8A8783';

// Marks sit 2px off each other against the surface rather than being outlined.
export const MARK_GAP = 2;

export const fmtPct = (n) => `${Math.round(n)}%`;

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
