import React, { useState, useEffect } from 'react';

export function Vendas() {
  // Estados para armazenar os dados do banco
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);

  // Estados para gerir a venda atual
  const [carrinho, setCarrinho] = useState([]);
  const [idCliente, setIdCliente] = useState('');
  const [idFuncionario, setIdFuncionario] = useState('');
  
  // Estado temporário para o item que está a ser selecionado
  const [itemAtual, setItemAtual] = useState({ id_produto: '', quantidade: 1 });

  // Busca todos os dados necessários ao abrir a tela
  const carregarDados = async () => {
    try {
      const [resProd, resCli, resFunc] = await Promise.all([
        fetch('https://loja-dod.onrender.com/api/produtos'),
        fetch('https://loja-dod.onrender.com/api/clientes'),
        fetch('https://loja-dod.onrender.com/api/funcionarios')
      ]);
      
      setProdutos(await resProd.json());
      setClientes(await resCli.json());
      setFuncionarios(await resFunc.json());
    } catch (erro) {
      console.error("Erro ao carregar dados do PDV:", erro);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Adiciona a peça selecionada ao carrinho
  const adicionarAoCarrinho = () => {
    if (!itemAtual.id_produto || itemAtual.quantidade < 1) return;

    const produtoBanco = produtos.find(p => p.id_produto === parseInt(itemAtual.id_produto));
    
    if (produtoBanco.quantidade_estoque < itemAtual.quantidade) {
      alert(`Estoque insuficiente! Temos apenas ${produtoBanco.quantidade_estoque} unidades.`);
      return;
    }

    const novoItem = {
      id_produto: produtoBanco.id_produto,
      descricao: produtoBanco.descricao,
      tamanho: produtoBanco.tamanho,
      quantidade: parseInt(itemAtual.quantidade),
      valor_unitario: Number(produtoBanco.preco)
    };

    setCarrinho([...carrinho, novoItem]);
    setItemAtual({ id_produto: '', quantidade: 1 }); // Limpa o seletor
  };

  // Envia a transação para o Node.js
  const finalizarVenda = async () => {
    if (!idCliente || !idFuncionario) {
      return alert("Selecione o Cliente e o Funcionário (Vendedor).");
    }
    if (carrinho.length === 0) {
      return alert("O carrinho está vazio.");
    }

    try {
      const resposta = await fetch('https://loja-dod.onrender.com/api/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_cliente: parseInt(idCliente),
          id_funcionario: parseInt(idFuncionario),
          itens: carrinho
        })
      });

      if (resposta.ok) {
        alert("Venda finalizada com sucesso!");
        setCarrinho([]); // Esvazia o carrinho
        setIdCliente('');
        carregarDados(); // Recarrega os produtos para atualizar o estoque na tela
      } else {
        const erro = await resposta.json();
        console.error("ERRO COMPLETO DO BANCO:", erro);
        alert(`O banco recusou a venda. Motivo: ${erro.details}`);
      }
    } catch (erro) {
      console.error("Erro ao enviar venda:", erro);
    }
  };

  const valorTotal = carrinho.reduce((acc, item) => acc + (item.quantidade * item.valor_unitario), 0);

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
              <select value={idCliente} onChange={e => setIdCliente(e.target.value)} className="border-b border-gray-300 bg-transparent py-2 focus:border-black outline-none text-sm uppercase">
                <option value="">Selecione o Cliente</option>
                {clientes.map(c => (
                  <option key={c.id_cliente} value={c.id_cliente}>{c.nome}</option>
                ))}
              </select>

              <select value={idFuncionario} onChange={e => setIdFuncionario(e.target.value)} className="border-b border-gray-300 bg-transparent py-2 focus:border-black outline-none text-sm uppercase">
                <option value="">Selecione o Vendedor</option>
                {funcionarios.map(f => (
                  <option key={f.id_funcionario} value={f.id_funcionario}>{f.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Seção 2: Adicionar Peças */}
          <div className="bg-gray-50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-4">Adicionar ao Carrinho</h2>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <select value={itemAtual.id_produto} onChange={e => setItemAtual({...itemAtual, id_produto: e.target.value})} className="w-full border-b border-gray-300 bg-transparent py-2 focus:border-black outline-none text-sm uppercase">
                  <option value="">Selecione uma peça...</option>
                  {produtos.filter(p => p.quantidade_estoque > 0).map(p => (
                    <option key={p.id_produto} value={p.id_produto}>
                      {p.descricao} (TAM: {p.tamanho}) - {p.quantidade_estoque} un.
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <input type="number" min="1" value={itemAtual.quantidade} onChange={e => setItemAtual({...itemAtual, quantidade: e.target.value})} className="w-full border-b border-gray-300 bg-transparent py-2 focus:border-black outline-none text-sm text-center" />
              </div>
              <button onClick={adicionarAoCarrinho} className="bg-gray-200 text-black px-6 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-300 transition-colors">
                Incluir
              </button>
            </div>
          </div>
        </div>

        {/* Lado Direito: Resumo do Carrinho */}
        <div className="bg-black text-white p-6 flex flex-col">
          <h2 className="text-lg font-bold uppercase tracking-widest mb-6 border-b border-gray-800 pb-4">Carrinho</h2>
          
          <div className="flex-1 overflow-y-auto mb-6 flex flex-col gap-4">
            {carrinho.length === 0 ? (
              <p className="text-sm text-gray-500 uppercase">Carrinho vazio</p>
            ) : (
              carrinho.map((item, index) => (
                <div key={index} className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold uppercase">{item.descricao}</span>
                    <span className="text-xs text-gray-400">TAM: {item.tamanho} | Qtd: {item.quantidade}</span>
                  </div>
                  <span className="text-sm">
                    {(item.quantidade * item.valor_unitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-800 pt-4 mt-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm uppercase tracking-wider text-gray-400">Total</span>
              <span className="text-xl font-bold">
                {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <button onClick={finalizarVenda} className="w-full bg-white text-black py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
              Finalizar Venda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}