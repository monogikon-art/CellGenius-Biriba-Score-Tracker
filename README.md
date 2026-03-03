# 🃏 Biriba Score Tracker (Μπιρίμπα)

A modern web application for tracking scores in the Greek card game **Biriba (Μπιρίμπα)**.

![Biriba Score Tracker](https://img.shields.io/badge/Game-Μπιρίμπα-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Real-time Score Tracking** — Track scores round by round with automatic totals
- **Detailed Round Scoring** — Enter melded card points, cards-in-hand penalties, Biriba bonuses, and more
- **All Biriba Types** — Clean/dirty runs, sets, bonus suit biribas, and full biribas (13 cards)
- **Teams & Individual Play** — Support for 2 teams or 2-3 individual players
- **Configurable Target Score** — 2000, 3000, 5000, or custom
- **Persistent Storage** — All data saved in browser localStorage
- **Game History** — View past games and scores
- **Dark/Light Theme** — Toggle between dark and light modes
- **English & Greek** — Bilingual support (EN / ΕΛ)
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Undo Support** — Undo the last scored round if you made a mistake
- **Rematch** — Quick rematch with the same players

## Scoring Reference

### Card Values
| Card | Points |
|------|--------|
| Joker | 20 |
| Ace | 15 |
| 2 | 10 |
| 8, 9, 10, J, Q, K | 10 |
| 3, 4, 5, 6, 7 | 5 |

### Biriba Bonuses
| Type | Clean | Dirty |
|------|-------|-------|
| Run (7-12 cards, plain suit) | 200 | 100 |
| Set (7+ equal rank cards) | 300 | 150 |
| Run (7-12 cards, bonus suit) | 400 | 200 |
| Full Biriba (13 cards, plain) | 1000 | 500 |
| Full Biriba (13 cards, bonus) | 2000 | 1000 |

### Other Bonuses/Penalties
- **Going out:** +100 points
- **Not picking up biribaki:** −100 points

## Getting Started

### Run Locally
Simply open `index.html` in any modern web browser. No server or build step required.

### Deploy to GitHub Pages
1. Push this repository to GitHub
2. Go to Settings → Pages → Source: `main` branch, `/ (root)` folder
3. Your app will be live at `https://<username>.github.io/<repo-name>/`

## Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, grid, flexbox, dark/light themes
- **Vanilla JavaScript** — No frameworks, no dependencies
- **localStorage** — Client-side data persistence

## License

MIT License — feel free to use, modify, and share.
