import React from 'react';
import { CourtImage } from '../types';
import { CalendarCheck, MapPin, Wind, Eye } from 'lucide-react';

interface GalleryProps {
  onOpenBooking: (courtName: string) => void;
  isDark?: boolean;
}

const courts: CourtImage[] = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1593787406536-3676215259c1?q=80&w=800&auto=format",
    title: "Quadra Sunset",
    description: "Areia fina tratada que não esquenta, ideal para alta performance. Iluminação LED 1000W."
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=800&auto=format",
    title: "Arena Training",
    description: "Espaço técnico otimizado para aulas e treinos funcionais. Redes ajustáveis."
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1544919396-10777977439a?q=80&w=800&auto=format",
    title: "Lounge VIP",
    description: "Conforto absoluto com deck exclusivo, ducha privativa e atendimento personalizado."
  }
];

const Gallery: React.FC<GalleryProps> = ({ onOpenBooking, isDark }) => {
  return (
    <section id="galeria" className={`py-24 transition-colors duration-500 ${isDark ? 'bg-stone-900' : 'bg-stone-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className={`text-5xl font-black mb-6 tracking-tight transition-colors ${isDark ? 'text-white' : 'text-stone-900'}`}>
              NOSSAS <span className="text-sand">ARENAS</span>
            </h2>
            <p className={`text-xl transition-colors ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
              Consulte a disponibilidade de cada uma de nossas quadras profissionais.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {courts.map((court) => (
            <div 
              key={court.id} 
              className={`group rounded-[2.5rem] overflow-hidden shadow-2xl hover:shadow-sand/20 transition-all duration-500 border-2 flex flex-col ${isDark ? 'bg-stone-950 border-stone-800' : 'bg-white border-transparent'}`}
            >
              <div className="relative h-80 overflow-hidden">
                <img 
                  src={court.url} 
                  alt={court.title}
                  loading="lazy"
                  className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                   <button 
                    onClick={() => onOpenBooking(court.title)}
                    className="bg-white text-stone-900 font-black py-4 px-10 rounded-full flex items-center gap-3 hover:bg-sand hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0"
                  >
                    <Eye size={20} />
                    CONSULTAR AGENDA
                  </button>
                </div>
                <div className="absolute top-6 right-6 flex gap-2">
                  <div className="bg-white/90 backdrop-blur p-2 rounded-full text-stone-900 shadow-lg">
                    <Wind size={18} />
                  </div>
                </div>
              </div>

              <div className="p-10 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sand font-bold text-xs uppercase tracking-widest mb-4">
                    <MapPin size={14} />
                    Quadra Oficial
                  </div>
                  <h3 className={`text-3xl font-black mb-4 transition-colors ${isDark ? 'text-white' : 'text-stone-800'}`}>
                    {court.title}
                  </h3>
                  <p className={`text-lg leading-relaxed transition-colors ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                    {court.description}
                  </p>
                </div>
                
                <div className="mt-8 lg:hidden">
                   <button 
                    onClick={() => onOpenBooking(court.title)}
                    className="w-full bg-sand hover:bg-sand-dark text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all"
                  >
                    VER DISPONIBILIDADE
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;