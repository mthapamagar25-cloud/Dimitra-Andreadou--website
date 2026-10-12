/* =====================================================================
   Dimitra Andreadou · website behaviour (vanilla JavaScript)
   ---------------------------------------------------------------------
   CONTACT FORM: this site has no server of its own. To receive form
   enquiries by email, create a free form at a form service (for example
   Formspree or Web3Forms) and paste its address below. Until then, the
   form checks the fields and offers to open a ready-written email.
   ===================================================================== */
const FORM_ENDPOINT = ""; // e.g. "https://formspree.io/f/xxxxxxx"
const CONTACT_EMAIL = "dimitra.andreadou@praxis-elf.ch";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Text used by scripts, in both languages ---------- */
  const TEXT = {
    de: {
      title: "Dimitra Andreadou · Kinderphysiotherapie Zürich-Oerlikon",
      menuOpen: "Menü öffnen", menuClose: "Menü schliessen",
      nameReq: "Bitte geben Sie Ihren Namen ein.",
      emailReq: "Bitte geben Sie Ihre E-Mail-Adresse ein.",
      emailBad: "Bitte prüfen Sie Ihre E-Mail-Adresse, z. B. name@beispiel.ch.",
      msgReq: "Bitte schreiben Sie kurz, worum es geht.",
      consentReq: "Bitte bestätigen Sie die Einwilligung zum Datenschutz.",
      fix: "Bitte prüfen Sie die markierten Felder.",
      sending: "Wird gesendet …",
      ok: "Vielen Dank! Ihre Anfrage ist eingegangen. Ich melde mich so bald wie möglich bei Ihnen.",
      fail: "Das Senden hat leider nicht geklappt. Bitte versuchen Sie es erneut oder schreiben Sie mir direkt per E-Mail.",
      demo: "Das Formular ist noch nicht mit einem Postfach verbunden, daher wurde nichts gesendet. Sie können Ihre Nachricht stattdessen als E-Mail verschicken:",
      demoBtn: "Als E-Mail öffnen",
      subject: "Anfrage Kinderphysiotherapie",
      labels: { name: "Name", email: "E-Mail", phone: "Telefon", age: "Alter des Kindes", topic: "Thema", contact: "Bevorzugte Kontaktart", message: "Nachricht" },
      copied: "Kopiert"
    },
    en: {
      title: "Dimitra Andreadou · Paediatric Physiotherapy Zurich-Oerlikon",
      menuOpen: "Open menu", menuClose: "Close menu",
      nameReq: "Please enter your name.",
      emailReq: "Please enter your email address.",
      emailBad: "Please check your email address, e.g. name@example.ch.",
      msgReq: "Please tell me briefly what it is about.",
      consentReq: "Please confirm your consent to the privacy policy.",
      fix: "Please check the highlighted fields.",
      sending: "Sending …",
      ok: "Thank you! Your enquiry has been received. I will get back to you as soon as possible.",
      fail: "Sorry, sending did not work. Please try again or contact me directly by email.",
      demo: "The form is not yet connected to an inbox, so nothing has been sent. You can send your message as an email instead:",
      demoBtn: "Open as email",
      subject: "Enquiry: paediatric physiotherapy",
      labels: { name: "Name", email: "Email", phone: "Phone", age: "Child’s age", topic: "Topic", contact: "Preferred contact", message: "Message" },
      copied: "Copied"
    }
  };
  let lang = "de";
  const t = key => TEXT[lang][key];

  /* ---------- 1. Language switch (German first, English second) ---------- */
  function setLanguage(next) {
    lang = next === "en" ? "en" : "de";
    root.lang = lang;
    document.title = t("title");
    $$("[data-set-lang]").forEach(btn => btn.setAttribute("aria-pressed", String(btn.dataset.setLang === lang)));
    $$("[data-ph-de]").forEach(el => { el.placeholder = lang === "de" ? el.dataset.phDe : el.dataset.phEn; });
    $$("option[data-de]").forEach(opt => { opt.textContent = opt.dataset[lang]; });
    clearFormMessages();
    try { localStorage.setItem("da-lang", lang); } catch (e) { /* storage unavailable */ }
    document.dispatchEvent(new CustomEvent("da:lang", { detail: lang }));
  }
  let savedLang = null;
  try { savedLang = localStorage.getItem("da-lang"); } catch (e) { /* storage unavailable */ }
  $$("[data-set-lang]").forEach(btn => btn.addEventListener("click", () => setLanguage(btn.dataset.setLang)));

  /* ---------- 2. Mobile navigation ---------- */
  const header = $("#site-header");
  const menuBtn = $("#menu-btn");
  const nav = $("#main-nav");
  function setMenu(open) {
    if (!nav || !menuBtn) return;
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    const label = $(".sr", menuBtn);
    if (label) label.innerHTML = `<span lang="de">${TEXT.de[open ? "menuClose" : "menuOpen"]}</span><span lang="en">${TEXT.en[open ? "menuClose" : "menuOpen"]}</span>`;
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
    $$("a", nav).forEach(a => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
    });
    document.addEventListener("click", e => {
      if (nav.classList.contains("open") && !header.contains(e.target)) setMenu(false);
    });
  }

  /* ---------- 3. Header state, back-to-top, active menu item ---------- */
  const toTop = $("#to-top");
  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (toTop) toTop.classList.toggle("show", y > 700);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const navLinks = $$(".main-nav a[href^='#']:not(.btn)");
  if ("IntersectionObserver" in window && navLinks.length) {
    const byId = new Map(navLinks.map(a => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const link = byId.get(entry.target.id);
        if (!link) return;
        navLinks.forEach(l => { l.classList.remove("active"); l.removeAttribute("aria-current"); });
        link.classList.add("active");
        link.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    byId.forEach((_, id) => { const section = document.getElementById(id); if (section) spy.observe(section); });
  }

  /* ---------- 4. Photos: show the real photo if present, else the placeholder ---------- */
  $$(".photo img").forEach(img => {
    const fig = img.closest(".photo");
    const markLoaded = () => fig && fig.classList.add("loaded");
    if (img.complete && img.naturalWidth > 0) markLoaded();
    else {
      img.addEventListener("load", markLoaded, { once: true });
      img.addEventListener("error", () => img.remove(), { once: true });
    }
  });

  /* ---------- 5. Accessible tabs (CV and treatment areas) ---------- */
  function setupTabs(tablist) {
    const tabs = $$("[role='tab']", tablist);
    if (!tabs.length) return;
    const select = (tab, focus) => {
      tabs.forEach(item => {
        const on = item === tab;
        item.setAttribute("aria-selected", String(on));
        item.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(item.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
      if (tablist.scrollWidth > tablist.clientWidth) tab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", e => {
        const keys = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 };
        if (!(e.key in keys)) return;
        e.preventDefault();
        select(tabs[(keys[e.key] + tabs.length) % tabs.length], true);
      });
    });
  }
  $$("[role='tablist']").forEach(setupTabs);

  /* ---------- 6. Show more / less toggles ---------- */
  const eduToggle = $("#edu-toggle");
  const eduList = $("#edu-list");
  if (eduToggle && eduList) {
    eduToggle.addEventListener("click", () => {
      const open = eduToggle.getAttribute("aria-expanded") !== "true";
      eduToggle.setAttribute("aria-expanded", String(open));
      eduList.classList.toggle("expanded", open);
    });
  }
  $$(".topic-toggle").forEach(btn => {
    const target = document.getElementById(btn.getAttribute("aria-controls"));
    if (!target) return;
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      target.hidden = !open;
    });
  });

  /* ---------- 7. FAQ accordion (one answer open at a time) ---------- */
  const faqButtons = $$(".faq-q");
  function setFaq(btn, open) {
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    btn.setAttribute("aria-expanded", String(open));
    if (panel) panel.hidden = !open;
    const item = btn.closest(".faq-item");
    if (item) item.classList.toggle("open", open);
  }
  faqButtons.forEach(btn => btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") !== "true";
    faqButtons.forEach(other => { if (other !== btn) setFaq(other, false); });
    setFaq(btn, open);
  }));

  /* ---------- 8. Copy phone / email ---------- */
  function selectText(el) {
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  $$(".copy").forEach(btn => btn.addEventListener("click", () => {
    const target = $(btn.dataset.copy);
    if (!target) return;
    const text = target.textContent.trim();
    const original = btn.innerHTML;
    const done = () => {
      btn.textContent = t("copied");
      window.setTimeout(() => { btn.innerHTML = original; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => selectText(target));
    } else {
      selectText(target);
    }
  }));

  /* ---------- 9. Contact form: validation and honest feedback ---------- */
  const form = $("#contact-form");
  const status = $("#form-status");
  function setStatus(kind, html) {
    if (!status) return;
    status.className = "form-status" + (kind ? " is-" + kind : "");
    status.innerHTML = html || "";
  }
  function fieldError(field, message) {
    const err = document.getElementById(field.id + "-err");
    field.setAttribute("aria-invalid", message ? "true" : "false");
    if (err) err.textContent = message || "";
  }
  function clearFormMessages() {
    if (!form) return;
    $$("[aria-invalid]", form).forEach(f => fieldError(f, ""));
    setStatus("", "");
  }
  function buildMailto(data) {
    const L = t("labels");
    const topicSel = form.elements.topic, contactSel = form.elements.preferred_contact;
    const lines = [
      `${L.name}: ${data.get("name")}`,
      `${L.email}: ${data.get("email")}`,
      data.get("phone") ? `${L.phone}: ${data.get("phone")}` : "",
      data.get("age") ? `${L.age}: ${data.get("age")}` : "",
      `${L.topic}: ${topicSel.options[topicSel.selectedIndex].text}`,
      `${L.contact}: ${contactSel.options[contactSel.selectedIndex].text}`,
      "",
      `${L.message}:`,
      data.get("message")
    ].filter((line, i) => line !== "" || i === 6);
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t("subject"))}&body=${encodeURIComponent(lines.join("\n"))}`;
  }
  function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (form.elements.website && form.elements.website.value) return; // hidden field filled: likely a spam bot

      const name = form.elements.name, email = form.elements.email, msg = form.elements.message, consent = form.elements.consent;
      let firstBad = null;
      const check = (field, message) => { fieldError(field, message); if (message && !firstBad) firstBad = field; };

      check(name, name.value.trim() ? "" : t("nameReq"));
      const ev = email.value.trim();
      check(email, !ev ? t("emailReq") : (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(ev) ? "" : t("emailBad")));
      check(msg, msg.value.trim() ? "" : t("msgReq"));
      check(consent, consent.checked ? "" : t("consentReq"));

      if (firstBad) { setStatus("error", escapeHtml(t("fix"))); firstBad.focus(); return; }

      const data = new FormData(form);
      if (!FORM_ENDPOINT) {
        // No inbox connected yet: say so clearly and offer a pre-filled email instead.
        setStatus("info", `<p>${escapeHtml(t("demo"))}</p><a class="btn btn-primary btn-sm" href="${buildMailto(data)}">${escapeHtml(t("demoBtn"))}</a>`);
        return;
      }

      setStatus("", escapeHtml(t("sending")));
      try {
        data.append("language", lang);
        const res = await fetch(FORM_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        setStatus("ok", escapeHtml(t("ok")));
      } catch (err) {
        setStatus("error", escapeHtml(t("fail")));
      }
    });
    $$("input, textarea", form).forEach(field => field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") fieldError(field, "");
    }));
    const consentBox = form.elements.consent;
    if (consentBox) consentBox.addEventListener("change", () => { if (consentBox.checked) fieldError(consentBox, ""); });
  }

  /* ---------- 10. Gentle reveal for content below the first screen ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    const candidates = $$(".section-head, .about-main > *, .about-side, .quote, .philo-points article, .treat-head, .svc, .step, .rx, .faq-intro, .faq-item, .topic, .loc, .feedback-inner, .contact-info, .contact-form, .ms-head, .ms-intro article, .ms-explorer, .ms-closing, .ms-refs");
    const fold = window.innerHeight;
    const pending = candidates.filter(el => el.getBoundingClientRect().top > fold);
    pending.forEach(el => el.classList.add("reveal-pending"));
    const revealer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("reveal-in");
        entry.target.classList.remove("reveal-pending");
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    pending.forEach(el => revealer.observe(el));
  }

  /* ---------- 11. Footer year + initial language ---------- */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
  setLanguage(savedLang || "de");
});

/* =====================================================================
   MILESTONES · "Ein kleiner Wegweiser für eine grosse Entwicklung"
   Text by Dimitra Andreadou (German) with English translation.
   To edit a stage, change its text below. Optional photo per stage:
   images/meilensteine/<id>.jpg (e.g. images/meilensteine/m04.jpg).
   ===================================================================== */
const MILESTONES = [
  { id: "m01", g: 0, n: "1", u: "m1", label: { de: "1. Monat", en: "Month 1" },
    title: { de: "Die ersten kleinen Bewegungen", en: "The first small movements" },
    sub: { de: "Ankommen, wahrnehmen und die Welt entdecken.", en: "Arriving, sensing and discovering the world." },
    observe: {
      de: ["In den ersten Lebenswochen gewöhnt sich dein Baby an seine neue Umgebung. Seine Bewegungen sind häufig noch spontan, unregelmässig und wenig gezielt. Es bewegt Arme und Beine, dreht den Kopf zur Seite und reagiert zunehmend auf Stimmen, Berührungen und Nähe.",
           "In Bauchlage kann es den Kopf möglicherweise für kurze Momente anheben oder zur Seite drehen. Die Hände sind oft noch geschlossen, können sich aber zwischendurch öffnen."],
      en: ["In the first weeks of life, your baby is getting used to a new environment. Movements are often still spontaneous, irregular and not very purposeful. Your baby moves their arms and legs, turns their head to the side and responds more and more to voices, touch and closeness.",
           "On their tummy, your baby may lift their head for brief moments or turn it to the side. The hands are often still closed but may open from time to time."] },
    support: {
      de: ["Halte dein Baby nah bei dir und sprich ruhig mit ihm.", "Biete kurze, beaufsichtigte Bauchlagephasen an, wenn es wach und aufmerksam ist.", "Lass deinem Baby Zeit, sich frei zu bewegen, ohne es in bestimmte Positionen zu bringen.", "Achte beim Schlafen auf eine sichere Schlafumgebung und lege dein Baby zum Schlafen auf den Rücken."],
      en: ["Hold your baby close and talk to them calmly.", "Offer short, supervised tummy-time sessions when your baby is awake and alert.", "Give your baby time to move freely, without placing them in particular positions.", "Make sure your baby sleeps in a safe sleep environment and always put them to sleep on their back."] },
    ask: {
      de: ["Sprich mit deiner Kinderärztin oder deinem Kinderarzt, wenn dein Baby sich auffallend wenig bewegt, ungewöhnlich steif oder schlaff wirkt oder den Kopf dauerhaft nur zu einer Seite dreht.", "Wenn dein Baby schwer weckbar ist, deutlich weniger trinkt oder sich sein Allgemeinzustand verändert, solltest du umgehend medizinischen Rat einholen."],
      en: ["Talk to your paediatrician if your baby moves noticeably little, seems unusually stiff or floppy, or always turns their head to one side only.", "If your baby is hard to wake, is drinking much less or their general condition changes, seek medical advice straight away."] },
    key: { de: "Dein Baby muss noch nichts leisten. Es darf erst einmal ankommen, wahrnehmen und sich in seinem eigenen Tempo entwickeln.", en: "Your baby doesn’t have to achieve anything yet. They can simply arrive, take things in and develop at their own pace." } },

  { id: "m02", g: 0, n: "2", u: "m", label: { de: "2. Monat", en: "Month 2" },
    title: { de: "Dein Baby wird wacher und aufmerksamer", en: "Your baby becomes more awake and alert" },
    sub: { de: "Erste bewusste Reaktionen und kleine gemeinsame Momente.", en: "First conscious reactions and small shared moments." },
    observe: {
      de: ["Dein Baby wird zunehmend aufmerksamer und beginnt, seine Umgebung bewusster wahrzunehmen. Es kann versuchen, den Kopf kurz anzuheben, Gesichter zu betrachten und auf vertraute Stimmen zu reagieren.",
           "Manche Babys beginnen in dieser Zeit zu lächeln, wenn sie ein Gesicht sehen oder angesprochen werden. Auch die Hände öffnen sich möglicherweise häufiger, und die Bewegungen von Armen und Beinen werden abwechslungsreicher."],
      en: ["Your baby is becoming more alert and starts to take in their surroundings more consciously. They may try to lift their head briefly, look at faces and respond to familiar voices.",
           "Some babies start to smile at this age when they see a face or are spoken to. The hands may also open more often, and arm and leg movements become more varied."] },
    support: {
      de: ["Suche den Blickkontakt, sprich mit deinem Baby und gib ihm Zeit zu reagieren.", "Biete mehrmals täglich kurze, beaufsichtigte Bauchlagephasen an, solange dein Baby wach ist.", "Bewege ein Spielzeug langsam im Blickfeld, ohne dein Baby zu überfordern.", "Wechsle beim Tragen und Füttern deine Position, soweit es für euch beide angenehm ist."],
      en: ["Make eye contact, talk to your baby and give them time to respond.", "Offer several short, supervised tummy-time sessions a day while your baby is awake.", "Move a toy slowly within your baby’s field of vision, without overwhelming them.", "Vary your position when carrying and feeding, as long as it is comfortable for you both."] },
    ask: {
      de: ["Wenn dein Baby kaum auf Stimmen oder Gesichter reagiert, sich auffallend wenig bewegt oder den Kopf beständig nur zu einer Seite dreht, kannst du dies bei der kinderärztlichen Kontrolle ansprechen.", "Auch bei ungewöhnlicher Steifheit oder ausgeprägter Schlaffheit ist eine fachliche Einschätzung sinnvoll."],
      en: ["If your baby hardly responds to voices or faces, moves noticeably little or always turns their head to one side only, you can mention this at the paediatric check-up.", "A professional assessment is also a good idea if your baby is unusually stiff or very floppy."] },
    key: { de: "Kleine Reaktionen sind bereits wichtige Schritte. Gib deinem Baby Zeit, dich und seine Umgebung kennenzulernen.", en: "Small reactions are already important steps. Give your baby time to get to know you and their surroundings." } },

  { id: "m03", g: 0, n: "3", u: "m", label: { de: "3. Monat", en: "Month 3" },
    title: { de: "Dein Baby entdeckt immer mehr", en: "Your baby discovers more and more" },
    sub: { de: "Mehr Bewegung, mehr Ausdruck und erste kleine Dialoge.", en: "More movement, more expression and first little conversations." },
    observe: {
      de: ["Die Kopfkontrolle entwickelt sich weiter. In Bauchlage kann dein Baby den Kopf zunehmend anheben und sich möglicherweise auf den Unterarmen abstützen. Es dreht den Kopf, um Gesichter oder Geräusche wahrzunehmen.",
           "Die Hände werden interessanter: Dein Baby betrachtet sie, führt sie zum Mund und beginnt vielleicht, gezielter nach Gegenständen zu greifen. Es kann lächeln, glucksen und auf deine Stimme mit Lauten oder Bewegungen reagieren."],
      en: ["Head control continues to develop. On their tummy, your baby can lift their head higher and may prop themselves up on their forearms. They turn their head towards faces or sounds.",
           "The hands become more interesting: your baby looks at them, brings them to their mouth and may begin to reach for objects more purposefully. They may smile, gurgle and respond to your voice with sounds or movements."] },
    support: {
      de: ["Verbringe Zeit mit deinem Baby auf einer sicheren Unterlage am Boden.", "Lege ein interessantes Spielzeug in erreichbare Nähe und gib ihm Zeit, darauf zu reagieren.", "Sprich mit deinem Baby und antworte auf seine Laute.", "Biete kurze Bauchlagephasen an und begleite sie mit deiner Stimme oder deinem Gesicht."],
      en: ["Spend time with your baby on a safe surface on the floor.", "Place an interesting toy within reach and give your baby time to respond to it.", "Talk to your baby and answer their sounds.", "Offer short tummy-time sessions and accompany them with your voice or your face."] },
    ask: {
      de: ["Wenn dein Baby den Kopf kaum anheben kann, sich deutlich weniger bewegt, dauerhaft eine Seite bevorzugt oder wenig auf Gesichter und Stimmen reagiert, sprich deine Beobachtungen bei der Kinderärztin oder beim Kinderarzt an.", "Das gilt auch bei auffälliger Steifheit, Schlaffheit oder einem Verlust bereits erworbener Fähigkeiten."],
      en: ["If your baby can barely lift their head, moves much less, always favours one side or responds little to faces and voices, mention your observations to your paediatrician.", "The same applies to noticeable stiffness, floppiness or the loss of skills your baby already had."] },
    key: { de: "Dein Baby lernt durch Wahrnehmen, Bewegen und den Austausch mit dir. Du musst nichts beschleunigen – deine Nähe und gemeinsame Zeit sind wertvoll.", en: "Your baby learns by sensing, moving and interacting with you. You don’t need to speed anything up – your closeness and time together are precious." } },

  { id: "m04", g: 0, n: "4", u: "m", label: { de: "4. Monat", en: "Month 4" },
    title: { de: "Mehr Kontrolle, mehr Ausdruck und gezielte Bewegungen", en: "More control, more expression and purposeful movements" },
    observe: {
      de: ["Die Kopfkontrolle wird zunehmend stabiler. In Bauchlage kann sich dein Baby möglicherweise besser auf den Unterarmen abstützen und den Oberkörper etwas anheben.",
           "Es beginnt vielleicht, gezielter nach Gegenständen zu greifen, die Hände zum Mund zu führen und die Beine aktiv zu bewegen. Manche Babys zeigen erste Ansätze, sich zur Seite zu drehen.",
           "Auch der soziale Austausch wird vielfältiger: Dein Baby lächelt, macht Laute und reagiert zunehmend auf deine Stimme."],
      en: ["Head control becomes increasingly stable. On their tummy, your baby may prop themselves up better on their forearms and lift their upper body a little.",
           "They may begin to reach for objects more purposefully, bring their hands to their mouth and move their legs actively. Some babies show the first signs of rolling to the side.",
           "Social interaction also becomes richer: your baby smiles, makes sounds and responds more and more to your voice."] },
    support: {
      de: ["Biete Spielzeug in unterschiedlichen Positionen an, damit dein Baby seinen Kopf drehen und die Hände einsetzen kann.", "Ermögliche freie Bewegung auf einer sicheren Unterlage.", "Sprich mit deinem Baby, ahme seine Laute nach und warte auf seine Reaktion.", "Unterstütze seine Bewegungsversuche, ohne es in eine Position zu bringen, die es noch nicht selbst erreichen kann."],
      en: ["Offer toys in different positions so that your baby can turn their head and use their hands.", "Allow free movement on a safe surface.", "Talk to your baby, copy their sounds and wait for their response.", "Support their attempts to move without placing them in a position they cannot yet reach on their own."] },
    ask: {
      de: ["Wenn dein Baby den Kopf dauerhaft schief hält, Bewegungen deutlich asymmetrisch ausführt, kaum nach Gegenständen greift oder auffallend wenig auf seine Umgebung reagiert, ist eine fachliche Einschätzung sinnvoll."],
      en: ["If your baby constantly holds their head tilted, moves in a clearly asymmetrical way, hardly reaches for objects or responds noticeably little to their surroundings, a professional assessment is a good idea."] },
    key: { de: "Mit jeder neuen Erfahrung entwickelt dein Baby mehr Kontrolle. Gib ihm Raum, seine Bewegungen selbst auszuprobieren.", en: "With every new experience, your baby gains more control. Give them room to try out their movements themselves." } },

  { id: "m05", g: 0, n: "5", u: "m", label: { de: "5. Monat", en: "Month 5" },
    title: { de: "Greifen, spielen, lachen", en: "Reaching, playing, laughing" },
    sub: { de: "Dein Baby wird aktiver und entdeckt neue Möglichkeiten.", en: "Your baby becomes more active and discovers new possibilities." },
    observe: {
      de: ["Dein Baby kann seinen Kopf zunehmend sicher halten und sich in Bauchlage möglicherweise besser abstützen. Es greift nach Gegenständen, führt sie zum Mund und entdeckt seine Hände und Füsse.",
           "Manche Babys beginnen, sich zur Seite oder vom Bauch auf den Rücken zu drehen. Andere üben diese Bewegungen noch.",
           "Das Zusammenspiel wird lebendiger: Dein Baby lacht vielleicht laut, quietscht, brabbelt und reagiert auf bekannte Stimmen."],
      en: ["Your baby can hold their head more and more securely and may prop themselves up better on their tummy. They reach for objects, bring them to their mouth and discover their hands and feet.",
           "Some babies begin to roll onto their side or from tummy to back. Others are still practising these movements.",
           "Interaction becomes livelier: your baby may laugh out loud, squeal, babble and respond to familiar voices."] },
    support: {
      de: ["Biete altersgerechte, sichere Gegenstände zum Greifen und Erkunden an.", "Lege Spielzeug seitlich neben dein Baby, damit es sich danach drehen und greifen kann.", "Ermögliche täglich freie Bewegung auf dem Boden.", "Achte darauf, dein Baby nicht unbeaufsichtigt auf erhöhten Flächen liegen zu lassen, sobald es sich aktiver bewegt."],
      en: ["Offer safe, age-appropriate objects to grasp and explore.", "Place toys to the side of your baby so they can turn and reach for them.", "Allow free movement on the floor every day.", "Never leave your baby unattended on raised surfaces once they start moving more actively."] },
    ask: {
      de: ["Wenn dein Baby den Kopf weiterhin nur schwer kontrollieren kann, sich auffallend wenig bewegt, deutlich eine Seite bevorzugt oder kaum nach Gegenständen greift, kannst du dies fachlich abklären lassen.", "Auch ungewöhnliche Steifheit oder Schlaffheit sollte angesprochen werden."],
      en: ["If your baby still finds it hard to control their head, moves noticeably little, clearly favours one side or hardly reaches for objects, you can have this checked by a professional.", "Unusual stiffness or floppiness should also be mentioned."] },
    key: { de: "Greifen, Drehen und Spielen entstehen Schritt für Schritt. Nicht alle Fähigkeiten entwickeln sich gleichzeitig.", en: "Reaching, rolling and playing develop step by step. Not all skills develop at the same time." } },

  { id: "m06", g: 0, n: "6", u: "m", label: { de: "6. Monat", en: "Month 6" },
    title: { de: "Drehen, entdecken, ausprobieren", en: "Rolling, discovering, trying things out" },
    sub: { de: "Dein Baby entwickelt mehr Kraft und Kontrolle.", en: "Your baby develops more strength and control." },
    observe: {
      de: ["Dein Baby bewegt sich zunehmend aktiver. Es kann sich möglicherweise vom Bauch auf den Rücken drehen oder beginnt, verschiedene Drehbewegungen auszuprobieren. In Bauchlage stützt es sich eventuell bereits auf die Hände und verlagert sein Gewicht.",
           "Es greift nach Gegenständen, führt sie zum Mund und entdeckt unterschiedliche Bewegungsmöglichkeiten. Manche Babys beginnen, Gegenstände von einer Hand in die andere zu geben.",
           "Auch die Kommunikation entwickelt sich weiter: Dein Baby macht unterschiedliche Laute und reagiert auf vertraute Menschen."],
      en: ["Your baby is moving more and more actively. They may roll from tummy to back or begin to try out different rolling movements. On their tummy, they may already push up on their hands and shift their weight.",
           "They reach for objects, bring them to their mouth and discover different ways of moving. Some babies begin to pass objects from one hand to the other.",
           "Communication develops further too: your baby makes different sounds and responds to familiar people."] },
    support: {
      de: ["Biete ausreichend Platz für freie Bewegung auf einer sicheren Unterlage.", "Platziere Spielzeug so, dass dein Baby sich danach ausstrecken und sein Gewicht verlagern kann.", "Lies kurze Bilderbücher vor und sprich über das, was ihr gemeinsam anschaut.", "Lass dein Baby Gegenstände mit den Händen erkunden, sofern sie sicher und altersgerecht sind."],
      en: ["Provide enough space for free movement on a safe surface.", "Place toys so that your baby can stretch towards them and shift their weight.", "Read short picture books and talk about what you are looking at together.", "Let your baby explore objects with their hands, as long as they are safe and age-appropriate."] },
    ask: {
      de: ["Wenn dein Baby seinen Kopf nur schwer kontrolliert, sich auffallend wenig bewegt, eine Seite deutlich bevorzugt oder kaum nach Gegenständen greift, solltest du deine Beobachtungen ansprechen."],
      en: ["If your baby finds it hard to control their head, moves noticeably little, clearly favours one side or hardly reaches for objects, you should mention your observations."] },
    note: { de: "Dass sich ein Baby mit sechs Monaten noch nicht in beide Richtungen dreht, ist für sich allein keine Diagnose. Entscheidend ist die gesamte Entwicklung.", en: "If a baby is not yet rolling in both directions at six months, this alone is not a diagnosis. What matters is their development as a whole." },
    key: { de: "Dein Baby sammelt Bewegungserfahrungen, aus denen nach und nach neue Fähigkeiten entstehen.", en: "Your baby is gathering movement experiences from which new skills gradually emerge." } },

  { id: "m07", g: 0, n: "7", u: "m", label: { de: "7. Monat", en: "Month 7" },
    title: { de: "Vom Liegen ins Leben", en: "From lying down to joining in" },
    observe: {
      de: ["Die Kontrolle über Kopf und Rumpf entwickelt sich weiter. Dein Baby kann möglicherweise bereits mit Unterstützung sitzen oder für kurze Zeit frei sitzen. Es dreht sich, verlagert sein Gewicht und versucht, Gegenstände aus unterschiedlichen Positionen zu erreichen.",
           "Manche Babys beginnen, sich auf dem Boden fortzubewegen oder den Vierfüsslerstand auszuprobieren. Andere beschäftigen sich noch mit Drehbewegungen und Gewichtsverlagerungen.",
           "Dein Baby reagiert zunehmend auf Stimmen, vertraute Personen und gemeinsame Spiele."],
      en: ["Control of the head and trunk continues to develop. Your baby may already sit with support or sit unsupported for short periods. They roll, shift their weight and try to reach objects from different positions.",
           "Some babies begin to move around on the floor or try out being on all fours. Others are still busy with rolling and shifting their weight.",
           "Your baby responds more and more to voices, familiar people and shared games."] },
    support: {
      de: ["Biete eine sichere Bodenfläche, auf der dein Baby seine Bewegungen selbst ausprobieren kann.", "Lege Spielzeug seitlich oder etwas ausserhalb der unmittelbaren Reichweite ab.", "Spiele einfache Wechselspiele, etwa mit einem Tuch oder einem Gegenstand, den du kurz versteckst.", "Gib deinem Baby Zeit, seine Positionen selbst zu verändern."],
      en: ["Provide a safe floor space where your baby can try out movements on their own.", "Place toys to the side or slightly out of immediate reach.", "Play simple turn-taking games, for example with a cloth or an object you briefly hide.", "Give your baby time to change position on their own."] },
    ask: {
      de: ["Wenn dein Baby den Kopf und Rumpf auffallend wenig kontrollieren kann, sich kaum bewegt, deutlich asymmetrisch bewegt oder ungewöhnlich steif oder schlaff wirkt, ist eine fachliche Einschätzung sinnvoll.", "Auch wenn dein Baby wenig auf Stimmen und vertraute Personen reagiert oder bereits erworbene Fähigkeiten verliert, solltest du dies ansprechen."],
      en: ["If your baby has noticeably little control of their head and trunk, hardly moves, moves in a clearly asymmetrical way or seems unusually stiff or floppy, a professional assessment is a good idea.", "You should also mention it if your baby responds little to voices and familiar people or loses skills they already had."] },
    key: { de: "Entwicklung braucht Raum, Zeit und Vertrauen. Unterstütze dein Baby, ohne ihm Bewegungen abzunehmen, die es selbst ausprobieren kann.", en: "Development needs space, time and trust. Support your baby without taking over movements they can try out themselves." } },

  { id: "m08", g: 0, n: "8", u: "m", label: { de: "8. Monat", en: "Month 8" },
    title: { de: "Entdecken, verstehen, festhalten", en: "Discovering, understanding, holding on" },
    observe: {
      de: ["Viele Babys können in dieser Zeit zunehmend sicher frei sitzen und sich beim Spielen nach Gegenständen ausstrecken. Sie verlagern ihr Gewicht und versuchen, ihre Position zu verändern.",
           "Manche beginnen zu robben oder auf Händen und Knien zu krabbeln. Andere bewegen sich auf eine ganz eigene Weise fort oder üben zunächst andere Übergänge zwischen den Positionen.",
           "Beim Spielen greifen Babys Gegenstände, geben sie möglicherweise von einer Hand in die andere und klopfen oder schlagen sie gegeneinander. Auch das Fallenlassen und Wiederfinden von Gegenständen wird interessant."],
      en: ["Many babies can now sit unsupported more and more securely and stretch for objects while playing. They shift their weight and try to change position.",
           "Some begin to commando-crawl or crawl on hands and knees. Others get around in their very own way or first practise other transitions between positions.",
           "When playing, babies grasp objects, may pass them from one hand to the other and bang them together. Dropping objects and finding them again also becomes interesting."] },
    support: {
      de: ["Biete Spielzeug in unterschiedlichen Abständen und Positionen an.", "Lass dein Baby auf einer sicheren Unterlage frei spielen und sich bewegen.", "Verstecke einen Gegenstand teilweise unter einem Tuch und beobachte, wie dein Baby darauf reagiert.", "Benenne Gegenstände und begleite eure gemeinsamen Aktivitäten mit Sprache."],
      en: ["Offer toys at different distances and in different positions.", "Let your baby play and move freely on a safe surface.", "Partly hide an object under a cloth and watch how your baby reacts.", "Name objects and accompany your shared activities with words."] },
    ask: {
      de: ["Wenn dein Baby noch nicht frei sitzen kann, sich auffallend wenig bewegt, deutlich eine Seite bevorzugt oder Schwierigkeiten hat, Gegenstände zu greifen, ist es sinnvoll, die Entwicklung mit der Kinderärztin oder dem Kinderarzt zu besprechen.", "Auch wenig Reaktion auf Stimmen, ungewöhnliche Muskelspannung oder der Verlust erworbener Fähigkeiten sollten angesprochen werden."],
      en: ["If your baby cannot yet sit unsupported, moves noticeably little, clearly favours one side or has difficulty grasping objects, it is a good idea to discuss their development with your paediatrician.", "Little response to voices, unusual muscle tone or the loss of skills already acquired should also be mentioned."] },
    note: { de: "Wichtig: Robben und Krabbeln sind unterschiedliche Fortbewegungsformen. Nicht jedes Kind zeigt beide Formen. Dass ein Baby noch nicht krabbelt, ist für sich allein kein Grund zur Sorge.", en: "Important: commando-crawling and crawling are different ways of getting around. Not every child does both. If a baby is not crawling yet, this alone is no reason for concern." },
    key: { de: "Es gibt nicht nur einen Weg, sich fortzubewegen. Beobachte, wie dein Baby seine eigenen Bewegungsmöglichkeiten entdeckt.", en: "There is more than one way to get around. Watch how your baby discovers their own ways of moving." } },

  { id: "m09", g: 0, n: "9", u: "m", label: { de: "9. Monat", en: "Month 9" },
    title: { de: "Kleiner Entdecker auf Tour", en: "A little explorer on the move" },
    observe: {
      de: ["Viele Babys sitzen nun frei und nutzen ihre Hände, um Gegenstände zu greifen und zu untersuchen. Sie können sich rollend, robbend, krabbelnd oder auf andere Weise auf dem Boden fortbewegen.",
           "Dein Baby sucht möglicherweise nach einem Gegenstand, der heruntergefallen ist, und reagiert zunehmend auf seinen Namen. Es produziert unterschiedliche Laute, wiederholt Silben und beobachtet aufmerksam, was in seiner Umgebung geschieht.",
           "Manche Babys werden in Gegenwart fremder Menschen zurückhaltender."],
      en: ["Many babies now sit unsupported and use their hands to grasp and examine objects. They may get around on the floor by rolling, commando-crawling, crawling or in other ways.",
           "Your baby may look for an object that has fallen and responds more and more to their name. They make different sounds, repeat syllables and watch closely what is happening around them.",
           "Some babies become more reserved around unfamiliar people."] },
    support: {
      de: ["Schaffe eine sichere Umgebung, in der dein Baby seine Bewegungen ausprobieren kann.", "Platziere interessante Gegenstände so, dass es sich danach ausstrecken oder fortbewegen kann.", "Sprich mit deinem Baby, benenne Gegenstände und reagiere auf seine Laute.", "Spiele Versteckspiele und gib deinem Baby Zeit, selbst nach Gegenständen zu suchen."],
      en: ["Create a safe environment where your baby can try out their movements.", "Place interesting objects so that your baby can stretch towards them or move to reach them.", "Talk to your baby, name objects and respond to their sounds.", "Play hide-and-seek games and give your baby time to look for objects themselves."] },
    ask: {
      de: ["Wenn dein Baby noch nicht frei sitzen kann, sich auffallend wenig bewegt, deutlich asymmetrisch bewegt oder kaum auf Stimmen und seinen Namen reagiert, ist eine fachliche Einschätzung sinnvoll.", "Auch wenn dein Baby nur wenige Laute bildet, ungewöhnlich steif oder schlaff wirkt oder bereits erworbene Fähigkeiten verliert, solltest du dies ansprechen."],
      en: ["If your baby cannot yet sit unsupported, moves noticeably little, moves in a clearly asymmetrical way or hardly responds to voices and their name, a professional assessment is a good idea.", "You should also mention it if your baby makes only a few sounds, seems unusually stiff or floppy, or loses skills they already had."] },
    note: { de: "Dass dein Baby noch nicht krabbelt oder sich noch nicht zum Stand hochzieht, ist allein kein Beweis für eine Entwicklungsauffälligkeit.", en: "If your baby is not yet crawling or pulling up to stand, this alone is no evidence of a developmental problem." },
    key: { de: "Dein Baby lernt durch Bewegung, Wiederholung und gemeinsames Entdecken. Lass ihm Zeit, seine Fähigkeiten weiterzuentwickeln.", en: "Your baby learns through movement, repetition and discovering things together. Give them time to keep developing their skills." } },

  { id: "m10", g: 0, n: "10", u: "m", label: { de: "10. Monat", en: "Month 10" },
    title: { de: "Entdecken, ausprobieren, Neues verstehen", en: "Discovering, trying out, understanding new things" },
    observe: {
      de: ["Dein Baby kann möglicherweise bereits selbstständig zwischen verschiedenen Positionen wechseln und sich auf seine eigene Weise fortbewegen. Manche Babys ziehen sich an stabilen Gegenständen zum Stand hoch.",
           "Beim Spielen werden Gegenstände gezielter untersucht: Dein Baby steckt Dinge in Behälter, nimmt sie wieder heraus und beobachtet, was passiert. Es brabbelt, imitiert möglicherweise Laute oder Bewegungen und reagiert zunehmend auf vertraute Wörter."],
      en: ["Your baby may already be able to move between different positions on their own and get around in their own way. Some babies pull themselves up to standing on stable objects.",
           "When playing, objects are examined more purposefully: your baby puts things into containers, takes them out again and watches what happens. They babble, may imitate sounds or movements and respond more and more to familiar words."] },
    support: {
      de: ["Sorge für eine sichere Umgebung mit stabilen Möbeln und ausreichend Platz.", "Biete Behälter und geeignete Gegenstände zum Ein- und Ausräumen an.", "Benenne Gegenstände und Handlungen im Alltag.", "Lass dein Baby selbst nach Spielzeug greifen und unterschiedliche Bewegungswege ausprobieren."],
      en: ["Make sure the environment is safe, with stable furniture and enough space.", "Offer containers and suitable objects for filling and emptying.", "Name objects and actions in everyday life.", "Let your baby reach for toys themselves and try out different ways of moving."] },
    ask: {
      de: ["Wenn dein Baby sich auffallend wenig bewegt, eine Körperseite deutlich bevorzugt, kaum nach Gegenständen greift oder wenig auf Stimmen und vertraute Menschen reagiert, kannst du dies fachlich abklären lassen.", "Auch ungewöhnliche Steifheit, Schlaffheit oder der Verlust bereits erworbener Fähigkeiten sollten angesprochen werden."],
      en: ["If your baby moves noticeably little, clearly favours one side of the body, hardly reaches for objects or responds little to voices and familiar people, you can have this checked by a professional.", "Unusual stiffness, floppiness or the loss of skills already acquired should also be mentioned."] },
    key: { de: "Ausprobieren, Wiederholen und Beobachten helfen deinem Baby, Zusammenhänge zu entdecken und seine Bewegungen weiterzuentwickeln.", en: "Trying things out, repeating and watching help your baby discover connections and keep developing their movements." } },

  { id: "m11", g: 0, n: "11", u: "m", label: { de: "11. Monat", en: "Month 11" },
    title: { de: "Entdecken, ausprobieren, selbstständiger werden", en: "Discovering, trying out, becoming more independent" },
    observe: {
      de: ["Dein Baby bewegt sich möglicherweise zunehmend sicher auf dem Boden und wechselt zwischen verschiedenen Positionen. Manche Babys ziehen sich an stabilen Gegenständen hoch und stehen mit Unterstützung.",
           "Es greift nach Gegenständen, gibt sie von einer Hand in die andere und probiert unterschiedliche Spielmöglichkeiten aus. Die Lautäusserungen werden vielfältiger. Vielleicht imitiert dein Baby Gesten, reagiert auf vertraute Wörter oder verwendet wiederkehrende Silbenfolgen."],
      en: ["Your baby may move more and more confidently on the floor and switch between different positions. Some babies pull themselves up on stable objects and stand with support.",
           "They reach for objects, pass them from one hand to the other and try out different ways of playing. Their sounds become more varied. Your baby may imitate gestures, respond to familiar words or use repeated strings of syllables."] },
    support: {
      de: ["Biete stabile, sichere Möglichkeiten zum Festhalten und Hochziehen an.", "Gib deinem Baby Zeit, seine Positionen selbst zu erreichen.", "Vermeide es, dein Baby an den Händen hochzuziehen, um das Stehen oder Gehen zu üben.", "Unterstütze die Kommunikation, indem du Dinge benennst, auf Laute reagierst und Gesten im Alltag verwendest."],
      en: ["Offer stable, safe things to hold on to and pull up on.", "Give your baby time to reach positions on their own.", "Avoid pulling your baby up by the hands to practise standing or walking.", "Support communication by naming things, responding to sounds and using gestures in everyday life."] },
    ask: {
      de: ["Wenn dein Baby sich auffallend wenig bewegt, eine Seite deutlich bevorzugt, kaum Gegenstände greift oder wenig auf Stimmen und vertraute Menschen reagiert, ist es sinnvoll, die Entwicklung zu besprechen.", "Auch ungewöhnliche Muskelspannung oder der Verlust bereits erworbener Fähigkeiten sollten abgeklärt werden."],
      en: ["If your baby moves noticeably little, clearly favours one side, hardly grasps objects or responds little to voices and familiar people, it is a good idea to discuss their development.", "Unusual muscle tone or the loss of skills already acquired should also be checked."] },
    note: { de: "Dass dein Baby mit elf Monaten noch nicht frei steht oder erste Gehversuche macht, ist für sich allein kein Grund, von einer Entwicklungsstörung auszugehen.", en: "If your baby is not yet standing unsupported or trying to walk at eleven months, this alone is no reason to assume a developmental disorder." },
    key: { de: "Dein Baby wird selbstständiger, indem es eigene Erfahrungen sammelt. Sichere Bewegungsmöglichkeiten sind hilfreicher als vorgegebene Übungen.", en: "Your baby becomes more independent by gathering their own experiences. Safe opportunities to move are more helpful than set exercises." } },

  { id: "m12", g: 0, n: "12", u: "m", label: { de: "12. Monat", en: "Month 12" },
    title: { de: "Ein Jahr voller Entdeckungen", en: "A year full of discoveries" },
    observe: {
      de: ["Rund um den ersten Geburtstag können Babys bereits viele unterschiedliche Bewegungsfähigkeiten zeigen. Manche ziehen sich zum Stand hoch, gehen an Möbeln entlang oder machen erste freie Schritte. Andere konzentrieren sich noch auf das Hochziehen, Stehen mit Unterstützung oder ihre Fortbewegung am Boden.",
           "Der Pinzettengriff zwischen Daumen und Zeigefinger entwickelt sich zunehmend. Dein Baby steckt vielleicht Gegenstände in Behälter, sucht nach versteckten Dingen oder winkt zum Abschied. Es reagiert möglicherweise auf das Wort «Nein» und verwendet «Mama», «Papa» oder eine andere vertraute Bezeichnung."],
      en: ["Around their first birthday, babies may already show many different movement skills. Some pull up to stand, walk along furniture or take their first independent steps. Others are still focusing on pulling up, standing with support or getting around on the floor.",
           "The pincer grip between thumb and index finger keeps developing. Your baby may put objects into containers, look for hidden things or wave goodbye. They may respond to the word “no” and say “mama”, “dada” or another familiar name."] },
    support: {
      de: ["Ermögliche freie Bewegung auf einer sicheren Unterlage.", "Biete kleine, altersgerechte Gegenstände nur unter sicherer Aufsicht an.", "Spiele mit Behältern, Gegenständen und einfachen Versteckspielen.", "Begleite Alltagssituationen mit Sprache, Gesten und gemeinsamem Blickkontakt."],
      en: ["Allow free movement on a safe surface.", "Offer small, age-appropriate objects only under close supervision.", "Play with containers, objects and simple hide-and-seek games.", "Accompany everyday situations with words, gestures and shared eye contact."] },
    ask: {
      de: ["Wenn dein Baby sich auffallend wenig bewegt, eine Seite deutlich bevorzugt, kaum Gegenstände greift oder wenig auf Stimmen und vertraute Personen reagiert, ist eine fachliche Einschätzung sinnvoll.", "Wenn dein Baby sich noch nicht zum Stand hochzieht oder sich nicht an Möbeln entlangbewegt, kannst du dies bei der kinderärztlichen Kontrolle ansprechen. Entscheidend sind die gesamte Entwicklung und die weiteren Fähigkeiten deines Kindes."],
      en: ["If your baby moves noticeably little, clearly favours one side, hardly grasps objects or responds little to voices and familiar people, a professional assessment is a good idea.", "If your baby is not yet pulling up to stand or moving along furniture, you can mention this at the paediatric check-up. What matters is your child’s overall development and their other skills."] },
    note: { de: "Dass dein Baby zum ersten Geburtstag noch nicht frei läuft oder noch keine klaren Wörter ausser «Mama» oder «Papa» verwendet, ist für sich allein keine Diagnose.", en: "If your baby is not yet walking independently by their first birthday or not yet using clear words other than “mama” or “dada”, this alone is not a diagnosis." },
    key: { de: "Der erste Geburtstag ist ein schöner Orientierungspunkt, aber kein Prüfungstermin. Dein Kind entwickelt seine Fähigkeiten Schritt für Schritt.", en: "The first birthday is a lovely point of reference, but not an exam date. Your child develops their skills step by step." } },

  { id: "m13", g: 1, n: "13–15", u: "m", kid: true, label: { de: "13 bis 15 Monate", en: "13 to 15 months" },
    title: { de: "Vom Entdecken zum Ausprobieren", en: "From discovering to trying out" },
    observe: {
      de: ["In dieser Zeit machen viele Kinder grosse Fortschritte in ihrer Beweglichkeit. Manche stehen bereits frei oder gehen erste Schritte, andere üben noch, sich hochzuziehen, das Gleichgewicht zu halten oder mit Unterstützung zu gehen.",
           "Der Pinzettengriff wird zunehmend gezielter. Kinder zeigen und gestikulieren möglicherweise, versuchen einzelne Wörter zu sprechen, ahmen Handlungen nach und verstehen einfache Aufforderungen – besonders, wenn sie durch Gesten begleitet werden."],
      en: ["During this time, many children make big progress in their mobility. Some already stand unsupported or take their first steps; others are still practising pulling up, keeping their balance or walking with support.",
           "The pincer grip becomes more and more precise. Children may point and gesture, try to say single words, imitate actions and understand simple requests – especially when they are accompanied by gestures."] },
    support: {
      de: ["Schaffe sichere Möglichkeiten zum Stehen, Gehen und freien Bewegen.", "Lass dein Kind selbst entscheiden, ob es sich festhalten oder erste Schritte ausprobieren möchte.", "Sprich im Alltag in einfachen, klaren Sätzen und benenne Gegenstände.", "Beziehe dein Kind in kleine Alltagshandlungen ein, zum Beispiel beim Einräumen oder Aufheben."],
      en: ["Create safe opportunities for standing, walking and moving freely.", "Let your child decide whether they want to hold on or try their first steps.", "Speak in simple, clear sentences in everyday life and name objects.", "Involve your child in small everyday tasks, for example tidying up or picking things up."] },
    ask: {
      de: ["Sprich mit deiner Kinderärztin oder deinem Kinderarzt, wenn dein Kind sich auffallend wenig bewegt, kaum Gewicht auf die Beine bringt, deutlich asymmetrisch bewegt oder ungewöhnlich steif oder schlaff wirkt.", "Auch wenn dein Kind kaum gestikuliert, wenig auf vertraute Wörter reagiert oder du dir Sorgen um seine Kommunikation machst, ist ein Gespräch sinnvoll."],
      en: ["Talk to your paediatrician if your child moves noticeably little, hardly puts weight on their legs, moves in a clearly asymmetrical way or seems unusually stiff or floppy.", "A conversation is also a good idea if your child hardly gestures, responds little to familiar words or you are worried about their communication."] },
    note: { de: "Wenn dein Kind mit 15 Monaten noch keine selbstständigen Schritte macht, muss das nicht automatisch eine Auffälligkeit bedeuten. Du kannst die motorische Entwicklung bei der nächsten Kontrolle gezielt ansprechen, besonders wenn weitere Fragen oder Unsicherheiten bestehen.", en: "If your child is not yet taking independent steps at 15 months, this does not automatically mean there is a problem. You can raise their motor development specifically at the next check-up, especially if you have other questions or uncertainties." },
    key: { de: "Erste Schritte sind ein wichtiger Entwicklungsschritt, aber kein Wettlauf. Gib deinem Kind sichere Möglichkeiten, sein Gleichgewicht und seine Selbstständigkeit zu entdecken.", en: "First steps are an important milestone, but not a race. Give your child safe opportunities to discover their balance and independence." } },

  { id: "m14", g: 1, n: "16–18", u: "m", kid: true, label: { de: "16 bis 18 Monate", en: "16 to 18 months" },
    title: { de: "Mehr Bewegung, mehr Worte, mehr Ich", en: "More movement, more words, more ‘me’" },
    observe: {
      de: ["Viele Kinder gehen in dieser Altersphase zunehmend selbstständig. Sie tragen Gegenstände, schieben Spielzeug, beugen sich nach etwas hinunter und richten sich wieder auf. Manche beginnen zu kritzeln oder probieren einen Löffel selbst aus.",
           "Auch die Kommunikation entwickelt sich weiter: Dein Kind versteht einfache Aufforderungen, zeigt auf interessante Dinge und versucht, Wörter zu verwenden. Gegen Ende dieser Altersphase sprechen viele Kinder mehrere Wörter zusätzlich zu «Mama» und «Papa»."],
      en: ["Many children walk more and more independently at this age. They carry objects, push toys, bend down to pick something up and straighten up again. Some begin to scribble or try using a spoon themselves.",
           "Communication also develops further: your child understands simple requests, points at interesting things and tries to use words. Towards the end of this period, many children say several words in addition to “mama” and “dada”."] },
    support: {
      de: ["Gib deinem Kind sichere Möglichkeiten zum Gehen, Klettern und Ausprobieren.", "Lies Bilderbücher vor und benenne, was ihr gemeinsam anschaut.", "Lass dein Kind bei alltäglichen Aufgaben mithelfen.", "Unterstütze seine Selbstständigkeit, ohne zu viel von ihm zu verlangen.", "Begleite Gefühle mit einfachen Worten und bleibe bei Frustration ruhig und zugewandt."],
      en: ["Give your child safe opportunities to walk, climb and try things out.", "Read picture books and name what you are looking at together.", "Let your child help with everyday tasks.", "Support their independence without expecting too much of them.", "Put feelings into simple words and stay calm and caring when your child is frustrated."] },
    ask: {
      de: ["Wenn dein Kind mit 18 Monaten noch nicht selbstständig geht, solltest du dies zeitnah mit der Kinderärztin oder dem Kinderarzt besprechen.", "Eine fachliche Einschätzung ist ebenfalls sinnvoll, wenn dein Kind wenig gestikuliert, kaum auf vertraute Wörter reagiert, nur wenige Laute oder Wörter verwendet, deutlich asymmetrisch bewegt oder ungewöhnlich steif oder schlaff wirkt.", "Wenn bereits erworbene Fähigkeiten verloren gehen, solltest du dies umgehend medizinisch abklären lassen."],
      en: ["If your child is not yet walking independently at 18 months, you should discuss this with your paediatrician soon.", "A professional assessment is also a good idea if your child gestures little, hardly responds to familiar words, uses only a few sounds or words, moves in a clearly asymmetrical way or seems unusually stiff or floppy.", "If your child loses skills they already had, have this checked by a doctor straight away."] },
    key: { de: "Bewegung, Sprache und Selbstständigkeit entwickeln sich gemeinsam. Unterstütze dein Kind mit Zeit, sicheren Erfahrungen und liebevoller Begleitung.", en: "Movement, language and independence develop together. Support your child with time, safe experiences and loving guidance." } },

  { id: "m15", g: 1, n: "19–24", u: "m", kid: true, label: { de: "19 bis 24 Monate", en: "19 to 24 months" },
    title: { de: "«Ich kann das allein!»", en: "“I can do it myself!”" },
    observe: {
      de: ["Viele Kinder bewegen sich nun zunehmend sicher. Sie gehen, laufen vielleicht schon, treten gegen einen Ball oder versuchen, auf niedrige Möbel zu klettern. Sie tragen, schieben und ziehen Gegenstände und üben alltägliche Bewegungen.",
           "Beim Spielen bauen sie möglicherweise kleine Türme, räumen Gegenstände ein und aus oder schauen sich gerne Bilderbücher an. Sie probieren, selbst mit dem Löffel zu essen oder aus einem Becher zu trinken.",
           "Die Sprache entwickelt sich weiter. Dein Kind versteht zunehmend mehr Wörter und einfache Aufforderungen. Im Laufe dieser Altersphase beginnen viele Kinder, zwei Wörter miteinander zu verbinden. Gesten, Zeigen und Nachahmen bleiben wichtige Bestandteile der Kommunikation."],
      en: ["Many children now move more and more confidently. They walk, may already run, kick a ball or try to climb onto low furniture. They carry, push and pull objects and practise everyday movements.",
           "When playing, they may build small towers, put objects in and take them out, or enjoy looking at picture books. They try to eat with a spoon or drink from a cup by themselves.",
           "Language keeps developing. Your child understands more and more words and simple requests. During this period, many children begin to put two words together. Gestures, pointing and imitation remain important parts of communication."] },
    support: {
      de: ["Gib deinem Kind Zeit, alltägliche Dinge selbst auszuprobieren.", "Ermögliche sicheres Gehen, Laufen und Klettern im passenden Rahmen.", "Sprich über das, was ihr gemeinsam erlebt, und erweitere die Wörter deines Kindes auf natürliche Weise.", "Schau gemeinsam Bilderbücher an und spiele einfache Alltagssituationen nach.", "Begleite starke Gefühle mit Ruhe, klaren Worten und verlässlichen Grenzen."],
      en: ["Give your child time to try everyday things themselves.", "Allow safe walking, running and climbing in a suitable setting.", "Talk about what you experience together and naturally build on your child’s words.", "Look at picture books together and play out simple everyday situations.", "Respond to strong feelings with calm, clear words and reliable boundaries."] },
    ask: {
      de: ["Wenn dein Kind noch nicht selbstständig geht, ist eine kinderärztliche Einschätzung sinnvoll.", "Besprich auch, wenn dein Kind kaum gestikuliert, wenig auf Sprache reagiert oder du dir Sorgen um seine Sprachentwicklung, sein Spiel oder seine Bewegungen machst.", "Wenn dein Kind um den zweiten Geburtstag noch keine Zwei-Wort-Verbindungen verwendet, solltest du dies ansprechen. Entscheidend ist die gesamte Kommunikationsentwicklung, nicht ein einzelnes Merkmal.", "Auch deutliche Asymmetrien, ungewöhnliche Muskelspannung oder der Verlust bereits erworbener Fähigkeiten sollten abgeklärt werden."],
      en: ["If your child is not yet walking independently, a paediatric assessment is a good idea.", "Also talk to your paediatrician if your child hardly gestures, responds little to language or you are worried about their language development, play or movement.", "If your child is not using two-word combinations around their second birthday, you should mention it. What matters is their communication development as a whole, not a single feature.", "Clear asymmetries, unusual muscle tone or the loss of skills already acquired should also be checked."] },
    key: { de: "Selbstständigkeit bedeutet auch, Dinge immer wieder zu versuchen. Dein Kind darf üben, Fehler machen und in seinem eigenen Tempo lernen.", en: "Independence also means trying things again and again. Your child is allowed to practise, make mistakes and learn at their own pace." } },

  { id: "m16", g: 2, n: "2", u: "y", kid: true, label: { de: "Rund um 2 Jahre", en: "Around 2 years" },
    title: { de: "Sprache, Selbstständigkeit und grosse Gefühle", en: "Language, independence and big feelings" },
    observe: {
      de: ["Rund um den zweiten Geburtstag bewegen sich viele Kinder zunehmend sicher. Sie laufen, treten möglicherweise gegen einen Ball, steigen mit Unterstützung einige Stufen hinauf oder versuchen, auf niedrige Möbel zu klettern.",
           "Im Alltag möchten sie vieles selbst machen: mit dem Löffel essen, aus einem Becher trinken, Gegenstände tragen oder beim Anziehen mithelfen.",
           "Auch Sprache und Spiel entwickeln sich weiter. Viele Kinder verbinden zwei Wörter miteinander, zeigen auf Bilder oder Körperteile und verstehen einfache Aufforderungen. Im Rollenspiel ahmen sie alltägliche Handlungen nach, beispielsweise Füttern, Telefonieren oder Kochen.",
           "Gleichzeitig werden eigene Wünsche und Gefühle deutlicher. Frustration gehört in dieser Phase häufig zum Alltag."],
      en: ["Around their second birthday, many children move more and more confidently. They run, may kick a ball, climb a few steps with support or try to climb onto low furniture.",
           "In everyday life they want to do a lot themselves: eat with a spoon, drink from a cup, carry things or help with getting dressed.",
           "Language and play develop further too. Many children put two words together, point to pictures or body parts and understand simple requests. In pretend play they imitate everyday actions such as feeding, phoning or cooking.",
           "At the same time, their own wishes and feelings become clearer. Frustration is often part of everyday life at this stage."] },
    support: {
      de: ["Lass dein Kind kleine Aufgaben selbst übernehmen und unterstütze es, wenn es Hilfe braucht.", "Biete Bewegung im Freien und abwechslungsreiche Spielmöglichkeiten an.", "Sprich in einfachen Sätzen und erweitere die Äusserungen deines Kindes.", "Lies gemeinsam Bücher und spielt Alltagssituationen nach.", "Benenne Gefühle und begleite schwierige Momente mit Ruhe und klaren Grenzen."],
      en: ["Let your child take on small tasks themselves and help when they need it.", "Offer outdoor activity and a variety of ways to play.", "Speak in simple sentences and build on what your child says.", "Read books together and play out everyday situations.", "Name feelings and support difficult moments with calm and clear boundaries."] },
    ask: {
      de: ["Wenn dein Kind noch nicht selbstständig geht, kaum Wörter verwendet oder um den zweiten Geburtstag keine Zwei-Wort-Verbindungen bildet, solltest du dies mit der Kinderärztin oder dem Kinderarzt besprechen.", "Eine Einschätzung ist auch sinnvoll, wenn dein Kind wenig gestikuliert, nur selten auf Sprache reagiert, kaum Interesse am gemeinsamen Austausch zeigt oder deutliche Schwierigkeiten mit Bewegungen hat.", "Bei auffälliger Steifheit, Schlaffheit, ausgeprägter Asymmetrie oder dem Verlust erworbener Fähigkeiten sollte ebenfalls eine Abklärung erfolgen."],
      en: ["If your child is not yet walking independently, hardly uses words or is not forming two-word combinations around their second birthday, you should discuss this with your paediatrician.", "An assessment is also a good idea if your child gestures little, rarely responds to language, shows little interest in interacting with others or has clear difficulties with movement.", "Noticeable stiffness, floppiness, marked asymmetry or the loss of skills already acquired should also be checked."] },
    key: { de: "Dein Kind entdeckt seine Selbstständigkeit und seine eigene Persönlichkeit. Es braucht Raum zum Ausprobieren, aber auch deine Begleitung und Sicherheit.", en: "Your child is discovering their independence and their own personality. They need room to try things out, but also your guidance and security." } },

  { id: "m17", g: 2, n: "3", u: "y", kid: true, label: { de: "Rund um 3 Jahre", en: "Around 3 years" },
    title: { de: "Ich bin ich! – Selbstbewusstsein, Sprache und Fantasie blühen auf", en: "I am me! – Confidence, language and imagination blossom" },
    observe: {
      de: ["Viele Kinder laufen sicherer, klettern, springen möglicherweise mit beiden Füssen und probieren neue Bewegungsformen aus. Sie bewegen sich zunehmend selbstständig und entwickeln ihre Hand- und Fingerfertigkeiten weiter.",
           "Die Sprache wird vielfältiger. Dein Kind kann vielleicht kurze Gespräche führen, Fragen stellen, seinen Namen nennen oder von Erlebnissen erzählen. Es malt einfache Formen nach und beginnt, im Spiel Alltagssituationen oder Fantasiewelten nachzustellen.",
           "Auch das gemeinsame Spiel mit anderen Kindern wird interessanter. Dein Kind lernt, Wünsche auszudrücken, Gefühle wahrzunehmen und erste Regeln im Miteinander zu verstehen."],
      en: ["Many children run more confidently, climb, may jump with both feet and try out new ways of moving. They move more and more independently and keep developing their hand and finger skills.",
           "Language becomes richer. Your child may be able to have short conversations, ask questions, say their name or talk about things they have experienced. They copy simple shapes and begin to act out everyday situations or imaginary worlds in play.",
           "Playing with other children also becomes more interesting. Your child learns to express wishes, recognise feelings and understand the first rules of getting along with others."] },
    support: {
      de: ["Ermögliche vielfältige Bewegungserfahrungen beim Spielen im Freien.", "Lies Geschichten vor und lass dein Kind erzählen, was es sieht oder erlebt.", "Biete Malen, Bauen, Rollenspiele und einfache Alltagstätigkeiten an.", "Unterstütze dein Kind dabei, Gefühle und Bedürfnisse in Worte zu fassen.", "Gib ihm Gelegenheit, mit anderen Kindern zu spielen, ohne jedes Spiel vorzugeben."],
      en: ["Allow a wide range of movement experiences when playing outdoors.", "Read stories aloud and let your child tell you what they see or experience.", "Offer drawing, building, pretend play and simple everyday activities.", "Help your child put feelings and needs into words.", "Give them opportunities to play with other children without directing every game."] },
    ask: {
      de: ["Wenn dein Kind nur wenige Wörter oder kurze Äusserungen verwendet, andere es häufig nur schwer verstehen oder es einfache Aufforderungen kaum versteht, solltest du dies ansprechen.", "Auch wenn dein Kind wenig Interesse am gemeinsamen Spiel zeigt, kaum in einen Austausch kommt oder deutliche Schwierigkeiten bei Bewegungen hat, kann eine fachliche Einschätzung hilfreich sein.", "Bei auffälliger Muskelspannung, deutlicher Asymmetrie oder dem Verlust bereits erworbener Fähigkeiten ist eine Abklärung wichtig."],
      en: ["If your child uses only a few words or short phrases, is often hard for others to understand or hardly understands simple requests, you should mention this.", "A professional assessment can also be helpful if your child shows little interest in playing together, rarely engages with others or has clear difficulties with movement.", "If there is unusual muscle tone, clear asymmetry or loss of skills already acquired, it is important to have this checked."] },
    key: { de: "Dein Kind entdeckt seine Möglichkeiten, seine Sprache und seine Fantasie. Unterstütze es mit Bewegung, gemeinsamen Erlebnissen und Zeit für eigene Ideen.", en: "Your child is discovering their abilities, their language and their imagination. Support them with movement, shared experiences and time for their own ideas." } },

  { id: "m18", g: 2, n: "4", u: "y", kid: true, label: { de: "Rund um 4 Jahre", en: "Around 4 years" },
    title: { de: "Kleine Persönlichkeit mit grossem Ideenreichtum", en: "A little personality full of ideas" },
    observe: {
      de: ["Viele Kinder laufen, klettern, hüpfen und balancieren zunehmend sicher. Sie fahren vielleicht Dreirad, spielen mit Bällen und entwickeln ihre Handgeschicklichkeit beim Malen, Basteln und Bauen weiter.",
           "Die Sprache wird differenzierter. Dein Kind verwendet möglicherweise längere Sätze, stellt viele Fragen und erzählt von Erlebnissen. Es kann einige Farben benennen und malt vielleicht eine Person mit mehreren Körperteilen.",
           "Im Rollenspiel entstehen eigene Geschichten. Viele Kinder suchen zunehmend den Kontakt zu anderen Kindern, übernehmen kleine Aufgaben und beginnen, sich stärker in andere hineinzuversetzen."],
      en: ["Many children run, climb, hop and balance more and more confidently. They may ride a tricycle, play with balls and keep developing their hand skills when drawing, crafting and building.",
           "Language becomes more refined. Your child may use longer sentences, ask lots of questions and talk about their experiences. They can name some colours and may draw a person with several body parts.",
           "In pretend play, they create their own stories. Many children increasingly seek contact with other children, take on small tasks and begin to put themselves in others’ shoes."] },
    support: {
      de: ["Biete Bewegung, Balancieren, Ballspiele und freies Spielen an.", "Ermögliche kreatives Gestalten, Bauen und Malen ohne Ergebnisdruck.", "Lies Geschichten vor und sprich über Figuren, Gefühle und Erlebnisse.", "Beziehe dein Kind in einfache Aufgaben im Alltag ein.", "Unterstütze es dabei, Konflikte und Gefühle mit Worten auszudrücken."],
      en: ["Offer movement, balancing, ball games and free play.", "Allow creative activities, building and drawing without pressure to produce a result.", "Read stories aloud and talk about characters, feelings and experiences.", "Involve your child in simple everyday tasks.", "Help them express conflicts and feelings in words."] },
    ask: {
      de: ["Wenn dein Kind nur schwer verständliche Sätze bildet, einfache Fragen kaum versteht oder nur wenig Interesse an gemeinsamem Spiel und Rollenspiel zeigt, ist es sinnvoll, die Entwicklung anzusprechen.", "Auch deutliche Schwierigkeiten mit Bewegung, Gleichgewicht oder feinmotorischen Tätigkeiten können Anlass für eine fachliche Einschätzung sein.", "Bei auffälliger Muskelspannung, deutlicher Asymmetrie oder dem Verlust erworbener Fähigkeiten sollte eine Abklärung erfolgen."],
      en: ["If your child forms sentences that are hard to understand, hardly understands simple questions or shows little interest in playing together and pretend play, it is a good idea to talk about their development.", "Clear difficulties with movement, balance or fine motor activities can also be a reason for a professional assessment.", "If there is unusual muscle tone, clear asymmetry or loss of skills already acquired, it should be checked."] },
    key: { de: "Dein Kind verbindet Bewegung, Sprache und Fantasie immer stärker miteinander. Gib ihm Gelegenheit, eigene Ideen auszuprobieren und sich als Teil einer Gemeinschaft zu erleben.", en: "Your child increasingly combines movement, language and imagination. Give them the chance to try out their own ideas and to experience being part of a community." } },

  { id: "m19", g: 2, n: "5", u: "y", kid: true, label: { de: "Rund um 5 Jahre", en: "Around 5 years" },
    title: { de: "Selbstbewusst, sprachgewandt und voller Fantasie", en: "Confident, articulate and full of imagination" },
    sub: { de: "Bereit für den nächsten Schritt.", en: "Ready for the next step." },
    observe: {
      de: ["Viele Kinder bewegen sich zunehmend sicher und vielseitig. Sie laufen, klettern, hüpfen möglicherweise auf einem Bein und probieren unterschiedliche Bewegungsabläufe aus. Im Alltag werden sie selbstständiger, etwa beim Anziehen oder beim Umgang mit Knöpfen.",
           "Die Handgeschicklichkeit entwickelt sich weiter. Dein Kind malt, bastelt und schreibt vielleicht bereits einzelne Buchstaben seines Namens.",
           "Auch die Sprache wird differenzierter. Dein Kind erzählt möglicherweise Geschichten mit mehreren zusammenhängenden Ereignissen, beantwortet Fragen zu einer Geschichte und führt längere Gespräche. Es interessiert sich vielleicht für Buchstaben, Zahlen, Reime und neue Wörter.",
           "Im gemeinsamen Spiel übt es, Regeln einzuhalten, sich abzuwechseln und eigene Ideen einzubringen."],
      en: ["Many children move more and more confidently and in many different ways. They run, climb, may hop on one leg and try out different movement sequences. They become more independent in everyday life, for example when getting dressed or doing up buttons.",
           "Hand skills keep developing. Your child draws, does crafts and may already write some letters of their name.",
           "Language becomes more refined too. Your child may tell stories with several connected events, answer questions about a story and hold longer conversations. They may be interested in letters, numbers, rhymes and new words.",
           "In group play, they practise following rules, taking turns and contributing their own ideas."] },
    support: {
      de: ["Ermögliche vielseitige Bewegung und freies Spielen im Freien.", "Lies gemeinsam Geschichten und lass dein Kind eigene Erlebnisse erzählen.", "Biete kreative Tätigkeiten wie Malen, Bauen, Basteln und Rollenspiele an.", "Unterstütze Selbstständigkeit bei alltäglichen Aufgaben.", "Spiele gemeinsam Regelspiele und gib deinem Kind Gelegenheit, eigene Spielideen zu entwickeln."],
      en: ["Allow a wide variety of movement and free play outdoors.", "Read stories together and let your child tell you about their own experiences.", "Offer creative activities such as drawing, building, crafts and pretend play.", "Support independence in everyday tasks.", "Play games with rules together and give your child the chance to come up with their own game ideas."] },
    ask: {
      de: ["Wenn dein Kind deutliche Schwierigkeiten mit grundlegenden Bewegungen, dem Verstehen und Erzählen von Geschichten oder der Verständigung mit anderen hat, kann eine fachliche Einschätzung hilfreich sein.", "Auch wenn dein Kind nur schwer am gemeinsamen Spiel teilnehmen kann, ungewöhnlich steif oder schlaff wirkt, sich deutlich asymmetrisch bewegt oder bereits erworbene Fähigkeiten verliert, solltest du dies ansprechen."],
      en: ["If your child has clear difficulties with basic movements, understanding and telling stories or communicating with others, a professional assessment can be helpful.", "You should also mention it if your child finds it hard to join in group play, seems unusually stiff or floppy, moves in a clearly asymmetrical way or loses skills they already had."] },
    key: { de: "Dein Kind entwickelt seine Fähigkeiten weiter und bereitet sich auf den nächsten Schritt vor. Wichtig sind nicht perfekte Leistungen, sondern Freude am Lernen, vielfältige Erfahrungen und Vertrauen in die eigenen Möglichkeiten.", en: "Your child keeps developing their skills and is getting ready for the next step. What matters is not perfect performance, but enjoyment of learning, varied experiences and confidence in their own abilities." } }
];

/* ---------- Milestones explorer: rendering and interaction ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("ms-track");
  const panel = document.getElementById("ms-panel");
  const prev = document.getElementById("ms-prev");
  const next = document.getElementById("ms-next");
  const count = document.getElementById("ms-count");
  if (!track || !panel) return;

  const UI = {
    de: { groups: ["Erstes Lebensjahr", "Zweites Lebensjahr", "Vorschulalter"], m1: "Monat", m: "Monate", y: "Jahre",
          observe: "Was du beobachten kannst", supportBaby: "So kannst du dein Baby begleiten", supportKid: "So kannst du dein Kind begleiten",
          ask: "Wann es sinnvoll ist, nachzufragen", key: "Das Wichtigste auf einen Blick", of: (i, n) => `Phase ${i} von ${n}` },
    en: { groups: ["First year", "Second year", "Preschool years"], m1: "month", m: "months", y: "years",
          observe: "What you may notice", supportBaby: "How you can support your baby", supportKid: "How you can support your child",
          ask: "When it makes sense to ask", key: "The key points at a glance", of: (i, n) => `Stage ${i} of ${n}` }
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const lang = () => (document.documentElement.lang === "en" ? "en" : "de");

  let current = 0;
  try { const saved = parseInt(localStorage.getItem("da-ms") || "0", 10); if (saved >= 0 && saved < MILESTONES.length) current = saved; } catch (e) { /* storage unavailable */ }

  function buildTrack() {
    const L = UI[lang()];
    let html = "";
    let group = -1;
    MILESTONES.forEach((m, i) => {
      if (m.g !== group) {
        if (group !== -1) html += "</div></div>";
        group = m.g;
        html += `<div class="ms-group"><span class="ms-group-label">${esc(L.groups[group])}</span><div class="ms-stops">`;
      }
      html += `<button type="button" role="tab" class="ms-stop" id="ms-tab-${m.id}" aria-controls="ms-panel" aria-selected="${i === current}" tabindex="${i === current ? 0 : -1}" data-index="${i}" aria-label="${esc(m.label[lang()])}"><span class="ms-dot" aria-hidden="true"></span><b>${esc(m.n)}</b><small>${esc(L[m.u])}</small></button>`;
    });
    html += "</div></div>";
    track.innerHTML = html;
    track.querySelectorAll(".ms-stop").forEach(btn => {
      btn.addEventListener("click", () => select(+btn.dataset.index, false));
      btn.addEventListener("keydown", onKey);
    });
  }

  function renderPanel() {
    const l = lang(), L = UI[l], m = MILESTONES[current];
    const paras = arr => arr.map(p => `<p>${esc(p)}</p>`).join("");
    panel.setAttribute("aria-labelledby", "ms-tab-" + m.id);
    panel.innerHTML = `
      <div class="ms-card">
        <header class="ms-card-head">
          <p class="ms-age">${esc(m.label[l])}</p>
          <h3>${esc(m.title[l])}</h3>
          ${m.sub ? `<p class="ms-sub">${esc(m.sub[l])}</p>` : ""}
        </header>
        <div class="ms-body">
          <div class="ms-observe">
            <h4>${esc(L.observe)}</h4>
            ${paras(m.observe[l])}
            <figure class="ms-photo" hidden><img src="images/meilensteine/${m.id}.jpg" alt="${esc(m.label[l] + " – " + m.title[l])}" loading="lazy"></figure>
          </div>
          <div class="ms-support">
            <h4>${esc(m.kid ? L.supportKid : L.supportBaby)}</h4>
            <ul>${m.support[l].map(s => `<li>${esc(s)}</li>`).join("")}</ul>
          </div>
        </div>
        <div class="ms-ask">
          <h4>${esc(L.ask)}</h4>
          ${paras(m.ask[l])}
          ${m.note ? `<p class="ms-note">${esc(m.note[l])}</p>` : ""}
        </div>
        <div class="ms-key">
          <h4>${esc(L.key)}</h4>
          <p>${esc(m.key[l])}</p>
        </div>
      </div>`;
    const img = panel.querySelector(".ms-photo img");
    if (img) {
      img.addEventListener("load", () => { img.parentElement.hidden = false; }, { once: true });
      img.addEventListener("error", () => img.parentElement.remove(), { once: true });
    }
    if (count) count.textContent = L.of(current + 1, MILESTONES.length);
    if (prev) prev.disabled = current === 0;
    if (next) next.disabled = current === MILESTONES.length - 1;
  }

  function select(i, focusTab, scrollToPanel) {
    current = Math.max(0, Math.min(MILESTONES.length - 1, i));
    track.querySelectorAll(".ms-stop").forEach((btn, idx) => {
      const on = idx === current;
      btn.setAttribute("aria-selected", String(on));
      btn.tabIndex = on ? 0 : -1;
      if (on) {
        if (focusTab) btn.focus();
        const wrap = track.parentElement;
        if (wrap && wrap.scrollWidth > wrap.clientWidth) {
          wrap.scrollTo({ left: btn.offsetLeft - wrap.clientWidth / 2 + btn.offsetWidth / 2, behavior: "smooth" });
        }
      }
    });
    renderPanel();
    if (scrollToPanel) {
      const top = panel.getBoundingClientRect().top;
      const headerH = (document.getElementById("site-header") || {}).offsetHeight || 0;
      if (top < headerH || top > window.innerHeight * 0.6) window.scrollTo({ top: window.scrollY + top - headerH - 120, behavior: "smooth" });
    }
    try { localStorage.setItem("da-ms", String(current)); } catch (e) { /* storage unavailable */ }
  }

  function onKey(e) {
    const map = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (e.key in map) { e.preventDefault(); select(current + map[e.key], true); }
    else if (e.key === "Home") { e.preventDefault(); select(0, true); }
    else if (e.key === "End") { e.preventDefault(); select(MILESTONES.length - 1, true); }
  }

  if (prev) prev.addEventListener("click", () => select(current - 1, false, true));
  if (next) next.addEventListener("click", () => select(current + 1, false, true));

  // Swipe left/right on the stage card (touch screens)
  let startX = null, startY = null;
  panel.addEventListener("touchstart", e => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }, { passive: true });
  panel.addEventListener("touchend", e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX, dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) select(current + (dx < 0 ? 1 : -1), false, true);
    startX = null;
  }, { passive: true });

  // Re-draw in the new language when the visitor switches DE / EN
  document.addEventListener("da:lang", () => { buildTrack(); renderPanel(); });

  buildTrack();
  renderPanel();
});
