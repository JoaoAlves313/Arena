
import React, { useState } from 'react';
import { X, CheckCircle, CreditCard, QrCode, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckoutModalProps {
  data: { slots: { date: Date; time: string }[]; type: 'court' | 'gourmet' } | null;
  onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ data, onClose }) => {
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');

  if (!data) return null;

  const unitPrice = data.type === 'court' ? 80 : 120;
  const totalPrice = data.slots.length * unitPrice;
  const formattedPrice = `R$ ${totalPrice},00`;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-stone-900 border border-stone-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-stone-500 hover:text-white transition-colors z-10">
          <X size={28} />
        </button>

        <div className="p-8 md:p-12 overflow-y-auto max-h-[90vh] custom-scrollbar">
          <AnimatePresence mode="wait">
            {step === 'info' && (
              <motion.div 
                key="info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-sand/10 rounded-full flex items-center justify-center text-sand mb-6">
                  <CreditCard size={40} />
                </div>
                <h2 className="text-3xl font-black uppercase text-white mb-2 tracking-tighter">CONFIRMAR RESERVAS</h2>
                <p className="text-stone-400 mb-8 font-medium italic">Você selecionou {data.slots.length} horário(s)</p>
                
                <div className="w-full bg-stone-950 border border-stone-800 rounded-3xl p-6 text-left space-y-4 mb-8">
                  <div className="flex justify-between items-center border-b border-stone-900 pb-3">
                    <span className="text-[10px] font-black uppercase text-stone-500">Espaço</span>
                    <span className="font-bold text-sand uppercase">{data.type === 'court' ? 'Quadra Principal' : 'Área Gourmet'}</span>
                  </div>
                  
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    <span className="text-[10px] font-black uppercase text-stone-500 block">Horários Selecionados</span>
                    {data.slots.map((slot, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-stone-900/50 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-sand" />
                          <span className="text-xs font-bold text-white uppercase">
                            {slot.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                        <span className="font-black text-white text-sm">{slot.time}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-stone-800">
                    <span className="text-[10px] font-black uppercase text-stone-500">Valor Total</span>
                    <span className="text-2xl font-black text-white">{formattedPrice}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-left bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl mb-8">
                    <AlertCircle className="text-blue-500 shrink-0" size={18} />
                    <p className="text-[10px] text-blue-400 leading-tight">Suas reservas serão processadas simultaneamente. Após o pagamento PIX, você receberá o voucher único.</p>
                </div>

                <button 
                  onClick={() => setStep('payment')}
                  className="w-full bg-sand hover:bg-sand-dark text-white font-black py-5 rounded-2xl shadow-xl transition-all transform active:scale-95 uppercase tracking-widest"
                >
                  IR PARA O PAGAMENTO
                </button>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div 
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center text-center"
              >
                <QrCode className="text-sand mb-6" size={64} />
                <h2 className="text-3xl font-black uppercase text-white mb-2 tracking-tighter">PAGAMENTO PIX</h2>
                <p className="text-stone-400 mb-8 font-medium">Escaneie para pagar {formattedPrice}</p>
                
                <div className="w-56 h-56 bg-white p-4 rounded-3xl mb-8 shadow-2xl">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ARENAPENAAREIA-SIMULACAO-MULTI" alt="QR Code PIX" className="w-full h-full grayscale" />
                </div>

                <button 
                  onClick={() => setStep('success')}
                  className="w-full bg-white text-stone-900 font-black py-5 rounded-2xl shadow-xl transition-all transform active:scale-95 uppercase tracking-widest mb-4"
                >
                  COPIAR CHAVE PIX
                </button>
                <button 
                  onClick={() => setStep('success')}
                  className="text-stone-500 font-black text-xs uppercase hover:text-white transition-colors"
                >
                  JÁ REALIZEI O PAGAMENTO
                </button>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-10"
              >
                <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-8 animate-bounce">
                  <CheckCircle size={56} />
                </div>
                <h2 className="text-3xl font-black uppercase text-white mb-4 tracking-tighter">RESERVAS CONFIRMADAS!</h2>
                <p className="text-stone-400 mb-10 leading-relaxed">
                    Seus {data.slots.length} horários foram reservados com sucesso. <br/>Apresente seu CPF na recepção da Arena Pé na Areia.
                </p>
                <button 
                  onClick={onClose}
                  className="w-full bg-sand text-white font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest"
                >
                  VOLTAR PARA A ARENA
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
