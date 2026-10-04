// Mini oyun: Şeker Patlatma (hece zinciri)
// Tahtada harfli şekerler var. Hece söylenir (hoparlörle tekrar). Çocuk o heceyi oluşturan komşu
// şekerleri sırayla birleştirir: parmağını ilk şekerden sonrakilere kaydırır ya da sırayla dokunur.
// Öğretmenin kararı: harfler baştan sona doğru sırada seçildiyse yön önemli değil (soldan sağa,
// alt alta ya da üç harflide bir aşağı bir sağa gibi kıvrılarak). Hece doğruysa şekerler patlar,
// üsttekiler düşer, yukarıdan yenileri gelir. Yanlış hece bir can götürür.
// Görsel heyecan (öğretmenin isteği): sargılı parlak şekerler, hafif sallanma ve parıltılar,
// seçilen şekerin çevresinde parlayan halka, patlamada beyaz parlama, yıldızlı parçacıklar,
// hafif ekran sarsıntısı ve "Süper!" gibi uçan bir övgü yazısı; tahtanın iki yanında lolipoplar.
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
    g.fillStyle(0xffe9f0, 1);
    g.fillRoundedRect(sol, ust, en, boy, 26);
    g.fillStyle(0xffffff, 0.6);
    for (let i = 0; i < 40; i++) {
      g.fillCircle(sol + 20 + ((i * 97) % (en - 40)), ust + 20 + ((i * 53) % (boy - 40)), 4);
    }
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeRoundedRect(sol, ust, en, boy, 26);
    this.lolipopCiz(sol - 95, ust + boy - 60, 0xff9c8a, -8);
    this.lolipopCiz(sol + en + 95, ust + boy - 60, 0x9be3dc, 8);
    this.lolipopCiz(sol - 70, ust + 70, 0xc8a2ff, 6, 0.7);
    this.lolipopCiz(sol + en + 70, ust + 70, 0xffe680, -6, 0.7);
    this.secimCizim = this.add.graphics().setDepth(15);
    this.halkalar = this.add.graphics().setDepth(9);

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

    // Ara sıra rastgele bir şekerde parıltı
    this.time.addEvent({ delay: 1300, loop: true, callback: () => this.pariltiYap() });
    this.input.on("pointerdown", (p) => this.basildi(p));
    this.input.on("pointermove", (p) => { if (p.isDown) this.surukle(p); });
    this.input.on("pointerup", () => this.birakildi());
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniTur(true)));
  }

  // Tahtanın yanında süs lolipop: sap ve sarmal desenli şeker
  lolipopCiz(x, y, renk, aci, olcek = 1) {
    const g = this.add.graphics().setDepth(2);
    g.lineStyle(10, 0x2b2b2b, 1);
    g.lineBetween(0, 20, 0, 150);
    g.lineStyle(6, 0xffffff, 1);
    g.lineBetween(0, 20, 0, 150);
    g.fillStyle(renk, 1);
    g.fillCircle(0, 0, 46);
    g.lineStyle(7, 0xffffff, 0.85);
    g.beginPath();
    for (let t = 0; t < 14; t += 0.2) g.lineTo(Math.cos(t) * t * 3.1, Math.sin(t) * t * 3.1);
    g.strokePath();
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeCircle(0, 0, 46);
    g.setPosition(x, y).setAngle(aci).setScale(olcek);
    this.tweens.add({ targets: g, angle: aci + (aci > 0 ? -6 : 6), duration: 1600, yoyo: true, repeat: -1, ease: "Sine.InOut" });
  }

  // Rastgele bir şekerin üstünde kısa bir yıldız parıltısı
  pariltiYap() {
    if (this.bitti) return;
    const dolu = this.tahta.flat().filter(Boolean);
    const s = Phaser.Utils.Array.GetRandom(dolu);
    if (!s) return;
    const yildiz = this.add.star(s.x + 26, s.y - 22, 4, 4, 14, 0xffffff).setDepth(12).setScale(0);
    this.tweens.add({ targets: yildiz, scale: 1, angle: 90, duration: 300, yoyo: true, onComplete: () => yildiz.destroy() });
  }

  konum(c, r) {
    return { x: SEKER_SOL + c * SEKER_EN, y: SEKER_UST + r * SEKER_BOY };
  }

  sekerYap(c, r, harf, ustten) {
    const { x, y } = this.konum(c, r);
    const kap = this.add.container(x, ustten ? y - SEKER_BOY * (SEKER_SATIR + 1) : y).setDepth(10);
    // Sargılı şeker: iki yanda büzgülü kâğıt, parlak gövde, şeritler ve parlaklık
    const renk = SEKER_RENKLERI[harf] || 0xffc58f;
    const koyu = Phaser.Display.Color.ValueToColor(renk).darken(18).color;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(4, 7, 86, 72);
    for (const yon of [-1, 1]) {
      g.fillStyle(koyu, 1);
      g.fillTriangle(yon * 34, 0, yon * 58, -24, yon * 58, 24);
      g.lineStyle(3, 0x2b2b2b, 1);
      g.strokeTriangle(yon * 34, 0, yon * 58, -24, yon * 58, 24);
      g.lineStyle(2, 0x2b2b2b, 0.6);
      g.lineBetween(yon * 44, -8, yon * 54, -16);
      g.lineBetween(yon * 44, 8, yon * 54, 16);
    }
    g.fillStyle(renk, 1);
    g.fillEllipse(0, 0, 86, 70);
    g.lineStyle(6, 0xffffff, 0.35);
    for (const dx of [-24, 0, 24]) g.lineBetween(dx - 10, 30, dx + 10, -30);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.strokeEllipse(0, 0, 86, 70);
    g.lineStyle(5, 0xffffff, 0.9);
    g.beginPath();
    g.arc(-4, -2, 26, Math.PI * 1.1, Math.PI * 1.45);
    g.strokePath();
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(-24, -18, 4);
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
    // Hafif sallanma (canlı dursun)
    this.tweens.add({ targets: g, angle: { from: -3, to: 3 }, duration: Phaser.Math.Between(900, 1400),
      yoyo: true, repeat: -1, ease: "Sine.InOut", delay: Phaser.Math.Between(0, 800) });
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

  // Tahtada hecenin bulunduğu yerler: harfleri sırayla taşıyan komşu şekerler (yön serbest:
  // düz, alt alta ya da kıvrılarak) [[s1, s2, ...], ...]
  heceYerleri(hece) {
    const yerler = [];
    const ara = (dizi) => {
      if (dizi.length === hece.length) { yerler.push(dizi); return; }
      const son = dizi[dizi.length - 1];
      for (const [dc, dr] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
        const s = this.tahta[son.seker.c + dc] && this.tahta[son.seker.c + dc][son.seker.r + dr];
        if (s && !dizi.includes(s) && s.seker.harf === hece[dizi.length]) ara([...dizi, s]);
      }
    };
    for (const sutun of this.tahta) for (const s of sutun) if (s && s.seker.harf === hece[0]) ara([s]);
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

  // Seçili şekerlerin arkasında parlayan halka
  halkalariCiz() {
    const g = this.halkalar;
    g.clear();
    const nabiz = 0.5 + 0.5 * Math.sin(this.time.now / 140);
    for (const s of this.secim) {
      if (!s.active) continue;
      g.fillStyle(0xfff1a8, 0.45 + 0.35 * nabiz);
      g.fillCircle(s.x, s.y, 56 + nabiz * 6);
    }
  }

  update() {
    if (this.halkalar) this.halkalariCiz();
  }

  secimCiz() {
    const g = this.secimCizim;
    g.clear();
    if (this.secim.length < 2) return;
    for (const [kalinlik, renk] of [[18, 0xffffff], [8, 0xff6fa8]]) {
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
    // Harfler baştan sona doğru sıradaysa doğru (yön önemli değil; komşuluk seçerken bakılır)
    if (kurulan === this.hece) {
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
    this.cameras.main.shake(160, 0.004);
    this.ovguYaz(ortaX, ortaY);
    for (const s of liste) {
      this.tahta[s.seker.c][s.seker.r] = null;
      // Beyaz parlama, sonra şeker büyüyüp kaybolur; renkli ve yıldızlı parçacıklar
      const parlama = this.add.circle(s.x, s.y, 20, 0xffffff, 0.9).setDepth(19);
      this.tweens.add({ targets: parlama, scale: 3.4, alpha: 0, duration: 380, onComplete: () => parlama.destroy() });
      this.add.particles(s.x, s.y, "seker-parca", {
        speed: { min: 140, max: 360 }, lifespan: 650, scale: { start: 1.2, end: 0 }, gravityY: 300,
        tint: [SEKER_RENKLERI[s.seker.harf] || 0xffc58f, 0xffffff, 0xffe680, 0xff9cc4], emitting: false,
      }).setDepth(20).explode(18);
      for (let k = 0; k < 4; k++) {
        const yildiz = this.add.star(s.x, s.y, 5, 6, 14, Phaser.Utils.Array.GetRandom([0xffe680, 0xff9cc4, 0x9be3dc]))
          .setStrokeStyle(2, 0x2b2b2b).setDepth(21);
        const aci = Math.PI * 2 * (k / 4) + Math.random();
        this.tweens.add({ targets: yildiz, x: s.x + Math.cos(aci) * 110, y: s.y + Math.sin(aci) * 110,
          angle: 180, scale: 0.3, alpha: 0, duration: 600, ease: "Cubic.Out", onComplete: () => yildiz.destroy() });
      }
      this.tweens.add({ targets: s, scale: 1.5, alpha: 0, duration: 180, onComplete: () => s.destroy() });
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

  // Uçan övgü yazısı ("Süper!" gibi)
  ovguYaz(x, y) {
    const soz = Phaser.Utils.Array.GetRandom(["Süper!", "Harika!", "Bravo!", "Şahane!", "Aferin!"]);
    const yazi = doodleYazi(this, x, y, soz, 54, "mavi").setOrigin(0.5).setDepth(30).setScale(0.4).setAngle(-6);
    this.tweens.add({ targets: yazi, scale: 1, duration: 260, ease: "Back.Out" });
    this.tweens.add({ targets: yazi, y: y - 90, alpha: 0, duration: 650, delay: 450, onComplete: () => yazi.destroy() });
  }

  oyunBitti() {
    this.kilitli = true;
  }
}

miniOyunKaydet("seker-patlatma", SekerPatlatmaSahnesi);
