# Content Plan: Porting Substantive Guidance from section-1983-skills

Date: 2026-09-05
Source repo: `/Users/dalelotts/dev/PoliceConductUS/section-1983-skills` (v0.1.0)
Companion: `docs/seo-audit-2026-09-05.md`
Status: all four phases drafted 2026-09-05; every item below is in the working tree awaiting legal review and commit. New case pages carry an `<!-- UNVERIFIED -->` marker until checked against authority files.

## Ground rules for every item

- Port the law and the practice guidance. Leave out folder contracts, QC stages, hash receipts, validators, and "trusted host" language.
- Cite only cases that have a page in `cases/`. Where a needed case is missing, the item lists it under "Cases to add" and the case page ships with the article.
- The skills are written for the Fifth Circuit. Each article says so where a circuit-specific rule appears.
- Every new article: learning goals up front, "Check Your Understanding" at the end, readability audit at "low", title tag carries "Section 1983".
- The Horan material is a summary of a copyrighted book. Write original guidance and credit the book. Do not republish the chapter inventories.

## Phase 1: Deadline and procedure gaps with search demand

These fill the largest procedural holes and answer high-intent "how long do I have" and "what do I file" queries.

### 1.1 What Do I File, and By When? A Section 1983 Deadline Map

- Type: Process index companion page, linked from every process step
- Slug: `/process/deadline-map/` (new process entry, `order` 0 or a standalone page)
- Target keywords: how long to respond to motion to dismiss federal court; deadline to object to magistrate report and recommendation; federal court deadlines pro se; rule 6(d) three days mail
- Source: `section-1983-drafting/references/case-map.md`
- Content: the event to document to deadline table, the two standing rules ("silence is the enemy"; calendar before you read), a note that local rules override, and links to each responsive-document article below
- Cases in library: none needed
- Effort: half day

### 1.2 Objecting to a Magistrate Judge's Report and Recommendation

- Type: Process step, placed between Rule 12 Motions and Summary Judgment
- Slug: `/process/report-and-recommendation/`
- Target keywords: objection to report and recommendation; magistrate judge report and recommendation objection deadline; 28 U.S.C. 636(b)(1) objections; de novo review objections
- Source: `documents/rr-objection.md`, `documents/rr-response.md`, attack checklist "R&R objection"
- Content: why cases die at the R&R; 14 days plus 3 for mail; Rule 72(a) vs 72(b) standards; the specificity rule and waiver; numbered objection skeleton; argue from the record before the magistrate; attribute the R&R's adverse descriptions rather than adopting them; the mirror response when the R&R favors you
- Terms to add: `magistrate-judge`, `report-and-recommendation`
- Cases to add: Thomas v. Arn, 474 U.S. 140 (1985)
- Effort: one day

### 1.3 Motion for Extension of Time in Federal Court

- Type: Article plus sample
- Slugs: `/articles/how-to-ask-for-more-time-in-a-section-1983-case/`, `/articles/sample-motion-for-extension-of-time/`
- Target keywords: motion for extension of time federal court pro se; rule 6(b) good cause; excusable neglect after deadline; sample motion for extension of time
- Source: `documents/extension-motion.md`, attack checklist "Extension motion"
- Content: before vs after the deadline; ask once for the time needed; state the opponent's position; one motion per deadline; no drama
- Terms to add: `motion-for-extension-of-time`
- Effort: half day

### 1.4 How and When to Amend Your Complaint

- Type: Article plus sample motion
- Slugs: `/articles/how-to-amend-a-section-1983-complaint/`, `/articles/sample-motion-for-leave-to-amend/`
- Target keywords: amend complaint as a matter of course 21 days; motion for leave to amend complaint federal court; rule 15(a)(2) freely given; foman v davis factors; amended complaint supersedes original
- Source: `documents/leave-to-amend.md`, complaint contract "unknown and new-defendant limitations gate", attack checklist "Leave to amend"
- Content: the 21-day window; Foman factors; supersession trap ("a fact left out is a fact abandoned"); attach the complete proposed pleading and redline; ask for leave in the alternative in every dismissal response; Rule 16 good cause after the scheduling order; a plain-language version of the Doe-defendant relation-back problem (Rule 15(c), Rule 4(m), the four identity dates, diligence)
- Terms to add: `relation-back`, `rule-4m-service-deadline`
- Cases in library: foman-v-davis, johnson-v-city-of-shelby
- Cases to add: Krupski v. Costa Crociere, 560 U.S. 538 (2010)
- Effort: one day

### 1.5 After Judgment: Rule 59(e) and the Postjudgment Motion for Leave to Amend

