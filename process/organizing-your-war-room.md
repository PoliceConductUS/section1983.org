---
title: "Organizing Your War Room"
description: "How to set up a case file structure, strategy documents, and evidence tracking system that keeps your § 1983 case manageable from filing through trial."
order: 1.7
movant: "You (not yet a plaintiff)"
respondent: "N/A"
stage: "pre-filing"
tags: ["organization", "preparation", "strategy", "evidence", "google-drive"]
---

## Why organization matters

A § 1983 case generates hundreds of documents over its lifetime. Complaints, motions, discovery requests, discovery responses, deposition transcripts, exhibits, correspondence, court orders, research notes, strategy memos. Without a system, you will lose track of something important at the worst possible time.

Attorneys have case management software, paralegals, and filing systems built over years of practice. You need the same organizational discipline — but you can achieve it with free tools and a clear folder structure.

The goal: **any document in your case should be findable in under 30 seconds.** If you can't locate the defendant's answer to your Interrogatory 12 without searching through a pile of PDFs, your organization has failed.

## Choose your platform

**Google Drive** is the recommended starting point for most pro se litigants:

- Free (15 GB, usually more than enough for a single case)
- Automatic version history on every file (no more "complaint_v3_FINAL_revised.docx")
- Accessible from any device
- Easy to share a folder with an attorney if you eventually retain one
- Works offline with the desktop app

**Other options that work**:

- **Microsoft OneDrive** — similar features, 5 GB free
- **Dropbox** — solid, but free tier is limited (2 GB)
- **Local folders with manual backups** — works, but you lose version history and access from other devices

**What doesn't work**:

