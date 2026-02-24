"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  const handleLaunchDashboard = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-purple-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      
      <div className="relative z-10">
        <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent"
          >
            CLAW SHIELD
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4"
          >
            {isAuthenticated ? (
              <>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                >
                  Dashboard
                </Button>
                <Button
                  onClick={() => router.push('/agents')}
                  variant="outline"
                  className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                >
                  Live Agents
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/login")}
                  className="text-white hover:text-purple-400"
                >
                  Login
                </Button>
                <Button
                  onClick={() => router.push("/signup")}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                >
                  Get Started
                </Button>
              </>
            )}
          </motion.div>
        </nav>

        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-6xl md:text-7xl font-bold mb-6">
                Autonomous Agent
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  Orchestration
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Experience the future of AI-powered binaural beat generation with
                autonomous reasoning, real-time adaptation, and explainable decisions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-4 justify-center"
            >
              <Button
                size="lg"
                onClick={handleLaunchDashboard}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-lg px-8"
              >
                {isAuthenticated ? 'Launch Dashboard' : 'Get Started'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/agents")}
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10 text-lg px-8"
              >
                View Live Demo
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-3 gap-6 mt-20 max-w-6xl mx-auto"
          >
            <FeatureCard
              title="Context Agent"
              description="Perceives and interprets your environment, time, and cognitive state in real-time"
            />
            <FeatureCard
              title="Strategy Agent"
              description="Deterministic reasoning layer that selects optimal behavioral approaches"
            />
            <FeatureCard
              title="Generation Agent"
              description="ML-powered planner that creates structured action proposals"
            />
            <FeatureCard
              title="Enforcement Layer"
              description="Safety guardian that validates plans against user intent contracts"
            />
            <FeatureCard
              title="Explainability"
              description="Full reasoning traces showing how and why decisions were made"
            />
            <FeatureCard
              title="Real-time Adaptation"
              description="Continuous learning and adjustment based on environmental feedback"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto"
          >
            <StatCard number="4" label="Autonomous Agents" />
            <StatCard number="8" label="Behavioral Strategies" />
            <StatCard number="5" label="Frequency Bands" />
            <StatCard number="100%" label="Explainable" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-all"
    >
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </motion.div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
        {number}
      </div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  );
}
