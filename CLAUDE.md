# CLAUDE.md – Harf Oyunu kuralları

Bu dosya, bu depoda çalışan yapay zekâ için kurallardır. Her işten önce okunmalıdır.
Oyunların ayrıntılı tarifi `OYUNLAR.md`'de: yalnızca üzerinde çalışılan oyunun bölümünü oku.

## Proje hakkında
1. sınıf öğrencilerine Türkçe alfabeyi (harf seslerini) öğreten, 2D, doodle tarzı, sevimli bir
tarayıcı oyunu ("Harf Avcısı"). Çocuk adaya düşmüştür: sandıkta harf tohumu bulur, tarlaya eker,
mini oyunlarla damla kazanıp sular, fasulye sırığından bulutlara çıkar, yelkenli parçasını alır;
altı parça (a n e t i l) tamamlanınca yelkenliyle 2. adaya geçer. Şimdilik yalnızca 1. ada.
2. ada sonbahar adasıdır (o k u r ı m; kelimeleri otobüs, kedi, uçak, robot, ıspanak, maymun): aynı akış,
fasulye sırığı yerine mısır sapı, yelkenli yerine köprü (o, k ayak; u, r halat; ı, m tahta; parçalarda harf
yok); köprü bitince "3. adaya git". 3. ada karlı adadır (ü s ö y d z): buz sarmaşığı; dalgıç kıyafeti ve çekiç
(ü maske, s şnorkel, ö elbise, y paletler, d tüp, z çekiç; harf yok); "Buzu kır" → çocuk deliğe dalar, "4. adaya git".
4. ada su altıdır (ç b g c ş): çocuk dalgıç kıyafetiyle her yere yüzer (`yuzme`, cocuk-yuz.svg, cocuk*-dalgic.svg);
ağaç yerine deniz yosunu, tohum mercan olur, damla yerine hava kabarcığı (`kabarcik`, `dk()`, sözler `suAltiSozu`),
su tesisi "Kabarcık İstasyonu", bulutlar yerine su yüzeyi; görev dev kaplumbağa (ç eyer, b dizgin, g fener, c harita,
ş anahtar; 5 parça); "Haydi, bin!" → kaplumbağa gizli mağaradaki rokete götürür, "5. ada (uzay) yakında".
3. adanın başında peri kar kıyafeti için sınav yapar: m harfiyle (öğretmenin seçimi,
`KIS_SINAVI_HARFI`) rastgele bir hece/kelime oyunu, 3. seviye (`kisSinaviBaslat`, mini oyunda `veri.sinav`); geçene kadar yeni sınav; geçince
çocuk kışlık giyer (cocuk*-kis.svg, `cocukDokusu`, kayıtta `kisKiyafeti`). Adalar `AdaSahnesi`nde `ADALAR` ayarıyla (`veri.ada`, kayıtta `ada`; sözler `sozler`).
Mini oyunlar 3., 4. ve 5. harf grubuyla da (ü s ö y d z; üzüm, sincap, ördek, yunus, deve, zürafa / ç b g c ş;
çekirge, balık, güvercin, civciv, şeker / p h v ğ f j; penguen, horoz, vapur, dağ, fil, jelibon) oynanır (deneme
menüsü). O konumda resimli kelime yoksa (ö, d, b, g, c, h, f ile biten; ğ ile başlayan) başka konum sorulur
(`konumSec`). ğ kelime ve hece başında gelmez (hece havuzunda "ğa" gibi hece yok), tek başına söylenemez
(`tekBasinaDenenir` yok, ipucu hecesi "ağ").

## Dosya rehberi (ayrıntı: OYUNLAR.md)
- `index.html` ana sayfa (derleme yok; telefon ayarları, yazı tipi yükleme `yaziTipiHazir`, dönünce
  yeniden yerleştirme). Uygulama olarak ekleme: `manifest.webmanifest`, `sw.js` (önbellek yok), `simge/`.
- `oyun.js` ana oyun sahneleri (karşılama, hikâye, ada, bulut, final), `SURUM`. God mode (şifreli) bir
  seçim paneli açar: hikâye, Mini Games ya da 1.-4. adanın bir aşaması (`tanriSecenekleri`, `tanriAsamasi`).
- `minioyunlar/<ad>/oyun.js` her mini oyun; `ortak.js` ortak sınıf `MiniOyunSahnesi`, `PLANLANAN_OYUNLAR`,
  hece/kelime yardımcıları; `menu.js` deneme menüsü; `lambalar.js` Oyun Lambaları (çarkın yerine).
