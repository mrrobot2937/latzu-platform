"use client";

import { AdaptiveCard } from "./AdaptiveCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { WidgetConfig } from "@/config/templates";
import {
  BookOpen,
  Target,
  Flame,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Bell,
  Zap,
  Award,
} from "lucide-react";
import Link from "next/link";

interface WidgetRendererProps {
  widgets: WidgetConfig[];
}

export function WidgetRenderer({ widgets }: WidgetRendererProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {widgets.map((widget) => (
        <WidgetComponent key={widget.id} widget={widget} />
      ))}
    </div>
  );
}

function WidgetComponent({ widget }: { widget: WidgetConfig }) {
  switch (widget.type) {
    case "learning-path":
      return <LearningPathWidget widget={widget} />;
    case "daily-goals":
      return <DailyGoalsWidget widget={widget} />;
    case "streaks":
      return <StreaksWidget widget={widget} />;
    case "chat-preview":
      return <ChatPreviewWidget widget={widget} />;
    case "skills-radar":
      return <SkillsRadarWidget widget={widget} />;
    case "certifications":
      return <CertificationsWidget widget={widget} />;
    case "business-metrics":
      return <BusinessMetricsWidget widget={widget} />;
    case "tasks":
      return <TasksWidget widget={widget} />;
    case "automations":
      return <AutomationsWidget widget={widget} />;
    case "assigned-training":
      return <AssignedTrainingWidget widget={widget} />;
    case "team-progress":
      return <TeamProgressWidget widget={widget} />;
    case "announcements":
      return <AnnouncementsWidget widget={widget} />;
    default:
      return null;
  }
}

// Learning Path Widget
function LearningPathWidget({ widget }: { widget: WidgetConfig }) {
  return (
    <AdaptiveCard
      title={widget.title}
      description="Tu progreso actual"
      icon={<BookOpen className="w-5 h-5 text-primary" />}
      size={widget.size}
      action={
        <Button variant="ghost" size="sm" asChild>
          <Link href="/learn">Ver todo</Link>
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Lección actual</span>
            <span className="text-muted-foreground">3/12</span>
          </div>
          <Progress value={25} className="h-2" />
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="font-medium text-sm">Fundamentos de IA</p>
          <p className="text-xs text-muted-foreground mt-1">
            Continúa donde lo dejaste
          </p>
        </div>
        <Button className="w-full" asChild>
          <Link href="/learn/current">
            <BookOpen className="w-4 h-4 mr-2" />
            Continuar aprendiendo
          </Link>
        </Button>
      </div>
    </AdaptiveCard>
  );
}

// Daily Goals Widget
function DailyGoalsWidget({ widget }: { widget: WidgetConfig }) {
  const goals = [
    { label: "Completar 1 lección", done: true },
    { label: "Practicar 15 minutos", done: false },
    { label: "Revisar conceptos", done: false },
  ];
  const completed = goals.filter((g) => g.done).length;

  return (
    <AdaptiveCard
      title={widget.title}
      description={`${completed}/${goals.length} completadas`}
      icon={<Target className="w-5 h-5 text-primary" />}
      size={widget.size}
    >
      <div className="space-y-3">
        {goals.map((goal, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-2 rounded-lg ${
              goal.done ? "bg-primary/10" : "bg-secondary/50"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                goal.done ? "bg-primary" : "border-2 border-muted-foreground"
              }`}
            >
              {goal.done && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
            </div>
            <span className={goal.done ? "line-through text-muted-foreground" : ""}>
              {goal.label}
            </span>
          </div>
        ))}
      </div>
    </AdaptiveCard>
  );
}

// Streaks Widget
function StreaksWidget({ widget }: { widget: WidgetConfig }) {
  return (
    <AdaptiveCard
      title={widget.title}
      icon={<Flame className="w-5 h-5 text-orange-500" />}
      size={widget.size}
      variant="accent"
    >
      <div className="text-center py-4">
        <div className="text-5xl font-bold text-orange-500 mb-2">7</div>
        <p className="text-sm text-muted-foreground">días consecutivos</p>
        <div className="flex justify-center gap-1 mt-4">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                i < 7 ? "bg-orange-500/20" : "bg-secondary"
              }`}
            >
              {i < 7 && <Flame className="w-4 h-4 text-orange-500" />}
            </div>
          ))}
        </div>
      </div>
    </AdaptiveCard>
  );
}

// Chat Preview Widget
function ChatPreviewWidget({ widget }: { widget: WidgetConfig }) {
  return (
    <AdaptiveCard
      title={widget.title}
      description="Tu asistente está listo"
      icon={<MessageSquare className="w-5 h-5 text-primary" />}
      size={widget.size}
      variant="primary"
    >
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-primary/10 text-sm">
          <p className="italic">
            &quot;Basándome en tu progreso, te recomiendo practicar el tema de
            redes neuronales. ¿Te gustaría empezar?&quot;
          </p>
        </div>
        <Button className="w-full" asChild>
          <Link href="/chat">
            <MessageSquare className="w-4 h-4 mr-2" />
            Iniciar conversación
          </Link>
        </Button>
      </div>
    </AdaptiveCard>
  );
}

