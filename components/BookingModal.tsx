
import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar as CalendarIcon, Activity, Utensils, ShieldCheck, ChevronLeft, ChevronRight, Cloud, ShoppingBag, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookedSlots } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courtName: string; 
  bookedSlots: BookedSlots;
  onBookSlots: (slots: BookedSlots) => void;
  isAdmin?: boolean;
  isDark?: boolean;
  onPurchaseRequest?: (slots: {date: Date, time: string}[], type: 'court' | 'gourmet') => void;
}

type SelectionType = 'court' | 'gourmet';

const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, onClose, courtName, bookedSlots, onBookSlots, isAdmin = false, isDark = false, onPurchaseRequest 
}) => {
  // Data de início configurada para 1 de Janeiro de 2026
  const START_DATE = new Date(2026, 0, 1);
  const TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectionType, setSelectionType] = useState<SelectionType>('court');
  const [currentMonth, setCurrentMonth] = useState<Date>(START_DATE);
  const [selectedDate, setSelectedDate] = useState<Date>(START_DATE);
  
  const [selectedTempSlots, setSelectedTempSlots] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Ao abrir, garantimos que comece em 2026
      setSelectedDate(START_DATE);
      setCurrentMonth(START_DATE);
      setShowDatePicker(false);
      setSelectedTempSlots(new Set());
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; }
  }, [isOpen]);

  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const weekDays = useMemo(() => {
    const startOfWeek = getStartOfWeek(selectedDate);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDaySelect = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(getStartOfWeek(date));
    setShowDatePicker(false);
  };

  const handleSlotClick = (date: Date, time: string) => {
    const checkDate = new Date(date);
    checkDate.setHours(0,0,0,0);
    
    // Impede seleção de dias passados para usuários não admin
    if (!isAdmin && checkDate < TODAY) return;

    const dateStr = date.toISOString().split('T')[0];
    const slotKey = `${dateStr}-${time}`;
    const status = bookedSlots[slotKey] || { court: false, gourmet: false };
    const isOccupied = selectionType === 'court' ? status.court : status.gourmet;

    if (isAdmin) {
      const newSlots = { ...bookedSlots };
      const currentStatus = newSlots[slotKey] || { court: false, gourmet: false };
      if (selectionType === 'court') {
        newSlots[slotKey] = { ...currentStatus, court: !currentStatus.court };
      } else {
        newSlots[slotKey] = { ...currentStatus, gourmet: !currentStatus.gourmet };
      }
      onBookSlots(newSlots);
    } else if (!isOccupied) {
      setSelectedTempSlots(prev => {
        const next = new Set(prev);
        if (next.has(slotKey)) {
          next.delete(slotKey);
        } else {
          next.add(slotKey);
        }
        return next;
      });
    }
  };

  const handleConfirmReservation = () => {
    if (onPurchaseRequest && selectedTempSlots.size > 0) {
      const slotsToBuy = Array.from(selectedTempSlots).map((key: string) => {
        const [year, month, day, time] = key.split('-');
        return {
          date: new Date(`${year}-${month}-${day}T00:00:00`),
          time: time
        };
      });
      onPurchaseRequest(slotsToBuy, selectionType);
      onClose();
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const firstDayIdx = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const isDateInSelectedWeek = (date: Date) => {
    const start = getStartOfWeek(selectedDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return date >= start && date <= end;
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[60] flex flex-col transition-colors duration-500 ${isDark ? 'bg-stone-950' : 'bg-white'}`}>
      
      <div className={`px-6 py-4 flex justify-between items-center text-white shadow-md z-50 shrink-0 ${isAdmin ? 'bg-red-700' : 'bg-sand'}`}>
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter">
              {courtName}
            </h2>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest flex items-center gap-2">
              Semana de {weekDays[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} a {weekDays[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              <span className="flex items-center gap-1 opacity-50"><Cloud size={10} /> Live Data</span>
            </p>
          </div>
          
          <button 
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`p-2 rounded-full transition-all flex items-center gap-2 border-2 ${showDatePicker ? 'bg-white text-sand border-white' : 'hover:bg-white/20 border-transparent'}`}
          >
            <CalendarIcon size={24} />
            <span className="hidden md:inline text-xs font-black uppercase">Alterar Semana</span>
          </button>
        </div>

        <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X size={32} /></button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <AnimatePresence>
          {showDatePicker && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`absolute inset-x-0 top-0 z-40 p-6 md:p-10 border-b shadow-2xl transition-colors ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'}`}
            >
              <div className="max-w-xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h3 className={`text-xl font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-stone-800'}`}>
                    {monthName}
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={handlePrevMonth} className={`p-2 rounded-full hover:bg-stone-500/10 ${isDark ? 'text-white' : 'text-stone-700'}`}><ChevronLeft size={24} /></button>
                    <button onClick={handleNextMonth} className={`p-2 rounded-full hover:bg-stone-500/10 ${isDark ? 'text-white' : 'text-stone-700'}`}><ChevronRight size={24} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                    <div key={d} className={`text-center py-2 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>
                      {d}
                    </div>
                  ))}
                  {Array.from({ length: firstDayIdx }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const isInSelectedWeek = isDateInSelectedWeek(date);
                    const isPast = date < TODAY;

                    return (
                      <button
                        key={day}
                        disabled={isPast && !isAdmin}
                        onClick={() => handleDaySelect(day)}
                        className={`aspect-square flex items-center justify-center rounded-xl text-lg font-black transition-all transform relative
                          ${isPast && !isAdmin ? 'opacity-20 cursor-not-allowed grayscale' : 'hover:scale-105'}
                          ${isInSelectedWeek ? 'bg-sand text-white' : isDark ? 'bg-stone-800 text-white hover:bg-stone-700' : 'bg-stone-50 text-stone-800 hover:bg-white hover:shadow-md'}
                        `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`p-4 flex justify-center border-b gap-4 transition-colors z-20 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'}`}>
            <button
              onClick={() => { setSelectionType('court'); setSelectedTempSlots(new Set()); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                selectionType === 'court' ? 'bg-blue-600 text-white shadow-lg' : isDark ? 'bg-stone-800 text-stone-500' : 'bg-stone-100 text-stone-500'
              }`}
            >
              <Activity size={18} />
              Quadra
            </button>
            <button
              onClick={() => { setSelectionType('gourmet'); setSelectedTempSlots(new Set()); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                selectionType === 'gourmet' ? 'bg-purple-600 text-white shadow-lg' : isDark ? 'bg-stone-800 text-stone-500' : 'bg-stone-100 text-stone-500'
              }`}
            >
              <Utensils size={18} />
              Gourmet
            </button>
        </div>

        <div className={`flex-1 overflow-auto transition-colors pb-32 ${isDark ? 'bg-stone-950' : 'bg-stone-50'} custom-scrollbar`}>
          <div className="min-w-[800px] p-6">
            <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-2 mb-4 sticky top-0 z-10 py-2 transition-colors">
              <div /> 
              {weekDays.map((date, i) => {
                const isToday = date.toDateString() === new Date().toDateString();
                const isPastDay = date < TODAY;
                return (
                  <div key={i} className={`text-center p-3 rounded-2xl flex flex-col items-center justify-center transition-colors shadow-lg border border-white/20 
                    ${isPastDay ? 'bg-stone-800 opacity-40 grayscale' : 'bg-sand text-white'}`}>
                    <span className="text-[10px] uppercase font-black opacity-60">
                      {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </span>
                    <span className="text-xl font-black">
                      {date.getDate()}
                    </span>
                    {isToday && <div className="w-1.5 h-1.5 bg-white rounded-full mt-1"></div>}
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-[80px_repeat(7,1fr)] gap-2">
                  <div className={`flex items-center justify-center font-black text-sm opacity-50 ${isDark ? 'text-white' : 'text-stone-900'}`}>
                    {hour}
                  </div>
                  {weekDays.map((date, i) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const slotKey = `${dateStr}-${hour}`;
                    const status = bookedSlots[slotKey] || { court: false, gourmet: false };
                    const isOccupied = selectionType === 'court' ? status.court : status.gourmet;
                    const isSelected = selectedTempSlots.has(slotKey);
                    const isPast = date < TODAY;

                    return (
                      <button
                        key={`${dateStr}-${hour}`}
                        disabled={isPast && !isAdmin}
                        onClick={() => handleSlotClick(date, hour)}
                        className={`group relative h-16 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                          isPast && !isAdmin
                            ? 'bg-stone-200 border-stone-300 opacity-20 grayscale cursor-not-allowed'
                            : isOccupied 
                              ? 'bg-red-500 border-red-600 text-white shadow-md' 
                              : isSelected
                                ? 'bg-blue-500 border-blue-400 text-white scale-[1.02] shadow-xl z-10'
                                : isDark 
                                  ? 'bg-stone-900 border-stone-800 hover:bg-stone-800' 
                                  : 'bg-white border-stone-100 hover:bg-stone-50'
                        } ${!isPast || isAdmin ? 'active:scale-95' : ''}`}
                      >
                        <span className={`text-[9px] uppercase font-black tracking-widest ${isOccupied || isSelected ? 'opacity-100' : 'opacity-30'}`}>
                          {isPast && !isAdmin ? <Lock size={12} /> : isOccupied ? 'Ocupado' : isSelected ? 'Selecionado' : 'Livre'}
                        </span>
                        {!isOccupied && !isAdmin && !isSelected && !isPast && (
                          <span className="text-[7px] font-black uppercase text-sand opacity-0 group-hover:opacity-100 transition-opacity">Selecionar</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Barra Inferior de Confirmação (Multi-seleção) */}
        <AnimatePresence>
          {selectedTempSlots.size > 0 && !isAdmin && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="absolute bottom-0 inset-x-0 p-6 z-50 pointer-events-none"
            >
              <div className="max-w-xl mx-auto bg-stone-900 border border-white/10 p-4 rounded-3xl shadow-2xl pointer-events-auto flex items-center justify-between backdrop-blur-xl">
                <div className="flex items-center gap-4 px-4">
                  <div className="bg-blue-500 text-white p-3 rounded-2xl">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <p className="text-white font-black text-lg leading-tight uppercase tracking-tighter">
                      {selectedTempSlots.size} {selectedTempSlots.size === 1 ? 'Horário' : 'Horários'}
                    </p>
                    <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">
                      Total: R$ {selectedTempSlots.size * (selectionType === 'court' ? 80 : 120)},00
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleConfirmReservation}
                  className="bg-sand hover:bg-sand-dark text-white font-black py-4 px-8 rounded-2xl shadow-lg transition-all transform active:scale-95 uppercase tracking-widest text-xs"
                >
                  RESERVAR AGORA
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isAdmin && (
          <div className="fixed bottom-8 right-8 z-50">
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-red-600 text-white shadow-2xl font-black uppercase text-[10px] tracking-widest border-2 border-white/20 animate-pulse">
              <ShieldCheck size={16} />
              Gestão Manual Ativada
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
