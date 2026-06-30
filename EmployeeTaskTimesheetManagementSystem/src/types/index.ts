export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  status: 'Active' | 'Inactive';
  phone?: string;
  joinDate: string;
}

export interface Project {
  id: string;
  projectName: string;
  description: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
}

export interface Task {
  id: number;
  title: string;
  description: string;
  employeeId: number;
  projectId: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
}

export interface Timesheet {
  id: number;
  employeeId: number;
  projectId: number;
  workDate: string;
  hoursWorked: number;
  description: string;
}

export interface Activity {
  id: string;
  employeeId: number;
  action: string;
  date: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

// ─── App Global State ────────────────────────────────────────────────────────
export interface AppState {
  employees: Employee[];
  projects:  Project[];
  tasks:     Task[];
  timesheets: Timesheet[];
  activities: Activity[];
}

// Discriminated union — one type per CRUD operation per entity
export type AppAction =
  // Employees
  | { type: 'ADD_EMPLOYEE';    payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: Employee }
  | { type: 'DELETE_EMPLOYEE'; payload: string }
  // Projects
  | { type: 'ADD_PROJECT';    payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  // Tasks
  | { type: 'ADD_TASK';    payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: number }
  // Timesheets
  | { type: 'ADD_TIMESHEET';    payload: Timesheet }
  | { type: 'DELETE_TIMESHEET'; payload: string };

export interface AppContextType {
  state:    AppState;
  dispatch: React.Dispatch<AppAction>;
}
