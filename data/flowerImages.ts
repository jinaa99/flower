// Энэ файлыг `npm run images:fetch` (scripts/fetch-unsplash.ts) үүсгэнэ — гараар бүү засаарай.
import type { FlowerImage, FlowerSlug } from "./flowers.ts";

export const flowerImages: Partial<Record<FlowerSlug, FlowerImage[]>> = {
  "peony": [
    {
      "src": "https://images.unsplash.com/photo-1626976109816-08cef8600d7d?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8N3x8cGluayUyMHBlb255JTIwZmxvd2Vyc3xlbnwxfHx8fDE3OTIzOTY1MDJ8MA&ixlib=rb-4.1.0",
      "local": "/images/flowers/peony-1.jpg",
      "alt": "Цээнэ цэцэг",
      "width": 6877,
      "height": 4912,
      "color": "#f38c8c",
      "photographer": {
        "name": "Cristina Anne Costello",
        "url": "https://unsplash.com/@lightupphotos?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/pink-and-white-flower-in-close-up-photography-F0i_rfDHw74?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1511201173873-c327e63eb6c4?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8cGluayUyMHBlb255JTIwZmxvd2Vyc3xlbnwxfHx8fDE3OTIzOTY1MDJ8MA&ixlib=rb-4.1.0",
      "local": "/images/flowers/peony-2.jpg",
      "alt": "Цээнэ цэцэг, 2-р зураг",
      "width": 3350,
      "height": 3350,
      "color": "#260c26",
      "photographer": {
        "name": "Cristiane Teston",
        "url": "https://unsplash.com/@cristiane?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/pink-peonies-with-purple-flowers-y-5pd18ETbg?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1589832331026-62c755f29214?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8M3x8cGluayUyMHBlb255JTIwZmxvd2Vyc3xlbnwxfHx8fDE3OTIzOTY1MDJ8MA&ixlib=rb-4.1.0",
      "local": "/images/flowers/peony-3.jpg",
      "alt": "Цээнэ цэцэг, 3-р зураг",
      "width": 3168,
      "height": 4752,
      "color": "#0c260c",
      "photographer": {
        "name": "eleni koureas",
        "url": "https://unsplash.com/@elenikoureas?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/pink-and-white-flower-in-tilt-shift-lens-uXouToDHxPU?utm_source=flower&utm_medium=referral"
    }
  ],
  "rose": [
    {
      "src": "https://images.unsplash.com/photo-1494972308805-463bc619d34e?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8cmVkJTIwcm9zZXMlMjBib3VxdWV0fGVufDF8fHx8MTc5MjM5NjUwNnww&ixlib=rb-4.1.0",
      "local": "/images/flowers/rose-1.jpg",
      "alt": "Сарнай цэцэг",
      "width": 6016,
      "height": 4000,
      "color": "#0c2626",
      "photographer": {
        "name": "Biel Morro",
        "url": "https://unsplash.com/@bielmorro?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/red-rose-flowers-kcKiBcDTJt4?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1578439231583-9eca0a363860?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MXx8cmVkJTIwcm9zZXMlMjBib3VxdWV0fGVufDF8fHx8MTc5MjM5NjUwNnww&ixlib=rb-4.1.0",
      "local": "/images/flowers/rose-2.jpg",
      "alt": "Сарнай цэцэг, 2-р зураг",
      "width": 4000,
      "height": 6000,
      "color": "#260c0c",
      "photographer": {
        "name": "Cody  Chan",
        "url": "https://unsplash.com/@cceee?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/red-roses-OsHqxjVV0HE?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1787235492877-167b4d87f83c?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8M3x8cmVkJTIwcm9zZXMlMjBib3VxdWV0fGVufDF8fHx8MTc5MjM5NjUwNnww&ixlib=rb-4.1.0",
      "local": "/images/flowers/rose-3.jpg",
      "alt": "Сарнай цэцэг, 3-р зураг",
      "width": 2848,
      "height": 4288,
      "color": "#590c0c",
      "photographer": {
        "name": "Alina",
        "url": "https://unsplash.com/@alinelze?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/red-roses-with-layered-petals-CW8qOzrX3Wk?utm_source=flower&utm_medium=referral"
    }
  ],
  "spray-rose": [
    {
      "src": "https://images.unsplash.com/photo-1673277848241-86e145cd7112?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8M3x8c3ByYXklMjByb3NlcyUyMGJvdXF1ZXR8ZW58MXx8fHwxNzkyNDIyMzE4fDA&ixlib=rb-4.1.0",
      "local": "/images/flowers/spray-rose-1.jpg",
      "alt": "Бутлаг сарнай цэцэг",
      "width": 6325,
      "height": 4221,
      "color": "#d9a60c",
      "photographer": {
        "name": "Georg Eiermann",
        "url": "https://unsplash.com/@georgeiermann?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/a-bouquet-of-yellow-roses-sitting-on-top-of-a-wooden-table-RFyQxbbrnTs?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1523693916903-027d144a2b7d?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MXx8c3ByYXklMjByb3NlcyUyMGJvdXF1ZXR8ZW58MXx8fHwxNzkyNDIyMzE4fDA&ixlib=rb-4.1.0",
      "local": "/images/flowers/spray-rose-2.jpg",
      "alt": "Бутлаг сарнай цэцэг, 2-р зураг",
      "width": 3024,
      "height": 4032,
      "color": "#c0c0c0",
      "photographer": {
        "name": "jessie daniella",
        "url": "https://unsplash.com/@jessiedaniella?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/pink-and-white-rose-bouquet-QLuleNy8LMM?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1608027790251-5e0c80d043d9?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8c3ByYXklMjByb3NlcyUyMGJvdXF1ZXR8ZW58MXx8fHwxNzkyNDIyMzE4fDA&ixlib=rb-4.1.0",
      "local": "/images/flowers/spray-rose-3.jpg",
      "alt": "Бутлаг сарнай цэцэг, 3-р зураг",
      "width": 3024,
      "height": 4032,
      "color": "#f3f3f3",
      "photographer": {
        "name": "𝕯𝖆𝖗𝖎𝖆 𝓖𝓾𝓭𝓸𝓼𝓱𝓷𝓲𝓴𝓸𝓿𝓪",
        "url": "https://unsplash.com/@candychain?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/pink-rose-bouquet-on-white-table-J6RE4QmZumI?utm_source=flower&utm_medium=referral"
    }
  ],
  "tulip": [
    {
      "src": "https://images.unsplash.com/photo-1520763185298-1b434c919102?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8VHVsaXAlMjBmbG93ZXJ8ZW58MXx8fHwxNzkyMzk2NTEzfDA&ixlib=rb-4.1.0",
      "local": "/images/flowers/tulip-1.jpg",
      "alt": "Алтанзул цэцэг",
      "width": 5385,
      "height": 3029,
      "color": "#f3c0d9",
      "photographer": {
        "name": "RoonZ nl",
        "url": "https://unsplash.com/@roonz_nl?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/pink-flower-ATgfRqpFfFI?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1468327768560-75b778cbb551?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MXx8VHVsaXAlMjBmbG93ZXJ8ZW58MXx8fHwxNzkyMzk2NTEzfDA&ixlib=rb-4.1.0",
      "local": "/images/flowers/tulip-2.jpg",
      "alt": "Алтанзул цэцэг, 2-р зураг",
      "width": 3840,
      "height": 5760,
      "color": "#598cc0",
      "photographer": {
        "name": "Kwang Mathurosemontri",
        "url": "https://unsplash.com/@gemini_zucha89?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/shallow-focus-photography-of-white-and-pink-petaled-flowers-fY1ECB1RCd0?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1587316830148-c9b01df2da38?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8M3x8VHVsaXAlMjBmbG93ZXJ8ZW58MXx8fHwxNzkyMzk2NTEzfDA&ixlib=rb-4.1.0",
      "local": "/images/flowers/tulip-3.jpg",
      "alt": "Алтанзул цэцэг, 3-р зураг",
      "width": 4000,
      "height": 6000,
      "color": "#f3f3d9",
      "photographer": {
        "name": "Zoe Richardson",
        "url": "https://unsplash.com/@farmsteadphoto?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/yellow-and-red-tulip-in-bloom-close-up-photo-oy7NjnG-CK4?utm_source=flower&utm_medium=referral"
    }
  ],
  "lily": [
    {
      "src": "https://images.unsplash.com/photo-1632053229334-8ed56c3dc024?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8bGlsaXVtJTIwbWFydGFnb258ZW58MXx8fHwxNzkyNDIyNjE2fDA&ixlib=rb-4.1.0",
      "local": "/images/flowers/lily-1.jpg",
      "alt": "Зэрлэг сараана цэцэг",
      "width": 6720,
      "height": 4480,
      "color": "#a6a626",
      "photographer": {
        "name": "Hans-Juergen Roessler",
        "url": "https://unsplash.com/@hajuro?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/a-couple-of-pink-flowers-sitting-on-top-of-a-green-field-BRCln493w64?utm_source=flower&utm_medium=referral"
    }
  ],
  "oriental-lily": [
    {
      "src": "https://images.unsplash.com/photo-1631407779166-86952be9dbd7?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MXx8b3JpZW50YWwlMjBsaWx5JTIwc3RhcmdhemVyfGVufDF8fHx8MTc5MjM5NjUyMHww&ixlib=rb-4.1.0",
      "local": "/images/flowers/oriental-lily-1.jpg",
      "alt": "Ориентал сараана цэцэг",
      "width": 5999,
      "height": 3999,
      "color": "#c0a6a6",
      "photographer": {
        "name": "Earl Wilcox",
        "url": "https://unsplash.com/@earl_plannerzone?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/white-flowers-on-clear-glass-vase-hGz1cJrhk9M?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1641423397506-bb8136a6e5ec?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8b3JpZW50YWwlMjBsaWx5JTIwc3RhcmdhemVyfGVufDF8fHx8MTc5MjM5NjUyMHww&ixlib=rb-4.1.0",
      "local": "/images/flowers/oriental-lily-2.jpg",
      "alt": "Ориентал сараана цэцэг, 2-р зураг",
      "width": 5999,
      "height": 3999,
      "color": "#c0a6a6",
      "photographer": {
        "name": "Earl Wilcox",
        "url": "https://unsplash.com/@earl_plannerzone?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/a-vase-filled-with-pink-and-white-flowers-M2mtMTdiqZI?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1641423397506-2a119d494ff7?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8M3x8b3JpZW50YWwlMjBsaWx5JTIwc3RhcmdhemVyfGVufDF8fHx8MTc5MjM5NjUyMHww&ixlib=rb-4.1.0",
      "local": "/images/flowers/oriental-lily-3.jpg",
      "alt": "Ориентал сараана цэцэг, 3-р зураг",
      "width": 5999,
      "height": 3999,
      "color": "#730c0c",
      "photographer": {
        "name": "Earl Wilcox",
        "url": "https://unsplash.com/@earl_plannerzone?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/a-close-up-of-a-pink-and-white-flower-Z6ddkoBi5VU?utm_source=flower&utm_medium=referral"
    }
  ],
  "chrysanthemum": [
    {
      "src": "https://images.unsplash.com/photo-1666469948591-f792c6ab29c9?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8M3x8Q2hyeXNhbnRoZW11bSUyMGZsb3dlcnxlbnwxfHx8fDE3OTI0MjI0NjZ8MA&ixlib=rb-4.1.0",
      "local": "/images/flowers/chrysanthemum-1.jpg",
      "alt": "Хризантем цэцэг",
      "width": 5472,
      "height": 3648,
      "color": "#0c260c",
      "photographer": {
        "name": "Lan Gao",
        "url": "https://unsplash.com/@langao?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/a-close-up-of-a-flower--3oEdLeSZGo?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1585337913966-114ba3cf1f80?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8Q2hyeXNhbnRoZW11bSUyMGZsb3dlcnxlbnwxfHx8fDE3OTI0MjI0NjZ8MA&ixlib=rb-4.1.0",
      "local": "/images/flowers/chrysanthemum-2.jpg",
      "alt": "Хризантем цэцэг, 2-р зураг",
      "width": 3200,
      "height": 4000,
      "color": "#d9c0c0",
      "photographer": {
        "name": "Tavga K.S",
        "url": "https://unsplash.com/@tavgaksalih?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/white-and-brown-flowers-in-close-up-photography-6Qq9xVZYYEw?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1554727434-e842126abc82?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8NHx8Q2hyeXNhbnRoZW11bSUyMGZsb3dlcnxlbnwxfHx8fDE3OTI0MjI0NjZ8MA&ixlib=rb-4.1.0",
      "local": "/images/flowers/chrysanthemum-3.jpg",
      "alt": "Хризантем цэцэг, 3-р зураг",
      "width": 2008,
      "height": 3008,
      "color": "#c0a6a6",
      "photographer": {
        "name": "Yoksel 🌿 Zok",
        "url": "https://unsplash.com/@yoksel?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/white-and-pink-petaled-flwoers-OjpLFBz1YG8?utm_source=flower&utm_medium=referral"
    }
  ],
  "sunflower": [
    {
      "src": "https://images.unsplash.com/photo-1552160793-cbaf3ebcba72?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8OHx8U3VuZmxvd2VyJTIwZmxvd2VyfGVufDF8fHx8MTc5MjM5NjUyOHww&ixlib=rb-4.1.0",
      "local": "/images/flowers/sunflower-1.jpg",
      "alt": "Наранцэцэг цэцэг",
      "width": 4602,
      "height": 3068,
      "color": "#f3f3f3",
      "photographer": {
        "name": "Jordan Cormack",
        "url": "https://unsplash.com/@jordancormack?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/yellow-sunflower-field-79RuacUiXUI?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MXx8U3VuZmxvd2VyJTIwZmxvd2VyfGVufDF8fHx8MTc5MjM5NjUyOHww&ixlib=rb-4.1.0",
      "local": "/images/flowers/sunflower-2.jpg",
      "alt": "Наранцэцэг цэцэг, 2-р зураг",
      "width": 3024,
      "height": 4032,
      "color": "#a6c0d9",
      "photographer": {
        "name": "Aaron Burden",
        "url": "https://unsplash.com/@aaronburden?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/sunflower-field-under-blue-sky-during-daytime-2IzoIHBgYAo?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1470509037663-253afd7f0f51?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8U3VuZmxvd2VyJTIwZmxvd2VyfGVufDF8fHx8MTc5MjM5NjUyOHww&ixlib=rb-4.1.0",
      "local": "/images/flowers/sunflower-3.jpg",
      "alt": "Наранцэцэг цэцэг, 3-р зураг",
      "width": 3112,
      "height": 4668,
      "color": "#f3f3f3",
      "photographer": {
        "name": "Paul Green",
        "url": "https://unsplash.com/@pgreen1983?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/close-up-photo-of-common-sunflower-5lRxNLHfZOY?utm_source=flower&utm_medium=referral"
    }
  ],
  "orchid": [
    {
      "src": "https://images.unsplash.com/photo-1516477266610-9e4c763da721?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8cGhhbGFlbm9wc2lzJTIwb3JjaGlkfGVufDF8fHx8MTc5MjM5NjUzMXww&ixlib=rb-4.1.0",
      "local": "/images/flowers/orchid-1.jpg",
      "alt": "Цахирмаа цэцэг",
      "width": 5163,
      "height": 3442,
      "color": "#d97373",
      "photographer": {
        "name": "John Wiesenfeld",
        "url": "https://unsplash.com/@fotofloridian?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/shallow-focus-photo-of-pink-flowers-Ug6z9PCwr58?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1605996370592-b6f7a81e382e?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MXx8cGhhbGFlbm9wc2lzJTIwb3JjaGlkfGVufDF8fHx8MTc5MjM5NjUzMXww&ixlib=rb-4.1.0",
      "local": "/images/flowers/orchid-2.jpg",
      "alt": "Цахирмаа цэцэг, 2-р зураг",
      "width": 3456,
      "height": 4608,
      "color": "#d9d9d9",
      "photographer": {
        "name": "ALFONSO ALBERTO RAMÍREZ ALVAREZ",
        "url": "https://unsplash.com/@alfponcho75?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/purple-moth-orchids-in-close-up-photography-FP2Kf5DsSo8?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1534885320675-b08aa131cc5e?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8M3x8cGhhbGFlbm9wc2lzJTIwb3JjaGlkfGVufDF8fHx8MTc5MjM5NjUzMXww&ixlib=rb-4.1.0",
      "local": "/images/flowers/orchid-3.jpg",
      "alt": "Цахирмаа цэцэг, 3-р зураг",
      "width": 3024,
      "height": 4032,
      "color": "#260c0c",
      "photographer": {
        "name": "Rita Ox",
        "url": "https://unsplash.com/@ritaox?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/close-up-photo-of-purple-orchid-flower-eH5gAM2X2wQ?utm_source=flower&utm_medium=referral"
    }
  ],
  "hydrangea": [
    {
      "src": "https://images.unsplash.com/photo-1549100789-756142409c2e?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8SHlkcmFuZ2VhJTIwZmxvd2VyfGVufDF8fHx8MTc5MjM5NjUzNXww&ixlib=rb-4.1.0",
      "local": "/images/flowers/hydrangea-1.jpg",
      "alt": "Гортензи цэцэг",
      "width": 3197,
      "height": 2131,
      "color": "#c0d9f3",
      "photographer": {
        "name": "Josefin",
        "url": "https://unsplash.com/@josefin?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/blue-and-white-hydrangea-flowers-LvEOWMyr-Bc?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1447875569765-2b3db822bec9?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MXx8SHlkcmFuZ2VhJTIwZmxvd2VyfGVufDF8fHx8MTc5MjM5NjUzNXww&ixlib=rb-4.1.0",
      "local": "/images/flowers/hydrangea-2.jpg",
      "alt": "Гортензи цэцэг, 2-р зураг",
      "width": 3000,
      "height": 4500,
      "color": "#0c2626",
      "photographer": {
        "name": "Annie Spratt",
        "url": "https://unsplash.com/@anniespratt?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/selective-photography-of-purple-petaled-flowers-vs6a4EHj_Ro?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1621518856558-9b2ce2d0660d?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8M3x8SHlkcmFuZ2VhJTIwZmxvd2VyfGVufDF8fHx8MTc5MjM5NjUzNXww&ixlib=rb-4.1.0",
      "local": "/images/flowers/hydrangea-3.jpg",
      "alt": "Гортензи цэцэг, 3-р зураг",
      "width": 5184,
      "height": 3888,
      "color": "#0c2626",
      "photographer": {
        "name": "Tunafish",
        "url": "https://unsplash.com/@ultratunafish?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/blue-and-purple-hydrangea-flowers-M-EXwFJVQf4?utm_source=flower&utm_medium=referral"
    }
  ],
  "ranunculus": [
    {
      "src": "https://images.unsplash.com/photo-1712135596636-66e8da469cbe?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MXx8UmFudW5jdWx1cyUyMGZsb3dlcnxlbnwxfHx8fDE3OTIzOTY1Mzh8MA&ixlib=rb-4.1.0",
      "local": "/images/flowers/ranunculus-1.jpg",
      "alt": "Хурган цэцэг цэцэг",
      "width": 6121,
      "height": 4048,
      "color": "#d9c0c0",
      "photographer": {
        "name": "micheile henderson",
        "url": "https://unsplash.com/@micheile?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/a-vase-filled-with-pink-and-white-flowers-kOMyWyUj1Kg?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1712135596996-3dda241aa9bc?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8UmFudW5jdWx1cyUyMGZsb3dlcnxlbnwxfHx8fDE3OTIzOTY1Mzh8MA&ixlib=rb-4.1.0",
      "local": "/images/flowers/ranunculus-2.jpg",
      "alt": "Хурган цэцэг цэцэг, 2-р зураг",
      "width": 6155,
      "height": 4099,
      "color": "#d9a6a6",
      "photographer": {
        "name": "micheile henderson",
        "url": "https://unsplash.com/@micheile?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/a-bunch-of-pink-flowers-sitting-in-a-vase-H0lknnRr7cI?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1767552659473-9a541393de94?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8M3x8UmFudW5jdWx1cyUyMGZsb3dlcnxlbnwxfHx8fDE3OTIzOTY1Mzh8MA&ixlib=rb-4.1.0",
      "local": "/images/flowers/ranunculus-3.jpg",
      "alt": "Хурган цэцэг цэцэг, 3-р зураг",
      "width": 4851,
      "height": 7278,
      "color": "#c0a6a6",
      "photographer": {
        "name": "Anya Chernykh",
        "url": "https://unsplash.com/@anyachernykh?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/a-collection-of-soft-pink-and-peach-ranunculus-flowers-_GPxOouZI0w?utm_source=flower&utm_medium=referral"
    }
  ],
  "iris": [
    {
      "src": "https://images.unsplash.com/photo-1589312397744-799d9f9c2944?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MXx8cHVycGxlJTIwaXJpcyUyMGZsb3dlcnxlbnwxfHx8fDE3OTIzOTY1NDJ8MA&ixlib=rb-4.1.0",
      "local": "/images/flowers/iris-1.jpg",
      "alt": "Цахилдаг цэцэг",
      "width": 4000,
      "height": 3000,
      "color": "#7373c0",
      "photographer": {
        "name": "Christina Brinza",
        "url": "https://unsplash.com/@cbrin?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/pink-and-white-flowers-with-green-leaves-TXmV4YYrzxg?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1591507115593-4185e3ae49ff?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8cHVycGxlJTIwaXJpcyUyMGZsb3dlcnxlbnwxfHx8fDE3OTIzOTY1NDJ8MA&ixlib=rb-4.1.0",
      "local": "/images/flowers/iris-2.jpg",
      "alt": "Цахилдаг цэцэг, 2-р зураг",
      "width": 3994,
      "height": 3994,
      "color": "#262626",
      "photographer": {
        "name": "Juliet Sarmiento",
        "url": "https://unsplash.com/@totoy2001?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/purple-flower-in-tilt-shift-lens-OBtrCoiKlZo?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1595531393554-770837e2801b?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8M3x8cHVycGxlJTIwaXJpcyUyMGZsb3dlcnxlbnwxfHx8fDE3OTIzOTY1NDJ8MA&ixlib=rb-4.1.0",
      "local": "/images/flowers/iris-3.jpg",
      "alt": "Цахилдаг цэцэг, 3-р зураг",
      "width": 3801,
      "height": 5701,
      "color": "#0c2626",
      "photographer": {
        "name": "Jei Lee",
        "url": "https://unsplash.com/@babybluecat?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/purple-flower-in-tilt-shift-lens-uDe1HrcO2Tc?utm_source=flower&utm_medium=referral"
    }
  ],
  "lilac": [
    {
      "src": "https://images.unsplash.com/photo-1621021096756-1fb74a35253d?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MXx8bGlsYWMlMjBibG9zc29tfGVufDF8fHx8MTc5MjQyMTQxOHww&ixlib=rb-4.1.0",
      "local": "/images/flowers/lilac-1.jpg",
      "alt": "Голт бор цэцэг",
      "width": 5760,
      "height": 3240,
      "color": "#c08cc0",
      "photographer": {
        "name": "Karo K.",
        "url": "https://unsplash.com/@karo1504?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/pink-flowers-with-green-leaves-CBZRLDR-E2Q?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1622891597799-17ac7f9ab6fc?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8M3x8bGlsYWMlMjBibG9zc29tfGVufDF8fHx8MTc5MjQyMTQxOHww&ixlib=rb-4.1.0",
      "local": "/images/flowers/lilac-2.jpg",
      "alt": "Голт бор цэцэг, 2-р зураг",
      "width": 2008,
      "height": 3008,
      "color": "#a68ca6",
      "photographer": {
        "name": "Yoksel 🌿 Zok",
        "url": "https://unsplash.com/@yoksel?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/pink-flowers-in-tilt-shift-lens-zAG0Q23ubeo?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1589186118523-34c03029a4b3?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8NHx8bGlsYWMlMjBibG9zc29tfGVufDF8fHx8MTc5MjQyMTQxOHww&ixlib=rb-4.1.0",
      "local": "/images/flowers/lilac-3.jpg",
      "alt": "Голт бор цэцэг, 3-р зураг",
      "width": 2508,
      "height": 3344,
      "color": "#a6a6c0",
      "photographer": {
        "name": "number three",
        "url": "https://unsplash.com/@original_1st?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/purple-and-white-flower-in-close-up-photography-c8riANu-rWw?utm_source=flower&utm_medium=referral"
    }
  ],
  "lavender": [
    {
      "src": "https://images.unsplash.com/photo-1600759487717-62bbb608106e?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8TGF2ZW5kZXIlMjBmbG93ZXJ8ZW58MXx8fHwxNzkyNDIxNTg1fDA&ixlib=rb-4.1.0",
      "local": "/images/flowers/lavender-1.jpg",
      "alt": "Лаванда цэцэг",
      "width": 6000,
      "height": 4000,
      "color": "#f3c0d9",
      "photographer": {
        "name": "Antony BEC",
        "url": "https://unsplash.com/@antony_bec?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/lavender-fields-in-valensole-france-nD9tEn63suc?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1528756514091-dee5ecaa3278?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MXx8TGF2ZW5kZXIlMjBmbG93ZXJ8ZW58MXx8fHwxNzkyNDIxNTg1fDA&ixlib=rb-4.1.0",
      "local": "/images/flowers/lavender-2.jpg",
      "alt": "Лаванда цэцэг, 2-р зураг",
      "width": 3744,
      "height": 5616,
      "color": "#a6a6c0",
      "photographer": {
        "name": "Alexander Grey",
        "url": "https://unsplash.com/@sharonmccutcheon?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/close-up-photo-of-lavender-SavQfLRm4Do?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1445510491599-c391e8046a68?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8NHx8TGF2ZW5kZXIlMjBmbG93ZXJ8ZW58MXx8fHwxNzkyNDIxNTg1fDA&ixlib=rb-4.1.0",
      "local": "/images/flowers/lavender-3.jpg",
      "alt": "Лаванда цэцэг, 3-р зураг",
      "width": 4000,
      "height": 2667,
      "color": "#f3f3f3",
      "photographer": {
        "name": "Annie Spratt",
        "url": "https://unsplash.com/@anniespratt?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/lavender-flower-field-blooms-at-daytime-NrflUuJJK0I?utm_source=flower&utm_medium=referral"
    }
  ],
  "gerbera": [
    {
      "src": "https://images.unsplash.com/photo-1471899236350-e3016bf1e69e?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MXx8R2VyYmVyYSUyMGRhaXN5JTIwZmxvd2VyfGVufDF8fHx8MTc5MjQyMTY2MHww&ixlib=rb-4.1.0",
      "local": "/images/flowers/gerbera-1.jpg",
      "alt": "Гербера цэцэг",
      "width": 5261,
      "height": 3507,
      "color": "#a6c0c0",
      "photographer": {
        "name": "Andrew Small",
        "url": "https://unsplash.com/@andsmall?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/selective-focus-photography-of-pink-petaled-flower-EfhCUc_fjrU?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1595886535782-0f757640a574?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8R2VyYmVyYSUyMGRhaXN5JTIwZmxvd2VyfGVufDF8fHx8MTc5MjQyMTY2MHww&ixlib=rb-4.1.0",
      "local": "/images/flowers/gerbera-2.jpg",
      "alt": "Гербера цэцэг, 2-р зураг",
      "width": 3111,
      "height": 4667,
      "color": "#262626",
      "photographer": {
        "name": "Alireza Shirvan",
        "url": "https://unsplash.com/@megapics?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/orange-flower-in-tilt-shift-lens-KwPwziUBpD8?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1681245304984-e93b11817d00?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8M3x8R2VyYmVyYSUyMGRhaXN5JTIwZmxvd2VyfGVufDF8fHx8MTc5MjQyMTY2MHww&ixlib=rb-4.1.0",
      "local": "/images/flowers/gerbera-3.jpg",
      "alt": "Гербера цэцэг, 3-р зураг",
      "width": 5184,
      "height": 3456,
      "color": "#d9a6a6",
      "photographer": {
        "name": "Jessica Neves",
        "url": "https://unsplash.com/@_jessicanevees?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/a-pink-and-yellow-flower-on-a-pink-background-R9nKUvTLZlA?utm_source=flower&utm_medium=referral"
    }
  ],
  "calla": [
    {
      "src": "https://images.unsplash.com/photo-1629129082110-b54b4839c2f7?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MTF8fGNhbGxhJTIwbGlseSUyMGZsb3dlcnxlbnwxfHx8fDE3OTI0MjE3MTh8MA&ixlib=rb-4.1.0",
      "local": "/images/flowers/calla-1.jpg",
      "alt": "Калла цэцэг",
      "width": 6000,
      "height": 4000,
      "color": "#f3f3f3",
      "photographer": {
        "name": "Timo C. Dinger",
        "url": "https://unsplash.com/@tcdinger?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/green-and-black-flower-bud-Z7jJ1OMYZZQ?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1650355648621-1a0445f7f9b4?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MXx8Y2FsbGElMjBsaWx5JTIwZmxvd2VyfGVufDF8fHx8MTc5MjQyMTcxOHww&ixlib=rb-4.1.0",
      "local": "/images/flowers/calla-2.jpg",
      "alt": "Калла цэцэг, 2-р зураг",
      "width": 3797,
      "height": 5696,
      "color": "#26400c",
      "photographer": {
        "name": "Winston Chen",
        "url": "https://unsplash.com/@winstonchen?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/a-close-up-of-a-white-flower-with-green-leaves-Nzst8-2wYfQ?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1668304525059-839468a100f6?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8Y2FsbGElMjBsaWx5JTIwZmxvd2VyfGVufDF8fHx8MTc5MjQyMTcxOHww&ixlib=rb-4.1.0",
      "local": "/images/flowers/calla-3.jpg",
      "alt": "Калла цэцэг, 3-р зураг",
      "width": 4016,
      "height": 6016,
      "color": "#f3f3f3",
      "photographer": {
        "name": "Don Ricardo",
        "url": "https://unsplash.com/@donricardo?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/a-white-flower-with-a-green-stem-bbf1teuiDbo?utm_source=flower&utm_medium=referral"
    }
  ],
  "freesia": [
    {
      "src": "https://images.unsplash.com/photo-1781768651703-97ffd155ab47?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MTF8fEZyZWVzaWElMjBmbG93ZXJ8ZW58MXx8fHwxNzkyNDIxNzUyfDA&ixlib=rb-4.1.0",
      "local": "/images/flowers/freesia-1.jpg",
      "alt": "Фрезия цэцэг",
      "width": 6000,
      "height": 4000,
      "color": "#f3f3f3",
      "photographer": {
        "name": "Danielle Suijkerbuijk",
        "url": "https://unsplash.com/@vandaantje?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/yellow-freesia-flower-buds-arranged-symmetrically-on-white-JgTLxVTI0Kw?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1684063088669-04f9b39795a4?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MXx8RnJlZXNpYSUyMGZsb3dlcnxlbnwxfHx8fDE3OTI0MjE3NTJ8MA&ixlib=rb-4.1.0",
      "local": "/images/flowers/freesia-2.jpg",
      "alt": "Фрезия цэцэг, 2-р зураг",
      "width": 2240,
      "height": 3216,
      "color": "#a68c8c",
      "photographer": {
        "name": "Jenny Thalheim",
        "url": "https://unsplash.com/@jennomat?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/a-close-up-of-a-purple-flower-on-a-stem-wmaMFVNf_eo?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1646757231876-53cb365f0ceb?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8RnJlZXNpYSUyMGZsb3dlcnxlbnwxfHx8fDE3OTI0MjE3NTJ8MA&ixlib=rb-4.1.0",
      "local": "/images/flowers/freesia-3.jpg",
      "alt": "Фрезия цэцэг, 3-р зураг",
      "width": 4160,
      "height": 5824,
      "color": "#a6a6a6",
      "photographer": {
        "name": "Farrinni",
        "url": "https://unsplash.com/@farrinni?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/a-vase-filled-with-yellow-flowers-on-top-of-a-table-ZMKMmtA-j7s?utm_source=flower&utm_medium=referral"
    }
  ],
  "lisianthus": [
    {
      "src": "https://images.unsplash.com/photo-1689079970980-e32547c23002?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MXx8bGlzaWFudGh1cyUyMGZsb3dlcnN8ZW58MXx8fHwxNzkyNDIyMTkwfDA&ixlib=rb-4.1.0",
      "local": "/images/flowers/lisianthus-1.jpg",
      "alt": "Эустома цэцэг",
      "width": 5725,
      "height": 3817,
      "color": "#f3f3f3",
      "photographer": {
        "name": "Natalie Kinnear",
        "url": "https://unsplash.com/@nataliekinnear?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/a-group-of-pink-and-white-flowers-sitting-next-to-each-other-BC1PjWh96SA?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1534274265498-790499219879?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8bGlzaWFudGh1cyUyMGZsb3dlcnN8ZW58MXx8fHwxNzkyNDIyMTkwfDA&ixlib=rb-4.1.0",
      "local": "/images/flowers/lisianthus-2.jpg",
      "alt": "Эустома цэцэг, 2-р зураг",
      "width": 3333,
      "height": 5000,
      "color": "#f3f3d9",
      "photographer": {
        "name": "Sophie Dale",
        "url": "https://unsplash.com/@allthestars?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/selective-focus-photo-of-pink-rose-34dsdaF-AqM?utm_source=flower&utm_medium=referral"
    }
  ],
  "gypsophila": [
    {
      "src": "https://images.unsplash.com/photo-1596140233097-e637d44b4418?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8NHx8YmFieSUyN3MlMjBicmVhdGglMjBmbG93ZXJzfGVufDF8fHx8MTc5MjQyMTg4Mnww&ixlib=rb-4.1.0",
      "local": "/images/flowers/gypsophila-1.jpg",
      "alt": "Гипсофила цэцэг",
      "width": 5472,
      "height": 3648,
      "color": "#262626",
      "photographer": {
        "name": "Judith Zimmermann",
        "url": "https://unsplash.com/@judithzimmermann?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/white-flowers-in-tilt-shift-lens-M_34Omvk52A?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1608153917926-c467b4e23b6f?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MXx8YmFieSUyN3MlMjBicmVhdGglMjBmbG93ZXJzfGVufDF8fHx8MTc5MjQyMTg4Mnww&ixlib=rb-4.1.0",
      "local": "/images/flowers/gypsophila-2.jpg",
      "alt": "Гипсофила цэцэг, 2-р зураг",
      "width": 3871,
      "height": 5807,
      "color": "#f3f3f3",
      "photographer": {
        "name": "Fiona Murray-deGraaff",
        "url": "https://unsplash.com/@fionamurrayphoto?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/white-flowers-with-green-leaves-cCNR7TAkOs0?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1648170116264-2782b2823502?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8YmFieSUyN3MlMjBicmVhdGglMjBmbG93ZXJzfGVufDF8fHx8MTc5MjQyMTg4Mnww&ixlib=rb-4.1.0",
      "local": "/images/flowers/gypsophila-3.jpg",
      "alt": "Гипсофила цэцэг, 3-р зураг",
      "width": 2000,
      "height": 3000,
      "color": "#737373",
      "photographer": {
        "name": "After Exposure Studio",
        "url": "https://unsplash.com/@after_exposure?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/a-vase-filled-with-white-flowers-on-top-of-a-table-FolJQXGJ7FE?utm_source=flower&utm_medium=referral"
    }
  ]
};
