import { Case, Alert, Report, MonthlyTrend, PerformanceMetrics } from '../types/case';
import { format, startOfMonth, endOfMonth, differenceInDays, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

class ReportService {
  generateAdvancedReport(cases: Case[], alerts: Alert[]): Report {
    const totalCases = cases.length;
    
    // Casos por estado
    const byState = cases.reduce((acc, case_) => {
      acc[case_.estado] = (acc[case_.estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Casos por mes
    const byMonth = cases.reduce((acc, case_) => {
      const month = format(parseISO(case_.fechaIngreso), 'yyyy-MM');
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Casos por prioridad
    const byPriority = cases.reduce((acc, case_) => {
      acc[case_.prioridad] = (acc[case_.prioridad] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Casos por categoría
    const byCategory = cases.reduce((acc, case_) => {
      acc[case_.categoria] = (acc[case_.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Casos vencidos
    const overdueCases = cases.filter(case_ => {
      if (!case_.fechaAudiencia) return false;
      const audienceDate = parseISO(case_.fechaAudiencia);
      return audienceDate < new Date() && case_.estado !== 'resuelto' && case_.estado !== 'cerrado';
    }).length;

    // Audiencias próximas
    const upcomingAudiences = cases.filter(case_ => {
      if (!case_.fechaAudiencia) return false;
      const audienceDate = parseISO(case_.fechaAudiencia);
      const diffDays = differenceInDays(audienceDate, new Date());
      return diffDays >= 0 && diffDays <= 30;
    }).length;

    // Tiempo promedio de resolución
    const resolvedCases = cases.filter(case_ => case_.estado === 'resuelto');
    const averageResolutionTime = resolvedCases.length > 0 
      ? resolvedCases.reduce((acc, case_) => {
          const start = parseISO(case_.fechaIngreso);
          const end = parseISO(case_.ultimaActualizacion);
          return acc + differenceInDays(end, start);
        }, 0) / resolvedCases.length
      : 0;

    // Tendencias mensuales
    const monthlyTrends = this.calculateMonthlyTrends(cases);

    // Métricas de rendimiento
    const performanceMetrics = this.calculatePerformanceMetrics(cases);

    return {
      totalCases,
      byState,
      byMonth,
      byPriority,
      byCategory,
      overdueCases,
      upcomingAudiences,
      averageResolutionTime,
      monthlyTrends,
      performanceMetrics
    };
  }

  private calculateMonthlyTrends(cases: Case[]): MonthlyTrend[] {
    const trends: Record<string, MonthlyTrend> = {};

    cases.forEach(case_ => {
      const month = format(parseISO(case_.fechaIngreso), 'yyyy-MM');
      
      if (!trends[month]) {
        trends[month] = {
          month,
          created: 0,
          resolved: 0,
          pending: 0
        };
      }

      trends[month].created++;
      
      if (case_.estado === 'resuelto') {
        trends[month].resolved++;
      } else {
        trends[month].pending++;
      }
    });

    return Object.values(trends).sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculatePerformanceMetrics(cases: Case[]): PerformanceMetrics {
    const totalCases = cases.length;
    const resolvedCases = cases.filter(case_ => case_.estado === 'resuelto').length;
    
    const resolutionRate = totalCases > 0 ? (resolvedCases / totalCases) * 100 : 0;
    
    // Tiempo promedio de respuesta (simulado)
    const averageResponseTime = 2.5; // días
    
    // Satisfacción del cliente (simulado)
    const customerSatisfaction = 4.2; // sobre 5
    
    // Carga de trabajo por responsable
    const workload = cases.reduce((acc, case_) => {
      const responsible = case_.responsableAsignado || 'Sin asignar';
      acc[responsible] = (acc[responsible] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      resolutionRate,
      averageResponseTime,
      customerSatisfaction,
      workload
    };
  }

  async generatePDFReport(report: Report, cases: Case[]): Promise<void> {
    const pdf = new jsPDF();
    
    // Título
    pdf.setFontSize(20);
    pdf.text('Reporte de Gestión de Casos', 20, 30);
    
    // Fecha
    pdf.setFontSize(12);
    pdf.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 20, 45);
    
    // Métricas principales
    pdf.setFontSize(16);
    pdf.text('Métricas Principales', 20, 65);
    
    pdf.setFontSize(12);
    let yPosition = 80;
    
    pdf.text(`Total de casos: ${report.totalCases}`, 20, yPosition);
    yPosition += 10;
    
    pdf.text(`Casos vencidos: ${report.overdueCases}`, 20, yPosition);
    yPosition += 10;
    
    pdf.text(`Audiencias próximas: ${report.upcomingAudiences}`, 20, yPosition);
    yPosition += 10;
    
    pdf.text(`Tiempo promedio de resolución: ${report.averageResolutionTime.toFixed(1)} días`, 20, yPosition);
    yPosition += 10;
    
    pdf.text(`Tasa de resolución: ${report.performanceMetrics.resolutionRate.toFixed(1)}%`, 20, yPosition);
    yPosition += 20;
    
    // Estados
    pdf.setFontSize(16);
    pdf.text('Distribución por Estado', 20, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(12);
    Object.entries(report.byState).forEach(([state, count]) => {
      pdf.text(`${state}: ${count}`, 20, yPosition);
      yPosition += 10;
    });
    
    // Guardar PDF
    pdf.save(`reporte-casos-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  }

  async exportDetailedCSV(cases: Case[]): Promise<void> {
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
      'Última actualización',
      'Documentos adjuntos',
      'Historial de seguimiento'
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
        caseItem.ultimaActualizacion,
        caseItem.documentosAdjuntos.length,
        caseItem.historialSeguimiento.length
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `casos-detallado-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  generateChartData(report: Report) {
    return {
      statusChart: Object.entries(report.byState).map(([name, value]) => ({
        name: this.translateStatus(name),
        value,
        color: this.getStatusColor(name)
      })),
      
      priorityChart: Object.entries(report.byPriority).map(([name, value]) => ({
        name: this.translatePriority(name),
        value,
        color: this.getPriorityColor(name)
      })),
      
      monthlyTrends: report.monthlyTrends.map(trend => ({
        month: format(parseISO(trend.month + '-01'), 'MMM yyyy'),
        creados: trend.created,
        resueltos: trend.resolved,
        pendientes: trend.pending
      })),
      
      workloadChart: Object.entries(report.performanceMetrics.workload).map(([name, value]) => ({
        responsable: name,
        casos: value
      }))
    };
  }

  private translateStatus(status: string): string {
    const translations: Record<string, string> = {
      'pendiente': 'Pendiente',
      'en_proceso': 'En Proceso',
      'audiencia_programada': 'Audiencia Programada',
      'resuelto': 'Resuelto',
      'cerrado': 'Cerrado'
    };
    return translations[status] || status;
  }

  private translatePriority(priority: string): string {
    const translations: Record<string, string> = {
      'baja': 'Baja',
      'media': 'Media',
      'alta': 'Alta',
      'urgente': 'Urgente'
    };
    return translations[priority] || priority;
  }

  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'pendiente': '#F59E0B',
      'en_proceso': '#3B82F6',
      'audiencia_programada': '#8B5CF6',
      'resuelto': '#10B981',
      'cerrado': '#6B7280'
    };
    return colors[status] || '#6B7280';
  }

  private getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      'baja': '#10B981',
      'media': '#F59E0B',
      'alta': '#EF4444',
      'urgente': '#DC2626'
    };
    return colors[priority] || '#6B7280';
  }
}

export const reportService = new ReportService();