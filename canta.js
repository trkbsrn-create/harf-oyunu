// Karakterin çantası (envanter). İçindekiler hiçbir yere kaydedilmez:
// sayfa yenilenince oyun baştan başlar ve çanta boşalır.

const Canta = {
  BOYUT: 8, // çantadaki kutucuk sayısı
  esyalar: [],

  // Aynı harfin tohumu zaten varsa tekrar eklenmez. Eklendiyse true döner.
  // tekrarEdilecek: çocuk harfi söyleyemedi, oyun kendiliğinden onayladı.
  tohumEkle(harf, tekrarEdilecek = false) {
    if (this.esyalar.some((e) => e.tur === "tohum" && e.harf === harf)) return false;
    if (this.esyalar.length >= this.BOYUT) return false;
    this.esyalar.push({ tur: "tohum", harf, tekrarEdilecek });
    return true;
  },
};
