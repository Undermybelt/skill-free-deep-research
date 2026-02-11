#!/usr/bin/env node
/**
 * Example: Basic usage of Free Deep Research Skill
 */

import FreeDeepResearch from '../src/index.js';

async function main() {
  const research = new FreeDeepResearch({
    depth: 'medium', // quick, medium, comprehensive
    parallel: 2,
    timeout: 5 * 60 * 1000 // 5 minutes
  });

  // Start a research task
  const topic = "AI agent orchestration frameworks";
  console.log(`🚀 Starting research: ${topic}`);
  const task = await research.start(topic, 'medium');
  console.log(`Task started: ${JSON.stringify(task, null, 2)}`);

  // Poll for completion
  let status;
  do {
    await new Promise(resolve => setTimeout(resolve, 2000));
    status = await research.status(task.taskId);
    console.log(`⏳ Progress: ${status.progress}% - ${status.status}`);
  } while (status.status === 'running');

  if (status.status === 'completed') {
    console.log(`✅ Research completed! Duration: ${Math.round(status.duration / 1000)}s`);
    // Report saved to memory/research/research-YYYY-MM-DD-<topic>-<id>.md
  } else {
    console.log(`❌ Research failed or stopped: ${status.status}`);
  }

  // List all tasks
  const tasks = await research.list();
  console.log('All tasks:', tasks);
}

main().catch(console.error);
