document.addEventListener("DOMContentLoaded", () => {
  const lightBtn = document.getElementById("lightBtn");
  const darkBtn = document.getElementById("darkBtn");

  const storyEl = document.getElementById("story");
  const contextEl = document.getElementById("context");

  // Step 3 (paste-only)
  const attachmentRefEl = document.getElementById("attachmentRef");
  const addAttachmentBtn = document.getElementById("addAttachmentBtn");
  const clearAttachmentsBtn = document.getElementById("clearAttachmentsBtn");
  const attachmentListEl = document.getElementById("attachmentList");
  const attachMetaEl = document.getElementById("attachMeta");

  const modeEl = document.getElementById("mode");
  const modeHintEl = document.getElementById("modeHint");

  const dOutline = document.getElementById("dOutline");
  const dLean = document.getElementById("dLean");
  const dBalanced = document.getElementById("dBalanced");
  const dExhaustive = document.getElementById("dExhaustive");
  const detailHintEl = document.getElementById("detailHint");

  const fSimple = document.getElementById("fSimple");
  const fGherkin = document.getElementById("fGherkin");
  const formatHintEl = document.getElementById("formatHint");

  const chkValidation = document.getElementById("chkValidation");
  const chkPermissions = document.getElementById("chkPermissions");
  const chkAudit = document.getElementById("chkAudit");
  const chkPerformance = document.getElementById("chkPerformance");
  const chkAccessibility = document.getElementById("chkAccessibility");
  const chkAnalytics = document.getElementById("chkAnalytics");

  const copyPromptBtn = document.getElementById("copyPromptBtn");
  const clearBtn = document.getElementById("clearBtn");
  const promptToast = document.getElementById("promptToast");

  const card2 = document.getElementById("card2");
  const card3 = document.getElementById("card3");
  const card4 = document.getElementById("card4");

  const s1 = document.getElementById("s1");
  const s2 = document.getElementById("s2");
  const s3 = document.getElementById("s3");

  // Attachments are reference-only strings.
  // shape: { id, label, ref, kind: "url"|"path"|"text" }
  let attachments = [];

  // Defaults
  let detailLevel = "lean";     // 'outline' | 'lean' | 'balanced' | 'exhaustive'
  let formatStyle = "simple";   // 'simple' | 'gherkin'
  const THEME_KEY = "ac_promptsmith_theme";

  function setPressed(theme){
    const isDark = theme === "dark";
    lightBtn.setAttribute("aria-pressed", String(!isDark));
    darkBtn.setAttribute("aria-pressed", String(isDark));
  }
  function applyTheme(theme){
    document.documentElement.setAttribute("data-theme", theme);
    setPressed(theme);
  }

  applyTheme(localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light");
  lightBtn.addEventListener("click", () => { localStorage.setItem(THEME_KEY, "light"); applyTheme("light"); });
  darkBtn.addEventListener("click", () => { localStorage.setItem(THEME_KEY, "dark"); applyTheme("dark"); });

  function toast(msg, isError=false){
    promptToast.textContent = msg;
    promptToast.style.color = isError ? "var(--danger)" : "var(--muted)";
  }

  function isProbablyUrl(s){
    try { new URL(s); return true; } catch { return false; }
  }

  function detectKind(ref){
    const r = (ref || "").trim();
    if (!r) return "text";
    if (isProbablyUrl(r)) return "url";
    // very light heuristics for paths
    const looksWindows = /^[a-zA-Z]:\\/.test(r) || r.includes("\\");
    const looksUnix = r.startsWith("/") || r.startsWith("~/");
    if (looksWindows || looksUnix) return "path";
    return "text";
  }

  function makeId(ref){
    const t = (ref || "").trim().toLowerCase();
    return `ref__${t.slice(0, 160)}__${t.length}`;
  }

  function getFocusAreas(){
    const areas = [];
    if (chkValidation.checked) areas.push("Validation & errors");
    if (chkPermissions.checked) areas.push("Permissions & roles");
    if (chkAudit.checked) areas.push("Audit/logging");
    if (chkPerformance.checked) areas.push("Performance");
    if (chkAccessibility.checked) areas.push("Accessibility");
    if (chkAnalytics.checked) areas.push("Analytics/Tracking");
    return areas;
  }

  function modeHint(){
    modeHintEl.textContent = (modeEl.value === "user")
      ? "User Oriented: generates AC for the user story."
      : "Tech Stack Focused: generates AC grouped by FE/BE/API/DB/etc. (multiple sets).";
  }

  function setDetail(level){
    detailLevel = level;

    dOutline.setAttribute("aria-pressed", String(level === "outline"));
    dLean.setAttribute("aria-pressed", String(level === "lean"));
    dBalanced.setAttribute("aria-pressed", String(level === "balanced"));
    dExhaustive.setAttribute("aria-pressed", String(level === "exhaustive"));

    if (level === "outline"){
      detailHintEl.textContent = "Outline: ultra-high-level bullets (4–6). PM scaffold to refine later.";
    } else if (level === "lean"){
      detailHintEl.textContent = "Lean (default): concise and actionable (6–9). Core outcomes + critical validations.";
    } else if (level === "balanced"){
      detailHintEl.textContent = "Balanced: fuller coverage (10–14). Happy path + key validations + select edge cases.";
    } else {
      detailHintEl.textContent = "Exhaustive: comprehensive coverage. Deep edge cases, failures, and non-functional requirements.";
    }
  }

  function setFormat(style){
    formatStyle = style;
    fSimple.setAttribute("aria-pressed", String(style === "simple"));
    fGherkin.setAttribute("aria-pressed", String(style === "gherkin"));

    formatHintEl.textContent = (style === "simple")
      ? "Simple: straightforward testable bullets (default)."
      : "Gherkin: Given/When/Then style bullets (BDD).";
  }

  function renderAttachments(){
    attachmentListEl.innerHTML = "";

    if (attachments.length === 0){
      attachMetaEl.textContent = "No attachments added (optional).";
      clearAttachmentsBtn.disabled = true;
      return;
    }

    clearAttachmentsBtn.disabled = false;

    const urlCount = attachments.filter(a => a.kind === "url").length;
    const pathCount = attachments.filter(a => a.kind === "path").length;
    const textCount = attachments.filter(a => a.kind === "text").length;

    attachMetaEl.textContent =
      `${attachments.length} attachment(s) • ${urlCount} url(s) • ${pathCount} path(s) • ${textCount} text reference(s)`;

    for (const a of attachments){
      const row = document.createElement("div");
      row.className = "fileRow";

      const top = document.createElement("div");
      top.className = "fileRowTop";

      const left = document.createElement("div");
      left.className = "fileLeft";

      const nameLine = document.createElement("div");
      nameLine.className = "fileNameLine";

      const name = document.createElement("div");
      name.className = "fileName";
      name.textContent = (a.label || "").trim() || "Attachment";

      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = a.kind === "url" ? "URL" : (a.kind === "path" ? "Path" : "Ref");

      nameLine.appendChild(name);
      nameLine.appendChild(tag);

      const meta = document.createElement("div");
      meta.className = "fileMeta";
      meta.textContent = a.ref;

      left.appendChild(nameLine);
      left.appendChild(meta);

      const right = document.createElement("div");
      right.className = "fileRight";

      const removeBtn = document.createElement("button");
      removeBtn.className = "dangerBtn";
      removeBtn.type = "button";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => {
        attachments = attachments.filter(x => x.id !== a.id);
        renderAttachments();
        updateUI();
      });
      right.appendChild(removeBtn);

      top.appendChild(left);
      top.appendChild(right);

      const grid = document.createElement("div");
      grid.className = "grid2";
      grid.style.marginTop = "10px";

      const labelBox = document.createElement("div");
      const labelLbl = document.createElement("div");
      labelLbl.className = "label";
      labelLbl.style.margin = "10px 0 6px";
      labelLbl.textContent = "Label (optional)";
      const labelInput = document.createElement("input");
      labelInput.type = "text";
      labelInput.placeholder = "e.g., Waitlist mock (mobile)";
      labelInput.value = a.label || "";
      labelInput.addEventListener("input", (e) => {
        const idx = attachments.findIndex(x => x.id === a.id);
        if (idx !== -1) attachments[idx].label = e.target.value;
        renderAttachments();
      });
      labelBox.appendChild(labelLbl);
      labelBox.appendChild(labelInput);

      const refBox = document.createElement("div");
      const refLbl = document.createElement("div");
      refLbl.className = "label";
      refLbl.style.margin = "10px 0 6px";
      refLbl.textContent = "Reference (path or URL)";
      const refInput = document.createElement("input");
      refInput.type = "text";
      refInput.placeholder = "Paste a path or URL";
      refInput.value = a.ref || "";
      refInput.addEventListener("input", (e) => {
        const idx = attachments.findIndex(x => x.id === a.id);
        if (idx !== -1){
          const newRef = e.target.value;
          attachments[idx].ref = newRef;
          attachments[idx].kind = detectKind(newRef);
          attachments[idx].id = makeId(newRef);
        }
        renderAttachments();
        updateUI();
      });
      refBox.appendChild(refLbl);
      refBox.appendChild(refInput);

      grid.appendChild(labelBox);
      grid.appendChild(refBox);

      row.appendChild(top);
      row.appendChild(grid);

      attachmentListEl.appendChild(row);
    }
  }

  function clearAllAttachments(){
    attachments = [];
    attachmentRefEl.value = "";
    renderAttachments();
  }

  function attachmentsBlock(){
    if (attachments.length === 0) return "(none)";
    return attachments.map(a => {
      const label = (a.label || "Attachment").trim();
      const ref = (a.ref || "").trim();
      if (!ref) return `- ${label} — (no reference provided)`;
      return `- ${label} — ${ref}`;
    }).join("\n");
  }

  function detailDirectives_User(){
    if (detailLevel === "outline"){
      return `
Detail level: OUTLINE
- Target 4–6 bullets total.
- Use very high-level capability statements only.
- Avoid validations, edge cases, or error handling.
- Treat this as a scaffold for a PM to refine later.
      `.trim();
    }
    if (detailLevel === "lean"){
      return `
Detail level: LEAN (default)
- Target 6–9 bullets total.
- Focus on core capability outcomes + critical validations/errors only.
- Avoid long edge-case lists; keep wording tight.
      `.trim();
    }
    if (detailLevel === "exhaustive"){
      return `
Detail level: EXHAUSTIVE
- Target 30–60+ bullets total.
- Include thorough edge cases (empty states, max length, duplicates, concurrency, retries/timeouts).
- Include security/permissions, a11y, performance, analytics where applicable.
- Include explicit negative cases and error messages where implied.
      `.trim();
    }
    return `
Detail level: BALANCED
- Target 10–14 bullets total.
- Cover happy path + key validations + a few important edge cases.
- Keep wording concise.
    `.trim();
  }

  function detailDirectives_Tech(){
    if (detailLevel === "outline"){
      return `
Detail level: OUTLINE
- For each relevant layer, provide 1–2 high-level bullets.
- Focus only on responsibility boundaries (no validations or failures).
      `.trim();
    }
    if (detailLevel === "lean"){
      return `
Detail level: LEAN (default)
- For each relevant layer, target 2–3 bullets.
- Focus on core deliverables + top validation/failure items only.
      `.trim();
    }
    if (detailLevel === "exhaustive"){
      return `
Detail level: EXHAUSTIVE
- For each relevant layer, target 8–15 bullets.
- Include failures, retries, idempotency, concurrency, schema constraints, migrations, monitoring, rate limits, caching, etc.
      `.trim();
    }
    return `
Detail level: BALANCED
- For each relevant layer, target 3–5 bullets.
- Include main flows + validations + key failure modes, but keep it concise.
    `.trim();
  }

  function formatDirective(){
    if (formatStyle === "gherkin"){
      return `
Format: GHERKIN
- Every bullet should be a Given/When/Then statement (or a compact G/W/T variant).
- Still output as bullets only (each line begins with "- ").
      `.trim();
    }
    return `
Format: SIMPLE (default)
- Use straightforward, testable bullet statements.
- Use Given/When/Then only when it genuinely clarifies behavior (don’t force it).
    `.trim();
  }

  function buildPrompt_UserOriented(){
    const story = storyEl.value.trim();
    const ctx = contextEl.value.trim();
    const focus = getFocusAreas();
    const focusBlock = focus.length ? focus.map(f => `- ${f}`).join("\n") : "(none)";

    return `
You are a senior QA lead + Product Manager.

Task:
Generate detailed, testable Acceptance Criteria (AC) for the feature below.

Output requirements:
- Output ONLY acceptance criteria bullets (each line starts with "- ").
- Do NOT include headings, introductions, or summaries.
- Each AC must be specific and verifiable. Avoid generic filler like "works correctly".
- Include happy path + negative/validation + edge cases implied by inputs.
- If assumptions are needed, make reasonable assumptions and encode them into AC (do not ask questions).

${detailDirectives_User()}

${formatDirective()}

USER STORY:
${story}

ADDITIONAL CONTEXT (optional):
${ctx || "(none)"}

ATTACHMENTS / REFERENCES (paths or URLs):
${attachmentsBlock()}

FOCUS AREAS (optional):
${focusBlock}
    `.trim();
  }

  function buildPrompt_TechStackFocused(){
    const story = storyEl.value.trim();
    const ctx = contextEl.value.trim();

    return `
You are a senior technical Product Manager and QA lead.

Task:
Using the user story below, produce acceptance criteria organized by technical layer.
Treat this as a delivery plan where multiple teams can pick up work.

Output requirements:
- Output ONLY bullet acceptance criteria (each line starts with "- ").
- Group criteria by including a short label prefix at the start of each bullet, like:
  - [Front-end] ...
  - [API] ...
  - [Back-end] ...
  - [Database] ...
  - [Integrations/Jobs] ...
  - [Security/Permissions] ...
  - [Observability] ...
- Make criteria testable and specific; avoid generic filler.
- Include edge cases and failure modes (timeouts, retries, validation, concurrency).
- Do NOT ask questions; make reasonable assumptions when needed.

${detailDirectives_Tech()}

${formatDirective()}

USER STORY:
${story}

ADDITIONAL CONTEXT (optional):
${ctx || "(none)"}

ATTACHMENTS / REFERENCES (paths or URLs):
${attachmentsBlock()}
    `.trim();
  }

  function buildCopilotPrompt(){
    return modeEl.value === "tech"
      ? buildPrompt_TechStackFocused()
      : buildPrompt_UserOriented();
  }

  async function copyToClipboard(text){
    try{
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  function updateUI(){
    const hasStory = storyEl.value.trim().length > 0;

    contextEl.disabled = !hasStory;
    attachmentRefEl.disabled = !hasStory;

    card2.setAttribute("aria-disabled", String(!hasStory));
    card3.setAttribute("aria-disabled", String(!hasStory));
    card4.setAttribute("aria-disabled", String(!hasStory));

    copyPromptBtn.disabled = !hasStory;

    const refOk = hasStory && attachmentRefEl.value.trim().length > 0;
    addAttachmentBtn.disabled = !refOk;

    if (!hasStory){
      s1.className = "pill bad"; s1.textContent = "Step 1: User story required";
      s2.className = "pill warn"; s2.textContent = "Step 2–3: Optional (locked)";
      s3.className = "pill warn"; s3.textContent = "Step 4: Locked";
    } else {
      s1.className = "pill ok"; s1.textContent = "Step 1: Ready";
      s2.className = "pill ok"; s2.textContent = "Step 2–3: Optional";
      s3.className = "pill ok"; s3.textContent = "Step 4: Ready";
    }
  }

  // Events
  storyEl.addEventListener("input", () => { toast(""); updateUI(); });
  contextEl.addEventListener("input", updateUI);

  attachmentRefEl.addEventListener("input", updateUI);
  attachmentRefEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter"){
      e.preventDefault();
      if (!addAttachmentBtn.disabled) addAttachmentBtn.click();
    }
  });

  addAttachmentBtn.addEventListener("click", () => {
    const ref = attachmentRefEl.value.trim();
    if (!ref) return;

    const id = makeId(ref);
    if (attachments.some(a => a.id === id)){
      toast("That attachment reference is already added.", true);
      return;
    }

    const kind = detectKind(ref);
    let label = "Attachment";
    if (kind === "url"){
      try {
        const u = new URL(ref);
        const host = u.hostname.replace(/^www\./, "");
        if (host.includes("figma.com")) label = "Figma";
        else if (host.includes("1drv.ms") || host.includes("sharepoint") || host.includes("onedrive")) label = "SharePoint/OneDrive";
        else label = host;
      } catch {}
    } else if (kind === "path") {
      label = "Local file path";
    } else {
      label = "Reference";
    }

    attachments.push({ id, label, ref, kind });
    attachmentRefEl.value = "";
    toast("");
    renderAttachments();
    updateUI();
  });

  clearAttachmentsBtn.addEventListener("click", () => {
    clearAllAttachments();
    toast("");
    updateUI();
  });

  modeEl.addEventListener("change", () => modeHint());

  [chkValidation, chkPermissions, chkAudit, chkPerformance, chkAccessibility, chkAnalytics].forEach(el=>{
    el.addEventListener("change", updateUI);
  });

  dOutline.addEventListener("click", () => setDetail("outline"));
  dLean.addEventListener("click", () => setDetail("lean"));
  dBalanced.addEventListener("click", () => setDetail("balanced"));
  dExhaustive.addEventListener("click", () => setDetail("exhaustive"));

  fSimple.addEventListener("click", () => setFormat("simple"));
  fGherkin.addEventListener("click", () => setFormat("gherkin"));

  copyPromptBtn.addEventListener("click", async () => {
    const story = storyEl.value.trim();
    if (!story){
      toast("Please fill in the User Story first.", true);
      storyEl.focus();
      return;
    }

    const prompt = buildCopilotPrompt();
    const ok = await copyToClipboard(prompt);

    toast(
      ok
        ? "Prompt copied. Paste into Copilot Chat to generate Acceptance Criteria."
        : "Clipboard blocked. Please allow clipboard permissions.",
      !ok
    );
  });

  clearBtn.addEventListener("click", () => {
    storyEl.value = "";
    contextEl.value = "";
    attachmentRefEl.value = "";
    clearAllAttachments();

    chkValidation.checked = true;
    chkPermissions.checked = false;
    chkAudit.checked = false;
    chkPerformance.checked = false;
    chkAccessibility.checked = false;
    chkAnalytics.checked = false;

    modeEl.value = "user";
    modeHint();

    setDetail("lean");
    setFormat("simple");

    toast("");
    updateUI();
  });

  // Init
  contextEl.disabled = true;
  attachmentRefEl.disabled = true;

  attachMetaEl.textContent = "No attachments added (optional).";
  modeHint();
  setDetail("lean");
  setFormat("simple");
  renderAttachments();
  updateUI();
});
