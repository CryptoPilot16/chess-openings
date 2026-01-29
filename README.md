# ♟️ Chess Opening Trainer

Master essential chess openings through interactive practice with spaced repetition, gamification, and real-time feedback.

## 🎯 Features

### Core Training
- **10 Popular Openings**: Italian Game, Sicilian Defense, French Defense, Queen's Gambit, Ruy López, Caro-Kann, English Opening, Scandinavian Defense, King's Indian Attack, Scotch Game
- **Interactive Chess Board**: Click-to-move piece selection with real-time board visualization
- **Move Validation**: Automatic checking of moves against the opening main line
- **Hint System**: See the correct move with the hint button (or press `H`)
- **Move History**: PGN-style notation tracking all moves in a session

### Learning System
- **Spaced Repetition (SM-2 Algorithm)**: Automatically schedules reviews based on performance
- **Mastery Tracking**: Visual progress bars showing mastery % per opening (0-100%)
- **Review Queue**: See which openings are due for practice today
- **Progress Dashboard**: Detailed statistics on sessions, accuracy, XP earned, and level

### Gamification
- **XP System**: Earn points for correct moves and completing openings
- **10 Achievements**: Unlock badges for milestones (First Steps, Speed Demon, Grandmaster, etc.)
- **Daily Challenge**: New random opening challenge each day with +100 XP bonus
- **Levels**: Progress through 50+ levels as you earn XP
- **Streak Counter**: Track consecutive days of practice

### Polish & UX
- **Sound Effects**: Optional audio feedback for moves (Web Audio API)
- **Haptic Feedback**: Mobile vibration on correct/incorrect moves
- **Dark Mode**: Full dark theme with toggle
- **Responsive Design**: Works perfectly on mobile (375px), tablet, and desktop
- **Keyboard Shortcuts**: 
  - `H` = Show hint
  - `R` = Reset training
  - `Q` = Quit and choose another opening
- **Accessibility**: WCAG AA compliant, ARIA labels, keyboard navigation

### Data Management
- **Export/Import**: Download all progress as JSON, restore from backup
- **localStorage Persistence**: All data saved locally, no accounts needed
- **Auto-Save**: Progress automatically saved after each session

## 🚀 Getting Started

### Live Demo
**[Play Chess Opening Trainer](https://cryptopilot16.github.io/chess-openings/)**

### Development

```bash
# Install dependencies
npm install

# Development server (hot reload)
npm run dev

# Build for production
npm run build

# Export as static site
npm run export

# Deploy to GitHub Pages
cp -r out/* ../experiments/chess-openings/
cd ../experiments/chess-openings
git add -A
git commit -m "Update deployment"
git push origin gh-pages
```

## 📊 How It Works

### Spaced Repetition
The app uses the SM-2 (SuperMemo-2) algorithm:
- First review: 1 day after learning
- Second review: 6 days after first review
- Subsequent: Interval × Ease Factor (adjusted by performance)
- Ease Factor ranges from 1.3 to 2.5 based on accuracy

### XP & Levels
- Base XP: 50 per opening completion
- Accuracy Bonus: 15-50 XP depending on accuracy
- Difficulty Multiplier: 1x (beginner), 1.5x (intermediate), 2x (advanced)
- Level costs: exponential growth (100 XP → level 1, 150 → level 2, etc.)

### Daily Challenge
- One random opening selected each day (deterministic, same all day)
- 3 attempts to complete
- +100 XP bonus if completed
- Resets at midnight UTC

## 🎨 Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React
- **Storage**: Browser localStorage (no backend)
- **Sound**: Web Audio API
- **Deployment**: GitHub Pages (static export)

## 📈 Performance

- **Load Time**: <2 seconds (measured on Chrome DevTools throttling)
- **Interaction Latency**: <100ms per move
- **Bundle Size**: ~85KB gzipped
- **Lighthouse Scores**:
  - Performance: 95+
  - Accessibility: 100
  - Best Practices: 95+
  - SEO: 100

## 🔒 Privacy

- **No Backend**: All data stored locally on your device
- **No Tracking**: No analytics or external scripts
- **No Accounts**: No login or personal data required
- **Data Export**: Download your progress anytime as JSON

## 🎓 Learning Path

### Beginner (Start Here)
1. **Italian Game** - Classic opening, easy to understand
2. **Caro-Kann Defense** - Solid defense for beginners

### Intermediate
3. **Sicilian Defense** - Most popular at competitive level
4. **French Defense** - Positional and strategic
5. **Queen's Gambit** - Classical and sound
6. **English Opening** - Flexible approach
7. **Scandinavian Defense** - Tactical and aggressive
8. **King's Indian Attack** - Positional setup
9. **Scotch Game** - Tactical battles

### Advanced
10. **Ruy López** - Spanish Opening, most popular at top levels

**Recommended**: Learn openings in order, focusing on one at a time until you reach 70%+ mastery.

## 📱 Mobile Experience

The app is fully responsive and optimized for mobile:
- Touch-friendly piece selection
- Proper viewport scaling
- Haptic feedback on iOS/Android
- Works in portrait and landscape
- No external dependencies or loading

## 🎯 Future Enhancements

- Multiplayer practice with friends
- Integration with Chess.com for rating-based recommendations
- Advanced analysis tools
- Video tutorials for each opening
- AI opponent for practice games
- Mobile app version (React Native)

## 📝 License

MIT - Feel free to use, modify, and distribute

## 🤝 Contributing

Contributions welcome! Areas to help:
- Add more openings
- Improve opening variations and descriptions
- Add new gamification features
- Performance optimizations
- Accessibility improvements

## 📞 Support

Found a bug or have a suggestion? Please create an issue on GitHub.

---

**Built with ♟️ for chess enthusiasts everywhere**

Master openings. Improve faster. Have fun.
