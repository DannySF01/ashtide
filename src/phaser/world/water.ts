import Phaser from "phaser";

export function createWaterTexture(scene: Phaser.Scene) {
  if (scene.textures.exists("water_pattern")) return;

  const width = 256;
  const height = 256;
  const graphics = scene.make.graphics({ x: 0, y: 0 });

  graphics.fillStyle(0x288296, 1);
  graphics.fillRect(0, 0, width, height);

  graphics.fillStyle(0x1d6980, 0.6);
  graphics.fillRect(0, height * 0.4, width, height * 0.6);

  const waveColors = [0x3ca2bc, 0x1f5c6b, 0x4fb4cc];
  for (let i = 0; i < 30; i++) {
    const rx = (i * 67) % width;
    const ry = (i * 43) % height;
    const rWidth = 25 + ((i * 17) % 35);
    const rHeight = 5 + ((i * 13) % 7);
    const colorIndex = i % waveColors.length;

    graphics.fillStyle(waveColors[colorIndex], 0.4);
    graphics.fillRoundedRect(rx, ry, rWidth, rHeight, 3);

    if (i % 3 === 0) {
      graphics.fillStyle(0xffffff, 0.3);
      graphics.fillRoundedRect(rx + 4, ry + 1, rWidth * 0.4, 2, 1);
    }
  }

  graphics.fillStyle(0xffffff, 0.35);
  for (let j = 0; j < 15; j++) {
    const fx = (j * 89) % width;
    const fy = (j * 53) % height;
    graphics.fillRoundedRect(fx, fy, 15, 3, 2);
  }

  graphics.generateTexture("water_pattern", width, height);
  graphics.destroy();
}

export function createWaterSprite(
  scene: Phaser.Scene,
): Phaser.GameObjects.TileSprite {
  const sprite = scene.add.tileSprite(
    0,
    0,
    scene.scale.width * 3,
    scene.scale.height * 3,
    "water_pattern",
  );
  sprite.setOrigin(0.5, 0.5);
  sprite.setDepth(-5000);
  sprite.setPosition(0, 0);
  return sprite;
}

export function animateWater(sprite: Phaser.GameObjects.TileSprite) {
  sprite.tilePositionX += 0.25;
  sprite.tilePositionY += 0.15;
}
