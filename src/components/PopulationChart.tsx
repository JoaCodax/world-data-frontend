import { useMemo } from 'react';
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
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { CountryPopulationSeries } from '../types';
import { getColorForIndex } from '../utils/colors';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PopulationChartProps {
  data: CountryPopulationSeries[];
  yearRange: [number, number];
}

export function PopulationChart({ data, yearRange }: PopulationChartProps) {
  const chartData = useMemo(() => {
    // Generate labels for all years in range
    const labels: string[] = [];
    for (let year = yearRange[0]; year <= yearRange[1]; year++) {
      labels.push(year.toString());
    }

    // Create datasets for each country
    const datasets = data.map((series, index) => {
      // Create a map of year to population for easy lookup
      const populationByYear = new Map(
        series.data.map(d => [d.year, d.population])
      );

      // Fill in data for each year
      const values = labels.map(yearStr => {
        const year = parseInt(yearStr);
        return populationByYear.get(year) ?? null;
      });

      const color = getColorForIndex(index);

      return {
        label: series.name,
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

  const options: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1a1a2e',
        bodyColor: '#6b7280',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        bodySpacing: 6,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            if (value === null) return '';
            
            let formattedValue: string;
            if (value >= 1_000_000_000) {
              formattedValue = `${(value / 1_000_000_000).toFixed(2)}B`;
            } else if (value >= 1_000_000) {
              formattedValue = `${(value / 1_000_000).toFixed(1)}M`;
            } else {
              formattedValue = value.toLocaleString();
            }
            
            return `${context.dataset.label}: ${formattedValue}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11,
          },
          maxTicksLimit: 12,
        },
      },
      y: {
        grid: {
          color: '#f3f4f6',
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11,
          },
          callback: (value) => {
            if (typeof value !== 'number') return value;
            if (value >= 1_000_000_000) {
              return `${(value / 1_000_000_000).toFixed(1)}B`;
            }
            if (value >= 1_000_000) {
              return `${(value / 1_000_000).toFixed(0)}M`;
            }
            return value.toLocaleString();
          },
        },
      },
    },
  }), []);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>Select countries from the list to view population data</p>
      </div>
    );
  }

  return <Line data={chartData} options={options} />;
}

