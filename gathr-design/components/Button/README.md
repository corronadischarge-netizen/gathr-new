# Button

Flat pill buttons: no sheen, gradient or glow. The brand button is flat violet (flat yellow-300 with night-900 text in host mode). Labels are 16px 600 (15px on `sm`) and start with a verb.

**Provide:** `variant`, `size` (`sm` 36px, `md` 48px or `lg` 60px), optional `icon` and `iconRight`, `block` for full width, and a verb-first label.

| variant | looks like | use for |
|---|---|---|
| `primary` | white pill, black label (as on the onboarding "Next") | the main step on a screen |
| `brand` | flat violet pill | the one signature action on a detail screen: "Get passes" |
| `glass` | frosted pill | secondary actions over aurora or busy grounds |
| `subtle` | dark surface pill | the "See all" pill next to a section header |
| `ghost` | muted text only | tertiary links |
| `tonal` | white-22% glass on a colour card | social and occasion cards only, never in app chrome |

- **One CTA style:** every card button and most screen CTAs are `primary` (the white pill). Never colour a button with a venue or pillar hue.
- Use one `primary` or `brand` per screen, never both side by side.
- The full-width bottom CTA is `lg` + `block`, placed `space-4` from the edges.
