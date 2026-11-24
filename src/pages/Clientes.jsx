import React, { useState, useEffect } from 'react';

const API_URL = 'https://loja-dod.onrender.com/api/clientes';

export function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: ''
  });

  const carregarClientes = async () => {
    try {
      const resposta = await fetch(API_URL);
      const dados = await resposta.json();
      
      if (resposta.ok && Array.isArray(dados)) {
        setClientes(dados);
      } else {
        setClientes([]);
      }
    } catch (erro) {
      console.error("Erro ao carregar clientes:", erro);
      setClientes([]);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resposta = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (resposta.ok) {
        carregarClientes();
        setFormData({ nome: '', email: '', telefone: '' });
      } else {
        alert("Erro ao salvar o cliente.");
      }
    } catch (erro) {
      console.error("Erro na requisição:", erro);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este cliente?")) return;

    try {
      const resposta = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (resposta.ok) {
        setClientes(clientes.filter((cliente) => cliente._id !== id));
      } else {
        alert("Erro ao excluir o cliente.");
      }
    } catch (erro) {
      console.error("Erro ao excluir cliente:", erro);
    }
  };

  return (
    <div className="w-full pb-12 pt-32 px-4 md:px-12">
      <h1 className="text-2xl font-bold tracking-widest uppercase text-black mb-8 border-b border-gray-200 pb-4">
        Gestão de Clientes
      </h1>

      <div className="bg-gray-50 p-6 md:p-8 mb-12">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-6">Cadastrar Novo Cliente</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <input type="text" name="nome" placeholder="Nome Completo" value={formData.nome} onChange={handleChange} required className="border-b border-gray-300 bg-transparent py-2 focus:border-black outline-none text-sm uppercase transition-colors" />
          <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} required className="border-b border-gray-300 bg-transparent py-2 focus:border-black outline-none text-sm transition-colors" />
          <input type="text" name="telefone" placeholder="Telefone (Apenas números)" value={formData.telefone} onChange={handleChange} required className="border-b border-gray-300 bg-transparent py-2 focus:border-black outline-none text-sm transition-colors" />
          
          <div className="md:col-span-3 flex justify-end mt-4">
            <button type="submit" className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors">
              Adicionar Cliente
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-800">ID</th>
              <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-800">Nome</th>
              <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-800">E-mail</th>
              <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-800">Telefone</th>
              <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-800 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 text-xs font-mono text-gray-500">{cliente._id?.slice(-6)}</td>
                <td className="py-4 px-4 text-sm font-medium uppercase">{cliente.nome}</td>
                <td className="py-4 px-4 text-sm text-gray-500">{cliente.email}</td>
                <td className="py-4 px-4 text-sm text-gray-500">{cliente.telefone}</td>
                <td className="py-4 px-4 text-sm text-right">
                  <button
                    onClick={() => handleDelete(cliente._id)}
                    className="text-red-500 hover:text-red-700 font-bold text-xs uppercase"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
