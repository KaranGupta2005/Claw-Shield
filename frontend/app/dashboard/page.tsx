"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-purple-950 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Welcome back, {user.name}!</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3"
          >
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Home
            </Button>
            <Button
              onClick={logout}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              Logout
            </Button>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <StatCard
            title="Active Agents"
            value="4"
            subtitle="All systems operational"
            color="from-cyan-500 to-blue-600"
          />
          <StatCard
            title="Sessions"
            value="0"
            subtitle="Total completed"
            color="from-purple-500 to-pink-600"
          />
          <StatCard
            title="Uptime"
            value="100%"
            subtitle="System reliability"
            color="from-green-500 to-emerald-600"
          />
          <StatCard
            title="Accuracy"
            value="95%"
            subtitle="Decision confidence"
            color="from-orange-500 to-red-600"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-medium text-white">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Chronotype</p>
                  <p className="font-medium text-white capitalize">{user.chronotype}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Sound Sensitivity</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
                        style={{ width: `${(user.soundSensitivity / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-white font-medium">{user.soundSensitivity}/10</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Member Since</p>
                  <p className="font-medium text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <ActionButton
                  title="Live Agent Console"
                  description="Monitor autonomous reasoning"
                  onClick={() => router.push("/agents")}
                  gradient="from-purple-500 to-pink-600"
                />
                <ActionButton
                  title="Start Session"
                  description="Begin binaural beat session"
                  onClick={() => router.push("/agents")}
                  gradient="from-cyan-500 to-blue-600"
                />
                <ActionButton
                  title="View Analytics"
                  description="Session history & insights"
                  onClick={() => {}}
                  gradient="from-green-500 to-emerald-600"
                />
                <ActionButton
                  title="Settings"
                  description="Update preferences"
                  onClick={() => {}}
                  gradient="from-orange-500 to-red-600"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <SystemStatus name="Context Agent" status="operational" />
                <SystemStatus name="Strategy Agent" status="operational" />
                <SystemStatus name="Generation Agent" status="operational" />
                <SystemStatus name="Enforcement Layer" status="operational" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, color }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
    >
      <div className={`text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent mb-4`}>
        {value}
      </div>
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <p className="text-gray-400 text-sm">{subtitle}</p>
    </motion.div>
  );
}

function ActionButton({ title, description, onClick, gradient }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-gradient-to-r ${gradient} p-6 rounded-xl text-left relative overflow-hidden group`}
    >
      <div className="relative z-10">
        <h3 className="text-white font-semibold mb-1">{title}</h3>
        <p className="text-white/80 text-sm">{description}</p>
      </div>
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}

function SystemStatus({ name, status }: { name: string; status: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg">
      <div className={`w-3 h-3 rounded-full ${status === 'operational' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
      <div>
        <p className="text-white font-medium text-sm">{name}</p>
        <p className="text-gray-400 text-xs capitalize">{status}</p>
      </div>
    </div>
  );
}
