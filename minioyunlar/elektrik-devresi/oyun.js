// Mini oyun: Elektrik Devresi (heceleri kabloyla bağla)
// Oyun bir kelime söyler (hoparlörle tekrar). Solda ilk heceler, sağda ikinci heceler var.
// Çocuk soldaki bir heceden sağdaki bir heceye kablo çeker (parmağını sürükleyerek ya da iki
// heceye sırayla dokunarak). İki hece söylenen kelimeyi oluşturursa akım geçer, ampul yanar ve
// kelime okunur (an + ne = anne). Yanlış bağlantıda kıvılcım çıkar, bir can gider.
// Seviyeler: 1: 4 kelime, 2'şer hece; 2: 5 kelime, 3'er hece; 3: 6 kelime, 3'er hece ve ters
// heceler (an / na) yanlış seçenek olarak.

const ELEKTRIK_SEVIYELERI = {
  1: { tur: 4, secenek: 2, ters: false },
  2: { tur: 5, secenek: 3, ters: false },
  3: { tur: 6, secenek: 3, ters: true },
};

const ELEKTRIK_SOL_X = 250;
const ELEKTRIK_SAG_X = 1030;
const AMPUL = { x: 640, y: 250 };

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
    this.kelimeler = Phaser.Utils.Array.Shuffle(ogrenilmisKelimeler(this.harf).slice());
    this.turNo = 0;
    this.prizler = [];
    this.secili = null;
    this.kelime = null;
    this.kelimeYazisi = null; // önceki turdan kalan (silinmiş) yazı yeniden silinmesin
    this.kilitli = true;

    const hoparlor = this.add.container(640, 60, [this.hoparlorCiz(0, 0, 38)]).setDepth(900)
      .setSize(96, 96).setInteractive({ useHandCursor: true });
    hoparlor.on("pointerdown", () => { if (this.kelime) Sesler.soyle(this.kelime.kelime); });
    this.hoparlor = hoparlor;

    // Ampul ve devre teli (sabit)
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
    this.input.on("pointermove", (p) => { if (p.isDown && this.secili) this.kabloCiz(p); });
    this.input.on("pointerup", (p) => this.birakildi(p));
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniTur()));
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
    this.kablo.clear();
    this.devre.clear();
    this.ampulCiz(false);
    if (this.kelimeYazisi) this.kelimeYazisi.destroy();
    this.kelimeYazisi = null;
    this.secili = null;

    // Sıradaki kelime (liste biterse karıştırılıp baştan)
    if (this.turNo >= this.kelimeler.length) Phaser.Utils.Array.Shuffle(this.kelimeler);
    this.kelime = this.kelimeler[this.turNo % this.kelimeler.length];
    this.turNo++;
    const [ilk, ikinci] = this.kelime.heceler;
    const solHeceler = this.seceneklerYap(ilk, 0);
    const sagHeceler = this.seceneklerYap(ikinci, 1);
    const sira = (n, i) => 360 + (i - (n - 1) / 2) * 130 + 60;
    solHeceler.forEach((h, i) => this.prizler.push(this.prizYap(ELEKTRIK_SOL_X, sira(solHeceler.length, i), h, "sol", h === ilk, i * 80)));
    sagHeceler.forEach((h, i) => this.prizler.push(this.prizYap(ELEKTRIK_SAG_X, sira(sagHeceler.length, i), h, "sag", h === ikinci, i * 80 + 200)));

    // Devre: priz sütunlarından ampule giden ince teller
    const d = this.devre;
    d.lineStyle(4, 0x9e9e9e, 1);
    d.lineBetween(ELEKTRIK_SOL_X - 110, 220, ELEKTRIK_SOL_X - 110, 640);
    d.lineBetween(ELEKTRIK_SOL_X - 110, 220, AMPUL.x - 60, 220);
    d.lineBetween(ELEKTRIK_SAG_X + 110, 220, ELEKTRIK_SAG_X + 110, 640);
    d.lineBetween(ELEKTRIK_SAG_X + 110, 220, AMPUL.x + 60, 220);

    this.time.delayedCall(700, () => {
      if (this.bitti) return;
      this.tweens.add({ targets: this.hoparlor, scale: 1.2, duration: 160, yoyo: true });
      Sesler.soyle(this.kelime.kelime, () => {
        this.kilitli = false;
        const a = this.prizler.find((p) => p.priz.taraf === "sol" && p.priz.dogru);
        const b = this.prizler.find((p) => p.priz.taraf === "sag" && p.priz.dogru);
        this.elSurukleGoster([{ x: a.x + 70, y: a.y }, { x: (a.x + b.x) / 2, y: a.y - 40 }, { x: b.x - 70, y: b.y }]);
      });
    });
  }

  // Doğru hece ve yanlış seçenekler (aynı sıradaki öbür kelimelerin heceleri; 3. seviyede ters hece)
  seceneklerYap(dogru, sira) {
    const havuz = [];
    if (this.ayar.ters && dogru.length === 2) havuz.push(dogru[1] + dogru[0]);
    for (const k of Phaser.Utils.Array.Shuffle(KELIMELER.slice())) {
      const h = k.heceler[sira];
      if (h && h !== dogru && !havuz.includes(h) && [...h].every((x) => ogrenilmisHarfler(this.harf).includes(x))) havuz.push(h);
    }
    return Phaser.Utils.Array.Shuffle([dogru, ...havuz.filter((h) => h !== dogru).slice(0, this.ayar.secenek - 1)]);
  }

  prizYap(x, y, hece, taraf, dogru, gecikme) {
    const kap = this.add.container(x, y).setDepth(5);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.12);
    g.fillRoundedRect(-80, -40, 168, 88, 18);
    g.fillStyle(0xfffdf6, 1);
    g.fillRoundedRect(-84, -44, 168, 88, 18);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.strokeRoundedRect(-84, -44, 168, 88, 18);
    // Kablo ucu (iç tarafta)
    const ucX = taraf === "sol" ? 84 : -84;
    g.fillStyle(0xffe680, 1);
    g.fillCircle(ucX, 0, 13);
    g.strokeCircle(ucX, 0, 13);
    const yazi = boyaliOrtala(titret(this.add.text(-4, -2, hece, {
      fontFamily: "Andika", fontSize: "50px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 8, padding: { x: 4, y: 4 },
    }), 1.6));
    kap.add([g, yazi]);
    kap.cizim = g;
    kap.priz = { hece, taraf, dogru, ucX };
    kap.setSize(200, 110);
    kap.setScale(0);
    this.tweens.add({ targets: kap, scale: 1, duration: 260, delay: gecikme, ease: "Back.Out" });
    return kap;
  }

  prizBul(p) {
    return this.prizler.find((k) => Math.abs(p.x - k.x) < 105 && Math.abs(p.y - k.y) < 58);
  }

  basildi(p) {
    if (this.bitti || this.kilitli) return;
    const k = this.prizBul(p);
    if (!k) return;
    if (k.priz.taraf === "sol") {
      this.secili = k;
      Sesler.nota(620, 0, 0.06, 0.1);
      Sesler.soyle(k.priz.hece);
      this.tweens.add({ targets: k, scale: 1.08, duration: 120 });
      this.prizler.filter((x) => x !== k && x.priz.taraf === "sol").forEach((x) => x.setScale(1));
      this.kabloCiz(p);
    } else if (this.secili) {
      this.baglan(k); // dokunarak bağlama: önce sol, sonra sağ hece
    }
  }

  birakildi(p) {
    if (this.bitti || this.kilitli || !this.secili) return;
    const k = this.prizBul(p);
    if (k && k.priz.taraf === "sag") this.baglan(k);
    else this.kabloCiz(null); // sürükleme bitti, sol hece seçili kalır (sonra sağa dokunulabilir)
  }

  // Seçili soldan kablonun ucu parmağa ya da sağdaki prize
  kabloCiz(p, hedef) {
    const g = this.kablo;
    g.clear();
    if (!this.secili) return;
    const a = { x: this.secili.x + 84, y: this.secili.y };
    const b = hedef ? { x: hedef.x - 84, y: hedef.y } : p ? { x: p.x, y: p.y } : null;
    if (!b) return;
    const egri = new Phaser.Curves.CubicBezier(
      new Phaser.Math.Vector2(a.x, a.y), new Phaser.Math.Vector2(a.x + 160, a.y + 90),
      new Phaser.Math.Vector2(b.x - 160, b.y + 90), new Phaser.Math.Vector2(b.x, b.y));
    g.lineStyle(14, 0x2b2b2b, 1);
    egri.draw(g, 40);
    g.lineStyle(8, hedef && hedef.tamam ? 0xffc928 : 0xe0533d, 1);
    egri.draw(g, 40);
  }

  baglan(sag) {
    const sol = this.secili;
    this.kilitli = true;
    this.kabloCiz(null, sag);
    Sesler.soyle(sag.priz.hece);
    const dogru = sol.priz.dogru && sag.priz.dogru;
    if (dogru) {
      this.time.delayedCall(450, () => {
        sag.tamam = true;
        this.kabloCiz(null, sag);
        this.ampulCiz(true);
        Sesler.pling();
        this.kelimeYazisi = boyaliOrtala(titret(this.add.text(AMPUL.x, AMPUL.y + 125, this.kelime.kelime, {
          fontFamily: "Andika", fontSize: "56px", color: "#ffffff",
          stroke: "#3b2a1a", strokeThickness: 9, padding: { x: 4, y: 4 },
        }), 2)).setDepth(6).setScale(0);
        this.tweens.add({ targets: this.kelimeYazisi, scale: 1, duration: 300, ease: "Back.Out" });
        Sesler.soyle(this.kelime.kelime);
        this.ilerlemeArtir(AMPUL.x, AMPUL.y);
        this.time.delayedCall(2000, () => this.yeniTur());
      });
    } else {
      this.time.delayedCall(400, () => {
        // Kıvılcım: devre tamamlanmadı
        const orta = { x: (sol.x + sag.x) / 2, y: (sol.y + sag.y) / 2 + 60 };
        this.add.particles(orta.x, orta.y, "kivilcim", {
          speed: { min: 150, max: 320 }, lifespan: 380, rotate: { min: 0, max: 360 },
          tint: [0xffc928, 0xff6b5a], emitting: false,
        }).setDepth(20).explode(18);
        this.kalpEksilt();
        this.time.delayedCall(500, () => {
          this.secili = null;
          this.kablo.clear();
          this.prizler.forEach((x) => x.setScale(1));
          if (this.bitti) return;
          Sesler.soyle(this.kelime.kelime, () => { this.kilitli = false; });
          this.ipucuGoster(this.prizler.find((x) => x.priz.taraf === "sol" && x.priz.dogru));
        });
      });
    }
  }

  oyunBitti() {
    this.kilitli = true;
  }
}

miniOyunKaydet("elektrik-devresi", ElektrikDevresiSahnesi);
