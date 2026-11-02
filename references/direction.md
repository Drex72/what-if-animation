# Animation direction: intent before keyframes

This layer is optional and additive: original shots still work unchanged. It gives an agent a small vocabulary for character acting and camera motivation without introducing a physics solver.

## Before animating an action shot

Decide:
1. **Intent:** what the character wants or realizes.
2. **Readable action:** one primary action with a clear silhouette, and what object/character it affects.
3. **Contact beat:** the shot-local frame when the action becomes obvious; align it with the relevant word (within ~3 frames).
4. **Camera job:** show, follow, reveal, or emphasize. If movement adds nothing, use a hold.

Use one main action per short shot. Plan preparation, contact, and recovery. A held pose is fine if the environment carries life; do not animate everything constantly.

## Optional reusable API

```tsx
import { act, actSequence, directedCamera, LOOKS, Hero, basePose } from '../../engine';
const starting = { ...basePose, x: 900, y: 700, yaw: 0.4 };
const pose = act('reach', t, { from: starting, target: { x: 1050, y: 640 }, start: 4, duration: 18 });
const cam = directedCamera('push', t, { from: { x: 960, y: 540, zoom: 1.5 }, to: { zoom: 1.75 }, duration: 30 });
return <g transform={cam}><Hero look={LOOKS.pipHood} pose={pose} /></g>;
```

Available actions: `reach`, `point`, `turn`, `react`, `jump`, `land`, `nod`. Times are frames and all functions are deterministic. Use `poseAt` for custom acting and for prop transfers. `actSequence` is intended for non-overlapping actions; use manual keyframes for overlapping choreography. `reach` chooses the near arm by yaw; inspect reach shots and adjust manually if the target crosses the body.

Camera moves: `hold`, `push`, `pull`, `follow`, `reveal`, `impact`. The caller sets starting and ending coordinates; move names describe direction, not automatic framing. `impact` adds a brief shake. Never apply camera movement just to avoid a static shot.

## Motion review

Inspect start, anticipation, contact, settle, and end frames, not merely the storyboard key pose. Check:
- the action reads silently at phone size;
- feet and objects do not slide or teleport accidentally;
- the pose has no unmotivated limb flips, and silhouette is clear;
- the camera does not crop the subject during a move;
- expressions change when something happens;
- sound effects hit the visible contact, without masking narration.

Keep a before/after comparison of the same episode. Do not claim a quality improvement without reviewing rendered motion. These helpers do not simulate weight, collisions, or actual lighting physics.
