const SUPABASE_URL = "https://vpwdifiavxqfbhbwhhxb.supabase.co";
const SUPABASE_KEY = "sb_publishable_4JIsaXoSkNgBsibMwNVByw_XnM3-iEk";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const loginBox = document.getElementById("loginBox");
const app = document.getElementById("app");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const accountBtn = document.getElementById("accountBtn");
const logoutBtn = document.getElementById("logoutBtn");
const addPersonBtn = document.getElementById("addPersonBtn");
const personNameInput = document.getElementById("personName");
const accountEmail = document.getElementById("accountEmail");
const privacyBtn = document.getElementById("privacyBtn");
const supportBtn = document.getElementById("supportBtn");
const accountDeletionInfoBtn = document.getElementById("accountDeletionInfoBtn");
const requestDeletionBtn = document.getElementById("requestDeletionBtn");
const dashboard = document.getElementById("dashboard");
const dashboardHint = document.getElementById("dashboardHint");
const personsDiv = document.getElementById("persons");
const overviewPage = document.getElementById("overviewPage");
const accountPage = document.getElementById("accountPage");
const accountSubPage = document.getElementById("accountSubPage");
const accountSubPageContent = document.getElementById("accountSubPageContent");
const personPage = document.getElementById("personPage");
const backToOverviewBtn = document.getElementById("backToOverviewBtn");
const detail = document.getElementById("detail");

const state = {
  currentUser: null,
  currentPersonId: null,
  persons: [],
  debts: [],
  payments: []
};

let currentChart = null;

loginBtn.addEventListener("click", login);
signupBtn.addEventListener("click", signUp);
accountBtn.addEventListener("click", handleAccountButtonClick);
logoutBtn.addEventListener("click", logout);
addPersonBtn.addEventListener("click", addPerson);
privacyBtn.addEventListener("click", () => openAccountSubPage("privacy"));
supportBtn.addEventListener("click", () => openAccountSubPage("support"));
accountDeletionInfoBtn.addEventListener("click", () => openAccountSubPage("delete"));
requestDeletionBtn.addEventListener("click", requestAccountDeletion);
backToOverviewBtn.addEventListener("click", openOverviewPage);
personsDiv.addEventListener("click", handlePersonsClick);
detail.addEventListener("click", handleDetailClick);
window.addEventListener("hashchange", syncRouteFromHash);

emailInput.addEventListener("keydown", handleLoginKeyDown);
passwordInput.addEventListener("keydown", handleLoginKeyDown);

setTimeout(() => {
  document.querySelectorAll('input[type="date"]').forEach((input) => {
    if (!input.value) input.value = todayString();
  });
}, 0);

(async () => {
  const { data, error } = await sb.auth.getSession();
  if (error) {
    console.error("Session-Fehler:", error);
    return;
  }

  if (data.session) {
    state.currentUser = data.session.user;
    showApp();
  }
})();

function handleLoginKeyDown(event) {
  if (event.key === "Enter") {
    login();
  }
}

async function login() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Bitte Email und Passwort eingeben.");
    return;
  }

  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    alert("Login fehlgeschlagen: " + error.message);
    return;
  }

  state.currentUser = data.user;
  showApp();
}

async function signUp() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Bitte E-Mail und Passwort eingeben.");
    return;
  }

  if (password.length < 6) {
    alert("Das Passwort sollte mindestens 6 Zeichen lang sein.");
    return;
  }

  const { data, error } = await sb.auth.signUp({
    email,
    password
  });

  if (error) {
    alert("Registrierung fehlgeschlagen: " + error.message);
    return;
  }

  if (data.session && data.user) {
    state.currentUser = data.user;
    showApp();
    alert("Registrierung erfolgreich. Du bist jetzt eingeloggt.");
    return;
  }

  alert("Registrierung erfolgreich. Bitte bestätige jetzt deine E-Mail-Adresse und logge dich danach ein.");
}

async function logout() {
  await sb.auth.signOut();
  state.currentUser = null;
  state.currentPersonId = null;
  state.persons = [];
  state.debts = [];
  state.payments = [];
  if (currentChart) currentChart.destroy();
  currentChart = null;
  app.classList.add("hidden");
  accountBtn.classList.add("hidden");
  logoutBtn.classList.add("hidden");
  loginBox.style.display = "block";
  location.hash = "";
  overviewPage.classList.remove("hidden");
  accountPage.classList.add("hidden");
  personPage.classList.add("hidden");
}

function showApp() {
  loginBox.style.display = "none";
  app.classList.remove("hidden");
  accountBtn.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");
  renderAccountBox();
  load();
}

function renderAccountBox() {
  accountEmail.textContent = state.currentUser && state.currentUser.email ? state.currentUser.email : "-";
}

function updateHeaderButtons() {
  accountBtn.textContent = isAccountRoute() ? "Zur Übersicht" : "Mein Konto";
}

function handleAccountButtonClick() {
  if (isAccountRoute()) {
    openOverviewPage();
    return;
  }

  openAccountPage();
}

function setActiveAccountButton(activeKind) {
  const buttons = [
    ["privacy", privacyBtn],
    ["support", supportBtn],
    ["delete", accountDeletionInfoBtn]
  ];

  buttons.forEach(([kind, button]) => {
    button.classList.toggle("active", kind === activeKind);
  });
}

