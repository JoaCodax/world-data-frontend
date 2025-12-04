// Vibrant pastel palette - rich soft tones with good saturation
// Distinct hues that pop while staying pleasant
const COLORS = [
  '#FF7B7B', // coral red
  '#5CD6C0', // teal mint
  '#B57BFF', // bright purple
  '#FFB347', // tangerine
  '#7BA3FF', // cornflower blue
  '#7BFF9E', // spring green
  '#FF7BCF', // hot pink
  '#C5FF7B', // lime
  '#7BFFD4', // turquoise
  '#D47BFF', // violet
  '#FFD747', // golden yellow
  '#7BD4FF', // sky blue
  '#9EFF7B', // chartreuse
  '#FF7BA3', // rose pink
  '#7B7BFF', // periwinkle
  '#FF9E7B', // salmon
  '#7BFFB3', // seafoam
  '#CF7BFF', // orchid
  '#7BFFF0', // aqua
  '#FF7BFF', // magenta
  '#B3FF7B', // yellow-green
  '#7BB3FF', // azure
  '#FF7BB3', // bubblegum
  '#A37BFF', // iris
  '#7BFFCF', // mint
  '#FFE87B', // canary
  '#9E7BFF', // lavender
  '#FFCF7B', // apricot
  '#7BCFFF', // baby blue
  '#7BFFA3', // mint green
];

// Generate a deterministic but well-distributed index for a string
function getDistributedIndex(str: string, arrayLength: number): number {
  // Use a simple hash
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);
  
  // Use golden ratio to spread colors more evenly
  const goldenRatio = 0.618033988749895;
  const spread = Math.floor((hash * goldenRatio * arrayLength) % arrayLength);
  return spread;
}

// Track assigned colors for maximum distinction
const assignedColors = new Map<string, string>();

// Get stable color for a country code
export function getColorForCode(code: string): string {
  if (assignedColors.has(code)) {
    return assignedColors.get(code)!;
  }
  
  // Assign colors in order for first selections (maximizes distinction)
  // Fall back to hash-based for consistency across sessions
  const color = COLORS[getDistributedIndex(code, COLORS.length)];
  assignedColors.set(code, color);
  return color;
}

// Reset color assignments (useful when clearing all selections)
export function resetColorAssignments(): void {
  assignedColors.clear();
}
