interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  webViewLink?: string;
}

interface GoogleDriveResponse {
  files: GoogleDriveFile[];
}

class GoogleDriveService {
  private apiKey: string = '';
  private accessToken: string = '';
  private baseFolderId: string = '';
  private clientId: string = '';

  constructor() {
    // Cargar configuración desde localStorage
    const config = localStorage.getItem('googleDriveConfig');
    if (config) {
      const parsed = JSON.parse(config);
      this.apiKey = parsed.apiKey || '';
      this.baseFolderId = parsed.baseFolderId || '';
      this.clientId = parsed.clientId || '';
    }
  }

  setConfig(apiKey: string, baseFolderId: string, clientId?: string) {
    this.apiKey = apiKey;
    this.baseFolderId = baseFolderId;
    if (clientId) this.clientId = clientId;
    
    localStorage.setItem('googleDriveConfig', JSON.stringify({
      apiKey,
      baseFolderId,
      clientId: this.clientId
    }));
  }

  async initializeAuth(): Promise<boolean> {
    console.log('🔐 [GOOGLE DRIVE] Inicializando autenticación...');
    console.log('📧 [GOOGLE DRIVE] Configuración actual:', {
      clientId: this.clientId ? 'Configurado' : 'NO CONFIGURADO',
      apiKey: this.apiKey ? 'Configurado' : 'NO CONFIGURADO',
      baseFolderId: this.baseFolderId ? 'Configurado' : 'NO CONFIGURADO',
      domain: window.location.origin
    });
    
    if (!this.clientId) {
      console.warn('⚠️ [GOOGLE DRIVE] No hay Client ID configurado, usando modo simulación');
      return false;
    }

    try {
      // Cargar la biblioteca de Google API
      if (typeof window.gapi === 'undefined') {
        console.log('📚 [GOOGLE DRIVE] Cargando Google API...');
        await this.loadGoogleAPI();
        console.log('✅ [GOOGLE DRIVE] Google API cargada');
      }

      console.log('🔧 [GOOGLE DRIVE] Inicializando auth2...');
      await new Promise((resolve) => {
        window.gapi.load('auth2', resolve);
      });

      console.log('🔧 [GOOGLE DRIVE] Configurando cliente OAuth...');
      console.log('🌐 [GOOGLE DRIVE] Dominio actual:', window.location.origin);
      console.log('🔑 [GOOGLE DRIVE] Client ID:', this.clientId);
      
      const authInstance = window.gapi.auth2.init({
        client_id: this.clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        hosted_domain: undefined // Permitir cualquier dominio de email
      });

      console.log('👤 [GOOGLE DRIVE] Verificando estado de autenticación...');
      const user = authInstance.currentUser.get();
      console.log('👤 [GOOGLE DRIVE] Estado de usuario actual:', {
        isSignedIn: user.isSignedIn(),
        email: user.isSignedIn() ? user.getBasicProfile()?.getEmail() : 'No autenticado',
        hasValidToken: user.isSignedIn() ? !!user.getAuthResponse()?.access_token : false
      });
      
      if (user.isSignedIn()) {
        this.accessToken = user.getAuthResponse().access_token;
        console.log('✅ [GOOGLE DRIVE] Usuario ya autenticado');
        console.log('🔑 [GOOGLE DRIVE] Token válido:', !!this.accessToken);
        return true;
      } else {
        console.log('🔑 [GOOGLE DRIVE] Solicitando autenticación...');
        console.log('🚀 [GOOGLE DRIVE] Iniciando flujo OAuth...');
        const signedInUser = await authInstance.signIn();
        this.accessToken = signedInUser.getAuthResponse().access_token;
        console.log('✅ [GOOGLE DRIVE] Autenticación exitosa');
        console.log('🔑 [GOOGLE DRIVE] Access token obtenido:', this.accessToken ? 'SÍ' : 'NO');
        console.log('👤 [GOOGLE DRIVE] Usuario autenticado:', signedInUser.getBasicProfile()?.getEmail());
        return true;
      }
    } catch (error) {
      console.error('❌ [GOOGLE DRIVE] Error en autenticación:', error);
      console.error('❌ [GOOGLE DRIVE] Detalles del error:', {
        message: error?.message || 'Sin mensaje',
        details: error?.details || 'Sin detalles',
        error: error?.error || 'Sin código de error',
        type: error?.type || 'Sin tipo',
        fullError: error
      });
      
      // Diagnóstico específico para errores comunes
      if (error?.error === 'popup_blocked_by_browser') {
        console.log('🚫 [GOOGLE DRIVE] SOLUCIÓN: Habilita popups para este sitio');
      } else if (error?.error === 'access_denied') {
        console.log('🚫 [GOOGLE DRIVE] SOLUCIÓN: El usuario canceló la autorización');
      } else if (error?.type === 'tokenFailed') {
        console.log('🚫 [GOOGLE DRIVE] SOLUCIÓN: Problema con las credenciales OAuth');
        console.log('🔧 [GOOGLE DRIVE] Verifica:');
        console.log('   1. Client ID correcto');
        console.log('   2. Dominio autorizado en Google Cloud Console');
        console.log('   3. Google Drive API habilitada');
        console.log('   4. App publicada o email en usuarios de prueba');
      }
      
      return false;
    }
  }

  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="apis.google.com"]')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  async createFolder(name: string, parentId?: string): Promise<GoogleDriveFile | null> {
    console.log(`📁 Creando carpeta: ${name}, parent: ${parentId || this.baseFolderId}`);
    
    // Si no hay access token, intentar autenticar
    if (!this.accessToken) {
      const authSuccess = await this.initializeAuth();
      if (!authSuccess) {
        console.log('🎭 Usando modo simulación para crear carpeta');
        return this.simulateCreateFolder(name, parentId);
      }
    }

    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: parentId ? [parentId] : [this.baseFolderId]
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('🔄 Token expirado, reautenticando...');
          const authSuccess = await this.initializeAuth();
          if (authSuccess) {
            return this.createFolder(name, parentId); // Reintentar
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Carpeta creada en Google Drive:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creando carpeta en Google Drive:', error);
      console.log('🎭 Fallback a modo simulación');
      return this.simulateCreateFolder(name, parentId);
    }
  }

  async createCaseFolders(caseId: string, caseName: string): Promise<{ mainFolder: GoogleDriveFile; subFolders: GoogleDriveFile[] }> {
    console.log(`📁 Creando carpetas para caso: ${caseId} - ${caseName}`);
    
    const mainFolderName = `${caseId} - ${caseName}`;
    const mainFolder = await this.createFolder(mainFolderName);
    
    if (!mainFolder) {
      throw new Error('No se pudo crear la carpeta principal');
    }

    const subFolderNames = [
      '01 - Denuncia y Documentación Inicial',
      '02 - Notificaciones',
      '03 - Correspondencia',
      '04 - Pruebas y Evidencias',
      '05 - Audiencias',
      '06 - Resoluciones y Dictámenes',
      '07 - Documentos Finales'
    ];

    const subFolders: GoogleDriveFile[] = [];
    
    for (const folderName of subFolderNames) {
      const subFolder = await this.createFolder(folderName, mainFolder.id);
      if (subFolder) {
        subFolders.push(subFolder);
      }
      // Pequeña pausa para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ Carpetas creadas: 1 principal + ${subFolders.length} subcarpetas`);
    return { mainFolder, subFolders };
  }

  private simulateCreateFolder(name: string, parentId?: string): GoogleDriveFile {
    console.log(`🎭 Simulando creación de carpeta: ${name}`);
    const folderId = `simulated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      id: folderId,
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : [this.baseFolderId],
      webViewLink: `https://drive.google.com/drive/folders/${folderId}`
    };
  }

  generateFolderUrl(folderId: string): string {
    return `https://drive.google.com/drive/folders/${folderId}`;
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.baseFolderId);
  }

  hasAuth(): boolean {
    return !!this.accessToken;
  }
}

// Declarar tipos globales para Google API
declare global {
  interface Window {
    gapi: any;
  }
}

export const googleDriveService = new GoogleDriveService();