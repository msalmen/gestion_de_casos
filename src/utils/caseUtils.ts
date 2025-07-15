import { Case, CarpetaInfo, Alert, SeguimientoEntry, DocumentoAdjunto } from '../types/case';
import { format, addDays, differenceInDays } from 'date-fns';

export const generateCaseId = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CASO-${year}${month}${day}-${random}`;
};

export const createDefaultFolders = (): CarpetaInfo[] => {
  const folders = [
    '01 - Denuncia y Documentación Inicial',
    '02 - Notificaciones',
    '03 - Correspondencia',
    '04 - Pruebas y Evidencias',
    '05 - Audiencias',
    '06 - Resoluciones y Dictámenes',
    '07 - Documentos Finales'
  ];

  return folders.map(nombre => ({
    nombre,
    created: false,
    lastModified: new Date().toISOString()
  }));
};

export const createNewCase = (): Omit<Case, 'id'> => {
  const now = new Date();
  return {
    fechaIngreso: format(now, 'yyyy-MM-dd'),
    nombreReclamante: '',
    provincia: '',
    localidad: '',
    organismoInterviniente: '',
    numeroExpediente: '',
    fechaNotificacion: '',
    fechaAudiencia: '',
    horaAudiencia: '',
    productoServicio: '',
    casaVendedora: '',
    estado: 'pendiente',
    observaciones: '',
    enlaceCarpeta: '',
    responsableAsignado: '',
    ultimaActualizacion: now.toISOString(),
    carpetas: createDefaultFolders(),
    prioridad: 'media',
    categoria: 'General',
    montoReclamado: undefined,
    emailReclamante: '',
    telefonoReclamante: '',
    documentosAdjuntos: [],
    historialSeguimiento: []
  };
};

export const generateAudienceAlerts = (caseData: Case): Alert[] => {
  if (!caseData.fechaAudiencia) return [];

  const audienceDate = new Date(caseData.fechaAudiencia);
  const now = new Date();
  const alerts: Alert[] = [];

  // Obtener configuración de recordatorios
  const config = JSON.parse(localStorage.getItem('systemConfig') || '{}');
  const reminderDays = config.system?.audienceReminderDays || [10, 3, 1];

  reminderDays.forEach(days => {
    const alertDate = addDays(audienceDate, -days);
    if (differenceInDays(alertDate, now) >= 0) {
      let priority: Alert['priority'] = 'medium';
      let type: Alert['type'] = 'audiencia_10_dias';

      if (days === 1) {
        priority = 'urgent';
        type = 'audiencia_1_dia';
      } else if (days === 3) {
        priority = 'high';
        type = 'audiencia_3_dias';
      }

      alerts.push({
        id: `${caseData.id}-${days}d`,
        caseId: caseData.id,
        type,
        message: `Audiencia programada para ${format(audienceDate, 'dd/MM/yyyy')} - ${days === 1 ? 'MAÑANA' : `${days} días restantes`}`,
        date: alertDate.toISOString(),
        read: false,
        priority
      });
    }
  });

  return alerts;
};

export const addSeguimientoEntry = (caseData: Case, accion: string, descripcion: string, usuario: string = 'Sistema'): SeguimientoEntry => {
  const entry: SeguimientoEntry = {
    id: `seg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    fecha: new Date().toISOString(),
    accion,
    descripcion,
    usuario
  };

  return entry;
};

export const exportToCSV = (cases: Case[]): string => {
  const headers = [
    'ID del caso',
    'Fecha de ingreso',
    'Nombre del reclamante',
    'Email',
    'Teléfono',
    'Provincia',
    'Localidad',
    'Organismo interviniente',
    'Nº de expediente',
    'Fecha de notificación',
    'Fecha de audiencia',
    'Hora audiencia',
    'Producto/servicio reclamado',
    'Casa vendedora',
    'Estado del caso',
    'Prioridad',
    'Categoría',
    'Monto reclamado',
    'Observaciones/seguimiento',
    'Enlace a carpeta en Drive',
    'Responsable asignado',
    'Última actualización'
  ];

  const csvContent = [
    headers.join(','),
    ...cases.map(caseItem => [
      caseItem.id,
      caseItem.fechaIngreso,
      `"${caseItem.nombreReclamante}"`,
      caseItem.emailReclamante || '',
      caseItem.telefonoReclamante || '',
      caseItem.provincia,
      caseItem.localidad,
      caseItem.organismoInterviniente,
      caseItem.numeroExpediente,
      caseItem.fechaNotificacion,
      caseItem.fechaAudiencia,
      caseItem.horaAudiencia,
      `"${caseItem.productoServicio}"`,
      caseItem.casaVendedora,
      caseItem.estado,
      caseItem.prioridad,
      caseItem.categoria,
      caseItem.montoReclamado || '',
      `"${caseItem.observaciones}"`,
      caseItem.enlaceCarpeta,
      caseItem.responsableAsignado,
      caseItem.ultimaActualizacion
    ].join(','))
  ].join('\n');

  return csvContent;
};

export const downloadCSV = (csvContent: string, filename: string = 'casos_export.csv'): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getPriorityColor = (priority: Case['prioridad']): string => {
  switch (priority) {
    case 'baja': return 'bg-green-100 text-green-800';
    case 'media': return 'bg-yellow-100 text-yellow-800';
    case 'alta': return 'bg-orange-100 text-orange-800';
    case 'urgente': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getPriorityText = (priority: Case['prioridad']): string => {
  switch (priority) {
    case 'baja': return 'Baja';
    case 'media': return 'Media';
    case 'alta': return 'Alta';
    case 'urgente': return 'Urgente';
    default: return priority;
  }
};

export const validateCaseData = (caseData: Partial<Case>): string[] => {
  const errors: string[] = [];

  if (!caseData.nombreReclamante?.trim()) {
    errors.push('El nombre del reclamante es requerido');
  }

  if (!caseData.provincia?.trim()) {
    errors.push('La provincia es requerida');
  }

  if (!caseData.localidad?.trim()) {
    errors.push('La localidad es requerida');
  }

  if (!caseData.fechaIngreso) {
    errors.push('La fecha de ingreso es requerida');
  }

  if (caseData.emailReclamante && !isValidEmail(caseData.emailReclamante)) {
    errors.push('El email del reclamante no es válido');
  }

  if (caseData.montoReclamado && caseData.montoReclamado < 0) {
    errors.push('El monto reclamado no puede ser negativo');
  }

  return errors;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};