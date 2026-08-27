---
title: Agents Need Money
description: If agents are going to do useful work online, they need budgets, permissions, and a way to pay for useful services online.
pubDate: 2026-08-27
draft: false
xPostUrl: https://x.com/yannisbuilds/status/2062987982164967592
tags:
  - AI Agents
  - x402
  - Hermes
---

After a few late nights hacking on Hermes and letting my agents run real workflows, one missing piece became obvious: payments.

Agents can already do a lot online if the workflow is designed well. They can research, summarize, monitor, draft, route information, and trigger actions. But the moment they need to use a paid service, the autonomy usually breaks.

They cannot easily pay for an API call, access a file, buy compute, use a specialized tool, or request work from another agent.

That is a bigger limitation than it looks.

Today, most of the internet is built around human payment flows. Sign up. Add a card. Create an account. Manage billing. Copy an API key. Approve access manually.

That makes sense for people. It makes less sense for autonomous software.

If agents are going to do useful work online, they need a way to pay for useful services online.

That is why x402 is interesting.

## What x402 Is

x402 is an open payment protocol originally created by Coinbase and now moving under the Linux Foundation through the x402 Foundation. It is built around an old part of the web that never really became useful: HTTP `402 Payment Required`.

The idea is simple.

A client, which could be an app, a script, or an AI agent, requests a paid resource. If payment is required, the server responds with a `402 Payment Required` message. That response includes the payment details: price, recipient, currency, and network.

The agent can then pay programmatically, often with a stablecoin like USDC, retry the request with proof of payment, and receive the resource.

Instead of subscriptions, credit card forms, or long API billing setup, the service can charge per request.

That is the part that matters for agents.

An agent does not want a SaaS dashboard. It wants to know what something costs, whether it is allowed to buy it, and what it gets back after payment.

## Why This Matters for Agents

The most useful agents will not be isolated chatbots. They will be systems that move through workflows.

A research agent may need data from a paid API. A marketing agent may need to generate an image. A finance agent may need to check a premium dataset. A support agent may need to verify an email address, enrich a company profile, or request another service.

Every one of those steps can involve a small payment.

Humans are bad at managing hundreds of tiny transactions. Agents may be very good at it, as long as the rules are clear.

That is the real shift.

The agent is not just waiting for a fixed list of pre-approved tools. It can become a small economic actor inside a controlled system.

It can discover a service, check the price, compare the request against its budget and permissions, pay for the output, use the result, and report what happened.

But the control layer matters.

“Agents can spend money” is not enough. In fact, it sounds dangerous on its own.

The useful version is agents with budgets, permissions, limits, logs, and approval rules.

An agent should know:

- how much it can spend
- which services it can use
- what actions require approval
- what the maximum spend is per task
- when to stop and ask the human

That is when payments become part of the workflow instead of a risk.

## A Simple Example

Imagine an onchain research agent working on a Base ecosystem brief.

It needs better data on smart money flows, liquidity, and protocol activity. Today, that usually means I need to set up accounts, manage API keys, subscribe to tools, and wire those services into the workflow manually.

With an x402-style flow, the agent could request a paid analytics endpoint. The server returns a `402 Payment Required` response with the cost and payment details. The agent checks whether the request is within its budget, pays a small amount in USDC, retries the request, and gets the data.

Maybe that call costs $0.05.

The agent uses the result, combines it with other sources, checks liquidity on Aerodrome, compares protocol activity, and drafts a short research note.

The important part is not the specific dataset. The important part is that the workflow does not stop because I forgot to create another account or subscribe to another SaaS product.

The agent has a budget and a payment rail.

That makes the workflow feel much closer to actual autonomy.

## Why I Care About This for Hermes

Hermes is not meant to be a chatbot. I think of it more like an operating system for work.

It should be able to read context, run workflows, use tools, update memory, and come back with useful outputs. But if every paid step requires me to manually prepare the service ahead of time, the system is still heavily constrained.

Payments are one of the missing rails.

The more I build Hermes, the more obvious this becomes. Agents do not just need prompts and tools. They need memory, permissions, budgets, identity, and payment infrastructure.

x402 sits in that last category.

It gives agents a way to pay for resources directly, without turning every small tool into a subscription or every workflow into an API key management problem.

## How I’m Starting

Right now, the easiest way I have found to experiment with this is [AgentCash](https://x.com/agentcashdev).

AgentCash gives an agent a wallet and lets it call paid services through x402-style flows. That means I can give Hermes a small budget and let it use services when the workflow actually needs them.

For example, an agent could use a paid image generation service for a marketing asset, upload a file, scrape a page, enrich a company profile, or call a specialized API.

The setup is simple enough that it changes how you think about agents.

Once the wallet exists, the question becomes less “can this agent use paid tools?” and more “what should this agent be allowed to buy?”

That is the right question.

Because the future is not agents spending freely. It is agents spending inside constraints.

## My Current Take

x402 is still early. Most services do not support it yet. There are also real open questions around security, refunds, failed requests, bad outputs, malicious endpoints, and what level of spending should require human approval.

So I am not treating this as solved infrastructure.

But I do think the direction is right.

If agents are going to use online services autonomously, they need a way to pay for online services autonomously.

Subscriptions and API keys are fine for human-operated software. They are awkward for agents that may need hundreds of small services across many workflows.

Pay-per-use rails make more sense.

The agent finds the service, checks the price, pays within its limits, uses the output, and moves on.

That is when agents stop feeling like demos and start feeling like workers inside a controlled system.

For Hermes, this is the part I want to keep testing: agents with memory, budgets, permissions, and payment rails.

That combination feels much more important than just giving a chatbot another tool.
