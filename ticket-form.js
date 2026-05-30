const ticketForm = document.getElementById("ticketForm");
const canvas = document.getElementById("signatureCanvas");
const clearButton = document.getElementById("clearSignature");
const saveButton = document.getElementById("saveSignature");
const printButton = document.getElementById("printForm");
const signatureBase64 = document.getElementById("signatureBase64");
const formStatus = document.getElementById("formStatus");
const ticketDate = document.getElementById("ticketDate");
const currentTime = document.getElementById("currentTime");
const currentDate = document.getElementById("currentDate");
const BUSINESS_EMAIL = "lior@my365.co.il";

let signaturePad = null;

function setStatus(message, isError = false) {
  formStatus.textContent = message;
  formStatus.classList.toggle("is-error", isError);
}

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function setCurrentDateTime() {
  const now = new Date();
  const isoDate = now.toISOString().slice(0, 10);
  const displayDate = `${padNumber(now.getDate())}.${padNumber(now.getMonth() + 1)}.${now.getFullYear()}`;
  const displayTime = `${padNumber(now.getHours())}:${padNumber(now.getMinutes())}`;

  currentDate.textContent = displayDate;
  currentTime.textContent = displayTime;

  if (ticketDate && !ticketDate.value) {
    ticketDate.value = isoDate;
  }
}

function resizeCanvas() {
  if (!canvas) {
    return;
  }

  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  const canvasData = signaturePad && !signaturePad.isEmpty()
    ? signaturePad.toData()
    : null;

  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.getContext("2d").scale(ratio, ratio);

  if (signaturePad) {
    signaturePad.clear();

    if (canvasData) {
      signaturePad.fromData(canvasData);
    }
  }
}

function updateSignatureBase64() {
  if (!signaturePad || signaturePad.isEmpty()) {
    signatureBase64.value = "";
    return "";
  }

  const base64Image = signaturePad.toDataURL("image/png");
  signatureBase64.value = base64Image;
  return base64Image;
}

function downloadSignaturePng() {
  const base64Image = updateSignatureBase64();

  if (!base64Image) {
    setStatus("יש לחתום לפני שמירת PNG.", true);
    return;
  }

  const downloadLink = document.createElement("a");
  downloadLink.href = base64Image;
  downloadLink.download = `idan-pc-signature-${ticketDate?.value || "ticket"}.png`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();

  setStatus("החתימה נשמרה כ-PNG וה-Base64 עודכן בטופס.");
}

function getFormValue(name) {
  return String(new FormData(ticketForm).get(name) || "").trim();
}

function buildTicketEmailBody() {
  const closedValue = getFormValue("ticketClosed") === "yes" ? "כן" : "לא";

  return [
    "טופס פתיחת תקלה חתום - עידן המחשבים",
    "",
    `תאריך הטופס: ${getFormValue("ticketDate")}`,
    `שם עסק/לקוח: ${getFormValue("clientName")}`,
    `נספח לחשבונית מס מספר: ${getFormValue("invoiceNumber") || "לא צוין"}`,
    `שם טכנאי מבצע: ${getFormValue("technicianName") || "לא צוין"}`,
    `שעות עבודה: ${getFormValue("workHours") || "לא צוין"}`,
    `סגירת תקלה: ${closedValue}`,
    "",
    "הערות:",
    getFormValue("notes") || "לא צוינו הערות",
    "",
    "פירוט העבודה/ביצוע:",
    getFormValue("workDetails") || "לא צוין פירוט עבודה",
    "",
    "פירוט הציוד:",
    getFormValue("equipmentDetails") || "לא צוין פירוט ציוד",
    "",
    "חתימת לקוח Base64:",
    signatureBase64.value
  ].join("\n");
}

async function copySignatureToClipboard() {
  if (!navigator.clipboard || !signatureBase64.value) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(signatureBase64.value);
    return true;
  } catch (_error) {
    return false;
  }
}

async function openTicketEmail() {
  const emailUrl = new URL(`mailto:${BUSINESS_EMAIL}`);
  const body = buildTicketEmailBody();
  emailUrl.searchParams.set("subject", `טופס פתיחת תקלה חתום - ${getFormValue("clientName") || "לקוח"}`);
  emailUrl.searchParams.set("body", body);

  if (emailUrl.toString().length > 1800 && navigator.clipboard) {
    await navigator.clipboard.writeText(body);
    emailUrl.searchParams.set(
      "body",
      "טופס פתיחת התקלה המלא והחתימה הועתקו ללוח. נא להדביק את התוכן בגוף המייל."
    );
  }

  window.open(emailUrl.toString(), "_blank", "noopener");
}

function initSignaturePad() {
  if (!canvas || typeof SignaturePad === "undefined") {
    setStatus("ספריית החתימה לא נטענה. בדקו חיבור אינטרנט או את קישור הספרייה.", true);
    return;
  }

  signaturePad = new SignaturePad(canvas, {
    backgroundColor: "rgb(255, 255, 255)",
    penColor: "rgb(39, 48, 58)",
    minWidth: 0.8,
    maxWidth: 2.2
  });

  resizeCanvas();
  signaturePad.addEventListener("endStroke", updateSignatureBase64);
}

setCurrentDateTime();
initSignaturePad();

window.addEventListener("resize", resizeCanvas);

clearButton?.addEventListener("click", () => {
  signaturePad?.clear();
  signatureBase64.value = "";
  setStatus("החתימה נוקתה.");
});

saveButton?.addEventListener("click", downloadSignaturePng);

printButton?.addEventListener("click", () => {
  updateSignatureBase64();
  window.print();
});

ticketForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!ticketForm.reportValidity()) {
    setStatus("נא למלא את שדות החובה לפני שמירת הטופס.", true);
    return;
  }

  if (!signaturePad || signaturePad.isEmpty()) {
    setStatus("נא להוסיף חתימת לקוח לפני שמירת הטופס.", true);
    canvas?.focus();
    return;
  }

  updateSignatureBase64();
  const copied = await copySignatureToClipboard();
  await openTicketEmail();
  setStatus(copied
    ? "נפתחה טיוטת מייל לשליחת הטופס. חתימת Base64 הועתקה גם ללוח."
    : "נפתחה טיוטת מייל לשליחת הטופס. החתימה זמינה בשדה Base64.");
});
