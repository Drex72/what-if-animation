/**
 * Grounded staging for the SVG character rig.
 * Opt in at the shot boundary: airborne moments (jump/fall/flight) must not be planted.
 * Grounding adjusts only hip Y, preserving acting, pose, and joint angles.
 */
import { joints, toWorld, type Pose } from './rig';

export type Surface = number | ((x: number) => number);
export type GroundingOptions = {
  /** True only for explicitly airborne story action, e.g. a jump, fall, flight. */
  airborne?: boolean;
  /** Optional contact tolerance in world pixels. */
  tolerance?: number;
};

export type FootContact = { x: number; y: number; groundY: number; delta: number };

/** World-space foot positions with per-foot support height. */
export const footContacts = (pose: Pose, surface: Surface): FootContact[] => {
  const js = joints(pose);
  return [js.legL.end, js.legR.end].map(foot => {
    const world = toWorld(pose, foot);
    const groundY = typeof surface === 'number' ? surface : surface(world.x);
    if (!Number.isFinite(groundY)) throw new Error('Ground surface must return a finite Y');
    return { ...world, groundY, delta: groundY - world.y };
  });
};

/**
 * Ground the lowest supported foot without requiring both feet to touch.
 * For steps, evaluates the surface at each actual foot X (not at the hip).
 * If one foot is naturally planted, keep that foot planted; otherwise choose
 * the least vertical adjustment that doesn't force a foot through its surface.
 */
export const plantPose = (pose: Pose, surface: Surface, options: GroundingOptions = {}): Pose => {
  if (options.airborne) return pose;
  const contacts = footContacts(pose, surface);
  // The highest required hip correction keeps both feet on/above their own surfaces.
  // On a flat floor this puts the lower foot on the ground.
  const correction = Math.min(...contacts.map(c => c.delta));
  if (Math.abs(correction) <= (options.tolerance ?? 0.5)) return pose;
  return { ...pose, y: pose.y + correction };
};

export const plantPoseOnSurface = (pose: Pose, groundAtX: (x: number) => number, options?: GroundingOptions): Pose =>
  plantPose(pose, groundAtX, options);
