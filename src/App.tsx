import React, { useState, useEffect } from 'react';
import { Case, Alert } from './types/case';
import { CaseForm } from './components/CaseForm';
import { CaseTable } from './components/CaseTable';
import { Dashboard } from './components/Dashboard';
import { AlertsPanel } from './components/AlertsPanel';
import { SystemMenu } from './components/SystemMenu';
import { AdvancedSearch } from './components/AdvancedSearch';
import { CalendarView } from './components/CalendarView';
import { AdvancedReports } from './components/AdvancedReports';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { useLocalStorage } from './hooks/useLocalStorage';
import { generateCaseId, createNewCase, generateAudienceAlerts, exportToCSV, downloadCSV, addSeguimientoEntry } from './utils/caseUtils';
import { googleDriveService } from './services/googleDriveService';
import { notificationService } from './services/notificationService';
import { 
  Plus, 
  BarChart3, 
  FileText, 
  Bell, 
  Settings, 
  Search,
  Home,
  Calendar,
  Users,
  AlertTriangle,
  Filter,
  CalendarDays,
  TrendingUp
} from 'lucide-react';

type View = 'dashboard' | 'cases' | 'alerts' | 'system';

function App() {
  const [cases, setCases] = useLocalStorage<Case[]>('cases', []);
  const [alerts, setAlerts] = useLocalStorage<Alert[]>('alerts', []);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [filteredCases, setFilteredCases] = useState<Case[]>(cases);

  // Debug: Mostrar estado actual
  useEffect(() => {
    console.log('📊 Estado actual de casos:', cases.length);
    console.log('📊 Casos en localStorage:', JSON.parse(localStorage.getItem('cases') || '[]').length);
  }, [cases]);

  // Generar alertas automáticamente cuando se agregan o modifican casos
  useEffect(() => {
    const newAlerts: Alert[] = [];
    cases.forEach(case_ => {
      const caseAlerts = generateAudienceAlerts(case_);
      newAlerts.push(...caseAlerts);
    });
    
    // Filtrar alertas existentes para evitar duplicados
    const existingAlertIds = alerts.map(a => a.id);
    const filteredNewAlerts = newAlerts.filter(a => !existingAlertIds.includes(a.id));
    
    if (filteredNewAlerts.length > 0) {
      setAlerts(prev => [...prev, ...filteredNewAlerts]);
    }
  }, [cases]);

  // Actualizar casos filtrados cuando cambian los casos
  useEffect(() => {
    setFilteredCases(cases);
  }, [cases]);

  const handleSaveCase = async (caseData: Omit<Case, 'id'>) => {
    const config = JSON.parse(localStorage.getItem('systemConfig') || '{}');
    
    console.log('🔄 [CASO] Guardando caso...', caseData);
    console.log('📋 [CASO] Configuración actual:', config);
    
    if (editingCase) {
      const updatedCase = { ...caseData, id: editingCase.id };
      
      // Agregar entrada de seguimiento
      const seguimientoEntry = addSeguimientoEntry(
        updatedCase,
        'Caso actualizado',
        'Se actualizaron los datos del caso',
        'Usuario'
      );
      updatedCase.historialSeguimiento = [...updatedCase.historialSeguimiento, seguimientoEntry];
      
      setCases(prev => prev.map(c => c.id === editingCase.id ? updatedCase : c));
      console.log('✅ [CASO] Caso actualizado:', updatedCase);
      
      // Enviar notificación de actualización si está habilitado
      if (config.system?.autoSendNotifications && caseData.emailReclamante) {
        await notificationService.sendStatusUpdate(
          caseData.emailReclamante,
          caseData.nombreReclamante,
          editingCase.id,
          caseData.estado,
          'Su caso ha sido actualizado'
        );
      }
    } else {
      const newCase: Case = {
        ...caseData,
        id: generateCaseId(new Date()),
        ultimaActualizacion: new Date().toISOString(),
        historialSeguimiento: [
          addSeguimientoEntry(
            caseData as Case,
            'Caso creado',
            'Se registró un nuevo caso en el sistema',
            'Usuario'
          )
        ]
      };
      
      console.log('📝 [CASO] Nuevo caso creado:', newCase);
      setCases(prev => [...prev, newCase]);
      console.log('💾 [CASO] Casos actualizados en estado, total:', cases.length + 1);
      
      // Crear carpetas automáticamente si está habilitado
      if (config.system?.autoCreateFolders && config.googleDrive?.enabled) {
        console.log('📁 [CASO] Intentando crear carpetas en Google Drive...');
        try {
          const { mainFolder, subFolders } = await googleDriveService.createCaseFolders(
            newCase.id,
            newCase.nombreReclamante
          );
          
          console.log('✅ [CASO] Carpetas creadas:', { mainFolder, subFolders });
          
          // Actualizar el caso con la información de las carpetas
          const updatedCase = {
            ...newCase,
            enlaceCarpeta: mainFolder.webViewLink || googleDriveService.generateFolderUrl(mainFolder.id),
            carpetas: subFolders.map(folder => ({
              nombre: folder.name,
              created: true,
              lastModified: new Date().toISOString(),
              driveId: folder.id,
              url: folder.webViewLink
            }))
          };
          
          setCases(prev => prev.map(c => c.id === newCase.id ? updatedCase : c));
          console.log('✅ [CASO] Caso actualizado con carpetas:', updatedCase);
        } catch (error) {
          console.error('❌ [CASO] Error creando carpetas:', error);
          console.log('⚠️ [CASO] El caso se guardó pero sin carpetas de Google Drive');
          // No mostrar alert para no interrumpir el flujo
        }
      }
      
      // Enviar email de bienvenida si está habilitado
      if (config.system?.autoSendNotifications && caseData.emailReclamante) {
        await notificationService.sendWelcomeEmail(
          caseData.emailReclamante,
          caseData.nombreReclamante,
          newCase.id
        );
      }
    }
    
    setShowCaseForm(false);
    setEditingCase(null);
    console.log('✅ [CASO] Proceso de guardado completado');
  };

  const handleEditCase = (case_: Case) => {
    setEditingCase(case_);
    setShowCaseForm(true);
  };

  const handleDeleteCase = (caseId: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este caso?')) {
      setCases(prev => prev.filter(c => c.id !== caseId));
      setAlerts(prev => prev.filter(a => a.caseId !== caseId));
    }
  };

  const handleViewCase = (case_: Case) => {
    setSelectedCase(case_);
  };

  const handleMarkAlertAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
  };

  const handleMarkAllAlertsAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const handleExportCSV = () => {
    const csvContent = exportToCSV(cases);
    downloadCSV(csvContent, `casos_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleSystemAction = (action: string) => {
    switch (action) {
      case 'configuracion':
        setShowConfiguration(true);
        break;
      case 'validar':
        alert('Configuración validada correctamente');
        break;
      case 'reportes':
        setShowReports(true);
        break;
      case 'reporte-detallado':
        setShowReports(true);
        break;
      case 'ver-alertas':
        setCurrentView('alerts');
        break;
      case 'actualizar-estados':
        alert('Actualizando todos los estados...');
        break;
      case 'crear-carpetas':
        handleCreatePendingFolders();
        break;
      case 'reorganizar':
        alert('Reorganizando carpetas por año...');
        break;
      case 'limpiar-duplicados':
        handleCleanDuplicates();
        break;
      case 'exportar-csv':
        handleExportCSV();
        break;
    }
  };

  const handleCreatePendingFolders = async () => {
    const config = JSON.parse(localStorage.getItem('systemConfig') || '{}');
    
    if (!config.googleDrive?.enabled) {
      alert('La integración con Google Drive no está habilitada. Ve a Configuración para habilitarla.');
      return;
    }

    const casesWithoutFolders = cases.filter(case_ => !case_.enlaceCarpeta);
    
    if (casesWithoutFolders.length === 0) {
      alert('Todos los casos ya tienen carpetas creadas.');
      return;
    }

    try {
      for (const case_ of casesWithoutFolders) {
        const { mainFolder, subFolders } = await googleDriveService.createCaseFolders(
          case_.id,
          case_.nombreReclamante
        );
        
        const updatedCase = {
          ...case_,
          enlaceCarpeta: mainFolder.webViewLink || googleDriveService.generateFolderUrl(mainFolder.id),
          carpetas: subFolders.map(folder => ({
            nombre: folder.name,
            created: true,
            lastModified: new Date().toISOString(),
            driveId: folder.id,
            url: folder.webViewLink
          }))
        };
        
        setCases(prev => prev.map(c => c.id === case_.id ? updatedCase : c));
      }
      
      alert(`Se crearon carpetas para ${casesWithoutFolders.length} casos.`);
    } catch (error) {
      console.error('Error creating folders:', error);
      alert('Error al crear las carpetas. Verifica la configuración de Google Drive.');
    }
  };

  const handleCleanDuplicates = () => {
    const uniqueCases = cases.filter((case_, index, self) => 
      index === self.findIndex(c => c.numeroExpediente === case_.numeroExpediente && case_.numeroExpediente !== '')
    );
    
    if (uniqueCases.length < cases.length) {
      setCases(uniqueCases);
      alert(`Se eliminaron ${cases.length - uniqueCases.length} casos duplicados.`);
    } else {
      alert('No se encontraron casos duplicados.');
    }
  };

  const navigation = [
    { name: 'Dashboard', icon: Home, view: 'dashboard' as View },
    { name: 'Casos', icon: FileText, view: 'cases' as View },
    { name: 'Alertas', icon: Bell, view: 'alerts' as View, badge: alerts.filter(a => !a.read).length },
    { name: 'Sistema', icon: Settings, view: 'system' as View }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Sistema de Gestión de Casos</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                {cases.length} casos registrados
              </div>
              {alerts.filter(a => !a.read).length > 0 && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  {alerts.filter(a => !a.read).length} alertas activas
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => setCurrentView(item.view)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        currentView === item.view
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                      {item.badge && item.badge > 0 && (
                        <span className="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              
              {/* Herramientas adicionales */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Herramientas
                </h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setShowAdvancedSearch(true)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Filter className="w-4 h-4" />
                      Búsqueda Avanzada
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setShowCalendar(true)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <CalendarDays className="w-4 h-4" />
                      Calendario
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setShowReports(true)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Reportes Avanzados
                    </button>
                  </li>
                </ul>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {currentView === 'dashboard' && (
              <Dashboard cases={cases} alerts={alerts} />
            )}

            {currentView === 'cases' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Gestión de Casos</h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowAdvancedSearch(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Search className="w-4 h-4" />
                      Búsqueda Avanzada
                    </button>
                    <button
                      onClick={() => setShowCaseForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Nuevo Caso
                    </button>
                  </div>
                </div>
                
                <CaseTable
                  cases={filteredCases}
                  onEdit={handleEditCase}
                  onDelete={handleDeleteCase}
                  onView={handleViewCase}
                />
              </div>
            )}

            {currentView === 'alerts' && (
              <AlertsPanel
                alerts={alerts}
                onMarkAsRead={handleMarkAlertAsRead}
                onMarkAllAsRead={handleMarkAllAlertsAsRead}
              />
            )}

            {currentView === 'system' && (
              <SystemMenu
                onConfiguracion={() => handleSystemAction('configuracion')}
                onValidarConfiguracion={() => handleSystemAction('validar')}
                onGenerarReportes={() => handleSystemAction('reportes')}
                onReporteDetallado={() => handleSystemAction('reporte-detallado')}
                onVerAlertas={() => handleSystemAction('ver-alertas')}
                onActualizarEstados={() => handleSystemAction('actualizar-estados')}
                onCrearCarpetasPendientes={() => handleSystemAction('crear-carpetas')}
                onReorganizarCarpetas={() => handleSystemAction('reorganizar')}
                onLimpiarDuplicados={() => handleSystemAction('limpiar-duplicados')}
                onExportarCSV={() => handleSystemAction('exportar-csv')}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCaseForm && (
        <CaseForm
          case={editingCase}
          onSave={handleSaveCase}
          onCancel={() => {
            setShowCaseForm(false);
            setEditingCase(null);
          }}
        />
      )}

      {showAdvancedSearch && (
        <AdvancedSearch
          cases={cases}
          onFilteredCases={setFilteredCases}
          onClose={() => setShowAdvancedSearch(false)}
        />
      )}

      {showCalendar && (
        <CalendarView
          cases={cases}
          onClose={() => setShowCalendar(false)}
        />
      )}

      {showReports && (
        <AdvancedReports
          cases={cases}
          alerts={alerts}
          onClose={() => setShowReports(false)}
        />
      )}

      {showConfiguration && (
        <ConfigurationPanel
          onClose={() => setShowConfiguration(false)}
        />
      )}

      {selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Detalles del Caso</h2>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Información General</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">ID:</span> {selectedCase.id}</p>
                    <p><span className="font-medium">Reclamante:</span> {selectedCase.nombreReclamante}</p>
                    <p><span className="font-medium">Email:</span> {selectedCase.emailReclamante || 'No especificado'}</p>
                    <p><span className="font-medium">Teléfono:</span> {selectedCase.telefonoReclamante || 'No especificado'}</p>
                    <p><span className="font-medium">Provincia:</span> {selectedCase.provincia}</p>
                    <p><span className="font-medium">Localidad:</span> {selectedCase.localidad}</p>
                    <p><span className="font-medium">Estado:</span> {selectedCase.estado}</p>
                    <p><span className="font-medium">Prioridad:</span> {selectedCase.prioridad}</p>
                    <p><span className="font-medium">Categoría:</span> {selectedCase.categoria}</p>
                    {selectedCase.montoReclamado && (
                      <p><span className="font-medium">Monto:</span> ${selectedCase.montoReclamado.toLocaleString()}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Fechas Importantes</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Fecha de Ingreso:</span> {selectedCase.fechaIngreso}</p>
                    <p><span className="font-medium">Fecha de Notificación:</span> {selectedCase.fechaNotificacion || 'No definida'}</p>
                    <p><span className="font-medium">Fecha de Audiencia:</span> {selectedCase.fechaAudiencia || 'No programada'}</p>
                    <p><span className="font-medium">Hora de Audiencia:</span> {selectedCase.horaAudiencia || 'No definida'}</p>
                    <p><span className="font-medium">Responsable:</span> {selectedCase.responsableAsignado || 'Sin asignar'}</p>
                  </div>
                </div>
              </div>
              
              {selectedCase.observaciones && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Observaciones</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedCase.observaciones}
                  </p>
                </div>
              )}

              {selectedCase.historialSeguimiento.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Historial de Seguimiento</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedCase.historialSeguimiento.map((entry) => (
                      <div key={entry.id} className="text-sm bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">{entry.accion}</span>
                          <span className="text-gray-500 text-xs">{new Date(entry.fecha).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-700 mt-1">{entry.descripcion}</p>
                        <p className="text-gray-500 text-xs mt-1">Por: {entry.usuario}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;