async function addPerson() {
  if (!state.currentUser) {
    alert("Nicht eingeloggt.");
    return;
  }

  const name = personNameInput.value.trim();
  if (!name) {
    alert("Bitte einen Namen eingeben.");
    return;
  }

  const { error } = await sb.from("persons").insert([{
    name: name,
    user_id: state.currentUser.id
  }]);

  if (error) {
    alert("Person konnte nicht gespeichert werden: " + error.message);
    return;
  }

  personNameInput.value = "";
  await load();
}

async function requestAccountDeletion() {
  if (!state.currentUser) {
    alert("Du bist nicht eingeloggt.");
    return;
  }

  const confirmed = confirm("Möchtest du die Kontolöschung anfordern? Dein Konto wird dann manuell geprüft und anschließend gelöscht.");
  if (!confirmed) return;

  const { error } = await sb.from("deletion_requests").insert([{
    user_id: state.currentUser.id,
    email: state.currentUser.email || "",
    status: "open"
  }]);

  if (error) {
    handleSchemaError(error, "Die Kontolösch-Anfrage konnte nicht gespeichert werden.");
    return;
  }

  alert("Deine Kontolösch-Anfrage wurde gespeichert. Alle Details findest du zusätzlich auf der Seite Kontolöschung.");
}

async function load() {
  state.currentPersonId = readPersonIdFromHash();

  const [personsResult, debtsResult, paymentsResult] = await Promise.all([
    sb.from("persons").select("*").eq("user_id", state.currentUser.id),
    sb.from("debts").select("*").eq("user_id", state.currentUser.id),
    sb.from("payments").select("*").eq("user_id", state.currentUser.id)
  ]);

  if (personsResult.error || debtsResult.error || paymentsResult.error) {
    const allErrors = [personsResult.error, debtsResult.error, paymentsResult.error].filter(Boolean);
    const hasUnauthorized = allErrors.some((error) => String(error.status) === "401" || String(error.code) === "401");
    alert(hasUnauthorized
      ? "Daten konnten nicht geladen werden. Der Supabase Publishable Key ist wahrscheinlich ungültig oder fehlt."
      : "Daten konnten nicht geladen werden. Prüfe bitte auch die SQL-Datei für Supabase.");
    console.error({
      personsError: personsResult.error,
      debtsError: debtsResult.error,
      paymentsError: paymentsResult.error
    });
    return;
  }

  state.persons = personsResult.data || [];
  state.debts = debtsResult.data || [];
  state.payments = paymentsResult.data || [];

  if (state.currentPersonId && !state.persons.some((person) => person.id === state.currentPersonId)) {
    state.currentPersonId = null;
    if (readPersonIdFromHash()) {
      location.hash = "";
    }
  }

  renderDashboard();
  renderAccountBox();
  renderPersons();
  syncRouteFromHash();
}

function renderDashboard() {
  let totalIOwe = 0;
  let totalTheyOwe = 0;

  state.persons.forEach((person) => {
    const summary = getPersonSummary(person.id);
    totalIOwe += summary.openIOwe;
    totalTheyOwe += summary.openTheyOwe;
  });

  const net = totalTheyOwe - totalIOwe;

  dashboard.innerHTML = `
    <div class="stats-grid">
      <div class="metric">
        <span class="muted">Ich schulde</span>
        <strong>${formatCurrency(totalIOwe)}</strong>
      </div>
      <div class="metric">
        <span class="muted">Personen schulden mir</span>
        <strong>${formatCurrency(totalTheyOwe)}</strong>
      </div>
      <div class="metric">
        <span class="muted">Mein Saldo</span>
        <strong>${formatCurrency(net)}</strong>
      </div>
    </div>
  `;

  dashboardHint.textContent = state.persons.length
    ? "Wähle eine Person aus, um Schulden, Tilgung und Raten zu bearbeiten."
    : "Lege deine erste Person an.";
}

function renderPersons() {
  if (!state.persons.length) {
    personsDiv.innerHTML = `
      <div class="card">
        <div class="empty">Noch keine Personen vorhanden.</div>
      </div>
    `;
    return;
  }

  personsDiv.innerHTML = state.persons.map((person) => {
    const summary = getPersonSummary(person.id);
    const payoffText = summary.nextPayoffText || "Keine aktive Rate";
    const isActive = state.currentPersonId === person.id ? "active" : "";

    return `
      <div class="person-card ${isActive}">
        <div class="row">
          <div>
            <h3>${escapeHtml(person.name)}</h3>
            <div class="muted">Offen gesamt: ${formatCurrency(summary.netBalance)}</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="secondary" data-action="open-person" data-id="${person.id}">Öffnen</button>
            <button class="ghost" data-action="edit-person" data-id="${person.id}">Umbenennen</button>
            <button class="danger" data-action="delete-person" data-id="${person.id}">Löschen</button>
          </div>
        </div>

        <div class="person-grid" style="margin-top: 12px;">
          <div class="metric">
            <span class="muted">Ich schulde</span>
            <strong>${formatCurrency(summary.openIOwe)}</strong>
          </div>
          <div class="metric">
            <span class="muted">Person schuldet</span>
            <strong>${formatCurrency(summary.openTheyOwe)}</strong>
          </div>
        </div>

        <div>
          <span class="pill">Monatliche Raten: ${formatCurrency(summary.monthlyRateTotal)}</span>
          <span class="pill">${escapeHtml(payoffText)}</span>
        </div>
      </div>
    `;
  }).join("");
}

function handlePersonsClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;

  if (action === "open-person") {
    openPersonPage(id);
    return;
  }

  if (action === "edit-person") {
    editPerson(id);
    return;
  }

  if (action === "delete-person") {
    deletePerson(id);
  }
}

async function editPerson(id) {
  const person = state.persons.find((item) => item.id === id);
  if (!person) return;

  const newName = prompt("Neuer Name:", person.name);
  if (!newName || !newName.trim()) return;

  const { error } = await sb.from("persons")
    .update({ name: newName.trim() })
    .eq("id", id)
    .eq("user_id", state.currentUser.id);

  if (error) {
    alert("Fehler beim Umbenennen: " + error.message);
    return;
  }

  await load();
}

async function deletePerson(id) {
  const confirmed = confirm("Person und alle zugehörigen Daten wirklich löschen?");
  if (!confirmed) return;

  const debtsForPerson = state.debts.filter((item) => item.person_id === id);
  const debtIds = debtsForPerson.map((item) => item.id);

  const { error: paymentsByPersonError } = await sb.from("payments")
    .delete()
    .eq("person_id", id)
    .eq("user_id", state.currentUser.id);

  if (paymentsByPersonError) {
    alert("Fehler beim Löschen der Zahlungen: " + paymentsByPersonError.message);
    return;
  }

  if (debtIds.length) {
    const { error: paymentsError } = await sb.from("payments")
      .delete()
      .in("debt_id", debtIds)
      .eq("user_id", state.currentUser.id);

    if (paymentsError) {
      alert("Fehler beim Löschen der Zahlungen: " + paymentsError.message);
      return;
    }
  }

  const { error: debtsError } = await sb.from("debts")
    .delete()
    .eq("person_id", id)
    .eq("user_id", state.currentUser.id);

  if (debtsError) {
    alert("Fehler beim Löschen der Schulden: " + debtsError.message);
    return;
  }

  const { error: personError } = await sb.from("persons")
    .delete()
    .eq("id", id)
    .eq("user_id", state.currentUser.id);

  if (personError) {
    alert("Fehler beim Löschen der Person: " + personError.message);
    return;
  }

  if (state.currentPersonId === id) {
    openOverviewPage();
  }

  await load();
}

function renderPersonDetail(personId) {
  const person = state.persons.find((item) => item.id === personId);
  if (!person) {
    openOverviewPage();
    return;
  }

  const summary = getPersonSummary(personId);
  const recurringPayments = getPersonPayments(personId).filter(isRecurringRate);
  const timeline = buildTimeline(personId);
  const defaultDate = todayString();

  detail.classList.remove("hidden");
  detail.innerHTML = `
    <div class="stack">
      <div class="row">
        <div>
          <h2>${escapeHtml(person.name)}</h2>
          <p class="subtitle">Alle Schulden, Tilgungen und monatlichen Raten für diese Person</p>
        </div>
      </div>

      <div class="summary-grid">
        <div class="metric">
          <span class="muted">Ich schulde aktuell</span>
          <strong>${formatCurrency(summary.openIOwe)}</strong>
        </div>
        <div class="metric">
          <span class="muted">Person schuldet aktuell</span>
          <strong>${formatCurrency(summary.openTheyOwe)}</strong>
        </div>
        <div class="metric">
          <span class="muted">Monatliche Raten gesamt</span>
          <strong>${formatCurrency(summary.monthlyRateTotal)}</strong>
        </div>
        <div class="metric">
          <span class="muted">Voraussichtlich getilgt</span>
          <strong style="font-size: 18px; line-height: 1.4;">${escapeHtml(summary.nextPayoffText)}</strong>
        </div>
      </div>

      <div class="detail-grid">
        <div class="stack">
          <div class="card" style="margin: 0;">
            <h3>Neue Schuld hinzugefügt</h3>
            <div class="form-grid" style="margin-top: 14px;">
              <div>
                <label for="debtDirection">Richtung</label>
                <select id="debtDirection">
                  <option value="i_owe">Ich schulde</option>
                  <option value="person_owes_me">Person schuldet</option>
                </select>
              </div>
              <div>
                <label for="debtAmount">Betrag</label>
                <input id="debtAmount" type="number" min="0" step="0.01" placeholder="0.00">
              </div>
              <div>
                <label for="debtDate">Datum</label>
                <input id="debtDate" type="date" value="${defaultDate}">
              </div>
              <div>
                <label for="debtNote">Notiz</label>
                <input id="debtNote" placeholder="Zum Beispiel Rechnung">
              </div>
              <div>
                <button data-action="add-debt">Schuld speichern</button>
              </div>
            </div>
          </div>

          <div class="card" style="margin: 0;">
            <h3>Tilgung eintragen</h3>
            <div class="form-grid" style="margin-top: 14px;">
              <div>
                <label for="paymentAmount">Betrag</label>
                <input id="paymentAmount" type="number" min="0" step="0.01" placeholder="0.00">
              </div>
              <div>
                <label for="paymentDate">Datum</label>
                <input id="paymentDate" type="date" value="${defaultDate}">
              </div>
              <div>
                <label for="paymentNote">Notiz</label>
                <input id="paymentNote" placeholder="Zum Beispiel Bar bezahlt">
              </div>
              <div>
                <button class="success" data-action="add-payment">Tilgung speichern</button>
              </div>
            </div>
          </div>

          <div class="card" style="margin: 0;">
            <h3>Ratenzahlung monatlich wiederkehrend</h3>
            <div class="form-grid" style="margin-top: 14px;">
              <div>
                <label for="rateAmount">Monatlicher Betrag</label>
                <input id="rateAmount" type="number" min="0" step="0.01" placeholder="0.00">
              </div>
              <div>
                <label for="rateStartDate">Startdatum</label>
                <input id="rateStartDate" type="date" value="${defaultDate}">
              </div>
              <div>
                <label for="rateNote">Notiz</label>
                <input id="rateNote" placeholder="Zum Beispiel monatliche Rate">
              </div>
              <div>
                <button data-action="add-rate">Rate speichern</button>
              </div>
            </div>
          </div>

          <div class="card" style="margin: 0;">
            <h3>Verlauf</h3>
            <div class="timeline">
              ${timeline.length ? timeline.map(renderTimelineItem).join("") : '<div class="empty">Noch keine Einträge vorhanden.</div>'}
            </div>
          </div>
        </div>

        <div class="stack">
          <div class="card" style="margin: 0;">
            <h3>Statistik pro Person</h3>
            <div class="stack" style="margin-top: 14px;">
              <div class="row">
                <span class="muted">Schulden hinzugekommen</span>
                <strong>${formatCurrency(summary.totalDebtAdded)}</strong>
              </div>
              <div class="row">
                <span class="muted">Gezahlt / angerechnet</span>
                <strong>${formatCurrency(summary.totalPaid)}</strong>
              </div>
              <div class="row">
                <span class="muted">Neue Schulden aktuell offen</span>
                <strong>${formatCurrency(summary.totalOpenAbsolute)}</strong>
              </div>
              <div class="row">
                <span class="muted">Nächste Prognose</span>
                <strong style="font-size: 15px;">${escapeHtml(summary.nextPayoffText)}</strong>
              </div>
            </div>
          </div>

          <div class="card" style="margin: 0;">
            <h3>Aktive Raten</h3>
            <div class="timeline" style="margin-top: 14px;">
              ${recurringPayments.length ? recurringPayments.map(renderRecurringItem).join("") : '<div class="empty">Keine aktive monatliche Rate.</div>'}
            </div>
          </div>

          <div class="card" style="margin: 0;">
            <h3>Saldo Verlauf</h3>
            <p class="subtitle" style="margin-bottom: 14px;">Linie zeigt den Nettosaldo über die Zeit.</p>
            <canvas id="chart"></canvas>
          </div>
        </div>
      </div>
    </div>
  `;

  drawChart(personId);
}

function handleDetailClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const action = button.dataset.action;

  if (action === "add-debt") {
    addDebt();
    return;
  }

  if (action === "add-payment") {
    addPayment();
    return;
  }

  if (action === "add-rate") {
    addRecurringRate();
    return;
  }

  if (action === "stop-rate") {
    stopRecurringRate(button.dataset.id);
    return;
  }

  if (action === "delete-debt") {
    deleteDebtEntry(button.dataset.id);
    return;
  }

  if (action === "delete-payment") {
    deletePaymentEntry(button.dataset.id);
  }
}

function readPersonIdFromHash() {
  const hash = window.location.hash || "";
  if (!hash.startsWith("#person/")) return null;
  return decodeURIComponent(hash.slice("#person/".length)) || null;
}

function isAccountRoute() {
  return window.location.hash === "#account" || window.location.hash.startsWith("#account/");
}

function openPersonPage(personId) {
  window.location.hash = "#person/" + encodeURIComponent(personId);
}

function openAccountPage() {
  window.location.hash = "#account";
}

function openAccountSubPage(kind) {
  window.location.hash = "#account/" + kind;
}

function openOverviewPage() {
  if (window.location.hash) {
    window.location.hash = "";
  } else {
    state.currentPersonId = null;
    syncRouteFromHash();
  }
}

function syncRouteFromHash() {
  if (!state.currentUser) return;

  updateHeaderButtons();

  if (isAccountRoute()) {
    state.currentPersonId = null;
    overviewPage.classList.add("hidden");
    accountPage.classList.remove("hidden");
    personPage.classList.add("hidden");
    detail.innerHTML = "";
    renderAccountSubPage();
    renderPersons();
    return;
  }

  const routePersonId = readPersonIdFromHash();
  const personExists = routePersonId && state.persons.some((person) => person.id === routePersonId);

  if (personExists) {
    state.currentPersonId = routePersonId;
    overviewPage.classList.add("hidden");
    accountPage.classList.add("hidden");
    personPage.classList.remove("hidden");
    renderPersons();
    renderPersonDetail(routePersonId);
    return;
  }

  state.currentPersonId = null;
  overviewPage.classList.remove("hidden");
  accountPage.classList.add("hidden");
  accountSubPage.classList.add("hidden");
  personPage.classList.add("hidden");
  detail.innerHTML = "";
  renderPersons();
}

