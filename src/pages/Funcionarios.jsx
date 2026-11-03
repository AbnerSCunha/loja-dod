import React, { useState, useEffect } from 'react';

export function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    cargo: ''
  });

  const carregarFuncionarios = async () => {
    try {
      const resposta = await fetch('https://loja-dod.onrender.com/api/funcionarios');
      const dados = await resposta.json();
      
      if (resposta.ok && Array.isArray(dados)) {
        setFuncionarios(dados);
      } else {
        setFuncionarios([]);
      }
    } catch (erro) {
      console.error("Erro ao carregar funcionários:", erro);
      setFuncionarios([]);
    }
  };

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resposta = await fetch('https://loja-dod.onrender.com/api/funcionarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (resposta.ok) {
        carregarFuncionarios();
        setFormData({ nome: '', cargo: '' });
      } else {
        alert("Erro ao salvar o funcionário.");
      }
    } catch (erro) {
      console.error("Erro na requisição:", erro);
    }
  };

  return (
    <div className="w-full pb-12 pt-32 px-4 md:px-12">
      <h1 className="text-2xl font-bold tracking-widest uppercase text-black mb-8 border-b border-gray-200 pb-4">
        Gestão de Equipe
      </h1>

      <div className="bg-gray-50 p-6 md:p-8 mb-12">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-6">Cadastrar Novo Membro</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" name="nome" placeholder="Nome Completo" value={formData.nome} onChange={handleChange} required className="border-b border-gray-300 bg-transparent py-2 focus:border-black outline-none text-sm uppercase transition-colors" />
          <input type="text" name="cargo" placeholder="Cargo (ex: Vendedor, Gerente)" value={formData.cargo} onChange={handleChange} required className="border-b border-gray-300 bg-transparent py-2 focus:border-black outline-none text-sm uppercase transition-colors" />
          
          <div className="md:col-span-2 flex justify-end mt-4">
            <button type="submit" className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors">
              Adicionar Funcionário
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
              <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-800">Cargo</th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.map((funcionario) => (
              <tr key={funcionario.id_funcionario} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 text-sm text-gray-500">{funcionario.id_funcionario}</td>
                <td className="py-4 px-4 text-sm font-medium uppercase">{funcionario.nome}</td>
                <td className="py-4 px-4 text-sm text-gray-500 uppercase">{funcionario.cargo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}