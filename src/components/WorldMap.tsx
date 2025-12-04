import { useMemo, useState, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  // @ts-expect-error - react-simple-maps doesn't have types
} from 'react-simple-maps';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ISO alpha-3 to numeric country code mapping (used by world-atlas)
const alpha3ToNumeric: Record<string, string> = {
  AFG: '004', ALB: '008', DZA: '012', ASM: '016', AND: '020', AGO: '024',
  ATG: '028', ARG: '032', ARM: '051', ABW: '533', AUS: '036', AUT: '040',
  AZE: '031', BHS: '044', BHR: '048', BGD: '050', BRB: '052', BLR: '112',
  BEL: '056', BLZ: '084', BEN: '204', BMU: '060', BTN: '064', BOL: '068',
  BIH: '070', BWA: '072', BRA: '076', BRN: '096', BGR: '100', BFA: '854',
  BDI: '108', KHM: '116', CMR: '120', CAN: '124', CPV: '132', CAF: '140',
  TCD: '148', CHL: '152', CHN: '156', COL: '170', COM: '174', COG: '178',
  COD: '180', CRI: '188', CIV: '384', HRV: '191', CUB: '192', CYP: '196',
  CZE: '203', DNK: '208', DJI: '262', DMA: '212', DOM: '214', ECU: '218',
  EGY: '818', SLV: '222', GNQ: '226', ERI: '232', EST: '233', ETH: '231',
  FJI: '242', FIN: '246', FRA: '250', GAB: '266', GMB: '270', GEO: '268',
  DEU: '276', GHA: '288', GRC: '300', GRL: '304', GRD: '308', GUM: '316',
  GTM: '320', GIN: '324', GNB: '624', GUY: '328', HTI: '332', HND: '340',
  HKG: '344', HUN: '348', ISL: '352', IND: '356', IDN: '360', IRN: '364',
  IRQ: '368', IRL: '372', ISR: '376', ITA: '380', JAM: '388', JPN: '392',
  JOR: '400', KAZ: '398', KEN: '404', KIR: '296', PRK: '408', KOR: '410',
  KWT: '414', KGZ: '417', LAO: '418', LVA: '428', LBN: '422', LSO: '426',
  LBR: '430', LBY: '434', LIE: '438', LTU: '440', LUX: '442', MAC: '446',
  MKD: '807', MDG: '450', MWI: '454', MYS: '458', MDV: '462', MLI: '466',
  MLT: '470', MHL: '584', MRT: '478', MUS: '480', MEX: '484', FSM: '583',
  MDA: '498', MCO: '492', MNG: '496', MNE: '499', MAR: '504', MOZ: '508',
  MMR: '104', NAM: '516', NRU: '520', NPL: '524', NLD: '528', NCL: '540',
  NZL: '554', NIC: '558', NER: '562', NGA: '566', NOR: '578', OMN: '512',
  PAK: '586', PLW: '585', PAN: '591', PNG: '598', PRY: '600', PER: '604',
  PHL: '608', POL: '616', PRT: '620', PRI: '630', QAT: '634', ROU: '642',
  RUS: '643', RWA: '646', WSM: '882', SMR: '674', STP: '678', SAU: '682',
  SEN: '686', SRB: '688', SYC: '690', SLE: '694', SGP: '702', SVK: '703',
  SVN: '705', SLB: '090', SOM: '706', ZAF: '710', SSD: '728', ESP: '724',
  LKA: '144', SDN: '729', SUR: '740', SWZ: '748', SWE: '752', CHE: '756',
  SYR: '760', TWN: '158', TJK: '762', TZA: '834', THA: '764', TLS: '626',
  TGO: '768', TON: '776', TTO: '780', TUN: '788', TUR: '792', TKM: '795',
  TUV: '798', UGA: '800', UKR: '804', ARE: '784', GBR: '826', USA: '840',
  URY: '858', UZB: '860', VUT: '548', VEN: '862', VNM: '704', VIR: '850',
  PSE: '275', YEM: '887', ZMB: '894', ZWE: '716', XKX: '412',
};

