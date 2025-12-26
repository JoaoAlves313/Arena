
import React from 'react';
import { Volleyball } from 'lucide-react';

const Header: React.FC<{ isDark?: boolean }> = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-stone-950/90 backdrop-blur-md z-50 py-4 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-sand p-1.5 rounded-full">
            <Volleyball size={24} className="text-stone-900" />
          </div>
          <span className="text-xl font-black text-white uppercase tracking-tight">
            Arena Pé na Areia
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
