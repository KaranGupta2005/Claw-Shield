"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Target,
  Sparkles,
  Shield,
  Play,
  RotateCcw,
  Terminal,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Activity,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { io, Socket } from "socket.io-client";

interface AgentActivity {
  step: number;
  action: string;
  agent: string;
  status: string;
  message: string;
  timestamp: string;
  details?: any;
  confidence?: number;
  autonomyLevel?: number;
}

interface Notification {
  type: string;
  title: string;
  message: string;
  agentType?: string;
  priority?: string;
  timestamp: string;
}

const agentIcons: Record<string, React.ElementType> = {
  ContextAgent: Brain,
  StrategyAgent: Target,
  GenerationAgent: Sparkles,
  EnforcementBridge: Shield,
};

const agentColors: Record<string, string> = {
  ContextAgent: "text-blue-500 bg-blue-500/10 border-blue-500/30",
  StrategyAgent: "text-purple-500 bg-purple-500/10 border-purple-500/30",
  GenerationAgent: "text-pink-500 bg-pink-500/10 border-pink-500/30",
  EnforcementBridge: "text-green-500 bg-green-500/10 border-green-500/30",
};

const statusIcons: Record<string, React.ElementType> = {
  analyzing: Loader2,
  completed: CheckCircle2,
  success: CheckCircle2,
  failed: XCircle,
  executing: Loader2,
};

