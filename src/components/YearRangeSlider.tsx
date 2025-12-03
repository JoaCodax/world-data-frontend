import { Range, getTrackBackground } from 'react-range';

interface YearRangeSliderProps {
  min: number;
  max: number;
  values: [number, number];
  onChange: (values: [number, number]) => void;
}

export function YearRangeSlider({ min, max, values, onChange }: YearRangeSliderProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Year Range</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-1 bg-gray-100 rounded-md font-medium text-gray-600">
            {values[0]}
          </span>
          <span className="text-gray-400">—</span>
          <span className="px-2 py-1 bg-gray-100 rounded-md font-medium text-gray-600">
            {values[1]}
          </span>
        </div>
      </div>
      
      <div className="px-2">
        <Range
          step={1}
          min={min}
          max={max}
          values={values}
          onChange={(newValues) => onChange([newValues[0], newValues[1]])}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              className="h-2 w-full rounded-full"
              style={{
                background: getTrackBackground({
                  values,
                  colors: ['#e5e7eb', '#957DAD', '#e5e7eb'],
                  min,
                  max,
                }),
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props, index }) => {
            const { key, ...restProps } = props;
            return (
              <div
                key={key}
                {...restProps}
                className="w-5 h-5 bg-white rounded-full shadow-md border-2 border-pastel-mauve
                         focus:outline-none focus:ring-2 focus:ring-pastel-purple/30
                         transition-transform hover:scale-110"
              >
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 
                              text-xs text-gray-500 font-medium whitespace-nowrap">
                  {values[index]}
                </div>
              </div>
            );
          }}
        />
      </div>
      
      {/* Year labels */}
      <div className="flex justify-between mt-8 text-xs text-gray-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

