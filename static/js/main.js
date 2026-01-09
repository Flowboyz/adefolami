// ===========================
// MOBILE MENU TOGGLE
// ===========================
const menuToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  // ensure initial aria state and symbol
  menuToggle.setAttribute('aria-expanded', 'false');
  if (!menuToggle.textContent.trim()) menuToggle.textContent = '☰';

  menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('show');
    menuToggle.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    // swap symbol for a clear affordance
    menuToggle.textContent = open ? '✕' : '☰';
  });

  // close when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('show');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.textContent = '☰';
    });
  });

  // close on outside click
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)){
      if (navLinks.classList.contains('show')){
        navLinks.classList.remove('show');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.textContent = '☰';
      }
    }
  });
}

// ===========================
// STICKY NAVBAR ON SCROLL
// ===========================
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  header.classList.toggle("sticky", window.scrollY > 50);
});


// ===========================
// SMOOTH SCROLL
// ===========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 70,
        behavior: "smooth"
      });

      if (navLinks) navLinks.classList.remove('show');
      if (menuToggle) { menuToggle.classList.remove('open'); menuToggle.setAttribute('aria-expanded','false'); }
    }
  });
});


// ===========================
// SCROLL REVEAL EFFECT
// ===========================
const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
  const windowHeight = window.innerHeight;
  const revealPoint = 150;

  reveals.forEach(section => {
    const sectionTop = section.getBoundingClientRect().top;

    if (sectionTop < windowHeight - revealPoint) {
      section.classList.add("active");
    } else {
      section.classList.remove("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();


// ===========================
// CONTACT FORM - FLASK CONNECT
// ===========================
const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    const statusMsg = document.getElementById("form-status");
    const submitBtn = contactForm.querySelector('button[type="submit"], input[type="submit"], .btn');
    const originalBtnText = submitBtn ? submitBtn.textContent : '';

    // CLIENT-SIDE VALIDATION
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const messageField = document.getElementById('message');

    // clear previous invalid markers
    [nameField, emailField, messageField].forEach(f => f && f.classList.remove('invalid'));

    if(!name){
      statusMsg.innerText = 'Please enter your name.';
      statusMsg.style.color = 'red';
      if(nameField){ nameField.classList.add('invalid'); nameField.focus(); }
      return;
    }

    // simple email validation
    const emailRe = /^\S+@\S+\.\S+$/;
    if(!email || !emailRe.test(email)){
      statusMsg.innerText = 'Please enter a valid email address.';
      statusMsg.style.color = 'red';
      if(emailField){ emailField.classList.add('invalid'); emailField.focus(); }
      return;
    }

    if(!message || message.length < 10){
      statusMsg.innerText = 'Please enter a message (at least 10 characters).';
      statusMsg.style.color = 'red';
      if(messageField){ messageField.classList.add('invalid'); messageField.focus(); }
      return;
    }

    // UI: show busy state (spinner + disabled)
    statusMsg.innerText = "Sending...";
    statusMsg.style.color = "#333";

    function setBtnState(btn, { disabled = false, busy = false, text = null, stateClass = null } = {}){
      if(!btn) return;
      btn.disabled = disabled;
      if(busy) btn.setAttribute('aria-busy','true'); else btn.removeAttribute('aria-busy');

      // clear existing visual state classes
      btn.classList.remove('loading','success','error');
      if(stateClass) btn.classList.add(stateClass);

      if(text !== null){
        if(btn.tagName === 'INPUT') btn.value = text;
        else btn.innerHTML = text;
      }
    }

    if (submitBtn) { setBtnState(submitBtn, { disabled: true, busy: true, text: 'Submitting...', stateClass: 'loading' }); }

    try {
      const response = await fetch("/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, message })
      });

      // some backends return no JSON; handle gracefully
      let data = null;
      try { data = await response.json(); } catch (e) { data = null; }

      const success = (data && data.success) || response.ok;

      if (success) {
        statusMsg.innerText = "Submitted — thank you for reaching out!";
        statusMsg.style.color = "green";
        if (submitBtn) {
          const okText = '✔ Submitted — thank you!';
          setBtnState(submitBtn, { disabled: true, busy: false, text: okText, stateClass: 'success' });
          submitBtn.setAttribute('aria-live','polite');
        }
        contactForm.reset();
        // restore button after a short delay so user can submit again
        setTimeout(() => {
          if (submitBtn) { setBtnState(submitBtn, { disabled: false, busy: false, text: originalBtnText }); submitBtn.classList.remove('success'); }
        }, 4000);
      } else {
        statusMsg.innerText = "Failed to send message. Try again.";
        statusMsg.style.color = "red";
        if (submitBtn) { setBtnState(submitBtn, { disabled: false, busy: false, text: 'Failed — try again', stateClass: 'error' }); setTimeout(()=> submitBtn.classList.remove('error'), 3000); }
      }
    } catch (error) {
      console.error(error);
      statusMsg.innerText = "Server error. Try again later.";
      statusMsg.style.color = "red";
      if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy'); submitBtn.textContent = originalBtnText; }
    }
  });
}


