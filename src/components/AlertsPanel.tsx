import React from 'react';
import { Alert } from '../types/case';
import { AlertTriangle, CheckCircle, Clock, Calendar, Bell, BellOff } from 'lucide-react';
import { format } from 'date-fns';

interface AlertsPanelProps {
  alerts: Alert[];
  onMarkAsRead: (alertId: string) => void;
  onMarkAllAsRead: () => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onMarkAsRead, onMarkAllAsRead }) => {
  const unreadAlerts = alerts.filter(alert => !alert.read);
  const readAlerts = alerts.filter(alert => alert.read);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'audiencia_1_dia':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'audiencia_3_dias':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'audiencia_10_dias':
        return <Calendar className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'audiencia_1_dia':
        return 'border-red-200 bg-red-50';
      case 'audiencia_3_dias':
        return 'border-orange-200 bg-orange-50';
      case 'audiencia_10_dias':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Alertas del Sistema</h2>
        {unreadAlerts.length > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Alertas no leídas */}
      {unreadAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-500" />
              Alertas Activas ({unreadAlerts.length})
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {unreadAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getAlertColor(alert.type)} transition-all`}
              >
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{alert.message}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Caso: {alert.caseId}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {format(new Date(alert.date), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <button
                    onClick={() => onMarkAsRead(alert.id)}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Marcar como leída
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alertas leídas */}
      {readAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BellOff className="w-5 h-5 text-gray-400" />
              Alertas Leídas ({readAlerts.length})
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {readAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-lg border border-gray-200 bg-gray-50 opacity-75"
              >
                <div className="flex items-start gap-3">
                  <div className="opacity-50">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-700">{alert.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Caso: {alert.caseId}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {format(new Date(alert.date), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sin alertas */}
      {alerts.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay alertas</h3>
          <p className="text-gray-500">El sistema no ha generado alertas aún.</p>
        </div>
      )}
    </div>
  );
};