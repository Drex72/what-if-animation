/**
 * Small, deterministic acting vocabulary on top of the existing Pose rig.
 * All times are shot-local frames; no React state, randomness or physics engine.
 * Presets hold the start pose before the action and the finish pose afterwards.
 */
import { clamp, easeInOut, easeOut, lerp } from './anim';
import { basePose, poseAt, reachAngle, type Pose, type Expr } from './rig';

type Point = { x: number; y: number };
export type ActionName = 'reach' | 'point' | 'turn' | 'react' | 'jump' | 'land' | 'nod';
export type ActionOptions = {
  from?: Pose;
  start?: number;
  duration?: number;
  intensity?: number;
  target?: Point;
  yaw?: number;
  expression?: Expr;
  /** Screen-space distance for a jump; negative values move left. */
  distance?: number;
};
const rad = (v: number) => v * Math.PI / 180;
const phase = (t: number, start: number, duration: number) => clamp((t - start) / duration);
const pulse = (p: number) => Math.sin(Math.PI * p);
const bounded = (v: number, low: number, high: number) => Math.max(low, Math.min(high, v));

/** A pose for a single action, including its anticipation and settle. */
export function act(name: ActionName, t: number, options: ActionOptions = {}): Pose {
  const from = options.from ?? basePose;
  const start = options.start ?? 0;
  const duration = Math.max(1, options.duration ?? 18);
  const intensity = bounded(options.intensity ?? 1, 0, 2);
  const p = phase(t, start, duration);
  if (t <= start) return from;
  const prepare = start + duration * 0.22;
  const contact = start + duration * 0.76;
  const end = start + duration;
  const hand = from.yaw < -0.3 ? 'L' : 'R';
  const armKey = hand === 'L' ? 'armL' : 'armR';
  if (name === 'reach' || name === 'point') {
    const target = options.target ?? { x: from.x + 100 * from.scale, y: from.y - 100 * from.scale };
    // reachAngle follows the screen-right arm. Mirror for the left arm's sign convention.
    const angle = reachAngle(from, target) * (hand === 'L' ? -1 : 1);
    const aim = { a: bounded(angle, -175, 175), b: name === 'point' ? 0 : -12 };
    const keys = [
      { f: start, p: {} },
      { f: prepare, p: { tilt: from.tilt - 5 * intensity, [armKey]: { a: from[armKey].a - 12 * intensity, b: from[armKey].b } } },
      { f: contact, p: { tilt: from.tilt + 6 * intensity, [armKey]: aim, [hand === 'L' ? 'handL' : 'handR']: name === 'point' ? 'point' : 'open' } },
      { f: end, p: { tilt: from.tilt + 3 * intensity, [armKey]: aim, [hand === 'L' ? 'handL' : 'handR']: name === 'point' ? 'point' : 'open' } },
    ];
    return poseAt(t, keys, from);
  }
  if (name === 'turn') {
    const yaw = bounded(options.yaw ?? -from.yaw || 0.8, -1, 1);
    return poseAt(t, [
      { f: start, p: {} },
      { f: prepare, p: { headTilt: from.headTilt - 7 * intensity, look: Math.sign(yaw - from.yaw) } },
      { f: contact, p: { yaw, headTilt: from.headTilt + 3 * intensity, look: 0 } },
      { f: end, p: { yaw, headTilt: from.headTilt, look: 0 } },
    ], from);
  }
  if (name === 'react') {
    const expression = options.expression ?? 'shock';
    const jerk = 13 * intensity;
    return poseAt(t, [
      { f: start, p: {} },
      { f: start + duration * 0.18, p: { look: from.look, headTilt: from.headTilt - 3 * intensity } },
      { f: start + duration * 0.38, p: { headTilt: from.headTilt + jerk, tilt: from.tilt - 8 * intensity, expr: expression, squash: -0.06 * intensity } },
      { f: start + duration * 0.72, p: { headTilt: from.headTilt - 3 * intensity, tilt: from.tilt + 2 * intensity, expr: expression, squash: 0.015 * intensity } },
      { f: end, p: { headTilt: from.headTilt, tilt: from.tilt, expr: expression, squash: 0 } },
    ], from);
  }
  if (name === 'jump') {
    const distance = options.distance ?? 0;
    const travel = easeInOut(p);
    // Begin and end at the same ground height. Peak is in the middle.
    const height = 75 * intensity * Math.pow(pulse(p), 1.25);
    const anticipation = p < 0.2 ? 0.08 * intensity * pulse(p / 0.2) : 0;
    const landing = p > 0.85 ? 0.075 * intensity * pulse((p - 0.85) / 0.15) : 0;
    return {
      ...from, x: from.x + distance * travel,
      y: from.y - height,
      squash: anticipation + landing - 0.07 * intensity * pulse(p),
      armL: { a: from.armL.a + 50 * intensity * pulse(p), b: from.armL.b },
      armR: { a: from.armR.a + 50 * intensity * pulse(p), b: from.armR.b },
      legL: { a: from.legL.a + 22 * intensity * pulse(p), b: -35 * intensity * pulse(p) },
      legR: { a: from.legR.a - 22 * intensity * pulse(p), b: -35 * intensity * pulse(p) },
      sway: from.sway + 9 * intensity * pulse(p),
    };
  }
  if (name === 'land') {
    const q = Math.max(0, t - start);
    const damp = Math.exp(-q / Math.max(1, duration * 0.28));
    const squash = 0.12 * intensity * damp * Math.cos(q * rad(28));
    return { ...from, squash: from.squash + squash, tilt: from.tilt + 4 * intensity * damp * Math.sin(q * rad(28)) };
  }
  // nod: a restrained, non-looping acknowledgement
  return { ...from, headTilt: from.headTilt + 12 * intensity * Math.pow(pulse(p), 2) };
}

/** Bridge multiple independently scheduled actions, carrying forward their final pose. */
export function actSequence(t: number, actions: Array<{ name: ActionName; options: ActionOptions }>, initial: Pose = basePose): Pose {
  const sorted = [...actions].sort((a, b) => (a.options.start ?? 0) - (b.options.start ?? 0));
  let pose = initial;
  for (const step of sorted) {
    const start = step.options.start ?? 0;
    if (t < start) break;
    const duration = Math.max(1, step.options.duration ?? 18);
    const final = start + duration;
    pose = act(step.name, Math.min(t, final), { ...step.options, from: pose });
    if (t < final) break;
  }
  return pose;
}
