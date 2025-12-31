// Profile-based template configuration for Latzu Platform
import type { ProfileType } from "@/types/user";
import {
  BookOpen,
  Briefcase,
  Rocket,
  Building2,
  Home,
  MessageSquare,
  GraduationCap,
  TrendingUp,
  Library,
  Target,
  Award,
  Users,
  Settings,
  BarChart3,
  Zap,
  Bell,
  type LucideIcon,
} from "lucide-react";

export interface TemplateConfig {
  primaryColor: string;
  accentColor: string;
  dashboardWidgets: WidgetConfig[];
  sidebarItems: SidebarItem[];
  chatPersonality: ChatPersonality;
  proactivePrompts: boolean;
  welcomeMessage: string;
  dashboardTitle: string;
}

export interface WidgetConfig {
  id: string;
  title: string;
  type: "learning-path" | "daily-goals" | "streaks" | "skills-radar" |
        "certifications" | "business-metrics" | "tasks" | "automations" |
        "assigned-training" | "team-progress" | "announcements" | "chat-preview";
  size: "small" | "medium" | "large";
  priority: number;
}

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export type ChatPersonality = "tutor" | "mentor" | "advisor" | "assistant";

export const profileTemplates: Record<ProfileType, TemplateConfig> = {
  estudiante: {
    primaryColor: "teal",
    accentColor: "amber",
    dashboardTitle: "Mi Aprendizaje",
    welcomeMessage: "¡Hola! Soy tu tutor personal. ¿En qué te gustaría aprender hoy?",
    chatPersonality: "tutor",
    proactivePrompts: true,
    dashboardWidgets: [
      { id: "learning-path", title: "Ruta de Aprendizaje", type: "learning-path", size: "large", priority: 1 },
      { id: "daily-goals", title: "Metas del Día", type: "daily-goals", size: "medium", priority: 2 },
      { id: "streaks", title: "Racha de Estudio", type: "streaks", size: "small", priority: 3 },
      { id: "chat-preview", title: "Pregúntale al Tutor", type: "chat-preview", size: "medium", priority: 4 },
    ],
    sidebarItems: [
      { id: "home", label: "Inicio", href: "/dashboard", icon: Home },
      { id: "lessons", label: "Lecciones", href: "/learn", icon: BookOpen },
      { id: "chat", label: "Tutor IA", href: "/chat", icon: MessageSquare },
      { id: "knowledge", label: "Conocimiento", href: "/knowledge", icon: TrendingUp },
      { id: "library", label: "Biblioteca", href: "/library", icon: Library },
    ],
  },

  profesional: {
    primaryColor: "indigo",
    accentColor: "emerald",
    dashboardTitle: "Desarrollo Profesional",
    welcomeMessage: "Bienvenido. Estoy aquí para ayudarte a desarrollar tus habilidades profesionales.",
    chatPersonality: "mentor",
    proactivePrompts: true,
    dashboardWidgets: [
      { id: "skills-radar", title: "Mapa de Habilidades", type: "skills-radar", size: "large", priority: 1 },
      { id: "certifications", title: "Certificaciones", type: "certifications", size: "medium", priority: 2 },
      { id: "daily-goals", title: "Objetivos", type: "daily-goals", size: "medium", priority: 3 },
      { id: "chat-preview", title: "Consulta con el Mentor", type: "chat-preview", size: "medium", priority: 4 },
    ],
    sidebarItems: [
      { id: "home", label: "Inicio", href: "/dashboard", icon: Home },
      { id: "skills", label: "Habilidades", href: "/learn", icon: Target },
      { id: "chat", label: "Mentor IA", href: "/chat", icon: MessageSquare },
      { id: "knowledge", label: "Conocimiento", href: "/knowledge", icon: Award },
      { id: "network", label: "Red", href: "/network", icon: Users },
    ],
  },

  emprendedor: {
    primaryColor: "amber",
    accentColor: "rose",
    dashboardTitle: "Mi Negocio",
    welcomeMessage: "¡Emprendedor! Estoy aquí para ayudarte a escalar tu negocio.",
    chatPersonality: "advisor",
    proactivePrompts: true,
    dashboardWidgets: [
      { id: "business-metrics", title: "Métricas del Negocio", type: "business-metrics", size: "large", priority: 1 },
      { id: "tasks", title: "Tareas Pendientes", type: "tasks", size: "medium", priority: 2 },
      { id: "automations", title: "Automatizaciones", type: "automations", size: "medium", priority: 3 },
      { id: "chat-preview", title: "Asesor Estratégico", type: "chat-preview", size: "medium", priority: 4 },
    ],
    sidebarItems: [
      { id: "home", label: "Inicio", href: "/dashboard", icon: Home },
      { id: "projects", label: "Proyectos", href: "/learn", icon: Briefcase },
      { id: "chat", label: "Asesor IA", href: "/chat", icon: MessageSquare },
      { id: "knowledge", label: "Conocimiento", href: "/knowledge", icon: Zap },
      { id: "analytics", label: "Analítica", href: "/analytics", icon: BarChart3 },
    ],
  },

  empleado: {
    primaryColor: "blue",
    accentColor: "violet",
    dashboardTitle: "Mi Espacio de Trabajo",
    welcomeMessage: "Hola. ¿En qué puedo ayudarte hoy?",
    chatPersonality: "assistant",
    proactivePrompts: false,
    dashboardWidgets: [
      { id: "assigned-training", title: "Formación Asignada", type: "assigned-training", size: "large", priority: 1 },
      { id: "team-progress", title: "Progreso del Equipo", type: "team-progress", size: "medium", priority: 2 },
      { id: "announcements", title: "Anuncios", type: "announcements", size: "medium", priority: 3 },
      { id: "chat-preview", title: "Asistente", type: "chat-preview", size: "medium", priority: 4 },
    ],
    sidebarItems: [
      { id: "home", label: "Inicio", href: "/dashboard", icon: Home },
      { id: "training", label: "Formación", href: "/learn", icon: GraduationCap },
      { id: "chat", label: "Asistente", href: "/chat", icon: MessageSquare },
      { id: "knowledge", label: "Conocimiento", href: "/knowledge", icon: Users },
      { id: "settings", label: "Configuración", href: "/settings", icon: Building2 },
    ],
  },
};

