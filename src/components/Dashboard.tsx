import React from 'react';
import { Case, Alert } from '../types/case';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Clock, AlertTriangle, CheckCircle, FileText, Users, TrendingUp, Activity } from 'lucide-react';

interface DashboardProps {
  cases: Case[];
  alerts: Alert[];
}

export const Dashboard: React.FC<DashboardProps> = ({ cases, alerts }) => {
  const totalCases = cases.length;
  const pendingCases = cases.filter(c => c.estado === 'pendiente').length;
  const resolvedCases = cases.filter(c => c.estado === 'resuelto').length;
  const activeAlerts = alerts.filter(a => !a.read).length;

  const statusData = [
    { name: 'Pendiente', value: cases.filter(c => c.estado === 'pendiente').length, color: '#F59E0B' },
    { name: 'En Proceso', value: cases.filter(c => c.estado === 'en_proceso').length, color: '#3B82F6' },
    { name: 'Audiencia Programada', value: cases.filter(c => c.estado === 'audiencia_programada').length, color: '#8B5CF6' },
    { name: 'Resuelto', value: cases.filter(c => c.estado === 'resuelto').length, color: '#10B981' },
    { name: 'Cerrado', value: cases.filter(c => c.estado === 'cerrado').length, color: '#6B7280' }
  ];

  const monthlyData = cases.reduce((acc, case_) => {
    const month = new Date(case_.fechaIngreso).toLocaleString('es-ES', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(monthlyData).map(([month, count]) => ({
    month,
    casos: count
  }));

  const upcomingAudiences = cases.filter(c => {
    if (!c.fechaAudiencia) return false;
    const audienceDate = new Date(c.fechaAudiencia);
    const today = new Date();
    const diffTime = audienceDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Casos</p>
              <p className="text-2xl font-bold text-gray-900">{totalCases}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Casos Pendientes</p>
              <p className="text-2xl font-bold text-orange-600">{pendingCases}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Casos Resueltos</p>
              <p className="text-2xl font-bold text-green-600">{resolvedCases}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alertas Activas</p>
              <p className="text-2xl font-bold text-red-600">{activeAlerts}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras - Casos por mes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Casos por Mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="casos" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de torta - Estados */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estados de Casos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Audiencias próximas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Audiencias Próximas (7 días)</h3>
        {upcomingAudiences.length > 0 ? (
          <div className="space-y-3">
            {upcomingAudiences.map((case_) => (
              <div key={case_.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-gray-900">{case_.nombreReclamante}</p>
                    <p className="text-sm text-gray-600">{case_.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{case_.fechaAudiencia}</p>
                  <p className="text-sm text-gray-600">{case_.horaAudiencia}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay audiencias programadas para los próximos 7 días.</p>
        )}
      </div>

      {/* Alertas recientes */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Recientes</h3>
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg border ${alert.read ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 ${alert.read ? 'text-gray-400' : 'text-red-500'}`} />
                  <div className="flex-1">
                    <p className={`font-medium ${alert.read ? 'text-gray-600' : 'text-gray-900'}`}>
                      {alert.message}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Caso: {alert.caseId}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay alertas disponibles.</p>
        )}
      </div>
    </div>
  );
};