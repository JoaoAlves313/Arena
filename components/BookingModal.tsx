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
  isDark?: boolean;
}

type BookingStep = 'calendar' | 'form' | 'payment' | 'success';
type SelectionMode = 'court' | 'gourmet';

interface TimeSlot {
  date: Date;
  time: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, courtName, bookedSlots, onBookSlots, isAdmin = false, isDark = false }) => {
  const START_DATE_LIMIT = new Date(2025, 11, 29); // 29 Dez 2025
  
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(START_DATE_LIMIT); 
  const [step, setStep] = useState<BookingStep>('calendar');
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('court');
  const [selectedCourtSlots, setSelectedCourtSlots] = useState<TimeSlot[]>([]);
  const [selectedGourmetSlots, setSelectedGourmetSlots] = useState<TimeSlot[]>([]);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState<BookingForm>({
    courtSlots: [],
    gourmetSlots: [],
    sport: 'volei',
    includeBall: false
  });

  const PIX_CODE = "00020126580014BR.GOV.BCB.PIX0136a1b2c3d4-e5f6-4789-8012-3456789012345204000053039865802BR5913ARENA PE AREIA6008BRASIL62070503***6304E2CA";
  const COURT_PRICE = 120;
  const GOURMET_PRICE = 150;
  const BALL_PRICE = 25; 
  
  const courtHours = formData.courtSlots.length;
  const gourmetHours = formData.gourmetSlots.length;
  
  let totalPrice = (courtHours * COURT_PRICE) + (gourmetHours * GOURMET_PRICE);
  if (courtHours > 0 && formData.includeBall) totalPrice += BALL_PRICE;

  useEffect(() => {
    if (isOpen) {
      setStep('calendar');
      setSelectionMode('court');
      setCurrentWeekStart(new Date(2025, 11, 29));
      setFormData({ courtSlots: [], gourmetSlots: [], sport: 'volei', includeBall: false });
      setSelectedCourtSlots([]);
      setSelectedGourmetSlots([]);
      setCopied(false);
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
    const dateStr = date.toISOString().split('T')[0];
    const slotKey = `${dateStr}-${time}`;
    const status = bookedSlots[slotKey] || { court: false, gourmet: false };

    if (isAdmin) {
        const newSlots = { ...bookedSlots };
        const currentStatus = newSlots[slotKey] || { court: false, gourmet: false };
        if (selectionMode === 'court') newSlots[slotKey] = { ...currentStatus, court: !currentStatus.court };
        else newSlots[slotKey] = { ...currentStatus, gourmet: !currentStatus.gourmet };
        onBookSlots(newSlots);
        return;
    }

    if (selectionMode === 'court' && status?.court) return;
    if (selectionMode === 'gourmet' && status?.gourmet) return;

    const targetList = selectionMode === 'court' ? selectedCourtSlots : selectedGourmetSlots;
    const setTargetList = selectionMode === 'court' ? setSelectedCourtSlots : setSelectedGourmetSlots;

    const isAlreadySelected = targetList.some(s => s.date.toISOString().split('T')[0] === dateStr && s.time === time);

    if (isAlreadySelected) {
      setTargetList(targetList.filter(s => !(s.date.toISOString().split('T')[0] === dateStr && s.time === time)));
    } else {
      setTargetList([...targetList, { date, time }].sort((a, b) => a.date.getTime() - b.date.getTime() || a.time.localeCompare(b.time)));
    }
  };

  const handleConfirmPayment = () => {
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
    setTimeout(() => onClose(), 6000);
  };

  const getWeekLabel = () => {
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return `${currentWeekStart.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})} a ${endOfWeek.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}`;
  };

  const totalSelectedCount = selectedCourtSlots.length + selectedGourmetSlots.length;

  return (
    <div className={`fixed inset-0 z-[60] animate-fade-in flex flex-col transition-colors duration-500 ${isDark ? 'bg-stone-950' : 'bg-white'}`}>
      
      {/* Header Fixo */}
      <div className={`px-6 py-4 flex justify-between items-center text-white shadow-md z-20 shrink-0 ${isAdmin ? 'bg-red-700' : 'bg-sand'}`}>
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Calendar size={28} />
          {isAdmin ? `Gerenciamento - ${courtName}` : step === 'calendar' ? `Agenda - ${courtName}` : 'Finalizar Reserva'}
        </h2>
        <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X size={32} /></button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <AnimatePresence mode="wait">
        
        {step === 'calendar' && (
          <motion.div key="calendar" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full flex flex-col">
            
            {/* Tabs */}
            <div className={`p-4 flex justify-center border-b transition-colors duration-500 gap-4 pt-6 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'}`}>
                <button
                  onClick={() => setSelectionMode('court')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                    selectionMode === 'court' ? 'bg-blue-500 text-white shadow-lg' : isDark ? 'bg-stone-800 text-stone-500' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  <Activity size={20} />
                  Quadra
                  {selectedCourtSlots.length > 0 && <span className="bg-white/20 px-2 rounded-full text-xs">{selectedCourtSlots.length}h</span>}
                </button>
                <button
                  onClick={() => setSelectionMode('gourmet')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                    selectionMode === 'gourmet' ? 'bg-purple-500 text-white shadow-lg' : isDark ? 'bg-stone-800 text-stone-500' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  <Utensils size={20} />
                  Gourmet
                  {selectedGourmetSlots.length > 0 && <span className="bg-white/20 px-2 rounded-full text-xs">{selectedGourmetSlots.length}h</span>}
                </button>
            </div>

            {/* Navigation */}
            <div className={`p-3 flex justify-between items-center shadow-sm border-b shrink-0 transition-colors duration-500 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'}`}>
              <button onClick={handlePrevWeek} className={`p-2 rounded-full ${isDark ? 'text-white' : 'text-stone-700'}`}><ChevronLeft size={28} /></button>
              <div className={`text-base font-bold uppercase tracking-wider ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{getWeekLabel()}</div>
              <button onClick={handleNextWeek} className={`p-2 rounded-full ${isDark ? 'text-white' : 'text-stone-700'}`}><ChevronRight size={28} /></button>
            </div>

            {/* Grid */}
            <div className={`flex-1 overflow-auto p-4 sm:p-8 transition-colors duration-500 ${isDark ? 'bg-stone-950' : 'bg-stone-50'}`}>
              <div className="grid grid-cols-7 gap-3 min-w-[900px]">
                {currentWeekDays.map((day, idx) => (
                  <div key={idx} className="flex flex-col gap-3">
                    <div className={`text-center p-3 rounded-2xl font-bold shadow-sm ${day.getDay() % 6 === 0 ? 'bg-sand text-white' : isDark ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border'}`}>
                      <div className="text-xs uppercase opacity-70">{day.toLocaleDateString('pt-BR', { weekday: 'short' })}</div>
                      <div className="text-2xl">{day.getDate()}</div>
                    </div>
                    {hours.map((hour) => {
                      const dateStr = day.toISOString().split('T')[0];
                      const status = bookedSlots[`${dateStr}-${hour}`] || { court: false, gourmet: false };
                      const isOccupied = selectionMode === 'court' ? status.court : status.gourmet;
                      const isSelected = (selectionMode === 'court' ? selectedCourtSlots : selectedGourmetSlots).some(s => s.date.toISOString().split('T')[0] === dateStr && s.time === hour);
                      
                      let btnClass = isDark ? "bg-stone-900 border-stone-800 text-stone-400" : "bg-white border-stone-200 text-stone-600";
                      if (isOccupied) btnClass = "bg-red-500/10 border-red-500/20 text-red-500 cursor-not-allowed";
                      if (isSelected) btnClass = selectionMode === 'court' ? "bg-blue-500 text-white border-blue-500" : "bg-purple-500 text-white border-purple-500";

                      return (
                        <button key={hour} onClick={() => handleSlotClick(day, hour)} className={`py-4 rounded-xl border text-lg font-bold transition-all ${btnClass}`}>
                          {hour}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Action */}
            {!isAdmin && totalSelectedCount > 0 && (
              <div className={`p-6 border-t shadow-2xl transition-colors duration-500 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white'}`}>
                 <button onClick={() => {
                   setFormData(prev => ({...prev, courtSlots: selectedCourtSlots.map(s=>({date:s.date.toISOString().split('T')[0], time:s.time})), gourmetSlots: selectedGourmetSlots.map(s=>({date:s.date.toISOString().split('T')[0], time:s.time}))}));
                   setStep('form');
                 }} className="w-full bg-sand hover:bg-sand-dark text-white py-4 rounded-2xl text-xl font-bold shadow-lg">
                   Avançar para Reserva (R$ {totalPrice})
                 </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Form e Payment omitidos por brevidade mas seguem a mesma lógica isDark */}
        {(step === 'form' || step === 'payment' || step === 'success') && (
           <div className={`flex-1 flex flex-col items-center justify-center p-8 transition-colors duration-500 ${isDark ? 'bg-stone-950 text-white' : 'bg-stone-50 text-stone-800'}`}>
              <div className={`max-w-md w-full p-8 rounded-3xl shadow-2xl border ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'}`}>
                 {step === 'form' && (
                    <div className="space-y-6">
                       <h3 className="text-2xl font-bold text-center">Confirmar Agendamento</h3>
                       <div className="space-y-2">
                          <p>Valor Total: <span className="font-bold text-sand">R$ {totalPrice}</span></p>
                          <p>Total de Horas: {totalSelectedCount}h</p>
                       </div>
                       <button onClick={() => setStep('payment')} className="w-full bg-stone-800 text-white py-4 rounded-xl font-bold">Ir para Pagamento</button>
                    </div>
                 )}
                 {step === 'payment' && (
                    <div className="text-center space-y-6">
                       <QrCode size={180} className="mx-auto text-sand" />
                       <h3 className="text-xl font-bold">Pagamento via PIX</h3>
                       <button onClick={handleConfirmPayment} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold">Confirmar Pagamento</button>
                    </div>
                 )}
                 {step === 'success' && (
                    <div className="text-center space-y-6">
                       <div className="bg-green-100 text-green-600 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto"><CheckCircle size={48} /></div>
                       <h3 className="text-3xl font-bold">Reserva Solicitada!</h3>
                       <p className="text-stone-500">Aguarde a confirmação por WhatsApp.</p>
                    </div>
                 )}
              </div>
           </div>
        )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookingModal;