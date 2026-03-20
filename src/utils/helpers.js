import { format, formatDistanceToNow, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export const STATUS_CONFIG = {
  backlog: { label: 'Backlog', color: 'bg-surface-600', textColor: 'text-surface-300', order: 0 },
  todo: { label: 'Por Hacer', color: 'bg-info', textColor: 'text-blue-300', order: 1 },
  'in-progress': { label: 'En Progreso', color: 'bg-primary-500', textColor: 'text-primary-300', order: 2 },
  review: { label: 'Revisión', color: 'bg-warning', textColor: 'text-amber-300', order: 3 },
  done: { label: 'Completado', color: 'bg-success', textColor: 'text-emerald-300', order: 4 },
};

export const PRIORITY_CONFIG = {
  low: { label: 'Baja', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400', order: 0 },
  medium: { label: 'Media', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', dot: 'bg-blue-400', order: 1 },
  high: { label: 'Alta', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', dot: 'bg-orange-400', order: 2 },
  urgent: { label: 'Urgente', color: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-400', order: 3 },
};

export const KANBAN_COLUMNS = ['backlog', 'todo', 'in-progress', 'review', 'done'];

export function generateId() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return format(date, 'dd MMM yyyy', { locale: es });
}

export function formatRelativeDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isToday(date)) return 'Hoy';
  if (isTomorrow(date)) return 'Mañana';
  return formatDistanceToNow(date, { addSuffix: true, locale: es });
}

export function getDueDateStatus(dateStr) {
  if (!dateStr) return 'none';
  const date = new Date(dateStr);
  if (isPast(date) && !isToday(date)) return 'overdue';
  if (isToday(date)) return 'today';
  if (isTomorrow(date)) return 'tomorrow';
  const daysLeft = differenceInDays(date, new Date());
  if (daysLeft <= 3) return 'soon';
  return 'normal';
}

export function getProjectStats(tasks) {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const overdue = tasks.filter(t => t.status !== 'done' && getDueDateStatus(t.dueDate) === 'overdue').length;
  const urgent = tasks.filter(t => t.status !== 'done' && t.priority === 'urgent').length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  
  return { total, done, inProgress, overdue, urgent, progress };
}

export function filterTasks(tasks, filters) {
  let filtered = [...tasks];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(t => t.status === filters.status);
  }

  if (filters.priority && filters.priority !== 'all') {
    filtered = filtered.filter(t => t.priority === filters.priority);
  }

  return filtered;
}
