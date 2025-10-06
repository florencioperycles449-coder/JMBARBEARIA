import { User, Service, Appointment, Review } from './types';

// Chaves do localStorage
const STORAGE_KEYS = {
  CURRENT_USER: 'jm_barbearia_current_user',
  USERS: 'jm_barbearia_users',
  SERVICES: 'jm_barbearia_services',
  APPOINTMENTS: 'jm_barbearia_appointments',
  REVIEWS: 'jm_barbearia_reviews',
} as const;

// Serviços padrão da barbearia
const DEFAULT_SERVICES: Service[] = [
  {
    id: '1',
    name: 'Corte Masculino',
    description: 'Corte moderno e personalizado',
    price: 25,
    duration: 30,
    category: 'corte',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Barba Completa',
    description: 'Aparar e modelar a barba',
    price: 20,
    duration: 25,
    category: 'barba',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Corte + Barba',
    description: 'Combo completo',
    price: 40,
    duration: 50,
    category: 'combo',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Sobrancelha',
    description: 'Design e limpeza',
    price: 15,
    duration: 15,
    category: 'outros',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Relaxamento',
    description: 'Tratamento capilar',
    price: 35,
    duration: 45,
    category: 'outros',
    createdAt: new Date().toISOString()
  }
];

// Usuário barbeiro padrão
const DEFAULT_BARBER: User = {
  id: 'barber_1',
  name: 'João Marcos',
  email: 'joao@jmbarbearia.com',
  phone: '(11) 99999-9999',
  role: 'barber',
  createdAt: new Date().toISOString()
};

// Funções de localStorage
export const storage = {
  // Usuários
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  getUsers: (): User[] => {
    if (typeof window === 'undefined') return [];
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    const parsedUsers = users ? JSON.parse(users) : [];
    
    // Garantir que o barbeiro padrão existe
    const hasBarber = parsedUsers.some((u: User) => u.role === 'barber');
    if (!hasBarber) {
      parsedUsers.push(DEFAULT_BARBER);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(parsedUsers));
    }
    
    return parsedUsers;
  },

  addUser: (user: User) => {
    if (typeof window === 'undefined') return;
    const users = storage.getUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // Serviços
  getServices: (): Service[] => {
    if (typeof window === 'undefined') return DEFAULT_SERVICES;
    const services = localStorage.getItem(STORAGE_KEYS.SERVICES);
    if (!services) {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
      return DEFAULT_SERVICES;
    }
    return JSON.parse(services);
  },

  addService: (service: Service) => {
    if (typeof window === 'undefined') return;
    const services = storage.getServices();
    services.push(service);
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  },

  updateService: (serviceId: string, updates: Partial<Service>) => {
    if (typeof window === 'undefined') return;
    const services = storage.getServices();
    const index = services.findIndex(s => s.id === serviceId);
    if (index !== -1) {
      services[index] = { ...services[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    }
  },

  deleteService: (serviceId: string) => {
    if (typeof window === 'undefined') return;
    const services = storage.getServices();
    const filteredServices = services.filter(s => s.id !== serviceId);
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(filteredServices));
  },

  // Agendamentos
  getAppointments: (): Appointment[] => {
    if (typeof window === 'undefined') return [];
    const appointments = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return appointments ? JSON.parse(appointments) : [];
  },

  addAppointment: (appointment: Appointment) => {
    if (typeof window === 'undefined') return;
    const appointments = storage.getAppointments();
    appointments.push(appointment);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  },

  updateAppointment: (appointmentId: string, updates: Partial<Appointment>) => {
    if (typeof window === 'undefined') return;
    const appointments = storage.getAppointments();
    const index = appointments.findIndex(a => a.id === appointmentId);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    }
  },

  // Avaliações
  getReviews: (): Review[] => {
    if (typeof window === 'undefined') return [];
    const reviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return reviews ? JSON.parse(reviews) : [];
  },

  addReview: (review: Review) => {
    if (typeof window === 'undefined') return;
    const reviews = storage.getReviews();
    reviews.push(review);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }
};

// Função para gerar horários disponíveis
export const generateTimeSlots = (date: string, appointments: Appointment[]): string[] => {
  const slots = [];
  const startHour = 8; // 8h
  const endHour = 18; // 18h
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Verificar se o horário já está ocupado
      const isBooked = appointments.some(apt => 
        apt.date === date && 
        apt.time === time && 
        apt.status !== 'cancelado'
      );
      
      if (!isBooked) {
        slots.push(time);
      }
    }
  }
  
  return slots;
};

// Função para gerar ID único
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};