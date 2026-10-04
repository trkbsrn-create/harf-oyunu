// Mini oyun: Kayak
// Kayakçı yukarıda durur, pist aşağıdan yukarı akar (kayakçı aşağı kayıyormuş gibi). Üç şerit
// var; çocuk kayakçının sağına ya da soluna dokunarak (ya da parmağını sürükleyerek) şerit
// değiştirir. Öğretmenin kararı: iki taslak da kullanılır.
//   1. seviye (basit, "harf topla"): pistte harfli kar topları ve kayalar gelir. Oyunun harfini
//      taşıyan topları topla; yanlış harf ya da kaya bir can götürür. Kaçırılan top ceza değil.
//   2-3. seviye (üst düzey, "hece kapıları"): her sırada üç bayrak kapısı gelir, hece söylenir;
//      kayakçı o hecenin kapısından geçmeli. Yanlış kapı bir can götürür. 2. seviyede iki harfli,
//      3. seviyede üç harfli heceler (tat), pist daha hızlı.
//   Öğretmenin isteği: doğru top / doğru kapı hiçbir zaman art arda aynı şeritte olmaz
//   (`dogruSeritSec`), kayakçı hep hareket etmek zorunda kalır.

const KAYAK_SEVIYELERI = {
  1: { tur: "topla", hedef: 8, hiz: 150, aralik: 1500 },
  2: { tur: "kapi", hedef: 6, hiz: 135, acikOrani: 0 },
  3: { tur: "kapi", hedef: 8, hiz: 160, acikOrani: 0.4 },
};

const KAYAK_SERITLER = [430, 640, 850];
const KAYAKCI_Y = 210;
const KAYAK_RENKLERI = [0xff9c8a, 0xffe680, 0x9be3dc, 0xc8a2ff, 0xb5e48c];

class KayakSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("kayak");
  }

  preload() {
    super.preload();
    for (const ad of ["cocuk", "kaya", "agac-govde", "agac-tepe"]) this.load.svg(ad, `gorseller/${ad}.svg`);
  }

  create() {
    this.ortakKur();
    // ünlü tek başına okunmaz, yalnızca hece duyulur. Bu harfte hece yoksa (a, n; bilinen harfler
    // yetmez) 2-3. seviye de harf toplama olur.
    this.heceOyunu = this.seviye >= 2 && heceOyunuOlur(this.harf);
    this.ayar = (this.heceOyunu || this.seviye <= 1) ? (KAYAK_SEVIYELERI[this.seviye] || KAYAK_SEVIYELERI[1]) : KAYAK_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.ilerlemeKur(this.ayar.hedef);
    this.nesneler = [];
    this.uretilen = 0;
    this.uretici = null;
    this.hece = null;
    this.sonDogruSerit = null; // doğru cevap art arda aynı şeritte olmasın (öğretmenin isteği)
    this.basladi = false;

    // Kar zemini ve pist kenarları
    const zemin = this.add.graphics().setDepth(-5);
    zemin.fillStyle(0xf4f9fd, 1);
    zemin.fillRect(0, 0, 1280, 720);
    zemin.fillStyle(0xe3eef7, 1);
    zemin.fillRect(0, 0, 300, 720);
    zemin.fillRect(980, 0, 300, 720);
    zemin.lineStyle(4, 0xb9d3e6, 1);
    zemin.lineBetween(300, 0, 300, 720);
    zemin.lineBetween(980, 0, 980, 720);
    // Akan süs: ağaçlar ve kar çizgileri
    this.susler = [];
    for (let i = 0; i < 6; i++) {
      const sol = i % 2 === 0;
      const x = sol ? Phaser.Math.Between(90, 230) : Phaser.Math.Between(1050, 1190);
      const agac = this.add.container(x, 120 + i * 130, [
        this.add.image(0, 0, "agac-govde").setOrigin(0.5, 1).setScale(0.55),
        this.add.image(0, -85 * 0.55, "agac-tepe").setOrigin(0.5, 115 / 140).setScale(0.55),
      ]).setDepth(2);
      this.susler.push(agac);
    }
    this.izler = this.add.graphics().setDepth(1);
    this.izNoktalari = [];

    // Kayakçı: çocuk ve iki kayak
    const kayaklar = this.add.graphics();
    kayaklar.lineStyle(7, 0xe0533d, 1);
    kayaklar.lineBetween(-16, 4, -16, 44);
    kayaklar.lineBetween(14, 4, 14, 44);
    this.kayakci = this.add.container(KAYAK_SERITLER[1], KAYAKCI_Y, [
      kayaklar, this.add.image(0, -10, "cocuk").setScale(0.55),
    ]).setDepth(20);
    this.serit = 1;

    if (this.ayar.tur === "topla") {
      this.hedefPaneliKur("Topla:");
    } else {
      this.heceler = heceHavuzu(this.harf);
      const hoparlor = this.add.container(640, 60, [this.hoparlorCiz(0, 0, 38)]).setDepth(900)
        .setSize(96, 96).setInteractive({ useHandCursor: true });
      hoparlor.on("pointerdown", () => { if (this.hece) Sesler.soyle(this.hece); });
      this.hoparlor = hoparlor;
    }

    // Şerit değiştirme: kayakçının solu/sağı; sürüklerken parmağı izler
    this.input.on("pointerdown", (p) => this.yonVer(p));
    this.input.on("pointermove", (p) => { if (p.isDown && p.y > 120) this.parmakIzle(p); });

    this.time.delayedCall(400, () => this.harfiTanit(() => {
      if (this.bitti) return;
      this.basladi = true;
      // Harf toplamada nesneler düzenli aralıkla gelir; hece kapılarında yeni sıra ancak
      // önceki sıra geçilince gelir (hece karışmasın)
      if (this.ayar.tur === "topla") {
        this.uretici = this.time.addEvent({ delay: this.ayar.aralik, loop: true, callback: () => this.uret() });
      }
      this.uret();
    }));
  }

  yonVer(p) {
    if (this.bitti || p.y < 120) return;
    if (Math.abs(p.x - this.kayakci.x) < 60) return;
    this.seritSec(this.serit + (p.x < this.kayakci.x ? -1 : 1));
  }

  parmakIzle(p) {
    let enYakin = 0;
    KAYAK_SERITLER.forEach((x, i) => { if (Math.abs(p.x - x) < Math.abs(p.x - KAYAK_SERITLER[enYakin])) enYakin = i; });
    if (enYakin !== this.serit) this.seritSec(enYakin);
  }

  seritSec(yeni) {
    yeni = Phaser.Math.Clamp(yeni, 0, KAYAK_SERITLER.length - 1);
    if (yeni === this.serit || this.bitti) return;
    const yon = yeni > this.serit ? 1 : -1;
    this.serit = yeni;
    Sesler.nota(520, 0, 0.05, 0.08, "sine");
    this.tweens.killTweensOf(this.kayakci);
    this.kayakci.setAngle(-yon * 14);
    this.tweens.add({ targets: this.kayakci, x: KAYAK_SERITLER[yeni], duration: 220, ease: "Quad.Out",
      onComplete: () => this.tweens.add({ targets: this.kayakci, angle: 0, duration: 150 }) });
  }

  // Yeni nesne: 1. seviyede harfli kar topu ya da kaya, üst seviyede kapı sırası
  uret() {
    if (this.bitti) return;
    this.uretilen++;
    if (this.ayar.tur === "topla") this.topUret();
    else this.kapiSirasiUret();
  }

  // Doğru cevabın şeridi: bir öncekinden farklı (kayakçı hep hareket etmek zorunda kalsın)
  dogruSeritSec() {
    const serit = Phaser.Utils.Array.GetRandom([0, 1, 2].filter((s) => s !== this.sonDogruSerit));
    this.sonDogruSerit = serit;
    return serit;
  }

  topUret() {
    const zar = Math.random();
    // Kolay başlangıç: ilk iki top doğru harf
    const kayaMi = this.uretilen > 2 && zar > 0.75;
    const dogru = !kayaMi && (this.uretilen <= 2 || zar < 0.5);
    const serit = dogru ? this.dogruSeritSec() : Phaser.Math.Between(0, 2);
    const x = KAYAK_SERITLER[serit];
    if (kayaMi) {
      const kaya = this.add.image(x, 800, "kaya").setScale(0.7).setDepth(10);
      kaya.kayak = { tur: "kaya", serit };
      this.nesneler.push(kaya);
      return;
    }
    const harf = dogru ? this.harf : Phaser.Utils.Array.GetRandom(ogrenilmisHarfler(this.harf).filter((h) => h !== this.harf));
    const kap = this.add.container(x, 800).setDepth(10);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.1);
    g.fillCircle(5, 6, 42);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(0, 0, 42);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.strokeCircle(0, 0, 42);
    const yazi = boyaliOrtala(titret(this.add.text(0, 0, harf, {
      fontFamily: "Andika", fontSize: "50px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 8, padding: { x: 4, y: 4 },
    }), 1.5));
    kap.add([g, yazi]);
    kap.kayak = { tur: "top", serit, harf, dogru: harf === this.harf };
    this.nesneler.push(kap);
    if (kap.kayak.dogru) this.elGoster(kap);
  }

  kapiSirasiUret() {
    // Hece kapıları 2. seviyede başlar: 2. seviye iki harfli, 3. seviye üç harfli heceler
    const { hedef, secenekler } = heceSorusu(this.heceler, this.harf, this.seviye - 1, 3, this.ayar.acikOrani, this.hece);
    this.hece = hedef;
    const renkler = Phaser.Utils.Array.Shuffle(KAYAK_RENKLERI.slice());
    const sira = [];
    // Doğru kapı bir önceki doğru kapının şeridinde olmasın
    const dogruSerit = this.dogruSeritSec();
    const yanlislar = secenekler.filter((h) => h !== hedef);
    const dizilis = [0, 1, 2].map((s) => (s === dogruSerit ? hedef : yanlislar.pop()));
    dizilis.forEach((hece, serit) => {
      const kap = this.add.container(KAYAK_SERITLER[serit], 820).setDepth(10);
      const g = this.add.graphics();
      g.lineStyle(6, 0x2b2b2b, 1);
      g.lineBetween(-80, -30, -80, 46);
      g.lineBetween(80, -30, 80, 46);
      g.fillStyle(renkler[serit], 1);
      g.fillRoundedRect(-84, -64, 168, 50, 10);
      g.lineStyle(4, 0x2b2b2b, 1);
      g.strokeRoundedRect(-84, -64, 168, 50, 10);
      const yazi = boyaliOrtala(titret(this.add.text(0, -39, hece, {
        fontFamily: "Andika", fontSize: "40px", color: "#ffffff",
        stroke: "#3b2a1a", strokeThickness: 7, padding: { x: 4, y: 4 },
      }), 1.5));
      kap.add([g, yazi]);
      kap.kayak = { tur: "kapi", serit, hece, dogru: hece === hedef, sira };
      sira.push(kap);
      this.nesneler.push(kap);
    });
    this.tweens.add({ targets: this.hoparlor, scale: 1.2, duration: 160, yoyo: true });
    Sesler.soyle(hedef);
    const dogruKapi = sira.find((k) => k.kayak.dogru);
    dogruKapi.elKaydir = -40;
    this.elGoster(dogruKapi);
  }

  update(zaman, fark) {
    if (this.bitti || !this.basladi) return;
    const dy = (this.ayar.hiz * fark) / 1000;
    for (const s of this.susler) {
      s.y -= dy;
      if (s.y < -60) s.y += 6 * 130;
    }
    // Kayak izi
    this.izNoktalari = this.izNoktalari.map((n) => ({ x: n.x, y: n.y - dy })).filter((n) => n.y > -20);
    this.izNoktalari.push({ x: this.kayakci.x, y: KAYAKCI_Y + 40 });
    this.izler.clear();
    this.izler.lineStyle(4, 0xc9dbe8, 1);
    for (const ofs of [-16, 14]) {
      this.izler.beginPath();
      this.izNoktalari.forEach((n, i) => (i ? this.izler.lineTo(n.x + ofs, n.y) : this.izler.moveTo(n.x + ofs, n.y)));
      this.izler.strokePath();
    }

    for (const n of [...this.nesneler]) {
      n.y -= dy;
      const k = n.kayak;
      // Kayakçıya ulaştı
      if (!k.gecti && n.y <= KAYAKCI_Y + (k.tur === "kapi" ? 10 : 30)) {
        k.gecti = true;
        this.carpisma(n);
      }
      if (n.y < -120) {
        this.nesneler = this.nesneler.filter((x) => x !== n);
        n.destroy();
      }
    }
  }

  carpisma(n) {
    const k = n.kayak;
    const ayni = k.serit === this.serit;
    if (k.tur === "kapi" && k.dogru) this.time.delayedCall(500, () => this.uret()); // sıradaki kapılar
    if (k.tur === "kapi") {
      if (!ayni) return; // kayakçı yalnızca bir kapıdan geçer
      if (k.dogru) {
        Sesler.pling();
        Sesler.soyle(k.hece);
        this.tweens.add({ targets: n, scale: 1.15, duration: 140, yoyo: true });
        this.ilerlemeArtir(n.x, n.y - 40);
      } else {
        n.list[0].setAlpha(0.5);
        this.kalpEksilt();
        this.ipucuGoster(k.sira.find((x) => x.kayak.dogru));
      }
      return;
    }
    if (!ayni) return;
    if (k.tur === "top" && k.dogru) {
      Sesler.damla();
      this.nesneler = this.nesneler.filter((x) => x !== n);
      this.ilerlemeArtir(n.x, n.y);
      n.destroy();
    } else {
      // Yanlış harf ya da kaya: kayakçı sendeler
      this.tweens.add({ targets: this.kayakci, angle: { from: -18, to: 18 }, duration: 80, yoyo: true, repeat: 2,
        onComplete: () => this.kayakci.setAngle(0) });
      n.setAlpha(0.5);
      this.kalpEksilt();
    }
  }

  oyunBitti() {
    if (this.uretici) this.uretici.remove();
  }
}

miniOyunKaydet("kayak", KayakSahnesi);
