import mongoose from 'mongoose';

// 1. PRODUTO (Estratégia: Embedding da Categoria)
const produtoSchema = new mongoose.Schema({
  descricao: { type: String, required: true },
  tamanho: { type: String, required: true },
  preco: { type: Number, required: true },
  quantidade_estoque: { type: Number, required: true },
  imagem_url: { type: String },
  categoria: {
    descricao: { type: String, required: true }
  }
});

// 2. CLIENTE (Coleção independente)
const clienteSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefone: { type: String }
});

// 3. FUNCIONÁRIO (Coleção independente)
const funcionarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  cargo: { type: String, required: true }
});

// 4. VENDA (Estratégia: Embedding dos Itens + References para Cliente e Funcionário)
const vendaSchema = new mongoose.Schema({
  data_venda: { type: Date, default: Date.now },
  valor_total: { type: Number, required: true },
  cliente_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  funcionario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Funcionario', required: true },
  itens: [
    {
      produto_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto', required: true },
      descricao_produto: { type: String, required: true },
      quantidade: { type: Number, required: true },
      preco_unitario: { type: Number, required: true }
    }
  ]
});

export const Produto = mongoose.model('Produto', produtoSchema);
export const Cliente = mongoose.model('Cliente', clienteSchema);
export const Funcionario = mongoose.model('Funcionario', funcionarioSchema);
export const Venda = mongoose.model('Venda', vendaSchema);