// Mini oyun: Labirent (hece kapıları, karesel labirent)
// Öğretmenin isteği: karesel bir labirent; yolu gözle eleyerek bulmak olmasın. Labirentte çıkmaz
// sokak yok, yollar birbirine bağlanır (dolaşılabilir). Karakter soldan girer, sağdaki hazineye
// (çıkışa) gitmeye çalışır. Durduğu karede açık olan her yönde heceli bir kapı vardır. Hece
// söylenir (hoparlörle tekrar); yalnızca söylenen hecenin kapısı çıkışa giden en kısa yoldadır.
// Çocuk bir kapıya dokununca karakter o yöne bir kare yürür: doğru hece çıkışa yaklaştırır,
// yanlış hece labirentte dolaştırır (can gitmez). Üst üste iki yanlıştan sonra doğru kapı hafifçe
// büyüyüp küçülür (ipucu). İlerleme çubuğu çıkışa ne kadar yaklaşıldığını gösterir. Bitişte yıldız
// sayısı yanlış seçimlere göre (her 2 yanlış bir yıldız eksiltir, en az 1).
// Seviyeler (bütün hece oyunlarında olduğu gibi): 1: 4x3 labirent, iki harfli heceler (an, na);
// 2: 5x3, üç harfli heceler (tat); 3: 6x4, üç harfli benzer ve ters heceler.

const LABIRENT_SEVIYELERI = {
  1: { sutun: 4, satir: 3, acikOrani: 0.4 },
  2: { sutun: 5, satir: 3, acikOrani: 0 },
  3: { sutun: 6, satir: 4, acikOrani: 0 },
};