- Type: Article, linked from Post-Trial and from Rule 12 Motions "Possible outcomes"
- Slug: `/articles/rule-59e-motion-after-dismissal-in-a-section-1983-case/`
- Target keywords: rule 59(e) motion to alter or amend judgment pro se; motion for reconsideration after dismissal federal court; leave to amend after judgment; manifest error rule 59(e); 28 days rule 59(e)
- Source: `drafting-section-1983-rule-59e/SKILL.md`, `references/postjudgment-amendment-contract.md`, `references/appellate-record-contract.md`
- Content: 28-day clock and tolling of appeal; relief first; the one-path chain (59(e) reopens, 15(a) permits, 12 tests futility); the recurring error of a futility ruling that never tested the proposed pleading; manifest error is not disagreement; the anti-replay rule; ask for a claim-specific ruling on every denied claim; make the record reviewable without saying so
- Cases in library: foman-v-davis, ashcroft-v-iqbal
- Effort: one day

### 1.6 Before You File Anything: Local Rules and Your Judge's Standing Orders

- Type: Article, linked from Filing Your Case and Rule 12 Motions
- Slug: `/articles/local-rules-and-standing-orders-in-a-section-1983-case/`
- Target keywords: federal district court local rules pro se; judge standing order; page limits federal court motion; proposed order required; certificate of conference; summary judgment statement of facts local rule
- Source: `references/localization.md`
- Content: the seven-question checklist as a fill-in worksheet; where to find local rules and judge pages; why the MSJ fact statement is the most district-specific document; a downloadable one-page worksheet
- Terms to add: `local-rules`, `standing-order`
- Effort: half day

## Phase 2: Complaint quality, tied to the sample-complaint SEO cluster

These strengthen the pages that already rank or should rank for "how to write a section 1983 complaint" and "sample section 1983 complaint".

### 2.1 Expand "How to Write a Section 1983 Complaint"

- Type: Revision of existing article
- Source: `drafting-section-1983-complaints/SKILL.md` "Knowledge, attribution, inference, and conclusion discipline"; complaint contract sections on skeleton, Rule 8/10/11, capacities, relief by capacity
- Add: the four sentence types with the four-question test; "information and belief" is not a substitute for facts and what it must identify; the ordered skeleton; one fact per numbered paragraph; incorporate only relevant paragraphs; official-capacity vs municipal duplication; punitive damages only from individuals; Rule 11 signature; Rule 5.2 redaction
- Cases in library: ashcroft-v-iqbal, bell-atlantic-corp-v-twombly, johnson-v-city-of-shelby, leatherman-v-tarrant-cnty, kentucky-v-graham, city-of-newport-v-fact-concerts-inc, degenhardt-v-bintliff, kelson-v-clark
- Terms to add: `rule-11`, `rule-5-2-redaction`, `information-and-belief`
- Effort: half day

### 2.2 Pleading Clearly Established Law Inside the Complaint

- Type: Article, companion to "How to Research Clearly Established Law"
- Slug: `/articles/how-to-plead-clearly-established-law-in-a-section-1983-complaint/`
- Target keywords: plead qualified immunity in complaint; clearly established law complaint fifth circuit; fair warning qualified immunity pleading
- Source: complaint contract "Qualified immunity for eligible individual counts" and the six-part fair-warning unit
- Content: the Fifth Circuit specificity requirement; the six-part unit in plain terms; one lead pre-event binding case per proposition; no district-court or unpublished decisions as the source of clearly established law; explain material differences instead of hiding them
- Cases in library: degenhardt-v-bintliff, kelson-v-clark, pearson-v-callahan, harlow-v-fitzgerald
- Effort: half day

### 2.3 When the Police Report Is Wrong: Statement, Contradiction, Correction, Materiality

- Type: Article, in the false-arrest series
- Slug: `/articles/how-to-plead-a-false-police-report-or-warrant-affidavit/`
- Target keywords: false police report civil rights lawsuit; franks v delaware false affidavit; fabricated evidence section 1983; lied in police report lawsuit
- Source: complaint contract "Compact statement -> contradiction -> correction -> materiality pattern"; false-arrest delta "Warrants and challenged accounts"
- Content: the four-step pattern with the drafting example; a post-arrest report cannot supply arrest-time knowledge; call a statement false only with support, otherwise say how it is unsupported; the corrected affidavit test
- Cases in library: franks-v-delaware, malley-v-briggs
- Cases to add: none required
- Effort: half day

### 2.4 Should You Attach the Video to Your Complaint?

