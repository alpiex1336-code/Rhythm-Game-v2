import { BasicPitch, addPitchBendsToNoteEvents, noteFramesToTime, outputToNotesPoly } from "@spotify/basic-pitch";

const CUSTOM_SONGS_KEY = "rhythm_drop_custom_songs";

let SONGS = [
  { id: "twinkle", title: "Twinkle Twinkle", artist: "Traditional (Builtin)", url: null, stars: 1, bpm: 96, startAt: 0, endAt: 42, baseTravelTime: 3.5, maxNotesPerSecond: 2, densityScale: 0.42, holdChanceBase: 0.02, chordChanceScale: 0.03 },
  { id: "mary", title: "Mary Had a Little Lamb", artist: "Traditional (Builtin)", url: null, stars: 2, bpm: 102, startAt: 0, endAt: 52, baseTravelTime: 3.2, maxNotesPerSecond: 2, densityScale: 0.52, holdChanceBase: 0.03, chordChanceScale: 0.06 },
  { id: "odejoy", title: "Ode to Joy", artist: "Beethoven (Builtin)", url: null, stars: 3, bpm: 112, startAt: 0, endAt: 48, baseTravelTime: 2.8, maxNotesPerSecond: 2, densityScale: 0.66, holdChanceBase: 0.045, chordChanceScale: 0.1, speedProfile: [{ from: 0, to: 12, multiplier: 0.9 }, { from: 12, to: 24, multiplier: 1.1 }, { from: 24, to: 36, multiplier: 0.95 }, { from: 36, to: 48, multiplier: 1.05 }] },
  { id: "furintro", title: "Fur Elise", artist: "Beethoven (Builtin)", url: null, stars: 4, bpm: 118, startAt: 0, endAt: 58, maxNotesPerSecond: 2, densityScale: 0.78, holdChanceBase: 0.06, chordChanceScale: 0.16, speedProfile: [{ from: 0, to: 14, multiplier: 0.92 }, { from: 14, to: 28, multiplier: 1.0 }, { from: 28, to: 44, multiplier: 0.94 }, { from: 44, to: 58, multiplier: 1.08 }] },
  { id: "cancan", title: "Can-Can", artist: "Offenbach (Builtin)", url: null, stars: 5, bpm: 132, startAt: 0, endAt: 48, maxNotesPerSecond: 2, densityScale: 0.92, holdChanceBase: 0.085, chordChanceScale: 0.24, speedProfile: [{ from: 0, to: 10, multiplier: 0.92 }, { from: 10, to: 22, multiplier: 1.06 }, { from: 22, to: 36, multiplier: 0.95 }, { from: 36, to: 48, multiplier: 1.08 }] }
];