function renderAccountSubPage() {
  const hash = window.location.hash || "";
  const subRoute = hash.startsWith("#account/") ? hash.slice("#account/".length) : "";

  if (!subRoute) {
    accountSubPage.classList.add("hidden");
    accountSubPageContent.innerHTML = "";
    setActiveAccountButton("");
    return;
  }

  accountSubPage.classList.remove("hidden");
  setActiveAccountButton(subRoute);

  if (subRoute === "privacy") {
    accountSubPageContent.innerHTML = `
      <h3>Datenschutz</h3>
      <p class="subtitle">Bitte ersetze vor der Veröffentlichung die Platzhalter mit deinen echten Daten.</p>
      <div class="metric">
        <strong>Verantwortlicher</strong>
        <p class="muted" style="margin-top: 10px;">&lt;Dein Name oder Firmenname&gt;<br>&lt;Straße und Hausnummer&gt;<br>&lt;PLZ Ort&gt;<br>&lt;support@deinedomain.de&gt;</p>
      </div>
      <div class="metric">
        <strong>Verarbeitete Daten</strong>
        <p class="muted" style="margin-top: 10px;">E-Mail-Adresse, Login-Daten, Personen, Schulden, Tilgungen, Ratenzahlungen und Notizen.</p>
      </div>
      <div class="metric">
        <strong>Dienstleister</strong>
        <p class="muted" style="margin-top: 10px;">Cloudflare für Hosting und Supabase für Authentifizierung und Datenbank.</p>
      </div>
    `;
    return;
  }

  if (subRoute === "support") {
    accountSubPageContent.innerHTML = `
      <h3>Support</h3>
      <p class="subtitle">Nutze diese Infos später auch für den App Store und Google Play.</p>
      <div class="metric">
        <strong>Kontakt</strong>
        <p class="muted" style="margin-top: 10px;">Support-E-Mail: &lt;support@deinedomain.de&gt;<br>Anbieter: &lt;Dein Name oder Firmenname&gt;</p>
      </div>
      <div class="metric">
        <strong>Bitte mitschicken</strong>
        <p class="muted" style="margin-top: 10px;">Gerät, Betriebssystem, kurze Fehlerbeschreibung und wenn möglich einen Screenshot.</p>
      </div>
    `;
    return;
  }

  accountSubPageContent.innerHTML = `
    <h3>Kontolöschung</h3>
    <p class="subtitle">Diese Informationen brauchst du auch für Apple und Google.</p>
    <div class="metric">
      <strong>Löschung in der App</strong>
      <p class="muted" style="margin-top: 10px;">Über den Button „Kontolöschung anfordern“ auf der Kontoseite kannst du die Löschung deines Kontos starten.</p>
    </div>
    <div class="metric">
      <strong>Löschung außerhalb der App</strong>
      <p class="muted" style="margin-top: 10px;">Alternativ per E-Mail an: &lt;support@deinedomain.de&gt;</p>
    </div>
    <div class="metric">
      <strong>Welche Daten gelöscht werden</strong>
      <p class="muted" style="margin-top: 10px;">Benutzerkonto, Personen, Schulden, Tilgungen, Ratenzahlungen und zugehörige Notizen, soweit keine gesetzlichen Pflichten entgegenstehen.</p>
    </div>
  `;
}

async function addDebt() {
  const personId = state.currentPersonId;
  if (!personId) return;

  const direction = document.getElementById("debtDirection").value;
  const amount = toAmount(document.getElementById("debtAmount").value);
  const bookedAt = document.getElementById("debtDate").value || todayString();
  const note = document.getElementById("debtNote").value.trim();

  if (!amount) {
    alert("Bitte einen Betrag eingeben.");
    return;
  }

  const { error } = await sb.from("debts").insert([{
    user_id: state.currentUser.id,
    person_id: personId,
    amount: amount,
    direction: direction,
    booked_at: bookedAt,
    note: note
  }]);

  if (error) {
    handleSchemaError(error, "Schuld konnte nicht gespeichert werden.");
    return;
  }

  document.getElementById("debtAmount").value = "";
  document.getElementById("debtNote").value = "";
  await load();
}

async function addPayment() {
  const personId = state.currentPersonId;
  if (!personId) return;

  const amount = toAmount(document.getElementById("paymentAmount").value);
  const bookedAt = document.getElementById("paymentDate").value || todayString();
  const note = document.getElementById("paymentNote").value.trim();

  if (!amount) {
    alert("Bitte einen Betrag für die Tilgung eingeben.");
    return;
  }

  const autoDirection = getAutomaticDirection(personId);
  if (!autoDirection.direction) {
    alert(getAutomaticDirectionText(autoDirection));
    return;
  }

  const direction = autoDirection.direction;
  const referenceDebt = getLatestDebtForDirection(personId, direction);
  if (!referenceDebt) {
    alert("Es gibt noch keine passende offene Schuld für diese Tilgung.");
    return;
  }

  const { error } = await sb.from("payments").insert([{
    user_id: state.currentUser.id,
    person_id: personId,
    debt_id: referenceDebt.id,
    amount: amount,
    direction: direction,
    payment_type: "tilgung",
    booked_at: bookedAt,
    is_recurring: false,
    active: true,
    note: note
  }]);

  if (error) {
    handleSchemaError(error, "Tilgung konnte nicht gespeichert werden.");
    return;
  }

  document.getElementById("paymentAmount").value = "";
  document.getElementById("paymentNote").value = "";
  await load();
}

