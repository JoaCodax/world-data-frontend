import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAllData, parseCountries } from './hooks/usePopulationData';
import { PopulationChart } from './components/PopulationChart';
import { CountrySidebar, type SidebarMode } from './components/CountrySidebar';
import { YearRangeSlider } from './components/YearRangeSlider';
import { YearSlider } from './components/YearSlider';
import { ChartTabs, type ViewType } from './components/ChartTabs';
import { PlayButton } from './components/PlayButton';
import { PieChart } from './components/PieChart';
import { BarChart } from './components/BarChart';
import { WorldMap } from './components/WorldMap';
import { DataTable } from './components/DataTable';

const DEFAULT_TOP_COUNTRIES = 10;

export default function App() {
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [yearRange, setYearRange] = useState<[number, number] | null>(null);
  const [singleYear, setSingleYear] = useState<number>(2023);
  const [initialized, setInitialized] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('line');
  const [isPlaying, setIsPlaying] = useState(false);
  const [labeledCountries, setLabeledCountries] = useState<Set<string>>(new Set());

  const { data, isLoading } = useAllData();

  // Parse countries from compact format
  const countries = useMemo(() => {
    if (!data) return [];
    return parseCountries(data.countries);
  }, [data]);

  // Calculate available year range from all data (null until data loads)
  const availableYearRange = useMemo((): [number, number] | null => {
    if (!data) {
      return null;
    }

    let minYear = Infinity;
    let maxYear = -Infinity;

    for (const code of Object.keys(data.population)) {
      const popData = data.population[code];
      if (!popData || popData.length === 0) continue;

      for (const [year] of popData) {
        if (year < minYear) minYear = year;
        if (year > maxYear) maxYear = year;
      }
    }

    if (minYear === Infinity || maxYear === -Infinity) {
      return null;
    }

    return [minYear, maxYear];
  }, [data]);

  // Get all years in data
  const allYears = useMemo(() => {
    if (!availableYearRange) return [];
    const years: number[] = [];
    for (let y = availableYearRange[0]; y <= availableYearRange[1]; y++) {
      years.push(y);
    }
    return years;
  }, [availableYearRange]);

  // Initialize yearRange and singleYear when availableYearRange changes
  useEffect(() => {
    // Only initialize once data is loaded
    if (!availableYearRange) return;

    if (yearRange === null) {
      // First time initialization
      const defaultStartYear = Math.max(2000, availableYearRange[0]);
      setYearRange([defaultStartYear, availableYearRange[1]]);
      setSingleYear(availableYearRange[1]);
    } else {
      // Clamp existing yearRange to the available bounds
      const clampedStart = Math.min(Math.max(yearRange[0], availableYearRange[0]), availableYearRange[1]);
      const clampedEnd = Math.min(Math.max(yearRange[1], availableYearRange[0]), availableYearRange[1]);
      if (clampedStart !== yearRange[0] || clampedEnd !== yearRange[1]) {
        setYearRange([clampedStart, clampedEnd]);
      }
      // Clamp singleYear to the available range
      setSingleYear(prev => Math.min(Math.max(prev, availableYearRange[0]), availableYearRange[1]));
    }
  }, [availableYearRange, yearRange]);

  // Auto-select top 10 countries on first load
  useEffect(() => {
    if (countries.length > 0 && !initialized) {
      const topCountries = countries
        .filter(c => c.rank !== null)
        .slice(0, DEFAULT_TOP_COUNTRIES)
        .map(c => c.code);
      setSelectedCodes(new Set(topCountries));
      setLabeledCountries(new Set(topCountries));
      setInitialized(true);
    }
  }, [countries, initialized]);

  // Use effective year range (fallback to available if null)
  const effectiveYearRange = yearRange ?? availableYearRange;

  // Filter population data for selected countries and year range (for line chart)
  const lineChartData = useMemo(() => {
    if (!data) return [];
    
    const result: { code: string; name: string; data: [number, number][] }[] = [];
    
    for (const country of countries) {
      if (!selectedCodes.has(country.code)) continue;
      
      const popData = data.population[country.code];
      if (!popData) continue;
      
      const filtered = popData.filter(
        ([year]) => year >= effectiveYearRange[0] && year <= effectiveYearRange[1]
      );
      
      result.push({
        code: country.code,
        name: country.name,
        data: filtered,
      });
    }
    
    return result;
  }, [data, countries, selectedCodes, effectiveYearRange]);

  // Data for pie chart (single year, selected countries)
  const pieChartData = useMemo(() => {
    if (!data) return [];
    
    const result: { code: string; name: string; population: number }[] = [];
    
    for (const country of countries) {
      if (!selectedCodes.has(country.code)) continue;
      
      const popData = data.population[country.code];
      if (!popData) continue;
      
      const yearData = popData.find(([y]) => y === singleYear);
      if (!yearData) continue;
      
      result.push({
        code: country.code,
        name: country.name,
        population: yearData[1],
      });
    }
    
    return result;
  }, [data, countries, selectedCodes, singleYear]);

  // Data for bar chart (single year, selected countries)
  const barChartData = useMemo(() => {
    if (!data) return [];
    
    const result: { code: string; name: string; population: number }[] = [];
    
    for (const country of countries) {
      if (!selectedCodes.has(country.code)) continue;
      
      const popData = data.population[country.code];
      if (!popData) continue;
      
      const yearData = popData.find(([y]) => y === singleYear);
      if (!yearData) continue;
      
      result.push({
        code: country.code,
        name: country.name,
        population: yearData[1],
      });
    }
    
    return result;
  }, [data, countries, selectedCodes, singleYear]);

  // Data for world map (single year, ALL countries)
  const worldMapData = useMemo(() => {
    if (!data) return [];
    
    const result: { code: string; name: string; population: number }[] = [];
    
    for (const country of countries) {
      const popData = data.population[country.code];
      if (!popData) continue;
      
      const yearData = popData.find(([y]) => y === singleYear);
      if (!yearData) continue;
      
      result.push({
        code: country.code,
        name: country.name,
        population: yearData[1],
      });
    }
    
    return result;
  }, [data, countries, singleYear]);

  // Data for table (ALL countries)
  const tableData = useMemo(() => {
    if (!data) return [];
    
    return countries.map(country => {
      const popData = data.population[country.code] || [];
      const populationByYear = new Map<number, number>();
      
      for (const [year, pop] of popData) {
        populationByYear.set(year, pop);
      }
      
      return {
        code: country.code,
        name: country.name,
        populationByYear,
      };
    });
  }, [data, countries]);

  const handleToggle = (code: string) => {
    if (activeView === 'pie') {
      // For pie chart, toggle labels
      setLabeledCountries(prev => {
        const next = new Set(prev);
        if (next.has(code)) {
          next.delete(code);
        } else {
          next.add(code);
        }
        return next;
      });
    } else {
      // For other views, toggle selection
      setSelectedCodes(prev => {
        const next = new Set(prev);
        if (next.has(code)) {
          next.delete(code);
        } else {
          next.add(code);
        }
        return next;
      });
    }
  };

  // Play animation tick handler
  const handlePlayTick = useCallback(() => {
    if (activeView === 'line') {
      // For line chart, animate the end of the range
      setYearRange(prev => {
        if (!prev) return prev;
        const newEnd = prev[1] + 1;
        if (newEnd > availableYearRange[1]) {
          return prev; // Stop at max
        }
        return [prev[0], newEnd];
      });
      return yearRange ? yearRange[1] < availableYearRange[1] : false;
    } else {
      // For other views, animate single year
      setSingleYear(prev => {
        const next = prev + 1;
        if (next > availableYearRange[1]) {
          return prev;
        }
        return next;
      });
      return singleYear < availableYearRange[1];
    }
  }, [activeView, availableYearRange, yearRange, singleYear]);

  // Reset animation when view changes
  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    setIsPlaying(false);
  };

  // Determine sidebar mode based on active view
  const sidebarMode: SidebarMode = useMemo(() => {
    if (activeView === 'map') return 'disabled';
    if (activeView === 'pie') return 'labels';
    return 'select';
  }, [activeView]);

  // Determine which codes to show as selected in sidebar
  const sidebarSelectedCodes = useMemo(() => {
    if (activeView === 'pie') return labeledCountries;
    return selectedCodes;
  }, [activeView, labeledCountries, selectedCodes]);

  // Show single year slider for pie/bar/map, range for line
  const showRangeSlider = activeView === 'line';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-pastel-purple/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pastel-mint/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-pastel-mauve/20 rounded-xl flex items-center justify-center">
              <svg 
                className="w-6 h-6 text-pastel-mauve" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <path strokeWidth="2" d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                <path strokeWidth="2" d="M2 12h20"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">World Data</h1>
              <p className="text-sm text-gray-500">Population by Country</p>
            </div>
          </div>
        </header>

        {/* Chart tabs and play button */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <ChartTabs activeView={activeView} onViewChange={handleViewChange} />
          <PlayButton
            isPlaying={isPlaying}
            onToggle={() => setIsPlaying(prev => !prev)}
            onTick={handlePlayTick}
            intervalMs={100}
          />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Chart section */}
          <div className="space-y-0">
            {/* Chart card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-700">
                  {activeView === 'line' && 'Population Over Time'}
                  {activeView === 'pie' && 'Population Share'}
                  {activeView === 'bar' && 'Population Comparison'}
                  {activeView === 'map' && 'World Population Map'}
                </h2>
              </div>
              
              <div className="h-[400px]">
                {activeView === 'line' && (
                  <PopulationChart data={lineChartData} yearRange={effectiveYearRange} />
                )}
                {activeView === 'pie' && (
                  <PieChart 
                    data={pieChartData} 
                    showLabels={labeledCountries.size > 0}
                    year={singleYear} 
                  />
                )}
                {activeView === 'bar' && (
                  <BarChart data={barChartData} year={singleYear} />
                )}
                {activeView === 'map' && (
                  <WorldMap data={worldMapData} year={singleYear} />
                )}
              </div>

              {/* Year controls inside the card - only render when data is loaded */}
              {data && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  {showRangeSlider ? (
                    <YearRangeSlider
                      min={availableYearRange[0]}
                      max={availableYearRange[1]}
                      values={effectiveYearRange}
                      onChange={setYearRange}
                      embedded
                    />
                  ) : (
                    <YearSlider
                      min={availableYearRange[0]}
                      max={availableYearRange[1]}
                      value={singleYear}
                      onChange={setSingleYear}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - matches chart card height */}
          <div className="lg:sticky lg:top-8">
            <CountrySidebar
              countries={countries}
              selectedCodes={sidebarSelectedCodes}
              onToggle={handleToggle}
              isLoading={isLoading}
              mode={sidebarMode}
            />
          </div>
        </div>

        {/* Data Table - always visible */}
        {availableYearRange && (
          <div className="mt-8">
            <DataTable 
              data={tableData} 
              yearRange={effectiveYearRange}
              allYears={allYears}
              availableYearRange={availableYearRange}
            />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-gray-400">
          <p>Data source: World Bank Open Data</p>
        </footer>
      </div>
    </div>
  );
}
