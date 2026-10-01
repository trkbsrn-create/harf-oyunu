# Doodle tarzı görselleri üretir (kendi çizimlerimiz). Çalıştırmak için:
#   python3 araclar/doodle_ciz.py
# Karakter (cocuk*.svg), sandık (sandik-*.svg) ve pusula (aura-halka*.svg) bu
# dosyayla üretilmez; onlara dokunulmaz.
import math, os

KALEM = "#2b2b2b"
KLASOR = os.path.join(os.path.dirname(__file__), "..", "gorseller")


def titrek(tohum, siddet=3.5, siklik=0.06):
    return f'''    <filter id="titrek" filterUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="{siklik}" numOctaves="2" seed="{tohum}" result="g"/>
      <feDisplacementMap in="SourceGraphic" in2="g" scale="{siddet}" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
'''


def tarama(ad, zemin, cizgi, aci, aralik=7, kalinlik=3):
    return f'''    <pattern id="{ad}" width="{aralik}" height="{aralik}" patternUnits="userSpaceOnUse" patternTransform="rotate({aci})">
      <rect width="{aralik}" height="{aralik}" fill="{zemin}"/>
      <line x1="0" y1="{aralik / 2}" x2="{aralik}" y2="{aralik / 2}" stroke="{cizgi}" stroke-width="{kalinlik}" stroke-linecap="round"/>
    </pattern>
'''


def yaz(ad, en, boy, aciklama, desenler, govde, tohum=7, siddet=3.5):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{en}" height="{boy}" viewBox="0 0 {en} {boy}">
  <!-- {aciklama} (doodle tarzı, kendi çizimimiz) -->
  <defs>
{titrek(tohum, siddet)}{desenler}  </defs>
{govde}</svg>
'''
    with open(os.path.join(KLASOR, ad), "w", encoding="utf-8") as f:
        f.write(svg)


def golge(cx, cy, rx, ry=5):
    return f'  <ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#000" fill-opacity="0.13"/>\n'


def kalem(icerik, kalinlik=4):
    return (f'  <g filter="url(#titrek)" stroke="{KALEM}" stroke-width="{kalinlik}" '
            f'stroke-linecap="round" stroke-linejoin="round">\n{icerik}  </g>\n')


YESIL = tarama("yesil", "#c9eba7", "#8fd16a", 35)
KOYU_YESIL = tarama("koyuYesil", "#b5e48c", "#6fbf4a", -35)
SARI = tarama("sari", "#ffe680", "#ffc928", -40, 6, 3)

# ---- Ağaç: gövde ve sallanan tepe ----
yaz("agac-govde.svg", 160, 200, "Ağaç gövdesi; tepesi agac-tepe.svg",
    tarama("kahve", "#d9a46b", "#b07a42", 30),
    golge(80, 192, 42) + kalem('''    <path d="M70 190 l4 -82 M90 190 l-2 -82" fill="none"/>
    <path d="M70 190 q10 -4 20 0 l-2 -82 h-14 z" fill="url(#kahve)" stroke="none"/>
    <path d="M70 190 l4 -82 M90 190 l-2 -82 M66 190 h28" fill="none"/>
    <path d="M76 160 q4 -4 2 -10 M84 130 q-3 -4 -1 -9" fill="none" stroke-width="2.5"/>
'''), 11)
yaz("agac-tepe.svg", 160, 140, "Ağacın yapraklı tepesi; gövdesi agac-govde.svg",
    YESIL + KOYU_YESIL,
    kalem('''    <g transform="translate(9 8) scale(0.88)">
    <path d="M32 112 q-28 -6 -18 -34 q-16 -32 18 -42 q6 -32 42 -26 q24 -24 52 2 q34 -2 30 32 q24 26 -4 46 q-2 28 -36 24 q-22 22 -50 6 q-28 10 -34 -8z" fill="url(#yesil)"/>
    <path d="M48 70 q14 -16 32 -4 M86 56 q16 -10 28 6 M60 96 q16 -10 30 2" fill="none" stroke-width="3"/>
    <path d="M38 88 q-6 -12 6 -20" fill="none" stroke-width="2.5"/>
    </g>
