import api from "./api";
import { Employee } from "@/types";

export const employeeService = {
  getAll: async (): Promise<Employee[]> => {
    const response = await api.get("/Employee");
    return response.data;
  },

  create: async (data: Omit<Employee, "id">): Promise<Employee> => {
    const response = await api.post("/Employee", data);
    return response.data;
  },

  update: async (id: number, data: Employee): Promise<Employee> => {
    const response = await api.put(`/Employee/${id}`, data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/Employee/${id}`);
  },
};