// ===========================
// BACK TO TOP BUTTON (OPTIONAL)
// ===========================
const backToTop = document.querySelector(".back-to-top");

if (backToTop) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 600) {
      backToTop.classList.add("show");
    } else {
      backToTop.classList.remove("show");
    }
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* COUNTERS: animate stat numbers when the stats section scrolls into view */
(function(){
  function animateCount(el, target, duration = 2000, suffix = ''){
    const start = 0;
    const startTime = performance.now();
    function format(n){ return n.toLocaleString() + suffix; }
    function step(now){
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.floor(progress * (target - start) + start);
      el.textContent = format(value);
      if(progress < 1) requestAnimationFrame(step);
      else el.textContent = format(target);
    }
    requestAnimationFrame(step);
  }

  const statsSection = document.querySelector('.stats');
  if(!statsSection) return;

  function runStats(){
    if(statsSection.classList.contains('started')) return; // already ran
    statsSection.classList.add('started');
    statsSection.querySelectorAll('.stat p').forEach(p => {
      if(p.dataset.animated) return;
      const raw = p.textContent.trim();
      // extract suffix like '+' or '%'
      const suffix = raw.replace(/[0-9,\s]/g, '');
      const numeric = parseInt(raw.replace(/[^0-9]/g, ''), 10) || 0;
      const target = p.dataset.target ? Number(p.dataset.target) : numeric;
      animateCount(p, target, 1400, suffix);
      p.dataset.animated = 'true';
    });
  }

  const statsObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        runStats();
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  statsObserver.observe(statsSection);

  // If the section is already visible on load (e.g., large viewport), trigger immediately
  const rect = statsSection.getBoundingClientRect();
  if(rect.top < window.innerHeight && rect.bottom >= 0){ runStats(); statsObserver.disconnect(); }
})();

/* ABOUT SLIDE-IN: animate about-left / about-right when scrolled into view */
(function(){
  const items = document.querySelectorAll('.about-left, .about-right');
  if(!items.length) return;

  const aboutObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(i => aboutObserver.observe(i));
})();


const slide = document.querySelector(".slider");
const dot = document.querySelectorAll(".dot");

let index1 = 0;

function moveSlide(i){
  slide.style.transform = `translateX(-${i * 50}%)`;
  dot.forEach(d => d.classList.remove("active"));
  dot[i].classList.add("active");
}

dot.forEach((dot,i)=>{
  dot.addEventListener("click",()=>{
    index1 = i;
    moveSlide(index1);
  });
});

// auto animation
setInterval(()=>{
  index1 = (index1 + 1) % 2;
  moveSlide(index1);
},5000);

const slider = document.querySelector(".cert-slider");
const slides = document.querySelectorAll(".cert-slide");
const dots = document.querySelectorAll(".cert-pagination .dot");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

let index = 0;
let isAnimating = false;
let autoSlide;

/* Get exact width of ONE slide */
function slideWidth() {
  return slides[0].getBoundingClientRect().width;
}

/* CORE MOVE FUNCTION */
function goToSlide(i) {
  if (isAnimating) return;
  isAnimating = true;

  index = i;

  /* Move LEFT by exact pixels */
  slider.style.transform = `translateX(-${index * slideWidth()}px)`;

  /* Update dots IMMEDIATELY */
  dots.forEach(dot => dot.classList.remove("active"));
  dots[index].classList.add("active");

  /* Unlock after animation finishes */
  setTimeout(() => {
    isAnimating = false;
  }, 800); // must match CSS transition time
}

/* NEXT / PREV */
function nextSlide() {
  index = (index + 1) % slides.length;
  goToSlide(index);
}

function prevSlide() {
  index = (index - 1 + slides.length) % slides.length;
  goToSlide(index);
}

/* BUTTON EVENTS */
nextBtn.addEventListener("click", () => {
  nextSlide();
  resetAuto();
});

prevBtn.addEventListener("click", () => {
  prevSlide();
  resetAuto();
});

/* DOT EVENTS */
dots.forEach((dot, i) => {
  dot.addEventListener("click", () => {
    goToSlide(i);
    resetAuto();
  });
});

/* AUTO SLIDE */
function startAuto() {
  autoSlide = setInterval(nextSlide, 6000);
}

function resetAuto() {
  clearInterval(autoSlide);
  startAuto();
}

/* INIT */
goToSlide(0);
startAuto();

/* Recalculate on resize */
window.addEventListener("resize", () => {
  slider.style.transform = `translateX(-${index * slideWidth()}px)`;
});

// nav link click handlers are handled when the menu is initialized above - no-op here to avoid errors.
