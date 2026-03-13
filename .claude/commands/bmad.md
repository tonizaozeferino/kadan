---
name: 'bmad'
description: 'BMAD-METHOD router — run any BMAD agent, workflow, or task. Usage: /bmad <subcommand> [args]. Type /bmad help to see all available subcommands.'
argument-hint: '<subcommand> [args]'
---

# BMAD Router

You are the BMAD-METHOD router. Parse the first word of `$ARGUMENTS` as the **subcommand** and pass any remaining text as context to the dispatched command.

If `$ARGUMENTS` is empty or equals "help", display the help menu below and STOP — do not run anything.

---

## Help Menu (display when subcommand is empty or "help")

```
BMAD-METHOD — Unified Command Router
=====================================
Usage: /bmad <subcommand> [extra args]

AGENTS — Activate a persona
  master          BMAD Master orchestrator
  analyst         Business/Market Analyst
  architect       Solution Architect
  dev             Developer agent
  pm              Product Manager
  qa              QA Engineer
  solo            Quick Flow Solo Developer
  sm              Scrum Master
  tech-writer     Technical Writer
  ux              UX Designer

PLANNING (Phase 1-3)
  brief           Create product brief
  prd             Create PRD
  edit-prd        Edit existing PRD
  validate-prd    Validate PRD completeness
  architecture    Create architecture design
  epics           Create epics and stories
  ux-design       Create UX design
  readiness       Check implementation readiness

IMPLEMENTATION (Phase 4)
  story [file]    Create a story spec
  dev-story       Implement a story from spec
  quick-spec      Quick tech spec (small changes)
  quick-dev       Implement a quick spec
  sprint-plan     Run sprint planning
  sprint-status   Get sprint status
  correct-course  Manage mid-sprint changes
  code-review     Adversarial code review
  retrospective   Sprint retrospective
  e2e-tests       Generate E2E tests

RESEARCH
  domain          Domain research
  market          Market research
  technical       Technical research

DOCUMENTATION
  document        Document a brownfield project
  gen-context     Generate project-context.md
  index-docs      Generate/update folder index.md
  shard-doc       Split large markdown into sections

REVIEW & EDITORIAL
  review          Adversarial general review
  review-prose    Editorial prose review
  review-struct   Editorial structure review

OTHER
  brainstorm      Facilitated brainstorming session
  party           Multi-agent party mode
  help            Show this menu
```

---

## Dispatch Table

Match the subcommand and execute the corresponding action. **Follow the dispatch instructions exactly.**

### Agents

**master** →
You must fully embody this agent's persona and follow all activation instructions exactly as specified. NEVER break character until given an exit command.
<agent-activation CRITICAL="TRUE">
1. LOAD the FULL agent file from {project-root}/_bmad/core/agents/bmad-master.md
2. READ its entire contents - this contains the complete agent persona, menu, and instructions
3. FOLLOW every step in the <activation> section precisely
4. DISPLAY the welcome/greeting as instructed
5. PRESENT the numbered menu
6. WAIT for user input before proceeding
</agent-activation>

**analyst** →
You must fully embody this agent's persona. LOAD the FULL agent file from {project-root}/_bmad/bmm/agents/analyst.md, READ it, FOLLOW the <activation> section, DISPLAY greeting, PRESENT menu, WAIT.

**architect** →
You must fully embody this agent's persona. LOAD the FULL agent file from {project-root}/_bmad/bmm/agents/architect.md, READ it, FOLLOW the <activation> section, DISPLAY greeting, PRESENT menu, WAIT.

**dev** →
You must fully embody this agent's persona. LOAD the FULL agent file from {project-root}/_bmad/bmm/agents/dev.md, READ it, FOLLOW the <activation> section, DISPLAY greeting, PRESENT menu, WAIT.

**pm** →
You must fully embody this agent's persona. LOAD the FULL agent file from {project-root}/_bmad/bmm/agents/pm.md, READ it, FOLLOW the <activation> section, DISPLAY greeting, PRESENT menu, WAIT.

**qa** →
You must fully embody this agent's persona. LOAD the FULL agent file from {project-root}/_bmad/bmm/agents/qa.md, READ it, FOLLOW the <activation> section, DISPLAY greeting, PRESENT menu, WAIT.

**solo** →
You must fully embody this agent's persona. LOAD the FULL agent file from {project-root}/_bmad/bmm/agents/quick-flow-solo-dev.md, READ it, FOLLOW the <activation> section, DISPLAY greeting, PRESENT menu, WAIT.

**sm** →
You must fully embody this agent's persona. LOAD the FULL agent file from {project-root}/_bmad/bmm/agents/sm.md, READ it, FOLLOW the <activation> section, DISPLAY greeting, PRESENT menu, WAIT.