- Type: Article
- Slug: `/articles/video-evidence-and-your-section-1983-complaint/`
- Target keywords: attach body camera video to complaint; incorporation by reference motion to dismiss; scott v harris video; body camera footage civil rights lawsuit
- Source: claim-specific contracts "Record and video discipline"; false-arrest delta "Video and incorporated-material rule"; attack checklist items on incorporated material
- Content: incorporation lets the whole document control your allegations; audit the full recording for defense-favorable portions before attaching; describe only what the recording resolves continuously; mark occlusion and speaker uncertainty; never round a timestamp later; a show-of-authority seizure completes on submission, later contact does not move it
- Cases in library: scott-v-harris, tolan-v-cotton, buehler-v-dear, bailey-v-ramos
- Terms to add: `incorporation-by-reference`, `rule-12d-conversion`
- Effort: half day

### 2.5 Expand "False Arrest Claim Elements and Defenses"

- Type: Revision of existing article
- Source: `drafting-false-arrest-complaints/references/corpus-findings.md` and `false-arrest-complaint-delta.md`
- Add: "What false-arrest complaints that survived had in common" (eight items); "Eleven ways false-arrest complaints fail"; the stage-by-stage chronology table in reader terms; the seizure boundary; alternative offenses only when raised; dismissal or nonprosecution does not prove lack of probable cause
- Cases in library: devenpeck-v-alford, atwater-v-city-of-lago-vista, mesa-v-prejean, buehler-v-dear
- Effort: half day

### 2.6 Update "Excessive Force Claim Elements and Graham Factors"

- Type: Revision of existing article
- Source: claim-specific contracts "Excessive force"
- Add: plead the events preceding the force; the totality inquiry has no time limit; Barnes v. Felix rejected the moment-of-threat rule; distinguish visible facts from camera occlusion
- Cases in library: barnes-v-felix, graham-v-connor
- Effort: two hours

### 2.7 Monell planning checklist section

- Type: Revision of "Monell: Pleading Multiple Theories" and "Monell: Finding Evidence Before Discovery"
- Source: `planning-section-1983-monell-claims/references/path-planning-contract.md`; claim-specific contracts "Monell"; `collecting-police-policy-sources` and `analyzing-police-policy-sources` classification rules
- Add: the six path types with a one-line test each; the six-step sequence every path must complete on its own; temporal lanes (post-event facts cannot supply pre-event notice); a model policy, accreditation standard, or training document is not department policy without adoption evidence; never apply a later policy version to an earlier event
- Cases in library: city-of-canton-v-harris, connick-v-thompson, bd-of-comm-rs-of-bryan-cnty-v-brown-brown, piotrowski-v-city-of-houston
- Effort: half day

## Phase 3: Writing and research discipline

### 3.1 How to Write Like the Record, Not Like a Rant

- Type: Article, linked from every sample document
- Slug: `/articles/how-to-write-a-court-filing-that-judges-trust/`
- Target keywords: how to write a legal brief pro se; plain language legal writing; words to avoid in legal writing; how to write a complaint that a judge will read
- Source: `references/writing-system.md`; `horan-bad-words/cheatsheet.md` (concepts only, with attribution)
- Content: adjectives tell, facts show; one point per sentence and a word cap; active voice with a named actor; the own-voice vs law's-voice split; no rhetorical questions or weasel assurances; attribute adverse characterizations instead of adopting them; a short "cut these words" list in your own words; the rewrite moves table
- Downloadable: one-page self-edit checklist
- Effort: half day

### 3.2 Expand "How to Use AI in Your Section 1983 Case" and "How to Research Clearly Established Law"

- Type: Revisions
- Source: `references/authorities.md`; `collecting-legal-authority-sources/SKILL.md`; `audit-authorities/SKILL.md` (conceptual parts)
- Add: every AI or search result is a lead, not authority; split each claim into atomic propositions and verify each; distinguish holding, dicta, party argument, lower-court ruling under review, concurrence, dissent; binding before persuasive; one proposition, one best cite; quotations transcribed, never reconstructed; the `[VERIFY]` habit; an empty search never proves no authority exists
- Effort: two hours

### 3.3 Research Your Judge Before You File

- Type: Article
- Slug: `/articles/how-to-research-your-federal-judge/`
- Target keywords: research federal judge before filing; courtlistener judge search; judge standing orders qualified immunity; how does my judge rule on motions to dismiss
- Source: `building-judicial-reasoning-profiles/SKILL.md` (public-scope rules, CourtListener discovery steps, evidence classes)
- Content: what to read (opinions, standing orders, pro se guides); CourtListener judge and opinion search; keep revealed reasoning separate from stated philosophy and self-description; what not to research and why; use it to write clearly, never to predict
- Effort: half day

### 3.4 Red-Team Your Own Filing

- Type: Article, companion to "How the Defense Will Try to Shrink, Reframe, or Kill Your Case"
- Slug: `/articles/how-to-review-your-own-section-1983-filing-before-you-file/`
- Target keywords: check complaint before filing; how to review a legal brief; common mistakes pro se complaint
- Source: `adversarial-filing-review/references/document-attack-checklists.md`
- Content: the universal checklist plus one checklist per document type, rewritten as questions the reader asks; five-bucket sorting (fatal, credible opposition, factual dispute, discovery issue, style)
- Effort: half day

