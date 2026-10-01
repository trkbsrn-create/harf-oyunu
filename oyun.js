// Oyunun ana kodu. Şimdilik sadece "Merhaba Ada" yazan basit bir sahne var.

class MerhabaSahnesi extends Phaser.Scene {
  constructor() {
    super("MerhabaSahnesi");
  }

  create() {
    const { width, height } = this.scale;

    // Deniz üzerinde yuvarlak, kartonumsu bir ada
    this.add.ellipse(width / 2, height / 2 + 12, 620, 300, 0x7a5c3e);
    this.add.ellipse(width / 2, height / 2, 600, 280, 0xf6d98b);
    this.add.ellipse(width / 2, height / 2 - 10, 500, 200, 0x9fd87a);

    this.add
      .text(width / 2, height / 2 - 10, "Merhaba Ada", {
        fontFamily: "Andika",
        fontSize: "72px",
        color: "#3b2a1a",
      })
      .setOrigin(0.5);
  }
}

// Yazı tipi yüklendikten sonra oyunu başlat (yoksa yazı yanlış görünür).
document.fonts.load('72px "Andika"').finally(() => {
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: "oyun",
    width: 1280,
    height: 720,
    backgroundColor: "#bfe8f5",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [MerhabaSahnesi],
  });
});
