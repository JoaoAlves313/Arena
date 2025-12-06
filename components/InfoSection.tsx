import React from 'react';

const InfoSection: React.FC = () => {
  return (
    <section id="sobre" className="py-24 bg-white transition-colors duration-500">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-12">
          Nossa Estrutura
        </h2>
        
        <div className="space-y-12 text-lg text-stone-600 leading-relaxed text-justify md:text-center">
          <div>
            <p className="mb-6">
              A Arena Pé na Areia nasceu da paixão pelo esporte ao ar livre. Criamos um ambiente que une a competitividade do vôlei profissional com o relaxamento de um dia de praia. Nossas instalações contam com drenagem de última geração, garantindo jogos mesmo após chuvas fortes.
            </p>
          </div>

          <div className="border-t border-stone-100 pt-12">
            <h3 className="text-2xl font-semibold text-stone-700 mb-6">Conheça Nossas Quadras</h3>
            <ul className="space-y-8">
              <li>
                <strong className="block text-stone-800 text-xl mb-2">Quadra Principal - Sunset</strong>
                <span className="block">A joia da nossa arena. Com areia fina importada que não esquenta, é o palco ideal para partidas profissionais e torneios. Possui iluminação LED de alta performance para jogos noturnos inesquecíveis.</span>
              </li>
              <li>
                <strong className="block text-stone-800 text-xl mb-2">Arena Treino A</strong>
                <span className="block">Projetada para aprendizado e evolução. Um espaço reservado e mais silencioso, perfeito para grupos de iniciantes, aulas táticas ou para quem quer focar na técnica sem distrações.</span>
              </li>
              <li>
                <strong className="block text-stone-800 text-xl mb-2">Quadra VIP Lounge</strong>
                <span className="block">Para quem busca exclusividade. Esta quadra oferece acesso direto ao bar, cadeiras de praia premium e ducha privativa, combinando o esporte com o lazer social.</span>
              </li>
            </ul>
          </div>

          {/* Texto Simples */}
          <div className="flex flex-col items-center justify-center">
            <div className="pt-8 text-stone-500 italic select-none">
              "Aqui, o foco é o jogo, a diversão e a conexão com a areia."
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;