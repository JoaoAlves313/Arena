import React, { useState } from 'react';
import Header from './components/Header';
import InfoSection from './components/InfoSection';
import BookingModal from './components/BookingModal';
import Footer from './components/Footer';
import { ChevronDown } from 'lucide-react';

const App: React.FC = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<string>('');

  const handleOpenBooking = (courtName: string) => {
    setSelectedCourt(courtName);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  const scrollToInfo = () => {
    const infoSection = document.getElementById('sobre');
    infoSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-stone-800 font-sans selection:bg-sand selection:text-white">
      <Header />
      
      <main>
        {/* Hero Banner Area - Restored */}
        <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://picsum.photos/1920/1080?random=99" 
              alt="Hero Background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-stone-900/40"></div>
          </div>
          <div className="relative z-10 text-center px-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              Sinta a <span className="text-sand">Energia</span>
            </h1>
            <p className="text-xl md:text-2xl text-stone-100 max-w-2xl mx-auto mb-10 drop-shadow-md">
              Quadras profissionais, ambiente relaxante e a melhor comunidade de vôlei de areia da região.
            </p>
            <button 
              onClick={() => handleOpenBooking('Quadra Principal')}
              className="bg-sand hover:bg-sand-dark text-white text-lg font-bold py-4 px-10 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              Começar a Jogar
            </button>
          </div>
          
          {/* Scroll Down Indicator */}
          <div 
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 cursor-pointer animate-bounce"
            onClick={scrollToInfo}
          >
            <ChevronDown className="text-white w-10 h-10 opacity-80 hover:opacity-100" />
          </div>
        </div>

        {/* Text Only Section (formerly Gallery area) */}
        <InfoSection />
      </main>

      <Footer />

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={handleCloseBooking} 
        courtName={selectedCourt} 
      />
    </div>
  );
};

export default App;