// src/pages/Login.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import './../styles/LoginPage.css'; // <<< Importa o novo CSS

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const success = await login(identifier, password);
    setLoading(false);
    if (success) {
      navigate("/");
    } else {
      setError("Nome de usuário, email ou senha inválidos!"); // Mensagem mais clara
    }
  };

  return (
    // Container da página
    <div className="login-page">
        {/* Container do formulário */}
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin} className="login-form">
                {/* Grupo para Identificador */}
                <div className="form-group">
                    <label htmlFor="identifier">Nome de Usuário ou Email</label>
                    <input
                      type="text"
                      id="identifier"
                      placeholder="Digite seu usuário ou email"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      disabled={loading}
                    />
                </div>
                {/* Grupo para Senha */}
                <div className="form-group">
                    <label htmlFor="password">Senha</label>
                    <input
                      type="password"
                      id="password"
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                </div>

                {/* Exibição de Erro */}
                {error && <p className="error-message">{error}</p>}

                {/* Botão de Submit */}
                <button type="submit" disabled={loading} className="submit-button">
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
            {/* Link para Cadastro */}
            <p className="register-link">
                Não tem uma conta? <Link to="/register">Cadastre-se</Link>
            </p>
        </div>
    </div>
  );
}

export default Login;