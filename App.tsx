import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import InfoSection from './components/InfoSection';
import Gallery from './components/Gallery';
import BookingModal from './components/BookingModal';
import Footer from './components/Footer';
import { ChevronDown, Moon, Sun } from 'lucide-react';
import { BookedSlots } from './types';

const App: React.FC = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Theme state with optimized persistence
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arena_theme');
      if (saved) return saved as 'light' | 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('arena_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Booking persistence
  const [bookedSlots, setBookedSlots] = useState<BookedSlots>(() => {
    const saved = localStorage.getItem('arena_bookings');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('arena_bookings', JSON.stringify(bookedSlots));
  }, [bookedSlots]);

  const handleOpenBooking = useCallback((courtName: string) => {
    setSelectedCourt(courtName);
    setIsBookingOpen(true);
  }, []);

  const handleCloseBooking = useCallback(() => {
    setIsBookingOpen(false);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const updateBookedSlots = (newSlots: BookedSlots) => {
    setBookedSlots(newSlots);
  };

  const handleLogin = (status: boolean) => {
    setIsAdmin(status);
  };

  const scrollToInfo = () => {
    document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' });
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-700 ease-in-out ${isDark ? 'bg-stone-950 text-stone-100' : 'bg-white text-stone-800'} font-sans antialiased selection:bg-sand selection:text-white`}>
      <Header isDark={isDark} />
      
      {/* Optimized Theme Toggle */}
      <button 
        onClick={toggleTheme}
        aria-label="Alternar tema"
        className={`fixed top-24 right-6 z-40 p-3 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-90 ${isDark ? 'bg-white text-stone-900' : 'bg-stone-900 text-white'}`}
      >
        {isDark ? <Sun size={22} /> : <Moon size={22} />}
      </button>

      <main>
        {/* Optimized Hero Banner */}
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <picture>
              <source srcSet="https://picsum.photos/1920/1080?random=99" media="(min-width: 800px)" />
              <img 
                src="https://picsum.photos/800/600?random=99" 
                alt="Arena de Vôlei" 
                className="w-full h-full object-cover scale-105 animate-slow-zoom"
              />
            </picture>
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isDark ? 'bg-black/70' : 'bg-stone-900/40'}`}></div>
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight drop-shadow-2xl">
              ARENA <span className="text-sand italic">PÉ NA AREIA</span>
            </h1>
            <p className="text-xl md:text-2xl text-stone-200 mb-10 drop-shadow-lg font-light tracking-wide">
              Quadras profissionais com drenagem inteligente e ambiente premium para o seu melhor jogo.
            </p>
            <div className="flex flex-col gap-5 items-center">
              <button 
                onClick={() => handleOpenBooking('Quadra Principal')}
                className="group relative bg-sand hover:bg-sand-dark text-white text-xl font-bold py-5 px-12 rounded-full shadow-2xl transition-all overflow-hidden"
              >
                <span className="relative z-10">{isAdmin ? 'MODO ADMINISTRADOR' : 'AGENDAR AGORA'}</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              {isAdmin && (
                <div className="flex items-center gap-2 text-red-500 font-black text-sm tracking-widest uppercase">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                  Controle do Proprietário
                </div>
              )}
            </div>
          </div>
          
          <button 
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 cursor-pointer animate-bounce opacity-50 hover:opacity-100 transition-opacity"
            onClick={scrollToInfo}
            aria-label="Rolar para baixo"
          >
            <ChevronDown className="text-white w-12 h-12" />
          </button>
        </section>

        <InfoSection isDark={isDark} />
        <Gallery onOpenBooking={handleOpenBooking} isDark={isDark} />
      </main>

      <Footer onLogin={handleLogin} isAdmin={isAdmin} isDark={isDark} />

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={handleCloseBooking} 
        courtName={selectedCourt}
        bookedSlots={bookedSlots}
        onBookSlots={updateBookedSlots}
        isAdmin={isAdmin}
        isDark={isDark}
      />
    </div>
  );
};

export default App;