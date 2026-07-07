'use client';
import {
  createContext, useContext, useReducer,
  ReactNode, useMemo,
} from 'react';
import {
  AppState, AppAction, AppContextType,
  Employee, Project, Task, Timesheet,
} from '@/types';
import {
  seedEmployees, seedProjects,
  seedTasks, seedTimesheets, seedActivities,
} from '@/data/mockData';

// ─── Initial State (seeded from mock data) ───────────────────────────────────
const initialState: AppState = {
  employees: seedEmployees,
  projects: seedProjects,
  tasks: seedTasks,
  timesheets: seedTimesheets,
  activities: seedActivities,
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // Employees
    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, action.payload] };
    case 'UPDATE_EMPLOYEE':
      return { ...state, employees: state.employees.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'DELETE_EMPLOYEE':
      return { ...state, employees: state.employees.filter(e => e.id !== action.payload) };

    // Projects
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return { ...state, projects: state.projects.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PROJECT':
      return { ...state, projects: state.projects.filter(p => p.id !== action.payload) };

    // Tasks
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };

    // Timesheets
    case 'ADD_TIMESHEET':
      return { ...state, timesheets: [...state.timesheets, action.payload] };
    case 'DELETE_TIMESHEET':
      return { ...state, timesheets: state.timesheets.filter(t => t.id !== Number(action.payload)) };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  // Memoize so consumers only re-render when state actually changes
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Primary hook ─────────────────────────────────────────────────────────────
export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

// ─── Derived selector hooks (memoized, zero prop-drilling) ───────────────────

/** Live dashboard KPIs — recalculated whenever any entity changes */
export function useDashboardStats() {
  const { state } = useAppContext();
  return useMemo(() => ({
    totalEmployees: state.employees.length,
    activeProjects: state.projects.filter(p => p.status === 'In Progress').length,
    pendingTasks: state.tasks.filter(t => t.status !== 'Completed').length,
    completedTasks: state.tasks.filter(t => t.status === 'Completed').length,
    totalHoursLogged: parseFloat(
      state.timesheets.reduce((s, t) => s + t.hoursWorked, 0).toFixed(1)
    ),
  }), [state.employees, state.projects, state.tasks, state.timesheets]);
}

/** Project status breakdown for the donut chart */
export function useProjectStatusData() {
  const { state } = useAppContext();
  return useMemo(() => {
    const counts = state.projects.reduce<Record<string, number>>((acc, p) => {
      const statusKey = p.status;
      acc[statusKey] = (acc[statusKey] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [state.projects]);
}

/** Hours per employee first-name for the bar chart */
export function useHoursPerEmployee() {
  const { state } = useAppContext();
  return useMemo(() =>
    state.timesheets.reduce<{ name: string; hours: number }[]>((acc, t) => {
      const name = String(t.employeeId);
      const found = acc.find(a => a.name === name);
      if (found) found.hours = parseFloat((found.hours + t.hoursWorked).toFixed(1));
      else acc.push({ name, hours: t.hoursWorked });
      return acc;
    }, []),
    [state.timesheets]);
}

/** Task status breakdown for the pie chart */
export function useTaskStatusData() {
  const { state } = useAppContext();
  return useMemo(() => {
    const counts = state.tasks.reduce<Record<string, number>>((acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [state.tasks]);
}

/** Department headcount for the reports bar */
export function useDeptData() {
  const { state } = useAppContext();
  return useMemo(() => {
    const counts = state.employees.reduce<Record<string, number>>((acc, e) => {
      acc[e.department] = (acc[e.department] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [state.employees]);
}

// ─── Action creator helpers (keeps pages clean) ──────────────────────────────
export function useEmployeeActions() {
  const { dispatch } = useAppContext();
  return {
    add: (e: Omit<Employee, 'id'>) => dispatch({ type: 'ADD_EMPLOYEE', payload: { ...e, id: String(Date.now()) } }),
    update: (e: Employee) => dispatch({ type: 'UPDATE_EMPLOYEE', payload: e }),
    remove: (id: string) => dispatch({ type: 'DELETE_EMPLOYEE', payload: id }),
  };
}

export function useProjectActions() {
  const { dispatch } = useAppContext();
  return {
    add: (p: Omit<Project, 'id'>) => dispatch({ type: 'ADD_PROJECT', payload: { ...p, id: String(Date.now()) } }),
    update: (p: Project) => dispatch({ type: 'UPDATE_PROJECT', payload: p }),
    remove: (id: string) => dispatch({ type: 'DELETE_PROJECT', payload: id }),
  };
}

export function useTaskActions() {
  const { dispatch } = useAppContext();
  return {
    add: (t: Omit<Task, 'id'>) => dispatch({ type: 'ADD_TASK', payload: { ...t, id: (Date.now()) } }),
    update: (t: Task) => dispatch({ type: 'UPDATE_TASK', payload: t }),
    remove: (id: number) => dispatch({ type: 'DELETE_TASK', payload: id }),
  };
}

export function useTimesheetActions() {
  const { dispatch } = useAppContext();
  return {
    add: (t: Omit<Timesheet, 'id'>) => dispatch({ type: 'ADD_TIMESHEET', payload: { ...t, id: Date.now() } }),
    remove: (id: string) => dispatch({ type: 'DELETE_TIMESHEET', payload: id }),
  };
}
