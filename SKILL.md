# Free Deep Research Skill

> 研究自动化 + 智能编排 + 跨平台执行

## 功能
自动执行多步骤研究任务：搜索 → 抓取 → 分析 → 总结。支持并行、容错、可追溯。

基于 usemanusai/free-deep-research 的模式构建。

## 使用场景
- 深度研究项目（竞品分析、技术调研）
- 信息聚合（周报、月报自动生成）
- 跨平台数据收集（GitHub + Twitter + Web）
- 学习笔记自动化（论文、博客摘要）

## 核心模式
**研究流水线 (Research Pipeline)**
1. **规划**: AI 生成研究计划（问题 → 子任务）
2. **执行**: 并行执行搜索、浏览、提取
3. **验证**: 交叉验证信息源
4. **合成**: 生成最终报告（Markdown/PDF）

**容错设计**：
- 单步失败 → 重试 ×3 → 降级方案
- Token 限制 → 流式处理 + 分块
- 网络错误 → exponential backoff

## 命令
```
/research start --topic "AI agent orchestration frameworks" --depth comprehensive
/research status <taskId>
/research stop <taskId>
/research list --status running|completed|failed
```

## 输出
- 研究完成 → 生成 `research/research-2026-02-11-<topic>-<id>.md`
- 包含：摘要、关键发现、来源链接、置信度评估
- 可选：导出 PDF、上传到 Notion/Obsidian

## 配置
```yaml
research:
  depth: medium  # quick|medium|comprehensive
  sources:
    - web_search: true
    - github: true
    - twitter: false  # 需 playwriter
    - arxiv: true

orchestration:
  parallel: 4     # 并行任务数
  timeout: 10m    # 总超时
  retry: 3        # 重试次数

output:
  format: markdown
  auto_upload: false
  destinations:
    - obsidian
    - notion
```

---
*Skill: free-deep-research*
*Created: 2026-02-11 12:00*
*Inspired by usemanusai/free-deep-research*
*Priority: P0 - 研究自动化核心平台*
