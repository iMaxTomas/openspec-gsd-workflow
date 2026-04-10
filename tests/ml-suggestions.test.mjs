#!/usr/bin/env node
/**
 * Unit Tests for ML Suggestions Module
 */

import { MLSuggestions } from '../.opencode/scripts/ml-suggestions.mjs';
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
    console.log('\n🧪 Running ML Suggestions Tests\n');
    
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
const testDir = join(process.cwd(), 'test-ml-data');

// Setup test directory
if (existsSync(testDir)) {
  rmSync(testDir, { recursive: true });
}
mkdirSync(testDir, { recursive: true });

// Tests
runner.test('should estimate complexity for high-complexity task', () => {
  const ml = new MLSuggestions(testDir);
  const result = ml.estimateComplexity('Refactor the entire architecture and migrate database');
  
  runner.assertEqual(result.level, 'high', 'Complexity level should be high');
  runner.assertTrue(result.score >= 6, 'Score should be >= 6 for high complexity');
});

runner.test('should estimate complexity for medium-complexity task', () => {
  const ml = new MLSuggestions(testDir);
  const result = ml.estimateComplexity('Add new feature to existing module');
  
  runner.assertEqual(result.level, 'medium', 'Complexity level should be medium');
});

runner.test('should estimate complexity for low-complexity task', () => {
  const ml = new MLSuggestions(testDir);
  const result = ml.estimateComplexity('Update documentation and fix typo');
  
  runner.assertEqual(result.level, 'low', 'Complexity level should be low');
});

runner.test('should recommend feature approach for implementation tasks', () => {
  const ml = new MLSuggestions(testDir);
  const result = ml.recommendApproach('Implement user authentication feature');
  
  runner.assertEqual(result.type, 'feature', 'Should recommend feature approach');
  runner.assertEqual(result.suggestedLane, 'research', 'Should suggest research lane');
  runner.assertTrue(result.steps.length > 0, 'Should have implementation steps');
});

runner.test('should recommend bugfix approach for bug tasks', () => {
  const ml = new MLSuggestions(testDir);
  const result = ml.recommendApproach('Fix login bug causing 500 error');
  
  runner.assertEqual(result.type, 'bugfix', 'Should recommend bugfix approach');
  runner.assertEqual(result.suggestedLane, 'execution', 'Should suggest execution lane');
});

runner.test('should recommend refactoring approach for refactor tasks', () => {
  const ml = new MLSuggestions(testDir);
  const result = ml.recommendApproach('Refactor legacy code to use modern patterns');
  
  runner.assertEqual(result.type, 'refactoring', 'Should recommend refactoring approach');
  runner.assertEqual(result.suggestedLane, 'review', 'Should suggest review lane');
});

runner.test('should identify security risks', () => {
  const ml = new MLSuggestions(testDir);
  const result = ml.identifyRiskFactors('Implement authentication and authorization');
  
  runner.assertTrue(result.length > 0, 'Should identify risks');
  runner.assertTrue(
    result.some(r => r.risk.includes('Security')),
    'Should identify security risk'
  );
});

runner.test('should identify database migration risks', () => {
  const ml = new MLSuggestions(testDir);
  const result = ml.identifyRiskFactors('Migrate database schema and update models');
  
  runner.assertTrue(
    result.some(r => r.risk.includes('migration')),
    'Should identify migration risk'
  );
});

runner.test('should generate worktree name from description', () => {
  const ml = new MLSuggestions(testDir);
  const name = ml.suggestWorktreeName('Fix critical login bug');
  
  runner.assertTrue(name.includes('fix'), 'Should include "fix" in name');
  runner.assertTrue(name.includes('critical'), 'Should include "critical" in name');
  runner.assertTrue(name.includes('login'), 'Should include "login" in name');
  runner.assertTrue(/\d+$/.test(name), 'Should end with timestamp');
});

runner.test('should suggest checkpoint timing for high complexity', () => {
  const ml = new MLSuggestions(testDir);
  const timing = ml.suggestCheckpointTiming('Refactor architecture');
  
  runner.assertTrue(timing.initial.includes('requirements'), 'Should mention requirements');
  runner.assertTrue(timing.intermediate.includes('2-3 hours'), 'Should suggest 2-3 hour intervals');
});

runner.test('should suggest checkpoint timing for low complexity', () => {
  const ml = new MLSuggestions(testDir);
  const timing = ml.suggestCheckpointTiming('Fix typo');
  
  runner.assertTrue(timing.intermediate.includes('30 minutes'), 'Should suggest shorter intervals');
});

runner.test('should analyze complete task and return all fields', () => {
  const ml = new MLSuggestions(testDir);
  const result = ml.analyzeTask('Implement new API endpoint');
  
  runner.assertTrue(result.taskDescription, 'Should have task description');
  runner.assertTrue(result.estimatedComplexity, 'Should have complexity estimate');
  runner.assertTrue(result.recommendedApproach, 'Should have approach recommendation');
  runner.assertTrue(result.checkpointTiming, 'Should have checkpoint timing');
  runner.assertTrue(result.riskFactors, 'Should have risk factors');
  runner.assertTrue(result.timestamp, 'Should have timestamp');
});

// Run tests
runner.run().then(success => {
  // Cleanup
  if (existsSync(testDir)) {
    rmSync(testDir, { recursive: true });
  }
  
  process.exit(success ? 0 : 1);
});
