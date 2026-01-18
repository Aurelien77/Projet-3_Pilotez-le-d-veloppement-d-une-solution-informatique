/**
 * @jest-environment jsdom
 */
// Pages/Accueil/Accueil.performance.test.tsx
import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import ProfilerWrapper, { ProfilerMetrics } from "../../Components/ProfilerWrapper";
import Accueil from "./Index";

// Mock du AuthContext
const mockLogin = jest.fn();
const mockLogout = jest.fn();

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

// Mock de react-router-dom
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock des composants
jest.mock("../../Components/Header/Index", () => ({
  __esModule: true,
  default: ({ logoStyle, buttonStyle }: any) => <div data-testid="header-mock">Header Mock</div>,
}));

jest.mock("../../Components/Footer/Index", () => ({
  __esModule: true,
  default: ({ containerStyle, textStyle }: any) => <div data-testid="footer-mock">Footer Mock</div>,
}));

jest.mock("../../Components/Upload", () => ({
  __esModule: true,
  default: ({ isOpen, onClose, userId }: any) => <div data-testid="file-upload-mock">{isOpen && <div>Upload Modal Open</div>}</div>,
}));

// Configuration des seuils de performance
const PERFORMANCE_THRESHOLDS = {
  initialRender: 200, // ms
  interaction: 100, // ms
  transition: 150, // ms
};

