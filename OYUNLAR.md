# OYUNLAR.md – Harf Avcısı ayrıntılı tarif

Bu dosya oyunun ve her mini oyunun ayrıntılı tarifidir (öğretmenin kararları dahil). Her işte
tamamını okuma: yalnızca üzerinde çalışılan oyunun/dosyanın bölümünü ara (ör. `grep -n "kazma (" OYUNLAR.md`).
Bir oyunu değiştirince buradaki satırlarını da kısaca güncelle. Kurallar CLAUDE.md'de.

## Dosyalar ve oyunlar (ayrıntılı)
- `index.html` – Ana sayfa. Derleme adımı yok, doğrudan tarayıcıda açılır.
  Telefon/tablet ayarları da burada: büyütme, kaydırma, basılı tutma menüsü ve yazı seçme
  kapalı; dokunmatik cihaz dik tutulunca "Telefonu yan çevir" uyarısı; ilk dokunuşta tam
  ekran ve (Android'de) yatay kilit. Bilgisayarda bunların etkisi yok.
- `oyun.js` – Phaser sahneleri ve oyun kodu. Oyunun adı "Harf Avcısı". Önce karşılama
  sahnesi (`KarsilamaSahnesi`), "Oyunu başlat" ile ada sahnesi (`AdaSahnesi`) açılır.
  "Oyunu başlat"tan sonra önce açılış hikâyesi (`HikayeSahnesi`, `HIKAYE_KARELERI`; öğretmenin
  seçimi A: kendiliğinden akan ~15 sn'lik canlı sahne, sözleri tarayıcı sesli okur, sağ üstte
  "Geç"): fırtına, sal kırılır, kumsalda uyanma, silik yelkenliyi görme (hikaye-*.svg). God
  mode ve "Devam et" hikâyeyi atlar.
  Sol üstteki menüde "Ana menüye dön" (`anaMenuyeDon`): oyun profile kaydedilir, karşılamaya dönülür;
  orada düğme "Devam et" olur ve kaldığı yerden sürer. Kayıt (`durumuKaydet`, 4 sn'de bir de; profil.js
  `oyunKaydi`): çanta, tarla (harf, büyüme aşaması), takılan yelkenli parçaları, kazanılan damlalar,
  oynanan oyunlar, rehber, çocuğun yeri; açılan sandıklar ve variller bunlardan çıkarılır (`durumuYukle`).
  Karşılama ekranının sol üstünde öğretmenin deneme düğmesi "God mode" var (öğretmen
  bu adla istedi): oyun bütün sandıklar açılmış, altı harf tarlada fasulye sırığına
  dönüşmüş ve altı yelkenli parçası çantada olarak başlar (`hepsiniAc`).
  Yazılar da doodle: `doodleYazi` (başlık, düğme, pencere yazıları: boya kalemi taraması,
  kalem çerçevesi, titrek kenar) ve `titret` (öğretilen harfler: biçim aynı, yalnızca
  kenar titrer). Harf biçimi her zaman aynı yazı tipidir (kodda adı hep "Andika"; aşağıya bkz.).
- `minioyunlar/` – Mini oyunlar. Her biri kendi klasöründe (`minioyunlar/<ad>/`), ayrı bir
  Phaser sahnesi; `ortak.js`'deki `miniOyunKaydet(ad, sınıf)` ile kaydolur, `index.html`'e
  betiği eklenir. Sahne `{ harf, seviye, donus }` bilgisiyle açılır. `PLANLANAN_OYUNLAR`
  menüdeki sırayı tutar. `menu.js`: karşılama ekranındaki "Mini Games" düğmesiyle açılan
  deneme menüsü (harf seçici + oyun kartları; hazır olmayanlarda "Yakında").
  Öğretmenin kararları: mini oyunlarda kaybetmek mümkün (canlar biterse parça yok, "Bir
  daha dene"); her damla 3 parça, her kazanılan mini oyun 1 parça verir; harfler ve
  heceler sesli okunur (`Sesler.soyle`: seslendirilmiş dosya, yoksa tarayıcının Türkçe sesi); mikrofonlu mini
  oyun şimdilik yok. Mini oyunlar bitince ana oyuna (tesis düğmeleri) bağlanacak.
  Ortak sınıf `MiniOyunSahnesi` (ortak.js): kâğıt zemin, Geri, 3 can (kalp.svg), ilerleme
  çubuğu, bitiş penceresi ("Aferin!" / "Bir daha dene", Tekrar / Geri). Sesli okuma
  `Sesler.soyle`. Öğretmenin yeni kararı: ünsüzler de okunur; `harfiSoyle` tarayıcıya harfin adı
  ("ne") yerine yalnızca sesini verir (harfler.js `okunus`: n "nnn", l "lll", t "t"; öğretmen Chrome'da
  dinleyip düzeltir). Oyun başında `harfiTanit`: harf söylenir (yardım uyarısı ve hece tanıtımı
  öğretmenin kararıyla kaldırıldı).
  Hece oyunlarında (`this.heceOyunu = true`; Kayak'ta 2-3. seviye) ünlü de tek başına okunmaz,
  taşa/harfe dokununca harf okunmaz; yalnızca hece ya da kelime duyulur (öğretmenin kararı). Benzer harfler `BENZER_HARFLER` (yalnızca öğrenilmiş olanlar kullanılır).
  Mini oyun betikleri index.html'de oyun.js'den önce yüklenir.
  Yapılanlar: damla-yakala (Damla Yakalama: düşen harfli damlalardan doğrulara dokun;
  seviyeyle hız, benzer harf ve hedef sayısı artar; Kazma düzeni: 2-3. seviyede parçalı damlalar
  sırayla, yere düşen ceza değil); harf-balonlari (Harf Balonları: tur
  tur, sallanan balonlardan istenen harfin hepsini patlat; seviyeyle balon/tur sayısı,
  benzer harf artar, 3. seviyede balonlar gezinir; Kazma düzeni: 2-3. seviyede parçalı balonlar
  sırayla); harfi-yaz (Harfi Yaz: öğretmenin kararıyla
  Şekillerle Yazma ve Harfi Çiz birleşti. harfi-yaz/oyun.js tek sahne kurar, init'te düzeye göre
  prototipini SekillerleYazmaSahnesi (sekiller.js, 1. düzey) ya da HarfiCizSahnesi (ciz.js, 2-3.
  düzey) yapar; gösteren el bölüm başına bir kez (`harfiYazEli`: kol, tepsi, çizim).
  1. düzey: içi boş büyük harf (HARF_YOLLARI büyütülür); sağda şeker makinesi (seker-makinesi.svg,
  kolu seker-makinesi-kol.svg, `MAKINE`); tepsi boş başlar, kola dokununca ya da aşağı
  sürükleyince oluktan 4 malzeme (düğme/çiçek/şeker) tepsiye düşer; tepsi boşalınca kol parlar,
  yeniden çekilir; malzeme yazılış sırasındaki sıradaki yere oturur (dokunmak da yeter); 2 harf;
  can yok. 2-3. düzey: harfin ipucu resmi yazılış yönünde yol boyunca götürülür, sarı iz kalır;
  sapınca çizgi baştan, can gider; harf 3 kez; yollar `HARF_YOLLARI` dik temel harf yönüne göre;
  2. düzey kalın yol, oklar, numaralar; 3. düzey ince yol, yalnızca başlangıç noktası; öğretmenin
  isteği: büyük harf de var, `BUYUK_HARF_YOLLARI`, `harfiYazYollari`: 1. düzeyde 2. harf, 2-3. düzeyde 2. tur büyük); resimden-ses (Resimden Sesi
  Bul: düzeye göre harfin kelimedeki yeri: 1. başında, 2. sonunda, 3. ortasında olan resmi seç
  (öğretmenin isteği). Oyun başında önce harf gelir (ünlüyse söylenir), sonra üç kutuda harfin
  yeri gösterilir ve söylenir ("Başında a olan resimleri bul!"; ünsüzde harf okunur, cümlede "bu harf"), sonra üstteki
  panele küçülür. Kelimeler `KONUMLU_KELIMELER` (resimden-ses/kelimeler.js; 132 resim,
  gorseller/resim-<kelime>.svg, doodle_ciz.py); yanlış resimlerde harf ve onunla karışan ses (i/ı) geçmez; 6 soru, 3/3/4
  kart; kart köşesindeki hoparlör resmin adını okur); hafiza-kartlari (Hafıza Kartları: kartlar kapalı,
  iki kart açılır, eşleşen açık kalır; öğretmenin kararı: yalnızca oyunun harfiyle ilgili kartlar,
  resimler `KONUMLU_KELIMELER`'den, eşleşince kelime okunur; 1. seviye aynı resmi eşleştir (4 çift,
  harf başında); 2. seviye harf kartı + başında o harf olan resim (a – arı); 3. seviye harf kartı
  + sonunda o harf olan resim (a – kova); harf kartları aynı, herhangi biri herhangi bir resimle
  eşleşir, altında harfin yeri üç küçük kutuyla; oyun başında ne eşleştirileceği söylenir;
  her 2 yanlış eşleştirmede 1 can gider); hece-koprusu (Hece Köprüsü:
  öğretmenin isteği: başta köprü yok, çocuk karşıya geçemez; hece yazılmaz, yalnızca söylenir
  (hoparlörle tekrar); çocuk dereki harf taşlarına dokunup üstteki boş yerlere (hece kadar) sırayla
  koyar; doğruysa hece okunur, taşlar köprü tahtasına dönüşüp sıradaki yere oturur, çocuk o
  tahtaya yürür; bütün tahtalar oturunca köprü tamamlanır, çocuk karşıya geçer; yanlışsa taşlar
  döner, can gider); heceyi-bul (Heceyi Bul: hece söylenir, sırtında hece yazılı balıklar (balik.svg,
  oyunda boyanır) derede yüzer, doğru heceli balığa dokunulur; yanlış balık bir kez can
  götürür); labirent (Labirent: öğretmenin isteğiyle büyük, karışık karesel labirent (7x4, 8x5, 10x5);
  çıkmaz sokak yok, fazladan kısa yollarla çok yol ayrımı (`ekYol`); doğru yolda en az 5/7/9 yol
  ayrımı (`enAzAyrim`, olmazsa yeniden üretilir); hece yalnızca yol ayrımlarında sorulur, düz yolda
  ve dönemeçte karakter kendiliğinden yürür (`adimAt`); yol ayrımında açık her yönde heceli kapı,
  yalnızca söylenen hecenin kapısı çıkışa en kısa yoldan götürür; yanlış hece karakteri o yöne
  götürür, labirentte dolaştırır (can yok); üst üste 2 yanlıştan sonra ipucu; ilerleme çubuğu
  çıkışa yakınlık; yıldız: her 2 yanlış bir eksik; çıkışta hazine).
  seker-patlatma (Şeker Patlatma: harfli şeker tahtası; söylenen hecenin harflerini taşıyan
  komşu şekerleri sırayla kaydırarak ya da dokunarak seç; öğretmenin kararı: harfler baştan sona
  doğru sıradaysa yön serbest (düz, alt alta, kıvrılarak); şekerler patlar, yenileri düşer; hece
  tahtada hep bulunur, bir harften en çok 5 şeker; görsel heyecan: sargılı parlak şekerler, sallanma,
  parıltı, seçili şekerde parlayan halka, patlamada parlama + yıldızlar + sarsıntı + "Süper!" yazısı,
  yanlarda lolipoplar).
  kayak (Kayak: pist yukarı akar, üç şerit; kayakçının sağına/soluna dokunarak ya da
  sürükleyerek şerit değiştir. 1. seviye harf topla (doğru harfli kar topları, yanlış harf ve
  kaya can götürür); 2-3. seviye kapılar Kazma düzeniyle (hecenin harf kapıları / kelimenin hece
  kapıları sırayla, `siraliSecenekler`; yeni sıra önceki geçilince gelir); öğretmenin isteği: doğru top/kapı art arda aynı şeritte olmaz
  (`dogruSeritSec`), kayakçı hep hareket eder).
  elektrik-devresi (Elektrik Devresi: söylenen hece ya da kelime için soldan sağa her sütundan bir
  parçaya kablo çekilir (sürükleyerek ya da sırayla dokunarak); doğruysa ampul yanar, yazılır ve
  okunur; yanlışsa kıvılcım, can gider. 1. seviye harflerden hece (a + n = an), 2. seviye iki heceli
  kelime, 3. seviye üç heceli kelime (`COK_HECELI_KELIMELER`, ortak.js: ta-ne-li, an-ten-li);
  öğretmenin kuralı: yanlış yollardan hiçbiri anlamlı kelime oluşturmaz (`baskaKelimeVar`);
  yeni harf gruplarıyla 4-5 heceli kelimeler de eklenecek).
  duvardan-gecme (Duvardan Geçme: karakter (cocuk-tirman.svg, arkadan) yolda koşar; ufuktan üç
  kapılı tuğla duvarlar yaklaşır; istenen harfin kapısının şeridine geç (dokun ya da sürükle);
  yanlış kapıya çarpınca can gider; öğretmenin isteği: Kayak gibi 1. seviye harf, 2-3. seviyede
  kapılarda Kazma düzeni (2. seviye hecenin harf kapıları, 3. seviye kelimenin hece kapıları sırayla);
  öğretmenin isteği: doğru kapı ne önceki duvardakiyle ne karakterin şeridiyle aynı yerde (`sonDogruSerit`)).
  hece-muzigi (Hece Müziği: 1. seviye ksilofon: heceli tuşlar, oyun melodi çalar (tuş parlar,
  hece okunur), çocuk aynı sırayla basar; 2-3. seviye nota akışı: heceli notalar sağdan sola
  akar, istenen heceli notaya kırmızı çizgide dokunulur; notalar beşli (pentatonik) dizide;
  öğretmenin isteği: aranan hece her 2 doğru notada değişir (`yeniHedef`, `HEDEF_DEGISIM`: kart döner,
  ses, yeni hece söylenir, eski notalar uçar, nota üretimi baştan kurulur; aynı anda iki nota gelmez);
  2-3. seviye bitince yakalanan notalar porteye dizilip hızlıca melodi olarak çalar (yalnızca melodi,
  hece okunmaz; "Senin şarkın!", `finalMelodi`, `SARKI_ADIMI`, sonda akor), sonra "Aferin!"; görsel: süzülen renkli nota
  işaretleri, renkli porte şeritleri, nabız gibi atan çizgi, `notaPatlat` halka + nota parçacıkları).
  scrabble (Scrabble: kelime söylenir, resmi varsa (`KELIME_RESIMLERI`) yanında; raftaki harf
  taşlarına dokununca sıradaki boş yere geçer; yanlış yerdeki taşlar rafa döner, can gider).
  ordek-vurma (Ördek Vurma: panayır standı; ördekler sıra sıra zıt yönlerde kayar, sırtlarında
  harf; doğru harfli ördeğe dokununca nişangâh çıkar, ördek takla atar; yanlış harf can götürür;
  kenardan çıkan ördek yeni harfle döner; Kazma düzeni: 2. seviye hecenin harfli ördekleri, 3. seviye
  kelimenin heceli ördekleri sırayla vurulur; aranan parça değişince `hedefDegisti`).
  kazma (Kazma: toprak ızgarası; dokunulan ya da basılı tutulan yere doğru karakter kare kare
  kazarak ilerler; harfli taşlar (hepsi aynı renk) toplanır, yanlış harf can götürür; kayalar
  kazılmaz; yoldaki taşa yalnızca tam o kare seçildiyse basılır; öğretmenin isteği: 2. seviye harflerle
  hece yaz (hece söylenir, harfleri sırayla kazılıp üstteki yerlere uçar), 3. seviye hecelerle kelime
  yaz (kelimenin heceleri sırayla; `yeniSoru`, `siraliBak`); sırası gelmemiş doğru parça yalnızca
  sallanır, başka parça can götürür; a/n'de harf toplama).
  altin-madencisi (Altın Madencisi: kanca sağa sola sallanır, dokununca iner ve ilk külçeyi çeker;
  bütün külçeler aynı görünür; istenen harf altın (ilerleme), başka harf taşa döner ve yavaş
  çekilir; can yok, kaybetmek yok; Kazma gibi 2. seviye harflerle hece, 3. seviye hecelerle kelime:
  sırası gelmemiş doğru külçe geri gömülür; gereken külçelerin önü hep açık ve kanca açısı içinde).
  kazi-kazan (Kazı Kazan: gümüş kaplama RenderTexture'dan parmakla silinir, altından harfin geçtiği
  resim çıkar (KONUMLU_KELIMELER); yarısı kazınınca ad okunur, üç kutulu seçeneklerden harfin yeri
  seçilir (Resimden Sesi Bul'un tersi; 1. seviye başında/sonunda, 2-3. seviye üçü; `harfinYeri`:
  harf birden çok yerde geçen kelime sorulmaz)).
  tombala (Tombala: öğretmenin isteği: kartta resim, hece ve kelime kutuları (`kutulariSec`; 1. seviye 2 resim
  2 hece, 2. 1 resim 2 hece 1 kelime, 3. 2+2+2); torbadan top çıkar: resim için harf (o sesle başlayan resme
  pul), hece/kelime için aynısı (yazılı kutuya pul); resimler `basResimleri` (başında bilinen harf), hece
  `heceHavuzu`, kelime `ogrenilmisKelimeler`; yetmezse kutular tekrar eder; 2-3. seviyede kartta olmayan
  top da çıkar, "Kartımda yok" düğmesine basılır; satır dolunca "Çinko!", kart dolunca "Tombala!").
  arabayi-ulastir (Arabayı Ulaştır: arabadan başlayıp bitiş bayrağına parmakla yol çizilir;
  araba yolu izler, doğru harfli durakları toplar; yanlış durakta durur, can gider; bitişe varıp
  durak eksikse eksikler parlar, araba başa döner (can gitmez); Kazma gibi 2. seviye hecenin harf
  durakları, 3. seviye kelimenin hece durakları sırayla; sırası gelmemiş durakta başa döner).
  yakala-yaz (Yakala ve Yaz: kelime söylenir, çantada harf yerleri boş; uçuşan harf yaratıklarına
  dokununca ağ iner (en yakın yaratık); öğretmenin isteği: harfler sırayla yakalanır (`sirasiGelen`),
  sırası gelmemiş harf yalnızca sallanır, kelimede olmayan can götürür;
  uçanlar arasında gereken harf hep bulunur).
  kirik-cam (Kırık Cam: her seviyede camı kır: buzlu camın üstündeki oyunun harflerine dokununca
  cam çatlar, hepsi bulununca kırılır, arkadaki resim (harfle başlayan kelime, KONUMLU_KELIMELER bas)
  çıkar ve adı okunur; seviyeyle resim ve yanlış harf sayısı artar, 2-3. seviyede benzer harfler).
  bombayi-kurtar (Bombayı Kurtar: sevimli bomba yavaşça geri sayar; harf etiketli kablolardan
  istenen harfinkine dokununca kesilir, bomba konfetiye döner; yanlış kablo kıvılcım, can gider;
  süre biterse patlama yok, yalnızca "puf" dumanı ve can gider; korkutucu değil; Kazma gibi 2.
  ve 3. seviyede bomba bölmeli: her harf/hece için bir bölme (4 kablo), bölmeler sırayla açılır, doğru
  kesilen bölmenin lambası yeşil yanar (`bolmeleriKur`); parça başına süre uzar).
  yilan (Yılan: yılanın başına göre gidilecek yöne dokunulur; Kazma gibi 1. seviye istenen harfi ye
  (yanlış harf yalnızca uyarı), 2. seviye hecenin harflerini, 3. seviye kelimenin hecelerini sırayla
  ye (sırası gelmemiş yem kaçar, başkası can götürür); yenen gövdede görünür; duvar/kendine çarpma yok).
  Ortak sıralı düzen: `siraliKur`, `siraliSoruSec`, `siraliParcaAl` (ortak.js).
  canavari-besle (Canavarı Besle: canavar konuşma balonunda harf ister (ünlü söylenir; başka harf yalnızca önceki harflerden, a'da hep a); masadaki
  harfli meyve canavara doğru sürüklenip bırakılır (1. seviyede dokunmak yeter), kavisle ağzına
  uçar; doğruysa yer ve büyür, yanlışsa yüzünü buruşturup tükürür, can gider; Kazma düzeni: 2. seviye
  hece, 3. seviye kelime istenir (balonda hoparlör), parçalı meyveler sırayla; sırası gelmemiş meyve geri döner; her seviyede
  başka canavar (`CANAVARLAR`: boynuzlu yeşil, tek gözlü tüylü mor, üç gözlü kanatlı mercan), her karede
  çizilir: nefes, göz kırpma, meyveyi izleyen gözler, yaklaşınca açılan ağız; `lokmaYedi`: çiğneme,
  şişme, kırıntı, kalpler, yaylanarak büyüme; yanlışta yeşeren yüz; kazanınca zıplar).
  harf-kesme (Harf Kesme: meyveler aşağıdan havaya fırlar (yerçekimi); parmağın kaydığı çizgiye
  değen meyve kesilir (dokunmak da keser); doğru harf ikiye ayrılır, yanlış harf can götürür,
  kaçan meyve ceza değil; seri kesim: tek kaydırışta 2+ doğru meyve "2'li kesim!" yazısı).
  hece-kulesi (Hece Kulesi: önce söylenen hece üstteki üç karttan seçilir; sonra hece bloğu
  vinçte sallanır, dokununca düşer; kulenin üstüne oturursa kule büyür, ıskalarsa aynı hece
  yeniden vince gelir (1. seviyede can gitmez); kule yükseldikçe aşağı kayar; kelime kurulmaz).
  birlestir-buyut (Birleştir Büyüt: 4x4 tahta, 2048 gibi kaydırılır (parmak ya da ok tuşları);
  okuma yönünde yan yana gelen ünlü + ünsüz hece olur (ünlü taşlar kırmızı, ünsüzler
  yeşil-mavi, heceler sarı); 3. seviyede heceler kalır, iki hece KELIMELER'deki bir kelimeyi
  kurarsa kelime olur; tahta dolunca en eski taşlar uçar; can yok).
  harfle-boya (Harfle Boya: `BOYA_RESIMLERI` (harfle-boya/resimler.js; 12 resim, gerçekçi renkler;
  seviye 1 ev/çiçek/ağaç/balık, 2 gemi/kelebek/araba/kedi, 3 fener/tren/kale/roket, seviyeyle daha çok
  bölge; `detay` harfsiz süs resim bitince boyanır, `cizgi` hep görünür) basit biçimlerden bölgeler; her
  bölgede harf; istenen harfli bölgeye dokununca boyanır; doğrular bitince kalan bölgeler sırayla
  boyanır; üstte kalan bölgenin harfi görünmüyorsa `lx, ly` ile harf yeri verilir; öğretmenin isteği:
  boyanmamış bölge beyaz, beyaz ya da çok açık boya rengi koyulaşır `boyaRengi`).
  harf-firtinasi (Harf Fırtınası: art arda kısa görevler; önce görevin adı büyükçe çıkar
  ("Dokun!", "Patlat!", "Seç!", "Resim!", "Yakala!"), sonra süre çubuğu akar; süre biterse ya da
  yanlış seçilirse can gider, sıradaki göreve geçilir; seviyeyle görev sayısı artar, süre kısalır,
  3. seviyede benzer harfler; öğretmenin kuralı: sorulan yalnızca bilinen harflerden, "Resim!" resimleri
  `basResimleri` (çoğunlukla oyunun harfi, arada önceki harfler); yanlış seçenekler önce bilinen harflerden).
  Hecelerine ayrılmış ortak kelime listesi `KELIMELER`, `ogrenilmisKelimeler(harf)` (ortak.js;
  yalnızca öğrenilmiş harflerle yazılabilen kelimeler).
  Hece havuzu ve seviyeye göre hece sorusu ortak: `heceHavuzu`, `heceSorusu` (ortak.js).
  Öğretmenin kuralı (bütün hece oyunlarında): seviyeyle hece uzar: 1. seviye iki harfli (an, na),
  2. seviye üç harfli (tat, lal, net), 3. seviye dört harfli (`heceUzunlugu`; ilk harf grubunda
  dört harfli hece yok, 3. seviyede üç harfli heceler zor seçeneklerle: tek harfi değişen, ters).
  Yanlış seçenekler hep aynı uzunlukta. Kayak'ta hece 2. seviyede başlar (seviye - 1).
  Öğretmenin kuralı (bütün hece ve kelime oyunlarında): harfler sırayla öğrenilir (a, n, e, t, i, l);
  yalnızca o harfe kadar (kendisi dahil) öğrenilmiş harfler kullanılır (`bilinenHarfler`: e'de a n e;
  heceHavuzu, ogrenilmisKelimeler, hece oyunlarının harf taşları). Yeterli hece/kelime yoksa oyun o
  harfte iptal: `PLANLANAN_OYUNLAR`'da `gereken: "hece" | "kelime"`, `miniOyunOlur(ad, harf)`
  (`heceOyunuOlur`: en az 3 iki harfli hece; `kelimeOyunuOlur`: en az 3 kelime) → a ve n'de hece
  ve kelime oyunları yok; menüde kart soluk "Bu harfte yok", Oyun Lambaları'nda yanmaz. Yeniden
  düzenlemeler: o uzunlukta yeterli hece yoksa iki harfli sorulur (`heceSorusu`; e'de 2-3. seviye);
  Kayak ve Duvardan Geçme'de hece yoksa 2-3. seviye de harf; Harf Fırtınası'nda "Seç!" görevi
  çıkmaz; Elektrik Devresi 3. seviyede üç heceli kelime azsa iki heceli kelimeler.
  Harf oyunlarında yanlış seçenekler için grubun bütün harfleri kullanılmaya devam eder
  (`ogrenilmisHarfler`; a'da başka harf olmadığı için).
  Birleştir Büyüt ve kelime oyunları (Elektrik Devresi, Scrabble, Yakala ve Yaz) kendi düzeninde.
  Hoparlör çizimi ortak: `hoparlorCiz`. Ortak "Yakala:/Patlat:" paneli
  `hedefPaneliKur`.
  Etiketler: `PLANLANAN_OYUNLAR`'da her oyunun `etiketler`i ("harf", "hece" ya da ikisi; oyunun
  neyin öğretimine uygun olduğu). İlk dağılımı Claude yaptı, öğretmen değiştirir. Menü kartının
  altında rozet olarak görünür (`ETIKET_RENKLERI`: harf kırmızımsı, hece sarı).
  Öğretmenin isteği: menüde seviye seçicinin sağında etiket süzgeci (hepsi / harf / hece;
  `secilenEtiketler`, `oyunListesi`): harf ve hece birlikte seçilebilir; oyunun etiketleri seçilenlerle
  tam aynı olmalı ("harf" yalnızca harf etiketliler, ikisi birden yalnızca iki etiketliler); hiçbiri
  seçili değilse "hepsi".
  Menü sayfalıdır (kartlarda oyunun simgesi; sayfada 8 kart, oklar ya da parmak kaydırma); listede öğretmenin
  fikirleri ve araştırmadan gelen fikirler "Yakında" olarak durur, sırayla yapılır.
- Mini oyun ilkeleri (öğretmenin isteğiyle yapılan araştırmadan; her yeni mini oyunda uygulanır):
  1. Göster, anlatma: ilk turda gösteren el (el.svg) nereye dokunulacağını gösterir
     (`elGoster`, sürüklemede `elSurukleGoster`; sayfa açık kaldıkça her oyunda bir kez).
  2. Her doğruya anında tepki: ses + parıltı + ilerleme çubuğuna uçan yıldız
     (`ilerlemeArtir(x, y)`).
  3. Nazik hata: yanlıştan sonra doğru nesne hafifçe büyüyüp küçülür (`ipucuGoster`).
  4. Kolay başlangıç, kademeli zorluk; oyun 1–2 dakika sürer.
  5. Büyük dokunma alanları (çocuk parmağı; telefonda en az ~2 cm): dokunma alanı
     görselden geniş tutulur.
  6. Dürüst ödül: bitişte kalan cana göre 1–3 yıldız ve konfeti; sonsuz puan yok.
  7. Öğretime bağlı: yalnızca öğrenilmiş harfler; ses ve resimle desteklenir.
- `harfler.js` – Harf grupları ve kelimeler (sadece veri).
- `canta.js` – Karakterin çantası (envanter). Kaydedilmez; sayfa yenilenince oyun baştan başlar.
- Tarla: karakterin başladığı yerin üstünde çitli tarla, 6 kare yan yana tek sıra
  (`tarlaKur`, tarla.svg).
  Çanta yalnızca sağdaki simgeden açılır (karaktere dokununca açılmaz; öğretmenin isteği).
  Çanta açıkken bir tohum tutulunca pencere silikleşir; tohum boş bir kareye bırakılırsa
  ekilir (ekili-tohum.svg), kare doluysa ya da tarla dışına bırakılırsa çantaya döner.
  Tarla da kaydedilmez.
- Dünya 6400x4200; ada üstteki 6400x3600'lük alanın ortasında (`ADA_YUKSEKLIK`), altta
  iskele için geniş deniz var. Ada, süs ve sandık yerleri ADA_YUKSEKLIK ile hesaplanır.
- Su arıtma tesisi: alt kıyıda, başlangıcın güneyinde (`tesisKur`, su-tesisi.svg); kıyıdan
  uzun bir iskeleyle (`ISKELE_EK`, doodle_ciz.py'de de aynı) ulaşılır, karakter iskelede
  yürüyebilir. İskeleye dokununca karakter iskelede oraya yürür (`iskeledeYuru`; iskeledeyse doğrudan,
  değilse önce başına); tesise dokununca iskelenin ucuna yürür, panel açılır
  (tesis-pencere.svg: solda su tankı, üstte boru). Her harfin bir varili var (varil.svg,
  musluklu): varil, o harfin tohumu tarlaya ekilince belirir (`varilGetir`); güvertede küçük
  varil (su-tesisi.svg'deki boru ağızlarının altında, `VARIL_YERI`), panelde borunun altında
  büyük varil (`PANEL_VARIL_YERI`; yeni varil panel açılınca borudan iner). Harf düğmesi yok.
  Varilden damla iki aşamada alınır (`varileDokun`): 1) varil boşsa (ağzı koyu) ana tanktan boru
  boyunca bir damla gelir, varil dolar (`tanktanVarile`); 2) varil doluysa Oyun Lambaları açılır
  (`minioyunlar/lambalar.js`, `OyunLambalariSahnesi`; öğretmenin fikri, çarkın yerine: her oyunun simgesi
  bir lambada (gorseller/simge-<ad>.svg, doodle_ciz.py `simge`); uygun lambalar rastgele yanıp söner,
  yavaşlar, seçilen yanık kalıp ortaya gelir, adı söylenir. Öğretmenin kuralı (`damlaOyunlari`, ortak.js;
  `kazanilanDamla`): harfin 1. damlası yalnızca harf, 2. harf + hece, 3. yalnızca hece oyunu; hece oyunu
  yoksa (a, n) harf + hece; bu harfte çıkan oyun yeniden çıkmaz (`oynananOyunlar`)), çıkan mini
  oyun o harfle 1, 2, 3. düzeyde art arda oynanır (`zincir`: kazanınca "Devam", sağ üstte
  "Düzey 1 / 3"; ada sahnesi uyur), 3. düzey bitince ada uyanır ve varilden şişeye bir damla
  akar (`miniOyundanDon`, `siseyeDamla`). Yarıda "Geri" denirse damla yok, varil dolu kalır.
  Şişede o harften 3 damla varsa (harf başına en çok 3, `Canta.damlalar`) varil yalnızca sallanır. Şişe ilk damlayla çantaya gelir. Kaydedilmez.
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
  sallanmaz, adadaki sırığın solan tepesinde silik bir bulut var. Bulutların üstünde
  karakter zeminin arkasından görünmeden çıkar, zemin üstüne gelince zıplayıp buluta basar;
  inerken sırığa zıplayıp bulutun arkasına iner; tırmanır ve bulutların üstüne çıkar
  (`BulutSahnesi`; ada sahnesi uyutulur, durumu korunur). Her harfin kendi bölgesi var;
  şimdilik bölgede harfin büyük tabelası durur, içeriği sonra eklenecek. Karakter bulut
  zemininde gezer; sırığa dokununca aşağı iner ve adada o sırığın dibine döner.
- Yelkenli (adadan kurtulma hedefi): iskelenin sağındaki kumsalda kızakta (`yelkenliKur`,
  `YELKENLI_X/Y`, `YELKENLI_PARCALARI`). Her harfin bir parçası: a gövde, n direk, e bayrak,
  t dümen, i kürek, l yelken (öğretmenin kararı). Bütün yelkenli resimleri aynı 680x440 tuvalde
  (yelkenli-kizak.svg, yelkenli-<parça>.svg ve kesik çizgili yelkenli-<parça>-silik.svg;
  doodle_ciz.py). Başta bütün parçalar silik, yanlarında harfi silik bir yuvarlakta.
  `YELKENLI_ALANI`nda süs yok. Parça takma: çanta açıkken parça tutulur (`parcayiTut`; pencere
  silikleşir, yelkenlide parçanın yeri sarı parlar), yerinin üstüne (`alan`, parçanın kutusu +
  80 px) bırakılınca takılır (`parcayiTak`: dolu hâli, koyu harf, parıltı); başka yere
  bırakılırsa çantaya döner. Sol üstte, menünün altında "Görev" düğmesi (`yelkenliKartiKur`; yelkenli resmi yok).
  Dokununca görev listesi açılır/kapanır (`gorevListesiniCiz`): başlamış her harf için 4 adım simgesi
  (sandık, tohum, damla, parça; biten tikli, şimdiki zıplar) ve kısa yazı; sulamada 3 damla. Bir parça
  alınınca ayrı "yelkenli" satırı çıkar (6 parça simgesi, "Parçaları yelkenliye tak. 2 / 6"). Satıra
  dokununca yazı okunur; yelkenli satırında karakter yelkenliye yürür (`YELKENLI_DURAK`). Altı parça takılınca kutlama ("Yelkenli hazır! Aferin!") ve
  yelkenlinin altında, denizde parlayan "Yola çık" düğmesi (`yelkenliHazir`; öğretmenin seçimi B).
  Basınca ada uyur, final sahnesi açılır (`FinalSahnesi`: çocuk biner, yelkenli suya kayar;
  gün batımı; adalar haritası "2. ada yakında"; sözler sesli; hikaye-gunbatimi.svg,
  hikaye-harita.svg). Tekne suda yüzer görünsün diye denizin ön kısmı (aynı arka plan resmi,
  `setCrop` ile yalnızca su) teknenin önüne konur, gövdenin altı suda kalır. "Adaya dön" ile
  ada kaldığı gibi uyanır.
  Parça bulutların üstünde alınır (`BulutSahnesi`): tabelanın üstünde köpük balonun içinde
  süzülür (`balonKur`); karakter tabelaya yaklaşınca mikrofon çıkar, tek aşama: harf sesle
  dolar ("Parçayı almak için gücünü göster!"; Ada'daki `harfiDoldur` aynen kullanılır, 30 sn'de
  kendiliğinden onay), balon patlar, parça çantaya girer (`Canta.parcaEkle`, çantada
  yelkenli-<parça>-simge.svg; `Canta.alinanParcalar` ile balon bir daha çıkmaz).
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
- `kayit.html` – Öğretmenin kendi sesiyle oyunun sözlerini kaydettiği sayfa (oyundaki bütün sözler: harf sesleri,
  heceler, kelimeler, resim adları, yönergeler, ekrandaki uyarılar, oyun sözleri, mini oyun adları; listeler harfler.js, ortak.js ve resimden-ses/kelimeler.js'den,
  oyun sözleri sayfada yazılı: oyuna yeni söz eklenince oraya da eklenmeli). Kayıtlar yalnızca
  o tarayıcıda (IndexedDB) durur; sessizlik kesilir, ses eşitlenir, WAV (24 kHz). Öğretmenin isteği:
  yalnızca seçilenler indirilir (satır başındaki kutu; seçim localStorage'da; yeni kayıt kendiliğinden
  seçilir; "Yenileri seç" kaydedilmiş ama `SES_DOSYALARI`'nda olmayanları seçer; oyunda olanlarda "Oyunda
  var"). "Seçilenleri indir" zip verir (sesler/<anahtar>.wav + liste.json). Heceler: heceHavuzu +
  kelimelerin üç harfli heceleri (lan, nat...). Mini oyun yönergeleri ortak.js `YONERGELER`'den.
- `dinle.html` – Öğretmenin oyundaki yapay zekâ seslerini dinlediği sayfa (sesler/liste.js'den;
  bölüm bölüm ▶ ve "Beğenmedim"; işaretler localStorage'da; "Listeyi kopyala" Claude'a verilir,
  beğenilmeyenler öğretmenin kendi sesiyle kayit.html'de kaydedilir).
- `sesler.js` – Oyun sesleri. Efektler tarayıcıda (Web Audio) üretilir.
  Sözler öğretmenin kendi sesi (kayit.html, 251 dosya; `araclar/peri_efekti.sh` ile peri efekti,
  hecelerde az yankı, fırtına/ada sözlerinde peri ses + rüzgâr/dalga; `Sesler.dosyaSesleri = true`).
  Sesli okuma `Sesler.soyle`: söz `sesler/liste.js`'de (`SES_DOSYALARI`, söz → dosya) varsa
  `sesler/<dosya>.mp3` çalınır (Web Audio; dosyalar ilk dokunuştan sonra arka planda yüklenir).
  Sesler Azure'un yapay zekâ sesleriyle üretildi (öğretmenin seçimi: harf, hece ve kelime
  Harper; kutlama Elif "heyecanlı"; hikâye, final sözleri ve mini oyun adları Ava). Liste
  `araclar/ses-listesi.js`, üretim `araclar/seslendir.py` (yalnızca eksikleri üretir; anahtar
  ortam değişkeniyle verilir, ASLA dosyaya ya da depoya yazılmaz). Oyuna yeni sesli söz
  eklenince ses-listesi.js'e de eklenmeli. Dosyası olmayan sözde tarayıcı sesi: cihazdaki en doğal Türkçe ses seçilir (`turkceSes`: önce
  "Natural/Online" sesler (Edge), sonra Google, sonra herhangi bir Türkçe ses; hız 0.9).
  Telefonda ilk dokunuşta ses motoru ısıtılır, önceki söz
  susturulunca kısa ara verilir, güvence süresi ses başlayınca yeniden kurulur (yavaş
  telefonda sözler kesilmesin). Susturmak için `Sesler.sustur`.
  Telefonda tarayıcı sesi yalnızca parmak kalkınca açmaya izin verir; bu yüzden ses ve
  sesli okuma her dokunuşun sonunda (pointerup/touchend) açılır (sesler.js sonu).
  Parmak değdiği an (pointerdown) çalınmak istenen efektler ses henüz açılmadıysa kaybolmasın
  diye bekletilir (`Sesler.calabilir`, `bekleyenler`, en çok 1,5 sn) ve ses açılınca çalınır;
  iOS için açılışta duyulmayan kısa bir ses çalınır. Yeni efekt yazarken `calabilir` kullanılır.
  iPhone/iPad'de sessiz mod düğmesi açıkken Web Audio efektleri hiç duyulmaz (sesli okuma duyulur;
  öğretmen iPhone 11 Chrome'da notaları ve kutlama sesini duymadı). `iosSesiniAc`: ses oturumu
  "playback" (navigator.audioSession) ve dokunuşta döngülü sessiz bir <audio> çalınır; sayfa
  gizlenince durur.
- `yazitipi/` – Andika yazı tipi ve lisansı (SIL Open Font License).
  Öğretmenin isteği: cihazda TTKB Dik Temel Abece (Bold, MEB'in dik temel harf yazı tipi) kuruluysa
  oyun onu kullanır (index.html `yaziTipiHazir`: `local()` ile, %120 büyütülür; kodda ad yine
  "Andika"); kurulu değilse Andika. TTKB'nin telifi yazarına (Prof. Namık Kemal Sarıkavak) ait;
  dosyası depoya KONMAZ. Öğretmen yazardan izin isteyecek; izin gelirse dosya eklenebilir.
- `gorseller/` – Kendi çizdiğimiz SVG görseller. Bütün oyun doodle tarzında: titrek kalem
  çizgisi (SVG içinde feTurbulence/feDisplacementMap süzgeci), boya kalemi taraması,
  kareli defter kâğıdı zemin (doku-*.svg, kesintisiz döşenir). Pencereler de SVG:
  canta-pencere.svg, dusunce-balonu.svg, guc-bandi.svg.
- `araclar/doodle_ciz.py` – Karakter, sandık ve pusula dışındaki doodle görselleri üretir
  (`python3 araclar/doodle_ciz.py`). Görsel değişikliği bu betikte yapılıp yeniden üretilir.
- Phaser 3, sabit sürümle (3.90.0) jsDelivr CDN'den yüklenir. Sürüm numarası
  rastgele değiştirilmez.
- Yayın: GitHub Pages (kök klasörden). Kökteki `.nojekyll` Jekyll derlemesini kapatır (dosyalar olduğu gibi
  yayınlanır; Jekyll adımı GitHub'da zaman aşımına düşüp yayını durdurmuştu).
- Peri rehber (`oyun.js`, AdaSahnesi `periYap`, `periSoyle`, `periTanisma`; `PERI_TANISMA` sözleri):
  yaprak perisi (gorseller/peri.svg + peri-kanat.svg, elle çizildi; kanatlar çırpar, peri süzülür).
  Hikâyeden sonra (`periTanisma: true`) sağdan uçarak gelir, konuşma balonuyla kendini tanıtır,
  sonra ortada anlatım penceresi açılır (`anlatimAc`, `PERI_ANLATIM` 8 sayfa: yelkenli, sandık,
  radar canlandırması `anlatimRadari`, tarla, su tesisi, şişeyle sulama, bulut, görev düğmesi (gerçek
  düğme parlar, el gösterir); peri her sayfayı söyler, sonra karakterin omzuna
  uçar (`periOmzaUc`; "Devam et"te doğrudan omuzda `omuzPerisiYap`, God mode'da yok). Omuzda karakteri
  izler (`omuzPerisiniGuncelle`) ve her işi ilk kez gösterir (`rehberOlay`, `rehberSec`): olay gelince
  balon (ekran katmanı, dokununca yeniden okunur) ve gösteren el; ipucu "tamam" olayına kadar başlangıç
  olayında yeniden çıkar (yürü, sandık, tohumu çantadan tarlaya, tesis, varil, şişeyle sula, sırık "Çık",
  parçayı yelkenliye). Peri küçük (`PERI_OMUZ_OLCEK`); balon söz bitince kaybolur, el iş yapılana kadar
  kalır, periye dokununca söz yeniden çıkar. İlk sulamadan sonra genel yönlendirmeyi yapıp uçup gider
  (`periAyril`); ilk bulut ziyaretinde orada buluşur (`periBulustur`, `periBalonu`), buluttan inince
  yine omuzdadır.
- Mini oyun yönergesi (ortak.js `YONERGELER`, `SIRALI_YONERGELER`, `YonergeSahnesi`): `ortakKur` oyunun
  sözlerini bekletir (`Sesler.bekletme`); kurulum bitince (`yonergeBaslat`) oyun durur, üstte peri yönergeyi
  söyler, "Başla" ile oyun sürer ve bekleyen sözler söylenir (`bekletmeyiBitir`). Sıralı oyunlarda hece/kelime
  turunda sıralı yönerge. Her yönerge sayfa açık kaldıkça bir kez. dene.js'de kapalı (`YONERGE=1` ile açılır). Peri balonunda "İleri"
  düğmesi (son sözde "Tamam"); kendiliğinden geçmez, balona dokununca söz yeniden okunur. Konuşurken karakter yürümez.
  Sözler kayit.html "Peri" bölümünde (öğretmen kaydeder).

## Profil ve karne (profil.js)
- İlk ekranda profil yoksa ana düğme "Profil oluştur": `ProfilPaneli` penceresi ("Kim oynuyor?") açılır:
  profiller (hayvan + takma ad, altında sesi denenmiş harfler ve toplam yıldız), "+" (hayvan seç, takma adı
  veli yazar: `metinSor`; kutuya dokunuş oyuna geçmez), kart köşesindeki kırmızı "x" siler (onaylı).
  Seçilen profilin hayvanı adını taşıyarak adada çocuğun yanında durur (`profilGoster`), dokununca pencere
  açılır (profil değiştirme); düğme "Oyunu başlat" olur. "Mini Games" de profilsizse pencereyi açar.
  God mode profil seçmez, sayılmaz. Veri: `ilerlemeArtir` doğru, `kalpEksilt` yanlış, `bitir` oyun sonucu
  (ortak.js), `harfiDinle` ses sonucu (1 kendisi, 2 ipucuyla, 3 oyun onayladı).
- Karşılamada "Karne" → şifre (karnebak) → `KarneSahnesi`: profil seçilir; her harfin sesi, mini oyun
  doğru/yanlış, eksikse "Tekrar edilecek"; zorlandığı oyunlar; "Karneyi kaydet" (resim indirir), "Profili sil".
