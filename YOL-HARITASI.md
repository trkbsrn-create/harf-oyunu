# Harf Oyunu yol haritası

Proje sahibi kodlama bilmeyen bir 1. sınıf öğretmeni. Oyun kendi sınıfında kullanılacak. Her işte tek küçük adım at, önce planı anlat.

## Etaplar
1. Kurulum: GitHub hesabı, depo, Claude Code bağlantısı. TAMAM.
2. İlk görüntü: proje kuralları, "Merhaba Ada" sayfası, GitHub Pages yayını. TAMAM.
   Mikrofon testi sayfası (mikrofon.html; söylenince Chrome'un ne duyduğunu gösterir): TAMAM.
3. Tek kutu: büyük bir ada, adada gezen ana karakter (bir çocuk; dokunarak ve yön tuşlarıyla yürür), adada gizli "a" kutusu (karakter arayıp bulur, kutu öyle açılır), ses doğrulama (3 basamak: ses, hayvan kelimesi, otomatik onay), tohum ödülü.
   - Büyük ada ve gezen karakter: TAMAM.
   - Gizli kutu (hazine sandığı; çalı arkasında, karakter yaklaşınca görünür, dokununca ya da değince açılır, içinden "a" çıkar), yürüme tozu ve ayak sesi, hazine efekti: TAMAM.
   - Hazine sensörü (karakterin çevresinde yaklaştıkça belirginleşen altın aura, yürürken sıklaşan ve incelen bip sesi): TAMAM.
   - Canlı ada (karakter adım atarak yürür, ağaç tepeleri ve çalılar rüzgârda sallanır, denizde köpük, dalga ve pırıltı): TAMAM.
   - Uçan martılar ve kelebekler, rüzgârda sallanan çiçek ve otlar, gölgesi geçen bulutlar: TAMAM.
   - Çanta/envanter (köşedeki düğme, karaktere dokunma veya boşluk tuşu ile açılır; 8 kutucuk; kaydedilmez, sayfa yenilenince oyun baştan başlar), harf tohuma dönüşüp çantaya uçar, açılmış sandık adada küçük ve sönük kalır: TAMAM.
   - Ses doğrulama (3 basamak: dinleme, 3 denemeden sonra arı resmi ipucu, 5 denemeden sonra kendiliğinden onay ve "tekrar edilecek" notu; zaman aşımlı, hata ekranı yok); tohum ancak bundan sonra çantaya gelir: TAMAM. Kelimeler gerçek mikrofonla çalışıyor; Chrome tek "a" sesini yazıya çeviremediği için ünlülerde ses yüksekliği ölçümü eklendi (yarım saniye net ses yeterli), gerçek mikrofonla denenecek.
   - Ünlü harf dolum çubuğu: "a" uzatılarak söylendikçe aşağıdan yukarı altın sarısıyla dolar (6 sn), ses kesilince önce yavaşça boşalır, 3 kesintiden sonra kaldığı yerde durur; 20 sn'de arı ipucu ("arı" kabul), 40 sn'de kendiliğinden onay: TAMAM. Gerçek mikrofonla denenecek.
   - Dolum süresi tüm harfler için 3 saniye: TAMAM.
   - İkinci sandık (n): "a" tohumu çantaya girince devreye girer, sensör onu gösterir; "a"dan uzak bir çalının arkasında. Öğretmenin kararıyla önce tek başına "nnnn" uzatılarak denenir (dolum çubuğu); 20 sn'de olmazsa çantadaki "a" tohumu uçup "an" hecesini kurar ve nar resmi çıkar ("an" ya da "nar" kabul); 40 sn'de kendiliğinden onay: TAMAM. Gerçek mikrofonla denenecek ("an" Chrome'da nasıl yazılıyor bakılacak).
   - "a" sesinin tınısıyla tanınması (o, u, e, i, gürültü reddedilir): önce "a" denir, düşünce balonu, doğruysa "Tohumu kazanmak için gücünü göster!" ve yalnızca "a" sesiyle dolan bar; mikrofon.html'de "a" denetimi ve ölçümler: TAMAM. Gerçek mikrofonla denenecek; başarılı olursa "n" için de güncellenecek.
   - Doodle tarzı denemesi: örnek sahne gösterildi; karakter ve sandık doodle tarzına çevrildi: TAMAM. Diğer görseller kullanıcının kararına göre.
   - Tını kuralı gerçek seste "a"yı reddetti: ilk onay yeniden yarım saniye net sese döndü (Chrome kelimeleri de geçerli), güç aşaması her net sesle doluyor (kullanıcı isteği): TAMAM.
   - Hazine pusulası (eski aura yerine): doodle tarzı 3 halka × 4 yön parça; dış halka oyunun başından silik yanar, ortanca ~1,5 ekranda, iç ~yarım ekranda yanar; sandığa bakan parçalar parlar ve nabız gibi atar. Sandık ancak saklandığı yerin hemen yanında (110 px) çıkar, çıkınca pusula söner; çıkma hareketi bitmeden üstüne yürüyünce açılmaz: TAMAM.
   - Pusula efektleri: içten dışa radar dalgası gibi yanıp sönme, nabızla büyüyüp küçülme, doodle çizgilerin kıpırdaması, sandık yönüne fırlayan yıldızcıklar (yaklaştıkça sıklaşır): TAMAM.
   - Bütün tasarım doodle tarzında (karakter, sandık ve pusula olduğu gibi kaldı): defter kâğıdı zemin, taranmış deniz/kum/çimen, kalemle çizilmiş kıyı, ağaç, çalı, kaya, çiçek, ot, kelebek, martı, çanta, tohum, mikrofon, arı, nar, çanta penceresi, düşünce balonu, güç bandı: TAMAM. (4. etaptaki "görünüm stilini seçme" bununla yapılmış oldu.)
   - Oyunun adı "Harf Avcısı". Karşılama ekranı (denizde küçük ada, ad tabelası, "Oyunu başlat" düğmesi) ve sol üstte menü ("Oyunu yeniden başlat", önce "Baştan başlasın mı?" diye sorar): TAMAM.
   - Doodle yazılar: başlık, düğme ve pencere yazıları boya kalemiyle taranmış ve titrek; sandık harfi ve çantadaki harfler aynı biçimde, sadece titrek kalem kenarlı: TAMAM.
   - "n" sandığı da düşünme ve güç akışında ("a" ile aynı; ipucundan sonra "an" hecesi ve "nar" da kabul): TAMAM.
   - İlk harf grubu tamam: a n e t i l sandıkları adaya dağıldı, hepsi düşünme ve güç akışında. Eşek, tilki, inek, leylek ipucu resimleri. Öğretmenin kararı: bütün ünsüzler önce sadece sesiyle denenir; "t" uzatılamadığı için kısa ses yeter, güç aşamasında her kısa sesle dolar. İpucu heceleri: an, at, al: TAMAM.
   - Oyunun ilk sürümü yalnızca ilk harf grubuyla (a n e t i l) yapılacak. Önce geliştirmeler, diğer harf grupları en sonda.
   - Tarla: başlangıç yerinin solunda çitli 6 kareli tarla. Çantadan tohum tutulup boş kareye sürüklenince ekilir (tümsek, filiz, harf); dolu kareye ya da tarla dışına bırakılırsa çantaya döner: TAMAM.
   - Mini harita (sol alt, kâğıt kart): bütün ada, tarla, karakter, ekranda görünen bölge, açılmış sandıklar (kırmızı çarpı); kapalı sandıklar görünmez: TAMAM.
   - Su ve büyüme (3 aşama): 1) Su arıtma tesisi (alt kıyıda, iskeleli), harf düğmeli panel, damla toplama, çantada sihirli su şişesi: TAMAM. 2) Şişeyi inceleme ("İncele" düğmesi, harf bölmelerinde damlalar): TAMAM. 3) Şişeyi tarladaki tohuma sürükleyip sulama; tohum → filiz → küçük ağaç → büyük ağaç: TAMAM. (İleride aşama sayısı artırılabilir.)
   - İskele uzatıldı (dünya aşağı doğru genişletildi, 560 px daha uzun iskele): TAMAM.
   - Son aşama: büyük ağaç yerine gökyüzüne uzanan fasulye sırığı (tepesi bulutlarda): TAMAM.
   - Sırığa tırmanma: sırığa dokununca karakter tırmanır, bulutların üstüne çıkar (her harfin kendi bölgesi; şimdilik harf tabelası), gezer, sırıktan inip adaya döner: TAMAM. Bölgelerin içeriği sonra konuşulacak.
   - Karşılama ekranında sağ üstte sürüm yazısı ("Sürüm 37"); her güncellemede çekme isteği numarasıyla artar: TAMAM.
   - "God mode" düğmesi (karşılama ekranı, sol üst; deneme için): bütün sandıklar açık, altı tohum çantada başlar: TAMAM.
   - Sırıklar üst üste gelince seçilemiyordu: adadaki sırık kısaldı ve yukarı doğru solarak kayboluyor; tırmanmak için sırığın toprak karesine dokunuluyor: TAMAM.
   - Tarla tek sıra (6 kare yan yana); tırmanma/inme gerçekçi (arkası dönük, kollar sırayla, basamak basamak); sırıklar sallanmıyor; God mode altı sırıkla başlıyor: TAMAM.
   - Adada tırmanırken arkadan görünüm düzeltildi; bulutta karakter zeminin arkasından çıkar/iner, zıplayarak buluta basar; sırık tepelerinde silik bulut: TAMAM.
   - Mini oyunlar (beyin fırtınası kararları): su damlaları ileride mini oyunlarla kazanılacak; her damla 3 parça, her kazanılan mini oyun 1 parça (bir harf için yaklaşık 9 oyun). Mini oyunlarda kaybetmek var (3 can, "Bir daha dene"). Sesli okuma: tarayıcının Türkçe sesi. Mikrofonlu mini oyun şimdilik yok. Süreler harfe göre (kısa harflerde ~30 sn, uzunlarda 60–90 sn).
     Planlanan oyunlar: Damla Yakalama, Harf Balonları, Harfi Çiz, Resimden Sesi Bul, Hafıza Kartları, Hece Köprüsü, Heceyi Bul (oyun heceyi sesli söyler, çocuk aynı heceyi seçer). Öğretmen kendi fikirlerini de verecek.
   - "Mini Games" düğmesi ve deneme menüsü (harf seçici, oyun kartları, "Yakında"): TAMAM.
   - Mini oyun 1: Damla Yakalama (dokunarak yakala; seviye 1-3: hız, benzer harf, 8/10/12 damla; 3 can): TAMAM. Menüye seviye seçici eklendi.
   - Mini oyunlarda ünsüz tanıtımı: açıklama yazılır ve söylenir, "a" gelip kapalı heceyi kurar, hece okunur: TAMAM.
   - Mini oyun 2: Harf Balonları (yüzen balonlar, tur tur; seviye 1-3: 7/9/11 balon, 3/3/4 tur, benzer harf, 3. seviyede gezinen balonlar): TAMAM.
   - Mini oyun 3: Harfi Çiz (ipucu resmini yazılış yolunda götür; seviyeyle yardım azalır): TAMAM.
   - Mini oyun 4: Resimden Sesi Bul (sesin resmi; 5/6/8 tur, 3/3/4 kart; hoparlörle resim adı): TAMAM. Resimler şimdilik harf başına bir tane; sonra çoğaltılacak.
   - Öğretmenin kararı: mini oyunlarda ünsüz okunmaz (yalnızca harf görünür); oyun başındaki tanıtım kalır: TAMAM.
   - Mini oyun 5: Hafıza Kartları (1-2. seviye aynı harf, 4/6 çift; 3. seviye harf–resim, 5 çift; 2 yanlışta 1 can): TAMAM.
   - Mini oyun 6: Hece Köprüsü (hece yalnızca sesli; taşları sırayla köprüye koy; 4/5/6 tur, 3/4/5 taş; 3. seviyede açık hece de): TAMAM.
   - Mini oyun 7: Heceyi Bul (hece balıkları; 5/6/7 tur, 3/4/5 balık; seviyeyle heceler birbirine benzer, 3. seviyede ters ve açık hece): TAMAM.
   - Telefonda boyut ayarları (yan çevir uyarısı, tam ekran, büyütme/kaydırma kapalı): TAMAM. Telefonda sesli okumanın gecikmesi/kesilmesi düzeltildi (Sürüm 53). Telefonda mikrofon izni verilmeden hiç ses gelmemesi düzeltildi (Sürüm 54).
   - Öğretmenin kararı: mini oyunlarda ünsüz harflerin başındaki yardım uyarısı ("Bu sesi tek başına okumam kolay değil...") ve hece tanıtımı kaldırıldı (Sürüm 55): TAMAM.
   - Mini oyun araştırması (öğretmenin isteği) ilk 7 oyuna uygulandı: gösteren el, uçan yıldız ve parıltı, yanlışta nazik ipucu, bitişte 1–3 yıldız ve konfeti, büyük dokunma alanları, Damla'da kolay başlangıç. Menü sayfalı oldu, bütün fikirler "Yakında" kartı olarak görünüyor (Sürüm 57): TAMAM.
   - Öğretmenin fikirlerinden 1. oyun: Labirent (hece kapıları; 4/5/6 kavşak, 2/3/3 kapı; sonunda hazine) (Sürüm 58): TAMAM.
   - 2. oyun: Şeker Patlatma (hece zinciri; söylenen heceyi soldan sağa ya da yukarıdan aşağı yan yana iki şekerle kur; 6/8/10 hece) (Sürüm 59): TAMAM.
   - 3. oyun: Kayak (1. seviye harf topla, 2-3. seviye hece kapıları; üç şerit, dokunarak ya da sürükleyerek şerit değiştir) (Sürüm 60): TAMAM.
   - 4. oyun: Elektrik Devresi (kelime söylenir, soldaki ilk heceyi sağdaki ikinci heceye kabloyla bağla, ampul yanar; 4/5/6 kelime, 2/3/3 hece; 3. seviyede ters hece) (Sürüm 61): TAMAM. Ortak kelime listesi `KELIMELER` eklendi (anne, nane, lale, nine, tane, elle, elli, ana, ata, ilan, inat, anten, atlet, telli, anla, ilet).
   - 5. oyun: Duvardan Geçme (harfli kapılar; karakter arkadan koşar, üç kapılı duvarlar yaklaşır, doğru harfin kapısının şeridine geç; 6/8/10 duvar) (Sürüm 62): TAMAM.
   - 6. oyun: Şekillerle Yazma (malzemeyle doldur; içi boş büyük harfe düğme, çiçek, şeker sürükle, yazılış sırasıyla dolar; can yok; 2/3/3 harf) (Sürüm 63): TAMAM.
   - 7. oyun: Hece Müziği (1. seviye hece ksilofonu: melodiyi dinle, aynı tuşlara sırayla bas; 2-3. seviye nota akışı: istenen heceli notaya çizgide dokun) (Sürüm 64): TAMAM.
   - 8. oyun: Scrabble (kelime söylenir, resmi varsa görünür; raftaki harf taşlarını sırayla kelimenin yerlerine koy; 4/5/5 kelime, 0/1/2 fazladan taş) (Sürüm 65): TAMAM. Not: öğrenilmiş harflerle yazılan kelimelerin çoğunun resmi yok (yalnızca lale); resimler sonra çizilebilir.
   - 9. oyun: Ördek Vurma (panayır ördekleri; sıra sıra kayan harfli ördeklerden istenen harfi vur; 8/10/12 ördek, 3. seviyede 3 sıra) (Sürüm 66): TAMAM.
   - 10. oyun: Kazma (tünel kaz; dokunulan yere doğru kare kare kazarak ilerle, doğru harfli taşları topla, kayalar engel; 6/8/10 hazine) (Sürüm 67): TAMAM.
   - 11. oyun: Altın Madencisi (kanca sallanır, dokununca iner; istenen harfin külçesi altın çıkar, başka harf taşa döner ve yavaş çekilir; can yok; 5/7/9 altın) (Sürüm 68): TAMAM.
   - 12. oyun: Kazı Kazan (gümüş kartı parmakla kazı, altından resim çıkar; yarısı kazınınca resmin ilk sesini seç; 4/5/6 kart, 2/3/3 seçenek) (Sürüm 69): TAMAM.
   - 13. oyun: Tombala (resimli tombala; torbadan çıkan harfle başlayan resmi kapat; üst seviyede "Kartımda yok" düğmesi, satır dolunca "Çinko!", kart dolunca "Tombala!"; 4/4/6 resim) (Sürüm 70): TAMAM.
   - 14. oyun: Arabayı Ulaştır (arabadan bitişe yol çiz; yol istenen harfin bütün duraklarından geçmeli, başka harfli duraklara değmemeli; 3/4/5 tur) (Sürüm 71): TAMAM.
   - 15. oyun: Yakala ve Yaz (kelime söylenir, çantada boş harf yerleri; uçuşan harf yaratıklarını ağla yakala, harf çantadaki yerine uçar; gerekmeyen harf can götürür; 3/4/4 kelime) (Sürüm 72): TAMAM.
   - 16. oyun: Kırık Cam (1. seviye camı kır: buzlu camdaki doğru harflere dokun, cam kırılır, resim çıkar; 2-3. seviye camı onar: resmin ilk sesini taşıyan cam parçasını boşluğa koy) (Sürüm 73): TAMAM.
   - 17. oyun: Bombayı Kurtar (sevimli bomba yavaşça geri sayar; istenen harfin kablosunu kes, bomba konfetiye döner; süre biterse yalnızca "puf" dumanı; 4/5/6 bomba, 20/16/13 sn) (Sürüm 74): TAMAM.
   - 18. oyun: Yılan (heceyi ye; hece söylenir, harflerini sırayla ye; duvar ve kendine çarpma yok, kenardan öbür kenara geçer; 1. seviyede yanlış harf can götürmez; 4/5/6 hece) (Sürüm 75): TAMAM.
   - 19. oyun: Canavarı Besle (canavar balonda bir harf ister; doğru harfli meyveyi canavara fırlat, yer ve büyür; yanlışı tükürür; 1. seviyede dokunmak yeter; 5/6/8 lokma) (Sürüm 76): TAMAM.
   - 20. oyun: Harf Kesme (meyveler havaya fırlar; doğru harfli meyveleri parmakla kaydırarak kes; ek özellik seri kesim: tek kaydırışta birden çok doğru meyve "2'li kesim!"; 8/10/12 meyve) (Sürüm 77): TAMAM.
   - 21. oyun: Hece Kulesi (öğretmenin tarifi: hece söylenir, üstten doğru heceyi seç; hece vinçte sallanır, dokununca düşer, kuleye oturursa kule büyür; kelime kurulmaz; 5/6/8 kat; 1. seviyede ıskalamak can götürmez) (Sürüm 78): TAMAM.
   - 22. oyun: Birleştir Büyüt (2048 tarzı; tahtayı kaydır, okuma yönünde yan yana gelen ünlü+ünsüz hece olur; 3. seviyede heceler kalır ve kelimeye dönüşebilir (an+ne=anne); can yok; 5/7/8) (Sürüm 79): TAMAM. Ortak düzeltme: ilerleme hedefi aşmaz.
   - 23. oyun: Harfle Boya (ev, çiçek, gemi resimleri bölgelere ayrılmış; istenen harfli bölgelere dokununca boyanır, hepsi bitince resmin kalanı da boyanır; 2/3/3 resim) (Sürüm 80): TAMAM.
   - 24. oyun: Harf Fırtınası (art arda kısa görevler: dokun, patlat, hece seç, resmin ilk sesi, düşen damlayı yakala; her görevde süre çubuğu; 8/10/12 görev) (Sürüm 81): TAMAM. Öğretmenin 24 taslağının hepsi yapıldı.
   - Su arıtma tesisinde harf varilleri (öğretmenin seçimi B+C): harf düğmeleri kalktı; her harfin musluklu varili, tohumu tarlaya ekilince güvertede ve panelde (borunun altında) belirir; varile dokununca damla (Sürüm 83): TAMAM.
   - Varilden damla iki aşamalı (öğretmenin tarifi): 1) ana tanktan harf varile damla gelir; 2) Şans Çarkı çıkar, gelen mini oyun 1-2-3. düzeyde art arda oynanır, bitince şişeye 1 damla (Sürüm 84): TAMAM. Şans Çarkı ileride bütün oyun seçimlerinde de kullanılacak.
   - Planlanan ilk 7 mini oyunun hepsi yapıldı. Sıradaki iş: öğretmenin kendi mini oyun fikirleri (aşağıdaki listede, sırayla; her biri için önce görsel taslak ve onay). Sonra mini oyunları ana oyuna (tesis, damla parçaları) bağlamak. Ana oyunun geri kalanı mini oyunlar bitince.

