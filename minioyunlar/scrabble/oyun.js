// Mini oyun: Scrabble (kelimeyi diz)
// Oyun bir kelime söyler (hoparlörle tekrar; resmi varsa yanında görünür). Rafta kelimenin
// harf taşları karışık durur. Çocuk taşlara sırayla dokunur; taş bir sonraki boş yere geçer
// (yerleşmiş taşa dokununca rafa döner). Kelime tamamlanınca doğruysa okunur ve parlar;
// yanlış yerdeki taşlar rafa döner, bir can gider.
// Yalnızca öğrenilmiş harflerle yazılabilen kelimeler (KELIMELER).
// Seviyeler: 1: 4 kelime, kısa kelimeler, fazladan taş yok; 2: 5 kelime, 1 fazladan taş;
// 3: 5 kelime, 2 fazladan (benzer) taş.

const SCRABBLE_SEVIYELERI = {
  1: { tur: 4, enUzun: 4, fazla: 0 },
  2: { tur: 5, enUzun: 5, fazla: 1 },
  3: { tur: 5, enUzun: 5, fazla: 2 },
};

// Resmi olan kelimeler (gorseller/ içinde)
const KELIME_RESIMLERI = { lale: "cicek-kirmizi" };
const TAS_EN = 92;
const YER_Y = 330;
const RAF_Y = 575;

class ScrabbleSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("scrabble");
  }

  preload() {
    super.preload();
    for (const ad of Object.values(KELIME_RESIMLERI)) this.load.svg(ad, `gorseller/${ad}.svg`);
  }

  create() {
    this.ortakKur();
    this.heceOyunu = true; // ünlü tek başına okunmaz, yalnızca hece duyulur
    this.ayar = SCRABBLE_SEVIYELERI[this.seviye] || SCRABBLE_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.ilerlemeKur(this.ayar.tur);
    const uygun = ogrenilmisKelimeler(this.harf).filter((k) => k.kelime.length <= this.ayar.enUzun);
    this.kelimeler = Phaser.Utils.Array.Shuffle((uygun.length >= 3 ? uygun : ogrenilmisKelimeler(this.harf)).slice());
    this.turNo = 0;
    this.taslar = [];
    this.yerler = [];
    this.resim = null;
    this.kelime = null;
    this.kilitli = true;

    const hoparlor = this.add.container(640, 60, [this.hoparlorCiz(0, 0, 38)]).setDepth(900)
      .setSize(96, 96).setInteractive({ useHandCursor: true });
    hoparlor.on("pointerdown", () => { if (this.kelime) Sesler.soyle(this.kelime); });
    this.hoparlor = hoparlor;

    // Tahta raf
    const raf = this.add.graphics().setDepth(1);
    raf.fillStyle(0x000000, 0.12);
    raf.fillRoundedRect(248, RAF_Y - 62, 800, 130, 22);
    raf.fillStyle(0xc99a63, 1);
    raf.fillRoundedRect(240, RAF_Y - 70, 800, 130, 22);
    raf.lineStyle(5, 0x2b2b2b, 1);
    raf.strokeRoundedRect(240, RAF_Y - 70, 800, 130, 22);
    this.yerCizim = this.add.graphics().setDepth(2);

    this.input.on("gameobjectdown", (p, nesne) => { if (nesne.tas) this.tasaDokun(nesne); });
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniTur()));
  }

  yeniTur() {
    if (this.bitti) return;
    for (const t of this.taslar) t.destroy();
    this.taslar = [];
    if (this.resim) this.resim.destroy();
    this.resim = null;
    if (this.turNo >= this.kelimeler.length) Phaser.Utils.Array.Shuffle(this.kelimeler);
    this.kelime = this.kelimeler[this.turNo % this.kelimeler.length].kelime;
    this.turNo++;
    const n = this.kelime.length;

    // Kelimenin yerleri
    this.yerler = [];
    const g = this.yerCizim;
    g.clear();
    for (let i = 0; i < n; i++) {
      const x = 640 + (i - (n - 1) / 2) * (TAS_EN + 14);
      this.yerler.push({ x, y: YER_Y, tas: null });
      g.lineStyle(4, 0x2b2b2b, 1);
      g.fillStyle(0xfffdf6, 1);
      g.fillRoundedRect(x - TAS_EN / 2, YER_Y - TAS_EN / 2, TAS_EN, TAS_EN, 12);
      for (let d = 0; d < TAS_EN * 4; d += 16) {
        // Kesikli çerçeve
        const kenar = Math.floor(d / TAS_EN);
        const t = d % TAS_EN;
        const [x1, y1, x2, y2] = [
          [x - TAS_EN / 2 + t, YER_Y - TAS_EN / 2, x - TAS_EN / 2 + Math.min(t + 9, TAS_EN), YER_Y - TAS_EN / 2],
          [x + TAS_EN / 2, YER_Y - TAS_EN / 2 + t, x + TAS_EN / 2, YER_Y - TAS_EN / 2 + Math.min(t + 9, TAS_EN)],
          [x + TAS_EN / 2 - t, YER_Y + TAS_EN / 2, x + TAS_EN / 2 - Math.min(t + 9, TAS_EN), YER_Y + TAS_EN / 2],
          [x - TAS_EN / 2, YER_Y + TAS_EN / 2 - t, x - TAS_EN / 2, YER_Y + TAS_EN / 2 - Math.min(t + 9, TAS_EN)],
        ][kenar];
        g.lineBetween(x1, y1, x2, y2);
      }
    }
    // Resim (varsa) kelimenin solunda
    const resimAdi = KELIME_RESIMLERI[this.kelime];
    if (resimAdi) {
      this.resim = this.add.image(640 - ((n + 1) / 2) * (TAS_EN + 14) - 70, YER_Y, resimAdi).setDepth(2);
      this.resim.setScale(130 / Math.max(this.resim.width, this.resim.height));
    }

    // Raftaki taşlar: kelimenin harfleri + fazladan (benzer) harfler, karışık
    const harfler = [...this.kelime];
    const ogrenilmis = bilinenHarfler(this.harf);
    const fazlalar = [];
    for (const h of Phaser.Utils.Array.Shuffle(harfler.slice())) {
      for (const b of BENZER_HARFLER[h] || []) if (ogrenilmis.includes(b) && !fazlalar.includes(b)) fazlalar.push(b);
    }
    for (const h of Phaser.Utils.Array.Shuffle(ogrenilmis.slice())) if (!fazlalar.includes(h)) fazlalar.push(h);
    const raftakiler = Phaser.Utils.Array.Shuffle([...harfler, ...fazlalar.slice(0, this.ayar.fazla)]);
    const aralik = Math.min(TAS_EN + 18, 760 / raftakiler.length);
    raftakiler.forEach((h, i) => {
      const x = 640 + (i - (raftakiler.length - 1) / 2) * aralik;
      this.taslar.push(this.tasYap(x, RAF_Y - 5, h, i * 60));
    });

    this.time.delayedCall(600, () => {
      if (this.bitti) return;
      this.tweens.add({ targets: this.hoparlor, scale: 1.2, duration: 160, yoyo: true });
      Sesler.soyle(this.kelime, () => {
        this.kilitli = false;
        this.elGoster(this.taslar.find((t) => t.tas.harf === this.kelime[0]));
      });
    });
  }

  tasYap(x, y, harf, gecikme) {
    const kap = this.add.container(x, y).setDepth(10);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.18);
    g.fillRoundedRect(-TAS_EN / 2 + 5, -TAS_EN / 2 + 6, TAS_EN, TAS_EN, 12);
    g.fillStyle(0xf3d9a4, 1);
    g.fillRoundedRect(-TAS_EN / 2, -TAS_EN / 2, TAS_EN, TAS_EN, 12);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.strokeRoundedRect(-TAS_EN / 2, -TAS_EN / 2, TAS_EN, TAS_EN, 12);
    const yazi = boyaliOrtala(titret(this.add.text(0, 0, harf, {
      fontFamily: "Andika", fontSize: "60px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 10, padding: { x: 4, y: 4 },
    }), 1.6));
    kap.add([g, yazi]);
    kap.cizim = g;
    kap.tas = { harf, yer: -1, evX: x, evY: y };
    kap.setSize(TAS_EN + 16, TAS_EN + 16).setInteractive({ useHandCursor: true });
    kap.setScale(0);
    this.tweens.add({ targets: kap, scale: 1, duration: 240, delay: gecikme, ease: "Back.Out" });
    return kap;
  }

  tasCiz(kap, renk) {
    const g = kap.cizim;
    g.clear();
    g.fillStyle(0x000000, 0.18);
    g.fillRoundedRect(-TAS_EN / 2 + 5, -TAS_EN / 2 + 6, TAS_EN, TAS_EN, 12);
    g.fillStyle(0xf3d9a4, 1);
    g.fillRoundedRect(-TAS_EN / 2, -TAS_EN / 2, TAS_EN, TAS_EN, 12);
    g.lineStyle(renk ? 8 : 4, renk || 0x2b2b2b, 1);
    g.strokeRoundedRect(-TAS_EN / 2, -TAS_EN / 2, TAS_EN, TAS_EN, 12);
  }

  tasaDokun(kap) {
    if (this.bitti || this.kilitli) return;
    const t = kap.tas;
    if (t.yer >= 0) {
      this.yerler[t.yer].tas = null;
      t.yer = -1;
      Sesler.nota(440, 0, 0.06, 0.1);
      this.tweens.add({ targets: kap, x: t.evX, y: t.evY, duration: 250, ease: "Quad.Out" });
      return;
    }
    const bos = this.yerler.findIndex((y) => !y.tas);
    if (bos < 0) return;
    this.yerler[bos].tas = kap;
    t.yer = bos;
    Sesler.nota(560 + bos * 60, 0, 0.06, 0.1);
    this.tweens.add({ targets: kap, x: this.yerler[bos].x, y: YER_Y, duration: 260, ease: "Back.Out" });
    if (this.yerler.every((y) => y.tas)) {
      this.kilitli = true;
      this.time.delayedCall(450, () => this.kontrolEt());
    }
  }

  kontrolEt() {
    if (this.bitti) return;
    const yanlislar = this.yerler.filter((y, i) => y.tas.tas.harf !== this.kelime[i]);
    if (!yanlislar.length) {
      Sesler.pling();
      Sesler.soyle(this.kelime);
      this.yerler.forEach((y, i) => {
        this.tasCiz(y.tas, 0x8fd16a);
        this.tweens.add({ targets: y.tas, y: YER_Y - 22, duration: 160, yoyo: true, delay: i * 90 });
      });
      this.ilerlemeArtir(640, YER_Y);
      if (!this.bitti) this.time.delayedCall(1900, () => this.yeniTur());
    } else {
      // Yanlış yerdeki taşlar kızarır ve rafa döner; doğrular yerinde kalır
      for (const y of yanlislar) {
        const kap = y.tas;
        this.tasCiz(kap, 0xff8a7a);
        this.tweens.add({ targets: kap, angle: { from: -8, to: 8 }, duration: 70, yoyo: true, repeat: 2,
          onComplete: () => {
            kap.setAngle(0);
            this.tasCiz(kap);
            kap.tas.yer = -1;
            this.tweens.add({ targets: kap, x: kap.tas.evX, y: kap.tas.evY, duration: 300, ease: "Quad.Out" });
          } });
        y.tas = null;
      }
      for (const y of this.yerler) if (y.tas) this.tasCiz(y.tas, 0x8fd16a);
      this.kalpEksilt();
      this.time.delayedCall(900, () => {
        if (this.bitti) return;
        // Doğru yerdeki taşlar kalır; boşluklar yeniden doldurulur (sıradaki boş yere)
        Sesler.soyle(this.kelime, () => { this.kilitli = false; });
        const ilkBos = this.yerler.findIndex((y) => !y.tas);
        this.ipucuGoster(this.taslar.find((t) => t.tas.yer < 0 && t.tas.harf === this.kelime[ilkBos]));
      });
    }
  }

  oyunBitti() {
    for (const t of this.taslar) t.disableInteractive();
  }
}

miniOyunKaydet("scrabble", ScrabbleSahnesi);
