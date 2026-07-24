/** Local “second memory” for the interpretive coach — stays on device. */

export type FocusArea =
  | 'work'
  | 'family'
  | 'rest'
  | 'money'
  | 'relations'
  | 'other';

export interface CoachProfile {
  city?: string;
  work?: string;
  goal?: string;
  /** Default morning focus */
  primaryFocus?: FocusArea;
}

export interface DayCheckIn {
  dateKey: string; // YYYY-MM-DD local
  personalNumber: number;
  match: 1 | 2 | 3 | 4 | 5;
  mood?: number; // 1–5
  note?: string;
  energyLevel?: number; // 1–5
}

export interface CoachMessage {
  id: string;
  role: 'assistant' | 'user' | 'system';
  text: string;
  at: string; // ISO
  personalNumber?: number;
  dateKey?: string;
}

export interface CoachState {
  profile: CoachProfile;
  checkIns: DayCheckIn[];
  messages: CoachMessage[];
  /** YYYY-MM-DD → count of user messages that day (quota) */
  usageByDay: Record<string, number>;
}

const KEY = 'astronavigator_coach_v1';

const empty: CoachState = {
  profile: {},
  checkIns: [],
  messages: [],
  usageByDay: {},
};

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function loadCoachState(): CoachState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...empty, profile: {}, checkIns: [], messages: [], usageByDay: {} };
    const parsed = JSON.parse(raw) as Partial<CoachState>;
    return {
      profile: parsed.profile || {},
      checkIns: Array.isArray(parsed.checkIns) ? parsed.checkIns.slice(-120) : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages.slice(-200) : [],
      usageByDay: parsed.usageByDay || {},
    };
  } catch {
    return { ...empty, profile: {}, checkIns: [], messages: [], usageByDay: {} };
  }
}

export function saveCoachState(state: CoachState): void {
  const trimmed: CoachState = {
    ...state,
    checkIns: state.checkIns.slice(-120),
    messages: state.messages.slice(-200),
  };
  localStorage.setItem(KEY, JSON.stringify(trimmed));
}

export function getLocalDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getUsageToday(state: CoachState): number {
  return state.usageByDay[todayKey()] || 0;
}

export function canSendCoachMessage(
  state: CoachState,
  unlimited: boolean,
  freeLimit = 5
): boolean {
  if (unlimited) return true;
  return getUsageToday(state) < freeLimit;
}

export function recordUserMessage(state: CoachState): CoachState {
  const key = todayKey();
  return {
    ...state,
    usageByDay: {
      ...state.usageByDay,
      [key]: (state.usageByDay[key] || 0) + 1,
    },
  };
}

export function appendMessage(
  state: CoachState,
  msg: Omit<CoachMessage, 'id' | 'at'> & { id?: string; at?: string }
): CoachState {
  const full: CoachMessage = {
    id: msg.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: msg.at || new Date().toISOString(),
    role: msg.role,
    text: msg.text,
    personalNumber: msg.personalNumber,
    dateKey: msg.dateKey,
  };
  return { ...state, messages: [...state.messages, full] };
}

export function upsertCheckIn(state: CoachState, checkIn: DayCheckIn): CoachState {
  const rest = state.checkIns.filter((c) => c.dateKey !== checkIn.dateKey);
  return { ...state, checkIns: [...rest, checkIn].slice(-120) };
}

export function updateProfile(
  state: CoachState,
  patch: Partial<CoachProfile>
): CoachState {
  return { ...state, profile: { ...state.profile, ...patch } };
}

/** Simple personal stats for “second brain” insights */
export function statsByDayNumber(checkIns: DayCheckIn[]): Record<
  number,
  { count: number; avgMatch: number; avgMood: number }
> {
  const map: Record<number, { n: number; matchSum: number; moodSum: number; moodN: number }> =
    {};
  for (const c of checkIns) {
    const b = map[c.personalNumber] || { n: 0, matchSum: 0, moodSum: 0, moodN: 0 };
    b.n += 1;
    b.matchSum += c.match;
    if (c.mood) {
      b.moodSum += c.mood;
      b.moodN += 1;
    }
    map[c.personalNumber] = b;
  }
  const out: Record<number, { count: number; avgMatch: number; avgMood: number }> = {};
  for (const [k, v] of Object.entries(map)) {
    out[Number(k)] = {
      count: v.n,
      avgMatch: v.n ? v.matchSum / v.n : 0,
      avgMood: v.moodN ? v.moodSum / v.moodN : 0,
    };
  }
  return out;
}

export function bestDayNumbers(
  checkIns: DayCheckIn[],
  minSamples = 2
): { number: number; avgMatch: number; count: number }[] {
  return Object.entries(statsByDayNumber(checkIns))
    .map(([n, s]) => ({
      number: Number(n),
      avgMatch: s.avgMatch,
      count: s.count,
    }))
    .filter((x) => x.count >= minSamples)
    .sort((a, b) => b.avgMatch - a.avgMatch || b.count - a.count);
}
