import React, { useState, useEffect } from "react";

const API_URL = 'https://loja-dod.onrender.com/api/produtos';

export function GestaoProdutos() {
    const [produtos, setProdutos] = useState([]);
    const [formData, setFormData] = useState({
        descricao: '',
        tamanho: '',
        preco: '',
        quantidade_estoque: '',
        categoria: '',
        imagem_url: ''
    });

    const carregarProdutos = async () => {
        try {
            const resposta = await fetch(API_URL);
            const dados = await resposta.json();

            if (resposta.ok && Array.isArray(dados)) {
                setProdutos(dados);
            } else {
                console.error('Erro retornado pelo servidor:', dados);
                setProdutos([]);
            }
        } catch (error) {
            console.error('Erro ao conectar ao servidor:', error);
            setProdutos([]);
        }
    };

    useEffect(() => {
        carregarProdutos();
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
                body: JSON.stringify({
                    ...formData,
                    preco: parseFloat(formData.preco),
                    quantidade_estoque: parseInt(formData.quantidade_estoque)
                })
            });

            if (resposta.ok) {
                carregarProdutos();
                setFormData({
                    descricao: '',
                    tamanho: '',
                    preco: '',
                    quantidade_estoque: '',
                    categoria: '',
                    imagem_url: ''
                });
            } else {
                alert('Erro ao salvar produto');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;

        try {
            const resposta = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (resposta.ok) {
                setProdutos(produtos.filter((produto) => produto._id !== id));
            } else {
                alert('Erro ao excluir produto');
            }
        } catch (error) {
            console.error('Erro ao excluir:', error);
        }
    };

    return (
        <div className="w-full pb-12 pt-32 px-4 md:px-12">
            <h1 className="text-2xl font-bold tracking-widest uppercase text-black mb-8 border-b border-gray-200 pb-4">
                Gestão do Stock
            </h1>

            <div className="bg-gray-50 p-6 md:p-8 mb-12">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-6">
                    Cadastrar Nova Peça
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <input
                        type="text"
                        name="descricao"
                        value={formData.descricao}
                        onChange={handleChange}
                        required
                        placeholder="Descrição"
                        className="border-b border-gray-300 bg-transparent text-sm uppercase transition-colors rounded-sm py-2 px-4 focus:outline-none focus:ring-1 focus:border-black"
                    />
                    <input
                        type="text"
                        name="tamanho"
                        value={formData.tamanho}
                        onChange={handleChange}
                        required
                        placeholder="Tamanho"
                        className="border-b border-gray-300 bg-transparent text-sm uppercase transition-colors rounded-sm py-2 px-4 focus:outline-none focus:ring-1 focus:border-black"
                    />
                    <input
                        type="number"
                        step="0.01"
                        name="preco"
                        value={formData.preco}
                        onChange={handleChange}
                        required
                        placeholder="Preço"
                        className="border-b border-gray-300 bg-transparent text-sm uppercase transition-colors rounded-sm py-2 px-4 focus:outline-none focus:ring-1 focus:border-black"
                    />
                    <input
                        type="number"
                        name="quantidade_estoque"
                        value={formData.quantidade_estoque}
                        onChange={handleChange}
                        required
                        placeholder="Quantidade em Estoque"
                        className="border-b border-gray-300 bg-transparent text-sm uppercase transition-colors rounded-sm py-2 px-4 focus:outline-none focus:ring-1 focus:border-black"
                    />
                    <select
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleChange}
                        required
                        className="border-b border-gray-300 bg-transparent text-sm uppercase transition-colors rounded-sm py-2 px-4 focus:outline-none focus:ring-1 focus:border-black"
                    >
                        <option value="">Selecione a Categoria</option>
                        <option value="Camisetas e Regatas">Camisetas e Regatas</option>
                        <option value="Calças e Bermudas">Calças e Bermudas</option>
                        <option value="Casacos e Jaquetas">Casacos e Jaquetas</option>
                        <option value="Acessórios">Acessórios</option>
                    </select>
                    <input
                        type="url"
                        name="imagem
