/**
 * Scroll-ийн хурд (px/frame) — SmoothScroll (Lenis) бичиж, 3D тал useFrame-ээс
 * React state-гүйгээр уншина. `simulated` нь /lab-д scroll-гүйгээр туршихад.
 */
export const scrollMotion = { velocity: 0, simulated: 0 };

export const getScrollVelocity = () => scrollMotion.velocity + scrollMotion.simulated;
