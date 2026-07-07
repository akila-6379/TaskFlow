import { Employee, Project, Task, Timesheet, Activity } from '@/types';

export const seedEmployees: Employee[] = [
  { id: '1', employeeId: 'EMP001', name: 'Alice Johnson',  email: 'alice@company.com',  department: 'Engineering', designation: 'Senior Developer',   status: 'Active',   phone: '+1-555-0101', joinDate: '2021-03-15' },
  { id: '2', employeeId: 'EMP002', name: 'Bob Smith',      email: 'bob@company.com',    department: 'Design',      designation: 'UI/UX Designer',      status: 'Active',   phone: '+1-555-0102', joinDate: '2020-07-20' },
  { id: '3', employeeId: 'EMP003', name: 'Carol White',    email: 'carol@company.com',  department: 'Management',  designation: 'Project Manager',     status: 'Active',   phone: '+1-555-0103', joinDate: '2019-11-01' },
  { id: '4', employeeId: 'EMP004', name: 'David Brown',    email: 'david@company.com',  department: 'Engineering', designation: 'Backend Developer',   status: 'Active',   phone: '+1-555-0104', joinDate: '2022-01-10' },
  { id: '5', employeeId: 'EMP005', name: 'Eva Martinez',   email: 'eva@company.com',    department: 'QA',          designation: 'QA Engineer',         status: 'Inactive', phone: '+1-555-0105', joinDate: '2021-06-05' },
  { id: '6', employeeId: 'EMP006', name: 'Frank Lee',      email: 'frank@company.com',  department: 'DevOps',      designation: 'DevOps Engineer',     status: 'Active',   phone: '+1-555-0106', joinDate: '2020-09-12' },
  { id: '7', employeeId: 'EMP007', name: 'Grace Kim',      email: 'grace@company.com',  department: 'Engineering', designation: 'Frontend Developer',  status: 'Active',   phone: '+1-555-0107', joinDate: '2022-04-18' },
  { id: '8', employeeId: 'EMP008', name: 'Henry Wilson',   email: 'henry@company.com',  department: 'HR',          designation: 'HR Manager',          status: 'Active',   phone: '+1-555-0108', joinDate: '2018-12-03' },
];

export const seedProjects: Project[] = [
  { id: '1', projectName: 'E-Commerce Platform',  startDate: '2024-01-15', endDate: '2024-12-31', progress: 72, status: 'In Progress',    description: 'Full-stack e-commerce solution' },
  { id: '2', projectName: 'Mobile Banking App',   startDate: '2024-03-01', endDate: '2024-09-30', progress: 55, status: 'In Progress',    description: 'Cross-platform mobile banking application' },
  { id: '3', projectName: 'HR Management System', startDate: '2023-06-01', endDate: '2024-06-01', progress: 100, status: 'Completed', description: 'Internal HR management platform' },
  { id: '4', projectName: 'Analytics Dashboard',  startDate: '2024-05-01', endDate: '2025-02-28', progress: 38, status: 'In Progress',    description: 'Business intelligence dashboard' },
  { id: '5', projectName: 'API Gateway Redesign', startDate: '2024-02-15', endDate: '2024-08-15', progress: 30, status: 'On Hold',   description: 'Microservices API gateway' },
  { id: '6', projectName: 'CRM Integration',      startDate: '2024-07-01', endDate: '2025-01-31', progress: 20, status: 'In Progress',    description: 'CRM system integration project' },
];

export const seedTasks: Task[] = [
  { id: 1, title: 'Implement authentication module', employeeId: 1, projectId: 1, description: 'Implement authentication module', dueDate: '2024-12-15', status: 'In Progress' },
  { id: 2, title: 'Design landing page wireframes',  employeeId: 2, projectId: 2, description: 'Design landing page wireframes',  dueDate: '2024-12-20', status: 'Pending' },
  { id: 3, title: 'Write unit tests for API',        employeeId: 5, projectId: 1, description: 'Write unit tests for API',        dueDate: '2024-12-10', status: 'Pending' },
  { id: 4, title: 'Setup CI/CD pipeline',            employeeId: 6, projectId: 5, description: 'Setup CI/CD pipeline',            dueDate: '2024-12-25', status: 'In Progress' },
  { id: 5, title: 'Database schema optimization',    employeeId: 4, projectId: 4, description: 'Database schema optimization',    dueDate: '2025-01-05', status: 'Pending' },
  { id: 6, title: 'User acceptance testing',         employeeId: 5, projectId: 3, description: 'User acceptance testing',         dueDate: '2024-12-01', status: 'Completed' },
  { id: 7, title: 'Mobile responsive design',        employeeId: 7, projectId: 2, description: 'Mobile responsive design',        dueDate: '2024-12-18', status: 'In Progress' },
  { id: 8, title: 'Performance optimization',        employeeId: 1, projectId: 1, description: 'Performance optimization',        dueDate: '2025-01-10', status: 'Pending' },
];

export const seedTimesheets: Timesheet[] = [
  { id: 1, employeeId: 1, projectId: 1, workDate: '2024-12-02', hoursWorked: 8,   description: 'Completed OAuth integration' },
  { id: 2, employeeId: 2, projectId: 2, workDate: '2024-12-02', hoursWorked: 6,   description: 'Created initial mockups' },
  { id: 3, employeeId: 4, projectId: 4, workDate: '2024-12-02', hoursWorked: 7.5, description: 'Query performance improved' },
  { id: 4, employeeId: 6, projectId: 5, workDate: '2024-12-01', hoursWorked: 8,   description: 'Jenkins pipeline configured' },
  { id: 5, employeeId: 7, projectId: 2, workDate: '2024-12-01', hoursWorked: 7,   description: 'Tablet breakpoints done' },
  { id: 6, employeeId: 1, projectId: 1, workDate: '2024-12-01', hoursWorked: 8,   description: 'JWT token implementation' },
  { id: 7, employeeId: 3, projectId: 6, workDate: '2024-11-30', hoursWorked: 5,   description: 'Sprint planning meeting' },
  { id: 8, employeeId: 8, projectId: 3, workDate: '2024-11-30', hoursWorked: 6,   description: 'Annual policy update' },
];

export const seedActivities: Activity[] = [
  { id: '1', employeeId: 1, action: 'Completed task: OAuth integration',          date: '2024-12-02 10:30' },
  { id: '2', employeeId: 2, action: 'Uploaded design files for review',            date: '2024-12-02 09:15' },
  { id: '3', employeeId: 3, action: 'Created new project: CRM Integration',        date: '2024-12-01 15:45' },
  { id: '4', employeeId: 4, action: 'Logged 7.5 hours on Analytics Dashboard',     date: '2024-12-01 18:00' },
  { id: '5', employeeId: 5, action: 'Reported blocker on API unit tests',           date: '2024-11-30 14:20' },
  { id: '6', employeeId: 6, action: 'Deployed staging environment',                date: '2024-11-30 11:00' },
];

// Historical chart data — static reference values for the trend chart
export const taskCompletionTrend = [
  { month: 'Aug', completed: 18, pending: 8 },
  { month: 'Sep', completed: 22, pending: 12 },
  { month: 'Oct', completed: 28, pending: 6 },
  { month: 'Nov', completed: 25, pending: 10 },
  { month: 'Dec', completed: 15, pending: 5 },
];
