---
title: "How to Use AI in Your § 1983 Case"
description: "AI tools like ChatGPT and Claude can help you research, draft, and organize your civil rights case — but they can also get you fined or have your case dismissed. Here's how to use them effectively and safely."
pubDate: 2026-04-13
author: "Institute for Police Conduct, Inc."
tags: ["ai", "tools", "research", "drafting", "strategy", "pro-se"]
draft: true
---

AI tools have fundamentally changed what a [pro se](/primer/pro-se) litigant can accomplish alone. Tasks that once required a law library, a paralegal, and hundreds of billable hours — legal research, draft writing, case analysis, deposition preparation — can now be done from your kitchen table with a $20/month subscription and your case file.

But AI tools also create new risks. They hallucinate case citations. They state legal conclusions with supreme confidence that turns out to be completely wrong. And federal courts are increasingly punishing litigants — and attorneys — who file AI-generated work without verification, with fines, case dismissals, and public reprimands.

This guide covers what AI is good at, what it's dangerous for, and how to use it without getting burned.

## What AI is good at

### Research assistance

AI tools can explain legal concepts in plain language, identify relevant doctrines, and point you toward case law you should research further. If you don't understand what "[clearly established law](/primer/clearly-established-law)" means or how [Monell liability](/primer/monell-liability) works, asking an AI to explain it is a reasonable starting point.

**Good prompt**: "Explain the elements of a Fourth Amendment excessive force claim under Graham v. Connor. What does a plaintiff need to prove?"

**Good prompt**: "What is the difference between individual capacity and official capacity suits under § 1983?"

AI won't replace reading the actual cases — but it can tell you _which_ cases to read and _why_ they matter.

### Drafting and editing

AI tools are strong first-draft generators. Give them your facts, tell them what you're trying to argue, and they'll produce a structured draft that you can refine. This is particularly useful for:

- **Motions and briefs** — AI can structure arguments, organize sections, and suggest frameworks
- **Discovery requests** — [interrogatories](/primer/interrogatories), [requests for production](/primer/requests-for-production), [requests for admission](/primer/requests-for-admission)
- **Deposition outlines** — question sequences organized by topic
- **Demand letters** — pre-suit correspondence
- **Declarations** — organizing your factual narrative

**Good prompt**: "I was arrested while photographing a police station from a public sidewalk. The charge was interference with public duties, which was later dismissed. Draft interrogatories for the arresting officer focused on establishing lack of probable cause and First Amendment retaliation."

The output won't be filing-ready. It will be a solid starting point that saves you hours of staring at a blank page.

### Analyzing your case

This is where AI becomes genuinely powerful for pro se litigants. Upload your strategy documents (or paste their contents) and ask the AI to:

- **Find weaknesses in your arguments** — "Read my draft motion for summary judgment and identify the three weakest arguments"
- **Anticipate opposing arguments** — "Based on these facts, what arguments will the defense make in their motion to dismiss?"
- **Check logical consistency** — "Does my complaint allege facts sufficient to support each element of my First Amendment retaliation claim?"
- **Identify missing evidence** — "What evidence would strengthen my Monell claim against the city?"
- **Prepare for depositions** — "Based on this officer's incident report and the BWC transcript, what contradictions should I explore in deposition?"

**Good prompt**: "Here is my complaint [paste text]. Here is the defendant's motion to dismiss [paste text]. What are the strongest arguments in the motion to dismiss, and how should I respond to each one?"

### Organizing information

AI tools are excellent at taking messy, unstructured information and organizing it:

- **Building timelines** from scattered documents
- **Summarizing lengthy depositions** into key admissions
- **Comparing documents** — e.g., finding discrepancies between an incident report and BWC transcript
- **Creating evidence maps** — matching evidence to each element of each claim

### Understanding court filings

When opposing counsel files a motion full of legal jargon, paste it into an AI tool and ask: "Explain what this motion is arguing in plain language. What are the strongest points? What are the weakest?"

This is one of the most immediately useful applications. Every pro se litigant has received a filing that made their head spin. AI can translate it.

## What AI is dangerous for

### Case citations

**This is the big one.** AI tools routinely generate case citations that do not exist. They'll give you a case name, a reporter citation, a year, and a confident summary of the holding — and none of it is real. The case was never decided. The citation points to nothing. The holding was invented.

