// Mini oyun: Harfle Boya (doğru bölgeyi boya)
// Boyanmamış bir resim (ev, çiçek, gemi) bölgelere ayrılmış; her bölgede bir harf var. Çocuk
// istenen harfin bölgelerine dokununca o bölge boyanır. Hepsi boyanınca resmin kalanı da
// kendiliğinden boyanır, resim canlanır. Başka harfli bölgeye dokunmak bir can götürür.
// Seviyeler: 1: 2 resim; 2: 3 resim; 3: 3 resim, öbür bölgelerde benzer harfler.

const BOYA_SEVIYELERI = {
  1: { resim: 2, benzer: false },
  2: { resim: 3, benzer: false },
  3: { resim: 3, benzer: true },
};

// Resimler: bölgeler (biçim, boyutlar, son renk). Koordinatlar ekran üzerinde.
const BOYA_RESIMLERI = [
  { ad: "ev", bolgeler: [
    { tur: "dikdortgen", x: 300, y: 560, en: 680, boy: 90, renk: 0x8fd16a },
    { tur: "daire", x: 1010, y: 230, r: 60, renk: 0xffd34d },
    { tur: "dikdortgen", x: 730, y: 210, en: 50, boy: 90, renk: 0xb07a42 },
    { tur: "cokgen", noktalar: [[420, 330], [640, 175], [860, 330]], renk: 0xff6b5a },
    { tur: "dikdortgen", x: 450, y: 330, en: 380, boy: 230, renk: 0xffe2a8, lx: 515, ly: 505 },
    { tur: "dikdortgen", x: 600, y: 420, en: 80, boy: 140, renk: 0xb07a42 },
    { tur: "dikdortgen", x: 480, y: 370, en: 90, boy: 80, renk: 0x9be3dc },
    { tur: "dikdortgen", x: 710, y: 370, en: 90, boy: 80, renk: 0x9be3dc },
  ] },
  { ad: "cicek", bolgeler: [
    { tur: "cokgen", noktalar: [[540, 560], [740, 560], [710, 660], [570, 660]], renk: 0xd9735b },
    { tur: "dikdortgen", x: 628, y: 340, en: 24, boy: 220, renk: 0x6fbf4a },
    { tur: "elips", x: 560, y: 470, en: 110, boy: 50, renk: 0x8fd16a },
    { tur: "elips", x: 720, y: 430, en: 110, boy: 50, renk: 0x8fd16a },
    { tur: "daire", x: 640, y: 175, r: 55, renk: 0xff9c8a },
    { tur: "daire", x: 735, y: 245, r: 55, renk: 0xc8a2ff },
    { tur: "daire", x: 700, y: 345, r: 55, renk: 0xff9c8a },
    { tur: "daire", x: 580, y: 345, r: 55, renk: 0xc8a2ff },
    { tur: "daire", x: 545, y: 245, r: 55, renk: 0xff9c8a },
    { tur: "daire", x: 640, y: 265, r: 45, renk: 0xffd34d },
  ] },
  { ad: "gemi", bolgeler: [
    { tur: "dikdortgen", x: 280, y: 560, en: 720, boy: 100, renk: 0x7cc4ef },
    { tur: "daire", x: 330, y: 210, r: 55, renk: 0xffd34d },
    { tur: "cokgen", noktalar: [[420, 470], [860, 470], [800, 560], [480, 560]], renk: 0xb07a42 },
    { tur: "dikdortgen", x: 630, y: 190, en: 20, boy: 280, renk: 0x8d6e4c },
    { tur: "cokgen", noktalar: [[620, 210], [620, 450], [470, 450]], renk: 0xffffff },
    { tur: "cokgen", noktalar: [[660, 230], [660, 450], [800, 450]], renk: 0xffe680 },
    { tur: "cokgen", noktalar: [[650, 190], [650, 150], [720, 170]], renk: 0xff6b5a },
    { tur: "daire", x: 560, y: 510, r: 20, renk: 0xc9ecff },
    { tur: "daire", x: 720, y: 510, r: 20, renk: 0xc9ecff },
  ] },
];

class HarfleBoyaSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("harfle-boya");
  }

  create() {
    this.ortakKur();
    this.ayar = BOYA_SEVIYELERI[this.seviye] || BOYA_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.ilerlemeKur(this.ayar.resim);
    this.hedefPaneliKur("Boya:");
    this.resimler = Phaser.Utils.Array.Shuffle(BOYA_RESIMLERI.slice());
    this.turNo = 0;
    this.bolgeler = [];
    this.kilitli = true;
    const ogrenilmis = ogrenilmisHarfler(this.harf).filter((h) => h !== this.harf);
    const benzerler = (BENZER_HARFLER[this.harf] || []).filter((h) => ogrenilmis.includes(h));
    this.yanlisHavuz = this.ayar.benzer && benzerler.length ? [...benzerler, ...benzerler, ...ogrenilmis] : ogrenilmis;
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniResim()));
  }

  yeniResim() {
    if (this.bitti) return;
    for (const b of this.bolgeler) { b.yazi.destroy(); b.destroy(); }
    this.bolgeler = [];
    const resim = this.resimler[this.turNo % this.resimler.length];
    this.turNo++;
    // Bölgelerin aşağı yukarı yarısı oyunun harfi (en az 3)
    const sira = Phaser.Utils.Array.Shuffle([...resim.bolgeler.keys()]);
    const hedefSayisi = Math.max(3, Math.round(resim.bolgeler.length * 0.45));
    resim.bolgeler.forEach((b, i) => {
      const dogru = sira.indexOf(i) < hedefSayisi;
      const harf = dogru ? this.harf : Phaser.Utils.Array.GetRandom(this.yanlisHavuz);
      this.bolgeler.push(this.bolgeYap(b, harf, i));
    });
    this.kilitli = false;
    this.time.delayedCall(500, () => {
      const ilk = this.bolgeler.find((b) => b.bolge.dogru);
      this.elGoster({ x: ilk.yazi.x, y: ilk.yazi.y });
    });
  }

  // Bir bölge: boyanmamış (beyaz) çizim + dokunma alanı + harf
  bolgeYap(b, harf, i) {
    const g = this.add.graphics().setDepth(2 + i * 0.01);
    let alan;
    let orta;
    if (b.tur === "dikdortgen") {
      alan = new Phaser.Geom.Rectangle(b.x, b.y, b.en, b.boy);
      orta = { x: b.x + b.en / 2, y: b.y + b.boy / 2 };
    } else if (b.tur === "daire") {
      alan = new Phaser.Geom.Circle(b.x, b.y, b.r);
      orta = { x: b.x, y: b.y };
    } else if (b.tur === "elips") {
      alan = new Phaser.Geom.Ellipse(b.x, b.y, b.en, b.boy);
      orta = { x: b.x, y: b.y };
    } else {
      alan = new Phaser.Geom.Polygon(b.noktalar.flat());
      const n = b.noktalar.length;
      orta = { x: b.noktalar.reduce((t, p) => t + p[0], 0) / n, y: b.noktalar.reduce((t, p) => t + p[1], 0) / n };
    }
    if (b.lx !== undefined) orta = { x: b.lx, y: b.ly }; // harf, üstteki bölgelerin altında kalmasın
    g.bolge = { b, alan, harf, dogru: harf === this.harf, boyandi: false };
    this.bolgeCiz(g, 0xffffff);
    const icerir = b.tur === "dikdortgen" ? Phaser.Geom.Rectangle.Contains : b.tur === "daire" ? Phaser.Geom.Circle.Contains
      : b.tur === "elips" ? Phaser.Geom.Ellipse.Contains : Phaser.Geom.Polygon.Contains;
    g.setInteractive({ hitArea: alan, hitAreaCallback: icerir, useHandCursor: true });
    g.on("pointerdown", () => this.dokun(g));
    const boyut = b.tur === "daire" && b.r < 30 ? 26 : 36;
    g.yazi = boyaliOrtala(titret(this.add.text(orta.x, orta.y, harf, {
      fontFamily: "Andika", fontSize: `${boyut}px`, color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 7, padding: { x: 3, y: 3 },
    }), 1.3)).setDepth(10);
    return g;
  }

  bolgeCiz(g, renk) {
    const { b } = g.bolge;
    g.clear();
    g.fillStyle(renk, 1);
    g.lineStyle(4, 0x2b2b2b, 1);
    if (b.tur === "dikdortgen") { g.fillRect(b.x, b.y, b.en, b.boy); g.strokeRect(b.x, b.y, b.en, b.boy); }
    else if (b.tur === "daire") { g.fillCircle(b.x, b.y, b.r); g.strokeCircle(b.x, b.y, b.r); }
    else if (b.tur === "elips") { g.fillEllipse(b.x, b.y, b.en, b.boy); g.strokeEllipse(b.x, b.y, b.en, b.boy); }
    else {
      const p = b.noktalar.map(([x, y]) => ({ x, y }));
      g.fillPoints(p, true);
      g.strokePoints(p, true);
    }
  }

  boya(g, gecikme = 0) {
    g.bolge.boyandi = true;
    this.time.delayedCall(gecikme, () => {
      if (!g.active) return;
      this.bolgeCiz(g, g.bolge.b.renk);
      this.tweens.add({ targets: g.yazi, alpha: g.bolge.dogru ? 1 : 0.3, duration: 200 });
    });
  }

  dokun(g) {
    if (this.bitti || this.kilitli || g.bolge.boyandi) return;
    if (g.bolge.dogru) {
      this.boya(g);
      Sesler.nota(700 + Math.random() * 300, 0, 0.1, 0.12, "triangle");
      harfiSoyle(this.harf);
      this.add.particles(g.yazi.x, g.yazi.y, "parilti", {
        speed: { min: 60, max: 160 }, lifespan: 400, scale: { start: 1, end: 0 },
        tint: [g.bolge.b.renk, 0xffffff], emitting: false,
      }).setDepth(20).explode(10);
      if (this.bolgeler.filter((b) => b.bolge.dogru).every((b) => b.bolge.boyandi)) this.resimBitti();
    } else {
      this.tweens.add({ targets: g.yazi, angle: { from: -15, to: 15 }, duration: 70, yoyo: true, repeat: 2, onComplete: () => g.yazi.setAngle(0) });
      this.kalpEksilt();
      this.ipucuGoster(this.bolgeler.find((b) => b.bolge.dogru && !b.bolge.boyandi).yazi);
    }
  }

  // Doğrular bitti: kalan bölgeler sırayla kendiliğinden boyanır, resim canlanır
  resimBitti() {
    this.kilitli = true;
    const kalanlar = this.bolgeler.filter((b) => !b.bolge.boyandi);
    kalanlar.forEach((b, i) => this.boya(b, 200 + i * 120));
    this.time.delayedCall(300 + kalanlar.length * 120, () => {
      Sesler.buyume();
      this.ilerlemeArtir(640, 400);
      if (!this.bitti) this.time.delayedCall(1600, () => this.yeniResim());
    });
  }

  oyunBitti() {
    this.kilitli = true;
  }
}

miniOyunKaydet("harfle-boya", HarfleBoyaSahnesi);
