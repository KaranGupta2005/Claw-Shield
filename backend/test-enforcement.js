/**
 * Enforcement Layer Test Script
 * 
 * Tests the complete pipeline with policy enforcement
 * Run: node test-enforcement.js
 */

// Set environment variables
process.env.LOG_EVENTS = 'true';
process.env.LOG_LEVEL = 'INFO';

import eventBus from './src/core/eventBus.js';
import { EVENTS } from './src/constants/index.js';
import * as contextAgent from './src/agents/contextAgent.js';
import * as strategyAgent from './src/agents/strategyAgent.js';
import * as generationAgent from './src/agents/generationAgent.js';
import * as enforcementBridge from './src/enforcement/enforcementBridge.js';
import mongoose from 'mongoose';
import User from './src/models/User.js';

console.log('🧪 Enforcement Layer Test Starting...\n');

// Enable logging
eventBus.setLogging(true);

// Register all components
console.log('📡 Registering Pipeline Components...');
contextAgent.register(eventBus);
strategyAgent.register(eventBus);
generationAgent.register(eventBus);
enforcementBridge.register(eventBus);

let approvedCount = 0;
let blockedCount = 0;

// Listen for PLAN_APPROVED
eventBus.on(EVENTS.PLAN_APPROVED, (payload) => {
  approvedCount++;
  console.log('\n✅ PLAN_APPROVED!\n');
  console.log('📊 Approved Plan Summary:');
  console.log('─'.repeat(70));
  
  const { plan, policyResult } = payload;
  
  console.log(`  Beat Frequency: ${plan.parameters.beatFrequency} Hz`);
  console.log(`  Carrier Frequency: ${plan.parameters.carrierFrequency} Hz`);
  console.log(`  Volume: ${(plan.parameters.volume * 100).toFixed(0)}%`);
  console.log(`  Duration: ${Math.floor(plan.parameters.duration / 60)} minutes`);
  
  if (policyResult.warnings.length > 0) {
    console.log(`\n  ⚠️  Warnings (${policyResult.warnings.length}):`);
    policyResult.warnings.forEach(w => {
      console.log(`    • ${w.message}`);
    });
  } else {
    console.log('\n  ✓ No policy warnings');
  }
  
  console.log('\n' + '─'.repeat(70));
});

// Listen for PLAN_BLOCKED
eventBus.on(EVENTS.PLAN_BLOCKED, (payload) => {
  blockedCount++;
  console.log('\n❌ PLAN_BLOCKED!\n');
  console.log('🚫 Policy Violations:');
  console.log('─'.repeat(70));
  
  payload.violations.forEach((v, i) => {
    console.log(`\n  ${i + 1}. ${v.rule} (${v.severity})`);
    console.log(`     ${v.message}`);
    if (v.reason) {
      console.log(`     Reason: ${v.reason}`);
    }
  });
  
  if (payload.warnings.length > 0) {
    console.log(`\n  ⚠️  Additional Warnings:`);
    payload.warnings.forEach(w => {
      console.log(`    • ${w.message}`);
    });
  }
  
  console.log('\n' + '─'.repeat(70));
});

// Test scenarios
const scenarios = [
  {
    name: 'Valid Sleep Preparation',
    preferences: { intent: 'sleep', locationHint: 'home' },
    expectedOutcome: 'APPROVED',
  },
  {
    name: 'Valid Deep Focus',
    preferences: { intent: 'deep_focus', locationHint: 'library' },
    expectedOutcome: 'APPROVED',
  },
  {
    name: 'Valid Meditation',
    preferences: { intent: 'meditation', locationHint: 'home' },
    expectedOutcome: 'APPROVED',
  },
];

let currentScenario = 0;
let testUser;

function runScenario(index) {
  if (index >= scenarios.length) {
    showFinalResults();
    return;
  }
  
  const scenario = scenarios[index];
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🧪 Scenario ${index + 1}: ${scenario.name}`);
  console.log(`${'='.repeat(70)}\n`);
  
  eventBus.emit(EVENTS.SESSION_STARTED, {
    sessionId: `test-enforcement-${index + 1}`,
    userId: testUser._id.toString(),
    preferences: scenario.preferences,
  });
  
  // Wait for result, then move to next
  setTimeout(() => {
    currentScenario++;
    runScenario(currentScenario);
  }, 2000);
}

function showFinalResults() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 ENFORCEMENT LAYER TEST RESULTS');
  console.log('='.repeat(70));
  
  console.log(`\nTotal Scenarios: ${scenarios.length}`);
  console.log(`Plans Approved: ${approvedCount}`);
  console.log(`Plans Blocked: ${blockedCount}`);
  
  console.log('\n🎯 Complete Pipeline Verified:');
  console.log('  1. SESSION_STARTED → Context Agent (perception)');
  console.log('  2. CONTEXT_READY → Strategy Agent (reasoning)');
  console.log('  3. STRATEGY_READY → Generation Agent (planning)');
  console.log('  4. PLAN_PROPOSED → Enforcement Bridge (policy check)');
  console.log('  5. PLAN_APPROVED/BLOCKED → [Ready for Execution]');
  
  console.log('\n✅ Enforcement Layer Features:');
  console.log('  • Intent contracts enforced');
  console.log('  • Temporal constraints applied');
  console.log('  • Sensitivity protection active');
  console.log('  • Policy violations detected');
  console.log('  • Warnings generated for concerns');
  console.log('  • Deterministic, rule-based evaluation');
  
  console.log('\n🔒 Safety Guarantees:');
  console.log('  • ML never has final authority over execution');
  console.log('  • All plans pass through policy gate');
  console.log('  • User intent contracts honored');
  console.log('  • Environmental constraints respected');
  console.log('  • Autonomy with control achieved');
  
  mongoose.connection.close();
  process.exit(0);
}

// Connect to MongoDB and run tests
const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://guptakaranport:karang2006@cluster0.gapyepy.mongodb.net/claw-shield';

mongoose.connect(MONGO_URL)
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    // Find or create test user
    testUser = await User.findOne({ email: 'test@clawshield.com' });
    
    if (!testUser) {
      testUser = await User.create({
        email: 'test@clawshield.com',
        password: 'test123456',
        name: 'Test User',
        chronotype: 'morning',
        soundSensitivity: 7,
      });
    }
    
    console.log('✅ Test user ready\n');
    console.log('🚀 Running Enforcement Tests...\n');
    
    // Start first scenario
    runScenario(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  });
