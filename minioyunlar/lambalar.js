// Oyun Lambaları (öğretmenin fikri; Şans Çarkı'nın yerine): her mini oyunun simgesi bir lambada.
// Bu damlaya uygun oyunların lambaları rastgele yanıp söner, gittikçe yavaşlar, seçilen oyunun
// lambası yanık kalır, büyüyüp ortaya gelir ve adı söylenir. Uygun olmayanlar sönük durur.
// Başka bir sahnenin üstünde açılır (scene.launch).
// Veri: { harf, uygunlar: [ad], bitince(ad) }.

const LAMBA_SUTUN = 6;
const LAMBA_R = 46;
const LAMBA_ARA_X = 168;
const LAMBA_ARA_Y = 106;
const LAMBA_UST = 178;
const LAMBA_RENKLERI = [0xff9c8a, 0xffe680, 0x9be3dc, 0xc8a2ff, 0xb5e48c, 0xffc58f, 0x7cc4ef, 0xf7b2d9];

class OyunLambalariSahnesi extends Phaser.Scene {
  constructor() {
    super("OyunLambalariSahnesi");
  }

  init(veri) {
    this.veri = veri;
    this.bitti = false;
  }

  preload() {
    oyunSimgeleriniYukle(this);
  }

  create() {
    const karartma = this.add.graphics();
    karartma.fillStyle(0x000000, 0.5);
    karartma.fillRect(0, 0, 1280, 720);
    karartma.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720), Phaser.Geom.Rectangle.Contains);
    doodleYazi(this, 640, 58, "Hangi oyun yanacak?", 50, "mavi").setOrigin(0.5);

    // Lamba panosu: koyu tahta, kenarında sırayla yanan küçük ampuller
    const pano = this.add.graphics();
    pano.fillStyle(0x000000, 0.25);
    pano.fillRoundedRect(122, 118, 1050, 570, 34);
    pano.fillStyle(0x34405a, 1);
    pano.fillRoundedRect(114, 110, 1050, 570, 34);
    pano.lineStyle(7, 0x2b2b2b, 1);
    pano.strokeRoundedRect(114, 110, 1050, 570, 34);
    this.kenarAmpulleri = [];
    const kenar = (x, y) => this.kenarAmpulleri.push(this.add.circle(x, y, 7, 0xfff3b0).setStrokeStyle(2, 0x2b2b2b));
    for (let x = 150; x <= 1130; x += 49) { kenar(x, 128); kenar(x, 662); }
    for (let y = 177; y <= 613; y += 49) { kenar(132, y); kenar(1146, y); }

    // Lambalar: hazır her mini oyun bir lamba
    const uygun = new Set(this.veri.uygunlar);
    const oyunlar = PLANLANAN_OYUNLAR.filter((o) => MINI_OYUNLAR[o.ad]);
    const solX = 639 - ((LAMBA_SUTUN - 1) / 2) * LAMBA_ARA_X;
    this.lambalar = oyunlar.map((o, i) => {
      const x = solX + (i % LAMBA_SUTUN) * LAMBA_ARA_X;
      const y = LAMBA_UST + Math.floor(i / LAMBA_SUTUN) * LAMBA_ARA_Y;
      const isik = this.add.circle(0, 0, LAMBA_R + 16, 0xffe680, 0.45).setVisible(false);
      const g = this.add.graphics();
      const simge = this.add.image(0, 0, `simge-${o.ad}`).setScale(0.7);
      const kap = this.add.container(x, y, [isik, g, simge]);
      const lamba = { oyun: o, uygun: uygun.has(o.ad), kap, isik, g, simge, renk: LAMBA_RENKLERI[i % LAMBA_RENKLERI.length] };
      this.lambayiCiz(lamba, false);
      return lamba;
    });
    this.uygunLambalar = this.lambalar.filter((l) => l.uygun);
    this.kenarSayaci = 0;
    this.kenarSaati = this.time.addEvent({ delay: 160, loop: true, callback: () => this.kenarlariYak() });

    if (!this.textures.exists("parilti")) {
      const p = this.make.graphics({ add: false });
      p.fillStyle(0xffffff);
      p.fillCircle(5, 5, 5);
      p.generateTexture("parilti", 10, 10);
      p.destroy();
    }
    this.time.delayedCall(600, () => this.yakSondur());
  }

  // Lamba: sönük (bu damlaya uygun değil), kapalı (uygun) ya da yanık
  lambayiCiz(l, yanik) {
    const g = l.g;
    g.clear();
    if (yanik) {
      g.fillStyle(0xfff6c2, 1);
      g.fillCircle(0, 0, LAMBA_R);
      g.lineStyle(5, 0xffc928, 1);
      g.strokeCircle(0, 0, LAMBA_R);
    } else {
      g.fillStyle(l.uygun ? 0x8a9ab8 : 0x283247, 1);
      g.fillCircle(0, 0, LAMBA_R);
      g.lineStyle(4, l.uygun ? 0x1f2533 : 0x1a2030, 1);
      g.strokeCircle(0, 0, LAMBA_R);
    }
    l.isik.setVisible(yanik);
    l.simge.setAlpha(yanik ? 1 : l.uygun ? 0.8 : 0.18).setScale(yanik ? 0.78 : 0.7);
  }

  kenarlariYak() {
    this.kenarSayaci++;
    this.kenarAmpulleri.forEach((a, i) => a.setFillStyle((i + this.kenarSayaci) % 3 === 0 ? 0xffe680 : 0x6b6450));
  }

  // Uygun lambalar rastgele yanıp söner, gittikçe yavaşlar; sonuncusu seçilen oyun
  yakSondur() {
    const lambalar = this.uygunLambalar;
    const secilen = Phaser.Utils.Array.GetRandom(lambalar);
    const sira = [];
    let onceki = null;
    for (let i = 0; i < 25; i++) {
      const adaylar = lambalar.length > 1 ? lambalar.filter((l) => l !== onceki) : lambalar;
      onceki = Phaser.Utils.Array.GetRandom(adaylar);
      sira.push(onceki);
    }
    if (sira[sira.length - 1] === secilen && lambalar.length > 1) sira.pop();
    sira.push(secilen);
    let aralik = 55;
    let zaman = 0;
    let yanan = null;
    sira.forEach((l, i) => {
      this.time.delayedCall(zaman, () => {
        if (yanan) this.lambayiCiz(yanan, false);
        yanan = l;
        this.lambayiCiz(l, true);
        Sesler.nota(900 + (i % 5) * 160, 0, 0.05, 0.07, "square");
        if (i === sira.length - 1) this.time.delayedCall(350, () => this.secildi(l));
      });
      zaman += aralik;
      aralik *= 1.08;
    });
  }

  secildi(l) {
    this.bitti = true;
    this.kenarSaati.remove();
    this.kenarAmpulleri.forEach((a) => a.setFillStyle(0xffe680));
    Sesler.dogru();
    // Öbür lambalar iyice söner; seçilen lamba ortaya gelir, büyür
    for (const o of this.lambalar) if (o !== l) this.tweens.add({ targets: o.kap, alpha: 0.35, duration: 300 });
    l.kap.setDepth(10);
    this.tweens.add({ targets: l.kap, x: 640, y: 350, scale: 2.4, duration: 600, ease: "Back.Out", onComplete: () => {
      this.add.particles(640, 350, "parilti", {
        speed: { min: 150, max: 420 }, lifespan: 1200, gravityY: 500, scale: { start: 1.3, end: 0.3 },
        tint: LAMBA_RENKLERI, emitting: false,
      }).setDepth(11).explode(50);
      this.tweens.add({ targets: l.isik, scale: 1.25, duration: 500, yoyo: true, repeat: -1, ease: "Sine.InOut" });
    } });
    const kart = this.add.container(640, 560).setScale(0).setDepth(12);
    const g = this.add.graphics();
    g.fillStyle(0xfbf4e2, 1);
    g.fillRoundedRect(-280, -55, 560, 110, 28);
    g.lineStyle(6, 0x2b2b2b, 1);
    g.strokeRoundedRect(-280, -55, 560, 110, 28);
    kart.add([g, doodleYazi(this, 0, -4, l.oyun.baslik, 46, "mavi").setOrigin(0.5)]);
    this.tweens.add({ targets: kart, scale: 1, duration: 400, delay: 400, ease: "Back.Out" });
    Sesler.soyle(l.oyun.baslik);
    this.time.delayedCall(2800, () => {
      const bitince = this.veri.bitince;
      this.scene.stop();
      bitince(l.oyun.ad);
    });
  }
}
