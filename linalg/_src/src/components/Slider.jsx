import { fmt } from '../lib/math.js'

export default function Slider({ label, value, onChange, min = -3, max = 3, step = 0.05, unit = '', color }) {
  return (
    <label className="slider">
      <span className="slider-label">
        {label}
        <b style={color ? { color } : undefined}>
          {fmt(value, 2)}
          {unit}
        </b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  )
}
