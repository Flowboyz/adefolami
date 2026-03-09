  (function(){
    // reveal on scroll for elements with .reveal and images
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },{threshold: 0.12});

    // observe existing .reveal elements
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // add a helper class for images and observe them so they animate when entering viewport
    document.querySelectorAll('img').forEach(img => {
      img.classList.add('reveal-img');
      io.observe(img);
    });
  })();