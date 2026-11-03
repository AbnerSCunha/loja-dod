import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      if(window.scrollY > 450){
        setIsScrolled(true);
      }else{
        setIsScrolled(false);
      }
    }

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // isSolid será true se NÃO estiver na Home OU se tiver rolado a página
  const isSolid = !isHome || isScrolled;

  return (
    <nav className={`fixed w-full top-0 z-50 transition-colors duration-300 flex justify-between items-center px-5 py-2 font-sans ${
      isSolid // <-- Usando a variável isSolid aqui
        ? 'bg-black'
        : 'bg-transparent'
        } `}>
      <div className="font-bold text-xl tracking-widest uppercase">
        <Link to="/"> <img src="src/assets/dod-logo.webp" alt="DOD Alfaiataria" className="h-15 inline-block mr-2" /></Link>
      </div>
      <ul className="flex gap-6 m-0 p-0 list-none">
        <li><Link to="/" className="text-sm text-white uppercase hover:text-gray-200 transition-colors">Catálogo</Link></li>
        <li><Link to="/produtos" className="text-sm text-white uppercase hover:text-gray-200 transition-colors">Gestão de Stock</Link></li>
        <li><Link to="/vendas" className="text-sm text-white uppercase hover:text-gray-200 transition-colors">Vendas</Link></li>
        <li><Link to="/clientes" className="text-sm text-white uppercase hover:text-gray-200 transition-colors">Clientes</Link></li>
        <li><Link to="/funcionarios" className="text-sm text-white uppercase hover:text-gray-200 transition-colors">Equipe</Link></li>
      </ul>
    </nav>
  );
}