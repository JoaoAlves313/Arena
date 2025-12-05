export interface CourtImage {
  id: number;
  url: string;
  title: string;
  description: string;
}

export interface BookingForm {
  date: string;
  time: string;
  courtId: 'quadra1' | 'quadra2';
  sport: 'volei' | 'futevolei' | 'frescobol';
  includeBall: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}