function loadCustomSongs() {
  try {
    const raw = localStorage.getItem(CUSTOM_SONGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomSongs(songs) {
  try {
    localStorage.setItem(CUSTOM_SONGS_KEY, JSON.stringify(songs));
  } catch {
    // ignore
  }
}

function getAllSongs() {
  return [...SONGS, ...loadCustomSongs()];
}

function isBuiltinSong(id) {
  return SONGS.some((s) => s.id === id);
}

function getBestScoreForSong(songId) {
  if (!songId) return 0;
  try {
    return Number(localStorage.getItem(`rhythm_drop_best_${songId}`)) || 0;
  } catch {
    return 0;
  }
}

function updateHomeBestScore() {
  const id = elements.songSelect?.value;
  const el = elements.homeBestScore;
  if (el) el.textContent = String(getBestScoreForSong(id));
}

function updateHudBestScore() {
  const id = state.song?.id;
  const el = elements.hudBestScore;
  if (el) el.textContent = String(getBestScoreForSong(id));
}

const DIRECTION_META = [
  { lane: 0, key: "ArrowLeft", keys: ["ArrowLeft", "g", "G"], symbol: "←", cls: "left" },
  { lane: 1, key: "ArrowUp", keys: ["ArrowUp", "h", "H"], symbol: "↑", cls: "up" },
  { lane: 2, key: "ArrowRight", keys: ["ArrowRight", "j", "J"], symbol: "→", cls: "right" },
  { lane: 3, key: "ArrowDown", keys: ["ArrowDown", "k", "K"], symbol: "↓", cls: "down" }
];

const elements = {
  app: document.querySelector(".app"),
  homeScreen: document.getElementById("homeScreen"),
  gameScreen: document.getElementById("gameScreen"),
  resultModal: document.getElementById("resultModal"),
  songSelect: document.getElementById("songSelect"),
  startBtn: document.getElementById("startBtn"),
  randomSongBtn: document.getElementById("randomSongBtn"),
  homeStatus: document.getElementById("homeStatus"),
  fxVolume: document.getElementById("fxVolume"),
  latencyOffset: document.getElementById("latencyOffset"),
  latencyValue: document.getElementById("latencyValue"),
  retryBtn: document.getElementById("retryBtn"),
  homeBtn: document.getElementById("homeBtn"),
  backHomeBtn: document.getElementById("backHomeBtn"),
  notesLayer: document.getElementById("notesLayer"),
  playfield: document.getElementById("playfield"),
  detectZone: document.getElementById("detectZone"),
  currentSongName: document.getElementById("currentSongName"),
  scoreValue: document.getElementById("scoreValue"),
  successValue: document.getElementById("successValue"),
  comboValue: document.getElementById("comboValue"),
  comboCell: document.getElementById("comboCell"),
  escResumeHint: document.getElementById("escResumeHint"),
  maxComboHint: document.getElementById("maxComboHint"),
  progressBar: document.getElementById("progressBar"),
  countdownOverlay: document.getElementById("countdownOverlay"),
  comboMilestoneOverlay: document.getElementById("comboMilestoneOverlay"),
  judgementCenterOverlay: document.getElementById("judgementCenterOverlay"),
  pauseOverlay: document.getElementById("pauseOverlay"),
  judgementText: document.getElementById("judgementText"),
  finalScore: document.getElementById("finalScore"),
  finalPercent: document.getElementById("finalPercent"),
  finalGrade: document.getElementById("finalGrade"),
  bestScore: document.getElementById("bestScore"),
  hudBestScore: document.getElementById("hudBestScore"),
  homeBestScore: document.getElementById("homeBestScore"),
  gradeBreakdown: document.getElementById("gradeBreakdown"),
  lanes: Array.from(document.querySelectorAll(".lane")),
  importMidiBtn: document.getElementById("importMidiBtn"),
  importMidiInput: document.getElementById("importMidiInput"),
  importMp3Btn: document.getElementById("importMp3Btn"),
  importMp3Input: document.getElementById("importMp3Input"),
  deleteSongBtn: document.getElementById("deleteSongBtn"),
  howToPlayToggle: document.getElementById("howToPlayToggle"),
  howToPlayContent: document.getElementById("howToPlayContent")
};

const HOLD_HEAD_HEIGHT = 52;
const HOLD_RELEASE_GRACE = 0.14;
const HOLD_MAX_POINTS = 260;
const MAX_CONCURRENT_REQUIRED_KEYS = 2;
const BGM_BASE_VOLUME = 0.46;
const PATTERN_VERSION = "v28";
const GRADE_RULES = [
  { name: "PERFECT", min: 0.94, points: 120, color: "#95ffce", success: true },
  { name: "GREAT", min: 0.70, points: 90, color: "#8cd3ff", success: true },
  { name: "GOOD", min: 0.48, points: 60, color: "#ffe38c", success: true },
  { name: "BAD", min: 0.2, points: 25, color: "#ffb88a", success: true },
  { name: "MISS", min: 0, points: 0, color: "#ff7f9c", success: false }
];

const state = {
  song: null,
  notes: [],
  noteMapByLane: [[], [], [], []],
  isPlaying: false,
  score: 0,
  combo: 0,
  successHits: 0,
  successfulNotes: 0,
  totalJudgedNotes: 0,
  chartEndTime: 0,
  zoneTopY: 0,
  zoneBottomY: 0,
  pressedLanes: new Set(),
  justPressedLanes: new Set(),
  /** Lanes we've already processed a keydown for since last keyup. Prevents bounce double-hit. */
  processedLanesThisPress: new Set(),
  /** Last time we processed each lane (ms). Cooldown prevents rapid double-fire. */
  lastProcessedLaneAt: [0, 0, 0, 0],
  lastSongTime: 0,
  animationHandle: null,
  audioContext: null,
  audioBuffer: null,
  audioPool: [],
  songStartContextTime: 0,
  songStartPerfNow: 0,
  isPreparing: false,
  preloadStarted: false,
  phase: "idle",
  startToken: 0,
  audioUnlockPromise: null,
  audioUnlocked: false,
  bootstrapReady: false,
  bootstrapPromise: null,
  bgmAudio: null,
  bgmSource: null,
  bgmGain: null,
  bgmStarted: false,
  bgmStartAtSongTime: 0,
  bgmStartTimer: null,
  bgmPreparedSongId: null,
  songStartAtEffective: 0,
  chartLeadIn: 0,
  levelProfile: null,
  comboShieldReady: false,
  songKeyIndex: 0,
  maxCombo: 0,
  lastAccentAt: -999,
  outputLatencySec: 0,
  manualLatencySec: 0,
  adaptiveLatencySec: 0,
  adaptiveLatencySamples: 0,
  songAnalysis: null,
  songScore: null,
  bgmSynthNodes: [],
  lastTapHitLane: -1,
  lastTapHitTime: -999,
  countdownEndPerf: 0,
  lastComboMilestone: 0,
  pausedAtSongTime: -1,
  pauseCooldownUntil: 0,
  comboMilestoneTimeout: null
};

function getLevelProfile(stars) {
  const profiles = {
    1: {
      name: "Chill Bloom",
      judgeBias: 0.09,
      scoreMult: 0.95,
      comboShieldEvery: 8,
      streakBonusEvery: 0,
      streakBonusPoints: 0,
      holdGraceMult: 1.2,
      fxPitch: 420
    },
    2: {
      name: "Neon Flow",
      judgeBias: 0.05,
      scoreMult: 1,
      comboShieldEvery: 12,
      streakBonusEvery: 0,
      streakBonusPoints: 0,
      holdGraceMult: 1.1,
      fxPitch: 480
    },
    3: {
      name: "Pulse Shift",
      judgeBias: 0.01,
      scoreMult: 1.05,
      comboShieldEvery: 0,
      streakBonusEvery: 10,
      streakBonusPoints: 80,
      holdGraceMult: 1,
      fxPitch: 540
    },
    4: {
      name: "Voltage Storm",
      judgeBias: -0.02,
      scoreMult: 1.12,
      comboShieldEvery: 0,
      streakBonusEvery: 8,
      streakBonusPoints: 130,
      holdGraceMult: 0.9,
      fxPitch: 610
    },
    5: {
      name: "Chaos Rave",
      judgeBias: -0.05,
      scoreMult: 1.22,
      comboShieldEvery: 0,
      streakBonusEvery: 6,
      streakBonusPoints: 180,
      holdGraceMult: 0.8,
      fxPitch: 700
    }
  };
  return profiles[clamp(stars, 1, 5)] || profiles[3];
}

function getChartBalance(stars) {
  const table = {
    1: { densityMul: 0.52, holdMul: 0.35, chordMul: 0.08, perSecondMul: 0.45, minEventsRate: 0.23, minHoldRatio: 0.01 },
    2: { densityMul: 0.72, holdMul: 0.58, chordMul: 0.3, perSecondMul: 0.72, minEventsRate: 0.33, minHoldRatio: 0.03 },
    3: { densityMul: 0.95, holdMul: 0.9, chordMul: 0.74, perSecondMul: 0.92, minEventsRate: 0.44, minHoldRatio: 0.05 },
    4: { densityMul: 1.18, holdMul: 1.25, chordMul: 1.15, perSecondMul: 1.0, minEventsRate: 0.56, minHoldRatio: 0.08 },
    5: { densityMul: 1.38, holdMul: 1.65, chordMul: 1.5, perSecondMul: 1.0, minEventsRate: 0.68, minHoldRatio: 0.11 }
  };
  return table[clamp(stars, 1, 5)] || table[3];
}

function getChartFlow(stars) {
  const table = {
    1: { maxGapSec: 1.35, minGapSec: 0.56, maxConcurrent: 1, perSecondCap: 1 },
    2: { maxGapSec: 1.05, minGapSec: 0.42, maxConcurrent: 1, perSecondCap: 1 },
    3: { maxGapSec: 0.82, minGapSec: 0.3, maxConcurrent: 2, perSecondCap: 2 },
    4: { maxGapSec: 0.62, minGapSec: 0.22, maxConcurrent: 2, perSecondCap: 2 },
    5: { maxGapSec: 0.46, minGapSec: 0.14, maxConcurrent: 2, perSecondCap: 2 }
  };
  return table[clamp(stars, 1, 5)] || table[3];
}

const preparedSongs = new Map();

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parseMidiToScore(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer);
  let pos = 0;
  function readU8() { return data[pos++] ?? 0; }
  function readU16() { const a = readU8(), b = readU8(); return (a << 8) | b; }
  function readU32() { const a = readU16(), b = readU16(); return (a << 16) | b; }
  function readVarLen() {
    let v = 0;
    let b;
    do {
      b = readU8();
      v = (v << 7) | (b & 0x7f);
    } while (b & 0x80);
    return v;
  }
  const header = String.fromCharCode(readU8(), readU8(), readU8(), readU8());
  if (header !== "MThd") return null;
  readU32();
  const format = readU16();
  const trackCount = readU16();
  const division = readU16();
  const ticksPerQuarter = (division & 0x8000) ? 384 : division;
  if (ticksPerQuarter <= 0) return null;
  const events = [];
  let globalTempo = 500000;
  for (let tr = 0; tr < trackCount; tr++) {
    const chunkType = String.fromCharCode(readU8(), readU8(), readU8(), readU8());
    const chunkLen = readU32();
    const end = pos + chunkLen;
    let absTicks = 0;
    let runningStatus = 0;
    let tempo = globalTempo;
    while (pos < end) {
      const delta = readVarLen();
      absTicks += delta;
      let status = readU8();
      if (status < 0x80) {
        pos -= 1;
        status = runningStatus;
      } else {
        runningStatus = status;
      }
      const hi = status >> 4;
      const ch = status & 0x0f;
      if (hi === 0x09) {
        const note = readU8();
        const vel = readU8();
        events.push({ tick: absTicks, type: vel > 0 ? "on" : "off", note, ch });
      } else if (hi === 0x08) {
        const note = readU8();
        readU8();
        events.push({ tick: absTicks, type: "off", note, ch });
      } else if (status === 0xff) {
        const meta = readU8();
        const len = readU8();
        if (meta === 0x51 && len === 3) {
          tempo = (readU8() << 16) | (readU8() << 8) | readU8();
          events.push({ tick: absTicks, type: "tempo", tempo });
        } else {
          pos += len;
        }
      } else if (hi >= 0x0a && hi <= 0x0e) {
        readU8();
        if (hi !== 0x0c && hi !== 0x0d) readU8();
      } else if (hi === 0x0f) {
        const len = readU8();
        pos += len;
      } else {
        readU8();
        readU8();
      }
    }
  }
  events.sort((a, b) => a.tick - b.tick);
  const tempoAtTick = new Map([[0, 500000]]);
  for (const e of events) {
    if (e.type === "tempo") tempoAtTick.set(e.tick, e.tempo);
  }
  const tempoTicks = [...tempoAtTick.entries()].sort((a, b) => a[0] - b[0]);
  function tickToSec(tick) {
    let sec = 0;
    let lastTick = 0;
    let tempo = 500000;
    for (let i = 0; i < tempoTicks.length; i++) {
      const [t, tp] = tempoTicks[i];
      if (t > tick) break;
      sec += (t - lastTick) * tempo / 1000000 / ticksPerQuarter;
      lastTick = t;
      tempo = tp;
    }
    return sec + (tick - lastTick) * tempo / 1000000 / ticksPerQuarter;
  }
  const noteEvents = events.filter((e) => e.type === "on" || e.type === "off");
  const activeByKey = (ch, n) => `${ch}:${n}`;
  const active = new Map();
  const allNotes = [];
  for (const e of noteEvents) {
    const key = activeByKey(e.ch, e.note);
    if (e.type === "on") {
      active.set(key, { startTicks: e.tick });
    } else {
      const on = active.get(key);
      if (on && e.note >= 21 && e.note <= 108) {
        const startSec = tickToSec(on.startTicks);
        const endSec = tickToSec(e.tick);
        const d = Math.max(0.05, endSec - startSec);
        if (d >= 0.03) {
          allNotes.push({ t: startSec, d, midi: e.note });
        }
      }
      active.delete(key);
    }
  }
  const score = allNotes.sort((a, b) => a.t - b.t);
  if (score.length < 4) return null;
  const duration = Math.max(0, ...score.map((n) => n.t + n.d));
  const avgBpm = tempoTicks.length > 0
    ? Math.round(60000000 / tempoTicks[0][1])
    : Math.round(60 / (duration / Math.max(1, score.length)) * 2);
  return { score, duration, bpm: clamp(avgBpm, 60, 200) };
}

function computeDifficulty(song, pattern) {
  const events = pattern.events || [];
  const duration = Math.max(1, song.endAt - song.startAt);
  const notesPerSecond = events.length / duration;
  const holdRatio = events.filter((e) => e.type === "hold").length / Math.max(1, events.length);
  const chordRatio = events.filter((e) => e.poly > 0).length / Math.max(1, events.length);
  const speedVariance = song.speedProfile?.length ? 0.7 : 0.3;

  const score =
    (song.bpm / 180) * 0.34 +
    clamp(notesPerSecond / 2.2, 0, 1) * 0.3 +
    clamp(holdRatio / 0.35, 0, 1) * 0.18 +
    clamp(chordRatio / 0.2, 0, 1) * 0.1 +
    speedVariance * 0.08;
  return clamp(Math.round(score * 5), 1, 5);
}

function getInitialVolume() {
  const stored = Number(localStorage.getItem("rhythm_drop_fx_volume"));
  if (Number.isFinite(stored) && stored >= 0 && stored <= 1) {
    return stored;
  }
  return 0.9;
}

function getInitialLatencyMs() {
  const stored = Number(localStorage.getItem("rhythm_drop_latency_ms"));
  if (Number.isFinite(stored)) {
    return clamp(stored, -180, 280);
  }
  return 0;
}

function getContextOutputLatencySec(ctx) {
  if (!ctx) {
    return 0;
  }
  const a = Number(ctx.outputLatency);
  const b = Number(ctx.baseLatency);
  const sec = [a, b].find((v) => Number.isFinite(v) && v >= 0) ?? 0;
  return clamp(sec, 0, 0.24);
}

state.fxVolume = getInitialVolume();
state.manualLatencySec = getInitialLatencyMs() / 1000;
state.gradeCounts = { perfect: 0, great: 0, good: 0, bad: 0, miss: 0 };

function hashSeed(value) {
  let hash = 2166136261;
  const text = String(value);
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

function makeRandom(seedValue) {
  let seed = hashSeed(seedValue) || 1;
  return function rand() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return ((seed >>> 0) % 10000) / 10000;
  };
}

function midiToFrequency(midi) {
  return 440 * (2 ** ((midi - 69) / 12));
}

function oneHotChroma(midi) {
  const chroma = new Array(12).fill(0);
  chroma[((midi % 12) + 12) % 12] = 1;
  return chroma;
}

function buildScoreFromBeats(bpm, sequence) {
  const beatSec = 60 / bpm;
  const score = [];
  let cursor = 0;
  for (const [midi, beats] of sequence) {
    const dur = Math.max(0.08, beats * beatSec);
    if (midi !== null) {
      score.push({ t: cursor, d: dur, midi });
    }
    cursor += dur;
  }
  return { score, duration: cursor };
}

function expandBuiltinScore(song, phrases, options = {}) {
  const phraseList = Array.isArray(phrases) && phrases.length > 0 ? phrases : [];
  if (phraseList.length === 0) return [];
  const fullMelodyDuration = phraseList.reduce((sum, p) => sum + p.duration, 0);
  const playOnce = options.playOnce ?? (fullMelodyDuration < 28);
  const targetDuration = playOnce
    ? fullMelodyDuration
    : Math.max(fullMelodyDuration, (song.endAt - song.startAt) - 0.2 * (60 / song.bpm));
  const expanded = [];
  let cursor = 0;
  let loop = 0;
  while (cursor < targetDuration - 0.05) {
    const phraseIndex = loop % phraseList.length;
    const { score: phraseScore, duration: phraseDuration } = phraseList[phraseIndex];
    const octaveShift = song.stars >= 4 && loop % 2 === 1 ? 12 : 0;
    if (cursor + phraseDuration > targetDuration + 0.05) break;
    for (let i = 0; i < phraseScore.length; i += 1) {
      const note = phraseScore[i];
      expanded.push({
        t: cursor + note.t,
        d: note.d,
        midi: note.midi + octaveShift
      });
    }
    cursor += phraseDuration;
    loop += 1;
  }
  return expanded.sort((a, b) => a.t - b.t);
}

function getBuiltinSongData(song) {
  // Twinkle Twinkle Little Star - C major (pianokeyboardnotes.com)
  // Full song: verse 1 + verse 2 + verse 1 (repeat)
  // Phrase 1: "Twinkle twinkle little star, How I wonder what you are"
  const twinkle1 = buildScoreFromBeats(song.bpm, [
    [60, 1], [60, 1], [67, 1], [67, 1], [69, 1], [69, 1], [67, 2],
    [65, 1], [65, 1], [64, 1], [64, 1], [62, 1], [62, 1], [60, 2]
  ]);
  // Phrase 2: "Up above the world so high, Like a diamond in the sky"
  const twinkle2 = buildScoreFromBeats(song.bpm, [
    [67, 1], [67, 1], [65, 1], [65, 1], [64, 1], [64, 1], [62, 2],
    [67, 1], [67, 1], [65, 1], [65, 1], [64, 1], [64, 1], [62, 2]
  ]);
  // Phrase 3: same as verse 1 (full song ends with verse 1)

  // Mary Had a Little Lamb - C major (from had-a-little-lamb-piano-sheet-music.midi + pianokeyboardnotes)
  // Full song: verse 1 + verse 2 + verse 3 (all three verses)
  // Verse 1: "Mary had a little lamb... fleece was white as snow"
  const mary1 = buildScoreFromBeats(song.bpm, [
    [64, 1], [62, 1], [60, 1], [62, 1], [64, 1], [64, 1], [64, 2],
    [62, 1], [62, 1], [62, 2], [64, 1], [67, 1], [67, 2],
    [64, 1], [62, 1], [60, 1], [62, 1], [64, 1], [64, 1], [64, 1], [64, 1],
    [62, 1], [62, 1], [64, 1], [62, 1], [60, 2]
  ]);
  // Verse 2: "And everywhere that Mary went... lamb was sure to go"
  const mary2 = buildScoreFromBeats(song.bpm, [
    [64, 1], [64, 1], [62, 1], [60, 1], [62, 1], [64, 1], [64, 1], [64, 2],
    [62, 1], [62, 1], [62, 2], [64, 1], [67, 1], [67, 2],
    [64, 1], [62, 1], [60, 1], [62, 1], [64, 1], [64, 1], [64, 1], [64, 1],
    [62, 1], [62, 1], [64, 1], [62, 1], [60, 2]
  ]);
  // Verse 3: "He followed her to school one day... against the rules"
  const mary3 = buildScoreFromBeats(song.bpm, [
    [64, 1], [64, 1], [62, 1], [60, 1], [62, 1], [64, 1], [64, 1], [64, 2],
    [62, 1], [62, 1], [62, 2], [64, 1], [67, 1], [67, 2],
    [64, 1], [62, 1], [60, 1], [62, 1], [64, 1], [64, 1], [64, 1], [64, 1],
    [62, 1], [62, 1], [64, 1], [62, 1], [60, 2]
  ]);

  // Ode to Joy - C major (Beethoven, from phanotes-gif-pagespeed-ic-fftfnfpfyq.midi)
  // Full melody: 4 phrases, bass notes filtered out
  // Phrase 1: "Freude, schöner Götterfunken..."
  const ode1 = buildScoreFromBeats(song.bpm, [
    [64, 1], [64, 1], [65, 1], [67, 1], [67, 1], [65, 1], [64, 1], [62, 1],
    [60, 1], [60, 1], [62, 1], [64, 1], [64, 1.5], [62, 0.5], [62, 2]
  ]);
  // Phrase 2: "Wir betreten feuertrunken..."
  const ode2 = buildScoreFromBeats(song.bpm, [
    [64, 1], [64, 1], [65, 1], [67, 1], [67, 1], [65, 1], [64, 1], [62, 1],
    [60, 1], [60, 1], [62, 1], [64, 1], [62, 1.5], [60, 0.5], [60, 2]
  ]);
  // Phrase 3: "Deine Zauber binden wieder..."
  const ode3 = buildScoreFromBeats(song.bpm, [
    [62, 1], [62, 1], [64, 1], [60, 1], [62, 1], [64, 1], [65, 1], [64, 1],
    [60, 1], [62, 1], [64, 1], [65, 1], [64, 1], [62, 1], [60, 1], [62, 2]
  ]);
  // Phrase 4: "Alle Menschen werden Brüder..."
  const ode4 = buildScoreFromBeats(song.bpm, [
    [67, 1], [67, 1], [64, 1], [64, 1], [65, 1], [67, 1], [67, 1], [65, 1],
    [64, 1], [62, 1], [60, 1], [60, 1], [62, 1], [64, 1], [62, 1.5], [60, 0.5], [60, 2]
  ]);

  // Für Elise - A minor (WoO 59, merged from score-0, score-0-2, original, IMSLP, La Touche)
  // score-0-2: correct opening (76,75,76,75,76,71,74,72) + ascending run; score-0 had wrong notes
  // Full A section: intro motif + phrases + score-0-2 middle + C section (E4-D#4-E4-D#4-E4) + return
  const fur = buildScoreFromBeats(song.bpm, [
    [76, 0.5], [75, 0.5], [76, 0.5], [75, 0.5], [76, 0.5], [71, 0.5], [74, 0.5], [72, 0.5],
    [69, 1.25], [60, 0.5], [64, 0.5], [69, 0.5], [71, 1.0], [64, 0.5], [68, 0.5], [71, 0.5], [72, 1.0],
    [76, 0.5], [75, 0.5], [76, 0.5], [75, 0.5], [76, 0.5], [71, 0.5], [74, 0.5], [72, 0.5],
    [69, 0.5], [71, 0.5], [72, 0.5], [74, 0.5], [76, 0.75], [67, 0.5], [76, 0.5], [74, 0.75],
    [65, 0.5], [76, 0.5], [74, 0.5], [72, 0.75], [64, 0.5], [74, 0.5], [72, 0.5], [71, 0.5],
    [64, 0.5], [76, 0.5], [75, 0.5], [76, 0.5], [75, 0.5], [76, 0.5], [71, 0.5], [74, 0.5], [72, 0.5],
    [64, 0.5], [63, 0.5], [64, 0.5], [63, 0.5], [64, 0.5], [71, 0.5], [74, 0.5], [72, 0.5],
    [69, 1.0], [72, 0.5], [71, 0.5], [69, 0.5], [64, 0.5], [60, 0.5], [71, 0.5], [69, 0.5], [71, 0.5], [60, 0.5], [62, 0.5], [64, 0.5],
    [67, 0.5], [65, 0.5], [64, 0.5], [62, 0.5], [65, 0.5], [64, 0.5], [62, 0.5], [60, 0.5], [64, 0.5], [62, 0.5], [60, 0.5], [71, 1.0],
    [76, 0.5], [75, 0.5], [76, 0.5], [75, 0.5], [76, 0.5], [71, 0.5], [74, 0.5], [72, 0.5],
    [69, 1.25], [60, 0.5], [64, 0.5], [69, 0.5], [71, 1.0], [64, 0.5], [68, 0.5], [71, 0.5], [72, 1.0],
    [76, 0.5], [75, 0.5], [76, 0.5], [75, 0.5], [76, 0.5], [71, 0.5], [74, 0.5], [72, 0.5],
    [69, 1.0], [72, 0.5], [71, 0.5], [69, 0.5], [60, 0.5], [71, 0.5], [69, 0.5], [71, 0.5], [69, 1.0]
  ]);

  // Can-Can - C major (Offenbach, Infernal Galop)
  // Merged from: an-can-piano-beginners-singing-bell, n-page-1-png-pagespeed-ic-1vvzb1ksme (long),
  // can-can-fixed-2020, original, Music-for-Music-Teachers, 8notes, Singing Bell
  // Full A–B–A–C–A structure; pagespeed long version = primary source (176 notes)
  const cancanA = buildScoreFromBeats(song.bpm, [
    [67, 0.5], [64, 0.5], [67, 0.5], [64, 0.5], [67, 0.5], [64, 0.5], [69, 0.5], [71, 0.5],
    [71, 0.5], [69, 0.5], [67, 0.5], [64, 0.5], [62, 0.5], [60, 0.5], [67, 1.0], [67, 1.0],
    [74, 0.5], [72, 0.5], [71, 0.5], [69, 0.5], [67, 0.5], [69, 0.5], [71, 0.5], [72, 0.5],
    [74, 0.5], [72, 0.5], [71, 0.5], [69, 0.5], [67, 1.0], [67, 1.0]
  ]);
  const cancanB = buildScoreFromBeats(song.bpm, [
    [72, 0.5], [71, 0.5], [69, 0.5], [67, 0.5], [65, 0.5], [64, 0.5], [62, 0.5], [60, 0.5],
    [67, 0.5], [69, 0.5], [71, 0.5], [72, 0.5], [74, 0.5], [72, 0.5], [71, 0.5], [69, 0.5],
    [67, 0.5], [69, 0.5], [67, 0.5], [69, 0.5], [67, 1.0], [67, 1.0]
  ]);
  const cancanC = buildScoreFromBeats(song.bpm, [
    [69, 0.5], [72, 0.5], [71, 0.5], [69, 0.5], [60, 0.5], [62, 0.5], [60, 0.5], [62, 0.5],
    [60, 0.5], [62, 0.5], [74, 1.0], [74, 1.0], [67, 0.5], [64, 0.5], [67, 0.5], [64, 0.5],
    [67, 0.5], [64, 0.5], [74, 0.5], [76, 0.5], [71, 0.5], [72, 0.5], [67, 0.5], [64, 0.5],
    [69, 0.5], [64, 0.5], [62, 0.5], [64, 0.5], [76, 0.5], [79, 0.5], [76, 0.25], [69, 0.5],
    [72, 0.5], [72, 0.5], [69, 0.5], [67, 0.5], [79, 0.5], [77, 0.5], [76, 0.5], [67, 0.5],
    [64, 0.5], [67, 0.5], [64, 0.5], [67, 0.5], [64, 0.5], [76, 0.5], [72, 0.5], [71, 0.5],
    [67, 0.5], [64, 0.5], [69, 0.5], [64, 0.5], [69, 0.5], [64, 0.5], [62, 0.5], [69, 0.5],
    [72, 0.5], [71, 0.5], [69, 0.5], [67, 1.0], [76, 0.5], [69, 0.5], [71, 0.5], [72, 0.5],
    [66, 0.5], [62, 1.0], [60, 0.5], [64, 0.5], [64, 0.5], [64, 0.5]
  ]);

  const phraseMap = {
    twinkle: [twinkle1, twinkle2, twinkle1],
    mary: [mary1, mary2, mary3],
    odejoy: [ode1, ode2, ode3, ode4],
    furintro: [fur],
    cancan: [cancanA, cancanB, cancanA, cancanC, cancanA]
  };
  const phrases = phraseMap[song.id] || [twinkle1];
  const expandedScore = expandBuiltinScore(song, phrases);
  const keyIndex = expandedScore[0] ? expandedScore[0].midi % 12 : 0;
  return {
    score: expandedScore,
    keyIndex,
    analysisTimeline: expandedScore.map((n) => ({ time: n.t, chroma: oneHotChroma(n.midi) })),
    effectiveStartAt: 0
  };
}

function getBuiltinChartProfile(stars) {
  const table = {
    1: { keepChance: 0.9, restChanceStable: 0.22, holdMul: 0.5, offbeatChance: 0, chordChanceMul: 0, syncopateChance: 0.08 },
    2: { keepChance: 0.95, restChanceStable: 0.14, holdMul: 0.72, offbeatChance: 0.1, chordChanceMul: 0.4, syncopateChance: 0.14 },
    3: { keepChance: 1, restChanceStable: 0.08, holdMul: 0.92, offbeatChance: 0.24, chordChanceMul: 0.68, syncopateChance: 0.22 },
    4: { keepChance: 1, restChanceStable: 0.06, holdMul: 1.12, offbeatChance: 0.34, chordChanceMul: 0.92, syncopateChance: 0.3 },
    5: { keepChance: 1, restChanceStable: 0.04, holdMul: 1.28, offbeatChance: 0.42, chordChanceMul: 1, syncopateChance: 0.38 }
  };
  return table[clamp(stars, 1, 5)] || table[3];
}

function buildPatternFromScore(song, score) {
  const rand = makeRandom(`${song.id}-score-pattern`);
  const beat = 60 / song.bpm;
  const profile = getBuiltinChartProfile(song.stars);
  const events = [];
  for (let i = 0; i < score.length; i += 1) {
    const note = score[i];
    const holdChance = clamp(song.holdChanceBase * profile.holdMul, 0.01, 0.32);
    const isHold = note.d >= beat * 1.35 || rand() < holdChance;
    events.push({
      t: note.t + song.startAt,
      type: isHold ? "hold" : "tap",
      d: Math.max(0.08, note.d * (isHold ? 0.88 : 0.82)),
      poly: 0,
      midi: note.midi
    });
  }
  events.sort((a, b) => a.t - b.t || (a.type === "hold" ? 0 : 1) - (b.type === "hold" ? 0 : 1));
  const HOLD_TAP_MIN_GAP = 0.08;
  const HOLD_TAP_INSERT_GAP = 0.05;
  for (let i = 1; i < events.length; i += 1) {
    const prev = events[i - 1];
    const curr = events[i];
    if (prev.type === "hold" && curr.type === "tap") {
      const gap = curr.t - (prev.t + prev.d);
      if (gap < HOLD_TAP_MIN_GAP && gap >= 0) {
        curr.t += HOLD_TAP_INSERT_GAP;
      }
    }
  }
  events.sort((a, b) => a.t - b.t);
  return { version: PATTERN_VERSION, events };
}

function getAudioContext() {
  if (!state.audioContext) {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
      return null;
    }
    state.audioContext = new AudioContextCtor();
  }
  return state.audioContext;
}

function updateZoneBounds() {
  const zoneRect = elements.detectZone.getBoundingClientRect();
  const fieldRect = elements.playfield.getBoundingClientRect();
  state.zoneTopY = zoneRect.top - fieldRect.top;
  state.zoneBottomY = state.zoneTopY + zoneRect.height;
}

function getZoneCenterY() {
  return (state.zoneTopY + state.zoneBottomY) / 2;
}

/** Progress (0..1+) at which a note's head top crosses zone bottom. Used for chase-prevention. */
function getZonePassProgress() {
  const startY = -HOLD_HEAD_HEIGHT;
  const endY = getZoneCenterY() - HOLD_HEAD_HEIGHT / 2;
  const zoneBottomY = state.zoneBottomY;
  if (zoneBottomY <= 0 || state.zoneTopY >= zoneBottomY) {
    return 1.35;
  }
  const denom = endY - startY;
  if (denom <= 0) return 1.2;
  return Math.max(1.01, (zoneBottomY - startY) / denom);
}

function getDifficultyParams(song, events) {
  const stars = clamp(song.stars || 3, 1, 5);
  const duration = events.length > 1 ? Math.max(0.1, events[events.length - 1].t - events[0].t) : 10;
  const notesPerSec = events.length / duration;
  const typicalGap = 4 / Math.max(0.5, notesPerSec);
  const minTravelTime = stars >= 5 ? clamp(typicalGap * 0.9, 1.1, 1.6) : stars >= 4 ? clamp(typicalGap * 0.92, 1.2, 1.8) : clamp(typicalGap * 0.8, 1.15, 2.6);
  const overlapBuffer = clamp(0.025 + (5 - stars) * 0.005, 0.02, 0.05);
  const baseTravelMult = stars >= 5 ? 0.65 : stars >= 4 ? 0.8 : 1.08 + (5 - stars) * 0.06;
  const densityScale = stars >= 4 ? 1.0 : 1 - clamp(notesPerSec - 2, 0, 1.5) * 0.02;
  const speedProfileFloor = 1.4 + (5 - stars) * 0.08;
  return { minTravelTime, overlapBuffer, baseTravelMult, densityScale, speedProfileFloor };
}

function getEffectiveBaseTravelTime(song) {
  const stars = clamp(song.stars || 3, 1, 5);
  let defaultBase = 3.5 + (5 - stars) * 0.1;
  if (stars >= 5) {
    defaultBase *= 0.55;
  } else if (stars >= 4) {
    defaultBase *= 0.68;
  }
  return song.baseTravelTime ?? defaultBase;
}

function getTravelTimeForNote(song, absoluteTime, params) {
  const relative = absoluteTime - song.startAt;
  const baseMult = (params?.baseTravelMult ?? 1) * (params?.densityScale ?? 1);
  let base = getEffectiveBaseTravelTime(song) * baseMult;
  const stars = clamp(song.stars || 3, 1, 5);
  if (song.speedProfile && stars <= 3) {
    const section = song.speedProfile.find((item) => relative >= item.from && relative < item.to);
    const mult = section?.multiplier || 1;
    const variationStrength = Math.max(0.4, 0.85 - stars * 0.1);
    const effectiveMult = 1 + (mult - 1) * variationStrength;
    base = Math.max(params?.speedProfileFloor ?? 1.4, base / effectiveMult);
  }
  const minT = params?.minTravelTime ?? 1.2;
  return Math.max(minT, Math.min(5.0, base));
}

function getLocalNoteDensity(events, time, windowSec = 0.7) {
  const lo = time - windowSec;
  const hi = time + windowSec;
  return events.filter((ev) => ev.t >= lo && ev.t <= hi).length;
}

function getPatternStorageKey(song) {
  return `rhythm_drop_pattern_${PATTERN_VERSION}_${song.id}`;
}

async function analyzeSongEnergy(song, audioBuffer) {
  const beat = 60 / song.bpm;
  const step = song.stars >= 4 ? beat / 4 : beat / 2;
  const sampleRate = audioBuffer.sampleRate;
  const channels = Math.min(2, audioBuffer.numberOfChannels);
  const channelData = [];
  for (let i = 0; i < channels; i += 1) {
    channelData.push(audioBuffer.getChannelData(i));
  }

  const points = [];
  for (let t = song.startAt; t < song.endAt; t += step) {
    const start = Math.max(0, Math.floor((t - 0.03) * sampleRate));
    const end = Math.min(audioBuffer.length, Math.floor((t + 0.09) * sampleRate));
    let sum = 0;
    let count = 0;
    for (let i = start; i < end; i += 1) {
      let mixed = 0;
      for (let c = 0; c < channels; c += 1) {
        mixed += channelData[c][i];
      }
      mixed /= channels;
      sum += mixed * mixed;
      count += 1;
    }
    points.push({ time: t, energy: Math.sqrt(sum / Math.max(1, count)) });
  }

  const sorted = points.map((p) => p.energy).sort((a, b) => a - b);
  const maxEnergy = sorted[sorted.length - 1] || 1;
  const base = sorted[Math.floor(sorted.length * 0.6)] || maxEnergy * 0.5;
  const normalized = points.map((p) => ({
    time: p.time,
    energy: p.energy,
    norm: Math.max(0, Math.min(1, (p.energy - base * 0.55) / Math.max(0.0001, maxEnergy - base * 0.45))),
    step
  }));

  // Smooth local jitter to better represent "melody present" regions.
  const smoothed = normalized.map((point, idx) => {
    const a = normalized[Math.max(0, idx - 1)]?.norm ?? point.norm;
    const b = point.norm;
    const c = normalized[Math.min(normalized.length - 1, idx + 1)]?.norm ?? point.norm;
    return { ...point, smooth: (a + b + c) / 3 };
  });
  return smoothed;
}

function normalizeSeries(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0] ?? 0;
  const max = sorted[sorted.length - 1] ?? 1;
  const range = Math.max(1e-6, max - min);
  return values.map((v) => (v - min) / range);
}

