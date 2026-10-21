// Энэ файлыг `npm run images:heads` (scripts/flower-heads.ts) үүсгэнэ — гараар бүү засаарай.
import type { FlowerSlug } from "./flowers.ts";

/** Зураг бүрээс нэг цэцгийн толгойн дугуй тайралт: cx, cy (0–1), r (өргөний хувь), тэр хэсгийн өнгө */
export type FlowerHead = { image: number; cx: number; cy: number; r: number; color: string };

export const flowerHeads: Partial<Record<FlowerSlug, FlowerHead[]>> = {
  "peony": [
    {
      "image": 0,
      "cx": 0.625,
      "cy": 0.631,
      "r": 0.2,
      "color": "#f16862"
    },
    {
      "image": 1,
      "cx": 0.49,
      "cy": 0.465,
      "r": 0.14,
      "color": "#b47497"
    },
    {
      "image": 2,
      "cx": 0.579,
      "cy": 0.612,
      "r": 0.28,
      "color": "#ce7775"
    }
  ],
  "rose": [
    {
      "image": 0,
      "cx": 0.718,
      "cy": 0.744,
      "r": 0.093,
      "color": "#bc3c46"
    },
    {
      "image": 1,
      "cx": 0.701,
      "cy": 0.219,
      "r": 0.14,
      "color": "#a00201"
    },
    {
      "image": 2,
      "cx": 0.766,
      "cy": 0.508,
      "r": 0.2,
      "color": "#b90229"
    }
  ],
  "spray-rose": [
    {
      "image": 0,
      "cx": 0.544,
      "cy": 0.514,
      "r": 0.094,
      "color": "#d5a700"
    },
    {
      "image": 1,
      "cx": 0.373,
      "cy": 0.555,
      "r": 0.14,
      "color": "#d16f82"
    },
    {
      "image": 2,
      "cx": 0.28,
      "cy": 0.585,
      "r": 0.28,
      "color": "#ca8482"
    }
  ],
  "tulip": [
    {
      "image": 0,
      "cx": 0.5,
      "cy": 0.36,
      "r": 0.13,
      "color": "#d6537b"
    },
    {
      "image": 1,
      "cx": 0.626,
      "cy": 0.344,
      "r": 0.14,
      "color": "#c57a83"
    },
    {
      "image": 2,
      "cx": 0.42,
      "cy": 0.6,
      "r": 0.24,
      "color": "#fa9a75"
    }
  ],
  "lily": [
    {
      "image": 0,
      "cx": 0.344,
      "cy": 0.738,
      "r": 0.094,
      "color": "#d3b067"
    }
  ],
  "oriental-lily": [
    {
      "image": 0,
      "cx": 0.319,
      "cy": 0.701,
      "r": 0.094,
      "color": "#d9d4d5"
    },
    {
      "image": 1,
      "cx": 0.444,
      "cy": 0.776,
      "r": 0.094,
      "color": "#aa3d5c"
    },
    {
      "image": 2,
      "cx": 0.244,
      "cy": 0.252,
      "r": 0.094,
      "color": "#aa2f4f"
    }
  ],
  "chrysanthemum": [
    {
      "image": 0,
      "cx": 0.534,
      "cy": 0.499,
      "r": 0.134,
      "color": "#c48dab"
    },
    {
      "image": 1,
      "cx": 0.859,
      "cy": 0.812,
      "r": 0.14,
      "color": "#c19482"
    },
    {
      "image": 2,
      "cx": 0.177,
      "cy": 0.244,
      "r": 0.14,
      "color": "#b58982"
    }
  ],
  "sunflower": [
    {
      "image": 0,
      "cx": 0.594,
      "cy": 0.589,
      "r": 0.094,
      "color": "#e3aa23"
    },
    {
      "image": 1,
      "cx": 0.513,
      "cy": 0.385,
      "r": 0.28,
      "color": "#b16616"
    },
    {
      "image": 2,
      "cx": 0.467,
      "cy": 0.337,
      "r": 0.28,
      "color": "#d19e0d"
    }
  ],
  "orchid": [
    {
      "image": 0,
      "cx": 0.584,
      "cy": 0.35,
      "r": 0.134,
      "color": "#d76760"
    },
    {
      "image": 1,
      "cx": 0.707,
      "cy": 0.305,
      "r": 0.14,
      "color": "#a45c8d"
    },
    {
      "image": 2,
      "cx": 0.773,
      "cy": 0.18,
      "r": 0.14,
      "color": "#a33bb1"
    }
  ],
  "hydrangea": [
    {
      "image": 0,
      "cx": 0.719,
      "cy": 0.551,
      "r": 0.094,
      "color": "#3f80bb"
    },
    {
      "image": 1,
      "cx": 0.663,
      "cy": 0.844,
      "r": 0.14,
      "color": "#845760"
    },
    {
      "image": 2,
      "cx": 0.13,
      "cy": 0.673,
      "r": 0.105,
      "color": "#477ba3"
    }
  ],
  "ranunculus": [
    {
      "image": 0,
      "cx": 0.393,
      "cy": 0.706,
      "r": 0.093,
      "color": "#dc948b"
    },
    {
      "image": 1,
      "cx": 0.169,
      "cy": 0.776,
      "r": 0.094,
      "color": "#bd4e5d"
    },
    {
      "image": 2,
      "cx": 0.85,
      "cy": 0.644,
      "r": 0.14,
      "color": "#b78782"
    }
  ],
  "iris": [
    {
      "image": 0,
      "cx": 0.535,
      "cy": 0.58,
      "r": 0.21,
      "color": "#907bab"
    },
    {
      "image": 1,
      "cx": 0.465,
      "cy": 0.315,
      "r": 0.14,
      "color": "#8a7ab6"
    },
    {
      "image": 2,
      "cx": 0.551,
      "cy": 0.394,
      "r": 0.14,
      "color": "#b385c7"
    }
  ],
  "lilac": [
    {
      "image": 0,
      "cx": 0.554,
      "cy": 0.229,
      "r": 0.079,
      "color": "#c992cb"
    },
    {
      "image": 1,
      "cx": 0.14,
      "cy": 0.694,
      "r": 0.14,
      "color": "#a99ec1"
    },
    {
      "image": 2,
      "cx": 0.433,
      "cy": 0.7,
      "r": 0.2,
      "color": "#8a7996"
    }
  ],
  "lavender": [
    {
      "image": 0,
      "cx": 0.194,
      "cy": 0.813,
      "r": 0.094,
      "color": "#312979"
    },
    {
      "image": 1,
      "cx": 0.663,
      "cy": 0.844,
      "r": 0.14,
      "color": "#8784be"
    },
    {
      "image": 2,
      "cx": 0.484,
      "cy": 0.723,
      "r": 0.134,
      "color": "#776eaa"
    }
  ],
  "gerbera": [
    {
      "image": 0,
      "cx": 0.694,
      "cy": 0.402,
      "r": 0.094,
      "color": "#d8ac9b"
    },
    {
      "image": 1,
      "cx": 0.327,
      "cy": 0.594,
      "r": 0.14,
      "color": "#ef6c43"
    },
    {
      "image": 2,
      "cx": 0.512,
      "cy": 0.579,
      "r": 0.187,
      "color": "#eaae94"
    }
  ],
  "calla": [
    {
      "image": 0,
      "cx": 0.58,
      "cy": 0.45,
      "r": 0.1,
      "color": "#9c8c91"
    },
    {
      "image": 1,
      "cx": 0.476,
      "cy": 0.519,
      "r": 0.14,
      "color": "#dace8c"
    },
    {
      "image": 2,
      "cx": 0.5,
      "cy": 0.22,
      "r": 0.33,
      "color": "#9e9da2"
    }
  ],
  "freesia": [
    {
      "image": 0,
      "cx": 0.294,
      "cy": 0.701,
      "r": 0.094,
      "color": "#d6c039"
    },
    {
      "image": 1,
      "cx": 0.38,
      "cy": 0.364,
      "r": 0.2,
      "color": "#854dab"
    },
    {
      "image": 2,
      "cx": 0.5,
      "cy": 0.4,
      "r": 0.28,
      "color": "#a0822f"
    }
  ],
  "lisianthus": [
    {
      "image": 0,
      "cx": 0.419,
      "cy": 0.701,
      "r": 0.094,
      "color": "#d79c99"
    },
    {
      "image": 1,
      "cx": 0.45,
      "cy": 0.35,
      "r": 0.3,
      "color": "#d19ba5"
    }
  ],
  "gypsophila": [
    {
      "image": 0,
      "cx": 0.309,
      "cy": 0.574,
      "r": 0.134,
      "color": "#acaca5"
    },
    {
      "image": 1,
      "cx": 0.691,
      "cy": 0.687,
      "r": 0.28,
      "color": "#c7c2b5"
    },
    {
      "image": 2,
      "cx": 0.2,
      "cy": 0.834,
      "r": 0.2,
      "color": "#7d7b72"
    }
  ]
};
