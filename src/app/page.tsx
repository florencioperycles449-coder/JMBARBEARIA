'use client';

import { useState, useEffect } from 'react';
import { User, Service, Appointment, Review } from '@/lib/types';
import { storage, generateTimeSlots, generateId } from '@/lib/utils';
import { 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Phone, 
  Mail, 
  Star, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Menu,
  LogOut,
  Settings,
  History,
  MessageSquare,
  MapPin,
  Save,
  DollarSign,
  Timer
} from 'lucide-react';

export default function JMBarbearia() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'home' | 'services' | 'booking' | 'appointments' | 'admin' | 'reviews' | 'manage-services'>('login');
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Estados do formulário
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  // Estados para gerenciamento de serviços
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState({ name: '', description: '', price: 0, duration: 30 });
  const [showAddService, setShowAddService] = useState(false);

  useEffect(() => {
    const user = storage.getCurrentUser();
    setCurrentUser(user);
    setServices(storage.getServices());
    setAppointments(storage.getAppointments());
    setReviews(storage.getReviews());
    
    if (user) {
      setCurrentView(user.role === 'barber' ? 'admin' : 'home');
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const slots = generateTimeSlots(selectedDate, appointments);
      setAvailableSlots(slots);
    }
  }, [selectedDate, appointments]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = storage.getUsers();
    const user = users.find(u => u.email === loginForm.email);
    
    if (user) {
      setCurrentUser(user);
      storage.setCurrentUser(user);
      setCurrentView(user.role === 'barber' ? 'admin' : 'home');
      setLoginForm({ email: '', password: '' });
    } else {
      alert('Usuário não encontrado!');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const users = storage.getUsers();
    const existingUser = users.find(u => u.email === registerForm.email);
    
    if (existingUser) {
      alert('Email já cadastrado!');
      return;
    }

    const newUser: User = {
      id: generateId(),
      name: registerForm.name,
      email: registerForm.email,
      phone: registerForm.phone,
      role: 'client',
      createdAt: new Date().toISOString()
    };

    storage.addUser(newUser);
    setCurrentUser(newUser);
    storage.setCurrentUser(newUser);
    setCurrentView('home');
    setRegisterForm({ name: '', email: '', phone: '', password: '' });
  };

  const handleBooking = () => {
    if (!selectedService || !selectedDate || !selectedTime || !currentUser) return;

    const newAppointment: Appointment = {
      id: generateId(),
      clientId: currentUser.id,
      clientName: currentUser.name,
      clientPhone: currentUser.phone,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      date: selectedDate,
      time: selectedTime,
      status: 'agendado',
      createdAt: new Date().toISOString()
    };

    storage.addAppointment(newAppointment);
    setAppointments(storage.getAppointments());
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setCurrentView('appointments');
    alert('Agendamento realizado com sucesso!');
  };

  const handleAppointmentAction = (appointmentId: string, action: 'confirm' | 'cancel' | 'complete') => {
    const statusMap = {
      confirm: 'confirmado' as const,
      cancel: 'cancelado' as const,
      complete: 'concluido' as const
    };

    storage.updateAppointment(appointmentId, { status: statusMap[action] });
    setAppointments(storage.getAppointments());
  };

  const handleReviewSubmit = (appointmentId: string) => {
    if (!currentUser) return;

    const newReview: Review = {
      id: generateId(),
      clientId: currentUser.id,
      clientName: currentUser.name,
      appointmentId,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      createdAt: new Date().toISOString()
    };

    storage.addReview(newReview);
    setReviews(storage.getReviews());
    setReviewForm({ rating: 5, comment: '' });
    alert('Avaliação enviada com sucesso!');
  };

  // Funções para gerenciamento de serviços
  const handleAddService = () => {
    if (!newService.name || !newService.description || newService.price <= 0 || newService.duration <= 0) {
      alert('Preencha todos os campos corretamente!');
      return;
    }

    const service: Service = {
      id: generateId(),
      name: newService.name,
      description: newService.description,
      price: newService.price,
      duration: newService.duration,
      category: 'outros',
      createdAt: new Date().toISOString()
    };

    storage.addService(service);
    setServices(storage.getServices());
    setNewService({ name: '', description: '', price: 0, duration: 30 });
    setShowAddService(false);
    alert('Serviço adicionado com sucesso!');
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
  };

  const handleUpdateService = () => {
    if (!editingService) return;

    if (!editingService.name || !editingService.description || editingService.price <= 0 || editingService.duration <= 0) {
      alert('Preencha todos os campos corretamente!');
      return;
    }

    storage.updateService(editingService.id, editingService);
    setServices(storage.getServices());
    setEditingService(null);
    alert('Serviço atualizado com sucesso!');
  };

  const handleDeleteService = (serviceId: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      storage.deleteService(serviceId);
      setServices(storage.getServices());
      alert('Serviço excluído com sucesso!');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    storage.setCurrentUser(null);
    setCurrentView('login');
    setShowMobileMenu(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Componente de Header
  const Header = () => (
    <header className="bg-black text-white sticky top-0 z-50">
      <div className="p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-orange-600">JM Barbearia</h1>
            <div className="flex items-center text-sm text-gray-300 mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              <span>Rua Aberlado Pena, 576</span>
            </div>
          </div>
          
          {currentUser && (
            <>
              {/* Menu Desktop */}
              <nav className="hidden md:flex items-center space-x-6">
                {currentUser.role === 'client' && (
                  <>
                    <button 
                      onClick={() => setCurrentView('home')}
                      className={`hover:text-orange-600 transition-colors ${currentView === 'home' ? 'text-orange-600' : ''}`}
                    >
                      Início
                    </button>
                    <button 
                      onClick={() => setCurrentView('services')}
                      className={`hover:text-orange-600 transition-colors ${currentView === 'services' ? 'text-orange-600' : ''}`}
                    >
                      Serviços
                    </button>
                    <button 
                      onClick={() => setCurrentView('appointments')}
                      className={`hover:text-orange-600 transition-colors ${currentView === 'appointments' ? 'text-orange-600' : ''}`}
                    >
                      Agendamentos
                    </button>
                    <button 
                      onClick={() => setCurrentView('reviews')}
                      className={`hover:text-orange-600 transition-colors ${currentView === 'reviews' ? 'text-orange-600' : ''}`}
                    >
                      Avaliações
                    </button>
                  </>
                )}
                
                {currentUser.role === 'barber' && (
                  <>
                    <button 
                      onClick={() => setCurrentView('admin')}
                      className={`hover:text-orange-600 transition-colors ${currentView === 'admin' ? 'text-orange-600' : ''}`}
                    >
                      <Settings className="w-5 h-5 inline mr-2" />
                      Dashboard
                    </button>
                    <button 
                      onClick={() => setCurrentView('manage-services')}
                      className={`hover:text-orange-600 transition-colors ${currentView === 'manage-services' ? 'text-orange-600' : ''}`}
                    >
                      <Edit className="w-5 h-5 inline mr-2" />
                      Gerenciar Serviços
                    </button>
                  </>
                )}
                
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-5 h-5" />
                  <span>{currentUser.name}</span>
                  <button onClick={logout} className="hover:text-orange-600 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </nav>

              {/* Menu Mobile */}
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Menu Mobile Dropdown */}
        {showMobileMenu && currentUser && (
          <div className="md:hidden mt-4 bg-gray-900 rounded-lg p-4">
            {currentUser.role === 'client' && (
              <>
                <button 
                  onClick={() => { setCurrentView('home'); setShowMobileMenu(false); }}
                  className="block w-full text-left py-2 hover:text-orange-600 transition-colors"
                >
                  Início
                </button>
                <button 
                  onClick={() => { setCurrentView('services'); setShowMobileMenu(false); }}
                  className="block w-full text-left py-2 hover:text-orange-600 transition-colors"
                >
                  Serviços
                </button>
                <button 
                  onClick={() => { setCurrentView('appointments'); setShowMobileMenu(false); }}
                  className="block w-full text-left py-2 hover:text-orange-600 transition-colors"
                >
                  Agendamentos
                </button>
                <button 
                  onClick={() => { setCurrentView('reviews'); setShowMobileMenu(false); }}
                  className="block w-full text-left py-2 hover:text-orange-600 transition-colors"
                >
                  Avaliações
                </button>
              </>
            )}
            
            {currentUser.role === 'barber' && (
              <>
                <button 
                  onClick={() => { setCurrentView('admin'); setShowMobileMenu(false); }}
                  className="block w-full text-left py-2 hover:text-orange-600 transition-colors"
                >
                  <Settings className="w-5 h-5 inline mr-2" />
                  Dashboard
                </button>
                <button 
                  onClick={() => { setCurrentView('manage-services'); setShowMobileMenu(false); }}
                  className="block w-full text-left py-2 hover:text-orange-600 transition-colors"
                >
                  <Edit className="w-5 h-5 inline mr-2" />
                  Gerenciar Serviços
                </button>
              </>
            )}
            
            <div className="border-t border-gray-700 mt-2 pt-2">
              <div className="flex items-center py-2">
                <UserIcon className="w-5 h-5 mr-2" />
                <span>{currentUser.name}</span>
              </div>
              <button 
                onClick={logout}
                className="flex items-center w-full text-left py-2 hover:text-orange-600 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sair
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );

  // Tela de Login
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">JM Barbearia</h1>
            <div className="flex items-center justify-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">Rua Aberlado Pena, 576</span>
            </div>
            <p className="text-gray-600">Faça login para agendar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Entrar
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem conta?{' '}
              <button
                onClick={() => setCurrentView('register')}
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                Cadastre-se
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Tela de Cadastro
  if (currentView === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Cadastro</h1>
            <div className="flex items-center justify-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">Rua Aberlado Pena, 576</span>
            </div>
            <p className="text-gray-600">Crie sua conta na JM Barbearia</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  placeholder="Seu nome"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Cadastrar
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Já tem conta?{' '}
              <button
                onClick={() => setCurrentView('login')}
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                Faça login
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto p-4">
        {/* Tela Inicial do Cliente */}
        {currentView === 'home' && currentUser.role === 'client' && (
          <div className="space-y-8">
            <div className="text-center py-8">
              <h2 className="text-4xl font-bold text-black mb-4">
                Bem-vindo, {currentUser.name}!
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Agende seu próximo corte com facilidade
              </p>
              
              <button
                onClick={() => setCurrentView('services')}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-colors duration-200 shadow-lg"
              >
                Agendar Agora
              </button>
            </div>

            {/* Próximos Agendamentos */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-black mb-6">Próximos Agendamentos</h3>
              
              {appointments
                .filter(apt => apt.clientId === currentUser.id && apt.status !== 'cancelado' && apt.status !== 'concluido')
                .slice(0, 3)
                .map(appointment => (
                  <div key={appointment.id} className="border-l-4 border-orange-600 pl-4 py-3 mb-4 bg-orange-50 rounded-r-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="font-semibold text-black">{appointment.serviceName}</h4>
                        <p className="text-gray-600 flex items-center mt-1">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(appointment.date)} às {appointment.time}
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          appointment.status === 'agendado' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              
              {appointments.filter(apt => apt.clientId === currentUser.id && apt.status !== 'cancelado' && apt.status !== 'concluido').length === 0 && (
                <p className="text-gray-500 text-center py-8">Nenhum agendamento próximo</p>
              )}
            </div>

            {/* Avaliações Recentes */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-black mb-6">Avaliações da Barbearia</h3>
              
              {reviews.slice(0, 3).map(review => (
                <div key={review.id} className="border-b border-gray-200 pb-4 mb-4 last:border-b-0">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{review.clientName}</span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tela de Serviços */}
        {currentView === 'services' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-black mb-4">Nossos Serviços</h2>
              <p className="text-gray-600">Escolha o serviço desejado para agendar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => (
                <div key={service.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-black mb-2">{service.name}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    
                    <div className="flex items-center justify-center space-x-4 mb-6">
                      <div className="flex items-center text-orange-600">
                        <span className="text-2xl font-bold">{formatPrice(service.price)}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{service.duration}min</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedService(service);
                        setCurrentView('booking');
                      }}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                      Agendar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tela de Agendamento */}
        {currentView === 'booking' && selectedService && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-3xl font-bold text-black mb-6 text-center">Agendar Serviço</h2>
              
              <div className="bg-orange-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-black">{selectedService.name}</h3>
                <p className="text-gray-600">{selectedService.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-orange-600 font-bold text-lg">{formatPrice(selectedService.price)}</span>
                  <span className="text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {selectedService.duration}min
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Escolha a Data
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  />
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horários Disponíveis
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {availableSlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2 px-3 rounded-lg border transition-colors duration-200 ${
                            selectedTime === slot
                              ? 'bg-orange-600 text-white border-orange-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-orange-600'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                    
                    {availableSlots.length === 0 && (
                      <p className="text-gray-500 text-center py-4">Nenhum horário disponível para esta data</p>
                    )}
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setCurrentView('services');
                      setSelectedService(null);
                      setSelectedDate('');
                      setSelectedTime('');
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    Voltar
                  </button>
                  
                  <button
                    onClick={handleBooking}
                    disabled={!selectedDate || !selectedTime}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    Confirmar Agendamento
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tela de Agendamentos do Cliente */}
        {currentView === 'appointments' && currentUser.role === 'client' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-black text-center">Meus Agendamentos</h2>
            
            <div className="space-y-4">
              {appointments
                .filter(apt => apt.clientId === currentUser.id)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(appointment => (
                  <div key={appointment.id} className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-black mb-2">{appointment.serviceName}</h3>
                        <div className="space-y-1 text-gray-600">
                          <p className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(appointment.date)} às {appointment.time}
                          </p>
                          <p className="flex items-center">
                            <span className="w-4 h-4 mr-2 text-center">R$</span>
                            {formatPrice(appointment.servicePrice)}
                          </p>
                        </div>
                        
                        <div className="mt-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            appointment.status === 'agendado' ? 'bg-yellow-100 text-yellow-800' :
                            appointment.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'concluido' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
                        {appointment.status === 'agendado' && (
                          <button
                            onClick={() => handleAppointmentAction(appointment.id, 'cancel')}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                          </button>
                        )}
                        
                        {appointment.status === 'concluido' && !reviews.some(r => r.appointmentId === appointment.id) && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  key={star}
                                  onClick={() => setReviewForm({...reviewForm, rating: star})}
                                  className={`text-2xl ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                            <textarea
                              value={reviewForm.comment}
                              onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                              placeholder="Deixe sua avaliação..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                              rows={3}
                            />
                            <button
                              onClick={() => handleReviewSubmit(appointment.id)}
                              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                            >
                              Enviar Avaliação
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              
              {appointments.filter(apt => apt.clientId === currentUser.id).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">Você ainda não tem agendamentos</p>
                  <button
                    onClick={() => setCurrentView('services')}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                  >
                    Fazer Primeiro Agendamento
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tela de Avaliações */}
        {currentView === 'reviews' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-black text-center">Avaliações dos Clientes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map(review => (
                <div key={review.id} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400 mr-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="font-semibold text-black">{review.clientName}</span>
                  </div>
                  <p className="text-gray-700 mb-3">{review.comment}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
            
            {reviews.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Ainda não há avaliações</p>
              </div>
            )}
          </div>
        )}

        {/* Painel Administrativo do Barbeiro */}
        {currentView === 'admin' && currentUser.role === 'barber' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-black mb-4">Dashboard Administrativo</h2>
              <p className="text-gray-600">Gerencie agendamentos e visualize estatísticas</p>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {appointments.filter(apt => apt.status === 'agendado').length}
                </div>
                <div className="text-gray-600">Agendamentos Pendentes</div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {appointments.filter(apt => apt.status === 'confirmado').length}
                </div>
                <div className="text-gray-600">Confirmados</div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {appointments.filter(apt => apt.status === 'concluido').length}
                </div>
                <div className="text-gray-600">Concluídos</div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}
                </div>
                <div className="text-gray-600">Avaliação Média</div>
              </div>
            </div>

            {/* Lista de Agendamentos */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-black mb-6">Agendamentos</h3>
              
              <div className="space-y-4">
                {appointments
                  .sort((a, b) => {
                    const dateA = new Date(a.date + 'T' + a.time);
                    const dateB = new Date(b.date + 'T' + b.time);
                    return dateA.getTime() - dateB.getTime();
                  })
                  .map(appointment => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h4 className="font-semibold text-black">{appointment.clientName}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'agendado' ? 'bg-yellow-100 text-yellow-800' :
                              appointment.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'concluido' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </div>
                          
                          <div className="text-gray-600 space-y-1">
                            <p><strong>Serviço:</strong> {appointment.serviceName}</p>
                            <p><strong>Data/Hora:</strong> {formatDate(appointment.date)} às {appointment.time}</p>
                            <p><strong>Telefone:</strong> {appointment.clientPhone}</p>
                            <p><strong>Valor:</strong> {formatPrice(appointment.servicePrice)}</p>
                          </div>
                        </div>

                        <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
                          {appointment.status === 'agendado' && (
                            <>
                              <button
                                onClick={() => handleAppointmentAction(appointment.id, 'confirm')}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Confirmar
                              </button>
                              <button
                                onClick={() => handleAppointmentAction(appointment.id, 'cancel')}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancelar
                              </button>
                            </>
                          )}
                          
                          {appointment.status === 'confirmado' && (
                            <button
                              onClick={() => handleAppointmentAction(appointment.id, 'complete')}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Concluir
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                
                {appointments.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Nenhum agendamento encontrado</p>
                )}
              </div>
            </div>

            {/* Avaliações Recentes */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-black mb-6">Avaliações Recentes</h3>
              
              <div className="space-y-4">
                {reviews.slice(0, 5).map(review => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-black">{review.clientName}</span>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{review.comment}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
                
                {reviews.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Nenhuma avaliação ainda</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tela de Gerenciamento de Serviços */}
        {currentView === 'manage-services' && currentUser.role === 'barber' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-black mb-2">Gerenciar Serviços</h2>
                <p className="text-gray-600">Adicione, edite ou remova serviços da barbearia</p>
              </div>
              
              <button
                onClick={() => setShowAddService(true)}
                className="mt-4 sm:mt-0 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Serviço
              </button>
            </div>

            {/* Formulário para Adicionar Serviço */}
            {showAddService && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Novo Serviço</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Serviço
                    </label>
                    <input
                      type="text"
                      value={newService.name}
                      onChange={(e) => setNewService({...newService, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                      placeholder="Ex: Corte Masculino"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <input
                      type="text"
                      value={newService.description}
                      onChange={(e) => setNewService({...newService, description: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                      placeholder="Descrição do serviço"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preço (R$)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={newService.price}
                        onChange={(e) => setNewService({...newService, price: parseFloat(e.target.value) || 0})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duração (minutos)
                    </label>
                    <div className="relative">
                      <Timer className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={newService.duration}
                        onChange={(e) => setNewService({...newService, duration: parseInt(e.target.value) || 30})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                        placeholder="30"
                        min="15"
                        step="15"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => {
                      setShowAddService(false);
                      setNewService({ name: '', description: '', price: 0, duration: 30 });
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    onClick={handleAddService}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Serviço
                  </button>
                </div>
              </div>
            )}

            {/* Lista de Serviços */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => (
                <div key={service.id} className="bg-white rounded-2xl shadow-lg p-6">
                  {editingService?.id === service.id ? (
                    // Modo de Edição
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editingService.name}
                        onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent font-semibold"
                      />
                      
                      <textarea
                        value={editingService.description}
                        onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                        rows={2}
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Preço (R$)</label>
                          <input
                            type="number"
                            value={editingService.price}
                            onChange={(e) => setEditingService({...editingService, price: parseFloat(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Duração (min)</label>
                          <input
                            type="number"
                            value={editingService.duration}
                            onChange={(e) => setEditingService({...editingService, duration: parseInt(e.target.value) || 30})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                            min="15"
                            step="15"
                          />
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={handleUpdateService}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Salvar
                        </button>
                        
                        <button
                          onClick={() => setEditingService(null)}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-3 rounded-lg transition-colors duration-200"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Modo de Visualização
                    <div>
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-black mb-2">{service.name}</h3>
                        <p className="text-gray-600 mb-4">{service.description}</p>
                        
                        <div className="flex items-center justify-center space-x-4 mb-4">
                          <div className="flex items-center text-orange-600">
                            <DollarSign className="w-4 h-4 mr-1" />
                            <span className="text-lg font-bold">{formatPrice(service.price)}</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{service.duration}min</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditService(service)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </button>
                        
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {services.length === 0 && (
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">Nenhum serviço cadastrado</p>
                <button
                  onClick={() => setShowAddService(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Adicionar Primeiro Serviço
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}