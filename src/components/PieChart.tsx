import { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Pie } from 'react-chartjs-2';
import { getColorForCode } from '../utils/colors';

// Register only the core Chart.js components globally
// ChartDataLabels is passed as a local plugin to avoid affecting other charts
ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartData {
  code: string;
  name: string;
  population: number;
}

interface PieChartProps {
  data: PieChartData[];
  showLabels: boolean;
  year: number;
}

export function PieChart({ data, showLabels, year }: PieChartProps) {
  const chartData = useMemo(() => {
    // Sort by population descending
    const sorted = [...data].sort((a, b) => b.population - a.population);
    
    // If more than 10 items, group smaller ones as "Others"
    let displayData = sorted;
    let othersPopulation = 0;
    
    if (sorted.length > 10) {
      displayData = sorted.slice(0, 9);
      othersPopulation = sorted.slice(9).reduce((sum, d) => sum + d.population, 0);
    }

    const labels = displayData.map(d => d.name);
    const populations = displayData.map(d => d.population);
    const colors = displayData.map(d => getColorForCode(d.code));

    if (othersPopulation > 0) {
      labels.push('Others');
      populations.push(othersPopulation);
      colors.push('#9CA3AF'); // Gray for others
    }

    return {
      labels,
      datasets: [
        {
          data: populations,
          backgroundColor: colors,
          borderColor: colors.map(() => '#ffffff'),
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    };
  }, [data]);

  const totalPopulation = useMemo(() => 
    data.reduce((sum, d) => sum + d.population, 0), 
    [data]
  );

  const options: ChartOptions<'pie'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    layout: {
      padding: showLabels ? 20 : 0,
    },
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11 },
          color: '#374151',
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            const labels = chart.data.labels as string[];
            if (datasets.length === 0) return [];
            
            const data = datasets[0].data as number[];
            const backgroundColor = datasets[0].backgroundColor as string[];
            
            return labels.map((label, i) => {
              const value = data[i];
              const percentage = totalPopulation > 0 
                ? ((value / totalPopulation) * 100).toFixed(1)
                : '0';
              
              return {
                text: `${label} (${percentage}%)`,
                fillStyle: backgroundColor[i],
                strokeStyle: backgroundColor[i],
                hidden: false,
                index: i,
              };
            });
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            const percentage = totalPopulation > 0 
              ? ((value / totalPopulation) * 100).toFixed(2)
              : '0';
            
            let formatted: string;
            if (value >= 1_000_000_000) {
              formatted = `${(value / 1_000_000_000).toFixed(2)}B`;
            } else if (value >= 1_000_000) {
              formatted = `${(value / 1_000_000).toFixed(1)}M`;
            } else {
              formatted = value.toLocaleString();
            }
            
            return `${context.label}: ${formatted} (${percentage}%)`;
          },
        },
      },
      datalabels: {
        display: showLabels,
        color: '#374151',
        font: {
          weight: 'bold' as const,
          size: 11,
        },
        formatter: (value: number, context: any) => {
          const percentage = totalPopulation > 0 
            ? ((value / totalPopulation) * 100)
            : 0;
          
          // Only show label if percentage is significant enough
          if (percentage < 3) return '';
          return `${percentage.toFixed(1)}%`;
        },
        anchor: 'end' as const,
        align: (context: any) => {
          const chart = context.chart;
          const meta = chart.getDatasetMeta(0);
          const dataIndex = context.dataIndex;
          const angle = meta.data[dataIndex].angle;
          // Determine alignment based on angle
          if (angle > Math.PI / 2 && angle < 3 * Math.PI / 2) {
            return 'start';
          }
          return 'end';
        },
        offset: 15,
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
          top: 4,
          bottom: 4,
          left: 6,
          right: 6,
        },
      },
    },
  }), [showLabels, totalPopulation]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>Select countries from the list to view population data</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 min-h-0">
        <Pie data={chartData} options={options} plugins={[ChartDataLabels]} />
      </div>
      <div className="mt-4 text-center text-sm text-gray-500">
        World Population Share in <span className="font-semibold text-pastel-mauve">{year}</span>
      </div>
    </div>
  );
}
