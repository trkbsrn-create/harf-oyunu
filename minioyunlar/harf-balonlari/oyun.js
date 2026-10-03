// Mini oyun: Harf Balonları (yüzen balonlar, tur tur)
// Ekranda hafifçe sallanan harfli balonlar var. Çocuk istenen harfin balonlarının hepsini
// bulup patlatınca tur biter, yeni balonlar gelir. Acele yok, dikkat ister.
// Yanlış harfli balona dokunmak bir can götürür.
// Seviye arttıkça: balon ve tur sayısı artar, benzer (karışabilen) harfler gelir, 3. seviyede
// balonlar yavaşça gezinir.

const HARF_BALONLARI_SEVIYELERI = {
  1: { tur: 3, balon: 7, dogru: 3, benzerOrani: 0, gezinir: false },
  2: { tur: 3, balon: 9, dogru: 3, benzerOrani: 0.5, gezinir: false },
  3: { tur: 4, balon: 11, dogru: 4, benzerOrani: 0.7, gezinir: true },
};
const BALON_RENKLERI = [0xff9c8a, 0xffe680, 0x9be3dc, 0xc8a2ff, 0xa9c8f0, 0xb5e48c, 0xffc58f];

class HarfBalonlariSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("harf-balonlari");
  }

  preload() {
    super.preload();
    this.load.svg("balon", "gorseller/balon.svg");
  }

  create() {
    this.ortakKur();
    this.ayar = HARF_BALONLARI_SEVIYELERI[this.seviye] || HARF_BALONLARI_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.ilerlemeKur(this.ayar.tur * this.ayar.dogru);
    this.hedefPaneliKur("Patlat:");
    this.turYazisi = this.add.text(960, 100, "", {
      fontFamily: "Andika", fontSize: "24px", color: "#6b6b6b",
    }).setOrigin(0.5).setDepth(900);

    if (!this.textures.exists("balon-parca")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff);
      g.fillRect(0, 0, 10, 6);
      g.generateTexture("balon-parca", 10, 6);
      g.destroy();
    }

    const ogrenilmis = ogrenilmisHarfler(this.harf).filter((h) => h !== this.harf);
    this.yanlislar = ogrenilmis;
    this.benzerler = (BENZER_HARFLER[this.harf] || []).filter((h) => ogrenilmis.includes(h));
    this.balonlar = [];
    this.turNo = 0;

    this.input.on("gameobjectdown", (p, nesne) => {
      if (nesne.balon) this.balonaDokun(nesne);
    });
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniTur()));
  }

  // Yeni tur: eski balonlar uçup gider, yenileri aşağıdan şişerek belirir
  yeniTur() {
    if (this.bitti) return;
    this.turNo++;
    this.turYazisi.setText(`Tur ${this.turNo} / ${this.ayar.tur}`);
    const harfler = [];
    for (let i = 0; i < this.ayar.dogru; i++) harfler.push(this.harf);
    while (harfler.length < this.ayar.balon) {
      if (this.benzerler.length && Math.random() < this.ayar.benzerOrani) {
        harfler.push(Phaser.Utils.Array.GetRandom(this.benzerler));
      } else {
        harfler.push(Phaser.Utils.Array.GetRandom(this.yanlislar));
      }
    }
    Phaser.Utils.Array.Shuffle(harfler);

    // Üst üste binmeyen yerler
    const yerler = [];
    for (const harf of harfler) {
      let x = 0;
      let y = 0;
      for (let deneme = 0; deneme < 60; deneme++) {
        x = Phaser.Math.Between(100, 1180);
        y = Phaser.Math.Between(190, 600);
        if (yerler.every((o) => Math.hypot(o.x - x, o.y - y) > 135)) break;
      }
      yerler.push({ x, y });
      this.balonYap(x, y, harf, yerler.length * 70);
    }
    // İlk turda gösteren el: doğru balonlardan biri (bir kez)
    this.time.delayedCall(yerler.length * 70 + 400, () => this.elGoster(this.balonlar.find((b) => b.balon.dogru)));
  }

  balonYap(x, y, harf, gecikme) {
    const kap = this.add.container(x, y).setDepth(10);
    // Kabın ortası balonun ortası (balon.svg'de resmin ortasından 23 px yukarıda); ip aşağıda
    const resim = this.add.image(0, 23, "balon").setTint(Phaser.Utils.Array.GetRandom(BALON_RENKLERI));
    const yazi = this.add.text(0, 0, harf, {
      fontFamily: "Andika", fontSize: "44px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 8, padding: { x: 3, y: 3 },
    });
    boyaliOrtala(titret(yazi, 1.2));
    kap.add([resim, yazi]);
    kap.setSize(100, 116).setInteractive({ useHandCursor: true }); // dokunma alanı balondan biraz geniş
    kap.balon = { harf, dogru: harf === this.harf };
    kap.setScale(0);
    this.tweens.add({ targets: kap, scale: 1, duration: 300, delay: gecikme, ease: "Back.Out" });
    // Hafifçe sallanır (3. seviyede ayrıca yavaşça gezinir)
    this.tweens.add({ targets: kap, y: y - 12, angle: { from: -4, to: 4 }, duration: Phaser.Math.Between(1300, 1900),
      yoyo: true, repeat: -1, ease: "Sine.InOut", delay: gecikme });
    if (this.ayar.gezinir) {
      this.tweens.add({ targets: kap, x: Phaser.Math.Clamp(x + Phaser.Math.Between(-90, 90), 90, 1190),
        duration: Phaser.Math.Between(2500, 4000), yoyo: true, repeat: -1, ease: "Sine.InOut", delay: gecikme });
    }
    this.balonlar.push(kap);
  }

  balonaDokun(kap) {
    if (this.bitti || kap.balon.patladi) return;
    if (kap.balon.dogru) {
      kap.balon.patladi = true;
      Sesler.pat();
      this.add.particles(kap.x, kap.y, "balon-parca", {
        speed: { min: 150, max: 300 }, lifespan: 450, scale: { start: 1, end: 0 }, rotate: { min: 0, max: 360 },
        tint: kap.list[0].tintTopLeft, emitting: false,
      }).setDepth(20).explode(16);
      this.tweens.killTweensOf(kap);
      kap.destroy();
      this.balonlar = this.balonlar.filter((b) => b !== kap);
      this.ilerlemeArtir(kap.x, kap.y);
      // Bu turdaki doğru balonlar bitti mi?
      if (!this.bitti && !this.balonlar.some((b) => b.balon.dogru)) this.turuBitir();
    } else {
      // Yanlış harf: balon sallanır, bir can gider
      kap.list[0].setTint(0xff9c8a);
      this.tweens.add({ targets: kap.list, x: { from: -8, to: 8 }, duration: 60, yoyo: true, repeat: 2,
        onComplete: () => kap.list.forEach((n) => n.setX(0)) });
      this.kalpEksilt();
      // Nazik ipucu: doğru balonlardan biri hafifçe büyüyüp küçülür
      this.ipucuGoster(this.balonlar.find((b) => b.balon.dogru && !b.balon.patladi));
    }
  }

  // Kalan (yanlış) balonlar yukarı uçup gider, sonra yeni tur
  turuBitir() {
    const kalanlar = this.balonlar;
    this.balonlar = [];
    for (const kap of kalanlar) {
      kap.disableInteractive();
      this.tweens.killTweensOf(kap);
      this.tweens.add({ targets: kap, y: -150, duration: 900, delay: Phaser.Math.Between(0, 200), ease: "Quad.In",
        onComplete: () => kap.destroy() });
    }
    if (this.turNo < this.ayar.tur) {
      Sesler.pling();
      this.time.delayedCall(1100, () => this.yeniTur());
    }
  }

  oyunBitti() {
    for (const kap of this.balonlar) kap.disableInteractive();
  }
}

miniOyunKaydet("harf-balonlari", HarfBalonlariSahnesi);
