const splitPoint = 60;
const cooldownMs = 500;
const eventHistory = [];
let lastTriggerTime = 0;

const indicatorEl = document.getElementById('indicator');
const statusTextEl = document.getElementById('status-text');
const midiDeviceEl = document.getElementById('midi-device');
const noteValueEl = document.getElementById('note-value');
const velocityValueEl = document.getElementById('velocity-value');
const historyListEl = document.getElementById('event-history');
const midiStateEl = document.getElementById('midi-state');

function setIndicator(state) {
  indicatorEl.classList.remove('idle', 'approve', 'reject');

  if (state === 'APPROVE') {
    indicatorEl.classList.add('approve');
    statusTextEl.textContent = 'APPROVE';
  } else if (state === 'REJECT') {
    indicatorEl.classList.add('reject');
    statusTextEl.textContent = 'REJECT';
  } else {
    indicatorEl.classList.add('idle');
    statusTextEl.textContent = 'IDLE';
  }
}

function renderHistory() {
  historyListEl.innerHTML = '';

  eventHistory.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.time} | ${item.device} | note ${item.note} | vel ${item.velocity} | ${item.decision}`;
    historyListEl.appendChild(li);
  });
}

function addHistory(device, note, velocity, decision) {
  const now = new Date();
  const timestamp = now.toLocaleTimeString();

  eventHistory.unshift({
    time: timestamp,
    device,
    note,
    velocity,
    decision
  });

  if (eventHistory.length > 10) {
    eventHistory.length = 10;
  }

  renderHistory();
}

function handleMidiMessage(message, deviceName) {
  const [status, note, velocity] = message.data;

  const command = status & 0xf0;
  if (command !== 0x90 || velocity === 0) {
    return;
  }

  const now = Date.now();
  if (now - lastTriggerTime < cooldownMs) {
    return;
  }

  lastTriggerTime = now;

  const decision = note < splitPoint ? 'REJECT' : 'APPROVE';
  const confidence = velocity / 127;

  midiDeviceEl.textContent = deviceName;
  noteValueEl.textContent = String(note);
  velocityValueEl.textContent = String(velocity);
  setIndicator(decision);
  addHistory(deviceName, note, velocity, decision);

  if (window.api && typeof window.api.sendApprovalEvent === 'function') {
    window.api.sendApprovalEvent(decision, confidence);
  }
}

function attachInputs(midiAccess) {
  if (!midiAccess.inputs || midiAccess.inputs.size === 0) {
    midiStateEl.textContent = 'No MIDI inputs detected.';
    return;
  }

  midiStateEl.textContent = 'MIDI ready. Listening for NOTE ON events...';

  midiAccess.inputs.forEach((input) => {
    input.onmidimessage = (message) => {
      handleMidiMessage(message, input.name || 'Unknown Device');
    };
  });
}

function initializeMIDI() {
  if (!navigator.requestMIDIAccess) {
    midiStateEl.textContent = 'Web MIDI API not supported in this environment.';
    return;
  }

  navigator.requestMIDIAccess()
    .then((midiAccess) => {
      attachInputs(midiAccess);

      midiAccess.onstatechange = () => {
        attachInputs(midiAccess);
      };
    })
    .catch((error) => {
      midiStateEl.textContent = `Failed to access MIDI devices: ${error.message}`;
    });
}

setIndicator('IDLE');
initializeMIDI();
