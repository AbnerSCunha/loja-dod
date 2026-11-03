import express from 'express';
import cors from 'cors';
import { pool } from './config/db.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/status', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({ status: 'Conectado ao Aiven com sucesso através do db.js!', data: rows });
  } catch (error) {
    res.status(500).json({ error: 'Falha na conexão', details: error.message });
  }
});

// ==========================================
// ROTAS DE PRODUTOS
// ==========================================
app.get('/api/produtos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM PRODUTO');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos', details: error.message });
  }
});

app.post('/api/produtos', async (req, res) => {
  const { id_produto, descricao, tamanho, preco, quantidade_estoque, id_categoria, imagem_url } = req.body;
  try {
    await pool.query(
      'INSERT INTO PRODUTO (id_produto, descricao, tamanho, preco, quantidade_estoque, id_categoria, imagem_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id_produto, descricao, tamanho, preco, quantidade_estoque, id_categoria, imagem_url]
    );
    res.status(201).json({ message: 'Produto cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar produto', details: error.message });
  }
});

// ==========================================
// ROTAS DE CATEGORIAS
// ==========================================
app.get('/api/categorias', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM CATEGORIA');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar categorias', details: error.message });
  }
});

app.post('/api/categorias', async (req, res) => {
  const { id_categoria, descricao } = req.body;
  try {
    await pool.query('INSERT INTO CATEGORIA (id_categoria, descricao) VALUES (?, ?)', [id_categoria, descricao]);
    res.status(201).json({ message: 'Categoria cadastrada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar categoria', details: error.message });
  }
});

// ==========================================
// ROTAS DE CLIENTES
// ==========================================
app.get('/api/clientes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM CLIENTE');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes', details: error.message });
  }
});

app.post('/api/clientes', async (req, res) => {
  const { id_cliente, nome, email, telefone } = req.body;
  try {
    await pool.query(
      'INSERT INTO CLIENTE (id_cliente, nome, email, telefone) VALUES (?, ?, ?, ?)',
      [id_cliente, nome, email, telefone]
    );
    res.status(201).json({ message: 'Cliente cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar cliente', details: error.message });
  }
});

// ==========================================
// ROTAS DE FUNCIONÁRIOS
// ==========================================
app.get('/api/funcionarios', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM FUNCIONARIO');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar funcionários', details: error.message });
  }
});

app.post('/api/funcionarios', async (req, res) => {
  const { id_funcionario, nome, cargo } = req.body;
  try {
    await pool.query(
      'INSERT INTO FUNCIONARIO (id_funcionario, nome, cargo) VALUES (?, ?, ?)',
      [id_funcionario, nome, cargo]
    );
    res.status(201).json({ message: 'Funcionário cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar funcionário', details: error.message });
  }
});

// ==========================================
// ROTA TRANSACIONAL DE VENDAS
// ==========================================
app.post('/api/vendas', async (req, res) => {
  // A requisição vai receber o cliente, o funcionário e um array de itens (o carrinho)
  const { id_cliente, id_funcionario, itens } = req.body;
  
  if (!itens || itens.length === 0) {
    return res.status(400).json({ error: 'A venda precisa de pelo menos um item.' });
  }

  // Calcula o valor total da venda no back-end (mais seguro do que confiar no front-end)
  const valor_total = itens.reduce((total, item) => total + (item.quantidade * item.valor_unitario), 0);
  
  // Pega uma conexão dedicada do pool para gerenciar a transação
  const connection = await pool.getConnection();

  try {
    // 1. Inicia a transação de bloqueio
    await connection.beginTransaction();

    // 2. Cria o registro principal da Venda
    const data_venda = new Date().toISOString().slice(0, 19).replace('T', ' '); // Formata data pro MySQL
    const [resultVenda] = await connection.query(
      'INSERT INTO VENDA (data_venda, valor_total, id_cliente, id_funcionario) VALUES (?, ?, ?, ?)',
      [data_venda, valor_total, id_cliente, id_funcionario]
    );
    const id_venda = resultVenda.insertId; // Pega o ID que o Aiven gerou para esta venda

    // 3. Processa cada item do carrinho
    for (const item of itens) {
      // Salva o item vinculando ao ID da venda
      await connection.query(
        'INSERT INTO ITEM_VENDA (id_venda, id_produto, quantidade, valor_unitario) VALUES (?, ?, ?, ?)',
        [id_venda, item.id_produto, item.quantidade, item.valor_unitario]
      );

      // Dá baixa no estoque subtraindo a quantidade comprada
      await connection.query(
        'UPDATE PRODUTO SET quantidade_estoque = quantidade_estoque - ? WHERE id_produto = ?',
        [item.quantidade, item.id_produto]
      );
    }

    // 4. Se chegou até aqui sem erros, confirma a gravação definitiva no Aiven
    await connection.commit();
    res.status(201).json({ message: 'Venda finalizada com sucesso!', id_venda });

  } catch (error) {
    // Se der QUALQUER erro no meio do caminho, desfaz tudo para não corromper os dados
    await connection.rollback();
    res.status(500).json({ error: 'Erro ao processar venda. Transação cancelada.', details: error.message });
  } finally {
    // Devolve a conexão para o pool
    connection.release();
  }
});

// ==========================================
// ROTA PARA DELETAR PRODUTO
// ==========================================
app.delete('/api/produtos/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await pool.query('DELETE FROM PRODUTO WHERE id_produto = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    
    res.json({ message: 'Produto excluído com sucesso!' });
  } catch (error) {
    // Tratamento inteligente: Se o produto já estiver numa venda, o MySQL bloqueia a exclusão
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ error: 'Não é possível excluir um produto que já possui vendas registradas.' });
    }
    res.status(500).json({ error: 'Erro ao excluir produto.', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
