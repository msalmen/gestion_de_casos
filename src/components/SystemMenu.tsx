import React from 'react';
import { Settings, Check, FileText, AlertTriangle, RefreshCw, FolderPlus, Archive, Trash2, Download } from 'lucide-react';

interface SystemMenuProps {
  onConfiguracion: () => void;
  onValidarConfiguracion: () => void;
  onGenerarReportes: () => void;
  onReporteDetallado: () => void;
  onVerAlertas: () => void;
  onActualizarEstados: () => void;
  onCrearCarpetasPendientes: () => void;
  onReorganizarCarpetas: () => void;
  onLimpiarDuplicados: () => void;
  onExportarCSV: () => void;
}

export const SystemMenu: React.FC<SystemMenuProps> = ({
  onConfiguracion,
  onValidarConfiguracion,
  onGenerarReportes,
  onReporteDetallado,
  onVerAlertas,
  onActualizarEstados,
  onCrearCarpetasPendientes,
  onReorganizarCarpetas,
  onLimpiarDuplicados,
  onExportarCSV
}) => {
  const menuItems = [
    {
      title: 'Configuración',
      items: [
        { name: 'Configuración Inicial', icon: Settings, action: onConfiguracion },
        { name: 'Validar Configuración', icon: Check, action: onValidarConfiguracion }
      ]
    },
    {
      title: 'Reportes',
      items: [
        { name: 'Generar Reportes de Estado', icon: FileText, action: onGenerarReportes },
        { name: 'Reporte Detallado', icon: FileText, action: onReporteDetallado }
      ]
    },
    {
      title: 'Alertas y Estados',
      items: [
        { name: 'Ver Alertas del Sistema', icon: AlertTriangle, action: onVerAlertas },
        { name: 'Actualizar Todos los Estados', icon: RefreshCw, action: onActualizarEstados }
      ]
    },
    {
      title: 'Gestión de Carpetas',
      items: [
        { name: 'Crear Carpetas Pendientes', icon: FolderPlus, action: onCrearCarpetasPendientes },
        { name: 'Reorganizar Carpetas por Año', icon: Archive, action: onReorganizarCarpetas }
      ]
    },
    {
      title: 'Mantenimiento',
      items: [
        { name: 'Limpiar Datos Duplicados', icon: Trash2, action: onLimpiarDuplicados },
        { name: 'Exportar a CSV', icon: Download, action: onExportarCSV }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Herramientas del Sistema</h2>
      
      <div className="space-y-6">
        {menuItems.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              {section.title}
            </h3>
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};