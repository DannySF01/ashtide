import Phaser from "phaser";

export class BaseScene extends Phaser.Scene {
  constructor() {
    super("BaseScene");
  }

  create() {
    this.add.text(20, 20, "Ashtide — base scene", {
      color: "#e8dcc8",
      fontFamily: "sans-serif",
      fontSize: "18px",
    });

    // placeholder: praia
    this.add.rectangle(480, 480, 960, 120, 0xc9a24a);
    // placeholder: mar
    this.add.rectangle(480, 400, 960, 40, 0x2c5b86);
  }
}
