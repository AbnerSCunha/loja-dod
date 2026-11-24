import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { Produto, Cliente, Funcionario, Venda } from './models/schemas.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Conecta ao MongoDB Atlas ao iniciar o servidor
connectDB();

// Rota de status da API
app.get('/api/status', (req, res) => {
  res.json({ status: 'API DOD Alfaiataria (NoSQL / MongoDB) rodando!' });
});

// ==========================================
// ROTAS DE PRODUTOS (CRUD + Consulta Estruturada)
// ==========================================

// Listar produtos (com suporte a filtros estruturados via query params)
// Ex: GET /api/produtos?tamanho=M ou GET /api/produtos?categoria=Acessórios
app.get('/api/produtos', async (req, res) => {
  try {
    const filtro = {};
    if (req.query.tamanho) filtro.tamanho = req.query.tamanho;
    if (req.query.categoria) filtro['categoria.descricao'] = req.query.categoria;

    const produtos = await Produto.find(filtro);
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos', details: error.message });
  }
});

// Inserir novo produto (com categoria aninhada)
app.post('/api/produtos', async (req, res) => {
  try {
    const { descricao, tamanho, preco, quantidade_estoque, imagem_url, categoria } = req.body;
    const novoProduto = await Produto.create({
      descricao,
      tamanho,
      preco,
      quantidade_estoque,
      imagem_url,
      // Aceita tanto objeto { descricao: "..." } quanto string simples
      categoria: typeof categoria === 'string' ? { descricao: categoria } : categoria
    });
    res.status(201).json(novoProduto);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao cadastrar produto', details: error.message });
  }
});

// Atualizar produto (ex: preço ou estoque)
app.put('/api/produtos/:id', async (req, res) => {
  try {
    const produtoAtualizado = await Produto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!produtoAtualizado) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(produtoAtualizado);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar produto', details: error.message });
  }
});

// Excluir produto
app.delete('/api/produtos/:id', async (req, res) => {
  try {
    const produtoRemovido = await Produto.findByIdAndDelete(req.params.id);
    if (!produtoRemovido) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ message: 'Produto excluído com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir produto', details: error.message });
  }
});

// ==========================================
// ROTAS DE CLIENTES (CRUD)
// ==========================================
app.get('/api/clientes', async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes', details: error.message });
  }
});

app.post('/api/clientes', async (req, res) => {
  try {
    const novoCliente = await Cliente.create(req.body);
    res.status(201).json(novoCliente);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao cadastrar cliente', details: error.message });
  }
});

app.put('/api/clientes/:id', async (req, res) => {
  try {
    const clienteAtualizado = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!clienteAtualizado) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(clienteAtualizado);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar cliente', details: error.message });
  }
});

app.delete('/api/clientes/:id', async (req, res) => {
  try {
    await Cliente.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cliente excluído com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir cliente', details: error.message });
  }
});

// ==========================================
// ROTAS DE FUNCIONÁRIOS (CRUD)
// ==========================================
app.get('/api/funcionarios', async (req, res) => {
  try {
    const funcionarios = await Funcionario.find();
    res.json(funcionarios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar funcionários', details: error.message });
  }
});

app.post('/api/funcionarios', async (req, res) => {
  try {
    const novoFuncionario = await Funcionario.create(req.body);
    res.status(201).json(novoFuncionario);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao cadastrar funcionário', details: error.message });
  }
});

app.delete('/api/funcionarios/:id', async (req, res) => {
  try {
    await Funcionario.findByIdAndDelete(req.params.id);
    res.json({ message: 'Funcionário excluído com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir funcionário', details: error.message });
  }
});

// ==========================================
// ROTAS DE VENDAS (Embedding + References)
// ==========================================

// Listar vendas resolvendo as referências de Cliente e Funcionário
app.get('/api/vendas', async (req, res) => {
  try {
    const vendas = await Venda.find()
      .populate('cliente_id', 'nome email')
      .populate('funcionario_id', 'nome cargo');
    res.json(vendas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar vendas', details: error.message });
  }
});

// Registrar nova venda e atualizar o estoque dos produtos
app.post('/api/vendas', async (req, res) => {
  try {
    const { cliente_id, funcionario_id, itens } = req.body;

    // Calcula o valor total com base nos itens enviados
    const valor_total = itens.reduce((acc, item) => acc + item.preco_unitario * item.quantidade, 0);

    // Cria o documento da venda
    const novaVenda = await Venda.create({
      cliente_id,
      funcionario_id,
      itens,
      valor_total
    });

    // Atualiza (decrementa) o estoque de cada produto vendido
    for (const item of itens) {
      await Produto.findByIdAndUpdate(item.produto_id, {
        $inc: { quantidade_estoque: -item.quantidade }
      });
    }

    res.status(201).json(novaVenda);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao registrar venda', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});