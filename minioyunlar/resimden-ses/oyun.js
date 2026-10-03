// Mini oyun: Resimden Sesi Bul (sesin resmi)
// Her turda harf ekranda görünür (ünlüyse ayrıca söylenir; ünsüz okunmaz). Çocuk o sesle başlayan resmi kartlar arasından seçer. Kartın köşesindeki
// hoparlöre dokununca resmin adı okunur. Yanlış resim bir can götürür.
// Seviye arttıkça: tur sayısı artar, öbür öğrenilmiş harfler de sorulur, kart sayısı artar.
// Şimdilik her harfin tek resmi var (harfler.js'deki resim); resimler sonra çoğalacak.

const RESIMDEN_SES_SEVIYELERI = {
  1: { tur: 5, kart: 3, kendiOrani: 1 },
  2: { tur: 6, kart: 3, kendiOrani: 0.6 },
  3: { tur: 8, kart: 4, kendiOrani: 0.5 },
};

class ResimdenSesSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("resimden-ses");
  }

  preload() {
    super.preload();
    for (const h of HARFLER) if (h.resim) this.load.svg(h.resim, `gorseller/${h.resim}.svg`);
  }

  create() {
    this.ortakKur();
    this.ayar = RESIMDEN_SES_SEVIYELERI[this.seviye] || RESIMDEN_SES_SEVIYELERI[1];
    this.cevaplandi = false; // "Tekrar" ile yeniden açılınca eski turdan kalmasın
    this.kalpleriKur(3);
    this.ilerlemeKur(this.ayar.tur);
    // Resmi olan öğrenilmiş harfler (sorulabilecek ve yanlış seçenek olabilecekler)
    const ogrenilmis = ogrenilmisHarfler(this.harf);
    this.resimliler = HARFLER.filter((h) => h.resim && ogrenilmis.includes(h.kucuk));
    this.kartlar = [];

    // Üstte soru: hoparlör ve harf (dokununca ses yeniden söylenir)
    this.soru = this.add.container(640, 175).setDepth(5).setVisible(false);
    const zemin = this.add.graphics();
    zemin.fillStyle(0xfffdf6, 1);
    zemin.fillRoundedRect(-150, -62, 300, 124, 24);
    zemin.lineStyle(5, 0x2b2b2b, 1);
    zemin.strokeRoundedRect(-150, -62, 300, 124, 24);
    this.soru.add([zemin, this.hoparlorCiz(-80, 0, 34)]);
    this.soru.setSize(300, 124).setInteractive({ useHandCursor: true });
    this.soru.on("pointerdown", () => harfiSoyle(this.sorulan));

    this.input.on("gameobjectdown", (p, nesne) => {
      if (nesne.hoparlor) Sesler.soyle(nesne.hoparlor);
      else if (nesne.kart) this.kartaDokun(nesne);
    });
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniTur()));
  }

  yeniTur() {
    if (this.bitti) return;
    for (const k of this.kartlar) k.destroy();
    this.kartlar = [];
    // Sorulan harf: 1. seviyede hep oyunun harfi; sonra öbür öğrenilmiş harfler de
    const sorulanlar = this.resimliler.map((h) => h.kucuk);
    this.sorulan = Math.random() < this.ayar.kendiOrani || sorulanlar.length < 2
      ? this.harf : Phaser.Utils.Array.GetRandom(sorulanlar.filter((h) => h !== this.harf));
    if (this.soruHarfi) this.soruHarfi.destroy();
    this.soruHarfi = boyaliOrtala(titret(this.add.text(40, 0, this.sorulan, {
      fontFamily: "Andika", fontSize: "84px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 12, padding: { x: 4, y: 4 },
    }), 2));
    this.soru.add(this.soruHarfi).setVisible(true).setScale(0.8);
    this.tweens.add({ targets: this.soru, scale: 1, duration: 250, ease: "Back.Out" });
    harfiSoyle(this.sorulan);

    // Kartlar: doğru resim ve yanlışlar, karışık sırada
    const dogru = this.resimliler.find((h) => h.kucuk === this.sorulan);
    const yanlislar = Phaser.Utils.Array.Shuffle(this.resimliler.filter((h) => h !== dogru))
      .slice(0, this.ayar.kart - 1);
    const secenekler = Phaser.Utils.Array.Shuffle([dogru, ...yanlislar]);
    const aralik = this.ayar.kart === 4 ? 260 : 300;
    secenekler.forEach((h, i) => {
      const x = 640 + (i - (secenekler.length - 1) / 2) * aralik;
      this.kartlar.push(this.kartYap(x, 470, h, h === dogru, i * 90));
    });
    // İlk turda gösteren el doğru kartı gösterir (bir kez)
    this.time.delayedCall(secenekler.length * 90 + 500, () => this.elGoster(this.kartlar.find((k) => k.kart.dogru)));
  }

  kartYap(x, y, bilgi, dogru, gecikme) {
    const kap = this.add.container(x, y).setDepth(10);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.12);
    g.fillRoundedRect(-104, -98, 216, 204, 22);
    g.fillStyle(0xfffdf6, 1);
    g.fillRoundedRect(-110, -104, 216, 204, 22);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeRoundedRect(-110, -104, 216, 204, 22);
    const resim = this.add.image(-2, -8, bilgi.resim);
    resim.setScale(Math.min(150 / resim.width, 150 / resim.height));
    const hoparlor = this.add.container(78, 72, [this.hoparlorCiz(0, 0, 20)]).setSize(72, 72)
      .setInteractive({ useHandCursor: true });
    hoparlor.hoparlor = bilgi.kelime;
    kap.add([g, resim, hoparlor]);
    kap.cerceve = g;
    kap.setSize(216, 204).setInteractive({ useHandCursor: true });
    kap.kart = { dogru, kelime: bilgi.kelime };
    kap.setScale(0);
    this.tweens.add({ targets: kap, scale: 1, duration: 280, delay: gecikme, ease: "Back.Out" });
    return kap;
  }

  kartaDokun(kap) {
    if (this.bitti || this.cevaplandi || kap.kart.secildi) return;
    kap.kart.secildi = true;
    const g = kap.cerceve;
    if (kap.kart.dogru) {
      this.cevaplandi = true;
      g.lineStyle(9, 0x8fd16a, 1);
      g.strokeRoundedRect(-110, -104, 216, 204, 22);
      Sesler.pling();
      this.tweens.add({ targets: kap, scale: 1.1, duration: 160, yoyo: true });
      this.time.delayedCall(500, () => Sesler.soyle(kap.kart.kelime));
      this.ilerlemeArtir(kap.x, kap.y);
      this.time.delayedCall(1700, () => {
        this.cevaplandi = false;
        this.yeniTur();
      });
    } else {
      g.lineStyle(9, 0xff8a7a, 1);
      g.strokeRoundedRect(-110, -104, 216, 204, 22);
      this.tweens.add({ targets: kap, angle: { from: -6, to: 6 }, duration: 70, yoyo: true, repeat: 2,
        onComplete: () => kap.setAngle(0) });
      kap.setAlpha(0.55);
      this.kalpEksilt();
      this.ipucuGoster(this.kartlar.find((k) => k.kart.dogru));
    }
  }

  oyunBitti() {
    for (const k of this.kartlar) k.disableInteractive();
  }
}

miniOyunKaydet("resimden-ses", ResimdenSesSahnesi);
