import { useMemo, useState } from 'react';
import type { Country } from '../types';
import { formatPopulation, getIso2Code } from '../utils/format';
import { getColorForIndex } from '../utils/colors';

interface CountrySidebarProps {
  countries: Country[];
  selectedCodes: Set<string>;
  onToggle: (code: string) => void;
  isLoading: boolean;
}

export function CountrySidebar({ 
  countries, 
  selectedCodes, 
  onToggle, 
  isLoading 
}: CountrySidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Get selected countries in order they were selected (for color matching)
  const selectedCountriesOrdered = useMemo(() => {
    return countries.filter(c => selectedCodes.has(c.code));
  }, [countries, selectedCodes]);

  // Color map for selected countries
  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    selectedCountriesOrdered.forEach((country, index) => {
      map.set(country.code, getColorForIndex(index));
    });
    return map;
  }, [selectedCountriesOrdered]);

  // Filter countries by search term
  const filteredCountries = useMemo(() => {
    if (!searchTerm.trim()) return countries;
    const term = searchTerm.toLowerCase();
    return countries.filter(
      c => c.name.toLowerCase().includes(term) || c.code.toLowerCase().includes(term)
    );
  }, [countries, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="h-6 bg-gray-100 rounded animate-pulse w-24" />
        </div>
        <div className="flex-1 p-4 space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Countries</h2>
        <input
          type="text"
          placeholder="Search countries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-pastel-purple/30 focus:border-pastel-purple
                     placeholder:text-gray-400 transition-all"
        />
      </div>

      {/* Country List */}
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-gray-50">
          {filteredCountries.map((country) => {
            const isSelected = selectedCodes.has(country.code);
            const iso2 = getIso2Code(country.code);
            const color = colorMap.get(country.code);

            return (
              <li key={country.code}>
                <button
                  onClick={() => onToggle(country.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                             hover:bg-gray-50 ${isSelected ? 'bg-gray-50/50' : ''}`}
                >
                  {/* Checkbox */}
                  <div 
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0
                               transition-all ${isSelected 
                                 ? 'border-transparent' 
                                 : 'border-gray-300'}`}
                    style={{ backgroundColor: isSelected ? color : 'transparent' }}
                  >
                    {isSelected && (
                      <svg 
                        className="w-3 h-3 text-white" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={3} 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                    )}
                  </div>

                  {/* Flag */}
                  {iso2 ? (
                    <span className={`fi fi-${iso2} rounded-sm shadow-sm`} />
                  ) : (
                    <span className="w-5 h-4 bg-gray-200 rounded-sm" />
                  )}

                  {/* Country info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {country.rank && (
                        <span className="text-xs font-medium text-gray-400">
                          #{country.rank}
                        </span>
                      )}
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {country.name}
                      </span>
                    </div>
                  </div>

                  {/* Population */}
                  <span className="text-sm text-gray-500 tabular-nums">
                    {formatPopulation(country.latest_population)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/50">
        <p className="text-xs text-gray-400 text-center">
          {selectedCodes.size} of {countries.length} selected
        </p>
      </div>
    </div>
  );
}

