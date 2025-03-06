import { Link } from "react-router-dom";

function Register() {
    return (
      <div>
        <h2>Cadastro</h2>
        <form>
          <input type="text" placeholder="Nome" required />
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Senha" required />
          <button type="submit">Cadastrar</button>
        </form>
        <p>Já tem uma conta? <Link to="/login">Entrar</Link></p>
      </div>
    );
  }
  
  export default Register;