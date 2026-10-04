// Mini oyun: Hece Köprüsü (köprüyü hecelerle kur)
// Derenin üstünde köprü yok, çocuk karşıya geçemez (öğretmenin isteği). Her turda bir hece
// sesli söylenir (yazılmaz; hoparlöre dokununca yeniden söylenir). Çocuk derede duran harf
// taşlarına dokunarak taşları sırayla üstteki boş yerlere koyar. Hece doğru kurulunca hece okunur,
// taşlar bir köprü tahtasına dönüşüp köprüdeki yerine oturur ve çocuk o tahtaya yürür.
// Bütün tahtalar yerine oturunca köprü tamamlanır, çocuk karşıya geçer.
// Yanlış hece kurulursa taşlar geri döner, bir can gider. Yerleşmiş bir taşa dokununca geri döner.
// Seviyeler (bütün hece oyunlarında olduğu gibi): 1. iki harfli heceler (an, na), 2. üç harfli
// heceler (tat, lal), 3. üç harfli heceler ve benzer harfli yanlış taşlar.

const HECE_KOPRUSU_SEVIYELERI = {
  1: { tur: 4, yanlis: 2, acikOrani: 0.4, benzer: false },
  2: { tur: 5, yanlis: 2, acikOrani: 0, benzer: false },
  3: { tur: 6, yanlis: 3, acikOrani: 0, benzer: true },
};

