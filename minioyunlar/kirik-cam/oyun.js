// Mini oyun: Kırık Cam
// Öğretmenin kararı: iki taslak da kullanılır.
//   1. seviye "Camı kır": buzlu camın arkasında bir resim var, camın üstünde harfler. İstenen
//      harflere dokununca cam o noktadan çatlar; doğru harflerin hepsi bulununca cam kırılır,
//      resim ortaya çıkar ve adı okunur. Yanlış harf bir can götürür.
//   2-3. seviye "Camı onar": resimli camın bir parçası kırılıp düşmüş. Aşağıdaki cam
//      parçalarından resmin ilk sesini taşıyanı boşluğa sürükle (ya da dokun); cam onarılır,
//      resmin adı okunur. Yanlış parça bir can götürür. 3. seviyede benzer harfler.

const KIRIK_CAM_SEVIYELERI = {
  1: { tur: "kir", resim: 3, dogru: 3, yanlis: 4 },
  2: { tur: "onar", resim: 4, secenek: 3, benzer: false },
  3: { tur: "onar", resim: 5, secenek: 3, benzer: true },
};

const CAM = { x: 640, y: 330, en: 460, boy: 330 };

class KirikCamSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("kirik-cam");
  }

  preload() {
    super.preload();
    for (const h of HARFLER) if (h.resim) this.load.svg(h.resim, `gorseller/${h.resim}.svg`);
  }

  create() {
    this.ortakKur();
    this.ayar = KIRIK_CAM_SEVIYELERI[this.seviye] || KIRIK_CAM_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.ilerlemeKur(this.ayar.resim);
    const ogrenilmis = ogrenilmisHarfler(this.harf);
    this.resimliler = HARFLER.filter((h) => h.resim && ogrenilmis.includes(h.kucuk));
    this.turNo = 0;
    this.nesneler = [];
    this.kilitli = true;
    if (this.ayar.tur === "kir") this.hedefPaneliKur("Kır:");

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
      if (nesne.parca) this.parcayaDokun(nesne);
    });
    this.input.on("drag", (p, nesne, x, y) => { if (nesne.parca && !this.kilitli) nesne.setPosition(x, y); });
    this.input.on("dragend", (p, nesne) => { if (nesne.parca) this.parcaBirakildi(nesne); });
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniTur()));
  }

  temizle() {
    for (const n of this.nesneler) n.destroy();
    this.nesneler = [];
  }

  resimSec() {
    const kendi = this.resimliler.find((h) => h.kucuk === this.harf);
    const obur = this.resimliler.filter((h) => h !== kendi);
    const r = kendi && (this.turNo % 2 === 0 || !obur.length) ? kendi : Phaser.Utils.Array.GetRandom(obur);
    this.turNo++;
    return r;
  }

  resimKoy(bilgi) {
    const r = this.add.image(CAM.x, CAM.y, bilgi.resim).setDepth(2);
    r.setScale(Math.min((CAM.en - 60) / r.width, (CAM.boy - 40) / r.height));
    this.nesneler.push(r);
    return r;
  }

  yeniTur() {
    if (this.bitti) return;
    this.temizle();
    this.kilitli = true;
    this.bilgi = this.resimSec();
    this.resimKoy(this.bilgi);
    if (this.ayar.tur === "kir") this.kirTuru();
    else this.onarTuru();
  }

  // ---------- 1. seviye: camı kır ----------
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
    const harfler = Phaser.Utils.Array.Shuffle([
      ...Array(this.ayar.dogru).fill(this.harf),
      ...Array.from({ length: this.ayar.yanlis }, () => Phaser.Utils.Array.GetRandom(ogrenilmis)),
    ]);
    const yerler = [];
    for (const h of harfler) {
      let x = 0;
      let y = 0;
      for (let d = 0; d < 80; d++) {
        x = Phaser.Math.Between(CAM.x - CAM.en / 2 + 50, CAM.x + CAM.en / 2 - 50);
        y = Phaser.Math.Between(CAM.y - CAM.boy / 2 + 45, CAM.y + CAM.boy / 2 - 45);
        if (yerler.every((n) => Math.hypot(n.x - x, n.y - y) > 95)) break;
      }
      yerler.push({ x, y });
      const yazi = boyaliOrtala(titret(this.add.text(x, y, h, {
        fontFamily: "Andika", fontSize: "56px", color: "#ffffff",
        stroke: "#3b2a1a", strokeThickness: 9, padding: { x: 4, y: 4 },
      }), 1.6)).setDepth(5);
      yazi.setInteractive({ useHandCursor: true, hitArea: new Phaser.Geom.Circle(yazi.width / 2, yazi.height / 2, 46), hitAreaCallback: Phaser.Geom.Circle.Contains });
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
    this.time.delayedCall(300, () => Sesler.soyle(this.bilgi.kelime));
    this.ilerlemeArtir(CAM.x, CAM.y);
    if (!this.bitti) this.time.delayedCall(2000, () => this.yeniTur());
  }

  // ---------- 2-3. seviye: camı onar ----------
  onarTuru() {
    // Camın sağ üst köşesinden üçgen bir parça eksik
    const sag = CAM.x + CAM.en / 2;
    const ust = CAM.y - CAM.boy / 2;
    this.bosluk = [{ x: sag - 200, y: ust }, { x: sag, y: ust }, { x: sag, y: ust + 170 }];
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(0xd7f0fb, 0.35);
    g.fillRect(CAM.x - CAM.en / 2, CAM.y - CAM.boy / 2, CAM.en, CAM.boy);
    g.fillStyle(0xfbf7ec, 1);
    g.fillTriangle(this.bosluk[0].x, this.bosluk[0].y, this.bosluk[1].x, this.bosluk[1].y, this.bosluk[2].x, this.bosluk[2].y);
    g.lineStyle(4, 0x2b2b2b, 1);
    for (let i = 0; i < 3; i++) {
      const a = this.bosluk[i];
      const b = this.bosluk[(i + 1) % 3];
      for (let t = 0; t < 1; t += 0.08) g.lineBetween(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.x + (b.x - a.x) * (t + 0.04), a.y + (b.y - a.y) * (t + 0.04));
    }
    this.nesneler.push(g);
    this.boslukMerkez = { x: (this.bosluk[0].x + this.bosluk[1].x + this.bosluk[2].x) / 3, y: (this.bosluk[0].y + this.bosluk[1].y + this.bosluk[2].y) / 3 };

    // Seçenek parçaları: doğru harf = resmin ilk sesi
    const dogru = this.bilgi.kucuk;
    const ogrenilmis = ogrenilmisHarfler(this.harf).filter((h) => h !== dogru);
    let yanlislar = this.ayar.benzer ? (BENZER_HARFLER[dogru] || []).filter((h) => ogrenilmis.includes(h)) : [];
    for (const h of Phaser.Utils.Array.Shuffle(ogrenilmis.slice())) if (!yanlislar.includes(h)) yanlislar.push(h);
    const harfler = Phaser.Utils.Array.Shuffle([dogru, ...yanlislar.slice(0, this.ayar.secenek - 1)]);
    harfler.forEach((h, i) => {
      const x = 640 + (i - (harfler.length - 1) / 2) * 220;
      this.nesneler.push(this.parcaYap(x, 615, h, h === dogru));
    });
    this.kilitli = false;
    const d = this.nesneler.find((n) => n.parca && n.parca.dogru);
    this.time.delayedCall(400, () => this.elSurukleGoster([{ x: d.x, y: d.y }, { x: (d.x + this.boslukMerkez.x) / 2, y: 470 }, this.boslukMerkez]));
  }

  parcaYap(x, y, harf, dogru) {
    const kap = this.add.container(x, y).setDepth(10);
    const g = this.add.graphics();
    // Boşlukla aynı biçimde üçgen (ağırlık merkezine göre)
    const m = this.boslukMerkez;
    const noktalar = this.bosluk.map((n) => ({ x: (n.x - m.x) * 0.75, y: (n.y - m.y) * 0.75 }));
    g.fillStyle(0xd7f0fb, 1);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.fillTriangle(noktalar[0].x, noktalar[0].y, noktalar[1].x, noktalar[1].y, noktalar[2].x, noktalar[2].y);
    g.strokeTriangle(noktalar[0].x, noktalar[0].y, noktalar[1].x, noktalar[1].y, noktalar[2].x, noktalar[2].y);
    const yazi = boyaliOrtala(titret(this.add.text(10, -6, harf, {
      fontFamily: "Andika", fontSize: "54px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 9, padding: { x: 4, y: 4 },
    }), 1.6));
    kap.add([g, yazi]);
    kap.cizim = g;
    kap.parca = { harf, dogru, evX: x, evY: y, noktalar };
    kap.setSize(170, 140).setInteractive({ useHandCursor: true, draggable: true });
    kap.on("dragstart", () => { kap.surukle = false; kap.basX = kap.x; kap.basY = kap.y; });
    kap.on("drag", () => { if (Math.hypot(kap.x - kap.basX, kap.y - kap.basY) > 12) kap.surukle = true; });
    return kap;
  }

  // Dokunma da yeter: parça boşluğa uçar
  parcayaDokun() {}

  parcaBirakildi(kap) {
    if (this.bitti || this.kilitli) return;
    const yakin = Math.hypot(kap.x - this.boslukMerkez.x, kap.y - this.boslukMerkez.y) < 150;
    if (!kap.surukle || yakin) this.parcaDene(kap);
    else this.tweens.add({ targets: kap, x: kap.parca.evX, y: kap.parca.evY, duration: 250 });
  }

  parcaDene(kap) {
    if (kap.parca.dogru) {
      this.kilitli = true;
      kap.disableInteractive();
      this.tweens.add({ targets: kap, x: this.boslukMerkez.x, y: this.boslukMerkez.y, scale: 1 / 0.75, duration: 300, ease: "Back.Out",
        onComplete: () => {
          kap.list[1].setVisible(false); // harf gizlenir, cam bütünleşir
          kap.cizim.clear();
          kap.cizim.fillStyle(0xd7f0fb, 0.35);
          const n = kap.parca.noktalar;
          kap.cizim.fillTriangle(n[0].x, n[0].y, n[1].x, n[1].y, n[2].x, n[2].y);
          Sesler.pling();
          Sesler.soyle(this.bilgi.kelime);
          this.ilerlemeArtir(CAM.x, CAM.y);
          if (!this.bitti) this.time.delayedCall(2000, () => this.yeniTur());
        } });
    } else {
      this.tweens.add({ targets: kap, x: kap.parca.evX, y: kap.parca.evY, duration: 300 });
      this.tweens.add({ targets: kap, angle: { from: -8, to: 8 }, duration: 70, yoyo: true, repeat: 2, onComplete: () => kap.setAngle(0) });
      this.kalpEksilt();
      this.ipucuGoster(this.nesneler.find((n) => n.parca && n.parca.dogru));
    }
  }

  oyunBitti() {
    this.kilitli = true;
  }
}

miniOyunKaydet("kirik-cam", KirikCamSahnesi);
