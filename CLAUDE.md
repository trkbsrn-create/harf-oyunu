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
  Karşılama ekranının sol üstünde öğretmenin deneme düğmesi "God mode" var (öğretmen
  bu adla istedi): oyun bütün sandıklar açılmış ve altı harf tarlada fasulye sırığına
  dönüşmüş olarak başlar (`hepsiniAc`).
  Yazılar da doodle: `doodleYazi` (başlık, düğme, pencere yazıları: boya kalemi taraması,
  kalem çerçevesi, titrek kenar) ve `titret` (öğretilen harfler: biçim aynı, yalnızca
  kenar titrer). Harf biçimi her zaman Andika'dır; başka yazı tipi kullanılmaz.
- `harfler.js` – Harf grupları ve kelimeler (sadece veri).
- `canta.js` – Karakterin çantası (envanter). Kaydedilmez; sayfa yenilenince oyun baştan başlar.
- Tarla: karakterin başladığı yerin üstünde çitli tarla, 6 kare yan yana tek sıra
  (`tarlaKur`, tarla.svg).
  Çanta açıkken bir tohum tutulunca pencere silikleşir; tohum boş bir kareye bırakılırsa
  ekilir (ekili-tohum.svg), kare doluysa ya da tarla dışına bırakılırsa çantaya döner.
  Tarla da kaydedilmez.
- Dünya 6400x4200; ada üstteki 6400x3600'lük alanın ortasında (`ADA_YUKSEKLIK`), altta
  iskele için geniş deniz var. Ada, süs ve sandık yerleri ADA_YUKSEKLIK ile hesaplanır.
- Su arıtma tesisi: alt kıyıda, başlangıcın güneyinde (`tesisKur`, su-tesisi.svg); kıyıdan
  uzun bir iskeleyle (`ISKELE_EK`, doodle_ciz.py'de de aynı) ulaşılır, karakter iskelede
  yürüyebilir. Tesise dokununca karakter iskelenin ucuna yürür, panel açılır
  (tesis-pencere.svg). Her harf düğmesi o harf için sihirli şişeye bir damla verir (harf
  başına en çok 3, `Canta.damlalar`). Şişe ilk damlayla çantaya gelir. Kaydedilmez.
  Çantada şişeye dokununca "İncele" düğmesi çıkar; basınca şişenin içi açılır
  (sise-pencere.svg): her harfin bölmesinde toplanan damlalar görünür (`siseKur`).
  Şişe sürüklenip tarladaki tohuma bırakılırsa (o harfin damlası varsa) şişe eğilir, bir
  damla dökülür, bitki bir aşama büyür: 0 ekili tohum, 1 filiz, 2 küçük ağaç, 3 fasulye
  sırığı (adada kısa, yukarı doğru solarak gökyüzünde kaybolur: bitki-sirik.svg; bulutların
  üstünde uzun hâli: bulut-sirik.svg)
  (`BUYUME_ASAMASI`, `BITKI_RESIMLERI`; bitki-*.svg). 1. aşamadan sonra harf, karenin
  sol altındaki tahta tabelada (harf-tabela.svg) durur.
  Büyümüş sırığın toprak karesine dokununca (sırıklar üst üste binebilir, kareler binmez;
  seçilen sırık bir an parlar) karakter dibine yürür, arkası dönük (cocuk-tirman.svg; elle
  çizildi, betikle üretilmez) basamak basamak tırmanır (`tirmanmaHareketi`); sırıklar
  sallanmaz; tırmanır ve bulutların üstüne çıkar
  (`BulutSahnesi`; ada sahnesi uyutulur, durumu korunur). Her harfin kendi bölgesi var;
  şimdilik bölgede harfin büyük tabelası durur, içeriği sonra eklenecek. Karakter bulut
  zemininde gezer; sırığa dokununca aşağı iner ve adada o sırığın dibine döner.
- Mini harita: sol altta kâğıt kart (harita-karti.svg: ada ve tarla, `doodle_ciz.py`
  adayı oyundaki `adaNoktalari` formülüyle çizer; biri değişirse öbürü de değişmeli).
  Üstüne her karede karakter, ekranda görünen bölge ve açılmış sandıklar (kırmızı çarpı)
  çizilir. Kapalı sandıklar haritada görünmez. Haritaya dokununca karakter yürümez.
- `dinleyici.js` – Chrome konuşma tanıma (tr-TR), zaman aşımlı; söylenenin doğruluğunu kontrol eder.
  Chrome tek ünlüleri ("a") yazıya çeviremediği için ünlülerde ses yüksekliği ölçülür.
  Harf bir dolum çubuğudur: çocuk sesi uzattıkça (toplam 3 sn) harf dolar; ses kesilince
  önce yavaşça boşalır, 3 kesintiden sonra kaldığı yerde durur. Ses kaydedilmez.
  Sandıklar (a n e t i l; ünlüler ve `tekBasinaDenenir` ünsüzler): önce harf söylenir, oyun
  düşünür (düşünce balonu); yarım saniye net ses (`ILK_ONAY_SURESI`) ya da Chrome'un
  tanıdığı kelime (ipucundan sonra hece de, ör. "an") doğru sayılır; `kisaSes` harfte
  kısa net ses yeter. Sonra "Tohumu kazanmak
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
- Her güncellemede sürüm numarasını artır: `oyun.js`'deki `SURUM` ve `index.html`'deki
  betik eklerindeki `?s=` sayısı, o güncellemenin çekme isteği numarası olsun. Sürüm,
  karşılama ekranının sağ üstünde görünür; öğretmen son güncellemenin geldiğini buradan anlar.
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
- Ünsüzler genelde tek başına sesletilmez. Öğretmenin kararı: bu oyunda bütün ünsüzler
  önce tek başına (sadece sesi) denenir; çocuk sesi bildiği için basit doğrulama yeter,
  hassas ölçüm gerekmez. Olmazsa kapalı hece ("an", "at", "al") ve kelime resmi ipucu
  olarak gelir. `harfler.js`'de her ünsüze `tekBasinaDenenir: true` ve `hece` yazılır.
  Sesi uzatılamayan ünsüzlere ("t") `kisaSes: true` yazılır: kısa ses yeter, güç
  aşamasında harf her ayrı kısa sesle biraz dolar ("t t t").
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
- Bir harfi bir resmin (tohum, daire vb.) ortasına koyarken yazı kutusunu değil,
  harfin boyalı kısmını ortala (`boyaliOrtala`). Yazı kutusunda harfin üstünde boşluk
  olduğu için "a" gibi harfler yoksa aşağıda kalır.
- Karakter bir hedefe yürürken bir karedeki adımı hedefe kalan yoldan uzun olmasın.
  Yavaş cihazda (düşük kare hızı) adım büyür, karakter hedefin çevresinde gidip gelir
  ve hiç varamaz. Testleri yavaş tarayıcıda da çalıştır.