function estimateKeyFromChroma(chromaFrames) {
  if (!chromaFrames.length) {
    return 0;
  }
  const acc = new Array(12).fill(0);
  for (const frame of chromaFrames) {
    for (let i = 0; i < 12; i += 1) {
      acc[i] += frame[i] || 0;
    }
  }
  let bestIndex = 0;
  let bestVal = -Infinity;
  for (let i = 0; i < 12; i += 1) {
    if (acc[i] > bestVal) {
      bestVal = acc[i];
      bestIndex = i;
    }
  }
  return bestIndex;
}

function detectEffectiveSongStart(song, analysis) {
  const points = analysis.filter((p) => p.time >= song.startAt && p.time <= song.endAt);
  if (points.length === 0) {
    return song.startAt;
  }
  const candidate = points.find((p) => (p.fluxNorm ?? p.norm) > 0.6 && p.smooth > 0.24);
  if (!candidate) {
    return song.startAt;
  }
  return clamp(candidate.time - 0.03, Math.max(0, song.startAt - 0.2), song.startAt + 0.24);
}

function analyzeSongWithMeyda(song, audioBuffer) {
  if (typeof Meyda === "undefined" || !Meyda?.extract) {
    return null;
  }
  const channels = Math.min(2, audioBuffer.numberOfChannels);
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;
  const mono = new Float32Array(length);
  for (let c = 0; c < channels; c += 1) {
    const data = audioBuffer.getChannelData(c);
    for (let i = 0; i < length; i += 1) {
      mono[i] += data[i] / channels;
    }
  }

  const frameSize = 2048;
  const hopSize = 1024;
  const startSample = Math.max(0, Math.floor(song.startAt * sampleRate));
  const endSample = Math.min(length - frameSize, Math.floor(song.endAt * sampleRate));
  const points = [];
  const chromaFrames = [];
  const chromaTimeline = [];
  let prevFrame = null;
  for (let idx = startSample; idx <= endSample; idx += hopSize) {
    const frame = mono.subarray(idx, idx + frameSize);
    const features = Meyda.extract(["rms", "spectralFlux", "chroma"], frame, prevFrame);
    prevFrame = frame;
    if (!features) {
      continue;
    }
    const time = idx / sampleRate;
    const rms = Number(features.rms) || 0;
    const spectralFlux = Number(features.spectralFlux) || 0;
    const chroma = Array.isArray(features.chroma) ? features.chroma : new Array(12).fill(0);
    chromaFrames.push(chroma);
    chromaTimeline.push({ time, chroma });
    points.push({ time, rms, spectralFlux });
  }
  if (points.length < 16) {
    return null;
  }
  const normRms = normalizeSeries(points.map((p) => p.rms));
  const normFlux = normalizeSeries(points.map((p) => p.spectralFlux));
  const step = hopSize / sampleRate;
  const enriched = points.map((p, i) => {
    const norm = clamp(normRms[i] * 0.55 + normFlux[i] * 0.45, 0, 1);
    return {
      time: p.time,
      energy: p.rms,
      norm,
      fluxNorm: normFlux[i],
      step
    };
  });
  const smoothed = enriched.map((point, i) => {
    const a = enriched[Math.max(0, i - 1)]?.norm ?? point.norm;
    const b = point.norm;
    const c = enriched[Math.min(enriched.length - 1, i + 1)]?.norm ?? point.norm;
    return { ...point, smooth: (a + b + c) / 3 };
  });
  return { analysis: smoothed, keyIndex: estimateKeyFromChroma(chromaFrames), chromaTimeline, source: "meyda" };
}

function generateSongPattern(song, analysis) {
  const rand = makeRandom(`${song.id}-fixed-pattern`);
  const balance = getChartBalance(song.stars);
  const flow = getChartFlow(song.stars);
  const step = analysis[0]?.step || (60 / song.bpm) / 2;
  const events = [];
  const densityFactor = clamp(song.densityScale * balance.densityMul, 0.2, 1.25);
  const onsetDelta = clamp(0.08 + (1 - densityFactor) * 0.11, 0.06, 0.2);
  const rhythmicThreshold = clamp(0.28 + (1 - densityFactor) * 0.18, 0.24, 0.48);
  const localMinGap = flow.minGapSec;
  let lastEventAt = -999;
  for (let i = 0; i < analysis.length; i += 1) {
    const p = analysis[i];
    const prev = analysis[i - 1];
    const next = analysis[i + 1];
    const flux = p.fluxNorm ?? p.norm;
    let localFluxAvg = 0;
    let localCount = 0;
    for (let j = Math.max(0, i - 8); j <= Math.min(analysis.length - 1, i + 8); j += 1) {
      localFluxAvg += analysis[j].fluxNorm ?? analysis[j].norm;
      localCount += 1;
    }
    localFluxAvg /= Math.max(1, localCount);
    const adaptiveFluxPass = flux >= (localFluxAvg + onsetDelta);
    const isPeak = (!prev || p.smooth >= prev.smooth) && (!next || p.smooth >= next.smooth);
    const rhythmicPoint = p.smooth >= rhythmicThreshold && adaptiveFluxPass;
    if (!isPeak || !rhythmicPoint) {
      continue;
    }
    if (p.time - lastEventAt < localMinGap) {
      continue;
    }
    const lookahead = analysis.slice(i + 1, i + 7);
    const sustainScore = lookahead.filter((x) => x.smooth >= rhythmicThreshold * 0.9).length;
    const holdChance = clamp(song.holdChanceBase * balance.holdMul + sustainScore * 0.04, 0.02, 0.45);
    const shouldHold = rand() < holdChance && sustainScore >= 2;
    const holdDur = clamp(step * (2 + sustainScore), step * 1.5, step * 4.5);
    events.push({
      t: p.time,
      type: shouldHold ? "hold" : "tap",
      d: shouldHold ? holdDur : Math.max(0.08, step * 0.9),
      poly: 0
    });
    if (song.stars >= 3 && flux > 0.72 && rand() < song.chordChanceScale * balance.chordMul * 0.45) {
      events.push({
        t: p.time,
        type: "tap",
        d: Math.max(0.08, step * 0.82),
        poly: 1
      });
    }
    lastEventAt = p.time;
  }

  // Hard safety fallback: never allow an empty pattern.
  if (events.length === 0) {
    const beat = 60 / song.bpm;
    const stepFallback = Math.max(0.2, beat / 2);
    for (let t = song.startAt; t < song.endAt - 0.1; t += stepFallback) {
      events.push({
        t,
        type: "tap",
        d: stepFallback * 0.9,
        poly: 0
      });
    }
  }

  const cleaned = [];
  const secondLoad = new Map();
  const acceptedWindows = [];
  const maxSimultaneous = Math.min(MAX_CONCURRENT_REQUIRED_KEYS, flow.maxConcurrent);
  const perSecondCap = Math.min(flow.perSecondCap, Math.max(1, Math.round(song.maxNotesPerSecond * balance.perSecondMul)));

  function getWindow(event) {
    const start = event.t;
    const end = event.t + Math.max(0.06, event.d);
    return { start, end };
  }

  function countOverlaps(start, end) {
    let overlaps = 0;
    for (const window of acceptedWindows) {
      if (start < window.end && end > window.start) {
        overlaps += 1;
      }
    }
    return overlaps;
  }

  for (const ev of events.sort((a, b) => a.t - b.t || a.poly - b.poly)) {
    const secondBucket = Math.floor(ev.t);
    const count = secondLoad.get(secondBucket) || 0;
    if (count >= perSecondCap) {
      continue;
    }

    const window = getWindow(ev);
    if (countOverlaps(window.start, window.end) >= maxSimultaneous) {
      continue;
    }

    cleaned.push(ev);
    acceptedWindows.push(window);
    secondLoad.set(secondBucket, count + 1);
  }

  if (cleaned.length === 0) {
    const beat = 60 / song.bpm;
    const safeStep = Math.max(0.2, beat / 2);
    for (let t = song.startAt; t < song.endAt - 0.1; t += safeStep) {
      cleaned.push({
        t,
        type: "tap",
        d: safeStep * 0.88,
        poly: 0
      });
    }
  }

  // Reliability floor: keep enough playable notes for low-energy songs.
  const minEvents = Math.max(24, Math.floor((song.endAt - song.startAt) * balance.minEventsRate));
  if (cleaned.length < minEvents) {
    const sortedByEnergy = [...analysis]
      .filter((p) => p.time >= song.startAt && p.time <= song.endAt)
      .sort((a, b) => b.smooth - a.smooth);
    const usedBuckets = new Set(cleaned.map((ev) => ev.t.toFixed(2)));
    const stepFallback = analysis[0]?.step || (60 / song.bpm) / 2;
    for (const point of sortedByEnergy) {
      if (cleaned.length >= minEvents) {
        break;
      }
      const bucket = point.time.toFixed(2);
      if (usedBuckets.has(bucket)) {
        continue;
      }
      usedBuckets.add(bucket);
      cleaned.push({
        t: point.time,
        type: "tap",
        d: Math.max(0.08, stepFallback * 0.9),
        poly: 0
      });
    }
    cleaned.sort((a, b) => a.t - b.t || a.poly - b.poly);
  }

  // Enforce max silence gaps by inserting lightweight taps in large empty windows.
  cleaned.sort((a, b) => a.t - b.t || a.poly - b.poly);
  const gapFilled = [];
  let prevTime = song.startAt;
  for (const ev of cleaned) {
    let cursor = prevTime;
    while (ev.t - cursor > flow.maxGapSec) {
      const t = cursor + flow.maxGapSec;
      gapFilled.push({ t, type: "tap", d: Math.max(0.08, step * 0.85), poly: 0 });
      cursor = t;
    }
    gapFilled.push(ev);
    prevTime = ev.t;
  }
  cleaned.length = 0;
  cleaned.push(...gapFilled);

  // Ensure hold notes exist per song difficulty when enough room is available.
  const desiredHoldCount = Math.max(1, Math.floor(cleaned.length * Math.max(balance.minHoldRatio, song.holdChanceBase * balance.holdMul)));
  let currentHoldCount = cleaned.filter((ev) => ev.type === "hold").length;
  if (currentHoldCount < desiredHoldCount) {
    for (let i = 0; i < cleaned.length - 1 && currentHoldCount < desiredHoldCount; i += 1) {
      const ev = cleaned[i];
      const next = cleaned[i + 1];
      if (ev.type !== "tap") {
        continue;
      }
      const gap = next.t - ev.t;
      if (gap < step * 1.45) {
        continue;
      }
      ev.type = "hold";
      ev.d = Math.max(step * 1.6, Math.min(gap - 0.04, step * 3.2));
      currentHoldCount += 1;
    }
  }

  // Align candidate events to nearby detected onset peaks.
  const onsetTimes = [];
  for (let i = 0; i < analysis.length; i += 1) {
    const p = analysis[i];
    const prev = analysis[i - 1];
    const next = analysis[i + 1];
    const flux = p.fluxNorm ?? p.norm;
    if ((!prev || p.smooth >= prev.smooth) && (!next || p.smooth >= next.smooth) && flux >= 0.3) {
      onsetTimes.push(p.time);
    }
  }
  const maxSnap = song.stars <= 2 ? 0.12 : song.stars === 3 ? 0.1 : 0.08;
  const aligned = cleaned.map((ev) => {
    if (onsetTimes.length === 0) {
      return ev;
    }
    let nearest = ev.t;
    let best = Infinity;
    for (const t of onsetTimes) {
      const d = Math.abs(t - ev.t);
      if (d < best) {
        best = d;
        nearest = t;
      }
    }
    if (best <= maxSnap) {
      return { ...ev, t: nearest };
    }
    return ev;
  });

  // Final pass: stable spacing per star and guaranteed no 1-star concurrency spikes.
  const finalEvents = [];
  const secondFinalLoad = new Map();
  const windows = [];
  for (const ev of aligned.sort((a, b) => a.t - b.t || a.poly - b.poly)) {
    if (song.stars === 1 && ev.poly > 0) {
      continue;
    }
    if (finalEvents.length > 0) {
      const prev = finalEvents[finalEvents.length - 1];
      if (ev.t - prev.t < flow.minGapSec) {
        continue;
      }
    }
    const secBucket = Math.floor(ev.t);
    const secCount = secondFinalLoad.get(secBucket) || 0;
    if (secCount >= perSecondCap) {
      continue;
    }
    const start = ev.t;
    const end = ev.t + Math.max(0.06, ev.d);
    let overlaps = 0;
    for (const w of windows) {
      if (start < w.end && end > w.start) {
        overlaps += 1;
      }
    }
    if (overlaps >= flow.maxConcurrent) {
      continue;
    }
    finalEvents.push(ev);
    windows.push({ start, end });
    secondFinalLoad.set(secBucket, secCount + 1);
  }

  return { version: PATTERN_VERSION, events: finalEvents };
}

