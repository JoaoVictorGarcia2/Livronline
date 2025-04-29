// src/pages/Register.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import './../styles/RegisterPage.css'; // <<< Importa o novo CSS

// Interfaces (iguais)
interface Genre { id: number; name: string; }
interface BookSearchResult { id: number; title: string; authors: string | null; }

function Register() {
    // Estados do formulário
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [apiErrors, setApiErrors] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Estados para livros favoritos
    const [bookSearchTerm, setBookSearchTerm] = useState("");
    const [bookSearchResults, setBookSearchResults] = useState<BookSearchResult[]>([]);
    const [selectedBooks, setSelectedBooks] = useState<BookSearchResult[]>([]);
    const [isSearchingBooks, setIsSearchingBooks] = useState<boolean>(false);

    // Estados para gêneros favoritos
    const [genres, setGenres] = useState<Genre[]>([]);
    const [genreSearchTerm, setGenreSearchTerm] = useState(""); // <<< NOVO estado para busca de gênero
    const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);

    const { register } = useAuth();
    const navigate = useNavigate();

    // Busca gêneros na montagem (igual)
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await api.get<Genre[]>('/genres'); // Espera array de Genre
                setGenres(response.data || []);
            } catch (error) { console.error("Erro ao buscar gêneros:", error); }
        };
        fetchGenres();
    }, []);

    // Busca livros (igual)
    useEffect(() => {
        if (bookSearchTerm.trim().length < 2) { setBookSearchResults([]); setIsSearchingBooks(false); return; }
        setIsSearchingBooks(true);
        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await api.get(`/books?search=${encodeURIComponent(bookSearchTerm)}&limit=10`);
                setBookSearchResults(response.data.data || []);
            } catch (error) { console.error("Erro ao buscar livros:", error); setBookSearchResults([]); }
            finally { setIsSearchingBooks(false); }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [bookSearchTerm]);

    // Handlers de seleção/remoção de livro (iguais)
    const handleBookSelect = (book: BookSearchResult) => {
        if (selectedBooks.length < 2 && !selectedBooks.find(b => b.id === book.id)) { setSelectedBooks(prev => [...prev, book]); }
        setBookSearchTerm(""); setBookSearchResults([]);
    };
    const handleBookRemove = (bookId: number) => { setSelectedBooks(prev => prev.filter(b => b.id !== bookId)); };

    // Handler de seleção de gênero (igual)
    const handleGenreChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const genreId = parseInt(event.target.value, 10);
        setSelectedGenreIds(prev => event.target.checked ? [...prev, genreId] : prev.filter(id => id !== genreId));
    };

    // Handler do submit (igual)
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiErrors([]);
        if (selectedBooks.length !== 2) { setApiErrors([{ msg: "Selecione exatamente 2 livros favoritos." }]); return; }
        if (selectedGenreIds.length === 0) { setApiErrors([{ msg: "Selecione pelo menos 1 gênero favorito." }]); return; }
        setLoading(true);
        const userData = { username, email, password, favoriteBookIds: selectedBooks.map(b => b.id), favoriteGenreIds: selectedGenreIds };
        const result = await register(userData);
        setLoading(false);
        if (result.success) { alert("Cadastro realizado com sucesso! Faça o login."); navigate("/login"); }
        else { setApiErrors(result.errors || [{ msg: "Erro desconhecido." }]); }
    };

    // Filtra gêneros baseado na busca do usuário
    const filteredGenres = genres.filter(genre =>
        genre.name.toLowerCase().includes(genreSearchTerm.toLowerCase())
    );

    return (
        // Container principal da página
        <div className="register-page">
            {/* Container do formulário */}
            <div className="register-container">
                <h2>Cadastro</h2>
                <form onSubmit={handleRegister} className="register-form">

                    {/* Grupo de Campos Básicos */}
                    <div className="form-group">
                        <label htmlFor="username">Nome de Usuário</label>
                        <input type="text" id="username" placeholder="Seu nome de usuário" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={loading} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input type="password" id="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} minLength={6}/>
                    </div>

                    <hr className="form-divider"/>

                    {/* Seção Livros Favoritos */}
                    <fieldset className="form-section">
                        <legend>Seus 2 Livros Favoritos</legend>
                        {/* Lista de livros selecionados */}
                        <div className="selected-items-list">
                            {selectedBooks.map(book => (
                                <div key={book.id} className="selected-item">
                                    <span>{book.title}</span>
                                    <button type="button" onClick={() => handleBookRemove(book.id)} className="remove-btn" title="Remover">×</button>
                                </div>
                            ))}
                            {selectedBooks.length < 2 && <span className="placeholder-text">Selecione mais {2 - selectedBooks.length} livro(s)</span>}
                        </div>
                        {/* Input de busca e resultados */}
                        {selectedBooks.length < 2 && (
                            <div className="search-input-group">
                                <label htmlFor="bookSearch">Buscar Livro</label>
                                <input
                                    type="text"
                                    id="bookSearch"
                                    placeholder="Digite o título..."
                                    value={bookSearchTerm}
                                    onChange={(e) => setBookSearchTerm(e.target.value)}
                                    disabled={loading}
                                    className="search-input"
                                />
                                {isSearchingBooks && <p className="loading-text">Buscando...</p>}
                                {bookSearchResults.length > 0 && (
                                    <ul className="search-results-list">
                                        {bookSearchResults.map(book => (
                                            <li key={book.id} onClick={() => handleBookSelect(book)} >
                                                {book.title} {book.authors ? <span className="author-hint">({book.authors})</span> : ''}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </fieldset>

                    <hr className="form-divider"/>

                     {/* Seção Gêneros Favoritos */}
                    <fieldset className="form-section">
                        <legend>Seus Gêneros Favoritos (mín. 1)</legend>
                        {/* Input de busca de gênero */}
                        <div className="search-input-group">
                            <label htmlFor="genreSearch">Buscar Gênero</label>
                             <input
                                type="text"
                                id="genreSearch"
                                placeholder="Digite o nome do gênero..."
                                value={genreSearchTerm}
                                onChange={(e) => setGenreSearchTerm(e.target.value)}
                                disabled={loading}
                                className="search-input genre-search-input" // Classe adicional se precisar
                            />
                        </div>
                        {/* Lista de checkboxes de gêneros (filtrada) */}
                        <div className="checkbox-list-container">
                            {genres.length === 0 && !loading && <p>Carregando gêneros...</p> }
                             {filteredGenres.length > 0 ? filteredGenres.map((genre) => (
                                 <div key={genre.id} className="checkbox-item">
                                     <input
                                         type="checkbox"
                                         id={`genre-${genre.id}`}
                                         value={genre.id}
                                         onChange={handleGenreChange}
                                         checked={selectedGenreIds.includes(genre.id)}
                                         disabled={loading}
                                     />
                                     <label htmlFor={`genre-${genre.id}`}>{genre.name}</label>
                                 </div>
                             )) : (genres.length > 0 && <p>Nenhum gênero encontrado com o termo "{genreSearchTerm}".</p>)}
                        </div>
                    </fieldset>

                    <hr className="form-divider"/>

                    {/* Exibição de Erros da API */}
                    {apiErrors.length > 0 && (
                        <div className="error-message">
                            <strong>Erro no cadastro:</strong>
                            <ul>
                                {apiErrors.map((err, index) => ( <li key={index}>{err.msg}</li> ))}
                            </ul>
                        </div>
                    )}

                    {/* Botão de Cadastro */}
                    <button type="submit" disabled={loading} className="submit-button">
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </form>
                {/* Link para Login */}
                <p className="login-link">
                    Já tem uma conta? <Link to="/login">Entrar</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;