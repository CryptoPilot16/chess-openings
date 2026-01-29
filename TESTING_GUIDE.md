# Chess Opening Trainer — Testing Guide

**Version:** 1.0  
**Date:** 2026-01-29  
**Deployment:** https://chess-openings-blue.vercel.app

---

## 🎯 Critical Test: Interactive Board

This is the most important test to verify the app works end-to-end.

### Test 1: Basic Piece Movement

1. **Open:** https://chess-openings-blue.vercel.app
2. **Select:** Click on "Italian Game" card
3. **Observe:** Board should display with pieces in starting position
4. **Click:** White pawn at e2 (second row from bottom, 5th column)
5. **Verify:** Square should highlight with yellow ring
6. **Click:** Destination square e4 (fourth row from bottom, 5th column)

**Expected Result:**
- ✅ Pawn moves from e2 to e4
- ✅ "Next Move" updates to show "Nf3"
- ✅ Progress bar updates: "1/9 moves"
- ✅ Move history shows "e4"
- ✅ Sound effect plays (if sound enabled)
- ✅ Green "✓ Correct!" feedback appears briefly

**If piece doesn't move:**
- Open browser console (press F12)
- Look for red error messages
- Screenshot and share the console output

---

### Test 2: Wrong Move Handling

1. After e4, click on the white pawn at d2
2. Click on d5 (incorrect opening move)

**Expected Result:**
- ✅ Red "✗ Try again" feedback
- ✅ Piece returns to original position
- ✅ Progress doesn't advance
- ✅ Error sound plays

---

### Test 3: Complete Opening

Continue through the Italian Game moves:
- e4 (white pawn)
- e5 (black pawn should auto-move)
- Nf3 (white knight from g1 to f3)
- Nc6 (black knight auto-moves)
- Bc4 (white bishop from f1 to c4)

**Expected Result:**
- ✅ All moves execute smoothly
- ✅ Progress shows "9/9 moves"
- ✅ Success screen appears with +XP
- ✅ Returns to home after 3 seconds

---

## 🎮 Feature Tests

### Test 4: Hint System
1. Start Italian Game
2. Press **H** key (or click Hint button)

**Expected:** Shows next move ("e4")

---

### Test 5: Reset
1. Make a few moves
2. Press **R** key (or click Reset button)

**Expected:** Board returns to start, progress resets to 0/9

---

### Test 6: Sound Toggle
1. Click sound icon in top navigation
2. Make a move

**Expected:** Sound muted/unmuted

---

### Test 7: Progress Tracking
1. Complete an opening
2. Navigate to "Progress" page (top nav)

**Expected:**
- Opening shows mastery percentage
- Total XP displayed
- Level shown
- Next review date calculated

---

### Test 8: Achievements
1. Navigate to "Achievements" page
2. Check unlock status

**Expected:**
- "First Steps" unlocked (complete 1 opening)
- Others locked or unlocked based on progress

---

### Test 9: Daily Challenge
1. On home page, check "Daily Challenge" card
2. Click the featured opening

**Expected:**
- Bonus XP indicator (+100)
- Completes normally
- Shows "Completed ✓" on home page after

---

### Test 10: Mobile Responsiveness
1. Open on mobile device (or resize browser <600px width)

**Expected:**
- Board scales to fit screen
- Touch targets large enough (44px minimum)
- Navigation stacks vertically
- No horizontal scroll

---

### Test 11: Dark Mode
1. System dark mode should auto-apply
2. Or toggle in theme settings

**Expected:**
- Background dark slate
- Board colors: cyan/blue (not pure white)
- Text readable (high contrast)

---

### Test 12: Keyboard Navigation
1. Use Tab to navigate between elements
2. Press Enter to activate buttons

**Expected:**
- All interactive elements focusable
- Focus indicator visible (blue ring)
- Screen readers announce elements

---

## 🐛 Bug Reporting Template

If something doesn't work, report:

```
**What broke:** [e.g., "Pieces don't move when clicked"]

**Browser:** [e.g., Chrome 120, Safari 17, Firefox 121]

**Device:** [e.g., iPhone 14, Desktop Windows]

**Steps to reproduce:**
1. Open app
2. Click Italian Game
3. Click e2 pawn
4. Click e4
5. Nothing happens

**Console errors:** [F12, screenshot the red errors]

**Screenshot:** [Optional, but helpful]
```

---

## ✅ Expected Performance

**Page Load:**
- First paint: < 1 second
- Interactive: < 2 seconds
- 60 FPS animations

**Interactions:**
- Click response: < 100ms
- Sound playback: < 50ms
- Move validation: < 100ms

**Storage:**
- Data persists across page refresh
- Export/import works (download JSON, re-import)

---

## 🔧 Developer Testing

If you want to test locally:

```bash
# Clone repo
git clone https://github.com/CryptoPilot16/chess-openings.git
cd chess-openings

# Install dependencies
npm install

# Run dev server
npm run dev

# Open browser
open http://localhost:3000

# Build for production
npm run build

# Start production build locally
npm start
```

**Verify:** Localhost should behave identically to Vercel deployment

---

## 📊 Quality Checklist

Use this to verify app quality:

- [ ] All pieces move when clicked
- [ ] Wrong moves show feedback (red message)
- [ ] Correct moves advance progress
- [ ] Hints work (H key or button)
- [ ] Reset works (R key or button)
- [ ] Sound toggle works
- [ ] Quit returns to home (Q key or button)
- [ ] Progress page shows stats
- [ ] Achievements unlock correctly
- [ ] Daily challenge works
- [ ] Mobile layout responsive
- [ ] Dark mode applied
- [ ] Keyboard navigation works
- [ ] No console errors
- [ ] Data persists after refresh
- [ ] Export/import works

**Target:** 15/15 passing = 100% quality ✅

---

## 📞 Support

If critical bugs found, provide:
1. Console screenshot (F12)
2. Browser + version
3. Device type
4. Steps to reproduce

**Response time:** Immediate (same session) if testing during active session

---

**Last Updated:** 2026-01-29 12:18 UTC  
**Build Version:** Latest (Vercel auto-deploy)  
**Status:** Awaiting user verification ⏳
