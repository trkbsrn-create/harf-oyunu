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

# Eşek: e harfinin ipucu resmi (yandan, sola bakıyor)
yaz("esek.svg", 150, 120, "Eşek: e harfinin ipucu resmi",
    tarama("gri", "#d6d3cc", "#a9a59c", 30, 7, 3) + tarama("pembe", "#ffd2c8", "#ff9c8a", -35, 6, 2.5),
    kalem('''    <path d="M56 84 v28 M70 86 v26 M108 86 v26 M122 82 v30" fill="none" stroke-width="5"/>
    <path d="M128 52 q16 6 12 32" fill="none"/>
    <path d="M50 58 q4 -18 40 -18 q38 0 40 22 q2 26 -40 26 q-42 0 -40 -30z" fill="url(#gri)"/>
    <path d="M26 6 q-6 22 8 30 M44 4 q4 24 -4 32" fill="url(#gri)"/>
    <path d="M24 10 q2 -8 10 -4 q-2 18 0 28z M42 6 q8 -4 8 6 q-2 14 -8 24z" fill="url(#pembe)" stroke-width="3"/>
    <path d="M58 52 q-14 -24 -30 -20 q-18 4 -22 26 q-4 18 10 22 q14 2 22 -8 q14 -6 20 -20z" fill="url(#gri)"/>
    <path d="M6 60 q-2 18 12 20 q14 0 12 -16 q-12 -8 -24 -4z" fill="url(#pembe)" stroke-width="3"/>
    <path d="M48 30 q10 4 16 16" fill="none" stroke-width="5"/>
    <circle cx="30" cy="46" r="3.5" fill="#2b2b2b"/>
    <circle cx="14" cy="68" r="2" fill="#2b2b2b"/>
'''), 51)

# Tilki: t harfinin ipucu resmi (oturan tilki, kabarık kuyruklu)
yaz("tilki.svg", 130, 120, "Tilki: t harfinin ipucu resmi", tarama("turuncu", "#ffc58f", "#f08a3c", -35, 7, 3),
    kalem('''    <path d="M84 104 q40 0 40 -34 q0 -20 -14 -22 q-10 16 -14 40z" fill="url(#turuncu)"/>
    <path d="M110 48 q14 2 14 22 q-8 -4 -14 -2 q2 -10 0 -20z" fill="#ffffff" stroke-width="3"/>
    <path d="M40 108 q-6 -46 26 -50 q32 4 26 50z" fill="url(#turuncu)"/>
    <path d="M54 108 q-2 -26 12 -30 q14 4 12 30z" fill="#ffffff" stroke-width="3"/>
    <path d="M30 22 l10 -18 l12 16 q14 -6 28 0 l12 -16 l10 18 q6 22 -16 34 l-20 14 l-20 -14 q-22 -12 -16 -34z" fill="url(#turuncu)"/>
    <path d="M46 52 l20 18 l20 -18 q-20 -6 -40 0z" fill="#ffffff" stroke-width="3"/>
    <circle cx="66" cy="70" r="4" fill="#2b2b2b"/>
    <path d="M48 36 q4 -4 8 0 M76 36 q4 -4 8 0" fill="none" stroke-width="3.5"/>
'''), 52)

# İnek: i harfinin ipucu resmi (önden, benekli)
yaz("inek.svg", 130, 120, "İnek: i harfinin ipucu resmi", tarama("pembe", "#ffd2c8", "#ff9c8a", -35, 6, 2.5),
    kalem('''    <path d="M28 20 q-14 -4 -18 -16 q12 0 22 8 M102 20 q14 -4 18 -16 q-12 0 -22 8" fill="#fff6dc"/>
    <path d="M30 30 q-24 -6 -26 8 q8 10 26 6z M100 30 q24 -6 26 8 q-8 10 -26 6z" fill="#ffffff"/>
    <path d="M30 22 q35 -16 70 0 q8 30 0 58 q-35 12 -70 0 q-8 -28 0 -58z" fill="#ffffff"/>
    <path d="M38 26 q12 -4 16 8 q-6 12 -18 6 q-4 -8 2 -14z M84 52 q12 -2 12 10 q-8 8 -16 2 q-2 -8 4 -12z" fill="#2b2b2b" stroke-width="2"/>
    <path d="M32 72 q33 -14 66 0 q6 36 -33 36 q-39 0 -33 -36z" fill="url(#pembe)"/>
    <ellipse cx="52" cy="88" rx="5" ry="7" fill="#2b2b2b" stroke-width="2"/>
    <ellipse cx="78" cy="88" rx="5" ry="7" fill="#2b2b2b" stroke-width="2"/>
    <circle cx="48" cy="52" r="4" fill="#2b2b2b"/>
    <circle cx="74" cy="44" r="4" fill="#2b2b2b"/>
'''), 53)