- `profil.js` profil (hayvan resmi + takma ad; ilk ekranda "Profil oluştur" → `ProfilPaneli`), istatistik, karne (`KarneSahnesi`).
- `harfler.js` harf verisi; `canta.js` çanta; `sesler.js` efekt ve sesli okuma; `dinleyici.js` mikrofon.
- `gorseller/` kendi SVG'lerimiz, `araclar/doodle_ciz.py` ile üretilir (görsel değişikliği betikte yapılır).
- `araclar/dene.js` mini oyun deneme aracı (aşağıda "Test").
- Öğretmen sayfaları: `mikrofon.html`, `kayit.html`, `dinle.html`, `resimler.html` (bütün kelime resimleri, kontrol için).
- Phaser 3.90.0 jsDelivr'den (sürüm değiştirilmez). Yayın: Cloudflare Workers (harfavcisi.net; `main`e eklenince
  kendiliğinden yüklenir, ayar `wrangler.jsonc` + `.assetsignore`). Deneme sitesi: GitHub Pages
  (trkbsrn-create.github.io/harf-oyunu, `gelistirme` dalından).

## Mini oyunların ortak kuralları (öğretmenin kararları)
- Her oyunda 3 seviye; mini oyunlarda kaybetmek mümkün (3 can). Bitişte 1–3 yıldız.
- İlkeler: gösteren el (`elGoster`), her doğruya ses + parıltı + yıldız (`ilerlemeArtir`), nazik
  hata (`ipucuGoster`), kolay başlangıç, büyük dokunma alanı, yalnızca öğrenilmiş harfler.
