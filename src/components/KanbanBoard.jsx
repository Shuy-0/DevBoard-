import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useApp } from '../context/AppContext';
import { STATUS_CONFIG, KANBAN_COLUMNS, filterTasks, getProjectStats } from '../utils/helpers';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import SearchBar from './SearchBar';
import ProgressRing from './ProgressRing';
import { Plus, Settings, ArrowLeft } from 'lucide-react';

export default function KanbanBoard({ project, onEditProject, onSelectTask }) {
  const { getProjectTasks, moveTask, navigateToDashboard } = useApp();
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState('todo');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
  });

  const allTasks = getProjectTasks(project.id);
  const filteredTasks = useMemo(() => filterTasks(allTasks, filters), [allTasks, filters]);
  const stats = getProjectStats(allTasks);

  const columns = KANBAN_COLUMNS.map(status => ({
    status,
    config: STATUS_CONFIG[status],
    tasks: filteredTasks.filter(t => t.status === status),
  }));

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    moveTask(draggableId, newStatus);
  };

  const handleAddTask = (status) => {
    setNewTaskStatus(status);
    setShowNewTask(true);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 px-6 lg:px-8 py-4 border-b border-surface-700/50 glass">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={navigateToDashboard}
              className="p-2 rounded-xl text-surface-500 hover:text-surface-200 hover:bg-surface-700/50 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: project.color }}
              >
                {project.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-bold text-surface-100">{project.name}</h1>
                <p className="text-xs text-surface-500">{project.description}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ProgressRing progress={stats.progress} size={40} strokeWidth={3} />
            <button
              onClick={onEditProject}
              className="p-2 rounded-xl text-surface-500 hover:text-surface-200 hover:bg-surface-700/50 transition-all"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        <SearchBar filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Kanban Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto p-6 lg:p-8">
          <div className="flex gap-4 h-full min-w-max">
            {columns.map(column => (
              <div
                key={column.status}
                className="w-72 flex-shrink-0 flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${column.config.color}`} />
                    <h2 className="text-sm font-semibold text-surface-300">
                      {column.config.label}
                    </h2>
                    <span className="text-xs text-surface-600 bg-surface-800 px-1.5 py-0.5 rounded-md">
                      {column.tasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddTask(column.status)}
                    className="p-1 rounded-lg text-surface-600 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Card List */}
                <Droppable droppableId={column.status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-2.5 p-2 rounded-2xl transition-colors duration-200 min-h-[120px] ${
                        snapshot.isDraggingOver
                          ? 'bg-primary-500/5 border-2 border-dashed border-primary-500/20'
                          : 'bg-surface-900/30 border-2 border-dashed border-transparent'
                      }`}
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`${snapshot.isDragging ? 'opacity-90 rotate-1' : ''}`}
                            >
                              <TaskCard
                                task={task}
                                onClick={() => onSelectTask(task)}
                                dragHandleProps={provided.dragHandleProps}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {column.tasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center py-8 text-surface-600">
                          <p className="text-xs">Sin tareas</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>

      {/* New Task Modal */}
      {showNewTask && (
        <TaskModal
          projectId={project.id}
          task={null}
          onClose={() => setShowNewTask(false)}
        />
      )}
    </div>
  );
}