function loadPatternFromStorage(song) {
  try {
    const raw = localStorage.getItem(getPatternStorageKey(song));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (parsed?.version === PATTERN_VERSION && Array.isArray(parsed.events) && parsed.events.length > 8) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

function savePatternToStorage(song, pattern) {
  try {
    localStorage.setItem(getPatternStorageKey(song), JSON.stringify(pattern));
  } catch {
    // Ignore localStorage write failure.
  }
}

async function prepareSong(song) {
  if (preparedSongs.has(song.id)) {
    return preparedSongs.get(song.id);
  }

  if (song.midiScore) {
    const built = {
      score: song.midiScore,
      keyIndex: song.midiScore[0] ? song.midiScore[0].midi % 12 : 0,
      analysisTimeline: song.midiScore.map((n) => ({ time: n.t, chroma: oneHotChroma(n.midi) })),
      effectiveStartAt: 0
    };
    const pattern = buildPatternFromScore(song, built.score);
    pattern.keyIndex = built.keyIndex;
    pattern.effectiveStartAt = 0;
    const prepared = {
      audioBuffer: null,
      pattern,
      mode: "builtin",
      computedStars: computeDifficulty(song, pattern),
      keyIndex: built.keyIndex,
      analysisSource: "midi",
      effectiveStartAt: 0,
      score: built.score
    };
    preparedSongs.set(song.id, prepared);
    return prepared;
  }

  if (!song.url) {
    const built = getBuiltinSongData(song);
    let pattern = loadPatternFromStorage(song);
    if (!pattern) {
      pattern = buildPatternFromScore(song, built.score);
      pattern.keyIndex = built.keyIndex;
      pattern.effectiveStartAt = built.effectiveStartAt;
      savePatternToStorage(song, pattern);
    }
    const prepared = {
      audioBuffer: null,
      pattern,
      mode: "builtin",
      computedStars: computeDifficulty(song, pattern),
      keyIndex: pattern.keyIndex ?? built.keyIndex,
      analysisSource: "builtin",
      effectiveStartAt: pattern.effectiveStartAt ?? built.effectiveStartAt,
      analysisTimeline: built.analysisTimeline,
      score: built.score
    };
    preparedSongs.set(song.id, prepared);
    return prepared;
  }

  const context = getAudioContext();
  const beat = 60 / song.bpm;
  const fallbackAnalysis = Array.from({ length: Math.floor((song.endAt - song.startAt) / (beat / 2)) }, (_, idx) => ({
    time: song.startAt + idx * (beat / 2),
    norm: idx % 2 === 0 ? 0.62 : 0.4,
    step: beat / 2
  }));

  if (!context) {
    const pattern = generateSongPattern(song, fallbackAnalysis);
    const prepared = {
      audioBuffer: null,
      pattern,
      mode: "html",
      computedStars: computeDifficulty(song, pattern),
      keyIndex: 0,
      analysisSource: "fallback",
      effectiveStartAt: song.startAt
    };
    preparedSongs.set(song.id, prepared);
    return prepared;
  }
  try {
    const response = await fetch(song.url);
    const data = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(data.slice(0));

    let pattern = loadPatternFromStorage(song);
    const advanced = analyzeSongWithMeyda(song, audioBuffer);
    let keyIndex = advanced?.keyIndex || 0;
    let analysisSource = advanced?.source || "energy";
    let effectiveStartAt = advanced ? detectEffectiveSongStart(song, advanced.analysis) : song.startAt;
    let analysisTimeline = advanced?.chromaTimeline || null;
    if (!pattern) {
      const analysis = advanced?.analysis || await analyzeSongEnergy(song, audioBuffer);
      pattern = generateSongPattern(song, analysis);
      keyIndex = advanced?.keyIndex || keyIndex;
      analysisSource = advanced?.source || analysisSource;
      effectiveStartAt = detectEffectiveSongStart(song, analysis);
      pattern.keyIndex = keyIndex;
      pattern.effectiveStartAt = effectiveStartAt;
      savePatternToStorage(song, pattern);
    } else if (Number.isFinite(pattern.keyIndex)) {
      keyIndex = pattern.keyIndex;
      analysisSource = "cached";
      if (Number.isFinite(pattern.effectiveStartAt)) {
        effectiveStartAt = pattern.effectiveStartAt;
      }
    }

    const prepared = {
      audioBuffer,
      pattern,
      mode: "sample",
      computedStars: computeDifficulty(song, pattern),
      keyIndex,
      analysisSource,
      effectiveStartAt,
      analysisTimeline
    };
    preparedSongs.set(song.id, prepared);
    return prepared;
  } catch {
    const pattern = generateSongPattern(song, fallbackAnalysis);
    const prepared = {
      audioBuffer: null,
      pattern,
      mode: "html",
      computedStars: computeDifficulty(song, pattern),
      keyIndex: 0,
      analysisSource: "fallback",
      effectiveStartAt: song.startAt
    };
    preparedSongs.set(song.id, prepared);
    return prepared;
  }
}

function clearAudioPool() {
  for (const clip of state.audioPool) {
    if (clip.timeoutId) {
      clearTimeout(clip.timeoutId);
    }
    try {
      clip.audio.pause();
      clip.audio.currentTime = 0;
    } catch {
      // ignore
    }
    clip.busy = false;
    clip.timeoutId = null;
    clip.noteId = null;
    clip.unlocked = false;
  }
}

function stopBackgroundSong() {
  if (state.bgmStartTimer) {
    clearTimeout(state.bgmStartTimer);
    state.bgmStartTimer = null;
  }
  if (!state.bgmAudio) {
    if (state.bgmSynthNodes.length) {
      for (const node of state.bgmSynthNodes) {
        try {
          node.stop?.();
        } catch {
          // ignore
        }
        try {
          node.disconnect?.();
        } catch {
          // ignore
        }
      }
      state.bgmSynthNodes.length = 0;
    }
    if (state.bgmSource) {
      try {
        state.bgmSource.stop();
      } catch {
        // ignore
      }
      state.bgmSource.disconnect?.();
      state.bgmGain?.disconnect?.();
      state.bgmSource = null;
      state.bgmGain = null;
      state.bgmStarted = false;
    }
    return;
  }
  try {
    state.bgmAudio.pause();
    state.bgmAudio.currentTime = 0;
  } catch {
    // ignore
  }
  state.bgmAudio = null;
  if (state.bgmSource) {
    try {
      state.bgmSource.stop();
    } catch {
      // ignore
    }
    state.bgmSource.disconnect?.();
    state.bgmGain?.disconnect?.();
    state.bgmSource = null;
    state.bgmGain = null;
  }
  state.bgmStarted = false;
  state.bgmPreparedSongId = null;
  if (state.bgmSynthNodes.length) {
    for (const node of state.bgmSynthNodes) {
      try {
        node.stop?.();
      } catch {
        // ignore
      }
      try {
        node.disconnect?.();
      } catch {
        // ignore
      }
    }
    state.bgmSynthNodes.length = 0;
  }
}

function startBackgroundSongWebAudio(delaySeconds) {
  const ctx = state.audioContext;
  if (!ctx || ctx.state !== "running") {
    return false;
  }
  if (!state.audioBuffer && Array.isArray(state.songScore) && state.songScore.length > 0) {
    const whenBase = ctx.currentTime + Math.max(0, delaySeconds);
    const synthNodes = [];
    for (const note of state.songScore) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const harm = ctx.createOscillator();
      const harmGain = ctx.createGain();
      osc.type = "triangle";
      harm.type = "sine";
      const freq = midiToFrequency(note.midi);
      osc.frequency.value = freq;
      harm.frequency.value = freq * 2;
      const start = whenBase + note.t;
      const release = Math.min(0.14, note.d * 0.3);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(BGM_BASE_VOLUME * 0.7, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + note.d + release);
      harmGain.gain.setValueAtTime(0.0001, start);
      harmGain.gain.exponentialRampToValueAtTime(BGM_BASE_VOLUME * 0.22, start + 0.02);
      harmGain.gain.exponentialRampToValueAtTime(0.0001, start + note.d + release);
      osc.connect(gain).connect(ctx.destination);
      harm.connect(harmGain).connect(ctx.destination);
      osc.start(start);
      harm.start(start);
      osc.stop(start + note.d + release + 0.05);
      harm.stop(start + note.d + release + 0.05);
      synthNodes.push(osc, harm, gain, harmGain);
    }
    state.bgmSynthNodes = synthNodes;
    state.bgmStarted = true;
    return true;
  }
  if (!state.audioBuffer) {
    return false;
  }
  if (state.bgmSource) {
    try {
      state.bgmSource.stop();
    } catch {
      // ignore
    }
    state.bgmSource.disconnect?.();
    state.bgmGain?.disconnect?.();
  }
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = state.audioBuffer;
  gain.gain.value = BGM_BASE_VOLUME;
  source.connect(gain);
  gain.connect(ctx.destination);
  const when = ctx.currentTime + Math.max(0, delaySeconds);
  const offset = Math.max(0, state.songStartAtEffective || state.song?.startAt || 0);
  source.start(when, offset);
  source.onended = () => {
    if (state.bgmSource === source) {
      state.bgmStarted = false;
      state.bgmSource = null;
      state.bgmGain = null;
    }
  };
  state.bgmSource = source;
  state.bgmGain = gain;
  state.bgmStarted = true;
  return true;
}

async function prepareBackgroundSong(song) {
  if (!song.url) {
    state.bgmAudio = null;
    state.bgmPreparedSongId = song.id;
    state.bgmStarted = false;
    return;
  }
  if (state.bgmPreparedSongId === song.id && state.bgmAudio) {
    return;
  }
  stopBackgroundSong();
  const audio = new Audio(song.url);
  audio.preload = "auto";
  audio.loop = false;
  audio.volume = BGM_BASE_VOLUME;
  try {
    await new Promise((resolve) => {
      if (audio.readyState >= 2) {
        resolve();
        return;
      }
      const done = () => {
        audio.removeEventListener("canplay", done);
        audio.removeEventListener("loadeddata", done);
        resolve();
      };
      audio.addEventListener("canplay", done, { once: true });
      audio.addEventListener("loadeddata", done, { once: true });
      setTimeout(done, 2000);
    });
    audio.currentTime = Math.max(0, state.songStartAtEffective || song.startAt);
    state.bgmAudio = audio;
    state.bgmPreparedSongId = song.id;
    state.bgmStarted = false;
  } catch {
    state.bgmAudio = null;
    state.bgmPreparedSongId = null;
    state.bgmStarted = false;
  }
}

function maybeStartBackgroundSong(songTime) {
  // retained for compatibility; scheduling is handled by queueBackgroundSongStart
  void songTime;
}

function queueBackgroundSongStart(delaySeconds) {
  if (!state.song || state.phase !== "playing") {
    return;
  }
  // In piano mode for builtin songs, do not auto-play any background.
  if (!state.song.url && Array.isArray(state.songScore)) {
    return;
  }
  if (startBackgroundSongWebAudio(delaySeconds)) {
    return;
  }
  if (state.bgmStartTimer) {
    clearTimeout(state.bgmStartTimer);
    state.bgmStartTimer = null;
  }
  const delayMs = Math.max(0, Math.round(delaySeconds * 1000));
  state.bgmStartTimer = setTimeout(() => {
    state.bgmStartTimer = null;
    if (!state.isPlaying || state.phase !== "playing") {
      return;
    }
    if (!state.bgmAudio || state.bgmPreparedSongId !== state.song.id) {
      prepareBackgroundSong(state.song).then(() => {
        if (!state.bgmAudio || !state.isPlaying || state.phase !== "playing") {
          return;
        }
        state.bgmAudio.play().then(() => {
          state.bgmStarted = true;
        }).catch(() => {
          state.bgmStarted = false;
        });
      });
      return;
    }
    state.bgmAudio.play().then(() => {
      state.bgmStarted = true;
    }).catch(() => {
      state.bgmStarted = false;
    });
  }, delayMs);
}

function getLeadInTime(song) {
  return Math.max(1.25, getEffectiveBaseTravelTime(song) + 0.25);
}

function ensureAudioPool(songUrl) {
  if (!songUrl) {
    return;
  }
  if (
    state.audioPool.length > 0 &&
    state.audioPool[0].audio.src === songUrl
  ) {
    return;
  }
  clearAudioPool();
  state.audioPool = [];
  state.audioUnlocked = false;
  state.audioUnlockPromise = null;
  for (let i = 0; i < 4; i += 1) {
    const audio = new Audio(songUrl);
    audio.preload = "auto";
    audio.volume = Math.max(0, Math.min(1, state.fxVolume));
    audio.load();
    state.audioPool.push({ audio, busy: false, timeoutId: null, noteId: null, unlocked: false });
  }
}

async function warmUpAudioPool(songUrl) {
  if (!songUrl) {
    return;
  }
  ensureAudioPool(songUrl);
  await Promise.all(state.audioPool.map((clip) => new Promise((resolve) => {
    const audio = clip.audio;
    if (audio.readyState >= 2) {
      resolve();
      return;
    }
    let finished = false;
    const done = () => {
      if (finished) {
        return;
      }
      finished = true;
      audio.removeEventListener("canplay", done);
      audio.removeEventListener("loadeddata", done);
      resolve();
    };
    audio.addEventListener("canplay", done, { once: true });
    audio.addEventListener("loadeddata", done, { once: true });
    setTimeout(done, 3000);
  })));
}

async function unlockAudioPoolFromKeyGesture() {
  if (state.audioPool.length === 0) {
    return;
  }
  if (state.audioUnlocked) {
    return;
  }
  if (state.audioUnlockPromise) {
    await state.audioUnlockPromise;
    return;
  }
  state.audioUnlockPromise = Promise.all(state.audioPool.map(async (clip) => {
    const audio = clip.audio;
    const prevMuted = audio.muted;
    const prevVolume = audio.volume;
    try {
      audio.muted = true;
      audio.volume = 0;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      clip.unlocked = true;
    } catch {
      clip.unlocked = false;
    } finally {
      audio.muted = prevMuted;
      audio.volume = prevVolume;
    }
  })).then(() => {
    state.audioUnlocked = state.audioPool.some((clip) => clip.unlocked);
  }).finally(() => {
    state.audioUnlockPromise = null;
  });
  await state.audioUnlockPromise;
}

function playHtmlNoteClip(note, fromTime, duration) {
  if (!state.isPlaying || state.phase !== "playing") {
    return null;
  }
  if (!state.song?.url) {
    return null;
  }
  ensureAudioPool(state.song.url);
  let clip = state.audioPool.find((item) => !item.busy);
  if (!clip) {
    clip = state.audioPool[0];
    if (clip.timeoutId) {
      clearTimeout(clip.timeoutId);
    }
    try {
      clip.audio.pause();
    } catch {
      // ignore
    }
  }

  const audio = clip.audio;
  const dur = Math.max(0.05, duration);
  clip.busy = true;
  clip.noteId = note.id;
  const targetTime = Math.max(0, fromTime);
  audio.volume = Math.max(0, Math.min(1, state.fxVolume));

  try {
    audio.currentTime = targetTime;
  } catch {
    // ignore seek issues
  }
  audio.play().then(() => {
    clip.unlocked = true;
  }).catch(() => {});
  clip.timeoutId = setTimeout(() => {
    try {
      audio.pause();
    } catch {
      // ignore
    }
    clip.busy = false;
    clip.noteId = null;
    clip.timeoutId = null;
  }, dur * 1000);
  return { source: audio, gain: null, kind: "html", clip };
}

function instantiateNotes(song, pattern, effectiveStartAt = song.startAt) {
  if (typeof elements?.detectZone?.getBoundingClientRect === "function") {
    updateZoneBounds();
  }
  const eventsSorted = [...pattern.events].sort((a, b) => a.t - b.t || a.poly - b.poly);
  const params = getDifficultyParams(song, eventsSorted);
  const progressPass = getZonePassProgress();
  const baseMaxTravel = eventsSorted.reduce((maxV, ev) => Math.max(maxV, getTravelTimeForNote(song, ev.t, params)), 0);
  const leadIn = Math.max(getLeadInTime(song), baseMaxTravel + 3.0);
  const notes = [];
  const laneBusyUntil = [0, 0, 0, 0];
  const lastNoteByLane = [null, null, null, null];
  const uniqueTimes = [...new Set(eventsSorted.map((ev) => ev.t.toFixed(3)))].map((x) => Number(x));
  const nextTimeByTime = new Map();
  for (let i = 0; i < uniqueTimes.length; i += 1) {
    const current = uniqueTimes[i];
    const next = uniqueTimes[i + 1] ?? null;
    nextTimeByTime.set(current.toFixed(3), next);
  }
  let id = 0;
  const speedUpUntilByLane = [-999, -999, -999, -999];
  const SPEED_UP_WINDOW_SEC = 0.5;
  const SPEED_UP_MULT = 0.88;
  const CHASE_SAFETY_MARGIN = 1.12;
  const highDifficulty = clamp(song.stars || 3, 1, 5) >= 4;
  for (const ev of eventsSorted) {
    const relTime = Math.max(0, ev.t - effectiveStartAt) + leadIn;
    const duration = Math.max(0.08, ev.d);
    const laneReserveUntil = relTime + (ev.type === "hold" ? duration : 0.1);
    const freeLanes = [0, 1, 2, 3].filter((c) => laneBusyUntil[c] <= relTime + 0.001);
    const pool = freeLanes.length > 0 ? freeLanes : [0, 1, 2, 3];
    let lane = pool[Math.floor(Math.random() * pool.length)];
    if (lane === undefined && ev.poly === 0) {
      let bestLane = 0;
      let bestTime = laneBusyUntil[0];
      for (let li = 1; li < laneBusyUntil.length; li += 1) {
        if (laneBusyUntil[li] < bestTime) {
          bestTime = laneBusyUntil[li];
          bestLane = li;
        }
      }
      lane = bestLane;
    }
    if (lane === undefined) continue;
    laneBusyUntil[lane] = Math.max(laneBusyUntil[lane], laneReserveUntil);
    const nextTime = nextTimeByTime.get(ev.t.toFixed(3));
    let travelTime = getTravelTimeForNote(song, ev.t, params);
    const stars = clamp(song.stars || 3, 1, 5);
    const prev = lastNoteByLane[lane];
    const holdThenTap = prev && prev.type === "hold" && ev.t - (prev.time + (prev.duration || 0)) < 0.3;
    const sameLaneConsecutive = prev && (ev.t - (prev.type === "hold" ? prev.time + (prev.duration || 0) : prev.time)) < 0.45;

    if (prev) {
      const prevSpawn = prev.time - prev.travelTime;
      const holdTailExtra = prev.type === "hold" ? (prev.duration || 0) : 0;
      const passTime1 = prevSpawn + prev.travelTime * progressPass + holdTailExtra;
      if (ev.t < passTime1) {
        if (progressPass > 1.01) {
          const minTravelToAvoidCatch = (passTime1 - ev.t) / (progressPass - 1);
          const safeMin = Number.isFinite(minTravelToAvoidCatch) ? minTravelToAvoidCatch * CHASE_SAFETY_MARGIN + 0.03 : prev.travelTime * 1.02;
          travelTime = Math.max(travelTime, safeMin);
        } else {
          travelTime = Math.max(travelTime, prev.travelTime * 1.02);
        }
      }
    }

    let didSpeedUp = false;
    const inSpeedUpWindow = !highDifficulty && ev.t <= speedUpUntilByLane[lane];
    if (stars >= 3 && !holdThenTap && !highDifficulty && !sameLaneConsecutive) {
      const density = getLocalNoteDensity(eventsSorted, ev.t, 0.8);
      if (density >= 5) {
        const speedUp = Math.max(0.72, 1 - (density - 4) * 0.08);
        travelTime = Math.max(params.minTravelTime ?? 1.0, travelTime * speedUp);
        didSpeedUp = true;
      }
      if (inSpeedUpWindow) {
        travelTime = Math.max(params.minTravelTime ?? 1.0, travelTime * SPEED_UP_MULT);
        didSpeedUp = true;
      }
    }
    if (didSpeedUp && stars >= 3) {
      speedUpUntilByLane[lane] = Math.max(speedUpUntilByLane[lane], ev.t + SPEED_UP_WINDOW_SEC);
    }
    lastNoteByLane[lane] = { time: ev.t, travelTime, duration, type: ev.type };
    const connectiveDur = ev.type === "hold"
      ? Math.max(0.18, ev.d)
      : (
        nextTime
          ? Math.max(0.1, Math.min(0.48, (nextTime - ev.t) + 0.06))
          : Math.max(0.12, Math.min(0.38, ev.d))
      );
    notes.push({
      id: ++id,
      lane,
      type: ev.type,
      time: relTime,
      duration,
      endTime: relTime + duration,
      clipStart: ev.t,
      clipDuration: Math.max(0.08, connectiveDur),
      travelTime,
      midi: Number.isFinite(ev.midi) ? ev.midi : null,
      judged: false,
      started: false,
      headGrade: null,
      heldTime: 0,
      unheldGap: 0,
      overlapRatio: 0,
      topY: -9999,
      bottomY: -9999,
      trailHeight: 0,
      holdSparkEl: null,
      activeSource: null,
      activeGain: null,
      activePlayback: null,
      element: null
    });
  }

  const sorted = notes.sort((a, b) => a.time - b.time);
  if (typeof window !== "undefined" && window.location?.hostname === "localhost") {
    const chaseViolations = detectChaseViolations(sorted);
    if (chaseViolations.length > 0) {
      console.warn("[Rhythm Drop] Chase violation (faster note caught slower):", chaseViolations);
    }
  }
  return sorted;
}

function detectChaseViolations(notes) {
  const progressPass = getZonePassProgress();
  const byLane = [[], [], [], []];
  for (const n of notes) {
    byLane[n.lane].push(n);
  }
  const violations = [];
  for (let lane = 0; lane < 4; lane += 1) {
    const arr = byLane[lane].sort((a, b) => a.time - b.time);
    for (let i = 1; i < arr.length; i++) {
      const prev = arr[i - 1];
      const curr = arr[i];
      if (curr.travelTime >= prev.travelTime) continue;
      const spawn1 = prev.time - prev.travelTime;
      const spawn2 = curr.time - curr.travelTime;
      const holdTailExtra = prev.type === "hold" ? (prev.duration || 0) : 0;
      const passTime1 = spawn1 + prev.travelTime * progressPass + holdTailExtra;
      const tCatch = (spawn1 * curr.travelTime - spawn2 * prev.travelTime) / (curr.travelTime - prev.travelTime);
      if (tCatch < passTime1 - 0.01) {
        violations.push({ lane, prev, curr, passTime1, tCatch });
      }
    }
  }
  return violations;
}

async function prewarmAllSongs(progressCallback) {
  if (state.preloadStarted) {
    return;
  }
  state.preloadStarted = true;
  let preparedCount = 0;
  for (const song of getAllSongs()) {
    try {
      await prepareSong(song);
      await warmUpAudioPool(song.url);
    } catch {
      // ignore per-song preload failures
    }
    preparedCount += 1;
    if (typeof progressCallback === "function") {
      progressCallback(preparedCount, getAllSongs().length, song);
    }
  }
}

async function bootstrapGameDatabase() {
  if (state.bootstrapPromise) {
    return state.bootstrapPromise;
  }
  state.bootstrapPromise = (async () => {
    elements.startBtn.disabled = true;
    elements.randomSongBtn.disabled = true;
    elements.homeStatus.textContent = `Preparing game database... (0/${getAllSongs().length})`;
    await prewarmAllSongs((preparedCount, total) => {
      elements.homeStatus.textContent = `Preparing game database... (${preparedCount}/${total})`;
    });
    const snapshot = {
      version: PATTERN_VERSION,
      songs: getAllSongs().map((song) => song.id),
      preparedAt: Date.now()
    };
    try {
      localStorage.setItem("rhythm_drop_bootstrap_snapshot", JSON.stringify(snapshot));
    } catch {
      // Ignore localStorage write failures.
    }
    state.bootstrapReady = true;
    elements.startBtn.disabled = false;
    elements.randomSongBtn.disabled = false;
    elements.homeStatus.textContent = "Ready to play.";
  })().catch(() => {
    state.bootstrapReady = true;
    elements.startBtn.disabled = false;
    elements.randomSongBtn.disabled = false;
    elements.homeStatus.textContent = "Ready to play (partial preload).";
  });
  return state.bootstrapPromise;
}

function createNoteElement(note) {
  const meta = DIRECTION_META[note.lane];
  const noteEl = document.createElement("div");
  noteEl.className = `note ${meta.cls}${note.type === "hold" ? " hold" : ""}`;
  noteEl.style.left = `${note.lane * 25}%`;
  noteEl.style.display = "none";
  if (note.type === "hold") {
    const trailHeight = Math.max(40, Math.round(note.duration * (getZoneCenterY() / note.travelTime)));
    note.trailHeight = trailHeight;
    noteEl.style.height = `${trailHeight + HOLD_HEAD_HEIGHT}px`;
    noteEl.innerHTML = `<span class="trail"></span><span class="head">${meta.symbol}</span>`;
  } else {
    noteEl.textContent = meta.symbol;
  }
  elements.notesLayer.appendChild(noteEl);
  note.element = noteEl;
}

function switchScreen(target) {
  elements.homeScreen.classList.toggle("active", target === "home");
  elements.gameScreen.classList.toggle("active", target === "game");
  elements.app?.classList.toggle("game-active", target === "game");
}

function getSongTime() {
  if (!state.isPlaying || state.phase !== "playing") {
    return 0;
  }
  const totalLatency = clamp(state.outputLatencySec + state.manualLatencySec + state.adaptiveLatencySec, -0.18, 0.3);
  if (state.audioContext && state.audioContext.state === "running" && Number.isFinite(state.songStartContextTime)) {
    return Math.max(0, (state.audioContext.currentTime - state.songStartContextTime) - totalLatency);
  }
  if (state.bgmStarted && state.bgmAudio && Number.isFinite(state.bgmAudio.currentTime)) {
    const synced = (state.bgmAudio.currentTime - (state.songStartAtEffective || state.song?.startAt || 0)) + state.bgmStartAtSongTime;
    return Math.max(0, synced - totalLatency);
  }
  const elapsedMs = performance.now() - (state.songStartPerfNow || performance.now());
  return Math.max(0, elapsedMs / 1000 - totalLatency);
}

function updateHud() {
  elements.scoreValue.textContent = String(state.score);
  updateHudBestScore();
  elements.comboValue.textContent = String(state.combo);
  const maxHint = elements.maxComboHint;
  if (maxHint) {
    maxHint.textContent = state.maxCombo > 0 ? `(Best: ${state.maxCombo})` : "";
  }
  const comboCell = elements.comboCell;
  if (comboCell) {
    comboCell.classList.toggle("combo-high", state.combo >= 10);
  }
  const judged = state.totalJudgedNotes;
  const rate = judged === 0 ? 0 : (state.successfulNotes / judged) * 100;
  elements.successValue.textContent = `${rate.toFixed(1)}%`;
}

function updateProgressBar(songTime) {
  const bar = elements.progressBar;
  if (!bar || !state.chartEndTime || state.chartEndTime <= 0) return;
  const pct = Math.min(100, (songTime / state.chartEndTime) * 100);
  bar.style.width = `${pct}%`;
  bar.setAttribute("aria-valuenow", Math.round(pct));
}

function updateCountdownOverlay() {
  const el = elements.countdownOverlay;
  if (!el || !state.countdownEndPerf) return;
  const remaining = (state.countdownEndPerf - performance.now()) / 1000;
  if (remaining <= 0) {
    el.classList.add("hidden");
    return;
  }
  el.classList.remove("hidden");
  if (remaining > 2.4) el.textContent = "3";
  else if (remaining > 1.7) el.textContent = "2";
  else if (remaining > 1.0) el.textContent = "1";
  else el.textContent = "GO!";
}

const JUDGEMENT_DISPLAY_MS = 600;
let judgementCenterTimeout = null;

function showJudgement(text, color, gradeClass = "") {
  elements.judgementText.textContent = text;
  elements.judgementText.style.color = color;
  const center = elements.judgementCenterOverlay;
  if (center && gradeClass && gradeClass !== "ready") {
    center.textContent = text;
    center.style.color = color;
    center.className = "judgement-center-overlay judgement-center-pop grade-" + gradeClass;
    center.classList.remove("hidden");
    clearTimeout(judgementCenterTimeout);
    judgementCenterTimeout = setTimeout(() => {
      center.classList.add("hidden");
      center.className = "judgement-center-overlay hidden";
    }, JUDGEMENT_DISPLAY_MS);
  }
  elements.judgementText.classList.remove("judgement-pop");
  void elements.judgementText.offsetWidth;
  elements.judgementText.classList.add("judgement-pop");
  setTimeout(() => elements.judgementText.classList.remove("judgement-pop"), 120);
}

const COMBO_MILESTONES = [10, 25, 50, 100];
function showComboMilestoneIfNeeded() {
  const overlay = elements.comboMilestoneOverlay;
  if (!overlay) return;
  for (const m of COMBO_MILESTONES) {
    if (state.combo >= m && state.lastComboMilestone < m) {
      state.lastComboMilestone = m;
      overlay.textContent = `COMBO x${m}!`;
      overlay.style.color = "#ffd700";
      overlay.classList.remove("hidden");
      overlay.classList.add("combo-milestone-pop");
      if (elements.playfield) {
        elements.playfield.classList.add("streak-burst");
        setTimeout(() => elements.playfield?.classList.remove("streak-burst"), 180);
      }
      clearTimeout(state.comboMilestoneTimeout);
      state.comboMilestoneTimeout = setTimeout(() => {
        overlay.classList.add("hidden");
        overlay.classList.remove("combo-milestone-pop");
      }, 2000);
      break;
    }
  }
}

function setPlayfieldLevelClass(stars) {
  elements.playfield.classList.remove("level-1", "level-2", "level-3", "level-4", "level-5");
  elements.playfield.classList.add(`level-${clamp(stars, 1, 5)}`);
}

function keyIndexToFrequency(keyIndex, octave = 4) {
  const midi = (octave + 1) * 12 + (keyIndex % 12);
  return 440 * (2 ** ((midi - 69) / 12));
}

function playAccompanimentLayer(intensity = 1, gradeName = "GOOD") {
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== "running") {
    return;
  }
  // For builtin songs in piano mode, accompaniment is already covered by per-hit notes.
  if (!state.song?.url && Array.isArray(state.songScore)) {
    return;
  }
  const now = ctx.currentTime;
  const root = keyIndexToFrequency(state.songKeyIndex || 0, 4);
  const intervalMap = { PERFECT: 7, GREAT: 5, GOOD: 4, BAD: 3, MISS: 1 };
  const interval = intervalMap[gradeName] ?? 4;
  const freqA = clamp(root, 130, 1800);
  const freqB = clamp(freqA * (2 ** (interval / 12)), 150, 2400);
  const peak = Math.min(0.13, 0.04 + intensity * 0.045);

  const oscA = ctx.createOscillator();
  const oscB = ctx.createOscillator();
  const gain = ctx.createGain();
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 140;
  oscA.type = "sine";
  oscB.type = gradeName === "PERFECT" ? "triangle" : "sine";
  oscA.frequency.value = freqA;
  oscB.frequency.value = freqB;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  oscA.connect(hp);
  oscB.connect(hp);
  hp.connect(gain);
  gain.connect(ctx.destination);
  oscA.start(now);
  oscB.start(now + 0.003);
  oscA.stop(now + 0.19);
  oscB.stop(now + 0.2);
}

