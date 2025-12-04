import { useState, useMemo } from 'react';
import { Sparkline } from './Sparkline';
import { getIso2Code } from '../utils/format';
import { getColorForCode } from '../utils/colors';
import { YearRangeSlider } from './YearRangeSlider';

type TableMode = 'simple' | 'complete';
type SortField = 'name' | 'firstPop' | 'lastPop' | 'change' | 'percentChange' | string;
type SortDirection = 'asc' | 'desc';

interface CountryTableData {
  code: string;
  name: string;
  populationByYear: Map<number, number>;
}

interface DataTableProps {
  data: CountryTableData[];
  yearRange: [number, number];
  allYears: number[];
  availableYearRange: [number, number];
}

function formatPopulation(pop: number | null): string {
  if (pop === null) return '—';
  if (pop >= 1_000_000_000) return `${(pop / 1_000_000_000).toFixed(2)}B`;
  if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)}M`;
  if (pop >= 1_000) return `${(pop / 1_000).toFixed(0)}K`;
  return pop.toLocaleString();
}

function formatPercentChange(change: number | null): string {
  if (change === null) return '—';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export function DataTable({ data, yearRange, allYears, availableYearRange }: DataTableProps) {
  const [mode, setMode] = useState<TableMode>('simple');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [tableYearRange, setTableYearRange] = useState<[number, number]>(yearRange);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const processedData = useMemo(() => {
    return data.map(country => {
      const firstPop = country.populationByYear.get(tableYearRange[0]) ?? null;
      const lastPop = country.populationByYear.get(tableYearRange[1]) ?? null;
      
      const change = firstPop !== null && lastPop !== null 
        ? lastPop - firstPop 
        : null;
      
      const percentChange = firstPop !== null && lastPop !== null && firstPop > 0
        ? ((lastPop - firstPop) / firstPop) * 100
        : null;

      // Get sparkline data for the year range
      const sparklineData: number[] = [];
      for (let year = tableYearRange[0]; year <= tableYearRange[1]; year++) {
        const pop = country.populationByYear.get(year);
        if (pop !== undefined) sparklineData.push(pop);
      }

      return {
        ...country,
        firstPop,
        lastPop,
        change,
        percentChange,
        sparklineData,
      };
    });
  }, [data, tableYearRange]);

  const sortedData = useMemo(() => {
    const sorted = [...processedData];
    
    sorted.sort((a, b) => {
      let aVal: number | string | null;
      let bVal: number | string | null;

      if (sortField === 'name') {
        aVal = a.name;
        bVal = b.name;
      } else if (sortField === 'firstPop') {
        aVal = a.firstPop;
        bVal = b.firstPop;
      } else if (sortField === 'lastPop') {
        aVal = a.lastPop;
        bVal = b.lastPop;
      } else if (sortField === 'change') {
        aVal = a.change;
        bVal = b.change;
      } else if (sortField === 'percentChange') {
        aVal = a.percentChange;
        bVal = b.percentChange;
      } else {
        // Sort by specific year (for complete view)
        const year = parseInt(sortField);
        aVal = a.populationByYear.get(year) ?? null;
        bVal = b.populationByYear.get(year) ?? null;
      }

      // Handle nulls
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      // Compare
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      const numA = aVal as number;
      const numB = bVal as number;
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });

    return sorted;
  }, [processedData, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  // Reset to page 1 when sorting, filtering, or rows per page changes
  useMemo(() => {
    setCurrentPage(1);
  }, [sortField, sortDirection, rowsPerPage, data]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-300 ml-1">↕</span>;
    }
    return (
      <span className="text-pastel-mauve ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const yearsInRange = useMemo(() => {
    return allYears.filter(y => y >= tableYearRange[0] && y <= tableYearRange[1]);
  }, [allYears, tableYearRange]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-700">Population Data</h2>
          
          {/* Mode toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1 border border-gray-100">
            <button
              onClick={() => setMode('simple')}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                mode === 'simple'
                  ? 'bg-pastel-purple/20 text-pastel-mauve font-medium'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setMode('complete')}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                mode === 'complete'
                  ? 'bg-pastel-purple/20 text-pastel-mauve font-medium'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              Complete
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Rows per page selector */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Rows:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-md text-sm text-gray-700 
                         focus:outline-none focus:ring-2 focus:ring-pastel-purple/30 focus:border-pastel-purple
                         cursor-pointer"
            >
              {ROWS_PER_PAGE_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Year Range Selector for Table */}
      {mode === 'simple' && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/30">
          <YearRangeSlider
            min={availableYearRange[0]}
            max={availableYearRange[1]}
            values={tableYearRange}
            onChange={setTableYearRange}
            embedded
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {mode === 'simple' ? (
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[200px]" />
              <col />
              <col />
              <col />
              <col />
              <col className="w-[120px]" />
            </colgroup>
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th 
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  Country <SortIcon field="name" />
                </th>
                <th 
                  className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('firstPop')}
                >
                  {tableYearRange[0]} Pop <SortIcon field="firstPop" />
                </th>
                <th 
                  className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('lastPop')}
                >
                  {tableYearRange[1]} Pop <SortIcon field="lastPop" />
                </th>
                <th 
                  className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('change')}
                >
                  Change <SortIcon field="change" />
                </th>
                <th 
                  className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('percentChange')}
                >
                  % Change <SortIcon field="percentChange" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((country, index) => {
                const iso2 = getIso2Code(country.code);
                const color = getColorForCode(country.code);
                const isPositive = country.percentChange !== null && country.percentChange >= 0;
                const isOddRow = index % 2 === 1;
                
                return (
                  <tr key={country.code} className={`hover:bg-pastel-purple/10 transition-colors ${isOddRow ? 'bg-pastel-purple/20' : 'bg-white'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {iso2 ? (
                          <span className={`fi fi-${iso2} rounded-sm shadow-sm`} />
                        ) : (
                          <span className="w-5 h-4 bg-gray-200 rounded-sm" />
                        )}
                        <span className="text-sm font-medium text-gray-700 truncate">{country.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600 tabular-nums">
                      {formatPopulation(country.firstPop)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600 tabular-nums">
                      {formatPopulation(country.lastPop)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600 tabular-nums">
                      {country.change !== null ? (
                        <span className={isPositive ? 'text-emerald-600' : 'text-rose-500'}>
                          {isPositive ? '+' : ''}{formatPopulation(country.change)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {country.percentChange !== null ? (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          isPositive 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-rose-50 text-rose-600'
                        }`}>
                          {formatPercentChange(country.percentChange)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <Sparkline data={country.sparklineData} color={color} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* Complete view */
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th 
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 sticky left-0 bg-gray-50 z-10 w-[200px] min-w-[200px]"
                  onClick={() => handleSort('name')}
                >
                  Country <SortIcon field="name" />
                </th>
                {yearsInRange.map(year => (
                  <th 
                    key={year}
                    className="text-right px-3 py-3 text-xs font-semibold text-gray-500 cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => handleSort(year.toString())}
                  >
                    {year} <SortIcon field={year.toString()} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((country, index) => {
                const iso2 = getIso2Code(country.code);
                const isOddRow = index % 2 === 1;
                
                return (
                  <tr key={country.code} className={`hover:bg-pastel-purple/10 transition-colors ${isOddRow ? 'bg-pastel-purple/20' : 'bg-white'}`}>
                    <td className={`px-4 py-3 sticky left-0 z-10 w-[200px] min-w-[200px] ${isOddRow ? 'bg-pastel-purple/20' : 'bg-white'}`}>
                      <div className="flex items-center gap-3">
                        {iso2 ? (
                          <span className={`fi fi-${iso2} rounded-sm shadow-sm`} />
                        ) : (
                          <span className="w-5 h-4 bg-gray-200 rounded-sm" />
                        )}
                        <span className="text-sm font-medium text-gray-700 truncate">{country.name}</span>
                      </div>
                    </td>
                    {yearsInRange.map(year => {
                      const pop = country.populationByYear.get(year);
                      return (
                        <td key={year} className="px-3 py-3 text-right text-sm text-gray-600 tabular-nums whitespace-nowrap">
                          {pop !== undefined ? formatPopulation(pop) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer with pagination */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          {/* Results info */}
          <p className="text-xs text-gray-500">
            Showing {((currentPage - 1) * rowsPerPage) + 1} - {Math.min(currentPage * rowsPerPage, sortedData.length)} of {sortedData.length} countries
          </p>

          {/* Pagination controls */}
          <div className="flex items-center gap-1">
            {/* First page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="First page"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>

            {/* Previous page */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-0.5 mx-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 text-xs rounded-md transition-colors ${
                      currentPage === pageNum
                        ? 'bg-pastel-mauve text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next page */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Last page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Last page"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

