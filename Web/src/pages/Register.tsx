// src/pages/Register.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api"; // Importa nossa instância axios

// Interfaces para os dados que vêm da API
interface Genre {
    id: number;
    name: string;
}

interface BookSearchResult {
    id: number;
    title: string;
    authors: string | null;
}

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [apiErrors, setApiErrors] = useState<any[]>([]); // Erros vindos da API
    const [loading, setLoading] = useState<boolean>(false);

    // Estados para seleção de favoritos
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
    const [bookSearchTerm, setBookSearchTerm] = useState("");
    const [bookSearchResults, setBookSearchResults] = useState<BookSearchResult[]>([]);
    const [selectedBooks, setSelectedBooks] = useState<BookSearchResult[]>([]); // Guarda os objetos dos livros selecionados
    const [isSearchingBooks, setIsSearchingBooks] = useState<boolean>(false);

    const { register } = useAuth(); // Pega a função register do context
    const navigate = useNavigate();

    // Busca gêneros na montagem do componente
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await api.get('/genres');
                setGenres(response.data || []);
            } catch (error) {
                console.error("Erro ao buscar gêneros:", error);
                // Poderia definir um erro aqui para exibir na UI
            }
        };
        fetchGenres();
    }, []);

    // Busca livros quando o termo de busca muda (com debounce simples)
    useEffect(() => {
        // Evita busca vazia
        if (bookSearchTerm.trim().length < 2) { // Só busca com pelo menos 2 caracteres
             setBookSearchResults([]);
             setIsSearchingBooks(false);
             return;
        }

        setIsSearchingBooks(true);
        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await api.get(`/books?search=${bookSearchTerm}&limit=10`); // Limita resultados
                setBookSearchResults(response.data.data || []);
            } catch (error) {
                console.error("Erro ao buscar livros:", error);
                setBookSearchResults([]); // Limpa resultados em caso de erro
            } finally {
                 setIsSearchingBooks(false);
            }
        }, 500); // Espera 500ms após parar de digitar

        return () => clearTimeout(delayDebounceFn); // Limpa o timeout se o termo mudar antes
    }, [bookSearchTerm]);


    // Manipulador para seleção de gênero (checkbox)
    const handleGenreChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const genreId = parseInt(event.target.value, 10);
        if (event.target.checked) {
            setSelectedGenreIds((prev) => [...prev, genreId]);
        } else {
            setSelectedGenreIds((prev) => prev.filter((id) => id !== genreId));
        }
    };

     // Manipulador para seleção de livro favorito
     const handleBookSelect = (book: BookSearchResult) => {
         // Limita a seleção a 2 livros
        if (selectedBooks.length < 2 && !selectedBooks.find(b => b.id === book.id)) {
             setSelectedBooks(prev => [...prev, book]);
        }
         // Limpa a busca após selecionar (opcional)
         setBookSearchTerm("");
         setBookSearchResults([]);
    };

     // Manipulador para remover livro selecionado
     const handleBookRemove = (bookId: number) => {
         setSelectedBooks(prev => prev.filter(b => b.id !== bookId));
     };


    // Manipulador do submit do formulário
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiErrors([]); // Limpa erros anteriores

        // Validação básica do lado do cliente
        if (selectedBooks.length !== 2) {
             setApiErrors([{ msg: "Por favor, selecione exatamente 2 livros favoritos." }]);
             return;
        }
         if (selectedGenreIds.length === 0) {
             setApiErrors([{ msg: "Por favor, selecione pelo menos 1 gênero favorito." }]);
             return;
         }

        setLoading(true);

        const userData = {
            username,
            email,
            password,
            favoriteBookIds: selectedBooks.map(b => b.id), // Pega apenas os IDs
            favoriteGenreIds: selectedGenreIds,
        };

        const result = await register(userData); // Chama a função do context

        setLoading(false);
        if (result.success) {
            alert("Cadastro realizado com sucesso! Faça o login.");
            navigate("/login");
        } else {
            setApiErrors(result.errors || [{ msg: "Erro desconhecido no registro." }]);
        }
    };

    return (
        <div>
            <h2>Cadastro</h2>
            <form onSubmit={handleRegister}>
                {/* Campos Username, Email, Password */}
                <input type="text" placeholder="Nome de Usuário" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={loading}/>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading}/>
                <input type="password" placeholder="Senha (mín. 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading}/>

                 <hr />

                 {/* Seleção de Livros Favoritos */}
                 <div>
                    <label>Seus 2 Livros Favoritos:</label>
                    <div>
                        {selectedBooks.map(book => (
                            <div key={book.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                <span>{book.title}</span>
                                <button type="button" onClick={() => handleBookRemove(book.id)} style={{ marginLeft: '10px' }}>X</button>
                            </div>
                        ))}
                    </div>
                    {selectedBooks.length < 2 && (
                        <div>
                            <input
                                type="text"
                                placeholder="Buscar livro pelo título..."
                                value={bookSearchTerm}
                                onChange={(e) => setBookSearchTerm(e.target.value)}
                                disabled={loading}
                            />
                            {isSearchingBooks && <p>Buscando...</p>}
                            {bookSearchResults.length > 0 && (
                                <ul style={{ listStyle: 'none', padding: 0, border: '1px solid #ccc', maxHeight: '150px', overflowY: 'auto' }}>
                                    {bookSearchResults.map(book => (
                                        <li key={book.id} onClick={() => handleBookSelect(book)} style={{ cursor: 'pointer', padding: '5px' }}>
                                            {book.title} {book.authors ? `(${book.authors})` : ''}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                 </div>

                 <hr />

                 {/* Seleção de Gêneros Favoritos */}
                <div>
                     <label>Seus Gêneros Favoritos (selecione pelo menos 1):</label>
                     <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                         {genres.length > 0 ? genres.map((genre) => (
                             <div key={genre.id}>
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
                         )) : <p>Carregando gêneros...</p>}
                     </div>
                </div>

                <hr />

                 {/* Exibição de Erros da API */}
                 {apiErrors.length > 0 && (
                    <div style={{ color: 'red', marginBottom: '10px' }}>
                        <strong>Erro no cadastro:</strong>
                        <ul>
                            {apiErrors.map((err, index) => (
                                <li key={index}>{err.msg}</li>
                            ))}
                        </ul>
                    </div>
                 )}

                <button type="submit" disabled={loading}>
                    {loading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
            </form>
            <p>Já tem uma conta? <Link to="/login">Entrar</Link></p>
        </div>
    );
}

export default Register;