describe("Accueil - Tests de Performance", () => {
  const { useAuth } = require("../../Helpers/AuthContext");

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockNavigate.mockClear();
    mockLogin.mockClear();
    mockLogout.mockClear();

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    useAuth.mockReturnValue(createMockAuthContext(false));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  /* ==================== TEST 1: Chargement initial ==================== */
  it("TEST 1: Le chargement initial devrait être rapide", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <ProfilerWrapper
        id="accueil-mount"
        onRender={(m) => {
          metrics.push(m);
          console.log(`📊 ${m.phase}: ${m.actualDuration.toFixed(2)}ms`);
        }}
      >
        <Accueil />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("DataShare")).toBeInTheDocument();
    });

    const mountMetrics = metrics.find((m) => m.phase === "mount");

    console.log("\n✅ TEST 1 - Chargement initial");
    console.log(`   Temps de mount: ${mountMetrics?.actualDuration.toFixed(2)}ms`);
    console.log(`   Nombre total de rendus: ${metrics.length}`);

    expect(mountMetrics?.actualDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.initialRender);
  }, 15000);

  /* ==================== TEST 2: Performance de la transition ==================== */
  it("TEST 2: La transition de la page de garde devrait être fluide", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <ProfilerWrapper id="accueil-transition" onRender={(m) => metrics.push(m)}>
        <Accueil transitionDelay={500} />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("DataShare")).toBeInTheDocument();
    });

    const beforeTransition = metrics.length;

    // Déclencher la transition avec act()
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => expect(metrics.length).toBeGreaterThan(beforeTransition));

    const transitionUpdates = metrics.slice(beforeTransition);
    const transitionDuration = transitionUpdates.reduce((sum, m) => sum + m.actualDuration, 0);

    console.log("\n✅ TEST 2 - Transition de la page de garde");
    console.log(`   Nombre de re-rendus: ${transitionUpdates.length}`);
    console.log(`   Durée totale: ${transitionDuration.toFixed(2)}ms`);

    expect(transitionDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.transition);
  }, 15000);

  /* ==================== TEST 3: Performance du clic sur le bouton d'upload ==================== */
  it("TEST 3: L'ouverture du modal devrait être instantanée", async () => {
    const metrics: ProfilerMetrics[] = [];

    const { container } = render(
      <ProfilerWrapper id="accueil-upload-click" onRender={(m) => metrics.push(m)}>
        <Accueil />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Tu veux partager un fichier ?")).toBeInTheDocument();
    });

    const beforeClick = metrics.length;
    const uploadButton = container.querySelector('div[style*="cursor: pointer"]');

    const startTime = performance.now();
    fireEvent.click(uploadButton!);
    const clickDuration = performance.now() - startTime;

    await waitFor(() => {
      expect(screen.getByText("Upload Modal Open")).toBeInTheDocument();
    });

    const clickUpdates = metrics.slice(beforeClick);
    const totalDuration = clickUpdates.reduce((sum, m) => sum + m.actualDuration, 0);

    console.log("\n✅ TEST 3 - Ouverture du modal");
    console.log(`   Nombre de re-rendus: ${clickUpdates.length}`);
    console.log(`   Durée du clic: ${clickDuration.toFixed(2)}ms`);
    console.log(`   Durée totale: ${totalDuration.toFixed(2)}ms`);

    expect(clickDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.interaction);
    expect(totalDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.interaction);
  }, 15000);

  /* ==================== TEST 4: Performance du hover ==================== */
  it("TEST 4: Le hover sur le bouton devrait être fluide", async () => {
    const metrics: ProfilerMetrics[] = [];

    const { container } = render(
      <ProfilerWrapper id="accueil-hover" onRender={(m) => metrics.push(m)}>
        <Accueil />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Tu veux partager un fichier ?")).toBeInTheDocument();
    });

    const beforeHover = metrics.length;
    const uploadButton = container.querySelector('div[style*="cursor: pointer"]');

    // Simuler plusieurs hover/unhover
    fireEvent.mouseEnter(uploadButton!);
    fireEvent.mouseLeave(uploadButton!);
    fireEvent.mouseEnter(uploadButton!);
    fireEvent.mouseLeave(uploadButton!);

    await waitFor(() => expect(metrics.length).toBeGreaterThan(beforeHover));

    const hoverUpdates = metrics.slice(beforeHover);
    const hoverDuration = hoverUpdates.reduce((sum, m) => sum + m.actualDuration, 0);

    console.log("\n✅ TEST 4 - Hover sur le bouton");
    console.log(`   Nombre de re-rendus: ${hoverUpdates.length}`);
    console.log(`   Durée totale: ${hoverDuration.toFixed(2)}ms`);

    expect(hoverUpdates.length).toBeLessThan(8);
    expect(hoverDuration).toBeLessThan(150);
  }, 15000);

  /* ==================== TEST 5: Performance en mode mobile ==================== */
  it("TEST 5: Le rendu en mode mobile devrait être performant", async () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    const metrics: ProfilerMetrics[] = [];

    render(
      <ProfilerWrapper id="accueil-mobile" onRender={(m) => metrics.push(m)}>
        <Accueil />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("DataShare")).toBeInTheDocument();
    });

    const mountMetrics = metrics.find((m) => m.phase === "mount");

    console.log("\n✅ TEST 5 - Rendu en mode mobile");
    console.log(`   Temps de mount: ${mountMetrics?.actualDuration.toFixed(2)}ms`);

    expect(mountMetrics?.actualDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.initialRender);
  }, 15000);

  /* ==================== TEST 6: Performance du resize ==================== */
  it("TEST 6: Le redimensionnement devrait être performant", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <ProfilerWrapper id="accueil-resize" onRender={(m) => metrics.push(m)}>
        <Accueil />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("DataShare")).toBeInTheDocument();
    });

    const beforeResize = metrics.length;

    // Simuler plusieurs resize
    for (let i = 0; i < 5; i++) {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500 + i * 100,
      });
      fireEvent(window, new Event("resize"));
    }

    await waitFor(() => expect(metrics.length).toBeGreaterThan(beforeResize));

    const resizeUpdates = metrics.slice(beforeResize);
    const resizeDuration = resizeUpdates.reduce((sum, m) => sum + m.actualDuration, 0);

    console.log("\n✅ TEST 6 - Redimensionnement");
    console.log(`   Nombre de re-rendus: ${resizeUpdates.length}`);
    console.log(`   Durée totale: ${resizeDuration.toFixed(2)}ms`);

    expect(resizeDuration).toBeLessThan(200);
  }, 15000);

  /* ==================== TEST 7: Performance avec utilisateur connecté ==================== */
  it("TEST 7: Le rendu avec utilisateur connecté devrait être rapide", async () => {
    useAuth.mockReturnValue(createMockAuthContext(true));

    const metrics: ProfilerMetrics[] = [];

    render(
      <ProfilerWrapper id="accueil-logged-in" onRender={(m) => metrics.push(m)}>
        <Accueil />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Tu veux partager un fichier ?")).toBeInTheDocument();
    });

    const mountMetrics = metrics.find((m) => m.phase === "mount");

    console.log("\n✅ TEST 7 - Utilisateur connecté");
    console.log(`   Temps de mount: ${mountMetrics?.actualDuration.toFixed(2)}ms`);

    expect(mountMetrics?.actualDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.initialRender);
  }, 15000);

  /* ==================== TEST 8: Pas de nested updates ==================== */
  it("TEST 8: Ne devrait pas avoir de nested-updates", async () => {
    const metrics: ProfilerMetrics[] = [];

    const { container } = render(
      <ProfilerWrapper id="accueil-nested" onRender={(m) => metrics.push(m)}>
        <Accueil />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("DataShare")).toBeInTheDocument();
    });

    // Interagir avec le composant
    const uploadButton = container.querySelector('div[style*="cursor: pointer"]');
    fireEvent.mouseEnter(uploadButton!);
    fireEvent.mouseLeave(uploadButton!);
    fireEvent.click(uploadButton!);

    // Utiliser fake timers pour avancer le temps
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    const nestedUpdates = metrics.filter((m) => m.phase === "nested-update");

    console.log("\n✅ TEST 8 - Nested updates");
    console.log(`   Nombre: ${nestedUpdates.length}`);

    expect(nestedUpdates.length).toBe(0);
  }, 15000);

  /* ==================== TEST 9: Performance sur 50 rendus ==================== */
  it("TEST 9: Devrait gérer 50 rendus efficacement", async () => {
    const times: number[] = [];
    const iterations = 50;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const { unmount } = render(<Accueil />);
      const duration = performance.now() - start;
      times.push(duration);
      unmount();
    }

    const average = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);
    const min = Math.min(...times);

    console.log("\n✅ TEST 9 - Performance sur 50 rendus");
    console.log(`   Moyenne: ${average.toFixed(2)}ms`);
    console.log(`   Max: ${max.toFixed(2)}ms`);
    console.log(`   Min: ${min.toFixed(2)}ms`);

    expect(average).toBeLessThan(50);
  }, 20000);

  /* ==================== TEST 10: Comparaison Desktop vs Mobile ==================== */
  it("TEST 10: Comparaison des performances Desktop vs Mobile", async () => {
    const iterations = 30;

    // Test en mode Desktop
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const timesDesktop: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const { unmount } = render(<Accueil />);
      timesDesktop.push(performance.now() - start);
      unmount();
    }

    // Test en mode Mobile
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    const timesMobile: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const { unmount } = render(<Accueil />);
      timesMobile.push(performance.now() - start);
      unmount();
    }

    const avgDesktop = timesDesktop.reduce((a, b) => a + b, 0) / iterations;
    const avgMobile = timesMobile.reduce((a, b) => a + b, 0) / iterations;

    console.log("\n✅ TEST 10 - Comparaison Desktop vs Mobile");
    console.log(`   Desktop: ${avgDesktop.toFixed(2)}ms`);
    console.log(`   Mobile: ${avgMobile.toFixed(2)}ms`);
    console.log(`   Différence: ${Math.abs(avgMobile - avgDesktop).toFixed(2)}ms`);

    expect(Math.abs(avgMobile - avgDesktop)).toBeLessThan(20);
  }, 20000);

  /* ==================== TEST 11: Rapport complet de performance ==================== */
  it("TEST 11: Rapport complet de performance", async () => {
    const metrics: ProfilerMetrics[] = [];

    const { container } = render(
      <ProfilerWrapper id="accueil-report" onRender={(m) => metrics.push(m)}>
        <Accueil transitionDelay={500} />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("DataShare")).toBeInTheDocument();
    });

    // Simuler un scénario complet
    const uploadButton = container.querySelector('div[style*="cursor: pointer"]');

    // Interactions
    fireEvent.mouseEnter(uploadButton!);
    fireEvent.mouseLeave(uploadButton!);
    fireEvent.click(uploadButton!);

    // Transition avec fake timers
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    const mountMetrics = metrics.filter((m) => m.phase === "mount");
    const updateMetrics = metrics.filter((m) => m.phase === "update");
    const nestedMetrics = metrics.filter((m) => m.phase === "nested-update");

    const totalDuration = metrics.reduce((sum, m) => sum + m.actualDuration, 0);
    const avgDuration = metrics.length > 0 ? totalDuration / metrics.length : 0;

    console.log("\n" + "=".repeat(60));
    console.log("📊 RAPPORT COMPLET - Accueil");
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
    if (mountMetrics[0]?.actualDuration > 200) {
      console.log(`   ⚠️  Chargement initial lent`);
    } else {
      console.log(`   ✅ Chargement initial rapide`);
    }

    if (updateMetrics.length > 15) {
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
