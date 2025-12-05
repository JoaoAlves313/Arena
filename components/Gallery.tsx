import React from 'react';
import { CourtImage } from '../types';
import { CalendarCheck } from 'lucide-react';

interface GalleryProps {
  onOpenBooking: (courtName: string) => void;
}

const courts: CourtImage[] = [
  {
    id: 1,
    url: "https://picsum.photos/800/600?random=101",
    title: "Quadra Principal - Sunset",
    description: "Areia fina importada, ideal para partidas profissionais. Iluminação LED de alta performance."
  },
  {
    id: 2,
    url: "https://picsum.photos/800/600?random=102",
    title: "Arena Treino A",
    description: "Perfeita para grupos iniciantes e aulas táticas. Espaço reservado e silencioso."
  },
  {
    id: 3,
    url: "https://picsum.photos/800/600?random=103",
    title: "Quadra VIP Lounge",
    description: "Acesso exclusivo ao bar, cadeiras de praia premium e ducha privativa."
  }
];

const Gallery: React.FC<GalleryProps> = ({ onOpenBooking }) => {
  return (
    <section id="galeria" className="py-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-stone-800 mb-4">Nossas Quadras</h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Escolha o cenário perfeito para o seu jogo. Do lazer ao profissional, temos o espaço ideal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courts.map((court) => (
            <div key={court.id} className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-stone-100 flex flex-col">
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={court.url} 
                  alt={court.title} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button 
                    onClick={() => onOpenBooking(court.title)}
                    className="bg-sand text-white font-bold py-3 px-8 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 hover:bg-white hover:text-sand"
                  >
                    <CalendarCheck size={20} />
                    Agendar Agora
                  </button>
                </div>
              </div>

              {/* Description Content */}
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-stone-800 mb-3 group-hover:text-sand transition-colors">
                    {court.title}
                  </h3>
                  <p className="text-stone-600 leading-relaxed">
                    {court.description}
                  </p>
                </div>
                
                {/* Mobile Button (Visible mainly on mobile where hover isn't great) */}
                <div className="mt-6 lg:hidden">
                   <button 
                    onClick={() => onOpenBooking(court.title)}
                    className="w-full bg-sand text-white font-bold py-3 rounded-xl shadow-md active:scale-95 transition-transform"
                  >
                    Agendar Agora
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