import { connectDB } from './config/db.js';
import { Produto, Cliente, Funcionario, Venda } from './models/schemas.js';
import mongoose from 'mongoose';

const popularBanco = async () => {
  await connectDB();

  try {
    // Limpa dados antigos para evitar duplicação ao rodar o script novamente
    await Produto.deleteMany();
    await Cliente.deleteMany();
    await Funcionario.deleteMany();
    await Venda.deleteMany();

    // 1. Inserindo Produtos (com Categoria aninhada)
    const produtos = await Produto.insertMany([
      {
        descricao: 'CAMISETA OVERSIZED MINIMAL',
        tamanho: 'G',
        preco: 299.00,
        quantidade_estoque: 15,
        imagem_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
        categoria: { descricao: 'Camisetas e Regatas' }
      },
      {
        descricao: 'CALÇA CLASSIC FLARE',
        tamanho: 'M',
        preco: 890.00,
        quantidade_estoque: 8,
        imagem_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
        categoria: { descricao: 'Calças e Bermudas' }
      },
      {
        descricao: 'BONÉ CORDUROY LOGO',
        tamanho: 'U',
        preco: 190.00,
        quantidade_estoque: 20,
        imagem_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80',
        categoria: { descricao: 'Acessórios' }
      },
      {
        descricao: 'JAQUETA URBAN SOUL',
        tamanho: 'M',
        preco: 1290.00,
        quantidade_estoque: 0,
        imagem_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
        categoria: { descricao: 'Casacos e Jaquetas' }
      }
    ]);

    // 2. Inserindo Clientes
    const clientes = await Cliente.insertMany([
      { nome: 'Lucas Mendes', email: 'lucas.mendes@email.com', telefone: '(77) 99999-1234' },
      { nome: 'Beatriz Costa', email: 'beatriz.costa@email.com', telefone: '(77) 98888-5678' }
    ]);

    // 3. Inserindo Funcionários
    const funcionarios = await Funcionario.insertMany([
      { nome: 'Mariana Silva', cargo: 'Consultora de Vendas' },
      { nome: 'Rafael Oliveira', cargo: 'Gerente de Loja' }
    ]);

    // 4. Inserindo uma Venda de exemplo (referenciando Cliente e Funcionário, e aninhando Itens)
    await Venda.create({
      valor_total: 1189.00,
      cliente_id: clientes[0]._id,
      funcionario_id: funcionarios[0]._id,
      itens: [
        {
          produto_id: produtos[0]._id,
          descricao_produto: produtos[0].descricao,
          quantidade: 1,
          preco_unitario: produtos[0].preco
        },
        {
          produto_id: produtos[1]._id,
          descricao_produto: produtos[1].descricao,
          quantidade: 1,
          preco_unitario: produtos[1].preco
        }
      ]
    });

    console.log('Banco populado com sucesso!');
  } catch (error) {
    console.error('Erro ao popular o banco:', error);
  } finally {
    await mongoose.connection.close();
  }
};

popularBanco();