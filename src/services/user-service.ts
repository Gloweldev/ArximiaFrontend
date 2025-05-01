import api from './api';

export interface UserInfo {
  fullName: string;
  email: string;
  role: string;
}

export const getUserInfo = async (): Promise<UserInfo> => {
  const response = await api.get<UserInfo>('/reports/user-info');
  return response.data;
};
