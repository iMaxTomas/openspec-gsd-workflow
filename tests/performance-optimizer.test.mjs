#!/usr/bin/env node
/**
 * Unit Tests for Performance Optimizer Module
 */

import { PerformanceOptimizer } from '../.opencode/scripts/performance-optimizer.mjs';
import { mkdirSync, rmSync, existsSync, writeFileSync } from 'fs';
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
    console.log('\n🧪 Running Performance Optimizer Tests\n');
    
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
const testDir = join(process.cwd(), 'test-perf-data');

// Setup test directory
if (existsSync(testDir)) {
  rmSync(testDir, { recursive: true });
}
mkdirSync(testDir, { recursive: true });

// Tests
runner.test('should calculate optimization score A', () => {
  const optimizer = new PerformanceOptimizer(testDir);
  const score = optimizer.calculateOptimizationScore([]);
  
  runner.assertEqual(score, 'A', 'Empty optimizations should score A');
});

runner.test('should calculate optimization score D', () => {
  const optimizer = new PerformanceOptimizer(testDir);
  const optimizations = [
    { severity: 'high' },
    { severity: 'high' },
    { severity: 'medium' }
  ];
  const score = optimizer.calculateOptimizationScore(optimizations);
  
  runner.assertEqual(score, 'D', 'Multiple high severity issues should score D');
});

runner.test('should find line number in content', () => {
  const optimizer = new PerformanceOptimizer(testDir);
  const content = 'line1\nline2\nline3\ntarget line\nline5';
  const lineNum = optimizer.findLineNumber(content, 'target line');
  
  runner.assertEqual(lineNum, 4, 'Should find line 4');
});

runner.test('should recommend parallelization for independent tasks', () => {
  const optimizer = new PerformanceOptimizer(testDir);
  const tasks = [
    { name: 'Task 1', estimatedTime: 5, dependencies: [] },
    { name: 'Task 2', estimatedTime: 3, dependencies: [] },
    { name: 'Task 3', estimatedTime: 4, dependencies: ['Task 1'] }
  ];
  
  const result = optimizer.recommendParallelization(tasks);
  
  runner.assertEqual(result.parallelizableCount, 2, 'Should have 2 parallelizable tasks');
  runner.assertEqual(result.sequentialCount, 1, 'Should have 1 sequential task');
  runner.assertTrue(result.timeSavings.savingsMinutes >= 0, 'Should calculate time savings');
});

runner.test('should calculate parallel time savings', () => {
  const optimizer = new PerformanceOptimizer(testDir);
  const groups = [
    { type: 'parallel', estimatedTime: 10 },
    { type: 'sequential', estimatedTime: 5 }
  ];
  
  const savings = optimizer.calculateParallelSavings(groups);
  
  runner.assertTrue(savings.sequentialMinutes > 0, 'Should have sequential time');
  runner.assertTrue(savings.parallelMinutes > 0, 'Should have parallel time');
  runner.assertTrue(savings.percentImprovement >= 0, 'Should have improvement percentage');
});

runner.test('should analyze script with sync operations in loop', () => {
  const optimizer = new PerformanceOptimizer(testDir);
  const scriptPath = join(testDir, 'test-sync.mjs');
  
  writeFileSync(scriptPath, `
for (let i = 0; i < 10; i++) {
  const data = readFileSync('file.txt');
}
  `);
  
  const analysis = optimizer.analyzeScript(scriptPath);
  
  runner.assertTrue(analysis.optimizations.length > 0, 'Should find optimizations');
  runner.assertTrue(
    analysis.optimizations.some(o => o.issue.includes('Synchronous')),
    'Should detect sync operations'
  );
});

runner.test('should analyze script with regex in loop', () => {
  const optimizer = new PerformanceOptimizer(testDir);
  const scriptPath = join(testDir, 'test-regex.mjs');
  
  writeFileSync(scriptPath, `
for (const item of items) {
  if (/pattern/.test(item)) {
    console.log(item);
  }
}
  `);
  
  const analysis = optimizer.analyzeScript(scriptPath);
  
  runner.assertTrue(
    analysis.optimizations.some(o => o.issue.includes('Regex')),
    'Should detect regex in loop'
  );
});

runner.test('should analyze clean script', () => {
  const optimizer = new PerformanceOptimizer(testDir);
  const scriptPath = join(testDir, 'test-clean.mjs');
  
  writeFileSync(scriptPath, `
const data = await readFile('file.txt');
console.log(data);
  `);
  
  const analysis = optimizer.analyzeScript(scriptPath);
  
  runner.assertEqual(analysis.score, 'A', 'Clean script should score A');
});

runner.test('should calculate cache hit rate', () => {
  const optimizer = new PerformanceOptimizer(testDir);
  optimizer.metrics.cacheHits = 80;
  optimizer.metrics.cacheMisses = 20;
  
  const rate = optimizer.calculateCacheHitRate();
  
  runner.assertEqual(rate, '80%', 'Should calculate 80% hit rate');
});

runner.test('should handle zero cache operations', () => {
  const optimizer = new PerformanceOptimizer(testDir);
  optimizer.metrics.cacheHits = 0;
  optimizer.metrics.cacheMisses = 0;
  
  const rate = optimizer.calculateCacheHitRate();
  
  runner.assertEqual(rate, 'N/A', 'Should return N/A for zero operations');
});

// Run tests
runner.run().then(success => {
  // Cleanup
  if (existsSync(testDir)) {
    rmSync(testDir, { recursive: true });
  }
  
  process.exit(success ? 0 : 1);
});
