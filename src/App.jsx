import { useState, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import TableView from './components/TableView';
import GanttView from './components/GanttView';
import ProjectModal from './components/ProjectModal';
import TaskModal from './components/TaskModal';
import TaskDetailPanel from './components/TaskDetailPanel';
import ShareView from './components/ShareView';
import { Columns3, Table2, GanttChart, Menu, Plus } from 'lucide-react';

const VIEW_MODES = [
  { key: 'board', label: 'Kanban', icon: Columns3 },
  { key: 'table', label: 'Tabla', icon: Table2 },
  { key: 'gantt', label: 'Gantt', icon: GanttChart },
];

function ViewSwitcher({ current, onChange }) {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1 glass rounded-lg sm:rounded-xl p-0.5 sm:p-1">
      {VIEW_MODES.map(mode => (
        <button
          key={mode.key}
          onClick={() => onChange(mode.key)}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
            current === mode.key
              ? 'bg-primary-500/20 text-primary-400'
              : 'text-surface-500 hover:text-surface-300 hover:bg-surface-700/50'
          }`}
        >
          <mode.icon size={13} />
          <span className="hidden sm:inline">{mode.label}</span>
        </button>
      ))}
    </div>
  );
}

function AppContent() {
  const { projects, activeProjectId, view, setView } = useApp();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewMode, setViewMode] = useState('board');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskModalTask, setTaskModalTask] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const handleNewProject = () => {
    setEditingProject(null);
    setShowProjectModal(true);
  };

  const handleEditProject = () => {
    if (activeProject) {
      setEditingProject(activeProject);
      setShowProjectModal(true);
    }
  };

  const handleSelectTask = useCallback((task) => {
    setSelectedTask(task);
  }, []);

  const handleEditTaskFull = useCallback(() => {
    setTaskModalTask(selectedTask);
    setShowTaskModal(true);
    setSelectedTask(null);
  }, [selectedTask]);

  const renderProjectView = () => {
    if (!activeProject) return null;
    switch (viewMode) {
      case 'table':
        return <TableView project={activeProject} onEditProject={handleEditProject} onSelectTask={handleSelectTask} />;
      case 'gantt':
        return <GanttView project={activeProject} onEditProject={handleEditProject} onSelectTask={handleSelectTask} />;
      case 'board':
      default:
        return <KanbanBoard project={activeProject} onEditProject={handleEditProject} onSelectTask={handleSelectTask} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onNewProject={handleNewProject} mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        {/* Top bar — mobile hamburger + view switcher */}
        <div className="flex-shrink-0 flex items-center justify-between px-3 sm:px-4 py-2 border-b border-surface-700/30 bg-surface-950/80">
          {/* Left: hamburger on mobile */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl text-surface-400 hover:text-surface-200 hover:bg-surface-700/50 transition-all"
          >
            <Menu size={20} />
          </button>

          {/* Center: view switcher (only on project view) */}
          {view === 'board' && activeProject ? (
            <div className="flex-1 flex justify-center">
              <ViewSwitcher current={viewMode} onChange={setViewMode} />
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* Right: add project (mobile) */}
          <button
            onClick={handleNewProject}
            className="lg:hidden p-2 rounded-xl text-primary-400 hover:bg-primary-500/10 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {view === 'dashboard' || !activeProject ? (
            <div className="h-full overflow-y-auto">
              <Dashboard onShare={() => setShowShare(true)} onNewProject={handleNewProject} />
            </div>
          ) : (
            renderProjectView()
          )}
        </div>
      </main>

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} onEdit={handleEditTaskFull} />
      )}

      {/* Share View */}
      {showShare && <ShareView onClose={() => setShowShare(false)} />}

      {/* Full Task Edit Modal */}
      {showTaskModal && (
        <TaskModal
          task={taskModalTask}
          projectId={taskModalTask?.projectId}
          onClose={() => { setShowTaskModal(false); setTaskModalTask(null); }}
        />
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <ProjectModal
          project={editingProject}
          onClose={() => { setShowProjectModal(false); setEditingProject(null); }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
