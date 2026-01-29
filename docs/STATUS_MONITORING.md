# Chess Opening Trainer - Status Monitoring

## Live Status Dashboard

**URL:** https://cryptopilot16.github.io/clawdbot-status/

Real-time mission monitoring dashboard that tracks:
- Mission status (active/paused/standby)
- Progress (completed vs upcoming tasks)
- Token usage and costs by model
- Elapsed mission time
- Activity log with timestamps
- Direct link to live Chess app

## Dashboard Features

### Animated HUD
- Cinematic Jarvis-style canvas animation
- Blue segmented rings with rotating scan effects
- Status indicators change based on mission state
- Orange accent arcs (always visible)
- Real-time data callouts (STATUS, MODEL, UPTIME, CORE)

### Mission Tracking
- **Elapsed Timer**: Live countdown since mission start
- **Next Update Timer**: 15-second auto-refresh countdown
- **Model Badge**: Shows current AI model (HAIKU/SONNET/OPUS)
- **Progress Counter**: Tasks completed / total tasks

### Resource Monitoring
- **Token Usage**: Per-model token counts (formatted as K/M)
- **Cost Tracking**: Real-time spend tracking per model
- **Uptime**: System operational status

### Task Management
- **Completed Tasks**: Green checkmarks with model badges
- **Upcoming Tasks**: Priority-tagged (HIGH/MED/LOW)
- **Activity Log**: Timestamped events (done/switch/start/wait/error)

## Status Data Format

The dashboard reads from `status.json`:

```json
{
  "missionActive": true,
  "missionName": "Chess Opening Trainer",
  "missionUrl": "https://cryptopilot16.github.io/chess-openings/",
  "startTime": "2026-01-29T02:44:00Z",
  "currentModel": "SONNET",
  "currentModelFull": "claude-sonnet-4-5",
  "models": {
    "haiku": { "tokens": 62000, "cost": 0.26 },
    "sonnet": { "tokens": 132000, "cost": 2.38 },
    "opus": { "tokens": 0, "cost": 0.00 }
  },
  "tasks": {
    "completed": [
      { "name": "Phase 1: UI Polish", "model": "SONNET" }
    ],
    "upcoming": [
      { "name": "Phase 6: Testing", "priority": "HIGH" }
    ]
  },
  "log": [
    { "time": "08:07", "type": "start", "msg": "Mission RESUMED" }
  ]
}
```

## Update Workflow

Status updates are automatic throughout the mission:

1. **Mission Start**: Initialize status.json with mission details
2. **Task Completion**: Move task from upcoming → completed
3. **Model Switch**: Log switch event with reason
4. **Periodic Updates**: Every 10-15 minutes during long work
5. **Mission End**: Set `missionActive: false`, clear data

## Integration

The Chess Opening Trainer project integrates with the monitoring dashboard through:

- **Live URL**: Linked in status.json `missionUrl` field
- **Progress Tracking**: Each phase completion logged
- **Model Switches**: Haiku ↔ Sonnet switches documented
- **Cost Monitoring**: Token usage tracked per model

## Mobile Support

The dashboard is optimized for mobile viewing:
- PWA-capable (add to home screen)
- Responsive max-width: 420px
- Touch-friendly UI elements
- Apple-specific meta tags for iOS

## Local Development

Status dashboard files:
```
/home/clawdbot/workspace/clawdbot-status/
├── index.html      # Dashboard UI
└── status.json     # Mission data
```

Update and deploy:
```bash
cd /home/clawdbot/workspace/clawdbot-status
# Edit status.json
git add status.json
git commit -m "Update mission status"
git push origin gh-pages
```

Changes go live on GitHub Pages within 30-60 seconds.

## Status Update Examples

### Mission Start
```json
{
  "missionActive": true,
  "missionName": "Chess Opening Trainer",
  "startTime": "2026-01-29T02:44:00Z",
  "log": [
    { "time": "02:44", "type": "start", "msg": "Mission initiated" }
  ]
}
```

### Task Complete
```json
{
  "tasks": {
    "completed": [
      { "name": "Phase 1: UI Polish", "model": "SONNET" }
    ]
  },
  "log": [
    { "time": "04:53", "type": "done", "model": "SONNET", "msg": "UI animations complete" }
  ]
}
```

### Model Switch
```json
{
  "currentModel": "SONNET",
  "log": [
    { "time": "06:52", "type": "switch", "msg": "HAIKU → SONNET (Complex canvas animation)" }
  ]
}
```

### Mission Pause
```json
{
  "missionActive": true,
  "missionName": "Chess Opening Trainer - PAUSED",
  "log": [
    { "time": "07:46", "type": "wait", "msg": "Mission PAUSED" }
  ]
}
```

### Mission Complete
```json
{
  "missionActive": false,
  "missionName": "",
  "startTime": null,
  "log": [
    { "time": "09:30", "type": "done", "msg": "Mission complete - all tasks finished" }
  ]
}
```

## Architecture

- **Frontend**: Pure HTML/CSS/JS (no framework)
- **Storage**: Git-backed JSON file
- **Hosting**: GitHub Pages
- **Refresh**: Client-side polling (15s interval)
- **Graphics**: HTML5 Canvas with RequestAnimationFrame
- **Fonts**: Google Fonts (Michroma, Share Tech, Rajdhani)

---

**Last Updated:** 2026-01-29  
**Dashboard Version:** 1.0  
**Mission:** Chess Opening Trainer