async function addRecurringRate() {
  const personId = state.currentPersonId;
  if (!personId) return;

  const amount = toAmount(document.getElementById("rateAmount").value);
  const startDate = document.getElementById("rateStartDate").value || todayString();
  const note = document.getElementById("rateNote").value.trim();

  if (!amount) {
    alert("Bitte einen monatlichen Betrag eingeben.");
    return;
  }

  const autoDirection = getAutomaticDirection(personId);
  if (!autoDirection.direction) {
    alert(getAutomaticDirectionText(autoDirection));
    return;
  }

  const direction = autoDirection.direction;
  const referenceDebt = getLatestDebtForDirection(personId, direction);
  if (!referenceDebt) {
    alert("Es gibt noch keine passende offene Schuld für diese Rate.");
    return;
  }

  const { error } = await sb.from("payments").insert([{
    user_id: state.currentUser.id,
    person_id: personId,
    debt_id: referenceDebt.id,
    amount: amount,
    direction: direction,
    payment_type: "rate",
    booked_at: startDate,
    recurring_start: startDate,
    is_recurring: true,
    active: true,
    note: note
  }]);

  if (error) {
    handleSchemaError(error, "Rate konnte nicht gespeichert werden.");
    return;
  }

  document.getElementById("rateAmount").value = "";
  document.getElementById("rateNote").value = "";
  await load();
}

async function stopRecurringRate(id) {
  const { error } = await sb.from("payments")
    .update({ active: false, recurring_end: todayString() })
    .eq("id", id)
    .eq("user_id", state.currentUser.id);

  if (error) {
    handleSchemaError(error, "Rate konnte nicht beendet werden.");
    return;
  }

  await load();
}

async function deleteDebtEntry(id) {
  const confirmed = confirm("Diesen Schuldeneintrag wirklich löschen?");
  if (!confirmed) return;

  const { error: paymentsError } = await sb.from("payments")
    .delete()
    .eq("debt_id", id)
    .eq("user_id", state.currentUser.id);

  if (paymentsError) {
    alert("Verknüpfte Zahlungen konnten nicht gelöscht werden: " + paymentsError.message);
    return;
  }

  const { error } = await sb.from("debts")
    .delete()
    .eq("id", id)
    .eq("user_id", state.currentUser.id);

  if (error) {
    alert("Eintrag konnte nicht gelöscht werden: " + error.message);
    return;
  }

  await load();
}

async function deletePaymentEntry(id) {
  const confirmed = confirm("Diesen Zahlungs- oder Rateneintrag wirklich löschen?");
  if (!confirmed) return;

  const { error } = await sb.from("payments")
    .delete()
    .eq("id", id)
    .eq("user_id", state.currentUser.id);

  if (error) {
    alert("Eintrag konnte nicht gelöscht werden: " + error.message);
    return;
  }

  await load();
}

function getPersonSummary(personId) {
  const personDebts = getPersonDebts(personId);
  const personPayments = getPersonPayments(personId);

  const debtIOwe = sumAmount(personDebts.filter((item) => getDirection(item) === "i_owe"));
  const debtTheyOwe = sumAmount(personDebts.filter((item) => getDirection(item) === "person_owes_me"));

  const tilgungIOwe = sumAmount(personPayments.filter((item) => isTilgung(item) && getDirection(item) === "i_owe"));
  const tilgungTheyOwe = sumAmount(personPayments.filter((item) => isTilgung(item) && getDirection(item) === "person_owes_me"));
  const ratePaidIOwe = sumRecurringPaid(personPayments.filter((item) => isRatePlan(item) && getDirection(item) === "i_owe"));
  const ratePaidTheyOwe = sumRecurringPaid(personPayments.filter((item) => isRatePlan(item) && getDirection(item) === "person_owes_me"));

  const paidIOwe = tilgungIOwe + ratePaidIOwe;
  const paidTheyOwe = tilgungTheyOwe + ratePaidTheyOwe;

  const openIOwe = Math.max(0, debtIOwe - paidIOwe);
  const openTheyOwe = Math.max(0, debtTheyOwe - paidTheyOwe);
  const netBalance = openTheyOwe - openIOwe;

  const activeRatesIOwe = personPayments.filter((item) => isRecurringRate(item) && getDirection(item) === "i_owe");
  const activeRatesTheyOwe = personPayments.filter((item) => isRecurringRate(item) && getDirection(item) === "person_owes_me");
  const monthlyIOwe = sumAmount(activeRatesIOwe);
  const monthlyTheyOwe = sumAmount(activeRatesTheyOwe);

  const payoffIOwe = estimatePayoff(openIOwe, activeRatesIOwe);
  const payoffTheyOwe = estimatePayoff(openTheyOwe, activeRatesTheyOwe);

  return {
    debtIOwe,
    debtTheyOwe,
    tilgungIOwe: paidIOwe,
    tilgungTheyOwe: paidTheyOwe,
    oneTimeTilgungIOwe: tilgungIOwe,
    oneTimeTilgungTheyOwe: tilgungTheyOwe,
    ratePaidIOwe,
    ratePaidTheyOwe,
    openIOwe,
    openTheyOwe,
    netBalance,
    totalDebtAdded: debtIOwe + debtTheyOwe,
    totalPaid: paidIOwe + paidTheyOwe,
    totalOpenAbsolute: openIOwe + openTheyOwe,
    monthlyRateTotal: monthlyIOwe + monthlyTheyOwe,
    nextPayoffText: buildPayoffText(payoffIOwe, payoffTheyOwe)
  };
}

function getPersonDebts(personId) {
  return state.debts.filter((item) => item.person_id === personId);
}

