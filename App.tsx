
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import Header from './components/Header';
import InfoSection from './components/InfoSection';
import Gallery from './components/Gallery';
import BookingModal from './components/BookingModal';
import Footer from './components/Footer';
import { ChevronDown, CloudCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { BookedSlots } from './types';

// Inicialização segura do cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Só cria o cliente se as chaves existirem para evitar o erro "supabaseUrl is required"
const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

const App: React.FC = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arena_theme');
      if (saved) return saved as 'light' | 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [bookedSlots, setBookedSlots] = useState<BookedSlots>(() => {
    const saved = localStorage.getItem('arena_bookings');
    return saved ? JSON.parse(saved) : {};
  });

  // Efeito para o tema
  useEffect(() => {
    localStorage.setItem('arena_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Função para buscar dados do Supabase
  const fetchSlots = useCallback(async () => {
    if (!supabase) {
      console.warn('Supabase não configurado. Operando em modo LocalStorage.');
      return;
    }
    
    setIsSyncing(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*');

      if (error) throw error;

      if (data) {
        const slotsMap: BookedSlots = {};
        data.forEach((row: any) => {
          slotsMap[row.slot_key] = { court: row.court, gourmet: row.gourmet };
        });
        setBookedSlots(slotsMap);
        localStorage.setItem('arena_bookings', JSON.stringify(slotsMap));
        setLastSync(new Date());
        setSyncError(false);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do Supabase:', err);
      setSyncError(true);
    } finally {
      // Pequeno delay para feedback visual
      setTimeout(() => setIsSyncing(false), 600);
    }
  }, []);

  // Inscrição em tempo real e busca inicial
  useEffect(() => {
    fetchSlots();

    if (!supabase) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          fetchSlots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSlots]);

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
    // Atualização otimista na UI e LocalStorage
    setBookedSlots(newSlots);
    localStorage.setItem('arena_bookings', JSON.stringify(newSlots));
    
    if (isAdmin && supabase) {
      setIsSyncing(true);
      try {
        const upsertData = Object.entries(newSlots).map(([key, val]) => ({
          slot_key: key,
          court: val.court,
          gourmet: val.gourmet
        }));

        const { error } = await supabase
          .from('bookings')
          .upsert(upsertData, { onConflict: 'slot_key' });

        if (error) throw error;
        
        setSyncError(false);
        setLastSync(new Date());
      } catch (err) {
        console.error('Erro ao salvar no Supabase:', err);
        setSyncError(true);
      } finally {
        setTimeout(() => setIsSyncing(false), 600);
      }
    }
  };

  const handleLogin = (status: boolean) => {
    setIsAdmin(status);
  };

  const scrollToGallery = () => {
    document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth' });
  };

  const isDark = theme === 'dark';
  const isSupabaseConfigured = !!supabase;

  return (
    <div className={`min-h-screen transition-colors duration-700 ease-in-out ${isDark ? 'bg-stone-950 text-stone-100' : 'bg-white text-stone-800'} font-sans antialiased selection:bg-sand selection:text-white`}>
      <Header isDark={isDark} />
      
      {/* Indicador de Status de Sincronização */}
      <div className="fixed top-24 right-6 z-40">
        <div className={`p-3 rounded-full shadow-2xl flex items-center justify-center transition-colors ${isDark ? 'bg-stone-800' : 'bg-stone-100'}`}>
          {isSyncing ? (
            <RefreshCw size={20} className="animate-spin text-sand" />
          ) : syncError ? (
            <div className="group relative">
              <AlertCircle size={20} className="text-red-500 cursor-help" />
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-red-600 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase font-bold">
                Erro de Sincronização
              </div>
            </div>
          ) : !isSupabaseConfigured ? (
            <div className="group relative cursor-help">
              <AlertCircle size={20} className="text-amber-500" />
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-amber-600 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase font-bold tracking-widest">
                Modo Local (Offline)
              </div>
            </div>
          ) : (
            <div className="group relative cursor-help">
              <CloudCheck size={20} className="text-green-500" />
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase font-bold tracking-widest">
                CONECTADO: {lastSync.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          )}
        </div>
      </div>

      <main>
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1593787406536-3676215259c1?q=80&w=1920&auto=format" 
              alt="Arena de Vôlei" 
              className="w-full h-full object-cover scale-105 animate-slow-zoom" 
            />
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isDark ? 'bg-black/70' : 'bg-stone-900/40'}`}></div>
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight drop-shadow-2xl">
              ARENA <span className="text-sand italic">PÉ NA AREIA</span>
            </h1>
            <p className="text-xl md:text-2xl text-stone-200 mb-10 drop-shadow-lg font-light tracking-wide">
              Agendamento inteligente em tempo real. {isSupabaseConfigured ? 'Integrado com Supabase.' : 'Armazenamento local ativo.'}
            </p>
            <div className="flex flex-col gap-5 items-center">
              <button 
                onClick={scrollToGallery}
                className="group relative bg-sand hover:bg-sand-dark text-white text-xl font-bold py-5 px-12 rounded-full shadow-2xl transition-all overflow-hidden"
              >
                <span className="relative z-10">EXPLORAR ARENAS</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          </div>
          
          <button className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 cursor-pointer animate-bounce opacity-50" onClick={scrollToGallery}>
            <ChevronDown className="text-white w-12 h-12" />
          </button>
        </section>

        <Gallery onOpenBooking={handleOpenBooking} isDark={isDark} />
        
        <InfoSection isDark={isDark} onToggleTheme={toggleTheme} />
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
