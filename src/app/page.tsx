"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, ArrowRight, BookOpen, MessageSquare, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useIsGuest } from "@/stores/userStore";

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();
  const isGuest = useIsGuest();

  // Redirect authenticated/guest users to dashboard
  useEffect(() => {
    if (status === "authenticated" || isGuest) {
      router.replace("/dashboard");
    }
  }, [status, isGuest, router]);

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-latzu flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/20 animate-pulse-glow mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </motion.div>
      </div>
    );
  }

  // If authenticated or guest, show loading while redirecting
  if (status === "authenticated" || isGuest) {
    return (
      <div className="min-h-screen bg-gradient-latzu flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-primary/20 animate-pulse-glow" />
      </div>
    );
  }

  // Show landing page for unauthenticated, non-guest users
  return (
    <div className="min-h-screen bg-gradient-latzu">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-3 mb-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="w-9 h-9 text-primary-foreground" />
            </div>
            <span className="text-5xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Latzu
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-heading font-bold mb-6"
          >
            Inteligencia Adaptativa para{" "}
            <span className="text-primary">Personas y Organizaciones</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Plataforma de IA que aprende de ti, crea experiencias personalizadas,
            automatiza procesos y gestiona tu conocimiento en un solo lugar.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" className="gap-2 text-lg px-8" asChild>
              <Link href="/login">
                <Sparkles className="w-5 h-5" />
                Probar Gratis
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 text-lg px-8" asChild>
              <Link href="/login">
                Iniciar Sesión
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto"
        >
          {[
            {
              icon: BookOpen,
              title: "Aprendizaje Personalizado",
              description:
                "Rutas adaptadas a tu nivel, estilo y objetivos de aprendizaje",
            },
            {
              icon: MessageSquare,
              title: "Tutor IA 24/7",
              description:
                "Asistente inteligente que te guía y responde tus dudas",
            },
            {
              icon: Zap,
              title: "Automatización Inteligente",
              description:
                "Flujos automáticos que optimizan tu tiempo y productividad",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="p-6 rounded-xl glass text-center"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2025 Latzu. Inteligencia Adaptativa para el Futuro.</p>
        </div>
      </footer>
    </div>
  );
}
