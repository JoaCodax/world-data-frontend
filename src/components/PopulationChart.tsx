import { useMemo, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type TooltipModel,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getColorForCode } from '../utils/colors';

// Store chart instance reference for clearing hover state on touch end
let activeChartInstance: ChartJS<'line'> | null = null;

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Extend dataset to include country code
interface ExtendedDataset {
  label: string;
  countryCode: string;
  data: (number | null)[];
  borderColor: string;
  backgroundColor: string;
  borderWidth: number;
  pointRadius: number;
  pointHoverRadius: number;
  tension: number;
  spanGaps: boolean;
}

// Get or create tooltip element
function getOrCreateTooltip(): HTMLDivElement {
  let tooltipEl = document.getElementById('population-chart-tooltip') as HTMLDivElement | null;

  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'population-chart-tooltip';
    tooltipEl.style.cssText = `
      background: rgba(255, 255, 255, 0.98);
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px 14px;
      pointer-events: none;
      position: fixed;
      transition: opacity 0.1s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      min-width: 200px;
      opacity: 0;
    `;
    document.body.appendChild(tooltipEl);
  }

  return tooltipEl;
}

// ISO alpha-3 to alpha-2 country code mapping
const alpha3ToAlpha2: Record<string, string> = {
  ABW: 'aw', AFG: 'af', AGO: 'ao', ALB: 'al', AND: 'ad', ARE: 'ae', ARG: 'ar',
  ARM: 'am', ASM: 'as', ATG: 'ag', AUS: 'au', AUT: 'at', AZE: 'az', BDI: 'bi',
  BEL: 'be', BEN: 'bj', BFA: 'bf', BGD: 'bd', BGR: 'bg', BHR: 'bh', BHS: 'bs',
  BIH: 'ba', BLR: 'by', BLZ: 'bz', BMU: 'bm', BOL: 'bo', BRA: 'br', BRB: 'bb',
  BRN: 'bn', BTN: 'bt', BWA: 'bw', CAF: 'cf', CAN: 'ca', CHE: 'ch', CHL: 'cl',
  CHN: 'cn', CIV: 'ci', CMR: 'cm', COD: 'cd', COG: 'cg', COL: 'co', COM: 'km',
  CPV: 'cv', CRI: 'cr', CUB: 'cu', CUW: 'cw', CYM: 'ky', CYP: 'cy', CZE: 'cz',
  DEU: 'de', DJI: 'dj', DMA: 'dm', DNK: 'dk', DOM: 'do', DZA: 'dz', ECU: 'ec',
  EGY: 'eg', ERI: 'er', ESP: 'es', EST: 'ee', ETH: 'et', FIN: 'fi', FJI: 'fj',
  FRA: 'fr', FRO: 'fo', FSM: 'fm', GAB: 'ga', GBR: 'gb', GEO: 'ge', GHA: 'gh',
  GIB: 'gi', GIN: 'gn', GMB: 'gm', GNB: 'gw', GNQ: 'gq', GRC: 'gr', GRD: 'gd',
  GRL: 'gl', GTM: 'gt', GUM: 'gu', GUY: 'gy', HKG: 'hk', HND: 'hn', HRV: 'hr',
  HTI: 'ht', HUN: 'hu', IDN: 'id', IMN: 'im', IND: 'in', IRL: 'ie', IRN: 'ir',
  IRQ: 'iq', ISL: 'is', ISR: 'il', ITA: 'it', JAM: 'jm', JOR: 'jo', JPN: 'jp',
  KAZ: 'kz', KEN: 'ke', KGZ: 'kg', KHM: 'kh', KIR: 'ki', KNA: 'kn', KOR: 'kr',
  KWT: 'kw', LAO: 'la', LBN: 'lb', LBR: 'lr', LBY: 'ly', LCA: 'lc', LIE: 'li',
  LKA: 'lk', LSO: 'ls', LTU: 'lt', LUX: 'lu', LVA: 'lv', MAC: 'mo', MAR: 'ma',
  MCO: 'mc', MDA: 'md', MDG: 'mg', MDV: 'mv', MEX: 'mx', MHL: 'mh', MKD: 'mk',
  MLI: 'ml', MLT: 'mt', MMR: 'mm', MNE: 'me', MNG: 'mn', MNP: 'mp', MOZ: 'mz',
  MRT: 'mr', MUS: 'mu', MWI: 'mw', MYS: 'my', NAM: 'na', NCL: 'nc', NER: 'ne',
  NGA: 'ng', NIC: 'ni', NLD: 'nl', NOR: 'no', NPL: 'np', NRU: 'nr', NZL: 'nz',
  OMN: 'om', PAK: 'pk', PAN: 'pa', PER: 'pe', PHL: 'ph', PLW: 'pw', PNG: 'pg',
  POL: 'pl', PRI: 'pr', PRK: 'kp', PRT: 'pt', PRY: 'py', PSE: 'ps', PYF: 'pf',
  QAT: 'qa', ROU: 'ro', RUS: 'ru', RWA: 'rw', SAU: 'sa', SDN: 'sd', SEN: 'sn',
  SGP: 'sg', SLB: 'sb', SLE: 'sl', SLV: 'sv', SMR: 'sm', SOM: 'so', SRB: 'rs',
  SSD: 'ss', STP: 'st', SUR: 'sr', SVK: 'sk', SVN: 'si', SWE: 'se', SWZ: 'sz',
  SXM: 'sx', SYC: 'sc', SYR: 'sy', TCA: 'tc', TCD: 'td', TGO: 'tg', THA: 'th',
  TJK: 'tj', TKM: 'tm', TLS: 'tl', TON: 'to', TTO: 'tt', TUN: 'tn', TUR: 'tr',
  TUV: 'tv', TWN: 'tw', TZA: 'tz', UGA: 'ug', UKR: 'ua', URY: 'uy', USA: 'us',
  UZB: 'uz', VCT: 'vc', VEN: 've', VGB: 'vg', VIR: 'vi', VNM: 'vn', VUT: 'vu',
  WSM: 'ws', XKX: 'xk', YEM: 'ye', ZAF: 'za', ZMB: 'zm', ZWE: 'zw',
};

