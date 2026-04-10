#!/usr/bin/env node
/**
 * Test Suite for Context Monitor
 */

import { ContextMonitor } from '../.opencode/scripts/context-monitor.mjs';
import assert from 'assert';

// Mock fs operations for testing
const mockState = new Map();

class TestContextMonitor extends ContextMonitor {
  constructor(changeId) {
    super(changeId, 'test-project');
    this.mockState = new Map();
  }

  loadState() {
    this.messageCount = this.mockState.get('messageCount') || 0;
  }

  saveState() {
    this.mockState.set('messageCount', this.messageCount);
  }
}

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (err) {
    console.error(`❌ ${name}`);
    console.error(`   ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('🧪 Running Context Monitor Tests...\n');

// Test 1: Initial state
test('Should start with message count 0', () => {
  const monitor = new TestContextMonitor('test-1');
  assert.strictEqual(monitor.messageCount, 0);
  assert.strictEqual(monitor.getStatus(), 'green');
});

// Test 2: Green zone (0-9)
test('Should be green from 0-9 messages', () => {
  const monitor = new TestContextMonitor('test-2');
  
  for (let i = 0; i < 9; i++) {
    monitor.onMessage();
  }
  
  assert.strictEqual(monitor.messageCount, 9);
  assert.strictEqual(monitor.getStatus(), 'green');
});

// Test 3: Yellow zone (10-11)
test('Should be yellow at 10+ messages', () => {
  const monitor = new TestContextMonitor('test-3');
  
  for (let i = 0; i < 10; i++) {
    monitor.onMessage();
  }
  
  assert.strictEqual(monitor.messageCount, 10);
  assert.strictEqual(monitor.getStatus(), 'yellow');
});

// Test 4: Red zone (12+)
test('Should be red at 12+ messages', () => {
  const monitor = new TestContextMonitor('test-4');
  
  for (let i = 0; i < 12; i++) {
    monitor.onMessage();
  }
  
  assert.strictEqual(monitor.messageCount, 12);
  assert.strictEqual(monitor.getStatus(), 'red');
});

// Test 5: Status info
test('Should return correct status info', () => {
  const monitor = new TestContextMonitor('test-5');
  const info = monitor.getStatusInfo();
  
  assert.strictEqual(info.status, 'green');
  assert.strictEqual(info.messageCount, 0);
  assert.strictEqual(info.threshold, 15);
  assert(info.message);
  assert(info.action);
});

// Test 6: Reset
test('Should reset message count', () => {
  const monitor = new TestContextMonitor('test-6');
  
  for (let i = 0; i < 10; i++) {
    monitor.onMessage();
  }
  
  assert.strictEqual(monitor.messageCount, 10);
  
  monitor.reset();
  
  assert.strictEqual(monitor.messageCount, 0);
  assert.strictEqual(monitor.getStatus(), 'green');
});

// Test 7: Thresholds
test('Should have correct thresholds', () => {
  const monitor = new TestContextMonitor('test-7');
  const thresholds = monitor.thresholds;
  
  assert.deepStrictEqual(thresholds.green.range, [0, 10]);
  assert.deepStrictEqual(thresholds.yellow.range, [10, 12]);
  assert.deepStrictEqual(thresholds.red.range, [12, 15]);
});

console.log('\n📊 Test Summary');
console.log('================');

const exitCode = process.exitCode || 0;
if (exitCode === 0) {
  console.log('✅ All tests passed!');
} else {
  console.log('❌ Some tests failed');
  process.exit(exitCode);
}
