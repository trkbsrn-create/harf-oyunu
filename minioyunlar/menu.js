// Mini oyunlar menüsü: karşılama ekranındaki "Mini Games" düğmesiyle açılır.
// Üstte harf grupları, altında seçilen grubun harfleri, sonra her mini oyunun kartı. Hazır olan
// oyunun kartına dokununca seviye sorulur, oyun seçilen harfle açılır; hazır olmayanlarda "Yakında".
// Mini oyunları ayrı ayrı geliştirip denemek için. Öğretmenin isteği: kartlar etikete göre
// süzülebilir (harflerin sağında): "harf" yalnızca harf etiketliler, "hece" yalnızca hece
// etiketliler, ikisi birden seçiliyse yalnızca iki etiketi de olanlar, "hepsi" bütün oyunlar.

const MENU_SAYFA_KART = 8;
// Mini oyunlarda hazır olan son harf grubu (sonrakiler menüde silik, "Yakında")
const MENU_HAZIR_GRUP = 2;
// Etiket rozetlerinin renkleri (harf: kırmızımsı, hece: sarı; Birleştir Büyüt taşlarıyla aynı)
const ETIKET_RENKLERI = { harf: 0xff9c8a, hece: 0xffe680 };

class MiniOyunlarSahnesi extends Phaser.Scene {
  constructor() {
    super("MiniOyunlarSahnesi");
  }

  preload() {
    this.load.svg("oyun-karti", "gorseller/oyun-karti.svg");
    oyunSimgeleriniYukle(this);
  }

  create() {
    this.cameras.main.fadeIn(300, 251, 247, 236);
    this.add.tileSprite(0, 0, 1280, 720, "doku-kagit").setOrigin(0);
    doodleYazi(this, 640, 60, "Mini Games", 64, "mavi").setOrigin(0.5);

    // Geri: karşılama ekranına
    const geri = this.add.container(110, 46, [
      this.add.image(0, 0, "incele-dugmesi"),
      doodleYazi(this, 0, -3, "Geri", 30).setOrigin(0.5),
    ]).setSize(170, 56).setInteractive({ useHandCursor: true });
    geri.on("pointerdown", () => {
      Sesler.ac();
      this.scene.start("KarsilamaSahnesi");
    });

    // Harf grubu seçici (öğretmenin isteği): 1. grup ... 5. grup. Gruba dokununca altında o grubun
    // harfleri çıkar. Henüz hazır olmayan gruplar ve harfleri silik, "Yakında" yazılı.
    this.seviyePaneli = null;
    if (!this.secilenHarf) this.secilenHarf = HARFLER[0].kucuk;
    if (!this.gosterilenGrup) this.gosterilenGrup = HARFLER.find((h) => h.kucuk === this.secilenHarf).grup;
    this.harfCizimi = this.add.graphics();
    const gruplar = [...new Set(HARFLER.map((h) => h.grup))];
    this.grupDugmeleri = gruplar.map((grup, i) => {
      const x = 640 + (i - (gruplar.length - 1) / 2) * 200;
      const y = 140;
      const hazir = grup <= MENU_HAZIR_GRUP;
      const kap = this.add.container(x, y).setDepth(1);
      kap.add(doodleYazi(this, 0, hazir ? -2 : -10, `${grup}. grup`, 28).setOrigin(0.5));
      if (!hazir) {
        kap.add(this.add.text(0, 16, "Yakında", { fontFamily: "Andika", fontSize: "18px", color: "#6b6b6b" }).setOrigin(0.5));
      }
      const alan = this.add.rectangle(x, y, 176, 72).setInteractive({ useHandCursor: true });
      alan.on("pointerdown", () => {
        if (this.gosterilenGrup === grup) return;
        Sesler.ac();
        Sesler.nota(660, 0, 0.08, 0.12);
        this.gosterilenGrup = grup;
        this.harfSirasiKur();
        this.harfleriCiz();
      });
      return { grup, x, y, hazir };
    });
    this.harfSirasi = this.add.container(0, 0).setDepth(1);
    this.harfSirasiKur();
    // Etiket süzgeci: hepsi / harf / hece (harf ve hece birlikte seçilebilir; hiçbiri = hepsi)
    if (!this.secilenEtiketler) this.secilenEtiketler = [];
    this.etiketDugmeleri = ["hepsi", "harf", "hece"].map((etiket, i) => {
      const x = 900 + i * 100;
      const y = 232;
      this.add.text(x, y, etiket, {
        fontFamily: "Andika", fontSize: "24px", color: "#2b2b2b",
      }).setOrigin(0.5).setDepth(1);
      const alan = this.add.rectangle(x, y, 96, 64).setInteractive({ useHandCursor: true });
      alan.on("pointerdown", () => {
        const once = this.secilenEtiketler;
        if (etiket === "hepsi") {
          if (!once.length) return;
          this.secilenEtiketler = [];
        } else {
          this.secilenEtiketler = once.includes(etiket) ? once.filter((e) => e !== etiket) : [...once, etiket];
        }
        Sesler.ac();
        Sesler.nota(660, 0, 0.08, 0.12);
        this.harfleriCiz();
        this.sayfa = 0;
        this.sayfayiKur();
      });
      return { etiket, x, y };
    });
    this.harfleriCiz();

    // Oyun kartları: sayfada 8 kart (4'erli iki sıra). Sayfalar oklarla ya da parmağı
    // sağa/sola kaydırarak değişir. Hazır oyunlar önce, "Yakında" olanlar sonra gelir.
    if (this.sayfa === undefined) this.sayfa = 0;
    this.kartlar = this.add.container(0, 0);
    this.solOk = this.okYap(52, -1);
    this.sagOk = this.okYap(1228, 1);
    this.sayfaYazisi = this.add.text(640, 690, "", {
      fontFamily: "Andika", fontSize: "22px", color: "#6b6b6b",
    }).setOrigin(0.5);
    this.input.on("pointerup", (p) => {
      if (this.seviyePaneli) return;
      const dx = p.upX - p.downX;
      if (Math.abs(dx) > 90 && Math.abs(p.upY - p.downY) < 80 && p.downY > 290) this.sayfaDegistir(dx < 0 ? 1 : -1);
    });
    this.sayfayiKur();
  }

