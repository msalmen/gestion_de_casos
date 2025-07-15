export interface Case {
  id: string;
  fechaIngreso: string;
  nombreReclamante: string;
  provincia: string;
  localidad: string;
  organismoInterviniente: string;
  numeroExpediente: string;
  fechaNotificacion: string;
  fechaAudiencia: string;
  horaAudiencia: string;
  productoServicio: string;
  casaVendedora: string;
  estado: 'pendiente' | 'en_proceso' | 'audiencia_programada' | 'resuelto' | 'cerrado';
  observaciones: string;
  enlaceCarpeta: string;
  responsableAsignado: string;
  ultimaActualizacion: string;
  carpetas: CarpetaInfo[];
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  categoria: string;
  montoReclamado?: number;
  emailReclamante?: string;
  telefonoReclamante?: string;
  documentosAdjuntos: DocumentoAdjunto[];
  historialSeguimiento: SeguimientoEntry[];
}

export interface CarpetaInfo {
  nombre: string;
  created: boolean;
  lastModified: string;
  driveId?: string;
  url?: string;
}

export interface DocumentoAdjunto {
  id: string;
  nombre: string;
  tipo: string;
  url: string;
  fechaSubida: string;
}

export interface SeguimientoEntry {
  id: string;
  fecha: string;
  accion: string;
  descripcion: string;
  usuario: string;
}

export interface Alert {
  id: string;
  caseId: string;
  type: 'audiencia_10_dias' | 'audiencia_3_dias' | 'audiencia_1_dia' | 'vencimiento' | 'seguimiento';
  message: string;
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface Report {
  totalCases: number;
  byState: Record<string, number>;
  byMonth: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
  overdueCases: number;
  upcomingAudiences: number;
  averageResolutionTime: number;
  monthlyTrends: MonthlyTrend[];
  performanceMetrics: PerformanceMetrics;
}

export interface MonthlyTrend {
  month: string;
  created: number;
  resolved: number;
  pending: number;
}

export interface PerformanceMetrics {
  resolutionRate: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  workload: Record<string, number>;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  emailAddress: string;
  phoneNumber: string;
}

export interface GoogleDriveConfig {
  enabled: boolean;
  apiKey: string;
  clientId: string;
  baseFolderId: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  caseId: string;
  type: 'audiencia' | 'reunion' | 'vencimiento' | 'seguimiento';
  description?: string;
  location?: string;
}