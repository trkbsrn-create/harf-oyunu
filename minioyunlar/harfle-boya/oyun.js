// Mini oyun: Harfle Boya (doğru bölgeyi boya)
// Boyanmamış bir resim (ev, çiçek, gemi) bölgelere ayrılmış; her bölgede bir harf var. Çocuk
// istenen harfin bölgelerine dokununca o bölge boyanır. Hepsi boyanınca resmin kalanı da
// kendiliğinden boyanır, resim canlanır. Başka harfli bölgeye dokunmak bir can götürür.
// Seviyeler: 1: 2 resim; 2: 3 resim; 3: 3 resim, öbür bölgelerde benzer harfler.
// Öğretmenin isteği: çok resim, gerçekçi renkler, seviyeyle daha ayrıntılı resimler (resimler.js:
// her resmin seviyesi var; 1. seviye az bölgeli, 3. seviye çok bölgeli). Harfsiz süsler (göz, jant)
// ve çizgiler (bıyık, anten) resim bitince boyanır / hep görünür.

const BOYA_SEVIYELERI = {
  1: { resim: 2, benzer: false },
  2: { resim: 3, benzer: false },
  3: { resim: 3, benzer: true },
};

// Öğretmenin isteği: boyanmamış bölgeler beyaz; boyayınca beyaz ya da çok açık renk çıkmasın
// (boyandığı anlaşılmıyordu). Çok açık renk koyulaşır, beyaz/gri tonlar açık mavi-gri olur.
function boyaRengi(renk) {
  const c = Phaser.Display.Color.IntegerToColor(renk);
  if (c.v < 0.8 || c.s > 0.4) return renk;
  if (c.s < 0.12) return 0x9fb3c8; // beyaz, kırık beyaz, açık gri
  return Phaser.Display.Color.HSVToRGB(c.h, Math.max(c.s, 0.55), Math.min(c.v, 0.9)).color;
}

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
    const uygun = BOYA_RESIMLERI.filter((r) => r.seviye === this.seviye);
    this.resimler = Phaser.Utils.Array.Shuffle((uygun.length ? uygun : BOYA_RESIMLERI).slice());
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
    for (const b of this.bolgeler) { if (b.yazi) b.yazi.destroy(); b.destroy(); }
    this.bolgeler = [];
    const resim = this.resimler[this.turNo % this.resimler.length];
    this.turNo++;
    // Harfli bölgelerin aşağı yukarı yarısı oyunun harfi (en az 3)
    const harfliler = resim.bolgeler.filter((b) => !b.detay && b.tur !== "cizgi");
    const sira = Phaser.Utils.Array.Shuffle([...harfliler.keys()]);
    const hedefSayisi = Math.max(3, Math.round(harfliler.length * 0.45));
    resim.bolgeler.forEach((b, i) => {
      if (b.tur === "cizgi") { this.bolgeler.push(this.cizgiYap(b, i)); return; }
      if (b.detay) { this.bolgeler.push(this.bolgeYap(b, null, i)); return; }
      const dogru = sira.indexOf(harfliler.indexOf(b)) < hedefSayisi;
      const harf = dogru ? this.harf : Phaser.Utils.Array.GetRandom(this.yanlisHavuz);
      this.bolgeler.push(this.bolgeYap(b, harf, i));
    });
    this.kilitli = false;
    this.time.delayedCall(500, () => {
      const ilk = this.bolgeler.find((b) => b.bolge.dogru);
      this.elGoster({ x: ilk.yazi.x, y: ilk.yazi.y });
    });
  }

  // Hep görünen siyah çizgi (bıyık, anten, pencere çıtası)
  cizgiYap(b, i) {
    const g = this.add.graphics().setDepth(9 + i * 0.001);
    g.lineStyle(b.kalinlik || 4, 0x2b2b2b, 1);
    g.strokePoints(b.noktalar.map(([x, y]) => ({ x, y })), false);
    g.bolge = { b, boyandi: true, detay: true };
    return g;
  }

  // Bir bölge: boyanmamış (beyaz) çizim + dokunma alanı + harf (harf null: harfsiz süs)
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
    g.bolge = { b, alan, harf, dogru: harf === this.harf, boyandi: false, detay: !harf };
    this.bolgeCiz(g, 0xffffff);
    if (!harf) return g; // harfsiz süs: dokunulmaz, resim bitince boyanır
    const icerir = b.tur === "dikdortgen" ? Phaser.Geom.Rectangle.Contains : b.tur === "daire" ? Phaser.Geom.Circle.Contains
      : b.tur === "elips" ? Phaser.Geom.Ellipse.Contains : Phaser.Geom.Polygon.Contains;
    g.setInteractive({ hitArea: alan, hitAreaCallback: icerir, useHandCursor: true });
    g.on("pointerdown", () => this.dokun(g));
    const kucuk = (b.tur === "daire" && b.r < 34) || (b.tur === "elips" && Math.min(b.en, b.boy) < 60);
    const boyut = kucuk ? 26 : 36;
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
      this.bolgeCiz(g, boyaRengi(g.bolge.b.renk));
      if (g.yazi) this.tweens.add({ targets: g.yazi, alpha: g.bolge.dogru ? 1 : 0.3, duration: 200 });
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
        tint: [boyaRengi(g.bolge.b.renk), 0xffffff], emitting: false,
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
    kalanlar.forEach((b, i) => this.boya(b, 200 + i * 90));
    this.time.delayedCall(300 + kalanlar.length * 90, () => {
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