export default function LiveAgentConsole() {
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string>("sleep");
  const [socket, setSocket] = useState<Socket | null>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Connect to socket for real-time updates
  useEffect(() => {
    const newSocket = io(backendUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to agent console socket");
    });

    newSocket.on("agent_activity", (activity: AgentActivity) => {
      setActivities((prev) => [...prev, activity]);
    });

    newSocket.on("notification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 10));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [backendUrl]);

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [activities]);

  const runDemo = async (demoType: string) => {
    setIsRunning(true);
    setActivities([]);

    try {
      const token = localStorage.getItem("accessToken");
      
      const response = await fetch(`${backendUrl}/api/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          preferences: getDemoPreferences(demoType),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ Demo result:", result);
    } catch (error: any) {
      console.error("❌ Demo error:", error);
      setNotifications((prev) => [
        {
          type: "ERROR",
          title: "Demo Failed",
          message: `Could not connect to backend: ${error.message}`,
          priority: "urgent",
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    } finally {
      setTimeout(() => setIsRunning(false), 2000);
    }
  };

  const getDemoPreferences = (demoType: string) => {
    const demos: Record<string, any> = {
      sleep: {
        intent: "sleep",
        locationHint: "home",
      },
      meditation: {
        intent: "meditation",
        locationHint: "home",
      },
      focus: {
        intent: "deep_focus",
        locationHint: "library",
      },
      creative: {
        intent: "creative_work",
        locationHint: "cafe",
      },
    };

    return demos[demoType] || demos.sleep;
  };

  const clearConsole = () => {
    setActivities([]);
    setNotifications([]);
  };

  const demoScenarios = [
    {
      id: "sleep",
      name: "Sleep Preparation",
      description: "Delta waves for rest",
      agent: "ContextAgent",
      icon: Brain,
      badge: "Safe",
    },
    {
      id: "meditation",
      name: "Meditation Mode",
      description: "Theta waves for mindfulness",
      agent: "StrategyAgent",
      icon: Target,
      badge: "Gentle",
    },
    {
      id: "focus",
      name: "Deep Focus",
      description: "Beta waves for concentration",
      agent: "GenerationAgent",
      icon: Sparkles,
      badge: "Intense",
    },
    {
      id: "creative",
      name: "Creative Flow",
      description: "Alpha waves for creativity",
      agent: "EnforcementBridge",
      icon: Shield,
      badge: "Dynamic",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Demo Controls */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border-gray-700/50 backdrop-blur-xl">
          <div className="p-6">
            <h3 className="text-white flex items-center gap-2 text-lg font-semibold mb-4">
              <Zap className="h-5 w-5 text-purple-400" />
              Demo Scenarios
            </h3>
            
            <div className="space-y-3">
              {demoScenarios.map((scenario) => {
                const Icon = scenario.icon;
                const isSelected = selectedDemo === scenario.id;
                
                return (
                  <motion.button
                    key={scenario.id}
                    onClick={() => setSelectedDemo(scenario.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all",
                      isSelected
                        ? "bg-purple-500/20 border-purple-500/50"
                        : "bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          agentColors[scenario.agent]
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {scenario.name}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {scenario.description}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-purple-400 border-purple-500/50"
                      >
                        {scenario.badge}
                      </Badge>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => runDemo(selectedDemo)}
                disabled={isRunning}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isRunning ? "Running..." : "Run Demo"}
              </Button>
              <Button
                onClick={clearConsole}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Live Notifications */}
        <Card className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border-gray-700/50 backdrop-blur-xl max-h-[300px] overflow-hidden">
          <div className="p-6 pb-2">
            <h3 className="text-white flex items-center gap-2 text-sm font-semibold">
              <Activity className="h-4 w-4 text-green-400 animate-pulse" />
              Live Notifications
            </h3>
          </div>
          <div className="px-6 pb-6 overflow-y-auto max-h-[220px] space-y-2">
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <motion.div
                  key={`${notification.timestamp}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    "p-3 rounded-lg border text-sm",
                    notification.type === "SUCCESS"
                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                      : notification.type === "ERROR"
                      ? "bg-red-500/10 border-red-500/30 text-red-400"
                      : notification.type === "WARNING"
                      ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                      : "bg-gray-700/50 border-gray-600/50 text-gray-300"
                  )}
                >
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-xs opacity-80">{notification.message}</div>
                </motion.div>
              ))}
            </AnimatePresence>
            {notifications.length === 0 && (
              <div className="text-gray-500 text-center py-4 text-sm">
                Waiting for agent activity...
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Right Panel - Live Console */}
      <div className="lg:col-span-2">
        <Card className="bg-gradient-to-br from-gray-900/98 to-black/95 border-gray-700/50 backdrop-blur-xl h-full">
          <div className="p-6 pb-2 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-white flex items-center gap-2 text-lg font-semibold">
                <Terminal className="h-5 w-5 text-green-400" />
                Live Agent Console
                {isRunning && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50 animate-pulse">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Running
                  </Badge>
                )}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-0">
            <div
              ref={consoleRef}
              className="font-mono text-sm p-4 h-[500px] overflow-y-auto bg-black/50"
            >
              {/* Welcome message */}
              <div className="text-gray-500 mb-4">
                <span className="text-green-400">{">"}</span> Claw Shield Agent System v1.0.0
                <br />
                <span className="text-green-400">{">"}</span> Autonomous Reasoning Pipeline Ready
                <br />
                <span className="text-green-400">{">"}</span> Select a demo scenario and click "Run Demo"
                <br />
                <span className="text-gray-600">─────────────────────────────────────────────────</span>
              </div>

              {/* Activity log */}
              <AnimatePresence>
                {activities.map((activity, index) => {
                  const AgentIcon = agentIcons[activity.agent] || Activity;
                  const StatusIcon = statusIcons[activity.status] || ChevronRight;
                  const colorClass = agentColors[activity.agent] || "text-gray-400";

                  return (
                    <motion.div
                      key={`${activity.timestamp}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 text-xs w-20 shrink-0">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                        <div className={cn("p-1 rounded", colorClass)}>
                          <AgentIcon className="h-3 w-3" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={cn("font-semibold", colorClass.split(" ")[0])}>
                              [{activity.agent}]
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                activity.status === "success"
                                  ? "border-green-500/50 text-green-400"
                                  : activity.status === "failed"
                                  ? "border-red-500/50 text-red-400"
                                  : "border-gray-600 text-gray-400"
                              )}
                            >
                              <StatusIcon
                                className={cn(
                                  "h-3 w-3 mr-1",
                                  (activity.status === "analyzing" ||
                                    activity.status === "executing") &&
                                    "animate-spin"
                                )}
                              />
                              {activity.action}
                            </Badge>
                          </div>
                          <div className="text-gray-300 mt-1">{activity.message}</div>
                          
                          {/* Extra details */}
                          {activity.confidence !== undefined && (
                            <div className="text-xs text-gray-500 mt-1">
                              Confidence: {(activity.confidence * 100).toFixed(1)}% | Autonomy Level: {activity.autonomyLevel}
                            </div>
                          )}
                          
                          {activity.details && (
                            <div className="text-xs text-gray-600 mt-1">
                              {Object.entries(activity.details).map(([key, value]) => (
                                <div key={key}>
                                  {key}: {String(value)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Cursor */}
              {!isRunning && activities.length > 0 && (
                <div className="text-gray-500">
                  <span className="text-green-400">{">"}</span>{" "}
                  <span className="animate-pulse">_</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
