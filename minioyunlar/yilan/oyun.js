// Mini oyun: Yılan (heceyi ye)
// Bir hece söylenir (hoparlörle tekrar). Yılan kareli tarlada yavaşça ilerler; çocuk yılanın
// başına göre gitmek istediği yöne dokunur (ya da kaydırır), yılan o yöne döner. Hecenin
// harflerini sırayla yemek gerekir (önce "a", sonra "n"). Yenen harf yılanın gövdesinde görünür;
// hece tamamlanınca okunur. Sırası gelmeyen ya da hecede olmayan harf bir can götürür.
// Duvar ve kendine çarpma yok (çocuklar için): yılan kenardan çıkınca öbür kenardan girer.
// Seviyeler: 1: 4 hece, yavaş, kapalı hece, yanlış harf can götürmez (yalnızca uyarı);
// 2: 5 hece; 3: 6 hece, hızlı, açık hece de.

const YILAN_SEVIYELERI = {
  1: { tur: 4, adim: 380, yem: 4, acikOrani: 0, affet: true },
  2: { tur: 5, adim: 310, yem: 5, acikOrani: 0 },
  3: { tur: 6, adim: 250, yem: 6, acikOrani: 0.4 },
};

const YILAN_SUTUN = 18;
const YILAN_SATIR = 8;
const YILAN_KARE = 64;
const YILAN_SOL = 640 - (YILAN_SUTUN * YILAN_KARE) / 2;
const YILAN_UST = 170;

class YilanSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("yilan");
  }

  create() {
    this.ortakKur();
    this.ayar = YILAN_SEVIYELERI[this.seviye] || YILAN_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.ilerlemeKur(this.ayar.tur);
    this.heceler = heceHavuzu(this.harf);
    this.hece = null;
    this.yemler = [];
    this.yenen = 0;
    this.oynuyor = false;
    this.zaman = 0;

    const hoparlor = this.add.container(640, 60, [this.hoparlorCiz(0, 0, 38)]).setDepth(900)
      .setSize(96, 96).setInteractive({ useHandCursor: true });
    hoparlor.on("pointerdown", () => { if (this.hece) Sesler.soyle(this.hece); });
    this.hoparlor = hoparlor;

    // Tarla
    const g = this.add.graphics().setDepth(0);
    for (let c = 0; c < YILAN_SUTUN; c++) {
      for (let r = 0; r < YILAN_SATIR; r++) {
        g.fillStyle((c + r) % 2 ? 0xd9f2c4 : 0xc9eba7, 1);
        g.fillRect(YILAN_SOL + c * YILAN_KARE, YILAN_UST + r * YILAN_KARE, YILAN_KARE, YILAN_KARE);
      }
    }
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeRect(YILAN_SOL, YILAN_UST, YILAN_SUTUN * YILAN_KARE, YILAN_SATIR * YILAN_KARE);
    this.govdeCizim = this.add.graphics().setDepth(5);
    this.govdeYazilari = this.add.container(0, 0).setDepth(6);

    // Yılan: baş önde; her parçada isteğe bağlı harf
    this.yilan = [{ c: 4, r: 4 }, { c: 3, r: 4 }, { c: 2, r: 4 }];
    this.yon = { c: 1, r: 0 };
    this.sonrakiYon = { c: 1, r: 0 };
    this.yilanCiz();

    this.input.on("pointerdown", (p) => this.yonVer(p));
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniHece()));
  }

  konum(c, r) {
    return { x: YILAN_SOL + c * YILAN_KARE + YILAN_KARE / 2, y: YILAN_UST + r * YILAN_KARE + YILAN_KARE / 2 };
  }

  yeniHece() {
    if (this.bitti) return;
    const { hedef } = heceSorusu(this.heceler, this.harf, this.seviye, 2, this.ayar.acikOrani, this.hece);
    this.hece = hedef;
    this.yenen = 0;
    for (const y of this.yemler) y.destroy();
    this.yemler = [];
    for (const parca of this.yilan) parca.harf = null;
    this.yilanCiz();
    // Hecenin iki harfi + şaşırtma harfleri
    for (const h of this.hece) this.yemKoy(h);
    const ogrenilmis = ogrenilmisHarfler(this.harf).filter((h) => !this.hece.includes(h));
    for (let i = 0; i < this.ayar.yem - 2; i++) this.yemKoy(Phaser.Utils.Array.GetRandom(ogrenilmis));
    this.tweens.add({ targets: this.hoparlor, scale: 1.2, duration: 160, yoyo: true });
    Sesler.soyle(this.hece);
    this.oynuyor = true;
    this.elGoster(this.yemler.find((y) => y.yem.harf === this.hece[0]));
  }

  // Boş bir kareye harfli yem (yılanın başına çok yakın olmasın)
  yemKoy(harf) {
    const bas = this.yilan[0];
    let c = 0;
    let r = 0;
    for (let d = 0; d < 200; d++) {
      c = Phaser.Math.Between(0, YILAN_SUTUN - 1);
      r = Phaser.Math.Between(0, YILAN_SATIR - 1);
      const dolu = this.yilan.some((p) => p.c === c && p.r === r) || this.yemler.some((y) => y.yem.c === c && y.yem.r === r);
      if (!dolu && Math.abs(c - bas.c) + Math.abs(r - bas.r) > 3) break;
    }
    const { x, y } = this.konum(c, r);
    const kap = this.add.container(x, y).setDepth(4);
    const g = this.add.graphics();
    g.fillStyle(0xff9c8a, 1);
    g.fillCircle(0, 2, 27);
    g.lineStyle(3, 0x2b2b2b, 1);
    g.strokeCircle(0, 2, 27);
    g.lineStyle(4, 0x6fbf4a, 1);
    g.lineBetween(0, -24, 6, -34);
    const yazi = boyaliOrtala(titret(this.add.text(0, 2, harf, {
      fontFamily: "Andika", fontSize: "36px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 7, padding: { x: 3, y: 3 },
    }), 1.3));
    kap.add([g, yazi]);
    kap.yem = { c, r, harf };
    kap.setScale(0);
    this.tweens.add({ targets: kap, scale: 1, duration: 250, ease: "Back.Out" });
    this.yemler.push(kap);
  }

  yonVer(p) {
    if (this.bitti || !this.oynuyor || p.y < 140) return;
    const bas = this.konum(this.yilan[0].c, this.yilan[0].r);
    const dx = p.x - bas.x;
    const dy = p.y - bas.y;
    let yeni;
    if (Math.abs(dx) > Math.abs(dy)) yeni = { c: Math.sign(dx), r: 0 };
    else yeni = { c: 0, r: Math.sign(dy) };
    // Doğrudan geri dönüş yok; o zaman öbür eksende döner
    if (yeni.c === -this.yon.c && yeni.r === -this.yon.r) {
      yeni = Math.abs(dx) > Math.abs(dy) ? { c: 0, r: Math.sign(dy) || 1 } : { c: Math.sign(dx) || 1, r: 0 };
    }
    if (yeni.c || yeni.r) this.sonrakiYon = yeni;
  }

  update(zaman, fark) {
    if (this.bitti || !this.oynuyor) return;
    this.zaman += fark;
    if (this.zaman < this.ayar.adim) return;
    this.zaman = 0;
    this.yon = this.sonrakiYon;
    const bas = this.yilan[0];
    const yeni = {
      c: (bas.c + this.yon.c + YILAN_SUTUN) % YILAN_SUTUN,
      r: (bas.r + this.yon.r + YILAN_SATIR) % YILAN_SATIR,
      harf: null,
    };
    this.yilan.unshift(yeni);
    const yem = this.yemler.find((y) => y.yem.c === yeni.c && y.yem.r === yeni.r);
    if (yem) this.ye(yem, yeni);
    else this.yilan.pop();
    this.yilanCiz();
  }

  ye(yem, bas) {
    this.yemler = this.yemler.filter((y) => y !== yem);
    yem.destroy();
    const harf = yem.yem.harf;
    if (harf === this.hece[this.yenen]) {
      // Doğru sıradaki harf: yılan uzar, harf gövdede görünür
      bas.harf = harf;
      this.yenen++;
      Sesler.nota(600 + this.yenen * 150, 0, 0.12, 0.12, "triangle");
      harfiSoyle(harf);
      if (this.yenen >= this.hece.length) {
        this.oynuyor = false;
        this.time.delayedCall(300, () => {
          Sesler.pling();
          Sesler.soyle(this.hece);
          const p = this.konum(bas.c, bas.r);
          this.ilerlemeArtir(p.x, p.y);
          if (!this.bitti) this.time.delayedCall(1600, () => this.yeniHece());
        });
      }
    } else {
      // Yanlış harf: yılan uzamaz, bir can gider, yerine yeni şaşırtma yemi
      this.yilan.pop();
      if (this.ayar.affet) Sesler.yanlis();
      else this.kalpEksilt();
      this.cameras.main.flash(150, 255, 160, 140);
      const ogrenilmis = ogrenilmisHarfler(this.harf).filter((h) => !this.hece.includes(h));
      if (this.hece.slice(this.yenen).includes(harf)) this.yemKoy(harf); // hecede lazımsa geri gelir
      else this.yemKoy(Phaser.Utils.Array.GetRandom(ogrenilmis));
      this.ipucuGoster(this.yemler.find((y) => y.yem.harf === this.hece[this.yenen]));
    }
  }

  yilanCiz() {
    const g = this.govdeCizim;
    g.clear();
    this.govdeYazilari.removeAll(true);
    for (let i = this.yilan.length - 1; i >= 0; i--) {
      const parca = this.yilan[i];
      const { x, y } = this.konum(parca.c, parca.r);
      const bas = i === 0;
      g.fillStyle(bas ? 0x6fbf4a : 0x8fd16a, 1);
      g.fillCircle(x, y, bas ? 30 : 26);
      g.lineStyle(3, 0x2b2b2b, 1);
      g.strokeCircle(x, y, bas ? 30 : 26);
      if (bas) {
        const ex = this.yon.c * 10;
        const ey = this.yon.r * 10;
        g.fillStyle(0xffffff, 1);
        g.fillCircle(x + ex - this.yon.r * 10, y + ey - this.yon.c * 10, 8);
        g.fillCircle(x + ex + this.yon.r * 10, y + ey + this.yon.c * 10, 8);
        g.fillStyle(0x2b2b2b, 1);
        g.fillCircle(x + ex * 1.3 - this.yon.r * 10, y + ey * 1.3 - this.yon.c * 10, 4);
        g.fillCircle(x + ex * 1.3 + this.yon.r * 10, y + ey * 1.3 + this.yon.c * 10, 4);
      }
      if (parca.harf) {
        this.govdeYazilari.add(boyaliOrtala(titret(this.add.text(x, y, parca.harf, {
          fontFamily: "Andika", fontSize: "34px", color: "#ffffff",
          stroke: "#3b2a1a", strokeThickness: 6, padding: { x: 3, y: 3 },
        }), 1.2)));
      }
    }
  }

  oyunBitti() {
    this.oynuyor = false;
  }
}

miniOyunKaydet("yilan", YilanSahnesi);
