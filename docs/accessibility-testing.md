# Accessibility testing

## Automated tests

The suite in `tests/a11y/` runs in real browsers against the production build.

| Command                  | What it runs                                            |
| ------------------------ | ------------------------------------------------------- |
| `npm run test:a11y`      | Builds the site, then tests one page for every template |
| `npm run test:a11y:full` | Builds the site, then also runs axe on every built page |
| `npx playwright test`    | Runs the tests against the `dist/` folder that is there |

First-time setup: `npx playwright install chromium webkit`.

The `Accessibility` workflow runs the full version on every pull request.

| File                    | Covers                                                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `axe.spec.ts`           | axe rules for WCAG 2.2 A and AA, plus landmark and heading rules                                                      |
| `screen-reader.spec.ts` | The accessibility tree a screen reader reads: landmarks, headings, names, skip link, menu state, search announcements |
| `forced-colors.spec.ts` | Windows High Contrast: visible keyboard focus, visible icon buttons, visible control edges                            |
| `zoom.spec.ts`          | 200% and 400% browser zoom without sideways scrolling, and 200% text size without clipped text                        |
| `ios-zoom.spec.ts`      | Mobile Safari engine at iPhone size: pinch zoom allowed, form fields at 16px or larger, no sideways scrolling         |

Add a page to `templatePages` in `tests/a11y/pages.ts` when a new template is
added to `src/pages`.

## Manual checks

Automation reads the accessibility tree and emulates devices. It cannot listen
to a screen reader or pinch a real phone. Run these checks before a release
that changes layout, navigation, or interactive components.

### Screen readers

Test with VoiceOver on Safari (macOS and iOS) and NVDA on Firefox or Chrome
(Windows).

- The page title is announced on load and names the page.
- The skip link is the first stop and moves reading to the main content.
- The landmark list shows banner, main navigation, main, and footer.
- The heading list gives a usable outline of the page.
- The mobile menu button announces "Open menu" or "Close menu" and its
  expanded state.
- Search announces the number of results after typing.
- Emoji in navigation links and card text read sensibly.
- Data tables announce their column headers while moving across a row.
- The process flowchart and article charts announce their text alternative.

### iOS zoom

Test on a real iPhone in Safari.

- Pinch zoom works on every page, up to at least 200%.
- Tapping the search field leaves the page at its current zoom.
- With Settings > Accessibility > Display & Text Size > Larger Text at its
  maximum, text stays readable and nothing overlaps.
- Rotating to landscape keeps the page free of sideways scrolling.

### Forced colors

Test on Windows with Settings > Accessibility > Contrast themes turned on, in
Edge or Chrome.

- Every link, button, and field can be told apart from plain text.
- The current page, selected filters, and open menu are visibly marked.
- The flowchart and charts stay legible on a dark theme and a light theme.