'''), 12)

# ---- Çalı ----
yaz("cali.svg", 140, 90, "Çalı", KOYU_YESIL,
    golge(70, 84, 56, 5) + kalem('''    <path d="M22 80 q-18 -2 -12 -22 q-8 -22 16 -26 q4 -22 30 -18 q14 -18 36 -4 q24 -6 28 18 q20 6 14 26 q4 26 -20 26z" fill="url(#koyuYesil)"/>
    <path d="M44 50 q10 -10 22 0 M76 46 q10 -8 20 4" fill="none" stroke-width="3"/>
'''), 13)

# ---- Kaya ----
yaz("kaya.svg", 110, 80, "Kaya", tarama("gri", "#d6d3cc", "#a9a59c", 25),
    golge(55, 74, 44, 5) + kalem('''    <path d="M12 72 q-6 -28 16 -44 q16 -18 38 -12 q30 8 34 34 q4 14 -4 22 z" fill="url(#gri)"/>
    <path d="M36 32 q10 -8 22 -6 M70 50 l8 6" fill="none" stroke-width="3"/>
'''), 14)

# ---- Çiçekler (üç renk) ----
for renk_adi, zemin, cizgi, tohum in [("kirmizi", "#ffb3b3", "#ef5b5b", 21), ("mor", "#d8c2f3", "#a77be0", 22), ("beyaz", "#ffffff", "#e3e3e3", 23)]:
    yaz(f"cicek-{renk_adi}.svg", 40, 56, "Çiçek", tarama("tac", zemin, cizgi, 40, 5, 2.5) + SARI,
        kalem('''    <path d="M20 54 q-3 -14 0 -30" fill="none" stroke-width="3"/>
    <path d="M19 44 q-10 -2 -12 -10 q9 0 12 8" fill="#8fd16a" stroke-width="2.5"/>
    <path d="M20 4 q6 0 6 6 q6 -2 8 4 q2 6 -4 8 q4 6 -2 10 q-6 2 -8 -4 q-2 6 -8 4 q-6 -4 -2 -10 q-6 -2 -4 -8 q2 -6 8 -4 q0 -6 6 -6z" fill="url(#tac)" stroke-width="3"/>
    <circle cx="20" cy="18" r="5" fill="url(#sari)" stroke-width="2.5"/>
''', 3), tohum, 2.5)

# ---- Ot öbeği ----
yaz("ot.svg", 44, 34, "Ot öbeği", "",
    kalem('''    <path d="M8 32 q-4 -14 -6 -24 M16 32 q0 -16 4 -28 M24 32 q4 -14 12 -24 M32 32 q4 -8 9 -12" fill="none"/>
''', 3), 24, 2.5)

# ---- Kelebek (beyaz kanat; oyunda renklendirilir) ----
yaz("kelebek.svg", 44, 36, "Kelebek, yukarıdan; kanat çırpma kodda", tarama("kanat", "#ffffff", "#e8e8e8", 40, 5, 2.5),
    kalem('''    <path d="M22 18 q-12 -16 -18 -10 q-6 8 4 14 q-6 10 4 10 q6 0 10 -8z M22 18 q12 -16 18 -10 q6 8 -4 14 q6 10 -4 10 q-6 0 -10 -8z" fill="url(#kanat)"/>
    <path d="M22 8 v24 M22 8 l-4 -5 M22 8 l4 -5" fill="none" stroke-width="3"/>
''', 2.5), 25, 2.5)

# ---- Martı ----
yaz("kus.svg", 80, 44, "Martı, yukarıdan; kanat çırpma kodda", "",
    kalem('''    <path d="M40 20 q-14 -14 -36 -8 q16 6 28 16 z M40 20 q14 -14 36 -8 q-16 6 -28 16 z" fill="#ffffff"/>
    <path d="M40 8 q6 4 6 14 q0 12 -6 18 q-6 -6 -6 -18 q0 -10 6 -14z" fill="#ffffff"/>
    <path d="M37 6 l3 -4 l3 4z" fill="#ffb03f" stroke-width="2"/>
    <path d="M6 12 q8 -2 14 1 M74 12 q-8 -2 -14 1" fill="none" stroke="#8a8a8a" stroke-width="3"/>
''', 3), 26, 3)

# ---- Çanta düğmesi ----
yaz("canta.svg", 100, 110, "Sırt çantası düğmesi", tarama("canta", "#9be3dc", "#4fc3b8", 35) + tarama("cep", "#ffffff", "#dff5f2", -30),
    kalem('''    <path d="M36 22 q0 -16 14 -16 q14 0 14 16" fill="none"/>
    <path d="M14 30 q0 -12 14 -12 h44 q14 0 14 12 v62 q0 12 -14 12 h-44 q-14 0 -14 -12z" fill="url(#canta)"/>
    <path d="M14 46 q36 16 72 0" fill="none"/>
    <rect x="28" y="62" width="44" height="30" rx="8" fill="url(#cep)"/>
    <rect x="44" y="56" width="12" height="14" rx="4" fill="url(#sari)"/>
