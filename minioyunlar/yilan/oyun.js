// Mini oyun: Yılan (harfi, heceyi ye)
// Yılan kareli tarlada yavaşça ilerler; çocuk yılanın başına göre gitmek istediği yöne dokunur,
// yılan o yöne döner. Yenen harf yılanın gövdesinde görünür.
// Öğretmenin isteği (Kazma gibi): 1. seviye harf (istenen harfi ye; yanlış harf yalnızca uyarı);
// 2. seviye harflerle hece (hece söylenir, harfleri sırayla yenir, üstteki yerlere uçar); 3. seviye
// hecelerle kelime (heceleri sırayla). Sırası gelmemiş doğru parça can götürmez, başka yere kaçar;
// başka parça can götürür. a/n'de her seviyede harf.
// Duvar ve kendine çarpma yok (çocuklar için): yılan kenardan çıkınca öbür kenardan girer.
// Seviyeler: 1: 6 harf, yavaş; 2: 4 hece; 3: 3 kelime, hızlı.

const YILAN_SEVIYELERI = {
  1: { harf: 6, hece: 4, kelime: 3, adim: 380, yem: 4, affet: true },
  2: { harf: 7, hece: 4, kelime: 3, adim: 310, yem: 5 },
  3: { harf: 8, hece: 4, kelime: 3, adim: 250, yem: 6 },
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
    this.siraliKur();
    this.ilerlemeKur(this.ayar[this.tur]);
    if (this.tur === "harf") this.hedefPaneliKur("Ye:");
    else this.siraliPanelKur();
    this.yanlislar = [];
    this.yemler = [];
    this.oynuyor = false;
    this.zaman = 0;

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
    if (this.tur === "harf") this.yanlislar = ogrenilmisHarfler(this.harf).filter((h) => h !== this.harf);
  }

  konum(c, r) {
    return { x: YILAN_SOL + c * YILAN_KARE + YILAN_KARE / 2, y: YILAN_UST + r * YILAN_KARE + YILAN_KARE / 2 };
  }

  // Yeni tur: harf oyununda yeni yemler; sıralı oyunda yeni hece ya da kelime
  yeniHece() {
    if (this.bitti) return;
    for (const y of this.yemler) y.destroy();
    this.yemler = [];
    for (const parca of this.yilan) parca.harf = null;
    this.yilanCiz();
    if (this.tur === "harf") {
      this.yemKoy(this.harf);
      this.yemKoy(this.harf);
    } else {
      this.yanlislar = this.siraliSoruSec();
      for (const p of this.soru.parcalar) this.yemKoy(p);
      this.siraliSoyle();
    }
    // Şaşırtma yemleri
    for (let i = 0; i < this.ayar.yem - 2 && this.yanlislar.length; i++) this.yemKoy(this.yanlislar[i % this.yanlislar.length]);
    this.oynuyor = true;
    this.elGoster(this.siradakiYem());
  }

  siradakiYem() {
    const aranan = this.tur === "harf" ? this.harf : this.soru.parcalar[this.sira];
    return this.yemler.find((y) => y.yem.harf === aranan);
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
    if (harf.length > 1) g.setScale(1.3, 1); // hece yemi biraz geniş
    g.fillStyle(0xff9c8a, 1);
    g.fillCircle(0, 2, 27);
    g.lineStyle(3, 0x2b2b2b, 1);
    g.strokeCircle(0, 2, 27);
    g.lineStyle(4, 0x6fbf4a, 1);
    g.lineBetween(0, -24, 6, -34);
    const yazi = boyaliOrtala(titret(this.add.text(0, 2, harf, {
      fontFamily: "Andika", fontSize: harf.length > 2 ? "24px" : harf.length > 1 ? "30px" : "36px", color: "#ffffff",
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
    const durum = this.tur === "harf" ? (harf === this.harf ? "sirada" : "yanlis") : this.siraliDurum(harf);
    const p = this.konum(bas.c, bas.r);
    if (durum === "sirada") {
      // Doğru (sıradaki) parça: yılan uzar, parça gövdede görünür
      bas.harf = harf;
      if (this.tur === "harf") {
        Sesler.nota(600 + this.ilerleme * 100, 0, 0.12, 0.12, "triangle");
        harfiSoyle(this.harf);
        this.ilerlemeArtir(p.x, p.y);
        this.yemKoy(this.harf);
      } else if (this.siraliParcaAl(p.x, p.y)) {
        this.oynuyor = false;
        this.siraliTamam(() => this.yeniHece());
      }
      return;
    }
    // Yanlış ya da sırası gelmemiş: yılan uzamaz, yem başka yere kaçar ya da yenisi gelir
    this.yilan.pop();
    if (durum === "sonra") {
      Sesler.nota(330, 0, 0.1, 0.1, "sine");
      this.yemKoy(harf);
    } else {
      if (this.ayar.affet) Sesler.yanlis();
      else this.kalpEksilt();
      this.cameras.main.flash(150, 255, 160, 140);
      if (this.yanlislar.length) this.yemKoy(Phaser.Utils.Array.GetRandom(this.yanlislar));
    }
    this.ipucuGoster(this.siradakiYem());
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
          fontFamily: "Andika", fontSize: parca.harf.length > 2 ? "20px" : parca.harf.length > 1 ? "26px" : "34px", color: "#ffffff",
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
