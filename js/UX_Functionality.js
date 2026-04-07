console.log("Lenis script loaded");
const lenis = new Lenis({
    duration: 0.75,
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

// Resize after a short delay to catch any late-loading content
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



  const supportsHover = window.matchMedia('(hover: hover)').matches;

  document.querySelectorAll('.mainPiece').forEach(piece => {
    const textArea = piece.querySelector('.mainPiecetext');
    if (!textArea) return;
    let tapped = false;
  
    if (supportsHover) {
      // Desktop = instant navigation
      textArea.addEventListener('click', () => {
        const url = textArea.dataset.url;
        if (url) window.location.href = url;
      });
    } else {
      // Mobile = tap to reveal, second tap to open
      textArea.addEventListener('click', (e) => {
        const url = textArea.dataset.url;
        
  
        if (!tapped) {
          e.preventDefault();
          e.stopPropagation();
          piece.classList.add('show-description');
          tapped = true;
  
          // Reset after 2 seconds if user taps elsewhere
          setTimeout(() => tapped = false, 2000);
        } else {
          if (url) window.location.href = url;
        }
      });
    }
  });


  function openLightbox(img) {
    const overlay = document.getElementById('lightbox');
    if (!overlay) return; // safety
    document.getElementById('lightbox-img').src = img.src;
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('active'));
  }
  
  function closeLightbox() {
    const overlay = document.getElementById('lightbox');
    if (!overlay) return;
    overlay.classList.remove('active');
    setTimeout(() => overlay.style.display = 'none', 250);
  }
  
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });
  
  const lightbox = document.getElementById('lightbox');
  if (lightbox) lightbox.style.display = 'none';
  
  document.querySelectorAll('.auto-params').forEach(el => {
    el.innerHTML = el.innerHTML.replace(/\(([^)]+)\)/g, (match, inner) => {
      const colored = inner.split(',').map(p => 
        `<span class="param">${p.trim()}</span>`
      ).join(', ');
      return `(${colored})`;
    });
  });

  let lastScroll = 0;
  const header = document.querySelector("header");
  const threshold = 100;
  
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= threshold) {
      header.style.top = "0";
    } 
    else if (currentScroll > lastScroll) {
      header.style.top = "-100px";
    } 
    else {
      header.style.top = "0";
    }
  
    lastScroll = currentScroll;
  });

  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('nav-links');
  const navItems = navLinks.querySelectorAll('a'); // all links inside menu
  
  // Toggle menu when burger clicked
  burger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    burger.classList.toggle('toggle');
  });
  
  // Close menu when any link is clicked
  navItems.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      burger.classList.remove('toggle');
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    const isClickInsideMenu = navLinks.contains(e.target);
    const isClickOnBurger = burger.contains(e.target);
  
    if (!isClickInsideMenu && !isClickOnBurger) {
      navLinks.classList.remove('active');
      burger.classList.remove('toggle');
    }
  });