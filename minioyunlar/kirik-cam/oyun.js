// Mini oyun: Kırık Cam (camı kır)
// Buzlu camın arkasında bir resim var, camın üstünde harfler. Oyunun harfine dokununca cam o
// noktadan çatlar; o harflerin hepsi bulununca cam kırılır, arkadaki resim ortaya çıkar ve adı
// okunur. Öğretmenin isteği: her seviyede yalnızca "camı kır"; resim hep oyunun harfiyle başlayan
// bir kelime (KONUMLU_KELIMELER[harf].bas, Resimden Sesi Bul'un listesi). Yanlış harf can götürür.
// Seviyeler: 1: 3 resim, 3 doğru + 4 yanlış harf; 2: 4 resim, 3 + 6, benzer harfler;
// 3: 5 resim, 4 + 7, benzer harfler.

const KIRIK_CAM_SEVIYELERI = {
  1: { resim: 3, dogru: 3, yanlis: 4, benzer: false },
  2: { resim: 4, dogru: 3, yanlis: 6, benzer: true },
  3: { resim: 5, dogru: 4, yanlis: 7, benzer: true },
};

const CAM = { x: 640, y: 330, en: 460, boy: 330 };

class KirikCamSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("kirik-cam");
  }

  preload() {
    super.preload();
    for (const k of this.kelimeler()) {
      const ad = kelimeResmi(k);
      this.load.svg(ad, `gorseller/${ad}.svg`);
    }
  }

  // Oyunun harfiyle başlayan resimli kelimeler
  kelimeler() {
    return (KONUMLU_KELIMELER[this.harf] || KONUMLU_KELIMELER.a).bas;
  }

  create() {
    this.ortakKur();
    this.ayar = KIRIK_CAM_SEVIYELERI[this.seviye] || KIRIK_CAM_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.ilerlemeKur(this.ayar.resim);
    this.resimSirasi = [];
    this.nesneler = [];
    this.kilitli = true;
    this.hedefPaneliKur("Kır:");

    if (!this.textures.exists("cam-parca")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff);
      g.fillTriangle(0, 0, 14, 4, 4, 12);
      g.generateTexture("cam-parca", 14, 12);
      g.destroy();
    }
    // Pencere çerçevesi
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x8d6e4c, 1);
    g.fillRoundedRect(CAM.x - CAM.en / 2 - 22, CAM.y - CAM.boy / 2 - 22, CAM.en + 44, CAM.boy + 44, 14);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeRoundedRect(CAM.x - CAM.en / 2 - 22, CAM.y - CAM.boy / 2 - 22, CAM.en + 44, CAM.boy + 44, 14);
    g.fillStyle(0xfbf7ec, 1);
    g.fillRect(CAM.x - CAM.en / 2, CAM.y - CAM.boy / 2, CAM.en, CAM.boy);

    this.input.on("gameobjectdown", (p, nesne) => {
      if (nesne.camHarf) this.camHarfineDokun(nesne);
    });
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniTur()));
  }

  temizle() {
    for (const n of this.nesneler) n.destroy();
    this.nesneler = [];
  }

  // Sıradaki resim: aynı kelime, liste bitmeden tekrar gelmez
  resimSec() {
    if (!this.resimSirasi.length) this.resimSirasi = Phaser.Utils.Array.Shuffle(this.kelimeler().slice());
    return this.resimSirasi.pop();
  }

  resimKoy(kelime) {
    const r = this.add.image(CAM.x, CAM.y, kelimeResmi(kelime)).setDepth(2);
    r.setScale(Math.min((CAM.en - 60) / r.width, (CAM.boy - 40) / r.height));
    this.nesneler.push(r);
    return r;
  }

  yeniTur() {
    if (this.bitti) return;
    this.temizle();
    this.kilitli = true;
    this.kelime = this.resimSec();
    this.resimKoy(this.kelime);
    this.kirTuru();
  }

  kirTuru() {
    // Buzlu cam
    const buz = this.add.graphics().setDepth(3);
    buz.fillStyle(0xe3f2fb, 0.94);
    buz.fillRect(CAM.x - CAM.en / 2, CAM.y - CAM.boy / 2, CAM.en, CAM.boy);
    buz.lineStyle(3, 0xffffff, 0.8);
    for (let i = 0; i < 8; i++) buz.lineBetween(CAM.x - CAM.en / 2 + 20 + i * 60, CAM.y - CAM.boy / 2 + 10, CAM.x - CAM.en / 2 + 50 + i * 60, CAM.y - CAM.boy / 2 + 40);
    this.nesneler.push(buz);
    this.buz = buz;
    this.catlak = this.add.graphics().setDepth(4);
    this.nesneler.push(this.catlak);
    // Harfler camın üstüne dağılır
    const ogrenilmis = ogrenilmisHarfler(this.harf).filter((h) => h !== this.harf);
    const benzerler = (BENZER_HARFLER[this.harf] || []).filter((h) => ogrenilmis.includes(h));
    const yanlisHavuz = this.ayar.benzer && benzerler.length ? [...benzerler, ...ogrenilmis] : ogrenilmis;
    const harfler = Phaser.Utils.Array.Shuffle([
      ...Array(this.ayar.dogru).fill(this.harf),
      ...Array.from({ length: this.ayar.yanlis }, () => Phaser.Utils.Array.GetRandom(yanlisHavuz)),
    ]);
    // Harfler 5 x 3 ızgaranın rastgele gözlerine, gözün içinde biraz kayarak (üst üste binmesin)
    const gozler = [];
    for (let c = 0; c < 5; c++) for (let r = 0; r < 3; r++) gozler.push({ c, r });
    Phaser.Utils.Array.Shuffle(gozler);
    const gozEn = (CAM.en - 40) / 5;
    const gozBoy = (CAM.boy - 30) / 3;
    for (const h of harfler) {
      const goz = gozler.pop();
      const x = CAM.x - CAM.en / 2 + 20 + (goz.c + 0.5) * gozEn + Phaser.Math.Between(-6, 6);
      const y = CAM.y - CAM.boy / 2 + 15 + (goz.r + 0.5) * gozBoy + Phaser.Math.Between(-10, 10);
      const yazi = boyaliOrtala(titret(this.add.text(x, y, h, {
        fontFamily: "Andika", fontSize: "56px", color: "#ffffff",
        stroke: "#3b2a1a", strokeThickness: 9, padding: { x: 4, y: 4 },
      }), 1.6)).setDepth(5);
      yazi.setInteractive({ useHandCursor: true, hitArea: new Phaser.Geom.Circle(yazi.width / 2, yazi.height / 2, 40), hitAreaCallback: Phaser.Geom.Circle.Contains });
      yazi.camHarf = { harf: h, dogru: h === this.harf };
      this.nesneler.push(yazi);
    }
    this.kalanDogru = this.ayar.dogru;
    this.kilitli = false;
    this.elGoster(this.nesneler.find((n) => n.camHarf && n.camHarf.dogru));
  }

  camHarfineDokun(yazi) {
    if (this.bitti || this.kilitli || yazi.camHarf.dokunuldu) return;
    yazi.camHarf.dokunuldu = true;
    if (yazi.camHarf.dogru) {
      // Çatlak: noktadan dışa kırık çizgiler
      const g = this.catlak;
      g.lineStyle(3, 0x2b2b2b, 0.8);
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 + Math.random() * 0.4;
        const u = 50 + Math.random() * 60;
        const ox = yazi.x + Math.cos(a) * u * 0.5 + Phaser.Math.Between(-8, 8);
        const oy = yazi.y + Math.sin(a) * u * 0.5 + Phaser.Math.Between(-8, 8);
        g.lineBetween(yazi.x, yazi.y, ox, oy);
        g.lineBetween(ox, oy, yazi.x + Math.cos(a) * u, yazi.y + Math.sin(a) * u);
      }
      Sesler.nota(1500, 0, 0.06, 0.1, "square");
      harfiSoyle(this.harf);
      this.tweens.add({ targets: yazi, alpha: 0, scale: 1.4, duration: 250 });
      this.kalanDogru--;
      if (this.kalanDogru <= 0) this.camKirildi();
    } else {
      this.tweens.add({ targets: yazi, angle: { from: -10, to: 10 }, duration: 70, yoyo: true, repeat: 2, onComplete: () => yazi.setAngle(0) });
      yazi.setAlpha(0.5);
      this.kalpEksilt();
      this.ipucuGoster(this.nesneler.find((n) => n.camHarf && n.camHarf.dogru && !n.camHarf.dokunuldu));
    }
  }

  camKirildi() {
    this.kilitli = true;
    Sesler.pat();
    this.add.particles(CAM.x, CAM.y, "cam-parca", {
      x: { min: -CAM.en / 2, max: CAM.en / 2 }, y: { min: -CAM.boy / 2, max: CAM.boy / 2 },
      speed: { min: 60, max: 220 }, gravityY: 600, lifespan: 900, rotate: { min: 0, max: 360 },
      tint: [0xe3f2fb, 0xffffff, 0xb9d3e6], emitting: false,
    }).setDepth(20).explode(60);
    for (const n of this.nesneler) if (n.camHarf) n.setVisible(false);
    this.buz.setVisible(false);
    this.catlak.setVisible(false);
    this.time.delayedCall(300, () => Sesler.soyle(this.kelime));
    this.ilerlemeArtir(CAM.x, CAM.y);
    if (!this.bitti) this.time.delayedCall(2000, () => this.yeniTur());
  }

  oyunBitti() {
    this.kilitli = true;
  }
}

miniOyunKaydet("kirik-cam", KirikCamSahnesi);
