document.addEventListener("DOMContentLoaded", () => {
  // --- SELECTORS ---
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const scrollTopButton = document.getElementById("scroll-top");
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mainNavLinks = document.getElementById("main-nav-links");
  const progressBar = document.getElementById("progress-bar");
  const footerElement = document.querySelector("footer");
  const typeWriterElement = document.getElementById("typewriter");

  // --- UTILITY FUNCTIONS ---
  const throttle = (func, limit) => {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  // --- THEME ---
  function initTheme() {
    const setTheme = (theme) => {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
      themeIcon.classList.remove("fa-moon", "fa-sun");
      themeIcon.classList.add(theme === "dark" ? "fa-sun" : "fa-moon");
    };

    const savedTheme =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    setTheme(savedTheme);

    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      setTheme(currentTheme === "dark" ? "light" : "dark");

      // Add rotation animation
      themeIcon.classList.add("is-rotating");
      themeIcon.addEventListener(
        "transitionend",
        () => {
          themeIcon.classList.remove("is-rotating");
        },
        { once: true }
      );
    });
  }

  // --- SCROLL HANDLING & PROGRESS BAR ---
  function initScrollHandling() {
    const updateProgressBar = () => {
      const scrollY = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      progressBar.style.width = `${scrollPercent}%`;
    };

    const toggleScrollTopButton = () => {
      const shouldBeVisible = window.scrollY > 300;
      const isVisible = parseFloat(scrollTopButton.style.opacity || "0") > 0;
      if (shouldBeVisible && !isVisible) {
        scrollTopButton.style.display = "block";
        requestAnimationFrame(() => (scrollTopButton.style.opacity = "1"));
      } else if (!shouldBeVisible && isVisible) {
        scrollTopButton.style.opacity = "0";
        scrollTopButton.addEventListener(
          "transitionend",
          () => {
            if (window.scrollY <= 300) scrollTopButton.style.display = "none";
          },
          { once: true }
        );
      }
    };

    const handleScroll = () => {
      updateProgressBar();
      toggleScrollTopButton();
    };

    window.addEventListener("scroll", throttle(handleScroll, 100), {
      passive: true,
    });
    scrollTopButton.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
    handleScroll(); // Initial call
  }

  // --- MOBILE MENU ---
  function initMobileMenu() {
    const mobileMenuIcon = mobileMenuToggle.querySelector("i");
    mobileMenuToggle.addEventListener("click", () => {
      const isExpanded = mainNavLinks.classList.toggle("mobile-menu-active");
      mobileMenuToggle.setAttribute("aria-expanded", isExpanded);
      mobileMenuIcon.classList.toggle("fa-bars", !isExpanded);
      mobileMenuIcon.classList.toggle("fa-times", isExpanded);
    });

    mainNavLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (mainNavLinks.classList.contains("mobile-menu-active"))
          mobileMenuToggle.click();
      });
    });

    document.addEventListener("click", (event) => {
      if (
        !mainNavLinks.contains(event.target) &&
        !mobileMenuToggle.contains(event.target) &&
        mainNavLinks.classList.contains("mobile-menu-active")
      ) {
        mobileMenuToggle.click();
      }
    });
  }

  // --- ANIMATIONS & INTERSECTION OBSERVERS ---
  function initAnimations() {
    // Generic reveal-on-scroll
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // Stagger animations for a smoother effect
            entry.target.style.transitionDelay = `${index * 50}ms`;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document
      .querySelectorAll(".reveal-on-scroll")
      .forEach((el) => revealObserver.observe(el));

    // Footer animation
    const footerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          footerElement.classList.toggle("animate-in", entry.isIntersecting)
        );
      },
      { threshold: 0.1 }
    );
    if (footerElement) footerObserver.observe(footerElement);

    // Header typewriter animation
    const headerObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const h2 = entry.target;
            const originalText = h2.textContent.trim();
            if (originalText && !h2.querySelector(".h2-typewriter-text")) {
              const textSpan = document.createElement("span");
              textSpan.className = "h2-typewriter-text";
              h2.innerHTML = "";
              h2.appendChild(textSpan);

              let i = 0;
              const type = () => {
                if (i < originalText.length) {
                  textSpan.textContent += originalText.charAt(i);
                  i++;
                  setTimeout(type, 20);
                } else {
                  textSpan.classList.add("typing-done");
                }
              };
              type();
            }
            observer.unobserve(h2);
          }
        });
      },
      { threshold: 0.6 }
    );
    document
      .querySelectorAll("section h2")
      .forEach((h2) => headerObserver.observe(h2));
  }

  // --- DYNAMIC CONTENT & COMPONENTS ---
  function initComponents() {
    // Hero typewriter
    const typeHero = () => {
      const words = ["Software Engineer", "Python Developer", "Data Analyst"];
      let wordIndex = 0,
        charIndex = 0,
        isDeleting = false;

      function type() {
        if (!typeWriterElement) return;
        const currentWord = words[wordIndex % words.length];
        let typeSpeed = isDeleting ? 30 : 60;
        typeWriterElement.textContent = currentWord.substring(0, charIndex);

        if (!isDeleting && charIndex === currentWord.length) {
          typeSpeed = 1200;
          isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
          isDeleting = false;
          wordIndex++;
          typeSpeed = 250;
        }
        charIndex += isDeleting ? -1 : 1;
        setTimeout(type, typeSpeed);
      }
      setTimeout(type, 700); // Slight delay for page load
    };
    typeHero();

    // Random Quote
    const displayRandomQuote = () => {
      const quotes = [
        {
          text: "Talk is cheap. Show me the code.",
          author: "Linus Torvalds",
        },
        {
          text: "Programs must be written for people to read, and only incidentally for machines to execute.",
          author: "Harold Abelson",
        },
        {
          text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
          author: "Martin Fowler",
        },
        {
          text: "The function of good software is to make the complex appear to be simple.",
          author: "Grady Booch",
        },
        {
          text: "Code is like humor. When you have to explain it, it's bad.",
          author: "Cory House",
        },
      ];
      const quoteTextEl = document.getElementById("quote-text-content");
      const quoteAuthorEl = document.getElementById("quote-author-content");
      if (quoteTextEl && quoteAuthorEl) {
        const { text, author } =
          quotes[Math.floor(Math.random() * quotes.length)];
        quoteTextEl.textContent = `“${text}”`;
        quoteAuthorEl.textContent = author;
      }
    };
    displayRandomQuote();

    // Set current year in footer
    document.getElementById("current-year").textContent =
      new Date().getFullYear();

    // Project Tabs
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContentPanels = document.querySelectorAll(".tab-content");
    if (tabButtons.length > 0) {
      tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
          tabButtons.forEach((btn) => btn.classList.remove("active"));
          tabContentPanels.forEach((panel) => panel.classList.remove("active"));
          button.classList.add("active");
          const targetPanel = document.querySelector(button.dataset.tabTarget);
          if (targetPanel) targetPanel.classList.add("active");
        });
      });
    }
  }

  // --- SCROLLSPY for NAV HIGHLIGHTING ---
  function initScrollSpy() {
    const sections = Array.from(document.querySelectorAll("main section[id]"));
    const navLinks = document.querySelectorAll(".nav-links a[href^='#']");
    if (sections.length === 0 || navLinks.length === 0) return;

    const onScroll = () => {
      const scrollPosition = window.scrollY;
      const offset = 150; // Activation offset from top

      let activeSectionId = null;
      sections.forEach((section) => {
        if (section.offsetTop <= scrollPosition + offset) {
          activeSectionId = section.id;
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove("active-nav-link");
        if (link.getAttribute("href") === `#${activeSectionId}`) {
          link.classList.add("active-nav-link");
        }
      });
    };

    window.addEventListener("scroll", throttle(onScroll, 150), {
      passive: true,
    });
    onScroll(); // Initial call
  }

  // --- APP INITIALIZATION ---
  function run() {
    document.body.classList.add("page-loaded");
    initTheme();
    initScrollHandling();
    initMobileMenu();
    initAnimations();
    initComponents();
    initScrollSpy();
  }

  run();
});
