
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import BookingModal from './components/BookingModal';
import CheckoutModal from './components/CheckoutModal';
import Footer from './components/Footer';
import { BookedSlots } from './types';
import { Volleyball, MapPin, Trophy, Users, RefreshCw, AlertTriangle } from 'lucide-react';

// URL do Web App do Google Apps Script
const SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbz_3p_Y_H8W5D_C5R_W8R_Z_R_Z_R_Z/exec";

const App: React.FC = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{slots: {date: Date, time: string}[], type: 'court' | 'gourmet'} | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<string>('Arena Principal');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<BookedSlots>({});

  const fetchDatabase = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    
    // URL de dados sincronizada (Google Sheets Proxy)
    const url = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLi6-T9jwmKm-vBDFHWMkV6JrvmaTImD0gVfebD_u53W43D-eV9qpP-kpx0inncRvdbHFUvxKI7hrepBzh9KHNjMVijHXhfhKObPhtA7-uqx_EDzydIoHonuIoFp1a5gmEbgXP4eoNVbdhEeXEXIJltGJEcDIwzieFuq3RvT8WP3N2UexmgToL-YE9LxOH4YB7ewQLNaLnTVs7ghSr0aMSJvGQaLt2IQNHACZUJnrk24Vx6TkuPy2UfxbIhBkdSHGZTuKrW2GuFx2kY2fzFjXUM5T9jyWA&lib=MHEVcKrNdvnYWxRUMinEg6-5P6VriA9Lh";

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Falha na resposta da rede");
      
      const data = await response.json();
      const transformed: BookedSlots = {};
      const hours = ["08", "09", "10", "11", "12", "14", "15", "16", "17", "18", "19", "20"];

      // Função auxiliar para verificar se o valor da célula indica ocupação
      const isActuallyOccupied = (val: any) => {
        if (val === null || val === undefined || val === "") return false;
        const normalized = String(val).trim().toUpperCase();
        // Se houver qualquer conteúdo e não for a letra 'L', está ocupado
        return normalized !== 'L';
      };

      const processRow = (row: any) => {
        const rawDate = row.Data || row.data || row.date || row.Date;
        if (!rawDate) return;
        
        let dateStr = "";
        try {
          // "Ignora o T00:00:00.000Z": Pegamos apenas os primeiros 10 caracteres (AAAA-MM-DD)
          // Isso evita que o fuso horário altere o dia ao dar "new Date()"
          const cleanDateStr = String(rawDate).split('T')[0].trim();
          
          // Validamos se a string resultante tem o formato de data básico
          if (cleanDateStr.length >= 8) {
            const d = new Date(cleanDateStr + 'T12:00:00'); // Usamos meio-dia para garantir estabilidade
            if (isNaN(d.getTime())) return;
            dateStr = d.toISOString().split('T')[0];
          } else {
            return;
          }
        } catch (e) { return; }

        hours.forEach(h => {
          const hInt = parseInt(h);
          const courtKey = row[`${hInt}A`] || row[`${h}A`];
          const gourmetKey = row[`${hInt}G`] || row[`${h}G`];
          const hourKey = `${h}:00`;
          
          const isCourtOccupied = isActuallyOccupied(courtKey);
          const isGourmetOccupied = isActuallyOccupied(gourmetKey);

          if (isCourtOccupied || isGourmetOccupied) {
            const slotKey = `${dateStr}-${hourKey}`;
            transformed[slotKey] = { 
              court: transformed[slotKey]?.court || isCourtOccupied, 
              gourmet: transformed[slotKey]?.gourmet || isGourmetOccupied 
            };
          }
        });
      };

      if (Array.isArray(data)) {
        data.forEach(processRow);
      } else if (typeof data === 'object') {
        Object.keys(data).forEach(key => {
          if (Array.isArray(data[key])) {
            data[key].forEach(processRow);
          }
        });
      }

      setBookedSlots(transformed);
    } catch (error) {
      console.error("Erro ao sincronizar com database:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    fetchDatabase();
  }, [fetchDatabase]);

  const handleOpenBooking = () => setIsBookingOpen(true);
  const handleCloseBooking = () => setIsBookingOpen(false);

  const handleRequestPurchase = (slots: {date: Date, time: string}[], type: 'court' | 'gourmet') => {
    setCheckoutData({ slots, type });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased selection:bg-sand selection:text-white flex flex-col">
      <Header isDark={true} />
      
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden bg-black pt-20">
          <div className="relative z-10 text-center px-6 max-w-2xl mx-auto flex flex-col items-center">
            <div className="mb-8 flex flex-col items-center leading-none">
              <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter">
                ARENA <span className="text-sand italic">PÉ NA</span>
              </h1>
              <h1 className="text-7xl md:text-9xl font-black text-sand italic uppercase tracking-tighter">
                AREIA
              </h1>
            </div>
            <p className="text-lg md:text-xl text-stone-400 mb-12 font-medium max-w-sm">
              Agendamento moderno para amantes do vôlei de areia.
            </p>
            
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleOpenBooking}
                  disabled={isLoading}
                  className="bg-sand hover:bg-sand-dark text-white text-base md:text-lg font-black py-5 px-12 rounded-full shadow-2xl transition-all transform active:scale-95 uppercase tracking-widest disabled:opacity-50"
                >
                  {isLoading ? 'SINCRONIZANDO...' : 'EXPLORAR ARENAS'}
                </button>
                
                <button 
                  onClick={fetchDatabase}
                  disabled={isLoading}
                  title="Sincronizar Planilha"
                  className="p-5 rounded-full bg-stone-900 border border-white/10 text-stone-400 hover:text-sand hover:border-sand/50 transition-all transform active:scale-90 disabled:opacity-50"
                >
                  <RefreshCw size={24} className={isLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              {hasError && (
                <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20 animate-fade-in">
                  <AlertTriangle size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Erro na conexão. Clique no ícone para tentar novamente.</span>
                </div>
              )}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-sand/5 to-transparent pointer-events-none"></div>
        </section>

        {/* Galeria */}
        <section className="py-20 px-6 bg-stone-950">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden group relative">
                <img src="https://images.unsplash.com/photo-1612872086822-4424e90e652c?q=80&w=800&auto=format" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Volei de areia" />
                <div className="absolute inset-0 bg-black/40 p-8 flex flex-col justify-end">
                  <span className="text-sand font-black uppercase text-xs tracking-widest mb-2">Alta Performance</span>
                  <h3 className="text-2xl font-black text-white uppercase italic">Quadras Profissionais</h3>
                </div>
              </div>
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden group relative md:translate-y-12">
                <img src="https://images.unsplash.com/photo-1593787406536-3676215259c1?q=80&w=800&auto=format" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Por do sol quadra" />
                <div className="absolute inset-0 bg-black/40 p-8 flex flex-col justify-end">
                  <span className="text-sand font-black uppercase text-xs tracking-widest mb-2">Ambiente Único</span>
                  <h3 className="text-2xl font-black text-white uppercase italic">Pôr do Sol</h3>
                </div>
              </div>
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden group relative">
                <img src="https://images.unsplash.com/photo-1544919396-10777977439a?q=80&w=800&auto=format" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Social" />
                <div className="absolute inset-0 bg-black/40 p-8 flex flex-col justify-end">
                  <span className="text-sand font-black uppercase text-xs tracking-widest mb-2">Confraternização</span>
                  <h3 className="text-2xl font-black text-white uppercase italic">Área Gourmet</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Descrição */}
        <section className="py-32 px-6 bg-black">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-10 uppercase tracking-tighter">
              TECNOLOGIA E CONFORTO <br/><span className="text-sand italic">EM CADA PLAY.</span>
            </h2>
            <p className="text-xl text-stone-400 leading-relaxed mb-16">
              Nossa arena conta com areia especial de quartzo que não retém calor, garantindo conforto térmico mesmo sob sol forte. O sistema de drenagem de última geração permite jogos imediatos após chuvas.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center">
                <Trophy className="text-sand mb-3" size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest">Torneios Oficiais</span>
              </div>
              <div className="flex flex-col items-center">
                <Users className="text-sand mb-3" size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest">Aulas de Elite</span>
              </div>
              <div className="flex flex-col items-center">
                <MapPin className="text-sand mb-3" size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest">Localização Premium</span>
              </div>
              <div className="flex flex-col items-center">
                <Volleyball className="text-sand mb-3" size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest">Aluguel Simples</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer onLogin={setIsAdmin} isAdmin={isAdmin} isDark={true} />

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={handleCloseBooking} 
        courtName={selectedCourt}
        bookedSlots={bookedSlots}
        onBookSlots={setBookedSlots}
        isAdmin={isAdmin}
        isDark={true}
        onPurchaseRequest={handleRequestPurchase}
      />

      <CheckoutModal 
        data={checkoutData} 
        onClose={() => setCheckoutData(null)} 
      />
    </div>
  );
};

export default App;
