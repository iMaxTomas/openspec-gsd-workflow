#!/usr/bin/env node
/**
 * Integration Tests for OpenSpec + GSD + Workflow
 * Tests the complete workflow integration
 */

import { ContextMonitor } from '../.opencode/scripts/context-monitor.mjs';
import { MLSuggestions } from '../.opencode/scripts/ml-suggestions.mjs';
import { PredictiveContextManager } from '../.opencode/scripts/predictive-context.mjs';
import { PerformanceOptimizer } from '../.opencode/scripts/performance-optimizer.mjs';
import { mkdirSync, rmSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

class IntegrationTestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('\n🔗 Running Integration Tests\n');
    
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
}

const runner = new IntegrationTestRunner();
const testDir = join(process.cwd(), 'test-integration');

// Setup
if (existsSync(testDir)) {
  rmSync(testDir, { recursive: true });
}
mkdirSync(testDir, { recursive: true });

// Integration Tests
runner.test('should integrate ML suggestions with context monitor', () => {
  const ml = new MLSuggestions(testDir);
  const monitor = new ContextMonitor('test-change', 'test-project');
  
  // Analyze a task
  const analysis = ml.analyzeTask('Implement user authentication');
  
  // Simulate messages up to yellow threshold
  for (let i = 0; i < 11; i++) {
    monitor.onMessage('Test message');
  }
  
  const status = monitor.getStatusInfo();
  
  // ML should suggest checkpoint timing based on complexity
  runner.assertTrue(analysis.checkpointTiming, 'Should have checkpoint timing');
  runner.assertEqual(status.status, 'yellow', 'Should be at yellow status');
});

runner.test('should integrate predictive context with session planning', () => {
  const pcm = new PredictiveContextManager(testDir);
  const ml = new MLSuggestions(testDir);
  
  // Analyze task complexity
  const analysis = ml.analyzeTask('Implement new feature with database migration');
  
  // Predict context usage based on task
  const tasks = [
    { name: 'Setup', type: 'implementation', complexity: analysis.estimatedComplexity.score },
    { name: 'Implementation', type: 'implementation', complexity: analysis.estimatedComplexity.score }
  ];
  
  const prediction = pcm.predictExhaustion(5, tasks);
  
  runner.assertTrue(prediction.riskLevel, 'Should have risk level');
  runner.assertTrue(prediction.recommendations.length > 0, 'Should have recommendations');
  
  // High complexity tasks should trigger warnings
  if (analysis.estimatedComplexity.level === 'high') {
    runner.assertTrue(
      prediction.riskLevel === 'high' || prediction.riskLevel === 'critical',
      'High complexity should increase risk'
    );
  }
});

runner.test('should integrate performance optimizer with script analysis', async () => {
  const optimizer = new PerformanceOptimizer(testDir);
  const ml = new MLSuggestions(testDir);
  
  // Analyze a performance-related task
  const analysis = ml.analyzeTask('Optimize database queries and improve caching');
  
  // Performance optimizer should be able to analyze scripts
  const scriptPath = join(testDir, 'test-script.mjs');
  writeFileSync(scriptPath, `
import { readFileSync } from 'fs';

// Inefficient: reading file in loop
for (let i = 0; i < 10; i++) {
  const data = readFileSync('file.txt');
}
  `);
  
  const perfAnalysis = optimizer.analyzeScript(scriptPath);
  
  runner.assertTrue(perfAnalysis.optimizations.length > 0, 'Should find optimizations');
  runner.assertTrue(analysis.riskFactors.some(r => r.risk.includes('performance') || r.risk.includes('Performance')), 
    'Should identify performance risk');
});

runner.test('should complete full workflow: analyze -> predict -> optimize', () => {
  const ml = new MLSuggestions(testDir);
  const pcm = new PredictiveContextManager(testDir);
  const optimizer = new PerformanceOptimizer(testDir);
  
  // Step 1: Analyze task
  const taskDescription = 'Implement user authentication with JWT tokens and role-based access';
  const mlAnalysis = ml.analyzeTask(taskDescription);
  
  runner.assertTrue(mlAnalysis.estimatedComplexity, 'ML should estimate complexity');
  runner.assertTrue(mlAnalysis.riskFactors.length > 0, 'ML should identify risks');
  
  // Step 2: Predict context usage
  const tasks = mlAnalysis.recommendedApproach.steps.map((step, i) => ({
    name: step,
    type: i === 0 ? 'research' : 'implementation',
    complexity: mlAnalysis.estimatedComplexity.score
  }));
  
  const prediction = pcm.predictExhaustion(3, tasks);
  
  runner.assertTrue(prediction.riskLevel, 'Should predict risk level');
  runner.assertTrue(prediction.estimatedTasksRemaining > 0, 'Should estimate tasks remaining');
  
  // Step 3: Get optimal session plan
  const sessionPlan = pcm.getOptimalSessionPlan(120, tasks);
  
  runner.assertTrue(sessionPlan.recommendedTaskCount > 0, 'Should recommend task count');
  runner.assertTrue(sessionPlan.checkpointSchedule.length > 0, 'Should have checkpoints');
  
  // Verify integration: recommendations should consider complexity
  if (mlAnalysis.estimatedComplexity.level === 'high') {
    runner.assertTrue(
      prediction.recommendations.some(r => r.action.includes('checkpoint') || r.action.includes('split')),
      'High complexity should trigger checkpoint recommendations'
    );
  }
});

runner.test('should handle worktree creation workflow', () => {
  const ml = new MLSuggestions(testDir);
  const monitor = new ContextMonitor('integration-test', 'test-project');
  
  // Generate worktree name
  const worktreeName = ml.suggestWorktreeName('Implement authentication feature');
  
  runner.assertTrue(worktreeName.includes('implement'), 'Worktree name should include keywords');
  runner.assertTrue(/\d+$/.test(worktreeName), 'Worktree name should include timestamp');
  
  // Simulate context exhaustion
  monitor.messageCount = 13; // Red zone
  const status = monitor.getStatusInfo();
  
  runner.assertEqual(status.status, 'red', 'Should be in red zone');
  runner.assertTrue(status.action.includes('checkpoint'), 'Should recommend checkpoint');
});

runner.test('should integrate risk detection across modules', () => {
  const ml = new MLSuggestions(testDir);
  
  // Security-related task
  const securityTask = 'Implement OAuth2 authentication with refresh tokens';
  const mlAnalysis = ml.analyzeTask(securityTask);
  
  runner.assertTrue(
    mlAnalysis.riskFactors.some(r => r.risk.toLowerCase().includes('security')),
    'ML should detect security risk'
  );
  
  // Database migration task
  const migrationTask = 'Migrate user data to new schema with foreign keys';
  const migrationAnalysis = ml.analyzeTask(migrationTask);
  
  runner.assertTrue(
    migrationAnalysis.riskFactors.some(r => 
      r.risk.toLowerCase().includes('migration') || 
      r.risk.toLowerCase().includes('database')
    ),
    'ML should detect migration risk'
  );
});

// Run tests
runner.run().then(success => {
  // Cleanup
  if (existsSync(testDir)) {
    rmSync(testDir, { recursive: true });
  }
  
  process.exit(success ? 0 : 1);
});
