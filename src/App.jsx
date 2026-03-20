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
import { Columns3, Table2, GanttChart } from 'lucide-react';

const VIEW_MODES = [
  { key: 'board', label: 'Kanban', icon: Columns3 },
  { key: 'table', label: 'Tabla', icon: Table2 },
  { key: 'gantt', label: 'Gantt', icon: GanttChart },
];

function ViewSwitcher({ current, onChange }) {
  return (
    <div className="flex items-center gap-1 glass rounded-xl p-1">
      {VIEW_MODES.map(mode => (
        <button
          key={mode.key}
          onClick={() => onChange(mode.key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            current === mode.key
              ? 'bg-primary-500/20 text-primary-400'
              : 'text-surface-500 hover:text-surface-300 hover:bg-surface-700/50'
          }`}
        >
          <mode.icon size={13} />
          {mode.label}
        </button>
      ))}
    </div>
  );
}

function AppContent() {
  const { projects, activeProjectId, view, setView } = useApp();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'table' | 'gantt'

  // Task detail panel state
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskModalTask, setTaskModalTask] = useState(null);

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
    // Open full edit modal from detail panel
    setTaskModalTask(selectedTask);
    setShowTaskModal(true);
    setSelectedTask(null);
  }, [selectedTask]);

  const renderProjectView = () => {
    if (!activeProject) return null;

    switch (viewMode) {
      case 'table':
        return (
          <TableView
            project={activeProject}
            onEditProject={handleEditProject}
            onSelectTask={handleSelectTask}
          />
        );
      case 'gantt':
        return (
          <GanttView
            project={activeProject}
            onEditProject={handleEditProject}
            onSelectTask={handleSelectTask}
          />
        );
      case 'board':
      default:
        return (
          <KanbanBoard
            project={activeProject}
            onEditProject={handleEditProject}
            onSelectTask={handleSelectTask}
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onNewProject={handleNewProject} />
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* View switcher (only when viewing a project) */}
        {view === 'board' && activeProject && (
          <div className="flex-shrink-0 flex justify-center py-2 border-b border-surface-700/30 bg-surface-950/80">
            <ViewSwitcher current={viewMode} onChange={setViewMode} />
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          {view === 'dashboard' || !activeProject ? (
            <div className="h-full overflow-y-auto">
              <Dashboard />
            </div>
          ) : (
            renderProjectView()
          )}
        </div>
      </main>

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={handleEditTaskFull}
        />
      )}

      {/* Full Task Edit Modal */}
      {showTaskModal && (
        <TaskModal
          task={taskModalTask}
          projectId={taskModalTask?.projectId}
          onClose={() => {
            setShowTaskModal(false);
            setTaskModalTask(null);
          }}
        />
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <ProjectModal
          project={editingProject}
          onClose={() => {
            setShowProjectModal(false);
            setEditingProject(null);
          }}
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
