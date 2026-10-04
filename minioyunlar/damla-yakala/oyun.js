// Mini oyun: Damla Yakalama (dokunarak yakala)
// Gökten harfli damlalar düşer. Çocuk yalnızca istenen harfin damlalarına dokunur.
// Yanlış harfe dokunursa ya da doğru damla yere düşerse bir can gider.
// Seviye arttıkça: damlalar hızlanır, benzer (karışabilen) harfler gelir, daha çok damla
// yakalamak gerekir.
// Ortak kural (Kazma düzeni): 2. seviye harflerle hece (hece söylenir; hecenin harflerinin damlaları
// sırayla yakalanır, üstteki yerlere uçar; 4 hece), 3. seviye hecelerle kelime (3 kelime). Sırası
// gelmemiş doğru damla yalnızca sallanır; başka parça can götürür; yere düşen damla ceza değil.

const DAMLA_YAKALA_SEVIYELERI = {
  1: { hiz: 90, hedef: 8, aralik: 1300, dogruOrani: 0.5, benzerOrani: 0 },
  2: { hiz: 125, hedef: 10, aralik: 1100, dogruOrani: 0.45, benzerOrani: 0.5 },
  3: { hiz: 160, hedef: 12, aralik: 950, dogruOrani: 0.4, benzerOrani: 0.7 },
};

class DamlaYakalaSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("damla-yakala");
  }

  preload() {
    super.preload();
    this.load.svg("damla", "gorseller/damla.svg");
  }

  create() {
    this.ortakKur();
    this.ayar = DAMLA_YAKALA_SEVIYELERI[this.seviye] || DAMLA_YAKALA_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.siraliKur();
    this.ilerlemeKur(this.tur === "harf" ? this.ayar.hedef : this.tur === "hece" ? 4 : 3);

    // Patlama parçacığı için küçük beyaz daire
    if (!this.textures.exists("damla-parca")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff);
      g.fillCircle(6, 6, 6);
      g.generateTexture("damla-parca", 12, 12);
      g.destroy();
    }

    // Yerde çimen şeridi
    const cimen = this.add.graphics().setDepth(5);
    cimen.fillStyle(0xb5e48c, 1);
    cimen.lineStyle(4, 0x2b2b2b, 1);
    cimen.beginPath();
    cimen.moveTo(0, 668);
    for (let x = 0; x <= 1280; x += 80) cimen.lineTo(x, 668 + (x % 160 === 0 ? -8 : 8));
    cimen.lineTo(1280, 720);
    cimen.lineTo(0, 720);
    cimen.closePath();
    cimen.fillPath();
    cimen.strokePath();

    if (this.tur === "harf") this.hedefPaneliKur("Yakala:");
    else this.siraliPanelKur();


    // Yanlış seçenek havuzu: öğrenilmiş öteki harfler; benzer harfler ayrıca
    const ogrenilmis = ogrenilmisHarfler(this.harf).filter((h) => h !== this.harf);
    this.yanlislar = ogrenilmis;
    this.benzerler = (BENZER_HARFLER[this.harf] || []).filter((h) => ogrenilmis.includes(h));

    this.damlalar = [];
    this.sonXler = [];
    this.uretilen = 0;
    // Önce harf tanıtılır (ünsüzde kapalı hece kurulur), sonra damlalar düşmeye başlar
    this.uretici = null;
    this.time.delayedCall(400, () => this.harfiTanit(() => {
      if (this.bitti) return;
      if (this.tur !== "harf") this.yeniSoru();
      this.uretici = this.time.addEvent({ delay: this.ayar.aralik, loop: true, callback: () => this.damlaUret() });
      this.damlaUret();
    }));

    this.input.on("gameobjectdown", (p, nesne) => {
      if (nesne.damla) this.damlayaDokun(nesne);
    });
  }

  // Sıralı oyun: yeni hece ya da kelime; ekrandaki damlalar kalkar
  yeniSoru() {
    for (const kap of [...this.damlalar]) this.damlayiKaldir(kap);
    this.siraliYanlislar = this.siraliSoruSec();
    this.uretilen = 0;
    this.siraliSoyle();
  }

  // Sıralı oyunda düşecek parça: çoğunlukla sıradaki, bazen sonraki ya da yanlış parça
  siraliParcaSec() {
    const { parcalar } = this.soru;
    const kalan = parcalar.slice(this.sira + 1);
    const r = Math.random();
    if (this.uretilen <= 1 || r < 0.5) return parcalar[this.sira];
    if (kalan.length && r < 0.7) return Phaser.Utils.Array.GetRandom(kalan);
    return this.siraliYanlislar.length ? Phaser.Utils.Array.GetRandom(this.siraliYanlislar) : parcalar[this.sira];
  }

  // Yeni damla: rastgele harf, öncekilerle üst üste binmeyen bir yerden
  damlaUret() {
    if (this.bitti) return;
    if (this.tur !== "harf" && (!this.soru || this.sira >= this.soru.parcalar.length)) return; // hece tamam: bekle
    let harf;
    // Kolay başlangıç: ilk iki damla hep doğru harf
    this.uretilen++;
    if (this.tur !== "harf") {
      harf = this.siraliParcaSec();
    } else if (this.uretilen <= 2 || Math.random() < this.ayar.dogruOrani || !this.yanlislar.length) {
      harf = this.harf;
    } else if (this.benzerler.length && Math.random() < this.ayar.benzerOrani) {
      harf = Phaser.Utils.Array.GetRandom(this.benzerler);
    } else {
      harf = Phaser.Utils.Array.GetRandom(this.yanlislar);
    }
    let x = 0;
    for (let deneme = 0; deneme < 20; deneme++) {
      x = Phaser.Math.Between(90, 1190);
      if (this.sonXler.every((sx) => Math.abs(sx - x) > 150)) break;
    }
    this.sonXler = [x, ...this.sonXler].slice(0, 2);

    const kap = this.add.container(x, 70).setDepth(10);
    const resim = this.add.image(0, 0, "damla").setScale(1.8);
    // damla.svg'de gövdenin ortası resmin ortasından 10 px aşağıda (1.8 kat büyütüldü)
    const yazi = this.add.text(0, 18, harf, {
      fontFamily: "Andika", fontSize: harf.length > 2 ? "24px" : harf.length > 1 ? "30px" : "38px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 7, padding: { x: 3, y: 3 },
    });
    boyaliOrtala(titret(yazi, 1.2));
    kap.add([resim, yazi]);
    kap.setSize(110, 130).setInteractive({ useHandCursor: true }); // dokunma alanı damladan geniş
    kap.damla = { harf, dogru: this.tur === "harf" ? harf === this.harf : harf === this.soru.parcalar[this.sira] };
    kap.setScale(0);
    this.tweens.add({ targets: kap, scale: 1, duration: 250, ease: "Back.Out" });
    this.damlalar.push(kap);
    if (kap.damla.dogru) this.elGoster(kap); // ilk turda gösteren el (bir kez)
  }

  damlayaDokun(kap) {
    if (this.bitti || !kap.active || kap.damla.alindi) return;
    const durum = this.tur === "harf" ? (kap.damla.dogru ? "sirada" : "yanlis") : this.siraliDurum(kap.damla.harf);
    if (durum === "sonra") {
      // Sırası gelmedi: yalnızca sallanır (can gitmez)
      Sesler.nota(330, 0, 0.1, 0.1, "sine");
      this.tweens.add({ targets: kap.list, x: { from: -8, to: 8 }, duration: 60, yoyo: true, repeat: 2,
        onComplete: () => kap.list.forEach((n) => n.setX(0)) });
      return;
    }
    kap.damla.alindi = true;
    if (durum === "sirada") {
      Sesler.damla();
      this.add.particles(kap.x, kap.y, "damla-parca", {
        speed: { min: 120, max: 260 }, lifespan: 500, scale: { start: 1, end: 0 },
        tint: [0x7cc4ef, 0xc9ecff, 0xffffff], emitting: false,
      }).setDepth(20).explode(14);
      this.damlayiKaldir(kap);
      if (this.tur === "harf") this.ilerlemeArtir(kap.x, kap.y);
      else if (this.siraliParcaAl(kap.x, kap.y)) this.siraliTamam(() => this.yeniSoru());
    } else {
      // Yanlış harf: damla sallanır, kızarır ve kaybolur
      kap.list[0].setTint(0xff9c8a);
      this.tweens.add({ targets: kap, angle: { from: -15, to: 15 }, duration: 70, yoyo: true, repeat: 2,
        onComplete: () => this.damlayiKaldir(kap) });
      this.kalpEksilt();
    }
  }

  damlayiKaldir(kap) {
    this.damlalar = this.damlalar.filter((d) => d !== kap);
    this.tweens.add({ targets: kap, scale: 0, alpha: 0, duration: 180, onComplete: () => kap.destroy() });
  }

  update(zaman, fark) {
    if (this.bitti) return;
    for (const kap of [...this.damlalar]) {
      if (kap.damla.alindi) continue;
      kap.y += (this.ayar.hiz * fark) / 1000;
      if (kap.y > 640) {
        // Yere düştü: doğru damla kaçırıldıysa bir can gider
        kap.damla.alindi = true;
        const sicrama = this.add.circle(kap.x, 662, 10, 0x7cc4ef).setDepth(6);
        this.tweens.add({ targets: sicrama, scaleX: 4, scaleY: 1.5, alpha: 0, duration: 350,
          onComplete: () => sicrama.destroy() });
        this.damlayiKaldir(kap);
        if (kap.damla.dogru && this.tur === "harf") this.kalpEksilt();
      }
    }
  }

  oyunBitti() {
    if (this.uretici) this.uretici.remove();
    for (const kap of this.damlalar) kap.disableInteractive();
  }
}

miniOyunKaydet("damla-yakala", DamlaYakalaSahnesi);
