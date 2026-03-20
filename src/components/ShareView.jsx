import { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  getProjectStats,
  getDueDateStatus,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  formatDate,
  formatRelativeDate,
} from '../utils/helpers';
import {
  Share2,
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  TrendingUp,
  Copy,
  Download,
  Filter,
} from 'lucide-react';
import { isToday, isThisWeek, startOfWeek, endOfWeek, format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ShareView({ onClose }) {
  const { projects, tasks } = useApp();
  const [period, setPeriod] = useState('week'); // 'today' | 'week' | 'all'
  const contentRef = useRef(null);

  const now = new Date();

  // Filter tasks by period
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (period === 'all') return true;
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      if (period === 'today') return isToday(due);
      if (period === 'week') return isThisWeek(due, { weekStartsOn: 1 });
      return true;
    });
  }, [tasks, period]);

  // Stats
  const total = filteredTasks.length;
  const done = filteredTasks.filter(t => t.status === 'done').length;
  const inProgress = filteredTasks.filter(t => t.status === 'in-progress').length;
  const overdue = filteredTasks.filter(t => t.status !== 'done' && getDueDateStatus(t.dueDate) === 'overdue').length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  // Group tasks by project
  const tasksByProject = useMemo(() => {
    const map = {};
    filteredTasks.forEach(t => {
      if (!map[t.projectId]) map[t.projectId] = [];
      map[t.projectId].push(t);
    });
    return map;
  }, [filteredTasks]);

  const periodLabel = {
    today: 'Hoy — ' + format(now, "d 'de' MMMM yyyy", { locale: es }),
    week: `Semana — ${format(startOfWeek(now, { weekStartsOn: 1 }), 'd MMM', { locale: es })} al ${format(endOfWeek(now, { weekStartsOn: 1 }), 'd MMM yyyy', { locale: es })}`,
    all: 'Todas las tareas',
  };

  const generateText = () => {
    let text = `📋 DevBoard — ${periodLabel[period]}\n`;
    text += `${'═'.repeat(40)}\n\n`;
    text += `📊 Resumen: ${done}/${total} completadas (${progress}%)`;
    if (overdue > 0) text += ` | ⚠️ ${overdue} vencidas`;
    if (inProgress > 0) text += ` | 🔄 ${inProgress} en progreso`;
    text += '\n\n';

    projects.forEach(project => {
      const projectTasks = tasksByProject[project.id];
      if (!projectTasks || projectTasks.length === 0) return;

      const pStats = getProjectStats(projectTasks);
      text += `▸ ${project.name} — ${pStats.done}/${pStats.total} (${pStats.progress}%)\n`;

      projectTasks.forEach(task => {
        const icon = task.status === 'done' ? '✅' : task.status === 'in-progress' ? '🔄' : '⬜';
        const priority = task.priority === 'urgent' ? ' 🔴' : task.priority === 'high' ? ' 🟠' : '';
        const dueText = task.dueDate ? ` — ${formatRelativeDate(task.dueDate)}` : '';
        text += `  ${icon} ${task.title}${priority}${dueText}\n`;
      });
      text += '\n';
    });

    text += `Generado: ${format(now, "d MMM yyyy, HH:mm", { locale: es })}`;
    return text;
  };

  const handleCopy = async () => {
    const text = generateText();
    try {
      await navigator.clipboard.writeText(text);
      alert('¡Copiado al portapapeles!');
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('¡Copiado al portapapeles!');
    }
  };

  const handleDownloadImage = async () => {
    if (!contentRef.current) return;
    try {
      const { default: html2canvas } = await import(/* @vite-ignore */ 'html2canvas');
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `devboard-${period}-${format(now, 'yyyy-MM-dd')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // Fallback: just copy text
      handleCopy();
    }
  };

  const statusIcon = (status) => {
    switch (status) {
      case 'done': return <CheckCircle2 size={13} className="text-emerald-400" />;
      case 'in-progress': return <Clock size={13} className="text-primary-400" />;
      case 'review': return <AlertTriangle size={13} className="text-amber-400" />;
      default: return <div className="w-3 h-3 rounded-full border-2 border-surface-600" />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto bg-surface-900 rounded-2xl border border-surface-700/50 shadow-2xl"
        style={{ animation: 'modalSlide 0.2s ease-out' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-surface-700/50 bg-surface-900/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Share2 size={16} className="text-primary-400" />
            <h2 className="text-sm font-semibold text-surface-200">Compartir Resumen</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-all"
            >
              <Copy size={12} />
              Copiar texto
            </button>
            <button
              onClick={handleDownloadImage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-700/50 text-surface-300 hover:bg-surface-700/70 transition-all"
            >
              <Download size={12} />
              Imagen
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-700/50 transition-all">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Period filter */}
        <div className="px-4 py-3 border-b border-surface-700/30 flex items-center gap-2">
          <Filter size={13} className="text-surface-500" />
          {(['today', 'week', 'all']).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                period === p
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-surface-500 hover:text-surface-300 hover:bg-surface-700/50'
              }`}
            >
              {p === 'today' ? 'Hoy' : p === 'week' ? 'Esta Semana' : 'Todo'}
            </button>
          ))}
        </div>

        {/* Shareable content */}
        <div ref={contentRef} className="p-5 space-y-5 bg-surface-900">
          {/* Period title */}
          <div className="text-center">
            <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
              {periodLabel[period]}
            </h3>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 rounded-xl bg-surface-800/50 border border-surface-700/30">
              <p className="text-lg font-bold text-surface-100">{total}</p>
              <p className="text-[10px] text-surface-500">Total</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-lg font-bold text-emerald-400">{done}</p>
              <p className="text-[10px] text-emerald-400/70">Completadas</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
              <p className="text-lg font-bold text-primary-400">{inProgress}</p>
              <p className="text-[10px] text-primary-400/70">En Progreso</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-lg font-bold text-red-400">{overdue}</p>
              <p className="text-[10px] text-red-400/70">Vencidas</p>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-xs text-surface-500">Progreso</span>
              <span className="text-xs font-bold gradient-text">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-surface-700/50 rounded-full overflow-hidden">
              <div className="h-full rounded-full gradient-primary transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Tasks by project */}
          {projects.map(project => {
            const projectTasks = tasksByProject[project.id];
            if (!projectTasks || projectTasks.length === 0) return null;

            const pStats = getProjectStats(projectTasks);

            return (
              <div key={project.id} className="rounded-xl border border-surface-700/30 overflow-hidden">
                {/* Project header */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-800/50">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                  <span className="text-xs font-semibold text-surface-300 flex-1">{project.name}</span>
                  <span className="text-[10px] text-surface-500 tabular-nums">{pStats.done}/{pStats.total} ({pStats.progress}%)</span>
                </div>

                {/* Task list */}
                <div className="divide-y divide-surface-700/20">
                  {projectTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2.5 px-4 py-2">
                      {statusIcon(task.status)}
                      <span className={`text-xs flex-1 ${task.status === 'done' ? 'text-surface-500 line-through' : 'text-surface-300'}`}>
                        {task.title}
                      </span>
                      {task.priority === 'urgent' && <Flame size={11} className="text-red-400" />}
                      {task.priority === 'high' && <AlertTriangle size={11} className="text-orange-400" />}
                      {task.dueDate && (
                        <span className={`text-[10px] ${getDueDateStatus(task.dueDate) === 'overdue' ? 'text-red-400' : 'text-surface-600'}`}>
                          {formatRelativeDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {total === 0 && (
            <div className="text-center py-8 text-surface-600 text-sm">
              No hay tareas para este periodo
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-[10px] text-surface-600 pt-2">
            DevBoard · Generado {format(now, "d MMM yyyy, HH:mm", { locale: es })}
          </div>
        </div>
      </div>
    </div>
  );
}
