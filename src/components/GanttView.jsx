import { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { STATUS_CONFIG, PRIORITY_CONFIG, KANBAN_COLUMNS, filterTasks, getProjectStats } from '../utils/helpers';
import SearchBar from './SearchBar';
import ProgressRing from './ProgressRing';
import { differenceInDays, format, addDays, startOfDay, isWithinInterval, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Settings, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

const PRIORITY_COLORS = {
  low: '#10b981',
  medium: '#3b82f6',
  high: '#f97316',
  urgent: '#ef4444',
};

const STATUS_COLORS = {
  backlog: '#64748b',
  todo: '#3b82f6',
  'in-progress': '#8b5cf6',
  review: '#f59e0b',
  done: '#10b981',
};

export default function GanttView({ project, onEditProject, onSelectTask }) {
  const { getProjectTasks, navigateToDashboard } = useApp();
  const allTasks = getProjectTasks(project.id);
  const stats = getProjectStats(allTasks);

  const [filters, setFilters] = useState({ search: '', status: 'all', priority: 'all' });
  const [dayWidth, setDayWidth] = useState(40);
  const scrollRef = useRef(null);

  const filtered = filterTasks(allTasks, filters);

  // Only show tasks with due dates
  const tasksWithDates = filtered.filter(t => t.dueDate);

  // Calculate date range
  const { startDate, endDate, totalDays } = useMemo(() => {
    if (tasksWithDates.length === 0) {
      const today = startOfDay(new Date());
      return { startDate: today, endDate: addDays(today, 30), totalDays: 30 };
    }

    const dates = tasksWithDates.map(t => new Date(t.dueDate));
    const createdDates = tasksWithDates.map(t => new Date(t.createdAt));
    const allDates = [...dates, ...createdDates, new Date()];

    let min = new Date(Math.min(...allDates));
    let max = new Date(Math.max(...allDates));

    // Add padding
    min = addDays(startOfDay(min), -3);
    max = addDays(startOfDay(max), 5);

    const totalDays = differenceInDays(max, min) + 1;
    return { startDate: min, endDate: max, totalDays: Math.max(totalDays, 14) };
  }, [tasksWithDates]);

  // Generate day headers
  const days = useMemo(() => {
    const result = [];
    for (let i = 0; i < totalDays; i++) {
      const date = addDays(startDate, i);
      result.push(date);
    }
    return result;
  }, [startDate, totalDays]);

  // Scroll to today on mount
  useEffect(() => {
    if (scrollRef.current) {
      const todayOffset = differenceInDays(new Date(), startDate);
      const scrollTo = todayOffset * dayWidth - 200;
      scrollRef.current.scrollLeft = Math.max(0, scrollTo);
    }
  }, [startDate, dayWidth]);

  const getTaskBarStyle = (task) => {
    const due = startOfDay(new Date(task.dueDate));
    const created = startOfDay(new Date(task.createdAt));

    // Task bar spans from creation to due date (min 1 day)
    const startOffset = Math.max(0, differenceInDays(created, startDate));
    const duration = Math.max(1, differenceInDays(due, created) + 1);

    return {
      left: `${startOffset * dayWidth}px`,
      width: `${duration * dayWidth - 4}px`,
    };
  };

  const todayOffset = differenceInDays(startOfDay(new Date()), startDate);

  const handleZoom = (dir) => {
    setDayWidth(w => Math.min(80, Math.max(20, w + dir * 10)));
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 px-6 lg:px-8 py-4 border-b border-surface-700/50 glass">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button onClick={navigateToDashboard} className="p-2 rounded-xl text-surface-500 hover:text-surface-200 hover:bg-surface-700/50 transition-all">
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: project.color }}>
                {project.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-bold text-surface-100">{project.name}</h1>
                <p className="text-xs text-surface-500">{project.description}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Zoom controls */}
            <div className="flex items-center gap-1 glass rounded-lg p-1">
              <button onClick={() => handleZoom(-1)} className="p-1.5 rounded-md text-surface-500 hover:text-surface-200 hover:bg-surface-700/50 transition-all">
                <ZoomOut size={14} />
              </button>
              <span className="text-[10px] text-surface-500 px-1 tabular-nums">{dayWidth}px</span>
              <button onClick={() => handleZoom(1)} className="p-1.5 rounded-md text-surface-500 hover:text-surface-200 hover:bg-surface-700/50 transition-all">
                <ZoomIn size={14} />
              </button>
            </div>
            <ProgressRing progress={stats.progress} size={40} strokeWidth={3} />
            <button onClick={onEditProject} className="p-2 rounded-xl text-surface-500 hover:text-surface-200 hover:bg-surface-700/50 transition-all">
              <Settings size={16} />
            </button>
          </div>
        </div>
        <SearchBar filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Gantt Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Task list (left side) */}
        <div className="w-64 flex-shrink-0 border-r border-surface-700/50 overflow-y-auto">
          {/* Header */}
          <div className="h-14 px-4 flex items-center border-b border-surface-700/50 bg-surface-800/50">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Tareas</span>
          </div>
          {/* Task rows */}
          {tasksWithDates.map(task => (
            <div
              key={task.id}
              onClick={() => onSelectTask(task)}
              className="h-12 px-4 flex items-center gap-2 border-b border-surface-700/20 cursor-pointer hover:bg-surface-700/30 transition-colors group"
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: STATUS_COLORS[task.status] }}
              />
              <span className="text-xs text-surface-300 truncate flex-1 group-hover:text-white transition-colors">
                {task.title}
              </span>
              <span className="text-[10px] text-surface-600">
                {PRIORITY_CONFIG[task.priority]?.label}
              </span>
            </div>
          ))}
          {tasksWithDates.length === 0 && (
            <div className="px-4 py-8 text-xs text-surface-600 text-center">
              No hay tareas con fecha límite
            </div>
          )}
        </div>

        {/* Timeline (right side) */}
        <div className="flex-1 overflow-auto" ref={scrollRef}>
          <div style={{ width: `${totalDays * dayWidth}px`, minHeight: '100%' }}>
            {/* Day headers */}
            <div className="h-14 flex border-b border-surface-700/50 bg-surface-800/50 sticky top-0 z-10">
              {days.map((day, i) => {
                const isToday = differenceInDays(day, startOfDay(new Date())) === 0;
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                return (
                  <div
                    key={i}
                    style={{ width: `${dayWidth}px` }}
                    className={`flex-shrink-0 flex flex-col items-center justify-center border-r border-surface-700/20 ${
                      isToday ? 'bg-primary-500/10' : isWeekend ? 'bg-surface-900/50' : ''
                    }`}
                  >
                    <span className={`text-[9px] uppercase ${isToday ? 'text-primary-400 font-bold' : 'text-surface-600'}`}>
                      {format(day, 'EEE', { locale: es })}
                    </span>
                    <span className={`text-[11px] ${isToday ? 'text-primary-400 font-bold' : 'text-surface-400'}`}>
                      {format(day, 'd')}
                    </span>
                    {i === 0 || day.getDate() === 1 ? (
                      <span className="text-[8px] text-surface-600 uppercase">
                        {format(day, 'MMM', { locale: es })}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Task bars */}
            <div className="relative">
              {/* Today line */}
              {todayOffset >= 0 && todayOffset < totalDays && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-primary-500/60 z-20"
                  style={{ left: `${todayOffset * dayWidth + dayWidth / 2}px` }}
                />
              )}

              {/* Weekend backgrounds */}
              {days.map((day, i) => {
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                if (!isWeekend) return null;
                return (
                  <div
                    key={`bg-${i}`}
                    className="absolute top-0 bottom-0 bg-surface-900/30"
                    style={{ left: `${i * dayWidth}px`, width: `${dayWidth}px`, height: `${tasksWithDates.length * 48}px` }}
                  />
                );
              })}

              {/* Task rows */}
              {tasksWithDates.map((task) => {
                const barStyle = getTaskBarStyle(task);
                const isDone = task.status === 'done';
                const isOverdue = !isDone && isBefore(new Date(task.dueDate), new Date());

                return (
                  <div
                    key={task.id}
                    className="h-12 relative border-b border-surface-700/10"
                  >
                    {/* Bar */}
                    <div
                      onClick={() => onSelectTask(task)}
                      className={`absolute top-2 h-8 rounded-lg cursor-pointer transition-all hover:brightness-125 hover:shadow-lg group flex items-center px-2 overflow-hidden ${
                        isDone ? 'opacity-60' : isOverdue ? 'pulse-urgent' : ''
                      }`}
                      style={{
                        ...barStyle,
                        backgroundColor: PRIORITY_COLORS[task.priority] + '30',
                        borderLeft: `3px solid ${PRIORITY_COLORS[task.priority]}`,
                      }}
                    >
                      <span className="text-[10px] text-surface-200 truncate font-medium">
                        {task.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