function playHitEffect(intensity = 1) {
  void intensity;
  // Clicky per-hit FX intentionally muted to keep the song clear.
}

function pulseLane(lane, className = "hit") {
  const laneEl = elements.lanes?.[lane];
  if (!laneEl) {
    return;
  }
  laneEl.classList.remove("hit", "miss", "perfect", "great", "good", "bad");
  laneEl.classList.add(className);
  setTimeout(() => laneEl.classList.remove(className), className === "miss" ? 170 : 150);
}

function getGradeEffect(gradeName) {
  const map = {
    PERFECT: { laneClass: "perfect", fieldClass: "fx-perfect", fxIntensity: 1.35, songBoost: 1.35, burst: 4, burstColor: "#95ffce" },
    GREAT: { laneClass: "great", fieldClass: "fx-great", fxIntensity: 1.12, songBoost: 1.1, burst: 3, burstColor: "#8cd3ff" },
    GOOD: { laneClass: "good", fieldClass: "fx-good", fxIntensity: 0.95, songBoost: 0.92, burst: 2, burstColor: "#ffe38c" },
    BAD: { laneClass: "bad", fieldClass: "fx-bad", fxIntensity: 0.78, songBoost: 0.74, burst: 1, burstColor: "#ffb88a" },
    MISS: { laneClass: "miss", fieldClass: "fx-miss", fxIntensity: 0.48, songBoost: 0.25, burst: 1, burstColor: "#ff7f9c" }
  };
  return map[gradeName] || map.GOOD;
}

function getSongTheme() {
  const id = state.song?.id || "";
  const themes = {
    twinkle: "#7ef7c8",
    mary: "#8cb7ff",
    odejoy: "#ff89d3",
    furintro: "#ffd07f",
    cancan: "#9bffb8"
  };
  return themes[id] || "#95ffce";
}

