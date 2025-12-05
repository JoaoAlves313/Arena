import React from 'react';
import { Instagram, Facebook, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-bold text-white mb-2">Arena Pé na Areia</h3>
            <p className="text-sm">O melhor do vôlei, todos os dias.</p>
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
  );
};

export default Footer;