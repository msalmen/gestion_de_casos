import React, { useState } from 'react';
import { Case } from '../types/case';
import { Save, X, Calendar, Clock, MapPin, User, Building, FileText } from 'lucide-react';

interface CaseFormProps {
  case?: Case;
  onSave: (caseData: Omit<Case, 'id'>) => void;
  onCancel: () => void;
}

export const CaseForm: React.FC<CaseFormProps> = ({ case: initialCase, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Case, 'id'>>({
    fechaIngreso: initialCase?.fechaIngreso || new Date().toISOString().split('T')[0],
    nombreReclamante: initialCase?.nombreReclamante || '',
    provincia: initialCase?.provincia || '',
    localidad: initialCase?.localidad || '',
    organismoInterviniente: initialCase?.organismoInterviniente || '',
    numeroExpediente: initialCase?.numeroExpediente || '',
    fechaNotificacion: initialCase?.fechaNotificacion || '',
    fechaAudiencia: initialCase?.fechaAudiencia || '',
    horaAudiencia: initialCase?.horaAudiencia || '',
    productoServicio: initialCase?.productoServicio || '',
    casaVendedora: initialCase?.casaVendedora || '',
    estado: initialCase?.estado || 'pendiente',
    observaciones: initialCase?.observaciones || '',
    enlaceCarpeta: initialCase?.enlaceCarpeta || '',
    responsableAsignado: initialCase?.responsableAsignado || '',
    ultimaActualizacion: new Date().toISOString(),
    carpetas: initialCase?.carpetas || [],
    prioridad: initialCase?.prioridad || 'media',
    categoria: initialCase?.categoria || 'General',
    montoReclamado: initialCase?.montoReclamado,
    emailReclamante: initialCase?.emailReclamante || '',
    telefonoReclamante: initialCase?.telefonoReclamante || '',
    documentosAdjuntos: initialCase?.documentosAdjuntos || [],
    historialSeguimiento: initialCase?.historialSeguimiento || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📋 Datos del formulario:', formData);

    // Validación básica solo para campos críticos
    if (!formData.nombreReclamante.trim()) {
      alert('El nombre del reclamante es requerido');
      return;
    }
    
    if (!formData.provincia.trim()) {
      alert('La provincia es requerida');
      return;
    }
    
    if (!formData.localidad.trim()) {
      alert('La localidad es requerida');
      return;
    }
    
    console.log('✅ Validación pasada, enviando datos...');
    onSave(formData);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNumberChange = (field: keyof typeof formData, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {initialCase ? 'Editar Caso' : 'Nuevo Caso'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Fecha de Ingreso
              </label>
              <input
                type="date"
                value={formData.fechaIngreso}
                onChange={(e) => handleChange('fechaIngreso', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                Nombre del Reclamante
              </label>
              <input
                type="text"
                value={formData.nombreReclamante}
                onChange={(e) => handleChange('nombreReclamante', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Ubicación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />
                Provincia
              </label>
              <input
                type="text"
                value={formData.provincia}
                onChange={(e) => handleChange('provincia', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />
                Localidad
              </label>
              <input
                type="text"
                value={formData.localidad}
                onChange={(e) => handleChange('localidad', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Información del caso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4" />
                Organismo Interviniente
              </label>
              <input
                type="text"
                value={formData.organismoInterviniente}
                onChange={(e) => handleChange('organismoInterviniente', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                Número de Expediente
              </label>
              <input
                type="text"
                value={formData.numeroExpediente}
                onChange={(e) => handleChange('numeroExpediente', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Fechas importantes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Fecha de Notificación
              </label>
              <input
                type="date"
                value={formData.fechaNotificacion}
                onChange={(e) => handleChange('fechaNotificacion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Fecha de Audiencia
              </label>
              <input
                type="date"
                value={formData.fechaAudiencia}
                onChange={(e) => handleChange('fechaAudiencia', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4" />
                Hora de Audiencia
              </label>
              <input
                type="time"
                value={formData.horaAudiencia}
                onChange={(e) => handleChange('horaAudiencia', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Información del reclamo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Producto/Servicio Reclamado
              </label>
              <input
                type="text"
                value={formData.productoServicio}
                onChange={(e) => handleChange('productoServicio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Casa Vendedora
              </label>
              <input
                type="text"
                value={formData.casaVendedora}
                onChange={(e) => handleChange('casaVendedora', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Estado y responsable */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado del Caso
              </label>
              <select
                value={formData.estado}
                onChange={(e) => handleChange('estado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="audiencia_programada">Audiencia Programada</option>
                <option value="resuelto">Resuelto</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsable Asignado
              </label>
              <input
                type="text"
                value={formData.responsableAsignado}
                onChange={(e) => handleChange('responsableAsignado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Información adicional */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email del Reclamante
              </label>
              <input
                type="email"
                value={formData.emailReclamante || ''}
                onChange={(e) => handleChange('emailReclamante', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono del Reclamante
              </label>
              <input
                type="tel"
                value={formData.telefonoReclamante || ''}
                onChange={(e) => handleChange('telefonoReclamante', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+54 11 1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto Reclamado ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.montoReclamado || ''}
                onChange={(e) => handleNumberChange('montoReclamado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Prioridad y Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                value={formData.prioridad}
                onChange={(e) => handleChange('prioridad', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => handleChange('categoria', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="General">General</option>
                <option value="Consumo">Consumo</option>
                <option value="Servicios">Servicios</option>
                <option value="Productos">Productos</option>
                <option value="Financiero">Financiero</option>
                <option value="Salud">Salud</option>
                <option value="Educación">Educación</option>
                <option value="Transporte">Transporte</option>
                <option value="Vivienda">Vivienda</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones/Seguimiento
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Detalles adicionales del caso..."
            />
          </div>

          {/* Enlace a carpeta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enlace a Carpeta en Drive
            </label>
            <input
              type="url"
              value={formData.enlaceCarpeta}
              onChange={(e) => handleChange('enlaceCarpeta', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://drive.google.com/..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Guardar Caso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};