import { useApp } from '../context/AppContext';
import { getProjectStats, getDueDateStatus } from '../utils/helpers';
import ProgressRing from './ProgressRing';
import { TasksByStatusChart, TasksByPriorityChart, ProjectComparisonChart, OverdueChart } from './Charts';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  ListTodo,
  BarChart3,
} from 'lucide-react';

export default function Dashboard() {
  const { projects, tasks, navigateToProject } = useApp();

  // Global stats
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const overdueTasks = tasks.filter(
    t => t.status !== 'done' && getDueDateStatus(t.dueDate) === 'overdue'
  ).length;
  const urgentTasks = tasks.filter(
    t => t.status !== 'done' && t.priority === 'urgent'
  ).length;

  const globalProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const statCards = [
    {
      label: 'Completadas',
      value: doneTasks,
      total: totalTasks,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      label: 'En Progreso',
      value: inProgressTasks,
      icon: Clock,
      color: 'text-primary-400',
      bg: 'bg-primary-500/10',
      border: 'border-primary-500/20',
    },
    {
      label: 'Vencidas',
      value: overdueTasks,
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
    },
    {
      label: 'Urgentes',
      value: urgentTasks,
      icon: Flame,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-surface-100 mb-1">
          Dashboard
        </h1>
        <p className="text-surface-500 text-sm">
          Vista general de todos tus proyectos
        </p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(stat => (
          <div
            key={stat.label}
            className={`glass rounded-2xl p-4 border ${stat.border} card-lift`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              {stat.total !== undefined && (
                <span className="text-xs text-surface-500">
                  de {stat.total}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-surface-100">{stat.value}</p>
            <p className="text-xs text-surface-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Progress Overview */}
      <div className="glass rounded-2xl p-6 border border-surface-700/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-surface-200 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-400" />
            Progreso Global
          </h2>
          <span className="text-2xl font-bold gradient-text">{globalProgress}%</span>
        </div>
        <div className="w-full h-3 bg-surface-700/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full gradient-primary transition-all duration-700 ease-out"
            style={{ width: `${globalProgress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[11px] text-surface-500">
          <span>{doneTasks} completadas</span>
          <span>{totalTasks - doneTasks} pendientes</span>
        </div>
      </div>

      {/* Charts Section */}
      <div>
        <h2 className="text-lg font-semibold text-surface-200 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-primary-400" />
          Gráficas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TasksByStatusChart />
          <TasksByPriorityChart />
          <ProjectComparisonChart />
          <OverdueChart />
        </div>
      </div>

      {/* Project Cards */}
      <div>
        <h2 className="text-lg font-semibold text-surface-200 mb-4 flex items-center gap-2">
          <ListTodo size={18} className="text-primary-400" />
          Proyectos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const stats = getProjectStats(projectTasks);

            return (
              <div
                key={project.id}
                onClick={() => navigateToProject(project.id)}
                className="glass rounded-2xl p-5 cursor-pointer card-lift group border border-surface-700/30 hover:border-surface-600/50"
              >
                {/* Project header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-surface-200 group-hover:text-white transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-xs text-surface-500 mt-0.5">
                        {stats.total} tareas
                      </p>
                    </div>
                  </div>
                  <ProgressRing progress={stats.progress} size={44} strokeWidth={3} />
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-xs text-surface-500 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Mini stats */}
                <div className="flex items-center gap-3 mb-4">
                  {stats.overdue > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">
                      <AlertTriangle size={11} />
                      {stats.overdue} vencidas
                    </span>
                  )}
                  {stats.urgent > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
                      <Flame size={11} />
                      {stats.urgent} urgentes
                    </span>
                  )}
                  {stats.inProgress > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-primary-400 bg-primary-500/10 px-2 py-1 rounded-lg">
                      <Clock size={11} />
                      {stats.inProgress} en progreso
                    </span>
                  )}
                </div>

                {/* Status bar */}
                <div className="flex h-1.5 rounded-full overflow-hidden bg-surface-700/50 gap-0.5">
                  {stats.total > 0 && (
                    <>
                      <div
                        className="bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${(stats.done / stats.total) * 100}%` }}
                      />
                      <div
                        className="bg-primary-500 rounded-full transition-all duration-500"
                        style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
                      />
                    </>
                  )}
                </div>

                {/* Open link */}
                <div className="flex items-center justify-end mt-3 text-xs text-surface-600 group-hover:text-primary-400 transition-colors">
                  <span>Abrir tablero</span>
                  <ArrowRight size={13} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
