Göreve başlamadan önce YOL-HARITASI.md dosyasını oku ve hangi etapta olduğumuzu dikkate al.

# CLAUDE.md – Harf Oyunu kuralları

Bu dosya, bu depoda çalışan yapay zekâ için kurallardır. Her işten önce okunmalıdır.

## Proje hakkında
1. sınıf öğrencilerine Türkçe alfabeyi (harf seslerini) öğreten, 2D, kartonumsu,
sevimli bir tarayıcı oyunu. Çocuk bir adada dolaşır, harf kutuları açar. Harfin
sesini veya o harfle başlayan kelimeyi söyleyince kutudan bir tohum kazanır.
Tohumlar ileride hece ve kelime üretmeye ve mini oyunlara dönüşecek.

## Proje yapısı
- `index.html` – Ana sayfa. Derleme adımı yok, doğrudan tarayıcıda açılır.
- `oyun.js` – Phaser sahneleri ve oyun kodu. Oyunun adı "Harf Avcısı". Önce karşılama
  sahnesi (`KarsilamaSahnesi`), "Oyunu başlat" ile ada sahnesi (`AdaSahnesi`) açılır.
  Sol üstteki menüde "Oyunu yeniden başlat" sayfayı yeniler; karşılama ekranını atlamak
  için tek seferlik bir not (sessionStorage) bırakır, ilerleme saklanmaz.
- `harfler.js` – Harf grupları ve kelimeler (sadece veri).
- `canta.js` – Karakterin çantası (envanter). Kaydedilmez; sayfa yenilenince oyun baştan başlar.
- `dinleyici.js` – Chrome konuşma tanıma (tr-TR), zaman aşımlı; söylenenin doğruluğunu kontrol eder.
  Chrome tek ünlüleri ("a") yazıya çeviremediği için ünlülerde ses yüksekliği ölçülür.
  Harf bir dolum çubuğudur: çocuk sesi uzattıkça (toplam 3 sn) harf dolar; ses kesilince
  önce yavaşça boşalır, 3 kesintiden sonra kaldığı yerde durur. Ses kaydedilmez.
  "a" sandığı: önce harf söylenir, oyun düşünür (düşünce balonu); yarım saniye net ses
  (`ILK_ONAY_SURESI`) ya da Chrome'un tanıdığı kelime doğru sayılır. Sonra "Tohumu kazanmak
  için gücünü göster!" aşamasında harf her net sesle dolar (titiz değil; kullanıcı isteği).
  Tını tanıma (LPC ile F1/F2, `UNLU_KURALLARI`) kodda duruyor ama gerçek seste "a"yı
  reddettiği için oyunda kullanılmıyor; yalnızca mikrofon.html'de ölçüm gösteriyor.
