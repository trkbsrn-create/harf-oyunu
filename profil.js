// Profil ve karne (öğretmenin isteği). Her çocuk ilk sayfada hayvan resmi + takma adla girer (takma adı veli yazar;
// çocuklar veli gözetiminde oynar). Oyundaki doğru/yanlışlar ve harf sesi sonuçları çocuğun
// profiline yazılır; veli şifreli kapıdan (karnebak) karneye bakar, yalnızca eksikler gösterilir.
// Veri yalnızca bu cihazda (localStorage) durur, sunucuya gitmez. Oyunun kaldığı yer (çanta,
// sandıklar) saklanmaz; yalnızca profil ve istatistik (öğretmenin izni).

const PROFIL_HAYVANLARI = ["resim-kedi", "ari", "resim-aslan", "resim-panda", "resim-tavsan",
  "resim-kurbaga", "resim-fil", "tilki"];
const VELI_SIFRESI = "karnebak";
const PROFIL_EN_COK = 7; // ekranda 2 sıra x 4 kart ("+" kartı dahil)

const Profil = {
  ANAHTAR: "harf-avcisi-profiller",
  aktifId: null,

  oku() {
    try {
      const veri = JSON.parse(localStorage.getItem(this.ANAHTAR));
      if (veri && veri.profiller) return veri;
    } catch (e) { /* bozuk ya da kapalı */ }
    return { profiller: {} };
  },

  yaz(veri) {
    try { localStorage.setItem(this.ANAHTAR, JSON.stringify(veri)); } catch (e) { /* gizli sekme */ }
  },

  liste() {
    return Object.entries(this.oku().profiller).map(([id, p]) => ({ id, ...p }))
      .sort((a, b) => a.olusma - b.olusma);
  },

  ekle(hayvan, ad) {
    const veri = this.oku();
    const id = `p${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
    veri.profiller[id] = { hayvan, ad, olusma: Date.now(), harfler: {}, oyunlar: {} };
    this.yaz(veri);
    return id;
  },

  sil(id) {
    const veri = this.oku();
    delete veri.profiller[id];
    this.yaz(veri);
    if (this.aktifId === id) this.sec(null);
  },

  // Seçili profil sayfa yenilense de (Oyunu yeniden başlat) korunur; sekme kapanınca seçim gider
  sec(id) {
    this.aktifId = id;
    try {
      if (id) sessionStorage.setItem("harfAvcisiAktifProfil", id);
      else sessionStorage.removeItem("harfAvcisiAktifProfil");
    } catch (e) { /* önemli değil */ }
  },

  // Aktif profilde değişiklik (profil seçili değilse hiçbir şey yapmaz)
  degistir(islem) {
    if (!this.aktifId) return;
    const veri = this.oku();
    const p = veri.profiller[this.aktifId];
    if (!p) return;
    islem(p);
    this.yaz(veri);
  },

  harfKaydi(p, harf) {
    p.harfler[harf] = p.harfler[harf] || { dogru: 0, yanlis: 0, ses1: 0, ses2: 0, sesTekrar: 0 };
    return p.harfler[harf];
  },

  dogru(harf) { this.degistir((p) => { this.harfKaydi(p, harf).dogru++; }); },
  yanlis(harf) { this.degistir((p) => { this.harfKaydi(p, harf).yanlis++; }); },

  // Harf sesi: 1 kendisi söyledi, 2 ipucuyla söyledi, 3 oyun onayladı (tekrar edilecek)
  sesSonucu(harf, adim) {
    this.degistir((p) => {
      const k = this.harfKaydi(p, harf);
      if (adim === 1) k.ses1++;
      else if (adim === 2) k.ses2++;
      else k.sesTekrar++;
    });
  },

  oyunSonu(ad, yildiz, basarili) {
    this.degistir((p) => {
      const o = p.oyunlar[ad] = p.oyunlar[ad] || { oynandi: 0, kazandi: 0, kaybetti: 0, enIyiYildiz: 0 };
      o.oynandi++;
      if (basarili) o.kazandi++;
      else o.kaybetti++;
      o.enIyiYildiz = Math.max(o.enIyiYildiz, yildiz);
    });
  },

  // Çocuğa gösterilen: sesi denenmiş harfler ve toplam yıldız
  ogrendigiHarfler(p) {
    return HARFLER.map((h) => h.kucuk).filter((h) => {
      const k = p.harfler[h];
      return k && k.ses1 + k.ses2 + k.sesTekrar > 0;
    });
  },

  toplamYildiz(p) {
    return Object.values(p.oyunlar).reduce((t, o) => t + o.enIyiYildiz, 0);
  },
};

try { Profil.aktifId = sessionStorage.getItem("harfAvcisiAktifProfil") || null; } catch (e) { /* yok */ }

// Ekranın üstünde yazı sorar (takma ad, şifre). Telefonda klavye açılsın diye gerçek bir giriş kutusu.
// Tamam: yazılan (boşlukları kırpılmış), Vazgeç: null.
function metinSor(baslik, { sifre = false, enUzun = 14 } = {}) {
  return new Promise((sonuc) => {
    const zemin = document.createElement("div");
    zemin.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;"
      + "align-items:center;justify-content:center;z-index:50";
    const dugme = "font:inherit;font-size:22px;padding:8px 20px;border:3px solid #2b2b2b;border-radius:14px;";
    zemin.innerHTML = `<form style="background:#fffdf6;border:4px solid #2b2b2b;border-radius:22px;
      padding:22px 26px;font-family:Andika,sans-serif;text-align:center;max-width:90vw">
      <div style="font-size:24px;margin-bottom:14px"></div>
      <input autocomplete="off" autocapitalize="off" style="font:inherit;font-size:28px;padding:8px 12px;
        border:3px solid #2b2b2b;border-radius:12px;width:min(340px,70vw)">
      <div style="margin-top:16px;display:flex;gap:14px;justify-content:center">
        <button type="button" style="${dugme}background:#fff">Vazgeç</button>
        <button type="submit" style="${dugme}background:#ffd34d">Tamam</button>
      </div></form>`;
    zemin.querySelector("div").textContent = baslik;
    const girdi = zemin.querySelector("input");
    girdi.type = sifre ? "password" : "text";
    girdi.maxLength = enUzun;
    // Oyunun klavye dinleyicisi (boşluk, ok tuşları) yazıyı engellemesin
    girdi.addEventListener("keydown", (e) => e.stopPropagation());
    girdi.addEventListener("keyup", (e) => e.stopPropagation());
    // Kutuya yapılan dokunuşlar alttaki oyuna geçmesin (yoksa alttaki resim de basılmış sayılıyordu:
    // "Tamam"a basınca kutu yeniden açılıyor, ekran her basışta biraz daha kararıyordu)
    for (const olay of ["pointerdown", "pointerup", "mousedown", "mouseup", "touchstart", "touchend", "click"]) {
      zemin.addEventListener(olay, (e) => e.stopPropagation());
    }
    const bitir = (deger) => { zemin.remove(); sonuc(deger); };
    zemin.querySelector("form").onsubmit = (e) => { e.preventDefault(); bitir(girdi.value.trim()); };
    zemin.querySelector('button[type="button"]').onclick = () => bitir(null);
    document.body.appendChild(zemin);
    setTimeout(() => girdi.focus(), 50);
  });
}

// Profil kartı: hayvan resmi, takma ad; ayrintili ise altında öğrendiği harfler ve yıldızları
function profilKartiYap(sahne, x, y, p, en = 230, boy = 250, ayrintili = true) {
  const kap = sahne.add.container(x, y);
  const g = sahne.add.graphics();
  g.fillStyle(0x000000, 0.12);
  g.fillRoundedRect(-en / 2 + 6, -boy / 2 + 8, en, boy, 22);
  g.fillStyle(0xfffdf6, 1);
  g.fillRoundedRect(-en / 2, -boy / 2, en, boy, 22);
  g.lineStyle(4, 0x2b2b2b, 1);
  g.strokeRoundedRect(-en / 2, -boy / 2, en, boy, 22);
  kap.add(g);
  kap.cizim = g;
  const resim = sahne.add.image(0, -boy / 2 + (ayrintili ? 78 : boy / 2), p.hayvan);
  const kutu = ayrintili ? 120 : boy - 16;
  resim.setScale(Math.min(kutu / resim.width, kutu / resim.height));
  if (!ayrintili) resim.setX(-en / 2 + boy / 2);
  kap.add(resim);
  const ad = sahne.add.text(ayrintili ? 0 : -en / 2 + boy + 8, ayrintili ? -boy / 2 + 160 : 0, p.ad, {
    fontFamily: "Andika", fontSize: ayrintili ? "28px" : "24px", color: "#2b2b2b",
  }).setOrigin(ayrintili ? 0.5 : 0, 0.5);
  kap.add(ad);
  if (ayrintili) {
    const harfler = Profil.ogrendigiHarfler(p);
    harfler.forEach((h, i) => {
      const hx = (i - (harfler.length - 1) / 2) * 30;
      kap.add(sahne.add.text(hx, boy / 2 - 52, h, {
        fontFamily: "Andika", fontSize: "26px", color: "#ffffff", stroke: "#3b2a1a", strokeThickness: 5,
      }).setOrigin(0.5));
    });
    kap.add(sahne.add.image(-18, boy / 2 - 20, "yildiz").setScale(0.32));
    kap.add(sahne.add.text(4, boy / 2 - 20, String(Profil.toplamYildiz(p)), {
      fontFamily: "Andika", fontSize: "24px", color: "#2b2b2b",
    }).setOrigin(0, 0.5));
  }
  kap.setSize(en, boy).setInteractive({ useHandCursor: true });
  return kap;
}

// "Kim oynuyor?" penceresi (öğretmenin isteği): ilk ekranda "Profil oluştur" düğmesiyle ya da adadaki
// profil resmine dokununca açılır. Telefondaki profiller (hayvan + takma ad) ve "+" kartı; dokunulan
// profil seçilir (Profil.sec), pencere kapanır, secince() çağrılır. Kartın köşesindeki "x" profili
// siler (yanlış açılan ya da vazgeçilen profil için; onay sorulur). Oyun da mini oyunlar da seçili profille açılır.
class ProfilPaneli {
  constructor(sahne, secince) {
    this.sahne = sahne;
    this.secince = secince;
    this.kap = sahne.add.container(640, 375).setDepth(60).setVisible(false);
    this.kartlar = [];
    this.secici = null;
    this.adSoruluyor = false;
    const g = sahne.add.graphics();
    g.fillStyle(0x000000, 0.35);
    g.fillRect(-640, -375, 1280, 720);
    // Arka plan dokunuşu alttaki düğmelere geçmesin
    g.setInteractive(new Phaser.Geom.Rectangle(-640, -375, 1280, 720), Phaser.Geom.Rectangle.Contains);
    g.fillStyle(0xfffdf6, 1);
    g.fillRoundedRect(-430, -230, 860, 460, 26);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeRoundedRect(-430, -230, 860, 460, 26);
    const kapat = sahne.add.container(0, 190, [
      sahne.add.image(0, 0, "incele-dugmesi").setScale(0.9),
      doodleYazi(sahne, 0, -3, "Kapat", 28).setOrigin(0.5),
    ]).setSize(200, 80).setInteractive({ useHandCursor: true });
    kapat.on("pointerdown", () => { if (!this.secici && !this.adSoruluyor) this.kapat(); });
    this.kap.add([g, doodleYazi(sahne, 0, -195, "Kim oynuyor?", 40, "mavi").setOrigin(0.5), kapat]);
  }

  ac() {
    if (this.kap.visible) return;
    Sesler.ac();
    Sesler.pling();
    this.ciz();
    this.kap.setVisible(true).setAlpha(0);
    this.sahne.tweens.add({ targets: this.kap, alpha: 1, duration: 200 });
  }

  kapat() {
    this.seciciKapat();
    this.kap.setVisible(false);
  }

  ciz() {
    for (const k of this.kartlar) k.destroy();
    this.kartlar = [];
    const profiller = Profil.liste();
    if (Profil.aktifId && !profiller.some((p) => p.id === Profil.aktifId)) Profil.sec(null);
    const ogeler = [...profiller];
    if (profiller.length < PROFIL_EN_COK) ogeler.push(null); // "+" kartı
    const satir = Math.ceil(ogeler.length / 4);
    ogeler.forEach((p, i) => {
      const sira = Math.floor(i / 4);
      const satirdaki = Math.min(4, ogeler.length - sira * 4);
      const x = ((i % 4) - (satirdaki - 1) / 2) * 190;
      const y = -10 - (satir - 1) * 82 + sira * 164;
      const kart = p ? profilKartiYap(this.sahne, x, y, p) : this.artiKarti(x, y);
      kart.setScale(satir > 1 ? 0.6 : 0.68);
      if (p && Profil.aktifId === p.id) kart.setScale(kart.scale * 1.1);
      kart.on("pointerdown", () => (p ? this.sec(p) : this.hayvanSec()));
      if (p) kart.add(this.silDugmesi(p));
      this.kap.add(kart);
      this.kartlar.push(kart);
    });
  }

  // Kartın sağ üst köşesinde kırmızı "x": profili siler (onay sorulur)
  silDugmesi(p) {
    const s = this.sahne;
    const g = s.add.graphics();
    g.fillStyle(0xff8a7a, 1);
    g.fillCircle(0, 0, 26);
    g.lineStyle(4, 0x2b2b2b, 1);
    g.strokeCircle(0, 0, 26);
    g.lineStyle(6, 0x2b2b2b, 1);
    g.lineBetween(-10, -10, 10, 10);
    g.lineBetween(10, -10, -10, 10);
    const d = s.add.container(100, -110, [g]).setSize(64, 64).setInteractive({ useHandCursor: true });
    d.on("pointerdown", (isaretci, x, y, olay) => {
      olay.stopPropagation(); // kart seçilmesin
      if (this.secici || this.adSoruluyor) return;
      if (!window.confirm(`"${p.ad}" profili ve karnesi silinsin mi?`)) return;
      Profil.sil(p.id);
      this.ciz();
      if (this.secince) this.secince(null);
    });
    return d;
  }

  artiKarti(x, y) {
    const kap = this.sahne.add.container(x, y);
    const g = this.sahne.add.graphics();
    g.fillStyle(0xffffff, 0.6);
    g.fillRoundedRect(-115, -125, 230, 250, 22);
    g.lineStyle(4, 0x2b2b2b, 0.6);
    g.strokeRoundedRect(-115, -125, 230, 250, 22);
    g.lineStyle(12, 0x8fd16a, 1);
    g.lineBetween(-44, 0, 44, 0);
    g.lineBetween(0, -44, 0, 44);
    kap.add(g);
    return kap.setSize(230, 250).setInteractive({ useHandCursor: true });
  }

  sec(p) {
    if (this.secici || this.adSoruluyor) return;
    Sesler.pling();
    Profil.sec(p.id);
    this.kapat();
    if (this.secince) this.secince(p);
  }

  // Yeni profil: önce hayvan seçilir, sonra veli takma adı yazar
  hayvanSec() {
    if (this.secici || this.adSoruluyor) return;
    Sesler.ac();
    const s = this.sahne;
    const kap = s.add.container(0, 0).setDepth(100);
    const g = s.add.graphics();
    g.fillStyle(0x000000, 0.35);
    g.fillRect(0, 0, 1280, 720);
    g.fillStyle(0xfffdf6, 1);
    g.fillRoundedRect(190, 110, 900, 520, 26);
    g.lineStyle(5, 0x2b2b2b, 1);
    g.strokeRoundedRect(190, 110, 900, 520, 26);
    // Arka plan dokunuşları alttaki düğmelere geçmesin
    g.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720), Phaser.Geom.Rectangle.Contains);
    kap.add(g);
    PROFIL_HAYVANLARI.forEach((ad, i) => {
      const x = 640 + ((i % 4) - 1.5) * 200;
      const y = 250 + Math.floor(i / 4) * 200;
      const resim = s.add.image(x, y, ad);
      resim.setScale(Math.min(160 / resim.width, 160 / resim.height));
      resim.setInteractive({ useHandCursor: true });
      resim.on("pointerdown", () => this.adSor(ad));
      kap.add(resim);
    });
    const vazgec = s.add.container(640, 580, [
      s.add.image(0, 0, "incele-dugmesi").setScale(0.9),
      doodleYazi(s, 0, -3, "Vazgeç", 28).setOrigin(0.5),
    ]).setSize(200, 96).setInteractive({ useHandCursor: true });
    vazgec.on("pointerdown", () => { if (!this.adSoruluyor) this.seciciKapat(); });
    kap.add(vazgec);
    this.secici = kap;
  }

  seciciKapat() {
    if (this.secici) this.secici.destroy();
    this.secici = null;
  }

  async adSor(hayvan) {
    if (this.adSoruluyor) return; // kutu açıkken ikinci kez açılmasın
    this.adSoruluyor = true;
    const ad = await metinSor("Takma ad (veli yazar)");
    this.adSoruluyor = false;
    if (!this.kap.active) return; // bu arada sahne değişti
    this.seciciKapat();
    if (!ad) return;
    // Yeni profil seçili gelir, pencere kapanır
    const id = Profil.ekle(hayvan, ad);
    this.sec(Profil.liste().find((x) => x.id === id));
  }

  acikMi() {
    return this.kap.visible || !!this.secici || this.adSoruluyor;
  }
}

// Karne (veli ve öğretmen için; şifreli kapıdan girilir). Yalnızca durum ve eksikler, öneri yok.
// Yetişkin içindir: öğrenilmemiş harfli yazı kuralı burada uygulanmaz.
class KarneSahnesi extends Phaser.Scene {
  constructor() {
    super("KarneSahnesi");
  }

  preload() {
    for (const ad of [...PROFIL_HAYVANLARI, "doku-kagit", "incele-dugmesi", "yildiz"]) {
      this.load.svg(ad, `gorseller/${ad}.svg`);
    }
  }

  create() {
    this.silOnay = false;
    this.icerik = null;
    this.add.tileSprite(0, 0, 1280, 720, "doku-kagit").setOrigin(0);
    this.geriDugmesi = this.dugme(1176, 48, "Geri", () => this.scene.start("KarsilamaSahnesi"));
    const profiller = Profil.liste();
    if (!profiller.length) {
      doodleYazi(this, 640, 360, "Henüz profil yok", 48).setOrigin(0.5);
      return;
    }
    // Solda profiller; dokununca sağda o çocuğun karnesi
    this.solKartlar = profiller.map((p, i) => {
      const kart = profilKartiYap(this, 150, 120 + i * 84, p, 260, 72, false);
      kart.on("pointerdown", () => this.goster(p.id));
      return kart;
    });
    this.goster(profiller[0].id);
  }

  dugme(x, y, yazi, islem, en = 200) {
    const d = this.add.container(x, y, [
      this.add.image(0, 0, "incele-dugmesi").setDisplaySize(en, 64),
      doodleYazi(this, 0, -3, yazi, 26).setOrigin(0.5),
    ]).setSize(en, 64).setInteractive({ useHandCursor: true });
    d.on("pointerdown", islem);
    return d;
  }

  goster(id) {
    const profiller = Profil.liste();
    const p = profiller.find((x) => x.id === id);
    if (!p) return;
    this.secili = id;
    this.silOnay = false;
    profiller.forEach((x, i) => this.solKartlar[i] && this.solKartlar[i].setAlpha(x.id === id ? 1 : 0.55));
    if (this.icerik) this.icerik.destroy();
    const kap = this.icerik = this.add.container(0, 0);
    const yazi = (x, y, metin, boy = 24, renk = "#2b2b2b") => {
      const t = this.add.text(x, y, metin, { fontFamily: "Andika", fontSize: `${boy}px`, color: renk });
      kap.add(t);
      return t;
    };
    yazi(320, 30, `Karne: ${p.ad}`, 40);
    // Harfler: sesi ve mini oyunlardaki doğru/yanlış; eksikse kırmızı "Tekrar edilecek"
    yazi(320, 100, "Harf", 22, "#6b6b6b");
    yazi(400, 100, "Sesi", 22, "#6b6b6b");
    yazi(640, 100, "Mini oyunlar (doğru / yanlış)", 22, "#6b6b6b");
    const harfler = HARFLER.filter((h) => h.grup === 1).map((h) => h.kucuk);
    harfler.forEach((h, i) => {
      const y = 140 + i * 50;
      const k = p.harfler[h] || { dogru: 0, yanlis: 0, ses1: 0, ses2: 0, sesTekrar: 0 };
      const ses = k.ses1 ? "Kendisi söyledi" : k.ses2 ? "İpucuyla söyledi" : k.sesTekrar ? "Söyleyemedi" : "Henüz denenmedi";
      const eksik = (k.sesTekrar > 0 && !k.ses1) || (k.yanlis >= 3 && k.yanlis > k.dogru / 2);
      yazi(330, y, h, 32);
      yazi(400, y + 4, ses, 24, k.sesTekrar && !k.ses1 && !k.ses2 ? "#d9473a" : "#2b2b2b");
      yazi(640, y + 4, `${k.dogru} / ${k.yanlis}`, 24);
      if (eksik) yazi(800, y + 4, "Tekrar edilecek", 24, "#d9473a");
    });
    // Zorlandığı oyunlar: en az 2 kez kaybettiği ya da en iyi yıldızı 1 olanlar
    const zor = PLANLANAN_OYUNLAR.filter((o) => {
      const s = p.oyunlar[o.ad];
      return s && (s.kaybetti >= 2 || (s.kazandi > 0 && s.enIyiYildiz <= 1));
    }).map((o) => o.baslik);
    const oynanan = Object.values(p.oyunlar).reduce((t, o) => t + o.oynandi, 0);
    yazi(320, 460, `Oynanan mini oyun: ${oynanan}`, 24);
    yazi(320, 500, "Zorlandığı oyunlar:", 24);
    yazi(560, 500, zor.length ? zor.join(", ") : "yok", 24, zor.length ? "#d9473a" : "#2b2b2b").setWordWrapWidth(680);
    // Düğmeler: karneyi resim olarak kaydet, profili sil (iki kez basınca)
    kap.add(this.dugme(470, 650, "Karneyi kaydet", () => this.kaydet(p), 260));
    const sil = this.dugme(800, 650, "Profili sil", () => {
      if (!this.silOnay) {
        this.silOnay = true;
        sil.list[1].setText("Emin misin?");
        return;
      }
      Profil.sil(p.id);
      this.scene.restart();
    }, 260);
    kap.add(sil);
  }

  // Ekranı resim olarak indirir (veli öğretmene gönderir)
  kaydet(p) {
    this.icerik.list.filter((n) => n.list).forEach((n) => n.setVisible(false)); // düğmeler resme girmesin
    this.geriDugmesi.setVisible(false);
    this.game.renderer.snapshot((resim) => {
      const a = document.createElement("a");
      a.href = resim.src;
      a.download = `karne-${p.ad}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      this.icerik.list.forEach((n) => n.setVisible(true));
      this.geriDugmesi.setVisible(true);
    });
  }
}
