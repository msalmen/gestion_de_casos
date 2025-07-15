import React, { useState } from 'react';
import { Case } from '../types/case';
import { Search, Filter, X, Calendar, MapPin, User, Building, AlertTriangle } from 'lucide-react';
import Select from 'react-select';

interface AdvancedSearchProps {
  cases: Case[];
  onFilteredCases: (filteredCases: Case[]) => void;
  onClose: () => void;
}

interface SearchFilters {
  searchTerm: string;
  estado: string[];
  prioridad: string[];
  provincia: string[];
  responsable: string[];
  fechaIngresoDesde: string;
  fechaIngresoHasta: string;
  fechaAudienciaDesde: string;
  fechaAudienciaHasta: string;
  categoria: string[];
  montoMinimo: number | null;
  montoMaximo: number | null;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ cases, onFilteredCases, onClose }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    estado: [],
    prioridad: [],
    provincia: [],
    responsable: [],
    fechaIngresoDesde: '',
    fechaIngresoHasta: '',
    fechaAudienciaDesde: '',
    fechaAudienciaHasta: '',
    categoria: [],
    montoMinimo: null,
    montoMaximo: null
  });

  const estadoOptions = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'audiencia_programada', label: 'Audiencia Programada' },
    { value: 'resuelto', label: 'Resuelto' },
    { value: 'cerrado', label: 'Cerrado' }
  ];

  const prioridadOptions = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'urgente', label: 'Urgente' }
  ];

  // Extraer opciones únicas de los casos
  const provinciaOptions = [...new Set(cases.map(c => c.provincia))].filter(Boolean).map(p => ({ value: p, label: p }));
  const responsableOptions = [...new Set(cases.map(c => c.responsableAsignado))].filter(Boolean).map(r => ({ value: r, label: r }));
  const categoriaOptions = [...new Set(cases.map(c => c.categoria))].filter(Boolean).map(c => ({ value: c, label: c }));

  const applyFilters = () => {
    let filteredCases = cases;

    // Búsqueda por texto
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredCases = filteredCases.filter(case_ =>
        case_.nombreReclamante.toLowerCase().includes(searchLower) ||
        case_.id.toLowerCase().includes(searchLower) ||
        case_.casaVendedora.toLowerCase().includes(searchLower) ||
        case_.productoServicio.toLowerCase().includes(searchLower) ||
        case_.observaciones.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por estado
    if (filters.estado.length > 0) {
      filteredCases = filteredCases.filter(case_ => filters.estado.includes(case_.estado));
    }

    // Filtro por prioridad
    if (filters.prioridad.length > 0) {
      filteredCases = filteredCases.filter(case_ => filters.prioridad.includes(case_.prioridad));
    }

    // Filtro por provincia
    if (filters.provincia.length > 0) {
      filteredCases = filteredCases.filter(case_ => filters.provincia.includes(case_.provincia));
    }

    // Filtro por responsable
    if (filters.responsable.length > 0) {
      filteredCases = filteredCases.filter(case_ => filters.responsable.includes(case_.responsableAsignado));
    }

    // Filtro por categoría
    if (filters.categoria.length > 0) {
      filteredCases = filteredCases.filter(case_ => filters.categoria.includes(case_.categoria));
    }

    // Filtro por fecha de ingreso
    if (filters.fechaIngresoDesde) {
      filteredCases = filteredCases.filter(case_ => case_.fechaIngreso >= filters.fechaIngresoDesde);
    }
    if (filters.fechaIngresoHasta) {
      filteredCases = filteredCases.filter(case_ => case_.fechaIngreso <= filters.fechaIngresoHasta);
    }

    // Filtro por fecha de audiencia
    if (filters.fechaAudienciaDesde) {
      filteredCases = filteredCases.filter(case_ => case_.fechaAudiencia && case_.fechaAudiencia >= filters.fechaAudienciaDesde);
    }
    if (filters.fechaAudienciaHasta) {
      filteredCases = filteredCases.filter(case_ => case_.fechaAudiencia && case_.fechaAudiencia <= filters.fechaAudienciaHasta);
    }

    // Filtro por monto
    if (filters.montoMinimo !== null) {
      filteredCases = filteredCases.filter(case_ => case_.montoReclamado && case_.montoReclamado >= filters.montoMinimo!);
    }
    if (filters.montoMaximo !== null) {
      filteredCases = filteredCases.filter(case_ => case_.montoReclamado && case_.montoReclamado <= filters.montoMaximo!);
    }

    onFilteredCases(filteredCases);
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      estado: [],
      prioridad: [],
      provincia: [],
      responsable: [],
      fechaIngresoDesde: '',
      fechaIngresoHasta: '',
      fechaAudienciaDesde: '',
      fechaAudienciaHasta: '',
      categoria: [],
      montoMinimo: null,
      montoMaximo: null
    });
    onFilteredCases(cases);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Search className="w-6 h-6" />
              Búsqueda Avanzada
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Búsqueda por texto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Búsqueda General
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                placeholder="Buscar en nombre, ID, casa vendedora, producto..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtros por selección múltiple */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <Select
                isMulti
                options={estadoOptions}
                value={estadoOptions.filter(option => filters.estado.includes(option.value))}
                onChange={(selected) => setFilters(prev => ({ 
                  ...prev, 
                  estado: selected ? selected.map(s => s.value) : [] 
                }))}
                placeholder="Seleccionar estados..."
                className="text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
              <Select
                isMulti
                options={prioridadOptions}
                value={prioridadOptions.filter(option => filters.prioridad.includes(option.value))}
                onChange={(selected) => setFilters(prev => ({ 
                  ...prev, 
                  prioridad: selected ? selected.map(s => s.value) : [] 
                }))}
                placeholder="Seleccionar prioridades..."
                className="text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Provincia</label>
              <Select
                isMulti
                options={provinciaOptions}
                value={provinciaOptions.filter(option => filters.provincia.includes(option.value))}
                onChange={(selected) => setFilters(prev => ({ 
                  ...prev, 
                  provincia: selected ? selected.map(s => s.value) : [] 
                }))}
                placeholder="Seleccionar provincias..."
                className="text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Responsable</label>
              <Select
                isMulti
                options={responsableOptions}
                value={responsableOptions.filter(option => filters.responsable.includes(option.value))}
                onChange={(selected) => setFilters(prev => ({ 
                  ...prev, 
                  responsable: selected ? selected.map(s => s.value) : [] 
                }))}
                placeholder="Seleccionar responsables..."
                className="text-sm"
              />
            </div>
          </div>

          {/* Filtros por fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha de Ingreso
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.fechaIngresoDesde}
                  onChange={(e) => setFilters(prev => ({ ...prev, fechaIngresoDesde: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Desde"
                />
                <input
                  type="date"
                  value={filters.fechaIngresoHasta}
                  onChange={(e) => setFilters(prev => ({ ...prev, fechaIngresoHasta: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Hasta"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha de Audiencia
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.fechaAudienciaDesde}
                  onChange={(e) => setFilters(prev => ({ ...prev, fechaAudienciaDesde: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Desde"
                />
                <input
                  type="date"
                  value={filters.fechaAudienciaHasta}
                  onChange={(e) => setFilters(prev => ({ ...prev, fechaAudienciaHasta: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Hasta"
                />
              </div>
            </div>
          </div>

          {/* Filtros por monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto Reclamado
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={filters.montoMinimo || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  montoMinimo: e.target.value ? parseFloat(e.target.value) : null 
                }))}
                placeholder="Monto mínimo"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <input
                type="number"
                value={filters.montoMaximo || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  montoMaximo: e.target.value ? parseFloat(e.target.value) : null 
                }))}
                placeholder="Monto máximo"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Limpiar Filtros
            </button>
            <button
              onClick={applyFilters}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};