function pulsePlayfield(className) {
  const pf = elements.playfield;
  pf.classList.remove("fx-perfect", "fx-great", "fx-good", "fx-bad", "fx-miss");
  pf.classList.add(className);
  setTimeout(() => pf.classList.remove(className), 180);
}

function spawnGradeBurst(note, effect) {
  const count = effect?.burst || 0;
  const theme = getSongTheme();
  for (let i = 0; i < count; i += 1) {
    const spark = document.createElement("div");
    spark.className = "grade-burst";
    spark.style.left = `${note.lane * 25 + 12.5}%`;
    spark.style.top = `${Math.max(12, note.topY - 14)}px`;
    spark.style.setProperty("--burst-x", `${(Math.random() * 44 - 22).toFixed(1)}px`);
    spark.style.setProperty("--burst-y", `${(-28 - Math.random() * 26).toFixed(1)}px`);
    spark.style.setProperty("--burst-color", effect.burstColor || theme);
    elements.notesLayer.appendChild(spark);
    setTimeout(() => spark.remove(), 360);
  }
}

function reinforceSongOnHit(intensity = 1) {
  const base = BGM_BASE_VOLUME;
  const boost = Math.min(0.22, 0.06 + intensity * 0.08);
  if (state.bgmGain) {
    const now = state.audioContext?.currentTime;
    if (Number.isFinite(now)) {
      const target = Math.max(0.1, Math.min(0.95, base + boost));
      state.bgmGain.gain.cancelScheduledValues(now);
      state.bgmGain.gain.setValueAtTime(state.bgmGain.gain.value, now);
      state.bgmGain.gain.linearRampToValueAtTime(target, now + 0.018);
      state.bgmGain.gain.linearRampToValueAtTime(base, now + 0.17);
      return;
    }
  }
  const bgm = state.bgmAudio;
  if (bgm && !bgm.paused) {
    bgm.volume = Math.max(0.1, Math.min(0.95, base + boost));
    setTimeout(() => {
      if (state.bgmAudio === bgm && !bgm.paused) {
        bgm.volume = base;
      }
    }, 120);
  }
}

function playMatchedAccent(intensity = 1) {
  // In piano mode for builtin songs, we rely on the per-note synth instead of timeline-based accents.
  if (!state.song?.url && Array.isArray(state.songScore)) {
    return;
  }
  const nowSong = getSongTime();
  if (nowSong - state.lastAccentAt < 0.075) {
    return;
  }
  state.lastAccentAt = nowSong;
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== "running") {
    return;
  }
  if (!state.audioBuffer && Array.isArray(state.songScore) && state.songScore.length > 0) {
    const rel = Math.max(0, nowSong - (state.bgmStartAtSongTime || 0));
    let nearest = state.songScore[0];
    let best = Math.abs(nearest.t - rel);
    for (let i = 1; i < state.songScore.length; i += 1) {
      const d = Math.abs(state.songScore[i].t - rel);
      if (d < best) {
        best = d;
        nearest = state.songScore[i];
      }
    }
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 2.2;
    const freq = midiToFrequency(nearest.midi);
    bp.frequency.value = clamp(freq, 120, 2600);
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.min(0.34, 0.13 + intensity * 0.14), now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);
    osc.connect(bp).connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
    return;
  }
  if (!state.audioBuffer) {
    return;
  }
  const rel = Math.max(0, nowSong - (state.bgmStartAtSongTime || 0));
  const absTime = (state.songStartAtEffective || state.song?.startAt || 0) + rel;
  const start = Math.max(0, Math.min(state.audioBuffer.duration - 0.02, absTime));
  const dur = 0.2;
  const src = ctx.createBufferSource();
  const hp = ctx.createBiquadFilter();
  const bp = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  hp.type = "highpass";
  hp.frequency.value = 300;
  bp.type = "bandpass";
  bp.Q.value = 1.8;
  const dominant = getDominantFrequencyAt(absTime) || keyIndexToFrequency(state.songKeyIndex || 0, 4);
  bp.frequency.value = clamp(dominant, 180, 2200);
  gain.gain.value = 0.0001;
  src.buffer = state.audioBuffer;
  src.connect(hp);
  hp.connect(bp);
  bp.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  const peak = Math.min(0.34, 0.14 + intensity * 0.1);
  gain.gain.linearRampToValueAtTime(peak, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  src.start(now, start, dur);
}

function getDominantFrequencyAt(absTime) {
  const timeline = state.songAnalysis;
  if (!timeline || timeline.length === 0) {
    return null;
  }
  let nearest = timeline[0];
  let best = Math.abs(nearest.time - absTime);
  for (let i = 1; i < timeline.length; i += 1) {
    const d = Math.abs(timeline[i].time - absTime);
    if (d < best) {
      best = d;
      nearest = timeline[i];
    }
  }
  const chroma = nearest.chroma || [];
  let idx = 0;
  let val = -Infinity;
  for (let i = 0; i < 12; i += 1) {
    if ((chroma[i] || 0) > val) {
      val = chroma[i] || 0;
      idx = i;
    }
  }
  return keyIndexToFrequency(idx, 4);
}

function maybeGrantComboShield() {
  const every = state.levelProfile?.comboShieldEvery || 0;
  if (!every || state.combo <= 0) {
    return;
  }
  if (state.combo % every === 0) {
    state.comboShieldReady = true;
  }
}

function applyStreakBonusIfNeeded() {
  const every = state.levelProfile?.streakBonusEvery || 0;
  if (!every || state.combo <= 0 || state.combo % every !== 0) {
    return;
  }
  const bonus = Math.round((state.levelProfile?.streakBonusPoints || 0) * (0.9 + Math.random() * 0.2));
  if (bonus <= 0) {
    return;
  }
  state.score += bonus;
  elements.playfield.classList.add("streak-burst");
  setTimeout(() => elements.playfield.classList.remove("streak-burst"), 180);
}

function triggerHitFeedback() {
  elements.playfield.classList.add("hit-pulse", "impact-shake");
  setTimeout(() => {
    elements.playfield.classList.remove("hit-pulse");
    elements.playfield.classList.remove("impact-shake");
  }, 130);
}

function spawnSpark(note) {
  const spark = document.createElement("div");
  spark.className = "spark";
  spark.style.left = `${note.lane * 25 + 12.5}%`;
  spark.style.top = `${Math.max(10, note.topY - 12)}px`;
  elements.notesLayer.appendChild(spark);
  setTimeout(() => spark.remove(), 500);
}

function spawnHoldSpark(note) {
  if (note.holdSparkEl) {
    return;
  }
  const spark = document.createElement("div");
  spark.className = "hold-spark";
  note.holdSparkEl = spark;
  elements.notesLayer.appendChild(spark);
  updateHoldSparkPosition(note);
}

function updateHoldSparkPosition(note) {
  if (!note.holdSparkEl) {
    return;
  }
  note.holdSparkEl.style.left = `${note.lane * 25 + 12.5}%`;
  note.holdSparkEl.style.top = `${Math.max(8, note.topY - 12)}px`;
}

function endHoldSpark(note) {
  if (!note.holdSparkEl) {
    return;
  }
  const spark = note.holdSparkEl;
  note.holdSparkEl = null;
  spark.classList.add("end");
  setTimeout(() => spark.remove(), 500);
}

function removeHoldSpark(note) {
  if (!note.holdSparkEl) {
    return;
  }
  note.holdSparkEl.remove();
  note.holdSparkEl = null;
}

function playNoteClip(note, fromTime, duration) {
  if (state.phase !== "playing") {
    return null;
  }
  // Builtin songs: drive all sound from keypresses using a simple synth.
  if (!state.song?.url) {
    const ctx = getAudioContext();
    if (!ctx) {
      return null;
    }
    ctx.resume().catch(() => {});
    if (!Number.isFinite(note.midi)) {
      return null;
    }
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    const freq = midiToFrequency(note.midi);
    osc.frequency.value = freq;
    const dur = Math.max(0.05, duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.min(0.4, 0.18 + dur * 0.3), now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur + 0.02);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.05);
    return { source: osc, gain, kind: "webaudio", clip: null };
  }
  if (state.audioContext && state.audioContext.state !== "running") {
    state.audioContext.resume().catch(() => {});
  }
  if (!state.audioBuffer || !state.audioContext || state.audioContext.state !== "running") {
    return playHtmlNoteClip(note, fromTime, duration);
  }
  const start = Math.max(0, Math.min(state.audioBuffer.duration - 0.01, fromTime));
  const dur = Math.max(0.05, Math.min(duration, state.audioBuffer.duration - start));
  const source = state.audioContext.createBufferSource();
  const gain = state.audioContext.createGain();
  gain.gain.value = state.fxVolume;
  source.buffer = state.audioBuffer;
  source.connect(gain);
  gain.connect(state.audioContext.destination);
  source.start(0, start, dur);
  return { source, gain, kind: "webaudio", clip: null };
}

function stopHoldAudio(note) {
  if (!note.activeSource && !note.activePlayback) {
    return;
  }
  if (note.activePlayback?.kind === "html" && note.activePlayback.clip) {
    const clip = note.activePlayback.clip;
    if (clip.timeoutId) {
      clearTimeout(clip.timeoutId);
    }
    try {
      clip.audio.pause();
    } catch {
      // ignore
    }
    clip.busy = false;
    clip.timeoutId = null;
    clip.noteId = null;
  } else {
    try {
      note.activeSource?.stop();
    } catch {
      // ignore
    }
    note.activeSource?.disconnect?.();
    note.activeGain?.disconnect?.();
  }
  note.activeSource = null;
  note.activeGain = null;
  note.activePlayback = null;
}

function judgeFromOverlap(ratio) {
  return GRADE_RULES.find((rule) => ratio >= rule.min) || GRADE_RULES[GRADE_RULES.length - 1];
}

function markMiss(note) {
  if (note.judged) {
    return;
  }
  if (state.comboShieldReady) {
    state.comboShieldReady = false;
    note.judged = true;
    state.totalJudgedNotes += 1;
    state.gradeCounts.bad += 1;
    state.successHits += 0.3;
    note.element?.classList.add("hit");
    pulseLane(note.lane, "hit");
    showJudgement("SHIELD SAVE", "#a8f8ff", "shield");
    updateHud();
    return;
  }
  note.judged = true;
  state.totalJudgedNotes += 1;
  state.gradeCounts.miss += 1;
  state.combo = 0;
  state.lastComboMilestone = 0;
  stopHoldAudio(note);
  removeHoldSpark(note);
  note.element?.classList.add("hit");
  pulseLane(note.lane, "miss");
  showJudgement("MISS", "#ff7f9c", "miss");
  updateHud();
}

function markTapHit(note, overlapRatio, songTime) {
  const adjustedOverlap = clamp(overlapRatio + (state.levelProfile?.judgeBias || 0), 0, 1);
  const grade = judgeFromOverlap(adjustedOverlap);
  note.judged = true;
  state.totalJudgedNotes += 1;
  if (grade.success) {
    const effect = getGradeEffect(grade.name);
    state.gradeCounts[grade.name.toLowerCase()] += 1;
    state.successHits += 1;
    state.successfulNotes += 1;
    state.combo += 1;
    state.maxCombo = Math.max(state.maxCombo, state.combo);
    state.score += Math.round((grade.points + Math.floor(state.combo * 0.8)) * (state.levelProfile?.scoreMult || 1));
    playNoteClip(note, note.clipStart, note.clipDuration);
    triggerHitFeedback();
    spawnSpark(note);
    playHitEffect(effect.fxIntensity);
    playAccompanimentLayer(effect.songBoost, grade.name);
    playMatchedAccent(effect.songBoost);
    reinforceSongOnHit(effect.songBoost);
    pulseLane(note.lane, effect.laneClass);
    pulsePlayfield(effect.fieldClass);
    spawnGradeBurst(note, effect);
    maybeGrantComboShield();
    applyStreakBonusIfNeeded();
    showComboMilestoneIfNeeded();
    if (
      Number.isFinite(songTime) &&
      (grade.name === "PERFECT" || grade.name === "GREAT") &&
      overlapRatio > 0.88 &&
      state.combo >= 3
    ) {
      const hitError = songTime - note.time;
      if (Math.abs(hitError) <= 0.16) {
        state.adaptiveLatencySamples += 1;
        state.adaptiveLatencySec = clamp(
          state.adaptiveLatencySec + hitError * 0.12,
          -0.12,
          0.16
        );
      }
    }
  } else {
    state.gradeCounts.miss += 1;
    state.combo = 0;
    state.lastComboMilestone = 0;
    pulseLane(note.lane, "miss");
    pulsePlayfield("fx-miss");
    spawnGradeBurst(note, getGradeEffect("MISS"));
  }
  note.element?.classList.add("hit");
  const pct = Math.round(clamp(adjustedOverlap, 0, 1) * 100);
  showJudgement(`${grade.name} ${pct}%`, grade.color, grade.name.toLowerCase());
  updateHud();
}

function finalizeHold(note, reason) {
  if (note.judged) {
    return;
  }
  note.judged = true;
  state.totalJudgedNotes += 1;
  const heldRatio = Math.max(0, Math.min(1, note.heldTime / note.duration));
  state.successHits += heldRatio;
  if (heldRatio >= 0.98) {
    state.gradeCounts.perfect += 1;
  } else if (heldRatio >= 0.75) {
    state.gradeCounts.great += 1;
  } else if (heldRatio >= 0.5) {
    state.gradeCounts.good += 1;
  } else if (heldRatio >= 0.2) {
    state.gradeCounts.bad += 1;
  } else {
    state.gradeCounts.miss += 1;
  }
  if (heldRatio >= 0.2) {
    state.successfulNotes += 1;
  }
  if (heldRatio >= 0.2) {
    state.combo += 1;
    state.maxCombo = Math.max(state.maxCombo, state.combo);
    triggerHitFeedback();
    showComboMilestoneIfNeeded();
  } else {
    state.combo = 0;
    state.lastComboMilestone = 0;
  }
  state.score += Math.round(HOLD_MAX_POINTS * heldRatio * (state.levelProfile?.scoreMult || 1));
  stopHoldAudio(note);
  if (heldRatio >= 0.2) {
    const holdGrade = heldRatio >= 0.98 ? "PERFECT" : heldRatio >= 0.75 ? "GREAT" : heldRatio >= 0.5 ? "GOOD" : "BAD";
    const effect = getGradeEffect(holdGrade);
    playHitEffect(Math.max(0.7, effect.fxIntensity));
    playAccompanimentLayer(Math.max(0.65, effect.songBoost), holdGrade);
    playMatchedAccent(Math.max(0.65, effect.songBoost));
    reinforceSongOnHit(Math.max(0.5, effect.songBoost));
    pulseLane(note.lane, effect.laneClass);
    pulsePlayfield(effect.fieldClass);
    spawnGradeBurst(note, effect);
    maybeGrantComboShield();
    applyStreakBonusIfNeeded();
  } else {
    pulseLane(note.lane, "miss");
    pulsePlayfield("fx-miss");
    spawnGradeBurst(note, getGradeEffect("MISS"));
  }
  note.element?.classList.add("hit");
  endHoldSpark(note);
  const pct = Math.round(heldRatio * 100);
  showJudgement(`Holding ${pct}%`, "#d4a4ff", "hold");
  updateHud();
}

function computeNotePosition(note, songTime) {
  const spawn = note.time - note.travelTime;
  const progress = (songTime - spawn) / note.travelTime;
  const startY = -HOLD_HEAD_HEIGHT;
  // Align rhythm timing to the center of the detected zone.
  const endY = getZoneCenterY() - HOLD_HEAD_HEIGHT / 2;
  const headTop = startY + progress * (endY - startY);
  const trail = note.type === "hold" ? note.trailHeight : 0;
  return {
    headTop,
    headBottom: headTop + HOLD_HEAD_HEIGHT,
    renderTop: note.type === "hold" ? headTop - trail : headTop,
    renderBottom: headTop + HOLD_HEAD_HEIGHT
  };
}

function getOverlapRatio(top, bottom) {
  const overlap = Math.max(0, Math.min(bottom, state.zoneBottomY) - Math.max(top, state.zoneTopY));
  return overlap / HOLD_HEAD_HEIGHT;
}

function renderNotes(songTime) {
  const fieldHeight = elements.playfield.clientHeight;
  for (const note of state.notes) {
    if (note.judged) {
      continue;
    }
    const pos = computeNotePosition(note, songTime);
    note.topY = pos.headTop;
    note.bottomY = pos.headBottom;
    note.overlapRatio = getOverlapRatio(pos.headTop, pos.headBottom);
    if (note.type === "hold" && note.started) {
      updateHoldSparkPosition(note);
    }

    if (note.type === "tap" && pos.headTop > state.zoneBottomY) {
      markMiss(note);
      continue;
    }
    if (note.type === "hold" && !note.started && pos.headTop > state.zoneBottomY) {
      markMiss(note);
      continue;
    }
    if (note.type === "hold" && note.started && songTime >= note.endTime) {
      finalizeHold(note, "end");
      continue;
    }

    if (pos.renderBottom < -120 || pos.renderTop > fieldHeight + 120) {
      note.element.style.display = "none";
    } else {
      note.element.style.display = "grid";
      note.element.style.transform = `translateY(${pos.renderTop.toFixed(2)}px)`;
    }
  }
}