// Get flag URL using flagcdn.com (requires alpha-2 codes)
function getFlagUrl(countryCode: string): string {
  const alpha2 = alpha3ToAlpha2[countryCode.toUpperCase()];
  if (alpha2) {
    return `https://flagcdn.com/w40/${alpha2}.png`;
  }
  // Fallback: return empty for unknown codes
  return '';
}

// Track current pointer position (mouse or touch)
let pointerX = 0;
let pointerY = 0;
let isTouchActiveOnChart = false;

// Check if an element is part of the population chart
function isChartElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof Element)) return false;
  // Check if the target is a canvas inside our chart container
  const chartContainer = target.closest('[data-population-chart]');
  return chartContainer !== null || target.tagName === 'CANVAS' && target.closest('.h-\\[400px\\]') !== null;
}

// Update pointer position on mouse move
document.addEventListener('mousemove', (e) => {
  pointerX = e.clientX;
  pointerY = e.clientY;
});

// Update pointer position on touch move (mobile) - only if touch started on chart
document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0 && isTouchActiveOnChart) {
    pointerX = e.touches[0].clientX;
    pointerY = e.touches[0].clientY;
  }
}, { passive: true });

// Update pointer position on touch start (mobile) - only for chart touches
document.addEventListener('touchstart', (e) => {
  if (e.touches.length > 0 && isChartElement(e.target)) {
    isTouchActiveOnChart = true;
    pointerX = e.touches[0].clientX;
    pointerY = e.touches[0].clientY;
  }
}, { passive: true });

