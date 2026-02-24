"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/hooks/useSocket";
import { Badge } from "@/components/ui/badge";

interface AgentActivity {
  id: string;
  timestamp: Date;
  agent: string;
  type: 'context' | 'strategy' | 'plan' | 'approved' | 'blocked' | 'error';
  message: string;
  data?: any;
}

const DEMO_SCENARIOS = [
  {
    id: 'sleep',
    name: 'Sleep Preparation',
    description: 'Deep Rest Protocol',
    level: 'Level 5',
    color: 'from-purple-500 to-indigo-600',
    preferences: {
      intent: 'sleep',
      location: 'bedroom',
      chronotype: 'evening',
      soundSensitivity: 7,
    },
  },
  {
    id: 'meditation',
    name: 'Meditation Session',
    description: 'Mindfulness Protocol',
    level: 'Level 5',
    color: 'from-cyan-500 to-blue-600',
    preferences: {
      intent: 'meditation',
      location: 'quiet room',
      chronotype: 'neutral',
      soundSensitivity: 6,
    },
  },
  {
    id: 'focus',
    name: 'Deep Focus Mode',
    description: 'Cognitive Enhancement',
    level: 'Level 5',
    color: 'from-orange-500 to-red-600',
    preferences: {
      intent: 'deep_focus',
      location: 'library',
      chronotype: 'morning',
      soundSensitivity: 4,
    },
  },
  {
    id: 'creative',
    name: 'Creative Flow',
    description: 'Multi-Agent Synthesis',
    level: 'All Agents',
    color: 'from-pink-500 to-purple-600',
    preferences: {
      intent: 'creative_work',
      location: 'home office',
      chronotype: 'evening',
      soundSensitivity: 5,
    },
  },
  {
    id: 'blocked',
    name: 'Policy Violation Test',
    description: 'Safety Override Detection',
    level: 'Level 5',
    color: 'from-red-500 to-orange-600',
    preferences: {
      intent: 'sleep',
      location: 'bedroom - noisy street',
      chronotype: 'evening',
      soundSensitivity: 3,
    },
  },
];

export default function AgentsPage() {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState('Ready');

  useEffect(() => {
    if (!socket) return;

    socket.on('agent:activity', (data: any) => {
      const activity: AgentActivity = {
        id: Math.random().toString(36),
        timestamp: new Date(),
        agent: data.agent,
        type: data.type,
        message: data.message,
        data: data.data,
      };
      
      setActivities(prev => [activity, ...prev].slice(0, 100));
    });

    return () => {
      socket.off('agent:activity');
    };
  }, [socket]);

  const runScenario = async (scenario: typeof DEMO_SCENARIOS[0]) => {
    if (runningScenario) return;
    
    setRunningScenario(scenario.id);
    setSystemStatus('Running...');
    setActivities([]);

    try {
      const response = await fetch('http://localhost:5000/api/sessions/demo/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: scenario.preferences,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start session');
      }

      setTimeout(() => {
        setRunningScenario(null);
        setSystemStatus('Ready');
      }, 5000);
    } catch (error: any) {
      console.error('Error running scenario:', error);
      setActivities(prev => [{
        id: Math.random().toString(36),
        timestamp: new Date(),
        agent: 'System',
        type: 'error',
        message: `Error: ${error.message}`,
        data: {},
      }, ...prev]);
      setRunningScenario(null);
      setSystemStatus('Error');
    }
  };

  const getAgentIcon = (agent: string) => {
    const icons: Record<string, string> = {
      'ContextAgent': 'CTX',
      'StrategyAgent': 'STR',
      'GenerationAgent': 'GEN',
      'EnforcementBridge': 'ENF',
      'System': 'SYS',
    };
    return icons[agent] || 'AGT';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'context': 'text-cyan-400',
      'strategy': 'text-yellow-400',
      'plan': 'text-purple-400',
      'approved': 'text-green-400',
      'blocked': 'text-red-400',
      'error': 'text-red-500',
    };
    return colors[type] || 'text-gray-400';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'context': '◉',
      'strategy': '◈',
      'plan': '◆',
      'approved': '✓',
      'blocked': '✗',
      'error': '⚠',
    };
    return icons[type] || '●';
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Welcome User !
            </h1>
            <div className="flex gap-6 mt-4">
              <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white transition-colors">Home</button>
              <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white transition-colors">Dashboard</button>
              <button className="text-white border-b-2 border-purple-500">Agents</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-6">Agent Demo Scenarios</h2>

              <div className="space-y-3">
                {DEMO_SCENARIOS.map((scenario) => (
                  <motion.button
                    key={scenario.id}
                    onClick={() => runScenario(scenario)}
                    disabled={runningScenario !== null}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full bg-gradient-to-r ${scenario.color} p-4 rounded-lg text-left relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-white">{scenario.name}</h3>
                          <p className="text-xs text-white/80">{scenario.description}</p>
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                          {scenario.level}
                        </Badge>
                      </div>
                    </div>
                    {runningScenario === scenario.id && (
                      <motion.div
                        className="absolute inset-0 bg-white/10"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Status</span>
                  <div className="flex items-center gap-2">
                    <motion.div
                      className={`w-2 h-2 rounded-full ${
                        runningScenario ? 'bg-green-400' : 'bg-gray-500'
                      }`}
                      animate={runningScenario ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-sm font-medium">{systemStatus}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-8">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-800/50 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">Live Agent Console</h2>
                  <Badge 
                    variant={isConnected ? "default" : "secondary"}
                    className={isConnected ? "bg-green-500/20 text-green-400 border-green-500/50" : ""}
                  >
                    {isConnected ? 'Running' : 'Disconnected'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>

              <div className="p-6 h-[600px] overflow-y-auto font-mono text-sm">
                {activities.length === 0 ? (
                  <div className="text-gray-500 space-y-2">
                    <p>&gt; VOLTIX Agent System v1.0.0</p>
                    <p>&gt; Autonomous Agent Orchestration Ready</p>
                    <p>&gt; Select a demo scenario and click to run</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {activities.map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-3 border-l-2 border-gray-700 pl-4 py-1"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-gray-500 text-xs mt-1">
                            {activity.timestamp.toLocaleTimeString()}
                          </span>
                          <span className={`font-bold ${getTypeColor(activity.type)} text-xs px-2 py-1 bg-gray-800 rounded`}>
                            {getAgentIcon(activity.agent)}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-bold ${getTypeColor(activity.type)}`}>
                                [{activity.agent}]
                              </span>
                              <span className={getTypeColor(activity.type)}>
                                {getTypeIcon(activity.type)}
                              </span>
                              <span className="text-gray-400 uppercase text-xs">
                                {activity.type}
                              </span>
                            </div>
                            <p className="text-gray-300">{activity.message}</p>
                            
                            {activity.type === 'approved' && activity.data && (
                              <div className="mt-2 p-3 bg-green-500/10 border border-green-500/30 rounded text-xs">
                                <p className="text-green-400 font-semibold mb-1">✓ Plan Approved</p>
                                <p className="text-gray-400">Beat: {activity.data.beatFrequency}Hz | Carrier: {activity.data.carrierFrequency}Hz</p>
                              </div>
                            )}
                            
                            {activity.type === 'blocked' && activity.data && (
                              <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded text-xs">
                                <p className="text-red-400 font-semibold mb-1">✗ Plan Blocked</p>
                                <p className="text-gray-400">Reason: {activity.data.reason}</p>
                                {activity.data.violations && (
                                  <ul className="mt-1 text-gray-500">
                                    {activity.data.violations.map((v: string, i: number) => (
                                      <li key={i}>• {v}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
