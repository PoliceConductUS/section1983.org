# Case Audit Instructions

**Project**: `/Users/dalelotts/dev/PoliceConduct-org/section1983.org/`
**Cases directory**: `cases/` (at project root)
**Authority files**: `/Users/dalelotts/Library/CloudStorage/GoogleDrive-dale@dalelotts.com/My Drive/3-25-CV-03329-S-BN/sources/authorities/verified/cases/{slug}/authority.md`

## For each case:

1. Read the authority.md file at the path above (try authority.txt if .md doesn't exist)
2. Read the current case page in `cases/{slug}.md`
3. Compare: does the case page contain ANY facts, holdings, quotes, dates, or claims NOT present in or supported by the authority file?
4. If yes: REMOVE or CORRECT the unsupported content. Keep the existing structure but strip anything not grounded in the authority text.
5. If the authority file doesn't exist at all, add `<!-- UNVERIFIED -->` as a comment INSIDE the markdown body (AFTER the closing `---` of frontmatter, NOT before it). Example:

   ```
   ---
   title: ...
   ---
   <!-- UNVERIFIED: No authority file found. Content needs manual verification. -->

   ## What This Case Is About
   ```

6. Preserve frontmatter exactly as-is (tags were just remapped, don't change them). Only audit the body content.

## Important rules:

- Do NOT add new content from the authority that isn't already in the case page. Only REMOVE content that isn't supported.
- Do NOT change frontmatter (title, tags, cites, citedBy, etc.)
- Do NOT put HTML comments before the opening `---` delimiter — this breaks Astro's frontmatter parser
- After auditing all cases, run `npx astro build` from the project root to verify the build still passes
- Report: how many cases were modified, how many had no authority file, and a brief summary of the types of corrections made
