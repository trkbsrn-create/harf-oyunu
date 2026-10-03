// Mini oyun: Hece Kulesi (öğretmenin tarifi)
// 1) Oyun bir hece söyler (hoparlörle tekrar). Üstte üç hece kartı var; çocuk söylenen heceyi
//    seçer. Yanlış kart bir can götürür.
// 2) Seçilen hece bloğu vince asılır ve sağa sola sallanmaya başlar. Çocuk ekrana dokununca
//    blok düşer; kulenin üstüne oturursa kule büyür. Kuleyi ıskalarsa blok düşer ve aynı hece
//    yeniden vince gelir (1. seviyede can gitmez, sonra bir can gider).
// Kelime kurulmaz; her blok ayrı bir hecedir. Kule yükseldikçe aşağı kayar, ekrandan taşmaz.
// Seviyeler: 1: 5 kat, yavaş sallanma, geniş tolerans; 2: 6 kat; 3: 8 kat, hızlı, açık hece de.

const KULE_SEVIYELERI = {
  1: { kat: 5, salinim: 1.5, tolerans: 0.85, affet: true, acikOrani: 0 },
  2: { kat: 6, salinim: 2.0, tolerans: 0.7, affet: false, acikOrani: 0 },
  3: { kat: 8, salinim: 2.5, tolerans: 0.6, affet: false, acikOrani: 0.4 },
};

const BLOK_EN = 180;
const BLOK_BOY = 66;
const KULE_TABAN = 690;
const VINC_Y = 255;
const BLOK_RENKLERI = [0xff9c8a, 0xffe680, 0xb5e48c, 0x9be3dc, 0xc8a2ff, 0xffc58f];

class HeceKulesiSahnesi extends MiniOyunSahnesi {
  constructor() {
    super("hece-kulesi");
  }

  create() {
    this.ortakKur();
    this.ayar = KULE_SEVIYELERI[this.seviye] || KULE_SEVIYELERI[1];
    this.kalpleriKur(3);
    this.ilerlemeKur(this.ayar.kat);
    this.heceler = heceHavuzu(this.harf);
    this.hece = null;
    this.kartlar = [];
    this.kule = [];
    this.asili = null;
    this.dusen = null;
    this.durum = "bekle"; // sec, salla, dus
    this.zaman = 0;
    this.renkNo = 0;

    const hoparlor = this.add.container(110, 175, [this.hoparlorCiz(0, 0, 38)]).setDepth(900)
      .setSize(96, 96).setInteractive({ useHandCursor: true });
    hoparlor.on("pointerdown", () => { if (this.hece) Sesler.soyle(this.hece); });
    this.hoparlor = hoparlor;

    // Zemin ve vinç
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0xb5e48c, 1);
    g.fillRect(0, KULE_TABAN, 1280, 720 - KULE_TABAN);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.lineBetween(0, KULE_TABAN, 1280, KULE_TABAN);
    g.fillStyle(0xffc928, 1);
    g.fillRect(150, VINC_Y - 18, 980, 18);
    g.strokeRect(150, VINC_Y - 18, 980, 18);
    g.fillRect(1130, VINC_Y - 18, 26, KULE_TABAN - VINC_Y + 18);
    g.strokeRect(1130, VINC_Y - 18, 26, KULE_TABAN - VINC_Y + 18);
    this.ip = this.add.graphics().setDepth(4);

    // Kulenin tabanı
    const taban = this.add.rectangle(640, KULE_TABAN - 12, BLOK_EN + 60, 24, 0x8d6e4c).setStrokeStyle(4, 0x2b2b2b).setDepth(2);
    this.kule.push({ x: 640, y: KULE_TABAN - 12, nesne: taban, taban: true });

