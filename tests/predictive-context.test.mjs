#!/usr/bin/env node
/**
 * Unit Tests for Predictive Context Module
 */

import { PredictiveContextManager } from '../.opencode/scripts/predictive-context.mjs';
import { mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('\n🧪 Running Predictive Context Tests\n');
    
    for (const { name, fn } of this.tests) {
      try {
        await fn();
        console.log(`  ✅ ${name}`);
        this.passed++;
      } catch (error) {
        console.log(`  ❌ ${name}`);
        console.log(`     Error: ${error.message}`);
        this.failed++;
      }
    }
    
    console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed\n`);
    return this.failed === 0;
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
  }

  assertTrue(value, message) {
    if (!value) {
      throw new Error(message || 'Expected true, got false');
    }
  }

  assertFalse(value, message) {
    if (value) {
      throw new Error(message || 'Expected false, got true');
    }
  }
}

const runner = new TestRunner();
const testDir = join(process.cwd(), 'test-predictive-data');

// Setup test directory
if (existsSync(testDir)) {
  rmSync(testDir, { recursive: true });
}
mkdirSync(testDir, { recursive: true });

// Tests
runner.test('should predict exhaustion for low message count', () => {
  const pcm = new PredictiveContextManager(testDir);
  const result = pcm.predictExhaustion(5, []);
  
  runner.assertEqual(result.currentMessageCount, 5, 'Current count should be 5');
  runner.assertEqual(result.remainingMessages, 10, 'Should have 10 messages remaining');
  runner.assertTrue(result.estimatedMinutesUntilExhaustion > 0, 'Should have time estimate');
});

runner.test('should predict exhaustion for high message count', () => {
  const pcm = new PredictiveContextManager(testDir);
  const result = pcm.predictExhaustion(12, []);
  
  runner.assertEqual(result.remainingMessages, 3, 'Should have 3 messages remaining');
  runner.assertTrue(result.riskLevel === 'high' || result.riskLevel === 'critical', 
    'Should have high risk level');
});

runner.test('should analyze task impact', () => {
  const pcm = new PredictiveContextManager(testDir);
  const tasks = [
    { name: 'Task 1', type: 'implementation', complexity: 2 },
    { name: 'Task 2', type: 'testing', complexity: 1 }
  ];
  const result = pcm.analyzeTaskImpact(tasks);
  
  runner.assertTrue(result.totalEstimatedMessages > 0, 'Should estimate messages');
  runner.assertEqual(result.taskBreakdown.length, 2, 'Should have breakdown for each task');
});

runner.test('should calculate risk level', () => {
  const pcm = new PredictiveContextManager(testDir);
  
  const lowRisk = pcm.calculateRiskLevel(5, { totalEstimatedMessages: 2 });
  runner.assertEqual(lowRisk, 'low', 'Should be low risk');
  
  const criticalRisk = pcm.calculateRiskLevel(12, { totalEstimatedMessages: 5 });
  runner.assertEqual(criticalRisk, 'critical', 'Should be critical risk');
});

runner.test('should generate recommendations', () => {
  const pcm = new PredictiveContextManager(testDir);
  const recs = pcm.generateRecommendations(5, 10, { willExhaustContext: false });
  
  runner.assertTrue(recs.length > 0, 'Should have recommendations');
  runner.assertTrue(recs.some(r => r.priority === 'low'), 'Should have low priority recommendation');
});

runner.test('should prioritize tasks correctly', () => {
  const pcm = new PredictiveContextManager(testDir);
  const tasks = [
    { name: 'Low priority', priority: 'low', complexity: 1 },
    { name: 'Critical priority', priority: 'critical', complexity: 1 },
    { name: 'High priority', priority: 'high', complexity: 1 }
  ];
  
  const prioritized = pcm.prioritizeTasks(tasks);
  
  runner.assertEqual(prioritized[0].name, 'Critical priority', 'Critical should be first');
  runner.assertEqual(prioritized[1].name, 'High priority', 'High should be second');
  runner.assertEqual(prioritized[2].name, 'Low priority', 'Low should be last');
});

runner.test('should generate checkpoint schedule', () => {
  const pcm = new PredictiveContextManager(testDir);
  const schedule = pcm.generateCheckpointSchedule(60, 5);
  
  runner.assertTrue(schedule.length >= 2, 'Should have multiple checkpoints');
  runner.assertTrue(schedule.some(cp => cp.trigger.includes('30%')), 'Should have 30% checkpoint');
  runner.assertTrue(schedule.some(cp => cp.trigger.includes('session end')), 'Should have final checkpoint');
});

runner.test('should calculate efficiency score', () => {
  const pcm = new PredictiveContextManager(testDir);
  
  const excellent = pcm.calculateEfficiencyScore(60, 5);
  runner.assertEqual(excellent.score, 'A', 'Should be A for excellent efficiency');
  
  const poor = pcm.calculateEfficiencyScore(60, 1);
  runner.assertEqual(poor.score, 'D', 'Should be D for poor efficiency');
});

runner.test('should create optimal session plan', () => {
  const pcm = new PredictiveContextManager(testDir);
  const tasks = [
    { name: 'Task 1', priority: 'high', complexity: 2 },
    { name: 'Task 2', priority: 'medium', complexity: 1 },
    { name: 'Task 3', priority: 'low', complexity: 1 }
  ];
  
  const plan = pcm.getOptimalSessionPlan(60, tasks);
  
  runner.assertEqual(plan.availableMinutes, 60, 'Should have 60 minutes');
  runner.assertTrue(plan.recommendedTaskCount > 0, 'Should recommend task count');
  runner.assertTrue(plan.tasksInPlan.length > 0, 'Should have tasks in plan');
  runner.assertTrue(plan.checkpointSchedule.length > 0, 'Should have checkpoint schedule');
  runner.assertTrue(plan.efficiency.score, 'Should have efficiency score');
});

runner.test('should record session and update metrics', () => {
  const pcm = new PredictiveContextManager(testDir);
  
  pcm.recordSession({
    messageCount: 10,
    durationMinutes: 30,
    tasksCompleted: 2,
    taskTypes: ['implementation']
  });
  
  runner.assertEqual(pcm.history.sessions.length, 1, 'Should have recorded session');
  runner.assertTrue(pcm.history.averageUsage.messagesPerHour > 0, 'Should update average');
});

// Run tests
runner.run().then(success => {
  // Cleanup
  if (existsSync(testDir)) {
    rmSync(testDir, { recursive: true });
  }
  
  process.exit(success ? 0 : 1);
});
