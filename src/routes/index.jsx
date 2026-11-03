import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Catalogo } from '../pages/Catalogo'
import { GestaoProdutos } from '../pages/GestaoProdutos'
import { Vendas } from '../pages/Vendas';
import { Clientes } from '../pages/Clientes';
import { Funcionarios } from '../pages/Funcionarios';

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Navbar />
            <main className="font-sans w-full">
                <Routes>
                    <Route path="/" element={<Catalogo />} />
                    <Route path="/produtos" element={<GestaoProdutos />} />
                    <Route path="/vendas" element={<Vendas />} />
                    <Route path="/clientes" element={<Clientes />} />
                    <Route path="/funcionarios" element={<Funcionarios />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}