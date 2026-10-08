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
// Öğretmenin isteği (daha sevimli, efektli): her seviyede başka bir canavar (CANAVARLAR) ve kendi
// zemini. Canavar nefes alır, göz kırpar, gözleriyle sürüklenen meyveyi izler; meyve yaklaşınca
// ağzını kocaman açar. Doğru meyveyi çiğner, yanakları şişer, kırıntı ve kalpler saçılır, her
// lokmada biraz daha büyür (yaylanarak). Yanlış meyvede yüzü yeşerir, tükürür. Kazanınca zıplar.

const CANAVAR_SEVIYELERI = {
  1: { tur: 5, kendiOrani: 1, dokunma: true, benzer: false },
  2: { tur: 6, kendiOrani: 0.6, dokunma: false, benzer: false },
  3: { tur: 8, kendiOrani: 0.5, dokunma: false, benzer: true },
};

const AGIZ = { x: 980, y: 455 };
// Seviyeye göre canavar: renkler, göz yerleri, süsü (boynuz / anten / kanat)
const CANAVARLAR = [
  { renk: 0x9be37a, karin: 0xdcf6c8, benek: 0x7cc95c, zemin: 0xdff3cf, sus: "boynuz",
    gozler: [{ x: -45, y: -40, r: 28 }, { x: 45, y: -40, r: 28 }] },
  { renk: 0xc8a2ff, karin: 0xece2ff, benek: 0xb08ae8, zemin: 0xece4fb, sus: "anten", tuylu: true,
    gozler: [{ x: 0, y: -42, r: 46 }] },
  { renk: 0xff9c8a, karin: 0xffdcd3, benek: 0xf47f6b, zemin: 0xffe9e1, sus: "kanat",
    gozler: [{ x: -56, y: -32, r: 22 }, { x: 0, y: -62, r: 26 }, { x: 56, y: -32, r: 22 }] },
];
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
    // Canavarın durumu (her karede yeniden çizilir; Tekrar'da sıfırlanır)
    this.tasarim = CANAVARLAR[(this.seviye - 1) % CANAVARLAR.length];
    this.buyukluk = 0.85;
    this.anaDurum = "bekle";
    this.cigneBitis = 0;
    this.sislik = 0;
    this.yesil = 0;
    this.bakis = { x: 0, y: 0 };
    this.kirpSaati = 2000;
    this.kirpBitis = 0;
    this.surukulen = null;
    this.zaman = 0;
    this.zeminCiz();

    // Masa
    const m = this.add.graphics().setDepth(1);
    m.fillStyle(0xc99a63, 1);
    m.fillRoundedRect(80, 560, 560, 40, 14);
    m.lineStyle(5, 0x2b2b2b, 1);
    m.strokeRoundedRect(80, 560, 560, 40, 14);

    this.canavar = this.add.container(AGIZ.x, AGIZ.y - 20).setDepth(5).setScale(this.buyukluk);
    this.canavarCizim = this.add.graphics();
    this.canavar.add(this.canavarCizim);
    this.canavarCiz("bekle");
    this.canavariCiz();
    this.balon = this.add.container(AGIZ.x - 170, 190).setDepth(6);

    this.input.on("dragstart", (p, n) => { n.basX = n.x; n.basY = n.y; n.surukle = false; n.setDepth(20); this.surukulen = n; });
    this.input.on("drag", (p, n, x, y) => {
      if (this.kilitli) return;
      if (Math.hypot(x - n.basX, y - n.basY) > 14) n.surukle = true;
      n.setPosition(x, y);
    });
    this.input.on("dragend", (p, n) => { this.surukulen = null; this.birakildi(n, p); });
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniIstek()));
  }

  // Canavarın arkasında seviyenin rengiyle yumuşak bir tepe ve süs noktaları
  zeminCiz() {
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(this.tasarim.zemin, 1);
    g.fillEllipse(AGIZ.x, 640, 560, 200);
    g.fillCircle(AGIZ.x, 330, 230);
    g.fillStyle(0xffffff, 0.7);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      g.fillCircle(AGIZ.x + Math.cos(a) * 250, 330 + Math.sin(a) * 210, 5 + (i % 3) * 3);
    }
  }

  // Ana durum: "bekle", "mutlu", "igrenme" (her karede canavariCiz çizer)
  canavarCiz(durum) {
    this.anaDurum = durum;
  }

  // Ağız dünyadaki yeri (canavar büyüdükçe değişir)
  agizKonumu() {
    return { x: this.canavar.x, y: this.canavar.y + 62 * this.canavar.scaleY };
  }

  update(zaman, fark) {
    this.zaman += fark;
    // Göz kırpma
    this.kirpSaati -= fark;
    if (this.kirpSaati <= 0) { this.kirpBitis = this.zaman + 140; this.kirpSaati = Phaser.Math.Between(1800, 4200); }
    // Bakış: sürüklenen meyve, yoksa parmak, yoksa sıradaki meyve
    const hedef = this.surukulen || (this.input.activePointer.isDown ? this.input.activePointer : null)
      || this.meyveler[Math.floor(this.zaman / 2500) % Math.max(1, this.meyveler.length)];
    if (hedef) {
      const dx = hedef.x - this.canavar.x;
      const dy = hedef.y - (this.canavar.y - 40);
      const u = Math.max(1, Math.hypot(dx, dy));
      this.bakis.x += ((dx / u) - this.bakis.x) * 0.15;
      this.bakis.y += ((dy / u) - this.bakis.y) * 0.15;
    }
    this.sislik = Math.max(0, this.sislik - fark / 900);
    this.yesil = Math.max(0, this.yesil - fark / 1200);
    this.canavariCiz();
  }

  canavariCiz() {
    const g = this.canavarCizim;
    const t = this.tasarim;
    const z = this.zaman / 1000;
    // Durum: çiğneme > meyve yaklaşınca kocaman açık ağız > ana durum
    let durum = this.anaDurum;
    if (this.zaman < this.cigneBitis) durum = "cigne";
    else if (durum === "bekle" && this.surukulen) {
      const a = this.agizKonumu();
      if (Math.hypot(this.surukulen.x - a.x, this.surukulen.y - a.y) < 420) durum = "acik";
    }
    const sis = this.sislik;
    const nefes = 1 + Math.sin(z * 2.4) * 0.025;
    g.setScale(1 + sis * 0.12, nefes - sis * 0.04);
    g.clear();
    const cizgi = () => g.lineStyle(5, 0x2b2b2b, 1);
    // Gölge
    g.fillStyle(0x000000, 0.12);
    g.fillEllipse(6, 152, 230, 30);
    // Arkadaki süsler: kanatlar (çırpar)
    if (t.sus === "kanat") {
      const cirp = Math.sin(z * 9) * 14;
      g.fillStyle(0x9be3dc, 1);
      for (const yon of [-1, 1]) {
        cizgi();
        g.beginPath();
        g.moveTo(yon * 100, -20);
        g.lineTo(yon * 190, -90 - cirp);
        g.lineTo(yon * 175, -20 - cirp / 2);
        g.lineTo(yon * 200, 20);
        g.lineTo(yon * 110, 30);
        g.closePath();
        g.fillPath();
        g.strokePath();
      }
    }
    // Ayaklar
    g.fillStyle(t.benek, 1);
    cizgi();
    for (const x of [-62, 62]) { g.fillEllipse(x, 140, 70, 34); g.strokeEllipse(x, 140, 70, 34); }
    // Gövde (tüylü canavarda kenarda kabarık tüyler)
    g.fillStyle(t.renk, 1);
    if (t.tuylu) {
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        const x = Math.cos(a) * 122;
        const y = 20 + Math.sin(a) * 128;
        g.fillCircle(x, y, 24);
        g.strokeCircle(x, y, 24);
      }
    }
    g.fillEllipse(0, 20, 250, 260);
    if (!t.tuylu) g.strokeEllipse(0, 20, 250, 260);
    // Karın (şişince büyür) ve benekler
    g.fillStyle(t.karin, 1);
    g.fillEllipse(0, 82, 150 + sis * 40, 110 + sis * 26);
    g.fillStyle(t.benek, 1);
    for (const [x, y, r] of [[-88, 30, 9], [-74, 64, 6], [86, 40, 8], [96, 4, 5], [70, 78, 6]]) g.fillCircle(x, y, r);
    // Üstteki süsler: boynuz ya da sallanan antenler
    if (t.sus === "boynuz") {
      g.fillStyle(0xffe680, 1);
      cizgi();
      for (const yon of [-1, 1]) {
        g.fillTriangle(yon * 70, -90, yon * 50, -152, yon * 28, -98);
        g.strokeTriangle(yon * 70, -90, yon * 50, -152, yon * 28, -98);
      }
    } else if (t.sus === "anten") {
      for (const yon of [-1, 1]) {
        const sal = Math.sin(z * 3 + yon) * 10;
        g.lineStyle(5, 0x2b2b2b, 1);
        g.lineBetween(yon * 30, -102, yon * 52 + sal, -170);
        g.fillStyle(0xffe680, 1);
        g.fillCircle(yon * 52 + sal, -176, 14);
        g.strokeCircle(yon * 52 + sal, -176, 14);
        g.fillStyle(0xffffff, 0.8);
        g.fillCircle(yon * 52 + sal - 4, -180, 4);
      }
    }
    // Gözler: kırpınca ya da mutluyken kapalı kavis, yoksa bakan bebekler
    const kapali = this.zaman < this.kirpBitis || durum === "mutlu" || durum === "cigne";
    for (const goz of t.gozler) {
      if (kapali) {
        g.lineStyle(5, 0x2b2b2b, 1);
        g.beginPath();
        if (durum === "mutlu" || durum === "cigne") g.arc(goz.x, goz.y + goz.r * 0.3, goz.r * 0.7, Math.PI * 1.15, Math.PI * 1.85);
        else { g.moveTo(goz.x - goz.r * 0.8, goz.y); g.lineTo(goz.x + goz.r * 0.8, goz.y); }
        g.strokePath();
        continue;
      }
      g.fillStyle(0xffffff, 1);
      cizgi();
      g.fillCircle(goz.x, goz.y, goz.r);
      g.strokeCircle(goz.x, goz.y, goz.r);
      const ox = goz.x + this.bakis.x * goz.r * 0.38;
      const oy = goz.y + this.bakis.y * goz.r * 0.38;
      g.fillStyle(0x2b2b2b, 1);
      g.fillCircle(ox, oy, goz.r * (durum === "acik" ? 0.52 : 0.42));
      g.fillStyle(0xffffff, 1);
      g.fillCircle(ox - goz.r * 0.15, oy - goz.r * 0.18, goz.r * 0.14);
    }
    // Yanaklar: pembe; çiğnerken kocaman; yanlışta yeşil
    const yanak = durum === "cigne" ? 20 + sis * 8 : 13;
    g.fillStyle(this.yesil > 0 ? 0x8fd16a : 0xff8fa3, 0.7);
    g.fillCircle(-82, 34, yanak);
    g.fillCircle(82, 34, yanak);
    // Ağız
    const ay = 62;
    if (durum === "acik" || durum === "bekle") {
      const en = durum === "acik" ? 124 : 84;
      const boy = durum === "acik" ? 100 : 54;
      g.fillStyle(0x5b2a2a, 1);
      cizgi();
      g.fillEllipse(0, ay, en, boy);
      g.strokeEllipse(0, ay, en, boy);
      g.fillStyle(0xff8a7a, 1);
      g.fillEllipse(0, ay + boy * 0.25, en * 0.5, boy * 0.35);
      g.fillStyle(0xffffff, 1);
      if (t.sus === "anten") {
        g.fillTriangle(-26, ay - boy / 2 + 2, -14, ay - boy / 2 + 2, -20, ay - boy / 2 + 16);
        g.fillTriangle(14, ay - boy / 2 + 2, 26, ay - boy / 2 + 2, 20, ay - boy / 2 + 16);
      }
    } else if (durum === "mutlu") {
      g.fillStyle(0x5b2a2a, 1);
      g.lineStyle(6, 0x2b2b2b, 1);
      g.beginPath();
      g.arc(0, ay - 14, 48, 0.15, Math.PI - 0.15);
      g.closePath();
      g.fillPath();
      g.strokePath();
      g.fillStyle(0xff8a7a, 1);
      g.fillEllipse(0, ay + 22, 40, 18);
    } else if (durum === "cigne") {
      // Çiğneme: dalgalı ağız aşağı yukarı oynar
      const oyna = Math.sin(this.zaman / 60) * 6;
      g.lineStyle(7, 0x2b2b2b, 1);
      g.beginPath();
      g.moveTo(-40, ay + oyna);
      for (let i = 1; i <= 4; i++) g.lineTo(-40 + i * 20, ay + oyna + (i % 2 ? -8 : 0));
      g.strokePath();
    } else {
      g.lineStyle(7, 0x2b2b2b, 1);
      g.beginPath();
      g.moveTo(-50, ay);
      for (let i = 1; i <= 6; i++) g.lineTo(-50 + i * 17, ay + (i % 2 ? -10 : 10));
      g.strokePath();
    }
  }

  // Doğru lokma: çiğner, şişer, kırıntı ve kalpler saçılır, yaylanarak büyür
  lokmaYedi(n) {
    const renk = n.meyve.renk;
    const a = this.agizKonumu();
    this.cigneBitis = this.zaman + 700;
    this.sislik = 1;
    for (let i = 0; i < 4; i++) Sesler.nota(180 + (i % 2) * 40, i * 0.14, 0.06, 0.12, "square"); // çiğneme
    Sesler.nota(520, 0.62, 0.12, 0.12, "sine"); // yutkunma
    Sesler.nota(300, 0.72, 0.15, 0.12, "sine");
    this.add.particles(a.x, a.y, "parilti", {
      speed: { min: 120, max: 300 }, angle: { min: 200, max: 340 }, gravityY: 700, lifespan: 700,
      scale: { start: 1.3, end: 0.3 }, tint: renk, emitting: false,
    }).setDepth(20).explode(18);
    for (let i = 0; i < 3; i++) {
      const k = this.add.image(a.x + Phaser.Math.Between(-90, 90), a.y - 40, "kalp").setScale(0.4).setDepth(21).setAlpha(0);
      this.tweens.add({ targets: k, alpha: 1, y: k.y - 150, scale: 0.6, duration: 900, delay: 250 + i * 150, ease: "Sine.Out",
        onComplete: () => this.tweens.add({ targets: k, alpha: 0, duration: 250, onComplete: () => k.destroy() }) });
    }
    this.buyukluk = Math.min(1.3, this.buyukluk + 0.05);
    this.tweens.killTweensOf(this.canavar);
    this.tweens.add({ targets: this.canavar, scale: this.buyukluk, duration: 900, delay: 500, ease: "Elastic.Out" });
    this.canavarCiz("mutlu");
  }

  yeniIstek() {
    if (this.bitti) return;
    for (const m of this.meyveler) m.destroy();
    this.meyveler = [];
    if (this.tur !== "harf") { this.siraliIstek(); return; }
    const ogrenilmis = ogrenilmisHarfler(this.harf);
    // Başka harf istenecekse yalnızca daha önce öğrenilmiş harflerden (a'da hep a; öğretmenin isteği)
    const oncekiler = bilinenHarfler(this.harf).filter((h) => h !== this.harf);
    this.istenen = !oncekiler.length || Math.random() < this.ayar.kendiOrani ? this.harf
      : Phaser.Utils.Array.GetRandom(oncekiler);
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
    const renk = Phaser.Utils.Array.GetRandom(MEYVE_RENKLERI);
    g.fillStyle(renk, 1);
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
    kap.meyve = { renk, harf, dogru: this.tur === "harf" ? harf === this.istenen : this.soru.parcalar.includes(harf), evX: x, evY: y };
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
    const agiz = this.agizKonumu();
    const tepe = Math.min(bas.y, agiz.y) - 220;
    this.tweens.addCounter({
      from: 0, to: 1, duration: 650, ease: "Sine.InOut",
      onUpdate: (t) => {
        const v = t.getValue();
        n.x = bas.x + (agiz.x - bas.x) * v;
        n.y = (1 - v) * (1 - v) * bas.y + 2 * (1 - v) * v * tepe + v * v * agiz.y;
        n.angle = v * 360;
        n.setScale(1 - v * 0.5); // ağza girerken küçülür
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
      this.lokmaYedi(n);
      const a = this.agizKonumu();
      if (this.siraliParcaAl(a.x, a.y - 60)) {
        this.siraliTamam(() => this.yeniIstek());
      } else {
        this.time.delayedCall(900, () => { if (!this.bitti) { this.canavarCiz("bekle"); this.kilitli = false; } });
      }
      return;
    }
    if (durum === "sonra") {
      // Sırası gelmedi: canavar başını sallar, meyve yerine döner (can gitmez)
      Sesler.nota(330, 0, 0.1, 0.1, "sine");
      this.tweens.add({ targets: this.canavar, angle: { from: -6, to: 6 }, duration: 80, yoyo: true, repeat: 2, onComplete: () => this.canavar.setAngle(0) });
      this.tweens.add({ targets: n, x: n.meyve.evX, y: n.meyve.evY, angle: 0, scale: 1, duration: 400, onComplete: () => {
        n.setDepth(8).setInteractive({ useHandCursor: true, draggable: true });
        this.kilitli = false;
        this.ipucuGoster(this.siradakiMeyve());
      } });
      return;
    }
    if (durum === "sirada") {
      n.destroy();
      this.meyveler = this.meyveler.filter((m) => m !== n);
      this.lokmaYedi(n);
      this.time.delayedCall(700, () => harfiSoyle(this.istenen));
      this.ilerlemeArtir(AGIZ.x, AGIZ.y - 120);
      if (!this.bitti) this.time.delayedCall(1600, () => this.yeniIstek());
    } else {
      // Yanlış: canavarın yüzü yeşerir, buruşturur ve meyveyi tükürür
      this.canavarCiz("igrenme");
      this.yesil = 1;
      const a = this.agizKonumu();
      this.add.particles(a.x, a.y, "parilti", {
        speed: { min: 150, max: 320 }, angle: { min: 160, max: 220 }, gravityY: 500, lifespan: 600,
        scale: { start: 1, end: 0.2 }, tint: n.meyve.renk, emitting: false,
      }).setDepth(20).explode(12);
      this.tweens.add({ targets: this.canavar, angle: { from: -6, to: 6 }, duration: 80, yoyo: true, repeat: 2, onComplete: () => this.canavar.setAngle(0) });
      this.kalpEksilt();
      this.tweens.add({ targets: n, x: AGIZ.x - 420, y: 700, angle: -540, scale: 1, alpha: 0, duration: 700, ease: "Quad.Out", onComplete: () => n.destroy() });
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
    // Kazanınca canavar sevinçle zıplar
    if (this.ilerleme >= this.ilerlemeHedef) {
      this.canavarCiz("mutlu");
      this.tweens.add({ targets: this.canavar, y: this.canavar.y - 60, duration: 260, yoyo: true, repeat: 2, ease: "Quad.Out" });
    }
  }
}

miniOyunKaydet("canavari-besle", CanavariBesleSahnesi);
