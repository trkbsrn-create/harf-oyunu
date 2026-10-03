// Mini oyun: Hece Müziği
// Öğretmenin kararı: iki taslak da kullanılır, farklı seviyelerde.
//   1. seviye "Hece ksilofonu": her tuş bir hece ve bir nota. Oyun kısa bir melodi çalar (tuşlar
//      sırayla parlar, heceler okunur); çocuk aynı tuşlara aynı sırayla basar. Melodi her turda
//      biraz uzar (2, 2, 3, 3 nota). Yanlış tuş bir can götürür, melodi yeniden çalar.
//   2-3. seviye "Nota akışı": heceli notalar sağdan sola akar. Üstte istenen hece var (söylenir).
//      İstenen heceli nota kırmızı çizgiye gelince ona dokun; nota çalar. Başka heceli notalara
//      dokunmak bir can götürür; kaçırılan nota ceza değildir. 3. seviyede daha hızlı ve
//      benzer heceler.
// Ses dosyası yok: notalar tarayıcıda üretilir (Sesler.nota).

const HECE_MUZIGI_SEVIYELERI = {
  1: { tur: "ksilofon", melodiler: [2, 2, 3, 3], tus: 4 },
  2: { tur: "akis", hedef: 8, hiz: 150, aralik: 1300, dogruOrani: 0.5 },
  3: { tur: "akis", hedef: 10, hiz: 200, aralik: 1050, dogruOrani: 0.45 },
};

// Do majör beşli (pentatonik) notalar: hangi sırayla çalınsa da kulağa hoş gelir
const NOTALAR = [523, 587, 659, 784, 880, 1047];
const TUS_RENKLERI = [0xff9c8a, 0xffe680, 0xb5e48c, 0x9be3dc, 0xc8a2ff];
const CIZGI_X = 260;

class HeceMuzigiSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("hece-muzigi");
  }

  create() {
    this.ortakKur();
    this.heceOyunu = true; // ünlü tek başına okunmaz, yalnızca hece duyulur
    this.ayar = HECE_MUZIGI_SEVIYELERI[this.seviye] || HECE_MUZIGI_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.heceler = heceHavuzu(this.harf);
    this.kilitli = true;
    // Sahne yeniden açılınca eski turdan kalan durum temizlensin
    this.tuslar = [];
    this.notalar = null;
    this.melodi = null;
    this.hece = null;
    this.uretici = null;

    const hoparlor = this.add.container(640, 60, [this.hoparlorCiz(0, 0, 38)]).setDepth(900)
      .setSize(96, 96).setInteractive({ useHandCursor: true });
    this.hoparlor = hoparlor;

    if (this.ayar.tur === "ksilofon") {
      this.ilerlemeKur(this.ayar.melodiler.length);
      hoparlor.on("pointerdown", () => { if (!this.kilitli) this.melodiCal(); });
      this.ksilofonKur();
      this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniMelodi()));
    } else {
      this.ilerlemeKur(this.ayar.hedef);
      hoparlor.on("pointerdown", () => { if (this.hece) Sesler.soyle(this.hece); });
      this.akisKur();
      this.time.delayedCall(400, () => this.harfiTanit(() => this.akisBaslat()));
    }
  }

  // ---------- 1. seviye: ksilofon ----------
  ksilofonKur() {
    // Tuş heceleri: oyunun harfini içeren farklı kapalı heceler
    const uygun = Phaser.Utils.Array.Shuffle(this.heceler.filter((h) => !h.acik && (h.u === this.harf || h.s === this.harf)).map((h) => h.hece));
    const obur = Phaser.Utils.Array.Shuffle(this.heceler.filter((h) => !h.acik).map((h) => h.hece));
    const heceler = [];
    for (const h of [...uygun, ...obur]) if (!heceler.includes(h) && heceler.length < this.ayar.tus) heceler.push(h);
    this.tuslar = heceler.map((hece, i) => {
      const en = 190;
      const boy = 300 - i * 22;
      const x = 640 + (i - (heceler.length - 1) / 2) * 215;
      const y = 470;
      const kap = this.add.container(x, y).setDepth(5);
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.12);
      g.fillRoundedRect(-en / 2 + 6, -boy / 2 + 6, en, boy, 20);
      g.fillStyle(TUS_RENKLERI[i % TUS_RENKLERI.length], 1);
      g.fillRoundedRect(-en / 2, -boy / 2, en, boy, 20);
      g.lineStyle(5, 0x2b2b2b, 1);
      g.strokeRoundedRect(-en / 2, -boy / 2, en, boy, 20);
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(0, -boy / 2 + 26, 9);
      g.fillCircle(0, boy / 2 - 26, 9);
      const yazi = boyaliOrtala(titret(this.add.text(0, 0, hece, {
        fontFamily: "Andika", fontSize: "62px", color: "#ffffff",
        stroke: "#3b2a1a", strokeThickness: 10, padding: { x: 4, y: 4 },
      }), 1.8));
      const parilti = this.add.graphics();
      parilti.fillStyle(0xffffff, 0.55);
      parilti.fillRoundedRect(-en / 2, -boy / 2, en, boy, 20);
      parilti.setAlpha(0);
      kap.add([g, yazi, parilti]);
      kap.parilti = parilti;
      kap.tus = { hece, nota: NOTALAR[i], no: i };
      kap.setSize(en + 20, boy + 20).setInteractive({ useHandCursor: true });
      kap.on("pointerdown", () => this.tusaBasildi(kap));
      return kap;
    });
    this.sayaclar = this.add.container(640, 175).setDepth(5);
  }

  tusCal(kap) {
    Sesler.nota(kap.tus.nota, 0, 0.45, 0.22, "triangle");
    Sesler.nota(kap.tus.nota * 2, 0, 0.25, 0.06, "sine");
    Sesler.soyle(kap.tus.hece);
    this.tweens.killTweensOf(kap.parilti);
    kap.parilti.setAlpha(1);
    this.tweens.add({ targets: kap.parilti, alpha: 0, duration: 450 });
    this.tweens.add({ targets: kap, scale: 1.06, duration: 100, yoyo: true });
  }

  yeniMelodi() {
    if (this.bitti) return;
    const uzunluk = this.ayar.melodiler[Math.min(this.ilerleme, this.ayar.melodiler.length - 1)];
    this.melodi = [];
    for (let i = 0; i < uzunluk; i++) {
      let t;
      do { t = Phaser.Math.Between(0, this.tuslar.length - 1); } while (i > 0 && t === this.melodi[i - 1]);
      this.melodi.push(t);
    }
    this.melodiCal();
  }

  // Melodi çalar (tuşlar sırayla parlar); bitince sıra çocukta
  melodiCal() {
    this.kilitli = true;
    this.basilan = 0;
    this.sayacCiz();
    this.melodi.forEach((t, i) => {
      this.time.delayedCall(500 + i * 1100, () => { if (!this.bitti) this.tusCal(this.tuslar[t]); });
    });
    this.time.delayedCall(500 + this.melodi.length * 1100, () => {
      if (this.bitti) return;
      this.kilitli = false;
      this.elGoster(this.tuslar[this.melodi[0]]);
    });
  }

  // Üstte melodinin uzunluğu kadar nota işareti; basıldıkça dolar
  sayacCiz() {
    this.sayaclar.removeAll(true);
    this.melodi.forEach((t, i) => {
      const x = (i - (this.melodi.length - 1) / 2) * 60;
      const dolu = i < this.basilan;
      const d = this.add.circle(x, 0, 18, dolu ? TUS_RENKLERI[t % TUS_RENKLERI.length] : 0xffffff).setStrokeStyle(4, 0x2b2b2b);
      const sap = this.add.rectangle(x + 15, -26, 5, 50, 0x2b2b2b);
      this.sayaclar.add([d, sap]);
    });
  }

  tusaBasildi(kap) {
    if (this.bitti || this.kilitli) return;
    this.tusCal(kap);
    if (kap.tus.no === this.melodi[this.basilan]) {
      this.basilan++;
      this.sayacCiz();
      if (this.basilan >= this.melodi.length) {
        this.kilitli = true;
        this.time.delayedCall(500, () => {
          Sesler.pling();
          this.ilerlemeArtir(640, 175);
          if (!this.bitti) this.time.delayedCall(1200, () => this.yeniMelodi());
        });
      }
    } else {
      this.kilitli = true;
      this.tweens.add({ targets: kap, angle: { from: -4, to: 4 }, duration: 70, yoyo: true, repeat: 2, onComplete: () => kap.setAngle(0) });
      this.kalpEksilt();
      this.time.delayedCall(900, () => { if (!this.bitti) this.melodiCal(); });
    }
  }

  // ---------- 2-3. seviye: nota akışı ----------
  akisKur() {
    const g = this.add.graphics().setDepth(1);
    g.lineStyle(3, 0x2b2b2b, 1);
    for (let i = 0; i < 5; i++) g.lineBetween(60, 300 + i * 55, 1240, 300 + i * 55);
    g.lineStyle(8, 0xe0533d, 1);
    g.lineBetween(CIZGI_X, 250, CIZGI_X, 570);
    g.fillStyle(0xe0533d, 1);
    g.fillTriangle(CIZGI_X - 14, 236, CIZGI_X + 14, 236, CIZGI_X, 256);
    // Üstte istenen hece paneli
    this.hecePaneli = this.add.container(900, 150).setDepth(5);
    this.notalar = [];
  }

  akisBaslat() {
    if (this.bitti) return;
    const { hedef } = heceSorusu(this.heceler, this.harf, this.seviye, 2, this.seviye >= 3 ? 0.4 : 0, null);
    this.hece = hedef;
    this.hecePaneli.removeAll(true);
    const z = this.add.graphics();
    z.fillStyle(0xfffdf6, 1);
    z.fillRoundedRect(-110, -45, 220, 90, 20);
    z.lineStyle(4, 0x2b2b2b, 1);
    z.strokeRoundedRect(-110, -45, 220, 90, 20);
    this.hecePaneli.add([z, boyaliOrtala(titret(this.add.text(0, 0, hedef, {
      fontFamily: "Andika", fontSize: "60px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 10, padding: { x: 4, y: 4 },
    }), 1.8))]);
    Sesler.soyle(hedef);
    this.uretilen = 0;
    this.uretici = this.time.addEvent({ delay: this.ayar.aralik, loop: true, callback: () => this.notaUret() });
    this.notaUret();
    this.input.on("gameobjectdown", (p, nesne) => { if (nesne.nota) this.notayaDokun(nesne); });
  }

  notaUret() {
    if (this.bitti) return;
    this.uretilen++;
    const dogru = this.uretilen <= 2 || Math.random() < this.ayar.dogruOrani;
    let hece = this.hece;
    if (!dogru) {
      const { secenekler } = heceSorusu(this.heceler, this.harf, this.seviye, 3, 0.3, null);
      hece = Phaser.Utils.Array.GetRandom(secenekler.filter((h) => h !== this.hece)) || "el";
      if (hece === this.hece) hece = "el";
    }
    const satir = Phaser.Math.Between(0, 4);
    const y = 300 + satir * 55;
    const kap = this.add.container(1320, y).setDepth(10);
    const g = this.add.graphics();
    g.fillStyle(TUS_RENKLERI[satir], 1);
    g.fillEllipse(0, 0, 110, 76);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.strokeEllipse(0, 0, 110, 76);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.lineBetween(52, -6, 52, -90);
    const yazi = boyaliOrtala(titret(this.add.text(0, 0, hece, {
      fontFamily: "Andika", fontSize: "40px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 7, padding: { x: 4, y: 4 },
    }), 1.4));
    kap.add([g, yazi]);
    kap.nota = { hece, dogru: hece === this.hece, frekans: NOTALAR[4 - satir] };
    kap.setSize(140, 110).setInteractive({ useHandCursor: true });
    this.notalar.push(kap);
  }

  update(zaman, fark) {
    if (this.bitti || this.ayar.tur !== "akis" || !this.notalar) return;
    for (const n of [...this.notalar]) {
      n.x -= (this.ayar.hiz * fark) / 1000;
      // İlk doğru nota çizgiye yaklaşınca gösteren el
      if (n.nota.dogru && n.x < CIZGI_X + 260 && n.x > CIZGI_X) this.elGoster(n);
      if (n.x < -80) {
        this.notalar = this.notalar.filter((x) => x !== n);
        n.destroy();
      }
    }
  }

  notayaDokun(n) {
    if (this.bitti || n.nota.alindi) return;
    const yakin = Math.abs(n.x - CIZGI_X) < 95;
    if (n.nota.dogru && yakin) {
      n.nota.alindi = true;
      Sesler.nota(n.nota.frekans, 0, 0.45, 0.22, "triangle");
      Sesler.nota(n.nota.frekans * 1.5, 0.05, 0.3, 0.08, "sine");
      this.ilerlemeArtir(n.x, n.y);
      this.notalar = this.notalar.filter((x) => x !== n);
      this.tweens.add({ targets: n, y: n.y - 60, scale: 1.3, alpha: 0, duration: 350, onComplete: () => n.destroy() });
    } else if (n.nota.dogru) {
      // Doğru nota ama erken/geç: ceza yok, nota hafifçe sallanır
      this.tweens.add({ targets: n, angle: { from: -6, to: 6 }, duration: 60, yoyo: true, repeat: 1, onComplete: () => n.setAngle(0) });
      Sesler.nota(330, 0, 0.08, 0.08, "sine");
    } else {
      n.nota.alindi = true;
      n.list[0].setAlpha(0.4);
      this.tweens.add({ targets: n, angle: { from: -10, to: 10 }, duration: 60, yoyo: true, repeat: 2, onComplete: () => n.setAngle(0) });
      this.kalpEksilt();
    }
  }

  oyunBitti() {
    if (this.uretici) this.uretici.remove();
    for (const t of this.tuslar || []) t.disableInteractive();
  }
}

miniOyunKaydet("hece-muzigi", HeceMuzigiSahnesi);
