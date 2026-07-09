import api from './api';

export interface ProfilePayload {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  bio: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  getProfile: (userId: number) =>
    api.get(`/Auth/profile/${userId}`).then(r => r.data),

  updateProfile: (userId: number, payload: ProfilePayload) =>
    api.put(`/Auth/profile/${userId}`, payload).then(r => r.data),

  changePassword: (userId: number, payload: ChangePasswordPayload) =>
    api.put(`/Auth/change-password/${userId}`, payload).then(r => r.data),
};
