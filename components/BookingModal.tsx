import React, { useState, useEffect } from 'react';
import { X, Calendar, ChevronLeft, ChevronRight, Activity, Utensils, Lock, ShieldCheck } from 'lucide-react';
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
}

type SelectionMode = 'court' | 'gourmet';

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, courtName, bookedSlots, onBookSlots, isAdmin = false, isDark = false }) => {
  const START_DATE_LIMIT = new Date(2025, 11, 29); // 29 Dez 2025
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(START_DATE_LIMIT); 
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('court');

  useEffect(() => {
    if (isOpen) {
      setCurrentWeekStart(new Date(2025, 11, 29));
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; }
  }, [isOpen]);

  if (!isOpen) return null;

  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

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

  const handleSlotClick = (date: Date, time: string) => {
    // SOMENTE PROPRIETÁRIO PODE ALTERAR
    if (!isAdmin) return;

    const dateStr = date.toISOString().split('T')[0];
    const slotKey = `${dateStr}-${time}`;
    const newSlots = { ...bookedSlots };
    const currentStatus = newSlots[slotKey] || { court: false, gourmet: false };
    
    if (selectionMode === 'court') {
      newSlots[slotKey] = { ...currentStatus, court: !currentStatus.court };
    } else {
      newSlots[slotKey] = { ...currentStatus, gourmet: !currentStatus.gourmet };
    }
    
    onBookSlots(newSlots);
  };

  const getWeekLabel = () => {
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return `${currentWeekStart.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})} a ${endOfWeek.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}`;
  };

  return (
    <div className={`fixed inset-0 z-[60] animate-fade-in flex flex-col transition-colors duration-500 ${isDark ? 'bg-stone-950' : 'bg-white'}`}>
      
      {/* Header Fixo */}
      <div className={`px-6 py-4 flex justify-between items-center text-white shadow-md z-20 shrink-0 ${isAdmin ? 'bg-red-700' : 'bg-sand'}`}>
        <div className="flex flex-col">
           <h2 className="text-xl md:text-2xl font-black flex items-center gap-3 uppercase tracking-tighter">
            <Calendar size={28} />
            {isAdmin ? `Gerenciar: ${courtName}` : `Agenda: ${courtName}`}
          </h2>
          {!isAdmin && <span className="text-xs opacity-80 font-bold ml-10">APENAS VISUALIZAÇÃO</span>}
        </div>
        <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X size={32} /></button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative">
          <div className="h-full flex flex-col">
            
            {/* Tabs de Seleção de Visualização */}
            <div className={`p-4 flex justify-center border-b transition-colors duration-500 gap-4 pt-6 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'}`}>
                <button
                  onClick={() => setSelectionMode('court')}
                  className={`flex items-center gap-2 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all ${
                    selectionMode === 'court' ? 'bg-blue-600 text-white shadow-xl scale-105' : isDark ? 'bg-stone-800 text-stone-500 hover:text-stone-300' : 'bg-stone-100 text-stone-500 hover:text-stone-700'
                  }`}
                >
                  <Activity size={18} />
                  Grade da Quadra
                </button>
                <button
                  onClick={() => setSelectionMode('gourmet')}
                  className={`flex items-center gap-2 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all ${
                    selectionMode === 'gourmet' ? 'bg-purple-600 text-white shadow-xl scale-105' : isDark ? 'bg-stone-800 text-stone-500 hover:text-stone-300' : 'bg-stone-100 text-stone-500 hover:text-stone-700'
                  }`}
                >
                  <Utensils size={18} />
                  Espaço Gourmet
                </button>
            </div>

            {/* Navegação de Datas */}
            <div className={`p-4 flex justify-between items-center shadow-sm border-b shrink-0 transition-colors duration-500 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'}`}>
              <button onClick={handlePrevWeek} className={`p-3 rounded-full hover:bg-stone-500/10 ${isDark ? 'text-white' : 'text-stone-700'}`}><ChevronLeft size={28} /></button>
              <div className={`text-lg font-black uppercase tracking-[0.2em] ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{getWeekLabel()}</div>
              <button onClick={handleNextWeek} className={`p-3 rounded-full hover:bg-stone-500/10 ${isDark ? 'text-white' : 'text-stone-700'}`}><ChevronRight size={28} /></button>
            </div>

            {/* Admin Banner */}
            {isAdmin && (
               <div className="bg-red-500/10 text-red-500 py-2 text-center text-xs font-black uppercase tracking-widest border-b border-red-500/20">
                  <span className="animate-pulse">Modo de Edição Ativo: Clique nos horários para alternar disponibilidade</span>
               </div>
            )}

            {/* Grade de Horários */}
            <div className={`flex-1 overflow-auto p-4 sm:p-10 transition-colors duration-500 ${isDark ? 'bg-stone-950' : 'bg-stone-50'}`}>
              <div className="grid grid-cols-7 gap-4 min-w-[1000px]">
                {currentWeekDays.map((day, idx) => (
                  <div key={idx} className="flex flex-col gap-4">
                    <div className={`text-center p-4 rounded-3xl font-black shadow-lg transition-transform hover:scale-105 ${day.getDay() % 6 === 0 ? 'bg-sand text-white' : isDark ? 'bg-stone-900 text-white border border-stone-800' : 'bg-white text-stone-800 border'}`}>
                      <div className="text-xs uppercase opacity-60 mb-1">{day.toLocaleDateString('pt-BR', { weekday: 'short' })}</div>
                      <div className="text-3xl tracking-tighter">{day.getDate()}</div>
                    </div>
                    {hours.map((hour) => {
                      const dateStr = day.toISOString().split('T')[0];
                      const status = bookedSlots[`${dateStr}-${hour}`] || { court: false, gourmet: false };
                      const isOccupied = selectionMode === 'court' ? status.court : status.gourmet;
                      
                      let btnClass = "cursor-default";
                      let label = "Disponível";
                      
                      if (isOccupied) {
                        btnClass = "bg-red-500 text-white border-red-600 shadow-lg scale-95 opacity-90";
                        label = "Ocupado";
                      } else {
                        btnClass = isDark 
                          ? "bg-stone-900 border-stone-800 text-stone-500 hover:border-stone-600" 
                          : "bg-white border-stone-200 text-stone-400 hover:border-stone-300";
                      }

                      if (isAdmin) {
                        btnClass += " cursor-pointer active:scale-90 transition-all hover:shadow-md";
                        if (!isOccupied) btnClass += isDark ? " hover:bg-stone-800" : " hover:bg-stone-50";
                      }

                      return (
                        <button 
                          key={hour} 
                          disabled={!isAdmin}
                          onClick={() => handleSlotClick(day, hour)} 
                          className={`group relative py-6 rounded-2xl border-2 text-xl font-black transition-all ${btnClass}`}
                        >
                          {hour}
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-tighter opacity-0 group-hover:opacity-40">
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer de Informação */}
            <div className={`p-8 border-t flex flex-col md:flex-row items-center justify-between gap-6 transition-colors duration-500 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white'}`}>
                <div className="flex gap-8">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-md bg-red-500"></div>
                    <span className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>Ocupado</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border-2 ${isDark ? 'border-stone-700 bg-stone-800' : 'border-stone-200 bg-white'}`}></div>
                    <span className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>Disponível</span>
                  </div>
                </div>
                
                {!isAdmin ? (
                  <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed ${isDark ? 'border-stone-700' : 'border-stone-100'}`}>
                    <Lock size={20} className="text-sand" />
                    <p className={`text-sm font-medium ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                      Deseja reservar um horário? <span className="font-bold text-sand">Entre em contato via WhatsApp.</span>
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-green-500/10 text-green-500 border border-green-500/20">
                    <ShieldCheck size={20} />
                    <p className="text-sm font-black uppercase tracking-widest">Suas alterações são salvas automaticamente</p>
                  </div>
                )}
            </div>
          </div>
      </div>
    </div>
  );
};

export default BookingModal;