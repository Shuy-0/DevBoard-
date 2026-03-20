import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sampleProjects, sampleTasks } from '../data/sampleData';
import { generateId } from '../utils/helpers';

const AppContext = createContext();

const STORAGE_KEYS = {
  projects: 'devboard-projects',
  tasks: 'devboard-tasks',
};

function loadFromStorage(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function AppProvider({ children }) {
  const [projects, setProjects] = useState(() =>
    loadFromStorage(STORAGE_KEYS.projects, sampleProjects)
  );
  const [tasks, setTasks] = useState(() =>
    loadFromStorage(STORAGE_KEYS.tasks, sampleTasks)
  );
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'board'

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.projects, projects);
  }, [projects]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.tasks, tasks);
  }, [tasks]);

  // Project CRUD
  const addProject = useCallback((project) => {
    const newProject = {
      ...project,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  }, []);

  const updateProject = useCallback((id, updates) => {
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deleteProject = useCallback((id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
    if (activeProjectId === id) {
      setActiveProjectId(null);
      setView('dashboard');
    }
  }, [activeProjectId]);

  // Task CRUD
  const addTask = useCallback((task) => {
    const newTask = {
      ...task,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, []);

  const updateTask = useCallback((id, updates) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      )
    );
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const moveTask = useCallback((taskId, newStatus) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
          : t
      )
    );
  }, []);

  const reorderTasks = useCallback((projectId, status, orderedIds) => {
    setTasks(prev => {
      const otherTasks = prev.filter(
        t => t.projectId !== projectId || t.status !== status
      );
      const reorderedTasks = orderedIds
        .map(id => prev.find(t => t.id === id))
        .filter(Boolean);
      return [...otherTasks, ...reorderedTasks];
    });
  }, []);

  // Navigation
  const navigateToProject = useCallback((projectId) => {
    setActiveProjectId(projectId);
    setView('board');
  }, []);

  const navigateToDashboard = useCallback(() => {
    setActiveProjectId(null);
    setView('dashboard');
  }, []);

  const getProjectTasks = useCallback(
    (projectId) => tasks.filter(t => t.projectId === projectId),
    [tasks]
  );

  const value = {
    projects,
    tasks,
    activeProjectId,
    view,
    setView,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks,
    navigateToProject,
    navigateToDashboard,
    getProjectTasks,
    setActiveProjectId,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
