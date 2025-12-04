import { useMemo, useState } from 'react';
import type { Country } from '../types';
import { formatPopulation, getIso2Code } from '../utils/format';
import { getColorForCode } from '../utils/colors';

export type SidebarMode = 'select' | 'labels' | 'disabled';

interface CountrySidebarProps {
  countries: Country[];
  selectedCodes: Set<string>;
  onToggle: (code: string) => void;
  isLoading: boolean;
  mode?: SidebarMode;
}

const modeDescriptions: Record<SidebarMode, string> = {
  select: 'Select countries to display',
  labels: 'Toggle percentage labels',
  disabled: 'Showing all countries',
};

export function CountrySidebar({ 
  countries, 
  selectedCodes, 
  onToggle, 
  isLoading,
  mode = 'select',
}: CountrySidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

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

  const isDisabled = mode === 'disabled';

  return (
    <div className={`flex flex-col h-full max-h-[60vh] lg:max-h-none lg:h-[584px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${isDisabled ? 'opacity-75' : ''}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Countries</h2>
          {mode === 'labels' && (
            <span className="text-xs text-pastel-mauve bg-pastel-purple/10 px-2 py-0.5 rounded-full">
              Labels
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-3">{modeDescriptions[mode]}</p>
        <input
          type="text"
          placeholder="Search countries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isDisabled}
          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-pastel-purple/30 focus:border-pastel-purple
                     placeholder:text-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Country List */}
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-gray-100">
          {filteredCountries.map((country) => {
            const isSelected = mode === 'disabled' ? true : selectedCodes.has(country.code);
            const iso2 = getIso2Code(country.code);
            const color = getColorForCode(country.code);

            return (
              <li key={country.code}>
                <button
                  onClick={() => !isDisabled && onToggle(country.code)}
                  disabled={isDisabled}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                             ${isDisabled ? 'cursor-default' : 'hover:bg-gray-50'} ${isSelected ? 'bg-gray-50/50' : ''}`}
                >
                  {/* Checkbox / Label indicator */}
                  <div 
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0
                               transition-all ${isSelected 
                                 ? 'border-transparent' 
                                 : 'border-gray-300'}`}
                    style={{ backgroundColor: isSelected ? color : 'transparent' }}
                  >
                    {isSelected && (
                      mode === 'labels' ? (
                        <svg 
                          className="w-3 h-3 text-white" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2.5} 
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" 
                          />
                        </svg>
                      ) : (
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
                      )
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
                    {formatPopulation(country.latestPopulation)}
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
          {mode === 'disabled' 
            ? `${countries.length} countries shown`
            : mode === 'labels'
            ? `${selectedCodes.size} labels visible`
            : `${selectedCodes.size} of ${countries.length} selected`
          }
        </p>
      </div>
    </div>
  );
}
