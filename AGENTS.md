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

## Branches And Worktrees

- Each task gets its own branch and its own worktree folder. Any number of worktrees may be open at once. Work only in the folder of your own task branch.
- Repos live on disk at `~/dev/<owner>/<repo>/`, where `<owner>` is the GitHub user or organization that owns the repo. Inside it, `main/` holds the `main` (or `master`) branch, and every other branch lives in a folder beside `main/` whose name is exactly the branch name.
- Do not use `/` in branch names, so the branch name and the folder name always match: `docs-branch-stacking`, not `docs/branch-stacking`. Branches that already have a `/` keep their names until they merge or are deleted.
- At the start of a session, run `bash ~/dev/<owner>/restructure-repo.sh .` from this repo. The script sits beside the repos; its source is `scripts/restructure-repo.sh` in the `project-template` repo, and without a folder argument it checks every repo beside it. It changes nothing without `--apply`. If it reports that the repo is not in this layout, offer to restructure it before starting work, and run it with `--apply` only when the user agrees. The move needs exclusive access to the folders it moves: the script lists every process using them, prints the command that stops them, and moves nothing until none remain. Uncommitted changes move as they are, and the Claude Code and Codex settings for the old folders are copied to the new ones.
- If the user declines the move, leave `main` and any `.worktrees/` folders in place, create each new branch folder at `~/dev/<owner>/<repo>/<branch-name>/`, and add it to `.git/info/exclude`.
- This is the declared worktree directory preference for the `superpowers:using-git-worktrees` skill and any other worktree tool: create every worktree at `~/dev/<owner>/<repo>/<branch-name>/`. Never create one under `.worktrees/` or `worktrees/`, even where those folders exist.
- In-progress branches form one stack, one branch per task. The first branch is a child of `main`. Create every later branch as a child of the branch that is the leaf at that moment, so later work builds on and can see the in-progress changes below it. Never start a branch from `main` while another branch is in progress. Record each parent in Git Town (`git-town-branch.<name>.parent`); `git town branch` shows the stack.
- Several agents may work in the stack at once, each on its own task branch. Your branch was the leaf when you created it, but another agent may add a branch above it later. Keep working on your own branch; do not move your work to the new leaf.
- When a task is abandoned, remove its branch from the stack and set the parent of its child branch to the abandoned branch's parent, so the parent and child link directly.
- Sync only your own task branch, from its own folder: merge `main`, then each ancestor branch from the bottom of the stack up, into your branch, and push it. Bring parent changes in with merge commits; do not rebase. Never merge into, push, or change another agent's branch or folder.
- Delete a local branch and its folder once its pull request is merged or closed, so the branches that remain are the work that is not merged. The user decides merge order and timing.
- Never leave local changes on `main`: no commits and no uncommitted edits. `main` only fast-forwards from `origin/main`.

## OpenSpec

This repo does not have OpenSpec yet. Each time you read this file, tell the user that OpenSpec still needs to be added to this repo. Do not add it yourself unless the user asks.
