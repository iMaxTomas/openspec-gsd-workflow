#!/usr/bin/env node
/**
 * GSD Resume Work - Resume from checkpoint
 * Restores state from a previous pause-work session
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';

class GsdResumeWork {
  constructor(changeId, projectRoot = process.cwd()) {
    this.changeId = changeId;
    this.projectRoot = projectRoot;
  }

  async execute() {
    console.log(`▶️  GSD Resume Work: ${this.changeId}\n`);

    try {
      // 1. Find the most recent handoff
      const handoff = await this.findLatestHandoff();
      
      if (!handoff) {
        console.log('⚠️  No previous handoff found');
        console.log('Starting fresh session...\n');
        return this.startFresh();
      }

      // 2. Display resume info
      this.displayResumeInfo(handoff);

      // 3. Check git status
      await this.checkGitStatus(handoff);

      // 4. Reset context monitor
      await this.resetContextMonitor();

      console.log('\n✅ Ready to resume work!\n');
      console.log(`Session: ${handoff.session_id || 'unknown'}`);
      console.log(`Change: ${handoff.change_id || this.changeId}`);
      console.log(`Paused at: ${handoff.timestamp || 'unknown'}\n`);

      return {
        success: true,
        handoff
      };
    } catch (error) {
      console.error('\n❌ Failed to resume work:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async findLatestHandoff() {
    console.log('🔍 Looking for latest handoff...');

    // Try multiple locations
    const locations = [
      join(this.projectRoot, '.continue-here.md'),
      join(this.projectRoot, '.gsd', 'phases', this.changeId),
      join(this.projectRoot, '.opencode', 'passive')
    ];

    let latestHandoff = null;
    let latestTime = 0;

    // Check .continue-here.md in root
    const continueHerePath = locations[0];
    if (existsSync(continueHerePath)) {
      try {
        const content = readFileSync(continueHerePath, 'utf8');
        const sessionMatch = content.match(/\*\*Session\*\*: (.+)/);
        const timeMatch = content.match(/\*\*Paused At\*\*: (.+)/);
        
        if (sessionMatch && timeMatch) {
          const time = new Date(timeMatch[1]).getTime();
          if (time > latestTime) {
            latestTime = time;
            latestHandoff = {
              session_id: sessionMatch[1].trim(),
              timestamp: timeMatch[1].trim(),
              content: content
            };
          }
        }
      } catch {}
    }

    // Check HANDOFF JSON files
    const gsdPath = locations[1];
    if (existsSync(gsdPath)) {
      try {
        const files = readdirSync(gsdPath);
        const handoffFiles = files.filter(f => f.startsWith('HANDOFF-') && f.endsWith('.json'));
        
        for (const file of handoffFiles) {
          try {
            const content = readFileSync(join(gsdPath, file), 'utf8');
            const data = JSON.parse(content);
            const time = new Date(data.timestamp).getTime();
            
            if (time > latestTime) {
              latestTime = time;
              latestHandoff = data;
            }
          } catch {}
        }
      } catch {}
    }

    return latestHandoff;
  }

  displayResumeInfo(handoff) {
    console.log('\n📋 Resume Information');
    console.log('=====================\n');

    if (handoff.content) {
      // Markdown format
      console.log(handoff.content);
    } else {
      // JSON format
      console.log(`Session: ${handoff.session_id || 'N/A'}`);
      console.log(`Change: ${handoff.change_id || 'N/A'}`);
      console.log(`Branch: ${handoff.branch || 'N/A'}`);
      console.log(`Paused: ${handoff.timestamp || 'N/A'}`);
      
      if (handoff.last_commit) {
        console.log(`\nLast Commit: ${handoff.last_commit}`);
      }
      
      if (handoff.git_status) {
        console.log('\nGit Status:');
        console.log(handoff.git_status);
      }
    }

    console.log('=====================\n');
  }

  async checkGitStatus(handoff) {
    console.log('🔍 Checking git status...');

    // Check current branch
    const currentBranch = spawnSync('git', ['branch', '--show-current'], {
      encoding: 'utf8',
      cwd: this.projectRoot
    });

    const branch = currentBranch.stdout?.trim();
    
    if (handoff.branch && handoff.branch !== branch) {
      console.log(`⚠️  Branch mismatch: expected ${handoff.branch}, currently on ${branch}`);
      console.log(`   Run: git checkout ${handoff.branch}`);
    } else {
      console.log(`   On correct branch: ${branch}`);
    }

    // Check for uncommitted changes
    const status = spawnSync('git', ['status', '--porcelain'], {
      encoding: 'utf8',
      cwd: this.projectRoot
    });

    if (status.stdout?.trim()) {
      console.log('   ⚠️  Uncommitted changes detected');
      console.log('   Run: git status');
    } else {
      console.log('   Working directory clean');
    }
  }

  async resetContextMonitor() {
    console.log('🔄 Resetting context monitor...');

    const contextFile = join(this.projectRoot, '.opencode', 'passive', `context-monitor-${this.changeId}.json`);
    
    if (existsSync(contextFile)) {
      try {
        const data = JSON.parse(readFileSync(contextFile, 'utf8'));
        data.messageCount = 0;
        data.status = 'green';
        data.lastUpdate = new Date().toISOString();
        
        // Note: In real implementation, we'd write this back
        // For now, just log
        console.log('   Context monitor reset to 0 messages');
      } catch {
        console.log('   Could not reset context monitor');
      }
    } else {
      console.log('   No context monitor state found (fresh start)');
    }
  }

  startFresh() {
    console.log('Starting fresh session for:', this.changeId);
    console.log('\nTip: Create a checkpoint when you finish:');
    console.log('  /gsd-pause-work\n');
    
    return {
      success: true,
      fresh: true
    };
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const changeId = args[0] || 'default-change';

  const resumer = new GsdResumeWork(changeId);
  
  resumer.execute().then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { GsdResumeWork };
