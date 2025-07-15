import React, { useState } from 'react';
import { googleDriveService } from '../services/googleDriveService';
import { notificationService } from '../services/notificationService';
import { Settings, Save, Check, AlertTriangle, Mail, HardDrive as Drive, Bell, X } from 'lucide-react';

interface ConfigurationPanelProps {
  onClose: () => void;
}

interface Config {
  googleDrive: {
    enabled: boolean;
    apiKey: string;
    clientId: string;
    baseFolderId: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    defaultEmail: string;
  };
  system: {
    autoCreateFolders: boolean;
    autoSendNotifications: boolean;
    audienceReminderDays: number[];
  };
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ onClose }) => {
  const [config, setConfig] = useState<Config>(() => {
    const saved = localStorage.getItem('systemConfig');
    return saved ? JSON.parse(saved) : {
      googleDrive: {
        enabled: false,
        apiKey: '',
        clientId: '',
        baseFolderId: ''
      },
      notifications: {
        email: true,
        push: true,
        defaultEmail: 'admin@sistema-casos.com'
      },
      system: {
        autoCreateFolders: true,
        autoSendNotifications: true,
        audienceReminderDays: [10, 3, 1]
      }
    };
  });

  const [testResults, setTestResults] = useState<{
    googleDrive?: 'success' | 'error';
    notifications?: 'success' | 'error';
  }>({});

  const handleSave = () => {
    localStorage.setItem('systemConfig', JSON.stringify(config));
    
    // Configurar servicios
    if (config.googleDrive.enabled) {
      googleDriveService.setConfig(
        config.googleDrive.apiKey, 
        config.googleDrive.baseFolderId,
        config.googleDrive.clientId
      );
    }

    alert('Configuración guardada exitosamente');
    onClose();
  };

  const testGoogleDriveConnection = async () => {
    // Limpiar resultados anteriores
    setTestResults(prev => ({ ...prev, googleDrive: undefined }));
    
    // Mostrar mensaje de inicio
    const statusDiv = document.getElementById('google-drive-status');
    if (statusDiv) {
      statusDiv.innerHTML = '<div class="text-blue-600">🔄 Probando conexión...</div>';
    }
    
    try {
      if (!config.googleDrive.apiKey || !config.googleDrive.baseFolderId || !config.googleDrive.clientId) {
        const missing = [];
        if (!config.googleDrive.clientId) missing.push('Client ID');
        if (!config.googleDrive.apiKey) missing.push('API Key');
        if (!config.googleDrive.baseFolderId) missing.push('Folder ID');
        throw new Error(`Faltan campos requeridos: ${missing.join(', ')}`);
      }

      googleDriveService.setConfig(
        config.googleDrive.apiKey, 
        config.googleDrive.baseFolderId,
        config.googleDrive.clientId
      );
      
      console.log('🔧 [CONFIG] Probando conexión con Google Drive...');
      
      const authSuccess = await googleDriveService.initializeAuth();
      if (!authSuccess) {
        throw new Error('No se pudo autenticar con Google Drive');
      }
      
      setTestResults(prev => ({ ...prev, googleDrive: 'success' }));
      console.log('✅ [CONFIG] Test de Google Drive exitoso');
      
      if (statusDiv) {
        statusDiv.innerHTML = '<div class="text-green-600">✅ Conexión exitosa</div>';
      }
    } catch (error) {
      console.error('❌ [CONFIG] Error en test de Google Drive:', error);
      setTestResults(prev => ({ ...prev, googleDrive: 'error' }));
      if (statusDiv) {
        statusDiv.innerHTML = `<div class="text-red-600">❌ Error: ${error.message}</div>`;
      }
    }
  };

  const testNotifications = async () => {
    try {
      const success = await notificationService.sendEmailNotification(
        config.notifications.defaultEmail,
        'Test de Configuración',
        'Este es un email de prueba del sistema de gestión de casos.',
        'TEST-001'
      );

      setTestResults(prev => ({ 
        ...prev, 
        notifications: success ? 'success' : 'error' 
      }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, notifications: 'error' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Configuración del Sistema
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Google Drive Configuration */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Drive className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Integración con Google Drive</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="googleDriveEnabled"
                  checked={config.googleDrive.enabled}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    googleDrive: { ...prev.googleDrive, enabled: e.target.checked }
                  }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="googleDriveEnabled" className="text-sm font-medium text-gray-700">
                  Habilitar integración con Google Drive
                </label>
              </div>

              {config.googleDrive.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client ID de Google Drive
                    </label>
                    <input
                      type="text"
                      value={config.googleDrive.clientId}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        googleDrive: { ...prev.googleDrive, clientId: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123456789-abcdefg.apps.googleusercontent.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key de Google Drive
                    </label>
                    <input
                      type="text"
                      value={config.googleDrive.apiKey}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        googleDrive: { ...prev.googleDrive, apiKey: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="AIzaSyC..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID de Carpeta Base
                    </label>
                    <input
                      type="text"
                      value={config.googleDrive.baseFolderId}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        googleDrive: { ...prev.googleDrive, baseFolderId: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ID de la carpeta donde se crearán las carpetas de casos"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={testGoogleDriveConnection}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Probar Conexión
                    </button>
                    <div id="google-drive-status" className="flex-1"></div>
                    {testResults.googleDrive === 'success' && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Conexión exitosa</span>
                      </div>
                    )}
                    {testResults.googleDrive === 'error' && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm">Error de conexión</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notifications Configuration */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Configuración de Notificaciones</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={config.notifications.email}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, email: e.target.checked }
                  }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">
                  Habilitar notificaciones por email
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="pushNotifications"
                  checked={config.notifications.push}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, push: e.target.checked }
                  }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="pushNotifications" className="text-sm font-medium text-gray-700">
                  Habilitar notificaciones push
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email por defecto del sistema
                </label>
                <input
                  type="email"
                  value={config.notifications.defaultEmail}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, defaultEmail: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@sistema-casos.com"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={testNotifications}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Enviar Email de Prueba
                </button>
                {testResults.notifications === 'success' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Email enviado</span>
                  </div>
                )}
                {testResults.notifications === 'error' && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">Error al enviar</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Configuration */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Configuración del Sistema</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoCreateFolders"
                  checked={config.system.autoCreateFolders}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    system: { ...prev.system, autoCreateFolders: e.target.checked }
                  }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="autoCreateFolders" className="text-sm font-medium text-gray-700">
                  Crear carpetas automáticamente al registrar casos
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoSendNotifications"
                  checked={config.system.autoSendNotifications}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    system: { ...prev.system, autoSendNotifications: e.target.checked }
                  }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="autoSendNotifications" className="text-sm font-medium text-gray-700">
                  Enviar notificaciones automáticas
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días de recordatorio para audiencias (separados por coma)
                </label>
                <input
                  type="text"
                  value={config.system.audienceReminderDays.join(', ')}
                  onChange={(e) => {
                    const days = e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
                    setConfig(prev => ({
                      ...prev,
                      system: { ...prev.system, audienceReminderDays: days }
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10, 3, 1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se enviarán recordatorios estos días antes de cada audiencia
                </p>
              </div>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Instrucciones de Configuración</h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div>
                <strong>Google Drive API:</strong>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Ve a <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                  <li>Crea un proyecto o selecciona uno existente</li>
                  <li>Habilita la API de Google Drive</li>
                  <li>Crea credenciales OAuth 2.0 (Client ID) y API Key</li>
                  <li><strong>CRÍTICO:</strong> En OAuth 2.0 Client ID → Authorized JavaScript origins:</li>
                  <li className="ml-4 font-mono text-xs bg-gray-100 p-1 rounded">https://heroic-valkyrie-8b0e1f.netlify.app</li>
                  <li><strong>IMPORTANTE:</strong> Publica la app (OAuth consent screen → "PUBLISH APP")</li>
                  <li>O agrega tu email en "Test users" si mantienes en modo Testing</li>
                  <li>Copia el Client ID y API Key aquí</li>
                </ol>
              </div>
              
              <div>
                <strong>Carpeta Base:</strong>
                <p className="mt-1">Crea una carpeta en Google Drive donde se almacenarán todos los casos y copia su ID desde la URL.</p>
              </div>
              
              <div className="bg-red-100 p-3 rounded border border-red-300">
                <strong>🚨 Error 403 Forbidden - SOLUCIONES:</strong>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li><strong>Verifica el dominio:</strong> Debe ser exactamente <code>https://heroic-valkyrie-8b0e1f.netlify.app</code></li>
                  <li><strong>Google Drive API:</strong> Debe estar habilitada en tu proyecto</li>
                  <li><strong>Publica la app:</strong> OAuth consent screen → "PUBLISH APP" (recomendado)</li>
                  <li><strong>O agrega tu email:</strong> OAuth consent screen → Test users → Add users</li>
                  <li><strong>Espera 5-10 minutos:</strong> Los cambios pueden tardar en aplicarse</li>
                </ol>
              </div>
              
              <div className="bg-green-100 p-3 rounded border border-green-300">
                <strong>✅ Configuración correcta:</strong>
                <p className="mt-1">Client ID formato: <code>123456789-abc123.apps.googleusercontent.com</code></p>
                <p>API Key formato: <code>AIzaSyC...</code></p>
                <p>Folder ID formato: <code>1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms</code></p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};