## Oyunun hikâyesi (öğretmenin fikri, beyin fırtınası kararları)
Karakter adaya düşmüştür, elinde hiçbir şey yoktur; amaç adadan kurtulmaktır. Her harf grubu
ayrı bir adadır (1. ada: a n e t i l). Şimdilik yalnızca 1. adaya odaklanılıyor.
Akış: sandıkta harf tohumu bul → tarlaya ek → varil/Şans Çarkı/mini oyunlarla damla kazan →
sula, fasulye sırığına dönüşsün → sırıktan bulutların üstüne çık → orada o harfin yelkenli
parçasını al → parçaları sahildeki yelkenliye tak → altı parça tamamlanınca yelkenliye bin,
2. adaya geç.
Yapılacaklar (bu sırayla, her biri için önce görsel taslak ve onay):
1. Sahilde yarım yelkenli: iskelenin sağındaki kumsalda kızak, bütün parçalar kesik çizgiyle
   silik, yanlarında harfleri (öğretmenin seçimi A). Parçalar: a gövde, n direk, e bayrak,
   t dümen, i kürek, l yelken (Sürüm 85): TAMAM.
2. Bulutta parçayı alma: tabelanın üstünde köpük balonda parça; karakter yaklaşınca mikrofon,
   harf sesle dolar (tek aşama), balon patlar, parça çantaya girer (öğretmenin seçimi A)
   (Sürüm 86): TAMAM.
