import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode"; 
import api from "../services/api"; 

interface User {
  id: number;
  username: string;
}

interface DecodedToken {
  user: User;
  iat: number; 
  exp: number; 
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean; 
  login: (identifier: string, password: string) => Promise<boolean>; 
  logout: () => void;
  register: (userData: any) => Promise<{success: boolean; errors?: any[]}>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'authToken'; 

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); 

  const loadUserFromToken = useCallback(() => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (storedToken) {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(decoded.user); 
          console.log("Usuário carregado do token:", decoded.user);
        } else {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          console.log("Token expirado removido.");
        }
      }
    } catch (error) {
      console.error("Erro ao decodificar token ou token inválido:", error);
      localStorage.removeItem(AUTH_TOKEN_KEY); 
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserFromToken();
  }, [loadUserFromToken]);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { loginIdentifier: identifier, password });
      if (response.data && response.data.token) {
        const receivedToken = response.data.token;
        localStorage.setItem(AUTH_TOKEN_KEY, receivedToken);
        const decoded = jwtDecode<DecodedToken>(receivedToken);
        setToken(receivedToken);
        setUser(decoded.user);
        console.log("Login bem-sucedido, usuário:", decoded.user);
        setIsLoading(false);
        return true; 
      }
      setIsLoading(false);
      return false; 
    } catch (error: any) {
      console.error("Erro na API de login:", error.response?.data || error.message);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setToken(null);
      setUser(null);
      setIsLoading(false);
      return false; 
    }
  };

   const register = async (userData: any): Promise<{success: boolean; errors?: any[]}> => {
    setIsLoading(true);
    try {
      await api.post('/auth/register', userData);
      console.log("Registro bem-sucedido (API)");
      setIsLoading(false);
      return { success: true }; 
    } catch (error: any) {
      console.error("Erro na API de registro:", error.response?.data || error.message);
      setIsLoading(false);
      return { success: false, errors: error.response?.data?.errors || [{ msg: 'Erro desconhecido no registro.' }] };
    }
  };

  const logout = () => {
    console.log("Executando logout...");
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};