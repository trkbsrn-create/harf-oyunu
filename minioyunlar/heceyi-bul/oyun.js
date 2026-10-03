// Mini oyun: Heceyi Bul (hece balıkları)
// Oyun bir heceyi sesli söyler (hoparlöre dokununca yeniden söylenir). Derede sırtında hece
// yazılı balıklar yüzer; çocuk söylenen heceli balığa dokunur. Doğru balık sudan zıplar,
// yanlış balık bir can götürür.
// Seviyeler (öğretmenin onayladığı öneri):
//   1: heceler birbirinden çok farklı (an, el, it), 3 balık
//   2: yalnızca bir harfi değişen heceler (an, en, in, at), 4 balık
//   3: ters heceler de var (an, na), açık hece de sorulur, 5 balık

const HECEYI_BUL_SEVIYELERI = {
  1: { tur: 5, balik: 3, hiz: 45, acikOrani: 0 },
  2: { tur: 6, balik: 4, hiz: 60, acikOrani: 0 },
  3: { tur: 7, balik: 5, hiz: 75, acikOrani: 0.4 },
};

const BALIK_RENKLERI = [0xffd27a, 0xff9e8a, 0xb9e08a, 0x9be3dc, 0xc8a2ff, 0xa9c8f0];
const DERE_UST = 180;

class HeceyiBulSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("heceyi-bul");
  }

  preload() {
    super.preload();
    this.load.svg("balik", "gorseller/balik.svg");
  }

  create() {
    this.ortakKur();
    this.ayar = HECEYI_BUL_SEVIYELERI[this.seviye] || HECEYI_BUL_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.ilerlemeKur(this.ayar.tur);
    this.baliklar = [];
    this.kilitli = true;
    this.dereCiz();

    const hoparlor = this.add.container(640, 60, [this.hoparlorCiz(0, 0, 38)]).setDepth(900)
      .setSize(84, 84).setInteractive({ useHandCursor: true });
    hoparlor.on("pointerdown", () => { if (this.hece) Sesler.soyle(this.hece); });
    this.hoparlor = hoparlor;

    // Bu oyunda kurulabilecek bütün heceler (öğrenilmiş harflerle)
    this.heceler = heceHavuzu(this.harf);

    this.input.on("gameobjectdown", (p, nesne) => {
      if (nesne.balik) this.baligaDokun(nesne);
    });
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniTur()));
  }

  dereCiz() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x9fd8f5, 1);
    g.fillRect(0, DERE_UST, 1280, 720 - DERE_UST);
    g.lineStyle(4, 0xffffff, 0.9);
    g.beginPath();
    g.moveTo(0, DERE_UST);
    for (let x = 0; x <= 1280; x += 40) g.lineTo(x, DERE_UST + (x % 80 === 0 ? 0 : -8));
    g.strokePath();
    // Suyun içinde birkaç yosun
    g.lineStyle(5, 0x6fbf4a, 0.7);
    for (const x of [90, 330, 610, 870, 1180]) {
      g.beginPath();
      g.moveTo(x, 720);
      g.lineTo(x - 10, 690);
      g.lineTo(x + 6, 662);
      g.lineTo(x - 4, 636);
      g.strokePath();
    }
  }

  // Sorulacak hece ve seçenekler (seviyeye göre; ortak.js'deki heceSorusu)
  heceleriSec() {
    return heceSorusu(this.heceler, this.harf, this.seviye, this.ayar.balik, this.ayar.acikOrani, this.hece);
  }

  yeniTur() {
    if (this.bitti) return;
    const { hedef, secenekler } = this.heceleriSec();
    this.hece = hedef;
    // Balıklar ayrı şeritlerde, sırayla sağa ve sola yüzer
    const seritAraligi = (690 - DERE_UST - 60) / secenekler.length;
    const renkler = Phaser.Utils.Array.Shuffle(BALIK_RENKLERI.slice());
    const baslangiclar = Phaser.Utils.Array.Shuffle([0, 1, 2, 3, 4].slice(0, secenekler.length));
    this.baliklar = secenekler.map((hece, i) => {
      const y = DERE_UST + 60 + seritAraligi * (i + 0.5);
      const yon = i % 2 === 0 ? 1 : -1;
      const x = 180 + (baslangiclar[i] / Math.max(1, secenekler.length - 1)) * 920;
      return this.balikYap(x, y, hece, yon, renkler[i % renkler.length], i * 90);
    });
    this.time.delayedCall(500, () => {
      if (this.bitti) return;
      this.tweens.add({ targets: this.hoparlor, scale: 1.2, duration: 160, yoyo: true });
      Sesler.soyle(hedef);
      this.kilitli = false;
      // İlk turda gösteren el doğru balığı izler (bir kez)
      this.elGoster(this.baliklar.find((b) => b.balik.hece === hedef));
    });
  }

  balikYap(x, y, hece, yon, renk, gecikme) {
    const kap = this.add.container(x, y).setDepth(10);
    // balik.svg'de başı solda; sağa yüzen balık çevrilir. Gövdenin ortası resmin ortasından 12 px solda.
    const resim = this.add.image(0, 0, "balik").setTint(renk).setFlipX(yon > 0);
    const yazi = boyaliOrtala(titret(this.add.text(yon > 0 ? 12 : -12, 0, hece, {
      fontFamily: "Andika", fontSize: "50px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 8, padding: { x: 4, y: 4 },
    }), 1.8));
    kap.add([resim, yazi]);
    kap.resim = resim;
    kap.balik = { hece, yon, tabanY: y, evre: Math.random() * Math.PI * 2 };
    kap.setSize(190, 100).setInteractive({ useHandCursor: true });
    kap.setAlpha(0);
    this.tweens.add({ targets: kap, alpha: 1, duration: 400, delay: gecikme });
    return kap;
  }

  update(zaman, fark) {
    const hiz = this.ayar ? this.ayar.hiz : 0;
    for (const kap of this.baliklar) {
      const b = kap.balik;
      if (b.durdu) continue;
      kap.x += b.yon * hiz * (fark / 1000);
      // Ekrandan çıkan balık öbür kenardan yeniden girer
      if (b.yon > 0 && kap.x > 1280 + 110) kap.x = -110;
      if (b.yon < 0 && kap.x < -110) kap.x = 1280 + 110;
      kap.y = b.tabanY + Math.sin(zaman / 500 + b.evre) * 6;
    }
  }

  baligaDokun(kap) {
    if (this.bitti || this.kilitli || kap.balik.durdu) return;
    if (kap.balik.hece === this.hece) {
      this.kilitli = true;
      kap.balik.durdu = true;
      Sesler.pling();
      this.ilerlemeArtir(kap.x, kap.y);
      // Doğru balık sudan zıplar, dönerek geri dalar; öbürleri kaybolur
      kap.setDepth(20);
      this.tweens.add({ targets: kap, y: kap.y - 150, duration: 450, ease: "Quad.Out", yoyo: true });
      this.tweens.add({ targets: kap.resim, angle: kap.balik.yon > 0 ? -25 : 25, duration: 450, yoyo: true });
      this.time.delayedCall(250, () => Sesler.soyle(kap.balik.hece));
      for (const k of this.baliklar) {
        if (k !== kap) this.tweens.add({ targets: k, alpha: 0, duration: 400 });
      }
      this.tweens.add({ targets: kap, alpha: 0, duration: 300, delay: 1100 });
      this.time.delayedCall(1600, () => {
        for (const k of this.baliklar) k.destroy();
        this.baliklar = [];
        this.yeniTur();
      });
    } else {
      // Yanlış balık: kırmızılaşır, sallanır; bir can gider, hece yeniden söylenir
      // (Bir kez dokunulan yanlış balık bir daha can götürmez.)
      if (kap.balik.yanlis) return;
      kap.balik.yanlis = true;
      kap.resim.setTint(0xff6b5a);
      kap.setAlpha(0.7);
      this.tweens.add({ targets: kap, angle: { from: -8, to: 8 }, duration: 60, yoyo: true, repeat: 2,
        onComplete: () => kap.setAngle(0) });
      this.kalpEksilt();
      this.time.delayedCall(700, () => { if (!this.bitti) Sesler.soyle(this.hece); });
      this.ipucuGoster(this.baliklar.find((b) => b.balik.hece === this.hece));
    }
  }

  oyunBitti() {
    for (const k of this.baliklar) k.disableInteractive();
  }
}

miniOyunKaydet("heceyi-bul", HeceyiBulSahnesi);
