import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateCoachResponse = async (userMessage: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `
      Você é o 'Treinador Sol', um assistente virtual especialista em vôlei de areia e gerenciador da 'Arena Sol & Areia'.
      
      Suas funções:
      1. Tirar dúvidas sobre regras de vôlei de praia (oficiais FIVB).
      2. Dar dicas técnicas (saque, manchete, levantamento).
      3. Ajudar com o agendamento (explique que o agendamento é feito clicando nos botões das imagens).
      4. Ser sempre motivador, energético e usar emojis relacionados a praia e esportes.
      
      Informações da Arena:
      - Horário: 06:00 às 23:00.
      - Preço: R$ 80,00/hora.
      - Localização: Praia Central.
      - Equipamentos inclusos (bola e rede).

      Responda de forma concisa e amigável.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: userMessage,
      config: {
        systemInstruction,
      }
    });

    return response.text || "Desculpe, deu areia na minha engrenagem. Tente novamente!";
  } catch (error) {
    console.error("Erro ao contatar Gemini:", error);
    return "Estou temporariamente indisponível para treinos táticos. Tente mais tarde.";
  }
};
