import api from "./api";

export interface DashboardStats {
  totalEmployees: number;
  activeProjects: number;
  totalTasks: number;
  hoursLogged: number;
  employeesLoggedToday: number;
}

/** Compute KPIs from the individual CRUD endpoints as a fallback. */
async function computeStatsFromEntities(): Promise<DashboardStats> {
  const [employees, projects, tasks, timesheets] = await Promise.all([
    api.get("/Employee").then(r => r.data).catch(() => []),
    api.get("/Project").then(r => r.data).catch(() => []),
    api.get("/Task").then(r => r.data).catch(() => []),
    api.get("/Timesheet").then(r => r.data).catch(() => []),
  ]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const employeesLoggedToday = Array.isArray(timesheets)
    ? new Set(
        timesheets
          .filter((t: any) => (t.workDate ?? "").slice(0, 10) === todayStr)
          .map((t: any) => t.employeeId)
      ).size
    : 0;

  return {
    totalEmployees: Array.isArray(employees) ? employees.length : 0,
    activeProjects: Array.isArray(projects)
      ? projects.filter((p: any) => p.status === "Active" || p.status === "In Progress").length
      : 0,
    totalTasks: Array.isArray(tasks) ? tasks.length : 0,
    hoursLogged: Array.isArray(timesheets)
      ? parseFloat(
          timesheets.reduce((s: number, t: any) => s + (t.hoursWorked ?? 0), 0).toFixed(1)
        )
      : 0,
    employeesLoggedToday,
  };
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get("/Dashboard/stats");
      return response.data;
    } catch (err: any) {
      // If the dedicated stats endpoint is broken (5xx) fall back to computing
      // the same KPIs from the individual entity endpoints.
      const status = err?.response?.status;
      if (!status || status >= 500) {
        console.warn(
          `[dashboardService] /Dashboard/stats returned ${status ?? "network error"} — falling back to entity endpoints.`
        );
        return computeStatsFromEntities();
      }
      throw err;
    }
  },
};