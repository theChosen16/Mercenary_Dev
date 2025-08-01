'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Filter, X, Star, MapPin, Clock, DollarSign, Zap, Users, TrendingUp } from 'lucide-react'
import { IntelligentSearchService, SearchFilters, SearchResult } from '@/lib/search'
import { debounce } from '@/lib/utils'

interface AdvancedSearchProps {
  onResults?: (results: SearchResult) => void
  initialFilters?: Partial<SearchFilters>
  showFilters?: boolean
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onResults,
  initialFilters = {},
  showFilters = true
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sortBy: 'relevance',
    sortOrder: 'desc',
    ...initialFilters
  })
  
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchFilters: SearchFilters) => {
      setLoading(true)
      try {
        const searchResults = await IntelligentSearchService.searchProjects(
          searchFilters,
          undefined, // userId would come from session
          1,
          20
        )
        setResults(searchResults)
        onResults?.(searchResults)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }, 300),
    [onResults]
  )

  // Auto-complete suggestions
  const getSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([])
        return
      }
      
      try {
        const skillSuggestions = await IntelligentSearchService.getAutocompleteSuggestions(
          query,
          'skills'
        )
        setSuggestions(skillSuggestions)
      } catch (error) {
        console.error('Suggestions error:', error)
      }
    }, 200),
    []
  )

  // Effect for search
  useEffect(() => {
    if (filters.query || Object.keys(filters).length > 2) {
      debouncedSearch(filters)
    }
  }, [filters, debouncedSearch])

  // Effect for suggestions
  useEffect(() => {
    if (filters.query) {
      getSuggestions(filters.query)
    }
  }, [filters.query, getSuggestions])

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setShowSuggestions(false)
  }

  const handleSkillToggle = (skill: string) => {
    const currentSkills = filters.skills || []
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill]
    
    handleFilterChange('skills', newSkills)
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      sortBy: 'relevance',
      sortOrder: 'desc'
    })
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleFilterChange('query', suggestion)
    setShowSuggestions(false)
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar proyectos, habilidades, categorías..."
            value={filters.query || ''}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full pl-12 pr-16 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          />
          {showFilters && (
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500 transition-colors"
              title="Mostrar filtros avanzados"
              aria-label="Mostrar filtros avanzados"
            >
              <Filter className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Auto-complete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <span>{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && showAdvancedFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Filtros Avanzados</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Seleccionar categoría"
              >
                <option value="">Todas las categorías</option>
                <option value="Desarrollo Web">Desarrollo Web</option>
                <option value="Aplicaciones Móviles">Aplicaciones Móviles</option>
                <option value="Diseño UI/UX">Diseño UI/UX</option>
                <option value="Marketing Digital">Marketing Digital</option>
                <option value="Redacción">Redacción</option>
                <option value="Consultoría">Consultoría</option>
              </select>
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Presupuesto
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Mín"
                  value={filters.budgetMin || ''}
                  onChange={(e) => handleFilterChange('budgetMin', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Máx"
                  value={filters.budgetMax || ''}
                  onChange={(e) => handleFilterChange('budgetMax', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dificultad
              </label>
              <select
                value={filters.difficulty || ''}
                onChange={(e) => handleFilterChange('difficulty', e.target.value || undefined)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Seleccionar dificultad"
              >
                <option value="">Cualquier nivel</option>
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Trabajo
              </label>
              <select
                value={filters.projectType || ''}
                onChange={(e) => handleFilterChange('projectType', e.target.value || undefined)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Seleccionar tipo de trabajo"
              >
                <option value="">Cualquier tipo</option>
                <option value="remote">Remoto</option>
                <option value="onsite">Presencial</option>
                <option value="hybrid">Híbrido</option>
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plazo
              </label>
              <select
                value={filters.deadline || ''}
                onChange={(e) => handleFilterChange('deadline', e.target.value || undefined)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Seleccionar plazo"
              >
                <option value="">Cualquier plazo</option>
                <option value="urgent">Urgente (1-3 días)</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            {/* Client Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calificación del Cliente
              </label>
              <select
                value={filters.clientRating || ''}
                onChange={(e) => handleFilterChange('clientRating', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Seleccionar calificación mínima"
              >
                <option value="">Cualquier calificación</option>
                <option value="4.5">4.5+ estrellas</option>
                <option value="4.0">4.0+ estrellas</option>
                <option value="3.5">3.5+ estrellas</option>
                <option value="3.0">3.0+ estrellas</option>
              </select>
            </div>
          </div>

          {/* Skills Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Habilidades Requeridas
            </label>
            <div className="flex flex-wrap gap-2">
              {['JavaScript', 'React', 'Node.js', 'Python', 'PHP', 'WordPress', 'Figma', 'Photoshop', 'SEO', 'Google Ads'].map((skill) => (
                <button
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filters.skills?.includes(skill)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                  {filters.skills?.includes(skill) && (
                    <X className="inline-block w-3 h-3 ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Ordenar por:
            </label>
            <select
              value={filters.sortBy || 'relevance'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Ordenar resultados por"
            >
              <option value="relevance">Relevancia</option>
              <option value="recent">Más recientes</option>
              <option value="budget">Presupuesto</option>
              <option value="deadline">Fecha límite</option>
              <option value="rating">Calificación del cliente</option>
            </select>
          </div>

          {/* Verified Clients Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="verified"
              checked={filters.verified || false}
              onChange={(e) => handleFilterChange('verified', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="verified" className="text-sm font-medium text-gray-700">
              Solo clientes verificados
            </label>
          </div>
        </div>
      )}

      {/* Search Results Summary */}
      {results && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {results.totalResults} proyectos encontrados
              </span>
              {loading && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-sm text-gray-500">Buscando...</span>
                </div>
              )}
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>Promedio: $15,000</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>2-4 semanas</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>5 aplicaciones/proyecto</span>
              </div>
            </div>
          </div>

          {/* Search Suggestions */}
          {results.suggestions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-500 mr-2">Búsquedas relacionadas:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {results.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleFilterChange('query', suggestion)}
                    className="text-xs bg-white px-3 py-1 rounded-full border border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Summary */}
      {Object.keys(filters).some(key => filters[key as keyof SearchFilters] && key !== 'sortBy' && key !== 'sortOrder') && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {filters.category}
              <button
                onClick={() => handleFilterChange('category', undefined)}
                className="ml-1 hover:text-blue-600"
                title="Remover filtro de categoría"
                aria-label="Remover filtro de categoría"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.budgetMin && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Min: ${filters.budgetMin.toLocaleString()}
              <button
                onClick={() => handleFilterChange('budgetMin', undefined)}
                className="ml-1 hover:text-green-600"
                title="Remover filtro de presupuesto mínimo"
                aria-label="Remover filtro de presupuesto mínimo"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.budgetMax && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Max: ${filters.budgetMax.toLocaleString()}
              <button
                onClick={() => handleFilterChange('budgetMax', undefined)}
                className="ml-1 hover:text-green-600"
                title="Remover filtro de presupuesto máximo"
                aria-label="Remover filtro de presupuesto máximo"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.skills && filters.skills.length > 0 && (
            <>
              {filters.skills.map((skill) => (
                <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {skill}
                  <button
                    onClick={() => handleSkillToggle(skill)}
                    className="ml-1 hover:text-purple-600"
                    title={`Remover habilidad ${skill}`}
                    aria-label={`Remover habilidad ${skill}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default AdvancedSearch
