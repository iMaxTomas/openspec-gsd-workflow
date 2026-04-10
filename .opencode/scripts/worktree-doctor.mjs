#!/usr/bin/env node
/**
 * Worktree Health Check
 * Validates worktree health and detects issues
 * Reference: GSD 2 Doctor command
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { spawnSync } from 'child_process';

class WorktreeDoctor {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.issues = [];
    this.warnings = [];
  }

  async check() {
    console.log('🔍 Worktree Health Check\n');
    console.log(`Project: ${this.projectRoot}\n`);

    const checks = [
      { name: 'Git repository', fn: () => this.checkGitRepository() },
      { name: 'Worktree configuration', fn: () => this.checkWorktreeConfig() },
      { name: 'Orphaned worktrees', fn: () => this.checkOrphanedWorktrees() },
      { name: 'Detached HEAD', fn: () => this.checkDetachedHead() },
      { name: 'Uncommitted changes', fn: () => this.checkUncommittedChanges() },
      { name: 'Sync status', fn: () => this.checkSyncStatus() },
      { name: 'Large files', fn: () => this.checkLargeFiles() },
      { name: 'Stale locks', fn: () => this.checkStaleLocks() }
    ];

    for (const check of checks) {
      process.stdout.write(`  Checking ${check.name}... `);
      try {
        const result = await check.fn();
        if (result.status === 'ok') {
          console.log('✅');
        } else if (result.status === 'warning') {
          console.log('⚠️');
          this.warnings.push({ check: check.name, message: result.message });
        } else {
          console.log('❌');
          this.issues.push({ check: check.name, message: result.message });
        }
      } catch (error) {
        console.log('❌');
        this.issues.push({ check: check.name, message: error.message });
      }
    }

    return this.generateReport();
  }

  checkGitRepository() {
    const gitDir = join(this.projectRoot, '.git');
    if (!existsSync(gitDir)) {
      return { status: 'error', message: 'Not a git repository' };
    }
    return { status: 'ok' };
  }

  checkWorktreeConfig() {
    const worktreeConfig = join(this.projectRoot, '.git', 'config.worktree');
    const isWorktree = existsSync(worktreeConfig) || 
                       this.projectRoot.includes('gsd-workspaces');
    
    if (isWorktree) {
      return { status: 'ok', message: 'Worktree detected' };
    }
    
    return { status: 'ok', message: 'Main repository' };
  }

  checkOrphanedWorktrees() {
    const result = spawnSync('git', ['worktree', 'list'], {
      encoding: 'utf8',
      cwd: this.projectRoot
    });

    if (result.status !== 0) {
      return { status: 'error', message: 'Cannot list worktrees' };
    }

    const worktrees = result.stdout.split('\n').filter(line => line.trim());
    const orphaned = [];

    for (const line of worktrees) {
      const match = line.match(/(\S+)\s+\[([\w\/\-]+)\]/);
      if (match) {
        const [, path, branch] = match;
        if (!existsSync(path)) {
          orphaned.push({ path, branch });
        }
      }
    }

    if (orphaned.length > 0) {
      return { 
        status: 'warning', 
        message: `${orphaned.length} orphaned worktrees detected` 
      };
    }

    return { status: 'ok' };
  }

  checkDetachedHead() {
    const result = spawnSync('git', ['symbolic-ref', '--quiet', 'HEAD'], {
      encoding: 'utf8',
      cwd: this.projectRoot
    });

    if (result.status !== 0) {
      return { status: 'warning', message: 'Detached HEAD detected' };
    }

    return { status: 'ok' };
  }

  checkUncommittedChanges() {
    const result = spawnSync('git', ['status', '--porcelain'], {
      encoding: 'utf8',
      cwd: this.projectRoot
    });

    if (result.stdout?.trim()) {
      const lines = result.stdout.trim().split('\n');
      return { 
        status: 'warning', 
        message: `${lines.length} uncommitted changes` 
      };
    }

    return { status: 'ok' };
  }

  checkSyncStatus() {
    // Check if behind/ahead of remote
    const fetchResult = spawnSync('git', ['fetch', '--dry-run'], {
      encoding: 'utf8',
      cwd: this.projectRoot
    });

    const statusResult = spawnSync('git', ['status', '-uno'], {
      encoding: 'utf8',
      cwd: this.projectRoot
    });

    const status = statusResult.stdout || '';
    
    if (status.includes('behind')) {
      return { status: 'warning', message: 'Behind remote - consider pulling' };
    }
    
    if (status.includes('ahead')) {
      return { status: 'warning', message: 'Ahead of remote - consider pushing' };
    }

    return { status: 'ok' };
  }

  checkLargeFiles() {
    const largeFiles = [];
    const maxSize = 10 * 1024 * 1024; // 10MB

    try {
      const result = spawnSync('git', ['ls-files'], {
        encoding: 'utf8',
        cwd: this.projectRoot
      });

      const files = result.stdout.split('\n').filter(f => f.trim());
      
      for (const file of files.slice(0, 100)) { // Check first 100 files
        try {
          const path = join(this.projectRoot, file);
          if (existsSync(path)) {
            const stats = statSync(path);
            if (stats.size > maxSize) {
              largeFiles.push({ file, size: stats.size });
            }
          }
        } catch {}
      }
    } catch {}

    if (largeFiles.length > 0) {
      return { 
        status: 'warning', 
        message: `${largeFiles.length} large files (>10MB)` 
      };
    }

    return { status: 'ok' };
  }

  checkStaleLocks() {
    const lockFiles = [
      join(this.projectRoot, '.git', 'index.lock'),
      join(this.projectRoot, '.git', 'HEAD.lock')
    ];

    const staleLocks = lockFiles.filter(lock => existsSync(lock));

    if (staleLocks.length > 0) {
      return { 
        status: 'error', 
        message: `${staleLocks.length} stale lock files` 
      };
    }

    return { status: 'ok' };
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('WORKTREE HEALTH REPORT');
    console.log('='.repeat(60));
    console.log(`\nStatus: ${this.issues.length === 0 ? '✅ HEALTHY' : '❌ ISSUES FOUND'}`);
    console.log(`Issues: ${this.issues.length}`);
    console.log(`Warnings: ${this.warnings.length}\n`);

    if (this.issues.length > 0) {
      console.log('Issues (must fix):');
      this.issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. [${issue.check}] ${issue.message}`);
      });
      console.log('');
    }

    if (this.warnings.length > 0) {
      console.log('Warnings (recommended):');
      this.warnings.forEach((warning, i) => {
        console.log(`  ${i + 1}. [${warning.check}] ${warning.message}`);
      });
      console.log('');
    }

    if (this.issues.length === 0 && this.warnings.length === 0) {
      console.log('✅ All checks passed! Worktree is healthy.\n');
    }

    console.log('='.repeat(60) + '\n');

    return {
      healthy: this.issues.length === 0,
      issues: this.issues,
      warnings: this.warnings
    };
  }
}

// CLI interface
function main() {
  const doctor = new WorktreeDoctor();
  
  doctor.check().then(result => {
    process.exit(result.healthy ? 0 : 1);
  }).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { WorktreeDoctor };
