---
name: review-checklist
description: How the team reviews a change - what blocks a merge and what does not, and what to check every time. Preloaded into the adversarial reviewer; use it whenever you review a pull request here.
---

# Review checklist

**Severity** (only blocker and major fail the gate):
- **Blocker:** a rule from the ticket or the team's decision is wrong; data loss; a security problem; the build or
  tests are broken.
- **Major:** an acceptance criterion is not met; an edge case the decision names is not handled; an accessibility
  failure that stops someone from using the feature; tests that would pass with the wrong rule.
- **Minor:** naming, copy polish, small visual details, refactors. List them; they never block.

**Every time:**
1. Each acceptance criterion and each line of the team's decision, one by one, against the code: numbers, bounds
   (inclusive or not), rounding, exceptions.
2. Inputs at and around every limit; empty, missing and invalid values; nothing shows NaN, undefined or negatives.
3. The unit tests check the rules and the boundaries, not just one happy case; the end-to-end spec asserts behaviour.
4. The web-ui-standards: tokens, labels and errors, keyboard, responsive.
5. Nothing outside the ticket changed (other sections, pipelines, settings).

Point to `file:line` and say the fix. No speculation, no style preferences presented as defects.
