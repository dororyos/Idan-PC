const BUSINESS_PHONE = "972544411665";

const contactForm = document.getElementById("contactForm");
const formFeedback = document.getElementById("formFeedback");
const whatsappLinks = document.querySelectorAll(".whatsapp-link");
const revealElements = document.querySelectorAll(".reveal");
const siteHeader = document.querySelector(".site-header");
const hashLinks = document.querySelectorAll('a[href^="#"]');
const THANK_YOU_PAGE = "thank-you.html";
window.dataLayer = window.dataLayer || [];

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

function openWhatsappLead(message, source) {
  pushLeadEvent(source, "whatsapp_click", {
    has_custom_message: message.trim() !== "שלום, אשמח לקבל פרטים על שירותי עידן המחשבים."
  });
  const whatsappUrl = new URL(`https://wa.me/${BUSINESS_PHONE}`);
  whatsappUrl.searchParams.set("text", message);
  window.open(whatsappUrl.toString(), "_blank", "noopener");
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

    const targetTop = targetElement.getBoundingClientRect().top + window.scrollY - getScrollOffset();

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth"
    });
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
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    setFeedback("");

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !phone) {
      setFeedback("נא למלא שם, מייל וטלפון כדי שנוכל לחזור אליכם.", true);
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