  // Sol/sağ ok düğmesi (büyük dokunma alanı)
  okYap(x, yon) {
    const g = this.add.graphics();
    g.fillStyle(0xffe680, 1);
    g.fillCircle(0, 0, 32);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.strokeCircle(0, 0, 32);
    g.fillStyle(0x2b2b2b, 1);
    g.fillTriangle(yon * 14, 0, -yon * 9, -14, -yon * 9, 14);
    const ok = this.add.container(x, 475, [g]).setSize(96, 150).setInteractive({ useHandCursor: true });
    ok.on("pointerdown", () => this.sayfaDegistir(yon));
    return ok;
  }

  sayfaDegistir(yon) {
    const yeni = Phaser.Math.Clamp(this.sayfa + yon, 0, this.sayfaSayisi - 1);
    if (yeni === this.sayfa) return;
    Sesler.ac();
    Sesler.nota(yon > 0 ? 700 : 560, 0, 0.08, 0.1);
    this.sayfa = yeni;
    this.sayfayiKur(yon);
  }

  // Seçilen etiketlere göre oyunlar
  oyunListesi() {
    const secili = this.secilenEtiketler;
    if (!secili.length) return PLANLANAN_OYUNLAR;
    // Oyunun etiketleri seçilenlerle tam aynı olmalı (harf seçiliyse harf + hece olanlar çıkmaz)
    return PLANLANAN_OYUNLAR.filter((o) => {
      const etiketler = o.etiketler || [];
      return etiketler.length === secili.length && secili.every((e) => etiketler.includes(e));
    });
  }

