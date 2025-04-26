// src/pages/Login.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // Estado para erro de login
  const [loading, setLoading] = useState<boolean>(false); // Estado para loading
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Limpa erro anterior
    setLoading(true); // Ativa loading

    const success = await login(identifier, password); // Chama a função async do context

    setLoading(false); // Desativa loading
    if (success) {
      // alert("Login realizado com sucesso!"); // Opcional
      navigate("/"); // Redireciona para Home
    } else {
      setError("Usuário ou senha inválidos!"); // Define a mensagem de erro
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Nome de Usuário ou Email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          disabled={loading} // Desabilita enquanto carrega
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading} // Desabilita enquanto carrega
        />
         {error && <p style={{ color: 'red' }}>{error}</p>} {/* Exibe erro */}
        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'} {/* Muda texto do botão */}
        </button>
      </form>
      <p>Não tem uma conta? <Link to="/register">Cadastre-se</Link></p>
    </div>
  );
}

export default Login;