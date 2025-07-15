import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import { Case, CalendarEvent } from '../types/case';
import { Calendar as CalendarIcon, Clock, MapPin, User, X } from 'lucide-react';

// Configurar moment en español
moment.locale('es');
const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  cases: Case[];
  onClose: () => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ cases, onClose, onEventClick }) => {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const events: CalendarEvent[] = useMemo(() => {
    const calendarEvents: CalendarEvent[] = [];

    cases.forEach(case_ => {
      // Audiencias
      if (case_.fechaAudiencia) {
        const audienceDate = new Date(case_.fechaAudiencia);
        
        if (case_.horaAudiencia) {
          const [hours, minutes] = case_.horaAudiencia.split(':');
          audienceDate.setHours(parseInt(hours), parseInt(minutes));
        }

        const endDate = new Date(audienceDate);
        endDate.setHours(audienceDate.getHours() + 1); // Duración de 1 hora por defecto

        calendarEvents.push({
          id: `audiencia-${case_.id}`,
          title: `Audiencia: ${case_.nombreReclamante}`,
          start: audienceDate,
          end: endDate,
          caseId: case_.id,
          type: 'audiencia',
          description: `Caso: ${case_.id}\nReclamante: ${case_.nombreReclamante}\nProducto: ${case_.productoServicio}`,
          location: case_.organismoInterviniente
        });
      }

      // Vencimientos (casos sin audiencia programada hace más de 30 días)
      const ingresoDate = new Date(case_.fechaIngreso);
      const daysSinceIngreso = Math.floor((Date.now() - ingresoDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (!case_.fechaAudiencia && daysSinceIngreso > 30 && case_.estado !== 'resuelto' && case_.estado !== 'cerrado') {
        const vencimientoDate = new Date(ingresoDate);
        vencimientoDate.setDate(vencimientoDate.getDate() + 30);

        calendarEvents.push({
          id: `vencimiento-${case_.id}`,
          title: `Vencimiento: ${case_.nombreReclamante}`,
          start: vencimientoDate,
          end: vencimientoDate,
          caseId: case_.id,
          type: 'vencimiento',
          description: `Caso vencido: ${case_.id}\nReclamante: ${case_.nombreReclamante}`,
        });
      }

      // Seguimientos programados (simulados cada 15 días)
      if (case_.estado === 'en_proceso') {
        const seguimientoDate = new Date(case_.fechaIngreso);
        seguimientoDate.setDate(seguimientoDate.getDate() + 15);

        if (seguimientoDate > new Date()) {
          calendarEvents.push({
            id: `seguimiento-${case_.id}`,
            title: `Seguimiento: ${case_.nombreReclamante}`,
            start: seguimientoDate,
            end: seguimientoDate,
            caseId: case_.id,
            type: 'seguimiento',
            description: `Seguimiento programado: ${case_.id}\nReclamante: ${case_.nombreReclamante}`,
          });
        }
      }
    });

    return calendarEvents;
  }, [cases]);

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3B82F6';
    let color = 'white';

    switch (event.type) {
      case 'audiencia':
        backgroundColor = '#10B981';
        break;
      case 'vencimiento':
        backgroundColor = '#EF4444';
        break;
      case 'seguimiento':
        backgroundColor = '#F59E0B';
        break;
      case 'reunion':
        backgroundColor = '#8B5CF6';
        break;
    }

    return {
      style: {
        backgroundColor,
        color,
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px'
      }
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'No hay eventos en este rango',
    showMore: (total: number) => `+ Ver más (${total})`
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6" />
              Calendario de Casos
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="h-full">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              onSelectEvent={handleSelectEvent}
              onView={setView}
              onNavigate={setDate}
              view={view}
              date={date}
              eventPropGetter={eventStyleGetter}
              messages={messages}
              popup
              selectable
              className="bg-white rounded-lg"
            />
          </div>
        </div>

        {/* Leyenda */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Audiencias</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Vencimientos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Seguimientos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>Reuniones</span>
            </div>
          </div>
        </div>

        {/* Modal de detalles del evento */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{moment(selectedEvent.start).format('DD/MM/YYYY HH:mm')}</span>
                  </div>
                  
                  {selectedEvent.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>Caso: {selectedEvent.caseId}</span>
                  </div>
                  
                  {selectedEvent.description && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700">
                        {selectedEvent.description}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};