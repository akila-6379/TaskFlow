import api from "./api";
import { Project } from "@/types";

export const projectService = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get("/Project");
    return response.data;
  },

  create: async (data: Omit<Project, "id">): Promise<Project> => {
    const response = await api.post("/Project", data);
    return response.data;
  },

  update: async (id: number, data: Project): Promise<Project> => {
    const response = await api.put(`/Project/${id}`, data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/Project/${id}`);
  },
};