import api from "./api";
import { Task } from "@/types";

const buildTaskPayload = (data: Omit<Task, "id"> | Task) => {
  const title = data.title?.trim();
  const description = data.description?.trim() ?? "";
  const employeeId = Number(data.employeeId);
  const projectId = Number(data.projectId);
  const dueDate = data.dueDate?.trim();

  if (!title) {
    throw new Error("Task title is required.");
  }

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    throw new Error("Please select an employee.");
  }

  if (!Number.isInteger(projectId) || projectId <= 0) {
    throw new Error("Please select a project.");
  }

  if (!dueDate) {
    throw new Error("Please select a due date.");
  }

  return {
    id: ("id" in data) ? Number(data.id) : 0,
    title,
    description,
    employeeId,
    projectId,
    status: data.status ?? "Pending",
    dueDate,
  };
};

export const taskService = {
  getAll: async (): Promise<Task[]> => {
    const response = await api.get("/Task");
    return response.data;
  },

  create: async (data: Omit<Task, "id">): Promise<Task> => {
    const payload = buildTaskPayload(data);
    const response = await api.post("/Task", payload);
    return response.data;
  },

  update: async (id: number, data: Task): Promise<Task> => {
    const payload = buildTaskPayload(data);
    const response = await api.put(`/Task/${id}`, payload);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/Task/${id}`);
  },
};