## Phase 4: Discovery and summary judgment depth

### 4.1 Reading Their Discovery Responses: A Request-by-Request Audit

- Slug: `/articles/how-to-audit-discovery-responses-in-a-section-1983-case/`
- Target keywords: boilerplate discovery objections; discovery responses deficient; motion to compel pro se
- Source: `auditing-section-1983-discovery-responses/SKILL.md`
- Content: four statuses (not produced, claimed nonexistent, withheld, unclear); silence proves nothing; evaluate partial answers and objections separately; record the concrete deficiency and requested cure
- Effort: half day

### 4.2 The Meet-and-Confer Letter

- Slug: `/articles/sample-meet-and-confer-letter-discovery/`
- Target keywords: meet and confer letter discovery sample; rule 37 conference letter
- Source: `drafting-section-1983-meet-and-confer/SKILL.md`
- Content: one entry per deficient request; cite the rule; state the cure and a response date; keep a separate factual conference record; silence is not consent
- Terms to add: `meet-and-confer`
- Effort: two hours

### 4.3 Privilege Logs: What They Must Contain

- Slug: `/articles/privilege-logs-in-a-section-1983-case/`
- Target keywords: privilege log requirements federal; deficient privilege log; internal affairs file privilege
- Source: `auditing-section-1983-privilege-logs/SKILL.md`
- Content: the twelve required fields; audit each entry; you cannot decide privilege, only spot missing metadata
- Terms to add: `privilege-log`
- Effort: two hours

### 4.4 Building a Deposition Outline from Element Gaps

- Slug: `/articles/how-to-build-a-deposition-outline-in-a-section-1983-case/`
- Target keywords: deposition outline police officer; pro se deposition questions; deposition outline template
- Source: `drafting-section-1983-deposition-outlines/SKILL.md`
- Content: organize by open element gaps; each topic names its element, exhibit, and gap; mark foundation and authentication needs; flag dependence on unproduced documents; a question is not an expected answer
- Effort: half day

### 4.5 Strengthen the Summary Judgment process page and "How to Write a Declaration"

- Source: `documents/msj-response.md`; `drafting-section-1983-declarations-and-evidence/SKILL.md`
- Add to Summary Judgment: the three parts; an unsupported "disputed" is an admission; pleadings are not evidence; Rule 56(d) declaration when discovery is incomplete; spend effort on the fact statement first
- Add to Declaration article: the six statement classifications and which four never belong in a declaration; one proposition per paragraph; the domestic vs foreign § 1746 form; the exhibit foundation questions
- Terms to add: `rule-56d-declaration`
- Effort: half day

### 4.6 Expand "Discovery" process page templates

- Source: `drafting-section-1983-written-discovery/SKILL.md`
- Add: a target map (claim, defendant, element) before writing any request; numerical limits and prioritization; ask whether a source exists before asking what it says; one fact per request for admission
- Effort: two hours

## Cases to add to the library (with the article that needs them)

| Case                      | Citation            | Needed by                                      |
| ------------------------- | ------------------- | ---------------------------------------------- |
| Thomas v. Arn             | 474 U.S. 140 (1985) | 1.2                                            |
| Krupski v. Costa Crociere | 560 U.S. 538 (2010) | 1.4                                            |
| Wallace v. Kato           | 549 U.S. 384 (2007) | 2.1 accrual note (terms cite it; no case page) |
| McDonough v. Smith        | 588 U.S. 109 (2019) | 2.3                                            |
| Thompson v. Clark         | 596 U.S. 36 (2022)  | 2.3                                            |
| Erickson v. Pardus        | 551 U.S. 89 (2007)  | 2.1 liberal construction                       |
| Hartman v. Moore          | 547 U.S. 250 (2006) | Nieves article cross-reference                 |

## Terms to add

`magistrate-judge`, `report-and-recommendation`, `motion-for-extension-of-time`, `relation-back`, `rule-4m-service-deadline`, `local-rules`, `standing-order`, `rule-11`, `rule-5-2-redaction`, `information-and-belief`, `incorporation-by-reference`, `rule-12d-conversion`, `meet-and-confer`, `privilege-log`, `rule-56d-declaration`

## Sequencing

1. Phase 1 first. It closes the largest procedural holes and each page answers a deadline query with no strong competitor.
2. Phase 2 next, because it compounds the sample-complaint and how-to-write-complaint pages already targeted in the SEO audit.
3. Phase 3 and 4 can run in parallel with the strategic SEO investments (state hubs, statute-of-limitations pages, pillar articles).

Estimated total: about 14 working days of drafting plus legal review of each phase before publish.
