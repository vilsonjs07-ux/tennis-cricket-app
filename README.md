# TennisScore Pro 🎾🏏
> **Professional Tennis Ball Cricket Scoring Application**  
> *Official Cricket Laws • No LBW • Tournament Ready*

TennisScore Pro is a mobile-first cricket scoring web application designed specifically for **Tennis Ball Cricket matches and tournaments** (T10, T12, T15, T20, and custom overs).

---

## ⚖️ Tennis Ball Cricket Rules Engine

Tennis ball cricket follows international cricket rules with one primary convention: **There is NO LBW (Leg Before Wicket)**.

### 1. The Core Rule: Zero LBW
- Leg Before Wicket (LBW) is strictly **disabled**. If a delivery strikes the batter's pads, legs, or body in line with the stumps, the batter is **NOT OUT**.
- If the batters run after the ball strikes the pad, runs are recorded as **Leg-Byes** (credited to team extras, not off the bat).

### 2. Standard Official Dismissals Enforced
All other standard cricket dismissals are fully supported and enforced:
- 🎯 **Clean Bowled**: Ball directly disturbs the stumps.
- 🧤 **Caught (Outfield)**: Clean catch taken by a fielder before the ball touches the turf.
- 🧤 **Caught Behind**: Thin or thick edge cleanly caught by the wicketkeeper.
- 🏏 **Caught & Bowled**: Return catch taken by the bowler.
- ⚡ **Stumped**: Batter steps out of the crease, misses the ball, and the wicketkeeper dislodges the bails.
- 🏃 **Run Out**: Direct hit or bails removed while batter is short of the popping crease. Runs completed before the run-out are recorded.
- 💥 **Hit Wicket**: Batter breaks the stumps with their bat or body in the process of playing a shot.
- 🚑 **Retired Hurt / Retired Out**: Injury or tactical retirement.

### 3. White-Ball Tournament Regulations
- 🚨 **No-Balls & Free Hits**: Front-foot overstepping or waist-high full toss incurs 1 penalty run, requires a re-ball, and grants a **Free Hit** on the next legal delivery. On a Free Hit, batters cannot be dismissed except by run out.
- ↔️ **Wide Balls**: Deliveries pitched outside the off-side or leg-side tramlines incur 1 penalty run and must be re-bowled.
- 🏃 **Byes & Leg-Byes**: Permitted as legal deliveries; runs are added to team extras and not charged to the bowler's figures.
- 🔄 **Over Alternation**: Bowlers must alternate overs. A bowler cannot bowl two consecutive overs from either end.
- 👟 **Strike Rotation**: Odd runs (1, 3, 5) rotate strike. Even runs (0, 2, 4, 6) maintain strike. At the end of every over, strike automatically alternates between crease batters.

---

## 🚀 Key Features

1. **Touch-Friendly Live Scoring Keypad**
   - Big, ergonomic one-handed buttons for rapid outdoor scoring: `0 (Dot)`, `1`, `2`, `3`, `4 (Four)`, `6 (Six)`, `Wd (+1 Wide)`, `Nb (+1 No-Ball)`, `1 B (Bye)`, `1 Lb (Leg Bye)`, `Wicket`, `Undo`.
   - Debounce protection to prevent duplicate taps under sunlight.
   - 1-tap "Swap Strike" button to quickly correct strike errors.
   - 1-tap "Change Bowler" button.

2. **Automated Event-Driven Engine**
   - Every delivery is an immutable `DeliveryEvent` snapshot.
   - **Pure Mathematical Undo**: Undoing a delivery recalculates the entire scorecard from ball 1, guaranteeing zero state drift.

3. **Match Setup Wizard (4 Steps)**
   - **Step 1: Match Details**: Formats (T10, T12, T20, Custom), Overs (1-50), Ball Type (Heavy Tennis Vicky/Cosco, Light Tennis, Tape Ball), Venue.
   - **Step 2: Teams & Rosters**: Team names, colors, emojis, and player lists with roles (Captain, Wicketkeeper, All-Rounder, Bowler, Batter).
   - **Step 3: Tennis Rules Configuration**: No LBW confirmation banner, bowler over quota, Free Hit toggle, Wide re-ball toggle.
   - **Step 4: Interactive Coin Toss & Openers**: Animated coin flip simulation (Heads/Tails), choice selection (Bat/Bowl), and opener assignment.

4. **Detailed Scorecard & Ball-by-Ball Feed**
   - Batting scorecard: Batter name, dismissal description, runs, balls faced, 4s, 6s, strike rate.
   - Bowling scorecard: Overs, maidens, runs conceded, wickets, economy rate, dot balls, wides, no-balls.
   - Fall of Wickets table.
   - Complete ball-by-ball commentary timeline.

5. **Visual Scorecard Graphic Generator & Sharing**
   - High-resolution (1080x1350) canvas-rendered scorecard graphic ready for Instagram Stories and WhatsApp Status.
   - Native Web Share API integration to open mobile share sheets directly on Android and iOS.
   - 1-click WhatsApp formatted text summary copy.

6. **100% Offline-First Architecture**
   - Works completely offline without internet or mandatory registration.
   - Auto-saves on every ball to `localStorage` with JSON export/import for device migration.

---

## 🛠️ Technology Stack

- **Core**: React 19, TypeScript, Vite
- **Styling**: Vanilla CSS custom design system with sports aesthetics, dark theme, and turf accents
- **State Management**: Zustand
- **Icons**: Lucide React
- **Animations & Celebrations**: Canvas Confetti (Four, Six, Victory)
- **Image Generation**: HTML5 Canvas 2D
- **Testing**: Vitest automated test suite

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd score-card

# Install dependencies
npm install

# Run the automated scoring engine tests
npm test

# Start the development server
npm run dev
```

### Production Build & Preview
```bash
# Build the optimized production bundle
npm run build

# Preview the production build locally
npm run preview
```

---

## 🧪 Automated Test Suite

Run unit tests covering cricket scoring rules, strike rotations, extras, undo, and LBW exclusion:
```bash
npm test
```
Test cases verified:
- Dot balls, singles, doubles, boundaries (4s and 6s)
- Strike rotation on odd runs and end of over
- Wide ball without legal delivery increment
- No-ball with Free Hit trigger
- Byes and Leg-byes as legal deliveries
- **Strict rejection of LBW in tennis ball cricket**
- Official dismissals (Clean Bowled, Stumped, Caught, Run Out)
- 100% state restoration on Undo
- Successful run chase and MVP calculation
