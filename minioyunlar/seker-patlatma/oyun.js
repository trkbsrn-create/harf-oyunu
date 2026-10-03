// Mini oyun: Şeker Patlatma (hece zinciri)
// Tahtada harfli şekerler var. Hece söylenir (hoparlörle tekrar). Çocuk o heceyi oluşturan yan
// yana (soldan sağa) ya da alt alta (yukarıdan aşağı) iki şekeri sırayla birleştirir: parmağını ilk şekerden ikincisine
// kaydırır ya da ikisine sırayla dokunur. Hece doğruysa şekerler patlar, üsttekiler düşer,
// yukarıdan yenileri gelir. Yanlış hece bir can götürür.
// Tahtada istenen hece her zaman en az bir yerde bulunur.
// Seviyeler: 1: 6 hece, kapalı hece; 2: 8 hece, benzer heceler; 3: 10 hece, açık hece de.

const SEKER_SEVIYELERI = {
  1: { tur: 6, acikOrani: 0, heceHarfOrani: 0.5 },
  2: { tur: 8, acikOrani: 0, heceHarfOrani: 0.4 },
  3: { tur: 10, acikOrani: 0.5, heceHarfOrani: 0.35 },
};

const SEKER_SUTUN = 5;
const SEKER_SATIR = 4;
const SEKER_EN = 122;
const SEKER_BOY = 112;
const SEKER_SOL = 640 - ((SEKER_SUTUN - 1) / 2) * SEKER_EN;
const SEKER_UST = 236;
const SEKER_RENKLERI = {
  a: 0xff9c8a, n: 0x9be3dc, e: 0xc8a2ff, t: 0xffe680, i: 0xa9c8f0, l: 0xb5e48c,
};

class SekerPatlatmaSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("seker-patlatma");
  }

  create() {
    this.ortakKur();
    this.heceOyunu = true; // ünlü tek başına okunmaz, yalnızca hece duyulur
    this.ayar = SEKER_SEVIYELERI[this.seviye] || SEKER_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.ilerlemeKur(this.ayar.tur);
    this.heceler = heceHavuzu(this.harf);
    this.harfler = ogrenilmisHarfler(this.harf);
    this.hece = null;
    this.zincir = [];
    this.kilitli = true;

    const hoparlor = this.add.container(640, 60, [this.hoparlorCiz(0, 0, 38)]).setDepth(900)
      .setSize(96, 96).setInteractive({ useHandCursor: true });
    hoparlor.on("pointerdown", () => { if (this.hece) Sesler.soyle(this.hece); });
    this.hoparlor = hoparlor;

    // Tahtanın zemini
    const g = this.add.graphics().setDepth(1);
    const sol = SEKER_SOL - SEKER_EN / 2 - 14;
    const ust = SEKER_UST - SEKER_BOY / 2 - 14;
    const en = SEKER_SUTUN * SEKER_EN + 28;
    const boy = SEKER_SATIR * SEKER_BOY + 28;
    g.fillStyle(0x000000, 0.1);
    g.fillRoundedRect(sol + 8, ust + 8, en, boy, 26);
    g.fillStyle(0xf6efe0, 1);
    g.fillRoundedRect(sol, ust, en, boy, 26);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeRoundedRect(sol, ust, en, boy, 26);
    this.zincirCizim = this.add.graphics().setDepth(15);

    if (!this.textures.exists("seker-parca")) {
      const p = this.make.graphics({ add: false });
      p.fillStyle(0xffffff);
      p.fillCircle(6, 6, 6);
      p.generateTexture("seker-parca", 12, 12);
      p.destroy();
    }

    // Şekerler: tahta[sutun][satir]
    this.tahta = [];
    for (let c = 0; c < SEKER_SUTUN; c++) {
      this.tahta.push([]);
      for (let r = 0; r < SEKER_SATIR; r++) this.tahta[c].push(null);
    }

    this.input.on("pointerdown", (p) => this.basildi(p));
    this.input.on("pointermove", (p) => { if (p.isDown) this.surukle(p); });
    this.input.on("pointerup", () => this.birakildi());
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniTur(true)));
  }

  konum(c, r) {
    return { x: SEKER_SOL + c * SEKER_EN, y: SEKER_UST + r * SEKER_BOY };
  }

  sekerYap(c, r, harf, ustten) {
    const { x, y } = this.konum(c, r);
    const kap = this.add.container(x, ustten ? y - SEKER_BOY * (SEKER_SATIR + 1) : y).setDepth(10);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(4, 6, 98, 78);
    g.fillStyle(SEKER_RENKLERI[harf] || 0xffc58f, 1);
    g.fillEllipse(0, 0, 98, 78);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.strokeEllipse(0, 0, 98, 78);
    g.lineStyle(5, 0xffffff, 0.8);
    g.beginPath();
    g.arc(-6, -4, 28, Math.PI * 1.1, Math.PI * 1.45);
    g.strokePath();
    const yazi = boyaliOrtala(titret(this.add.text(0, 0, harf, {
      fontFamily: "Andika", fontSize: "48px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 8, padding: { x: 4, y: 4 },
    }), 1.5));
    kap.add([g, yazi]);
    kap.seker = { harf, c, r };
    this.tahta[c][r] = kap;
    if (ustten) {
      this.tweens.add({ targets: kap, y, duration: 420 + r * 40, ease: "Bounce.Out" });
    }
    return kap;
  }

  // Yeni şekerin harfi: bazen hecenin harflerinden, çoğu zaman öbür harflerden. Tahta tek bir
  // harfle dolmasın diye bir harften en çok 5 şeker olur.
  rastgeleHarf() {
    const sayilar = {};
    for (const sutun of this.tahta) for (const s of sutun) if (s) sayilar[s.seker.harf] = (sayilar[s.seker.harf] || 0) + 1;
    const uygun = (dizi) => dizi.filter((h) => (sayilar[h] || 0) < 5);
    const heceHarfleri = this.hece ? uygun([...this.hece]) : [];
    const obur = uygun(this.harfler.filter((h) => !heceHarfleri.includes(h)));
    if (heceHarfleri.length && (Math.random() < this.ayar.heceHarfOrani || !obur.length)) {
      return Phaser.Utils.Array.GetRandom(heceHarfleri);
    }
    return Phaser.Utils.Array.GetRandom(obur.length ? obur : this.harfler);
  }

  // Tahtada hece bulunan yan yana çiftler [[c1,r1],[c2,r2]]
  heceYerleri(hece) {
    const yerler = [];
    for (let c = 0; c < SEKER_SUTUN; c++) {
      for (let r = 0; r < SEKER_SATIR; r++) {
        const a = this.tahta[c][r];
        if (!a || a.seker.harf !== hece[0]) continue;
        // Okuma yönünde: soldan sağa ya da yukarıdan aşağı
        for (const [dc, dr] of [[1, 0], [0, 1]]) {
          const b = this.tahta[c + dc] && this.tahta[c + dc][r + dr];
          if (b && b.seker.harf === hece[1]) yerler.push([a, b]);
        }
      }
    }
    return yerler;
  }

  // Hece tahtada yoksa rastgele yan yana iki şekerin harfi hece olacak şekilde değiştirilir
  heceyiGaranti() {
    if (this.heceYerleri(this.hece).length) return;
    const yatay = Math.random() < 0.7;
    const c = Phaser.Math.Between(0, SEKER_SUTUN - (yatay ? 2 : 1));
    const r = Phaser.Math.Between(0, SEKER_SATIR - (yatay ? 1 : 2));
    const c2 = yatay ? c + 1 : c;
    const r2 = yatay ? r : r + 1;
    for (const [cc, rr, h] of [[c, r, this.hece[0]], [c2, r2, this.hece[1]]]) {
      const eski = this.tahta[cc][rr];
      const { x, y } = this.konum(cc, rr);
      const yeni = this.sekerYap(cc, rr, h, false);
      yeni.setPosition(x, y);
      if (eski) {
        yeni.setScale(eski.scale);
        eski.destroy();
      }
    }
  }

  yeniTur(ilk) {
    if (this.bitti) return;
    const { hedef } = heceSorusu(this.heceler, this.harf, this.seviye, 2, this.ayar.acikOrani, this.hece);
    this.hece = hedef;
    if (ilk) {
      for (let c = 0; c < SEKER_SUTUN; c++) {
        for (let r = 0; r < SEKER_SATIR; r++) this.sekerYap(c, r, this.rastgeleHarf(), true);
      }
    }
    this.heceyiGaranti();
    this.time.delayedCall(ilk ? 800 : 300, () => {
      if (this.bitti) return;
      this.tweens.add({ targets: this.hoparlor, scale: 1.2, duration: 160, yoyo: true });
      Sesler.soyle(this.hece, () => {
        this.kilitli = false;
        const yer = this.heceYerleri(this.hece)[0];
        if (yer) this.elSurukleGoster([{ x: yer[0].x, y: yer[0].y + 20 }, { x: yer[1].x, y: yer[1].y + 20 }]);
      });
    });
  }

  // Parmağın altındaki şeker
  sekerBul(p) {
    const c = Math.round((p.x - SEKER_SOL) / SEKER_EN);
    const r = Math.round((p.y - SEKER_UST) / SEKER_BOY);
    if (c < 0 || c >= SEKER_SUTUN || r < 0 || r >= SEKER_SATIR) return null;
    const { x, y } = this.konum(c, r);
    if (Math.abs(p.x - x) > SEKER_EN * 0.48 || Math.abs(p.y - y) > SEKER_BOY * 0.48) return null;
    return this.tahta[c][r];
  }

  yanYana(a, b) {
    return Math.abs(a.seker.c - b.seker.c) + Math.abs(a.seker.r - b.seker.r) === 1;
  }

  basildi(p) {
    if (this.bitti || this.kilitli) return;
    const s = this.sekerBul(p);
    if (!s) return;
    if (this.zincir.length === 1 && this.zincir[0] !== s && this.yanYana(this.zincir[0], s)) {
      // Dokunarak seçme: ikinci şeker
      this.ekle(s);
      this.kontrolEt();
      return;
    }
    this.temizle();
    this.ekle(s);
  }

  surukle(p) {
    if (this.bitti || this.kilitli || this.zincir.length !== 1) return;
    const s = this.sekerBul(p);
    if (s && s !== this.zincir[0] && this.yanYana(this.zincir[0], s)) {
      this.ekle(s);
      this.kontrolEt();
    }
  }

  birakildi() {
    // Tek şeker seçili kaldıysa (dokunarak seçme) bekler; ikinci dokunuşla tamamlanır
  }

  ekle(s) {
    this.zincir.push(s);
    Sesler.nota(this.zincir.length === 1 ? 620 : 780, 0, 0.06, 0.1);
    this.tweens.add({ targets: s, scale: 1.15, duration: 120 });
    this.zincirCiz();
  }

  zincirCiz() {
    const g = this.zincirCizim;
    g.clear();
    if (this.zincir.length < 2) return;
    g.lineStyle(14, 0xffffff, 0.9);
    g.lineBetween(this.zincir[0].x, this.zincir[0].y, this.zincir[1].x, this.zincir[1].y);
    g.lineStyle(6, 0xe0533d, 0.9);
    g.lineBetween(this.zincir[0].x, this.zincir[0].y, this.zincir[1].x, this.zincir[1].y);
  }

  temizle() {
    for (const s of this.zincir) if (s.active) this.tweens.add({ targets: s, scale: 1, duration: 120 });
    this.zincir = [];
    this.zincirCiz();
  }

  kontrolEt() {
    this.kilitli = true;
    const [a, b] = this.zincir;
    const kurulan = a.seker.harf + b.seker.harf;
    // Hece okuma yönünde kurulmalı (soldan sağa ya da yukarıdan aşağı)
    const okumaYonu = (b.seker.c - a.seker.c === 1 && b.seker.r === a.seker.r)
      || (b.seker.r - a.seker.r === 1 && b.seker.c === a.seker.c);
    if (kurulan === this.hece && okumaYonu) {
      this.time.delayedCall(200, () => this.patlat(a, b));
    } else {
      this.tweens.add({ targets: [a, b], angle: { from: -10, to: 10 }, duration: 70, yoyo: true, repeat: 2,
        onComplete: () => {
          a.setAngle(0);
          b.setAngle(0);
          this.temizle();
        } });
      this.kalpEksilt();
      this.time.delayedCall(800, () => {
        if (this.bitti) return;
        Sesler.soyle(this.hece, () => { this.kilitli = false; });
        const yer = this.heceYerleri(this.hece)[0];
        if (yer) yer.forEach((s) => this.ipucuGoster(s));
      });
    }
  }

  patlat(a, b) {
    Sesler.pat();
    Sesler.soyle(this.hece);
    const ortaX = (a.x + b.x) / 2;
    const ortaY = (a.y + b.y) / 2;
    for (const s of [a, b]) {
      this.add.particles(s.x, s.y, "seker-parca", {
        speed: { min: 120, max: 300 }, lifespan: 500, scale: { start: 1, end: 0 },
        tint: [SEKER_RENKLERI[s.seker.harf] || 0xffc58f, 0xffffff], emitting: false,
      }).setDepth(20).explode(14);
      this.tahta[s.seker.c][s.seker.r] = null;
      s.destroy();
    }
    this.zincir = [];
    this.zincirCiz();
    this.ilerlemeArtir(ortaX, ortaY);
    if (this.bitti) return;
    // Üsttekiler düşer, boşluklar yukarıdan dolar
    this.time.delayedCall(250, () => {
      for (let c = 0; c < SEKER_SUTUN; c++) {
        const kalan = [];
        for (let r = SEKER_SATIR - 1; r >= 0; r--) if (this.tahta[c][r]) kalan.push(this.tahta[c][r]);
        for (let r = SEKER_SATIR - 1, i = 0; r >= 0; r--, i++) {
          const s = kalan[i];
          if (s) {
            this.tahta[c][r] = s;
            if (s.seker.r !== r) {
              s.seker.r = r;
              this.tweens.add({ targets: s, y: this.konum(c, r).y, duration: 300, ease: "Bounce.Out" });
            }
          } else {
            this.tahta[c][r] = null;
          }
        }
        for (let r = 0; r < SEKER_SATIR; r++) {
          if (!this.tahta[c][r]) this.sekerYap(c, r, this.rastgeleHarf(), true);
        }
      }
      this.time.delayedCall(550, () => this.yeniTur(false));
    });
  }

  oyunBitti() {
    this.kilitli = true;
  }
}

miniOyunKaydet("seker-patlatma", SekerPatlatmaSahnesi);
