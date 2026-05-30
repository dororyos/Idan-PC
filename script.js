const BUSINESS_PHONE = "972544411665";
const BUSINESS_EMAIL = "lior@my365.co.il";

const contactForm = document.getElementById("contactForm");
const formFeedback = document.getElementById("formFeedback");
const whatsappLinks = document.querySelectorAll(".whatsapp-link");
const revealElements = document.querySelectorAll(".reveal");
const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.getElementById("siteNav");
const menuBackdrop = document.querySelector(".menu-backdrop");
const hashLinks = document.querySelectorAll('a[href^="#"]');
const accessibilityTrigger = document.getElementById("accessibilityTrigger");
const accessibilityPanel = document.getElementById("accessibilityPanel");
const accessibilityClose = document.getElementById("accessibilityClose");
const accessibilityButtons = document.querySelectorAll(".a11y-option");
const THANK_YOU_PAGE = "thank-you.html";
const ACCESSIBILITY_STORAGE_KEY = "idan-computers-accessibility";
window.dataLayer = window.dataLayer || [];

let lastAccessibilityTrigger = null;

const accessibilityState = {
  fontSize: "normal",
  highContrast: false,
  underlineLinks: false,
  readableFont: false,
  lineSpacing: false,
  pauseAnimations: false
};

function applyAccessibilityState() {
  document.body.classList.toggle("a11y-font-large", accessibilityState.fontSize === "large");
  document.body.classList.toggle("a11y-font-xlarge", accessibilityState.fontSize === "xlarge");
  document.body.classList.toggle("a11y-high-contrast", accessibilityState.highContrast);
  document.body.classList.toggle("a11y-underline-links", accessibilityState.underlineLinks);
  document.body.classList.toggle("a11y-readable-font", accessibilityState.readableFont);
  document.body.classList.toggle("a11y-line-spacing", accessibilityState.lineSpacing);
  document.body.classList.toggle("a11y-pause-animations", accessibilityState.pauseAnimations);

  accessibilityButtons.forEach((button) => {
    const toggleKey = button.dataset.a11yToggle;

    if (!toggleKey) {
      return;
    }

    const stateKey = toggleKey.replace(/-([a-z])/g, (_match, char) => char.toUpperCase());
    button.setAttribute("aria-pressed", String(Boolean(accessibilityState[stateKey])));
  });
}

function saveAccessibilityState() {
  window.localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(accessibilityState));
}

function loadAccessibilityState() {
  try {
    const savedState = window.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);

    if (!savedState) {
      return;
    }

    const parsedState = JSON.parse(savedState);

    Object.assign(accessibilityState, parsedState);
  } catch (_error) {
    window.localStorage.removeItem(ACCESSIBILITY_STORAGE_KEY);
  }
}

function setAccessibilityOpen(isOpen) {
  if (!accessibilityTrigger || !accessibilityPanel) {
    return;
  }

  const wasOpen = !accessibilityPanel.hidden;

  if (isOpen) {
    lastAccessibilityTrigger = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : accessibilityTrigger;
  }

  accessibilityPanel.hidden = !isOpen;
  accessibilityTrigger.setAttribute("aria-expanded", String(isOpen));

  if (isOpen) {
    const firstControl = accessibilityPanel.querySelector("button");
    firstControl?.focus();
  } else if (wasOpen && lastAccessibilityTrigger) {
    lastAccessibilityTrigger.focus();
  }
}

function resetAccessibilityState() {
  accessibilityState.fontSize = "normal";
  accessibilityState.highContrast = false;
  accessibilityState.underlineLinks = false;
  accessibilityState.readableFont = false;
  accessibilityState.lineSpacing = false;
  accessibilityState.pauseAnimations = false;
}

loadAccessibilityState();
applyAccessibilityState();

if (accessibilityTrigger && accessibilityPanel) {
  accessibilityTrigger.addEventListener("click", () => {
    const isOpen = accessibilityTrigger.getAttribute("aria-expanded") === "true";
    setAccessibilityOpen(!isOpen);
  });

  accessibilityClose?.addEventListener("click", () => {
    setAccessibilityOpen(false);
  });

  accessibilityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.a11yAction;
      const toggleKey = button.dataset.a11yToggle;

      if (action === "font-up") {
        accessibilityState.fontSize = accessibilityState.fontSize === "normal"
          ? "large"
          : "xlarge";
      } else if (action === "font-down") {
        accessibilityState.fontSize = accessibilityState.fontSize === "xlarge"
          ? "large"
          : "normal";
      } else if (action === "reset") {
        resetAccessibilityState();
      } else if (toggleKey) {
        const stateKey = toggleKey.replace(/-([a-z])/g, (_match, char) => char.toUpperCase());
        accessibilityState[stateKey] = !accessibilityState[stateKey];
      }

      applyAccessibilityState();
      saveAccessibilityState();
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (
      target instanceof Node &&
      !accessibilityPanel.contains(target) &&
      !accessibilityTrigger.contains(target)
    ) {
      setAccessibilityOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setAccessibilityOpen(false);
    }
  });
}

function setMenuOpen(isOpen) {
  if (!siteHeader || !menuToggle) {
    return;
  }

  siteHeader.classList.toggle("menu-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));

  if (isOpen) {
    siteNav?.querySelector("a")?.focus();
  }
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteHeader?.classList.contains("menu-open");
    setMenuOpen(!isOpen);
  });

  document.addEventListener("click", (event) => {
    if (!siteHeader || window.innerWidth > 760) {
      return;
    }

    const target = event.target;

    if (target instanceof Node && !siteHeader.contains(target)) {
      setMenuOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      setMenuOpen(false);
    }
  });
}