function getPersonPayments(personId) {
  const debtIds = new Set(getPersonDebts(personId).map((item) => item.id));
  const seen = new Set();

  return state.payments.filter((item) => {
    const matches = item.person_id === personId || debtIds.has(item.debt_id);
    if (!matches) return false;
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function getLatestDebtForDirection(personId, direction) {
  return getPersonDebts(personId)
    .filter((item) => getDirection(item) === direction)
    .sort((a, b) => new Date(getBookedAt(b)).getTime() - new Date(getBookedAt(a)).getTime())[0] || null;
}

function getAutomaticDirection(personId) {
  const summary = getPersonSummary(personId);
  const hasIOwe = summary.openIOwe > 0;
  const hasTheyOwe = summary.openTheyOwe > 0;

  if (hasIOwe && !hasTheyOwe) {
    return { direction: "i_owe", reason: "single_open_side" };
  }

  if (hasTheyOwe && !hasIOwe) {
    return { direction: "person_owes_me", reason: "single_open_side" };
  }

  if (!hasIOwe && !hasTheyOwe) {
    return { direction: null, reason: "no_open_debt" };
  }

  return { direction: null, reason: "ambiguous" };
}

function getAutomaticDirectionText(autoDirection) {
  if (autoDirection.direction === "i_owe") {
    return "Automatisch: Ich schulde dieser Person noch Geld";
  }

  if (autoDirection.direction === "person_owes_me") {
    return "Automatisch: Diese Person schuldet mir noch Geld";
  }

  if (autoDirection.reason === "ambiguous") {
    return "Momentan sind auf beiden Seiten offene Beträge. Bitte zuerst nur eine offene Richtung bestehen lassen.";
  }

  return "Es gibt aktuell keine offene Schuld. Lege zuerst eine neue Schuld an.";
}

function estimatePayoff(openAmount, rates) {
  const activeRates = rates.filter(isRecurringRate);
  const monthlyTotal = sumAmount(activeRates);
  if (!openAmount || !monthlyTotal) return null;

  const dates = activeRates
    .map((item) => getRecurringStart(item))
    .filter(Boolean)
    .sort();

  const today = todayString();
  const currentRatesExist = dates.some((date) => date <= today);
  const baseDate = currentRatesExist ? today : (dates[0] || today);
  const months = Math.ceil(openAmount / monthlyTotal);
  const payoffDate = addMonths(baseDate, Math.max(0, months - 1));

  return {
    monthlyTotal,
    months,
    payoffDate
  };
}

function buildPayoffText(payoffIOwe, payoffTheyOwe) {
  const texts = [];

  if (payoffIOwe) {
    texts.push("Meine Schuld voraussichtlich getilgt bis " + formatDate(payoffIOwe.payoffDate));
  }

  if (payoffTheyOwe) {
    texts.push("Forderung voraussichtlich erledigt bis " + formatDate(payoffTheyOwe.payoffDate));
  }

  return texts.length ? texts.join(" | ") : "Noch keine aktive Rate für eine Prognose";
}

function buildTimeline(personId) {
  const debtItems = getPersonDebts(personId).map((item) => ({
    id: item.id,
    kind: "debt",
    date: getBookedAt(item),
    amount: toAmount(item.amount),
    direction: getDirection(item),
    note: item.note || "",
    title: getDirection(item) === "i_owe" ? "Neue Schuld von mir" : "Person schuldet mir"
  }));

  const paymentItems = getPersonPayments(personId).map((item) => ({
    id: item.id,
    kind: "payment",
    date: getBookedAt(item),
    amount: toAmount(item.amount),
    direction: getDirection(item),
    note: item.note || "",
    isRecurring: isRatePlan(item),
    active: item.active !== false,
    title: isRatePlan(item) ? "Monatliche Rate" : "Tilgung"
  }));

  return debtItems
    .concat(paymentItems)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function renderTimelineItem(item) {
  const directionText = item.direction === "i_owe" ? "Ich schulde" : "Person schuldet";
  const meta = item.isRecurring
    ? (item.active ? "Aktive monatliche Rate" : "Beendete Rate")
    : directionText;
  const actionButton = item.kind === "debt"
    ? `<button class="ghost" data-action="delete-debt" data-id="${item.id}" style="max-width: 120px;">Löschen</button>`
    : `<button class="ghost" data-action="delete-payment" data-id="${item.id}" style="max-width: 120px;">Löschen</button>`;

  return `
    <div class="timeline-item">
      <div class="top">
        <div>
          <strong>${escapeHtml(item.title)}</strong><br>
          <small>${escapeHtml(meta)} | ${escapeHtml(formatDate(item.date))}</small>
        </div>
        <strong>${formatCurrency(item.amount)}</strong>
      </div>
      ${item.note ? `<div class="muted" style="margin-top: 8px;">${escapeHtml(item.note)}</div>` : ""}
      <div style="margin-top: 10px; display: flex; justify-content: flex-end;">
        ${actionButton}
      </div>
    </div>
  `;
}

function renderRecurringItem(item) {
  const directionText = getDirection(item) === "i_owe" ? "Ich schulde" : "Person schuldet";
  const startDate = getRecurringStart(item) || getBookedAt(item);
  const paidSoFar = getRecurringPaidAmount(item);

  return `
    <div class="timeline-item">
      <div class="top">
        <div>
          <strong>${formatCurrency(item.amount)} pro Monat</strong><br>
          <small>${escapeHtml(directionText)} | Start: ${escapeHtml(formatDate(startDate))}</small>
        </div>
        <button class="danger" data-action="stop-rate" data-id="${item.id}" style="max-width: 140px;">Rate beenden</button>
      </div>
      <div class="muted" style="margin-top: 8px;">Bereits angerechnet: ${formatCurrency(paidSoFar)}</div>
      ${item.note ? `<div class="muted" style="margin-top: 8px;">${escapeHtml(item.note)}</div>` : ""}
    </div>
  `;
}

function drawChart(personId) {
  const canvas = document.getElementById("chart");
  if (!canvas) return;

  const timeline = buildBalanceEvents(personId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let running = 0;
  const labels = [];
  const values = [];

  timeline.forEach((item) => {
    if (item.kind === "debt") {
      running += item.direction === "person_owes_me" ? item.amount : -item.amount;
    } else {
      running += item.direction === "person_owes_me" ? -item.amount : item.amount;
    }

    labels.push(formatDate(item.date));
    values.push(Number(running.toFixed(2)));
  });

  if (currentChart) {
    currentChart.destroy();
  }

  currentChart = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels: labels.length ? labels : ["Keine Daten"],
      datasets: [{
        label: "Nettosaldo",
        data: values.length ? values : [0],
        borderColor: "#2f6df6",
        backgroundColor: "rgba(47, 109, 246, 0.18)",
        fill: true,
        tension: 0.25
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          ticks: {
            color: "#c9d6ef",
            callback: (value) => value + " EUR"
          },
          grid: {
            color: "rgba(255,255,255,0.08)"
          }
        },
        x: {
          ticks: { color: "#c9d6ef" },
          grid: { color: "rgba(255,255,255,0.04)" }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: "#eef4ff"
          }
        }
      }
    }
  });
}

function isTilgung(item) {
  return !isRatePlan(item);
}

function isRecurringRate(item) {
  return isRatePlan(item) && item.active !== false;
}

function isRatePlan(item) {
  return item.is_recurring === true || getPaymentType(item) === "rate";
}

function sumRecurringPaid(items) {
  return Number(items.reduce((sum, item) => sum + getRecurringPaidAmount(item), 0).toFixed(2));
}

function getRecurringPaidAmount(item) {
  if (!isRatePlan(item)) return 0;
  const occurrences = countRecurringOccurrences(getRecurringStart(item), getRecurringEnd(item));
  return Number((toAmount(item.amount) * occurrences).toFixed(2));
}

function getRecurringEnd(item) {
  if (item.recurring_end) return item.recurring_end;
  if (item.active === false) return item.booked_at || item.recurring_start || todayString();
  return todayString();
}

function countRecurringOccurrences(startValue, endValue) {
  const start = parseDateValue(startValue);
  const end = parseDateValue(endValue);

  if (!start || !end || start > end) return 0;

  let count = 0;
  let cursor = new Date(start.getTime());

  while (cursor <= end) {
    count += 1;
    cursor = addMonthsClamped(cursor, 1);
  }

  return count;
}

function getDirection(item) {
  return item.direction === "person_owes_me" ? "person_owes_me" : "i_owe";
}

function getPaymentType(item) {
  return item.payment_type === "rate" ? "rate" : "tilgung";
}

function getBookedAt(item) {
  return item.booked_at || item.created_at || todayString();
}

function getRecurringStart(item) {
  return item.recurring_start || item.booked_at || null;
}

function buildBalanceEvents(personId) {
  const debtEvents = getPersonDebts(personId).map((item) => ({
    kind: "debt",
    date: getBookedAt(item),
    amount: toAmount(item.amount),
    direction: getDirection(item)
  }));

  const paymentEvents = getPersonPayments(personId).flatMap((item) => {
    if (!isRatePlan(item)) {
      return [{
        kind: "payment",
        date: getBookedAt(item),
        amount: toAmount(item.amount),
        direction: getDirection(item)
      }];
    }

    return buildRecurringOccurrences(item).map((entry) => ({
      kind: "payment",
      date: entry.date,
      amount: entry.amount,
      direction: getDirection(item)
    }));
  });

  return debtEvents.concat(paymentEvents);
}

function buildRecurringOccurrences(item) {
  const start = parseDateValue(getRecurringStart(item));
  const end = parseDateValue(getRecurringEnd(item));
  if (!start || !end || start > end) return [];

  const amount = toAmount(item.amount);
  const entries = [];
  let cursor = new Date(start.getTime());

  while (cursor <= end) {
    entries.push({
      date: toDateString(cursor),
      amount
    });
    cursor = addMonthsClamped(cursor, 1);
  }

  return entries;
}

function toAmount(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Number(parsed.toFixed(2));
}

function sumAmount(items) {
  return Number(items.reduce((sum, item) => sum + toAmount(item.amount), 0).toFixed(2));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format(Number(value || 0));
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "-";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function todayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function addMonths(dateString, months) {
  const date = parseDateValue(dateString);
  if (!date) return todayString();
  const shifted = addMonthsClamped(date, months);
  return toDateString(shifted);
}

function addMonthsClamped(date, months) {
  const base = new Date(date.getTime());
  const day = base.getDate();
  const shifted = new Date(base.getTime());
  shifted.setDate(1);
  shifted.setMonth(shifted.getMonth() + months);
  const lastDay = new Date(shifted.getFullYear(), shifted.getMonth() + 1, 0).getDate();
  shifted.setDate(Math.min(day, lastDay));
  return shifted;
}

function parseDateValue(value) {
  if (!value) return null;
  const text = String(value).slice(0, 10);
  const parts = text.split("-");
  if (parts.length !== 3) return null;

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function handleSchemaError(error, fallbackMessage) {
  const message = (error && error.message) ? error.message : fallbackMessage;
  alert(fallbackMessage + " Falls Spalten fehlen, führe zuerst supabase-schema-update.sql in Supabase aus.\n\n" + message);
  console.error(error);
}