// Clear chart hover state (removes hover points from lines)
function clearChartHoverState() {
  if (activeChartInstance) {
    activeChartInstance.setActiveElements([]);
    activeChartInstance.tooltip?.setActiveElements([], { x: 0, y: 0 });
    activeChartInstance.update('none');
  }
}

// Hide tooltip on touch end (mobile) - when finger is lifted
document.addEventListener('touchend', () => {
  isTouchActiveOnChart = false;
  const tooltipEl = document.getElementById('population-chart-tooltip') as HTMLDivElement | null;
  if (tooltipEl) {
    tooltipEl.style.opacity = '0';
  }
  // Also clear hover points on the chart
  clearChartHoverState();
}, { passive: true });

// Also hide on touch cancel
document.addEventListener('touchcancel', () => {
  isTouchActiveOnChart = false;
  const tooltipEl = document.getElementById('population-chart-tooltip') as HTMLDivElement | null;
  if (tooltipEl) {
    tooltipEl.style.opacity = '0';
  }
  // Also clear hover points on the chart
  clearChartHoverState();
}, { passive: true });

// Check if device supports touch
const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// External tooltip handler
function externalTooltipHandler(context: { chart: ChartJS; tooltip: TooltipModel<'line'> }) {
  const { tooltip } = context;
  const tooltipEl = getOrCreateTooltip();

  // Hide if no tooltip or if on touch device and touch is not active on chart
  if (tooltip.opacity === 0 || (isTouchDevice() && !isTouchActiveOnChart)) {
    tooltipEl.style.opacity = '0';
    return;
  }

  // Set tooltip content
  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const dataPoints = tooltip.dataPoints || [];

    let innerHtml = '';

    // Title (year)
    if (titleLines.length > 0) {
      innerHtml += `<div style="font-weight: 600; color: #1a1a2e; margin-bottom: 8px; font-size: 13px;">${titleLines[0]}</div>`;
    }

    // Data rows with flags (max 10 items)
    const maxItems = 10;
    const visibleDataPoints = dataPoints.slice(0, maxItems);
    
    visibleDataPoints.forEach((dataPoint) => {
      const dataset = dataPoint.dataset as unknown as ExtendedDataset;
      const countryCode = dataset.countryCode || '';
      const countryName = dataset.label || '';
      const value = dataPoint.parsed.y;

      if (value === null) return;

      let formatted: string;
      if (value >= 1_000_000_000) {
        formatted = `${(value / 1_000_000_000).toFixed(2)}B`;
      } else if (value >= 1_000_000) {
        formatted = `${(value / 1_000_000).toFixed(1)}M`;
      } else {
        formatted = value.toLocaleString();
      }

      const flagUrl = getFlagUrl(countryCode);
      const flagHtml = flagUrl 
        ? `<img src="${flagUrl}" alt="" style="width: 24px; height: 16px; border-radius: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); object-fit: cover; flex-shrink: 0;" onerror="this.style.display='none'" />`
        : `<div style="width: 24px; height: 16px; border-radius: 2px; background: #e5e7eb; flex-shrink: 0;"></div>`;

      innerHtml += `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 0; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            ${flagHtml}
            <span style="color: #374151; font-size: 13px;">${countryName}</span>
          </div>
          <span style="color: #1a1a2e; font-weight: 600; font-size: 13px; white-space: nowrap;">${formatted}</span>
        </div>
      `;
    });

    tooltipEl.innerHTML = innerHtml;
  }

  // Position tooltip following pointer with offset
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const margin = 10; // Minimum margin from viewport edges
  
  // For touch devices, use smaller offset to position tooltip above finger
  const isMobile = isTouchDevice();
  const offsetX = isMobile ? 10 : 15;
  const offsetY = isMobile ? -10 : 15; // Negative to position above finger on mobile
  
  // Make tooltip visible temporarily to measure its dimensions
  tooltipEl.style.visibility = 'hidden';
  tooltipEl.style.opacity = '1';
  
  // Force reflow to get accurate dimensions
  const tooltipWidth = tooltipEl.offsetWidth;
  const tooltipHeight = tooltipEl.offsetHeight;
  
  // Calculate initial position
  let left = pointerX + offsetX;
  let top = isMobile ? pointerY - tooltipHeight + offsetY : pointerY + offsetY;
  
  // Ensure tooltip stays within viewport horizontally
  if (left + tooltipWidth > viewportWidth - margin) {
    // Try positioning to the left of pointer
    left = pointerX - tooltipWidth - offsetX;
  }
  // If still overflowing left, clamp to left edge
  if (left < margin) {
    left = margin;
  }
  // Final check: if tooltip is wider than viewport, align to left
  if (tooltipWidth > viewportWidth - margin * 2) {
    left = margin;
  }
  
  // Ensure tooltip stays within viewport vertically
  if (top + tooltipHeight > viewportHeight - margin) {
    // Position above pointer
    top = pointerY - tooltipHeight - Math.abs(offsetY);
  }
  // If still overflowing top, clamp to top edge
  if (top < margin) {
    top = margin;
  }
  // Final check: if tooltip is taller than viewport, align to top
  if (tooltipHeight > viewportHeight - margin * 2) {
    top = margin;
  }
  
  tooltipEl.style.visibility = 'visible';
  tooltipEl.style.left = left + 'px';
  tooltipEl.style.top = top + 'px';
}