''') .replace('url(#sari)', 'url(#sari)'), 31)
# sarı deseni çanta için de gerekli
with open(os.path.join(KLASOR, "canta.svg"), encoding="utf-8") as f:
    s = f.read()
with open(os.path.join(KLASOR, "canta.svg"), "w", encoding="utf-8") as f:
    f.write(s.replace("  </defs>", SARI + "  </defs>", 1))

# ---- Tohum ----
yaz("tohum.svg", 70, 80, "Harf tohumu", tarama("tohum", "#f2c48e", "#d99a4e", 35),
    kalem('''    <path d="M35 30 q-2 -12 2 -20" fill="none" stroke-width="4"/>
    <path d="M36 14 q-14 -8 -20 2 q12 6 20 -2z M37 12 q12 -12 22 -4 q-10 10 -22 4z" fill="#8fd16a" stroke-width="3"/>
    <path d="M35 28 q24 0 26 24 q0 24 -26 24 q-26 0 -26 -24 q2 -24 26 -24z" fill="url(#tohum)"/>
'''), 32)

# ---- Mikrofon ----
yaz("mikrofon.svg", 90, 110, "Mikrofon simgesi: şimdi söyle", tarama("kirmizi", "#ffb3a8", "#e0533d", -35, 6, 3),
    kalem('''    <circle cx="45" cy="50" r="40" fill="#ffffff"/>
    <rect x="33" y="18" width="24" height="40" rx="12" fill="url(#kirmizi)"/>
    <path d="M24 46 q0 22 21 22 q21 0 21 -22 M45 68 v12 M34 82 h22" fill="none"/>
'''), 33)

# ---- Arı (ipucu resmi) ----
yaz("ari.svg", 130, 110, "Arı: a harfinin ipucu resmi", SARI + tarama("kanat", "#ffffff", "#d7efff", 30, 5, 2.5),
    kalem('''    <path d="M44 34 q-16 -30 4 -30 q16 2 10 30z M70 32 q4 -30 20 -24 q14 8 -10 26z" fill="url(#kanat)"/>
    <path d="M106 66 l18 4 l-18 8z" fill="#2b2b2b"/>
    <ellipse cx="68" cy="70" rx="42" ry="30" fill="url(#sari)"/>
    <path d="M60 42 q-8 28 0 56 M82 44 q-6 26 0 52" fill="none" stroke-width="9"/>
    <circle cx="30" cy="68" r="21" fill="url(#sari)"/>
    <path d="M22 48 q-4 -14 -12 -16 M34 47 q2 -14 10 -18" fill="none" stroke-width="3"/>
    <circle cx="23" cy="64" r="3" fill="#2b2b2b"/>
    <circle cx="36" cy="64" r="3" fill="#2b2b2b"/>
    <path d="M24 76 q6 6 12 0" fill="none" stroke-width="3"/>
'''), 34)

# ---- Nar (ipucu resmi) ----
yaz("nar.svg", 120, 120, "Nar: n harfinin ipucu resmi", tarama("nar", "#ff9c8a", "#e0533d", -35, 7, 3.5),
    kalem('''    <path d="M62 22 q18 -18 34 -10 q-14 16 -34 10z" fill="#8fd16a"/>
    <path d="M46 30 l4 -16 l6 10 l4 -12 l4 12 l6 -10 l4 16z" fill="#e0533d"/>
    <path d="M60 26 q44 0 44 44 q0 44 -44 44 q-44 0 -44 -44 q0 -44 44 -44z" fill="url(#nar)"/>
    <path d="M34 52 q10 -16 28 -18" fill="none" stroke="#ffffff" stroke-width="5"/>
