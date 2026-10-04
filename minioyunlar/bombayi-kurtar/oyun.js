// Mini oyun: Bombayı Kurtar (doğru kabloyu kes)
// Sevimli bir bomba yavaşça geri sayar. Bombadan çıkan renkli kabloların her birinde bir harf
// var. Çocuk istenen harfin kablosuna dokunur; makas kabloyu keser, bomba susar ve konfetiye
// döner. Yanlış kablo kıvılcım çıkarır, bir can gider (süre akmaya devam eder). Süre biterse
// bomba patlamaz, yalnızca "puf" diye duman çıkar (korkutucu değil); bir can gider, yeni bomba.
// Seviyeler: 1: 4 bomba, 3 kablo, 20 sn; 2: 5 bomba, 4 kablo, 16 sn; 3: 6 bomba, 4 kablo,
// benzer harfler, 13 sn.
// Öğretmenin isteği (Kazma gibi): 2. seviye harflerle hece (hece söylenir; hecenin harflerinin
// kabloları sırayla kesilir; 4 hece), 3. seviye hecelerle kelime (3 kelime). Her parça için süre
// biraz uzar. Sırası gelmemiş doğru kablo kesilmez, yalnızca sallanır (can gitmez). a/n'de harf.

const BOMBA_SEVIYELERI = {
  1: { tur: 4, kablo: 3, sure: 20, benzer: false },
  2: { tur: 5, kablo: 4, sure: 16, benzer: false },
  3: { tur: 6, kablo: 4, sure: 13, benzer: true },
};

const KABLO_RENKLERI = [0xff6b5a, 0x7cc4ef, 0x8fd16a, 0xffc928, 0xc8a2ff];
const BOMBA = { x: 300, y: 420 };
const KUTU_X = 1080;

class BombayiKurtarSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("bombayi-kurtar");
  }

  create() {
    this.ortakKur();
    this.ayar = BOMBA_SEVIYELERI[this.seviye] || BOMBA_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.siraliKur();
    this.ilerlemeKur(this.tur === "harf" ? this.ayar.tur : this.tur === "hece" ? 4 : 3);
    if (this.tur === "harf") this.hedefPaneliKur("Kes:");
    else this.siraliPanelKur();
    this.kablolar = [];
    this.kalan = 0;
    this.sayiyor = false;
    this.bombaKap = null;
    const ogrenilmis = ogrenilmisHarfler(this.harf).filter((h) => h !== this.harf);
    const benzerler = (BENZER_HARFLER[this.harf] || []).filter((h) => ogrenilmis.includes(h));
    this.yanlisHavuz = this.ayar.benzer && benzerler.length ? [...new Set([...benzerler, ...ogrenilmis])] : ogrenilmis;

    if (!this.textures.exists("kivilcim")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff);
      g.fillRect(0, 0, 8, 3);
      g.generateTexture("kivilcim", 8, 3);
      g.destroy();
    }
    if (!this.textures.exists("duman")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff);
      g.fillCircle(16, 16, 16);
      g.generateTexture("duman", 32, 32);
      g.destroy();
    }

    // Kabloların bağlandığı kutu
    const k = this.add.graphics().setDepth(2);
    k.fillStyle(0x9e9e9e, 1);
    k.fillRoundedRect(KUTU_X - 40, 200, 100, 440, 18);
    k.lineStyle(5, 0x2b2b2b, 1);
    k.strokeRoundedRect(KUTU_X - 40, 200, 100, 440, 18);

    this.input.on("gameobjectdown", (p, nesne) => { if (nesne.kablo) this.kes(nesne); });
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniBomba()));
  }

  yeniBomba() {
    if (this.bitti) return;
    for (const k of this.kablolar) { k.cizim.destroy(); k.destroy(); }
    this.kablolar = [];
    if (this.bombaKap) this.bombaKap.destroy();

    // Sevimli bomba: yuvarlak gövde, gülen yüz, sayaç
    const b = this.add.container(BOMBA.x, BOMBA.y).setDepth(5);
    const g = this.add.graphics();
    g.fillStyle(0x555b66, 1);
    g.fillCircle(0, 0, 110);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeCircle(0, 0, 110);
    g.fillStyle(0xffffff, 0.25);
    g.fillCircle(-42, -46, 26);
    g.fillStyle(0x7a7f88, 1);
    g.fillRect(-26, -128, 52, 26);
    g.strokeRect(-26, -128, 52, 26);
    g.lineStyle(5, 0x8d6e4c, 1);
    g.beginPath();
    g.arc(26, -128, 30, Math.PI, Math.PI * 1.6);
    g.strokePath();
    // Sayaç ekranı
    g.fillStyle(0x222222, 1);
    g.fillRoundedRect(-62, -10, 124, 62, 12);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.strokeRoundedRect(-62, -10, 124, 62, 12);
    // Gözler
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-30, -48, 14);
    g.fillCircle(30, -48, 14);
    g.fillStyle(0x2b2b2b, 1);
    g.fillCircle(-28, -46, 6);
    g.fillCircle(32, -46, 6);
    this.sayac = this.add.text(0, 21, "", { fontFamily: "Andika", fontSize: "40px", color: "#ff6b5a" }).setOrigin(0.5);
    b.add([g, this.sayac]);
    b.setScale(0);
    this.tweens.add({ targets: b, scale: 1, duration: 350, ease: "Back.Out" });
    this.bombaKap = b;

    // Kablolar: biri doğru harf, öbürleri farklı yanlış harfler (sıralı oyunda hecenin harfleri ya
    // da kelimenin heceleri ve iki yanlış parça)
    const dogrular = this.tur === "harf" ? [this.harf] : null;
    const havuz = this.tur === "harf" ? this.yanlisHavuz : this.siraliSoruSec();
    const parcalar = dogrular || this.soru.parcalar;
    const n = this.tur === "harf" ? this.ayar.kablo : Math.min(5, parcalar.length + Math.min(2, havuz.length));
    const yanlislar = Phaser.Utils.Array.Shuffle(havuz.slice());
    while (yanlislar.length && yanlislar.length < n - parcalar.length) yanlislar.push(Phaser.Utils.Array.GetRandom(havuz));
    const harfler = Phaser.Utils.Array.Shuffle([...parcalar, ...yanlislar.slice(0, n - parcalar.length)]);
    const renkler = Phaser.Utils.Array.Shuffle(KABLO_RENKLERI.slice());
    harfler.forEach((h, i) => {
      // Beş kabloda aralık açılır, etiketler sırayla ileri-geri durur (üst üste binmesin)
      const y = (n > 4 ? 230 : 260) + i * ((n > 4 ? 400 : 360) / Math.max(1, n - 1));
      this.kablolar.push(this.kabloYap(y, h, renkler[i % renkler.length], i * 120, n > 4 ? (i % 2 ? 0.45 : 0.72) : 0.62));
    });
    this.kalan = this.ayar.sure + (parcalar.length - 1) * 6;
    this.sayacYaz();
    this.sayiyor = true;
    if (this.tur !== "harf") this.siraliSoyle();
    this.time.delayedCall(700, () => this.elGoster(this.siradakiKablo()));
  }

  kabloYap(y, harf, renk, gecikme, nokta = 0.62) {
    const bas = { x: BOMBA.x + 100, y: BOMBA.y + (y - BOMBA.y) * 0.25 };
    const son = { x: KUTU_X - 40, y };
    const egri = new Phaser.Curves.CubicBezier(
      new Phaser.Math.Vector2(bas.x, bas.y), new Phaser.Math.Vector2(bas.x + 200, bas.y),
      new Phaser.Math.Vector2(son.x - 260, y), new Phaser.Math.Vector2(son.x, y));
    const cizim = this.add.graphics().setDepth(3);
    cizim.lineStyle(18, 0x2b2b2b, 1);
    egri.draw(cizim, 40);
    cizim.lineStyle(12, renk, 1);
    egri.draw(cizim, 40);
    // Harf etiketi kablonun ortasında
    const orta = egri.getPoint(nokta);
    const kap = this.add.container(orta.x, orta.y).setDepth(6);
    const g = this.add.graphics();
    g.fillStyle(0xfffdf6, 1);
    g.fillRoundedRect(-42, -36, 84, 72, 14);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.strokeRoundedRect(-42, -36, 84, 72, 14);
    const yazi = boyaliOrtala(titret(this.add.text(0, 0, harf, {
      fontFamily: "Andika", fontSize: harf.length > 2 ? "32px" : harf.length > 1 ? "40px" : "50px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 8, padding: { x: 4, y: 4 },
    }), 1.5));
    kap.add([g, yazi]);
    kap.cizim = cizim;
    kap.kablo = { harf, dogru: this.tur === "harf" ? harf === this.harf : this.soru.parcalar.includes(harf) };
    kap.setSize(140, 100).setInteractive({ useHandCursor: true });
    kap.setAlpha(0);
    cizim.setAlpha(0);
    this.tweens.add({ targets: [kap, cizim], alpha: 1, duration: 300, delay: gecikme });
    return kap;
  }

  // Sıradaki kesilecek kablo
  siradakiKablo() {
    const aranan = this.tur === "harf" ? this.harf : this.soru.parcalar[this.sira];
    return this.kablolar.find((k) => !k.kablo.kesildi && k.kablo.harf === aranan);
  }

  sayacYaz() {
    const s = Math.max(0, Math.ceil(this.kalan));
    this.sayac.setText(`0:${String(s).padStart(2, "0")}`);
  }

  update(zaman, fark) {
    if (this.bitti || !this.sayiyor) return;
    const onceki = Math.ceil(this.kalan);
    this.kalan -= fark / 1000;
    if (Math.ceil(this.kalan) !== onceki) {
      this.sayacYaz();
      Sesler.nota(this.kalan < 5 ? 880 : 660, 0, 0.04, 0.05, "sine"); // yumuşak tık
    }
    if (this.kalan <= 0) this.sureBitti();
  }

  kes(kap) {
    if (this.bitti || !this.sayiyor || kap.kablo.kesildi) return;
    const durum = this.tur === "harf" ? (kap.kablo.dogru ? "sirada" : "yanlis") : this.siraliDurum(kap.kablo.harf);
    if (durum === "sonra") {
      // Sırası gelmedi: kesilmez, yalnızca sallanır; sıradaki kablo gösterilir
      Sesler.nota(330, 0, 0.1, 0.1, "sine");
      this.tweens.add({ targets: kap, angle: { from: -12, to: 12 }, duration: 70, yoyo: true, repeat: 2, onComplete: () => kap.setAngle(0) });
      this.ipucuGoster(this.siradakiKablo());
      return;
    }
    kap.kablo.kesildi = true;
    // Makas: kablo ortadan kopar
    Sesler.nota(1200, 0, 0.05, 0.12, "square");
    this.tweens.add({ targets: kap.cizim, alpha: 0.25, duration: 200 });
    if (durum === "sirada" && this.tur !== "harf" && !this.siraliParcaAl(kap.x, kap.y)) {
      // Hecenin sıradaki parçası kesildi; bomba hâlâ sayıyor
      this.tweens.add({ targets: kap, y: kap.y + 60, angle: 25, alpha: 0, duration: 400 });
      this.time.delayedCall(500, () => { if (this.sayiyor) this.elGoster(this.siradakiKablo()); });
      return;
    }
    if (durum === "sirada") {
      this.sayiyor = false;
      Sesler.pling();
      if (this.tur === "harf") harfiSoyle(this.harf);
      else this.time.delayedCall(500, () => Sesler.soyle(this.soru.metin));
      this.tweens.add({ targets: kap, y: kap.y + 60, angle: 25, alpha: 0, duration: 400 });
      // Bomba konfetiye döner
      this.tweens.add({ targets: this.bombaKap, scale: 0, angle: 180, duration: 400, delay: 300 });
      this.time.delayedCall(500, () => {
        this.add.particles(BOMBA.x, BOMBA.y, "parilti", {
          speed: { min: 150, max: 400 }, gravityY: 500, lifespan: 1200, scale: { start: 1.3, end: 0.4 },
          tint: [0xff9c8a, 0xffe680, 0x9be3dc, 0xc8a2ff, 0xb5e48c], emitting: false,
        }).setDepth(30).explode(40);
        this.ilerlemeArtir(BOMBA.x, BOMBA.y);
        if (!this.bitti) this.time.delayedCall(1500, () => this.yeniBomba());
      });
    } else {
      this.add.particles(kap.x, kap.y, "kivilcim", {
        speed: { min: 150, max: 320 }, lifespan: 380, rotate: { min: 0, max: 360 },
        tint: [0xffc928, 0xff6b5a], emitting: false,
      }).setDepth(20).explode(18);
      kap.setAlpha(0.5);
      this.tweens.add({ targets: this.bombaKap, angle: { from: -5, to: 5 }, duration: 60, yoyo: true, repeat: 2, onComplete: () => this.bombaKap.setAngle(0) });
      this.kalpEksilt();
      this.ipucuGoster(this.siradakiKablo());
    }
  }

  // Süre bitti: patlama yok, yalnızca "puf" diye duman
  sureBitti() {
    this.sayiyor = false;
    Sesler.nota(140, 0, 0.3, 0.12, "triangle");
    this.add.particles(BOMBA.x, BOMBA.y - 40, "duman", {
      speed: { min: 40, max: 140 }, lifespan: 1200, scale: { start: 1.2, end: 3 }, alpha: { start: 0.8, end: 0 },
      tint: 0xd6d6d6, emitting: false,
    }).setDepth(30).explode(16);
    this.tweens.add({ targets: this.bombaKap, scale: 0.85, duration: 200, yoyo: true });
    const puf = doodleYazi(this, BOMBA.x, BOMBA.y - 180, "puf!", 54).setOrigin(0.5).setDepth(31);
    this.tweens.add({ targets: puf, y: puf.y - 40, alpha: 0, duration: 1200, onComplete: () => puf.destroy() });
    this.kalpEksilt();
    if (!this.bitti) this.time.delayedCall(1600, () => this.yeniBomba());
  }

  oyunBitti() {
    this.sayiyor = false;
  }
}

miniOyunKaydet("bombayi-kurtar", BombayiKurtarSahnesi);
