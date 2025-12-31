"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Search,
  Network,
  Sparkles,
  BookOpen,
  TrendingUp,
  Zap,
  Filter,
} from "lucide-react";

// Mock data for knowledge graph visualization
const mockConcepts = [
  {
    id: "ml",
    name: "Machine Learning",
    type: "topic",
    connections: 8,
    mastery: 65,
    lastStudied: "Hace 2 días",
  },
  {
    id: "neural-networks",
    name: "Redes Neuronales",
    type: "topic",
    connections: 5,
    mastery: 45,
    lastStudied: "Hace 1 semana",
  },
  {
    id: "python",
    name: "Python",
    type: "skill",
    connections: 12,
    mastery: 80,
    lastStudied: "Hoy",
  },
  {
    id: "data-analysis",
    name: "Análisis de Datos",
    type: "skill",
    connections: 7,
    mastery: 70,
    lastStudied: "Hace 3 días",
  },
  {
    id: "deep-learning",
    name: "Deep Learning",
    type: "topic",
    connections: 4,
    mastery: 30,
    lastStudied: "Hace 2 semanas",
  },
];

const mockInsights = [
  {
    type: "gap",
    message: "Podrías reforzar 'Redes Neuronales' para completar tu conocimiento en Deep Learning",
    action: "Estudiar ahora",
  },
  {
    type: "opportunity",
    message: "Tu nivel en Python te permite explorar temas avanzados de Machine Learning",
    action: "Ver opciones",
  },
  {
    type: "achievement",
    message: "¡Completaste el 80% de los conceptos fundamentales de IA!",
    action: "Celebrar",
  },
];

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

  const filteredConcepts = mockConcepts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold mb-2">
            Tu Grafo de Conocimiento
          </h1>
          <p className="text-muted-foreground">
            Visualiza y explora tu mapa de conocimiento personal
          </p>
        </div>
        <Button className="gap-2">
          <Sparkles className="w-4 h-4" />
          Analizar con IA
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Conceptos", value: "24", icon: Brain, color: "text-primary" },
          { label: "Conexiones", value: "47", icon: Network, color: "text-accent" },
          { label: "Dominio Promedio", value: "62%", icon: TrendingUp, color: "text-emerald-500" },
          { label: "Activo hoy", value: "3", icon: Zap, color: "text-amber-500" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="concepts" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger value="concepts">Conceptos</TabsTrigger>
          <TabsTrigger value="graph">Grafo Visual</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Concepts Tab */}
        <TabsContent value="concepts" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conceptos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Concepts Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredConcepts.map((concept, i) => (
              <motion.div
                key={concept.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className={`glass cursor-pointer transition-all hover:border-primary/50 ${
                    selectedConcept === concept.id ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedConcept(concept.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{concept.name}</h3>
                        <Badge variant="outline" className="mt-1 capitalize text-xs">
                          {concept.type}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {concept.mastery}%
                        </p>
                        <p className="text-xs text-muted-foreground">Dominio</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Network className="w-3 h-3" />
                        {concept.connections} conexiones
                      </span>
                      <span>{concept.lastStudied}</span>
                    </div>
                    <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${concept.mastery}%` }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Graph Tab */}
        <TabsContent value="graph">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Visualización del Grafo</CardTitle>
              <CardDescription>
                Explora las conexiones entre tus conocimientos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] flex items-center justify-center bg-secondary/30 rounded-lg border border-dashed border-border">
                <div className="text-center">
                  <Network className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Visualización interactiva del grafo de conocimiento
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Integración con D3.js o React-Force-Graph próximamente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <CardTitle>Insights Personalizados</CardTitle>
              </div>
              <CardDescription>
                Análisis inteligente de tu progreso y recomendaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockInsights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    insight.type === "gap"
                      ? "bg-amber-500/10 border-amber-500/30"
                      : insight.type === "opportunity"
                      ? "bg-primary/10 border-primary/30"
                      : "bg-emerald-500/10 border-emerald-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          insight.type === "gap"
                            ? "bg-amber-500/20"
                            : insight.type === "opportunity"
                            ? "bg-primary/20"
                            : "bg-emerald-500/20"
                        }`}
                      >
                        {insight.type === "gap" && (
                          <BookOpen className="w-4 h-4 text-amber-500" />
                        )}
                        {insight.type === "opportunity" && (
                          <TrendingUp className="w-4 h-4 text-primary" />
                        )}
                        {insight.type === "achievement" && (
                          <Sparkles className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <p className="text-sm">{insight.message}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      {insight.action}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



