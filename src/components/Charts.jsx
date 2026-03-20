import { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';
import { STATUS_CONFIG, PRIORITY_CONFIG, getDueDateStatus } from '../utils/helpers';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

// Common chart options for dark theme
const darkTheme = {
  color: '#94a3b8',
  borderColor: 'rgba(51, 65, 85, 0.3)',
};

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: darkTheme.color,
        font: { family: 'Inter', size: 11 },
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(51, 65, 85, 0.5)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      titleFont: { family: 'Inter', weight: '600', size: 12 },
      bodyFont: { family: 'Inter', size: 11 },
    },
  },
};

export function TasksByStatusChart() {
  const { tasks } = useApp();

  const data = useMemo(() => {
    const statusCounts = {};
    Object.keys(STATUS_CONFIG).forEach(s => { statusCounts[s] = 0; });
    tasks.forEach(t => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; });

    return {
      labels: Object.values(STATUS_CONFIG).map(c => c.label),
      datasets: [{
        data: Object.keys(STATUS_CONFIG).map(s => statusCounts[s]),
        backgroundColor: [
          'rgba(100, 116, 139, 0.8)',  // backlog - slate
          'rgba(59, 130, 246, 0.8)',   // todo - blue
          'rgba(139, 92, 246, 0.8)',   // in-progress - violet
          'rgba(245, 158, 11, 0.8)',   // review - amber
          'rgba(16, 185, 129, 0.8)',   // done - emerald
        ],
        borderColor: [
          'rgba(100, 116, 139, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 6,
      }],
    };
  }, [tasks]);

  const options = {
    ...defaultOptions,
    cutout: '65%',
    plugins: {
      ...defaultOptions.plugins,
      legend: {
        ...defaultOptions.plugins.legend,
        position: 'bottom',
      },
    },
  };

  return (
    <div className="glass rounded-2xl p-5 border border-surface-700/30">
      <h3 className="text-sm font-semibold text-surface-300 mb-4">Tareas por Estado</h3>
      <div className="h-56">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}

export function TasksByPriorityChart() {
  const { tasks } = useApp();

  const data = useMemo(() => {
    const priorityCounts = {};
    Object.keys(PRIORITY_CONFIG).forEach(p => { priorityCounts[p] = 0; });
    tasks.forEach(t => { priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1; });

    return {
      labels: Object.values(PRIORITY_CONFIG).map(c => c.label),
      datasets: [{
        label: 'Tareas',
        data: Object.keys(PRIORITY_CONFIG).map(p => priorityCounts[p]),
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',   // low - green
          'rgba(59, 130, 246, 0.7)',   // medium - blue
          'rgba(249, 115, 22, 0.7)',   // high - orange
          'rgba(239, 68, 68, 0.7)',    // urgent - red
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      }],
    };
  }, [tasks]);

  const options = {
    ...defaultOptions,
    plugins: {
      ...defaultOptions.plugins,
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: darkTheme.color, font: { family: 'Inter', size: 11 } },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: darkTheme.color,
          font: { family: 'Inter', size: 11 },
          stepSize: 1,
        },
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        border: { display: false },
      },
    },
  };

  return (
    <div className="glass rounded-2xl p-5 border border-surface-700/30">
      <h3 className="text-sm font-semibold text-surface-300 mb-4">Tareas por Prioridad</h3>
      <div className="h-56">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

export function ProjectComparisonChart() {
  const { projects, tasks } = useApp();

  const data = useMemo(() => {
    const projectNames = projects.map(p => p.name);
    const doneCounts = projects.map(p =>
      tasks.filter(t => t.projectId === p.id && t.status === 'done').length
    );
    const pendingCounts = projects.map(p =>
      tasks.filter(t => t.projectId === p.id && t.status !== 'done').length
    );

    return {
      labels: projectNames,
      datasets: [
        {
          label: 'Completadas',
          data: doneCounts,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Pendientes',
          data: pendingCounts,
          backgroundColor: 'rgba(139, 92, 246, 0.7)',
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }, [projects, tasks]);

  const options = {
    ...defaultOptions,
    plugins: {
      ...defaultOptions.plugins,
      legend: {
        ...defaultOptions.plugins.legend,
        position: 'top',
      },
    },
    scales: {
      x: {
        ticks: { color: darkTheme.color, font: { family: 'Inter', size: 11 } },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        stacked: false,
        ticks: {
          color: darkTheme.color,
          font: { family: 'Inter', size: 11 },
          stepSize: 1,
        },
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        border: { display: false },
      },
    },
  };

  return (
    <div className="glass rounded-2xl p-5 border border-surface-700/30">
      <h3 className="text-sm font-semibold text-surface-300 mb-4">Comparación por Proyecto</h3>
      <div className="h-56">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

export function OverdueChart() {
  const { projects, tasks } = useApp();

  const data = useMemo(() => {
    const projectNames = projects.map(p => p.name);
    const overdueCounts = projects.map(p =>
      tasks.filter(t =>
        t.projectId === p.id &&
        t.status !== 'done' &&
        getDueDateStatus(t.dueDate) === 'overdue'
      ).length
    );
    const onTrackCounts = projects.map(p =>
      tasks.filter(t =>
        t.projectId === p.id &&
        t.status !== 'done' &&
        getDueDateStatus(t.dueDate) !== 'overdue'
      ).length
    );

    return {
      labels: projectNames,
      datasets: [
        {
          label: 'En tiempo',
          data: onTrackCounts,
          backgroundColor: 'rgba(6, 182, 212, 0.2)',
          borderColor: 'rgba(6, 182, 212, 0.8)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(6, 182, 212, 1)',
          pointRadius: 5,
          pointHoverRadius: 7,
        },
        {
          label: 'Vencidas',
          data: overdueCounts,
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: 'rgba(239, 68, 68, 0.8)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(239, 68, 68, 1)',
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    };
  }, [projects, tasks]);

  const options = {
    ...defaultOptions,
    plugins: {
      ...defaultOptions.plugins,
      legend: {
        ...defaultOptions.plugins.legend,
        position: 'top',
      },
    },
    scales: {
      x: {
        ticks: { color: darkTheme.color, font: { family: 'Inter', size: 11 } },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: darkTheme.color,
          font: { family: 'Inter', size: 11 },
          stepSize: 1,
        },
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        border: { display: false },
      },
    },
  };

  return (
    <div className="glass rounded-2xl p-5 border border-surface-700/30">
      <h3 className="text-sm font-semibold text-surface-300 mb-4">Tareas Vencidas vs En Tiempo</h3>
      <div className="h-56">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