menuBackdrop?.addEventListener("click", () => {
  setMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  if (siteHeader?.classList.contains("menu-open")) {
    setMenuOpen(false);
    menuToggle?.focus();
  }
});

whatsappLinks.forEach((link) => {
  const linkMessage = link.dataset.whatsappText?.trim() || "שלום, אשמח לקבל פרטים על שירותי עידן המחשבים.";
  const url = new URL(`https://wa.me/${BUSINESS_PHONE}`);
  url.searchParams.set("text", linkMessage);
  link.href = url.toString();
});

function redirectToThankYou(source, action = "whatsapp") {
  const thankYouUrl = new URL(THANK_YOU_PAGE, window.location.href);
  thankYouUrl.searchParams.set("source", source);
  thankYouUrl.searchParams.set("action", action);
  window.location.href = thankYouUrl.toString();
}

function pushLeadEvent(source, action, details = {}) {
  window.dataLayer.push({
    event: "lead",
    lead_source: source,
    lead_action: action,
    lead_destination: "whatsapp",
    ...details
  });
}

function openEmailCopy(subject, body) {
  const emailUrl = new URL(`mailto:${BUSINESS_EMAIL}`);
  emailUrl.searchParams.set("subject", subject);
  emailUrl.searchParams.set("body", body);
  window.open(emailUrl.toString(), "_blank", "noopener");
}

function openWhatsappLead(message, source) {
  pushLeadEvent(source, "whatsapp_click", {
    has_custom_message: message.trim() !== "שלום, אשמח לקבל פרטים על שירותי עידן המחשבים."
  });
  const whatsappUrl = new URL(`https://wa.me/${BUSINESS_PHONE}`);
  whatsappUrl.searchParams.set("text", message);
  window.open(whatsappUrl.toString(), "_blank", "noopener");
  openEmailCopy(
    `עותק פנייה בווטסאפ - ${source}`,
    [
      "נוצרה פנייה דרך ווטסאפ באתר עידן המחשבים.",
      "",
      `מקור הפנייה: ${source}`,
      `תאריך ושעה: ${new Date().toLocaleString("he-IL")}`,
      "",
      "תוכן ההודעה:",
      message
    ].join("\n")
  );
  window.setTimeout(() => {
    redirectToThankYou(source, "whatsapp");
  }, 220);
}

whatsappLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const source = link.dataset.leadSource || "whatsapp-link";
    const message = link.dataset.whatsappText?.trim() || "שלום, אשמח לקבל פרטים על שירותי עידן המחשבים.";
    openWhatsappLead(message, source);
  });
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

function getScrollOffset() {
  const headerHeight = siteHeader?.offsetHeight || 0;
  const extraOffset = window.innerWidth <= 760 ? 28 : 20;
  return headerHeight + extraOffset;
}

hashLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const targetElement = document.querySelector(targetId);

    if (!targetElement) {
      return;
    }

    event.preventDefault();

    if (window.innerWidth <= 760 && siteHeader?.classList.contains("menu-open")) {
      setMenuOpen(false);
    }

    const targetTop = targetElement.getBoundingClientRect().top + window.scrollY - getScrollOffset();

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth"
    });
  });
});

siteNav?.querySelectorAll('a[target="_blank"]').forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 760) {
      setMenuOpen(false);
    }
  });
});

function setFeedback(message, isError = false) {
  if (!formFeedback) {
    return;
  }

  formFeedback.textContent = message;
  formFeedback.classList.toggle("is-error", isError);
}

function buildWhatsappBody({ name, email, phone, message }) {
  const intro = message || "שלום, אשמח לקבל פרטים על שירותי עידן המחשבים.";

  return [
    intro,
    `שם: ${name}`,
    `מייל: ${email}`,
    `טלפון: ${phone}`,
    `פירוט: ${message || "לא נכתבה הודעה נוספת."}`
  ].join("\n\n");
}

if (contactForm) {
  contactForm.querySelectorAll("[aria-required='true']").forEach((field) => {
    field.addEventListener("input", () => {
      field.setAttribute("aria-invalid", String(!field.value.trim()));
    });
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    setFeedback("");

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const requiredFields = [
      contactForm.elements.namedItem("name"),
      contactForm.elements.namedItem("email"),
      contactForm.elements.namedItem("phone")
    ].filter((field) => field instanceof HTMLElement);

    requiredFields.forEach((field) => {
      field.setAttribute("aria-invalid", String(!field.value.trim()));
    });

    if (!name || !email || !phone) {
      setFeedback("נא למלא שם, מייל וטלפון כדי שנוכל לחזור אליכם.", true);
      requiredFields.find((field) => field.getAttribute("aria-invalid") === "true")?.focus();
      return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalLabel = submitButton?.textContent || "";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "שולחים...";
    }

    try {
      pushLeadEvent("contact-form", "form_submit", {
        has_message: Boolean(message),
        form_name: name,
        form_email: email,
        form_phone: phone
      });
      openWhatsappLead(buildWhatsappBody({ name, email, phone, message }), "contact-form");
      contactForm.reset();
      setFeedback("נפתח חלון ווטסאפ עם כל פרטי הפנייה, ומיד תעברו לעמוד תודה.");
    } catch (_error) {
      setFeedback("לא הצלחנו לשלוח כרגע. אפשר לפנות ישירות בווטסאפ או בטלפון.", true);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
      }
    }
  });
}
