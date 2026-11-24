import React, { useState, useEffect } from "react";

export function Catalogo() {
    const [produtos, setProdutos] = useState([]);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState('');

    const categorias = [
        'Todas',
        'Camisetas e Regatas',
        'Calças e Bermudas',
        'Casacos e Jaquetas',
        'Acessórios'
    ];

    useEffect(() => {
        const carregarProdutos = async () => {
            try {
                const url =
                    categoriaSelecionada && categoriaSelecionada !== 'Todas'
                        ? `https://loja-dod.onrender.com/api/produtos?categoria=${encodeURIComponent(categoriaSelecionada)}`
                        : 'https://loja-dod.onrender.com/api/produtos';

                const resposta = await fetch(url);
                const dados = await resposta.json();

                // Proteção: só atualiza se for um array válido
                if (resposta.ok && Array.isArray(dados)) {
                    setProdutos(dados);
                } else {
                    console.error("Erro do servidor:", dados);
                    setProdutos([]);
                }
            } catch (erro) {
                console.error("Erro ao ligar à API:", erro);
                setProdutos([]);
            }
        };

        carregarProdutos();
    }, [categoriaSelecionada]);

    return (
        <div className="w-full pb-12">
            {/* Banner da nova coleção */}
            <div className="w-full h-full overflow-hidden">
                <img
                    src="https://dcdn-us.mitiendanube.com/stores/007/433/965/themes/cali/slide-1788198702032-7543998287-20cdd1a5d55112bbc17e05fd758e75931788198703.png?3160508892002424979"
                    alt="Nova Coleção DOD Alfaiataria"
                    className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-300"
                />
            </div>

            <div className="my-12 text-center px-4">
                <h1 className="text-4xl uppercase font-light text-black">Catálogo</h1>
                <p className="text-gray-500 mt-2 text-sm uppercase tracking-wide">Alfaiataria Não Tradicional</p>

                {/* Filtros de Categoria (Consulta Estruturada no MongoDB) */}
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                    {categorias.map((cat) => {
                        const ativa =
                            (cat === 'Todas' && !categoriaSelecionada) ||
                            categoriaSelecionada === cat;

                        return (
                            <button
                                key={cat}
                                onClick={() => setCategoriaSelecionada(cat === 'Todas' ? '' : cat)}
                                className={`px-4 py-2 text-xs uppercase tracking-widest transition-colors rounded-sm ${
                                    ativa
                                        ? 'bg-black text-white font-semibold'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-8 md:px-12">
                {produtos.map((produto) => (
                    <div key={produto._id} className="group cursor-pointer flex flex-col">
                        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4 rounded-lg">
                            <img
                                src={produto.imagem_url}
                                alt={produto.descricao}
                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                            />
                            {produto.quantidade_estoque === 0 && (
                                <div className="absolute top-4 left-4 bg-white px-3 py-1 text-sm font-bold uppercase tracking-wider text-black rounded-md shadow-sm">
                                    Esgotado
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col text-left">
                            <span className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                                {produto.categoria?.descricao || 'Sem categoria'}
                            </span>
                            <h3 className="text-sm font-semibold uppercase text-black transition-colors group-hover:text-gray-600">
                                {produto.descricao}
                            </h3>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-sm text-gray-600">
                                    {Number(produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                                <span className="text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded-sm uppercase tracking-wide">
                                    TAM: {produto.tamanho}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
