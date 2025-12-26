import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import InfoSection from './components/InfoSection';
import Gallery from './components/Gallery';
import BookingModal from './components/BookingModal';
import Footer from './components/Footer';
import { ChevronDown, Moon, Sun, RefreshCw, CloudCheck } from 'lucide-react';
import { BookedSlots } from './types';

const API_ENDPOINT = '/api/slots'; // Endpoint que você criará para ler/gravar no Edge Config

const App: React.FC = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  
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

  // Initial state from LocalStorage as fallback
  const [bookedSlots, setBookedSlots] = useState<BookedSlots>(() => {
    const saved = localStorage.getItem('arena_bookings');
    return saved ? JSON.parse(saved) : {};
  });

  // Function to fetch data from Vercel Edge Config
  const fetchRemoteSlots = useCallback(async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const response = await fetch(API_ENDPOINT);
      if (response.ok) {
        const remoteData = await response.json();
        setBookedSlots(remoteData);
        localStorage.setItem('arena_bookings', JSON.stringify(remoteData));
        setLastSync(new Date());
      }
    } catch (error) {
      console.warn('Erro ao sincronizar com Edge Config. Usando cache local.', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Sync on mount and every 15 seconds (Polling)
  useEffect(() => {
    fetchRemoteSlots();
    const interval = setInterval(() => fetchRemoteSlots(true), 15000);
    return () => clearInterval(interval);
  }, [fetchRemoteSlots]);

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

  const updateBookedSlots = async (newSlots: BookedSlots) => {
    // Optimistic Update
    setBookedSlots(newSlots);
    localStorage.setItem('arena_bookings', JSON.stringify(newSlots));

    if (isAdmin) {
      setIsSyncing(true);
      try {
        await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSlots),
        });
        setLastSync(new Date());
      } catch (error) {
        console.error('Falha ao persistir no Edge Config:', error);
      } finally {
        setIsSyncing(false);
      }
    }
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
      
      {/* Botões de Controle Flutuantes */}
      <div className="fixed top-24 right-6 z-40 flex flex-col gap-3">
        <button 
          onClick={toggleTheme}
          aria-label="Alternar tema"
          className={`p-3 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-90 ${isDark ? 'bg-white text-stone-900' : 'bg-stone-900 text-white'}`}
        >
          {isDark ? <Sun size={22} /> : <Moon size={22} />}
        </button>
        
        {/* Indicador de Sincronização Cloud */}
        <div className={`p-3 rounded-full shadow-2xl transition-all flex items-center justify-center ${isDark ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-500'}`}>
          {isSyncing ? (
            <RefreshCw size={20} className="animate-spin text-sand" />
          ) : (
            <div className="group relative">
              <CloudCheck size={20} className="text-green-500" />
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-stone-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                Sincronizado {lastSync.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          )}
        </div>
      </div>

      <main>
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
                <span className="relative z-10">{isAdmin ? 'MODO PROPRIETÁRIO' : 'VER DISPONIBILIDADE'}</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              {isAdmin && (
                <div className="flex items-center gap-2 text-red-500 font-black text-sm tracking-widest uppercase">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                  Sincronização Nuvem Ativa
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