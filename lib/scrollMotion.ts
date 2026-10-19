/**
 * Scroll-ийн хурд (px/frame) — SmoothScroll (Lenis) бичиж, 3D тал useFrame-ээс
 * React state-гүйгээр уншина. `simulated` нь /lab-д scroll-гүйгээр туршихад.
 * `hero` нь нүүрний hero хэсгийн ScrollTrigger progress (0–1) — 3D тал үүнийг
 * шууд биш, damping-тэйгээр дагана.
 */
export const scrollMotion = { velocity: 0, simulated: 0, hero: 0 };

export const getScrollVelocity = () => scrollMotion.velocity + scrollMotion.simulated;