// Skills Radar Widget
function SkillsRadarWidget({ widget }: { widget: WidgetConfig }) {
  const skills = [
    { name: "Python", level: 75 },
    { name: "Machine Learning", level: 45 },
    { name: "Data Analysis", level: 60 },
    { name: "Communication", level: 80 },
  ];

  return (
    <AdaptiveCard
      title={widget.title}
      icon={<TrendingUp className="w-5 h-5 text-primary" />}
      size={widget.size}
    >
      <div className="space-y-3">
        {skills.map((skill) => (
          <div key={skill.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{skill.name}</span>
              <span className="text-muted-foreground">{skill.level}%</span>
            </div>
            <Progress value={skill.level} className="h-2" />
          </div>
        ))}
      </div>
    </AdaptiveCard>
  );
}

// Certifications Widget
function CertificationsWidget({ widget }: { widget: WidgetConfig }) {
  return (
    <AdaptiveCard
      title={widget.title}
      icon={<Award className="w-5 h-5 text-primary" />}
      size={widget.size}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="font-medium text-sm">Data Science Fundamentals</p>
            <p className="text-xs text-muted-foreground">En progreso - 60%</p>
          </div>
        </div>
        <Button variant="outline" className="w-full">
          Ver certificaciones
        </Button>
      </div>
    </AdaptiveCard>
  );
}

// Business Metrics Widget
function BusinessMetricsWidget({ widget }: { widget: WidgetConfig }) {
  const metrics = [
    { label: "Ingresos", value: "$12,450", change: "+12%" },
    { label: "Clientes", value: "142", change: "+8%" },
    { label: "Proyectos", value: "7", change: "+2" },
  ];

  return (
    <AdaptiveCard
      title={widget.title}
      icon={<BarChart3 className="w-5 h-5 text-primary" />}
      size={widget.size}
    >
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="text-center">
            <p className="text-2xl font-bold">{metric.value}</p>
            <p className="text-xs text-muted-foreground">{metric.label}</p>
            <Badge variant="secondary" className="mt-1 text-emerald-500">
              {metric.change}
            </Badge>
          </div>
        ))}
      </div>
    </AdaptiveCard>
  );
}

// Tasks Widget
function TasksWidget({ widget }: { widget: WidgetConfig }) {
  const tasks = [
    { title: "Revisar propuesta cliente", priority: "high", due: "Hoy" },
    { title: "Actualizar landing page", priority: "medium", due: "Mañana" },
    { title: "Llamada con inversor", priority: "high", due: "Hoy 3pm" },
  ];

  return (
    <AdaptiveCard
      title={widget.title}
      icon={<CheckCircle2 className="w-5 h-5 text-primary" />}
      size={widget.size}
    >
      <div className="space-y-2">
        {tasks.map((task, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50"
          >
            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">{task.title}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {task.due}
              </p>
            </div>
            <Badge
              variant={task.priority === "high" ? "destructive" : "secondary"}
            >
              {task.priority}
            </Badge>
          </div>
        ))}
      </div>
    </AdaptiveCard>
  );
}

// Automations Widget
function AutomationsWidget({ widget }: { widget: WidgetConfig }) {
  return (
    <AdaptiveCard
      title={widget.title}
      icon={<Zap className="w-5 h-5 text-amber-500" />}
      size={widget.size}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
          <span className="text-sm">Email follow-up</span>
          <Badge variant="outline" className="text-emerald-500">
            Activo
          </Badge>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
          <span className="text-sm">Facturación mensual</span>
          <Badge variant="outline" className="text-emerald-500">
            Activo
          </Badge>
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/automations">Gestionar automatizaciones</Link>
        </Button>
      </div>
    </AdaptiveCard>
  );
}

// Assigned Training Widget
function AssignedTrainingWidget({ widget }: { widget: WidgetConfig }) {
  return (
    <AdaptiveCard
      title={widget.title}
      description="Formación requerida por tu empresa"
      icon={<BookOpen className="w-5 h-5 text-primary" />}
      size={widget.size}
    >
      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium">Fecha límite: 15 Dic</span>
          </div>
          <p className="text-sm">Seguridad de la información</p>
          <Progress value={30} className="h-2 mt-2" />
        </div>
        <Button className="w-full" asChild>
          <Link href="/training">Continuar formación</Link>
        </Button>
      </div>
    </AdaptiveCard>
  );
}

// Team Progress Widget
function TeamProgressWidget({ widget }: { widget: WidgetConfig }) {
  return (
    <AdaptiveCard
      title={widget.title}
      icon={<Users className="w-5 h-5 text-primary" />}
      size={widget.size}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-medium"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">+5 más</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso del equipo</span>
            <span>72%</span>
          </div>
          <Progress value={72} className="h-2" />
        </div>
      </div>
    </AdaptiveCard>
  );
}

// Announcements Widget
function AnnouncementsWidget({ widget }: { widget: WidgetConfig }) {
  return (
    <AdaptiveCard
      title={widget.title}
      icon={<Bell className="w-5 h-5 text-primary" />}
      size={widget.size}
    >
      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <p className="font-medium text-sm">Nueva política de trabajo remoto</p>
          <p className="text-xs text-muted-foreground mt-1">
            Actualización importante sobre las políticas de la empresa
          </p>
        </div>
        <Button variant="ghost" size="sm" className="w-full">
          Ver todos los anuncios
        </Button>
      </div>
    </AdaptiveCard>
  );
}



