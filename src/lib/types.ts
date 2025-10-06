export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'client' | 'barber';
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // em minutos
  category: 'corte' | 'barba' | 'combo' | 'outros';
  createdAt: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: string;
  time: string;
  status: 'agendado' | 'confirmado' | 'concluido' | 'cancelado';
  notes?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  clientId: string;
  clientName: string;
  appointmentId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}