// Mini oyun: Arabayı Ulaştır (yolu çiz)
// Solda araba, sağda bitiş bayrağı var. Arada harfli duraklar. Çocuk parmağını arabadan
// başlatıp bitişe kadar bir yol çizer; yol istenen harfin bütün duraklarından geçmeli, başka
// harfli duraklara değmemeli. Parmak kalkınca araba yolu izler: doğru durakları toplar; yanlış
// durağa gelirse durur ve bir can gider; bitişe varır ama durak eksikse eksik duraklar parlar,
// araba başa döner (can gitmez).
// Seviyeler: 1: 3 tur, 2 doğru + 2 yanlış durak; 2: 4 tur, 3 + 3; 3: 5 tur, 3 + 4, benzer harfler.
// Öğretmenin isteği (Kazma gibi): 2. seviye harflerle hece (hece söylenir; yol hecenin harf
// duraklarından sırayla geçer; 4 hece), 3. seviye hecelerle kelime (3 kelime). Sırası gelmemiş doğru
// durakta araba durur, başa döner (can gitmez); başka durak can götürür. a/n'de harf.

const ARABA_SEVIYELERI = {
  1: { tur: 3, dogru: 2, yanlis: 2, benzer: false },
  2: { tur: 4, dogru: 3, yanlis: 3, benzer: false },
  3: { tur: 5, dogru: 3, yanlis: 4, benzer: true },
};

const ARABA_BASI = { x: 110 };
const BITIS = { x: 1185 };
const DURAK_R = 42;

class ArabayiUlastirSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("arabayi-ulastir");
  }

  create() {
    this.ortakKur();
    this.ayar = ARABA_SEVIYELERI[this.seviye] || ARABA_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.siraliKur();
    this.ilerlemeKur(this.tur === "harf" ? this.ayar.tur : this.tur === "hece" ? 4 : 3);
    if (this.tur === "harf") this.hedefPaneliKur("Geç:");
    else this.siraliPanelKur();
    this.duraklar = [];
    this.yol = [];
    this.ciziyor = false;
    this.gidiyor = false;
    this.yolCizim = this.add.graphics().setDepth(3);
    this.bitisCizim = this.add.graphics().setDepth(2);
    const ogrenilmis = ogrenilmisHarfler(this.harf).filter((h) => h !== this.harf);
    const benzerler = (BENZER_HARFLER[this.harf] || []).filter((h) => ogrenilmis.includes(h));
    this.yanlisHavuz = this.ayar.benzer && benzerler.length ? [...benzerler, ...ogrenilmis] : ogrenilmis;

    // Araba (kabuk, camlar, tekerlekler)
    const g = this.add.graphics();
    g.fillStyle(0xff9c8a, 1);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.fillRoundedRect(-46, -24, 92, 34, 10);
    g.strokeRoundedRect(-46, -24, 92, 34, 10);
    g.fillRoundedRect(-26, -46, 50, 26, 8);
    g.strokeRoundedRect(-26, -46, 50, 26, 8);
    g.fillStyle(0xc9ecff, 1);
    g.fillRect(-20, -41, 18, 17);
    g.fillRect(2, -41, 17, 17);
    g.fillStyle(0x555555, 1);
    g.fillCircle(-26, 12, 12);
    g.fillCircle(26, 12, 12);
    g.strokeCircle(-26, 12, 12);
    g.strokeCircle(26, 12, 12);
    this.araba = this.add.container(ARABA_BASI.x, 400, [g]).setDepth(10);

    this.input.on("pointerdown", (p) => this.cizimBasla(p));
    this.input.on("pointermove", (p) => { if (this.ciziyor && p.isDown) this.cizimEkle(p); });
    this.input.on("pointerup", () => this.cizimBitti());
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniTur()));
  }

  yeniTur() {
    if (this.bitti) return;
    for (const d of this.duraklar) d.destroy();
    this.duraklar = [];
    this.yolTemizle();
    this.basY = Phaser.Math.Between(260, 600);
    this.bitisY = Phaser.Math.Between(260, 600);
    this.araba.setPosition(ARABA_BASI.x, this.basY).setAngle(0).setAlpha(1);

    // Bitiş bayrağı
    const b = this.bitisCizim;
    b.clear();
    b.lineStyle(5, 0x2b2b2b, 1);
    b.lineBetween(BITIS.x, this.bitisY + 40, BITIS.x, this.bitisY - 60);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        b.fillStyle((i + j) % 2 ? 0x2b2b2b : 0xffffff, 1);
        b.fillRect(BITIS.x + i * 14, this.bitisY - 60 + j * 14, 14, 14);
      }
    }
    b.strokeRect(BITIS.x, this.bitisY - 60, 56, 42);

    // Duraklar: doğrular yol boyunca sıralı, yanlışlar araya
    const yerler = [];
    const uygun = (x, y) => yerler.every((n) => Math.hypot(n.x - x, n.y - y) > 150)
      && Math.hypot(x - ARABA_BASI.x, y - this.basY) > 180 && Math.hypot(x - BITIS.x, y - this.bitisY) > 160;
    const koy = (harf, xMin, xMax) => {
      let x = 0;
      let y = 0;
      for (let d = 0; d < 120; d++) {
        x = Phaser.Math.Between(xMin, xMax);
        y = Phaser.Math.Between(200, 640);
        if (uygun(x, y)) break;
      }
      yerler.push({ x, y });
      this.duraklar.push(this.durakYap(x, y, harf));
    };
    // Sıralı oyunda doğru duraklar hecenin harfleri (kelimenin heceleri), soldan sağa sırayla
    const yanlislar = this.tur === "harf" ? this.yanlisHavuz : this.siraliSoruSec();
    const dogrular = this.tur === "harf" ? Array(this.ayar.dogru).fill(this.harf) : this.soru.parcalar;
    const n = dogrular.length;
    dogrular.forEach((metin, i) => {
      const xMin = 300 + (i * 700) / n;
      koy(metin, xMin, xMin + 700 / n - 40);
    });
    if (yanlislar.length) {
      for (let i = 0; i < this.ayar.yanlis; i++) koy(this.tur === "harf" ? Phaser.Utils.Array.GetRandom(yanlislar) : yanlislar[i % yanlislar.length], 280, 1060);
    }
    if (this.tur !== "harf") this.siraliSoyle();

    // Gösteren el: arabadan doğru duraklardan geçip bitişe
    const yol = this.duraklar.filter((d) => d.durak.dogru).sort((a, b) => a.x - b.x);
    this.time.delayedCall(500, () => this.elSurukleGoster([
      { x: ARABA_BASI.x, y: this.basY }, ...yol.map((d) => ({ x: d.x, y: d.y })), { x: BITIS.x + 20, y: this.bitisY }]));
  }

  durakYap(x, y, harf) {
    const kap = this.add.container(x, y).setDepth(4);
    const g = this.add.graphics();
    kap.add(g);
    kap.cizim = g;
    const dogru = this.tur === "harf" ? harf === this.harf : this.soru.parcalar.includes(harf);
    kap.durak = { harf, dogru, alindi: false };
    this.durakCiz(kap, 0xfffdf6);
    kap.add(boyaliOrtala(titret(this.add.text(0, 0, harf, {
      fontFamily: "Andika", fontSize: harf.length > 2 ? "30px" : harf.length > 1 ? "38px" : "46px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 8, padding: { x: 4, y: 4 },
    }), 1.5)));
    return kap;
  }

  durakCiz(kap, renk, cerceve = 0x2b2b2b) {
    const g = kap.cizim;
    g.clear();
    g.fillStyle(0x000000, 0.12);
    g.fillCircle(4, 5, DURAK_R);
    g.fillStyle(renk, 1);
    g.fillCircle(0, 0, DURAK_R);
    g.lineStyle(cerceve === 0x2b2b2b ? 4 : 8, cerceve, 1);
    g.strokeCircle(0, 0, DURAK_R);
  }

  yolTemizle() {
    this.yol = [];
    this.yolCizim.clear();
    if (this.soru && this.sira) { this.sira = 0; this.siraliYuvaCiz(); }
    for (const d of this.duraklar) {
      if (!d.durak.alindi) continue;
      d.durak.alindi = false;
      this.durakCiz(d, 0xfffdf6);
    }
  }

  cizimBasla(p) {
    if (this.bitti || this.gidiyor) return;
    if (Math.hypot(p.x - this.araba.x, p.y - this.araba.y) > 100) return;
    this.yolTemizle();
    this.ciziyor = true;
    this.yol = [{ x: this.araba.x, y: this.araba.y }];
  }

  cizimEkle(p) {
    const son = this.yol[this.yol.length - 1];
    if (Math.hypot(p.x - son.x, p.y - son.y) < 10) return;
    this.yol.push({ x: p.x, y: p.y });
    const g = this.yolCizim;
    g.clear();
    g.lineStyle(26, 0x9e9e9e, 1);
    g.strokePoints(this.yol, false);
    g.lineStyle(4, 0xffffff, 1);
    for (let i = 1; i < this.yol.length; i += 2) g.lineBetween(this.yol[i - 1].x, this.yol[i - 1].y, this.yol[i].x, this.yol[i].y);
  }

  cizimBitti() {
    if (!this.ciziyor) return;
    this.ciziyor = false;
    if (this.yol.length < 4) { this.yolTemizle(); return; }
    this.gidiyor = true;
    this.git(1);
  }

  // Araba yolu nokta nokta izler, duraklara bakar
  git(i) {
    if (this.bitti) return;
    if (i >= this.yol.length) { this.yolSonu(); return; }
    const n = this.yol[i];
    const a = this.araba;
    const mesafe = Math.hypot(n.x - a.x, n.y - a.y);
    a.setAngle(Phaser.Math.RadToDeg(Math.atan2(n.y - a.y, n.x - a.x)) * 0.5);
    this.tweens.add({
      targets: a, x: n.x, y: n.y, duration: Math.max(16, mesafe * 2.6),
      onComplete: () => {
        const d = this.duraklar.find((x) => !x.durak.alindi && Math.hypot(x.x - n.x, x.y - n.y) < DURAK_R + 8);
        const durum = !d ? null : this.tur === "harf" ? (d.durak.dogru ? "sirada" : "yanlis") : this.siraliDurum(d.durak.harf);
        if (durum === "yanlis") { this.yanlisDurak(d); return; }
        if (durum === "sonra") { this.siraDegil(d); return; }
        if (d) {
          d.durak.alindi = true;
          this.durakCiz(d, 0xd9f2c4, 0x8fd16a);
          Sesler.nota(660 + this.duraklar.filter((x) => x.durak.alindi).length * 110, 0, 0.12, 0.12, "triangle");
          if (this.tur === "harf") harfiSoyle(this.harf);
          else this.siraliParcaAl(d.x, d.y);
        }
        this.git(i + 1);
      },
    });
  }

  yanlisDurak(d) {
    this.durakCiz(d, 0xffd6cf, 0xff8a7a);
    this.tweens.add({ targets: this.araba, angle: { from: -15, to: 15 }, duration: 70, yoyo: true, repeat: 2 });
    this.kalpEksilt();
    this.time.delayedCall(900, () => {
      if (this.bitti) return;
      this.durakCiz(d, 0xfffdf6);
      this.basaDon();
    });
  }

  // Sıralı oyun: doğru durak ama sırası gelmedi; araba durur, başa döner (can gitmez)
  siraDegil(d) {
    Sesler.nota(330, 0, 0.1, 0.1, "sine");
    this.tweens.add({ targets: d, angle: { from: -12, to: 12 }, duration: 70, yoyo: true, repeat: 2, onComplete: () => d.setAngle(0) });
    const siradaki = this.duraklar.find((x) => !x.durak.alindi && x.durak.harf === this.soru.parcalar[this.sira]);
    this.time.delayedCall(500, () => { if (siradaki) this.ipucuGoster(siradaki); });
    this.time.delayedCall(900, () => { if (!this.bitti) this.basaDon(); });
  }

  yolSonu() {
    const son = this.yol[this.yol.length - 1];
    const vardi = Math.hypot(son.x - BITIS.x - 20, son.y - this.bitisY) < 110;
    const eksikler = this.duraklar.filter((d) => d.durak.dogru && !d.durak.alindi);
    if (vardi && !eksikler.length) {
      this.tweens.add({ targets: this.araba, x: BITIS.x + 60, duration: 300 });
      if (this.tur !== "harf") {
        this.siraliTamam(() => { this.gidiyor = false; this.yeniTur(); });
        return;
      }
      Sesler.pling();
      this.ilerlemeArtir(BITIS.x, this.bitisY);
      if (!this.bitti) this.time.delayedCall(1300, () => { this.gidiyor = false; this.yeniTur(); });
      return;
    }
    // Eksik durak ya da bitişe varmadı: nazikçe başa dön (can gitmez)
    Sesler.nota(300, 0, 0.15, 0.08, "sine");
    for (const d of eksikler) this.ipucuGoster(d);
    this.time.delayedCall(700, () => this.basaDon());
  }

  basaDon() {
    this.tweens.add({ targets: this.araba, alpha: 0, duration: 200, onComplete: () => {
      this.araba.setPosition(ARABA_BASI.x, this.basY).setAngle(0);
      this.tweens.add({ targets: this.araba, alpha: 1, duration: 200 });
      this.yolTemizle();
      this.gidiyor = false;
    } });
  }

  oyunBitti() {
    this.ciziyor = false;
  }
}

miniOyunKaydet("arabayi-ulastir", ArabayiUlastirSahnesi);
