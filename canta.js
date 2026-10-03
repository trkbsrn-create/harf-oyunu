// Karakterin çantası (envanter). İçindekiler hiçbir yere kaydedilmez:
// sayfa yenilenince oyun baştan başlar ve çanta boşalır.

const Canta = {
  BOYUT: 8, // çantadaki kutucuk sayısı
  esyalar: [],
  // Sihirli su şişesindeki damlalar: harf -> damla sayısı. Her harf için en çok
  // DAMLA_SINIRI damla (bir tohumu büyütmeye yetecek kadar).
  damlalar: {},
  DAMLA_SINIRI: 3,

  // Aynı harfin tohumu zaten varsa tekrar eklenmez. Eklendiyse true döner.
  // tekrarEdilecek: çocuk harfi söyleyemedi, oyun kendiliğinden onayladı.
  tohumEkle(harf, tekrarEdilecek = false) {
    if (this.esyalar.some((e) => e.tur === "tohum" && e.harf === harf)) return false;
    if (this.esyalar.length >= this.BOYUT) return false;
    this.esyalar.push({ tur: "tohum", harf, tekrarEdilecek });
    return true;
  },

  siseVarMi() {
    return this.esyalar.some((e) => e.tur === "sise");
  },

  damlaSayisi(harf) {
    return this.damlalar[harf] || 0;
  },

  // Harfin şişesine bir damla ekler. Şişe çantada yoksa ilk damlayla birlikte gelir.
  // Şişe o harf için doluysa false döner.
  damlaEkle(harf) {
    if (this.damlaSayisi(harf) >= this.DAMLA_SINIRI) return false;
    if (!this.siseVarMi()) this.esyalar.push({ tur: "sise" });
    this.damlalar[harf] = this.damlaSayisi(harf) + 1;
    return true;
  },

  // Harfin damlasından birini kullanır (tohum sulanınca). Damla yoksa false döner.
  damlaKullan(harf) {
    if (this.damlaSayisi(harf) <= 0) return false;
    this.damlalar[harf]--;
    return true;
  },

  // Yelkenli parçaları: bulutların üstünde alınınca çantaya girer (ad: govde, direk ...).
  // alinanParcalar: o harfin parçası alındı mı (bulutta balon bir daha çıkmasın).
  alinanParcalar: {},
  parcaEkle(harf, ad) {
    this.alinanParcalar[harf] = true;
    this.esyalar.push({ tur: "parca", harf, ad });
  },

  // Sıradaki eşyayı çantadan çıkarır ve verir (ör. tohum tarlaya ekilince).
  cikar(sira) {
    return this.esyalar.splice(sira, 1)[0];
  },
};