'''), 35)

# ---- Ekran pencereleri ----
# Çanta penceresi: 700x480, sol üst köşesi oyunda (300,120). İçinde 8 kutucuk ve çarpı.
kutular = ""
for i in range(8):
    x = 20 + 90 + 147 * (i % 4)
    y = 30 + 165 + 150 * (i // 4)
    kutular += f'    <path d="M{x-58} {y-56} q0 -4 6 -4 h104 q6 0 6 6 v104 q0 6 -6 6 h-104 q-6 0 -6 -6z" fill="#efe3c6" stroke-width="3"/>\n'
yaz("canta-pencere.svg", 700, 480, "Çanta penceresi", tarama("kagit", "#fbf4e2", "#f1e6c8", 30, 8, 3) + tarama("bant", "#9be3dc", "#4fc3b8", 35),
    '  <rect x="30" y="44" width="620" height="420" rx="30" fill="#000" fill-opacity="0.18"/>\n' +
    kalem(f'''    <path d="M20 66 q0 -36 36 -36 h548 q36 0 36 36 v348 q0 36 -36 36 h-548 q-36 0 -36 -36z" fill="url(#kagit)"/>
    <path d="M20 66 q0 -36 36 -36 h548 q36 0 36 36 v44 h-620z" fill="url(#bant)"/>
{kutular}    <circle cx="625" cy="45" r="31" fill="#ff8a7a"/>
    <path d="M612 32 l26 26 M638 32 l-26 26" fill="none" stroke="#ffffff" stroke-width="7"/>
''', 5), 41, 4)

# Düşünce balonu: 180x150, oyunda orta noktası (90,60)'a denk gelir.
yaz("dusunce-balonu.svg", 180, 150, "Düşünce balonu", "",
    kalem('''    <circle cx="22" cy="132" r="9" fill="#ffffff"/>
    <circle cx="40" cy="110" r="14" fill="#ffffff"/>
    <path d="M30 60 q-2 -36 30 -38 q14 -14 34 -6 q24 -8 36 10 q24 6 18 32 q8 26 -18 32 q-12 14 -34 6 q-22 12 -38 -4 q-30 0 -28 -32z" fill="#ffffff"/>
''', 5), 42, 4)

# "Gücünü göster" bandı: 880x120, oyunda orta noktası ekranın üstüne gelir.
yaz("guc-bandi.svg", 880, 120, "Gücünü göster bandı (kâğıt şerit ve bant)", SARI,
    kalem('''    <path d="M30 28 L850 20 L856 98 L24 104 Z" fill="#ffffff" stroke-width="4.5"/>
    <path d="M72 30 l-22 36 h18 l-12 28 l34 -42 h-18 l16 -22z" fill="url(#sari)" stroke-width="3.5"/>
''') + '''  <rect x="8" y="8" width="84" height="28" fill="#f6e27a" opacity="0.85" transform="rotate(-16 50 22)"/>
  <rect x="790" y="4" width="84" height="28" fill="#f6e27a" opacity="0.85" transform="rotate(14 832 18)"/>
''', 43, 4)

# ---- Karşılama ekranı ----
# Oyun adı tabelası: 760x170. Yazı oyunda yazılır, tabelanın ortasına gelir.
yaz("baslik-tabela.svg", 760, 170, "Oyun adı tabelası (kâğıt şerit ve bant)", "",
    '  <path d="M34 40 q346 -26 692 0 l-14 108 q-332 20 -664 0z" fill="#000" fill-opacity="0.15"/>\n' +
    kalem('''    <path d="M24 30 q346 -26 692 0 l-14 108 q-332 20 -664 0z" fill="#fffdf6" stroke-width="5"/>
''') + '''  <rect x="20" y="10" width="96" height="30" fill="#f6e27a" opacity="0.85" transform="rotate(-14 68 25)"/>
  <rect x="644" y="10" width="96" height="30" fill="#f6e27a" opacity="0.85" transform="rotate(12 692 25)"/>
''', 44, 4)

# "Oyunu başlat" düğmesi: 420x120. Yazı oyunda yazılır (orta noktanın 40 px sağına).
yaz("dugme-baslat.svg", 420, 120, "Oyunu başlat düğmesi", SARI,
    '  <rect x="14" y="20" width="396" height="92" rx="44" fill="#000" fill-opacity="0.15"/>\n' +
    kalem('''    <rect x="8" y="10" width="396" height="92" rx="44" fill="url(#sari)" stroke-width="5"/>
    <path d="M46 34 l40 22 l-40 22z" fill="#ffffff"/>
