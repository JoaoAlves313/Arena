import React from 'react';
import { Volleyball } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-20">
          <div className="flex items-center space-x-3">
            <div className="bg-sand p-2 rounded-full text-white">
              <Volleyball size={28} />
            </div>
            <span className="text-2xl font-bold text-stone-800 tracking-tight">
              Arena Pé na Areia
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;