    this.input.on("pointerdown", (p) => { if (this.durum === "salla" && p.y > 230) this.birak(); });
    this.time.delayedCall(400, () => this.harfiTanit(() => this.yeniHece()));
  }

  blokYap(x, y, hece) {
    const kap = this.add.container(x, y).setDepth(5);
    const g = this.add.graphics();
    g.fillStyle(BLOK_RENKLERI[this.renkNo++ % BLOK_RENKLERI.length], 1);
    g.fillRoundedRect(-BLOK_EN / 2, -BLOK_BOY / 2, BLOK_EN, BLOK_BOY, 12);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.strokeRoundedRect(-BLOK_EN / 2, -BLOK_BOY / 2, BLOK_EN, BLOK_BOY, 12);
    const yazi = boyaliOrtala(titret(this.add.text(0, 0, hece, {
      fontFamily: "Andika", fontSize: "44px", color: "#ffffff",
      stroke: "#3b2a1a", strokeThickness: 8, padding: { x: 4, y: 4 },
    }), 1.5));
    kap.add([g, yazi]);
    kap.hece = hece;
    return kap;
  }

  // 1. adım: hece söylenir, üstte üç kart
  yeniHece() {
    if (this.bitti) return;
    for (const k of this.kartlar) k.destroy();
    this.kartlar = [];
    const { hedef, secenekler } = heceSorusu(this.heceler, this.harf, this.seviye, 3, this.ayar.acikOrani, this.hece);
    this.hece = hedef;
    secenekler.forEach((h, i) => {
      const kap = this.add.container(470 + i * 210, 160).setDepth(6);
      const g = this.add.graphics();
      g.fillStyle(0xfffdf6, 1);
      g.fillRoundedRect(-85, -42, 170, 84, 16);
      g.lineStyle(4, 0x2b2b2b, 1);
      g.strokeRoundedRect(-85, -42, 170, 84, 16);
      kap.add([g, boyaliOrtala(titret(this.add.text(0, 0, h, {
        fontFamily: "Andika", fontSize: "48px", color: "#ffffff",
        stroke: "#3b2a1a", strokeThickness: 8, padding: { x: 4, y: 4 },
      }), 1.5))]);
      kap.kart = { hece: h, dogru: h === hedef };
      kap.setSize(190, 100).setInteractive({ useHandCursor: true });
      kap.on("pointerdown", () => this.kartSec(kap));
      kap.setScale(0);
      this.tweens.add({ targets: kap, scale: 1, duration: 250, delay: i * 80, ease: "Back.Out" });
      this.kartlar.push(kap);
    });
    this.durum = "sec";
    this.tweens.add({ targets: this.hoparlor, scale: 1.2, duration: 160, yoyo: true });
    Sesler.soyle(hedef);
    this.time.delayedCall(500, () => this.elGoster(this.kartlar.find((k) => k.kart.dogru)));
  }

  kartSec(kap) {
    if (this.bitti || this.durum !== "sec" || kap.kart.denendi) return;
    if (kap.kart.dogru) {
      this.durum = "bekle";
      Sesler.pling();
      Sesler.soyle(kap.kart.hece);
      for (const k of this.kartlar) if (k !== kap) this.tweens.add({ targets: k, alpha: 0, scale: 0.6, duration: 200 });
      // Kart blok olur ve vince asılır
      this.tweens.add({ targets: kap, x: 640, y: VINC_Y + 90, alpha: 0, duration: 350 });
      this.time.delayedCall(350, () => this.vinceAs(kap.kart.hece));
    } else {
      kap.kart.denendi = true;
      kap.setAlpha(0.5);
      this.tweens.add({ targets: kap, angle: { from: -6, to: 6 }, duration: 70, yoyo: true, repeat: 2, onComplete: () => kap.setAngle(0) });
      this.kalpEksilt();
      this.time.delayedCall(600, () => { if (!this.bitti) Sesler.soyle(this.hece); });
      this.ipucuGoster(this.kartlar.find((k) => k.kart.dogru));
    }
  }

  // 2. adım: blok vinçte sallanır
  vinceAs(hece) {
    if (this.bitti) return;
    this.asili = this.blokYap(640, VINC_Y + 90, hece);
    this.zaman = 0;
    this.durum = "salla";
    this.time.delayedCall(700, () => { if (this.durum === "salla") this.elGoster({ x: 640, y: 450 }); });
  }

  update(zaman, fark) {
    if (this.bitti) return;
    const g = this.ip;
    g.clear();
    if (this.durum === "salla" && this.asili) {
      this.zaman += fark / 1000;
      const x = 640 + Math.sin(this.zaman * this.ayar.salinim) * 300;
      this.asili.x = x;
      this.asili.angle = Math.cos(this.zaman * this.ayar.salinim) * 6;
      g.fillStyle(0x555555, 1);
      g.fillRect(x - 24, VINC_Y - 4, 48, 20);
      g.lineStyle(4, 0x2b2b2b, 1);
      g.lineBetween(x, VINC_Y + 16, x, VINC_Y + 90 - BLOK_BOY / 2);
    }
    if (this.durum === "dus" && this.dusen) {
      const d = this.dusen;
      d.vy += 1800 * (fark / 1000);
      d.nesne.y += d.vy * (fark / 1000);
      const ust = this.kule[this.kule.length - 1];
      const hedefY = ust.y - (ust.taban ? 12 : BLOK_BOY / 2) - BLOK_BOY / 2;
      if (!d.kacti && d.nesne.y >= hedefY) {
        const kayma = Math.abs(d.nesne.x - ust.x);
        if (kayma < BLOK_EN * this.ayar.tolerans) this.oturdu(d.nesne, hedefY);
        else d.kacti = true; // ıskaladı, düşmeye devam eder
      }
      if (d.kacti && d.nesne.y > 760) this.iskaladi(d.nesne);
    }
  }

  birak() {
    this.durum = "dus";
    this.asili.angle = 0;
    this.dusen = { nesne: this.asili, vy: 0, kacti: false };
    this.asili = null;
    Sesler.nota(420, 0, 0.08, 0.08, "sine");
  }

  oturdu(blok, y) {
    blok.y = y;
    this.dusen = null;
    this.durum = "bekle";
    this.kule.push({ x: blok.x, y, nesne: blok });
    Sesler.nota(330, 0, 0.12, 0.15, "triangle");
    this.tweens.add({ targets: blok, scaleY: 0.85, duration: 80, yoyo: true });
    Sesler.soyle(blok.hece);
    this.ilerlemeArtir(blok.x, blok.y);
    // Kule çok yükselirse bütün kule aşağı kayar
    const ust = this.kule[this.kule.length - 1];
    const fazla = (VINC_Y + 230) - ust.y;
    const kaydir = () => {
      if (this.bitti) return;
      this.time.delayedCall(700, () => this.yeniHece());
    };
    if (fazla > 0) {
      for (const k of this.kule) {
        k.y += fazla;
        this.tweens.add({ targets: k.nesne, y: k.nesne.y + fazla, duration: 400, ease: "Quad.Out" });
      }
      this.time.delayedCall(420, kaydir);
    } else kaydir();
  }

  // Iskaladı: aynı hece yeniden vince gelir
  iskaladi(blok) {
    const hece = blok.hece;
    blok.destroy();
    this.dusen = null;
    this.durum = "bekle";
    if (this.ayar.affet) Sesler.yanlis();
    else this.kalpEksilt();
    if (!this.bitti) this.time.delayedCall(600, () => this.vinceAs(hece));
  }

  oyunBitti() {
    this.durum = "bitti";
  }
}

miniOyunKaydet("hece-kulesi", HeceKulesiSahnesi);
