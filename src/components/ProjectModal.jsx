import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X } from 'lucide-react';

const PROJECT_COLORS = [
  '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981',
  '#ec4899', '#f97316', '#6366f1', '#14b8a6', '#a855f7',
];

const PROJECT_ICONS = [
  'Layout', 'Server', 'Smartphone', 'Globe', 'Database',
  'Shield', 'Code', 'Cpu', 'Cloud', 'Rocket',
];

export default function ProjectModal({ project, onClose }) {
  const { addProject, updateProject, deleteProject } = useApp();
  const isEditing = !!project;

  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    color: project?.color || PROJECT_COLORS[0],
    icon: project?.icon || PROJECT_ICONS[0],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (isEditing) {
      updateProject(project.id, form);
    } else {
      addProject(form);
    }
    onClose();
  };

  const handleDelete = () => {
    if (project && window.confirm('¿Eliminar este proyecto y todas sus tareas?')) {
      deleteProject(project.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-surface-700/50">
          <h2 className="text-lg font-semibold text-surface-100">
            {isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-surface-500 hover:text-surface-200 hover:bg-surface-700/50 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-900/50 border border-surface-700/30">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: form.color }}
            >
              {form.name ? form.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <p className="text-sm font-medium text-surface-200">
                {form.name || 'Nombre del proyecto'}
              </p>
              <p className="text-xs text-surface-500">
                {form.description || 'Descripción'}
              </p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-surface-400 mb-1.5">
              Nombre
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Mi Proyecto"
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
              placeholder="¿De qué trata este proyecto?"
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-900/80 border border-surface-700/50 text-surface-100 placeholder-surface-600 text-sm focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 outline-none transition-all resize-none"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-medium text-surface-400 mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-lg transition-all duration-200 ${
                    form.color === color
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-800 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 border border-red-500/20 text-sm font-medium transition-all"
              >
                Eliminar
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              {isEditing ? 'Guardar' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
