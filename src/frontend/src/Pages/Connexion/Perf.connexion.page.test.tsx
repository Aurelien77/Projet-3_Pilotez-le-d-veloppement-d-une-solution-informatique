// Perf.connexion.page.test.tsx
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ProfilerWrapper, { ProfilerMetrics } from "../../Components/ProfilerWrapper";
import Connexion from "./Index";
import * as router from "react-router";

// Mock du AuthContext
const mockLogin = jest.fn();
jest.mock("../../Helpers/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
    logout: jest.fn(),
    authState: null,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock des réponses API
const mockLoginSuccess = {
  message: "Connexion réussie",
  userId: 1,
  token: "fake-token-123",
};

const mockLoginError = {
  message: "Email ou mot de passe incorrect",
};

describe("Connexion - Tests de Performance", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    mockLogin.mockClear();
    mockNavigate.mockClear();

    jest.spyOn(router, "useNavigate").mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /* ==================== TEST 1: Chargement initial ==================== */
  it("TEST 1: Le composant devrait se charger rapidement", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <BrowserRouter>
        <ProfilerWrapper
          id="connexion-mount"
          onRender={(m) => {
            metrics.push(m);
            console.log(`📊 ${m.phase}: ${m.actualDuration.toFixed(2)}ms`);
          }}
        >
          <Connexion />
        </ProfilerWrapper>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Connexion")).toBeInTheDocument();
    });

    const mountMetrics = metrics.find((m) => m.phase === "mount");

    console.log("\n✅ TEST 1 - Chargement initial");
    console.log(`   Temps de mount: ${mountMetrics?.actualDuration.toFixed(2)}ms`);
    console.log(`   Nombre total de rendus: ${metrics.length}`);

    expect(mountMetrics?.actualDuration).toBeLessThan(200);
  }, 15000);

  /* ==================== TEST 2: Performance de saisie email ==================== */
  it("TEST 2: La saisie de l'email devrait être fluide", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <BrowserRouter>
        <ProfilerWrapper id="connexion-email" onRender={(m) => metrics.push(m)}>
          <Connexion />
        </ProfilerWrapper>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    const beforeTyping = metrics.length;
    const emailInput = screen.getByLabelText(/email/i);

    // Simuler la saisie progressive
    fireEvent.change(emailInput, { target: { value: "test@test.com" } });

    await waitFor(() => expect(metrics.length).toBeGreaterThan(beforeTyping));

    const typingUpdates = metrics.slice(beforeTyping);
    const typingDuration = typingUpdates.reduce((sum, m) => sum + m.actualDuration, 0);

    console.log("\n✅ TEST 2 - Performance de saisie email");
    console.log(`   Nombre de re-rendus: ${typingUpdates.length}`);
    console.log(`   Durée totale: ${typingDuration.toFixed(2)}ms`);

    expect(typingUpdates.length).toBeLessThan(5);
    expect(typingDuration).toBeLessThan(100);
  }, 15000);

  /* ==================== TEST 3: Performance de saisie mot de passe ==================== */
  it("TEST 3: La saisie du mot de passe devrait être fluide", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <BrowserRouter>
        <ProfilerWrapper id="connexion-password" onRender={(m) => metrics.push(m)}>
          <Connexion />
        </ProfilerWrapper>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    });

    const beforeTyping = metrics.length;
    const passwordInput = screen.getByLabelText(/mot de passe/i);

    fireEvent.change(passwordInput, { target: { value: "password123" } });

    await waitFor(() => expect(metrics.length).toBeGreaterThan(beforeTyping));

    const typingUpdates = metrics.slice(beforeTyping);
    const typingDuration = typingUpdates.reduce((sum, m) => sum + m.actualDuration, 0);

    console.log("\n✅ TEST 3 - Performance de saisie mot de passe");
    console.log(`   Nombre de re-rendus: ${typingUpdates.length}`);
    console.log(`   Durée totale: ${typingDuration.toFixed(2)}ms`);

    expect(typingUpdates.length).toBeLessThan(5);
    expect(typingDuration).toBeLessThan(100);
  }, 15000);

  /* ==================== TEST 4: Soumission du formulaire (succès) ==================== */
  it("TEST 4: La soumission du formulaire devrait être performante", async () => {
    const metrics: ProfilerMetrics[] = [];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockLoginSuccess),
    });

    render(
      <BrowserRouter>
        <ProfilerWrapper id="connexion-submit" onRender={(m) => metrics.push(m)}>
          <Connexion />
        </ProfilerWrapper>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    // Remplir le formulaire
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const beforeSubmit = metrics.length;

    // Soumettre le formulaire
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });

    const submitUpdates = metrics.slice(beforeSubmit);
    const submitDuration = submitUpdates.reduce((sum, m) => sum + m.actualDuration, 0);

    console.log("\n✅ TEST 4 - Soumission du formulaire");
    console.log(`   Nombre de re-rendus: ${submitUpdates.length}`);
    console.log(`   Durée totale: ${submitDuration.toFixed(20)}ms`);

    expect(submitDuration).toBeLessThan(150);
  }, 15000);

  /* ==================== TEST 5: Gestion des erreurs ==================== */
  it("TEST 5: L'affichage des erreurs devrait être rapide", async () => {
    const metrics: ProfilerMetrics[] = [];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve(mockLoginError),
    });

    render(
      <BrowserRouter>
        <ProfilerWrapper id="connexion-error" onRender={(m) => metrics.push(m)}>
          <Connexion />
        </ProfilerWrapper>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    fireEvent.change(emailInput, { target: { value: "wrong@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });

    const beforeSubmit = metrics.length;

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Email ou mot de passe incorrect/i)).toBeInTheDocument();
    });

    const errorUpdates = metrics.slice(beforeSubmit);
    const errorDuration = errorUpdates.reduce((sum, m) => sum + m.actualDuration, 0);

    console.log("\n✅ TEST 5 - Affichage des erreurs");
    console.log(`   Nombre de re-rendus: ${errorUpdates.length}`);
    console.log(`   Durée totale: ${errorDuration.toFixed(2)}ms`);

    expect(errorDuration).toBeLessThan(150);
  }, 15000);

  /* ==================== TEST 6: Pas de nested updates ==================== */
  it("TEST 6: Ne devrait pas avoir de nested-updates", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <BrowserRouter>
        <ProfilerWrapper id="connexion-nested" onRender={(m) => metrics.push(m)}>
          <Connexion />
        </ProfilerWrapper>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Connexion")).toBeInTheDocument();
    });

    // Interagir avec le formulaire
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: "test@test.com" } });

    await new Promise((resolve) => setTimeout(resolve, 500));

    const nestedUpdates = metrics.filter((m) => m.phase === "nested-update");

    console.log("\n✅ TEST 6 - Nested updates");
    console.log(`   Nombre: ${nestedUpdates.length}`);

    expect(nestedUpdates.length).toBe(0);
  }, 15000);

  /* ==================== TEST 7: Nombre total de rendus ==================== */
  it("TEST 7: Devrait limiter le nombre total de rendus", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <BrowserRouter>
        <ProfilerWrapper id="connexion-total" onRender={(m) => metrics.push(m)}>
          <Connexion />
        </ProfilerWrapper>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Connexion")).toBeInTheDocument();
    });

    // Simuler une utilisation complète
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);

    fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    await new Promise((resolve) => setTimeout(resolve, 500));

    const mountCount = metrics.filter((m) => m.phase === "mount").length;
    const updateCount = metrics.filter((m) => m.phase === "update").length;
    const totalCount = metrics.length;

    console.log("\n✅ TEST 7 - Nombre total de rendus");
    console.log(`   Mount: ${mountCount}`);
    console.log(`   Updates: ${updateCount}`);
    console.log(`   Total: ${totalCount}`);

    // Page de connexion devrait avoir peu de rendus
    expect(totalCount).toBeLessThan(10);
  }, 15000);

  /* ==================== TEST 8: Rapport complet ==================== */
  it("TEST 8: Rapport complet de performance", async () => {
    const metrics: ProfilerMetrics[] = [];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockLoginSuccess),
    });

    render(
      <BrowserRouter>
        <ProfilerWrapper id="connexion-report" onRender={(m) => metrics.push(m)}>
          <Connexion />
        </ProfilerWrapper>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Connexion")).toBeInTheDocument();
    });

    // Simuler un scénario complet
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByTestId("submit-button");

    fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mountMetrics = metrics.filter((m) => m.phase === "mount");
    const updateMetrics = metrics.filter((m) => m.phase === "update");
    const nestedMetrics = metrics.filter((m) => m.phase === "nested-update");

    const totalDuration = metrics.reduce((sum, m) => sum + m.actualDuration, 0);
    const avgDuration = metrics.length > 0 ? totalDuration / metrics.length : 0;

    console.log("\n" + "=".repeat(60));
    console.log("📊 RAPPORT COMPLET - Connexion");
    console.log("=".repeat(60));
    console.log(`\n📈 Statistiques:`);
    console.log(`   - Total rendus: ${metrics.length}`);
    console.log(`   - Durée totale: ${totalDuration.toFixed(2)}ms`);
    console.log(`   - Durée moyenne: ${avgDuration.toFixed(2)}ms`);

    console.log(`\n🆕 Mount:`);
    if (mountMetrics.length > 0) {
      const d = mountMetrics[0].actualDuration;
      const s = d < 100 ? "🟢" : d < 200 ? "🟡" : "🔴";
      console.log(`   ${s} ${d.toFixed(2)}ms`);
    }

    console.log(`\n🔄 Updates: ${updateMetrics.length}`);
    if (updateMetrics.length > 0) {
      const durations = updateMetrics.map((m) => m.actualDuration);
      console.log(`   - Min: ${Math.min(...durations).toFixed(2)}ms`);
      console.log(`   - Max: ${Math.max(...durations).toFixed(2)}ms`);
      console.log(`   - Moyenne: ${(durations.reduce((a, b) => a + b) / durations.length).toFixed(2)}ms`);
    }

    console.log(`\n⚠️  Nested: ${nestedMetrics.length === 0 ? "🟢" : "🔴"} ${nestedMetrics.length}`);

    console.log(`\n💡 Recommandations:`);
    if (mountMetrics[0]?.actualDuration > 150) {
      console.log(`   ⚠️  Chargement initial lent`);
    } else {
      console.log(`   ✅ Chargement initial rapide`);
    }

    if (updateMetrics.length > 8) {
      console.log(`   ⚠️  Trop de re-rendus (${updateMetrics.length})`);
    } else {
      console.log(`   ✅ Nombre de re-rendus acceptable`);
    }

    if (nestedMetrics.length > 0) {
      console.log(`   🚨 Nested updates détectés!`);
    } else {
      console.log(`   ✅ Pas de nested updates`);
    }

    console.log("\n" + "=".repeat(60) + "\n");

    expect(metrics.length).toBeGreaterThan(0);
    expect(nestedMetrics.length).toBe(0);
  }, 20000);
});