- Keeping everything in your email inbox
- Saving files to your desktop with no structure
- Printing everything and putting it in a physical folder (you'll need digital copies for electronic filing anyway)

Whichever platform you choose, the structure below works the same way.

## The folder structure

```
Lotts v City of Irving/
│
├── 01-Complaint/
│   ├── drafts/
│   │   ├── complaint-draft-2024-03-15.docx
│   │   └── complaint-draft-2024-03-28.docx
│   ├── complaint-filed-2024-04-01.pdf
│   └── civil-cover-sheet.pdf
│
├── 02-Evidence/
│   ├── body-camera/
│   │   ├── officer-smith-bwc-2024-01-15.mp4
│   │   ├── officer-smith-bwc-transcript.md
│   │   ├── officer-jones-bwc-2024-01-15.mp4
│   │   └── officer-jones-bwc-transcript.md
│   ├── documents/
│   │   ├── incident-report-2024-01-15.pdf
│   │   ├── arrest-report-2024-01-15.pdf
│   │   ├── use-of-force-report.pdf
│   │   └── dispatch-cad-log.pdf
│   ├── photos/
│   │   ├── injuries-2024-01-15/
│   │   └── scene-2024-01-16/
│   ├── policies/
│   │   ├── use-of-force-policy-2023.pdf
│   │   ├── bwc-policy-2023.pdf
│   │   └── arrest-procedures-2023.pdf
│   ├── statistics/
│   │   ├── officer-smith-arrest-data.xlsx
│   │   ├── department-uof-data-2020-2024.xlsx
│   │   └── complaint-history-analysis.txt
│   └── communications/
│       ├── emails/
│       └── letters/
│
├── 03-Court-Filings/
│   ├── 001-complaint.pdf
│   ├── 002-summons.pdf
│   ├── 003-defendants-motion-to-dismiss.pdf
│   ├── 004-response-to-mtd.pdf
│   ├── 005-court-order-on-mtd.pdf
│   └── ...
│
├── 04-Discovery/
│   ├── sent/
│   │   ├── interrogatories-set-1.docx
│   │   ├── requests-for-production-set-1.docx
│   │   └── requests-for-admission-set-1.docx
│   ├── received/
│   │   ├── defendant-answers-to-interrogatories.pdf
│   │   ├── defendant-document-production/
│   │   └── defendant-rfa-responses.pdf
│   └── disputes/
│       ├── motion-to-compel-2024-08-15.docx
│       └── deficiency-letter-2024-07-20.docx
│
├── 05-Depositions/
│   ├── officer-smith/
│   │   ├── deposition-transcript.pdf
│   │   ├── question-outline.txt
│   │   └── key-admissions.txt
│   ├── officer-jones/
│   └── chief-williams/
│
├── 06-Legal-Research/
│   ├── excessive-force/
│   │   ├── graham-v-connor.txt
│   │   └── tolan-v-cotton.txt
│   ├── first-amendment/
│   ├── qualified-immunity/
│   └── monell/
│
├── 07-Strategy/
│   ├── claims.txt
│   ├── defendants.txt
│   ├── timeline.txt
│   ├── weaknesses.txt
│   ├── deposition-questions.txt
│   └── settlement-parameters.txt
│
└── 08-Correspondence/
    ├── opposing-counsel/
    ├── court/
    └── witnesses/
```

### Why number the folders

Numbered folders stay in order. Without numbers, your file browser sorts alphabetically — putting "Correspondence" before "Complaint" and "Evidence" before "Court-Filings." The numbers enforce the logical sequence of a case: you prepare evidence, file the complaint, receive filings, conduct discovery, take depositions, and so on.

An attorney looking at this structure would understand it immediately. That matters if you eventually retain counsel — the faster they can navigate your files, the less time (and money) they spend getting up to speed.

## Court filings: number everything

Every document filed with the court gets a docket number. Mirror that numbering in your `03-Court-Filings` folder. Prefix each file with its docket entry number:

- `001-complaint.pdf`
- `002-summons-officer-smith.pdf`
- `003-summons-officer-jones.pdf`
- `007-defendants-motion-to-dismiss.pdf`
- `008-response-to-mtd.pdf`

This way, when a court order references "Docket Entry 7," you can find it instantly. Download every filing — yours and theirs — as soon as it appears on PACER or ECF.

## Version control without the confusion

**Google Drive handles this for you.** Every time you save a file, Drive creates a version. You can view and restore any previous version by right-clicking → "Version history." This means:

- **Never name a file "final."** There is no final. There's only the current version.
- **Never duplicate a file to create a new version.** Edit the original. Drive keeps the history.
- **Date your drafts only if you're working outside Drive** (e.g., in Word locally). In that case, use ISO dates: `complaint-draft-2024-03-15.docx`, not `complaint March draft.docx`.

If you're working in Google Docs (not uploading Word files), version history is automatic and granular — you can see every edit session.

## The strategy documents

These are the files most pro se litigants never create — and the ones attorneys consider essential. They live in `07-Strategy/` and they're _living documents_ that you update throughout the case.

### A note on file formats

Your strategy documents can be **Google Docs**, **plain text files (.txt)**, or **Word documents (.docx)** — whatever you're comfortable editing. Google Docs is ideal because it handles version history automatically and you can copy-paste the contents into AI tools when you need help analyzing your case. (For more on using AI effectively, see [How to Use AI in Your § 1983 Case](/articles/how-to-use-ai-in-your-section-1983-case).)

Plain text files (`.txt`) work well too — they open in any program, on any device, and AI tools read them without issues. Use whatever you'll actually keep updated. The format matters less than the habit.

### claims — Your claim-by-claim battle plan

For each claim in your complaint, document:

```
## Claim 1: Fourth Amendment — Unlawful Arrest

**Defendant(s)**: Officer Smith (individual capacity)

**Constitutional basis**: Fourth Amendment, applied through Fourteenth Amendment

**Elements** (what you must prove):
1. Defendant acted under color of state law
2. Defendant arrested Plaintiff
3. Arrest was without probable cause
4. Defendant's actions were the proximate cause of Plaintiff's injuries

**Evidence supporting each element**:
- Element 1: Officer in uniform, on duty, driving marked vehicle (BWC 00:00-00:30)
- Element 2: Handcuffed, transported to jail, booked (arrest report p.2; BWC 04:15)
- Element 3: Plaintiff was photographing from public sidewalk — no crime (BWC 01:00-03:00; First Amendment)
- Element 4: 12 hours in jail, missed work, emotional distress (booking records; declaration)

**Key cases**:
- Graham v. Connor, 490 U.S. 386 (1989) — objective reasonableness standard
- [other cases specific to your facts]

**Qualified immunity exposure**:
- Clearly established? Yes — [cite case with similar facts from your circuit]
- Risk: [honest assessment of QI vulnerability]
```

Do this for every claim. When you're preparing a [summary judgment](/process/summary-judgment) response, you'll know exactly what evidence supports each element. When you're preparing for [trial](/process/trial), you'll know what you need to prove.

### defendants — Who did what

```
## Officer Smith — Individual Capacity

**Role**: Arresting officer
**Badge #**: 4472
**Assigned unit**: Patrol Division

**What they did**:
- Approached Plaintiff on public sidewalk at 14:32 (BWC timestamp)
- Ordered Plaintiff to stop photographing ("Put the camera away")
- Grabbed Plaintiff's arm when Plaintiff continued recording (BWC 03:12)
- Handcuffed Plaintiff and placed in patrol vehicle (BWC 04:15)
- Filed arrest report citing "interference with public duties" (charge dismissed 2024-03-01)

**Claims against this defendant**: Claims 1 (4A arrest), 2 (1A retaliation), 4 (excessive force)

**Qualified immunity risk**: Medium — [explain]

**Prior complaints**: 8 citizen complaints (3 excessive force, 2 false arrest, 3 discourtesy). Zero sustained.

**Statistical outlier?**: Yes — accounts for 2.1% of department patrol officers but 8.7% of use-of-force incidents (2020-2024).
```

### timeline — The spine of your case

A chronological timeline with sources. Every fact, every date, every document — in order.

```
## Case Timeline

| Date | Time | Event | Source |
|------|------|-------|--------|
| 2024-01-15 | 14:30 | Plaintiff begins photographing Irving PD station from public sidewalk | Plaintiff declaration ¶4 |
| 2024-01-15 | 14:32 | Officer Smith approaches, asks Plaintiff to stop | BWC Smith 00:00 |
| 2024-01-15 | 14:33 | Plaintiff states he has a First Amendment right to record | BWC Smith 01:15 |
| 2024-01-15 | 14:35 | Smith grabs Plaintiff's arm, places in handcuffs | BWC Smith 03:12; BWC Jones 02:45 |
| 2024-01-15 | 14:36 | Officer Jones arrives as backup | CAD log |
| ... | ... | ... | ... |
```

This timeline becomes the backbone of your complaint, your summary judgment brief, and your trial presentation. Update it every time you learn a new fact.

### weaknesses — The document you don't want to write

**Write it anyway.** Opposing counsel will find your weaknesses. The judge will notice them. The only question is whether you've already prepared responses.

```
## Known Weaknesses

### 1. Plaintiff raised his voice during the encounter
- **BWC timestamp**: 02:45-03:00
- **How defense will use it**: Argue Plaintiff was "disorderly" and provided probable cause
- **Our response**: Raising one's voice is protected speech. Colten v. Kentucky, 407 U.S. 104 (1972). Volume alone does not constitute disorderly conduct. Officer had no objective basis to believe a crime was occurring.
- **Residual risk**: Medium — jury may sympathize with officer regardless of law

### 2. Plaintiff has a prior arrest (2019, dismissed)
- **How defense will use it**: Imply Plaintiff is a "troublemaker" — may try to introduce under FRE 404(b)
- **Our response**: Prior dismissed arrest is inadmissible propensity evidence. File motion in limine.
- **Residual risk**: Low if motion in limine granted; high if jury hears about it
```

Being honest with yourself about bad facts is uncomfortable. It's also the most important strategic exercise in your entire case. Every weakness you identify is one you can prepare for. Every one you ignore is a surprise at the worst possible time.

### deposition questions — Prepare before you're in the room

For each witness you plan to depose, outline your questions organized by topic. This goes in both `07-Strategy/` and the specific deponent's folder in `05-Depositions/`.

Focus on:

- **Locking in facts** — get the witness committed to a version of events
- **Establishing what they didn't do** — "Did you attempt to de-escalate?" "Did you issue a verbal warning before using force?"
- **Contradiction mining** — questions whose answers you already know from BWC footage or reports, designed to test whether the witness will be truthful
- **[Qualified immunity](/primer/qualified-immunity) undermining** — "Were you trained on citizens' right to record police?" "Can you identify any crime you believed Plaintiff was committing at the time of arrest?"

### settlement parameters — Know your number before they offer one

Before any [settlement](/primer/settlement) discussion, write down:

- Your minimum acceptable amount
- What non-monetary terms matter to you (policy changes, admissions, apology)
- What you're willing to give up (confidentiality, future claims)
- What you refuse to accept (gag orders, no-admission clauses)
- Your realistic assessment of trial value vs. settlement value

You don't have to decide everything now. But when a settlement offer comes — and it often comes suddenly, under time pressure — having thought through your parameters in advance prevents panic decisions.

## Maintenance

Organization isn't a one-time task. Build these habits:

- **File immediately.** When a document arrives — from PACER, from opposing counsel, from an agency — put it in the right folder now. Not later. Now.
- **Update the timeline.** Every new fact gets a row.
- **Revisit strategy docs monthly.** After every significant filing or event, review your claims document and weaknesses document. Has anything changed?
- **Back up regularly.** If you're using Google Drive, it's automatic. If you're local, set up automated backups. Losing your case file to a hard drive failure is not a recoverable error.

## What comes next

With your evidence gathered and your war room organized, you're ready to write and **[file your complaint](/process/filing)**.