# Leylek: l harfinin ipucu resmi (yandan, tek ayak üstünde)
yaz("leylek.svg", 120, 140, "Leylek: l harfinin ipucu resmi", tarama("turuncu", "#ffc58f", "#f08a3c", -35, 6, 2.5),
    kalem('''    <path d="M62 96 v40 M56 136 h12 M74 96 q8 14 0 24 l-10 -6" fill="none" stroke="#f08a3c" stroke-width="5"/>
    <path d="M40 56 q30 -6 52 14 q16 16 22 34 q-26 -4 -40 -8 q-34 -4 -34 -40z" fill="#ffffff"/>
    <path d="M78 64 q18 14 36 40 q-20 -4 -30 -10 q-10 -14 -6 -30z" fill="#2b2b2b" stroke-width="2"/>
    <path d="M44 62 q-10 -22 -6 -40" fill="none" stroke-width="12"/>
    <path d="M44 62 q-10 -22 -6 -40" fill="none" stroke="#ffffff" stroke-width="5"/>
    <circle cx="38" cy="18" r="12" fill="#ffffff"/>
    <path d="M28 16 l-26 8 l26 -1z" fill="url(#turuncu)" stroke-width="3"/>
    <circle cx="38" cy="15" r="3" fill="#2b2b2b"/>
'''), 54)

# ---- Tarla ----
TOPRAK = tarama("toprak", "#b98a5e", "#9a6c43", -30, 8, 3)
KOYU_TOPRAK = tarama("koyuToprak", "#8e6340", "#6f4a2c", 30, 7, 3)
TAHTA = tarama("tahta", "#e3b77e", "#c98f4f", 80, 7, 2.5)

