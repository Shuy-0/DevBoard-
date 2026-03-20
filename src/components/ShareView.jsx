import { useState, useMemo, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  getProjectStats,
  getDueDateStatus,
  STATUS_CONFIG,
  formatDate,
  formatRelativeDate,
} from '../utils/helpers';
import html2canvas from 'html2canvas';
import {
  Share2,
  X,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  Copy,
  Image,
  Filter,
  Check,
  CircleDot,
  CircleAlert,
} from 'lucide-react';
import { isToday, isThisWeek, startOfWeek, endOfWeek, format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ShareView({ onClose }) {
  const { projects, tasks } = useApp();
  const [period, setPeriod] = useState('week');
  const [copied, setCopied] = useState(false);
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
  const pending = filteredTasks.filter(t => t.status !== 'done' && t.status !== 'in-progress').length;
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
    today: 'Hoy, ' + format(now, "d 'de' MMMM yyyy", { locale: es }),
    week: `Semana del ${format(startOfWeek(now, { weekStartsOn: 1 }), 'd', { locale: es })} al ${format(endOfWeek(now, { weekStartsOn: 1 }), "d 'de' MMMM yyyy", { locale: es })}`,
    all: 'Todas las tareas',
  };

  // Human-readable status labels
  const friendlyStatus = (status) => {
    switch (status) {
      case 'done': return 'Terminada';
      case 'in-progress': return 'Trabajando';
      case 'review': return 'En revisión';
      case 'todo': return 'Por hacer';
      case 'backlog': return 'Pendiente';
      default: return status;
    }
  };

  const friendlyPriority = (priority) => {
    switch (priority) {
      case 'urgent': return '🔴 Urgente';
      case 'high': return '🟠 Alta';
      case 'medium': return '';
      case 'low': return '';
      default: return '';
    }
  };

  const generateText = () => {
    let text = `📋 Reporte de actividades\n`;
    text += `📅 ${periodLabel[period]}\n`;
    text += `${'─'.repeat(35)}\n\n`;

    text += `✅ ${done} terminadas de ${total} tareas (${progress}% completado)\n`;
    if (inProgress > 0) text += `🔄 ${inProgress} en las que se está trabajando ahora\n`;
    if (overdue > 0) text += `⚠️ ${overdue} tareas pasadas de fecha\n`;
    text += '\n';

    projects.forEach(project => {
      const projectTasks = tasksByProject[project.id];
      if (!projectTasks || projectTasks.length === 0) return;

      const pStats = getProjectStats(projectTasks);
      text += `📂 ${project.name} (${pStats.progress}% completado)\n`;

      // Group by status for clarity
      const doneT = projectTasks.filter(t => t.status === 'done');
      const workingT = projectTasks.filter(t => t.status === 'in-progress');
      const otherT = projectTasks.filter(t => t.status !== 'done' && t.status !== 'in-progress');

      if (workingT.length > 0) {
        text += `  🔄 Trabajando ahora:\n`;
        workingT.forEach(t => {
          const pri = friendlyPriority(t.priority);
          text += `     • ${t.title}${pri ? ' ' + pri : ''}\n`;
        });
      }
      if (otherT.length > 0) {
        text += `  📋 Pendientes:\n`;
        otherT.forEach(t => {
          const pri = friendlyPriority(t.priority);
          const dueText = t.dueDate ? ` (${formatRelativeDate(t.dueDate)})` : '';
          text += `     • ${t.title}${pri ? ' ' + pri : ''}${dueText}\n`;
        });
      }
      if (doneT.length > 0) {
        text += `  ✅ Terminadas:\n`;
        doneT.forEach(t => {
          text += `     • ${t.title}\n`;
        });
      }
      text += '\n';
    });

    text += `─────────────────────────\n`;
    text += `Generado: ${format(now, "d 'de' MMMM yyyy, HH:mm", { locale: es })}`;
    return text;
  };

  const handleCopy = useCallback(async () => {
    const text = generateText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [period, filteredTasks]);

  // Convert oklch colors to hex for html2canvas compatibility
  const fixOklchColors = (element) => {
    const allElements = element.querySelectorAll('*');
    const originals = [];

    const toHex = (color) => {
      if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return color;
      if (color.includes('oklch')) {
        // Create a temp element to resolve the color
        const tmp = document.createElement('div');
        tmp.style.color = color;
        document.body.appendChild(tmp);
        const resolved = getComputedStyle(tmp).color;
        document.body.removeChild(tmp);
        return resolved;
      }
      return color;
    };

    [element, ...allElements].forEach(el => {
      const cs = getComputedStyle(el);
      const orig = {
        el,
        color: el.style.color,
        backgroundColor: el.style.backgroundColor,
        borderColor: el.style.borderColor,
        borderTopColor: el.style.borderTopColor,
        borderBottomColor: el.style.borderBottomColor,
      };
      originals.push(orig);

      if (cs.color?.includes('oklch')) el.style.color = toHex(cs.color);
      if (cs.backgroundColor?.includes('oklch')) el.style.backgroundColor = toHex(cs.backgroundColor);
      if (cs.borderColor?.includes('oklch')) el.style.borderColor = toHex(cs.borderColor);
      if (cs.borderTopColor?.includes('oklch')) el.style.borderTopColor = toHex(cs.borderTopColor);
      if (cs.borderBottomColor?.includes('oklch')) el.style.borderBottomColor = toHex(cs.borderBottomColor);
    });

    return originals;
  };

  const restoreColors = (originals) => {
    originals.forEach(({ el, ...styles }) => {
      Object.entries(styles).forEach(([prop, val]) => {
        el.style[prop] = val;
      });
    });
  };

  const handleDownloadImage = useCallback(async () => {
    if (!contentRef.current) return;
    let originals;
    try {
      originals = fixOklchColors(contentRef.current);
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `reporte-actividades-${format(now, 'yyyy-MM-dd')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
    } finally {
      if (originals) restoreColors(originals);
    }
  }, [contentRef, period]);

  // Status icon for task list
  const TaskStatusIcon = ({ status }) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />;
      case 'in-progress':
        return <Clock size={15} className="text-violet-400 flex-shrink-0 animate-pulse" />;
      case 'review':
        return <CircleAlert size={15} className="text-amber-400 flex-shrink-0" />;
      default:
        return <CircleDot size={15} className="text-surface-500 flex-shrink-0" />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto bg-surface-900 rounded-2xl border border-surface-700/50 shadow-2xl"
        style={{ animation: 'modalSlide 0.2s ease-out' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-surface-700/50 bg-surface-900/95 backdrop-blur-sm">
          <h2 className="text-sm font-semibold text-surface-200 flex items-center gap-2">
            <Share2 size={15} className="text-primary-400" />
            Compartir Resumen
          </h2>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
              }`}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? '¡Copiado!' : 'Copiar'}
            </button>
            <button
              onClick={handleDownloadImage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-700/50 text-surface-300 hover:bg-surface-700/70 transition-all"
            >
              <Image size={12} />
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

        {/* Shareable content — this is what gets captured as image */}
        <div ref={contentRef} className="p-5 space-y-5 bg-surface-900">
          {/* Title */}
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-surface-100">
              Reporte de Actividades
            </h3>
            <p className="text-xs text-surface-500 flex items-center justify-center gap-1">
              <Calendar size={11} />
              {periodLabel[period]}
            </p>
          </div>

          {/* Big progress indicator */}
          <div className="flex flex-col items-center py-3">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(51,65,85,0.4)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 2.64} ${264 - progress * 2.64}`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-surface-100">{progress}%</span>
                <span className="text-[10px] text-surface-500">completado</span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 size={12} /> {done} terminadas
              </span>
              <span className="flex items-center gap-1 text-violet-400">
                <Clock size={12} /> {inProgress} en progreso
              </span>
              {overdue > 0 && (
                <span className="flex items-center gap-1 text-red-400">
                  <AlertTriangle size={12} /> {overdue} vencidas
                </span>
              )}
            </div>
          </div>

          {/* Tasks by project — human readable */}
          <div className="space-y-4">
            {projects.map(project => {
              const projectTasks = tasksByProject[project.id];
              if (!projectTasks || projectTasks.length === 0) return null;

              const pStats = getProjectStats(projectTasks);
              const workingTasks = projectTasks.filter(t => t.status === 'in-progress');
              const pendingTasks = projectTasks.filter(t => t.status !== 'done' && t.status !== 'in-progress');
              const doneTasks = projectTasks.filter(t => t.status === 'done');

              return (
                <div key={project.id} className="rounded-xl border border-surface-700/30 overflow-hidden">
                  {/* Project header */}
                  <div className="flex items-center gap-2.5 px-4 py-2.5 bg-surface-800/60">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                    <span className="text-sm font-semibold text-surface-200 flex-1">{project.name}</span>
                    {/* mini progress bar */}
                    <div className="w-16 h-1.5 rounded-full bg-surface-700/50 overflow-hidden">
                      <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${pStats.progress}%` }} />
                    </div>
                    <span className="text-[10px] text-surface-500 tabular-nums w-8 text-right">{pStats.progress}%</span>
                  </div>

                  <div className="divide-y divide-surface-700/15 px-4">
                    {/* Working now — highlighted */}
                    {workingTasks.length > 0 && (
                      <div className="py-2.5">
                        <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Clock size={10} />
                          Trabajando ahora
                        </p>
                        <div className="space-y-2">
                          {workingTasks.map(task => (
                            <div key={task.id} className="flex items-start gap-2">
                              <TaskStatusIcon status={task.status} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-surface-200 font-medium">{task.title}</p>
                                {task.description && (
                                  <p className="text-[10px] text-surface-500 mt-0.5 line-clamp-1">{task.description}</p>
                                )}
                              </div>
                              {(task.priority === 'urgent' || task.priority === 'high') && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium ${
                                  task.priority === 'urgent' ? 'bg-red-500/15 text-red-400' : 'bg-orange-500/15 text-orange-400'
                                }`}>
                                  {task.priority === 'urgent' ? 'Urgente' : 'Alta'}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pending */}
                    {pendingTasks.length > 0 && (
                      <div className="py-2.5">
                        <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <CircleDot size={10} />
                          Por hacer ({pendingTasks.length})
                        </p>
                        <div className="space-y-1.5">
                          {pendingTasks.map(task => (
                            <div key={task.id} className="flex items-center gap-2">
                              <TaskStatusIcon status={task.status} />
                              <span className="text-xs text-surface-400 flex-1 truncate">{task.title}</span>
                              {task.dueDate && (
                                <span className={`text-[10px] ${
                                  getDueDateStatus(task.dueDate) === 'overdue' ? 'text-red-400 font-medium' : 'text-surface-600'
                                }`}>
                                  {formatRelativeDate(task.dueDate)}
                                </span>
                              )}
                              {(task.priority === 'urgent' || task.priority === 'high') && (
                                <Flame size={10} className={
                                  task.priority === 'urgent' ? 'text-red-400' : 'text-orange-400'
                                } />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Done */}
                    {doneTasks.length > 0 && (
                      <div className="py-2.5">
                        <p className="text-[10px] font-semibold text-emerald-400/70 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <CheckCircle2 size={10} />
                          Terminadas ({doneTasks.length})
                        </p>
                        <div className="space-y-1.5">
                          {doneTasks.map(task => (
                            <div key={task.id} className="flex items-center gap-2">
                              <TaskStatusIcon status={task.status} />
                              <span className="text-xs text-surface-500 line-through flex-1 truncate">{task.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {total === 0 && (
            <div className="text-center py-8 text-surface-600 text-sm">
              No hay tareas para este periodo
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-[10px] text-surface-600 pt-2 border-t border-surface-700/20">
            DevBoard · {format(now, "d 'de' MMMM yyyy, HH:mm", { locale: es })}
          </div>
        </div>
      </div>
    </div>
  );
}
