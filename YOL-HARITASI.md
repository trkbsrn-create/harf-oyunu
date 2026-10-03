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
   - Planlanan ilk 7 mini oyunun hepsi yapıldı. Sıradaki iş: öğretmenin kendi mini oyun fikirleri (aşağıdaki listede, sırayla; her biri için önce görsel taslak ve onay). Sonra mini oyunları ana oyuna (tesis, damla parçaları) bağlamak. Ana oyunun geri kalanı mini oyunlar bitince.

## Öğretmenin mini oyun fikirleri (sırayla yapılacak)
Her biri için önce görsel taslak gösterilir, öğretmen seçer, sonra yapılır. Yalnızca öğrenilmiş
harfler kullanılır; öğrenilmemiş harfli sözcük yazılmaz, yerine resim konur. Menü 7 karttan
fazlasını sığdırmadığı için yeni oyunlar eklenirken menüye sayfa/kaydırma gerekecek.

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

### Bilmeceler (öğretmenin; nerede kullanılacağı sonra kararlaştırılacak)
- "Hızlı koşar, yeleleri var." → at
- "Türk bayrağında beni görürler, kırmızıyla eş derler." → al
4. İlk ada (a n e t i l): görünüm stilini seçme, altı harf, kapalı ve açık heceler, kelimeler, sesler.
5. Tüm ada: kalan dört harf grubu, sınıfta deneme, cilalama.

## Durum notu
Her etap bitince bu dosyadaki durumu güncelle.
