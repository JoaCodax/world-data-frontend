# Frontend — World Data

A modern React application for visualizing global population data with interactive charts, country selection, and year range filtering.

## ✨ Features

- 📊 **Interactive Line Charts** — Chart.js-powered population visualizations
- 🏳️ **Country Flags** — Visual country identification with `flag-icons`
- 🔍 **Search & Filter** — Quickly find countries by name or code
- 📅 **Year Range Slider** — Adjust the time range with a dual-handle slider
- ⚡ **Optimized Data Fetching** — TanStack Query for caching and state management
- 🎨 **Modern UI** — Tailwind CSS with custom pastel color palette

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on `localhost:8000` (see backend README)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at http://localhost:5173

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── api/
│   └── client.ts         # Axios API client
├── components/
│   ├── CountrySidebar.tsx    # Country list with search/selection
│   ├── PopulationChart.tsx   # Chart.js line chart
│   └── YearRangeSlider.tsx   # Dual-handle year range picker
├── hooks/
│   └── usePopulationData.ts  # TanStack Query hooks
├── types/
│   └── index.ts              # TypeScript interfaces
├── utils/
│   ├── colors.ts             # Chart color palette
│   └── format.ts             # Number formatting, ISO code conversion
├── App.tsx                   # Main application component
├── main.tsx                  # React entry point
└── index.css                 # Tailwind CSS + custom styles
```

## 🧩 Components

### `<App />`

The main application component that orchestrates:
- Country selection state
- Year range state
- API data fetching via custom hooks
- Layout composition

### `<PopulationChart />`

Renders a Chart.js line chart with:
- Multiple country series
- Responsive sizing
- Formatted population tooltips
- Color-coded legend

**Props:**
```tsx
interface Props {
  data: CountryPopulationSeries[];
  yearRange: [number, number];
}
```

### `<CountrySidebar />`

Displays a scrollable list of countries with:
- Search input for filtering
- Checkbox selection with color indicators
- Country flags via `flag-icons`
- Population display
- Rank badges for top countries

**Props:**
```tsx
interface Props {
  countries: Country[];
  selectedCodes: Set<string>;
  onToggle: (code: string) => void;
  isLoading: boolean;
}
```

### `<YearRangeSlider />`

A dual-handle range slider built with `react-range`:
- Min/Max year constraints
- Visual track with filled range
- Year labels at both ends

**Props:**
```tsx
interface Props {
  min: number;
  max: number;
  values: [number, number];
  onChange: (values: [number, number]) => void;
}
```

## 🪝 Hooks

### `useCountries()`

Fetches the list of all countries with rankings.

```tsx
const { data, isLoading, error } = useCountries();
// data.countries: Country[]
```

### `usePopulation(params, enabled)`

Fetches population time-series data.

```tsx
const { data, isLoading } = usePopulation({
  country_codes: ['USA', 'CHN'],
  year_start: 2000,
  year_end: 2024,
}, true);
// data.series: CountryPopulationSeries[]
```

## 🎨 Styling

### Color Palette

Custom pastel colors defined in `tailwind.config.js`:

| Name | Value | Usage |
|------|-------|-------|
| `pastel-mauve` | `#B8A9C9` | Primary accent |
| `pastel-peach` | `#FFD4B8` | Chart color 3 |
| `pastel-mint` | `#B8E0D2` | Chart color 4 |
| `pastel-lavender` | `#D4C4E3` | Chart color 5 |
| `pastel-rose` | `#EACBD2` | Chart color 6 |
| `pastel-sky` | `#A8D5E5` | Chart color 7 |
| `pastel-lemon` | `#F5E6A3` | Chart color 8 |
| `pastel-coral` | `#F5B8A3` | Chart color 9 |
| `pastel-purple` | `#C9B8E0` | UI accents |

### Chart Colors

The chart uses a curated 10-color palette for optimal visual distinction:

```ts
// utils/colors.ts
const CHART_COLORS = [
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  // ...
];
```

## 🔌 API Integration

### Base URL

The Vite dev server proxies `/api` requests to the backend:

```ts
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost:8000'
  }
}
```

### Endpoints Used

| Endpoint | Hook | Description |
|----------|------|-------------|
| `GET /api/countries` | `useCountries()` | Fetch country list |
| `GET /api/population` | `usePopulation()` | Fetch population data |

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `react` 19 | UI framework |
| `axios` | HTTP client |
| `@tanstack/react-query` | Data fetching & caching |
| `chart.js` + `react-chartjs-2` | Charts |
| `react-range` | Range slider component |
| `flag-icons` | Country flag CSS sprites |
| `tailwindcss` | Utility-first CSS |

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### TypeScript Configuration

The project uses strict TypeScript with:
- React 19 types
- Path aliases (optional)
- Vite environment types

### Adding a New Chart Type

1. Create component in `src/components/`
2. Add types to `src/types/index.ts`
3. Create query hook in `src/hooks/`
4. Import and use in `App.tsx`

## 🖼️ Assets

- `public/globe.svg` — Application icon

## 📝 Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | (Optional) Override API base URL |

Create a `.env.local` file to set variables locally.