- Harfler sırayla öğrenilir (a, n, e, t, i, l). Hece ve kelime oyunlarında yalnızca o harfe kadar
  öğrenilmiş harfler (`bilinenHarfler`, `heceHavuzu`, `ogrenilmisKelimeler`). Yeterli hece/kelime
  yoksa oyun o harfte kapalı (`gereken`, `miniOyunOlur`; a ve n'de hece yok) ya da harfe döner.
- Hem "harf" hem "hece" etiketli oyunlar Kazma düzeniyle işler (ortak.js `siraliKur` vb.): 1. seviye
  harf, 2. seviye harflerle hece (hece söylenir, harfleri sırayla; önce kapalı hece, sonra açık hece,
  sonra üç harfli: `siraliHeceSec`), 3. seviye hecelerle kelime; sırası
  gelmemiş doğru parça can götürmez; hece/kelime yoksa harf. İstisna: Tombala, Birleştir Büyüt, Harf Fırtınası.
- Seviyeyle hece uzar: 1. seviye iki harfli, 2-3. seviye üç harfli (`heceUzunlugu`, `heceSorusu`).
- Sorulan hece çoğunlukla oyunun harfini içerir, arada (`ESKI_HECE_ORANI` %25) önceki harflerin
  hecesi gelir (e'de çoğunlukla en/ne, arada an/na). Başka harf istenirse yalnızca önceki harflerden.
- Hece oyunlarında (`heceOyunu`) tek harf okunmaz; yalnızca hece ya da kelime söylenir.
- Harfler `harfiSoyle` ile sesiyle okunur (n "nnn"). Sözleri öğretmenin kendi kaydı okur (`sesler/liste.js`);
  kaydı olmayan sözü tarayıcı okur. Öğretmenin kararı: istisnasız her kayda peri efekti (yeni kayıtlar
  da): kayit.html'e ekle, öğretmen kaydeder, `araclar/peri_efekti.sh` ile efekt verilip `sesler/`e konur.
- Yeni mini oyun: `miniOyunKaydet`, `PLANLANAN_OYUNLAR`'a ekle (etiketler: "harf"/"hece"), `YONERGELER`'e
  peri yönergesi, index.html'e betik.

## Çalışma şekli
- Kullanıcı kodlama bilmiyor. Tüm açıklamaları Türkçe, kısa ve sade yaz.
  İş bitince uzun "Ne yaptım" ve "Nasıl denerim" bölümleri yazma (kullanıcının isteği);
  kısaca bitti de ve sürüm numarasını söyle. Kullanıcı sorarsa ayrıntıyı anlat.
- Her seferinde tek küçük iş yap. İstenmeyen özellik ekleme. Çalışan bir şeyi bozma.
- Her güncellemede sürüm numarasını artır: `oyun.js`'deki `SURUM` ve `index.html`'deki
  betik eklerindeki `?s=` sayısı, o güncellemenin çekme isteği numarası olsun. Sürüm,
  karşılama ekranının sağ üstünde görünür; öğretmen son güncellemenin geldiğini buradan anlar.
- **İki site (öğretmenin kararı; oyunu 20-30 aile oynuyor):** harfavcisi.net canlı sitedir (`main`).
  Bütün yeni işler `gelistirme` dalına yapılır: dal `origin/gelistirme`'den açılır, çekme isteği
  `gelistirme`'ye açılıp birleştirilir; öğretmen deneme sitesinde (trkbsrn-create.github.io/harf-oyunu)
  görür. Öğretmen "siteye güncelle / yayınla" deyince `gelistirme` → `main` çekme isteği açılıp
  birleştirilir. Öğretmenin açık onayı olmadan `main`e hiçbir şey birleştirme (acil hata düzeltmesi de
  önce sorulur). Canlıda çocukların profil ve kayıtları var: kayıt biçimi değişirse eski kayıtlar bozulmasın.
- GitHub işlerini (kaydetme, gönderme, çekme isteği açma, ana sürüme ekleme/merge)
  Claude yapar. Kullanıcıdan GitHub'da düğmeye basmasını isteme; bu terimleri
  kullanıcıya açıklamak gerekirse sade Türkçe kullan.

## Verimli çalışma (öğretmenin isteği; limit dolmasın)
- Bir mesajdaki bütün istekler tek sürümde (tek çekme isteği) yapılır.
- Dosyaların tamamını okuma: `grep` ile yeri bul, yalnızca o bölümü oku. OYUNLAR.md'de de yalnızca ilgili oyun.
- Test için yeni betik yazma; `araclar/dene.js` kullan (gerekirse küçük kod parçası verilir).
- Değişiklik başına en çok bir ekran görüntüsü bak ve kullanıcıya gönder.
- Yayını birleştirdikten sonra bir kez kontrol et; bitmesini bekleme.
- İstek belirsizse büyük işe girişmeden önce tek cümleyle sor ya da küçük taslak göster.
- Önemli tek uyarıyı (ör. "kurulum gerekiyor", "telefonda deneyemedim") mesajın en başına yaz.
- Belgeleri kısa tut: CLAUDE.md'ye yalnızca kural, OYUNLAR.md'ye oyun tarifi (bir iki satır).

## Kelime seçimi
- Oyunlara kelime seçerken Türkçe okuma kurallarına dikkat edilir (öğretmenin kuralı): okumada
  karışabilen sesler (ı/i gibi) soruyu karıştırmasın; örneğin "i" sorulurken yanlış seçeneklerde
  "ı" de olmasın (`KARISAN_SESLER`). Büyük ünlü uyumu şart değil (öğretmen: "çok önemli değil").
- Kelime resimden kolay tanınmalı; birbirine benzeyen resimler (kurt/kedi gibi) aynı soruda
  karışmasın.
- Kelime listesinin büyük kısmı öğretmenin verdiği Mehmet Öğretmen kelime tablolarından seçildi
  (çocuğa uygun, somut sözcükler; ad, yer adı ve fiil çekimleri alınmadı). ilkokuldokumanlari.com hece
  tablolarındaki resmi çizilebilen kelimeler de resimleriyle konum listelerine eklendi (benzer resmi olanlar,
  ör. kuş/güvercin, keman/gitar, alınmadı).
- Öğretmenin kuralı: Türkçede küfür ya da argo olan heceler ve kelimeler (am, sik, sok, mal...) oyunda
  hiç çıkmaz: ne sorulur, ne seçenek olur, ne birleşir, ne ipucu hecesi olur (m'nin hecesi "em").
  Liste `UYGUNSUZ_HECELER` (ortak.js); hece havuzu, kelime listeleri, Birleştir Büyüt ve Elektrik
  Devresi yolları buna bakar. Yeni harf grubunda yeni çıkan uygunsuz heceleri listeye ekle.

## Yazı ve harfler
- Oyundaki bütün yazılar Türkçe.
- Harfler tırnaksız dik temel harf stiliyle gösterilir. Kullanılan yazı tipi: cihazda kuruluysa
  **TTKB Dik Temel Abece Bold**, değilse **Andika** (`yazitipi/Andika-Regular.ttf`).
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
- Öğretmenin isteği: oyuna başlarken "Mikrofon var mı?" sorulur (Var / Yok). "Yok" ise `Dinleyici.kapali`:
  mikrofon hiç açılmaz; sandıkta harf sesli okunup tohum verilir, bulutta balon kendiliğinden patlar.
  Karnede "Mikrofonsuz oynadı" (eksik sayılmaz). Yeni mikrofonlu bölümde de `Dinleyici.kapali`'ya bak.
- Hata mesajı veya başarısızlık ekranı yok. (Mini oyunlar hariç: orada kaybetmek mümkün.)

## Gizlilik
- Ses kaydı tutma, kişisel veri toplama, sunucu kullanma.
- Öğretmenin izniyle: çocuk hayvan resmi + takma adla girer (adı veli yazar). Profil ve istatistik
  yalnızca cihazda (localStorage), sunucuya gitmez. Karne veli kapısının arkasında (şifre: karnebak;
  şifre kodda açık, yalnızca çocukları durdurmak için). Karne yetişkin içindir: öğrenilmemiş harfli
  yazı kuralı orada ve takma adda uygulanmaz. God mode da şifreli (sol altta yazısız küçük daire; şifre:
  trkbsrn35, `TANRI_SIFRESI`, kodda açık).
- İlerleme sadece tarayıcının yerel hafızasında (localStorage) tutulur.

## Görseller ve sesler
- Telif sorunu çıkarmamalı: kendi çizdiğin SVG'ler veya CC0 lisanslı kaynaklar.
- İnternetten rastgele görsel veya ses ekleme.

## Depo herkese açık
- Öğrenci adı, fotoğraf veya ses kaydı koyma.

## Test
- Ses özellikleri sadece Chrome'da test edilir.
- Mini oyun denemesi: `node araclar/dene.js <oyun> [harf] [seviye] [bekleme_ms] ["kod"] [sonra_ms]`
  (ör. `node araclar/dene.js kazma l 3`). Kendi sunucusunu açar ve kapatır; hataları, söylenen
  sözleri ve `araclar/cikti/<oyun>.png` ekran görüntüsünü verir. "kod" sahnede çalıştırılır
  (`s` = sahne, ör. `"s.ilerleme"`). Oyun adı `menu` menüyü, `ana` karşılama ekranını açar.
  Sahne adı da verilebilir (AdaSahnesi, HikayeSahnesi). Ada bu ortamda çok yavaş çizilir (saniyede
  birkaç kare): ada denemelerinde sonra_ms uzun tutulur (ör. 25000).
  Mini oyun yönergesi denemelerde kapalı; görmek için başına `YONERGE=1` yazılır.
  Kurulum (yeni oturumda bir kez): `npm install --prefix araclar --no-save playwright phaser@3.90.0`.
- Gerçek telefonda (özellikle iPhone) denenemeyen değişikliklerde bunu kullanıcıya açıkça söyle.

## Hatalardan öğrenilen kurallar
Her hatadan sonra buraya yeni bir kural ekle.

- Kullanıcı istemedikçe ilerlemeyi kalıcı saklama. Sayfa yenilenince oyun baştan
  başlar (çanta boşalır, sandıklar kapanır). Kalıcı kayıt gerekirse önce kullanıcıya sor.
  (Öğretmen izin verdi: profil, istatistik ve oyunun kaldığı yer profile saklanır, `profil.js`;
  "Ana menüye dön" → "Devam et".)
- Kullanıcıya görünen her şey Türkçe olsun: iş arasındaki kısa notlar, komut
  açıklamaları, kayıt (commit) mesajları, çekme isteği açıklamaları ve kod içi notlar.
  İngilizce yazma.
- Bir harfi bir resmin (tohum, daire vb.) ortasına koyarken yazı kutusunu değil,
  harfin boyalı kısmını ortala (`boyaliOrtala`). Yazı kutusunda harfin üstünde boşluk
  olduğu için "a" gibi harfler yoksa aşağıda kalır.
- Karakter bir hedefe yürürken bir karedeki adımı hedefe kalan yoldan uzun olmasın.
  Yavaş cihazda (düşük kare hızı) adım büyür, karakter hedefin çevresinde gidip gelir
  ve hiç varamaz. Testleri yavaş tarayıcıda da çalıştır.
- Telefonda sesi parmak ekrana değdiği an (pointerdown/touchstart) açmaya çalışma; tarayıcı
  izin vermez, ses mikrofon iznine kadar hiç gelmez. Ses parmak kalkınca açılmalı.
- Telefonda ilk dokunuşta (pointerdown) çalınan efekt, ses henüz açılmadığı için kayboluyordu
  (Mini Games düğmesi). Efektler `Sesler.calabilir` ile bekletilir, ses açılınca çalınır.
- Phaser sahnesi yeniden açılınca (Tekrar, başka seviye) aynı nesne kullanılır; önceki turdan
  kalan alanlar (`this.tuslar`, `this.cevaplandi` gibi) silinmez. Mini oyunun `create`'inde
  bütün durum alanlarını sıfırla.
- Kural değişince (ör. bilinen harfler) eski kodda ona aykırı yedekleri de tara (Hece Müziği'nde
  e harfinde bilinmeyen "el" hecesi kalmıştı). Görsel değişiklikte görsel sonucu da ölç (notalar
  üst üste binmişti).

- İskelede karakter gidip geliyordu: tesisin resmi iskeleyi de kapsıyordu, iskeleye her dokunuşta önce
  iskelenin başına dönülüyordu. Dokunma alanı büyük bir resimse resmin hangi bölümüne dokunulduğuna bak.

- Hikâyedeki mini oyunlarda bitiş yıldızları düz çıkıyordu: ada "yildiz" adıyla kendi dokusunu üretiyordu,
  mini oyunun aynı adlı SVG'si yüklenmiyordu. Sahneler arasında doku adları ortaktır; yeni dokuya benzersiz ad ver.

- Altın Madencisi'nde doğru külçenin önünde yanlış külçe olunca ona ulaşılamıyordu; köşedeki külçeler
  kancanın açısı dışındaydı. Nesneler rastgele yerleşirken doğru olana ulaşılabildiğini ölç.

- Oyunun üstüne açılan HTML kutusuna (metinSor) yapılan dokunuş alttaki oyuna da geçiyordu ("Tamam"
  alttaki resme basmış sayıldı, kutu tekrar açıldı). HTML katmanında dokunuş olaylarını durdur.
- Ada sahnesi aynı sayfada yeniden açılınca (Devam et) tuval dokusu zaten vardı, sahne çöktü; sahne
  olay dinleyicileri (`this.events.on`) de üst üste biner. Yeniden açılabilen sahnede eski dokuyu sil,
  dinleyiciyi önce kaldır.
- HTML kutusunda `querySelector("div div")` kutunun kendisini buldu, yazı düğmeleri sildi (onaySor). Kutudaki
  öğeyi sınıf adıyla seç.
- iPhone'da ada açılınca sayfa çöküyordu ("birçok kez sorun oluştu"): dünya boyutundaki 4 desen
  (tileSprite 6400x4200) her biri ~107 MB bellek tutuyordu. tileSprite ekran boyutunda olsun, kamerayla
  kaysın (`zeminiKaydir`). Yeni büyük görselde bellek ölç (doku boyutları toplamı).
- Chrome'un internet sesi (Google Türkçe) bazen hiç başlamıyor, bütün sözler susuyordu (Brave'de
  sorun yoktu). Söz 1,5 saniyede başlamazsa cihazın kendi sesine geçilir (`uzakSesBozuk`).

- Sürüm 168 onaysız canlıya (main) gitti: oturum eski CLAUDE.md ile başlamıştı. Her işten önce
  `origin/gelistirme`'deki CLAUDE.md'yi oku; çekme isteğinin hedefi `gelistirme` mi, kontrol et.

## Bekleyen işler
- TTKB Dik Temel Abece yazı tipi: yazardan izin bekleniyor; izin gelirse dosya depoya eklenir.
- Ekrandaki 10 uyarı ("Telefonu yan çevir" vb.) henüz kaydedilmedi (kayit.html'de duruyor).
- iPhone'da efekt sesi düzeltmesinin (`iosSesiniAc`) öğretmenden onayı bekleniyor.
- Bulut bölgelerinin içeriği; bilmeceler ("Hızlı koşar, yeleleri var." → at; "Türk bayrağında
  beni görürler, kırmızıyla eş derler." → al) nerede kullanılacak, sonra konuşulacak.
- 2. harf grubu: 3. seviyede dört harfli heceler, yeni seslerin kaydı (kayit.html "2. ada"); bulut bölgeleri.
- 5. ada (uzay) henüz yok. 4. adanın yeni sözleri kaydedilmedi (kayit.html "4. ada").
- Kalan harf grupları; yeni gruplarla 4-5 heceli kelimeler (Elektrik Devresi).
- Peri rehber (öğretmenin fikri) tamam: tanışma, anlatım, görev düğmesi, omuzdaki peri, mini oyun
  yönergeleri. Perinin adı yok (sorulabilir). Yeni mini oyuna `YONERGELER`'de yönerge yazılır.
- Bulut Market (taslak proje): karakterin kıyafetini değiştirme, yeni eşyalar alma. Sonra başlanacak.
