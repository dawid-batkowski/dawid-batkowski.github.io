console.log("Lenis script loaded");
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 2,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

// Get scroll progress
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Resize Lenis when window resizes
window.addEventListener('resize', () => {
    lenis.resize();
});

// Resize after page fully loads (including images)
window.addEventListener('load', () => {
    lenis.resize();
});

// Optional: Resize after a short delay to catch any late-loading content
setTimeout(() => {
    lenis.resize();
}, 100);

// If you have images in your grid
const images = document.querySelectorAll('.mainPiece img');
images.forEach(img => {
    img.addEventListener('load', () => {
        lenis.resize();
    });
});