  sayfayiKur(yon = 0) {
    this.kartlar.removeAll(true);
    const liste = this.oyunListesi();
    this.sayfaSayisi = Math.max(1, Math.ceil(liste.length / MENU_SAYFA_KART));
    if (this.sayfa >= this.sayfaSayisi) this.sayfa = 0;
    const ilk = this.sayfa * MENU_SAYFA_KART;
    liste.slice(ilk, ilk + MENU_SAYFA_KART).forEach((oyun, i) => {
      const x = 640 + ((i % 4) - 1.5) * 270;
      const y = 380 + Math.floor(i / 4) * 190;
      const hazir = Boolean(MINI_OYUNLAR[oyun.ad]);
      // Öğretmenin kuralı: hece/kelime oyunu bu harfe kadar öğrenilen harflerle kurulamıyorsa
      // (a ve n'de hece yok) kart soluk, "Bu harfte yok"
      const olur = !hazir || miniOyunOlur(oyun.ad, this.secilenHarf);
      const acik = hazir && olur;
      const kart = this.add.container(x, y, [
        this.add.image(0, 0, "oyun-karti"),
        this.add.image(-3, -44, `simge-${oyun.ad}`).setScale(0.56),
        doodleYazi(this, -3, acik ? 6 : -6, oyun.baslik, oyun.baslik.length > 15 ? 24 : 28).setOrigin(0.5),
      ]).setSize(232, 152);
      // Etiketler (harf / hece): kartın altında küçük renkli rozetler
      const etiketler = oyun.etiketler || [];
      etiketler.forEach((e, j) => {
        const ex = (j - (etiketler.length - 1) / 2) * 74 - 3;
        const ey = acik ? 50 : 60;
        const g = this.add.graphics();
        g.fillStyle(ETIKET_RENKLERI[e] || 0xdddddd, 1);
        g.fillRoundedRect(ex - 33, ey - 14, 66, 28, 14);
        g.lineStyle(3, 0x2b2b2b, 1);
        g.strokeRoundedRect(ex - 33, ey - 14, 66, 28, 14);
        kart.add([g, this.add.text(ex, ey, e, {
          fontFamily: "Andika", fontSize: "20px", color: "#2b2b2b",
        }).setOrigin(0.5)]);
      });
      if (hazir && olur) {
        kart.setInteractive({ useHandCursor: true });
        kart.on("pointerdown", () => this.seviyeSor(oyun));
      } else if (hazir) {
        kart.add(this.add.text(-3, 28, "Bu harfte yok", {
          fontFamily: "Andika", fontSize: "22px", color: "#8a7f6a",
        }).setOrigin(0.5));
        kart.setAlpha(0.45);
      } else {
        kart.add(this.add.text(-3, 30, "Yakında", {
          fontFamily: "Andika", fontSize: "24px", color: "#9a8f7a",
        }).setOrigin(0.5));
        kart.setAlpha(0.6);
      }
      this.kartlar.add(kart);
    });
    // Sayfa değişince kartlar kayarak gelir
    if (yon) {
      this.kartlar.setX(yon * 160).setAlpha(0);
      this.tweens.add({ targets: this.kartlar, x: 0, alpha: 1, duration: 220, ease: "Cubic.Out" });
    }
    this.solOk.setAlpha(this.sayfa > 0 ? 1 : 0.25);
    this.sagOk.setAlpha(this.sayfa < this.sayfaSayisi - 1 ? 1 : 0.25);
    this.sayfaYazisi.setText(`${this.sayfa + 1} / ${this.sayfaSayisi}`);
  }

  // Gösterilen grubun harfleri (ikinci sıra, solda). Hazır olmayan grupta silik, dokunulmaz.
  harfSirasiKur() {
    this.harfSirasi.removeAll(true);
    const hazir = this.gosterilenGrup <= MENU_HAZIR_GRUP;
    const harfler = HARFLER.filter((h) => h.grup === this.gosterilenGrup);
    this.harfDugmeleri = harfler.map((h, i) => {
      const x = 150 + i * 88;
      const y = 232;
      const yazi = this.add.text(x, y, h.kucuk, {
        fontFamily: "Andika", fontSize: "48px", color: "#ffffff",
        stroke: "#3b2a1a", strokeThickness: 8, padding: { x: 4, y: 4 },
      }).setAlpha(hazir ? 1 : 0.4);
      boyaliOrtala(titret(yazi, 1.5));
      this.harfSirasi.add(yazi);
      if (hazir) {
        const alan = this.add.circle(x, y, 44).setInteractive({ useHandCursor: true });
        alan.on("pointerdown", () => {
          Sesler.ac();
          Sesler.nota(660, 0, 0.08, 0.12);
          this.secilenHarf = h.kucuk;
          this.harfleriCiz();
          this.sayfayiKur(); // bazı oyunlar bu harfte oynanamaz (miniOyunOlur)
        });
        this.harfSirasi.add(alan);
      }
      return { harf: h.kucuk, x, y, hazir };
    });
    if (!hazir) {
      const x = 150 + harfler.length * 88;
      this.harfSirasi.add(this.add.text(x, 232, "Yakında", {
        fontFamily: "Andika", fontSize: "26px", color: "#9a8f7a",
      }).setOrigin(0, 0.5));
    }
  }

