import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getColorForCode } from '../utils/colors';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartData {
  code: string;
  name: string;
  population: number;
}

interface BarChartProps {
  data: BarChartData[];
  year: number;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// Helper to get a stable key for the current country set
function getCountrySetKey(codes: string[]): string {
  return [...codes].sort().join(',');
}

export function BarChart({ data, year }: BarChartProps) {
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS<'bar'> | null>(null);
  
  // Store the stable order of country codes
  const stableOrderRef = useRef<string[]>([]);
  const countrySetKeyRef = useRef<string>('');
  
  // Determine the display count based on screen size
  const displayCount = isMobile ? 8 : 15;

  // Compute display data with stable ordering
  const getDisplayData = useCallback(() => {
    const dataMap = new Map(data.map(d => [d.code, d]));
    const currentCodes = data.map(d => d.code);
    const currentKey = getCountrySetKey(currentCodes);
    
    // Only recalculate order when the country set changes
    if (currentKey !== countrySetKeyRef.current || stableOrderRef.current.length === 0) {
      const sorted = [...data].sort((a, b) => b.population - a.population);
      stableOrderRef.current = sorted.slice(0, displayCount).map(d => d.code);
      countrySetKeyRef.current = currentKey;
    }
    
    // Filter to only include codes that are still in the data
    const validCodes = stableOrderRef.current.filter(code => dataMap.has(code));
    
    // Build display data in stable order
    return validCodes
      .map(code => dataMap.get(code)!)
      .slice(0, displayCount);
  }, [data, displayCount]);

  const getOptions = useCallback((): ChartOptions<'bar'> => ({
    indexAxis: isMobile ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed[isMobile ? 'x' : 'y'];
            if (value === null || value === undefined) return '';
            let formatted: string;
            if (value >= 1_000_000_000) {
              formatted = `${(value / 1_000_000_000).toFixed(2)}B`;
            } else if (value >= 1_000_000) {
              formatted = `${(value / 1_000_000).toFixed(1)}M`;
            } else {
              formatted = value.toLocaleString();
            }
            return `Population: ${formatted}`;
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 8,
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 11 },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 6,
      },
      datalabels: {
        display: false,
        anchor: isMobile ? 'start' : 'end',
        align: isMobile ? 'right' : 'top',
        offset: isMobile ? 4 : 4,
        color: '#374151',
        font: {
          weight: 'bold' as const,
          size: 10,
        },
        formatter: (value: number) => {
          let formatted: string;
          if (value >= 1_000_000_000) {
            formatted = `${(value / 1_000_000_000).toFixed(2)}B`;
          } else if (value >= 1_000_000) {
            formatted = `${(value / 1_000_000).toFixed(1)}M`;
          } else {
            formatted = value.toLocaleString();
          }
          return formatted;
        },
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const meta = chart.getDatasetMeta(0);
          const dataIndex = context.dataIndex;
          const backgroundColor = meta.data[dataIndex].options.backgroundColor;
          return backgroundColor || '#ffffff';
        },
        borderColor: '#ffffff',
        borderRadius: 4,
        borderWidth: 1,
        padding: {
          top: 3,
          bottom: 3,
          left: 5,
          right: 5,
        },
      },
    },
    scales: {
      x: {
        grid: { display: isMobile },
        border: { display: false },
        ticks: {
          color: '#9ca3af',
          maxRotation: isMobile ? 0 : 45,
          minRotation: isMobile ? 0 : 45,
          callback: function(value) {
            if (isMobile) {
              const numValue = typeof value === 'number' ? value : parseFloat(value as string);
              if (numValue >= 1_000_000_000) return `${(numValue / 1_000_000_000).toFixed(1)}B`;
              if (numValue >= 1_000_000) return `${(numValue / 1_000_000).toFixed(0)}M`;
              return numValue.toLocaleString();
            }
            const label = this.getLabelForValue(value as number);
            return label.length > 12 ? label.slice(0, 12) + '...' : label;
          },
        },
      },
      y: {
        grid: { display: !isMobile, color: '#f3f4f6' },
        border: { display: false },
        ticks: {
          color: '#9ca3af',
          callback: function(value) {
            if (isMobile) {
              const label = this.getLabelForValue(value as number);
              return label.length > 15 ? label.slice(0, 15) + '...' : label;
            }
            const numValue = typeof value === 'number' ? value : parseFloat(value as string);
            if (numValue >= 1_000_000_000) return `${(numValue / 1_000_000_000).toFixed(1)}B`;
            if (numValue >= 1_000_000) return `${(numValue / 1_000_000).toFixed(0)}M`;
            return numValue.toLocaleString();
          },
        },
      },
    },
  }), [isMobile]);

  // Create or update chart
  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    
    const displayData = getDisplayData();
    const labels = displayData.map(d => d.name);
    const populations = displayData.map(d => d.population);
    const colors = displayData.map(d => getColorForCode(d.code));

    if (chartRef.current) {
      // Update existing chart - this animates smoothly!
      const chart = chartRef.current;
      
      // Check if labels changed (country selection changed)
      const labelsChanged = JSON.stringify(chart.data.labels) !== JSON.stringify(labels);
      
      if (labelsChanged) {
        // Full rebuild needed when countries change
        chart.data.labels = labels;
        chart.data.datasets[0].data = populations;
        chart.data.datasets[0].backgroundColor = colors;
        chart.data.datasets[0].borderColor = colors;
        chart.update('none'); // No animation for structure change
        // Then animate to final state
        setTimeout(() => chart.update('default'), 10);
      } else {
        // Just update values - smooth animation!
        chart.data.datasets[0].data = populations;
        chart.data.datasets[0].label = `Population (${year})`;
        chart.update('default');
      }
    } else {
      // Create new chart
      chartRef.current = new ChartJS(canvasRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: `Population (${year})`,
              data: populations,
              backgroundColor: colors,
              borderColor: colors,
              borderWidth: 0,
              borderRadius: 6,
              barThickness: isMobile ? 24 : undefined,
              maxBarThickness: 40,
            },
          ],
        },
        options: getOptions(),
        plugins: [ChartDataLabels],
      });
    }
  }, [data, year, getDisplayData, getOptions, isMobile]);

  // Handle options/orientation change
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.options = getOptions();
      chartRef.current.update('none');
    }
  }, [getOptions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>Select countries from the list to view population data</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 min-h-0 relative">
        <canvas ref={canvasRef} />
      </div>
      <div className="mt-4 text-center text-sm text-gray-500">
        Population Comparison in <span className="font-semibold text-pastel-mauve">{year}</span>
      </div>
    </div>
  );
}

