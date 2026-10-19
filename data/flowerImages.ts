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
      "src": "https://images.unsplash.com/photo-1582794543462-0d7922e50cf5?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MXx8cGluayUyMHBlb255JTIwZmxvd2Vyc3xlbnwxfHx8fDE3OTIzOTY1MDJ8MA&ixlib=rb-4.1.0",
      "local": "/images/flowers/peony-2.jpg",
      "alt": "Цээнэ цэцэг, 2-р зураг",
      "width": 2250,
      "height": 4000,
      "color": "#f3d9d9",
      "photographer": {
        "name": "Rikonavt",
        "url": "https://unsplash.com/@rikonavt?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/pink-flower-in-macro-lens-K3x_AkLVTAo?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1511201173873-c327e63eb6c4?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8cGluayUyMHBlb255JTIwZmxvd2Vyc3xlbnwxfHx8fDE3OTIzOTY1MDJ8MA&ixlib=rb-4.1.0",
      "local": "/images/flowers/peony-3.jpg",
      "alt": "Цээнэ цэцэг, 3-р зураг",
      "width": 3350,
      "height": 3350,
      "color": "#260c26",
      "photographer": {
        "name": "Cristiane Teston",
        "url": "https://unsplash.com/@cristiane?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/pink-peonies-with-purple-flowers-y-5pd18ETbg?utm_source=flower&utm_medium=referral"
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
      "src": "https://images.unsplash.com/photo-1556712691-5c39e0e32a8e?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8c3ByYXklMjByb3NlcyUyMGZsb3dlcnN8ZW58MXx8fHwxNzkyMzk2NTEwfDA&ixlib=rb-4.1.0",
      "local": "/images/flowers/spray-rose-1.jpg",
      "alt": "Бутлаг сарнай цэцэг",
      "width": 6000,
      "height": 4000,
      "color": "#c00c26",
      "photographer": {
        "name": "Waldemar Brandt",
        "url": "https://unsplash.com/@waldemarbrandt67w?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/orange-red-and-pink-rose-flower-sycOtFg3SBc?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1597826368522-9f4cb5a6ba48?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MXx8c3ByYXklMjByb3NlcyUyMGZsb3dlcnN8ZW58MXx8fHwxNzkyMzk2NTEwfDA&ixlib=rb-4.1.0",
      "local": "/images/flowers/spray-rose-2.jpg",
      "alt": "Бутлаг сарнай цэцэг, 2-р зураг",
      "width": 2547,
      "height": 3802,
      "color": "#c0c0c0",
      "photographer": {
        "name": "Anna Pavlin",
        "url": "https://unsplash.com/@anna2301?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/pink-rose-in-close-up-photography-UMH92TvHEz0?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1589458456444-f7158a7e8a4f?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8M3x8c3ByYXklMjByb3NlcyUyMGZsb3dlcnN8ZW58MXx8fHwxNzkyMzk2NTEwfDA&ixlib=rb-4.1.0",
      "local": "/images/flowers/spray-rose-3.jpg",
      "alt": "Бутлаг сарнай цэцэг, 3-р зураг",
      "width": 2048,
      "height": 2730,
      "color": "#d9c0c0",
      "photographer": {
        "name": "Ilona K.",
        "url": "https://unsplash.com/@byilonak?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/pink-roses-in-close-up-photography-ktzSt2uT1po?utm_source=flower&utm_medium=referral"
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
      "src": "https://images.unsplash.com/photo-1662529061256-1d56731be7e5?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8M3x8bWFydGFnb24lMjBsaWx5fGVufDF8fHx8MTc5MjM5NjUxNnww&ixlib=rb-4.1.0",
      "local": "/images/flowers/lily-1.jpg",
      "alt": "Зэрлэг сараана цэцэг",
      "width": 7892,
      "height": 5264,
      "color": "#0c260c",
      "photographer": {
        "name": "Photos of Korea",
        "url": "https://unsplash.com/@photosofkorea?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/a-butterfly-on-a-flower-VWyEyTdyoaM?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1678143592757-4ad35cc12833?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MXx8bWFydGFnb24lMjBsaWx5fGVufDF8fHx8MTc5MjM5NjUxNnww&ixlib=rb-4.1.0",
      "local": "/images/flowers/lily-2.jpg",
      "alt": "Зэрлэг сараана цэцэг, 2-р зураг",
      "width": 3000,
      "height": 4000,
      "color": "#26260c",
      "photographer": {
        "name": "Caroline Ashley",
        "url": "https://unsplash.com/@carolineashleyartist?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/a-close-up-of-a-flower-on-a-tree-8IA-1osFGWQ?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1749748302602-20c998ed086a?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8bWFydGFnb24lMjBsaWx5fGVufDF8fHx8MTc5MjM5NjUxNnww&ixlib=rb-4.1.0",
      "local": "/images/flowers/lily-3.jpg",
      "alt": "Зэрлэг сараана цэцэг, 3-р зураг",
      "width": 2274,
      "height": 3411,
      "color": "#f3f3d9",
      "photographer": {
        "name": "Europeana",
        "url": "https://unsplash.com/@europeana?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/a-delicate-lily-plant-with-spotted-flowers-and-recurved-petals-vPH_TRbZdTU?utm_source=flower&utm_medium=referral"
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
      "src": "https://images.unsplash.com/photo-1666469948591-f792c6ab29c9?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8M3x8Q2hyeXNhbnRoZW11bSUyMGZsb3dlcnxlbnwxfHx8fDE3OTIzOTY1MjR8MA&ixlib=rb-4.1.0",
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
      "src": "https://images.unsplash.com/photo-1464820453369-31d2c0b651af?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8MXx8Q2hyeXNhbnRoZW11bSUyMGZsb3dlcnxlbnwxfHx8fDE3OTIzOTY1MjR8MA&ixlib=rb-4.1.0",
      "local": "/images/flowers/chrysanthemum-2.jpg",
      "alt": "Хризантем цэцэг, 2-р зураг",
      "width": 3456,
      "height": 3456,
      "color": "#f3f3f3",
      "photographer": {
        "name": "Sharon Pittaway",
        "url": "https://unsplash.com/@sharonp?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/rainbow-chrysanthemum-flower-with-vibrant-petals-iMdsjoiftZo?utm_source=flower&utm_medium=referral"
    },
    {
      "src": "https://images.unsplash.com/photo-1585337913966-114ba3cf1f80?ixid=M3wxMTAzODE0fDB8MXxzZWFyY2h8Mnx8Q2hyeXNhbnRoZW11bSUyMGZsb3dlcnxlbnwxfHx8fDE3OTIzOTY1MjR8MA&ixlib=rb-4.1.0",
      "local": "/images/flowers/chrysanthemum-3.jpg",
      "alt": "Хризантем цэцэг, 3-р зураг",
      "width": 3200,
      "height": 4000,
      "color": "#d9c0c0",
      "photographer": {
        "name": "Tavga K.S",
        "url": "https://unsplash.com/@tavgaksalih?utm_source=flower&utm_medium=referral"
      },
      "unsplashUrl": "https://unsplash.com/photos/white-and-brown-flowers-in-close-up-photography-6Qq9xVZYYEw?utm_source=flower&utm_medium=referral"
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
  ]
};
