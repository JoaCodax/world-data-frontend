import { useState, useMemo, useEffect } from 'react';
import { useCountries, usePopulation } from './hooks/usePopulationData';
import { PopulationChart } from './components/PopulationChart';
import { CountrySidebar } from './components/CountrySidebar';
import { YearRangeSlider } from './components/YearRangeSlider';

const MIN_YEAR = 2000;
const MAX_YEAR = new Date().getFullYear();
const DEFAULT_TOP_COUNTRIES = 10;

export default function App() {
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [yearRange, setYearRange] = useState<[number, number]>([MIN_YEAR, MAX_YEAR]);
  const [initialized, setInitialized] = useState(false);

  // Fetch all countries
  const { data: countriesData, isLoading: isLoadingCountries } = useCountries();

  // Auto-select top 10 countries on first load
  useEffect(() => {
    if (countriesData && !initialized) {
      const topCountries = countriesData.countries
        .filter(c => c.rank !== null)
        .slice(0, DEFAULT_TOP_COUNTRIES)
        .map(c => c.code);
      setSelectedCodes(new Set(topCountries));
      setInitialized(true);
    }
  }, [countriesData, initialized]);

  // Prepare country codes for API call
  const selectedCodesArray = useMemo(() => Array.from(selectedCodes), [selectedCodes]);

  // Fetch population data for selected countries
  const { data: populationData, isLoading: isLoadingPopulation } = usePopulation({
    country_codes: selectedCodesArray,
    year_start: yearRange[0],
    year_end: yearRange[1],
  }, selectedCodes.size > 0);

  // Handle country toggle
  const handleToggle = (code: string) => {
    setSelectedCodes(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  // Get countries list
  const countries = countriesData?.countries ?? [];

  // Get population series data in the same order as selected countries
  const orderedPopulationData = useMemo(() => {
    if (!populationData?.series) return [];
    
    // Create a map for quick lookup
    const seriesMap = new Map(
      populationData.series.map(s => [s.code, s])
    );
    
    // Return series in the order of selection (based on countries list order)
    return countries
      .filter(c => selectedCodes.has(c.code))
      .map(c => seriesMap.get(c.code))
      .filter((s): s is NonNullable<typeof s> => s !== undefined);
  }, [populationData, countries, selectedCodes]);

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

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Chart section */}
          <div className="space-y-6">
            {/* Chart card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-700">
                  Population Over Time
                </h2>
                {isLoadingPopulation && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-4 h-4 border-2 border-pastel-mauve/30 border-t-pastel-mauve rounded-full animate-spin" />
                    Loading...
                  </div>
                )}
              </div>
              <div className="h-[400px]">
                <PopulationChart 
                  data={orderedPopulationData} 
                  yearRange={yearRange}
                />
              </div>
            </div>

            {/* Year slider */}
            <YearRangeSlider
              min={MIN_YEAR}
              max={MAX_YEAR}
              values={yearRange}
              onChange={setYearRange}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:h-[calc(100vh-12rem)] lg:sticky lg:top-8">
            <CountrySidebar
              countries={countries}
              selectedCodes={selectedCodes}
              onToggle={handleToggle}
              isLoading={isLoadingCountries}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-gray-400">
          <p>Data source: World Bank Open Data</p>
        </footer>
      </div>
    </div>
  );
}