interface SeriesData {
  code: string;
  name: string;
  data: [number, number][]; // [year, population][]
}

interface PopulationChartProps {
  data: SeriesData[];
  yearRange: [number, number];
}

export function PopulationChart({ data, yearRange }: PopulationChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);
  
  // Store chart reference globally for touch end handler
  useEffect(() => {
    if (chartRef.current) {
      activeChartInstance = chartRef.current;
    }
    return () => {
      if (activeChartInstance === chartRef.current) {
        activeChartInstance = null;
      }
    };
  }, []);

  const chartData = useMemo(() => {
    // Generate labels for all years in range
    const labels: string[] = [];
    if (!yearRange) return { labels, datasets: [] };
    for (let year = yearRange[0]; year <= yearRange[1]; year++) {
      labels.push(year.toString());
    }

    const datasets = data.map((series): ExtendedDataset => {
      // Create map of year to population
      const popByYear = new Map(series.data.map(([y, p]) => [y, p]));

      // Fill in data for each year
      const values = labels.map(yearStr => popByYear.get(parseInt(yearStr)) ?? null);

      const color = getColorForCode(series.code);

      return {
        label: series.name,
        countryCode: series.code,
        data: values,
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        tension: 0.3,
        spanGaps: true,
      };
    });

    return { labels, datasets };
  }, [data, yearRange]);

  const yAxisBounds = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 100_000_000 };
    
    let minVal = Infinity;
    let maxVal = -Infinity;
    
    for (const series of data) {
      for (const [, pop] of series.data) {
        minVal = Math.min(minVal, pop);
        maxVal = Math.max(maxVal, pop);
      }
    }
    
    if (minVal === Infinity) return { min: 0, max: 100_000_000 };
    
    const range = maxVal - minVal;
    const paddedMin = Math.max(0, minVal - range * 0.05);
    const paddedMax = maxVal + range * 0.05;
    
    return { min: paddedMin, max: paddedMax };
  }, [data]);

  const options: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false,
        external: externalTooltipHandler,
      },
      datalabels: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', maxTicksLimit: 12 },
      },
      y: {
        min: yAxisBounds.min,
        max: yAxisBounds.max,
        grid: { color: '#f3f4f6' },
        border: { display: false },
        ticks: {
          color: '#9ca3af',
          callback: (value) => {
            if (typeof value !== 'number') return value;
            if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
            if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
            return value.toLocaleString();
          },
        },
      },
    },
  }), [yAxisBounds]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>Select countries from the list to view population data</p>
      </div>
    );
  }

  return (
    <div data-population-chart className="h-full w-full">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