/** Update position/overlap for notes in one lane (for immediate keypress processing). */
function refreshLaneNotePositions(lane, songTime) {
  updateZoneBounds();
  for (const note of state.noteMapByLane[lane]) {
    if (note.judged) continue;
    const pos = computeNotePosition(note, songTime);
    note.topY = pos.headTop;
    note.bottomY = pos.headBottom;
    note.overlapRatio = getOverlapRatio(pos.headTop, pos.headBottom);
  }
}

/** Returns the note to hit for a keypress: the earliest (first in sequence) among notes in zone.
 *  When tap and hold are close/linked, we must hit the tap first, then the hold on next press. */
function getBottomNoteInLane(lane) {
  const laneNotes = state.noteMapByLane[lane];
  const candidates = [];
  for (const note of laneNotes) {
    if (note.judged) continue;
    if (note.type === "hold" && note.started) continue;
    if (note.overlapRatio <= 0) continue;
    candidates.push(note);
  }
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];
  return candidates.reduce((a, b) => (a.time < b.time ? a : b));
}

function getBestCandidate(lane, type) {
  const laneNotes = state.noteMapByLane[lane];
  const candidates = [];
  for (const note of laneNotes) {
    if (note.judged || note.type !== type || (type === "hold" && note.started)) {
      continue;
    }
    if (note.overlapRatio <= 0) {
      continue;
    }
    candidates.push(note);
  }
  if (candidates.length === 0) {
    return { note: null, overlap: 0 };
  }
  if (candidates.length === 1) {
    const n = candidates[0];
    return { note: n, overlap: n.overlapRatio };
  }
  const earliest = candidates.reduce((a, b) => (a.time < b.time ? a : b));
  return { note: earliest, overlap: earliest.overlapRatio };
}

function hasTouchable() {
  return state.notes.some((note) => !note.judged && note.overlapRatio > 0);
}

function hasActiveHold() {
  return state.notes.some((note) => note.type === "hold" && note.started && !note.judged);
}

function consumeTopTouchableAsMiss() {
  const candidates = state.notes.filter((note) => !note.judged && note.overlapRatio > 0 && (note.type === "tap" || !note.started));
  if (candidates.length === 0) {
    return;
  }
  candidates.sort((a, b) => b.overlapRatio - a.overlapRatio);
  markMiss(candidates[0]);
}

function startHold(note, overlapRatio) {
  if (!note || note.judged || note.started || overlapRatio <= 0) {
    return;
  }
  note.started = true;
  note.unheldGap = 0;
  triggerHitFeedback();
  spawnHoldSpark(note);
  pulseLane(note.lane, "hit");
  reinforceSongOnHit(0.7);
  playHitEffect(0.8);
  playAccompanimentLayer(0.55, "GOOD");
  playMatchedAccent(0.55);
  const playback = playNoteClip(note, note.clipStart, note.clipDuration + Math.max(0.1, note.duration * 0.7));
  note.activePlayback = playback;
  note.activeSource = playback?.source || null;
  note.activeGain = playback?.gain || null;
}

function processHeldStarts() {
  for (const lane of state.pressedLanes) {
    if (lane === state.lastTapHitLane) {
      continue;
    }
    const c = getBestCandidate(lane, "hold");
    if (c.note && c.overlap > 0) {
      startHold(c.note, c.overlap);
    }
  }
}

/** Seconds to treat hit as earlier (compensates input/processing delay). Faster songs get more. */
function getHitForgivenessSec() {
  const stars = clamp(state.song?.stars ?? 3, 1, 5);
  return stars >= 5 ? 0.03 : stars >= 4 ? 0.02 : 0.01;
}

/** Overlap for a note at given songTime (for grading with forgiveness). */
function getOverlapForNoteAtTime(note, songTime) {
  const pos = computeNotePosition(note, songTime);
  return getOverlapRatio(pos.headTop, pos.headBottom);
}

/** Process a single keypress immediately (no frame delay). Only hits the lowest note in zone. */
function processSingleKeyPressImmediate(lane) {
  if (!state.isPlaying || state.phase !== "playing") return;
  if (state.countdownEndPerf > 0 && performance.now() < state.countdownEndPerf) return;
  const activeHoldInLane = state.notes.some(
    (note) => note.type === "hold" && note.started && !note.judged && note.lane === lane
  );
  if (activeHoldInLane) return;
  const songTime = getSongTime();
  refreshLaneNotePositions(lane, songTime);
  const bottom = getBottomNoteInLane(lane);
  if (bottom) {
    if (bottom.type === "hold") {
      startHold(bottom, bottom.overlapRatio);
    } else {
      const hitOverlap = getOverlapForNoteAtTime(bottom, songTime - getHitForgivenessSec());
      state.lastTapHitLane = bottom.lane;
      state.lastTapHitTime = songTime;
      markTapHit(bottom, hitOverlap, songTime);
    }
    return;
  }
  if (hasTouchable()) {
    if (!hasActiveHold()) consumeTopTouchableAsMiss();
    showJudgement("WRONG KEY", "#ff9a9a", "wrong");
    updateHud();
  }
}

function processJustPressed(songTime) {
  if (state.justPressedLanes.size === 0) {
    return;
  }
  const lanes = Array.from(state.justPressedLanes);
  state.justPressedLanes.clear();
  const actions = [];
  let wrong = false;
  const touchable = hasTouchable();

  for (const lane of lanes) {
    const activeHoldInLane = state.notes.some(
      (note) => note.type === "hold" && note.started && !note.judged && note.lane === lane
    );
    if (activeHoldInLane) {
      continue;
    }
    const bottom = getBottomNoteInLane(lane);
    if (bottom) {
      if (bottom.type === "hold") {
        actions.push({ kind: "hold", note: bottom, overlap: bottom.overlapRatio });
      } else {
        actions.push({ kind: "tap", note: bottom, overlap: bottom.overlapRatio });
      }
      continue;
    }
    if (touchable) {
      wrong = true;
    }
  }

  if (wrong) {
    if (!hasActiveHold()) {
      consumeTopTouchableAsMiss();
    }
    showJudgement("WRONG KEY", "#ff9a9a", "wrong");
    updateHud();
    return;
  }

  for (const action of actions) {
    if (action.kind === "tap") {
      state.lastTapHitLane = action.note.lane;
      state.lastTapHitTime = songTime;
      markTapHit(action.note, action.overlap, songTime);
    } else {
      startHold(action.note, action.overlap);
    }
  }
}

function updateHoldProgress(songTime) {
  const dtStart = state.lastSongTime;
  const dtEnd = Math.max(dtStart, songTime);
  const holdGrace = HOLD_RELEASE_GRACE * (state.levelProfile?.holdGraceMult || 1);
  for (const note of state.notes) {
    if (note.judged || note.type !== "hold" || !note.started) {
      continue;
    }
    const from = Math.max(dtStart, note.time);
    const to = Math.min(dtEnd, note.endTime);
    if (to <= from) {
      continue;
    }
    const dt = to - from;
    if (state.pressedLanes.has(note.lane)) {
      note.heldTime += dt;
      note.unheldGap = 0;
    } else {
      note.unheldGap += dt;
      if (note.unheldGap <= holdGrace) {
        note.heldTime += dt;
      } else {
        finalizeHold(note, "break");
      }
    }
  }
}

function getRequiredLanes(songTime) {
  const lanes = new Set();
  for (const note of state.notes) {
    if (note.judged) {
      continue;
    }
    if (note.type === "hold" && note.started && songTime < note.endTime) {
      lanes.add(note.lane);
    } else if (note.overlapRatio > 0) {
      lanes.add(note.lane);
    }
  }
  return lanes;
}

function enforceConcurrentCap(songTime) {
  const requiredNotes = state.notes.filter((note) => !note.judged && (
    (note.type === "hold" && note.started && songTime < note.endTime) ||
    note.overlapRatio > 0
  ));
  const byLane = new Map();
  for (const note of requiredNotes) {
    const existing = byLane.get(note.lane);
    const basePriority = (note.type === "hold" && note.started) ? 3 : 2;
    const melodyBoost = note.poly === 0 ? 1 : 0;
    const priority = basePriority + melodyBoost;
    const score = priority * 10 + note.overlapRatio;
    if (!existing || score > existing.score) {
      byLane.set(note.lane, { score, note });
    }
  }
  const lanes = [...byLane.entries()].map(([lane, payload]) => ({ lane, ...payload }));
  if (lanes.length <= MAX_CONCURRENT_REQUIRED_KEYS) {
    return;
  }
  lanes.sort((a, b) => b.score - a.score);
  const keepLanes = new Set(lanes.slice(0, MAX_CONCURRENT_REQUIRED_KEYS).map((x) => x.lane));
  for (const note of requiredNotes) {
    if (!keepLanes.has(note.lane)) {
      if (note.type === "hold" && note.started) {
        finalizeHold(note, "break");
      } else {
        markMiss(note);
      }
    }
  }
}

function gameLoop() {
  if (!state.isPlaying || state.phase !== "playing") {
    return;
  }
  updateZoneBounds();
  const songTime = getSongTime();
  updateCountdownOverlay();
  updateProgressBar(songTime);
  renderNotes(songTime);
  enforceConcurrentCap(songTime);
  const inCountdown = state.countdownEndPerf > 0 && performance.now() < state.countdownEndPerf;
  if (!inCountdown) {
    processJustPressed(songTime);
    processHeldStarts();
    updateHoldProgress(songTime);
  }
  state.lastSongTime = songTime;

  if (songTime >= state.chartEndTime + 0.4) {
    finalizeGame();
    return;
  }
  state.animationHandle = requestAnimationFrame(gameLoop);
}

function computeLetterGrade(rate, gradeCounts, totalJudged) {
  if (totalJudged < 3) {
    return { letter: "—", label: "Play more notes" };
  }
  const perfectRatio = gradeCounts.perfect / totalJudged;
  const greatRatio = gradeCounts.great / totalJudged;
  const goodOrBetter = (gradeCounts.perfect + gradeCounts.great + gradeCounts.good) / totalJudged;
  if (rate >= 98 && perfectRatio >= 0.85) {
    return { letter: "S", label: "Flawless" };
  }
  if (rate >= 95 && (perfectRatio + greatRatio) >= 0.9) {
    return { letter: "A", label: "Excellent" };
  }
  if (rate >= 88 && goodOrBetter >= 0.85) {
    return { letter: "B", label: "Great" };
  }
  if (rate >= 75 || goodOrBetter >= 0.65) {
    return { letter: "C", label: "Good" };
  }
  if (rate >= 50) {
    return { letter: "D", label: "Keep practicing" };
  }
  return { letter: "E", label: "Retry" };
}

function finalizeGame() {
  state.isPlaying = false;
  state.phase = "finished";
  state.songAnalysis = null;
  state.songScore = null;
  state.bgmStartAtSongTime = 0;
  stopBackgroundSong();
  cancelAnimationFrame(state.animationHandle);
  for (const note of state.notes) {
    if (note.type === "hold" && note.started && !note.judged) {
      finalizeHold(note, "end");
    }
  }
  const judged = state.totalJudgedNotes || 1;
  const rate = (state.successfulNotes / judged) * 100;
  const grade = computeLetterGrade(rate, state.gradeCounts, state.totalJudgedNotes);
  elements.finalScore.textContent = String(state.score);
  elements.finalPercent.textContent = `${rate.toFixed(1)}% (${state.successfulNotes}/${state.totalJudgedNotes})`;
  elements.gradeBreakdown.textContent =
    `Perfect ${state.gradeCounts.perfect} | Great ${state.gradeCounts.great} | Good ${state.gradeCounts.good} | Bad ${state.gradeCounts.bad} | Miss ${state.gradeCounts.miss}`;
  const modalCard = elements.resultModal?.querySelector(".modal-card");
  if (elements.finalGrade) {
    elements.finalGrade.textContent = grade.letter;
    elements.finalGrade.dataset.grade = grade.letter;
    const labelEl = elements.resultModal?.querySelector(".final-grade-label");
    if (labelEl) {
      labelEl.textContent = grade.label;
    }
  }
  if (modalCard) {
    modalCard.dataset.grade = grade.letter;
  }
  const maxComboEl = elements.resultModal?.querySelector(".final-max-combo");
  if (maxComboEl) {
    maxComboEl.textContent = String(state.maxCombo);
  }

  if (state.song) {
    const key = `rhythm_drop_best_${state.song.id}`;
    const best = Number(localStorage.getItem(key)) || 0;
    const nextBest = Math.max(best, state.score);
    localStorage.setItem(key, String(nextBest));
    elements.bestScore.textContent = String(nextBest);
    const newBestEl = elements.resultModal?.querySelector(".result-new-best");
    if (newBestEl) {
      newBestEl.classList.toggle("visible", state.score > best && state.totalJudgedNotes >= 5);
    }
  }
  elements.resultModal.classList.remove("hidden");
}

function mountNotes() {
  elements.notesLayer.innerHTML = "";
  state.noteMapByLane = [[], [], [], []];
  for (const note of state.notes) {
    createNoteElement(note);
    state.noteMapByLane[note.lane].push(note);
  }
}

function resetStats() {
  state.score = 0;
  state.combo = 0;
  state.successHits = 0;
  state.successfulNotes = 0;
  state.totalJudgedNotes = 0;
  state.gradeCounts = { perfect: 0, great: 0, good: 0, bad: 0, miss: 0 };
  state.pressedLanes.clear();
  state.justPressedLanes.clear();
  state.processedLanesThisPress.clear();
  state.lastProcessedLaneAt.fill(0);
  state.lastSongTime = 0;
  state.maxCombo = 0;
  state.lastTapHitLane = -1;
  state.lastTapHitTime = -999;
  state.countdownEndPerf = 0;
  state.lastComboMilestone = 0;
  state.pauseCooldownUntil = 0;
  if (state.comboMilestoneTimeout) {
    clearTimeout(state.comboMilestoneTimeout);
    state.comboMilestoneTimeout = null;
  }
  elements.comboMilestoneOverlay?.classList.add("hidden");
  elements.judgementCenterOverlay?.classList.add("hidden");
  clearTimeout(judgementCenterTimeout);
  judgementCenterTimeout = null;
  updateHud();
  showJudgement("Ready", "#f4f5ff", "ready");
}

function buildEmergencyPattern(song) {
  const beat = 60 / song.bpm;
  const step = Math.max(0.2, beat / 2);
  const events = [];
  for (let t = song.startAt; t < song.endAt - 0.1; t += step) {
    events.push({ t, type: "tap", d: Math.max(0.08, step * 0.9), poly: 0, midi: 60 });
  }
  return { version: PATTERN_VERSION, events };
}

async function startGame(songId) {
  if (!state.bootstrapReady) {
    elements.homeStatus.textContent = "Preparing game database before start...";
    await bootstrapGameDatabase();
  }
  if (state.isPreparing) {
    return;
  }
  const token = state.startToken + 1;
  state.startToken = token;
  state.phase = "preparing";
  state.isPreparing = true;
  elements.startBtn.disabled = true;
  elements.homeStatus.textContent = "Preparing song pattern and audio...";

  const song = getAllSongs().find((item) => item.id === songId);
  if (!song) {
    state.isPreparing = false;
    state.phase = "idle";
    elements.startBtn.disabled = false;
    return;
  }

  try {
    if (song.url) {
      ensureAudioPool(song.url);
    }
    // Start-button click is a valid user gesture: unlock pool here to avoid first-hit silence.
    await unlockAudioPoolFromKeyGesture();
    const ctx = getAudioContext();
    if (ctx) {
      try {
        await ctx.resume();
      } catch {
        // Continue in suspended/no-audio mode.
      }
      state.outputLatencySec = getContextOutputLatencySec(ctx);
    }
    const prepared = await prepareSong(song);
    if (token !== state.startToken) {
      return;
    }
    if (ctx) {
      try {
        await ctx.resume();
      } catch {
        // fallback remains available
      }
    }

    state.song = song;
    state.levelProfile = getLevelProfile(song.stars);
    state.comboShieldReady = false;
    state.songKeyIndex = prepared.keyIndex || 0;
    state.songAnalysis = prepared.analysisTimeline || null;
    state.songStartAtEffective = prepared.effectiveStartAt || song.startAt;
    state.chartLeadIn = 0;
    state.lastAccentAt = -999;
    state.adaptiveLatencySec = 0;
    state.adaptiveLatencySamples = 0;
    state.audioBuffer = prepared.audioBuffer;
    state.songScore = prepared.score || null;
    await prepareBackgroundSong(song);
    if (song.url) {
      await warmUpAudioPool(song.url);
    }
    if (token !== state.startToken) {
      return;
    }
    resetStats();
    state.notes = instantiateNotes(song, prepared.pattern, state.songStartAtEffective);
    if (state.notes.length === 0) {
      const emergencyPattern = buildEmergencyPattern(song);
      state.notes = instantiateNotes(song, emergencyPattern, state.songStartAtEffective);
    }
    if (state.notes.length === 0) {
      const hardEmergency = buildEmergencyPattern(song);
      const leadIn = Math.max(getLeadInTime(song), getEffectiveBaseTravelTime(song) + 0.32);
      state.notes = hardEmergency.events.map((ev, idx) => ({
        id: idx + 1,
        lane: idx % 4,
        type: "tap",
        time: Math.max(0, ev.t - state.songStartAtEffective) + leadIn,
        duration: ev.d,
        endTime: Math.max(0, ev.t - state.songStartAtEffective) + leadIn + ev.d,
        clipStart: ev.t,
        clipDuration: Math.max(0.1, ev.d + 0.08),
        travelTime: getEffectiveBaseTravelTime(song),
        midi: Number.isFinite(ev.midi) ? ev.midi : 60,
        judged: false,
        started: false,
        headGrade: null,
        heldTime: 0,
        unheldGap: 0,
        overlapRatio: 0,
        topY: -9999,
        bottomY: -9999,
        trailHeight: 0,
        holdSparkEl: null,
        activeSource: null,
        activeGain: null,
        activePlayback: null,
        element: null
      }));
    }
    state.chartEndTime = state.notes.length > 0
      ? state.notes[state.notes.length - 1].endTime
      : Math.max(4, song.endAt);

    switchScreen("game");
    elements.resultModal.classList.add("hidden");
    elements.escResumeHint?.classList.add("hidden");
    elements.notesLayer.style.opacity = "0";
    updateZoneBounds();
    mountNotes();
    elements.currentSongName.textContent = `${song.title} - ${song.artist} (${song.stars}/5, ${state.levelProfile.name})`;
    updateHudBestScore();
    setPlayfieldLevelClass(song.stars);

    state.chartLeadIn = state.notes[0]?.time ?? Math.max(getLeadInTime(song), getEffectiveBaseTravelTime(song) + 0.32);
    state.bgmStarted = false;
    state.bgmStartAtSongTime = state.chartLeadIn;
    const countdownMs = 3100;
    state.countdownEndPerf = performance.now() + countdownMs;
    state.songStartContextTime = (ctx && ctx.state === "running") ? ctx.currentTime + countdownMs / 1000 : 0;
    state.songStartPerfNow = performance.now() + countdownMs;
    state.phase = "playing";
    state.isPlaying = true;
    queueBackgroundSongStart(countdownMs / 1000 + state.bgmStartAtSongTime);
    renderNotes(0);
    elements.notesLayer.style.opacity = "1";
    state.animationHandle = requestAnimationFrame(gameLoop);
    if (prepared.mode === "sample") {
      elements.homeStatus.textContent = prepared.analysisSource === "meyda"
        ? "Ready to play (Meyda analysis)."
        : "Ready to play.";
    } else {
      elements.homeStatus.textContent = "Ready (HTML audio fallback mode).";
    }
  } catch (error) {
    if (token !== state.startToken) {
      return;
    }
    switchScreen("home");
    elements.homeStatus.textContent = `Preparation failed: ${error?.message || "Unknown error"}`;
  } finally {
    if (token === state.startToken) {
      state.isPreparing = false;
      if (state.phase !== "playing") {
        state.phase = "idle";
      }
      elements.startBtn.disabled = false;
    }
  }
}