3. Parçayı tekneye takma: çantadan sürükle, yeri sarı parlar, yerine oturur (öğretmenin seçimi
   A); sağ üstte yelkenli kartı ("2 / 6"), dokununca karakter yelkenliye yürür (Sürüm 87): TAMAM.
4. Açılış hikâyesi: kendiliğinden akan kısa canlı sahne, sesli sözler, "Geç" düğmesi (öğretmenin
   seçimi A): fırtına, sal kırılır, kumsalda uyanma, silik yelkenli (Sürüm 88): TAMAM.
5. Final: altı parça takılınca kutlama ve "Yola çık" düğmesi (öğretmenin seçimi B); basınca
   çocuk biner, yelkenli açılır, gün batımı, adalar haritası "2. ada yakında", "Adaya dön"
   (Sürüm 89): TAMAM. 1. adanın hikâyesi baştan sona oynanabilir.
Seslendirme (öğretmen robotik buldu): 1) cihazdaki en doğal Türkçe ses seçiliyor (Sürüm 92):
TAMAM. 2) Yapay zekâ seslendirme siteleri öğretmene önerildi, inceleyecek. 3) Öğretmenin kendi
sesiyle kayıt sayfası kayit.html (Sürüm 93): TAMAM; öğretmen kaydedip zip'i verince sesler
oyuna eklenecek (ünsüzler de saf sesle okunabilecek). 4) Azure yapay zekâ sesleri (Sürüm 94):
TAMAM; harf, hece, kelime Harper (Sürüm 95; Elif kötü duruyordu), kutlama Elif (heyecanlı),
hikâye ve genel sözler Ava. 5) Öğretmen harf ve heceleri yine beğenmedi; dinleme sayfası
dinle.html (Sürüm 96): beğenmediklerini işaretleyip söyleyecek, onları kendi sesiyle kaydedecek. Öğretmen 34 söz verdi (ünlüler, bütün heceler, 10 kelime); kayit.html
yalnızca onları gösteriyor (Sürüm 98). Zip gelince bu sesler yapay zekâ seslerinin yerine konacak.
Öğretmenin kararı: önce mini oyun düzenlemeleri, bütün oyunlar bitince sese dönülecek (yeni sözler
de gelebilir). Efekt fikri (peri, robot, sincap, dev, mağara) örnekleri dinletildi, seçim sonra.
Mini oyun düzenlemeleri: 1) her oyuna "harf"/"hece" etiketi (Sürüm 99): TAMAM; öğretmen
etiketleri düzeltebilir. Sonra bazı oyunlarda geliştirmeler. 2) Şekillerle Yazma ve Harfi Çiz "Harfi Yaz"
adıyla birleşti: 1. düzey şekillerle (şeker makinesinden 4 malzeme), 2-3. düzey çizerek (Sürüm 100): TAMAM. 3) Resimden Sesi Bul kapsamlı hâle geldi: 1. düzey harf başında,
2. düzey sonunda, 3. düzey ortasında; 114 kelime resmi çizildi; oyun başında harf ve yeri
gösterilip söylenir (Sürüm 101): TAMAM. Yeni kelimelerin seslendirmesi sonra (şimdilik tarayıcı sesi). Kartal yeniden çizildi, elma eklendi, i sorulurken
yanlış seçeneklerde ı de geçmiyor (okuma karışmasın; Sürüm 102). Öğretmen: tarayıcı kelimeleri
güzel okuyor, şimdilik onunla devam.
Sonraya kalanlar: kayıt ve profiller (şimdilik gerek yok), süre ayarı (öğretmenin farklı
fikirleri var).

