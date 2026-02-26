# MIDI-Approval-Controller

MIDI-Approval-Controller is an Electron desktop app that converts MIDI keyboard NOTE ON input into approval decisions.

- Notes below 60 trigger **REJECT**
- Notes 60 and above trigger **APPROVE**

## Install

```bash
npm install
```

## Run

```bash
npm start
```

## GitHub Instructions

```bash
git init
git add .
git commit -m "initial release"
```

## Features

- Web MIDI API device detection
- NOTE ON handling with velocity zero ignored
- 500ms cooldown to prevent duplicate triggers
- Dark themed UI with large status indicator
- Displays MIDI device, note number, velocity, and last 10 events
- IPC from renderer to main via `approval-event`
