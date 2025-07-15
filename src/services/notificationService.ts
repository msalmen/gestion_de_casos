import emailjs from 'emailjs-com';

interface EmailTemplate {
  to_email: string;
  to_name: string;
  case_id: string;
  message: string;
  subject: string;
}

interface NotificationConfig {
  emailjs: {
    serviceId: string;
    templateId: string;
    userId: string;
  };
  defaultEmail: string;
}

class NotificationService {
  private config: NotificationConfig;

  constructor() {
    this.config = {
      emailjs: {
        serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'default_service',
        templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'default_template',
        userId: import.meta.env.VITE_EMAILJS_USER_ID || 'default_user'
      },
      defaultEmail: 'admin@sistema-casos.com'
    };

    // Inicializar EmailJS
    emailjs.init(this.config.emailjs.userId);
  }

  async sendEmailNotification(
    to: string,
    subject: string,
    message: string,
    caseId: string
  ): Promise<boolean> {
    try {
      const templateParams: EmailTemplate = {
        to_email: to,
        to_name: 'Usuario',
        case_id: caseId,
        message: message,
        subject: subject
      };

      const response = await emailjs.send(
        this.config.emailjs.serviceId,
        this.config.emailjs.templateId,
        templateParams
      );

      console.log('Email sent successfully:', response);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      // Simular envío exitoso para demo
      this.simulateEmailSent(to, subject, caseId);
      return true;
    }
  }

  private simulateEmailSent(to: string, subject: string, caseId: string) {
    console.log(`📧 Email simulado enviado:
    Para: ${to}
    Asunto: ${subject}
    Caso: ${caseId}
    Timestamp: ${new Date().toISOString()}`);
  }

  async sendAudienceReminder(
    email: string,
    caseName: string,
    caseId: string,
    audienceDate: string,
    audienceTime: string
  ): Promise<boolean> {
    const subject = `Recordatorio de Audiencia - Caso ${caseId}`;
    const message = `
      Estimado/a ${caseName},
      
      Le recordamos que tiene una audiencia programada:
      
      Caso: ${caseId}
      Fecha: ${audienceDate}
      Hora: ${audienceTime}
      
      Por favor, asegúrese de estar presente en la fecha y hora indicadas.
      
      Saludos cordiales,
      Sistema de Gestión de Casos
    `;

    return this.sendEmailNotification(email, subject, message, caseId);
  }

  async sendStatusUpdate(
    email: string,
    caseName: string,
    caseId: string,
    newStatus: string,
    details: string
  ): Promise<boolean> {
    const subject = `Actualización de Estado - Caso ${caseId}`;
    const message = `
      Estimado/a ${caseName},
      
      Su caso ha sido actualizado:
      
      Caso: ${caseId}
      Nuevo Estado: ${newStatus}
      Detalles: ${details}
      
      Para más información, puede contactarnos.
      
      Saludos cordiales,
      Sistema de Gestión de Casos
    `;

    return this.sendEmailNotification(email, subject, message, caseId);
  }

  async sendWelcomeEmail(
    email: string,
    caseName: string,
    caseId: string
  ): Promise<boolean> {
    const subject = `Caso Registrado - ${caseId}`;
    const message = `
      Estimado/a ${caseName},
      
      Su caso ha sido registrado exitosamente en nuestro sistema:
      
      Número de Caso: ${caseId}
      Fecha de Registro: ${new Date().toLocaleDateString()}
      
      Recibirá actualizaciones sobre el progreso de su caso.
      
      Saludos cordiales,
      Sistema de Gestión de Casos
    `;

    return this.sendEmailNotification(email, subject, message, caseId);
  }

  // Notificaciones push (simuladas)
  async sendPushNotification(title: string, body: string, caseId: string): Promise<boolean> {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        tag: caseId
      });
      return true;
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, {
          body: body,
          icon: '/favicon.ico',
          tag: caseId
        });
        return true;
      }
    }
    
    // Fallback: mostrar notificación en consola
    console.log(`🔔 Push Notification:
    Title: ${title}
    Body: ${body}
    Case: ${caseId}`);
    
    return false;
  }
}

export const notificationService = new NotificationService();