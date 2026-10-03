// Mini oyun: Kazı Kazan (resmi kazı)
// Gümüş kaplı bir kart var. Çocuk parmağıyla kartı kazır; altından bir resim çıkar (arı, nar,
// eşek...). Kartın yaklaşık yarısı kazınınca alttaki harf seçenekleri belirir; çocuk resmin
// ilk sesini seçer. Doğruysa kartın kalanı açılır, resmin adı okunur. Yanlış seçim bir can
// götürür.
// Seviyeler: 1: 4 kart, 2 seçenek; 2: 5 kart, 3 seçenek; 3: 6 kart, 3 seçenek, benzer harfler.

const KAZI_SEVIYELERI = {
  1: { tur: 4, secenek: 2, benzer: false },
  2: { tur: 5, secenek: 3, benzer: false },
  3: { tur: 6, secenek: 3, benzer: true },
};

const KART = { x: 640, y: 330, en: 400, boy: 300 };
const KAZI_FIRCA = 34;
const KAZI_HUCRE = 25; // kazınan oranı ölçmek için küçük kareler

class KaziKazanSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("kazi-kazan");
  }

  preload() {
    super.preload();
    for (const h of HARFLER) if (h.resim) this.load.svg(h.resim, `gorseller/${h.resim}.svg`);
  }

  create() {
    this.ortakKur();
    this.ayar = KAZI_SEVIYELERI[this.seviye] || KAZI_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.ilerlemeKur(this.ayar.tur);
    const ogrenilmis = ogrenilmisHarfler(this.harf);
    this.resimliler = HARFLER.filter((h) => h.resim && ogrenilmis.includes(h.kucuk));
    this.turNo = 0;
    this.secenekler = [];
    this.resim = null;
    this.kaplama = null;
    this.acildi = false;
    this.cevaplandi = false;

    if (!this.textures.exists("kazi-firca")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff);
      g.fillCircle(KAZI_FIRCA, KAZI_FIRCA, KAZI_FIRCA);
      g.generateTexture("kazi-firca", KAZI_FIRCA * 2, KAZI_FIRCA * 2);
      g.destroy();
    }
    if (!this.textures.exists("kazi-toz")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff);
      g.fillRect(0, 0, 6, 6);
      g.generateTexture("kazi-toz", 6, 6);
      g.destroy();
    }

    // Kartın çerçevesi
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x000000, 0.12);
    g.fillRoundedRect(KART.x - KART.en / 2 - 14, KART.y - KART.boy / 2 - 10, KART.en + 36, KART.boy + 36, 26);
    g.fillStyle(0xfffdf6, 1);
    g.fillRoundedRect(KART.x - KART.en / 2 - 20, KART.y - KART.boy / 2 - 20, KART.en + 40, KART.boy + 40, 26);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeRoundedRect(KART.x - KART.en / 2 - 20, KART.y - KART.boy / 2 - 20, KART.en + 40, KART.boy + 40, 26);

    this.input.on("pointerdown", (p) => this.kazi(p));
    this.input.on("pointermove", (p) => { if (p.isDown) this.kazi(p); });
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniKart()));
  }

  yeniKart() {
    if (this.bitti) return;
    for (const s of this.secenekler) s.destroy();
    this.secenekler = [];
    if (this.resim) this.resim.destroy();
    if (this.kaplama) this.kaplama.destroy();
    this.acildi = false;
    this.cevaplandi = false;
    this.kazinan = new Set();
    this.toplamHucre = Math.ceil(KART.en / KAZI_HUCRE) * Math.ceil(KART.boy / KAZI_HUCRE);

    // Sorulan resim: 1. seviyede ilk kartlar hep oyunun harfinden
    const kendi = this.resimliler.find((h) => h.kucuk === this.harf);
    const obur = this.resimliler.filter((h) => h !== kendi);
    this.sorulan = kendi && (this.turNo % 2 === 0 || !obur.length) ? kendi : Phaser.Utils.Array.GetRandom(obur);
    this.turNo++;
    this.resim = this.add.image(KART.x, KART.y, this.sorulan.resim).setDepth(2);
    this.resim.setScale(Math.min((KART.en - 40) / this.resim.width, (KART.boy - 30) / this.resim.height));

    // Gümüş kaplama: kazındıkça silinir
    this.kaplama = this.add.renderTexture(KART.x, KART.y, KART.en, KART.boy).setDepth(3);
    const k = this.make.graphics({ add: false });
    k.fillStyle(0xb8b8b8, 1);
    k.fillRoundedRect(0, 0, KART.en, KART.boy, 18);
    k.lineStyle(3, 0xd6d6d6, 1);
    for (let x = -KART.boy; x < KART.en; x += 16) k.lineBetween(x, KART.boy, x + KART.boy, 0);
    k.fillStyle(0x9e9e9e, 1);
    for (let i = 0; i < 4; i++) k.fillCircle(60 + i * 95, KART.boy / 2, 22);
    k.fillStyle(0xfffdf6, 1);
    for (let i = 0; i < 4; i++) k.fillCircle(60 + i * 95, KART.boy / 2, 10);
    this.kaplama.draw(k, 0, 0);
    k.destroy();
    this.time.delayedCall(300, () => this.elSurukleGoster([
      { x: KART.x - 120, y: KART.y - 60 }, { x: KART.x + 60, y: KART.y - 20 },
      { x: KART.x - 80, y: KART.y + 40 }, { x: KART.x + 120, y: KART.y + 70 }]));
  }

  kazi(p) {
    if (this.bitti || !this.kaplama || this.acildi && this.cevaplandi) return;
    const yx = p.x - (KART.x - KART.en / 2);
    const yy = p.y - (KART.y - KART.boy / 2);
    if (yx < -20 || yy < -20 || yx > KART.en + 20 || yy > KART.boy + 20) return;
    this.kaplama.erase("kazi-firca", yx - KAZI_FIRCA, yy - KAZI_FIRCA);
    if (Math.random() < 0.35) Sesler.nota(1800 + Math.random() * 600, 0, 0.03, 0.02, "sawtooth");
    if (Math.random() < 0.3) {
      this.add.particles(p.x, p.y, "kazi-toz", {
        speed: { min: 40, max: 120 }, lifespan: 300, scale: { start: 1, end: 0 }, tint: 0x9e9e9e,
        gravityY: 300, emitting: false,
      }).setDepth(4).explode(3);
    }
    // Fırçanın altındaki hücreler kazınmış sayılır
    for (let dx = -KAZI_FIRCA; dx <= KAZI_FIRCA; dx += KAZI_HUCRE / 2) {
      for (let dy = -KAZI_FIRCA; dy <= KAZI_FIRCA; dy += KAZI_HUCRE / 2) {
        if (dx * dx + dy * dy > KAZI_FIRCA * KAZI_FIRCA) continue;
        const c = Math.floor((yx + dx) / KAZI_HUCRE);
        const r = Math.floor((yy + dy) / KAZI_HUCRE);
        if (c >= 0 && r >= 0 && c < KART.en / KAZI_HUCRE && r < KART.boy / KAZI_HUCRE) this.kazinan.add(c + "," + r);
      }
    }
    if (!this.acildi && this.kazinan.size / this.toplamHucre > 0.45) this.secenekleriGoster();
  }

  // Harf seçenekleri: resmin ilk sesi ve yanlışlar
  secenekleriGoster() {
    this.acildi = true;
    Sesler.pling();
    const dogru = this.sorulan.kucuk;
    const ogrenilmis = ogrenilmisHarfler(this.harf).filter((h) => h !== dogru);
    let yanlislar = this.ayar.benzer ? (BENZER_HARFLER[dogru] || []).filter((h) => ogrenilmis.includes(h)) : [];
    for (const h of Phaser.Utils.Array.Shuffle(ogrenilmis.slice())) if (!yanlislar.includes(h)) yanlislar.push(h);
    const harfler = Phaser.Utils.Array.Shuffle([dogru, ...yanlislar.slice(0, this.ayar.secenek - 1)]);
    harfler.forEach((h, i) => {
      const x = 640 + (i - (harfler.length - 1) / 2) * 170;
      const kap = this.add.container(x, 615).setDepth(10);
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.12);
      g.fillRoundedRect(-62, -48, 130, 102, 20);
      g.fillStyle(0xfffdf6, 1);
      g.fillRoundedRect(-66, -52, 130, 102, 20);
      g.lineStyle(4, 0x2b2b2b, 1);
      g.strokeRoundedRect(-66, -52, 130, 102, 20);
      const yazi = boyaliOrtala(titret(this.add.text(-1, -1, h, {
        fontFamily: "Andika", fontSize: "64px", color: "#ffffff",
        stroke: "#3b2a1a", strokeThickness: 10, padding: { x: 4, y: 4 },
      }), 1.8));
      kap.add([g, yazi]);
      kap.cizim = g;
      kap.secenek = { harf: h, dogru: h === dogru };
      kap.setSize(150, 120).setInteractive({ useHandCursor: true });
      kap.on("pointerdown", () => this.sec(kap));
      kap.setScale(0);
      this.tweens.add({ targets: kap, scale: 1, duration: 260, delay: i * 90, ease: "Back.Out" });
      this.secenekler.push(kap);
    });
  }

  sec(kap) {
    if (this.bitti || this.cevaplandi || kap.secenek.secildi) return;
    kap.secenek.secildi = true;
    const g = kap.cizim;
    if (kap.secenek.dogru) {
      this.cevaplandi = true;
      g.lineStyle(9, 0x8fd16a, 1);
      g.strokeRoundedRect(-66, -52, 130, 102, 20);
      // Kaplamanın kalanı açılır, resmin adı okunur
      this.tweens.add({ targets: this.kaplama, alpha: 0, duration: 400 });
      Sesler.pling();
      this.time.delayedCall(300, () => Sesler.soyle(this.sorulan.kelime));
      this.ilerlemeArtir(KART.x, KART.y);
      if (!this.bitti) this.time.delayedCall(2000, () => this.yeniKart());
    } else {
      g.lineStyle(9, 0xff8a7a, 1);
      g.strokeRoundedRect(-66, -52, 130, 102, 20);
      kap.setAlpha(0.55);
      this.tweens.add({ targets: kap, angle: { from: -6, to: 6 }, duration: 70, yoyo: true, repeat: 2, onComplete: () => kap.setAngle(0) });
      this.kalpEksilt();
      this.ipucuGoster(this.secenekler.find((s) => s.secenek.dogru));
    }
  }

  oyunBitti() {
    for (const s of this.secenekler) s.disableInteractive();
  }
}

miniOyunKaydet("kazi-kazan", KaziKazanSahnesi);
