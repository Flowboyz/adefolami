/**
 * ADEFOLAMI STRUCTURAL SOLUTIONS — main.js
 * Fixed: section fade-in bug, backToTop declaration order
 */

(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ── BACK TO TOP (declared first so onScroll can reference it) ── */
  const backToTop = $(".back-to-top");
  if (backToTop) {
    backToTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }

  /* ── NAV: scroll style + mobile toggle ─────────────────────── */
  const nav = $(".nav");
  const navToggle = $("#nav-toggle");
  const navLinks = $("#nav-links");

  const onScroll = () => {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 30);
    if (backToTop) backToTop.classList.toggle("visible", window.scrollY > 400);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("show");
      navToggle.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    });

    $$("a", navLinks).forEach((a) =>
      a.addEventListener("click", () => {
        navLinks.classList.remove("show");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      })
    );

    document.addEventListener("click", (e) => {
      if (nav && !nav.contains(e.target)) {
        navLinks.classList.remove("show");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ── COPYRIGHT YEAR ─────────────────────────────────────────── */
  const yearEl = $(".year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── SCROLL REVEAL ──────────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  $$(".reveal, .reveal-img").forEach((el) => revealObserver.observe(el));

  /* ── STAGGERED CARD REVEALS ─────────────────────────────────── */
  const cardsSection = $(".cards");
  if (cardsSection) {
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            $$(".card-reveal").forEach((card, i) => {
              setTimeout(() => {
                card.style.opacity = "1";
                card.style.transform = "translateY(0) scale(1)";
              }, i * 120);
            });
            cardObserver.disconnect();
          }
        });
      },
      { threshold: 0.08 }
    );

    $$(".card-reveal").forEach((card) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(24px) scale(0.97)";
      card.style.transition =
        "opacity 0.55s cubic-bezier(.22,.9,.3,1), transform 0.55s cubic-bezier(.22,.9,.3,1)";
    });
    cardObserver.observe(cardsSection);
  }

  /* ── ABOUT SLIDE-IN ─────────────────────────────────────────── */
  const aboutObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in-view");
          aboutObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  $$(".about-left, .about-right").forEach((el) => aboutObserver.observe(el));

  /* ── HERO EYEBROW + SUB-TEXT INJECT ────────────────────────── */
  const heroInner = $(".hero-inner");
  if (heroInner && !$(".hero-eyebrow", heroInner)) {
    const eyebrow = document.createElement("div");
    eyebrow.className = "hero-eyebrow";
    eyebrow.textContent = "Engineering Excellence Since 2009";
    heroInner.prepend(eyebrow);
  }

  const heroH1 = $(".hero h1");
  if (heroH1 && !$(".hero-sub")) {
    const sub = document.createElement("p");
    sub.className = "hero-sub";
    sub.textContent =
      "Nigeria's trusted civil & structural engineering firm — delivering world-class construction solutions across power, oil & gas, and real estate sectors.";
    heroH1.insertAdjacentElement("afterend", sub);
  }

  if (heroH1) {
    heroH1.innerHTML = heroH1.innerHTML.replace(
      "building structure",
      "<em>building structure</em>"
    );
  }

  /* ── ANIMATED STAT COUNTER ──────────────────────────────────── */
  const statsSection = $(".stats");
  if (statsSection) {
    const statObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          statsSection.classList.add("started");
          $$(".stat p").forEach((el) => {
            const raw = el.textContent.trim();
            const isYear = raw === "2009";
            const suffix = raw.replace(/[0-9]/g, "");
            const target = parseInt(raw.replace(/\D/g, ""), 10);
            const duration = 1600;
            const start = performance.now();
            const from = isYear ? 1990 : 0;

            const tick = (now) => {
              const progress = Math.min((now - start) / duration, 1);
              const ease = 1 - Math.pow(1 - progress, 3);
              const value = Math.round(from + (target - from) * ease);
              el.textContent = isYear ? value : value + suffix;
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          });
          statObserver.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    statObserver.observe(statsSection);
  }

  /* ── TESTIMONIAL SLIDER ─────────────────────────────────────── */
  const slider = $("#slider");
  const dots = $$(".pagination .dot");
  let currentSlide = 0;
  let slideTimer = null;

  const goToSlide = (n) => {
    if (!slider) return;
    currentSlide = n;
    slider.style.transform = `translateX(-${50 * n}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === n));
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % (dots.length || 2));

  if (slider) {
    slideTimer = setInterval(nextSlide, 5000);
    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        clearInterval(slideTimer);
        goToSlide(i);
        slideTimer = setInterval(nextSlide, 5000);
      });
    });

    let startX = 0;
    slider.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener("touchend", (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        clearInterval(slideTimer);
        goToSlide(diff > 0 ? (currentSlide + 1) % 2 : (currentSlide - 1 + 2) % 2);
        slideTimer = setInterval(nextSlide, 5000);
      }
    });
  }

  /* ── CERTIFICATE SLIDER ─────────────────────────────────────── */
  const certSlider = $(".cert-slider");
  const certDots = $$(".cert-pagination .dot");
  let certIndex = 0;
  let certTimer = null;

  const goToCert = (n) => {
    if (!certSlider) return;
    certIndex = n;
    certSlider.style.transform = `translateX(-${100 * n}%)`;
    certDots.forEach((d, i) => d.classList.toggle("active", i === n));
  };

  const nextCert = () => goToCert((certIndex + 1) % (certDots.length || 1));

  if (certSlider) {
    certTimer = setInterval(nextCert, 4500);
    certDots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        clearInterval(certTimer);
        goToCert(i);
        certTimer = setInterval(nextCert, 4500);
      });
    });

    const prevBtn = $(".prev");
    const nextBtn = $(".next");
    if (prevBtn)
      prevBtn.addEventListener("click", () => {
        clearInterval(certTimer);
        goToCert((certIndex - 1 + certDots.length) % certDots.length);
        certTimer = setInterval(nextCert, 4500);
      });
    if (nextBtn)
      nextBtn.addEventListener("click", () => {
        clearInterval(certTimer);
        nextCert();
        certTimer = setInterval(nextCert, 4500);
      });

    let cStartX = 0;
    certSlider.addEventListener("touchstart", (e) => { cStartX = e.touches[0].clientX; }, { passive: true });
    certSlider.addEventListener("touchend", (e) => {
      const diff = cStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        clearInterval(certTimer);
        goToCert((certIndex + (diff > 0 ? 1 : -1) + certDots.length) % certDots.length);
        certTimer = setInterval(nextCert, 4500);
      }
    });
  }

  /* ── CONTACT FORM ───────────────────────────────────────────── */
  const form = $(".contact-form");
  const formStatus = $("#form-status");

  if (form) {
    const msgInput = form.querySelector("#message");
    if (msgInput && msgInput.tagName === "INPUT") {
      const ta = document.createElement("textarea");
      ta.name = msgInput.name;
      ta.id = msgInput.id;
      ta.required = msgInput.required;
      ta.placeholder = "Write your message here…";
      msgInput.replaceWith(ta);
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let valid = true;
      $$("input[required], textarea[required]", form).forEach((field) => {
        field.classList.remove("invalid");
        if (!field.value.trim()) {
          field.classList.add("invalid");
          valid = false;
        }
      });
      if (!valid) return;

      const btn = $("button[type=submit]", form);
      btn.classList.add("loading");
      if (formStatus) formStatus.textContent = "";

      try {
        await new Promise((res) => setTimeout(res, 1500));
        btn.classList.remove("loading");
        btn.classList.add("success");
        btn.textContent = "Message Sent ✓";
        if (formStatus) {
          formStatus.textContent = "Thank you! We'll be in touch shortly.";
          formStatus.style.color = "#22c55e";
        }
        form.reset();
        setTimeout(() => {
          btn.classList.remove("success");
          btn.textContent = "Send Message";
        }, 4000);
      } catch (_) {
        btn.classList.remove("loading");
        btn.classList.add("error");
        btn.textContent = "Failed — Try Again";
        setTimeout(() => {
          btn.classList.remove("error");
          btn.textContent = "Send Message";
        }, 3000);
      }
    });

    $$("input, textarea", form).forEach((f) =>
      f.addEventListener("input", () => f.classList.remove("invalid"))
    );
  }

  /* ── SMOOTH SCROLL ──────────────────────────────────────────── */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const navH =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue("--nav-h")
        ) || 70;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 12;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  /* ── ACTIVE NAV LINK ON SCROLL ──────────────────────────────── */
  const navLinkEls = $$(".nav-links a");
  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const id = e.target.getAttribute("id");
          navLinkEls.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === `#${id}`)
          );
        }
      });
    },
    { threshold: 0.35 }
  );
  $$("section[id]").forEach((s) => activeObserver.observe(s));

  const activeStyle = document.createElement("style");
  activeStyle.textContent = `
    .nav-links a.active { color: var(--gold) !important; }
    .nav-links a.active::after { transform: scaleX(1) !important; }
  `;
  document.head.appendChild(activeStyle);

  /* ── CANVAS PARTICLES (hero) ────────────────────────────────── */
  (function heroParticles() {
    const hero = $(".hero");
    if (!hero) return;
    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0.3";
    hero.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    let W, H, particles = [];
    const GOLD = "rgba(184,136,42,";

    const resize = () => {
      W = canvas.width = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    };

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.r  = Math.random() * 1.4 + 0.3;
        this.a  = Math.random() * 0.6 + 0.15;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = -(Math.random() * 0.35 + 0.1);
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.a -= 0.0012;
        if (this.a <= 0 || this.y < -5) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = GOLD + this.a + ")";
        ctx.fill();
      }
    }

    resize();
    particles = Array.from({ length: 70 }, () => new Particle());
    window.addEventListener("resize", resize, { passive: true });

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    };
    animate();
  })();

  /* ── CURSOR GLOW (desktop only) ─────────────────────────────── */
  (function cursorGlow() {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const glow = document.createElement("div");
    glow.style.cssText = `
      position:fixed;width:280px;height:280px;border-radius:50%;
      background:radial-gradient(circle,rgba(184,136,42,0.07) 0%,transparent 70%);
      pointer-events:none;z-index:9999;transform:translate(-50%,-50%);
      transition:left 0.1s ease,top 0.1s ease;left:-400px;top:-400px;
    `;
    document.body.appendChild(glow);
    document.addEventListener("mousemove", (e) => {
      glow.style.left = e.clientX + "px";
      glow.style.top  = e.clientY + "px";
    });
  })();

})();
