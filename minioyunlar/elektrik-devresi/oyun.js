// Mini oyun: Elektrik Devresi (parçaları kabloyla bağla)
// Oyun bir hece ya da kelime söyler (hoparlörle tekrar). Ekranda sütunlar halinde parçalar var;
// çocuk soldan sağa her sütundan bir parçayı kabloyla bağlar (parmağını sürükleyerek ya da
// parçalara sırayla dokunarak). Parçalar söyleneni oluşturursa akım geçer, ampul yanar ve
// söylenen yazılıp okunur. Yanlış bağlantıda kıvılcım çıkar, bir can gider.
// Seviyeler (öğretmenin isteği):
//   1: harflerden hece kur (a + n = an); iki sütun harf
//   2: iki heceli kelime kur (an + ne = anne); iki sütun hece
//   3: üç heceli kelime kur (ta + ne + li = taneli); üç sütun hece. Yalnızca anlamlı kelimeler
//      (COK_HECELI_KELIMELER) ve hiçbir yanlış yol başka bir anlamlı kelime oluşturmaz.
//      Yeni harf gruplarıyla dört ve beş heceli kelimeler de gelecek.

const ELEKTRIK_SEVIYELERI = {
  1: { tur: 4, tur2: "harf", secenek: 3 },
  2: { tur: 5, tur2: "hece", secenek: 3 },
  3: { tur: 5, tur2: "uc", secenek: 3 },
};

const AMPUL = { x: 640, y: 175 };
const ELEKTRIK_ORTA_Y = 500;

class ElektrikDevresiSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("elektrik-devresi");
  }

  create() {
    this.ortakKur();
    this.heceOyunu = true; // ünlü tek başına okunmaz, yalnızca hece duyulur
    this.ayar = ELEKTRIK_SEVIYELERI[this.seviye] || ELEKTRIK_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.ilerlemeKur(this.ayar.tur);
    this.ogrenilmis = ogrenilmisHarfler(this.harf);
    this.sorular = this.sorulariHazirla();
    this.turNo = 0;
    this.prizler = [];
    this.secilenler = [];
    this.soru = null;
    this.kelimeYazisi = null; // önceki turdan kalan (silinmiş) yazı yeniden silinmesin
    this.kilitli = true;

    const hoparlor = this.add.container(640, 60, [this.hoparlorCiz(0, 0, 38)]).setDepth(900)
      .setSize(96, 96).setInteractive({ useHandCursor: true });
    hoparlor.on("pointerdown", () => { if (this.soru) Sesler.soyle(this.soru.metin); });
    this.hoparlor = hoparlor;

    this.devre = this.add.graphics().setDepth(2);
    this.ampul = this.add.graphics().setDepth(3);
    this.kablo = this.add.graphics().setDepth(4);
    this.ampulCiz(false);

    if (!this.textures.exists("kivilcim")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff);
      g.fillRect(0, 0, 8, 3);
      g.generateTexture("kivilcim", 8, 3);
      g.destroy();
    }

    this.input.on("pointerdown", (p) => this.basildi(p));
    this.input.on("pointermove", (p) => { if (p.isDown && this.secilenler.length) this.surukle(p); });
    this.input.on("pointerup", (p) => this.birakildi(p));
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniTur()));
  }

  // Seviyenin soruları: { metin, parcalar }. Oyunun harfini içerenler önce.
  sorulariHazirla() {
    const yazilabilir = (k) => [...k.kelime].every((h) => this.ogrenilmis.includes(h));
    const harfliOnce = (liste) => {
      const karisik = Phaser.Utils.Array.Shuffle(liste.slice());
      return [...karisik.filter((k) => k.metin.includes(this.harf)), ...karisik.filter((k) => !k.metin.includes(this.harf))];
    };
    if (this.ayar.tur2 === "harf") {
      const heceler = heceHavuzu(this.harf).filter((h) => h.hece.length === 2 && h.hece.includes(this.harf));
      return Phaser.Utils.Array.Shuffle(heceler.map((h) => ({ metin: h.hece, parcalar: [...h.hece] })));
    }
    const liste = this.ayar.tur2 === "uc" ? COK_HECELI_KELIMELER.filter((k) => k.heceler.length === 3) : KELIMELER;
    return harfliOnce(liste.filter(yazilabilir).map((k) => ({ metin: k.kelime, parcalar: k.heceler })));
  }

  // Bir sütunun seçenekleri: doğru parça ve yanlışlar
  sutunSecenekleri(sira) {
    const dogru = this.soru.parcalar[sira];
    let havuz;
    if (this.ayar.tur2 === "harf") {
      havuz = this.ogrenilmis.filter((h) => h !== dogru);
    } else {
      const kaynak = this.ayar.tur2 === "uc" ? [...COK_HECELI_KELIMELER, ...KELIMELER] : KELIMELER;
      havuz = [...new Set(kaynak.map((k) => k.heceler[sira]).filter(Boolean))]
        .filter((h) => h !== dogru && [...h].every((x) => this.ogrenilmis.includes(x)));
    }
    return Phaser.Utils.Array.Shuffle([dogru, ...Phaser.Utils.Array.Shuffle(havuz).slice(0, this.ayar.secenek - 1)]);
  }

  // Doğru yol dışında hiçbir yol anlamlı bir kelime (ya da söylenen) oluşturmasın
  baskaKelimeVar(sutunlar) {
    const anlamli = new Set([...KELIMELER, ...COK_HECELI_KELIMELER].map((k) => k.kelime));
    const dogru = this.soru.parcalar.join("");
    let yollar = [""];
    for (const sutun of sutunlar) yollar = yollar.flatMap((y) => sutun.map((p) => y + p));
    return yollar.some((y) => y !== dogru && (anlamli.has(y) || y === this.soru.metin));
  }

  ampulCiz(yanik) {
    const g = this.ampul;
    const { x, y } = AMPUL;
    g.clear();
    if (yanik) {
      g.fillStyle(0xfff3b0, 0.6);
      g.fillCircle(x, y, 92);
      g.lineStyle(6, 0xffc928, 1);
      for (let a = 0; a < 360; a += 30) {
        const r = Phaser.Math.DegToRad(a);
        g.lineBetween(x + Math.cos(r) * 70, y + Math.sin(r) * 70, x + Math.cos(r) * 92, y + Math.sin(r) * 92);
      }
    }
    g.fillStyle(yanik ? 0xffe680 : 0xf1f1f1, 1);
    g.fillCircle(x, y, 56);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeCircle(x, y, 56);
    g.fillStyle(0xbdbdbd, 1);
    g.fillRoundedRect(x - 26, y + 48, 52, 34, 6);
    g.strokeRoundedRect(x - 26, y + 48, 52, 34, 6);
    g.lineStyle(4, yanik ? 0xe0533d : 0x9e9e9e, 1);
    g.beginPath();
    g.moveTo(x - 18, y + 30);
    g.lineTo(x - 10, y - 8);
    g.lineTo(x, y + 6);
    g.lineTo(x + 10, y - 8);
    g.lineTo(x + 18, y + 30);
    g.strokePath();
  }

  yeniTur() {
    if (this.bitti) return;
    for (const p of this.prizler) p.destroy();
    this.prizler = [];
    this.secilenler = [];
    this.kablo.clear();
    this.devre.clear();
    this.ampulCiz(false);
    if (this.kelimeYazisi) this.kelimeYazisi.destroy();
    this.kelimeYazisi = null;

    // Sıradaki soru (liste biterse karıştırılıp baştan)
    if (this.turNo >= this.sorular.length) Phaser.Utils.Array.Shuffle(this.sorular);
    this.soru = this.sorular[this.turNo % this.sorular.length];
    this.turNo++;
    const n = this.soru.parcalar.length;
    let sutunlar = [];
    for (let deneme = 0; deneme < 30; deneme++) {
      sutunlar = this.soru.parcalar.map((_, i) => this.sutunSecenekleri(i));
      if (!this.baskaKelimeVar(sutunlar)) break;
    }
    this.sutunX = n === 3 ? [220, 640, 1060] : [300, 980];
    const sira = (adet, i) => ELEKTRIK_ORTA_Y + (i - (adet - 1) / 2) * 112;
    sutunlar.forEach((sutun, s) => {
      sutun.forEach((parca, i) => {
        this.prizler.push(this.prizYap(this.sutunX[s], sira(sutun.length, i), parca, s, n,
          parca === this.soru.parcalar[s], i * 80 + s * 200));
      });
    });

    // Devre: ilk ve son sütundan ampule giden ince teller
    const d = this.devre;
    const solX = this.sutunX[0] - 110;
    const sagX = this.sutunX[n - 1] + 110;
    d.lineStyle(4, 0x9e9e9e, 1);
    d.lineBetween(solX, AMPUL.y, solX, 640);
    d.lineBetween(solX, AMPUL.y, AMPUL.x - 56, AMPUL.y);
    d.lineBetween(sagX, AMPUL.y, sagX, 640);
    d.lineBetween(sagX, AMPUL.y, AMPUL.x + 56, AMPUL.y);

    this.time.delayedCall(700, () => {
      if (this.bitti) return;
      this.tweens.add({ targets: this.hoparlor, scale: 1.2, duration: 160, yoyo: true });
      Sesler.soyle(this.soru.metin, () => {
        this.kilitli = false;
        const dogrular = this.soru.parcalar.map((_, s) => this.prizler.find((p) => p.priz.sutun === s && p.priz.dogru));
        this.elSurukleGoster(dogrular.map((p) => ({ x: p.x, y: p.y })));
      });
    });
  }

  prizYap(x, y, metin, sutun, sutunSayisi, dogru, gecikme) {
    const kap = this.add.container(x, y).setDepth(5);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.12);
    g.fillRoundedRect(-76, -40, 160, 88, 18);
    g.fillStyle(0xfffdf6, 1);
    g.fillRoundedRect(-80, -44, 160, 88, 18);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.strokeRoundedRect(-80, -44, 160, 88, 18);
    // Kablo uçları: ilk sütunda sağda, son sütunda solda, ortada iki yanda
    g.fillStyle(0xffe680, 1);
    if (sutun > 0) { g.fillCircle(-80, 0, 13); g.strokeCircle(-80, 0, 13); }
    if (sutun < sutunSayisi - 1) { g.fillCircle(80, 0, 13); g.strokeCircle(80, 0, 13); }
    const yazi = boyaliOrtala(titret(this.add.text(0, -2, metin, {
      fontFamily: "Andika", fontSize: "50px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 8, padding: { x: 4, y: 4 },
    }), 1.6));
    kap.add([g, yazi]);
    kap.cizim = g;
    kap.priz = { metin, sutun, dogru };
    kap.setSize(190, 110);
    kap.setScale(0);
    this.tweens.add({ targets: kap, scale: 1, duration: 260, delay: gecikme, ease: "Back.Out" });
    return kap;
  }

  prizBul(p) {
    return this.prizler.find((k) => Math.abs(p.x - k.x) < 100 && Math.abs(p.y - k.y) < 58);
  }

  // Parçaya dokununca: ilk sütunsa yeni bağlantı başlar; sıradaki sütunsa bağlanır
  basildi(p) {
    if (this.bitti || this.kilitli) return;
    const k = this.prizBul(p);
    if (!k) return;
    if (k.priz.sutun === 0) {
      this.prizler.forEach((x) => x.setScale(1));
      this.secilenler = [k];
      this.sec(k);
      this.kabloCiz(p);
    } else if (this.secilenler.length && k.priz.sutun === this.secilenler.length) {
      this.ekle(k); // dokunarak bağlama
    }
  }

  surukle(p) {
    if (this.bitti || this.kilitli) return;
    const k = this.prizBul(p);
    if (k && k.priz.sutun === this.secilenler.length) {
      this.ekle(k);
      return;
    }
    this.kabloCiz(p);
  }

  birakildi(p) {
    if (this.bitti || this.kilitli || !this.secilenler.length) return;
    this.kabloCiz(null); // seçili parçalar kalır, sonrakine dokunulabilir
  }

  sec(k) {
    Sesler.nota(560 + this.secilenler.length * 90, 0, 0.06, 0.1);
    if (this.ayar.tur2 !== "harf") Sesler.soyle(k.priz.metin); // hece oyununda tek harf okunmaz
    this.tweens.add({ targets: k, scale: 1.08, duration: 120 });
  }

  ekle(k) {
    this.secilenler.push(k);
    this.sec(k);
    this.kabloCiz(null);
    if (this.secilenler.length === this.soru.parcalar.length) {
      this.kilitli = true;
      this.time.delayedCall(300, () => this.kontrolEt());
    }
  }

  // Seçili parçalar arasındaki kablolar ve parmağa uzanan kablo
  kabloCiz(p, yanik) {
    const g = this.kablo;
    g.clear();
    const parcalar = this.secilenler;
    const ciz = (a, b) => {
      const egri = new Phaser.Curves.CubicBezier(
        new Phaser.Math.Vector2(a.x, a.y), new Phaser.Math.Vector2(a.x + 120, a.y + 80),
        new Phaser.Math.Vector2(b.x - 120, b.y + 80), new Phaser.Math.Vector2(b.x, b.y));
      g.lineStyle(14, 0x2b2b2b, 1);
      egri.draw(g, 40);
      g.lineStyle(8, yanik ? 0xffc928 : 0xe0533d, 1);
      egri.draw(g, 40);
    };
    for (let i = 1; i < parcalar.length; i++) {
      ciz({ x: parcalar[i - 1].x + 80, y: parcalar[i - 1].y }, { x: parcalar[i].x - 80, y: parcalar[i].y });
    }
    const son = parcalar[parcalar.length - 1];
    if (p && son && parcalar.length < this.soru.parcalar.length) ciz({ x: son.x + 80, y: son.y }, { x: p.x, y: p.y });
  }

  kontrolEt() {
    const parcalar = this.secilenler;
    const dogru = parcalar.every((k) => k.priz.dogru);
    if (dogru) {
      this.kabloCiz(null, true);
      this.ampulCiz(true);
      Sesler.pling();
      this.kelimeYazisi = boyaliOrtala(titret(this.add.text(AMPUL.x, AMPUL.y + 125, this.soru.metin, {
        fontFamily: "Andika", fontSize: "56px", color: "#ffffff",
        stroke: "#3b2a1a", strokeThickness: 9, padding: { x: 4, y: 4 },
      }), 2)).setDepth(6).setScale(0);
      this.tweens.add({ targets: this.kelimeYazisi, scale: 1, duration: 300, ease: "Back.Out" });
      Sesler.soyle(this.soru.metin);
      this.ilerlemeArtir(AMPUL.x, AMPUL.y);
      this.time.delayedCall(2000, () => this.yeniTur());
    } else {
      // Kıvılcım: devrenin koptuğu yerde (ilk yanlış parça)
      const yanlis = parcalar.find((k) => !k.priz.dogru) || parcalar[parcalar.length - 1];
      this.add.particles(yanlis.x - 80, yanlis.y, "kivilcim", {
        speed: { min: 150, max: 320 }, lifespan: 380, rotate: { min: 0, max: 360 },
        tint: [0xffc928, 0xff6b5a], emitting: false,
      }).setDepth(20).explode(18);
      this.kalpEksilt();
      this.time.delayedCall(500, () => {
        this.secilenler = [];
        this.kablo.clear();
        this.prizler.forEach((x) => x.setScale(1));
        if (this.bitti) return;
        Sesler.soyle(this.soru.metin, () => { this.kilitli = false; });
        this.ipucuGoster(this.prizler.find((x) => x.priz.sutun === 0 && x.priz.dogru));
      });
    }
  }

  oyunBitti() {
    this.kilitli = true;
  }
}

miniOyunKaydet("elektrik-devresi", ElektrikDevresiSahnesi);
