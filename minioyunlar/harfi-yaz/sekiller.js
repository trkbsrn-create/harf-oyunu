// Harfi Yaz, 1. düzey: Şekillerle Yazma (malzemeyle doldur). Sahne harfi-yaz/oyun.js'de kurulur.
// Ekranda büyük, içi boş bir harf var. Sağdaki şeker makinesinin kolu çekilince (dokunarak ya
// da aşağı sürükleyerek) oluktan 4 malzeme (düğme, çiçek ya da şeker) tepsiye düşer; tepsi
// boşalınca kol parlar, yeniden çekilir (öğretmenin fikri). Çocuk malzemeleri harfin üstüne
// götürür (dokunmak da yeter); her malzeme harfin yazılış sırasındaki bir sonraki yere oturur
// (sıradaki yer hafifçe parlar). Harf dolunca parlar ve (ünlüyse) söylenir. 2 harf.
// Sakin bir oyun: can yok, kaybetmek yok. Yollar Harfi Çiz'in HARF_YOLLARI'ndan büyütülür.

const SEKIL_AYAR = { tur: 2, dokunma: true, yakin: false, silik: false };
// Şeker makinesi (seker-makinesi.svg 260x420; kol ayrı, mil makinenin (226, 300) noktasında)
const MAKINE = { x: 1060, y: 380, kolX: 1156, kolY: 470, oluk: { x: 1060, y: 520 } };
const KOL_ACI = { dur: -70, cekili: 50 };

const SEKIL_OLCEK = 1.7;
const SEKIL_MERKEZ = { x: 640, y: 420 };
const SEKIL_ARALIK = 46;
const SEKIL_TEPSI_Y = 650;
const SEKIL_MALZEMELER = ["dugme", "cicek", "seker"];
const SEKIL_RENKLERI = [0xff9c8a, 0xffe680, 0x9be3dc, 0xc8a2ff, 0xb5e48c, 0xffc58f];

class SekillerleYazmaSahnesi extends MiniOyunSahnesi {
  preload() {
    super.preload();
    for (const ad of ["cicek-kirmizi", "cicek-mor", "cicek-beyaz", "seker-makinesi", "seker-makinesi-kol"]) {
      this.load.svg(ad, `gorseller/${ad}.svg`);
    }
  }