  // Seçilen grup ve harf sarı, öbürleri soluk mavi; hazır olmayanlar silik
  harfleriCiz() {
    const g = this.harfCizimi;
    g.clear();
    for (const d of this.grupDugmeleri) {
      const secili = d.grup === this.gosterilenGrup;
      g.fillStyle(secili ? 0xffe680 : 0xc9ecff, d.hazir ? 1 : 0.4);
      g.fillRoundedRect(d.x - 80, d.y - 30, 160, 60, 24);
      g.lineStyle(secili ? 6 : 4, 0x2b2b2b, d.hazir ? 1 : 0.35);
      g.strokeRoundedRect(d.x - 80, d.y - 30, 160, 60, 24);
    }
    for (const d of this.harfDugmeleri) {
      const secili = d.harf === this.secilenHarf;
      g.fillStyle(secili ? 0xffe680 : 0xc9ecff, d.hazir ? 1 : 0.4);
      g.fillCircle(d.x, d.y, 38);
      g.lineStyle(secili ? 6 : 4, 0x2b2b2b, d.hazir ? 1 : 0.35);
      g.strokeCircle(d.x, d.y, 38);
    }
    // Etiket süzgeci: seçili olan kendi renginde ve kalın çizgili, öbürleri beyaz
    for (const d of this.etiketDugmeleri || []) {
      const secili = d.etiket === "hepsi" ? !this.secilenEtiketler.length : this.secilenEtiketler.includes(d.etiket);
      g.fillStyle(secili ? (ETIKET_RENKLERI[d.etiket] || 0xffe680) : 0xffffff, 1);
      g.fillRoundedRect(d.x - 42, d.y - 20, 84, 40, 20);
      g.lineStyle(secili ? 5 : 3, 0x2b2b2b, 1);
      g.strokeRoundedRect(d.x - 42, d.y - 20, 84, 40, 20);
    }
  }

  // Oyun kartına dokununca en son seviye sorulur (öğretmenin isteği): 1, 2, 3 ya da Vazgeç
  seviyeSor(oyun) {
    Sesler.ac();
    Sesler.nota(660, 0, 0.08, 0.12);
    if (this.seviyePaneli) this.seviyePaneli.destroy();
    const perde = this.add.rectangle(640, 360, 1280, 720, 0x2b2b2b, 0.35).setInteractive();
    const g = this.add.graphics();
    g.fillStyle(0xfbf7ec, 1);
    g.fillRoundedRect(-300, -170, 600, 340, 30);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeRoundedRect(-300, -170, 600, 340, 30);
    const panel = this.add.container(640, 360, [g,
      doodleYazi(this, 0, -120, oyun.baslik, 34, "mavi").setOrigin(0.5),
      doodleYazi(this, 0, -62, "Seviye seç", 30).setOrigin(0.5)]);
    [1, 2, 3].forEach((seviye, i) => {
      const x = (i - 1) * 150;
      const d = this.add.graphics();
      d.fillStyle(seviye === this.secilenSeviye ? 0xffe680 : 0xc9ecff, 1);
      d.fillCircle(x, 30, 52);
      d.lineStyle(5, 0x2b2b2b, 1);
      d.strokeCircle(x, 30, 52);
      const alan = this.add.circle(x, 30, 56).setInteractive({ useHandCursor: true });
      alan.on("pointerdown", () => {
        this.secilenSeviye = seviye;
        this.oyunuAc(oyun.ad);
      });
      panel.add([d, this.add.text(x, 30, String(seviye), {
        fontFamily: "Andika", fontSize: "48px", color: "#2b2b2b",
      }).setOrigin(0.5), alan]);
    });
    const vazgec = this.add.text(0, 128, "Vazgeç", {
      fontFamily: "Andika", fontSize: "26px", color: "#6b6b6b", padding: { x: 20, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    panel.add(vazgec);
    this.seviyePaneli = this.add.container(0, 0, [perde, panel]).setDepth(2000);
    const kapat = () => {
      Sesler.nota(560, 0, 0.08, 0.1);
      this.seviyePaneli.destroy();
      this.seviyePaneli = null;
    };
    vazgec.on("pointerdown", kapat);
    perde.on("pointerdown", kapat);
    panel.setScale(0.8);
    this.tweens.add({ targets: panel, scale: 1, duration: 180, ease: "Back.Out" });
  }

  oyunuAc(ad) {
    Sesler.ac();
    Sesler.pling();
    this.scene.start(ad, { harf: this.secilenHarf, seviye: this.secilenSeviye, donus: "MiniOyunlarSahnesi" });
  }
}