- `mikrofon.html` – Öğretmen için mikrofon testi sayfası (Chrome'un ne duyduğunu gösterir).
- `sesler.js` – Oyun sesleri. Ses dosyası yok; sesler tarayıcıda (Web Audio) üretilir.
- `yazitipi/` – Andika yazı tipi ve lisansı (SIL Open Font License).
- `gorseller/` – Kendi çizdiğimiz SVG görseller. Bütün oyun doodle tarzında: titrek kalem
  çizgisi (SVG içinde feTurbulence/feDisplacementMap süzgeci), boya kalemi taraması,
  kareli defter kâğıdı zemin (doku-*.svg, kesintisiz döşenir). Pencereler de SVG:
  canta-pencere.svg, dusunce-balonu.svg, guc-bandi.svg.
- `araclar/doodle_ciz.py` – Karakter, sandık ve pusula dışındaki doodle görselleri üretir
  (`python3 araclar/doodle_ciz.py`). Görsel değişikliği bu betikte yapılıp yeniden üretilir.
- Phaser 3, sabit sürümle (3.90.0) jsDelivr CDN'den yüklenir. Sürüm numarası
  rastgele değiştirilmez.
- Yayın: GitHub Pages (kök klasörden).

## Çalışma şekli
- Kullanıcı kodlama bilmiyor. Tüm açıklamaları Türkçe, kısa ve sade yaz.
  İş bitince "Ne yaptım" ve "Nasıl denerim" bölümlerini ekle.
- Her seferinde tek küçük iş yap. İstenmeyen özellik ekleme. Çalışan bir şeyi bozma.
- GitHub işlerini (kaydetme, gönderme, çekme isteği açma, ana sürüme ekleme/merge)
  Claude yapar. Kullanıcıdan GitHub'da düğmeye basmasını isteme; bu terimleri
  kullanıcıya açıklamak gerekirse sade Türkçe kullan.

## Yazı ve harfler
- Oyundaki bütün yazılar Türkçe.
- Harfler tırnaksız dik temel harf stiliyle gösterilir. Kullanılan yazı tipi:
  **Andika** (`yazitipi/Andika-Regular.ttf`).
- Küçük harf önce gelir. Büyük harf yalnızca cümle başında ve özel isimlerde kullanılır.
- Türkçe büyük/küçük harf dönüşümüne dikkat: i ↔ İ, ı ↔ I
  (JavaScript'te `toLocaleUpperCase('tr-TR')` kullan).

## Pedagoji (MEB ses esaslı yöntem)
- Ünlüler tek başına sesletilebilir.
- Ünsüzler tek başına sesletilmez; ünsüzlerde çocuktan hece veya kelime söylemesi istenir.
  İstisna (öğretmenin kararı): "n" önce tek başına, uzatılarak ("nnnn") denenir; olmazsa
  hece ("an") ve kelime resmi ipucu olarak gelir. Hangi ünsüzde böyle yapılacağı
  `harfler.js`'deki `tekBasinaDenenir` ile belirtilir; yeni ünsüzlerde öğretmene sor.
- Heceleme önce kapalı hece (an), sonra açık hece (na).
- Hece tablosu yok.
- Öğrenilmemiş harf içeren sözcük yazıyla gösterilmez; onun yerine görsel konur.

## Ses doğrulama (3 basamak)
1. Chrome'un konuşma tanıması (tr-TR).
2. Birkaç başarısız denemeden sonra harfin kelimesi (örneğin A için arı) ipucu
   olarak gösterilir ve o kelime kabul edilir.
3. Hâlâ olmazsa birkaç saniye sonra oyun kendiliğinden onaylar ve o harf
   "tekrar edilecek" olarak işaretlenir.
- Tanıma bazen hiç sonuç döndürmez, bu yüzden zaman aşımı mutlaka olsun.
- Hata mesajı veya başarısızlık ekranı yok.

## Gizlilik
- Ses kaydı tutma, kişisel veri toplama, sunucu kullanma.
- İlerleme sadece tarayıcının yerel hafızasında (localStorage) tutulur.

## Görseller ve sesler
- Telif sorunu çıkarmamalı: kendi çizdiğin SVG'ler veya CC0 lisanslı kaynaklar.
- İnternetten rastgele görsel veya ses ekleme.

## Depo herkese açık
- Öğrenci adı, fotoğraf veya ses kaydı koyma.

## Test
- Ses özellikleri sadece Chrome'da test edilir.

## Hatalardan öğrenilen kurallar
Her hatadan sonra buraya yeni bir kural ekle.

- Kullanıcı istemedikçe ilerlemeyi kalıcı saklama. Sayfa yenilenince oyun baştan
  başlar (çanta boşalır, sandıklar kapanır). Kalıcı kayıt gerekirse önce kullanıcıya sor.
- Kullanıcıya görünen her şey Türkçe olsun: iş arasındaki kısa notlar, komut
  açıklamaları, kayıt (commit) mesajları, çekme isteği açıklamaları ve kod içi notlar.
  İngilizce yazma.
