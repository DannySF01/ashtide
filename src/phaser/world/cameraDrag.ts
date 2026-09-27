import Phaser from "phaser";

export interface CameraDragBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const DEFAULT_BOUNDS: CameraDragBounds = {
  minX: -400,
  maxX: 400,
  minY: -300,
  maxY: 300,
};

/** Wires pointer drag input to pan the scene's main camera, clamped to bounds. */
export function enableCameraDrag(
  scene: Phaser.Scene,
  bounds: CameraDragBounds = DEFAULT_BOUNDS,
) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
    isDragging = true;
    startX = pointer.x;
    startY = pointer.y;
  });

  scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
    if (!isDragging) return;

    const dx = pointer.x - startX;
    const dy = pointer.y - startY;
    const cam = scene.cameras.main;

    cam.scrollX -= dx;
    cam.scrollY -= dy;
    cam.scrollX = Phaser.Math.Clamp(cam.scrollX, bounds.minX, bounds.maxX);
    cam.scrollY = Phaser.Math.Clamp(cam.scrollY, bounds.minY, bounds.maxY);

    startX = pointer.x;
    startY = pointer.y;
  });

  scene.input.on("pointerup", () => {
    isDragging = false;
  });
}
