"use client";

/**
 * Аяллын кадр бүрийн төлөв — ScrollRig бичиж, World / ProductReveal / PetalDrift уншина
 * (React state-гүй). `stage` өөрчлөгдөх үед л FlowerScene React state-ээ шинэчилж
 * одоогийн + дараагийн цэцгийг mount хийнэ.
 */
export function createJourneyState() {
  return {
    /** Одоогийн шат (цэцгийн индекс) */
    stage: 0,
    /** Дэлгэцэнд харагдаж буй цэцэг — гарцын үед stage + 1 */
    shown: 0,
    /** Дэлбээ → зураг (0–1) */
    dissolveIn: 0,
    /** Зураг голоосоо нээгдэж дараагийн ертөнц харагдана (0–1) */
    dissolveOut: 0,
    /** Ертөнцийн бутархай индекс: 1.4 = 1-р ертөнцөөс 2-р луу 40% */
    world: 0,
    /** Ертөнц хоорондын мананцар (0–1) */
    haze: 0,
  };
}

export type JourneyState = ReturnType<typeof createJourneyState>;
