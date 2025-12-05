import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, X, Minimize2, Maximize2 } from 'lucide-react';
import { generateCoachResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

const AICoach: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Olá! Sou o Treinador Sol. Quer dicas de saque ou ajuda para agendar uma quadra? 🏐',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseText = await generateCoachResponse(inputValue);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-sand hover:bg-sand-dark text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 z-40 flex items-center gap-2 group"
      >
        <MessageSquare size={24} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap font-medium">
          Fale com o Treinador
        </span>
      </button>
    );
  }

  return (
    <div 
      className={`fixed right-4 z-50 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden transition-all duration-300 flex flex-col
      ${isMinimized ? 'bottom-4 w-72 h-14' : 'bottom-4 w-96 h-[500px] sm:bottom-6 sm:right-6'}
      `}
    >
      {/* Header */}
      <div 
        className="bg-sand p-4 flex justify-between items-center cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2 text-white">
          <Sparkles size={18} />
          <h3 className="font-bold">Treinador Sol IA</h3>
        </div>
        <div className="flex items-center gap-2 text-white/80">
          <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="hover:text-white">
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="hover:text-white">
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-stone-50 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-sand text-white rounded-tr-none'
                      : 'bg-white text-stone-700 rounded-tl-none border border-stone-100'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-stone-100 shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-sand rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-sand rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-sand rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-stone-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Pergunte sobre regras, dicas..."
                className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sand text-stone-700 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="p-2 bg-sand hover:bg-sand-dark text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AICoach;