// Perf.get.user.test.tsx
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ProfilerWrapper, { ProfilerMetrics } from "../../Components/ProfilerWrapper";
import Usersfiles from "./Index";
import React from "react";

// Mock du AuthContext simplifié
jest.mock("../../Helpers/AuthContext", () => ({
  useAuth: () => ({
    authState: { id: 1, email: "test@test.com" },
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

const mockFiles = [
  {
    id: 1,
    fileName: "document.pdf",
    creationDate: "2025-01-01",
    expirationDate: "2025-12-31",
    isExpired: false,
    hasPassword: true,
    downloadLink: "https://example.com/download/1",
  },
  {
    id: 2,
    fileName: "image.jpg",
    creationDate: "2025-01-02",
    expirationDate: "2025-06-30",
    isExpired: false,
    hasPassword: false,
    downloadLink: "https://example.com/download/2",
  },
];

const mockUser = {
  id: 1,
  email: "test@test.com",
  firstName: "John",
  lastName: "Doe",
  login: "johndoe",
};

describe("Usersfiles - Tests de Performance", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/api/Users/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser),
        });
      }
      if (url.includes("/api/Files/user/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockFiles),
        });
      }
      return Promise.reject(new Error("URL non mockée"));
    });
  });

  /* ==================== TEST 1: Chargement initial ==================== */
  it("TEST 1: Le composant devrait se charger rapidement", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <BrowserRouter>
        <ProfilerWrapper
          id="usersfiles-mount"
          onRender={(m) => {
            metrics.push(m);
            console.log(`📊 ${m.phase}: ${m.actualDuration.toFixed(2)}ms`);
          }}
        >
          <Usersfiles />
        </ProfilerWrapper>
      </BrowserRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText("document.pdf")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    const mountMetrics = metrics.find((m) => m.phase === "mount");

    console.log("\n✅ TEST 1 - Chargement initial");
    console.log(`   Temps de mount: ${mountMetrics?.actualDuration.toFixed(2)}ms`);
    console.log(`   Nombre total de rendus: ${metrics.length}`);

    expect(mountMetrics?.actualDuration).toBeLessThan(300);
  }, 15000);

  /* ==================== TEST 2: Pas de nested updates ==================== */
  it("TEST 2: Ne devrait pas avoir de nested-updates", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <BrowserRouter>
        <ProfilerWrapper id="usersfiles-nested" onRender={(m) => metrics.push(m)}>
          <Usersfiles />
        </ProfilerWrapper>
      </BrowserRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText("document.pdf")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    const nestedUpdates = metrics.filter((m) => m.phase === "nested-update");

    console.log("\n✅ TEST 2 - Nested updates");
    console.log(`   Nombre de nested-updates: ${nestedUpdates.length}`);

    expect(nestedUpdates.length).toBe(0);
  }, 15000);

  /* ==================== TEST 3: Performance du filtrage ==================== */
  it("TEST 3: Le filtrage devrait être performant", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <BrowserRouter>
        <ProfilerWrapper id="usersfiles-filter" onRender={(m) => metrics.push(m)}>
          <Usersfiles />
        </ProfilerWrapper>
      </BrowserRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText("document.pdf")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    const beforeFilterCount = metrics.length;

    // Cliquer sur le filtre "Actifs"
    const activeButton = screen.getByText("Actifs");
    fireEvent.click(activeButton);

    await waitFor(() => {
      const afterFilterCount = metrics.length;
      expect(afterFilterCount).toBeGreaterThan(beforeFilterCount);
    });

    const filterUpdates = metrics.slice(beforeFilterCount);
    const filterDuration = filterUpdates.reduce((sum, m) => sum + m.actualDuration, 0);

    console.log("\n✅ TEST 3 - Performance du filtrage");
    console.log(`   Nombre de re-rendus: ${filterUpdates.length}`);
    console.log(`   Durée totale: ${filterDuration.toFixed(2)}ms`);

    expect(filterDuration).toBeLessThan(150);
  }, 15000);

  /* ==================== TEST 4: Nombre total de rendus ==================== */
  it("TEST 4: Devrait limiter le nombre total de rendus", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <BrowserRouter>
        <ProfilerWrapper id="usersfiles-total" onRender={(m) => metrics.push(m)}>
          <Usersfiles />
        </ProfilerWrapper>
      </BrowserRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText("document.pdf")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    await new Promise((resolve) => setTimeout(resolve, 500));

    const mountCount = metrics.filter((m) => m.phase === "mount").length;
    const updateCount = metrics.filter((m) => m.phase === "update").length;
    const totalCount = metrics.length;

    console.log("\n✅ TEST 4 - Nombre total de rendus");
    console.log(`   Mount: ${mountCount}`);
    console.log(`   Updates: ${updateCount}`);
    console.log(`   Total: ${totalCount}`);

    expect(totalCount).toBeLessThan(15);
  }, 15000);

  /* ==================== TEST 5: Rapport complet ==================== */
  it("TEST 5: Rapport complet de performance", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <BrowserRouter>
        <ProfilerWrapper id="usersfiles-report" onRender={(m) => metrics.push(m)}>
          <Usersfiles />
        </ProfilerWrapper>
      </BrowserRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText("document.pdf")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mountMetrics = metrics.filter((m) => m.phase === "mount");
    const updateMetrics = metrics.filter((m) => m.phase === "update");
    const nestedMetrics = metrics.filter((m) => m.phase === "nested-update");

    const totalDuration = metrics.reduce((sum, m) => sum + m.actualDuration, 0);
    const avgDuration = metrics.length > 0 ? totalDuration / metrics.length : 0;

    console.log("\n" + "=".repeat(60));
    console.log("📊 RAPPORT COMPLET DE PERFORMANCE - Usersfiles");
    console.log("=".repeat(60));
    console.log(`\n📈 Statistiques générales:`);
    console.log(`   - Nombre total de rendus: ${metrics.length}`);
    console.log(`   - Durée totale: ${totalDuration.toFixed(2)}ms`);
    console.log(`   - Durée moyenne par rendu: ${avgDuration.toFixed(2)}ms`);

    console.log(`\n🆕 Mount (premier rendu):`);
    console.log(`   - Nombre: ${mountMetrics.length}`);
    if (mountMetrics.length > 0) {
      const mountDuration = mountMetrics[0].actualDuration;
      const status = mountDuration < 100 ? "🟢" : mountDuration < 200 ? "🟡" : "🔴";
      console.log(`   - Durée: ${status} ${mountDuration.toFixed(2)}ms`);
    }

    console.log(`\n🔄 Updates (re-rendus):`);
    console.log(`   - Nombre: ${updateMetrics.length}`);
    if (updateMetrics.length > 0) {
      const updateDurations = updateMetrics.map((m) => m.actualDuration);
      const maxUpdate = Math.max(...updateDurations);
      const minUpdate = Math.min(...updateDurations);
      const avgUpdate = updateDurations.reduce((a, b) => a + b, 0) / updateDurations.length;
      console.log(`   - Min: ${minUpdate.toFixed(2)}ms`);
      console.log(`   - Max: ${maxUpdate.toFixed(2)}ms`);
      console.log(`   - Moyenne: ${avgUpdate.toFixed(2)}ms`);
    }

    console.log(`\n⚠️  Nested updates:`);
    const nestedStatus = nestedMetrics.length === 0 ? "🟢" : "🔴";
    console.log(`   ${nestedStatus} Nombre: ${nestedMetrics.length}`);

    console.log(`\n💡 Recommandations:`);
    if (mountMetrics[0]?.actualDuration > 200) {
      console.log(`   ⚠️  Le chargement initial est lent (${mountMetrics[0]?.actualDuration.toFixed(2)}ms)`);
    } else {
      console.log(`   ✅ Chargement initial rapide`);
    }

    if (updateMetrics.length > 8) {
      console.log(`   ⚠️  Beaucoup de re-rendus détectés (${updateMetrics.length})`);
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
