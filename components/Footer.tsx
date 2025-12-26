import React, { useState } from 'react';
import { Instagram, Facebook, Twitter, Lock, User, Key, X, LogOut, CheckCircle } from 'lucide-react';
import { BookedSlots } from '../types';

interface FooterProps {
  onLogin?: (status: boolean) => void;
  isAdmin?: boolean;
  isDark?: boolean;
}

const Footer: React.FC<FooterProps> = ({ onLogin, isAdmin, isDark }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      if (onLogin) onLogin(true);
      setIsLoginOpen(false);
      setError('');
      setUsername('');
      setPassword('');
    } else {
      setError('Credenciais inválidas.');
    }
  };

  const handleLogout = () => {
    if (onLogin) onLogin(false);
  };

  const closeAll = () => {
    setIsLoginOpen(false);
    setError('');
  };

  return (
    <>
      <footer className={`py-12 relative transition-colors duration-500 ${isDark ? 'bg-stone-900 border-t border-stone-800 text-stone-500' : 'bg-stone-900 text-stone-400'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 
                onClick={() => {
                  if (isAdmin) {
                    handleLogout();
                  } else {
                    setIsLoginOpen(true);
                  }
                }}
                className={`text-2xl font-bold mb-2 cursor-pointer select-none transition-colors flex items-center gap-2 ${isAdmin ? 'text-red-500 hover:text-red-400' : 'text-white hover:text-stone-200'}`}
                title={isAdmin ? "Clique para Sair" : "Acesso Proprietário"}
              >
                Arena Pé na Areia
                {isAdmin && <LogOut size={16} />}
              </h3>
              <p className="text-sm">O melhor do vôlei, todos os dias.</p>
              {isAdmin && <p className="text-xs text-red-500 font-bold mt-1">Você está logado como Proprietário.</p>}
            </div>
            
            <div className="flex space-x-8 mb-6 md:mb-0">
              <a href="#" className="hover:text-sand transition-colors"><Instagram size={24} /></a>
              <a href="#" className="hover:text-sand transition-colors"><Facebook size={24} /></a>
              <a href="#" className="hover:text-sand transition-colors"><Twitter size={24} /></a>
            </div>

            <div className="text-sm">
              &copy; {new Date().getFullYear()} Arena Pé na Areia.
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Login */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className={`border p-8 rounded-2xl w-full max-w-md shadow-2xl relative transition-colors ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-900 border-stone-700'}`}>
            <button 
              onClick={closeAll} 
              className="absolute top-4 right-4 text-stone-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="flex justify-center mb-6 text-sand">
              <Lock size={48} />
            </div>
            
            <h2 className="text-2xl font-bold text-white text-center mb-6">Acesso Proprietário</h2>
            <p className="text-stone-400 text-center mb-6 text-sm">
                Faça login para editar a disponibilidade da agenda diretamente no calendário.
            </p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-stone-800 text-white border border-stone-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-sand focus:ring-1 focus:ring-sand transition-all"
                />
              </div>
              
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500" size={18} />
                <input 
                  type="password" 
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-800 text-white border border-stone-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-sand focus:ring-1 focus:ring-sand transition-all"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center font-medium bg-red-500/10 py-2 rounded">
                  {error}
                </p>
              )}
              
              <button 
                type="submit" 
                className="w-full bg-sand hover:bg-sand-dark text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 shadow-lg mt-4"
              >
                Entrar e Editar Agenda
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;