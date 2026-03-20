import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { STATUS_CONFIG, PRIORITY_CONFIG, KANBAN_COLUMNS, formatDate, formatRelativeDate, getDueDateStatus } from '../utils/helpers';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import { X, Trash2, Calendar, Tag, Clock, Edit3, Check } from 'lucide-react';

export default function TaskDetailPanel({ task, onClose, onEdit }) {
  const { updateTask, deleteTask } = useApp();
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  if (!task) return null;

  const dueDateStatus = getDueDateStatus(task.dueDate);

  const dueDateColor = {
    overdue: 'text-red-400 bg-red-500/10',
    today: 'text-amber-400 bg-amber-500/10',
    tomorrow: 'text-amber-300 bg-amber-500/10',
    soon: 'text-orange-300 bg-orange-500/10',
    normal: 'text-surface-400 bg-surface-700/30',
    none: 'text-surface-600',
  };

  const handleStatusUpdate = (newStatus) => {
    updateTask(task.id, { status: newStatus });
  };

  const handlePriorityUpdate = (newPriority) => {
    updateTask(task.id, { priority: newPriority });
  };

  const handleDelete = () => {
    if (window.confirm('¿Eliminar esta tarea?')) {
      deleteTask(task.id);
      onClose();
    }
  };

  const startInlineEdit = (field, value) => {
    setEditingField(field);
    setEditValue(value);
  };

  const saveInlineEdit = () => {
    if (editingField === 'title' && editValue.trim()) {
      updateTask(task.id, { title: editValue.trim() });
    } else if (editingField === 'description') {
      updateTask(task.id, { description: editValue });
    }
    setEditingField(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm fade-in" />

      {/* Panel */}
      <div
        className="relative w-full max-w-md h-full bg-surface-900 border-l border-surface-700/50 overflow-y-auto shadow-2xl"
        style={{ animation: 'panelSlide 0.25s ease-out' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-surface-700/50 bg-surface-900/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <StatusBadge status={task.status} size="sm" />
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg text-surface-500 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
              title="Editar completo"
            >
              <Edit3 size={15} />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Eliminar"
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-surface-500 hover:text-surface-200 hover:bg-surface-700/50 transition-all"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Title */}
          <div>
            {editingField === 'title' ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveInlineEdit()}
                  className="flex-1 text-lg font-semibold bg-surface-800 border border-primary-500/50 rounded-lg px-3 py-1.5 text-surface-100 outline-none"
                  autoFocus
                />
                <button onClick={saveInlineEdit} className="p-1.5 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-all">
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <h2
                onClick={() => startInlineEdit('title', task.title)}
                className="text-lg font-semibold text-surface-100 cursor-pointer hover:text-white transition-colors group"
              >
                {task.title}
                <Edit3 size={12} className="inline ml-2 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h2>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider block mb-2">
              Descripción
            </label>
            {editingField === 'description' ? (
              <div className="space-y-2">
                <textarea
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  rows={4}
                  className="w-full text-sm bg-surface-800 border border-primary-500/50 rounded-lg px-3 py-2 text-surface-300 outline-none resize-none"
                  autoFocus
                />
                <button onClick={saveInlineEdit} className="text-xs px-3 py-1.5 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-all">
                  Guardar
                </button>
              </div>
            ) : (
              <p
                onClick={() => startInlineEdit('description', task.description || '')}
                className="text-sm text-surface-400 leading-relaxed cursor-pointer hover:text-surface-300 transition-colors min-h-[2rem] p-2 rounded-lg hover:bg-surface-800/50"
              >
                {task.description || 'Agregar descripción...'}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider block mb-2">
              Estado
            </label>
            <div className="flex flex-wrap gap-1.5">
              {KANBAN_COLUMNS.map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    task.status === status
                      ? `${STATUS_CONFIG[status].color}/20 ${STATUS_CONFIG[status].textColor} border-current`
                      : 'text-surface-500 border-surface-700/50 hover:text-surface-300 hover:border-surface-600/50'
                  }`}
                >
                  {STATUS_CONFIG[status].label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider block mb-2">
              Prioridad
            </label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handlePriorityUpdate(key)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    task.priority === key
                      ? config.color
                      : 'text-surface-500 border-surface-700/50 hover:text-surface-300 hover:border-surface-600/50'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider block mb-2 flex items-center gap-1">
              <Calendar size={11} />
              Fecha Límite
            </label>
            {task.dueDate ? (
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl ${dueDateColor[dueDateStatus]}`}>
                <Calendar size={13} />
                <span className="text-sm font-medium">{formatDate(task.dueDate)}</span>
                <span className="text-xs opacity-70">({formatRelativeDate(task.dueDate)})</span>
              </div>
            ) : (
              <span className="text-sm text-surface-600 italic">Sin fecha límite</span>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <label className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider block mb-2 flex items-center gap-1">
                <Tag size={11} />
                Etiquetas
              </label>
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-lg bg-surface-700/50 text-surface-400 border border-surface-700/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-surface-700/30 space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-surface-600">
              <Clock size={11} />
              Creada: {formatDate(task.createdAt)}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-surface-600">
              <Clock size={11} />
              Actualizada: {formatDate(task.updatedAt)}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes panelSlide {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