## Öğretmenin mini oyun fikirleri (sırayla yapılacak)
Her biri için önce görsel taslak gösterilir, öğretmen seçer, sonra yapılır. Yalnızca öğrenilmiş
harfler kullanılır; öğrenilmemiş harfli sözcük yazılmaz, yerine resim konur. Menü sayfalıdır;
hepsi "Yakında" kartı olarak görünür.

1. Labirent: çıkmak için doğru kelimeleri (harfleri/heceleri) takip et.
2. Şeker patlatma (Candy Crush tarzı).
3. Kayak: doğru hecelerden geçerek hedefe ulaş.
4. Elektrik devresi: heceleri birleştirip devreyi tamamla, ampul yansın (an-ne gibi).
5. Duvardan geçme.
6. Farklı şekillerle yazma (yemeğe tuz atar gibi vb.).
7. Nota ile hece birleştirme: her hece ya da harf bir nota; bir müzik gelir, hecelerle bu müzik yapılır.
8. Scrabble.
9. Ördek vurma.
10. Kazma (Digger tarzı).
11. Altın madencisi.
12. Kazı kazan.
13. Tombala.
14. Yol çizerek arabayı ulaştır.
15. Pokémon tarzı: harfleri, heceleri ya da kelimeleri yakala, sonra bunlarla bir şeyler yaz.
16. Kırık cam.
17. Bomba patlamadan kurtar.
18. Yılan.

