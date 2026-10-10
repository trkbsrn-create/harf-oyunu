// Harf grupları ve kelimeler (ilk okuma yazma sırası).
// Bu dosya sadece veri içerir; oyun kodu yoktur.
//
// Her harf için:
//   kucuk  : küçük harf
//   buyuk  : büyük harf (dikkat: i → İ, ı → I)
//   unlu   : true ise ünlü (tek başına sesletilebilir), false ise ünsüz
//   grup   : 1–5 arası grup numarası
//   kelime : bu harfle ilgili kelime (ipucu olarak da kullanılır)
//   harfKelimeBasinda : harf kelimenin başında mı? (ğ için false, çünkü "dağ")
//   resim  : ipucu resmi (gorseller/ içindeki dosya adı); kelimede öğrenilmemiş
//            harfler olduğu için kelime yazılmaz, resmi gösterilir
//   hece   : ünsüzlerde ipucu hecesi (önce kapalı hece: "an")
//   tekBasinaDenenir : öğretmenin kararıyla bu ünsüz önce tek başına (sadece sesi)
//            denenir; olmazsa hece ipucu gelir. Öğretmen bütün ünsüzlerde böyle istedi.
//   kisaSes : bu ünsüzün sesi uzatılamaz ("t"); kısa ses yeter, güç aşamasında
//            harf her kısa sesle biraz dolar
//   okunus  : ünsüzü tarayıcının sesine okuturken verilen yazı (yalnızca sesi: "nnn", "ne" değil).
//            Öğretmen Chrome'da dinleyip hangisinin iyi olduğunu söyleyince düzeltilir.

const HARFLER = [
  // Grup 1
  { kucuk: "a", buyuk: "A", unlu: true,  grup: 1, kelime: "arı",      harfKelimeBasinda: true, resim: "ari" },
  { kucuk: "n", buyuk: "N", unlu: false, grup: 1, kelime: "nar",      harfKelimeBasinda: true, resim: "nar", hece: "an", tekBasinaDenenir: true, okunus: "nnn" },
  { kucuk: "e", buyuk: "E", unlu: true,  grup: 1, kelime: "eşek",     harfKelimeBasinda: true, resim: "esek" },
  { kucuk: "t", buyuk: "T", unlu: false, grup: 1, kelime: "tilki",    harfKelimeBasinda: true, resim: "tilki", hece: "at", tekBasinaDenenir: true, kisaSes: true, okunus: "t" },
  { kucuk: "i", buyuk: "İ", unlu: true,  grup: 1, kelime: "inek",     harfKelimeBasinda: true, resim: "inek" },
  { kucuk: "l", buyuk: "L", unlu: false, grup: 1, kelime: "leylek",   harfKelimeBasinda: true, resim: "leylek", hece: "al", tekBasinaDenenir: true, okunus: "lll" },

  // Grup 2
  { kucuk: "o", buyuk: "O", unlu: true,  grup: 2, kelime: "otobüs",   harfKelimeBasinda: true, resim: "resim-otobus" },
  { kucuk: "k", buyuk: "K", unlu: false, grup: 2, kelime: "kedi",     harfKelimeBasinda: true, resim: "resim-kedi", hece: "ak", tekBasinaDenenir: true, kisaSes: true, okunus: "k" },
  { kucuk: "u", buyuk: "U", unlu: true,  grup: 2, kelime: "uçak",     harfKelimeBasinda: true, resim: "resim-ucak" },
  { kucuk: "r", buyuk: "R", unlu: false, grup: 2, kelime: "robot",    harfKelimeBasinda: true, resim: "resim-robot", hece: "ar", tekBasinaDenenir: true, okunus: "rrr" },
  { kucuk: "ı", buyuk: "I", unlu: true,  grup: 2, kelime: "ıspanak",  harfKelimeBasinda: true, resim: "resim-ispanak" },
  { kucuk: "m", buyuk: "M", unlu: false, grup: 2, kelime: "maymun",   harfKelimeBasinda: true, resim: "resim-maymun", hece: "em", tekBasinaDenenir: true, okunus: "mmm" },

  // Grup 3
  { kucuk: "ü", buyuk: "Ü", unlu: true,  grup: 3, kelime: "üzüm",     harfKelimeBasinda: true, resim: "resim-uzum" },
  { kucuk: "s", buyuk: "S", unlu: false, grup: 3, kelime: "sincap",   harfKelimeBasinda: true, resim: "resim-sincap", hece: "as", tekBasinaDenenir: true, okunus: "sss" },
  { kucuk: "ö", buyuk: "Ö", unlu: true,  grup: 3, kelime: "ördek",    harfKelimeBasinda: true, resim: "resim-ordek" },
  { kucuk: "y", buyuk: "Y", unlu: false, grup: 3, kelime: "yunus",    harfKelimeBasinda: true, resim: "resim-yunus", hece: "ay", tekBasinaDenenir: true, okunus: "yyy" },
  { kucuk: "d", buyuk: "D", unlu: false, grup: 3, kelime: "deve",     harfKelimeBasinda: true, resim: "resim-deve", hece: "ad", tekBasinaDenenir: true, kisaSes: true, okunus: "d" },
  { kucuk: "z", buyuk: "Z", unlu: false, grup: 3, kelime: "zürafa",   harfKelimeBasinda: true, resim: "resim-zurafa", hece: "az", tekBasinaDenenir: true, okunus: "zzz" },

  // Grup 4
  { kucuk: "ç", buyuk: "Ç", unlu: false, grup: 4, kelime: "çekirge",  harfKelimeBasinda: true },
  { kucuk: "b", buyuk: "B", unlu: false, grup: 4, kelime: "balık",    harfKelimeBasinda: true },
  { kucuk: "g", buyuk: "G", unlu: false, grup: 4, kelime: "güvercin", harfKelimeBasinda: true },
  { kucuk: "c", buyuk: "C", unlu: false, grup: 4, kelime: "civciv",   harfKelimeBasinda: true },
  { kucuk: "ş", buyuk: "Ş", unlu: false, grup: 4, kelime: "şahin",    harfKelimeBasinda: true },

  // Grup 5
  { kucuk: "p", buyuk: "P", unlu: false, grup: 5, kelime: "penguen",  harfKelimeBasinda: true },
  { kucuk: "h", buyuk: "H", unlu: false, grup: 5, kelime: "horoz",    harfKelimeBasinda: true },
  { kucuk: "v", buyuk: "V", unlu: false, grup: 5, kelime: "vapur",    harfKelimeBasinda: true },
  { kucuk: "ğ", buyuk: "Ğ", unlu: false, grup: 5, kelime: "dağ",      harfKelimeBasinda: false },
  { kucuk: "f", buyuk: "F", unlu: false, grup: 5, kelime: "fil",      harfKelimeBasinda: true },
  { kucuk: "j", buyuk: "J", unlu: false, grup: 5, kelime: "jaguar",   harfKelimeBasinda: true },
];
