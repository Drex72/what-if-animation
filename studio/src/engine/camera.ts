/** Named camera moves using the existing 1920x1080 SVG camera transform. */
import { camT, clamp, easeInOut, easeOut, lerp, shake } from './anim';

export type CameraFrame = { x: number; y: number; zoom: number };
export type CameraMove = 'hold' | 'push' | 'pull' | 'follow' | 'reveal' | 'impact';
export type CameraOptions = {
  from: CameraFrame;
  to?: Partial<CameraFrame>;
  start?: number;
  duration?: number;
  /** Amount of shake in world units. Only applied to impact moves. */
  strength?: number;
};
export const cameraAt = (move: CameraMove, t: number, options: CameraOptions): CameraFrame => {
  const { from } = options;
  const to = { ...from, ...options.to };
  const start = options.start ?? 0;
  const duration = Math.max(1, options.duration ?? 24);
  const p = clamp((t - start) / duration);
  const eased = move === 'reveal' ? easeOut(p) : easeInOut(p);
  const alpha = move === 'hold' ? 0 : eased;
  const x = lerp(from.x, to.x, alpha);
  const y = lerp(from.y, to.y, alpha);
  const zoom = Math.max(0.05, lerp(from.zoom, to.zoom, alpha));
  if (move !== 'impact') return { x, y, zoom };
  const offset = shake(t, start, Math.min(12, duration), options.strength ?? 8);
  return { x: x + offset.x, y: y + offset.y, zoom };
};
export const directedCamera = (move: CameraMove, t: number, options: CameraOptions): string => {
  const c = cameraAt(move, t, options);
  return camT(c.x, c.y, c.zoom);
};
