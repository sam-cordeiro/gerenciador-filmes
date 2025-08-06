import React, { useEffect, useState } from "react";
import "./App.css";

interface Filme {
  id: string;
  titulo: string;
  diretor: string;
  ano: number;
  disponivel: boolean;
}

const API_BASE_URL = "http://localhost:3001";

const App: React.FC = () => {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [diretor, setDiretor] = useState("");
  const [ano, setAno] = useState(2025);

  const [searchTerm, setSearchTerm] = useState("");

  const fetchFilmes = async (searchQuery = "") => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/filmes?search=${searchQuery}`
      );
      if (!response.ok) throw new Error("Erro ao buscar filmes");
      const data: Filme[] = await response.json();
      setFilmes(data);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar filmes. Verifique se o servidor está rodando.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilmes(searchTerm);
  }, [searchTerm]);

  const handleAdicionarFilme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !diretor || !ano) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    const novoFilme = { titulo, diretor, ano };
    try {
      const response = await fetch(`${API_BASE_URL}/filmes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoFilme),
      });
      if (!response.ok) throw new Error("Erro ao adicionar filme");
      alert("Filme adicionado com sucesso!");
      fetchFilmes();
      setTitulo("");
      setDiretor("");
      setAno(2025);
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar filme. Verifique se o servidor está rodando.");
    }
  };

  const handleEditarFilme = async (id: string) => {
    const filme = filmes.find((f) => f.id === id);
    if (filme) {
      const novoTitulo = prompt("Digite o novo título do filme:", filme.titulo);
      if (novoTitulo) {
        try {
          const response = await fetch(`${API_BASE_URL}/filmes/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ titulo: novoTitulo }),
          });
          if (!response.ok) throw new Error("Erro ao editar filme");
          alert("Filme editado com sucesso!");
          fetchFilmes();
        } catch (error) {
          console.error(error);
          alert("Erro ao editar filme. Verifique o console.");
        }
      }
    }
  };

  const handleDeletarFilme = async (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar este filme?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/filmes/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Erro ao deletar filme");
        alert("Filme deletado com sucesso!");
        fetchFilmes();
      } catch (error) {
        console.error(error);
        alert("Erro ao deletar filme. Verifique o console.");
      }
    }
  };

  const handleAlugarFilme = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/filmes/alugar/${id}`, {
        method: "PUT",
      });
      if (!response.ok) throw new Error("Erro ao alugar filme");
      alert("Filme alugado com sucesso!");
      fetchFilmes();
    } catch (error) {
      console.error(error);
      alert("Erro ao alugar filme. Verifique o console.");
    }
  };

  const handleDevolverFilme = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/filmes/devolver/${id}`, {
        method: "PUT",
      });
      if (!response.ok) throw new Error("Erro ao devolver filme");
      alert("Filme devolvido com sucesso!");
      fetchFilmes();
    } catch (error) {
      console.error(error);
      alert("Erro ao devolver filme. Verifique o console.");
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>🎬 Gerenciador de Filmes</h1>
      </header>

      <section className="form-section">
        <h2>Adicionar Novo Filme</h2>
        <form onSubmit={handleAdicionarFilme} className="movie-form">
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título do filme"
            required
          />
          <input
            type="text"
            value={diretor}
            onChange={(e) => setDiretor(e.target.value)}
            placeholder="Diretor"
            required
          />
          <input
            type="number"
            value={ano}
            onChange={(e) => setAno(parseInt(e.target.value))}
            placeholder="Ano de lançamento"
            required
          />
          <button type="submit" className="btn btn-primary">
            Adicionar
          </button>
        </form>
      </section>

      <section className="list-section">
        <div className="list-header">
          <h2>Lista de Filmes</h2>
          <div className="search-group">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar..."
            />
          </div>
        </div>

        {isLoading ? (
          <p className="loading-message">Carregando filmes...</p>
        ) : (
          <ul className="movie-list">
            {filmes.map((filme) => (
              <li key={filme.id} className="movie-item">
                <div className="movie-details">
                  <h3>{filme.titulo}</h3>
                  <p>
                    Diretor: {filme.diretor} | Ano: {filme.ano}
                  </p>
                  <p className="movie-status">
                    Status:{" "}
                    <span
                      className={
                        filme.disponivel
                          ? "status-disponivel"
                          : "status-alugado"
                      }
                    >
                      {filme.disponivel ? "Disponível" : "Alugado"}
                    </span>
                  </p>
                </div>
                <div className="movie-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleEditarFilme(filme.id)}
                  >
                    Editar
                  </button>
                  {filme.disponivel && (
                    <button
                      className="btn btn-alugar"
                      onClick={() => handleAlugarFilme(filme.id)}
                    >
                      Alugar
                    </button>
                  )}
                  {!filme.disponivel && (
                    <button
                      className="btn btn-devolver"
                      onClick={() => handleDevolverFilme(filme.id)}
                    >
                      Devolver
                    </button>
                  )}
                  <button
                    className="btn btn-delete"
                    onClick={() => handleDeletarFilme(filme.id)}
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default App;
