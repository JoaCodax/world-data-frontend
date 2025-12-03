/**
 * Format a large number with abbreviations (K, M, B)
 */
export function formatPopulation(value: number | null): string {
  if (value === null || value === undefined) return 'N/A';
  
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  
  return value.toString();
}

/**
 * Get ISO 2-letter code from 3-letter code for flag display
 * Note: This is a simplified mapping for common countries
 */
const iso3ToIso2Map: Record<string, string> = {
  'AFG': 'af', 'ALB': 'al', 'DZA': 'dz', 'AND': 'ad', 'AGO': 'ao',
  'ARG': 'ar', 'ARM': 'am', 'AUS': 'au', 'AUT': 'at', 'AZE': 'az',
  'BGD': 'bd', 'BLR': 'by', 'BEL': 'be', 'BEN': 'bj', 'BTN': 'bt',
  'BOL': 'bo', 'BIH': 'ba', 'BWA': 'bw', 'BRA': 'br', 'BRN': 'bn',
  'BGR': 'bg', 'BFA': 'bf', 'BDI': 'bi', 'KHM': 'kh', 'CMR': 'cm',
  'CAN': 'ca', 'CAF': 'cf', 'TCD': 'td', 'CHL': 'cl', 'CHN': 'cn',
  'COL': 'co', 'COD': 'cd', 'COG': 'cg', 'CRI': 'cr', 'HRV': 'hr',
  'CUB': 'cu', 'CYP': 'cy', 'CZE': 'cz', 'DNK': 'dk', 'DOM': 'do',
  'ECU': 'ec', 'EGY': 'eg', 'SLV': 'sv', 'GNQ': 'gq', 'ERI': 'er',
  'EST': 'ee', 'SWZ': 'sz', 'ETH': 'et', 'FIN': 'fi', 'FRA': 'fr',
  'GAB': 'ga', 'GMB': 'gm', 'GEO': 'ge', 'DEU': 'de', 'GHA': 'gh',
  'GRC': 'gr', 'GTM': 'gt', 'GIN': 'gn', 'GNB': 'gw', 'GUY': 'gy',
  'HTI': 'ht', 'HND': 'hn', 'HUN': 'hu', 'ISL': 'is', 'IND': 'in',
  'IDN': 'id', 'IRN': 'ir', 'IRQ': 'iq', 'IRL': 'ie', 'ISR': 'il',
  'ITA': 'it', 'CIV': 'ci', 'JAM': 'jm', 'JPN': 'jp', 'JOR': 'jo',
  'KAZ': 'kz', 'KEN': 'ke', 'PRK': 'kp', 'KOR': 'kr', 'KWT': 'kw',
  'KGZ': 'kg', 'LAO': 'la', 'LVA': 'lv', 'LBN': 'lb', 'LSO': 'ls',
  'LBR': 'lr', 'LBY': 'ly', 'LTU': 'lt', 'LUX': 'lu', 'MDG': 'mg',
  'MWI': 'mw', 'MYS': 'my', 'MLI': 'ml', 'MRT': 'mr', 'MUS': 'mu',
  'MEX': 'mx', 'MDA': 'md', 'MNG': 'mn', 'MNE': 'me', 'MAR': 'ma',
  'MOZ': 'mz', 'MMR': 'mm', 'NAM': 'na', 'NPL': 'np', 'NLD': 'nl',
  'NZL': 'nz', 'NIC': 'ni', 'NER': 'ne', 'NGA': 'ng', 'MKD': 'mk',
  'NOR': 'no', 'OMN': 'om', 'PAK': 'pk', 'PAN': 'pa', 'PNG': 'pg',
  'PRY': 'py', 'PER': 'pe', 'PHL': 'ph', 'POL': 'pl', 'PRT': 'pt',
  'QAT': 'qa', 'ROU': 'ro', 'RUS': 'ru', 'RWA': 'rw', 'SAU': 'sa',
  'SEN': 'sn', 'SRB': 'rs', 'SLE': 'sl', 'SGP': 'sg', 'SVK': 'sk',
  'SVN': 'si', 'SOM': 'so', 'ZAF': 'za', 'SSD': 'ss', 'ESP': 'es',
  'LKA': 'lk', 'SDN': 'sd', 'SUR': 'sr', 'SWE': 'se', 'CHE': 'ch',
  'SYR': 'sy', 'TWN': 'tw', 'TJK': 'tj', 'TZA': 'tz', 'THA': 'th',
  'TLS': 'tl', 'TGO': 'tg', 'TTO': 'tt', 'TUN': 'tn', 'TUR': 'tr',
  'TKM': 'tm', 'UGA': 'ug', 'UKR': 'ua', 'ARE': 'ae', 'GBR': 'gb',
  'USA': 'us', 'URY': 'uy', 'UZB': 'uz', 'VEN': 've', 'VNM': 'vn',
  'YEM': 'ye', 'ZMB': 'zm', 'ZWE': 'zw',
};

export function getIso2Code(iso3Code: string): string | null {
  return iso3ToIso2Map[iso3Code] || null;
}

