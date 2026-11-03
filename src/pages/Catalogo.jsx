import React, { useState, useEffect } from "react";


export function Catalogo() {
    const [produtos, setProdutos] = useState([]);

    useEffect(() => {
    const carregarProdutos = async () => {
      try {
        const resposta = await fetch('http://localhost:3000/api/produtos');
        const dados = await resposta.json();
        
        // Proteção: só atualiza se for um array válido
        if (resposta.ok && Array.isArray(dados)) {
          setProdutos(dados);
        } else {
          console.error("Erro do servidor:", dados);
          setProdutos([]); // Array vazio impede o crash do .map()
        }
      } catch (erro) {
        console.error("Erro ao ligar à API:", erro);
        setProdutos([]);
      }
    };

    carregarProdutos();
  }, []);

    return (
        <div className="w-full pb-12">
            
            {/* Banner da nova coleção */}
            <div className="w-full h-full overflow-hidden">
                <img
                    src="https://dcdn-us.mitiendanube.com/stores/007/433/965/themes/cali/slide-1788198702032-7543998287-20cdd1a5d55112bbc17e05fd758e75931788198703.png?3160508892002424979"
                    alt="Nova Coleção DOD Alfaiataria"
                    className="w-full h-full object-cover object-center gray-scale hover:gray-scale-0 transition-all duration-300"
                />
            </div>

            <div className="my-12 text-center px-4">
                <h1 className="text-4xl uppercase font-light text-black">Catálogo</h1>
                <p className="text-gray-500 mt-2 text-sm uppercase tracking-wide">Alfaiataria Não Tradicional</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-8 md:px-12">
                {produtos.map((produto) => (
                    <div key={produto.id_produto} className="group cursor-pointer flex flex-col">
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
                            <h3 className="text-sm font-semibold uppercase text-black transition-colors group-hover:text-gray-600">
                                {produto.descricao}
                            </h3>
                            <div className="flex justify-between items-center">
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