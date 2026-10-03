// Mini oyun: Labirent (hece kapıları)
// Bütün labirent ekranda görünür. Karakter soldan başlar, sağdaki hazineye gider. Her kavşakta
// yollar ayrılır ve her yolun başında heceli bir kapı vardır. Hece söylenir (hoparlörle tekrar);
// çocuk o hecenin kapısına dokununca karakter o yoldan bir sonraki kavşağa yürür. Öbür yollar
// çıkmaz sokaktır. Yanlış kapı bir can götürür, doğru kapı hafifçe büyüyüp küçülür (ipucu).
// Seviyeler: 1: 4 kavşak, 2 kapı, çok farklı heceler; 2: 5 kavşak, 3 kapı, benzer heceler;
// 3: 6 kavşak, 3 kapı, ters ve açık heceler de.

const LABIRENT_SEVIYELERI = {
  1: { kavsak: 4, kapi: 2, acikOrani: 0 },
  2: { kavsak: 5, kapi: 3, acikOrani: 0 },
  3: { kavsak: 6, kapi: 3, acikOrani: 0.4 },
};

const LABIRENT_SERITLER = [215, 345, 475, 605]; // yolların yükseklikleri (y)
const LABIRENT_SOL = 90;
const LABIRENT_SAG = 1150; // hazine

class LabirentSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("labirent");
  }

  preload() {
    super.preload();
    for (const ad of ["cocuk", "cocuk-adim1", "cocuk-adim2", "sandik-kapali", "sandik-acik"]) {
      this.load.svg(ad, `gorseller/${ad}.svg`);
    }
  }

  create() {
    this.ortakKur();
    this.heceOyunu = true; // ünlü tek başına okunmaz, yalnızca hece duyulur
    this.ayar = LABIRENT_SEVIYELERI[this.seviye] || LABIRENT_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.ilerlemeKur(this.ayar.kavsak);
    this.kapilar = [];
    this.kilitli = true;
    this.heceler = heceHavuzu(this.harf);
    this.hece = null;

    const hoparlor = this.add.container(640, 60, [this.hoparlorCiz(0, 0, 38)]).setDepth(900)
      .setSize(96, 96).setInteractive({ useHandCursor: true });
    hoparlor.on("pointerdown", () => { if (this.hece) Sesler.soyle(this.hece); });
    this.hoparlor = hoparlor;

    this.labirentKur();
    this.cocuk = this.add.image(LABIRENT_SOL, this.kavsaklar[0].y + 30, "cocuk")
      .setOrigin(0.5, 1).setScale(0.55).setDepth(20);
    this.kavsakNo = 0;

    this.input.on("gameobjectdown", (p, nesne) => {
      if (nesne.kapi) this.kapiyaDokun(nesne);
    });
    this.time.delayedCall(400, () => this.harfiTanit(() => this.kavsagaGel()));
  }

  // Labirentin planı: her kavşağın serit'i, kapıların seritleri ve doğru kapı
  labirentKur() {
    const n = this.ayar.kavsak;
    this.adim = (LABIRENT_SAG - 60 - LABIRENT_SOL) / n;
    this.kavsaklar = [];
    let serit = Phaser.Math.Between(1, 2);
    for (let i = 0; i < n; i++) {
      const x = LABIRENT_SOL + i * this.adim;
      // Kapıların seritleri: farklı seritler, biri doğru
      const seritler = Phaser.Utils.Array.Shuffle([0, 1, 2, 3]).slice(0, this.ayar.kapi).sort();
      const dogru = Phaser.Utils.Array.GetRandom(seritler);
      this.kavsaklar.push({ x, y: LABIRENT_SERITLER[serit], serit, seritler, dogru });
      serit = dogru;
    }
    this.cikisY = LABIRENT_SERITLER[serit];

    // Yollar: önce koyu kenar, üstüne açık toprak
    const g = this.add.graphics().setDepth(1);
    const yollar = [];
    this.kavsaklar.forEach((k) => {
      const donus = k.x + this.adim * 0.22;
      for (const s of k.seritler) {
        const y = LABIRENT_SERITLER[s];
        const son = s === k.dogru ? k.x + this.adim : k.x + this.adim * 0.78;
        yollar.push([[k.x, k.y], [donus, k.y], [donus, y], [son, y]]);
      }
    });
    yollar.push([[LABIRENT_SOL + this.kavsaklar.length * this.adim, this.cikisY], [LABIRENT_SAG, this.cikisY]]);
    yollar.push([[LABIRENT_SOL - 70, this.kavsaklar[0].y], [LABIRENT_SOL, this.kavsaklar[0].y]]);
    for (const [kalinlik, renk] of [[62, 0x8d6e4c], [48, 0xe8cfa4]]) {
      g.lineStyle(kalinlik, renk, 1);
      for (const yol of yollar) {
        g.beginPath();
        g.moveTo(yol[0][0], yol[0][1]);
        for (const [x, y] of yol.slice(1)) g.lineTo(x, y);
        g.strokePath();
      }
      // Köşeler yuvarlak görünsün
      g.fillStyle(renk, 1);
      for (const yol of yollar) for (const [x, y] of yol) g.fillCircle(x, y, kalinlik / 2);
    }
    // Çıkmaz sokakların sonunda tuğla duvar
    this.kavsaklar.forEach((k) => {
      for (const s of k.seritler) {
        if (s === k.dogru) continue;
        const x = k.x + this.adim * 0.78 + 26;
        const y = LABIRENT_SERITLER[s];
        g.fillStyle(0xd9735b, 1);
        g.fillRect(x - 8, y - 30, 16, 60);
        g.lineStyle(3, 0x2b2b2b, 1);
        g.strokeRect(x - 8, y - 30, 16, 60);
        g.lineBetween(x - 8, y - 10, x + 8, y - 10);
        g.lineBetween(x - 8, y + 10, x + 8, y + 10);
      }
    });
    this.sandik = this.add.image(LABIRENT_SAG + 40, this.cikisY + 6, "sandik-kapali").setScale(0.75).setDepth(5);
  }

  // Karakter bir kavşağa geldi: kapılar belirir, hece söylenir
  kavsagaGel() {
    if (this.bitti) return;
    for (const kap of this.kapilar) kap.destroy();
    this.kapilar = [];
    const k = this.kavsaklar[this.kavsakNo];
    const { hedef, secenekler } = heceSorusu(this.heceler, this.harf, this.seviye, k.seritler.length,
      this.ayar.acikOrani, this.hece);
    this.hece = hedef;
    // Doğru hece doğru seridin kapısına, öbürleri karışık
    const yanlislar = secenekler.filter((h) => h !== hedef);
    k.seritler.forEach((s, i) => {
      const hece = s === k.dogru ? hedef : yanlislar.pop();
      const x = k.x + this.adim * 0.54;
      this.kapilar.push(this.kapiYap(x, LABIRENT_SERITLER[s], hece, s === k.dogru, s, i * 90));
    });
    this.time.delayedCall(400, () => {
      if (this.bitti) return;
      this.tweens.add({ targets: this.hoparlor, scale: 1.2, duration: 160, yoyo: true });
      Sesler.soyle(hedef, () => {
        this.kilitli = false;
        this.elGoster(this.kapilar.find((kap) => kap.kapi.dogru));
      });
    });
  }

  kapiYap(x, y, hece, dogru, serit, gecikme) {
    const kap = this.add.container(x, y).setDepth(10);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.15);
    g.fillRoundedRect(-40, -30, 86, 66, 14);
    g.fillStyle(0xfffdf6, 1);
    g.fillRoundedRect(-44, -34, 86, 66, 14);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.strokeRoundedRect(-44, -34, 86, 66, 14);
    const yazi = boyaliOrtala(titret(this.add.text(-1, -1, hece, {
      fontFamily: "Andika", fontSize: "38px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 7, padding: { x: 4, y: 4 },
    }), 1.6));
    kap.add([g, yazi]);
    kap.cizim = g;
    kap.kapi = { hece, dogru, serit };
    kap.setSize(110, 96).setInteractive({ useHandCursor: true });
    kap.setScale(0);
    this.tweens.add({ targets: kap, scale: 1, duration: 260, delay: gecikme, ease: "Back.Out" });
    return kap;
  }

  kapiyaDokun(kap) {
    if (this.bitti || this.kilitli || kap.kapi.denendi) return;
    if (kap.kapi.dogru) {
      this.kilitli = true;
      Sesler.pling();
      const g = kap.cizim;
      g.lineStyle(8, 0x8fd16a, 1);
      g.strokeRoundedRect(-44, -34, 86, 66, 14);
      this.tweens.add({ targets: kap, scale: 1.15, duration: 150, yoyo: true });
      Sesler.soyle(kap.kapi.hece);
      // Öbür kapılar kaybolur, karakter yürür
      for (const k of this.kapilar) if (k !== kap) this.tweens.add({ targets: k, alpha: 0, scale: 0.6, duration: 250 });
      const sonKavsak = this.kavsakNo === this.kavsaklar.length - 1;
      if (!sonKavsak) this.ilerlemeArtir(kap.x, kap.y);
      this.yuru(kap, () => {
        this.kavsakNo++;
        if (sonKavsak) this.hazineyeVar(kap);
        else this.kavsagaGel();
      });
    } else {
      kap.kapi.denendi = true;
      const g = kap.cizim;
      g.lineStyle(8, 0xff8a7a, 1);
      g.strokeRoundedRect(-44, -34, 86, 66, 14);
      kap.setAlpha(0.6);
      this.tweens.add({ targets: kap, angle: { from: -8, to: 8 }, duration: 70, yoyo: true, repeat: 2,
        onComplete: () => kap.setAngle(0) });
      this.kalpEksilt();
      this.time.delayedCall(700, () => { if (!this.bitti) Sesler.soyle(this.hece); });
      this.ipucuGoster(this.kapilar.find((k) => k.kapi.dogru));
    }
  }

  // Karakter kavşaktan seçilen yol boyunca bir sonraki kavşağa (son kavşakta hazineye) yürür
  yuru(kap, bitince) {
    const k = this.kavsaklar[this.kavsakNo];
    const y = LABIRENT_SERITLER[kap.kapi.serit];
    const donus = k.x + this.adim * 0.22;
    const sonX = this.kavsakNo === this.kavsaklar.length - 1 ? LABIRENT_SAG - 30 : k.x + this.adim;
    const noktalar = [{ x: donus, y: k.y }, { x: donus, y }, { x: kap.x, y }, { x: sonX, y }];
    const c = this.cocuk;
    let adim = 0;
    const adimSaati = this.time.addEvent({ delay: 150, loop: true, callback: () => {
      adim++;
      c.setTexture(adim % 2 ? "cocuk-adim1" : "cocuk-adim2");
      Sesler.adim(adim % 2 === 1);
    } });
    const git = (i) => {
      if (i >= noktalar.length) {
        adimSaati.remove();
        c.setTexture("cocuk");
        bitince();
        return;
      }
      const n = noktalar[i];
      const mesafe = Phaser.Math.Distance.Between(c.x, c.y - 30, n.x, n.y);
      if (Math.abs(n.x - c.x) > 1) c.setFlipX(n.x < c.x);
      this.tweens.add({
        targets: c, x: n.x, y: n.y + 30, duration: Math.max(80, mesafe * 4.2), ease: "Linear",
        onComplete: () => {
          // Kapının yerinden geçerken kapı kaybolur
          if (i === 2) this.tweens.add({ targets: kap, alpha: 0, scale: 0.5, duration: 200 });
          git(i + 1);
        },
      });
    };
    git(0);
  }

  // Son kavşaktan sonra hazine açılır, oyun kazanılır
  hazineyeVar(kap) {
    this.sandik.setTexture("sandik-acik");
    this.tweens.add({ targets: this.sandik, scale: 0.9, duration: 200, yoyo: true });
    Sesler.hazine();
    this.ilerlemeArtir(this.sandik.x, this.sandik.y);
  }

  oyunBitti() {
    for (const k of this.kapilar) k.disableInteractive();
  }
}

miniOyunKaydet("labirent", LabirentSahnesi);
