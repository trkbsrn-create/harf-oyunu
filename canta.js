// Karakterin çantası (envanter). İçindekiler sadece bu tarayıcının yerel
// hafızasında (localStorage) saklanır; hiçbir yere gönderilmez.

const Canta = {
  ANAHTAR: "harfAdasi.canta",
  BOYUT: 8, // çantadaki kutucuk sayısı
  esyalar: [],

  yukle() {
    try {
      const kayit = JSON.parse(localStorage.getItem(this.ANAHTAR));
      if (Array.isArray(kayit)) this.esyalar = kayit;
    } catch (e) {
      this.esyalar = []; // hafıza kapalıysa çanta boş başlar
    }
  },

  kaydet() {
    try {
      localStorage.setItem(this.ANAHTAR, JSON.stringify(this.esyalar));
    } catch (e) {
      // Hafızaya yazılamazsa oyun yine de devam eder.
    }
  },

  // Aynı harfin tohumu zaten varsa tekrar eklenmez. Eklendiyse true döner.
  tohumEkle(harf) {
    if (this.esyalar.some((e) => e.tur === "tohum" && e.harf === harf)) return false;
    if (this.esyalar.length >= this.BOYUT) return false;
    this.esyalar.push({ tur: "tohum", harf });
    this.kaydet();
    return true;
  },
};

Canta.yukle();
