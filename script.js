document.addEventListener('DOMContentLoaded', () => {
  // 1) Smooth-Scrolling für Navigationslinks
  const navLinks = document.querySelectorAll('nav ul li a');
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // 2) Sound-Toggle über Lautsprecher-Icon
  const ambientSound = document.getElementById('ambient-sound');
  const clickSound = document.getElementById('click-sound');
  const soundIcon = document.getElementById('sound-toggle');
  let soundOn = false;

  soundIcon.addEventListener('click', () => {
    soundOn = !soundOn;
    if (soundOn) {
      ambientSound.play();
      soundIcon.src = 'assets/icons/sound.png';
    } else {
      ambientSound.pause();
      soundIcon.src = 'assets/icons/nosound.png';
    }
    clickSound.play();
  });

  // Videos stummschalten und Ambient-Sound beim Klick starten
  document.querySelectorAll('video').forEach((video) => {
    video.muted = true;
    video.style.cursor = 'pointer';
    video.addEventListener('click', () => {
      ambientSound.currentTime = 0;
      ambientSound.play();
    });
  });

  // 3) Modal für allgemeine Galerie
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modal-img');
  const galleryItems = document.querySelectorAll('.gallery img, .gallery video');
  const closeModal = document.querySelector('.close');
  const nextBtn = document.querySelector('.next');
  const prevBtn = document.querySelector('.prev');
  let currentIndex = 0;
  const gallerySrc = [];

  galleryItems.forEach((el, idx) => {
    const src = el.tagName === 'IMG' ? el.src : el.querySelector('source').src;
    gallerySrc.push(src);
    el.addEventListener('click', () => {
      currentIndex = idx;
      modal.style.display = 'block';
      modalImg.src = gallerySrc[currentIndex];
    });
  });

  closeModal.addEventListener('click', () => (modal.style.display = 'none'));
  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % gallerySrc.length;
    modalImg.src = gallerySrc[currentIndex];
  });
  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + gallerySrc.length) % gallerySrc.length;
    modalImg.src = gallerySrc[currentIndex];
  });
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // 4) Modal für Unterkunfts‑Galerie
  const accomModal = document.getElementById('accommodationModal');
  const modalAccomImg = document.getElementById('modal-accom-img');
  const accomItems = document.querySelectorAll('.accommodation-gallery figure img');
  const closeAccom = document.querySelector('.closeAccom');
  const nextAccom = document.querySelector('.nextAccom');
  const prevAccom = document.querySelector('.prevAccom');
  let currentAccomIndex = 0;
  const accomSrc = [];

  accomItems.forEach((img, idx) => {
    accomSrc.push(img.src);
    img.addEventListener('click', () => {
      currentAccomIndex = idx;
      accomModal.style.display = 'block';
      modalAccomImg.src = accomSrc[currentAccomIndex];
    });
  });

  closeAccom.addEventListener('click', () => (accomModal.style.display = 'none'));
  nextAccom.addEventListener('click', () => {
    currentAccomIndex = (currentAccomIndex + 1) % accomSrc.length;
    modalAccomImg.src = accomSrc[currentAccomIndex];
  });
  prevAccom.addEventListener('click', () => {
    currentAccomIndex = (currentAccomIndex - 1 + accomSrc.length) % accomSrc.length;
    modalAccomImg.src = accomSrc[currentAccomIndex];
  });
  window.addEventListener('click', (e) => {
    if (e.target === accomModal) accomModal.style.display = 'none';
  });

  // 5) Soundeffekte bei Mouseenter in den Galerien
  galleryItems.forEach((el) => el.addEventListener('mouseenter', () => clickSound.play()));
  accomItems.forEach((el) => el.addEventListener('mouseenter', () => clickSound.play()));

  // 6) Affen-Sprite-Animation & Bewegung
  const monkey = document.getElementById('monkey');
  const main = document.querySelector('main');

  // Frames laden
  const frames = [];
  for (let i = 1; i <= 16; i++) {
    frames.push(`assets/images/monkey_frames/monkey_${i}.png`);
  }

  // Sprite‑Loop bei 6 fps
  let frameIdx = 0;
  setInterval(() => {
    monkey.src = frames[frameIdx];
    frameIdx = (frameIdx + 1) % frames.length;
  }, 1000 / 6);

  // Forbidden-Zonen auslesen
  const forbiddenEls = main.querySelectorAll('img, video, .text');
  let forbiddenRects = [];
  function updateForbidden() {
    forbiddenRects = Array.from(forbiddenEls).map((el) => el.getBoundingClientRect());
  }
  updateForbidden();
  window.addEventListener('resize', updateForbidden);
  window.addEventListener('scroll', updateForbidden);

  function isAllowed(x, y) {
    return !forbiddenRects.some((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
  }

  // Waypoints generieren
  function generateWaypoints(count = 12) {
    const rect = main.getBoundingClientRect();
    const pts = [];
    let attempts = 0;
    while (pts.length < count && attempts < count * 20) {
      attempts++;
      const x = window.scrollX + rect.left + Math.random() * rect.width;
      const y = window.scrollY + rect.top + Math.random() * rect.height;
      if (isAllowed(x, y)) pts.push({ x, y });
    }
    return pts;
  }
  const waypoints = generateWaypoints();

  // Langsames, glattes Gleiten (8s statt 4s)
  Object.assign(monkey.style, {
    position: 'absolute',
    transition: 'left 8s linear, top 8s linear',
    pointerEvents: 'none',
  });

  let idx = 0,
    lastX = window.innerWidth / 2;
  function moveTo(pt) {
    const flip = pt.x < lastX ? -1 : 1;
    monkey.style.transform = `translate(-50%,-50%) scaleX(${flip})`;
    lastX = pt.x;
    monkey.style.left = `${pt.x}px`;
    monkey.style.top = `${pt.y}px`;
  }

  monkey.addEventListener('transitionend', () => {
    idx = (idx + 1) % waypoints.length;
    // 1 s Pause vor nächster Bewegung
    setTimeout(() => moveTo(waypoints[idx]), 1000);
  });

  // Initialstart
  moveTo(waypoints[0]);
});
