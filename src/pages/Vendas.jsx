import React, { useState, useEffect } from 'react';

const API_BASE = 'https://loja-dod.onrender.com/api';

export function Vendas() {
  // Estados para armazenar os dados do banco
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);

  // Estados para gerir a venda atual
  const [carrinho, setCarrinho] = useState([]);
  const [idCliente, setIdCliente] = useState('');
  const [idFuncionario, setIdFuncionario] = useState('');

  // Estado temporário para o item que está sendo selecionado
  const [itemAtual, setItemAtual] = useState({ produto_id: '', quantidade: 1 });

  // Busca todos os dados necessários ao abrir a tela
  const carregarDados = async () => {
    try {
      const [resProd, resCli, resFunc] = await Promise.all([
        fetch(`${API_BASE}/produtos`),
        fetch(`${API_BASE}/clientes`),
        fetch(`${API_BASE}/funcionarios`)
      ]);

      const [dadosProd, dadosCli, dadosFunc] = await Promise.all([
        resProd.json(),
        resCli.json(),
        resFunc.json()
      ]);

      setProdutos(Array.isArray(dadosProd) ? dadosProd : []);
      setClientes(Array.isArray(dadosCli) ? dadosCli : []);
      setFuncionarios(Array.isArray(dadosFunc) ? dadosFunc : []);
    } catch (erro) {
      console.error("Erro ao carregar dados do PDV:", erro);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Adiciona a peça selecionada ao carrinho
  const adicionarAoCarrinho = () => {
    if (!itemAtual.produto_id || itemAtual.quantidade < 1) return;

    const produtoBanco = produtos.find((p) => p._id === itemAtual.produto_id);
    if (!produtoBanco) return;

    const qtd = parseInt(itemAtual.quantidade, 10);

    if (produtoBanco.quantidade_estoque < qtd) {
      alert(`Estoque insuficiente! Temos apenas ${produtoBanco.quantidade_estoque} unidades.`);
      return;
    }

    const novoItem = {
      produto_id: produtoBanco._id,
      descricao_produto: produtoBanco.descricao,
      tamanho: produtoBanco.tamanho,
      quantidade: qtd,
      preco_unitario: Number(produtoBanco.preco)
    };

    setCarrinho([...carrinho, novoItem]);
    setItemAtual({ produto_id: '', quantidade: 1 });
  };

  const valorTotal = carrinho.reduce(
    (acc, item) => acc + item.quantidade * item.preco_unitario,
    0
  );

  // Envia a transação para o Node.js (MongoDB)
  const finalizarVenda = async () => {
    if (!idCliente || !idFuncionario) {
      return alert("Selecione o Cliente e o Funcionário (Vendedor).");
    }
    if (carrinho.length === 0) {
      return alert("O carrinho está vazio.");
    }

    try {
      const resposta = await fetch(`${API_BASE}/vendas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: idCliente,
          funcionario_id: idFuncionario,
          valor_total: valorTotal,
          itens: carrinho.map(({ produto_id, descricao_produto, quantidade, preco_unitario }) => ({
            produto_id,
            descricao_produto,
            quantidade,
            preco_unitario
          }))
        })
      });

      if (resposta.ok) {
        alert("Venda finalizada com sucesso!");
        setCarrinho([]);
        setIdCliente('');
        carregarDados(); // Recarrega os produtos para atualizar o estoque na tela
      } else {
        const erro = await resposta.json();
        console.error("ERRO COMPLETO DO BANCO:", erro);
        alert(`O banco recusou a venda. Motivo: ${erro.erro || erro.details || erro.message || 'Erro desconhecido'}`);
      }
    } catch (erro) {
      console.error("Erro ao enviar venda:", erro);
    }
  };

  return (
    <div className="w-full pb-12 pt-32 px-4 md:px-12">
      <h1 className="text-2xl font-bold tracking-widest uppercase text-black mb-8 border-b border-gray-200 pb-4">
        Frente de Caixa (PDV)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Esquerdo: Controles da Venda */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Seção 1: Dados da Venda */}
          <div className="bg-gray-50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-4">Dados da Transação</h2>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={idCliente}
                onChange={(e) => setIdCliente(e.target.value)}
                className="border-b border-gray-300 bg-transparent py-2 focus:border-black outline-none text-sm uppercase"
              >
                <option value="">Selecione o Cliente</option>
                {clientes.map((c) => (
                  <option key={c._id} value={c._id}>{c.nome}</option>
                ))}
              </select>

              <select
                value={idFuncionario}
                onChange={(e) => setIdFuncionario(e.target.value)}
                className="border-b border-gray-300 bg-transparent py-2 focus:border-black outline-none text-sm uppercase"
              >
                <option value="">Selecione o Vendedor</option>
                {funcionarios.map((f) => (
                  <option key={f._id} value={f._id}>{f.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Seção 2: Adicionar Peças */}
          <div className="bg-gray-50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-4">Adicionar ao Carrinho</h2>
            <div className="flex gap-4 items-end">
              <div class
