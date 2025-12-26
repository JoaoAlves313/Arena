
import React from 'react';
import { ShieldCheck, Droplets, Zap, Moon, Sun } from 'lucide-react';

interface InfoSectionProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
}

const InfoSection: React.FC<InfoSectionProps> = ({ isDark, onToggleTheme }) => {
  const features = [
    { 
      icon: <Droplets />, 
      title: "Drenagem 4.0", 
      desc: "Sistema que permite o jogo 15 minutos após chuvas intensas.",
      hasToggle: true
    },
    { 
      icon: <ShieldCheck />, 
      title: "Areia Especial", 
      desc: "Grãos arredondados que não agridem a pele e não retêm calor." 
    },
    { 
      icon: <Zap />, 
      title: "Iluminação TV", 
      desc: "Refletores LED com zero sombra, perfeitos para fotos e vídeos." 
    }
  ];

  return (
    <section id="sobre" className={`py-32 transition-colors duration-500 ${isDark ? 'bg-stone-950' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
          {features.map((f, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="bg-sand/10 text-sand p-6 rounded-3xl mb-6 transition-transform group-hover:scale-110 duration-500">
                {React.cloneElement(f.icon as React.ReactElement<any>, { size: 32 })}
              </div>
              
              <div className="relative flex items-center justify-center mb-3">
                <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                  {f.title}
                </h4>
                
                {f.hasToggle && onToggleTheme && (
                  <div className="absolute -right-16 top-1/2 -translate-y-1/2">
                    <button 
                      onClick={onToggleTheme}
                      className={`p-2 rounded-lg border-2 border-dashed transition-all hover:scale-110 active:scale-95 ${
                        isDark 
                        ? 'border-blue-500/50 text-blue-400 bg-blue-500/5' 
                        : 'border-stone-300 text-stone-600 bg-stone-50'
                      }`}
                      title="Alternar fundo (Preto/Branco)"
                    >
                      {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                  </div>
                )}
              </div>
              
              <p className={`max-w-[250px] ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <div className={`space-y-16 text-center transition-colors ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
            <div>
              <h2 className={`text-4xl md:text-5xl font-black mb-10 transition-colors ${isDark ? 'text-white' : 'text-stone-900'}`}>
                TECNOLOGIA A SERVIÇO DO <span className="text-sand">ESPORTE</span>
              </h2>
              <p className="text-xl md:text-2xl leading-relaxed font-light">
                Esqueça tudo o que você conhece sobre quadras de areia. Nossa arena foi projetada por atletas para oferecer a melhor experiência biomecânica, reduzindo o impacto nas articulações e maximizando a performance do seu salto.
              </p>
            </div>

            <div className={`pt-16 border-t ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
              <blockquote className="relative">
                <span className="text-8xl text-sand/20 absolute -top-10 left-1/2 -translate-x-1/2 font-serif select-none">“</span>
                <p className={`text-2xl italic font-serif leading-relaxed ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  "A melhor areia que já joguei. É como flutuar durante o jogo, sem se preocupar com o calor ou com o impacto."
                </p>
                <cite className="block mt-6 not-italic font-bold text-sand uppercase tracking-widest text-sm">— Ricardo Santos, Atleta Profissional</cite>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
