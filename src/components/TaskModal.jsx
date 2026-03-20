import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { STATUS_CONFIG, PRIORITY_CONFIG, KANBAN_COLUMNS } from '../utils/helpers';
import { X, Trash2, Calendar, Tag } from 'lucide-react';

export default function TaskModal({ task, projectId, onClose }) {
  const { addTask, updateTask, deleteTask } = useApp();
  const isEditing = !!task;

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    tags: '',
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        tags: task.tags ? task.tags.join(', ') : '',
      });
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const taskData = {
      ...form,
      projectId: task?.projectId || projectId,
      tags: form.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    };

    if (isEditing) {
      updateTask(task.id, taskData);
    } else {
      addTask(taskData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (task && window.confirm('¿Eliminar esta tarea?')) {
      deleteTask(task.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-surface-700/50">
          <h2 className="text-lg font-semibold text-surface-100">
            {isEditing ? 'Editar Tarea' : 'Nueva Tarea'}
          </h2>
          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-surface-500 hover:text-surface-200 hover:bg-surface-700/50 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-surface-400 mb-1.5">
              Título
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="¿Qué necesitas hacer?"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-900/80 border border-surface-700/50 text-surface-100 placeholder-surface-600 text-sm focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 outline-none transition-all"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-surface-400 mb-1.5">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Agrega detalles..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-900/80 border border-surface-700/50 text-surface-100 placeholder-surface-600 text-sm focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 outline-none transition-all resize-none"
            />
          </div>

          {/* Status & Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">
                Estado
              </label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-900/80 border border-surface-700/50 text-surface-100 text-sm focus:border-primary-500/50 outline-none transition-all appearance-none cursor-pointer"
              >
                {KANBAN_COLUMNS.map(status => (
                  <option key={status} value={status}>
                    {STATUS_CONFIG[status].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">
                Prioridad
              </label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-900/80 border border-surface-700/50 text-surface-100 text-sm focus:border-primary-500/50 outline-none transition-all appearance-none cursor-pointer"
              >
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-surface-400 mb-1.5">
              <Calendar size={12} />
              Fecha límite
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-900/80 border border-surface-700/50 text-surface-100 text-sm focus:border-primary-500/50 outline-none transition-all"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-surface-400 mb-1.5">
              <Tag size={12} />
              Etiquetas
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
              placeholder="diseño, frontend, bug (separar con comas)"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-900/80 border border-surface-700/50 text-surface-100 placeholder-surface-600 text-sm focus:border-primary-500/50 outline-none transition-all"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity mt-2"
          >
            {isEditing ? 'Guardar Cambios' : 'Crear Tarea'}
          </button>
        </form>
      </div>
    </div>
  );
}
