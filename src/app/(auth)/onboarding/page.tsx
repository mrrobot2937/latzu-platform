"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/stores/userStore";
import type { ProfileType, OnboardingData } from "@/types/user";
import {
  GraduationCap,
  Briefcase,
  Rocket,
  Building2,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
} from "lucide-react";

const profileOptions: Array<{
  type: ProfileType;
  icon: typeof GraduationCap;
  title: string;
  description: string;
  features: string[];
  color: string;
}> = [
  {
    type: "estudiante",
    icon: GraduationCap,
    title: "Estudiante",
    description: "Quiero aprender y desarrollar mis habilidades",
    features: ["Rutas de aprendizaje", "Tutor IA 24/7", "Seguimiento de progreso"],
    color: "from-teal-500 to-emerald-500",
  },
  {
    type: "profesional",
    icon: Briefcase,
    title: "Profesional",
    description: "Busco desarrollar mi carrera profesional",
    features: ["Desarrollo de habilidades", "Certificaciones", "Mentor IA"],
    color: "from-indigo-500 to-purple-500",
  },
  {
    type: "emprendedor",
    icon: Rocket,
    title: "Emprendedor",
    description: "Quiero hacer crecer mi negocio",
    features: ["Asesor estratégico", "Automatizaciones", "Métricas de negocio"],
    color: "from-amber-500 to-orange-500",
  },
  {
    type: "empleado",
    icon: Building2,
    title: "Empleado",
    description: "Soy parte de una organización",
    features: ["Formación empresarial", "Colaboración en equipo", "Asistente"],
    color: "from-blue-500 to-cyan-500",
  },
];

const experienceLevels = [
  { value: "beginner", label: "Principiante", description: "Estoy comenzando" },
  { value: "intermediate", label: "Intermedio", description: "Tengo algo de experiencia" },
  { value: "advanced", label: "Avanzado", description: "Tengo mucha experiencia" },
];

const interestOptions = [
  "Tecnología",
  "Negocios",
  "Creatividad",
  "Liderazgo",
  "Comunicación",
  "Análisis de datos",
  "Marketing",
  "Finanzas",
  "Desarrollo personal",
  "Idiomas",
];

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const setProfileType = useUserStore((state) => state.setProfileType);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<Partial<OnboardingData>>({
    goals: [],
    interests: [],
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleProfileSelect = (type: ProfileType) => {
    setData((prev) => ({ ...prev, profileType: type }));
  };

  const handleExperienceSelect = (experience: OnboardingData["experience"]) => {
    setData((prev) => ({ ...prev, experience }));
  };

  const toggleInterest = (interest: string) => {
    setData((prev) => ({
      ...prev,
      interests: prev.interests?.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...(prev.interests || []), interest],
    }));
  };

  const handleGoalAdd = (goal: string) => {
    if (goal.trim() && !data.goals?.includes(goal.trim())) {
      setData((prev) => ({
        ...prev,
        goals: [...(prev.goals || []), goal.trim()],
      }));
    }
  };

  const handleSubmit = async () => {
    if (!data.profileType) return;

    setIsSubmitting(true);
    try {
      // Save to backend
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // If backend fails, still save locally and continue
        console.error("Failed to save onboarding data to backend");
      }

      // Save to local store (this will prevent redirect loop)
      setProfileType(data.profileType);

      // Small delay to ensure store is updated before redirect
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      // Save locally anyway
      setProfileType(data.profileType);
      router.push("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!data.profileType;
      case 2:
        return !!data.experience;
      case 3:
        return (data.interests?.length || 0) >= 2;
      default:
        return true;
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse-glow w-16 h-16 rounded-full bg-primary/20" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex items-center ${s < 4 ? "flex-1" : ""}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                  s < step
                    ? "bg-primary text-primary-foreground"
                    : s === step
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s < step ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-colors ${
                    s < step ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-muted-foreground px-1">
          <span>Perfil</span>
          <span>Nivel</span>
          <span>Intereses</span>
          <span>Metas</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Profile Type */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="glass">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">¿Cómo te describes?</CardTitle>
                <CardDescription>
                  Esto nos ayudará a personalizar tu experiencia
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {profileOptions.map((option) => (
                  <motion.button
                    key={option.type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleProfileSelect(option.type)}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                      data.profileType === option.type
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-secondary/50"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center mb-3`}
                    >
                      <option.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-1">{option.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {option.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {option.features.map((feature) => (
                        <Badge
                          key={feature}
                          variant="secondary"
                          className="text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    {data.profileType === option.type && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Experience Level */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="glass">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">¿Cuál es tu nivel?</CardTitle>
                <CardDescription>
                  Adaptaremos el contenido a tu experiencia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {experienceLevels.map((level) => (
                  <motion.button
                    key={level.value}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() =>
                      handleExperienceSelect(level.value as OnboardingData["experience"])
                    }
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                      data.experience === level.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-secondary/50"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        data.experience === level.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary"
                      }`}
                    >
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{level.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {level.description}
                      </p>
                    </div>
                    {data.experience === level.value && (
                      <Check className="w-5 h-5 text-primary ml-auto" />
                    )}
                  </motion.button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Interests */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="glass">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">¿Qué te interesa?</CardTitle>
                <CardDescription>
                  Selecciona al menos 2 áreas de interés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((interest) => (
                    <motion.button
                      key={interest}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full border-2 transition-all ${
                        data.interests?.includes(interest)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {interest}
                    </motion.button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  {data.interests?.length || 0} seleccionados
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Goals */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="glass">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">¿Cuáles son tus metas?</CardTitle>
                <CardDescription>
                  Opcional: Cuéntanos qué quieres lograr
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Escribe una meta y presiona Enter..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleGoalAdd((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2 min-h-[100px]">
                  {data.goals?.map((goal, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1.5"
                    >
                      {goal}
                      <button
                        onClick={() =>
                          setData((prev) => ({
                            ...prev,
                            goals: prev.goals?.filter((_, i) => i !== index),
                          }))
                        }
                        className="ml-2 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        {step < 4 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
            Siguiente
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Comenzar
                <Sparkles className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}