This isn't a rare glitch. It's a fundamental limitation of how these tools work. They generate text that _looks right_ based on patterns, but they have no reliable mechanism for verifying that a case actually exists.

**Attorneys have been fined for this.** In _Mata v. Avianca_, a New York federal court fined attorneys $5,000 for filing a brief containing six AI-fabricated case citations. The attorneys used ChatGPT to write the brief and never verified the citations. The court called it "an unprecedented circumstance" — but it won't be the last time.

**The rule is absolute: never file a document containing a case citation you haven't personally verified.** For every case an AI tool suggests:

1. **Search for it on [CourtListener](https://www.courtlistener.com/)** (free) or Google Scholar's case law section (free)
2. **Verify the citation** — correct reporter, correct volume and page number, correct year
3. **Read at least the relevant portion** — confirm the case actually says what the AI claims it says
4. **Check that it's still good law** — hasn't been overruled or significantly limited

If you can't find the case, it probably doesn't exist. Delete it from your filing.

**Coming soon:** Once we have sufficient funding, we're building a free citation audit tool right here on section1983.org. Upload your draft filing and it will automatically verify every case citation, flag anything that can't be found, and generate a table of authorities — powered by tools like Free Law Project's <a href="https://free.law/projects/eyecite" target="_blank" rel="noopener">eyecite ↗</a>. Until then, verify manually — every single citation, every single time.

**Free tools you should install now:**

- <a href="https://free.law/projects/eyecite" target="_blank" rel="noopener">eyecite ↗</a> — Free Law Project's open-source citation extraction tool
- <a href="https://free.law/recap" target="_blank" rel="noopener">RECAP Archive browser extension ↗</a> — automatically saves PACER documents you view to the free CourtListener archive, and lets you access documents others have already saved. Saves money on PACER fees and contributes to public access to court records.

### Final legal conclusions

AI can help you understand legal standards, but it shouldn't be making the final judgment call about whether your facts meet those standards. It doesn't know your judge, your circuit's idiosyncrasies, or the specific factual nuances that determine how a doctrine applies.

"Based on Graham v. Connor, does my case constitute excessive force?" is a question AI can help you think through — but the answer it gives you isn't legal advice, and it may be wrong in ways that aren't obvious.

### Predicting outcomes

"Will I win my motion to dismiss?" AI has no idea. It can tell you what the legal standard is and help you assess how your facts measure up, but it cannot predict what a specific judge will do with a specific set of facts. Treat any AI prediction of outcomes as entertainment, not analysis.

### Confidential information

Be cautious about what you share with AI tools. Most cloud-based AI services (ChatGPT, Claude, Gemini) process your inputs on remote servers. If you paste sensitive case materials — settlement discussions, privileged attorney-client communications, confidential witness information — you may be waiving protections.

**Practical guidance:**

- **Facts of your case**: Generally safe to discuss — these will become public in your filings anyway
- **Settlement communications**: Don't paste these into AI tools
- **Attorney-client communications**: Don't paste these into AI tools
- **Witness identities and contact information**: Minimize or anonymize
- **Your strategy documents**: Use judgment. The strategic analysis is yours, but consider whether disclosure could harm your case if the data were ever accessed

Some AI tools offer privacy modes or enterprise tiers that don't use your data for training. If privacy is a concern, look for these options.

## How to prompt effectively

The quality of what you get from AI depends almost entirely on what you give it. Vague prompts produce vague outputs. Specific prompts produce useful work.

### Give it your facts

Don't ask abstract legal questions. Give the AI your actual facts and ask it to apply the law to them.

**Weak**: "How do I prove excessive force?"

**Strong**: "On January 15, 2024, I was photographing a police station from a public sidewalk. Officer Smith approached, told me to stop, and when I said I had a First Amendment right to record, he grabbed my arm, forced me to the ground, and handcuffed me. I had no weapons and was not resisting. He arrested me for 'interference with public duties,' which was dismissed two months later. The body camera footage shows I was calm and compliant throughout. How strong is my excessive force claim under Graham v. Connor, and what are the weaknesses a defendant would exploit?"

### Ask it to argue against you

One of the most valuable uses of AI: ask it to be opposing counsel.

**Prompt**: "You are a defense attorney representing the officers in my case. Here are the facts [paste]. Write the strongest possible motion to dismiss, identifying every weakness in my claims."

Then use the output to strengthen your actual filings. Every argument the AI identifies is one the real defense attorney might make. Prepare your responses now.

### Ask it to find weaknesses

**Prompt**: "Read my draft response to the motion to dismiss [paste]. Identify the three weakest arguments and suggest how to strengthen them or whether to cut them entirely."

### Iterate

Don't accept the first output. Push back. Ask follow-up questions. Say "that argument is weak because [reason] — give me a stronger one." AI tools respond well to iterative refinement. Treat it like a conversation with a research assistant, not a vending machine.

## Court disclosure requirements

A growing number of federal courts require parties to disclose when AI tools were used in preparing filings. These requirements vary by district and by judge:

- **Some districts have standing orders** requiring disclosure of AI-assisted drafting
- **Some judges have individual requirements** in their practice preferences
- **Some courts require certification** that all citations have been verified by a human

**Before you file anything**, check:

1. Your district's local rules for any AI disclosure requirements
2. Your assigned judge's standing orders or practice preferences
3. Whether your circuit has issued any guidance on AI use

When in doubt, disclose. A brief statement like "Petitioner used AI-assisted tools for research and drafting. All citations have been independently verified" is sufficient and shows the court you're being transparent.

Failing to disclose when required — or filing unverified AI-generated citations — can result in fines, public reprimands, and even case dismissal.

## Free vs. paid tools

### Free options

- **[ChatGPT](https://chat.openai.com/)** (free tier) — good for basic research, explanation, and short drafts. Limited context window means it can't process long documents.
- **[Google Gemini](https://gemini.google.com/)** — similar capabilities to ChatGPT free tier. Integrates with Google Docs.
- **[Claude](https://claude.ai/)** (free tier) — strong at analyzing long documents. Can process an entire motion or deposition transcript at once.
- **[CourtListener](https://www.courtlistener.com/)** — not AI, but the best free legal research database. Use it to verify every citation AI gives you.
- **[Google Scholar](https://scholar.google.com/)** (Case law tab) — free case law search. Good backup for verification.

### Paid options worth considering

- **ChatGPT Plus ($20/month)** — access to the most capable model, larger context window, file upload for document analysis
- **Claude Pro ($20/month)** — excellent for long document analysis, handles 100+ page filings
- **[Casetext / CoCounsel](https://casetext.com/)** — AI-powered legal research built on verified case law databases. More expensive but citation-safe. Aimed at attorneys but available to pro se litigants.

### What's worth paying for?

If you're handling a § 1983 case pro se, $20/month for a capable AI tool is one of the best investments you can make. It's less than the cost of a single hour with most attorneys, and you'll use it constantly — for research, drafting, analysis, and preparation. The free tiers work for basic questions, but the paid tiers handle the heavy lifting of document analysis and extended drafting sessions.

## A workflow that works

Here's a practical workflow for using AI in your case:

1. **Organize first.** Set up your [war room](/process/organizing-your-war-room) before you start using AI. The better your documents are organized, the easier it is to give the AI what it needs.

2. **Research with AI, verify without it.** Ask AI to explain legal concepts and suggest relevant cases. Then verify every citation on CourtListener or Google Scholar. Read the actual opinions.

3. **Draft with AI, edit yourself.** Use AI to generate first drafts of motions, discovery requests, and briefs. Then rewrite in your own voice, cut the filler, and make sure every statement is accurate.

4. **Analyze with AI, decide yourself.** Upload opposing filings and ask AI to identify the strongest arguments and suggest responses. Use those insights to inform your strategy — but make the final calls yourself.

5. **Verify everything.** Before filing: every citation checked, every factual claim sourced, every legal standard confirmed against the actual case law. AI is your research assistant. You are the attorney of record.

## The bottom line

AI tools won't win your case. But they can dramatically reduce the gap between what a pro se litigant can accomplish and what a represented party with a legal team can accomplish. Used carefully — with verification as a non-negotiable habit — they're the single most powerful tool available to you for free or near-free.

Used carelessly, they'll generate confident-sounding nonsense that gets you fined or your case thrown out.

The difference is verification. Always verify.

---

_Go back to [Organizing Your War Room](/process/organizing-your-war-room) or the [process overview](/process) to see where AI tools fit into your case preparation._
