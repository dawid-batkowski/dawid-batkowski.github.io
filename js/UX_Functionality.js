console.log("Lenis script loaded");
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 4,
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

function resizeButtonText() {
    document.querySelectorAll('.projectButton').forEach(button => {
      const span = button.querySelector('span');
      if (!span) return;
      
      const buttonHeight = button.offsetHeight;
      const buttonWidth = button.offsetWidth;
      const textContent = span.textContent;
      
      //height-based sizing
      let fontSize = buttonHeight * 0.6;
      
      const estimatedWidth = textContent.length * fontSize * 0.8; 
      if (estimatedWidth > buttonWidth) {
        fontSize = (buttonWidth / (textContent.length * 0.6)) * 0.9; 
      }
      
      // minimum readable size
      fontSize = Math.max(fontSize, 10);
      
      span.style.fontSize = `${fontSize}px`;
      
      // Fine-tune if still overflowing
      let iterations = 0;
      while (span.scrollWidth > buttonWidth && fontSize > 8 && iterations < 20) {
        fontSize -= 0.5;
        span.style.fontSize = `${fontSize}px`;
        iterations++;
      }
    });
  }
  
  // Call immediately
  resizeButtonText();
  
  // Debounced resize for performance
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeButtonText, 50);
  });
  
  // Call on load
  window.addEventListener('load', resizeButtonText);
  
  // Use ResizeObserver to detect button size changes
  const buttonObserver = new ResizeObserver(resizeButtonText);
  document.querySelectorAll('.projectButton').forEach(button => {
    buttonObserver.observe(button);
  });