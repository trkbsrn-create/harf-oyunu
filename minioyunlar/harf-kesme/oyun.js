// Mini oyun: Harf Kesme (meyve kes)
// Meyveler aşağıdan havaya fırlar, üstlerinde birer harf var. Çocuk parmağını meyvelerin
// üstünden kaydırarak keser (dokunmak da keser). İstenen harfli meyve kesilince ikiye ayrılır,
// su sıçrar. Başka harfli meyveyi kesmek bir can götürür; kaçan meyve ceza değildir.
// Seri kesim (ek özellik): tek kaydırışta birden çok doğru meyve kesilirse "2'li kesim!" gibi
// bir yazı ve fazladan parıltı çıkar.
// Seviyeler: 1: 8 meyve kes, seyrek; 2: 10, benzer harfler; 3: 12, sık ve hızlı.

const KESME_SEVIYELERI = {
  1: { hedef: 8, aralik: 1500, ikiliOrani: 0.25, dogruOrani: 0.55, benzer: false, hiz: 1 },
  2: { hedef: 10, aralik: 1300, ikiliOrani: 0.4, dogruOrani: 0.5, benzer: true, hiz: 1.05 },
  3: { hedef: 12, aralik: 1100, ikiliOrani: 0.55, dogruOrani: 0.45, benzer: true, hiz: 1.12 },
};

const KESME_RENKLERI = [0xff9c8a, 0xffe680, 0xb5e48c, 0xffc58f, 0xc8a2ff, 0x9be3dc];
const YERCEKIMI = 640;
const MEYVE_R = 46;

class HarfKesmeSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("harf-kesme");
  }

  create() {
    this.ortakKur();
    this.ayar = KESME_SEVIYELERI[this.seviye] || KESME_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.ilerlemeKur(this.ayar.hedef);
    this.hedefPaneliKur("Kes:");
    this.meyveler = [];
    this.iz = [];
    this.uretilen = 0;
    this.seri = 0;
    this.uretici = null;
    const ogrenilmis = ogrenilmisHarfler(this.harf).filter((h) => h !== this.harf);
    const benzerler = (BENZER_HARFLER[this.harf] || []).filter((h) => ogrenilmis.includes(h));
    this.yanlisHavuz = this.ayar.benzer && benzerler.length ? [...benzerler, ...ogrenilmis] : ogrenilmis;
    this.izCizim = this.add.graphics().setDepth(30);

    if (!this.textures.exists("meyve-suyu")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff);
      g.fillCircle(5, 5, 5);
      g.generateTexture("meyve-suyu", 10, 10);
      g.destroy();
    }

    this.input.on("pointerdown", (p) => {
      this.iz = [{ x: p.x, y: p.y, t: this.time.now }];
      this.seri = 0;
      this.kes(p.x, p.y, p.x, p.y);
    });
    this.input.on("pointermove", (p) => {
      if (!p.isDown || this.bitti) return;
      const son = this.iz[this.iz.length - 1] || { x: p.x, y: p.y };
      this.iz.push({ x: p.x, y: p.y, t: this.time.now });
      this.kes(son.x, son.y, p.x, p.y);
    });
    this.input.on("pointerup", () => this.seriBitti());
    this.time.delayedCall(400, () => this.harfiTanit(() => {
      if (this.bitti) return;
      this.uretici = this.time.addEvent({ delay: this.ayar.aralik, loop: true, callback: () => this.firlatDalga() });
      this.firlatDalga();
    }));
  }

  firlatDalga() {
    if (this.bitti) return;
    const sayi = Math.random() < this.ayar.ikiliOrani ? 2 : 1;
    for (let i = 0; i < sayi; i++) this.time.delayedCall(i * 180, () => this.meyveFirlat());
  }

  meyveFirlat() {
    if (this.bitti) return;
    this.uretilen++;
    // Kolay başlangıç: ilk iki meyve doğru harf
    const dogru = this.uretilen <= 2 || Math.random() < this.ayar.dogruOrani;
    const harf = dogru ? this.harf : Phaser.Utils.Array.GetRandom(this.yanlisHavuz);
    const x = Phaser.Math.Between(260, 1020);
    const kap = this.add.container(x, 770).setDepth(10);
    const g = this.add.graphics();
    const renk = Phaser.Utils.Array.GetRandom(KESME_RENKLERI);
    g.fillStyle(renk, 1);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.fillCircle(0, 0, MEYVE_R);
    g.strokeCircle(0, 0, MEYVE_R);
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(-16, -18, 10);
    g.lineStyle(5, 0x6fbf4a, 1);
    g.lineBetween(4, -MEYVE_R + 2, 14, -MEYVE_R - 14);
    const yazi = boyaliOrtala(titret(this.add.text(0, 2, harf, {
      fontFamily: "Andika", fontSize: "52px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 8, padding: { x: 4, y: 4 },
    }), 1.5));
    kap.add([g, yazi]);
    const hiz = this.ayar.hiz;
    kap.meyve = {
      harf, dogru: harf === this.harf, renk,
      vx: (640 - x) * Phaser.Math.FloatBetween(0.2, 0.45) * hiz,
      vy: -Phaser.Math.Between(700, 790) * hiz,
      donus: Phaser.Math.FloatBetween(-90, 90),
    };
    this.meyveler.push(kap);
    if (kap.meyve.dogru) this.time.delayedCall(450, () => { if (kap.active && !kap.meyve.kesildi) this.elGoster(kap); });
  }

  update(zaman, fark) {
    if (this.bitti) return;
    const sn = fark / 1000;
    for (const m of [...this.meyveler]) {
      const v = m.meyve;
      v.vy += YERCEKIMI * sn;
      m.x += v.vx * sn;
      m.y += v.vy * sn;
      m.angle += v.donus * sn;
      if (m.y > 820 && v.vy > 0) {
        this.meyveler = this.meyveler.filter((x) => x !== m);
        m.destroy();
      }
    }
    // Parmak izi: son 150 ms
    this.iz = this.iz.filter((n) => zaman - n.t < 150);
    const g = this.izCizim;
    g.clear();
    if (this.iz.length > 1) {
      g.lineStyle(14, 0xffffff, 0.85);
      g.strokePoints(this.iz, false);
      g.lineStyle(5, 0x7cc4ef, 1);
      g.strokePoints(this.iz, false);
    }
  }

  // Parmağın gittiği doğru parçası meyveye değdi mi?
  kes(x1, y1, x2, y2) {
    if (this.bitti) return;
    for (const m of [...this.meyveler]) {
      if (m.meyve.kesildi) continue;
      const cizgi = new Phaser.Geom.Line(x1, y1, x2, y2);
      const daire = new Phaser.Geom.Circle(m.x, m.y, MEYVE_R + 8);
      const deger = Phaser.Geom.Intersects.LineToCircle(cizgi, daire) || Phaser.Geom.Circle.Contains(daire, x2, y2);
      if (deger) this.meyveKesildi(m, x2 - x1, y2 - y1);
    }
  }

  meyveKesildi(m, dx, dy) {
    m.meyve.kesildi = true;
    this.meyveler = this.meyveler.filter((x) => x !== m);
    if (m.meyve.dogru) {
      this.seri++;
      Sesler.nota(900 + this.seri * 120, 0, 0.08, 0.12, "triangle");
      Sesler.pat();
      // İki yarım: zıt yönlere düşer
      const aci = Math.atan2(dy, dx) || 0;
      for (const yon of [-1, 1]) {
        const yarim = this.add.graphics().setDepth(9).setPosition(m.x, m.y);
        yarim.fillStyle(m.meyve.renk, 1);
        yarim.lineStyle(4, 0x2b2b2b, 1);
        yarim.slice(0, 0, MEYVE_R, aci + (yon > 0 ? 0 : Math.PI), aci + (yon > 0 ? Math.PI : Math.PI * 2), false);
        yarim.fillPath();
        yarim.strokePath();
        this.tweens.add({
          targets: yarim, x: m.x + yon * 90 * Math.cos(aci + Math.PI / 2), y: m.y + 260, angle: yon * 120, alpha: 0,
          duration: 800, ease: "Quad.In", onComplete: () => yarim.destroy(),
        });
      }
      this.add.particles(m.x, m.y, "meyve-suyu", {
        speed: { min: 80, max: 240 }, lifespan: 500, scale: { start: 1.2, end: 0 }, gravityY: 400,
        tint: [m.meyve.renk, 0xffffff], emitting: false,
      }).setDepth(11).explode(16);
      harfiSoyle(this.harf);
      this.ilerlemeArtir(m.x, m.y);
      m.destroy();
    } else {
      // Yanlış harf: meyve kızarır ve düşer, bir can gider
      m.list[0].clear();
      m.list[0].fillStyle(0x9e9e9e, 1);
      m.list[0].lineStyle(4, 0x2b2b2b, 1);
      m.list[0].fillCircle(0, 0, MEYVE_R);
      m.list[0].strokeCircle(0, 0, MEYVE_R);
      this.tweens.add({ targets: m, y: 820, alpha: 0.4, duration: 600, ease: "Quad.In", onComplete: () => m.destroy() });
      this.kalpEksilt();
    }
  }

  // Tek kaydırışta birden çok doğru kesim: "2'li kesim!" (ek özellik, ilerlemeyi değiştirmez)
  seriBitti() {
    if (this.seri >= 2 && !this.bitti) {
      const ek = { 2: "2'li", 3: "3'lü", 4: "4'lü", 5: "5'li" }[this.seri] || `${this.seri}'lı`;
      const yazi = doodleYazi(this, 640, 190, `${ek} kesim!`, 52, "mavi").setOrigin(0.5).setDepth(40).setScale(0);
      this.tweens.add({ targets: yazi, scale: 1, duration: 250, ease: "Back.Out", yoyo: true, hold: 600, onComplete: () => yazi.destroy() });
      this.add.particles(640, 190, "parilti", {
        speed: { min: 120, max: 320 }, lifespan: 700, scale: { start: 1.2, end: 0 },
        tint: [0xffe680, 0xffffff, 0xffc928], emitting: false,
      }).setDepth(41).explode(24);
      Sesler.buyume();
    }
    this.seri = 0;
  }

  oyunBitti() {
    if (this.uretici) this.uretici.remove();
  }
}

miniOyunKaydet("harf-kesme", HarfKesmeSahnesi);