**tech-writer** →
You must fully embody this agent's persona. LOAD the FULL agent file from {project-root}/_bmad/bmm/agents/tech-writer/tech-writer.md, READ it, FOLLOW the <activation> section, DISPLAY greeting, PRESENT menu, WAIT.

**ux** →
You must fully embody this agent's persona. LOAD the FULL agent file from {project-root}/_bmad/bmm/agents/ux-designer.md, READ it, FOLLOW the <activation> section, DISPLAY greeting, PRESENT menu, WAIT.

### Planning (Phase 1-3)

**brief** →
IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @{project-root}/_bmad/bmm/workflows/1-analysis/create-product-brief/workflow.md, READ its entire contents and follow its directions exactly!

**prd** →
IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @{project-root}/_bmad/bmm/workflows/2-plan-workflows/create-prd/workflow-create-prd.md, READ its entire contents and follow its directions exactly!

**edit-prd** →
IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @{project-root}/_bmad/bmm/workflows/2-plan-workflows/edit-prd/workflow-edit-prd.md, READ its entire contents and follow its directions exactly!

**validate-prd** →
IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @{project-root}/_bmad/bmm/workflows/2-plan-workflows/validate-prd/workflow.md, READ its entire contents and follow its directions exactly!

**architecture** →
IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @{project-root}/_bmad/bmm/workflows/3-solutioning/create-architecture/workflow.md, READ its entire contents and follow its directions exactly!

**epics** →
IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @{project-root}/_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/workflow.md, READ its entire contents and follow its directions exactly!

**ux-design** →
IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @{project-root}/_bmad/bmm/workflows/3-solutioning/create-ux-design/workflow.md, READ its entire contents and follow its directions exactly!

**readiness** →
IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @{project-root}/_bmad/bmm/workflows/3-solutioning/check-implementation-readiness/workflow.md, READ its entire contents and follow its directions exactly!

### Implementation (Phase 4)

**story** →
<steps CRITICAL="TRUE">
1. Always LOAD the FULL @{project-root}/_bmad/core/tasks/workflow.xml
2. READ its entire contents - this is the CORE OS for EXECUTING the specific workflow-config @{project-root}/_bmad/bmm/workflows/4-implementation/create-story/workflow.yaml
3. Pass the yaml path as 'workflow-config' parameter to the workflow.xml instructions
4. Follow workflow.xml instructions EXACTLY as written
5. Save outputs after EACH section when generating any documents from templates
</steps>

**dev-story** →
<steps CRITICAL="TRUE">
1. Always LOAD the FULL @{project-root}/_bmad/core/tasks/workflow.xml
2. READ its entire contents - this is the CORE OS for EXECUTING the specific workflow-config @{project-root}/_bmad/bmm/workflows/4-implementation/dev-story/workflow.yaml
3. Pass the yaml path as 'workflow-config' parameter to the workflow.xml instructions
4. Follow workflow.xml instructions EXACTLY as written
5. Save outputs after EACH section when generating any documents from templates
</steps>

**quick-spec** →
IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @{project-root}/_bmad/bmm/workflows/bmad-quick-flow/quick-spec/workflow.md, READ its entire contents and follow its directions exactly!

**quick-dev** →
IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @{project-root}/_bmad/bmm/workflows/bmad-quick-flow/quick-dev/workflow.md, READ its entire contents and follow its directions exactly!

**sprint-plan** →
<steps CRITICAL="TRUE">
1. Always LOAD the FULL @{project-root}/_bmad/core/tasks/workflow.xml
2. READ its entire contents - this is the CORE OS for EXECUTING the specific workflow-config @{project-root}/_bmad/bmm/workflows/4-implementation/sprint-planning/workflow.yaml
3. Pass the yaml path as 'workflow-config' parameter to the workflow.xml instructions
4. Follow workflow.xml instructions EXACTLY as written
5. Save outputs after EACH section when generating any documents from templates
</steps>

**sprint-status** →
<steps CRITICAL="TRUE">
1. Always LOAD the FULL @{project-root}/_bmad/core/tasks/workflow.xml
2. READ its entire contents - this is the CORE OS for EXECUTING the specific workflow-config @{project-root}/_bmad/bmm/workflows/4-implementation/sprint-status/workflow.yaml
3. Pass the yaml path as 'workflow-config' parameter to the workflow.xml instructions
4. Follow workflow.xml instructions EXACTLY as written
5. Save outputs after EACH section when generating any documents from templates
</steps>

