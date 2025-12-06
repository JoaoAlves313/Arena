export interface CourtImage {
  id: number;
  url: string;
  title: string;
  description: string;
}

export interface BookingSlot {
  date: string;
  time: string;
}

export interface BookingForm {
  courtSlots: BookingSlot[];
  gourmetSlots: BookingSlot[];
  sport: 'volei' | 'futevolei' | 'frescobol';
  includeBall: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// Registro de horários ocupados: chave "DATA-HORA" -> { court: bool, gourmet: bool }
export type BookedSlots = Record<string, { court: boolean; gourmet: boolean }>;