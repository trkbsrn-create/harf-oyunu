// Şans Çarkı: mini oyunlar arasından birini seçer (öğretmenin fikri; ileride bütün oyun
// seçimlerinde kullanılacak). Başka bir sahnenin üstünde açılır (scene.launch).
// Veri: { harf, oyunlar: [{ ad, baslik }], bitince(ad) }. Çarkta en çok 8 oyun olur; çocuk
// "Çevir"e basar, çark döner, okun altında kalan oyun büyükçe yazılır ve bitince(ad) çağrılır.

const CARK_RENKLERI = [0xff9c8a, 0xffe680, 0x9be3dc, 0xc8a2ff, 0xb5e48c, 0xffc58f, 0x7cc4ef, 0xf7b2d9];
const CARK_X = 640;
const CARK_Y = 400;
const CARK_R = 250;

class SansCarkiSahnesi extends Phaser.Scene {
  constructor() {
    super("SansCarkiSahnesi");
  }

  init(veri) {
    this.veri = veri;
    this.oyunlar = Phaser.Utils.Array.Shuffle(veri.oyunlar.slice()).slice(0, 8);
    this.donuyor = false;
    this.bitti = false;
  }

  create() {
    const karartma = this.add.graphics();
    karartma.fillStyle(0x000000, 0.45);
    karartma.fillRect(0, 0, 1280, 720);
    karartma.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720), Phaser.Geom.Rectangle.Contains);
    doodleYazi(this, 640, 60, "Şans Çarkı", 52, "mavi").setOrigin(0.5);

    // Çark: renkli dilimler, her dilimde oyunun adı (dışa doğru)
    this.cark = this.add.container(CARK_X, CARK_Y);
    const n = this.oyunlar.length;
    const dilim = (Math.PI * 2) / n;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.2);
    g.fillCircle(8, 12, CARK_R + 12);
    this.oyunlar.forEach((o, i) => {
      const bas = -Math.PI / 2 + i * dilim;
      g.fillStyle(CARK_RENKLERI[i % CARK_RENKLERI.length], 1);
      g.slice(0, 0, CARK_R, bas, bas + dilim, false);
      g.fillPath();
      g.lineStyle(4, 0x2b2b2b, 1);
      g.slice(0, 0, CARK_R, bas, bas + dilim, false);
      g.strokePath();
    });
    g.lineStyle(8, 0x2b2b2b, 1);
    g.strokeCircle(0, 0, CARK_R);
    this.cark.add(g);
    this.oyunlar.forEach((o, i) => {
      const aci = -Math.PI / 2 + (i + 0.5) * dilim;
      const yazi = this.add.text(Math.cos(aci) * (CARK_R * 0.58), Math.sin(aci) * (CARK_R * 0.58), o.baslik, {
        fontFamily: "Andika", fontSize: "21px", color: "#2b2b2b", align: "center",
        wordWrap: { width: 130 },
      }).setOrigin(0.5).setRotation(Math.cos(aci) < -0.01 ? aci + Math.PI : aci); // yazılar ters durmasın
      this.cark.add(yazi);
    });
    // Ortadaki göbek ve üstteki ok
    const gobek = this.add.graphics();
    gobek.fillStyle(0xfbf4e2, 1);
    gobek.fillCircle(CARK_X, CARK_Y, 70);
    gobek.lineStyle(6, 0x2b2b2b, 1);
    gobek.strokeCircle(CARK_X, CARK_Y, 70);
    const ok = this.add.graphics();
    ok.fillStyle(0xff6b5a, 1);
    ok.lineStyle(5, 0x2b2b2b, 1);
    ok.fillTriangle(CARK_X - 28, CARK_Y - CARK_R - 34, CARK_X + 28, CARK_Y - CARK_R - 34, CARK_X, CARK_Y - CARK_R + 22);
    ok.strokeTriangle(CARK_X - 28, CARK_Y - CARK_R - 34, CARK_X + 28, CARK_Y - CARK_R - 34, CARK_X, CARK_Y - CARK_R + 22);
    this.cevirYazi = doodleYazi(this, CARK_X, CARK_Y - 3, "Çevir", 34).setOrigin(0.5);
    const dugme = this.add.zone(CARK_X, CARK_Y, 150, 150).setInteractive({ useHandCursor: true });
    dugme.on("pointerdown", () => this.cevir());
    this.tweens.add({ targets: this.cevirYazi, scale: 1.12, duration: 500, yoyo: true, repeat: -1, ease: "Sine.InOut" });

    this.cark.setScale(0);
    this.tweens.add({ targets: this.cark, scale: 1, duration: 400, ease: "Back.Out" });
    this.sonDilim = 0;
    if (!this.textures.exists("parilti")) {
      const p = this.make.graphics({ add: false });
      p.fillStyle(0xffffff);
      p.fillCircle(5, 5, 5);
      p.generateTexture("parilti", 10, 10);
      p.destroy();
    }
  }

  cevir() {
    if (this.donuyor || this.bitti) return;
    this.donuyor = true;
    this.tweens.killTweensOf(this.cevirYazi);
    this.cevirYazi.setScale(1).setAlpha(0.4);
    const n = this.oyunlar.length;
    const secilen = Phaser.Math.Between(0, n - 1);
    const dilimDerece = 360 / n;
    // Seçilen dilimin ortası okun (tepenin) altına gelsin; dilim içinde biraz rastgele dursun
    const kayma = Phaser.Math.FloatBetween(-0.3, 0.3) * dilimDerece;
    const hedef = 360 * 5 - (secilen + 0.5) * dilimDerece + kayma;
    this.tweens.add({
      targets: this.cark, angle: hedef, duration: 4200, ease: "Cubic.Out",
      onUpdate: () => {
        // Her dilim okun altından geçince "tık"
        const d = Math.floor(((this.cark.angle % 360) + 360) % 360 / dilimDerece);
        if (d !== this.sonDilim) {
          this.sonDilim = d;
          Sesler.nota(1400, 0, 0.03, 0.08, "square");
        }
      },
      onComplete: () => this.durdu(this.oyunlar[secilen]),
    });
  }

  durdu(oyun) {
    this.bitti = true;
    Sesler.dogru();
    this.add.particles(CARK_X, CARK_Y - CARK_R, "parilti", {
      speed: { min: 150, max: 420 }, lifespan: 1200, gravityY: 500, scale: { start: 1.3, end: 0.3 },
      tint: CARK_RENKLERI, emitting: false,
    }).explode(50);
    const kart = this.add.container(640, 400).setScale(0);
    const g = this.add.graphics();
    g.fillStyle(0xfbf4e2, 1);
    g.fillRoundedRect(-300, -70, 600, 140, 30);
    g.lineStyle(6, 0x2b2b2b, 1);
    g.strokeRoundedRect(-300, -70, 600, 140, 30);
    kart.add([g, doodleYazi(this, 0, -4, oyun.baslik, 50, "mavi").setOrigin(0.5)]);
    this.tweens.add({ targets: kart, scale: 1, duration: 400, delay: 300, ease: "Back.Out" });
    Sesler.soyle(oyun.baslik);
    this.time.delayedCall(2600, () => {
      const bitince = this.veri.bitince;
      this.scene.stop();
      bitince(oyun.ad);
    });
  }
}
