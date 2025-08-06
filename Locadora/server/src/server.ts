import express, { Request, Response } from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { promises as fs } from "fs";
import { dir, error } from "console";

interface Filme {
  id: string;
  titulo: string;
  diretor: string;
  ano: number;
  disponivel: boolean;
}

const app = express();
const PORT = 3001;
const DB_PATH = "./database/filmes.json";

app.use(cors());
app.use(express.json());

const loadFilmes = async (): Promise<Filme[]> => {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    throw error;
  }
};

const saveFilmes = async (filmes: Filme[]): Promise<void> => {
  await fs.writeFile(DB_PATH, JSON.stringify(filmes, null, 2), "utf-8");
};

//lógica para retornar a lista de filmes
app.get("/filmes", async (req: Request, res: Response) => {
  try {
    let filmes = await loadFilmes();
    const searchTerm = req.query.search as string;

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filmes = filmes.filter(
        (filme) =>
          filme.titulo.toLowerCase().includes(lowerCaseSearch) ||
          filme.diretor.toLowerCase().includes(lowerCaseSearch)
      );
    }

    res.status(200).json(filmes);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar filmes." });
  }
});

app.post("/filmes", async (req: Request, res: Response) => {
  try{
    // dizendo que a requisição "cadastrará" um filme, que tem titulo diretor e ano como atributos
    const{ titulo, diretor, ano } = req.body;

    // validar se algum campo ta vazio
    if(!titulo || !diretor || !ano){
      return res.status(400).json({ message: "Dados incompletos" });
    }

    const novoFilme:Filme = {
      // uuid é um id gerado automaticamente
      id: uuidv4(),
      titulo,
      diretor,
      ano,
      disponivel: true
    }

    // carregar a lista de filmes
    const filmes = await loadFilmes();
    // insere o novo filme na lista
    filmes.push(novoFilme)
    // salva a lista
    await saveFilmes(filmes)
    res.status(200).json(novoFilme)
  }
  catch (error) {
    res.status(500).json({ message: "Erro ao adicionar filme" });
  }
});

//filtra pelo id
app.put("/filmes/:id", async (req: Request, res: Response) => {
  try{
    // dizendo que o id do filme é o parametro da requisição
    const { id } = req.params;
    const { titulo, diretor, ano, disponivel } = req.body;
    // carregar os filmes
    const filmes = await loadFilmes();
    // pesquisa o filme pelo id dele
    const index = filmes.findIndex(filme => filme.id === id);
    //valida se existe o id do filme
    if (index === -1) {
      return res.status(404).json({ message: "Filme não encontrado." });
    };

    filmes[index] = {
      // spread operator
      ...filmes[index],
      //verificar se foi mandado na requisição, senão mantem o que ja estava cadastrado
      titulo: titulo ?? filmes[index].titulo,
      diretor: diretor ?? filmes[index].diretor,
      ano: ano ?? filmes[index].ano,
      disponivel: disponivel ?? filmes[index].disponivel
    };

    await saveFilmes(filmes);
    res.status(200).json(filmes[index])
  }
  catch (error){
    res.status(500).json({ message: "Erro ao atualizar filme" })
  }
});

app.delete("/filmes/:id", async (req: Request, res: Response) => {
  try{
    const { id } = req.params;
    let filmes = await loadFilmes();

    const index = filmes.findIndex(filme => filme.id === id);
    if (index === -1){
      return res.status(404).json({message: "Filme não encontrado"});
    }

    const filmeRemovido = filmes.splice(index, 1)[0];
    await saveFilmes(filmes);

    res.status(200).json(filmeRemovido);
  }
  catch (error) {
    res.status(500).json({ message: "Erro ao deletar filme" });
  }
});

app.put("/filmes/alugar/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const filmes = await loadFilmes();
    const filme = filmes.find(f => f.id === id);

    if (!filme) {
      return res.status(404).json({ message: "Filme não encontrado" });
    }

    //verifica se o filme ja esta alugado
    if (!filme.disponivel) {
      return res.status(400).json({ message: "Filme já está alugado" });
    }

    filme.disponivel = false;
    await saveFilmes(filmes);

    res.status(200).json(filme);
  }
  catch (error) {
    res.status(500).json({ message: "Erro ao alugar filme" });
  }
});

app.put("/filmes/devolver/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const filmes = await loadFilmes();
    const filme = filmes.find(f => f.id === id);

    if (!filme) {
      return res.status(404).json({ message: "Filme não encontrado" });
    }
    //verifica se o filme ja esta disponivel
    if (filme.disponivel) {
      return res.status(400).json({ message: "Filme já está disponível" });
    }

    filme.disponivel = true;
    await saveFilmes(filmes);

    res.status(200).json(filme);
  } catch (error) {
    res.status(500).json({ message: "Erro ao devolver filme" });
  }
});



app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});