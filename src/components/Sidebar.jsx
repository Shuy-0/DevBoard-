import { useApp } from '../context/AppContext';
import { getProjectStats } from '../utils/helpers';
import {
  LayoutDashboard,
  FolderKanban,
  Plus,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar({ onNewProject }) {
  const { projects, tasks, activeProjectId, navigateToProject, navigateToDashboard, view } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`h-screen flex flex-col glass border-r border-surface-700/50 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-surface-700/50">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
          <Zap size={18} className="text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold gradient-text tracking-tight">
            DevBoard
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-surface-400 hover:text-surface-200 transition-colors p-1 rounded-lg hover:bg-surface-700/50"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {/* Dashboard link */}
        <div className="px-3 mb-2">
          <button
            onClick={navigateToDashboard}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              view === 'dashboard'
                ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700/50'
            }`}
          >
            <LayoutDashboard size={18} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Dashboard</span>}
          </button>
        </div>

        {/* Projects */}
        {!collapsed && (
          <div className="px-4 mt-6 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider">
              Proyectos
            </span>
            <button
              onClick={onNewProject}
              className="p-1 rounded-md text-surface-500 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
            >
              <Plus size={14} />
            </button>
          </div>
        )}

        <div className="px-3 space-y-1">
          {projects.map(project => {
            const stats = getProjectStats(tasks.filter(t => t.projectId === project.id));
            const isActive = activeProjectId === project.id && view === 'board';

            return (
              <button
                key={project.id}
                onClick={() => navigateToProject(project.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-surface-700/70 text-surface-100 border border-surface-600/50'
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700/50'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-offset-1 ring-offset-surface-800"
                  style={{ backgroundColor: project.color, ringColor: project.color + '40' }}
                />
                {!collapsed && (
                  <>
                    <span className="text-sm font-medium truncate flex-1 text-left">
                      {project.name}
                    </span>
                    <span className="text-[11px] text-surface-500 font-medium tabular-nums">
                      {stats.done}/{stats.total}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {collapsed && (
          <div className="px-3 mt-4">
            <button
              onClick={onNewProject}
              className="w-full flex items-center justify-center p-2 rounded-xl text-surface-500 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
            >
              <Plus size={18} />
            </button>
          </div>
        )}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-surface-700/50">
          <div className="text-[11px] text-surface-600 text-center">
            {tasks.length} tareas · {projects.length} proyectos
          </div>
        </div>
      )}
    </aside>
  );
}
