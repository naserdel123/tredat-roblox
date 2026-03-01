// إضافة تأثيرات إضافية عند التمرير
document.addEventListener('DOMContentLoaded', () => {
  // تأثير ظهور البطاقات عند التمرير
  const cards = document.querySelectorAll('.post-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'cardAppear 0.8s ease-out';
      }
    });
  }, { threshold: 0.1 });
  
  cards.forEach(card => observer.observe(card));

  // إضافة تأثير حركة للخلفية بناءً على حركة الماوس (Parallax خفيف)
  document.body.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    document.body.style.backgroundPosition = `${x * 20}px ${y * 20}px`;
  });
});
