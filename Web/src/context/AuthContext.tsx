// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode"; // Importa a função de decodificação
import api from "../services/api"; // Importa nossa instância axios configurada

// Interface para os dados do usuário que extrairemos do token
interface User {
  id: number;
  username: string;
  // Adicione outros campos se o seu payload JWT incluir (e se for seguro expor)
}

// Interface para o payload decodificado do JWT (ajuste conforme o payload real)
interface DecodedToken {
  user: User;
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean; // Para indicar carregamento inicial
  login: (identifier: string, password: string) => Promise<boolean>; // Agora é async
  logout: () => void;
  register: (userData: any) => Promise<{success: boolean; errors?: any[]}>; // Função para registro
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'authToken'; // Chave para localStorage

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Inicia como true

  // Função para carregar e validar token inicial
  const loadUserFromToken = useCallback(() => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (storedToken) {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        // Verifica se o token expirou
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(decoded.user); // Define o usuário a partir do payload
          console.log("Usuário carregado do token:", decoded.user);
        } else {
          // Token expirado
          localStorage.removeItem(AUTH_TOKEN_KEY);
          console.log("Token expirado removido.");
        }
      }
    } catch (error) {
      console.error("Erro ao decodificar token ou token inválido:", error);
      localStorage.removeItem(AUTH_TOKEN_KEY); // Remove token inválido
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carrega o usuário na montagem inicial do provider
  useEffect(() => {
    loadUserFromToken();
  }, [loadUserFromToken]);

  // Função de Login (agora chama a API)
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
        return true; // Sucesso
      }
      setIsLoading(false);
      return false; // Falha se não houver token na resposta
    } catch (error: any) {
      console.error("Erro na API de login:", error.response?.data || error.message);
      localStorage.removeItem(AUTH_TOKEN_KEY); // Garante que não fique lixo
      setToken(null);
      setUser(null);
      setIsLoading(false);
      return false; // Falha
    }
  };

   // Função de Registro (agora chama a API)
   const register = async (userData: any): Promise<{success: boolean; errors?: any[]}> => {
    setIsLoading(true);
    try {
      // Envia todos os dados necessários para a API
      await api.post('/auth/register', userData);
      console.log("Registro bem-sucedido (API)");
      setIsLoading(false);
      return { success: true }; // Indica sucesso
    } catch (error: any) {
      console.error("Erro na API de registro:", error.response?.data || error.message);
      setIsLoading(false);
      // Retorna os erros da API (se existirem no formato esperado)
      return { success: false, errors: error.response?.data?.errors || [{ msg: 'Erro desconhecido no registro.' }] };
    }
  };


  // Função de Logout
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