''', 5), 45, 4)

# ---- Menü (sol üst) ----
# Menü düğmesi ve çarpısı: 90x90, oyunda orta noktası (64,64).
MENU_KUTU = '    <rect x="8" y="8" width="74" height="74" rx="18" fill="#fffdf6"/>\n'
yaz("menu-dugmesi.svg", 90, 90, "Menü düğmesi (üç çizgi)", "",
    kalem(MENU_KUTU + '    <path d="M26 30 h38 M26 45 h38 M26 60 h38" fill="none" stroke-width="5"/>\n', 4), 46, 3)
yaz("menu-kapat.svg", 90, 90, "Menü kapatma düğmesi (çarpı)", "",
    kalem(MENU_KUTU + '    <path d="M30 30 l30 30 M60 30 l-30 30" fill="none" stroke-width="5"/>\n', 4), 47, 3)

# Menü penceresi: 500x110, sol üst köşesi oyunda (20,118). Yazı oyunda yazılır.
yaz("menu-pencere.svg", 500, 110, "Menü penceresi: yeniden başlat satırı", "",
    '  <rect x="14" y="14" width="480" height="90" rx="22" fill="#000" fill-opacity="0.15"/>\n' +
    kalem('''    <rect x="6" y="6" width="480" height="90" rx="22" fill="#fffdf6"/>
    <path d="M70 36 a20 20 0 1 0 6 16" fill="none" stroke-width="5"/>
    <path d="M60 32 l12 4 l-2 -14" fill="none" stroke-width="5"/>
''', 4), 48, 3)

# "Baştan başlasın mı?" penceresi: 540x320, oyunda ekranın ortasına gelir.
# Düğmeler: Evet (orta noktası 155,240), Hayır (385,240); her biri 190x80.
yaz("onay-pencere.svg", 540, 320, "Yeniden başlatma onay penceresi",
    tarama("kagit", "#fbf4e2", "#f1e6c8", 30, 8, 3) + tarama("yesil", "#c9eba7", "#8fd16a", 35)
    + tarama("pembe", "#ffd2c8", "#ff9c8a", -35),
    '  <rect x="22" y="22" width="508" height="290" rx="30" fill="#000" fill-opacity="0.18"/>\n' +
    kalem('''    <rect x="12" y="12" width="508" height="290" rx="30" fill="url(#kagit)"/>
    <rect x="60" y="200" width="190" height="80" rx="36" fill="url(#yesil)"/>
    <rect x="290" y="200" width="190" height="80" rx="36" fill="url(#pembe)"/>
''', 5), 49, 4)

# ---- Zemin dokuları (kesintisiz döşenir; titreme süzgeci yok) ----
def doku(ad, boy, zemin, cizgiler, aciklama):
    s = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{boy}" height="{boy}" viewBox="0 0 {boy} {boy}">
  <!-- {aciklama} (kesintisiz döşenen doku, kendi çizimimiz) -->
  <rect width="{boy}" height="{boy}" fill="{zemin}"/>
{cizgiler}</svg>
'''
    with open(os.path.join(KLASOR, ad), "w", encoding="utf-8") as f:
        f.write(s)


def capraz(boy, aralik, renk, kalinlik, yon=1):
    # 45 derecelik taramalar: döşenince kesintisiz devam eder
    c = ""
    for k in range(-boy, 2 * boy + 1, aralik):
        if yon > 0:
            c += f'  <line x1="{k}" y1="{boy}" x2="{k + boy}" y2="0" stroke="{renk}" stroke-width="{kalinlik}" stroke-linecap="round"/>\n'
        else:
            c += f'  <line x1="{k}" y1="0" x2="{k + boy}" y2="{boy}" stroke="{renk}" stroke-width="{kalinlik}" stroke-linecap="round"/>\n'
    return c


doku("doku-kagit.svg", 64, "#fbf7ec",
     '  <path d="M0 0.6 H64 M0 32.6 H64 M0.6 0 V64 M32.6 0 V64" stroke="#bcd3ea" stroke-width="1.2"/>\n', "Kareli defter kâğıdı")
doku("doku-deniz.svg", 64, "#cfe9f5", capraz(64, 16, "#7cc3e6", 5, -1) + capraz(64, 16, "#a8d8ef", 2, 1), "Deniz taraması")
doku("doku-kum.svg", 64, "#fbe8b0", capraz(64, 16, "#f3cf6a", 4, 1) + capraz(64, 16, "#f7dc8e", 2, -1), "Kum taraması")
doku("doku-cimen.svg", 64, "#c9eba7", capraz(64, 16, "#b4e190", 4, -1), "Çimen taraması")
print("tamam")
