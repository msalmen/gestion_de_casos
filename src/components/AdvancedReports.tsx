import React, { useState, useEffect } from 'react';
import { Case, Alert, Report } from '../types/case';
import { reportService } from '../services/reportService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart 
} from 'recharts';
import { 
  FileText, Download, TrendingUp, Users, Clock, AlertTriangle, 
  Target, Award, Activity, Calendar, X 
} from 'lucide-react';

interface AdvancedReportsProps {
  cases: Case[];
  alerts: Alert[];
  onClose: () => void;
}

export const AdvancedReports: React.FC<AdvancedReportsProps> = ({ cases, alerts, onClose }) => {
  const [report, setReport] = useState<Report | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'performance' | 'detailed'>('overview');

  useEffect(() => {
    const generatedReport = reportService.generateAdvancedReport(cases, alerts);
    setReport(generatedReport);
    setChartData(reportService.generateChartData(generatedReport));
  }, [cases, alerts]);

  const handleExportPDF = async () => {
    if (report) {
      await reportService.generatePDFReport(report, cases);
    }
  };

  const handleExportDetailedCSV = async () => {
    await reportService.exportDetailedCSV(cases);
  };

  if (!report || !chartData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generando reportes...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Resumen General', icon: FileText },
    { id: 'trends', name: 'Tendencias', icon: TrendingUp },
    { id: 'performance', name: 'Rendimiento', icon: Target },
    { id: 'detailed', name: 'Análisis Detallado', icon: Activity }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Reportes Avanzados
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar PDF
              </button>
              <button
                onClick={handleExportDetailedCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar CSV Detallado
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Métricas principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total de Casos</p>
                      <p className="text-3xl font-bold">{report.totalCases}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Tasa de Resolución</p>
                      <p className="text-3xl font-bold">{report.performanceMetrics.resolutionRate.toFixed(1)}%</p>
                    </div>
                    <Award className="w-8 h-8 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Tiempo Promedio</p>
                      <p className="text-3xl font-bold">{report.averageResolutionTime.toFixed(1)}</p>
                      <p className="text-orange-100 text-sm">días</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100">Casos Vencidos</p>
                      <p className="text-3xl font-bold">{report.overdueCases}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-200" />
                  </div>
                </div>
              </div>

              {/* Gráficos principales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Estado</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.statusChart}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.statusChart.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Prioridad</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.priorityChart}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.priorityChart.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencias Mensuales</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="creados" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="resueltos" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="pendientes" stackId="3" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución de Casos</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="creados" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="resueltos" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {report.performanceMetrics.resolutionRate.toFixed(1)}%
                  </div>
                  <div className="text-gray-600">Tasa de Resolución</div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {report.performanceMetrics.averageResponseTime}
                  </div>
                  <div className="text-gray-600">Tiempo Promedio (días)</div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {report.performanceMetrics.customerSatisfaction.toFixed(1)}/5
                  </div>
                  <div className="text-gray-600">Satisfacción Cliente</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Carga de Trabajo por Responsable</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.workloadChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="responsable" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="casos" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'detailed' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis por Estado</h3>
                  <div className="space-y-3">
                    {Object.entries(report.byState).map(([state, count]) => (
                      <div key={state} className="flex justify-between items-center">
                        <span className="text-gray-600 capitalize">{state.replace('_', ' ')}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis por Prioridad</h3>
                  <div className="space-y-3">
                    {Object.entries(report.byPriority).map(([priority, count]) => (
                      <div key={priority} className="flex justify-between items-center">
                        <span className="text-gray-600 capitalize">{priority}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Ejecutivo</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 mb-4">
                    El sistema actualmente gestiona <strong>{report.totalCases}</strong> casos con una tasa de resolución del{' '}
                    <strong>{report.performanceMetrics.resolutionRate.toFixed(1)}%</strong>. 
                    El tiempo promedio de resolución es de <strong>{report.averageResolutionTime.toFixed(1)} días</strong>.
                  </p>
                  
                  {report.overdueCases > 0 && (
                    <p className="text-red-600 mb-4">
                      ⚠️ Atención: Hay <strong>{report.overdueCases}</strong> casos vencidos que requieren atención inmediata.
                    </p>
                  )}
                  
                  <p className="text-gray-700 mb-4">
                    Se tienen <strong>{report.upcomingAudiences}</strong> audiencias programadas para los próximos 30 días.
                    La satisfacción del cliente promedio es de <strong>{report.performanceMetrics.customerSatisfaction.toFixed(1)}/5</strong>.
                  </p>
                  
                  <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Recomendaciones:</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Priorizar la resolución de casos vencidos</li>
                    <li>Implementar seguimiento automático para casos en proceso</li>
                    <li>Balancear la carga de trabajo entre responsables</li>
                    <li>Establecer metas de tiempo de resolución por tipo de caso</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};