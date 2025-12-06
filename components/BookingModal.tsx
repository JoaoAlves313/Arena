import React, { useState, useEffect } from 'react';
import { X, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Clock, CheckCircle, MapPin, Activity, CircleDot, Utensils, ArrowRight, Layers, Copy, QrCode, DollarSign, Hourglass, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookingForm, BookingSlot, BookedSlots } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courtName: string; 
  bookedSlots: BookedSlots;
  onBookSlots: (slots: BookedSlots) => void;
  isAdmin?: boolean;
}

type BookingStep = 'calendar' | 'form' | 'payment' | 'success';
type SelectionMode = 'court' | 'gourmet';

interface TimeSlot {
  date: Date;
  time: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, courtName, bookedSlots, onBookSlots, isAdmin = false }) => {
  const START_DATE_LIMIT = new Date(2025, 11, 29); // 29 Dez 2025
  
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(START_DATE_LIMIT); 
  const [step, setStep] = useState<BookingStep>('calendar');
  
  // Controle do modo de seleção (Abas)
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('court');

  // Armazena slots selecionados separadamente
  const [selectedCourtSlots, setSelectedCourtSlots] = useState<TimeSlot[]>([]);
  const [selectedGourmetSlots, setSelectedGourmetSlots] = useState<TimeSlot[]>([]);
  
  // Estado para feedback de cópia do pix
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState<BookingForm>({
    courtSlots: [],
    gourmetSlots: [],
    sport: 'volei',
    includeBall: false
  });

  // Pix Code Mock
  const PIX_CODE = "00020126580014BR.GOV.BCB.PIX0136a1b2c3d4-e5f6-4789-8012-3456789012345204000053039865802BR5913ARENA PE AREIA6008BRASIL62070503***6304E2CA";

  // Preços
  const COURT_PRICE = 120;
  const GOURMET_PRICE = 150;
  const BALL_PRICE = 25; 
  
  // Cálculos
  const courtHours = formData.courtSlots.length;
  const gourmetHours = formData.gourmetSlots.length;
  
  let totalPrice = (courtHours * COURT_PRICE) + (gourmetHours * GOURMET_PRICE);
  if (courtHours > 0 && formData.includeBall) totalPrice += BALL_PRICE;

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep('calendar');
      setSelectionMode('court');
      setCurrentWeekStart(new Date(2025, 11, 29));
      setFormData({ 
        courtSlots: [],
        gourmetSlots: [],
        sport: 'volei',
        includeBall: false
      });
      setSelectedCourtSlots([]);
      setSelectedGourmetSlots([]);
      setCopied(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Calendar Logic ---

  const hours = [
    "08:00", "09:00", "10:00", "11:00", "12:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  const getDaysInWeek = (startDate: Date) => {
    const days = [];
    for (let i = 7; i < 14; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + (i - 7));
      days.push(d);
    }
    return days;
  };

  const currentWeekDays = getDaysInWeek(currentWeekStart);

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

  const handlePrevMonth = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(1); 
    newDate.setMonth(newDate.getMonth() - 1);
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
    const status = bookedSlots[slotKey] || { court: false, gourmet: false };

    // --- ADMIN LOGIC ---
    if (isAdmin) {
        // Toggle the booked status instantly
        const newSlots = { ...bookedSlots };
        const currentStatus = newSlots[slotKey] || { court: false, gourmet: false };
        
        if (selectionMode === 'court') {
            newSlots[slotKey] = { ...currentStatus, court: !currentStatus.court };
        } else {
            newSlots[slotKey] = { ...currentStatus, gourmet: !currentStatus.gourmet };
        }
        
        // Clean up empty keys if needed, but not strictly necessary for this logic
        onBookSlots(newSlots);
        return;
    }

    // --- CLIENT LOGIC ---

    // Verifica bloqueio baseado no modo atual
    if (selectionMode === 'court' && status?.court) return;
    if (selectionMode === 'gourmet' && status?.gourmet) return;

    const targetList = selectionMode === 'court' ? selectedCourtSlots : selectedGourmetSlots;
    const setTargetList = selectionMode === 'court' ? setSelectedCourtSlots : setSelectedGourmetSlots;

    const isAlreadySelected = targetList.some(s => s.date.toISOString().split('T')[0] === dateStr && s.time === time);

    if (isAlreadySelected) {
      const newList = targetList.filter(s => !(s.date.toISOString().split('T')[0] === dateStr && s.time === time));
      setTargetList(newList);
    } else {
      setTargetList([...targetList, { date, time }].sort((a, b) => {
        // Sort by Date then Time
        const dateA = a.date.getTime();
        const dateB = b.date.getTime();
        if (dateA !== dateB) return dateA - dateB;
        return a.time.localeCompare(b.time);
      }));
    }
  };

  const handleProceedToForm = () => {
    if (selectedCourtSlots.length === 0 && selectedGourmetSlots.length === 0) return;
    
    // Atualiza o formData com os dados da seleção
    setFormData(prev => ({ 
      ...prev, 
      courtSlots: selectedCourtSlots.map(s => ({
        date: s.date.toISOString().split('T')[0],
        time: s.time
      })),
      gourmetSlots: selectedGourmetSlots.map(s => ({
        date: s.date.toISOString().split('T')[0],
        time: s.time
      }))
    }));
    setStep('form');
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handleConfirmPayment = () => {
    // Atualiza o estado global com os novos slots ocupados
    const newBooked = { ...bookedSlots };
    
    formData.courtSlots.forEach(slot => {
      const slotKey = `${slot.date}-${slot.time}`;
      newBooked[slotKey] = { ...newBooked[slotKey], court: true };
    });

    formData.gourmetSlots.forEach(slot => {
      const slotKey = `${slot.date}-${slot.time}`;
      newBooked[slotKey] = { ...newBooked[slotKey], gourmet: true };
    });
      
    onBookSlots(newBooked);

    setStep('success');
    setTimeout(() => {
      onClose();
    }, 6000); // Mais tempo para ler a mensagem
  };

  const copyPix = () => {
    navigator.clipboard.writeText(PIX_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper para agrupar slots por data
  const getGroupedSlots = () => {
    const groups: Record<string, { court: string[], gourmet: string[] }> = {};

    formData.courtSlots.forEach(s => {
      if (!groups[s.date]) groups[s.date] = { court: [], gourmet: [] };
      groups[s.date].court.push(s.time);
    });

    formData.gourmetSlots.forEach(s => {
      if (!groups[s.date]) groups[s.date] = { court: [], gourmet: [] };
      groups[s.date].gourmet.push(s.time);
    });

    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  };

  // Labels e Helpers
  const formatDateDisplay = (date: Date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const formatIsoDateDisplay = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };
  
  const getWeekLabel = () => {
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return `${formatDateDisplay(currentWeekStart)} a ${formatDateDisplay(endOfWeek)}`;
  };

  const getMonthLabel = () => {
    const month = currentWeekStart.toLocaleDateString('pt-BR', { month: 'long' });
    const year = currentWeekStart.getFullYear();
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  };

  const canGoBack = currentWeekStart.getTime() > START_DATE_LIMIT.getTime();
  const canGoForward = currentWeekStart.getFullYear() <= 2026;

  const totalSelectedCount = selectedCourtSlots.length + selectedGourmetSlots.length;

  // --- Animation Variants ---
  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const transition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3
  };

  // --- Render Helpers ---

  return (
    <div className="fixed inset-0 z-[60] bg-white animate-fade-in flex flex-col">
      
      {/* Header Fixo */}
      <div className={`px-6 py-4 flex justify-between items-center text-white shadow-md z-20 shrink-0 ${isAdmin ? 'bg-stone-800' : 'bg-sand'}`}>
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Calendar size={28} />
          {isAdmin ? `Gerenciamento - ${courtName}` : 
           step === 'calendar' ? `Agenda - ${courtName}` : 
           step === 'payment' ? 'Pagamento' : 
           'Detalhes da Solicitação'}
        </h2>
        {isAdmin && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">Modo Editor</span>}
        <button 
          onClick={onClose} 
          className="hover:bg-white/20 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
        >
          <X size={32} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden bg-stone-50 flex flex-col relative">
        <AnimatePresence mode="wait">
        
        {step === 'calendar' && (
          <motion.div
            key="calendar"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={transition}
            className="h-full flex flex-col relative w-full"
          >
            
            {/* --- Resource Tabs --- */}
            <div className="bg-white p-2 flex justify-center border-b border-stone-100 shadow-sm shrink-0 gap-4 pt-4">
                <button
                  onClick={() => setSelectionMode('court')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                    selectionMode === 'court' 
                      ? 'bg-blue-500 text-white shadow-lg ring-2 ring-blue-200' 
                      : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  <Activity size={20} />
                  {isAdmin ? 'Editar Quadra' : 'Selecionar Quadra'}
                  {!isAdmin && selectedCourtSlots.length > 0 && <span className="bg-white/20 px-2 rounded-full text-xs">{selectedCourtSlots.length}h</span>}
                </button>

                <button
                  onClick={() => setSelectionMode('gourmet')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                    selectionMode === 'gourmet' 
                      ? 'bg-purple-500 text-white shadow-lg ring-2 ring-purple-200' 
                      : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  <Utensils size={20} />
                  {isAdmin ? 'Editar Gourmet' : 'Selecionar Gourmet'}
                  {!isAdmin && selectedGourmetSlots.length > 0 && <span className="bg-white/20 px-2 rounded-full text-xs">{selectedGourmetSlots.length}h</span>}
                </button>
            </div>

            {/* --- Month Navigation --- */}
            <div className="bg-white border-b border-stone-100 p-2 flex justify-between items-center shrink-0">
               <button 
                 onClick={handlePrevMonth}
                 className="p-2 text-stone-400 hover:text-sand hover:bg-stone-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                 disabled={!canGoBack}
               >
                 <ChevronsLeft size={20} />
                 Mês Anterior
               </button>

               <div className="text-lg font-black text-stone-800 uppercase tracking-widest">
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

            {/* --- Week Navigation --- */}
            <div className="bg-white border-b border-stone-200 p-3 flex justify-between items-center shadow-sm shrink-0">
              <button 
                onClick={handlePrevWeek} 
                className={`p-2 rounded-full ${canGoBack ? 'hover:bg-stone-100 text-stone-700' : 'opacity-30 cursor-not-allowed text-stone-300'}`}
                disabled={!canGoBack}
              >
                <ChevronLeft size={28} />
              </button>
              
              <div className="text-base font-bold text-stone-600 text-center">
                {getWeekLabel()}
              </div>
              
              <button 
                onClick={handleNextWeek} 
                className={`p-2 rounded-full ${canGoForward ? 'hover:bg-stone-100 text-stone-700' : 'opacity-30 cursor-not-allowed text-stone-300'}`}
                disabled={!canGoForward}
              >
                <ChevronRight size={28} />
              </button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-auto p-2 sm:p-6 pb-24">
              {isAdmin && (
                <div className="text-center mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                   Clique nos horários para alternar entre <strong>Disponível</strong> e <strong>Ocupado</strong> instantaneamente.
                </div>
              )}
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
                      </div>
                      
                      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                        {hours.map((hour) => {
                          const dateStr = day.toISOString().split('T')[0];
                          const slotKey = `${dateStr}-${hour}`;
                          const status = bookedSlots[slotKey] || { court: false, gourmet: false };
                          
                          // Verificação de Seleção do Usuário (SÓ PARA CLIENTE)
                          const isSelectedCourt = !isAdmin && selectedCourtSlots.some(s => s.date.toISOString().split('T')[0] === dateStr && s.time === hour);
                          const isSelectedGourmet = !isAdmin && selectedGourmetSlots.some(s => s.date.toISOString().split('T')[0] === dateStr && s.time === hour);

                          // Estados de Disponibilidade
                          // Bloqueado se já ocupado no backend (exceto se for nossa seleção atual)
                          // Se for ADMIN, nada é bloqueado visualmente no sentido de 'disable', mas mostramos o status
                          const isCourtOccupied = status.court;
                          const isGourmetOccupied = status.gourmet;

                          let isDisabled = false;
                          if (!isAdmin) {
                              if (selectionMode === 'court' && isCourtOccupied && !isSelectedCourt) isDisabled = true;
                              if (selectionMode === 'gourmet' && isGourmetOccupied && !isSelectedGourmet) isDisabled = true;
                          }
                          
                          // Estilos dinâmicos
                          let btnStyle = "bg-white border-stone-200 text-stone-600 hover:border-sand hover:shadow-sm";
                          let inlineStyle = {};
                          let adminIcon = null;

                          if (isAdmin) {
                              // Estilo Admin
                              const isOccupied = selectionMode === 'court' ? isCourtOccupied : isGourmetOccupied;
                              if (isOccupied) {
                                  btnStyle = "bg-red-50 text-red-600 border-red-300 font-bold shadow-inner";
                                  adminIcon = <Lock size={14} className="ml-1" />;
                              } else {
                                  btnStyle = "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 font-medium";
                                  adminIcon = <Unlock size={14} className="ml-1 opacity-50" />;
                              }
                          } else {
                              // Estilo Cliente (Lógica Original)
                              if (isDisabled) {
                                 btnStyle = "bg-stone-50 text-red-400 border-stone-200 cursor-not-allowed opacity-60 font-medium";
                              } else {
                                 if (isSelectedCourt && isSelectedGourmet) {
                                    inlineStyle = { background: 'linear-gradient(135deg, #eff6ff 50%, #faf5ff 50%)' };
                                    btnStyle = "text-red-600 border-stone-300 font-bold shadow-md transform scale-105 border-2";
                                 } else if (isSelectedCourt) {
                                    btnStyle = "bg-blue-50 border-blue-500 text-red-600 font-bold shadow-md ring-1 ring-blue-300 border-2";
                                    if (selectionMode === 'gourmet') btnStyle += " opacity-60"; 
                                 } else if (isSelectedGourmet) {
                                    btnStyle = "bg-purple-50 border-purple-500 text-red-600 font-bold shadow-md ring-1 ring-purple-300 border-2";
                                    if (selectionMode === 'court') btnStyle += " opacity-60";
                                 } else {
                                    if (status.court && status.gourmet) {
                                       inlineStyle = { background: 'linear-gradient(135deg, #dbeafe 50%, #f3e8ff 50%)', opacity: 0.5 };
                                    } else if (status.court) {
                                       btnStyle += " border-l-4 border-l-blue-400 bg-stone-50";
                                    } else if (status.gourmet) {
                                       btnStyle += " border-r-4 border-r-purple-400 bg-stone-50";
                                    }
                                 }
                              }
                          }

                          return (
                            <button
                              key={hour}
                              onClick={() => handleSlotClick(day, hour)}
                              disabled={isDisabled}
                              style={inlineStyle}
                              className={`w-full py-4 px-2 text-lg border rounded-lg transition-all font-medium focus:outline-none flex items-center justify-center ${btnStyle}`}
                            >
                              {hour}
                              {adminIcon}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Floating Action Button (Only for Client) */}
            {!isAdmin && totalSelectedCount > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute bottom-6 right-6 z-30"
              >
                 <button 
                  onClick={handleProceedToForm}
                  className="bg-stone-800 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:bg-stone-900 transition-all transform hover:scale-105"
                 >
                   <div className="flex flex-col items-start text-left">
                     <span className="text-xs text-stone-400 font-bold uppercase">Avançar</span>
                     <div className="text-sm font-bold flex gap-2">
                       {selectedCourtSlots.length > 0 && <span className="text-blue-300">{selectedCourtSlots.length}h Quadra</span>}
                       {selectedCourtSlots.length > 0 && selectedGourmetSlots.length > 0 && <span>+</span>}
                       {selectedGourmetSlots.length > 0 && <span className="text-purple-300">{selectedGourmetSlots.length}h Gourmet</span>}
                     </div>
                   </div>
                   <div className="bg-white/20 p-2 rounded-full">
                     <ArrowRight size={24} />
                   </div>
                 </button>
              </motion.div>
            )}
            
            {/* Admin Close Button */}
            {isAdmin && (
               <div className="absolute bottom-6 right-6 z-30">
                 <button 
                  onClick={onClose}
                  className="bg-red-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:bg-red-700 transition-all"
                 >
                   <CheckCircle size={24} />
                   <span className="font-bold">Concluir Edição</span>
                 </button>
               </div>
            )}
          </motion.div>
        )}

        {step === 'form' && (
          <motion.div
            key="form"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={transition}
            className="flex-1 overflow-y-auto flex items-center justify-center p-4 w-full"
          >
            <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-xl border border-stone-100">
              
              {/* Header do Form */}
              <div className="mb-6 bg-stone-50 border border-stone-100 p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-stone-500 font-semibold uppercase tracking-wider">Resumo do Agendamento</p>
                    <p className="text-xl text-stone-800 font-bold mt-1">
                       {totalSelectedCount} {totalSelectedCount === 1 ? 'horário selecionado' : 'horários selecionados'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setStep('calendar')} 
                    className="text-sm font-bold text-sand hover:underline"
                  >
                    Alterar
                  </button>
                </div>

                {/* Lista de Datas e Horários */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {getGroupedSlots().map(([date, times]) => (
                     <div key={date} className="bg-white p-4 rounded-xl border border-stone-200">
                        <div className="flex items-center gap-2 mb-3 border-b border-stone-100 pb-2">
                            <Calendar size={18} className="text-stone-400" />
                            <span className="font-bold text-stone-700">{formatIsoDateDisplay(date)}</span>
                        </div>
                        
                        <div className="space-y-3">
                            {times.court.length > 0 && (
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg mt-0.5"><Activity size={14} /></div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap gap-1">
                                            {times.court.map(t => (
                                                <span key={t} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 font-medium">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-stone-500 mt-1">R$ {times.court.length * COURT_PRICE}</span>
                                </div>
                            )}

                            {times.gourmet.length > 0 && (
                                <div className="flex items-start gap-3">
                                    <div className="bg-purple-100 text-purple-600 p-1.5 rounded-lg mt-0.5"><Utensils size={14} /></div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap gap-1">
                                            {times.gourmet.map(t => (
                                                <span key={t} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100 font-medium">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-stone-500 mt-1">R$ {times.gourmet.length * GOURMET_PRICE}</span>
                                </div>
                            )}
                        </div>
                     </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleProceedToPayment} className="space-y-6">
                
                {/* Opções Quadra */}
                {formData.courtSlots.length > 0 && (
                  <div className="animate-fade-in space-y-4 border-t border-stone-100 pt-4">
                    <h3 className="font-bold text-stone-800 flex items-center gap-2">
                       <Activity size={18} className="text-blue-500" />
                       Detalhes da Quadra
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-2">Esporte</label>
                      <div className="relative">
                        <select
                          value={formData.sport}
                          onChange={(e) => setFormData({...formData, sport: e.target.value as any})}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-200 outline-none appearance-none"
                        >
                          <option value="volei">Vôlei de Praia</option>
                          <option value="futevolei">Futevôlei</option>
                          <option value="frescobol">Frescobol</option>
                        </select>
                        <ChevronDownIcon className="absolute right-4 top-4 text-stone-400 pointer-events-none" />
                      </div>
                    </div>

                    <div 
                      onClick={() => setFormData({...formData, includeBall: !formData.includeBall})}
                      className={`cursor-pointer px-4 py-3 rounded-xl border transition-all flex items-center justify-between ${formData.includeBall ? 'border-blue-300 bg-blue-50' : 'border-stone-200 bg-stone-50'}`}
                    >
                      <div>
                        <span className="font-medium text-stone-700">Incluir Bola</span>
                        <span className="text-xs text-stone-500 block">+ R$ {BALL_PRICE},00</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${formData.includeBall ? 'bg-blue-500 border-blue-500' : 'bg-white border-stone-300'}`}>
                        {formData.includeBall && <CheckCircle size={14} className="text-white" />}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Total Price */}
                <div className="flex justify-end items-center border-t border-stone-100 pt-6">
                  <div className="text-right">
                    <p className="text-sm text-stone-500 uppercase font-semibold">Valor Total</p>
                    <div className="flex flex-col items-end">
                      <p className="text-4xl font-bold text-ocean">
                        R$ {totalPrice.toFixed(2).replace('.', ',')}
                      </p>
                      {formData.includeBall && formData.courtSlots.length > 0 && (
                        <span className="text-xs text-stone-400">+ Taxa da bola inclusa</span>
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
                    className="flex-[2] bg-stone-800 hover:bg-stone-900 text-white font-bold text-lg py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div
            key="payment"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={transition}
            className="flex-1 overflow-y-auto flex items-center justify-center p-4 bg-stone-100 w-full"
          >
             <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-stone-200 text-center">
                <div className="flex justify-center mb-6">
                   <div className="bg-ocean/10 p-4 rounded-full text-ocean">
                     <QrCode size={40} />
                   </div>
                </div>
                
                <h3 className="text-2xl font-bold text-stone-800 mb-2">Pagamento via Pix</h3>
                <p className="text-stone-600 mb-6">Escaneie o QR Code ou copie o código abaixo para solicitar sua reserva.</p>
                
                <div className="flex justify-center mb-8">
                   <div className="p-4 border-2 border-stone-100 rounded-2xl shadow-inner bg-white">
                      {/* Placeholder for QR Code */}
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(PIX_CODE)}`} 
                        alt="QR Code Pix" 
                        className="w-48 h-48 object-contain"
                      />
                   </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl p-2 relative">
                    <input 
                      type="text" 
                      readOnly 
                      value={PIX_CODE} 
                      className="w-full bg-transparent text-stone-500 text-xs truncate pl-2 outline-none" 
                    />
                    <button 
                      onClick={copyPix}
                      className="bg-stone-800 hover:bg-stone-900 text-white p-2 rounded-lg transition-colors flex items-center gap-2 shrink-0 text-sm font-bold px-4"
                    >
                      {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                      {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleConfirmPayment}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} />
                    Já paguei, Solicitar Reserva
                  </button>
                  <button
                    onClick={() => setStep('form')}
                    className="w-full py-3 text-stone-500 hover:text-stone-700 font-semibold text-sm transition-colors"
                  >
                    Voltar para resumo
                  </button>
                </div>
             </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={transition}
            className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-stone-50 w-full"
          >
            <div className="w-32 h-32 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-8 animate-pulse shadow-lg">
              <Hourglass size={64} />
            </div>
            <h3 className="text-4xl font-bold text-stone-800 mb-4">Solicitação Enviada!</h3>
            <p className="text-xl text-stone-600 mb-8 max-w-lg mx-auto">
              Recebemos seu comprovante. O administrador irá confirmar sua reserva em breve. Fique de olho no WhatsApp!
            </p>
            
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
               <div className="bg-stone-50 px-6 py-4 border-b border-stone-100 text-left">
                  <h4 className="font-bold text-stone-700">Resumo da Solicitação</h4>
               </div>
               <div className="p-6 max-h-[300px] overflow-y-auto">
                 {getGroupedSlots().map(([date, times]) => (
                    <div key={date} className="mb-4 last:mb-0 border-b last:border-0 border-stone-100 pb-4 last:pb-0 text-left">
                       <p className="font-bold text-stone-800 mb-2">{formatIsoDateDisplay(date)}</p>
                       <div className="flex flex-wrap gap-2">
                          {times.court.map(t => (
                              <span key={`c-${t}`} className="bg-yellow-50 text-yellow-800 px-2 py-1 rounded text-xs font-bold border border-yellow-100 flex items-center gap-1">
                                <Activity size={10} /> {t}
                              </span>
                          ))}
                          {times.gourmet.map(t => (
                              <span key={`g-${t}`} className="bg-yellow-50 text-yellow-800 px-2 py-1 rounded text-xs font-bold border border-yellow-100 flex items-center gap-1">
                                <Utensils size={10} /> {t}
                              </span>
                          ))}
                       </div>
                    </div>
                 ))}
               </div>
            </div>

            <div className="text-stone-400 font-medium mt-8">
              Fechando em instantes...
            </div>
          </motion.div>
        )}
        </AnimatePresence>

      </div>
    </div>
  );
};

// Simple icon helper for the select
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

export default BookingModal;