function stopAndReturnHome() {
  state.startToken += 1;
  state.isPlaying = false;
  updateHomeBestScore();
  state.isPreparing = false;
  state.phase = "idle";
  elements.escResumeHint?.classList.add("hidden");
  state.songAnalysis = null;
  state.songScore = null;
  state.bgmStartAtSongTime = 0;
  stopBackgroundSong();
  cancelAnimationFrame(state.animationHandle);
  for (const note of state.notes) {
    removeHoldSpark(note);
    stopHoldAudio(note);
  }
  clearAudioPool();
  state.pressedLanes.clear();
  state.justPressedLanes.clear();
  state.processedLanesThisPress.clear();
  state.lastProcessedLaneAt.fill(0);
  elements.notesLayer.style.opacity = "1";
  elements.resultModal.classList.add("hidden");
  elements.homeStatus.textContent = "Ready to play.";
  switchScreen("home");
}

function initSongMenu() {
  const stars = (count) => "★★★★★".slice(0, count) + "☆☆☆☆☆".slice(count);
  const existing = elements.songSelect.querySelectorAll("option");
  for (const opt of existing) opt.remove();
  const fragment = document.createDocumentFragment();
  for (const song of getAllSongs()) {
    const profile = getLevelProfile(song.stars);
    const option = document.createElement("option");
    option.value = song.id;
    option.textContent = `${song.title} (${song.artist}) - ${stars(song.stars)} ${song.stars}/5 · ${profile.name}`;
    fragment.appendChild(option);
  }
  elements.songSelect.appendChild(fragment);
  const all = getAllSongs();
  if (all.length > 0) {
    const valid = all.some((s) => s.id === elements.songSelect.value);
    if (!valid) elements.songSelect.value = all[0].id;
  }
  updateHomeBestScore();
}

function pickRandomSong() {
  const all = getAllSongs();
  elements.songSelect.value = all[Math.floor(Math.random() * all.length)].id;
  updateHomeBestScore();
}

function mapEventToLane(eventKey) {
  return DIRECTION_META.find((item) => item.keys.includes(eventKey))?.lane;
}

function onKeyDown(event) {
  if (event.key === "Escape") {
    if (state.isPlaying && state.phase === "playing") {
      event.preventDefault();
      pauseGame();
      return;
    }
    if (state.phase === "paused") {
      event.preventDefault();
      resumeGame();
      return;
    }
  }
  if (!state.isPlaying) {
    return;
  }
  const lane = mapEventToLane(event.key);
  if (lane === undefined) {
    return;
  }
  event.preventDefault();
  if (event.repeat) {
    return;
  }
  const ctx = getAudioContext();
  if (ctx && ctx.state !== "running") {
    ctx.resume().catch(() => {});
  }
  unlockAudioPoolFromKeyGesture();
  state.pressedLanes.add(lane);
  const now = performance.now();
  const COOLDOWN_MS = 45;
  if (state.processedLanesThisPress.has(lane) || (now - state.lastProcessedLaneAt[lane]) < COOLDOWN_MS) {
    return;
  }
  state.processedLanesThisPress.add(lane);
  state.lastProcessedLaneAt[lane] = now;
  processSingleKeyPressImmediate(lane);
}

function pauseGame() {
  if (state.phase !== "playing") return;
  if (state.countdownEndPerf > 0 && performance.now() < state.countdownEndPerf) return;
  if (performance.now() < state.pauseCooldownUntil) return;
  state.pausedAtSongTime = getSongTime();
  state.phase = "paused";
  state.pauseCooldownUntil = performance.now() + 500;
  cancelAnimationFrame(state.animationHandle);
  state.animationHandle = null;
  if (state.bgmAudio && state.bgmStarted) {
    state.bgmAudio.pause();
  }
  elements.pauseOverlay?.classList.remove("hidden");
  elements.escResumeHint?.classList.remove("hidden");
}

function resumeGame() {
  if (state.phase !== "paused" || state.pausedAtSongTime < 0) return;
  if (performance.now() < state.pauseCooldownUntil) return;
  const frozen = state.pausedAtSongTime;
  state.pausedAtSongTime = -1;
  state.phase = "playing";
  state.pauseCooldownUntil = performance.now() + 1200;
  state.songStartPerfNow = performance.now() - frozen * 1000;
  if (state.audioContext && state.audioContext.state === "running") {
    state.songStartContextTime = state.audioContext.currentTime - frozen;
  }
  elements.pauseOverlay?.classList.add("hidden");
  elements.escResumeHint?.classList.add("hidden");
  if (state.bgmAudio && state.bgmStarted) {
    state.bgmAudio.currentTime = (state.songStartAtEffective || 0) + frozen;
    state.bgmAudio.play().catch(() => {});
  }
  state.animationHandle = requestAnimationFrame(gameLoop);
}

function onKeyUp(event) {
  const lane = mapEventToLane(event.key);
  if (lane === undefined) {
    return;
  }
  event.preventDefault();
  state.pressedLanes.delete(lane);
  state.processedLanesThisPress.delete(lane);
  if (lane === state.lastTapHitLane) {
    state.lastTapHitLane = -1;
    state.lastTapHitTime = -999;
  }
}

function setupEvents() {
  elements.songSelect?.addEventListener("change", updateHomeBestScore);
  elements.startBtn.addEventListener("click", () => startGame(elements.songSelect.value));
  if (elements.importMidiBtn && elements.importMidiInput) {
    elements.importMidiBtn.addEventListener("click", () => elements.importMidiInput.click());
    elements.importMidiInput.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !file.name.toLowerCase().endsWith(".mid") && !file.name.toLowerCase().endsWith(".midi")) {
        return;
      }
      elements.homeStatus.textContent = "Importing MIDI...";
      try {
        const buf = await file.arrayBuffer();
        const parsed = parseMidiToScore(buf);
        if (!parsed) {
          elements.homeStatus.textContent = "Could not parse MIDI file.";
          return;
        }
        const baseName = file.name.replace(/\.(mid|midi)$/i, "");
        const id = `custom-${hashSeed(baseName + parsed.duration).toString(36)}`;
        const customSong = {
          id,
          title: baseName,
          artist: "Imported (MIDI)",
          url: null,
          midiScore: parsed.score,
          bpm: parsed.bpm,
          startAt: 0,
          endAt: Math.ceil(parsed.duration) + 2,
          stars: clamp(Math.round(parsed.score.length / parsed.duration * 0.5), 1, 5),
          baseTravelTime: Math.max(2.2, 3.5 - parsed.score.length / parsed.duration * 0.4),
          maxNotesPerSecond: 2,
          densityScale: 0.8,
          holdChanceBase: 0.05,
          chordChanceScale: 0.1
        };
        const custom = loadCustomSongs();
        const existing = custom.findIndex((s) => s.id === id);
        if (existing >= 0) custom.splice(existing, 1);
        custom.push(customSong);
        saveCustomSongs(custom);
        preparedSongs.delete(id);
        initSongMenu();
        elements.songSelect.value = id;
        elements.homeStatus.textContent = `Imported "${baseName}" (${parsed.score.length} notes, ${parsed.duration.toFixed(1)}s).`;
      } catch (err) {
        elements.homeStatus.textContent = `Import failed: ${err?.message || "Unknown error"}`;
      }
    });
  }
  if (elements.importMp3Btn && elements.importMp3Input) {
    elements.importMp3Btn.addEventListener("click", () => elements.importMp3Input.click());
    elements.importMp3Input.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      const ext = file?.name.toLowerCase().match(/\.(mp3|wav|ogg|flac)$/)?.[1];
      if (!file || !ext) return;
      elements.homeStatus.textContent = "Loading audio...";
      try {
        const ctx = getAudioContext() || new (window.AudioContext || window.webkitAudioContext)();
        const buf = await file.arrayBuffer();
        const decoded = await ctx.decodeAudioData(buf.slice(0));
        const ch0 = decoded.getChannelData(0);
        const ch1 = decoded.numberOfChannels > 1 ? decoded.getChannelData(1) : ch0;
        const mono = new Float32Array(ch0.length);
        for (let i = 0; i < ch0.length; i++) mono[i] = (ch0[i] + ch1[i]) / 2;
        const targetRate = 22050;
        let resampled = mono;
        if (decoded.sampleRate !== targetRate) {
          const ratio = targetRate / decoded.sampleRate;
          const newLen = Math.floor(mono.length * ratio);
          resampled = new Float32Array(newLen);
          for (let i = 0; i < newLen; i++) {
            const src = i / ratio;
            const j = Math.floor(src);
            const f = src - j;
            resampled[i] = j + 1 < mono.length ? mono[j] * (1 - f) + mono[j + 1] * f : mono[j];
          }
        }
        elements.homeStatus.textContent = "Transcribing with AI... (may take 30s)";
        const modelPath = "/basic-pitch-model/model.json";
        const basicPitch = new BasicPitch(modelPath);
        const frames = [];
        const onsets = [];
        const contours = [];
        const audioBuffer22050 = ctx.createBuffer(1, resampled.length, targetRate);
        audioBuffer22050.getChannelData(0).set(resampled);
        await basicPitch.evaluateModel(
          audioBuffer22050,
          (f, o, c) => {
            frames.push(...f);
            onsets.push(...o);
            contours.push(...c);
          },
          (pct) => {
            elements.homeStatus.textContent = `Transcribing... ${Math.round(pct * 100)}%`;
          }
        );
        const noteEvents = outputToNotesPoly(frames, onsets, 0.25, 0.25, 5);
        const withBends = addPitchBendsToNoteEvents(contours, noteEvents);
        const notesTime = noteFramesToTime(withBends);
        const score = notesTime
          .filter((n) => n.pitchMidi >= 21 && n.pitchMidi <= 108 && n.durationSeconds >= 0.03)
          .map((n) => ({ t: n.startTimeSeconds, d: Math.max(0.05, n.durationSeconds), midi: Math.round(n.pitchMidi) }))
          .sort((a, b) => a.t - b.t);
        if (score.length < 4) {
          elements.homeStatus.textContent = "Too few notes detected. Try a clearer melody.";
          return;
        }
        const duration = Math.max(0, ...score.map((n) => n.t + n.d));
        const baseName = file.name.replace(/\.(mp3|wav|ogg|flac)$/i, "");
        const id = `custom-${hashSeed(baseName + duration).toString(36)}`;
        const customSong = {
          id,
          title: baseName,
          artist: "Imported (MP3)",
          url: null,
          midiScore: score,
          bpm: clamp(Math.round(60 / (duration / Math.max(1, score.length)) * 2), 60, 200),
          startAt: 0,
          endAt: Math.ceil(duration) + 2,
          stars: clamp(Math.round(score.length / duration * 0.5), 1, 5),
          baseTravelTime: Math.max(2.2, 3.5 - score.length / duration * 0.4),
          maxNotesPerSecond: 2,
          densityScale: 0.8,
          holdChanceBase: 0.05,
          chordChanceScale: 0.1
        };
        const custom = loadCustomSongs();
        const existing = custom.findIndex((s) => s.id === id);
        if (existing >= 0) custom.splice(existing, 1);
        custom.push(customSong);
        saveCustomSongs(custom);
        preparedSongs.delete(id);
        initSongMenu();
        elements.songSelect.value = id;
        elements.homeStatus.textContent = `Imported "${baseName}" (${score.length} notes, ${duration.toFixed(1)}s).`;
      } catch (err) {
        elements.homeStatus.textContent = `Import failed: ${err?.message || "Unknown error"}`;
      }
    });
  }
  elements.randomSongBtn.addEventListener("click", pickRandomSong);
  if (elements.howToPlayToggle && elements.howToPlayContent) {
    elements.howToPlayToggle.addEventListener("click", () => {
      const expanded = elements.howToPlayToggle.getAttribute("aria-expanded") === "true";
      elements.howToPlayToggle.setAttribute("aria-expanded", !expanded);
      elements.howToPlayContent.hidden = expanded;
    });
  }
  if (elements.deleteSongBtn) {
    elements.deleteSongBtn.addEventListener("click", () => {
      const id = elements.songSelect?.value;
      if (!id) {
        elements.homeStatus.textContent = "Select a song first.";
        return;
      }
      if (isBuiltinSong(id)) {
        elements.homeStatus.textContent = "Built-in songs cannot be deleted.";
        return;
      }
      if (!id.startsWith("custom-")) {
        elements.homeStatus.textContent = "Select an imported song to delete.";
        return;
      }
      const custom = loadCustomSongs().filter((s) => s.id !== id);
      saveCustomSongs(custom);
      preparedSongs.delete(id);
      try {
        localStorage.removeItem(`rhythm_drop_pattern_${PATTERN_VERSION}_${id}`);
        localStorage.removeItem(`rhythm_drop_best_${id}`);
      } catch {}
      initSongMenu();
      elements.songSelect.value = elements.songSelect.options[0]?.value || "twinkle";
      elements.homeStatus.textContent = "Song removed.";
    });
  }
  elements.retryBtn.addEventListener("click", () => {
    elements.resultModal.classList.add("hidden");
    startGame(state.song?.id || elements.songSelect.value);
  });
  elements.homeBtn.addEventListener("click", stopAndReturnHome);
  elements.backHomeBtn.addEventListener("click", stopAndReturnHome);
  elements.fxVolume.addEventListener("input", (event) => {
    state.fxVolume = Number(event.target.value);
    for (const clip of state.audioPool) {
      clip.audio.volume = Math.max(0, Math.min(1, state.fxVolume));
    }
    localStorage.setItem("rhythm_drop_fx_volume", String(state.fxVolume));
  });
  elements.latencyOffset.addEventListener("input", (event) => {
    const ms = Number(event.target.value);
    state.manualLatencySec = clamp(ms / 1000, -0.18, 0.28);
    elements.latencyValue.textContent = `${Math.round(ms)}ms`;
    localStorage.setItem("rhythm_drop_latency_ms", String(Math.round(ms)));
  });
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  document.addEventListener("keydown", (e) => {
    if (e.key === "r" || e.key === "R") {
      const modal = elements.resultModal;
      if (modal && !modal.classList.contains("hidden")) {
        e.preventDefault();
        modal.classList.add("hidden");
        startGame(state.song?.id || elements.songSelect.value);
      }
    }
  });
}

function init() {
  initSongMenu();
  setupEvents();
  elements.fxVolume.value = String(state.fxVolume);
  elements.latencyOffset.value = String(Math.round(state.manualLatencySec * 1000));
  elements.latencyValue.textContent = `${Math.round(state.manualLatencySec * 1000)}ms`;
  updateHud();
  bootstrapGameDatabase();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").then((reg) => {
      reg.update();
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      }, { once: true });
    }).catch(() => {});
  }
}

init();