// Create reverse mapping from numeric to alpha-3
const numericToAlpha3: Record<string, string> = {};
Object.entries(alpha3ToNumeric).forEach(([alpha3, numeric]) => {
  numericToAlpha3[numeric] = alpha3;
});

interface WorldMapData {
  code: string;
  name: string;
  population: number;
}

interface WorldMapProps {
  data: WorldMapData[];
  year: number;
}

// Color scale for population (using logarithmic scale)
function getPopulationColor(population: number, maxPop: number): string {
  if (!population || population === 0) return '#e5e7eb';
  
  // Use logarithmic scale for better distribution
  const logPop = Math.log10(population);
  const logMax = Math.log10(maxPop);
  const ratio = Math.min(logPop / logMax, 1);
  
  // Gradient from light lavender to deep purple
  const colors = [
    { r: 243, g: 232, b: 255 }, // Very light purple
    { r: 221, g: 196, b: 244 }, // Light purple
    { r: 186, g: 149, b: 224 }, // Medium light purple
    { r: 149, g: 125, b: 173 }, // Pastel mauve
    { r: 124, g: 93, b: 158 },  // Medium purple
    { r: 88, g: 64, b: 129 },   // Deep purple
    { r: 59, g: 40, b: 99 },    // Very deep purple
  ];
  
  const index = Math.min(Math.floor(ratio * (colors.length - 1)), colors.length - 2);
  const t = (ratio * (colors.length - 1)) - index;
  
  const c1 = colors[index];
  const c2 = colors[index + 1];
  
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  
  return `rgb(${r}, ${g}, ${b})`;
}

function formatPopulation(pop: number): string {
  if (pop >= 1_000_000_000) return `${(pop / 1_000_000_000).toFixed(2)}B`;
  if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)}M`;
  if (pop >= 1_000) return `${(pop / 1_000).toFixed(0)}K`;
  return pop.toLocaleString();
}

interface GeoType {
  id: string;
  rsmKey: string;
  properties: { name?: string };
}

const WorldMapContent = memo(function WorldMapContent({ 
  populationMap,
  maxPopulation,
}: { 
  populationMap: Map<string, WorldMapData>;
  maxPopulation: number;
}) {
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  return (
    <div className="relative h-full w-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 130,
          center: [0, 30],
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: GeoType[] }) =>
              geographies.map((geo: GeoType) => {
                const numericCode = geo.id;
                const alpha3Code = numericToAlpha3[numericCode];
                const countryData = alpha3Code ? populationMap.get(alpha3Code) : null;
                const population = countryData?.population || 0;
                const fillColor = getPopulationColor(population, maxPopulation);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { 
                        fill: '#957DAD',
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: { outline: 'none' },
                    }}
                    onMouseEnter={(e: React.MouseEvent) => {
                      const name = countryData?.name || geo.properties.name || 'Unknown';
                      const popStr = population > 0 
                        ? formatPopulation(population) 
                        : 'No data';
                      setTooltipContent(`${name}: ${popStr}`);
                      setTooltipPosition({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseMove={(e: React.MouseEvent) => {
                      setTooltipPosition({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => {
                      setTooltipContent(null);
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltipContent && (
        <div
          className="fixed z-50 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-lg pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 30,
          }}
        >
          {tooltipContent}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-100">
        <div className="text-xs text-gray-500 mb-2">Population</div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgb(243, 232, 255)' }} />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgb(186, 149, 224)' }} />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgb(124, 93, 158)' }} />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgb(59, 40, 99)' }} />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
});

export function WorldMap({ data, year }: WorldMapProps) {
  // Create lookup map for quick access
  const populationMap = useMemo(() => {
    const map = new Map<string, WorldMapData>();
    data.forEach(d => map.set(d.code, d));
    return map;
  }, [data]);

  // Calculate max population for color scaling
  const maxPopulation = useMemo(() => {
    return Math.max(...data.map(d => d.population), 1);
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>No population data available</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 min-h-0">
        <WorldMapContent 
          populationMap={populationMap}
          maxPopulation={maxPopulation}
        />
      </div>
      <div className="mt-2 text-center text-sm text-gray-500">
        World Population Distribution in <span className="font-semibold text-pastel-mauve">{year}</span>
      </div>
    </div>
  );
}

