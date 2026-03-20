import { Search, Filter, X } from 'lucide-react';
import { STATUS_CONFIG, PRIORITY_CONFIG, KANBAN_COLUMNS } from '../utils/helpers';
import { useState } from 'react';

export default function SearchBar({ filters, onFiltersChange }) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = filters.status !== 'all' || filters.priority !== 'all';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            type="text"
            value={filters.search}
            onChange={e => onFiltersChange({ ...filters, search: e.target.value })}
            placeholder="Buscar tareas..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-800/50 border border-surface-700/50 text-surface-200 placeholder-surface-600 text-sm focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 outline-none transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFiltersChange({ ...filters, search: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-surface-500 hover:text-surface-300 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
            hasActiveFilters
              ? 'border-primary-500/30 bg-primary-500/10 text-primary-400'
              : 'border-surface-700/50 bg-surface-800/50 text-surface-400 hover:text-surface-200'
          }`}
        >
          <Filter size={14} />
          Filtros
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
          )}
        </button>
      </div>

      {/* Filter pills */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-3 glass rounded-xl slide-in">
          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-surface-500 font-medium mr-1">Estado:</span>
            <button
              onClick={() => onFiltersChange({ ...filters, status: 'all' })}
              className={`text-[11px] px-2 py-1 rounded-lg transition-all ${
                filters.status === 'all'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-surface-500 hover:text-surface-300 hover:bg-surface-700/50'
              }`}
            >
              Todos
            </button>
            {KANBAN_COLUMNS.map(status => (
              <button
                key={status}
                onClick={() => onFiltersChange({ ...filters, status })}
                className={`text-[11px] px-2 py-1 rounded-lg transition-all ${
                  filters.status === status
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-surface-500 hover:text-surface-300 hover:bg-surface-700/50'
                }`}
              >
                {STATUS_CONFIG[status].label}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-surface-700/50 self-center" />

          {/* Priority filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-surface-500 font-medium mr-1">Prioridad:</span>
            <button
              onClick={() => onFiltersChange({ ...filters, priority: 'all' })}
              className={`text-[11px] px-2 py-1 rounded-lg transition-all ${
                filters.priority === 'all'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-surface-500 hover:text-surface-300 hover:bg-surface-700/50'
              }`}
            >
              Todas
            </button>
            {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => onFiltersChange({ ...filters, priority: key })}
                className={`text-[11px] px-2 py-1 rounded-lg transition-all ${
                  filters.priority === key
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-surface-500 hover:text-surface-300 hover:bg-surface-700/50'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <>
              <div className="w-px h-6 bg-surface-700/50 self-center" />
              <button
                onClick={() => onFiltersChange({ ...filters, status: 'all', priority: 'all' })}
                className="text-[11px] px-2 py-1 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
              >
                Limpiar filtros
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
