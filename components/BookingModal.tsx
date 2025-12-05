import React, { useState, useEffect } from 'react';
import { X, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Clock, CheckCircle, MapPin, Activity, CircleDot } from 'lucide-react';
import { BookingForm } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courtName: string; // Mantido como referência, mas o usuário escolhe a quadra específica no form
}

type BookingStep = 'calendar' | 'form' | 'success';

interface TimeSlot {
  date: Date;
  time: string;
}

// Registro de horários ocupados: chave "DATA-HORA" -> { q1: bool, q2: bool }
type BookedSlots = Record<string, { q1: boolean; q2: boolean }>;

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, courtName }) => {
  // Inicializa em 29 de Dezembro de 2025 (Segunda-feira) para mostrar a semana completa do reveillon
  const START_DATE_LIMIT = new Date(2025, 11, 29); // 29 Dez 2025
  
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(START_DATE_LIMIT); 
  const [step, setStep] = useState<BookingStep>('calendar');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  
  // Estado para armazenar as reservas (simulando backend)
  const [bookedSlots, setBookedSlots] = useState<BookedSlots>({});

  const [formData, setFormData] = useState<BookingForm>({
    date: '',
    time: '',
    courtId: 'quadra1',
    sport: 'volei',
    includeBall: false
  });

  // Preços
  const BASE_PRICE = 120;
  const BALL_PRICE = 25;
  
  const totalPrice = formData.includeBall ? BASE_PRICE + BALL_PRICE : BASE_PRICE;

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep('calendar');
      setCurrentWeekStart(new Date(2025, 11, 29)); // Reinicia para 29/12/2025
      setFormData({ 
        date: '', 
        time: '', 
        courtId: 'quadra1',
        sport: 'volei',
        includeBall: false
      });
      setSelectedSlot(null);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  // Se abrir o formulário e uma quadra já estiver ocupada, seleciona a outra automaticamente
  useEffect(() => {
    if (step === 'form' && selectedSlot) {
      const dateStr = selectedSlot.date.toISOString().split('T')[0];
      const slotKey = `${dateStr}-${selectedSlot.time}`;
      const status = bookedSlots[slotKey];

      if (status?.q1 && !status?.q2) {
        setFormData(prev => ({ ...prev, courtId: 'quadra2' }));
      } else if (!status?.q1 && status?.q2) {
        setFormData(prev => ({ ...prev, courtId: 'quadra1' }));
      }
    }
  }, [step, selectedSlot, bookedSlots]);

  if (!isOpen) return null;

  // --- Calendar Logic ---

  const hours = [
    "08:00", "09:00", "10:00", "11:00", "12:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  const getDaysInWeek = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const currentWeekDays = getDaysInWeek(currentWeekStart);

  // Navegação de Semana
  const handlePrevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    if (newDate < START_DATE_LIMIT) return;
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    if (newDate.getFullYear() > 2026) return;
    setCurrentWeekStart(newDate);
  };

  // Navegação de Mês (Mini Calendário)
  const handlePrevMonth = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(1); // Vai para o dia 1 para evitar pular meses (ex: 31 Jan -> 31 Fev bug)
    newDate.setMonth(newDate.getMonth() - 1);
    
    // Se for antes do limite, define para o limite
    if (newDate < START_DATE_LIMIT) {
        setCurrentWeekStart(new Date(START_DATE_LIMIT));
    } else {
        setCurrentWeekStart(newDate);
    }
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(1);
    newDate.setMonth(newDate.getMonth() + 1);
    
    if (newDate.getFullYear() > 2026) return;
    setCurrentWeekStart(newDate);
  };

  const handleSlotClick = (date: Date, time: string) => {
    const dateStr = date.toISOString().split('T')[0];
    const slotKey = `${dateStr}-${time}`;
    const status = bookedSlots[slotKey];

    // Se ambas as quadras estiverem ocupadas, não faz nada
    if (status?.q1 && status?.q2) return;

    setSelectedSlot({ date, time });
    setFormData(prev => ({ ...prev, date: dateStr, time }));
    setStep('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Salva a reserva no estado
    const slotKey = `${formData.date}-${formData.time}`;
    setBookedSlots(prev => ({
      ...prev,
      [slotKey]: {
        q1: prev[slotKey]?.q1 || formData.courtId === 'quadra1',
        q2: prev[slotKey]?.q2 || formData.courtId === 'quadra2'
      }
    }));

    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onClose();
      }, 3000);
    }, 1000);
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // Label para a semana
  const getWeekLabel = () => {
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return `${formatDateDisplay(currentWeekStart)} a ${formatDateDisplay(endOfWeek)}`;
  };

  // Label para o Mês Atual
  const getMonthLabel = () => {
    const month = currentWeekStart.toLocaleDateString('pt-BR', { month: 'long' });
    const year = currentWeekStart.getFullYear();
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  };

  const canGoBack = currentWeekStart.getTime() > START_DATE_LIMIT.getTime();
  const canGoForward = currentWeekStart.getFullYear() <= 2026;

  // --- Render Helpers ---

  return (
    <div className="fixed inset-0 z-[60] bg-white animate-fade-in flex flex-col">
      
      {/* Header Fixo */}
      <div className="bg-sand px-6 py-4 flex justify-between items-center text-white shadow-md z-20 shrink-0">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Calendar size={28} />
          {step === 'calendar' ? `Agenda - ${courtName}` : 'Detalhes do Jogo'}
        </h2>
        <button 
          onClick={onClose} 
          className="hover:bg-white/20 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
        >
          <X size={32} />
        </button>
      </div>

      {/* Conteúdo Principal Full Screen */}
      <div className="flex-1 overflow-hidden bg-stone-50 flex flex-col">
        
        {step === 'calendar' && (
          <div className="h-full flex flex-col">
            
            {/* --- Mini Calendar / Month Navigation --- */}
            <div className="bg-white border-b border-stone-100 p-2 flex justify-between items-center shrink-0">
               <button 
                 onClick={handlePrevMonth}
                 className="p-2 text-stone-400 hover:text-sand hover:bg-stone-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                 disabled={!canGoBack}
               >
                 <ChevronsLeft size={20} />
                 Mês Anterior
               </button>

               <div className="text-xl font-black text-stone-800 uppercase tracking-widest">
                 {getMonthLabel()}
               </div>

               <button 
                 onClick={handleNextMonth}
                 className="p-2 text-stone-400 hover:text-sand hover:bg-stone-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                 disabled={!canGoForward}
               >
                 Próximo Mês
                 <ChevronsRight size={20} />
               </button>
            </div>

            {/* --- Week Navigation Bar --- */}
            <div className="bg-white border-b border-stone-200 p-4 flex justify-between items-center shadow-sm shrink-0">
              <button 
                onClick={handlePrevWeek} 
                className={`p-4 rounded-full transition-colors flex items-center gap-2 font-bold ${canGoBack ? 'hover:bg-stone-100 text-stone-700' : 'opacity-30 cursor-not-allowed text-stone-300'}`}
                disabled={!canGoBack}
              >
                <ChevronLeft size={32} />
                <span className="hidden sm:inline">Semana Anterior</span>
              </button>
              
              <div className="text-lg font-bold text-stone-600 text-center">
                <span className="uppercase text-xs text-stone-400 block mb-1 tracking-wider">Semana de</span>
                {getWeekLabel()}
              </div>
              
              <button 
                onClick={handleNextWeek} 
                className={`p-4 rounded-full transition-colors flex items-center gap-2 font-bold ${canGoForward ? 'hover:bg-stone-100 text-stone-700' : 'opacity-30 cursor-not-allowed text-stone-300'}`}
                disabled={!canGoForward}
              >
                <span className="hidden sm:inline">Próxima Semana</span>
                <ChevronRight size={32} />
              </button>
            </div>

            {/* Grid Full Screen */}
            <div className="flex-1 overflow-auto p-2 sm:p-6">
              <div className="grid grid-cols-7 gap-2 sm:gap-4 min-w-[1000px] h-full">
                {currentWeekDays.map((day, index) => {
                   const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                   const isPreviousYear = day.getFullYear() < 2026;
                   
                   return (
                    <div key={index} className="flex flex-col gap-2 h-full">
                      <div className={`text-center p-3 rounded-xl ${isWeekend ? 'bg-sand text-white' : 'bg-white text-stone-600 border border-stone-200'} font-bold shadow-sm shrink-0 ${isPreviousYear ? 'opacity-70' : ''}`}>
                        <div className="text-sm uppercase tracking-wide opacity-90">
                          {day.toLocaleDateString('pt-BR', { weekday: 'long' })}
                        </div>
                        <div className="text-3xl">{day.getDate()}</div>
                        {isPreviousYear && <div className="text-[10px] uppercase mt-1">2025</div>}
                      </div>
                      
                      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                        {hours.map((hour) => {
                          const slotKey = `${day.toISOString().split('T')[0]}-${hour}`;
                          const status = bookedSlots[slotKey] || { q1: false, q2: false };
                          
                          // Lógica de Cores
                          // Quadra 1 = Azul (#3b82f6)
                          // Quadra 2 = Roxo (#a855f7)
                          let backgroundStyle = {};
                          let buttonClass = "bg-white hover:bg-sand hover:text-white hover:border-sand";
                          let textClass = "text-stone-600";
                          let isDisabled = false;

                          if (status.q1 && status.q2) {
                            // Ambas ocupadas: Metade Azul, Metade Roxo
                            backgroundStyle = { background: 'linear-gradient(90deg, #3b82f6 50%, #a855f7 50%)' };
                            buttonClass = "opacity-50 cursor-not-allowed border-transparent";
                            textClass = "text-white";
                            isDisabled = true;
                          } else if (status.q1) {
                            // Só Q1: Lado esquerdo Azul
                            backgroundStyle = { background: 'linear-gradient(90deg, #3b82f6 50%, white 50%)' };
                            buttonClass = "hover:shadow-md border-stone-200"; 
                          } else if (status.q2) {
                            // Só Q2: Lado direito Roxo
                            backgroundStyle = { background: 'linear-gradient(90deg, white 50%, #a855f7 50%)' };
                            buttonClass = "hover:shadow-md border-stone-200";
                          }

                          return (
                            <button
                              key={hour}
                              onClick={() => handleSlotClick(day, hour)}
                              disabled={isDisabled}
                              style={backgroundStyle}
                              className={`w-full py-4 px-2 text-lg border rounded-lg transition-all font-medium focus:ring-2 focus:ring-sand focus:ring-offset-1 ${buttonClass} ${textClass}`}
                            >
                              {hour}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 'form' && selectedSlot && (
          <div className="flex-1 overflow-y-auto flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-xl animate-fade-in border border-stone-100">
              <div className="mb-6 bg-orange-50 border border-orange-100 p-6 rounded-2xl flex items-center gap-6">
                <div className="bg-white p-4 rounded-full shadow-sm text-sand">
                  <Clock size={32} />
                </div>
                <div>
                  <p className="text-sm text-stone-500 font-semibold uppercase tracking-wider">Horário Selecionado</p>
                  <p className="text-3xl text-stone-800 font-bold mt-1">
                    {selectedSlot.date.toLocaleDateString('pt-BR')} <span className="text-sand mx-2">•</span> {selectedSlot.time}
                  </p>
                </div>
                <button 
                  onClick={() => setStep('calendar')} 
                  className="ml-auto px-6 py-2 rounded-full border border-sand text-sand hover:bg-sand hover:text-white transition-colors font-bold"
                >
                  Alterar
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Seleção de Quadra */}
                <div>
                  <label className="block text-lg font-bold text-stone-700 mb-3 flex items-center gap-2">
                    <MapPin size={20} /> Escolha a Quadra
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {(() => {
                        const dateStr = selectedSlot.date.toISOString().split('T')[0];
                        const slotKey = `${dateStr}-${selectedSlot.time}`;
                        const status = bookedSlots[slotKey];
                        const isQ1Taken = status?.q1;
                        const isQ2Taken = status?.q2;

                        return (
                          <>
                            <button 
                              type="button"
                              disabled={isQ1Taken}
                              onClick={() => setFormData({...formData, courtId: 'quadra1'})}
                              className={`border-2 p-4 rounded-xl flex items-center justify-between transition-all 
                                ${isQ1Taken ? 'opacity-50 cursor-not-allowed bg-stone-100 border-stone-200' : 'cursor-pointer'}
                                ${formData.courtId === 'quadra1' && !isQ1Taken ? 'border-blue-500 bg-blue-50' : 'border-stone-200 hover:border-blue-300'}`}
                            >
                              <span className={`font-bold ${formData.courtId === 'quadra1' ? 'text-blue-600' : 'text-stone-700'}`}>
                                {isQ1Taken ? 'Quadra 1 (Ocupada)' : 'Quadra 1'}
                              </span>
                              {formData.courtId === 'quadra1' && !isQ1Taken && <CheckCircle className="text-blue-500" />}
                            </button>

                            <button 
                              type="button"
                              disabled={isQ2Taken}
                              onClick={() => setFormData({...formData, courtId: 'quadra2'})}
                              className={`border-2 p-4 rounded-xl flex items-center justify-between transition-all 
                                ${isQ2Taken ? 'opacity-50 cursor-not-allowed bg-stone-100 border-stone-200' : 'cursor-pointer'}
                                ${formData.courtId === 'quadra2' && !isQ2Taken ? 'border-purple-500 bg-purple-50' : 'border-stone-200 hover:border-purple-300'}`}
                            >
                              <span className={`font-bold ${formData.courtId === 'quadra2' ? 'text-purple-600' : 'text-stone-700'}`}>
                                {isQ2Taken ? 'Quadra 2 (Ocupada)' : 'Quadra 2'}
                              </span>
                              {formData.courtId === 'quadra2' && !isQ2Taken && <CheckCircle className="text-purple-500" />}
                            </button>
                          </>
                        );
                    })()}
                  </div>
                </div>

                {/* Seleção de Esporte */}
                <div>
                  <label className="block text-lg font-bold text-stone-700 mb-3 flex items-center gap-2">
                    <Activity size={20} /> Qual esporte?
                  </label>
                  <div className="relative">
                    <select
                      value={formData.sport}
                      onChange={(e) => setFormData({...formData, sport: e.target.value as any})}
                      className="w-full px-6 py-4 text-lg border border-stone-200 rounded-xl focus:ring-2 focus:ring-sand focus:border-transparent outline-none appearance-none bg-stone-50 cursor-pointer"
                    >
                      <option value="volei">Vôlei de Praia</option>
                      <option value="futevolei">Futevôlei</option>
                      <option value="frescobol">Frescobol</option>
                    </select>
                    <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-stone-500">
                      <ChevronDownIcon />
                    </div>
                  </div>
                </div>

                {/* Precisa de Bola? */}
                <div>
                  <label className="block text-lg font-bold text-stone-700 mb-2 flex items-center gap-2">
                    <CircleDot size={20} /> Precisa de bola?
                  </label>
                  <div 
                    onClick={() => setFormData({...formData, includeBall: !formData.includeBall})}
                    className={`cursor-pointer px-6 py-4 rounded-xl border-2 transition-all flex items-center justify-between ${formData.includeBall ? 'border-sand bg-sand/10 text-stone-800' : 'border-stone-200 bg-stone-50 text-stone-500'}`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-lg">Sim, incluir bola</span>
                      <span className="text-sm opacity-80">+ R$ {BALL_PRICE},00</span>
                    </div>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${formData.includeBall ? 'bg-sand border-sand' : 'border-stone-300 bg-white'}`}>
                      {formData.includeBall && <CheckCircle size={20} className="text-white" />}
                    </div>
                  </div>
                </div>
                
                {/* Total Price */}
                <div className="flex justify-end items-center border-t border-stone-100 pt-6">
                  <div className="text-right">
                    <p className="text-sm text-stone-500 uppercase font-semibold">Valor Total</p>
                    <div className="flex items-center justify-end gap-2">
                      <p className="text-4xl font-bold text-ocean">
                        R$ {totalPrice.toFixed(2).replace('.', ',')}
                      </p>
                      {formData.includeBall && (
                         <span className="text-xs font-semibold bg-sand/20 text-stone-600 px-2 py-1 rounded-md">
                           (120 + 25)
                         </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-4">
                   <button
                    type="button"
                    onClick={() => setStep('calendar')}
                    className="flex-1 py-4 px-6 rounded-xl border-2 border-stone-200 text-stone-600 font-bold text-lg hover:bg-stone-50 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-sand hover:bg-sand-dark text-white font-bold text-lg py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                  >
                    Confirmar Agendamento
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-fade-in bg-stone-50">
            <div className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 animate-bounce shadow-lg">
              <CheckCircle size={64} />
            </div>
            <h3 className="text-4xl font-bold text-stone-800 mb-4">Tudo Certo!</h3>
            <p className="text-xl text-stone-600 mb-2 max-w-lg mx-auto">
              Sua reserva para <strong>{formData.sport.charAt(0).toUpperCase() + formData.sport.slice(1)}</strong> na <strong>{formData.courtId === 'quadra1' ? 'Quadra 1' : 'Quadra 2'}</strong> foi confirmada.
            </p>
             <p className="text-lg text-stone-500 mb-8">
              Data: {formData.date} • Horário: {formData.time}
            </p>
            <div className="text-stone-400 font-medium">
              Redirecionando para o início...
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Simple icon helper for the select
const ChevronDownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

export default BookingModal;