// Get template for a profile type with fallback
export function getTemplate(profileType?: ProfileType): TemplateConfig {
  return profileType ? profileTemplates[profileType] : profileTemplates.estudiante;
}

// Get chat personality description
export function getChatPersonalityDescription(personality: ChatPersonality): string {
  const descriptions: Record<ChatPersonality, string> = {
    tutor: "Un tutor paciente y motivador que te guía paso a paso en tu aprendizaje",
    mentor: "Un mentor experimentado que te ayuda a desarrollar tu carrera profesional",
    advisor: "Un asesor estratégico que te ayuda a tomar decisiones de negocio",
    assistant: "Un asistente eficiente que te ayuda con tus tareas diarias",
  };
  return descriptions[personality];
}

// Get proactive prompts based on context
export function getProactivePrompts(profileType: ProfileType, context?: {
  lastActivity?: string;
  currentStreak?: number;
  recentTopics?: string[];
}): string[] {
  const basePrompts: Record<ProfileType, string[]> = {
    estudiante: [
      "¿Continuamos con la lección que dejaste pendiente?",
      "Basándome en tu progreso, te recomiendo practicar este tema...",
      "¡Tienes una racha de {streak} días! ¿Seguimos aprendiendo?",
      "Descubrí un concepto relacionado con lo que estudiaste ayer...",
    ],
    profesional: [
      "He identificado una habilidad que podría beneficiar tu perfil...",
      "Hay una nueva certificación relevante para tu área...",
      "¿Te gustaría revisar las tendencias de la industria?",
      "Basándome en tu experiencia, podrías destacar en...",
    ],
    emprendedor: [
      "Tengo algunas ideas para optimizar tu proceso de...",
      "Basándome en tus métricas, sugiero enfocar en...",
      "¿Has considerado automatizar esta tarea repetitiva?",
      "Detecté una oportunidad de mejora en tu flujo de trabajo...",
    ],
    empleado: [
      "Tienes formación pendiente que debes completar",
      "Hay un nuevo anuncio importante de tu organización",
      "¿Necesitas ayuda con algún proceso?",
    ],
  };

  let prompts = basePrompts[profileType];

  // Customize based on context
  if (context?.currentStreak && context.currentStreak > 0) {
    prompts = prompts.map(p => p.replace("{streak}", String(context.currentStreak)));
  }

  return prompts;
}

