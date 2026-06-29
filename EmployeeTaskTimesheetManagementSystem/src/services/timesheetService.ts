import api from "./api";
import { Timesheet } from "@/types";

export const timesheetService = {
  getAll: async (): Promise<Timesheet[]> => {
    const response = await api.get("/Timesheet");
    return response.data;
  },

  create: async (data: Omit<Timesheet, "id">): Promise<Timesheet> => {
    const response = await api.post("/Timesheet", data);
    return response.data;
  },

  update: async (id: number, data: Timesheet): Promise<Timesheet> => {
    const response = await api.put(`/Timesheet/${id}`, data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/Timesheet/${id}`);
  },
};