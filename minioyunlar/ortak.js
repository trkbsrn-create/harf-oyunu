// Mini oyunların ortak listesi.
//
// Her mini oyun kendi klasöründe durur (minioyunlar/<ad>/oyun.js) ve kendini buraya
// miniOyunKaydet() ile ekler. Mini oyun bir Phaser sahnesidir; açılırken şu bilgiyi alır:
//   { harf: "a", seviye: 1 }
// Bitince sonucu (başardı mı) çağırana bildirir. Kazanınca damla parçası gelir; kaybetmek
// mümkündür (öğretmenin kararı): canlar biterse parça gelmez, "Bir daha dene" çıkar.
//
// PLANLANAN_OYUNLAR: menüde görünen sıra. Henüz yapılmamış olanların kartında "Yakında" yazar.

const PLANLANAN_OYUNLAR = [
  { ad: "damla-yakala", baslik: "Damla Yakalama" },
  { ad: "harf-balonlari", baslik: "Harf Balonları" },
  { ad: "harfi-ciz", baslik: "Harfi Çiz" },
  { ad: "resimden-ses", baslik: "Resimden Sesi Bul" },
  { ad: "hafiza-kartlari", baslik: "Hafıza Kartları" },
  { ad: "hece-koprusu", baslik: "Hece Köprüsü" },
  { ad: "heceyi-bul", baslik: "Heceyi Bul" },
];

// Yapılmış mini oyunlar: ad -> sahne sınıfı
const MINI_OYUNLAR = {};

function miniOyunKaydet(ad, sahneSinifi) {
  MINI_OYUNLAR[ad] = sahneSinifi;
}
