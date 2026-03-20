import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { STATUS_CONFIG, PRIORITY_CONFIG, formatDate, formatRelativeDate, getDueDateStatus } from '../utils/helpers';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import SearchBar from './SearchBar';
import { filterTasks } from '../utils/helpers';
import {
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Settings,
} from 'lucide-react';
import ProgressRing from './ProgressRing';
import { getProjectStats } from '../utils/helpers';

export default function TableView({ project, onEditProject, onSelectTask }) {
  const { getProjectTasks, updateTask, navigateToDashboard } = useApp();
  const allTasks = getProjectTasks(project.id);
  const stats = getProjectStats(allTasks);

  const [filters, setFilters] = useState({ search: '', status: 'all', priority: 'all' });
  const [sortField, setSortField] = useState('status');
  const [sortDir, setSortDir] = useState('asc');

  const filtered = filterTasks(allTasks, filters);

  const sorted = [...filtered].sort((a, b) => {
    let valA, valB;
    switch (sortField) {
      case 'title':
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
        break;
      case 'status':
        valA = STATUS_CONFIG[a.status]?.order ?? 0;
        valB = STATUS_CONFIG[b.status]?.order ?? 0;
        break;
      case 'priority':
        valA = PRIORITY_CONFIG[a.priority]?.order ?? 0;
        valB = PRIORITY_CONFIG[b.priority]?.order ?? 0;
        break;
      case 'dueDate':
        valA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        valB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        break;
      default:
        valA = 0;
        valB = 0;
    }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-surface-600" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-primary-400" />
      : <ChevronDown size={12} className="text-primary-400" />;
  };

  const dueDateClasses = {
    overdue: 'text-red-400 font-semibold',
    today: 'text-amber-400',
    tomorrow: 'text-amber-300',
    soon: 'text-orange-300',
    normal: 'text-surface-400',
    none: 'text-surface-600',
  };

  const handleStatusChange = (taskId, newStatus) => {
    updateTask(taskId, { status: newStatus });
  };

  const handlePriorityChange = (taskId, newPriority) => {
    updateTask(taskId, { priority: newPriority });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 px-6 lg:px-8 py-4 border-b border-surface-700/50 glass">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={navigateToDashboard}
              className="p-2 rounded-xl text-surface-500 hover:text-surface-200 hover:bg-surface-700/50 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: project.color }}
              >
                {project.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-bold text-surface-100">{project.name}</h1>
                <p className="text-xs text-surface-500">{project.description}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ProgressRing progress={stats.progress} size={40} strokeWidth={3} />
            <button onClick={onEditProject} className="p-2 rounded-xl text-surface-500 hover:text-surface-200 hover:bg-surface-700/50 transition-all">
              <Settings size={16} />
            </button>
          </div>
        </div>
        <SearchBar filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="glass rounded-2xl border border-surface-700/30 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-700/50">
                {[
                  { key: 'title', label: 'Tarea', width: 'w-[40%]' },
                  { key: 'status', label: 'Estado', width: 'w-[15%]' },
                  { key: 'priority', label: 'Prioridad', width: 'w-[15%]' },
                  { key: 'dueDate', label: 'Fecha Límite', width: 'w-[15%]' },
                ].map(col => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className={`${col.width} text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider cursor-pointer hover:text-surface-300 transition-colors select-none`}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      <SortIcon field={col.key} />
                    </div>
                  </th>
                ))}
                <th className="w-[15%] text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Etiquetas
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((task, i) => {
                const dueStatus = getDueDateStatus(task.dueDate);
                return (
                  <tr
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className={`border-b border-surface-700/20 cursor-pointer transition-colors hover:bg-surface-700/30 ${
                      i % 2 === 0 ? 'bg-surface-800/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-surface-200 font-medium">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-surface-500 mt-0.5 line-clamp-1">{task.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={e => handleStatusChange(task.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-lg bg-surface-900/80 border border-surface-700/50 text-surface-300 cursor-pointer focus:outline-none focus:border-primary-500/50 appearance-none"
                      >
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                          <option key={key} value={key}>{cfg.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <select
                        value={task.priority}
                        onChange={e => handlePriorityChange(task.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-lg bg-surface-900/80 border border-surface-700/50 text-surface-300 cursor-pointer focus:outline-none focus:border-primary-500/50 appearance-none"
                      >
                        {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                          <option key={key} value={key}>{cfg.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className={`px-4 py-3 text-xs ${dueDateClasses[dueStatus]}`}>
                      {task.dueDate ? (
                        <div>
                          <span>{formatDate(task.dueDate)}</span>
                          <span className="block text-[10px] opacity-70">{formatRelativeDate(task.dueDate)}</span>
                        </div>
                      ) : (
                        <span className="text-surface-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {task.tags?.map(tag => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface-700/70 text-surface-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-surface-600 text-sm">
                    No hay tareas que coincidan con los filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
