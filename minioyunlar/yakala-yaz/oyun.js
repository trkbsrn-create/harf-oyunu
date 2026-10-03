// Mini oyun: Yakala ve Yaz (ağla yakala)
// Oyun bir kelime söyler; alttaki çantada kelimenin harf yerleri boş durur. Ekranda harf
// yaratıkları uçuşur. Çocuk yaratığa dokununca ağ iner ve yaratığı yakalar: harfi kelimede
// gerekiyorsa çantadaki yerine uçar. Kelimede olmayan (ya da artık gerekmeyen) harf bir can
// götürür, yaratık kaçar. Bütün yerler dolunca kelime okunur.
// Seviyeler: 1: 3 kelime, kısa kelimeler, yavaş; 2: 4 kelime; 3: 4 kelime, hızlı, benzer harfler.

const YAKALA_SEVIYELERI = {
  1: { tur: 3, enUzun: 4, hiz: 70, yaratik: 6, benzer: false },
  2: { tur: 4, enUzun: 5, hiz: 95, yaratik: 7, benzer: false },
  3: { tur: 4, enUzun: 5, hiz: 125, yaratik: 8, benzer: true },
};

const YARATIK_RENKLERI = [0xc8a2ff, 0x9be3dc, 0xffe680, 0xff9c8a, 0xb5e48c, 0xffc58f];
const CANTA_Y = 640;

class YakalaYazSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("yakala-yaz");
  }

  create() {
    this.ortakKur();
    this.ayar = YAKALA_SEVIYELERI[this.seviye] || YAKALA_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.ilerlemeKur(this.ayar.tur);
    const uygun = ogrenilmisKelimeler(this.harf).filter((k) => k.kelime.length <= this.ayar.enUzun);
    this.kelimeler = Phaser.Utils.Array.Shuffle((uygun.length >= 2 ? uygun : ogrenilmisKelimeler(this.harf)).slice());
    this.turNo = 0;
    this.yaratiklar = [];
    this.yerler = [];
    this.kelime = null;
    this.oynuyor = false;

    const hoparlor = this.add.container(640, 60, [this.hoparlorCiz(0, 0, 38)]).setDepth(900)
      .setSize(96, 96).setInteractive({ useHandCursor: true });
    hoparlor.on("pointerdown", () => { if (this.kelime) Sesler.soyle(this.kelime); });
    this.hoparlor = hoparlor;

    // Çanta (altta)
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x000000, 0.1);
    g.fillRoundedRect(268, CANTA_Y - 62, 760, 120, 26);
    g.fillStyle(0xc99a63, 1);
    g.fillRoundedRect(260, CANTA_Y - 70, 760, 120, 26);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeRoundedRect(260, CANTA_Y - 70, 760, 120, 26);
    this.yerCizim = this.add.graphics().setDepth(2);
    this.harfler = [];

    // Ağ (dokunulan yere iner)
    this.ag = this.add.graphics().setDepth(60).setAlpha(0);
    this.ag.lineStyle(6, 0x8d6e4c, 1);
    this.ag.lineBetween(30, 30, 80, 90);
    this.ag.lineStyle(4, 0x2b2b2b, 1);
    this.ag.strokeCircle(0, 0, 44);
    this.ag.lineStyle(2, 0x2b2b2b, 0.6);
    for (let i = -40; i <= 40; i += 14) {
      this.ag.lineBetween(i, -Math.sqrt(44 * 44 - i * i), i, Math.sqrt(44 * 44 - i * i));
      this.ag.lineBetween(-Math.sqrt(44 * 44 - i * i), i, Math.sqrt(44 * 44 - i * i), i);
    }

    this.input.on("pointerdown", (p) => this.agAt(p));
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniTur()));
  }

  yeniTur() {
    if (this.bitti) return;
    for (const y of this.yaratiklar) y.destroy();
    for (const h of this.harfler) h.destroy();
    this.yaratiklar = [];
    this.harfler = [];
    if (this.turNo >= this.kelimeler.length) Phaser.Utils.Array.Shuffle(this.kelimeler);
    this.kelime = this.kelimeler[this.turNo % this.kelimeler.length].kelime;
    this.turNo++;

    // Çantadaki boş harf yerleri
    const n = this.kelime.length;
    const g = this.yerCizim;
    g.clear();
    this.yerler = [...this.kelime].map((harf, i) => {
      const x = 640 + (i - (n - 1) / 2) * 110;
      g.fillStyle(0xfffdf6, 1);
      g.fillRoundedRect(x - 44, CANTA_Y - 50, 88, 82, 12);
      g.lineStyle(3, 0x2b2b2b, 1);
      g.strokeRoundedRect(x - 44, CANTA_Y - 50, 88, 82, 12);
      return { x, y: CANTA_Y - 9, harf, dolu: false };
    });
    for (let i = 0; i < this.ayar.yaratik; i++) this.yaratikYap();
    this.oynuyor = true;
    this.ihtiyacKontrol();
    this.tweens.add({ targets: this.hoparlor, scale: 1.2, duration: 160, yoyo: true });
    Sesler.soyle(this.kelime);
    this.time.delayedCall(700, () => this.elGoster(this.yaratiklar.find((y) => this.gerekli(y.yaratik.harf))));
  }

  // Bu harfe kelimede hâlâ ihtiyaç var mı?
  gerekli(harf) {
    return this.yerler.some((y) => !y.dolu && y.harf === harf);
  }

  yeniHarf(gerekliOlsun) {
    const gerekenler = this.yerler.filter((y) => !y.dolu).map((y) => y.harf);
    if (gerekenler.length && (gerekliOlsun || Math.random() < 0.6)) return Phaser.Utils.Array.GetRandom(gerekenler);
    const ogrenilmis = ogrenilmisHarfler(this.harf);
    let havuz = ogrenilmis.filter((h) => !this.kelime.includes(h));
    if (this.ayar.benzer) {
      const benzer = [...this.kelime].flatMap((h) => BENZER_HARFLER[h] || []).filter((h) => ogrenilmis.includes(h) && !this.kelime.includes(h));
      if (benzer.length) havuz = [...benzer, ...havuz];
    }
    return havuz.length ? Phaser.Utils.Array.GetRandom(havuz) : Phaser.Utils.Array.GetRandom(ogrenilmis);
  }

  // Uçanlar arasında gereken harf hiç yoksa gerekmeyen bir yaratık gereken harfle değişir
  ihtiyacKontrol() {
    if (this.bitti || !this.oynuyor) return;
    const serbest = this.yaratiklar.filter((y) => !y.yaratik.yakalandi);
    if (serbest.some((y) => this.gerekli(y.yaratik.harf))) return;
    const eski = serbest[0];
    if (eski) {
      this.yaratiklar = this.yaratiklar.filter((y) => y !== eski);
      this.tweens.add({ targets: eski, scale: 0, duration: 200, onComplete: () => eski.destroy() });
    }
    this.yaratikYap(true);
  }

  yaratikYap(gerekliOlsun) {
    const x = Phaser.Math.Between(120, 1160);
    const y = Phaser.Math.Between(200, 480);
    const kap = this.add.container(x, y).setDepth(10);
    const g = this.add.graphics();
    const renk = Phaser.Utils.Array.GetRandom(YARATIK_RENKLERI);
    g.fillStyle(renk, 1);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.fillEllipse(0, 0, 92, 82);
    g.strokeEllipse(0, 0, 92, 82);
    // Kanatçıklar
    g.fillStyle(0xffffff, 0.9);
    g.fillEllipse(-50, -10, 26, 40);
    g.strokeEllipse(-50, -10, 26, 40);
    g.fillEllipse(50, -10, 26, 40);
    g.strokeEllipse(50, -10, 26, 40);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-15, -18, 10);
    g.fillCircle(15, -18, 10);
    g.fillStyle(0x2b2b2b, 1);
    g.fillCircle(-13, -17, 5);
    g.fillCircle(17, -17, 5);
    const harf = this.yeniHarf(gerekliOlsun);
    const yazi = boyaliOrtala(titret(this.add.text(0, 14, harf, {
      fontFamily: "Andika", fontSize: "40px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 7, padding: { x: 3, y: 3 },
    }), 1.3));
    kap.add([g, yazi]);
    const aci = Math.random() * Math.PI * 2;
    kap.yaratik = { harf, vx: Math.cos(aci), vy: Math.sin(aci), evre: Math.random() * 6 };
    kap.setScale(0);
    this.tweens.add({ targets: kap, scale: 1, duration: 300, ease: "Back.Out" });
    this.yaratiklar.push(kap);
    return kap;
  }

  update(zaman, fark) {
    if (this.bitti || !this.oynuyor) return;
    const adim = (this.ayar.hiz * fark) / 1000;
    for (const y of this.yaratiklar) {
      const v = y.yaratik;
      if (v.yakalandi) continue;
      y.x += v.vx * adim;
      y.y += v.vy * adim + Math.sin(zaman / 250 + v.evre) * 0.6;
      if (y.x < 80 || y.x > 1200) { v.vx *= -1; y.x = Phaser.Math.Clamp(y.x, 80, 1200); }
      if (y.y < 180 || y.y > 510) { v.vy *= -1; y.y = Phaser.Math.Clamp(y.y, 180, 510); }
    }
  }

  agAt(p) {
    if (this.bitti || !this.oynuyor || p.y < 150 || p.y > 560) return;
    this.ag.setPosition(p.x, p.y).setAlpha(1).setScale(1.4).setAngle(-30);
    this.tweens.killTweensOf(this.ag);
    this.tweens.add({ targets: this.ag, scale: 1, angle: 0, duration: 180, onComplete: () => {
      this.tweens.add({ targets: this.ag, alpha: 0, duration: 250, delay: 150 });
    } });
    // Ağın altındaki en yakın yaratık (yan yana uçanlarda doğru olan seçilsin)
    let y = null;
    let enYakin = 70;
    for (const x of this.yaratiklar) {
      const d = Math.hypot(x.x - p.x, x.y - p.y);
      if (!x.yaratik.yakalandi && d < enYakin) { enYakin = d; y = x; }
    }
    if (!y) { Sesler.nota(260, 0, 0.05, 0.05, "sine"); return; }
    const harf = y.yaratik.harf;
    if (this.gerekli(harf)) {
      y.yaratik.yakalandi = true;
      const yer = this.yerler.find((x) => !x.dolu && x.harf === harf);
      yer.dolu = true;
      Sesler.pling();
      harfiSoyle(harf);
      // Yaratık çantaya uçar, yerine harf oturur
      this.tweens.add({ targets: y, x: yer.x, y: yer.y, scale: 0.4, alpha: 0, duration: 500, ease: "Cubic.In", onComplete: () => {
        const h = boyaliOrtala(titret(this.add.text(yer.x, yer.y, harf, {
          fontFamily: "Andika", fontSize: "56px", color: "#ffffff",
          stroke: "#3b2a1a", strokeThickness: 9, padding: { x: 4, y: 4 },
        }), 1.6)).setDepth(5).setScale(0);
        this.tweens.add({ targets: h, scale: 1, duration: 200, ease: "Back.Out" });
        this.harfler.push(h);
        this.yaratiklar = this.yaratiklar.filter((x) => x !== y);
        y.destroy();
        if (this.yerler.every((x) => x.dolu)) this.kelimeBitti();
        else { this.yaratikYap(); this.ihtiyacKontrol(); }
      } });
    } else {
      // Gerekmeyen harf: yaratık kaçar, bir can gider
      y.yaratik.vx *= -2.5;
      y.yaratik.vy = -Math.abs(y.yaratik.vy) - 1;
      this.tweens.add({ targets: y, angle: { from: -15, to: 15 }, duration: 70, yoyo: true, repeat: 2, onComplete: () => y.setAngle(0) });
      this.kalpEksilt();
      this.time.delayedCall(800, () => {
        if (this.bitti || !y.active) return;
        y.yaratik.vx = Math.sign(y.yaratik.vx);
        y.yaratik.vy = Math.sign(y.yaratik.vy) || 1;
      });
      this.ipucuGoster(this.yaratiklar.find((x) => !x.yaratik.yakalandi && this.gerekli(x.yaratik.harf)));
    }
  }

  kelimeBitti() {
    this.oynuyor = false;
    Sesler.soyle(this.kelime);
    this.tweens.add({ targets: this.harfler, y: CANTA_Y - 30, duration: 160, yoyo: true, delay: this.tweens.stagger(90) });
    this.ilerlemeArtir(640, CANTA_Y - 9);
    if (!this.bitti) this.time.delayedCall(1800, () => this.yeniTur());
  }

  oyunBitti() {
    this.oynuyor = false;
  }
}

miniOyunKaydet("yakala-yaz", YakalaYazSahnesi);