### Araştırmadan gelen yeni fikirler (taslak; öğretmenin listesinden sonra)
19. Canavarı Besle (Teach Your Monster tarzı): canavar bir ses ister, doğru harfli yiyeceği ağzına at; doydukça büyür.
20. Harf Kesme (Fruit Ninja tarzı): havaya fırlayan meyvelerde harfler; doğru harflileri parmakla kes.
21. Hece Kulesi (Stack tarzı): sallanan hece blokları doğru anda dokununca üst üste konur, kelime kulesi olur.
22. Birleştir Büyüt (Suika / 2048 tarzı): aynı harfler birleşip heceye, heceler kelimeye ve resme dönüşür.
23. Harfle Boya: gizli resmin parçalarındaki harflerden doğrusuna dokununca o parça boyanır.
24. Harf Fırtınası (WarioWare tarzı): art arda 5'er saniyelik minik görevler.

### Öğretmenin taslak seçimleri (taslaklar: her oyunda A ve B)
1 Labirent: A (hece kapıları). 2 Şeker Patlatma: B (hece zinciri). 3 Kayak: ikisi de (B basit
düzey: harf topla, A üst düzey: hece kapıları). 4 Elektrik Devresi: A (heceleri kabloyla bağla).
5 Duvardan Geçme: B (harfli kapılar). 6 Şekillerle Yazma: B (malzemeyle doldur). 7 Hece Müziği:
ikisi de, farklı düzeylerde (ksilofon ve nota akışı). 8 Scrabble: A (resmin kelimesini diz).
9 Ördek Vurma: A (panayır ördekleri). 10 Kazma: A (tünel kaz). 11 Altın Madencisi: A (kanca).
12 Kazı Kazan: A (resmi kazı). 13 Tombala: B (resimli tombala). 14 Arabayı Ulaştır: A (yolu çiz).
15 Yakala ve Yaz: A (ağla yakala). 16 Kırık Cam: ikisi de (camı onar ve camı kır). 17 Bombayı
Kurtar: A (doğru kabloyu kes). 18 Yılan: B (heceyi ye). 19 Canavarı Besle: A (fırlat).
20 Harf Kesme: A (meyve kes); B'deki "seri kesim" oyunun içinde ek özellik (zorunlu değil).
21 Hece Kulesi: A ama kelime kurulmaz: oyun sırayla bir hece söyler, çocuk üstten doğru heceyi
seçer, o hece vinçte sallanmaya başlar; doğru yere bıraktıkça kule büyür (önce doğru hece, sonra
kuleyi büyütmek). 22 Birleştir Büyüt: B (kaydır birleştir, 2048). 23 Harfle Boya: A (doğru
bölgeyi boya). 24 Harf Fırtınası: A (art arda görevler).
Şans Çarkı (24'ün B taslağı): unutulmayacak; ileride bütün mini oyunlar arasından oyun seçmek
için kullanılacak (çark döner, çıkan oyun oynanır).

### Bilmeceler (öğretmenin; nerede kullanılacağı sonra kararlaştırılacak)
- "Hızlı koşar, yeleleri var." → at
- "Türk bayrağında beni görürler, kırmızıyla eş derler." → al
4. İlk ada (a n e t i l): görünüm stilini seçme, altı harf, kapalı ve açık heceler, kelimeler, sesler.
5. Tüm ada: kalan dört harf grubu, sınıfta deneme, cilalama.

## Durum notu
Her etap bitince bu dosyadaki durumu güncelle.
