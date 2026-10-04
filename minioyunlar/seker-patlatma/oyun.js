// Mini oyun: Şeker Patlatma (hece zinciri)
// Tahtada harfli şekerler var. Hece söylenir (hoparlörle tekrar). Çocuk o heceyi oluşturan yan
// yana (soldan sağa) ya da alt alta (yukarıdan aşağı) şekerleri sırayla birleştirir: parmağını ilk
// şekerden sonrakilere kaydırır ya da sırayla dokunur. Hece doğruysa şekerler patlar, üsttekiler
// düşer, yukarıdan yenileri gelir. Yanlış hece bir can götürür.
// Tahtada istenen hece her zaman en az bir yerde bulunur.
// Seviyeler (bütün hece oyunlarında olduğu gibi): 1: 6 hece, iki harfli (an, na); 2: 8 hece, üç
// harfli (tat); 3: 10 hece, üç harfli, benzer heceler.

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
    this.secim = [];
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
    this.secimCizim = this.add.graphics().setDepth(15);

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

  // Tahtada hecenin bulunduğu yerler: okuma yönünde (soldan sağa ya da yukarıdan aşağı)
  // art arda şekerler [[s1, s2, ...], ...]
  heceYerleri(hece) {
    const yerler = [];
    for (let c = 0; c < SEKER_SUTUN; c++) {
      for (let r = 0; r < SEKER_SATIR; r++) {
        for (const [dc, dr] of [[1, 0], [0, 1]]) {
          const dizi = [];
          for (let k = 0; k < hece.length; k++) {
            const s = this.tahta[c + dc * k] && this.tahta[c + dc * k][r + dr * k];
            if (!s || s.seker.harf !== hece[k]) break;
            dizi.push(s);
          }
          if (dizi.length === hece.length) yerler.push(dizi);
        }
      }
    }
    return yerler;
  }

  // Hece tahtada yoksa rastgele art arda şekerlerin harfi hece olacak şekilde değiştirilir
  heceyiGaranti() {
    if (this.heceYerleri(this.hece).length) return;
    const n = this.hece.length;
    const yatay = Math.random() < 0.7;
    const c = Phaser.Math.Between(0, SEKER_SUTUN - (yatay ? n : 1));
    const r = Phaser.Math.Between(0, SEKER_SATIR - (yatay ? 1 : n));
    for (let k = 0; k < n; k++) {
      const cc = yatay ? c + k : c;
      const rr = yatay ? r : r + k;
      const eski = this.tahta[cc][rr];
      const { x, y } = this.konum(cc, rr);
      const yeni = this.sekerYap(cc, rr, this.hece[k], false);
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
        if (yer) this.elSurukleGoster(yer.map((s) => ({ x: s.x, y: s.y + 20 })));
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

  // Zincire eklenebilir mi: sonuncunun yanında ve zincirde değil
  eklenebilir(s) {
    const son = this.secim[this.secim.length - 1];
    return son && !this.secim.includes(s) && this.yanYana(son, s);
  }

  basildi(p) {
    if (this.bitti || this.kilitli) return;
    const s = this.sekerBul(p);
    if (!s) return;
    if (this.secim.length && this.secim.length < this.hece.length && this.eklenebilir(s)) {
      // Dokunarak seçme: sıradaki şeker
      this.ekle(s);
      if (this.secim.length === this.hece.length) this.kontrolEt();
      return;
    }
    this.temizle();
    this.ekle(s);
  }

  surukle(p) {
    if (this.bitti || this.kilitli || !this.secim.length || this.secim.length >= this.hece.length) return;
    const s = this.sekerBul(p);
    if (s && this.eklenebilir(s)) {
      this.ekle(s);
      if (this.secim.length === this.hece.length) this.kontrolEt();
    }
  }

  birakildi() {
    // Zincir yarım kaldıysa (dokunarak seçme) bekler; sonraki dokunuşlarla tamamlanır
  }

  ekle(s) {
    this.secim.push(s);
    Sesler.nota(560 + this.secim.length * 110, 0, 0.06, 0.1);
    this.tweens.add({ targets: s, scale: 1.15, duration: 120 });
    this.secimCiz();
  }

  secimCiz() {
    const g = this.secimCizim;
    g.clear();
    if (this.secim.length < 2) return;
    for (const [kalinlik, renk] of [[14, 0xffffff], [6, 0xe0533d]]) {
      g.lineStyle(kalinlik, renk, 0.9);
      for (let i = 1; i < this.secim.length; i++) {
        g.lineBetween(this.secim[i - 1].x, this.secim[i - 1].y, this.secim[i].x, this.secim[i].y);
      }
    }
  }

  temizle() {
    for (const s of this.secim) if (s.active) this.tweens.add({ targets: s, scale: 1, duration: 120 });
    this.secim = [];
    this.secimCiz();
  }

  kontrolEt() {
    this.kilitli = true;
    const liste = this.secim.slice();
    const kurulan = liste.map((s) => s.seker.harf).join("");
    // Hece okuma yönünde kurulmalı: hep soldan sağa ya da hep yukarıdan aşağı
    const yon = (a, b) => `${b.seker.c - a.seker.c},${b.seker.r - a.seker.r}`;
    const ilkYon = yon(liste[0], liste[1]);
    const okumaYonu = (ilkYon === "1,0" || ilkYon === "0,1")
      && liste.every((s, i) => i === 0 || yon(liste[i - 1], s) === ilkYon);
    if (kurulan === this.hece && okumaYonu) {
      this.time.delayedCall(200, () => this.patlat(liste));
    } else {
      this.tweens.add({ targets: liste, angle: { from: -10, to: 10 }, duration: 70, yoyo: true, repeat: 2,
        onComplete: () => {
          for (const s of liste) s.setAngle(0);
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

  patlat(liste) {
    Sesler.pat();
    Sesler.soyle(this.hece);
    const ortaX = liste.reduce((t, s) => t + s.x, 0) / liste.length;
    const ortaY = liste.reduce((t, s) => t + s.y, 0) / liste.length;
    for (const s of liste) {
      this.add.particles(s.x, s.y, "seker-parca", {
        speed: { min: 120, max: 300 }, lifespan: 500, scale: { start: 1, end: 0 },
        tint: [SEKER_RENKLERI[s.seker.harf] || 0xffc58f, 0xffffff], emitting: false,
      }).setDepth(20).explode(14);
      this.tahta[s.seker.c][s.seker.r] = null;
      s.destroy();
    }
    this.secim = [];
    this.secimCiz();
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
