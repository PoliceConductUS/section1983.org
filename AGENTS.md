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
