// Mini oyun: Hece Köprüsü (taşları sırala)
// Hece yazılmaz, yalnızca sesli söylenir (öğretmenin isteği; hoparlöre dokununca yeniden
// söylenir). Köprüde iki boş yer var; çocuk derede duran harf taşlarına dokunarak taşları
// sırayla köprüye koyar. Hece doğru kurulunca hece okunur ve karakter karşıya geçer.
// Yanlış hece kurulursa taşlar geri döner, bir can gider. Yerleşmiş bir taşa dokununca geri döner.
// 1-2. seviye yalnızca kapalı hece (an); 3. seviyede açık hece de (na) gelir.

const HECE_KOPRUSU_SEVIYELERI = {
  1: { tur: 4, tas: 3, acikOrani: 0, benzer: false },
  2: { tur: 5, tas: 4, acikOrani: 0, benzer: true },
  3: { tur: 6, tas: 5, acikOrani: 0.5, benzer: true },
};

const KOPRU_YERLERI = [{ x: 565, y: 272 }, { x: 715, y: 272 }];
const KOPRU_SOL = 250;
const KOPRU_SAG = 1030;
const KOPRU_Y = 330;

class HeceKoprusuSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("hece-koprusu");
  }

  preload() {
    super.preload();
    for (const ad of ["cocuk", "cocuk-adim1", "cocuk-adim2"]) this.load.svg(ad, `gorseller/${ad}.svg`);
  }

  create() {
    this.ortakKur();
    this.ayar = HECE_KOPRUSU_SEVIYELERI[this.seviye] || HECE_KOPRUSU_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.ilerlemeKur(this.ayar.tur);
    this.taslar = [];
    this.kilitli = true;
    this.manzaraCiz();

    // Üstte hoparlör: dokununca hece yeniden söylenir
    const hoparlor = this.add.container(640, 60, [this.hoparlorCiz(0, 0, 38)]).setDepth(900)
      .setSize(84, 84).setInteractive({ useHandCursor: true });
    hoparlor.on("pointerdown", () => { if (this.hece) Sesler.soyle(this.hece); });
    this.hoparlor = hoparlor;

    this.cocuk = this.add.image(130, KOPRU_Y + 6, "cocuk").setOrigin(0.5, 1).setDepth(20);

    this.input.on("gameobjectdown", (p, nesne) => {
      if (nesne.tas) this.tasaDokun(nesne);
    });
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniTur()));
  }

  // Dere, iki kıyı, köprü tahtası ve köprüdeki iki boş yer
  manzaraCiz() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x9fd8f5, 1);
    g.fillRect(0, 400, 1280, 320);
    g.lineStyle(4, 0xffffff, 0.9);
    for (const y of [430, 690]) {
      g.beginPath();
      g.moveTo(0, y);
      for (let x = 0; x <= 1280; x += 40) g.lineTo(x, y + (x % 80 === 0 ? 0 : -8));
      g.strokePath();
    }
    // Kıyılar
    g.fillStyle(0xb9e08a, 1);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.fillRect(-10, KOPRU_Y, KOPRU_SOL + 10, 100);
    g.strokeRect(-10, KOPRU_Y, KOPRU_SOL + 10, 100);
    g.fillRect(KOPRU_SAG, KOPRU_Y, 1290 - KOPRU_SAG, 100);
    g.strokeRect(KOPRU_SAG, KOPRU_Y, 1290 - KOPRU_SAG, 100);
    // Köprü tahtası ve ayakları
    g.fillStyle(0xc99a63, 1);
    for (const x of [400, 880]) {
      g.fillRect(x - 10, KOPRU_Y + 18, 20, 90);
      g.strokeRect(x - 10, KOPRU_Y + 18, 20, 90);
    }
    g.fillRect(KOPRU_SOL, KOPRU_Y, KOPRU_SAG - KOPRU_SOL, 22);
    g.strokeRect(KOPRU_SOL, KOPRU_Y, KOPRU_SAG - KOPRU_SOL, 22);
    // Boş yerler (kesikli çerçeve) ve sıra numaraları
    this.yerCizimi = this.add.graphics().setDepth(2);
    KOPRU_YERLERI.forEach((yer, i) => {
      this.add.text(yer.x, KOPRU_Y + 40, String(i + 1), {
        fontFamily: "Andika", fontSize: "24px", color: "#6b6b6b",
      }).setOrigin(0.5).setDepth(2);
    });
    this.yerleriCiz();
  }

  yerleriCiz(renk = 0x2b2b2b) {
    const g = this.yerCizimi;
    g.clear();
    for (const yer of KOPRU_YERLERI) {
      g.lineStyle(4, renk, 1);
      // Kesikli dikdörtgen
      const [x0, y0, en, boy] = [yer.x - 62, yer.y - 54, 124, 108];
      const kenarlar = [[x0, y0, x0 + en, y0], [x0 + en, y0, x0 + en, y0 + boy],
        [x0 + en, y0 + boy, x0, y0 + boy], [x0, y0 + boy, x0, y0]];
      for (const [ax, ay, bx, by] of kenarlar) {
        const uzunluk = Math.hypot(bx - ax, by - ay);
        for (let d = 0; d < uzunluk; d += 18) {
          const t1 = d / uzunluk;
          const t2 = Math.min(d + 10, uzunluk) / uzunluk;
          g.lineBetween(ax + (bx - ax) * t1, ay + (by - ay) * t1, ax + (bx - ax) * t2, ay + (by - ay) * t2);
        }
      }
    }
  }

  // Bu oyunda kurulabilecek heceler: kapalı (ünlü + ünsüz) ve açık (ünsüz + ünlü)
  heceSec() {
    const ogrenilmis = ogrenilmisHarfler(this.harf);
    const bilgi = (h) => HARFLER.find((x) => x.kucuk === h);
    const unlu = bilgi(this.harf).unlu;
    const esler = ogrenilmis.filter((h) => h !== this.harf && bilgi(h).unlu !== unlu);
    const es = Phaser.Utils.Array.GetRandom(esler);
    const [u, s] = unlu ? [this.harf, es] : [es, this.harf];
    const acik = Math.random() < this.ayar.acikOrani;
    return acik ? s + u : u + s;
  }

  yeniTur() {
    if (this.bitti) return;
    for (const t of this.taslar) t.destroy();
    this.taslar = [];
    this.yerler = [null, null];
    // Aynı hece üst üste gelmesin
    let hece = this.heceSec();
    for (let i = 0; i < 5 && hece === this.hece; i++) hece = this.heceSec();
    this.hece = hece;

    // Taşlar: hecenin iki harfi ve yanlışlar (zor seviyede benzer harfler önce)
    const ogrenilmis = ogrenilmisHarfler(this.harf).filter((h) => !hece.includes(h));
    let yanlislar = [];
    if (this.ayar.benzer) {
      for (const h of hece) {
        for (const b of BENZER_HARFLER[h] || []) {
          if (ogrenilmis.includes(b) && !yanlislar.includes(b)) yanlislar.push(b);
        }
      }
      Phaser.Utils.Array.Shuffle(yanlislar);
    }
    for (const h of Phaser.Utils.Array.Shuffle(ogrenilmis.slice())) {
      if (!yanlislar.includes(h)) yanlislar.push(h);
    }
    yanlislar = yanlislar.slice(0, this.ayar.tas - 2);
    const harfler = Phaser.Utils.Array.Shuffle([...hece, ...yanlislar]);
    const aralik = 170;
    harfler.forEach((h, i) => {
      const x = 640 + (i - (harfler.length - 1) / 2) * aralik;
      this.taslar.push(this.tasYap(x, 575, h, i * 80));
    });

    this.time.delayedCall(450, () => {
      if (this.bitti) return;
      this.tweens.add({ targets: this.hoparlor, scale: 1.2, duration: 160, yoyo: true });
      Sesler.soyle(hece, () => {
        this.kilitli = false;
        // Gösteren el hecenin ilk taşını gösterir (bir kez)
        this.elGoster(this.taslar.find((t) => t.tas.harf === hece[0]));
      });
    });
  }

  tasYap(x, y, harf, gecikme) {
    const kap = this.add.container(x, y).setDepth(10);
    const g = this.add.graphics();
    this.tasCiz(g);
    const yazi = boyaliOrtala(titret(this.add.text(0, 0, harf, {
      fontFamily: "Andika", fontSize: "72px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 11, padding: { x: 4, y: 4 },
    }), 2));
    kap.add([g, yazi]);
    kap.cizim = g;
    kap.ev = { x, y };
    kap.tas = { harf, yer: -1 };
    kap.setSize(120, 100).setInteractive({ useHandCursor: true });
    kap.setScale(0);
    this.tweens.add({ targets: kap, scale: 1, duration: 260, delay: gecikme, ease: "Back.Out" });
    return kap;
  }

  tasCiz(g, cerceve) {
    g.clear();
    g.fillStyle(0x000000, 0.15);
    g.fillRoundedRect(-54, -44, 120, 100, 18);
    g.fillStyle(0xd8d0c0, 1);
    g.fillRoundedRect(-60, -50, 120, 100, 18);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeRoundedRect(-60, -50, 120, 100, 18);
    if (cerceve) {
      g.lineStyle(9, cerceve, 1);
      g.strokeRoundedRect(-60, -50, 120, 100, 18);
    }
  }

  tasaDokun(kap) {
    if (this.bitti || this.kilitli) return;
    const tas = kap.tas;
    if (tas.yer >= 0) {
      // Köprüdeki taş dereye geri döner
      this.yerler[tas.yer] = null;
      tas.yer = -1;
      Sesler.nota(440, 0, 0.06, 0.1);
      this.tweens.add({ targets: kap, x: kap.ev.x, y: kap.ev.y, duration: 300, ease: "Quad.Out" });
      return;
    }
    const bos = this.yerler.indexOf(null);
    if (bos < 0) return;
    this.yerler[bos] = kap;
    tas.yer = bos;
    Sesler.nota(620, 0, 0.06, 0.1);
    const yer = KOPRU_YERLERI[bos];
    this.tweens.add({ targets: kap, x: yer.x, y: yer.y, duration: 350, ease: "Back.Out" });
    harfiSoyle(tas.harf);
    if (this.yerler.every(Boolean)) {
      this.kilitli = true;
      this.time.delayedCall(550, () => this.kontrolEt());
    }
  }

  kontrolEt() {
    if (this.bitti) return;
    const kurulan = this.yerler.map((k) => k.tas.harf).join("");
    if (kurulan === this.hece) {
      for (const k of this.yerler) {
        this.tasCiz(k.cizim, 0x8fd16a);
        this.tweens.add({ targets: k, scale: 1.12, duration: 160, yoyo: true });
      }
      Sesler.pling();
      this.ilerlemeArtir(640, KOPRU_YERLERI[0].y);
      Sesler.soyle(this.hece);
      this.karsiyaGec(() => this.yeniTur());
    } else {
      for (const k of this.yerler) {
        this.tasCiz(k.cizim, 0xff8a7a);
        this.tweens.add({ targets: k, angle: { from: -6, to: 6 }, duration: 70, yoyo: true, repeat: 2,
          onComplete: () => {
            k.setAngle(0);
            this.tasCiz(k.cizim);
            k.tas.yer = -1;
            this.tweens.add({ targets: k, x: k.ev.x, y: k.ev.y, duration: 350, ease: "Quad.Out" });
          } });
      }
      this.kalpEksilt();
      this.time.delayedCall(800, () => {
        this.yerler = [null, null];
        if (this.bitti) return;
        Sesler.soyle(this.hece, () => {
          this.kilitli = false;
          // Nazik ipucu: hecenin ilk taşı hafifçe büyüyüp küçülür
          this.ipucuGoster(this.taslar.find((t) => t.tas.harf === this.hece[0]));
        });
      });
    }
  }

  // Karakter köprüden karşıya yürür, sonra baştaki yerine döner
  karsiyaGec(bitince) {
    const c = this.cocuk;
    let adim = 0;
    const adimSaati = this.time.addEvent({ delay: 160, loop: true, callback: () => {
      adim++;
      c.setTexture(adim % 2 ? "cocuk-adim1" : "cocuk-adim2");
      Sesler.adim(adim % 2 === 1);
    } });
    // Taşların üstünden basarak geçer: taşlara yaklaşınca zıplayıp çıkar, sonra iner
    const zemin = KOPRU_Y + 6;
    const tasUstu = KOPRU_YERLERI[0].y - 48;
    const ilkX = KOPRU_YERLERI[0].x - 62;
    const sonX = KOPRU_YERLERI[1].x + 62;
    const yukseklik = (x) => {
      if (x < ilkX - 50 || x > sonX + 50) return zemin;
      if (x >= ilkX + 10 && x <= sonX - 10) return tasUstu;
      const t = x < ilkX + 10 ? (x - (ilkX - 50)) / 60 : ((sonX + 50) - x) / 60;
      // Yay çizerek çıkar/iner
      return zemin + (tasUstu - zemin) * t - Math.sin(Math.PI * t) * 30;
    };
    this.tweens.add({
      targets: c, x: 1150, duration: 1800, delay: 300, ease: "Linear",
      onUpdate: () => c.setY(yukseklik(c.x)),
      onComplete: () => {
        adimSaati.remove();
        c.setTexture("cocuk");
        this.tweens.add({ targets: c, alpha: 0, duration: 250, delay: 200, onComplete: () => {
          c.setX(130);
          this.tweens.add({ targets: c, alpha: 1, duration: 250 });
          bitince();
        } });
      },
    });
  }

  oyunBitti() {
    for (const t of this.taslar) t.disableInteractive();
  }
}

miniOyunKaydet("hece-koprusu", HeceKoprusuSahnesi);