  create() {
    this.ortakKur();
    this.ayar = SEKIL_AYAR;
    this.ilerlemeKur(this.ayar.tur);
    this.hedefPaneli = this.hedefPaneliKur("Doldur:");
    this.dokulerUret();
    this.yerlesenler = [];
    this.tepsi = [];
    this.dusenler = [];
    this.yerler = null;
    this.sira = 0;
    this.turNo = 0;
    this.cekiliyor = false;
    this.kolTutuldu = null;
    this.makineKur();
    this.harfCizim = this.add.graphics().setDepth(1);
    this.isaret = this.add.graphics().setDepth(2);

    // Tepsi zemini
    const t = this.add.graphics().setDepth(3);
    t.fillStyle(0xc99a63, 1);
    t.fillRoundedRect(300, SEKIL_TEPSI_Y - 50, 680, 100, 30);
    t.lineStyle(5, 0x2b2b2b, 1);
    t.strokeRoundedRect(300, SEKIL_TEPSI_Y - 50, 680, 100, 30);

    this.input.on("dragstart", (p, nesne) => { nesne.setDepth(30); nesne.surukleme = false; });
    this.input.on("drag", (p, nesne, x, y) => {
      if (Math.hypot(x - nesne.evX, y - nesne.evY) > 12) nesne.surukleme = true;
      nesne.setPosition(x, y);
    });
    this.input.on("dragend", (p, nesne) => this.birakildi(nesne));
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniTur()));
  }

  // Şeker makinesi ve kolu. Kola dokunmak ya da aşağı sürüklemek çeker.
  makineKur() {
    this.add.image(MAKINE.x, MAKINE.y, "seker-makinesi").setDepth(4);
    this.kolParilti = this.add.graphics().setDepth(4);
    this.kol = this.add.image(MAKINE.kolX, MAKINE.kolY, "seker-makinesi-kol")
      .setOrigin(16 / 150, 0.5).setAngle(KOL_ACI.dur).setDepth(4);
    // Geniş dokunma alanı: kolun ve topuzun çevresi
    const alan = this.add.zone(MAKINE.kolX + 40, MAKINE.kolY - 30, 170, 260).setDepth(4)
      .setInteractive({ useHandCursor: true });
    alan.on("pointerdown", (p) => {
      if (this.cekiliyor || this.bitti) return;
      this.kolTutuldu = { y: p.y };
    });
    this.input.on("pointermove", (p) => {
      if (!this.kolTutuldu || this.cekiliyor) return;
      const aci = Phaser.Math.Clamp(KOL_ACI.dur + (p.y - this.kolTutuldu.y) * 0.9, KOL_ACI.dur, KOL_ACI.cekili);
      this.kol.setAngle(aci);
      if (aci >= KOL_ACI.cekili - 15) { this.kolTutuldu = null; this.kolCek(); }
    });
    this.input.on("pointerup", () => {
      if (!this.kolTutuldu) return;
      this.kolTutuldu = null;
      this.kolCek(); // dokunmak da yeter
    });
  }

  // Tepsi boşken kolun topuzu parlar: "beni çek"
  kolParlat(acik) {
    this.tweens.killTweensOf(this.kolParilti);
    this.kolParilti.clear();
    if (!acik) return;
    const a = Phaser.Math.DegToRad(KOL_ACI.dur);
    this.kolParilti.fillStyle(0xfff1a8, 1);
    this.kolParilti.fillCircle(0, 0, 36);
    this.kolParilti.setPosition(MAKINE.kolX + Math.cos(a) * 108, MAKINE.kolY + Math.sin(a) * 108).setAlpha(0.9).setScale(1);
    this.tweens.add({ targets: this.kolParilti, scale: 1.35, alpha: 0.25, duration: 650, yoyo: true, repeat: -1 });
  }

  tepsiBos() {
    return this.tepsi.every((t) => !t) && !this.dusenler.length;
  }

  // Kol çekilir: kol aşağı iner ve geri gelir, oluktan 4 malzeme sırayla tepsiye düşer.
  // Tepsi boş değilse kol yalnızca biraz sallanır.
  kolCek() {
    if (this.cekiliyor || this.bitti || !this.yerler) return;
    if (!this.tepsiBos()) {
      this.tweens.add({ targets: this.kol, angle: KOL_ACI.dur, duration: 150 });
      this.tweens.add({ targets: this.kol, angle: KOL_ACI.dur + 10, duration: 90, yoyo: true, repeat: 1 });
      return;
    }
    this.cekiliyor = true;
    this.kolParlat(false);
    Sesler.ac();
    this.tweens.add({ targets: this.kol, angle: KOL_ACI.cekili, duration: 160, ease: "Quad.In",
      onComplete: () => {
        [0, 1, 2].forEach((i) => Sesler.nota(260 - i * 30, i * 0.07, 0.06, 0.12, "square")); // tıkırtı
        this.tweens.add({ targets: this.kol, angle: KOL_ACI.dur, duration: 420, delay: 120, ease: "Back.Out" });
        for (let i = 0; i < 4; i++) {
          this.time.delayedCall(250 + i * 280, () => this.tepsiyeKoy(i, true));
        }
        this.time.delayedCall(250 + 4 * 280 + 400, () => {
          this.cekiliyor = false;
          const ilk = this.tepsi[0];
          if (ilk && this.sira === 0 && this.yerler[0]) {
            harfiYazEli(this, "tepsi", () => this.elSurukleGoster([{ x: ilk.x, y: ilk.y },
              { x: (ilk.x + this.yerler[0].x) / 2, y: (ilk.y + this.yerler[0].y) / 2 - 40 }, this.yerler[0]]));
          }
        });
      } });
  }

  // Düğme ve şeker dokuları (bir kez üretilir)
  dokulerUret() {
    if (!this.textures.exists("malzeme-dugme")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff);
      g.fillCircle(24, 24, 22);
      g.lineStyle(3, 0x2b2b2b);
      g.strokeCircle(24, 24, 22);
      g.strokeCircle(24, 24, 14);
      g.fillStyle(0x2b2b2b);
      for (const [x, y] of [[19, 19], [29, 19], [19, 29], [29, 29]]) g.fillCircle(x, y, 2.6);
      g.generateTexture("malzeme-dugme", 48, 48);
      g.destroy();
    }
    if (!this.textures.exists("malzeme-seker")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff);
      g.lineStyle(3, 0x2b2b2b);
      g.fillTriangle(4, 10, 4, 38, 18, 24);
      g.strokeTriangle(4, 10, 4, 38, 18, 24);
      g.fillTriangle(60, 10, 60, 38, 46, 24);
      g.strokeTriangle(60, 10, 60, 38, 46, 24);
      g.fillEllipse(32, 24, 34, 28);
      g.strokeEllipse(32, 24, 34, 28);
      g.generateTexture("malzeme-seker", 64, 48);
      g.destroy();
    }
  }

  // Harf yolları büyütülüp eşit aralıklı yerlere bölünür (yazılış sırasında)
  yerleriHesapla() {
    const yollar = harfiYazYollari(this.harf, this.buyuk).map((yol) => yol.map((n) => ({
      x: SEKIL_MERKEZ.x + (n.x - 640) * SEKIL_OLCEK,
      y: SEKIL_MERKEZ.y + (n.y - 400) * SEKIL_OLCEK,
    })));
    const yerler = [];
    for (const yol of yollar) {
      yerler.push({ ...yol[0] });
      let kalan = SEKIL_ARALIK;
      for (let i = 1; i < yol.length; i++) {
        let a = yol[i - 1];
        const b = yol[i];
        let d = Math.hypot(b.x - a.x, b.y - a.y);
        while (d >= kalan) {
          const t = kalan / d;
          a = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
          yerler.push({ ...a });
          d -= kalan;
          kalan = SEKIL_ARALIK;
        }
        kalan -= d;
      }
      const son = yol[yol.length - 1];
      const enSon = yerler[yerler.length - 1];
      if (Math.hypot(son.x - enSon.x, son.y - enSon.y) > SEKIL_ARALIK * 0.5) yerler.push({ ...son });
    }
    return { yollar, yerler };
  }

  yeniTur() {
    if (this.bitti) return;
    for (const n of [...this.yerlesenler, ...this.tepsi, ...this.dusenler]) if (n) n.destroy();
    this.yerlesenler = [];
    this.tepsi = [];
    this.dusenler = [];
    this.malzeme = SEKIL_MALZEMELER[this.turNo % SEKIL_MALZEMELER.length];
    this.buyuk = this.turNo % 2 === 1; // öğretmenin isteği: 2. harf büyük harf
    harfiYazPaneli(this, this.buyuk);
    this.turNo++;
    const { yollar, yerler } = this.yerleriHesapla();
    this.yerler = yerler;
    this.sira = 0;

    // İçi boş harf: kalın açık iz, koyu kenar
    const g = this.harfCizim;
    g.clear();
    // Silik harf (3. seviye): saydamlık yerine açık renk (üst üste binen yerler koyulaşmasın)
    const renkler = this.ayar.silik ? [0xd8cdb8, 0xfbf7ec] : [0x8d6e4c, 0xfffdf6];
    for (const [kalinlik, renk] of [[70, renkler[0]], [60, renkler[1]]]) {
      g.lineStyle(kalinlik, renk, 1);
      g.fillStyle(renk, 1);
      for (const yol of yollar) {
        g.strokePoints(yol, false);
        for (const n of [yol[0], yol[yol.length - 1]]) g.fillCircle(n.x, n.y, kalinlik / 2);
      }
    }
    // Tepsi boş başlar: önce şeker makinesinin kolu çekilir
    this.isaretCiz();
    this.kolParlat(true);
    this.time.delayedCall(500, () => harfiYazEli(this, "kol", () => this.elGoster({ x: this.kolParilti.x, y: this.kolParilti.y })));
  }

  malzemeYap(x, y) {
    let n;
    if (this.malzeme === "cicek") {
      n = this.add.image(x, y, Phaser.Utils.Array.GetRandom(["cicek-kirmizi", "cicek-mor", "cicek-beyaz"]));
      n.setScale(54 / Math.max(n.width, n.height));
    } else {
      n = this.add.image(x, y, `malzeme-${this.malzeme}`).setTint(Phaser.Utils.Array.GetRandom(SEKIL_RENKLERI));
      n.setScale(this.malzeme === "dugme" ? 1.05 : 0.95);
    }
    n.asilOlcek = n.scale;
    return n;
  }

  // Tepsideki i. yere malzeme koyar; makineden geliyorsa oluktan sekerek düşer
  tepsiyeKoy(i, makineden) {
    if (this.bitti) return;
    const x = 380 + i * 175;
    const n = this.malzemeYap(x, SEKIL_TEPSI_Y).setDepth(10);
    n.evX = x;
    n.evY = SEKIL_TEPSI_Y;
    n.tepsiNo = i;
    const etkinlestir = () => {
      n.setInteractive({ useHandCursor: true, draggable: true, hitArea: new Phaser.Geom.Circle(n.width / 2, n.height / 2, Math.max(n.width, n.height) * 0.75), hitAreaCallback: Phaser.Geom.Circle.Contains });
      this.tepsi[i] = n;
    };
    if (!makineden) {
      n.setScale(0);
      this.tweens.add({ targets: n, scale: n.asilOlcek, duration: 220, ease: "Back.Out" });
      etkinlestir();
      return;
    }
    // Oluktan çıkar, kavis çizerek tepsideki yerine düşer
    this.dusenler.push(n);
    n.setPosition(MAKINE.oluk.x, MAKINE.oluk.y).setScale(n.asilOlcek * 0.6);
    Sesler.nota(700 + i * 90, 0, 0.07, 0.1);
    const yukseklik = 120;
    this.tweens.addCounter({
      from: 0, to: 1, duration: 520, ease: "Sine.In",
      onUpdate: (t) => {
        const v = t.getValue();
        n.setPosition(Phaser.Math.Linear(MAKINE.oluk.x, x, v),
          Phaser.Math.Linear(MAKINE.oluk.y, SEKIL_TEPSI_Y, v) - Math.sin(v * Math.PI) * yukseklik);
        n.setScale(n.asilOlcek * (0.6 + 0.4 * v));
        n.angle = v * 360;
      },
      onComplete: () => {
        if (!n.active) return;
        n.angle = 0;
        this.dusenler = this.dusenler.filter((d) => d !== n);
        this.tweens.add({ targets: n, y: SEKIL_TEPSI_Y - 14, duration: 110, yoyo: true, ease: "Quad.Out" });
        Sesler.nota(420, 0, 0.06, 0.1);
        etkinlestir();
      },
    });
  }

  // Sıradaki yer hafifçe parlayan bir halka
  isaretCiz() {
    this.tweens.killTweensOf(this.isaret);
    this.isaret.clear();
    const y = this.yerler[this.sira];
    if (!y) return;
    this.isaret.lineStyle(5, 0xffc928, 1);
    this.isaret.strokeCircle(0, 0, 28);
    this.isaret.setPosition(y.x, y.y).setAlpha(1).setScale(1);
    this.tweens.add({ targets: this.isaret, scale: 1.25, alpha: 0.4, duration: 600, yoyo: true, repeat: -1 });
  }

  birakildi(n) {
    if (this.bitti) return;
    const hedef = this.yerler[this.sira];
    if (!hedef) return;
    // Dokunma (sürüklemeden bırakma) 1. seviyede yeter
    const dokunma = !n.surukleme && this.ayar.dokunma;
    let uygun = dokunma;
    if (!uygun && n.surukleme) {
      if (this.ayar.yakin) uygun = Math.hypot(n.x - hedef.x, n.y - hedef.y) < 80;
      else uygun = this.yerler.some((y) => Math.hypot(n.x - y.x, n.y - y.y) < 90);
    }
    if (!uygun) {
      // Tepsiye geri döner
      this.tweens.add({ targets: n, x: n.evX, y: n.evY, duration: 250, ease: "Quad.Out", onComplete: () => n.setDepth(10) });
      return;
    }
    n.disableInteractive();
    this.tepsi[n.tepsiNo] = null;
    this.sira++;
    this.yerlesenler.push(n);
    Sesler.nota(500 + this.sira * 30, 0, 0.08, 0.1);
    this.tweens.add({ targets: n, x: hedef.x, y: hedef.y, angle: Phaser.Math.Between(-20, 20), duration: 220, ease: "Back.Out",
      onComplete: () => n.setDepth(5) });
    this.isaretCiz();
    if (this.sira >= this.yerler.length) this.harfBitti();
    else if (this.tepsiBos()) this.kolParlat(true); // malzeme bitti: kolu yeniden çek
  }

  harfBitti() {
    for (const t of this.tepsi) if (t) t.disableInteractive();
    this.kolParlat(false);
    this.isaret.clear();
    Sesler.pling();
    harfiSoyle(this.harf);
    this.tweens.add({ targets: this.yerlesenler, scale: "*=1.3", duration: 180, yoyo: true,
      delay: this.tweens.stagger(40) });
    this.time.delayedCall(700, () => {
      this.ilerlemeArtir(SEKIL_MERKEZ.x, SEKIL_MERKEZ.y);
      if (!this.bitti) this.time.delayedCall(1200, () => this.yeniTur());
    });
  }

  oyunBitti() {
    for (const t of this.tepsi) if (t) t.disableInteractive();
  }
}