const KOPRU_SOL = 250;
const KOPRU_SAG = 1030;
const KOPRU_Y = 330;
const HECE_YERI_Y = 190;
const TAS_Y = 585;

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
    this.heceOyunu = true; // ünlü tek başına okunmaz, yalnızca hece duyulur
    this.ayar = HECE_KOPRUSU_SEVIYELERI[this.seviye] || HECE_KOPRUSU_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.ilerlemeKur(this.ayar.tur);
    this.heceler = heceHavuzu(this.harf);
    this.taslar = [];
    this.yerler = [];
    this.hece = null;
    this.tahtaSayisi = 0;
    this.kilitli = true;
    this.tahtaEn = (KOPRU_SAG - KOPRU_SOL) / this.ayar.tur;
    this.manzaraCiz();
    this.yerCizimi = this.add.graphics().setDepth(2);

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

  // Dere ve iki kıyı. Köprü yok: yalnızca iki kıyıda köprü başı direkleri ve tahtaların
  // oturacağı yerler silik kesik çizgiyle görünür.
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
    // Köprü başı direkleri
    g.fillStyle(0xc99a63, 1);
    for (const x of [KOPRU_SOL - 14, KOPRU_SAG + 14]) {
      g.fillRect(x - 8, KOPRU_Y - 40, 16, 50);
      g.strokeRect(x - 8, KOPRU_Y - 40, 16, 50);
    }
    // Tahtaların yeri: silik kesik çizgi
    const s = this.add.graphics().setDepth(1);
    s.lineStyle(3, 0x2b2b2b, 0.35);
    for (let i = 0; i < this.ayar.tur; i++) {
      const x0 = KOPRU_SOL + i * this.tahtaEn + 4;
      for (let x = x0; x < x0 + this.tahtaEn - 8; x += 16) {
        s.lineBetween(x, KOPRU_Y, Math.min(x + 8, x0 + this.tahtaEn - 8), KOPRU_Y);
        s.lineBetween(x, KOPRU_Y + 22, Math.min(x + 8, x0 + this.tahtaEn - 8), KOPRU_Y + 22);
      }
    }
  }

  // Hecenin harf sayısı kadar boş yer (üstte, ortada)
  yerKonumlari() {
    const n = this.hece.length;
    return Array.from({ length: n }, (_, i) => ({ x: 640 + (i - (n - 1) / 2) * 150, y: HECE_YERI_Y }));
  }

  yerleriCiz(renk = 0x2b2b2b) {
    const g = this.yerCizimi;
    g.clear();
    this.yerKonumlari().forEach((yer) => {
      g.fillStyle(0xfffdf6, 0.7);
      g.fillRoundedRect(yer.x - 62, yer.y - 54, 124, 108, 18);
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
    });
  }

  yeniTur() {
    if (this.bitti) return;
    for (const t of this.taslar) t.destroy();
    this.taslar = [];
    // Seviyenin uzunluğunda, oyunun harfini içeren bir hece (aynısı üst üste gelmez)
    const hece = heceSorusu(this.heceler, this.harf, this.seviye, 1, this.ayar.acikOrani, this.hece).hedef;
    this.hece = hece;
    this.yerler = new Array(hece.length).fill(null);
    this.yerleriCiz();

    // Taşlar: hecenin harfleri ve yanlışlar (zor seviyede benzer harfler önce)
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
    yanlislar = yanlislar.slice(0, this.ayar.yanlis);
    const harfler = Phaser.Utils.Array.Shuffle([...hece, ...yanlislar]);
    const aralik = harfler.length > 5 ? 150 : 170;
    harfler.forEach((h, i) => {
      const x = 640 + (i - (harfler.length - 1) / 2) * aralik;
      this.taslar.push(this.tasYap(x, TAS_Y, h, i * 80));
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
      // Yerleşmiş taş dereye geri döner
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
    const yer = this.yerKonumlari()[bos];
    this.tweens.add({ targets: kap, x: yer.x, y: yer.y, duration: 350, ease: "Back.Out" });
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
      Sesler.soyle(this.hece);
      this.time.delayedCall(600, () => this.tahtaKoy());
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
        this.yerler = new Array(this.hece.length).fill(null);
        if (this.bitti) return;
        Sesler.soyle(this.hece, () => {
          this.kilitli = false;
          // Nazik ipucu: hecenin ilk taşı hafifçe büyüyüp küçülür
          this.ipucuGoster(this.taslar.find((t) => t.tas.harf === this.hece[0]));
        });
      });
    }
  }

  // Doğru hecenin taşları bir tahtaya dönüşür, tahta köprüdeki sıradaki yere oturur
  tahtaKoy() {
    if (this.bitti) return;
    const no = this.tahtaSayisi++;
    const x = KOPRU_SOL + (no + 0.5) * this.tahtaEn;
    const en = this.tahtaEn - 6;
    const tahta = this.add.container(640, HECE_YERI_Y).setDepth(15).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0xc99a63, 1);
    g.fillRect(-en / 2, 0, en, 22);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.strokeRect(-en / 2, 0, en, 22);
    g.lineStyle(2, 0x8a6a3c, 1);
    g.lineBetween(-en / 2 + 8, 11, en / 2 - 8, 11);
    // Tahtanın altında küçük ayak
    g.fillStyle(0xc99a63, 1);
    g.fillRect(-7, 22, 14, 70);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.strokeRect(-7, 22, 14, 70);
    const yazi = this.add.text(0, -24, this.hece, {
      fontFamily: "Andika", fontSize: "30px", color: "#3b2a1a", padding: { x: 2, y: 2 },
    }).setOrigin(0.5);
    tahta.add([g, yazi]);
    // Kullanılmayan taşlar derede kaybolur
    for (const t of this.taslar) {
      if (!this.yerler.includes(t)) this.tweens.add({ targets: t, alpha: 0, scale: 0.6, duration: 300 });
    }
    // Taşlar küçülüp tahtaya karışır
    for (const k of this.yerler) {
      this.tweens.add({ targets: k, scale: 0.2, alpha: 0, x: 640, duration: 300, ease: "Quad.In" });
    }
    this.tweens.add({ targets: tahta, alpha: 1, duration: 200, delay: 250 });
    this.tweens.add({ targets: tahta, x, y: KOPRU_Y, duration: 650, delay: 350, ease: "Back.Out",
      onComplete: () => {
        Sesler.nota(330, 0, 0.1, 0.2, "square");
        this.tweens.add({ targets: yazi, alpha: 0.75, duration: 300 });
        // Çocuk yeni tahtanın ucuna yürür; köprü bittiyse karşıya geçer, sonra oyun biter
        if (this.tahtaSayisi >= this.ayar.tur) {
          this.yuru(1150, () => { this.sevin(); this.ilerlemeArtir(1150, KOPRU_Y - 60); });
        } else {
          this.ilerlemeArtir(x, KOPRU_Y);
          this.yuru(x + this.tahtaEn / 2 - 30, () => this.yeniTur());
        }
      } });
    this.yerCizimi.clear();
  }

  // Karakter zeminde (köprü ve kıyı aynı yükseklikte) hedefe yürür
  yuru(hedefX, bitince) {
    const c = this.cocuk;
    let adim = 0;
    const adimSaati = this.time.addEvent({ delay: 160, loop: true, callback: () => {
      adim++;
      c.setTexture(adim % 2 ? "cocuk-adim1" : "cocuk-adim2");
      Sesler.adim(adim % 2 === 1);
    } });
    this.tweens.add({
      targets: c, x: hedefX, duration: Math.max(400, Math.abs(hedefX - c.x) * 4), ease: "Linear",
      onComplete: () => {
        adimSaati.remove();
        c.setTexture("cocuk");
        bitince();
      },
    });
  }

  // Karşıya geçti: sevinçle zıplar
  sevin() {
    this.tweens.add({ targets: this.cocuk, y: KOPRU_Y + 6 - 40, duration: 200, yoyo: true, repeat: 2, ease: "Quad.Out" });
  }

  oyunBitti() {
    for (const t of this.taslar) t.disableInteractive();
  }
}

miniOyunKaydet("hece-koprusu", HeceKoprusuSahnesi);
