// Pastel color palette for chart lines
export const PASTEL_COLORS = [
  '#FFB3BA', // light pink
  '#BAFFC9', // light green
  '#BAE1FF', // light blue
  '#FFFFBA', // light yellow
  '#FFDFba', // light peach
  '#E0BBE4', // light purple
  '#957DAD', // muted purple
  '#D4A5A5', // dusty rose
  '#A8E6CF', // mint
  '#DCEDC1', // light sage
];

export function getColorForIndex(index: number): string {
  return PASTEL_COLORS[index % PASTEL_COLORS.length];
}

