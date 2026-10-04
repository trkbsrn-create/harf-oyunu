// Mini oyun: Ördek Vurma (panayır ördekleri)
// Panayır atış standı: ördekler sıra sıra suda kayar, sırtlarında birer harf var. Çocuk istenen
// harfin ördeklerine dokunur (nişangâh çıkar); vurulan ördek takla atıp devrilir. Yanlış harfli
// ördek bir can götürür. Kaçan ördek ceza değildir; kenardan çıkan ördek yeni harfle geri gelir.
// Seviyeler: 1: 2 sıra, yavaş, 8 ördek; 2: 2 sıra, benzer harfler, 10 ördek; 3: 3 sıra, hızlı, 12.
// Ortak kural (Kazma düzeni): 2. seviyede hece söylenir, ördeklerde harfler; hecenin harfleri
// sırayla vurulur (üstteki yerlere uçar; 4 hece). 3. seviyede kelime söylenir, ördeklerde heceler;
// kelimenin heceleri sırayla (3 kelime). Sırası gelmemiş doğru ördek yalnızca sallanır (can gitmez),
// başka parça can götürür. Bu harfte hece yoksa (a, n) harf.

const ORDEK_SEVIYELERI = {
  1: { hedef: 8, siralar: [330, 520], hiz: 70, benzer: false, dogruOrani: 0.45 },
  2: { hedef: 10, siralar: [330, 520], hiz: 90, benzer: true, dogruOrani: 0.4 },
  3: { hedef: 12, siralar: [260, 420, 580], hiz: 115, benzer: true, dogruOrani: 0.35 },
};

const ORDEK_ARALIK = 250;

class OrdekVurmaSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("ordek-vurma");
  }

  create() {
    this.ortakKur();
    this.ayar = ORDEK_SEVIYELERI[this.seviye] || ORDEK_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.siraliKur();
    this.ilerlemeKur(this.tur === "harf" ? this.ayar.hedef : this.tur === "hece" ? 4 : 3);
    this.hedef = this.harf; // vurulacak harf ya da sıradaki parça
    this.siraliYanlislar = [];
    this.ordekler = [];
    this.uretilen = 0;
    this.basladi = false;
    const ogrenilmis = ogrenilmisHarfler(this.harf).filter((h) => h !== this.harf);
    const benzerler = (BENZER_HARFLER[this.harf] || []).filter((h) => ogrenilmis.includes(h));
    this.yanlislar = this.ayar.benzer && benzerler.length ? [...benzerler, ...benzerler, ...ogrenilmis] : ogrenilmis;
    if (this.tur !== "harf") {
      this.siraliPanelKur();
      this.siraliYanlislar = this.siraliSoruSec();
      this.hedef = this.soru.parcalar[0];
    } else {
      this.hedefPaneliKur("Vur:");
    }

    this.standCiz();
    this.nisangah = this.add.graphics().setDepth(50).setAlpha(0);
    this.nisangah.lineStyle(5, 0xe0533d, 1);
    this.nisangah.strokeCircle(0, 0, 38);
    this.nisangah.lineBetween(-54, 0, 54, 0);
    this.nisangah.lineBetween(0, -54, 0, 54);

    this.input.on("pointerdown", (p) => this.ates(p));
    this.time.delayedCall(400, () => this.harfiTanit(() => {
      if (this.bitti) return;
      if (this.tur !== "harf") this.siraliSoyle();
      // Her sırada ördekler eşit aralıkla dizilir; sıralar zıt yönde kayar
      this.ayar.siralar.forEach((y, s) => {
        const yon = s % 2 === 0 ? 1 : -1;
        for (let x = -100; x < 1380; x += ORDEK_ARALIK) {
          this.ordekYap(x + (s % 2) * 120, y, yon);
        }
      });
      this.basladi = true;
    }));
  }

  // Panayır standı: tente, su şeritleri (dalgalar ördeklerin önünde)
  standCiz() {
    const g = this.add.graphics().setDepth(-5);
    for (let i = 0; i < 16; i++) {
      g.fillStyle(i % 2 ? 0xffffff : 0xff9c8a, 1);
      g.fillRect(i * 80, 100, 80, 50);
    }
    g.lineStyle(4, 0x2b2b2b, 1);
    g.lineBetween(0, 150, 1280, 150);
    for (let i = 0; i < 16; i++) {
      g.fillStyle(i % 2 ? 0xffffff : 0xff9c8a, 1);
      g.fillCircle(i * 80 + 40, 150, 40);
    }
    this.ayar.siralar.forEach((y) => {
      const d = this.add.graphics().setDepth(20);
      d.fillStyle(0x7cc4ef, 1);
      d.fillRect(0, y + 34, 1280, 50);
      d.lineStyle(4, 0x2b2b2b, 1);
      d.beginPath();
      d.moveTo(0, y + 34);
      for (let x = 0; x <= 1280; x += 40) d.lineTo(x, y + 34 + (x % 80 === 0 ? -8 : 0));
      d.strokePath();
      d.lineStyle(3, 0xffffff, 0.8);
      d.beginPath();
      d.moveTo(0, y + 60);
      for (let x = 0; x <= 1280; x += 40) d.lineTo(x, y + 60 + (x % 80 === 0 ? 0 : -8));
      d.strokePath();
    });
  }

  yeniHarf() {
    this.uretilen++;
    if (this.tur !== "harf") {
      // Sıralı oyun: çoğunlukla sıradaki parça, bazen sırası gelmemiş parça ya da yanlış parça
      if (!this.hedef) return Phaser.Utils.Array.GetRandom(this.siraliYanlislar) || this.soru.parcalar[0]; // hece okunuyor
      const kalan = this.soru.parcalar.slice(this.sira + 1);
      const r = Math.random();
      if (r < this.ayar.dogruOrani) return this.hedef;
      if (kalan.length && r < this.ayar.dogruOrani + 0.2) return Phaser.Utils.Array.GetRandom(kalan);
      return this.siraliYanlislar.length ? Phaser.Utils.Array.GetRandom(this.siraliYanlislar) : this.hedef;
    }
    // Kolay başlangıç: ilk ördeklerden ikisi doğru harf
    if (this.uretilen % 4 === 2 && this.uretilen < 8) return this.hedef;
    return Math.random() < this.ayar.dogruOrani ? this.hedef : Phaser.Utils.Array.GetRandom(this.yanlislar);
  }

  // Sıralı oyun: aranan parça değişti. Kenardaki ördekler yeni yazı alır; görünen ördeklerde aranan
  // parça yoksa biri onu alır
  hedefDegisti() {
    this.hedef = this.soru.parcalar[this.sira];
    const gorunur = (o) => o.x > 150 && o.x < 1130;
    for (const o of this.ordekler) {
      if (o.ordek.vuruldu) continue;
      if (!gorunur(o)) this.harfVer(o);
      else o.ordek.dogru = o.ordek.harf === this.hedef;
    }
    const adaylar = this.ordekler.filter((o) => !o.ordek.vuruldu && gorunur(o));
    if (adaylar.length && !adaylar.some((o) => o.ordek.dogru)) {
      const o = Phaser.Utils.Array.GetRandom(adaylar);
      this.harfVer(o, this.hedef);
      o.setScale(0.6);
      this.tweens.add({ targets: o, scale: 1, duration: 250, ease: "Back.Out" });
    }
  }

  // Sıralı oyun: yeni hece ya da kelime
  yeniSoru() {
    this.siraliYanlislar = this.siraliSoruSec();
    this.siraliSoyle();
    for (const o of this.ordekler) if (!o.ordek.vuruldu) this.harfVer(o);
    this.hedefDegisti();
  }

  ordekYap(x, y, yon) {
    const kap = this.add.container(x, y).setDepth(10);
    const g = this.add.graphics();
    const r = yon; // baş, gidiş yönünde
    g.fillStyle(0xffe680, 1);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.fillEllipse(0, 0, 120, 74);
    g.strokeEllipse(0, 0, 120, 74);
    g.fillCircle(r * 46, -40, 28);
    g.strokeCircle(r * 46, -40, 28);
    g.fillStyle(0xffa64d, 1);
    g.fillTriangle(r * 70, -44, r * 70, -30, r * 92, -37);
    g.strokeTriangle(r * 70, -44, r * 70, -30, r * 92, -37);
    g.fillStyle(0x2b2b2b, 1);
    g.fillCircle(r * 54, -46, 5);
    // Kanat
    g.lineStyle(3, 0x2b2b2b, 1);
    g.beginPath();
    g.arc(-r * 18, 4, 22, Math.PI * 0.1, Math.PI * 0.9);
    g.strokePath();
    kap.add(g);
    kap.ordek = { yon, y };
    this.harfVer(kap);
    kap.setSize(130, 110);
    this.ordekler.push(kap);
    return kap;
  }

  harfVer(kap, verilen) {
    if (kap.yazi) kap.yazi.destroy();
    const harf = verilen || this.yeniHarf();
    kap.yazi = boyaliOrtala(titret(this.add.text(-kap.ordek.yon * 10, -10, harf, {
      fontFamily: "Andika", fontSize: harf.length > 2 ? "38px" : harf.length > 1 ? "44px" : "50px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 8, padding: { x: 4, y: 4 },
    }), 1.4));
    kap.add(kap.yazi);
    kap.ordek.harf = harf;
    kap.ordek.dogru = harf === this.hedef;
    kap.ordek.vuruldu = false;
    kap.setAngle(0).setAlpha(1).setScale(1).setY(kap.ordek.y);
    kap.list[0].setAlpha(1);
  }

  update(zaman, fark) {
    if (this.bitti || !this.basladi) return;
    const dx = (this.ayar.hiz * fark) / 1000;
    const genislik = Math.ceil(1480 / ORDEK_ARALIK) * ORDEK_ARALIK;
    for (const o of this.ordekler) {
      o.x += o.ordek.yon * dx;
      if (!o.ordek.vuruldu) o.y = o.ordek.y + Math.sin(zaman / 300 + o.x / 90) * 4;
      // Kenardan çıkan ördek öbür kenardan yeni harfle girer
      if (o.ordek.yon > 0 && o.x > 1380) { o.x -= genislik; this.harfVer(o); }
      if (o.ordek.yon < 0 && o.x < -100) { o.x += genislik; this.harfVer(o); }
      if (o.ordek.dogru && !o.ordek.vuruldu && o.x > 300 && o.x < 900) this.elGoster(o);
    }
  }

  ates(p) {
    if (this.bitti || !this.basladi || p.y < 160) return;
    this.nisangah.setPosition(p.x, p.y).setAlpha(1).setScale(1.3);
    this.tweens.killTweensOf(this.nisangah);
    this.tweens.add({ targets: this.nisangah, scale: 1, alpha: 0, duration: 380 });
    const o = this.ordekler.find((x) => !x.ordek.vuruldu && Math.abs(p.x - x.x) < 70 && Math.abs(p.y - (x.y - 10)) < 60);
    if (!o) {
      Sesler.nota(220, 0, 0.05, 0.06, "square"); // ıska: yalnızca küçük bir ses
      return;
    }
    const durum = this.tur === "harf" ? (o.ordek.dogru ? "sirada" : "yanlis") : this.siraliDurum(o.ordek.harf);
    if (durum === "sonra") {
      // Sırası gelmedi: yalnızca sallanır (can gitmez)
      Sesler.nota(330, 0, 0.1, 0.1, "sine");
      this.tweens.add({ targets: o, angle: { from: -12, to: 12 }, duration: 70, yoyo: true, repeat: 2, onComplete: () => o.setAngle(0) });
      return;
    }
    o.ordek.vuruldu = true;
    if (durum === "sirada") {
      Sesler.pat();
      if (this.tur === "harf") {
        harfiSoyle(this.harf);
        this.ilerlemeArtir(o.x, o.y);
      } else if (this.siraliParcaAl(o.x, o.y)) {
        this.hedef = null; // hece tamam: okunana kadar aranan yok
        for (const x of this.ordekler) x.ordek.dogru = false;
        this.siraliTamam(() => this.yeniSoru());
      } else {
        this.hedefDegisti();
      }
      // Takla atıp suya devrilir; kenara ulaşınca yeni harfle döner
      this.tweens.add({ targets: o, angle: o.ordek.yon * 360, y: o.ordek.y + 40, duration: 450, ease: "Quad.In",
        onComplete: () => this.tweens.add({ targets: o, alpha: 0, duration: 200 }) });
    } else {
      o.list[0].setAlpha(0.6);
      this.tweens.add({ targets: o, angle: { from: -12, to: 12 }, duration: 70, yoyo: true, repeat: 2, onComplete: () => o.setAngle(0) });
      this.kalpEksilt();
      const dogru = this.ordekler.find((x) => x.ordek.dogru && !x.ordek.vuruldu && x.x > 100 && x.x < 1180);
      if (dogru) this.ipucuGoster(dogru);
    }
  }

  oyunBitti() {
    this.basladi = false;
  }
}

miniOyunKaydet("ordek-vurma", OrdekVurmaSahnesi);
