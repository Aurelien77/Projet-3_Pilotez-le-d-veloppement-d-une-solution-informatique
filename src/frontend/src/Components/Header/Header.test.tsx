/**
 * @jest-environment jsdom
 */
// Components/Header/Header.performance.test.tsx
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ProfilerWrapper, { ProfilerMetrics } from "../ProfilerWrapper";
import Header from "./Index";

// Mock du AuthContext
const mockLogout = jest.fn();
const mockLogin = jest.fn();

const createMockAuthContext = (status: boolean = false) => ({
  authState: {
    status,
    id: status ? 1 : null,
    email: status ? "test@example.com" : null,
  },
  login: mockLogin,
  logout: mockLogout,
});

jest.mock("../../Helpers/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Mock de react-router-dom (version simplifiée)
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Configuration des seuils de performance
const PERFORMANCE_THRESHOLDS = {
  initialRender: 100, // ms
  interaction: 50, // ms
  reRender: 30, // ms
};

describe("Header - Tests de Performance", () => {
  const { useAuth } = require("../../Helpers/AuthContext");

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockLogout.mockClear();
    mockLogin.mockClear();

    useAuth.mockReturnValue(createMockAuthContext(false));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /* ==================== TEST 1: Chargement initial ==================== */
  it("TEST 1: Le composant devrait se charger rapidement", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <ProfilerWrapper
        id="header-mount"
        onRender={(m) => {
          metrics.push(m);
          console.log(`📊 ${m.phase}: ${m.actualDuration.toFixed(2)}ms`);
        }}
      >
        <Header />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId("header-logo")).toBeInTheDocument();
    });

    const mountMetrics = metrics.find((m) => m.phase === "mount");

    console.log("\n✅ TEST 1 - Chargement initial");
    console.log(`   Temps de mount: ${mountMetrics?.actualDuration.toFixed(2)}ms`);
    console.log(`   Nombre total de rendus: ${metrics.length}`);

    expect(mountMetrics?.actualDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.initialRender);
  }, 15000);

  /* ==================== TEST 2: Performance du hover sur le logo ==================== */
  it("TEST 2: Le hover sur le logo devrait être fluide", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <ProfilerWrapper id="header-logo-hover" onRender={(m) => metrics.push(m)}>
        <Header />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId("header-logo")).toBeInTheDocument();
    });

    const beforeHover = metrics.length;
    const logo = screen.getByTestId("header-logo");

    // Simuler plusieurs hover/unhover
    fireEvent.mouseEnter(logo);
    fireEvent.mouseLeave(logo);
    fireEvent.mouseEnter(logo);
    fireEvent.mouseLeave(logo);

    await waitFor(() => expect(metrics.length).toBeGreaterThan(beforeHover));

    const hoverUpdates = metrics.slice(beforeHover);
    const hoverDuration = hoverUpdates.reduce((sum, m) => sum + m.actualDuration, 0);

    console.log("\n✅ TEST 2 - Hover sur le logo");
    console.log(`   Nombre de re-rendus: ${hoverUpdates.length}`);
    console.log(`   Durée totale: ${hoverDuration.toFixed(2)}ms`);

    expect(hoverUpdates.length).toBeLessThan(8);
    expect(hoverDuration).toBeLessThan(150);
  }, 15000);

  /* ==================== TEST 3: Performance du hover sur le bouton ==================== */
  it("TEST 3: Le hover sur le bouton devrait être fluide", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <ProfilerWrapper id="header-button-hover" onRender={(m) => metrics.push(m)}>
        <Header />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId("header-login-button")).toBeInTheDocument();
    });

    const beforeHover = metrics.length;
    const button = screen.getByTestId("header-login-button");

    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);
    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);

    await waitFor(() => expect(metrics.length).toBeGreaterThan(beforeHover));

    const hoverUpdates = metrics.slice(beforeHover);
    const hoverDuration = hoverUpdates.reduce((sum, m) => sum + m.actualDuration, 0);

    console.log("\n✅ TEST 3 - Hover sur le bouton");
    console.log(`   Nombre de re-rendus: ${hoverUpdates.length}`);
    console.log(`   Durée totale: ${hoverDuration.toFixed(2)}ms`);

    expect(hoverUpdates.length).toBeLessThan(8);
    expect(hoverDuration).toBeLessThan(150);
  }, 15000);

  /* ==================== TEST 4: Performance du clic sur le logo ==================== */
  it("TEST 4: Le clic sur le logo devrait être instantané", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <ProfilerWrapper id="header-logo-click" onRender={(m) => metrics.push(m)}>
        <Header />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId("header-logo")).toBeInTheDocument();
    });

    const beforeClick = metrics.length;
    const logo = screen.getByTestId("header-logo");

    const startTime = performance.now();
    fireEvent.click(logo);
    const clickDuration = performance.now() - startTime;

    await new Promise((resolve) => setTimeout(resolve, 100));

    const clickUpdates = metrics.slice(beforeClick);

    console.log("\n✅ TEST 4 - Clic sur le logo");
    console.log(`   Nombre de re-rendus: ${clickUpdates.length}`);
    console.log(`   Durée du clic: ${clickDuration.toFixed(2)}ms`);

    expect(clickDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.interaction);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  }, 15000);

  /* ==================== TEST 5: Performance du clic sur le bouton (déconnecté) ==================== */
  it("TEST 5: Le clic sur Connexion devrait être performant", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <ProfilerWrapper id="header-login-click" onRender={(m) => metrics.push(m)}>
        <Header />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId("header-login-button")).toBeInTheDocument();
    });

    const beforeClick = metrics.length;
    const button = screen.getByTestId("header-login-button");

    const startTime = performance.now();
    fireEvent.click(button);
    const clickDuration = performance.now() - startTime;

    await new Promise((resolve) => setTimeout(resolve, 100));

    const clickUpdates = metrics.slice(beforeClick);

    console.log("\n✅ TEST 5 - Clic sur Connexion");
    console.log(`   Nombre de re-rendus: ${clickUpdates.length}`);
    console.log(`   Durée du clic: ${clickDuration.toFixed(2)}ms`);

    expect(clickDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.interaction);
    expect(mockNavigate).toHaveBeenCalledWith("/Connexion");
  }, 15000);

  /* ==================== TEST 6: Performance du clic sur le bouton (connecté) ==================== */
  it("TEST 6: Le clic sur Déconnexion devrait être performant", async () => {
    useAuth.mockReturnValue(createMockAuthContext(true));
    const metrics: ProfilerMetrics[] = [];

    render(
      <ProfilerWrapper id="header-logout-click" onRender={(m) => metrics.push(m)}>
        <Header />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/déconnexion/i)).toBeInTheDocument();
    });

    const beforeClick = metrics.length;
    const button = screen.getByTestId("header-login-button");

    const startTime = performance.now();
    fireEvent.click(button);
    const clickDuration = performance.now() - startTime;

    await new Promise((resolve) => setTimeout(resolve, 100));

    const clickUpdates = metrics.slice(beforeClick);

    console.log("\n✅ TEST 6 - Clic sur Déconnexion");
    console.log(`   Nombre de re-rendus: ${clickUpdates.length}`);
    console.log(`   Durée du clic: ${clickDuration.toFixed(2)}ms`);

    expect(clickDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.interaction);
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  }, 15000);

  /* ==================== TEST 7: Performance avec changement de state d'auth ==================== */
  it("TEST 7: Le changement de state d'auth devrait être rapide", async () => {
    const metrics: ProfilerMetrics[] = [];

    const { rerender } = render(
      <ProfilerWrapper id="header-auth-change" onRender={(m) => metrics.push(m)}>
        <Header />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/connexion/i)).toBeInTheDocument();
    });

    const beforeChange = metrics.length;

    // Simuler la connexion
    useAuth.mockReturnValue(createMockAuthContext(true));

    rerender(
      <ProfilerWrapper id="header-auth-change" onRender={(m) => metrics.push(m)}>
        <Header />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/déconnexion/i)).toBeInTheDocument();
    });

    const changeUpdates = metrics.slice(beforeChange);
    const changeDuration = changeUpdates.reduce((sum, m) => sum + m.actualDuration, 0);

    console.log("\n✅ TEST 7 - Changement de state d'auth");
    console.log(`   Nombre de re-rendus: ${changeUpdates.length}`);
    console.log(`   Durée totale: ${changeDuration.toFixed(2)}ms`);

    expect(changeDuration).toBeLessThan(100);
  }, 15000);

  /* ==================== TEST 8: Performance avec styles personnalisés ==================== */
  it("TEST 8: Le rendu avec styles personnalisés devrait être rapide", async () => {
    const metrics: ProfilerMetrics[] = [];

    const customLogoStyle: React.CSSProperties = {
      color: "#FF812D",
      fontSize: "2rem",
      fontWeight: "bold",
    };

    const customButtonStyle: React.CSSProperties = {
      backgroundColor: "#FF812D",
      color: "white",
      padding: "12px 24px",
      borderRadius: "8px",
    };

    render(
      <ProfilerWrapper id="header-custom-styles" onRender={(m) => metrics.push(m)}>
        <Header logoStyle={customLogoStyle} buttonStyle={customButtonStyle} />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId("header-logo")).toBeInTheDocument();
    });

    const mountMetrics = metrics.find((m) => m.phase === "mount");

    console.log("\n✅ TEST 8 - Rendu avec styles personnalisés");
    console.log(`   Temps de mount: ${mountMetrics?.actualDuration.toFixed(2)}ms`);

    expect(mountMetrics?.actualDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.initialRender);
  }, 15000);

  /* ==================== TEST 9: Pas de nested updates ==================== */
  it("TEST 9: Ne devrait pas avoir de nested-updates", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <ProfilerWrapper id="header-nested" onRender={(m) => metrics.push(m)}>
        <Header />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId("header-logo")).toBeInTheDocument();
    });

    // Interagir avec le composant
    const logo = screen.getByTestId("header-logo");
    const button = screen.getByTestId("header-login-button");

    fireEvent.mouseEnter(logo);
    fireEvent.mouseLeave(logo);
    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);
    fireEvent.click(logo);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const nestedUpdates = metrics.filter((m) => m.phase === "nested-update");

    console.log("\n✅ TEST 9 - Nested updates");
    console.log(`   Nombre: ${nestedUpdates.length}`);

    expect(nestedUpdates.length).toBe(0);
  }, 15000);

  /* ==================== TEST 10: Performance sur 100 rendus ==================== */
  it("TEST 10: Devrait gérer 100 rendus efficacement", async () => {
    const times: number[] = [];
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const { unmount } = render(<Header />);
      const duration = performance.now() - start;
      times.push(duration);
      unmount();
    }

    const average = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);
    const min = Math.min(...times);

    console.log("\n✅ TEST 10 - Performance sur 100 rendus");
    console.log(`   Moyenne: ${average.toFixed(2)}ms`);
    console.log(`   Max: ${max.toFixed(2)}ms`);
    console.log(`   Min: ${min.toFixed(2)}ms`);

    expect(average).toBeLessThan(20);
  }, 20000);

  /* ==================== TEST 11: Comparaison connecté vs déconnecté ==================== */
  it("TEST 11: Comparaison des performances connecté vs déconnecté", async () => {
    const iterations = 50;

    // Test en mode déconnecté
    useAuth.mockReturnValue(createMockAuthContext(false));
    const timesLoggedOut: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const { unmount } = render(<Header />);
      timesLoggedOut.push(performance.now() - start);
      unmount();
    }

    // Test en mode connecté
    useAuth.mockReturnValue(createMockAuthContext(true));
    const timesLoggedIn: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const { unmount } = render(<Header />);
      timesLoggedIn.push(performance.now() - start);
      unmount();
    }

    const avgLoggedOut = timesLoggedOut.reduce((a, b) => a + b, 0) / iterations;
    const avgLoggedIn = timesLoggedIn.reduce((a, b) => a + b, 0) / iterations;

    console.log("\n✅ TEST 11 - Comparaison connecté vs déconnecté");
    console.log(`   Mode déconnecté: ${avgLoggedOut.toFixed(2)}ms`);
    console.log(`   Mode connecté: ${avgLoggedIn.toFixed(2)}ms`);
    console.log(`   Différence: ${Math.abs(avgLoggedIn - avgLoggedOut).toFixed(2)}ms`);

    // La différence ne devrait pas être significative
    expect(Math.abs(avgLoggedIn - avgLoggedOut)).toBeLessThan(5);
  }, 20000);

  /* ==================== TEST 12: Rapport complet de performance ==================== */
  it("TEST 12: Rapport complet de performance", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <ProfilerWrapper id="header-report" onRender={(m) => metrics.push(m)}>
        <Header />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId("header-logo")).toBeInTheDocument();
    });

    // Simuler un scénario complet d'utilisation
    const logo = screen.getByTestId("header-logo");
    const button = screen.getByTestId("header-login-button");

    // Interactions multiples
    fireEvent.mouseEnter(logo);
    fireEvent.mouseLeave(logo);
    fireEvent.click(logo);

    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);
    fireEvent.click(button);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mountMetrics = metrics.filter((m) => m.phase === "mount");
    const updateMetrics = metrics.filter((m) => m.phase === "update");
    const nestedMetrics = metrics.filter((m) => m.phase === "nested-update");

    const totalDuration = metrics.reduce((sum, m) => sum + m.actualDuration, 0);
    const avgDuration = metrics.length > 0 ? totalDuration / metrics.length : 0;

    console.log("\n" + "=".repeat(60));
    console.log("📊 RAPPORT COMPLET - Header");
    console.log("=".repeat(60));
    console.log(`\n📈 Statistiques:`);
    console.log(`   - Total rendus: ${metrics.length}`);
    console.log(`   - Durée totale: ${totalDuration.toFixed(2)}ms`);
    console.log(`   - Durée moyenne: ${avgDuration.toFixed(2)}ms`);

    console.log(`\n🆕 Mount:`);
    if (mountMetrics.length > 0) {
      const d = mountMetrics[0].actualDuration;
      const s = d < 50 ? "🟢" : d < 100 ? "🟡" : "🔴";
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
    if (mountMetrics[0]?.actualDuration > 100) {
      console.log(`   ⚠️  Chargement initial lent`);
    } else {
      console.log(`   ✅ Chargement initial rapide`);
    }

    if (updateMetrics.length > 10) {
      console.log(`   ⚠️  Nombre élevé de re-rendus (${updateMetrics.length})`);
    } else {
      console.log(`   ✅ Nombre de re-rendus optimal`);
    }

    if (nestedMetrics.length > 0) {
      console.log(`   🚨 Nested updates détectés!`);
    } else {
      console.log(`   ✅ Pas de nested updates`);
    }

    console.log("\n" + "=".repeat(60) + "\n");

    expect(metrics.length).toBeGreaterThan(0);
    expect(nestedMetrics.length).toBe(0);
    expect(mountMetrics[0]?.actualDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.initialRender);
  }, 20000);
});
