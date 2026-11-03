import React, { useState, useEffect } from "react";
import { preconnect } from "react-dom";

export function GestaoProdutos() {
    const [produtos, setProdutos] = useState([]);
    const [formData, setFormData] = useState({
        descricao: '',
        tamanho: '',
        preco: '',
        quantidade_estoque: '',
        id_categoria: '',
        imagem_url: ''
    });

    const carregarProdutos = async () => {
        try {
            const resposta = await fetch('https://loja-dod.onrender.com/api/produtos');
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
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const resposta = await fetch('https://loja-dod.onrender.com/api/produtos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    preco: parseFloat(formData.preco),
                    quantidade_estoque: parseInt(formData.quantidade_estoque),
                    id_categoria: parseInt(formData.id_categoria)
                })
            });

            if (resposta.ok) {
                carregarProdutos();
                setFormData({
                    descricao: '',
                    tamanho: '',
                    preco: '',
                    quantidade_estoque: '',
                    id_categoria: '',
                    imagem_url: ''
                });
            } else {
                alert('Erro ao salvar produto');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
        }
    }

    return (
        <div className="w-full pb-12 pt-32 px-4 md:px-12">
            <h1 className="text-2xl font-bold tracking-widest uppercase text-black mb-8 border-b border-gray-200 pb-4">Gestão do Stock</h1>
 
            <div className="bg-gray-50 p-6 md:p-8 mb-12">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-6">Cadastrar Nova Peça</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <input type="text" name="descricao" value={formData.descricao} onChange={handleChange} required placeholder="Descrição" className="border-b border-gray-300 bg-transparent text-sm uppercase transition-colors rounded-sm py-2 px-4 focus:outline-none focus:ring-1 focus:border-black" />
                    <input type="text" name="tamanho" value={formData.tamanho} onChange={handleChange} required placeholder="Tamanho" className="border-b border-gray-300 bg-transparent text-sm uppercase transition-colors rounded-sm py-2 px-4 focus:outline-none focus:ring-1 focus:border-black" />
                    <input type="number" name="preco" value={formData.preco} onChange={handleChange} required placeholder="Preço" className="border-b border-gray-300 bg-transparent text-sm uppercase transition-colors rounded-sm py-2 px-4 focus:outline-none focus:ring-1 focus:border-black" />
                    <input type="number" name="quantidade_estoque" value={formData.quantidade_estoque} onChange={handleChange} required placeholder="Quantidade em Estoque" className="border-b border-gray-300 bg-transparent text-sm uppercase transition-colors rounded-sm py-2 px-4 focus:outline-none focus:ring-1 focus:border-black" />
                    <input type="number" name="id_categoria" value={formData.id_categoria} onChange={handleChange} required placeholder="ID da Categoria" className="border-b border-gray-300 bg-transparent text-sm uppercase transition-colors rounded-sm py-2 px-4 focus:outline-none focus:ring-1 focus:border-black" />
                    <input type="url" name="imagem_url" value={formData.imagem_url} onChange={handleChange} placeholder="URL da Imagem" className="border-b border-gray-300 bg-transparent text-sm uppercase transition-colors rounded-sm py-2 px-4 focus:outline-none focus:ring-1 focus:border-black" />

                    <div className="lg:col-span-3 flex justify-end mt-4">
                        <button type="submit" className="bg-black text-white text-white uppercase px-8 py-3 text-sm font-bold tracking-wider hover:bg-gray-900 transition-colors rounded-sm">
                            Adicionar Produto
                        </button>
                    </div>
                </form>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-800">ID</th>
                            <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-800">Descrição</th>
                            <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-800">Tamanho</th>
                            <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-800">Preço</th>
                            <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-800">Quantidade em Estoque</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        {produtos.map((produto) => (
                            <tr key={produto.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4 text-sm text-gray-500">{produto.id_produto}</td>
                                <td className="py-4 px-4 text-sm font-medium uppercase">{produto.descricao}</td>
                                <td className="py-4 px-4 text-sm text-gray-500">{produto.tamanho}</td>
                                <td className="py-4 px-4 text-sm text-gray-500">{Number(produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                <td className="py-4 px-4 text-sm text-gray-500">{produto.quantidade_estoque}</td>
                                                           
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        
    )
}