# Çitli tarla: 480x340, sol üst köşesi oyunda TARLA_X, TARLA_Y'ye gelir.
# 6 toprak karesi (3x2): sol üst köşeler (45 + 132i, 52 + 122j), her biri 118x104.
kareler = ""
for i in range(6):
    x = 45 + 132 * (i % 3)
    y = 52 + 122 * (i // 3)
    kareler += f'''    <rect x="{x}" y="{y}" width="118" height="104" rx="12" fill="url(#koyuToprak)"/>
    <path d="M{x+14} {y+30} q45 -10 90 0 M{x+14} {y+56} q45 -10 90 0 M{x+14} {y+82} q45 -10 90 0" fill="none" stroke="#5e3d22" stroke-width="2.5" opacity="0.6"/>
'''
kaziklar = ""
for x in range(10, 470, 55):
    for y in (12, 290):
        kaziklar += f'    <path d="M{x} {y} v34 l6 -10 l6 10 v-34z" fill="url(#tahta)"/>\n'
yaz("tarla.svg", 480, 340, "Çitli tarla: 6 ekim karesi", TOPRAK + KOYU_TOPRAK + TAHTA,
    '  <rect x="26" y="40" width="420" height="270" rx="16" fill="#000" fill-opacity="0.13"/>\n' +
    kalem(f'''    <rect x="20" y="30" width="420" height="270" rx="16" fill="url(#toprak)"/>
{kareler}{kaziklar}    <path d="M4 22 h460 M4 302 h460" fill="none" stroke-width="5"/>
'''), 61)

# Ekilmiş tohum: 100x96, oyunda orta noktası karenin ortasına gelir.
# Tohumun büyük kısmı toprağın içinde; önünde toprak yığını var. Görünen üst kısmın
# ortası (50,51): harf oyunda oraya yazılır.
yaz("ekili-tohum.svg", 100, 96, "Toprağa ekilmiş tohum ve filizi",
    KOYU_TOPRAK + tarama("tohum", "#f2c48e", "#d99a4e", 35, 6, 2.5),
    '  <ellipse cx="50" cy="66" rx="34" ry="9" fill="#5e3d22"/>\n' +
    kalem('''    <path d="M50 38 q-2 -12 2 -24" fill="none" stroke-width="3.5"/>
    <path d="M52 16 q-14 -10 -20 2 q12 6 20 -2z M53 14 q12 -12 22 -2 q-10 10 -22 2z" fill="#8fd16a" stroke-width="3"/>
    <ellipse cx="50" cy="60" rx="26" ry="23" fill="url(#tohum)" stroke-width="3.5"/>
    <path d="M2 92 q4 -20 22 -25 q8 -4 12 0 q8 -5 14 -1 q8 -4 14 1 q6 -3 12 1 q18 5 22 24z" fill="url(#koyuToprak)" stroke-width="3.5"/>
    <circle cx="20" cy="76" r="2.5" fill="#5e3d22" stroke-width="1.5"/>
    <circle cx="70" cy="80" r="2.5" fill="#5e3d22" stroke-width="1.5"/>
    <circle cx="46" cy="84" r="2" fill="#5e3d22" stroke-width="1.5"/>
'''), 62)

# ---- Su arıtma tesisi ve su ----
SU = tarama("su", "#c9ecff", "#7cc4ef", 35, 6, 2.5)
DUVAR = tarama("duvar", "#eef8ff", "#cfe9fb", -30, 7, 2.5)
KIREMIT = tarama("kiremit", "#ffb3a8", "#e0533d", -35, 6, 2.5)

# Tesis: 240x300. Üstte kıyıdan gelen iskele (x 95-145, y 0-90), altında deniz üstünde
# ayaklı güverte, ev ve su deposu. Oyunda sol üst köşesi (TESIS_X - 120, TESIS_Y).
tahtalar = "".join(f'    <path d="M97 {y} h46" fill="none" stroke-width="2.5"/>\n' for y in range(12, 90, 13))
guverte = "".join(f'    <path d="M12 {y} h216" fill="none" stroke-width="2" opacity="0.7"/>\n' for y in range(100, 236, 16))
yaz("su-tesisi.svg", 240, 300, "Su arıtma tesisi: iskele, ayaklı güverte, ev ve su deposu",
    TAHTA + SU + DUVAR + KIREMIT,
    kalem('''    <path d="M26 236 v54 M90 236 v54 M150 236 v54 M214 236 v54" fill="none" stroke="#8e6340" stroke-width="7"/>
    <path d="M6 290 q20 -8 40 0 q20 8 40 0 q20 -8 40 0 q20 8 40 0 q20 -8 40 0 q20 8 30 0" fill="none" stroke="#7cc4ef" stroke-width="3"/>
    <rect x="95" y="0" width="50" height="94" fill="url(#tahta)"/>
''' + tahtalar + '''    <rect x="10" y="84" width="220" height="152" rx="6" fill="url(#tahta)"/>
''' + guverte + '''    <path d="M226 160 q14 0 12 30 v100" fill="none" stroke="#8a8a8a" stroke-width="9"/>
    <path d="M226 160 q14 0 12 30 v100" fill="none" stroke-width="2"/>
    <rect x="24" y="130" width="122" height="96" fill="url(#duvar)"/>
    <path d="M14 134 l30 -38 h82 l30 38z" fill="url(#kiremit)"/>
    <rect x="72" y="172" width="30" height="54" rx="4" fill="#9be3dc"/>
    <circle cx="96" cy="200" r="2.5" fill="#2b2b2b"/>
    <circle cx="46" cy="166" r="12" fill="#c9ecff"/>
    <path d="M46 154 v24 M34 166 h24" fill="none" stroke-width="2.5"/>
    <path d="M160 120 v100 q31 14 62 0 v-100z" fill="url(#su)"/>
    <ellipse cx="191" cy="120" rx="31" ry="10" fill="#e6f6ff"/>
    <path d="M191 146 q-14 20 -14 30 q0 14 14 14 q14 0 14 -14 q0 -10 -14 -30z" fill="#ffffff" stroke-width="3"/>
''') + '''  <path d="M200 70 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4z M222 96 l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 l6 -3z" fill="#ffe680" stroke="#2b2b2b" stroke-width="2"/>
''', 64)

# Su damlası: 40x52
yaz("damla.svg", 40, 52, "Su damlası", SU,
    kalem('''    <path d="M20 4 q-16 22 -16 32 q0 14 16 14 q16 0 16 -14 q0 -10 -16 -32z" fill="url(#su)" stroke-width="3.5"/>
    <path d="M12 34 q0 -6 5 -10" fill="none" stroke="#ffffff" stroke-width="3.5"/>
'''), 65, 2.5)

# Boş damla yeri (soluk kesik çizgi): 40x52
yaz("damla-bos.svg", 40, 52, "Boş damla yeri", "",
    '''  <path d="M20 4 q-16 22 -16 32 q0 14 16 14 q16 0 16 -14 q0 -10 -16 -32z" fill="#ffffff" fill-opacity="0.5" stroke="#9fb6c4" stroke-width="3" stroke-dasharray="5 4"/>
''', 66)

# Sihirli su şişesi (çanta eşyası): 90x110
yaz("sise.svg", 90, 110, "Sihirli su şişesi", SU + tarama("mantar", "#e3b77e", "#c98f4f", 80, 6, 2.5),
    kalem('''    <rect x="34" y="6" width="22" height="18" rx="4" fill="url(#mantar)"/>
    <path d="M36 24 v16 q-28 10 -28 36 q0 28 37 28 q37 0 37 -28 q0 -26 -28 -36 v-16z" fill="#ffffff"/>
    <path d="M12 72 q33 -10 66 0 q0 26 -33 26 q-33 0 -33 -26z" fill="url(#su)" stroke-width="3"/>
    <path d="M22 56 q4 -8 10 -10" fill="none" stroke="#cfe9fb" stroke-width="4"/>
''') + '''  <path d="M70 18 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3z M18 36 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z" fill="#ffe680" stroke="#2b2b2b" stroke-width="1.8"/>
  <path d="M38 84 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2z M54 76 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2z" fill="#ffffff"/>
''', 67, 3)

# Su arıtma tesisi paneli: 700x480, sol üst köşesi oyunda (290,120).
# 6 harf düğmesi (2 sıra x 3): ortaları (160|350|540, 195|340), yarıçap 58. Çarpı (625,45).
dugmeler = ""
for i in range(6):
    x = 160 + 190 * (i % 3)
    y = 195 + 145 * (i // 3)
    dugmeler += f'    <circle cx="{x}" cy="{y}" r="58" fill="url(#su)"/>\n'
yaz("tesis-pencere.svg", 700, 480, "Su arıtma tesisi paneli",
    tarama("kagit", "#fbf4e2", "#f1e6c8", 30, 8, 3) + tarama("bant", "#c9ecff", "#7cc4ef", 35) + SU,
    '  <rect x="30" y="44" width="620" height="420" rx="30" fill="#000" fill-opacity="0.18"/>\n' +
    kalem(f'''    <path d="M20 66 q0 -36 36 -36 h548 q36 0 36 36 v348 q0 36 -36 36 h-548 q-36 0 -36 -36z" fill="url(#kagit)"/>
    <path d="M20 66 q0 -36 36 -36 h548 q36 0 36 36 v44 h-620z" fill="url(#bant)"/>
{dugmeler}    <circle cx="625" cy="45" r="31" fill="#ff8a7a"/>
    <path d="M612 32 l26 26 M638 32 l-26 26" fill="none" stroke="#ffffff" stroke-width="7"/>
''', 5), 68, 4)

# "İncele" düğmesi: 180x70. Yazı oyunda yazılır.
yaz("incele-dugmesi.svg", 180, 70, "İncele düğmesi", SARI,
    '  <rect x="10" y="14" width="168" height="54" rx="27" fill="#000" fill-opacity="0.15"/>\n' +
    kalem('''    <rect x="5" y="8" width="168" height="54" rx="27" fill="url(#sari)" stroke-width="4"/>
'''), 69, 3)

# Şişenin içi (incele): 500x520, sol üst köşesi oyunda (390,170).
# 6 bölme (3 sıra x 2): sol üst köşeler (44 + 218c, 124 + 128r), her biri 194x112.
# Çarpı (470,92).
bolmeler = ""
for i in range(6):
    x = 44 + 218 * (i % 2)
    y = 124 + 128 * (i // 2)
    bolmeler += f'    <rect x="{x}" y="{y}" width="194" height="112" rx="18" fill="#ffffff" stroke-width="3"/>\n'
yaz("sise-pencere.svg", 500, 520, "Sihirli su şişesinin içi: her harf için bir bölme",
    SU + tarama("mantar", "#e3b77e", "#c98f4f", 80, 6, 2.5) + tarama("cam", "#eef8ff", "#d7efff", -30, 8, 3),
    '  <rect x="22" y="100" width="472" height="420" rx="70" fill="#000" fill-opacity="0.18"/>\n' +
    kalem(f'''    <rect x="214" y="6" width="72" height="42" rx="8" fill="url(#mantar)"/>
    <path d="M202 44 h96 v52 h-96z" fill="url(#cam)"/>
    <rect x="14" y="90" width="472" height="420" rx="70" fill="url(#cam)"/>
    <path d="M44 150 q4 -30 30 -40" fill="none" stroke="#ffffff" stroke-width="8"/>
{bolmeler}    <circle cx="470" cy="92" r="28" fill="#ff8a7a"/>
    <path d="M458 80 l24 24 M482 80 l-24 24" fill="none" stroke="#ffffff" stroke-width="7"/>
''', 5) + '''  <path d="M30 40 l5 12 l12 5 l-12 5 l-5 12 l-5 -12 l-12 -5 l12 -5z M440 20 l4 9 l9 4 l-9 4 l-4 9 l-4 -9 l-9 -4 l9 -4z M150 30 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3z" fill="#ffe680" stroke="#2b2b2b" stroke-width="2"/>
''', 70, 4)

# ---- Mini harita kartı (sol alt) ----
# 250x160 kâğıt kart. İçindeki harita alanı (15,15)'ten başlar, 220 px genişliğinde:
# dünya (6400x3600) 220/6400 ölçeğiyle küçültülür. Ada şekli oyundaki adaNoktalari()
# ile aynı formülle çizilir; oyunda değişirse burada da değişmeli.
HARITA_OLCEK = 220 / 6400


def ada_yolu(olcek):
    noktalar = []
    for i in range(160):
        a = i / 160 * math.pi * 2
        dalga = 1 + 0.06 * math.sin(3 * a) + 0.04 * math.sin(5 * a + 1) + 0.02 * math.sin(11 * a + 2)
        x = 15 + (3200 + math.cos(a) * 2940 * dalga * olcek) * HARITA_OLCEK
        y = 15 + (1800 + math.sin(a) * 1580 * dalga * olcek) * HARITA_OLCEK
        noktalar.append(f"{x:.1f} {y:.1f}")
    return "M" + " L".join(noktalar) + "Z"


# Tarla: dünyada (2620,1630), 480x340 (oyundaki TARLA_X, TARLA_Y).
# Su tesisi: güvertesi dünyada (3090,3324), 220x150 (oyundaki TESIS_X, TESIS_Y).
tx = 15 + 2620 * HARITA_OLCEK
ty = 15 + 1630 * HARITA_OLCEK
yaz("harita-karti.svg", 250, 160, "Mini harita kartı: ada ve tarla",
    tarama("hDeniz", "#d7efff", "#a9dcf5", 45, 6, 2) + tarama("hKum", "#fbe7b5", "#f0cf86", 30, 6, 2)
    + tarama("hCimen", "#c9eba7", "#a3d97c", -35, 6, 2)
    + '    <clipPath id="kart"><rect x="15" y="15" width="220" height="124" rx="6"/></clipPath>\n',
    '  <rect x="7" y="9" width="240" height="148" rx="12" fill="#000" fill-opacity="0.15"/>\n' +
    kalem('''    <rect x="3" y="4" width="240" height="148" rx="12" fill="#fffdf6" stroke-width="3.5"/>
''') +
    '  <g clip-path="url(#kart)">\n    <rect x="15" y="15" width="220" height="124" fill="url(#hDeniz)"/>\n  </g>\n' +
    kalem(f'''    <path d="{ada_yolu(1)}" fill="url(#hKum)" stroke-width="2.5"/>
    <path d="{ada_yolu(0.93)}" fill="url(#hCimen)" stroke="none"/>
    <rect x="{tx:.1f}" y="{ty:.1f}" width="{480 * HARITA_OLCEK:.1f}" height="{340 * HARITA_OLCEK:.1f}" rx="2" fill="#8e6340" stroke-width="1.8"/>
    <rect x="{15 + 3090 * HARITA_OLCEK:.1f}" y="{15 + 3324 * HARITA_OLCEK:.1f}" width="{220 * HARITA_OLCEK:.1f}" height="{150 * HARITA_OLCEK:.1f}" rx="1.5" fill="#9be3dc" stroke-width="1.8"/>
''', 2.5) +
    '''  <rect x="2" y="0" width="50" height="16" fill="#f6e27a" opacity="0.85" transform="rotate(-12 27 8)"/>
''', 63, 2.5)

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
