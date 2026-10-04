// Mini oyun: Canavarı Besle (fırlat)
// Sağda sevimli, aç bir canavar var; konuşma balonunda istediği harf görünür (ünlüyse söylenir).
// Solda harfli meyveler durur. Çocuk doğru harfli meyveyi parmağıyla canavara doğru fırlatır
// (sürükleyip bırakır; 1. seviyede dokunmak da yeter). Meyve kavis çizerek ağzına uçar:
// doğruysa canavar yer ve biraz büyür; yanlışsa yüzünü buruşturup tükürür, bir can gider.
// Seviyeler: 1: 5 lokma, hep oyunun harfi, dokunmak yeter; 2: 6 lokma, arada öbür harfler;
// 3: 8 lokma, benzer harfler.
// Ortak kural (Kazma düzeni): 2. seviyede canavar hece ister (söylenir, balonda hoparlör); hecenin
// harfli meyveleri sırayla fırlatılır, üstteki yerlere uçar (4 hece). 3. seviyede kelime ister,
// heceli meyveler sırayla (3 kelime). Sırası gelmemiş doğru meyve geri döner (can gitmez), başka
// parça tükürülür, can gider. Bu harfte hece yoksa (a, n) harf.

const CANAVAR_SEVIYELERI = {
  1: { tur: 5, kendiOrani: 1, dokunma: true, benzer: false },
  2: { tur: 6, kendiOrani: 0.6, dokunma: false, benzer: false },
  3: { tur: 8, kendiOrani: 0.5, dokunma: false, benzer: true },
};

const AGIZ = { x: 980, y: 455 };
const MEYVE_RENKLERI = [0xff9c8a, 0xffe680, 0xc8a2ff, 0xb5e48c, 0xffc58f, 0x9be3dc];

class CanavariBesleSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("canavari-besle");
  }

  create() {
    this.ortakKur();
    this.ayar = CANAVAR_SEVIYELERI[this.seviye] || CANAVAR_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.siraliKur();
    this.ilerlemeKur(this.tur === "harf" ? this.ayar.tur : this.tur === "hece" ? 4 : 3);
    if (this.tur !== "harf") this.siraliPanelKur();
    this.meyveler = [];
    this.istenen = null;
    this.kilitli = true;
    this.buyukluk = 1;

    // Masa
    const m = this.add.graphics().setDepth(1);
    m.fillStyle(0xc99a63, 1);
    m.fillRoundedRect(80, 560, 560, 40, 14);
    m.lineStyle(5, 0x2b2b2b, 1);
    m.strokeRoundedRect(80, 560, 560, 40, 14);

    this.canavar = this.add.container(AGIZ.x, AGIZ.y - 20).setDepth(5);
    this.canavarCizim = this.add.graphics();
    this.canavar.add(this.canavarCizim);
    this.canavarCiz("bekle");
    this.balon = this.add.container(AGIZ.x - 170, 190).setDepth(6);

    this.input.on("dragstart", (p, n) => { n.basX = n.x; n.basY = n.y; n.surukle = false; n.setDepth(20); });
    this.input.on("drag", (p, n, x, y) => {
      if (this.kilitli) return;
      if (Math.hypot(x - n.basX, y - n.basY) > 14) n.surukle = true;
      n.setPosition(x, y);
    });
    this.input.on("dragend", (p, n) => this.birakildi(n, p));
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniIstek()));
  }

  // Canavar: yeşil yuvarlak gövde, iki göz, ağız (duruma göre)
  canavarCiz(durum) {
    const g = this.canavarCizim;
    g.clear();
    g.fillStyle(0x000000, 0.12);
    g.fillEllipse(8, 150, 220, 30);
    g.fillStyle(0xb5e48c, 1);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.fillEllipse(0, 20, 250, 260);
    g.strokeEllipse(0, 20, 250, 260);
    // Boynuzlar
    g.fillStyle(0xffe680, 1);
    g.fillTriangle(-70, -90, -50, -150, -30, -96);
    g.strokeTriangle(-70, -90, -50, -150, -30, -96);
    g.fillTriangle(70, -90, 50, -150, 30, -96);
    g.strokeTriangle(70, -90, 50, -150, 30, -96);
    // Gözler
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-45, -40, 28);
    g.fillCircle(45, -40, 28);
    g.strokeCircle(-45, -40, 28);
    g.strokeCircle(45, -40, 28);
    g.fillStyle(0x2b2b2b, 1);
    const bak = durum === "bekle" ? -8 : 0;
    g.fillCircle(-45 + bak, -38, 11);
    g.fillCircle(45 + bak, -38, 11);
    // Ağız
    if (durum === "bekle") {
      g.fillStyle(0x5b2a2a, 1);
      g.fillEllipse(0, 50, 110, 80);
      g.fillStyle(0xff8a7a, 1);
      g.fillEllipse(0, 70, 60, 26);
    } else if (durum === "mutlu") {
      g.lineStyle(7, 0x2b2b2b, 1);
      g.beginPath();
      g.arc(0, 30, 50, 0.2, Math.PI - 0.2);
      g.strokePath();
    } else {
      g.lineStyle(7, 0x2b2b2b, 1);
      g.beginPath();
      g.moveTo(-50, 60);
      for (let i = 1; i <= 6; i++) g.lineTo(-50 + i * 17, 60 + (i % 2 ? -10 : 10));
      g.strokePath();
    }
  }

  yeniIstek() {
    if (this.bitti) return;
    for (const m of this.meyveler) m.destroy();
    this.meyveler = [];
    if (this.tur !== "harf") { this.siraliIstek(); return; }
    const ogrenilmis = ogrenilmisHarfler(this.harf);
    this.istenen = Math.random() < this.ayar.kendiOrani ? this.harf
      : Phaser.Utils.Array.GetRandom(ogrenilmis.filter((h) => h !== this.harf));
    this.canavarCiz("bekle");

    // Konuşma balonu
    this.balon.removeAll(true);
    const b = this.add.graphics();
    b.fillStyle(0xfffdf6, 1);
    b.lineStyle(4, 0x2b2b2b, 1);
    b.fillRoundedRect(-80, -60, 160, 120, 30);
    b.strokeRoundedRect(-80, -60, 160, 120, 30);
    b.fillTriangle(40, 50, 90, 100, 70, 46);
    this.balon.add([b, boyaliOrtala(titret(this.add.text(0, 0, this.istenen, {
      fontFamily: "Andika", fontSize: "76px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 12, padding: { x: 4, y: 4 },
    }), 2))]);
    this.balon.setScale(0);
    this.tweens.add({ targets: this.balon, scale: 1, duration: 300, ease: "Back.Out" });
    harfiSoyle(this.istenen);

    // Meyveler: istenen harften 1-2, öbürleri yanlış
    const yanlisHavuz = ogrenilmis.filter((h) => h !== this.istenen);
    const benzer = this.ayar.benzer ? (BENZER_HARFLER[this.istenen] || []).filter((h) => yanlisHavuz.includes(h)) : [];
    // Yanlış meyveler mümkünse birbirinden farklı harfler (benzerler önce)
    const harfler = [this.istenen];
    for (const h of [...Phaser.Utils.Array.Shuffle(benzer.slice()), ...Phaser.Utils.Array.Shuffle(yanlisHavuz.slice())]) {
      if (harfler.length < 4 && !harfler.includes(h)) harfler.push(h);
    }
    while (harfler.length < 4) harfler.push(Phaser.Utils.Array.GetRandom(yanlisHavuz));
    Phaser.Utils.Array.Shuffle(harfler).forEach((h, i) => {
      this.meyveler.push(this.meyveYap(170 + i * 130, 515, h, i * 80));
    });
    this.kilitli = false;
    const dogru = this.meyveler.find((m) => m.meyve.dogru);
    this.time.delayedCall(500, () => this.elSurukleGoster([{ x: dogru.x, y: dogru.y }, { x: (dogru.x + AGIZ.x) / 2, y: 300 }, AGIZ]));
  }

  // Sıralı oyun: canavar hece/kelime ister (balonda hoparlör); masada parçalar ve yanlışlar
  siraliIstek() {
    const yanlislar = this.siraliSoruSec();
    this.canavarCiz("bekle");
    this.balon.removeAll(true);
    const b = this.add.graphics();
    b.fillStyle(0xfffdf6, 1);
    b.lineStyle(4, 0x2b2b2b, 1);
    b.fillRoundedRect(-80, -60, 160, 120, 30);
    b.strokeRoundedRect(-80, -60, 160, 120, 30);
    b.fillTriangle(40, 50, 90, 100, 70, 46);
    this.balon.add([b, this.hoparlorCiz(0, 0, 36)]);
    this.balon.setScale(0);
    this.tweens.add({ targets: this.balon, scale: 1, duration: 300, ease: "Back.Out" });
    this.siraliSoyle();
    const parcalar = [...this.soru.parcalar];
    for (let i = 0; yanlislar.length && i < 2; i++) parcalar.push(yanlislar[i % yanlislar.length]);
    const n = parcalar.length;
    Phaser.Utils.Array.Shuffle(parcalar).forEach((h, i) => {
      this.meyveler.push(this.meyveYap(n > 4 ? 140 + i * (440 / (n - 1)) : 170 + i * 130, 515, h, i * 80));
    });
    this.kilitli = false;
    const dogru = this.siradakiMeyve();
    this.time.delayedCall(500, () => this.elSurukleGoster([{ x: dogru.x, y: dogru.y }, { x: (dogru.x + AGIZ.x) / 2, y: 300 }, AGIZ]));
  }

  siradakiMeyve() {
    const aranan = this.tur === "harf" ? this.istenen : this.soru.parcalar[this.sira];
    return this.meyveler.find((m) => m.meyve.harf === aranan);
  }

  meyveYap(x, y, harf, gecikme) {
    const kap = this.add.container(x, y).setDepth(8);
    const g = this.add.graphics();
    g.fillStyle(Phaser.Utils.Array.GetRandom(MEYVE_RENKLERI), 1);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.fillCircle(0, 0, 46);
    g.strokeCircle(0, 0, 46);
    g.lineStyle(5, 0x6fbf4a, 1);
    g.lineBetween(4, -44, 14, -60);
    const yazi = boyaliOrtala(titret(this.add.text(0, 2, harf, {
      fontFamily: "Andika", fontSize: harf.length > 2 ? "32px" : harf.length > 1 ? "40px" : "50px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 8, padding: { x: 4, y: 4 },
    }), 1.5));
    kap.add([g, yazi]);
    kap.meyve = { harf, dogru: this.tur === "harf" ? harf === this.istenen : this.soru.parcalar.includes(harf), evX: x, evY: y };
    kap.setSize(110, 110).setInteractive({ useHandCursor: true, draggable: true });
    kap.setScale(0);
    this.tweens.add({ targets: kap, scale: 1, duration: 250, delay: gecikme, ease: "Back.Out" });
    return kap;
  }

  birakildi(n, p) {
    if (this.bitti || this.kilitli || !n.meyve) return;
    // Sağa doğru fırlatıldıysa ya da (1. seviyede) dokunulduysa canavara uçar
    const firlatma = n.surukle && (p.x - n.basX > 60 || Math.hypot(p.x - AGIZ.x, p.y - AGIZ.y) < 250);
    if (firlatma || (!n.surukle && this.ayar.dokunma)) {
      this.firlat(n);
    } else {
      this.tweens.add({ targets: n, x: n.meyve.evX, y: n.meyve.evY, duration: 250, onComplete: () => n.setDepth(8) });
    }
  }

  // Meyve kavis çizerek canavarın ağzına uçar
  firlat(n) {
    this.kilitli = true;
    n.disableInteractive();
    Sesler.nota(500, 0, 0.1, 0.08, "sine");
    const bas = { x: n.x, y: n.y };
    const tepe = Math.min(bas.y, AGIZ.y) - 220;
    this.tweens.addCounter({
      from: 0, to: 1, duration: 650, ease: "Sine.InOut",
      onUpdate: (t) => {
        const v = t.getValue();
        n.x = bas.x + (AGIZ.x - bas.x) * v;
        n.y = (1 - v) * (1 - v) * bas.y + 2 * (1 - v) * v * tepe + v * v * AGIZ.y;
        n.angle = v * 360;
      },
      onComplete: () => this.yedi(n),
    });
  }

  yedi(n) {
    const durum = this.tur === "harf" ? (n.meyve.dogru ? "sirada" : "yanlis") : this.siraliDurum(n.meyve.harf);
    if (durum === "sirada" && this.tur !== "harf") {
      // Sıradaki parça: canavar yer, parça üstteki yerine uçar
      n.destroy();
      this.meyveler = this.meyveler.filter((m) => m !== n);
      this.canavarCiz("mutlu");
      this.tweens.add({ targets: this.canavar, scaleX: this.buyukluk * 1.12, scaleY: this.buyukluk * 0.9, duration: 120, yoyo: true,
        onComplete: () => this.canavar.setScale(this.buyukluk) });
      if (this.siraliParcaAl(AGIZ.x, AGIZ.y - 60)) {
        this.buyukluk = Math.min(1.35, this.buyukluk + 0.06);
        this.siraliTamam(() => this.yeniIstek());
      } else {
        this.time.delayedCall(600, () => { if (!this.bitti) { this.canavarCiz("bekle"); this.kilitli = false; } });
      }
      return;
    }
    if (durum === "sonra") {
      // Sırası gelmedi: canavar başını sallar, meyve yerine döner (can gitmez)
      Sesler.nota(330, 0, 0.1, 0.1, "sine");
      this.tweens.add({ targets: this.canavar, angle: { from: -6, to: 6 }, duration: 80, yoyo: true, repeat: 2, onComplete: () => this.canavar.setAngle(0) });
      this.tweens.add({ targets: n, x: n.meyve.evX, y: n.meyve.evY, angle: 0, duration: 400, onComplete: () => {
        n.setDepth(8).setInteractive({ useHandCursor: true, draggable: true });
        this.kilitli = false;
        this.ipucuGoster(this.siradakiMeyve());
      } });
      return;
    }
    if (durum === "sirada") {
      n.destroy();
      this.meyveler = this.meyveler.filter((m) => m !== n);
      this.canavarCiz("mutlu");
      Sesler.nota(220, 0, 0.1, 0.15, "triangle");
      Sesler.nota(260, 0.15, 0.1, 0.15, "triangle");
      this.buyukluk = Math.min(1.35, this.buyukluk + 0.06);
      this.tweens.add({ targets: this.canavar, scaleX: this.buyukluk * 1.12, scaleY: this.buyukluk * 0.9, duration: 120, yoyo: true, repeat: 1,
        onComplete: () => this.canavar.setScale(this.buyukluk) });
      harfiSoyle(this.istenen);
      this.ilerlemeArtir(AGIZ.x, AGIZ.y - 120);
      if (!this.bitti) this.time.delayedCall(1300, () => this.yeniIstek());
    } else {
      // Yanlış: canavar yüzünü buruşturur ve meyveyi tükürür
      this.canavarCiz("igrenme");
      this.tweens.add({ targets: this.canavar, angle: { from: -6, to: 6 }, duration: 80, yoyo: true, repeat: 2, onComplete: () => this.canavar.setAngle(0) });
      this.kalpEksilt();
      this.tweens.add({ targets: n, x: AGIZ.x - 420, y: 700, angle: -540, alpha: 0, duration: 700, ease: "Quad.Out", onComplete: () => n.destroy() });
      this.meyveler = this.meyveler.filter((m) => m !== n);
      this.time.delayedCall(900, () => {
        if (this.bitti) return;
        this.canavarCiz("bekle");
        if (this.tur === "harf") harfiSoyle(this.istenen);
        this.kilitli = false;
        this.ipucuGoster(this.siradakiMeyve());
      });
    }
  }

  oyunBitti() {
    this.kilitli = true;
  }
}

miniOyunKaydet("canavari-besle", CanavariBesleSahnesi);
