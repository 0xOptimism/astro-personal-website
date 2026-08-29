---
title: The Other 90% of Cursor
description: A practical system for turning Cursor into an agent platform with better briefs, reusable skills, review automation, and cloud agents.
pubDate: 2026-08-28
draft: false
xPostUrl: https://x.com/yannisbuilds/status/2065507184377500034
tags:
  - AI Agents
  - Cursor
  - Developer Tools
---

Most developers use about 10% of Cursor.

They type a prompt in chat, accept the diff, and call it AI-assisted development. Meanwhile, Cursor has quietly become something else: an agent platform with cloud agents, review automation, reusable skills, hooks, and a full CLI.

I have spent the last few months building my workflow around it. Not because I am loyal to one tool. I route work across Claude Code, Codex, and Hermes too. But Cursor is where this loop has felt the most complete.

In one recent week, most of my background agent runs turned into reviewable branches instead of dead experiments.

That is the article. Here is the system behind it. Steal whatever is useful.

## Start With Jobs, Not Prompts

The most useful shift is not asking Cursor for bigger changes. It is giving it better boundaries.

A vague request gets you a plausible diff that fights your architecture. A job gets you work you can review like a senior engineer reviews a pull request.

A job has four parts:

- **Context.** Make it read the relevant files before it changes anything. “Read the auth module and the existing session tests first” beats any clever prompt.
- **Constraints.** Stay inside the repository’s existing patterns. Name the patterns.
- **Definition of done.** Tests pass, the screenshot matches, or the endpoint returns the expected response. Cursor is much better when it knows what done means.
- **Scope.** Keep briefs small. If the brief needs three paragraphs of background, split the task.

My loop for every feature is context, brief, implementation, review, and memory update.

Boring on purpose. The boring loop is the fast one because you stop re-explaining your codebase every session.

The memory part is where most setups leak. Every repeated correction becomes a rule in `.cursor/rules/` or a line in `AGENTS.md`. Lessons the agent learns once should never be taught twice.

My rules file is the highest-leverage file in every repository I own.

This is where Cursor stops being an editor with AI and starts being a team.

## The Thermo-Nuclear Code Review

This one is real, and you can install it today. It ships as a skill in Cursor’s official team-kit plugin.

One line in chat:

```
/thermo-nuclear-code-quality-review
```

It spins up a reviewer with one mandate: be ruthless about maintainability.

Its rubric hunts for what it calls code-judo moves: restructurings that delete whole branches and layers instead of polishing them. It treats any file crossing 1,000 lines as a presumptive blocker. It flags every ad hoc conditional bolted onto an unrelated flow as spaghetti growth, not a style nit.

```text
Thermo-nuclear review flow

Branch changes
  |
  v
Invoke thermo-nuclear skill in Cursor Agent
  |
  v
Agent loads the maintainability rubric
  |
  v
Review gates:
  - Can a code-judo move delete complexity?
  - Did a file cross 1,000 lines?
  - Did ad hoc branches make the flow messy?
  - Did feature logic leak into the wrong layer?
  |
  v
Prioritized findings
  |
  v
Human call:
  - refactor before merge
  - reject weak feedback
  - turn repeated lessons into repository rules
```

I run it before merging anything substantial. It is the harshest reviewer I have ever worked with, and the only one with infinite patience.

## Bugbot and a Security Pass

Bugbot is Cursor’s official review layer for catching real bugs in branch changes. I pair it with my own security-review pass, which audits the same diff for vulnerabilities.

They run in parallel while I keep building.

Three review layers on every meaningful change. Zero scheduling. Zero waiting for a teammate’s time zone.

## Skills and Hooks

Skills are the mechanism behind that review: reusable instruction files the agent loads on demand.

Some you install from plugins, like the thermo-nuclear rubric. Some you write yourself. Mine include a release checklist, a “make this pull request easy to review” pass, and a CI-fixing loop.

Anything you explain to the agent twice should become a skill.

Hooks are also native: scripts that fire around agent events. Lint on every edit. Block writes to protected paths. Stop bad habits before review.

None of this requires configuration heroics. Skills, hooks, review automation, cloud agents, and the CLI all ship with Cursor. The best rubrics are one plugin install away.

The loop you build on top of them is yours. That is the point.

The gap between average and power usage is not technical skill. It is knowing the primitives exist.

## Cloud Agents Change the Working Day

This is the part I think most engineers have not priced in yet.

Cursor’s agents do not need your laptop open. Cloud agents run in isolated environments, push branches, and report back. That changes the shape of a working day.

My current pattern as a solo builder:

- **Parallel attempts on hard problems.** Spin up multiple isolated agents on the same task, each in its own worktree and branch. Compare the results, keep the best, and delete the rest. Best-of-N for implementation, not just for prompts.
- **Babysat pull requests.** An agent watches CI on my open pull request, triages review comments, fixes the red checks, and pings me only when it genuinely needs a decision. I stopped watching CI dashboards entirely.
- **Overnight queues.** Before I stop for the day, I hand off the gnarly refactor with a tight brief and a definition of done. Morning starts with reviewing a diff instead of staring at a blank editor.

These patterns are not magic. They work because the briefs are narrow, the definition of done is clear, and the agents can run without me.

![Cursor cloud agent reporting a path traversal vulnerability and its fix](/assets/cursor-cloud-agent-security-review.jpeg)

For build-in-public people specifically, this is the novel part: the agents become the content.

Every overnight run, every brutal review that catches something embarrassing, and every Best-of-N comparison is a post your audience has not seen before.

You are not writing about building. The building documents itself.

## Why Cursor Is My Main Surface

I am skeptical of tool worship, so let me make the claim precisely.

Other tools win individual battles. Claude Code is excellent at long-context implementation. Codex is excellent at background repository work. I still use both.

But Cursor is the tightest one-surface loop I have found for engineers right now: the editor where you review, the chat where you brief, the CLI other systems can call, the cloud agents that run without you, the review layer, and the memory layer of rules and skills that makes all of it compound.

The compounding is the real argument. A tool that codes faster makes today better. A tool that accumulates your rules, your skills, your review standards, and your workflow makes every month better than the last one.

That is what maxxing means here.

Not more prompts. More system.

## What This Means for You

If you only change three things this week:

1. **Write briefs, not prompts.** Include context, constraints, and a definition of done. Review the diff like a senior engineer, not a passenger.
2. **Run one agent review before your next merge.** Use Bugbot for bugs, or install the thermo-nuclear skill from the cursor-team-kit plugin for maintainability. Disagree with half of it. The half you keep will be worth it.
3. **Hand one task to a cloud agent before you log off.** Keep it small and well briefed, with a clear definition of done. Judge it on the diff you wake up to.

The engineers who get the most out of AI coding will not be the ones typing the best prompts. They will be the ones running the cleanest systems.

Right now, Cursor is the best place I have found to build one.

I build mine in public. The next post is probably an agent’s fault.
