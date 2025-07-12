import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  name: string;
  email: string;
  jobRole?: string;
  company?: string;
  resumeName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  jobRole?: string;
  company?: string;
}

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiRequest("POST", "/api/auth/login", data);
  return response.json();
};

export const signup = async (data: SignupData): Promise<AuthResponse> => {
  const response = await apiRequest("POST", "/api/auth/signup", data);
  return response.json();
};

export const getToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const setToken = (token: string): void => {
  localStorage.setItem("auth_token", token);
};

export const removeToken = (): void => {
  localStorage.removeItem("auth_token");
};

export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

export const logout = (): void => {
  removeToken();
  window.location.href = "/";
};
