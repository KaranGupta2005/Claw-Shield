/**
 * Test Generation Agent and ML Planner
 * 
 * Tests the complete pipeline:
 * SESSION_STARTED → CONTEXT_READY → STRATEGY_READY → PLAN_PROPOSED
 */

import eventBus from './src/core/eventBus.js';
import logger from './src/core/logger.js';
import { EVENTS } from './src/constants/index.js';

// Import agents
import * as contextAgent from './src/agents/contextAgent.js';
import * as strategyAgent from './src/agents/strategyAgent.js';
import * as generationAgent from './src/agents/generationAgent.js';

// Register agents
contextAgent.register(eventBus);
strategyAgent.register(eventBus);
generationAgent.register(eventBus);

console.log('\n🧪 Testing Generation Agent and ML Planner\n');
console.log('=' .repeat(60));

// Test scenarios
const scenarios = [
  {
    name: 'Deep Focus - Optimal Conditions',
    payload: {
      sessionId: 'test-session-1',
      userId: 'test-user-1',
      preferences: {
        intent: 'deep_focus',
        location: 'library',
        chronotype: 'morning',
        soundSensitivity: 5,
      },
    },
  },
  {
    name: 'Sleep Preparation - Night Time',
    payload: {
      sessionId: 'test-session-2',
      userId: 'test-user-2',
      preferences: {
        intent: 'sleep',
        location: 'home',
        chronotype: 'evening',
        soundSensitivity: 7,
      },
    },
  },
  {
    name: 'Meditation - Quiet Environment',
    payload: {
      sessionId: 'test-session-3',
      userId: 'test-user-3',
      preferences: {
        intent: 'meditation',
        location: 'quiet room',
        chronotype: 'neutral',
        soundSensitivity: 6,
      },
    },
  },
  {
    name: 'Creative Work - Afternoon',
    payload: {
      sessionId: 'test-session-4',
      userId: 'test-user-4',
      preferences: {
        intent: 'creative_work',
        location: 'home office',
        chronotype: 'evening',
        soundSensitivity: 4,
      },
    },
  },
  {
    name: 'Focus in Noisy Environment',
    payload: {
      sessionId: 'test-session-5',
      userId: 'test-user-5',
      preferences: {
        intent: 'focus',
        location: 'coffee shop',
        chronotype: 'morning',
        soundSensitivity: 3,
      },
    },
  },
];

// Track results
const results = [];
let completedTests = 0;

// Listen for PLAN_PROPOSED to capture results
eventBus.on(EVENTS.PLAN_PROPOSED, (payload) => {
  const { sessionId, context, strategy, plan } = payload;
  
  results.push({
    sessionId,
    intent: context.intent,
    strategyType: strategy.type,
    strategyIntensity: strategy.intensity,
    beatFrequency: plan.parameters.beatFrequency,
    carrierFrequency: plan.parameters.carrierFrequency,
    volume: plan.parameters.volume,
    duration: plan.parameters.duration,
    band: plan.parameters.band,
    rampIn: plan.parameters.rampIn,
    adjustments: plan.reasoning.adjustments,
    confidence: plan.confidence,
  });
  
  completedTests++;
  
  // Print result
  console.log(`\n✅ Test ${completedTests}/${scenarios.length}: ${scenarios[completedTests - 1].name}`);
  console.log('-'.repeat(60));
  console.log(`Intent: ${context.intent}`);
  console.log(`Strategy: ${strategy.type} (intensity: ${strategy.intensity})`);
  console.log(`Beat Frequency: ${plan.parameters.beatFrequency.toFixed(2)} Hz (${plan.parameters.band})`);
  console.log(`Carrier Frequency: ${plan.parameters.carrierFrequency.toFixed(1)} Hz`);
  console.log(`Volume: ${(plan.parameters.volume * 100).toFixed(0)}%`);
  console.log(`Duration: ${Math.floor(plan.parameters.duration / 60)} minutes`);
  console.log(`Ramp In/Out: ${plan.parameters.rampIn}s (${plan.parameters.rampCurve})`);
  console.log(`Confidence: ${(plan.confidence * 100).toFixed(0)}%`);
  console.log(`\nAdjustments:`);
  plan.reasoning.adjustments.forEach(adj => console.log(`  • ${adj}`));
  
  // If all tests complete, print summary
  if (completedTests === scenarios.length) {
    printSummary();
  }
});

// Listen for errors
eventBus.on(EVENTS.PLAN_ERROR, (payload) => {
  console.error(`\n❌ Plan Error for ${payload.sessionId}:`, payload.error);
  completedTests++;
  
  if (completedTests === scenarios.length) {
    printSummary();
  }
});

// Run tests
console.log(`\nRunning ${scenarios.length} test scenarios...\n`);

scenarios.forEach((scenario, index) => {
  setTimeout(() => {
    console.log(`\n🚀 Starting: ${scenario.name}`);
    eventBus.emit(EVENTS.SESSION_STARTED, scenario.payload);
  }, index * 100); // Stagger slightly to avoid race conditions
});

// Print summary
function printSummary() {
  setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\nTotal Tests: ${scenarios.length}`);
    console.log(`Completed: ${results.length}`);
    console.log(`Success Rate: ${(results.length / scenarios.length * 100).toFixed(0)}%`);
    
    console.log('\n📈 Frequency Distribution:');
    const bandCounts = {};
    results.forEach(r => {
      bandCounts[r.band] = (bandCounts[r.band] || 0) + 1;
    });
    Object.entries(bandCounts).forEach(([band, count]) => {
      console.log(`  ${band}: ${count} plans`);
    });
    
    console.log('\n🎯 Strategy Distribution:');
    const strategyCounts = {};
    results.forEach(r => {
      strategyCounts[r.strategyType] = (strategyCounts[r.strategyType] || 0) + 1;
    });
    Object.entries(strategyCounts).forEach(([strategy, count]) => {
      console.log(`  ${strategy}: ${count} plans`);
    });
    
    console.log('\n📊 Parameter Ranges:');
    const beatFreqs = results.map(r => r.beatFrequency);
    const carrierFreqs = results.map(r => r.carrierFrequency);
    const volumes = results.map(r => r.volume);
    
    console.log(`  Beat Frequency: ${Math.min(...beatFreqs).toFixed(2)} - ${Math.max(...beatFreqs).toFixed(2)} Hz`);
    console.log(`  Carrier Frequency: ${Math.min(...carrierFreqs).toFixed(1)} - ${Math.max(...carrierFreqs).toFixed(1)} Hz`);
    console.log(`  Volume: ${(Math.min(...volumes) * 100).toFixed(0)}% - ${(Math.max(...volumes) * 100).toFixed(0)}%`);
    
    console.log('\n✅ All tests complete!\n');
    process.exit(0);
  }, 500);
}

// Timeout safety
setTimeout(() => {
  if (completedTests < scenarios.length) {
    console.error('\n⏱️  Test timeout - not all tests completed');
    console.error(`Completed: ${completedTests}/${scenarios.length}`);
    process.exit(1);
  }
}, 10000);
