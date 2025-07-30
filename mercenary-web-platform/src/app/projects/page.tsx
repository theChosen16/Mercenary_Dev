'use client'

import React, { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  MapPin, 
  Star,
  Briefcase,
  Users,
  Calendar
} from 'lucide-react'

// Mock projects data
const mockProjects = [
  {
    id: '1',
    title: 'Desarrollo de E-commerce con React y Node.js',
    description: 'Necesito un desarrollador full-stack para crear una tienda online completa con sistema de pagos, gestión de inventario y panel administrativo.',
    budget: { min: 50000, max: 80000 },
    duration: '2-3 meses',
    skills: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    difficulty: 'intermediate',
    client: {
      name: 'TechStore Chile',
      rating: 4.8,
      projectsPosted: 12
    },
    postedAt: '2024-01-15',
    proposals: 8,
    status: 'open'
  },
  {
    id: '2',
    title: 'Diseño UI/UX para App Móvil de Delivery',
    description: 'Busco diseñador UX/UI para crear la interfaz completa de una aplicación de delivery de comida. Incluye wireframes, prototipos y guía de estilo.',
    budget: { min: 25000, max: 40000 },
    duration: '1-2 meses',
    skills: ['Figma', 'Adobe XD', 'UI Design', 'UX Research'],
    difficulty: 'beginner',
    client: {
      name: 'FoodApp Startup',
      rating: 4.5,
      projectsPosted: 3
    },
    postedAt: '2024-01-14',
    proposals: 15,
    status: 'open'
  },
  {
    id: '3',
    title: 'API REST para Sistema de Gestión Empresarial',
    description: 'Desarrollo de API robusta para sistema ERP con autenticación JWT, documentación completa y tests unitarios.',
    budget: { min: 35000, max: 55000 },
    duration: '1-2 meses',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
    difficulty: 'advanced',
    client: {
      name: 'Empresa Logística SA',
      rating: 4.9,
      projectsPosted: 25
    },
    postedAt: '2024-01-13',
    proposals: 5,
    status: 'open'
  }
]

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
  const [selectedBudget, setSelectedBudget] = useState<string>('')

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesDifficulty = !selectedDifficulty || project.difficulty === selectedDifficulty
    const matchesBudget = !selectedBudget || 
      (selectedBudget === 'low' && project.budget.max <= 30000) ||
      (selectedBudget === 'medium' && project.budget.min >= 30000 && project.budget.max <= 60000) ||
      (selectedBudget === 'high' && project.budget.min >= 60000)

    return matchesSearch && matchesDifficulty && matchesBudget
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success'
      case 'intermediate': return 'warning'
      case 'advanced': return 'destructive'
      default: return 'outline'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Principiante'
      case 'intermediate': return 'Intermedio'
      case 'advanced': return 'Avanzado'
      default: return difficulty
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Proyectos Disponibles</h1>
          <p className="text-muted-foreground">Encuentra el proyecto perfecto para tus habilidades</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar proyectos por título, descripción o habilidades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="md:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filtros Avanzados
            </Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="">Todas las dificultades</option>
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>

            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="">Todos los presupuestos</option>
              <option value="low">Hasta $30.000</option>
              <option value="medium">$30.000 - $60.000</option>
              <option value="high">Más de $60.000</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="space-y-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                    <CardDescription className="text-base">
                      {project.description}
                    </CardDescription>
                  </div>
                  <Badge variant={getDifficultyColor(project.difficulty)}>
                    {getDifficultyLabel(project.difficulty)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Skills */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Habilidades requeridas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.skills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${project.budget.min.toLocaleString()} - ${project.budget.max.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{project.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{project.proposals} propuestas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Publicado {new Date(project.postedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{project.client.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="h-3 w-3 fill-current text-yellow-500" />
                          <span>{project.client.rating}</span>
                          <span>•</span>
                          <span>{project.client.projectsPosted} proyectos</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        Ver Detalles
                      </Button>
                      <Button variant="gold">
                        Enviar Propuesta
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No se encontraron proyectos</h3>
            <p className="text-muted-foreground mb-4">
              Intenta ajustar tus filtros de búsqueda
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setSelectedDifficulty('')
                setSelectedBudget('')
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        )}

        {/* Load More */}
        {filteredProjects.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline">
              Cargar Más Proyectos
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
