// ===========================
// MOBILE MENU TOGGLE
// ===========================
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
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

      navLinks.classList.remove("active");
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

    statusMsg.innerText = "Sending...";
    statusMsg.style.color = "#333";

    if (!name || !email || !message) {
      statusMsg.innerText = "All fields are required!";
      statusMsg.style.color = "red";
      return;
    }

    try {
      const response = await fetch("/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, message })
      });

      const data = await response.json();

      if (data.success) {
        statusMsg.innerText = "Message sent successfully!";
        statusMsg.style.color = "green";
        contactForm.reset();
      } else {
        statusMsg.innerText = "Failed to send message. Try again.";
        statusMsg.style.color = "red";
      }
    } catch (error) {
      console.error(error);
      statusMsg.innerText = "Server error. Try again later.";
      statusMsg.style.color = "red";
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

document.getElementById('count');
let count = 0;
let target = 1000;
let interval = setInterval(() => {
  count++
  document.getElementById('count').textContent = `${count}+`
  if (count == target){
    clearInterval(interval);
  }
}, 0.1)


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

let contactForm = document.querySelector('.contact')
function