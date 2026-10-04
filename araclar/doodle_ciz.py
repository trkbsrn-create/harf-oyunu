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

# Çitli tarla: 870x220, sol üst köşesi oyunda TARLA_X, TARLA_Y'ye gelir.
# 6 toprak karesi yan yana (tek sıra): sol üst köşeler (45 + 132i, 52), her biri 118x104.
kareler = ""
for i in range(6):
    x = 45 + 132 * i
    y = 52
    kareler += f'''    <rect x="{x}" y="{y}" width="118" height="104" rx="12" fill="url(#koyuToprak)"/>
    <path d="M{x+14} {y+30} q45 -10 90 0 M{x+14} {y+56} q45 -10 90 0 M{x+14} {y+82} q45 -10 90 0" fill="none" stroke="#5e3d22" stroke-width="2.5" opacity="0.6"/>
'''
kaziklar = ""
for x in range(10, 860, 55):
    for y in (12, 168):
        kaziklar += f'    <path d="M{x} {y} v34 l6 -10 l6 10 v-34z" fill="url(#tahta)"/>\n'
yaz("tarla.svg", 870, 220, "Çitli tarla: yan yana 6 ekim karesi", TOPRAK + KOYU_TOPRAK + TAHTA,
    '  <rect x="26" y="40" width="828" height="148" rx="16" fill="#000" fill-opacity="0.13"/>\n' +
    kalem(f'''    <rect x="20" y="30" width="828" height="148" rx="16" fill="url(#toprak)"/>
{kareler}{kaziklar}    <path d="M4 22 h858 M4 180 h858" fill="none" stroke-width="5"/>
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

# Tesis: 240x(364 + ISKELE_EK). Üstte kıyıdan gelen uzun iskele (x 95-145), altında
# deniz üstünde ayaklı güverte, ev, su deposu ve önde varil borusu. Oyunda sol üst köşesi
# (TESIS_X - 120, TESIS_Y). ISKELE_EK oyundaki ISKELE_EK ile aynı olmalı.
ISKELE_EK = 560
tahtalar = "".join(f'    <path d="M97 {y} h46" fill="none" stroke-width="2.5"/>\n' for y in range(12, ISKELE_EK + 90, 13))
iskele_ayaklari = "".join(f'    <circle cx="{x}" cy="{y}" r="6" fill="#8e6340" stroke-width="2.5"/>\n'
                          for y in range(120, ISKELE_EK + 80, 110) for x in (93, 147))
guverte = "".join(f'    <path d="M12 {y} h216" fill="none" stroke-width="2" opacity="0.7"/>\n' for y in range(100, 300, 16))
# Güvertenin önünde varil sırası: tanktan gelen borunun 6 ağzı (x: 36 + 34*i, oyundaki
# VARIL_YERI ile aynı). Varil yalnızca o harfin tohumu ekilince oyunda belirir (varil.svg).
varil_agizlari = "".join(f'    <path d="M{36 + 34 * i} 252 v10" fill="none" stroke="#8a8a8a" stroke-width="6"/>\n' for i in range(6))
yaz("su-tesisi.svg", 240, 364 + ISKELE_EK, "Su arıtma tesisi: uzun iskele, ayaklı güverte, ev, su deposu ve varil borusu",
    TAHTA + SU + DUVAR + KIREMIT,
    kalem(f'''    <rect x="95" y="0" width="50" height="{ISKELE_EK + 20}" fill="url(#tahta)"/>
''' + tahtalar + iskele_ayaklari) + f'  <g transform="translate(0 {ISKELE_EK})">\n' + kalem('''    <path d="M26 300 v54 M90 300 v54 M150 300 v54 M214 300 v54" fill="none" stroke="#8e6340" stroke-width="7"/>
    <path d="M6 354 q20 -8 40 0 q20 8 40 0 q20 -8 40 0 q20 8 40 0 q20 -8 40 0 q20 8 30 0" fill="none" stroke="#7cc4ef" stroke-width="3"/>
    <rect x="10" y="84" width="220" height="216" rx="6" fill="url(#tahta)"/>
''' + guverte + '''    <path d="M226 160 q14 0 12 30 v164" fill="none" stroke="#8a8a8a" stroke-width="9"/>
    <path d="M226 160 q14 0 12 30 v164" fill="none" stroke-width="2"/>
    <rect x="24" y="130" width="122" height="96" fill="url(#duvar)"/>
    <path d="M14 134 l30 -38 h82 l30 38z" fill="url(#kiremit)"/>
    <rect x="72" y="172" width="30" height="54" rx="4" fill="#9be3dc"/>
    <circle cx="96" cy="200" r="2.5" fill="#2b2b2b"/>
    <circle cx="46" cy="166" r="12" fill="#c9ecff"/>
    <path d="M46 154 v24 M34 166 h24" fill="none" stroke-width="2.5"/>
    <path d="M191 222 v30 h-163" fill="none" stroke="#8a8a8a" stroke-width="8"/>
''' + varil_agizlari + '''    <path d="M191 222 v30 h-163" fill="none" stroke-width="2"/>
    <path d="M160 120 v100 q31 14 62 0 v-100z" fill="url(#su)"/>
    <ellipse cx="191" cy="120" rx="31" ry="10" fill="#e6f6ff"/>
    <path d="M191 146 q-14 20 -14 30 q0 14 14 14 q14 0 14 -14 q0 -10 -14 -30z" fill="#ffffff" stroke-width="3"/>
''') + '''  <path d="M200 70 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4z M222 96 l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 l6 -3z" fill="#ffe680" stroke="#2b2b2b" stroke-width="2"/>
  </g>
''', 64)

# ---- Yelkenli (sahildeki kızakta; adadan kurtulmak için) ----
# Bütün yelkenli resimleri aynı 680x440 tuvalde: oyunda hepsi aynı sol üst köşeye konur
# (YELKENLI_X, YELKENLI_Y). Her harfin bir parçası var: a gövde, n direk, e bayrak, t dümen,
# i kürek, l yelken (öğretmenin kararı). Parça takılmadan önce kesik çizgili silik hâli görünür
# (yelkenli-<parça>-silik.svg), takılınca dolu hâli (yelkenli-<parça>.svg). Harfler oyunda yazılır.
YELKENLI_PARCALARI = [
    ("govde", "M70 285 h360 q-20 70 -70 80 h-220 q-50 -10 -70 -80z", "tahta"),
    ("direk", "M246 285 v-230 h10 v230z", "koyuTahta"),
    ("bayrak", "M256 55 v-34 l46 12 l-46 14z", "kirmiziKumas"),
    ("dumen", "M428 300 l30 0 l-6 70 l-24 -10z", "koyuTahta"),
    ("kurek", "M110 260 l-70 100 l-14 22 l10 6 l16 -18 l70 -104z", "tahta"),
    ("yelken", "M262 70 q70 90 100 200 h-100z", "yelkenBezi"),
]
YELKENLI_DESEN = (TAHTA + tarama("koyuTahta", "#b07a42", "#8e6340", 80, 7, 2.5)
                  + tarama("kirmiziKumas", "#ff9c8a", "#e0533d", -35, 6, 2.5)
                  + tarama("yelkenBezi", "#ffffff", "#e6eef3", 35, 7, 2.5))
for ad, yol, desen in YELKENLI_PARCALARI:
    yaz(f"yelkenli-{ad}.svg", 680, 440, f"Yelkenli parçası: {ad}", YELKENLI_DESEN,
        kalem(f'    <path d="{yol}" fill="url(#{desen})"/>\n'), 70)
    yaz(f"yelkenli-{ad}-silik.svg", 680, 440, f"Yelkenli parçasının silik yeri: {ad}", "",
        f'  <path d="{yol}" fill="#ffffff" fill-opacity="0.25" stroke="#8a8a8a" stroke-width="3.5" '
        'stroke-dasharray="10 8" stroke-linecap="round" stroke-linejoin="round"/>\n', 70)
# Parçanın çanta simgesi (120x120): parça kutucuğa sığacak kadar küçültülüp ortalanır
YELKENLI_KUTU = {"govde": (70, 285, 360, 80), "direk": (246, 55, 10, 230), "bayrak": (256, 21, 46, 48),
                 "dumen": (428, 300, 30, 70), "kurek": (26, 260, 96, 128), "yelken": (262, 70, 100, 200)}
for ad, yol, desen in YELKENLI_PARCALARI:
    x, y, en, boy = YELKENLI_KUTU[ad]
    olcek = 96 / max(en, boy)
    tx = 60 - (x + en / 2) * olcek
    ty = 60 - (y + boy / 2) * olcek
    yaz(f"yelkenli-{ad}-simge.svg", 120, 120, f"Yelkenli parçasının çanta simgesi: {ad}", YELKENLI_DESEN,
        kalem(f'    <path d="{yol}" fill="url(#{desen})" transform="translate({tx:.1f} {ty:.1f}) scale({olcek:.3f})" '
              'vector-effect="non-scaling-stroke"/>\n', 3.5), 72, 2.5)
# Kızak: tahta raylar (sağda denize iner) ve üç destek takozu
yaz("yelkenli-kizak.svg", 680, 440, "Yelkenli kızağı", TAHTA + tarama("koyuTahta", "#b07a42", "#8e6340", 80, 7, 2.5),
    golge(260, 392, 250, 8) + kalem('''    <path d="M20 375 l520 -12 l120 60" fill="none" stroke="#8e6340" stroke-width="12"/>
    <path d="M20 375 l520 -12 l120 60" fill="none" stroke-width="2"/>
    <rect x="110" y="360" width="18" height="30" rx="3" fill="url(#koyuTahta)" stroke-width="3"/>
    <rect x="250" y="357" width="18" height="30" rx="3" fill="url(#koyuTahta)" stroke-width="3"/>
    <rect x="390" y="354" width="18" height="30" rx="3" fill="url(#koyuTahta)" stroke-width="3"/>
'''), 71)

# ---- Açılış hikâyesi (HikayeSahnesi): fırtınalı deniz, kumsal, sal, tahta, şimşek ----
def dalgalar(y0, adim, sayi, renk, kalinlik=5):
    return "".join(f'  <path d="M-20 {y0 + i * adim} ' + " ".join("q40 -22 80 0 q40 22 80 0" for _ in range(9))
                   + f'" fill="none" stroke="{renk}" stroke-width="{kalinlik}" stroke-linecap="round"/>\n'
                   for i in range(sayi))
yaz("hikaye-firtina.svg", 1280, 720, "Açılış hikâyesi: fırtınalı gökyüzü ve deniz",
    tarama("gok", "#9aa7b4", "#8796a5", 45, 10, 3) + tarama("koyuDeniz", "#7fa9c4", "#5f8aa6", 45, 10, 3),
    '  <rect width="1280" height="720" fill="url(#gok)"/>\n  <rect y="400" width="1280" height="320" fill="url(#koyuDeniz)"/>\n'
    + dalgalar(405, 70, 5, "#ffffff"), 73)
yaz("hikaye-kumsal.svg", 1280, 720, "Açılış hikâyesi: kumsal (üstte çimen, altta deniz)",
    tarama("cimen", "#d8f0c0", "#bfe39f", 35, 8, 3) + tarama("kum", "#fbe7b0", "#f3d68a", 35, 8, 3) + SU,
    '  <rect width="1280" height="330" fill="url(#cimen)"/>\n'
    '  <path d="M0 250 q320 50 640 20 q320 -30 640 10 v300 h-1280z" fill="url(#kum)"/>\n'
    '  <rect y="560" width="1280" height="160" fill="url(#su)"/>\n'
    + kalem('    <path d="M0 250 q320 50 640 20 q320 -30 640 10" fill="none" stroke-width="3"/>\n'
            '    <path d="M0 560 h1280" fill="none" stroke-width="3"/>\n', 3)
    + dalgalar(566, 60, 3, "#ffffff", 4), 74)
yaz("hikaye-sal.svg", 300, 230, "Açılış hikâyesi: küçük sal (tahta, direk, yelken); alt ortası (150, 215)",
    TAHTA, kalem('''    <path d="M150 190 v-170" fill="none" stroke="#8e6340" stroke-width="9"/>
    <path d="M150 190 v-170" fill="none" stroke-width="2"/>
    <path d="M156 28 q70 50 80 130 h-80z" fill="#ffffff"/>
    <rect x="20" y="188" width="260" height="30" rx="6" fill="url(#tahta)"/>
    <path d="M85 190 v28 M150 190 v28 M215 190 v28" fill="none" stroke-width="2.5"/>
'''), 75)
yaz("hikaye-tahta.svg", 160, 44, "Açılış hikâyesi: kırık sal tahtası", TAHTA,
    kalem('    <path d="M8 10 h120 l12 6 l-6 6 l14 4 l-8 10 h-132z" fill="url(#tahta)"/>\n'), 76)
yaz("hikaye-simsek.svg", 120, 200, "Açılış hikâyesi: şimşek", "",
    kalem('    <path d="M70 6 l-50 100 h40 l-36 88 l84 -120 h-44 l38 -68z" fill="#ffe680"/>\n', 4), 77)

# ---- Final (FinalSahnesi): gün batımında deniz ve adalar haritası ----
yaz("hikaye-gunbatimi.svg", 1280, 720, "Final: gün batımında deniz, uzakta ilk ada",
    tarama("aksam", "#ffe9c2", "#ffdca6", 35, 10, 3) + tarama("cimen", "#d8f0c0", "#bfe39f", 35, 8, 3) + SU,
    '  <rect width="1280" height="720" fill="url(#aksam)"/>\n'
    '  <circle cx="1000" cy="300" r="110" fill="#ffc58f"/>\n'
    '  <rect y="380" width="1280" height="340" fill="url(#su)"/>\n'
    + kalem('    <path d="M40 382 q120 -90 260 0z" fill="url(#cimen)" stroke-width="3"/>\n'
            '    <path d="M0 382 h1280" fill="none" stroke-width="3"/>\n', 3)
    + dalgalar(390, 70, 5, "#ffffff", 4), 78)
yaz("hikaye-harita.svg", 1280, 720, "Final: adalar haritası (1. ada yeşil, 2. ada kesik çizgili)",
    tarama("kagit", "#fbf4e2", "#f1e6c8", 30, 8, 3) + tarama("cimen", "#d8f0c0", "#bfe39f", 35, 8, 3) + SU,
    '  <rect width="1280" height="720" fill="url(#kagit)"/>\n'
    '  <rect x="60" y="60" width="1160" height="600" rx="30" fill="url(#su)" opacity="0.6"/>\n'
    + kalem('    <path d="M160 400 q120 -150 300 -20 q-120 120 -300 20z" fill="url(#cimen)"/>\n'
            '    <path d="M820 330 q140 -160 320 -10 q-150 110 -320 10z" fill="#eeeeee" stroke="#8a8a8a" stroke-dasharray="14 10"/>\n'
            '    <path d="M470 380 q170 -160 340 -60" fill="none" stroke="#e0533d" stroke-dasharray="16 12"/>\n', 4), 79)

# Harf varili: 120x150. Gövdenin üst ortası (52, 14); sağda musluk. Harf oyunda etikete yazılır.
yaz("varil.svg", 120, 150, "Harf varili (musluklu)",
    tarama("varilTahta", "#d29a5c", "#b07a42", 80, 6, 2.5) + SU,
    golge(54, 142, 46, 6) + kalem('''    <path d="M14 14 q-14 63 0 126 h76 q14 -63 0 -126z" fill="url(#varilTahta)"/>
    <path d="M30 14 q-8 63 0 126 M74 14 q8 63 0 126" fill="none" stroke="#9b6a38" stroke-width="2.5"/>
    <path d="M8 38 q44 9 88 0 M8 116 q44 9 88 0" fill="none" stroke="#8a8a8a" stroke-width="8"/>
    <path d="M8 38 q44 9 88 0 M8 116 q44 9 88 0" fill="none" stroke-width="2"/>
    <ellipse cx="52" cy="14" rx="38" ry="10" fill="#c9ecff"/>
    <ellipse cx="52" cy="15" rx="28" ry="6" fill="url(#su)" stroke="none"/>
    <rect x="25" y="50" width="54" height="56" rx="8" fill="#fbf4e2" stroke-width="3"/>
    <path d="M92 96 h16 v10" fill="none" stroke="#8a8a8a" stroke-width="9"/>
    <path d="M92 96 h16 v10" fill="none" stroke-width="2"/>
    <path d="M100 86 h16" fill="none" stroke="#ff8a7a" stroke-width="7"/>
'''), 69, 2.5)

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

# Su arıtma tesisi paneli: 700x480, sol üst köşesi oyunda (290,120). Solda su tankı, üstte
# boru; borunun 6 ağzının altına (x: 150 + 88*i, y: 212) ekilen harflerin varilleri gelir
# (varil.svg, oyunda). Çarpı (625,45).
agizlar = "".join(f'    <path d="M{150 + 88 * i} 185 v26" fill="none" stroke="#8a8a8a" stroke-width="10"/>\n'
                  f'    <circle cx="{150 + 88 * i}" cy="185" r="9" fill="#bdbdbd" stroke-width="2.5"/>\n' for i in range(6))
yaz("tesis-pencere.svg", 700, 480, "Su arıtma tesisi paneli",
    tarama("kagit", "#fbf4e2", "#f1e6c8", 30, 8, 3) + tarama("bant", "#c9ecff", "#7cc4ef", 35) + SU,
    '  <rect x="30" y="44" width="620" height="420" rx="30" fill="#000" fill-opacity="0.18"/>\n' +
    kalem(f'''    <path d="M20 66 q0 -36 36 -36 h548 q36 0 36 36 v348 q0 36 -36 36 h-548 q-36 0 -36 -36z" fill="url(#kagit)"/>
    <path d="M20 66 q0 -36 36 -36 h548 q36 0 36 36 v44 h-620z" fill="url(#bant)"/>
    <path d="M100 185 h500" fill="none" stroke="#8a8a8a" stroke-width="14"/>
    <path d="M100 185 h500" fill="none" stroke-width="2"/>
{agizlar}    <path d="M44 165 v260 q30 14 60 0 v-260z" fill="url(#su)"/>
    <ellipse cx="74" cy="165" rx="30" ry="9" fill="#e6f6ff"/>
    <path d="M74 255 q-12 17 -12 26 q0 12 12 12 q12 0 12 -12 q0 -9 -12 -26z" fill="#ffffff" stroke-width="3"/>
    <circle cx="625" cy="45" r="31" fill="#ff8a7a"/>
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

# ---- Büyüyen bitki (tarlada, sulandıkça) ----
# Üçü de alt ortasından (tabanından) oyunda karenin dibine konur.
TUMSEK = '    <path d="M{x1} {y} q{yarim} -22 {tam} 0z" fill="url(#koyuToprak)" stroke-width="3.5"/>\n'


def tumsek(orta, taban, en):
    return TUMSEK.format(x1=orta - en / 2, y=taban, yarim=en / 2, tam=en)


# 1) Filiz: 100x110, taban (50,106)
yaz("bitki-filiz.svg", 100, 110, "Filiz: tohum bir kez sulanınca", KOYU_TOPRAK + YESIL,
    kalem('''    <path d="M50 100 q-4 -34 2 -66" fill="none" stroke="#6fbf4a" stroke-width="6"/>
    <path d="M50 100 q-4 -34 2 -66" fill="none" stroke-width="2"/>
    <path d="M50 66 q-30 -6 -38 -28 q26 -4 38 28z M51 58 q28 -10 36 -32 q-26 -2 -36 32z" fill="url(#yesil)" stroke-width="3"/>
    <path d="M52 36 q-18 -12 -16 -30 q18 6 16 30z M52 36 q16 -14 14 -32 q-16 8 -14 32z" fill="url(#yesil)" stroke-width="3"/>
''' + tumsek(50, 106, 70)), 71)

# 2) Küçük ağaç: 130x150, taban (65,146) (çizim 10 px sağa kaydırılır, tepe sığsın)
yaz("bitki-fidan.svg", 130, 150, "Küçük ağaç: tohum iki kez sulanınca", KOYU_TOPRAK + KOYU_YESIL
    + tarama("govde", "#c98f4f", "#9a6c43", 80, 6, 2.5),
    kalem('''    <g transform="translate(10 0)">
    <path d="M48 140 l2 -62 h10 l2 62z" fill="url(#govde)" stroke-width="3"/>
    <path d="M55 96 l-14 -12 M56 90 l12 -10" fill="none" stroke-width="3"/>
    <path d="M24 70 q-18 -6 -12 -26 q-2 -24 22 -26 q10 -16 30 -10 q22 -6 32 12 q20 6 16 28 q8 22 -14 26 q-14 12 -34 4 q-24 10 -40 -8z" fill="url(#koyuYesil)"/>
    <path d="M38 44 q8 -8 18 -2 M64 56 q8 -6 16 0" fill="none" stroke-width="2.5"/>
''' + tumsek(55, 146, 80) + '    </g>\n'), 72)

# 3) Fasulye sırığı. İki çizim var:
#  - bulut-sirik.svg (240x780): bulutların üstündeki sahnede; tepesi bulutun içinde.
#  - bitki-sirik.svg (240x380, taban (120,374)): adada tarladaki son aşama; kısa, yukarı
#    doğru solarak gökyüzünde kaybolur (sonsuza gidiyormuş gibi, ekranı kaplamaz).
# Birbirine sarılan iki sap yukarı çıktıkça incelir.
SIRIK_EN, SIRIK_BOY = 240, 780


def sap(faz, y1, y2, boy=SIRIK_BOY):
    noktalar = []
    for y in range(y1, y2 - 1, -6):
        genlik = 10 + 22 * (y / boy)  # aşağıda geniş, yukarıda dar kıvrım
        x = SIRIK_EN / 2 + genlik * math.sin(y / 46 + faz)
        noktalar.append(f"{x:.1f} {y}")
    return "M" + " L".join(noktalar)


# Aşağıdan yukarı: parça parça incelen iki sap. Önce bütün koyu kalem kenarları, sonra
# yeşiller çizilir (parçaların birleştiği yerde çizgi kalmasın).
parcalar = [(770, 620, 16), (626, 470, 13), (476, 330, 11), (336, 200, 9), (206, 90, 7)]
kenarlar = ""
yesiller = ""
for y1, y2, kalinlik in parcalar:
    for faz in (0, math.pi):
        kenarlar += f'    <path d="{sap(faz, y1, y2)}" fill="none" stroke="{KALEM}" stroke-width="{kalinlik + 5}"/>\n'
        yesiller += f'    <path d="{sap(faz, y1, y2)}" fill="none" stroke="#6fbf4a" stroke-width="{kalinlik}"/>\n'
saplar = kenarlar + yesiller
yapraklar = ""
for i, y in enumerate(range(700, 130, -62)):
    sag = i % 2 == 0
    olcek = 0.8 + 0.7 * (y / SIRIK_BOY)
    x = SIRIK_EN / 2 + (18 if sag else -18)
    aci = -35 if sag else 215
    yapraklar += (f'    <path d="M0 0 q20 -26 48 -14 q-6 30 -48 14z" fill="url(#koyuYesil)" stroke-width="3" '
                  f'transform="translate({x:.0f} {y}) rotate({aci}) scale({olcek:.2f})"/>\n')
bulut = "".join(f'    <circle cx="{x}" cy="{y}" r="{r}" fill="#ffffff" stroke-width="3.5"/>\n'
                for x, y, r in [(70, 70, 34), (120, 48, 42), (172, 72, 34), (98, 96, 30), (148, 98, 30)])
yaz("bulut-sirik.svg", SIRIK_EN, SIRIK_BOY, "Fasulye sırığı: bulutların üstünde, tepesi bulutta", KOYU_TOPRAK + KOYU_YESIL,
    kalem(saplar + yapraklar + bulut +
          '    <path d="M64 104 q56 14 112 0" fill="none" stroke="#ffffff" stroke-width="16"/>\n'
          + tumsek(120, 774, 110), 3.5)
    + '''  <path d="M40 20 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4z M206 30 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3z" fill="#ffe680" stroke="#2b2b2b" stroke-width="2"/>
''', 75)

# Adadaki kısa, solan sırık
KISA_BOY = 380
kenarlar = ""
yesiller = ""
for y1, y2, kalinlik in [(374, 280, 16), (286, 190, 13), (196, 110, 11), (116, 10, 9)]:
    for faz in (0, math.pi):
        kenarlar += f'    <path d="{sap(faz, y1, y2, KISA_BOY)}" fill="none" stroke="{KALEM}" stroke-width="{kalinlik + 5}"/>\n'
        yesiller += f'    <path d="{sap(faz, y1, y2, KISA_BOY)}" fill="none" stroke="#6fbf4a" stroke-width="{kalinlik}"/>\n'
yapraklar = ""
for i, y in enumerate(range(330, 40, -52)):
    sag = i % 2 == 0
    olcek = 0.8 + 0.7 * (y / KISA_BOY)
    x = SIRIK_EN / 2 + (18 if sag else -18)
    aci = -35 if sag else 215
    yapraklar += (f'    <path d="M0 0 q20 -26 48 -14 q-6 30 -48 14z" fill="url(#koyuYesil)" stroke-width="3" '
                  f'transform="translate({x:.0f} {y}) rotate({aci}) scale({olcek:.2f})"/>\n')
SOLMA = f'''    <linearGradient id="solma" x1="0" y1="0" x2="0" y2="{KISA_BOY}" gradientUnits="userSpaceOnUse">
      <stop offset="0.04" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="1"/>
    </linearGradient>
    <mask id="sol"><rect width="{SIRIK_EN}" height="{KISA_BOY}" fill="url(#solma)"/></mask>
'''
yaz("bitki-sirik.svg", SIRIK_EN, KISA_BOY, "Fasulye sırığı: tarlada son aşama, gökyüzüne doğru solar",
    KOYU_TOPRAK + KOYU_YESIL + SOLMA,
    '  <g mask="url(#sol)">\n' + kalem(kenarlar + yesiller + yapraklar + tumsek(120, 374, 110), 3.5) + '  </g>\n'
    # Solan tepede silik bir bulut: sırık buluta çıkıyor
    + '  <g opacity="0.55">\n' + kalem("".join(
        f'    <circle cx="{x}" cy="{y}" r="{r}" fill="#ffffff" stroke-width="2.5"/>\n'
        for x, y, r in [(78, 52, 28), (120, 34, 34), (162, 54, 28), (100, 70, 24), (142, 72, 24)])
        + '    <path d="M74 72 q46 14 92 0" fill="none" stroke="#ffffff" stroke-width="14"/>\n', 2.5) + '  </g>\n'
    + '''  <path d="M70 60 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4z M176 30 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3z M150 110 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2z" fill="#ffe680" stroke="#2b2b2b" stroke-width="1.5" opacity="0.7"/>
''', 75)


# Harf tabelası: 46x60. Tahta levha (3-43, 4-34) ve kazık; harf oyunda levhanın
# ortasına (23,19) yazılır. Alt ortası karenin dibine konur.
yaz("harf-tabela.svg", 46, 60, "Bitkinin harf tabelası", TAHTA,
    kalem('''    <path d="M21 32 v26 h4 v-26z" fill="#c98f4f" stroke-width="2.5"/>
    <rect x="3" y="4" width="40" height="30" rx="5" fill="url(#tahta)" stroke-width="3"/>
'''), 74, 2.5)

# ---- Bulutların üstü ----
GOK = tarama("gok", "#ffffff", "#e3f2fc", -30, 8, 2.5)

# Uzaktaki bulut: 220x110
yaz("bulut.svg", 220, 110, "Gökyüzünde süzülen bulut", GOK,
    kalem("""    <path d="M30 96 q-26 -2 -22 -26 q2 -22 28 -20 q4 -30 40 -30 q22 -22 54 -6 q30 -10 44 18 q30 0 32 30 q2 32 -30 34z" fill="url(#gok)"/>
""", 3.5), 76)

# Bulut zemini: 1280x300; üst kenarı kabarık (yaklaşık y 40-90), karakter y 470-640 arasında
# (oyunda zeminin üst kenarı ekranda 420 civarı) yürür.
kabarik = "M-20 340 V80 H0"  # kenar çizgileri resmin dışında kalsın
x = 0
r = __import__("random").Random(7)
while x < 1280 + 150:
    en = r.randint(90, 150)
    yuk = r.randint(40, 75)
    kabarik += f" q{en / 2:.0f} -{yuk} {en} 0"
    x += en
kabarik += " V340 H-20z"
yaz("bulut-zemin.svg", 1280 + 150, 300, "Bulutların üstündeki zemin", GOK + tarama("golgeGok", "#eaf5fd", "#d2e9f8", 30, 8, 3),
    kalem(f"""    <path d="{kabarik}" fill="url(#gok)" stroke-width="4"/>
    <path d="M0 300 V230 q160 -30 320 0 q160 30 320 0 q160 -30 320 0 q160 30 320 0 q80 -15 150 -5 V300z" fill="url(#golgeGok)" stroke="none"/>
""", 4), 77)

# ---- Mini oyunlar menüsü ----
# Oyun kartı: 250x170. Başlık oyunda yazılır.
yaz("oyun-karti.svg", 250, 170, "Mini oyun kartı", tarama("kartKagit", "#fffdf6", "#f1e6c8", 30, 8, 3),
    '  <rect x="12" y="14" width="232" height="152" rx="18" fill="#000" fill-opacity="0.15"/>\n' +
    kalem("""    <rect x="6" y="6" width="232" height="152" rx="18" fill="url(#kartKagit)" stroke-width="4"/>
""", 4), 78, 3)

# Can (kalp): 50x46; dolu ve boş (kaybedilmiş)
KALP = '    <path d="M25 42 l-18 -18 q-10 -12 0 -20 q10 -6 18 6 q8 -12 18 -6 q10 8 0 20z" fill="{dolgu}" stroke-width="3.5"/>\n'
yaz("kalp.svg", 50, 46, "Can: dolu kalp", tarama("kirmiziKalp", "#ff9c8a", "#e0533d", -35, 6, 2.5),
    kalem(KALP.format(dolgu="url(#kirmiziKalp)"), 3.5), 79, 2.5)
yaz("kalp-bos.svg", 50, 46, "Can: kaybedilmiş kalp", "",
    kalem(KALP.format(dolgu="#e9e4da"), 3.5).replace('stroke="#2b2b2b"', 'stroke="#b8b0a2"'), 80, 2.5)

# Balon: 80x130 (beyaz taranmış; oyunda renk verilir). Balonun ortası (40,42); ip aşağı sarkar.
yaz("balon.svg", 80, 130, "Harf balonu (oyunda boyanır)", tarama("balonTarama", "#ffffff", "#e3e3e3", -35, 6, 2.5),
    '    <path d="M40 84 q-8 16 4 26 q10 10 -2 20" fill="none" stroke="#2b2b2b" stroke-width="2.5"/>\n' +
    kalem("""    <ellipse cx="40" cy="42" rx="34" ry="40" fill="url(#balonTarama)"/>
    <path d="M34 82 h12 l-6 7z" fill="#ffffff" stroke-width="2.5"/>
    <path d="M22 22 q6 -10 16 -12" fill="none" stroke="#ffffff" stroke-width="6"/>
""", 3.5), 81, 2.5)

# Yıldız: 80x78 (mini oyun bitişinde 1-3 yıldız; uçan ödül yıldızı). Ortası (40,41).
def _yildiz_noktalari(cx, cy, dis, ic):
    nok = []
    for i in range(10):
        r = dis if i % 2 == 0 else ic
        a = -math.pi / 2 + i * math.pi / 5
        nok.append(f"{cx + r * math.cos(a):.1f},{cy + r * math.sin(a):.1f}")
    return " ".join(nok)


YILDIZ = '    <polygon points="' + _yildiz_noktalari(40, 42, 36, 16) + '" fill="{dolgu}" stroke-width="3.5"/>\n'
yaz("yildiz.svg", 80, 78, "Ödül yıldızı", tarama("sariYildiz", "#ffe680", "#ffc928", -40, 6, 3),
    kalem(YILDIZ.format(dolgu="url(#sariYildiz)") +
          '    <path d="M30 30 l6 -10" fill="none" stroke="#ffffff" stroke-width="4"/>\n', 3.5), 83, 2.5)
yaz("yildiz-bos.svg", 80, 78, "Kazanılmamış yıldız", "",
    kalem(YILDIZ.format(dolgu="#e9e4da"), 3.5).replace('stroke="#2b2b2b"', 'stroke="#b8b0a2"'), 84, 2.5)

# Gösteren el: 90x110, işaret parmağı yukarıda; parmak ucu (32,8). Mini oyunların ilk
# turunda nereye dokunulacağını gösterir.
yaz("el.svg", 90, 110, "Gösteren el", tarama("ten", "#ffe2c6", "#f5c9a0", -35, 6, 2.5),
    kalem('''    <path d="M22 50 V18 q0 -12 10 -12 q10 0 10 12 V46
      q4 -8 11 -6 q7 2 6 10 q5 -7 11 -4 q6 3 5 11 q6 -4 10 1 q4 5 2 14 V78
      q0 26 -28 28 h-10 q-20 0 -28 -18 l-14 -28 q-4 -10 4 -13 q8 -3 13 6 z" fill="url(#ten)"/>
    <path d="M53 50 v10 M70 58 v8" fill="none" stroke-width="2.5"/>
''', 3.5), 85, 2.5)

# Balık: 200x110 (beyaz taranmış; oyunda renk verilir). Başı solda; gövdenin ortası (88,55).
yaz("balik.svg", 200, 110, "Hece balığı (oyunda boyanır)", tarama("balikTarama", "#ffffff", "#e3e3e3", -35, 6, 2.5),
    kalem("""    <path d="M160 55 L196 22 Q186 55 196 88 Z" fill="url(#balikTarama)"/>
    <path d="M70 16 Q92 -2 118 14" fill="url(#balikTarama)"/>
    <ellipse cx="88" cy="55" rx="80" ry="44" fill="url(#balikTarama)"/>
    <circle cx="34" cy="44" r="6" fill="#2b2b2b" stroke-width="0"/>
    <path d="M18 66 q8 6 16 2" fill="none" stroke-width="2.5"/>
""", 3.5), 82, 2.5)

# ---- Mini harita kartı (sol alt) ----
# 250x175 kâğıt kart. İçindeki harita alanı (15,15)'ten başlar, 220 px genişliğinde:
# dünya (6400x4200; altta iskele için geniş deniz) 220/6400 ölçeğiyle küçültülür. Ada şekli oyundaki adaNoktalari()
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


# Tarla: dünyada (2765,1590), 870x220 (oyundaki TARLA_X, TARLA_Y).
# Su tesisi: iskele dünyada y 3240'tan başlar; güvertesi (3090, 3324 + ISKELE_EK), 220x150
# (oyundaki TESIS_X, TESIS_Y).
HARITA_BOY = 4200 * HARITA_OLCEK
tx = 15 + 2765 * HARITA_OLCEK
ty = 15 + 1590 * HARITA_OLCEK
yaz("harita-karti.svg", 250, 175, "Mini harita kartı: ada ve tarla",
    tarama("hDeniz", "#d7efff", "#a9dcf5", 45, 6, 2) + tarama("hKum", "#fbe7b5", "#f0cf86", 30, 6, 2)
    + tarama("hCimen", "#c9eba7", "#a3d97c", -35, 6, 2)
    + f'    <clipPath id="kart"><rect x="15" y="15" width="220" height="{HARITA_BOY:.1f}" rx="6"/></clipPath>\n',
    '  <rect x="7" y="9" width="240" height="163" rx="12" fill="#000" fill-opacity="0.15"/>\n' +
    kalem('''    <rect x="3" y="4" width="240" height="163" rx="12" fill="#fffdf6" stroke-width="3.5"/>
''') +
    f'  <g clip-path="url(#kart)">\n    <rect x="15" y="15" width="220" height="{HARITA_BOY:.1f}" fill="url(#hDeniz)"/>\n  </g>\n' +
    kalem(f'''    <path d="{ada_yolu(1)}" fill="url(#hKum)" stroke-width="2.5"/>
    <path d="{ada_yolu(0.93)}" fill="url(#hCimen)" stroke="none"/>
    <rect x="{tx:.1f}" y="{ty:.1f}" width="{870 * HARITA_OLCEK:.1f}" height="{220 * HARITA_OLCEK:.1f}" rx="2" fill="#8e6340" stroke-width="1.8"/>
    <path d="M{15 + 3200 * HARITA_OLCEK:.1f} {15 + 3240 * HARITA_OLCEK:.1f} V{15 + (3324 + ISKELE_EK) * HARITA_OLCEK:.1f}" fill="none" stroke="#c98f4f" stroke-width="2.5"/>
    <rect x="{15 + 3090 * HARITA_OLCEK:.1f}" y="{15 + (3324 + ISKELE_EK) * HARITA_OLCEK:.1f}" width="{220 * HARITA_OLCEK:.1f}" height="{150 * HARITA_OLCEK:.1f}" rx="1.5" fill="#9be3dc" stroke-width="1.8"/>
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

# ---- Resimden Sesi Bul kelime resimleri (130x120 tuval; harf başta/sonda/ortada) ----
KIRMIZI = tarama("kirmizi", "#ff9c8a", "#e0533d", -35, 7, 3.5)
yaz("resim-top.svg", 130, 120, "Top", tarama("mavi", "#bfe3f5", "#7cc3e6", 30, 7, 3) + KIRMIZI,
    golge(65, 112, 40) + kalem('''    <circle cx="65" cy="60" r="48" fill="#ffffff"/>
    <path d="M65 12 q-24 48 0 96 q24 -48 0 -96z" fill="url(#kirmizi)"/>
    <path d="M18 50 q47 18 94 0 q2 10 0 20 q-47 18 -94 0 q-2 -10 0 -20z" fill="url(#mavi)"/>
    <circle cx="65" cy="60" r="48" fill="none"/>
    <path d="M36 36 q8 -12 22 -16" fill="none" stroke="#ffffff" stroke-width="6"/>
'''), 101)
yaz("resim-elma.svg", 130, 120, "Elma", KIRMIZI + tarama("yaprak", "#c9eba7", "#8fd16a", 35, 6, 3),
    golge(65, 114, 38) + kalem('''    <path d="M66 30 q-2 -16 6 -24" fill="none" stroke-width="5"/>
    <path d="M72 20 q20 -18 36 -6 q-16 18 -36 6z" fill="url(#yaprak)"/>
    <path d="M65 30 q-14 -10 -32 -4 q-26 10 -22 44 q4 34 30 42 q12 4 24 -4 q12 8 24 4 q26 -8 30 -42 q4 -34 -22 -44 q-18 -6 -32 4z" fill="url(#kirmizi)"/>
    <path d="M30 52 q4 -12 16 -16" fill="none" stroke="#ffffff" stroke-width="6"/>
'''), 102)
yaz("resim-kedi.svg", 130, 120, "Kedi (oturan, önden)", tarama("turuncu", "#ffd9a8", "#f5a65b", -35, 7, 3),
    golge(62, 114, 42) + kalem('''    <path d="M96 106 q32 -2 26 -34 q-2 -10 -10 -8 q2 20 -18 30z" fill="url(#turuncu)"/>
    <path d="M34 110 q-8 -50 28 -54 q36 4 28 54z" fill="url(#turuncu)"/>
    <path d="M50 110 q0 -24 12 -26 q12 2 12 26z" fill="#ffffff" stroke-width="3"/>
    <path d="M26 30 l6 -26 l20 14 q10 -4 20 0 l20 -14 l6 26 q8 26 -26 36 q-14 4 -20 0 q-34 -10 -26 -36z" fill="url(#turuncu)"/>
    <path d="M34 12 l4 12 l8 -6z M90 12 l-4 12 l-8 -6z" fill="#ffd2c8" stroke-width="2.5"/>
    <circle cx="48" cy="36" r="4" fill="#2b2b2b"/>
    <circle cx="76" cy="36" r="4" fill="#2b2b2b"/>
    <path d="M58 46 l4 4 l4 -4z" fill="#ff9c8a" stroke-width="2.5"/>
    <path d="M62 50 q-4 6 -10 4 M62 50 q4 6 10 4 M40 48 h-20 M40 52 l-18 6 M84 48 h20 M84 52 l18 6" fill="none" stroke-width="2.5"/>
'''), 103)
yaz("resim-balon.svg", 130, 120, "Balon", tarama("mor", "#d8c2f3", "#a77be0", -35, 7, 3),
    kalem('''    <path d="M65 86 q-10 12 4 20 q12 6 -2 14" fill="none" stroke-width="3"/>
    <path d="M65 6 q38 0 38 40 q0 34 -38 42 q-38 -8 -38 -42 q0 -40 38 -40z" fill="url(#mor)"/>
    <path d="M58 88 l7 -6 l7 6z" fill="#a77be0" stroke-width="3"/>
    <path d="M42 30 q6 -12 18 -14" fill="none" stroke="#ffffff" stroke-width="6"/>
'''), 104)

# --- a harfi ---
KAHVE = tarama("kahve", "#d9a46b", "#b07a42", 30, 7, 3)
GRI = tarama("gri", "#d6d3cc", "#a9a59c", 30, 7, 3)
SARI2 = tarama("sari", "#ffe680", "#ffc928", -40, 6, 3)
YESIL2 = tarama("yesil", "#c9eba7", "#8fd16a", 35, 6, 3)
MAVI = tarama("mavi", "#bfe3f5", "#7cc3e6", 30, 7, 3)
TURUNCU = tarama("turuncu", "#ffc58f", "#f08a3c", -35, 7, 3)
PEMBE = tarama("pembe", "#ffd2c8", "#ff9c8a", -35, 6, 2.5)
MOR = tarama("mor", "#d8c2f3", "#a77be0", -35, 7, 3)

def resim(ad, aciklama, desenler, govde, tohum):
    yaz(f"resim-{ad}.svg", 130, 120, aciklama, desenler, govde, tohum)

resim("ayi", "Ayı (oturan, önden)", KAHVE + tarama("acik", "#f2d7b0", "#d9b07a", -30, 6, 2.5),
    golge(65, 114, 44) + kalem("""    <circle cx="36" cy="18" r="13" fill="url(#kahve)"/>
    <circle cx="94" cy="18" r="13" fill="url(#kahve)"/>
    <path d="M30 112 q-12 -44 35 -48 q47 4 35 48z" fill="url(#kahve)"/>
    <path d="M48 112 q-4 -26 17 -28 q21 2 17 28z" fill="url(#acik)" stroke-width="3"/>
    <circle cx="65" cy="40" r="32" fill="url(#kahve)"/>
    <ellipse cx="65" cy="52" rx="15" ry="11" fill="url(#acik)" stroke-width="3"/>
    <ellipse cx="65" cy="47" rx="6" ry="4" fill="#2b2b2b"/>
    <path d="M65 51 v6 q-5 4 -8 0 M65 57 q5 4 8 0" fill="none" stroke-width="2.5"/>
    <circle cx="52" cy="34" r="3.5" fill="#2b2b2b"/>
    <circle cx="78" cy="34" r="3.5" fill="#2b2b2b"/>
"""), 111)
resim("at", "At (yandan)", KAHVE,
    golge(70, 114, 46) + kalem("""    <path d="M48 76 v36 M60 78 v34 M94 78 v34 M106 74 v38" fill="none" stroke-width="6"/>
    <path d="M110 52 q16 6 12 40 q-8 -8 -12 -22" fill="#5a3b2a"/>
    <ellipse cx="78" cy="62" rx="40" ry="20" fill="url(#kahve)"/>
    <path d="M44 62 q-6 -22 -12 -36 l16 -8 q10 16 14 36z" fill="url(#kahve)"/>
    <ellipse cx="26" cy="30" rx="20" ry="11" transform="rotate(28 26 30)" fill="url(#kahve)"/>
    <path d="M36 14 l2 -10 l7 10z" fill="url(#kahve)" stroke-width="3"/>
    <path d="M44 16 q10 10 18 40" fill="none" stroke="#5a3b2a" stroke-width="7"/>
    <circle cx="28" cy="24" r="2.8" fill="#2b2b2b"/>
    <circle cx="12" cy="36" r="1.8" fill="#2b2b2b"/>
"""), 112)
resim("armut", "Armut", tarama("armut", "#e4f2a0", "#b9d65a", -35, 7, 3) + YESIL2,
    golge(65, 114, 34) + kalem("""    <path d="M64 22 q2 -12 8 -18" fill="none" stroke-width="5"/>
    <path d="M70 14 q18 -12 30 -2 q-14 12 -30 2z" fill="url(#yesil)"/>
    <path d="M64 20 q-16 0 -16 24 q0 12 -12 26 q-10 14 -6 26 q8 18 34 16 q26 2 34 -16 q4 -12 -6 -26 q-12 -14 -12 -26 q0 -24 -16 -24z" fill="url(#armut)"/>
    <path d="M44 74 q2 -10 8 -16" fill="none" stroke="#ffffff" stroke-width="5"/>
"""), 113)
resim("ay", "Ay (hilal, gülen)", SARI2,
    kalem("""    <path d="M74 8 q-46 6 -46 52 q0 46 46 52 q-30 -16 -30 -52 q0 -36 30 -52z" fill="url(#sari)"/>
    <circle cx="44" cy="52" r="3" fill="#2b2b2b"/>
    <path d="M42 70 q6 4 10 -2" fill="none" stroke-width="2.5"/>
    <path d="M98 24 l3 7 l7 1 l-5 5 l1 7 l-6 -3 l-6 3 l1 -7 l-5 -5 l7 -1z M104 76 l2 5 l5 1 l-4 3 l1 5 l-4 -2 l-4 2 l1 -5 l-4 -3 l5 -1z" fill="url(#sari)" stroke-width="2.5"/>
"""), 114)
resim("agac", "Ağaç", KAHVE + YESIL2,
    golge(65, 114, 40) + kalem("""    <path d="M56 112 l4 -40 h10 l4 40z" fill="url(#kahve)"/>
    <path d="M64 6 q20 0 26 16 q20 4 18 24 q12 16 -4 30 q-6 14 -26 10 q-10 8 -24 2 q-20 4 -26 -12 q-14 -14 0 -30 q-2 -22 18 -26 q6 -14 18 -14z" fill="url(#yesil)"/>
    <circle cx="44" cy="40" r="5" fill="#ff9c8a" stroke-width="2.5"/>
    <circle cx="84" cy="56" r="5" fill="#ff9c8a" stroke-width="2.5"/>
    <circle cx="62" cy="68" r="5" fill="#ff9c8a" stroke-width="2.5"/>
"""), 115)
resim("ayak", "Ayak (çıplak, yandan)", PEMBE,
    golge(62, 112, 46) + kalem("""    <path d="M30 10 h26 q2 50 8 62 q30 6 50 12 q10 4 8 14 q-2 10 -20 10 h-66 q-12 -2 -10 -16 q4 -30 4 -82z" fill="url(#pembe)"/>
    <circle cx="112" cy="84" r="5" fill="#ffd2c8" stroke-width="2.5"/>
    <circle cx="102" cy="80" r="4.5" fill="#ffd2c8" stroke-width="2.5"/>
    <circle cx="93" cy="77" r="4" fill="#ffd2c8" stroke-width="2.5"/>
"""), 116)
resim("ayakkabi", "Ayakkabı", KIRMIZI,
    golge(64, 110, 52) + kalem("""    <path d="M14 98 q-4 -40 8 -54 q14 -6 22 4 q14 18 34 24 q34 8 40 18 q4 8 -2 14z" fill="url(#kirmizi)"/>
    <path d="M12 98 h104 q2 8 -4 10 h-96 q-6 -2 -4 -10z" fill="#ffffff"/>
    <path d="M48 58 l10 -6 M54 66 l10 -6 M60 72 l10 -6" fill="none" stroke="#ffffff" stroke-width="4"/>
"""), 117)
resim("araba", "Araba", MAVI,
    golge(65, 112, 54) + kalem("""    <path d="M10 86 q-2 -22 14 -24 l18 -2 l14 -22 q4 -6 12 -6 h24 q8 0 12 8 l10 20 q16 2 18 12 q2 10 -2 14z" fill="url(#mavi)"/>
    <path d="M48 58 l10 -16 h14 v16z M80 58 v-16 h10 q4 0 6 4 l6 12z" fill="#ffffff" stroke-width="3"/>
    <circle cx="36" cy="92" r="13" fill="#5a5a5a"/>
    <circle cx="36" cy="92" r="5" fill="#d6d3cc" stroke-width="2.5"/>
    <circle cx="96" cy="92" r="13" fill="#5a5a5a"/>
    <circle cx="96" cy="92" r="5" fill="#d6d3cc" stroke-width="2.5"/>
    <circle cx="116" cy="72" r="4" fill="#ffe680" stroke-width="2.5"/>
"""), 118)
resim("altin", "Altın (külçe ve paralar)", SARI2,
    golge(65, 112, 50) + kalem("""    <path d="M22 100 l12 -30 h46 l12 30z" fill="url(#sari)"/>
    <path d="M34 70 l6 -8 h46 l-6 8z" fill="#fff1a8"/>
    <path d="M80 70 l6 -8 l12 30 l-6 8z" fill="#ffc928"/>
    <ellipse cx="100" cy="102" rx="16" ry="6" fill="#ffc928"/>
    <ellipse cx="100" cy="96" rx="16" ry="6" fill="url(#sari)"/>
    <ellipse cx="104" cy="88" rx="16" ry="6" fill="url(#sari)"/>
    <path d="M40 84 q6 -6 14 -6" fill="none" stroke="#ffffff" stroke-width="4"/>
    <path d="M30 34 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4z M96 30 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3z" fill="#fff1a8" stroke-width="2.5"/>
"""), 119)
resim("ayna", "Ayna (masa aynası, içinde gülen yüz)", tarama("cam", "#e8f6fb", "#c3e4f2", 30, 8, 2) + PEMBE,
    golge(65, 114, 34) + kalem("""    <path d="M58 92 h14 v12 h-14z" fill="url(#pembe)"/>
    <path d="M36 104 h58 q4 0 4 6 h-66 q0 -6 4 -6z" fill="url(#pembe)"/>
    <ellipse cx="65" cy="50" rx="36" ry="44" fill="url(#pembe)"/>
    <ellipse cx="65" cy="50" rx="27" ry="35" fill="url(#cam)"/>
    <circle cx="67" cy="54" r="13" fill="#ffffff" stroke="#a9a59c" stroke-width="2.5"/>
    <circle cx="62" cy="52" r="1.8" fill="#a9a59c" stroke="none"/>
    <circle cx="72" cy="52" r="1.8" fill="#a9a59c" stroke="none"/>
    <path d="M62 58 q5 4 10 0" fill="none" stroke="#a9a59c" stroke-width="2"/>
    <path d="M48 30 q4 -8 12 -10" fill="none" stroke="#ffffff" stroke-width="5"/>
"""), 120)
resim("aslan", "Aslan (yüz, yeleli)", TURUNCU + SARI2,
    kalem("""    <path d="M65 4 l12 10 l16 -4 l4 16 l16 4 l-4 16 l10 12 l-10 12 l4 16 l-16 4 l-4 16 l-16 -4 l-12 10 l-12 -10 l-16 4 l-4 -16 l-16 -4 l4 -16 l-10 -12 l10 -12 l-4 -16 l16 -4 l4 -16 l16 4z" fill="url(#turuncu)"/>
    <circle cx="65" cy="62" r="34" fill="url(#sari)"/>
    <circle cx="40" cy="34" r="7" fill="url(#sari)" stroke-width="3"/>
    <circle cx="90" cy="34" r="7" fill="url(#sari)" stroke-width="3"/>
    <circle cx="53" cy="56" r="4" fill="#2b2b2b"/>
    <circle cx="77" cy="56" r="4" fill="#2b2b2b"/>
    <path d="M58 68 h14 l-7 7z" fill="#5a3b2a" stroke-width="2.5"/>
    <path d="M65 75 q-6 8 -12 4 M65 75 q6 8 12 4" fill="none" stroke-width="2.5"/>
"""), 121)
resim("kova", "Kova", MAVI,
    golge(65, 112, 40) + kalem("""    <path d="M28 40 q37 -48 74 0" fill="none" stroke-width="5"/>
    <path d="M24 40 h82 l-10 68 h-62z" fill="url(#mavi)"/>
    <ellipse cx="65" cy="40" rx="41" ry="8" fill="#e8f6fb"/>
    <path d="M30 56 h70" fill="none" stroke-width="3"/>
"""), 122)
resim("firca", "Fırça (boya fırçası)", KAHVE + KIRMIZI,
    kalem("""    <path d="M96 6 q12 4 10 16 l-46 46 l-12 -12z" fill="url(#kahve)"/>
    <path d="M46 54 l14 14 l-6 6 l-14 -14z" fill="#c9c9c9"/>
    <path d="M40 60 l14 14 q-6 16 -22 26 q-14 10 -26 14 q4 -14 12 -26 q10 -18 22 -28z" fill="url(#kirmizi)"/>
"""), 123)
resim("corba", "Çorba (kâsede, buharlı)", TURUNCU + MAVI,
    golge(65, 112, 46) + kalem("""    <path d="M44 34 q-8 -10 0 -18 q8 -8 0 -16 M66 34 q-8 -10 0 -18 q8 -8 0 -16 M88 34 q-8 -10 0 -18 q8 -8 0 -16" fill="none" stroke="#a9a59c" stroke-width="3"/>
    <path d="M14 50 h102 q-4 54 -51 56 q-47 -2 -51 -56z" fill="url(#mavi)"/>
    <ellipse cx="65" cy="50" rx="51" ry="10" fill="url(#turuncu)"/>
    <path d="M96 30 l-28 26" fill="none" stroke-width="6"/>
"""), 124)
resim("masa", "Masa", KAHVE,
    golge(65, 112, 52) + kalem("""    <path d="M24 52 v58 M106 52 v58 M36 52 v46 M94 52 v46" fill="none" stroke-width="7"/>
    <path d="M24 52 v58 M106 52 v58 M36 52 v46 M94 52 v46" fill="none" stroke="#d9a46b" stroke-width="2"/>
    <path d="M8 40 h114 v14 h-114z" fill="url(#kahve)"/>
    <path d="M18 30 h94 l10 10 h-114z" fill="#e8c08a"/>
"""), 125)
resim("canta", "Çanta (okul çantası)", MOR + SARI2,
    golge(65, 114, 42) + kalem("""    <path d="M44 22 q0 -16 21 -16 q21 0 21 16" fill="none" stroke-width="6"/>
    <path d="M24 30 q0 -10 10 -10 h62 q10 0 10 10 v74 q0 8 -8 8 h-66 q-8 0 -8 -8z" fill="url(#mor)"/>
    <path d="M36 66 h58 v34 q0 4 -4 4 h-50 q-4 0 -4 -4z" fill="url(#sari)"/>
    <path d="M24 46 h82" fill="none" stroke-width="3"/>
    <circle cx="65" cy="46" r="5" fill="#ffffff" stroke-width="3"/>
"""), 126)
resim("kumbara", "Kumbara (domuz şeklinde)", PEMBE,
    golge(62, 112, 44) + kalem("""    <path d="M36 92 v18 M52 96 v14 M78 96 v14 M94 92 v18" fill="none" stroke-width="7"/>
    <ellipse cx="66" cy="70" rx="48" ry="34" fill="url(#pembe)"/>
    <path d="M38 40 l-6 -16 l18 8z" fill="url(#pembe)" stroke-width="3"/>
    <ellipse cx="18" cy="72" rx="10" ry="13" fill="#ffd2c8"/>
    <circle cx="15" cy="68" r="2" fill="#2b2b2b"/>
    <circle cx="15" cy="76" r="2" fill="#2b2b2b"/>
    <circle cx="38" cy="58" r="3.5" fill="#2b2b2b"/>
    <path d="M60 38 h24" fill="none" stroke-width="5"/>
    <circle cx="72" cy="20" r="11" fill="url(#sari)" stroke-width="3"/>
    <path d="M114 66 q10 -4 6 -12" fill="none" stroke-width="3"/>
""") , 127)
resim("kurbaga", "Kurbağa (önden, oturan)", YESIL2,
    golge(65, 114, 46) + kalem("""    <path d="M16 110 q-6 -20 16 -24 M114 110 q6 -20 -16 -24" fill="url(#yesil)"/>
    <ellipse cx="65" cy="76" rx="48" ry="34" fill="url(#yesil)"/>
    <circle cx="40" cy="34" r="17" fill="url(#yesil)"/>
    <circle cx="90" cy="34" r="17" fill="url(#yesil)"/>
    <circle cx="40" cy="34" r="9" fill="#ffffff" stroke-width="3"/>
    <circle cx="90" cy="34" r="9" fill="#ffffff" stroke-width="3"/>
    <circle cx="42" cy="35" r="4" fill="#2b2b2b"/>
    <circle cx="88" cy="35" r="4" fill="#2b2b2b"/>
    <path d="M36 70 q29 22 58 0" fill="none" stroke-width="4"/>
    <ellipse cx="65" cy="96" rx="24" ry="10" fill="#e6f6d0" stroke-width="3"/>
"""), 128)
resim("kapi", "Kapı", KAHVE,
    kalem("""    <path d="M30 116 v-96 q0 -14 14 -14 h42 q14 0 14 14 v96z" fill="url(#kahve)"/>
    <path d="M42 30 h46 v30 h-46z M42 70 h46 v34 h-46z" fill="none" stroke-width="3"/>
    <circle cx="88" cy="66" r="5" fill="#ffe680" stroke-width="3"/>
    <path d="M20 116 h90" fill="none" stroke-width="5"/>
"""), 129)
resim("balik", "Balık", TURUNCU,
    kalem("""    <path d="M96 60 l28 -24 q-6 24 0 48z" fill="url(#turuncu)"/>
    <path d="M8 60 q30 -42 70 -36 q24 6 24 36 q0 30 -24 36 q-40 6 -70 -36z" fill="url(#turuncu)"/>
    <path d="M50 26 q12 -16 28 -14 q-6 8 -4 14" fill="url(#turuncu)" stroke-width="3"/>
    <path d="M60 36 q10 24 0 48 M74 34 q10 26 0 52" fill="none" stroke-width="3"/>
    <circle cx="32" cy="54" r="4.5" fill="#2b2b2b"/>
    <path d="M16 66 q6 4 12 2" fill="none" stroke-width="3"/>
"""), 130)
resim("tavuk", "Tavuk", tarama("beyaz", "#ffffff", "#ececec", 30, 6, 2.5) + KIRMIZI + SARI2,
    golge(66, 114, 40) + kalem("""    <path d="M58 98 v14 h-8 M78 98 v14 h-8" fill="none" stroke="#f08a3c" stroke-width="4"/>
    <path d="M100 30 q20 10 18 40 q-10 -10 -18 -12 M104 40 q20 20 12 38" fill="url(#beyaz)"/>
    <path d="M36 52 q-4 -18 8 -26 q20 -10 22 16 q30 -6 40 14 q8 24 -16 38 q-24 14 -48 -2 q-14 -14 -6 -40z" fill="url(#beyaz)"/>
    <path d="M40 26 l4 -10 l6 6 l6 -8 l2 12z" fill="url(#kirmizi)" stroke-width="3"/>
    <path d="M36 38 l-14 6 l14 4z" fill="url(#sari)" stroke-width="3"/>
    <path d="M38 48 q-4 10 2 12 q4 -4 2 -12z" fill="#ff9c8a" stroke-width="2.5"/>
    <circle cx="48" cy="36" r="3" fill="#2b2b2b"/>
    <path d="M62 66 q14 14 34 2" fill="none" stroke-width="3"/>
"""), 131)
resim("kasik", "Kaşık", GRI,
    kalem("""    <path d="M58 50 l50 60 q3 5 -2 7 q-5 2 -8 -3 l-46 -60z" fill="url(#gri)"/>
    <ellipse cx="40" cy="30" rx="16" ry="28" transform="rotate(-40 40 30)" fill="url(#gri)"/>
    <ellipse cx="40" cy="30" rx="9" ry="19" transform="rotate(-40 40 30)" fill="#ecebe7" stroke-width="2.5"/>
"""), 132)
resim("havuc", "Havuç", TURUNCU + YESIL2,
    kalem("""    <path d="M84 26 q-2 -18 8 -24 q4 14 -2 26 M90 28 q12 -16 24 -14 q-8 14 -20 18 M80 30 q-14 -14 -26 -10 q10 12 22 14" fill="url(#yesil)"/>
    <path d="M70 30 q20 -10 30 6 q8 16 -6 26 l-74 52 q-6 4 -8 -2 l40 -72 q8 -12 18 -10z" fill="url(#turuncu)"/>
    <path d="M56 50 l10 6 M44 70 l10 6 M34 88 l8 5" fill="none" stroke-width="3"/>
"""), 133)
resim("yaprak", "Yaprak", YESIL2,
    kalem("""    <path d="M18 108 l20 -20" fill="none" stroke-width="5"/>
    <path d="M38 88 q-12 -50 30 -72 q30 -14 54 -10 q4 30 -12 56 q-24 36 -72 26z" fill="url(#yesil)"/>
    <path d="M38 88 q32 -30 72 -76 M56 70 l-4 -22 M72 54 l-2 -24 M88 36 l0 -16 M66 62 l20 2 M82 44 l18 2" fill="none" stroke-width="3"/>
"""), 134)
resim("bardak", "Bardak (su dolu)", tarama("cam", "#eef8fc", "#d7eef7", 30, 9, 2) + MAVI,
    golge(65, 114, 32) + kalem("""    <path d="M34 12 h62 l-8 98 h-46z" fill="url(#cam)"/>
    <path d="M38 46 h54 l-5 62 h-44z" fill="url(#mavi)" stroke="none"/>
    <path d="M38 46 q27 6 54 0" fill="none" stroke-width="3"/>
    <path d="M34 12 h62 l-8 98 h-46z" fill="none"/>
    <path d="M46 24 l-2 30" fill="none" stroke="#ffffff" stroke-width="5"/>
"""), 135)

# ---- Şeker makinesi (Şekillerle Yazma, 1. düzey): cam fanus, kırmızı gövde, önde çıkış
# oluğu. Kolu ayrı resim (seker-makinesi-kol.svg): oyunda sağ yandaki mile (230, 300) takılır,
# çekilince aşağı döner. Fanustaki şekerler düğme, çiçek, şeker ve top karışık.
fanus_seker = ""
for i, (x, y, r, renk) in enumerate([(78, 150, 17, "#ff9c8a"), (112, 158, 15, "#ffe680"), (146, 152, 17, "#9be3dc"),
                                       (180, 156, 15, "#c8a2ff"), (94, 182, 16, "#b5e48c"), (130, 186, 17, "#ffc58f"),
                                       (166, 184, 16, "#ff9c8a"), (62, 180, 13, "#9be3dc"), (196, 180, 13, "#ffe680"),
                                       (112, 126, 14, "#c8a2ff"), (150, 122, 15, "#b5e48c"), (86, 122, 12, "#ffe680"),
                                       (178, 126, 12, "#ff9c8a"), (130, 98, 13, "#9be3dc")]):
    fanus_seker += f'    <circle cx="{x}" cy="{y}" r="{r}" fill="{renk}"/>\n'
    if i % 3 == 0:
        fanus_seker += f'    <circle cx="{x}" cy="{y}" r="{r * 0.45:.1f}" fill="none" stroke-width="2"/>\n'
yaz("seker-makinesi.svg", 260, 420, "Şeker makinesi: cam fanus, kırmızı gövde, çıkış oluğu; kolu ayrı",
    tarama("makine", "#ff9c8a", "#ef5b5b", -35, 8, 3.5) + tarama("cam", "#eef8fc", "#d7eef7", 30, 9, 2),
    golge(130, 410, 110, 8) + kalem(f'''    <circle cx="130" cy="130" r="104" fill="url(#cam)"/>
{fanus_seker}    <circle cx="130" cy="130" r="104" fill="none"/>
    <path d="M70 70 q20 -26 50 -32" fill="none" stroke="#ffffff" stroke-width="7"/>
    <path d="M104 22 q26 -18 52 0 v10 h-52 z" fill="url(#makine)"/>
    <rect x="86" y="226" width="88" height="22" rx="6" fill="url(#makine)"/>
    <path d="M60 248 h140 l26 152 h-192 z" fill="url(#makine)"/>
    <rect x="92" y="318" width="76" height="52" rx="12" fill="#5a3b2a"/>
    <path d="M92 352 h76" fill="none" stroke-width="3"/>
    <circle cx="130" cy="282" r="16" fill="#fff4c2"/>
    <path d="M122 282 h16" fill="none" stroke-width="3"/>
    <circle cx="226" cy="300" r="12" fill="#c9c9c9"/>
'''), 61)
yaz("seker-makinesi-kol.svg", 150, 60, "Şeker makinesinin kolu; mil sol uçta (16, 30)",
    tarama("topuz", "#ffe680", "#ffc928", -40, 6, 3),
    kalem('''    <path d="M16 30 h100" fill="none" stroke-width="10"/>
    <path d="M16 30 h100" fill="none" stroke="#c9c9c9" stroke-width="5"/>
    <circle cx="16" cy="30" r="10" fill="#c9c9c9"/>
    <circle cx="124" cy="30" r="22" fill="url(#topuz)"/>
'''), 62)

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
