import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [identifier, setIdentifier] = useState(""); 
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const isAuthenticated = login(identifier, password);
    if (isAuthenticated) {
      alert("Login realizado com sucesso!");
      navigate("/");
    } else {
      alert("Usuário ou senha inválidos!");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Nome de Usuário ou Email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
        <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Entrar</button>
      </form>
      <p>Não tem uma conta? <Link to="/register">Cadastre-se</Link></p>
    </div>
  );
}

export default Login;
