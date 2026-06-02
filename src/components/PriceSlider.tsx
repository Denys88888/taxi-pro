import { useState } from 'react';
import { motion } from 'framer-motion';

interface PriceSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

export function PriceSlider({
  min = 1,
  max = 20,
  step = 0.5,
  value,
  onChange,
}: PriceSliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-text-secondary text-sm font-medium">Suggested Price</span>
        <motion.span
          className="text-primary font-bold text-2xl font-mono"
          animate={{ scale: isDragging ? 1.1 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          {value.toFixed(2)}
        </motion.span>
      </div>

      <div className="relative w-full h-6 flex items-center">
        {/* Track background */}
        <div className="absolute w-full h-1.5 rounded-full bg-bg-elevated" />

        {/* Filled track */}
        <motion.div
          className="absolute h-1.5 rounded-full bg-primary"
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
          animate={{ boxShadow: isDragging ? '0 0 12px rgba(0,200,83,0.5)' : 'none' }}
        />

        {/* Slider input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute w-full h-6 opacity-0 cursor-pointer z-10"
        />

        {/* Custom thumb */}
        <motion.div
          className="absolute w-6 h-6 rounded-full bg-primary border-[3px] border-white pointer-events-none"
          style={{
            left: `calc(${((value - min) / (max - min)) * 100}% - 12px)`,
          }}
          animate={{
            scale: isDragging ? 1.2 : 1,
            boxShadow: isDragging
              ? '0 0 16px rgba(0,200,83,0.6)'
              : '0 0 8px rgba(0,200,83,0.3)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        />
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-text-tertiary text-xs font-mono">{min}</span>
        <span className="text-text-tertiary text-xs font-mono">{max}</span>
      </div>
    </div>
  );
}
