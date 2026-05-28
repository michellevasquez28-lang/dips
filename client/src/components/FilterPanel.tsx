import React from 'react'
import { FilterState } from '../types'

interface FilterPanelProps {
  filters: FilterState
  onChange: (f: FilterState) => void
  onApply: () => void
  onClear: () => void
}

const DEPARTMENTS = ['Computer Science', 'Studio Art', 'Engineering', 'Film Studies', 'Environmental Science', 'Theater', 'Music']
const PROJECT_TYPES: FilterState['projectTypes'] = ['Solo', 'Group', 'Class Project', 'Independent']
const ALL_TAGS = ['art', 'design', 'CS', 'ML', 'AI', 'environment', 'film', 'music', 'identity', 'data', 'sustainability', 'portrait', 'visualization']
const YEARS = [2022, 2023, 2024]

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]
}

const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="mb-3">
    <p
      className="text-white/60 text-xs uppercase tracking-widest mb-2"
      style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
    >
      {title}
    </p>
    {children}
  </div>
)

const Chip = ({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className="mr-1 mb-1 px-2.5 py-1 rounded-full text-xs transition-all"
    style={{
      fontFamily: 'Cormorant Garamond, Georgia, serif',
      backgroundColor: active ? 'white' : 'rgba(255,255,255,0.12)',
      color: active ? '#1a6b3a' : 'rgba(255,255,255,0.85)',
      border: active ? 'none' : '1px solid rgba(255,255,255,0.25)',
      fontWeight: active ? 700 : 400,
    }}
  >
    {label}
  </button>
)

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onChange, onApply, onClear }) => {
  return (
    <div
      className="mt-2 rounded p-4"
      style={{
        backgroundColor: '#0f4a28',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <Section title="Department">
        <div className="flex flex-wrap">
          {DEPARTMENTS.map((d) => (
            <Chip
              key={d}
              label={d}
              active={filters.departments.includes(d)}
              onClick={() => onChange({ ...filters, departments: toggle(filters.departments, d) })}
            />
          ))}
        </div>
      </Section>

      <Section title="Project Type">
        <div className="flex flex-wrap">
          {PROJECT_TYPES.map((t) => (
            <Chip
              key={t}
              label={t}
              active={filters.projectTypes.includes(t)}
              onClick={() =>
                onChange({ ...filters, projectTypes: toggle(filters.projectTypes, t) })
              }
            />
          ))}
        </div>
      </Section>

      <Section title="Tags">
        <div className="flex flex-wrap">
          {ALL_TAGS.map((t) => (
            <Chip
              key={t}
              label={`#${t}`}
              active={filters.tags.includes(t)}
              onClick={() => onChange({ ...filters, tags: toggle(filters.tags, t) })}
            />
          ))}
        </div>
      </Section>

      <Section title="Year">
        <div className="flex flex-wrap">
          {YEARS.map((y) => (
            <Chip
              key={y}
              label={String(y)}
              active={filters.years.includes(y)}
              onClick={() => onChange({ ...filters, years: toggle(filters.years, y) })}
            />
          ))}
        </div>
      </Section>

      <div className="flex gap-2 mt-3">
        <button
          onClick={onApply}
          className="flex-1 py-2 rounded text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{
            backgroundColor: 'white',
            color: '#1a6b3a',
            fontFamily: 'Cormorant Garamond, Georgia, serif',
          }}
        >
          Apply
        </button>
        <button
          onClick={onClear}
          className="flex-1 py-2 rounded text-sm transition-all hover:bg-white/10"
          style={{
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            fontFamily: 'Cormorant Garamond, Georgia, serif',
          }}
        >
          Clear
        </button>
      </div>
    </div>
  )
}

export default FilterPanel
