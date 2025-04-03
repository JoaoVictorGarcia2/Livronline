import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  username: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    };
    loadUser();
  }, []);

  const register = async (username: string, email: string, password: string) => {
    const newUser: User = { username, email, password };
    await AsyncStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
    return true; // Registro bem-sucedido
  };

  const login = async (identifier: string, password: string) => {
    const storedUser = await AsyncStorage.getItem("user");
    if (!storedUser) return false;

    const userData: User = JSON.parse(storedUser);
    if ((userData.username === identifier || userData.email === identifier) && userData.password === password) {
      setUser(userData);
      return true; // Login bem-sucedido
    }
    return false;
  };

  const logout = async () => {
    await AsyncStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
};