const LABIRENT_ALAN = { sol: 150, sag: 1110, ust: 150, alt: 680 };
const YONLER = [[1, 0], [-1, 0], [0, 1], [0, -1]];

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
    this.kapilar = [];
    this.kilitli = true;
    this.heceler = heceHavuzu(this.harf);
    this.hece = null;
    this.yanlisSayisi = 0;
    this.ustUsteYanlis = 0;

    const hoparlor = this.add.container(640, 60, [this.hoparlorCiz(0, 0, 38)]).setDepth(900)
      .setSize(96, 96).setInteractive({ useHandCursor: true });
    hoparlor.on("pointerdown", () => { if (this.hece) Sesler.soyle(this.hece); });
    this.hoparlor = hoparlor;

    this.labirentUret();
    this.labirentCiz();
    this.ilerlemeKur(this.mesafe[this.kare.c][this.kare.r]);
    const { x, y } = this.merkez(this.kare.c, this.kare.r);
    this.cocuk = this.add.image(x, y + 26, "cocuk").setOrigin(0.5, 1).setScale(0.42).setDepth(20);

    this.input.on("gameobjectdown", (p, nesne) => {
      if (nesne.kapi) this.kapiyaDokun(nesne);
    });
    this.time.delayedCall(400, () => this.harfiTanit(() => this.kareyeGel()));
  }

  merkez(c, r) {
    return {
      x: LABIRENT_ALAN.sol + (c + 0.5) * this.kareEn,
      y: LABIRENT_ALAN.ust + (r + 0.5) * this.kareBoy,
    };
  }

  acik(c, r, dc, dr) {
    return this.duvarsiz.has(`${c},${r},${c + dc},${r + dr}`);
  }

  ac(c, r, dc, dr) {
    this.duvarsiz.add(`${c},${r},${c + dc},${r + dr}`);
    this.duvarsiz.add(`${c + dc},${r + dr},${c},${r}`);
  }

  komsular(c, r) {
    return YONLER.filter(([dc, dr]) => this.acik(c, r, dc, dr)).map(([dc, dr]) => ({ c: c + dc, r: r + dr, dc, dr }));
  }

  // Karesel labirent: önce dallanan bir labirent kazılır, sonra çıkmaz sokaklar başka bir
  // komşuya açılır (dolaşılabilir, gözle elenemez). Giriş solda, çıkış sağda.
  labirentUret() {
    const { sutun, satir } = this.ayar;
    this.kareEn = (LABIRENT_ALAN.sag - LABIRENT_ALAN.sol) / sutun;
    this.kareBoy = (LABIRENT_ALAN.alt - LABIRENT_ALAN.ust) / satir;
    this.duvarsiz = new Set();
    const icinde = (c, r) => c >= 0 && c < sutun && r >= 0 && r < satir;
    const gezildi = new Set(["0,0"]);
    const yigin = [[0, 0]];
    while (yigin.length) {
      const [c, r] = yigin[yigin.length - 1];
      const secenek = Phaser.Utils.Array.Shuffle(YONLER.slice())
        .filter(([dc, dr]) => icinde(c + dc, r + dr) && !gezildi.has(`${c + dc},${r + dr}`));
      if (!secenek.length) { yigin.pop(); continue; }
      const [dc, dr] = secenek[0];
      this.ac(c, r, dc, dr);
      gezildi.add(`${c + dc},${r + dr}`);
      yigin.push([c + dc, r + dr]);
    }
    // Çıkmaz sokakları kaldır: tek kapısı olan kare kapalı bir komşusuna açılır
    for (let c = 0; c < sutun; c++) {
      for (let r = 0; r < satir; r++) {
        if (this.komsular(c, r).length >= 2) continue;
        const kapali = Phaser.Utils.Array.Shuffle(YONLER.slice())
          .filter(([dc, dr]) => icinde(c + dc, r + dr) && !this.acik(c, r, dc, dr));
        if (kapali.length) this.ac(c, r, kapali[0][0], kapali[0][1]);
      }
    }
    // Giriş ve çıkış
    this.kare = { c: 0, r: Phaser.Math.Between(0, satir - 1) };
    this.cikis = { c: sutun - 1, r: Phaser.Math.Between(0, satir - 1) };
    // Çıkışa uzaklık (her kareden en kısa yol, kare sayısı)
    this.mesafe = Array.from({ length: sutun }, () => new Array(satir).fill(Infinity));
    this.mesafe[this.cikis.c][this.cikis.r] = 0;
    const kuyruk = [this.cikis];
    while (kuyruk.length) {
      const { c, r } = kuyruk.shift();
      for (const k of this.komsular(c, r)) {
        if (this.mesafe[k.c][k.r] === Infinity) {
          this.mesafe[k.c][k.r] = this.mesafe[c][r] + 1;
          kuyruk.push(k);
        }
      }
    }
  }

  // Çalılık zemin, toprak yollar, giriş ve hazine
  labirentCiz() {
    const { sutun, satir } = this.ayar;
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0xb9e08a, 1);
    g.fillRoundedRect(LABIRENT_ALAN.sol - 16, LABIRENT_ALAN.ust - 16,
      LABIRENT_ALAN.sag - LABIRENT_ALAN.sol + 32, LABIRENT_ALAN.alt - LABIRENT_ALAN.ust + 32, 24);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeRoundedRect(LABIRENT_ALAN.sol - 16, LABIRENT_ALAN.ust - 16,
      LABIRENT_ALAN.sag - LABIRENT_ALAN.sol + 32, LABIRENT_ALAN.alt - LABIRENT_ALAN.ust + 32, 24);
    const yollar = [];
    for (let c = 0; c < sutun; c++) {
      for (let r = 0; r < satir; r++) {
        for (const k of this.komsular(c, r)) {
          if (k.dc < 0 || k.dr < 0) continue; // her yol bir kez
          yollar.push([this.merkez(c, r), this.merkez(k.c, k.r)]);
        }
      }
    }
    const giris = this.merkez(this.kare.c, this.kare.r);
    const cikis = this.merkez(this.cikis.c, this.cikis.r);
    yollar.push([{ x: 40, y: giris.y }, giris]);
    yollar.push([cikis, { x: 1205, y: cikis.y }]);
    const kalin = Math.min(this.kareEn, this.kareBoy) * 0.42;
    for (const [kalinlik, renk] of [[kalin + 12, 0x8d6e4c], [kalin, 0xe8cfa4]]) {
      g.lineStyle(kalinlik, renk, 1);
      g.fillStyle(renk, 1);
      for (const [a, b] of yollar) {
        g.lineBetween(a.x, a.y, b.x, b.y);
        g.fillCircle(a.x, a.y, kalinlik / 2);
        g.fillCircle(b.x, b.y, kalinlik / 2);
      }
    }
    this.sandik = this.add.image(1205, cikis.y + 6, "sandik-kapali").setScale(0.62).setDepth(5);
  }

  // Karakter bir kareye geldi: açık her yöne heceli kapı, hece söylenir
  kareyeGel() {
    if (this.bitti) return;
    for (const kap of this.kapilar) kap.destroy();
    this.kapilar = [];
    const { c, r } = this.kare;
    const komsular = this.komsular(c, r);
    // Çıkışa en kısa yoldaki komşu (birden çoksa biri) doğru kapı
    const enYakin = Math.min(...komsular.map((k) => this.mesafe[k.c][k.r]));
    const dogru = Phaser.Utils.Array.GetRandom(komsular.filter((k) => this.mesafe[k.c][k.r] === enYakin));
    const { hedef, secenekler } = heceSorusu(this.heceler, this.harf, this.seviye, komsular.length,
      this.ayar.acikOrani, this.hece);
    this.hece = hedef;
    const yanlislar = secenekler.filter((h) => h !== hedef);
    const m = this.merkez(c, r);
    komsular.forEach((k, i) => {
      const hece = k === dogru ? hedef : yanlislar.pop();
      const x = m.x + k.dc * this.kareEn * 0.5;
      const y = m.y + k.dr * this.kareBoy * 0.5;
      this.kapilar.push(this.kapiYap(x, y, hece, k === dogru, k, i * 90));
    });
    this.time.delayedCall(400, () => {
      if (this.bitti) return;
      this.tweens.add({ targets: this.hoparlor, scale: 1.2, duration: 160, yoyo: true });
      Sesler.soyle(hedef, () => {
        this.kilitli = false;
        const dogruKapi = this.kapilar.find((kap) => kap.kapi.dogru);
        this.elGoster(dogruKapi);
        if (this.ustUsteYanlis >= 2) this.ipucuGoster(dogruKapi);
      });
    });
  }

  kapiYap(x, y, hece, dogru, komsu, gecikme) {
    const kap = this.add.container(x, y).setDepth(10);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.15);
    g.fillRoundedRect(-40, -30, 86, 62, 14);
    g.fillStyle(0xfffdf6, 1);
    g.fillRoundedRect(-44, -34, 86, 62, 14);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.strokeRoundedRect(-44, -34, 86, 62, 14);
    const yazi = boyaliOrtala(titret(this.add.text(-1, -3, hece, {
      fontFamily: "Andika", fontSize: "36px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 7, padding: { x: 4, y: 4 },
    }), 1.6));
    kap.add([g, yazi]);
    kap.cizim = g;
    kap.kapi = { hece, dogru, komsu };
    kap.setSize(110, 90).setInteractive({ useHandCursor: true });
    kap.setScale(0);
    this.tweens.add({ targets: kap, scale: 1, duration: 260, delay: gecikme, ease: "Back.Out" });
    return kap;
  }

  kapiyaDokun(kap) {
    if (this.bitti || this.kilitli) return;
    this.kilitli = true;
    const g = kap.cizim;
    if (kap.kapi.dogru) {
      Sesler.pling();
      g.lineStyle(8, 0x8fd16a, 1);
      this.ustUsteYanlis = 0;
    } else {
      // Yanlış hece: karakter yine o yola gider, labirentte dolaşır (can gitmez)
      Sesler.yanlis();
      g.lineStyle(8, 0xff8a7a, 1);
      this.yanlisSayisi++;
      this.ustUsteYanlis++;
    }
    g.strokeRoundedRect(-44, -34, 86, 62, 14);
    this.tweens.add({ targets: kap, scale: 1.15, duration: 150, yoyo: true });
    Sesler.soyle(kap.kapi.hece);
    for (const k of this.kapilar) if (k !== kap) this.tweens.add({ targets: k, alpha: 0, scale: 0.6, duration: 250 });
    this.yuru(kap, () => {
      this.kare = { c: kap.kapi.komsu.c, r: kap.kapi.komsu.r };
      // İlerleme: çıkışa ne kadar yaklaşıldı (geri gidince azalır)
      this.ilerleme = Math.max(0, this.ilerlemeHedef - this.mesafe[this.kare.c][this.kare.r]);
      this.ilerlemeyiCiz();
      if (this.kare.c === this.cikis.c && this.kare.r === this.cikis.r) this.hazineyeVar();
      else this.kareyeGel();
    });
  }

  // Karakter seçilen kapıdan geçip komşu kareye yürür
  yuru(kap, bitince, hedef) {
    const n = hedef || this.merkez(kap.kapi.komsu.c, kap.kapi.komsu.r);
    const c = this.cocuk;
    let adim = 0;
    const adimSaati = this.time.addEvent({ delay: 150, loop: true, callback: () => {
      adim++;
      c.setTexture(adim % 2 ? "cocuk-adim1" : "cocuk-adim2");
      Sesler.adim(adim % 2 === 1);
    } });
    if (Math.abs(n.x - c.x) > 1) c.setFlipX(n.x < c.x);
    const mesafe = Phaser.Math.Distance.Between(c.x, c.y - 26, n.x, n.y);
    if (kap) this.time.delayedCall(250, () => this.tweens.add({ targets: kap, alpha: 0, scale: 0.5, duration: 200 }));
    this.tweens.add({
      targets: c, x: n.x, y: n.y + 26, duration: Math.max(200, mesafe * 4.5), ease: "Linear",
      onComplete: () => {
        adimSaati.remove();
        c.setTexture("cocuk");
        bitince();
      },
    });
  }

  // Çıkışa varıldı: karakter hazineye yürür, sandık açılır, oyun kazanılır
  hazineyeVar() {
    for (const kap of this.kapilar) kap.destroy();
    this.kapilar = [];
    this.yuru(null, () => {
      this.sandik.setTexture("sandik-acik");
      this.tweens.add({ targets: this.sandik, scale: 0.75, duration: 200, yoyo: true });
      Sesler.hazine();
      // Yıldızlar: her 2 yanlış seçim bir yıldız eksiltir (en az 1)
      this.canSayisi = Math.max(1, 3 - Math.floor(this.yanlisSayisi / 2));
      this.ilerleme = this.ilerlemeHedef;
      this.ilerlemeyiCiz();
      this.odulUcur(this.sandik.x, this.sandik.y);
      this.time.delayedCall(700, () => this.bitir(true));
    }, { x: this.sandik.x - 50, y: this.sandik.y - 26 });
  }

  oyunBitti() {
    for (const k of this.kapilar) k.disableInteractive();
  }
}

miniOyunKaydet("labirent", LabirentSahnesi);