**correct-course** →
<steps CRITICAL="TRUE">
1. Always LOAD the FULL @{project-root}/_bmad/core/tasks/workflow.xml
2. READ its entire contents - this is the CORE OS for EXECUTING the specific workflow-config @{project-root}/_bmad/bmm/workflows/4-implementation/correct-course/workflow.yaml
3. Pass the yaml path as 'workflow-config' parameter to the workflow.xml instructions
4. Follow workflow.xml instructions EXACTLY as written
5. Save outputs after EACH section when generating any documents from templates
</steps>

**code-review** →
<steps CRITICAL="TRUE">
1. Always LOAD the FULL @{project-root}/_bmad/core/tasks/workflow.xml
2. READ its entire contents - this is the CORE OS for EXECUTING the specific workflow-config @{project-root}/_bmad/bmm/workflows/4-implementation/code-review/workflow.yaml
3. Pass the yaml path as 'workflow-config' parameter to the workflow.xml instructions
4. Follow workflow.xml instructions EXACTLY as written
5. Save outputs after EACH section when generating any documents from templates
</steps>

**retrospective** →
<steps CRITICAL="TRUE">
1. Always LOAD the FULL @{project-root}/_bmad/core/tasks/workflow.xml
2. READ its entire contents - this is the CORE OS for EXECUTING the specific workflow-config @{project-root}/_bmad/bmm/workflows/4-implementation/retrospective/workflow.yaml
3. Pass the yaml path as 'workflow-config' parameter to the workflow.xml instructions
4. Follow workflow.xml instructions EXACTLY as written
5. Save outputs after EACH section when generating any documents from templates
</steps>

**e2e-tests** →
<steps CRITICAL="TRUE">
1. Always LOAD the FULL @{project-root}/_bmad/core/tasks/workflow.xml
2. READ its entire contents - this is the CORE OS for EXECUTING the specific workflow-config @{project-root}/_bmad/bmm/workflows/4-implementation/qa-generate-e2e-tests/workflow.yaml
3. Pass the yaml path as 'workflow-config' parameter to the workflow.xml instructions
4. Follow workflow.xml instructions EXACTLY as written
5. Save outputs after EACH section when generating any documents from templates
</steps>

### Research

**domain** →
IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @{project-root}/_bmad/bmm/workflows/1-analysis/domain-research/workflow.md, READ its entire contents and follow its directions exactly!

**market** →
IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @{project-root}/_bmad/bmm/workflows/1-analysis/market-research/workflow.md, READ its entire contents and follow its directions exactly!

**technical** →
IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @{project-root}/_bmad/bmm/workflows/1-analysis/technical-research/workflow.md, READ its entire contents and follow its directions exactly!

### Documentation

**document** →
<steps CRITICAL="TRUE">
1. Always LOAD the FULL @{project-root}/_bmad/core/tasks/workflow.xml
2. READ its entire contents - this is the CORE OS for EXECUTING the specific workflow-config @{project-root}/_bmad/bmm/workflows/document-project/workflow.yaml
3. Pass the yaml path as 'workflow-config' parameter to the workflow.xml instructions
4. Follow workflow.xml instructions EXACTLY as written
5. Save outputs after EACH section when generating any documents from templates
</steps>

**gen-context** →
IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @{project-root}/_bmad/bmm/workflows/generate-project-context/workflow.md, READ its entire contents and follow its directions exactly!

**index-docs** →
Read the entire task file at: {project-root}/_bmad/core/tasks/index-docs.xml
Follow all instructions in the task file exactly as written.

**shard-doc** →
Read the entire task file at: {project-root}/_bmad/core/tasks/shard-doc.xml
Follow all instructions in the task file exactly as written.

### Review & Editorial

**review** →
Read the entire task file at: {project-root}/_bmad/core/tasks/review-adversarial-general.xml
Follow all instructions in the task file exactly as written.

**review-prose** →
Read the entire task file at: {project-root}/_bmad/core/tasks/editorial-review-prose.xml
Follow all instructions in the task file exactly as written.

**review-struct** →
Read the entire task file at: {project-root}/_bmad/core/tasks/editorial-review-structure.xml
Follow all instructions in the task file exactly as written.

### Other

**brainstorm** →
IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @{project-root}/_bmad/core/workflows/brainstorming/workflow.md, READ its entire contents and follow its directions exactly!

**party** →
IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @{project-root}/_bmad/core/workflows/party-mode/workflow.md, READ its entire contents and follow its directions exactly!

**help** →
Display the help menu above and stop.

---

## Unknown Subcommand

If the subcommand doesn't match any entry above, display:
```
Unknown BMAD subcommand: "<subcommand>"
Type /bmad help to see available commands.
```
Then display the help menu.
