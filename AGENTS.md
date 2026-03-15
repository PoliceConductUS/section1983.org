# Repo Workflow

## Verification Order

When making content, article, layout, or other site changes in this repo, use this verification sequence before closing the task:

1. Review the changed article or page for `README-STYLE.md` violations.
2. Fix any wording, structure, or style-guide problems found in that review.
3. Run `npm run lint`.
4. Run `npm run build`.

Do not treat lint as the only check. The style-guide review is required before verification, and the production build is required after lint unless the user explicitly says otherwise.

## Article Review

For article changes, do a brief explicit review for:

- contrast-first or `not X` openings
- negative-first setup anywhere in the changed text, including patterns like `did not say`, `not X`, `it is not`, and `this is not`; rewrite these to lead with the real point first unless there is a specific reason the negative-first version is clearer
- legal shorthand that hides the practical effect
- undefined legal labels
- missing judge/defense framing
- missing foundation for later sections
- second-person and training-oriented voice
- `Check Your Understanding` questions that do not match the article's learning objectives

## Goal

The goal is not just to make the repo pass lint. The goal is to make sure new content:

- follows the house style
- trains the reader clearly
- builds successfully in the production site

## Project-Specific Enforcement Rules

- For content, article, layout, or other site changes, the final response must include these exact checkpoints:
  - `Style review against README-STYLE.md: done`
  - `Negative-first scan: done`
  - `Violations found and fixed: ...`
  - `npm run lint: passed`
  - `npm run build: passed`
- If there is a clearly better wording or structural approach than the user's draft instruction, offer the better alternative before applying the requested wording verbatim.
- Do not hardcode manual `Relevant Cases` sections or similar manual replacements when the site already has a generated system for that content.
- Any case mentioned and/or linked in an article must exist in the case library. If it does not exist, add it or change the article so it does not point to a missing case entry.
- If a shorthand or shortened case title refers to an existing case page, link it.
