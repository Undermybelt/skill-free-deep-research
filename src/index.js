/**
 * Free Deep Research Skill
 * Orchestrates multi-source research workflows with parallelism and error handling
 */

// Research pipeline stages
const STAGES = {
  PLAN: 'plan',
  EXECUTE: 'execute',
  VERIFY: 'verify',
  SYNTHESIZE: 'synthesize'
};

// Default configuration
const DEFAULT_CONFIG = {
  depth: 'medium',
  parallel: 4,
  timeout: 10 * 60 * 1000, // 10 minutes
  retry: 3,
  sources: {
    web_search: true,
    github: true,
    twitter: false,
    arxiv: false
  }
};

export class FreeDeepResearch {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.tasks = new Map();
    this.taskIdCounter = 0;
  }

  /**
   * Start a new research task
   * @param {string} topic - Research topic
   * @param {string} depth - quick|medium|comprehensive
   * @returns {Promise<object>} Task info with id
   */
  async start(topic, depth = 'medium') {
    const taskId = ++this.taskIdCounter;
    const task = {
      id: taskId,
      topic,
      depth,
      status: 'running',
      startTime: Date.now(),
      stages: {},
      results: {},
      errors: []
    };

    this.tasks.set(taskId, task);

    // Execute pipeline (fire and forget, but track status)
    this._runPipeline(taskId, topic, depth).catch(err => {
      task.status = 'failed';
      task.errors.push(err.message);
    });

    return { taskId, topic, status: 'started' };
  }

  /**
   * Get task status
   */
  async status(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return { error: 'Task not found' };
    return {
      id: task.id,
      topic: task.topic,
      status: task.status,
      progress: this._calculateProgress(task),
      duration: Date.now() - task.startTime
    };
  }

  /**
   * List tasks
   */
  async list(filterStatus) {
    return Array.from(this.tasks.values())
      .filter(t => !filterStatus || t.status === filterStatus)
      .map(t => ({
        id: t.id,
        topic: t.topic,
        status: t.status,
        startTime: t.startTime
      }));
  }

  /**
   * Stop a running task
   */
  async stop(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return { error: 'Task not found' };
    task.status = 'stopped';
    return { id: taskId, status: 'stopped' };
  }

  // ========== Internal Pipeline ==========

  async _runPipeline(taskId, topic, depth) {
    const task = this.tasks.get(taskId);

    // Stage 1: Plan
    task.stages[STAGES.PLAN] = 'running';
    const plan = await this._planResearch(topic, depth);
    task.stages[STAGES.PLAN] = 'completed';
    task.results.plan = plan;

    // Stage 2: Execute (parallel sources)
    task.stages[STAGES.EXECUTE] = 'running';
    const sources = await this._executeSources(plan, taskId);
    task.stages[STAGES.EXECUTE] = 'completed';
    task.results.sources = sources;

    // Stage 3: Verify
    task.stages[STAGES.VERIFY] = 'running';
    const verified = await this._verifySources(sources);
    task.stages[STAGES.VERIFY] = 'completed';
    task.results.verified = verified;

    // Stage 4: Synthesize
    task.stages[STAGES.SYNTHESIZE] = 'running';
    const report = await this._synthesizeReport(topic, verified);
    task.stages[STAGES.SYNTHESIZE] = 'completed';
    task.results.report = report;

    // Mark complete
    task.status = 'completed';
    task.endTime = Date.now();

    // Save report
    await this._saveReport(taskId, topic, report);
  }

  async _planResearch(topic, depth) {
    // TODO: Use AI to generate research plan (sub-questions, sources, keywords)
    // For now: simple heuristic
    const plan = {
      topic,
      depth,
      subQuestions: [
        `What is ${topic}?`,
        `Key components of ${topic}`,
        `Recent developments in ${topic}`,
        `Compare ${topic} with alternatives`
      ],
      sources: this._selectSources(depth)
    };
    return plan;
  }

  _selectSources(depth) {
    const sources = ['web_search'];
    if (depth === 'medium' || depth === 'comprehensive') {
      sources.push('github');
    }
    if (depth === 'comprehensive') {
      sources.push('arxiv');
    }
    return sources;
  }

  async _executeSources(plan, taskId) {
    const results = {};
    const tasks = plan.sources.map(async source => {
      try {
        const data = await this._fetchSource(source, plan);
        results[source] = { data, status: 'success' };
      } catch (err) {
        results[source] = { status: 'failed', error: err.message };
      }
    });

    await Promise.allSettled(tasks);
    return results;
  }

  async _fetchSource(source, plan) {
    switch (source) {
      case 'web_search':
        return await this._webSearch(plan.topic);
      case 'github':
        return await this._githubSearch(plan.topic);
      case 'arxiv':
        return await this._arxivSearch(plan.topic);
      default:
        throw new Error(`Unknown source: ${source}`);
    }
  }

  async _webSearch(topic) {
    // Use tavily skill or built-in search
    // For now: placeholder
    return {
      type: 'web',
      query: topic,
      results: [],
      note: 'Implementation requires tavily integration'
    };
  }

  async _githubSearch(topic) {
    // Use github skill
    return {
      type: 'github',
      query: topic,
      results: [],
      note: 'Implementation requires github skill'
    };
  }

  async _arxivSearch(topic) {
    // TODO: Implement arxiv search
    return {
      type: 'arxiv',
      query: topic,
      results: [],
      note: 'Not implemented yet'
    };
  }

  async _verifySources(sources) {
    // Cross-check facts, assess credibility
    // For now: pass through
    return {
      sources,
      verifiedAt: Date.now(),
      confidence: 0.8,
      note: 'Basic verification - enhance with fact-checking'
    };
  }

  async _synthesizeReport(topic, verified) {
    // Compile final markdown report
    const timestamp = new Date().toISOString().slice(0, 19).replace(/T/, ' ');
    let report = `# Research Report: ${topic}\n\n`;
    report += `*Generated: ${timestamp}*\n\n`;
    report += `## Sources\n\n`;

    for (const [source, result] of Object.entries(verified.sources)) {
      report += `### ${source}\n`;
      if (result.status === 'success') {
        report += `- ✅ Success\n`;
        if (result.data.results?.length) {
          report += `- Found ${result.data.results.length} items\n`;
        }
      } else {
        report += `- ❌ Failed: ${result.error}\n`;
      }
      report += '\n';
    }

    report += `## Summary\n\n`;
    report += `(This is a placeholder. Real synthesis would use AI to generate insights.)\n`;

    return report;
  }

  async _saveReport(taskId, topic, report) {
    const dir = this._getReportsDir();
    const filename = `research-${new Date().toISOString().slice(0, 10)}-${topic.replace(/\s+/g, '-').toLowerCase()}-${taskId}.md`;
    const filepath = `${dir}/${filename}`;

    await fs.writeFile(filepath, report, 'utf8');
    return filepath;
  }

  _getReportsDir() {
    // Use workspace memory/research/
    const dir = process.env.OPENCLAW_WORKSPACE
      ? `${process.env.OPENCLAW_WORKSPACE}/memory/research`
      : './reports';
    return dir;
  }

  _calculateProgress(task) {
    const stages = Object.values(task.stages);
    const completed = stages.filter(s => s === 'completed').length;
    const total = Object.keys(STAGES).length;
    return Math.round((completed / total) * 100);
  }
}

// Export for use as a skill
export default FreeDeepResearch;
