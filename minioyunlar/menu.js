// Mini oyunlar menüsü: karşılama ekranındaki "Mini Games" düğmesiyle açılır.
// Üstte harf seçici (ilk harf grubu), altında her mini oyunun kartı. Hazır olan oyunun
// kartına dokununca o oyun seçilen harfle açılır; hazır olmayanlarda "Yakında" yazar.
// Mini oyunları ayrı ayrı geliştirip denemek için.

class MiniOyunlarSahnesi extends Phaser.Scene {
  constructor() {
    super("MiniOyunlarSahnesi");
  }

  preload() {
    this.load.svg("oyun-karti", "gorseller/oyun-karti.svg");
  }

  create() {
    this.cameras.main.fadeIn(300, 251, 247, 236);
    this.add.tileSprite(0, 0, 1280, 720, "doku-kagit").setOrigin(0);
    doodleYazi(this, 640, 60, "Mini Games", 64, "mavi").setOrigin(0.5);

    // Geri: karşılama ekranına
    const geri = this.add.container(110, 46, [
      this.add.image(0, 0, "incele-dugmesi"),
      doodleYazi(this, 0, -3, "Geri", 30).setOrigin(0.5),
    ]).setSize(170, 56).setInteractive({ useHandCursor: true });
    geri.on("pointerdown", () => {
      Sesler.ac();
      this.scene.start("KarsilamaSahnesi");
    });

    // Harf seçici
    const harfler = HARFLER.filter((h) => h.grup === 1);
    if (!this.secilenHarf) this.secilenHarf = harfler[0].kucuk;
    this.harfCizimi = this.add.graphics();
    this.harfDugmeleri = harfler.map((h, i) => {
      const x = 640 - 2.5 * 96 + i * 96;
      const y = 150;
      const yazi = this.add.text(x, y, h.kucuk, {
        fontFamily: "Andika", fontSize: "48px", color: "#ffffff",
        stroke: "#3b2a1a", strokeThickness: 8, padding: { x: 4, y: 4 },
      }).setDepth(1);
      boyaliOrtala(titret(yazi, 1.5));
      const alan = this.add.circle(x, y, 38).setInteractive({ useHandCursor: true });
      alan.on("pointerdown", () => {
        Sesler.ac();
        Sesler.nota(660, 0, 0.08, 0.12);
        this.secilenHarf = h.kucuk;
        this.harfleriCiz();
      });
      return { harf: h.kucuk, x, y };
    });
    // Seviye seçici (1, 2, 3)
    if (!this.secilenSeviye) this.secilenSeviye = 1;
    doodleYazi(this, 470, 232, "Seviye:", 30).setOrigin(0.5);
    this.seviyeDugmeleri = [1, 2, 3].map((seviye, i) => {
      const x = 580 + i * 80;
      const y = 232;
      this.add.text(x, y, String(seviye), {
        fontFamily: "Andika", fontSize: "34px", color: "#2b2b2b",
      }).setOrigin(0.5).setDepth(1);
      const alan = this.add.circle(x, y, 28).setInteractive({ useHandCursor: true });
      alan.on("pointerdown", () => {
        Sesler.ac();
        Sesler.nota(660, 0, 0.08, 0.12);
        this.secilenSeviye = seviye;
        this.harfleriCiz();
      });
      return { seviye, x, y };
    });
    this.harfleriCiz();

    // Oyun kartları: satırda 4 kart
    PLANLANAN_OYUNLAR.forEach((oyun, i) => {
      const x = 640 + ((i % 4) - 1.5) * 270;
      const y = 380 + Math.floor(i / 4) * 190;
      const hazir = Boolean(MINI_OYUNLAR[oyun.ad]);
      const kart = this.add.container(x, y, [
        this.add.image(0, 0, "oyun-karti"),
        doodleYazi(this, -3, hazir ? -3 : -18, oyun.baslik, oyun.baslik.length > 15 ? 24 : 28).setOrigin(0.5),
      ]).setSize(232, 152);
      if (hazir) {
        kart.setInteractive({ useHandCursor: true });
        kart.on("pointerdown", () => this.oyunuAc(oyun.ad));
      } else {
        kart.add(this.add.text(-3, 30, "Yakında", {
          fontFamily: "Andika", fontSize: "24px", color: "#9a8f7a",
        }).setOrigin(0.5));
        kart.setAlpha(0.6);
      }
    });
  }

  // Seçilen harfin dairesi sarı, öbürleri soluk mavi
  harfleriCiz() {
    const g = this.harfCizimi;
    g.clear();
    for (const d of this.harfDugmeleri) {
      const secili = d.harf === this.secilenHarf;
      g.fillStyle(secili ? 0xffe680 : 0xc9ecff, 1);
      g.fillCircle(d.x, d.y, 38);
      g.lineStyle(secili ? 6 : 4, 0x2b2b2b, 1);
      g.strokeCircle(d.x, d.y, 38);
    }
    for (const d of this.seviyeDugmeleri || []) {
      const secili = d.seviye === this.secilenSeviye;
      g.fillStyle(secili ? 0xffe680 : 0xffffff, 1);
      g.fillCircle(d.x, d.y, 28);
      g.lineStyle(secili ? 5 : 3, 0x2b2b2b, 1);
      g.strokeCircle(d.x, d.y, 28);
    }
  }

  oyunuAc(ad) {
    Sesler.ac();
    Sesler.pling();
    this.scene.start(ad, { harf: this.secilenHarf, seviye: this.secilenSeviye, donus: "MiniOyunlarSahnesi" });
  }
}
