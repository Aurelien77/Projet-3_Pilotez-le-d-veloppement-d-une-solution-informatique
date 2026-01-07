/**
 * @jest-environment jsdom
 */
// Components/FileUpload/FileUpload.performance.test.tsx
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ProfilerWrapper, { ProfilerMetrics } from "../ProfilerWrapper";
import FileUpload from "./Index";

// Mock du AuthContext
const mockAuthState = {
  status: true,
  id: 1,
  email: "test@example.com",
};

jest.mock("../../Helpers/AuthContext", () => ({
  useAuth: () => ({
    authState: mockAuthState,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

// Mock DataTransfer si nécessaire
if (typeof DataTransfer === "undefined") {
  (global as any).DataTransfer = class DataTransfer {
    items: any[] = [];
    files: File[] = [];

    constructor() {
      Object.defineProperty(this, "files", {
        get: () => this.items,
        enumerable: true,
      });
    }

    get items() {
      return {
        add: (file: File) => {
          this.files.push(file);
        },
      };
    }
  };
}

// Mock des réponses API
const mockUploadSuccess = {
  message: "Fichier uploadé avec succès",
  fileId: 123,
  fileName: "test-file.pdf",
  downloadLink: "https://localhost:7120/download/abc123",
  expirationDate: "2026-01-08T00:00:00Z",
};

const mockUploadError = {
  message: "Erreur lors de l'upload du fichier",
};

// Helper pour créer un fichier mock (VERSION CORRIGÉE)
const createMockFile = (name: string = "test.pdf", size: number = 1024 * 1024): File => {
  // Pour les très gros fichiers (> 100MB), simuler la taille sans créer le contenu
  if (size > 100 * 1024 * 1024) {
    const blob = new Blob([], { type: "application/pdf" });
    const file = new File([blob], name, { type: "application/pdf" });
    // Simuler la taille avec Object.defineProperty
    Object.defineProperty(file, "size", {
      value: size,
      writable: false,
      configurable: false,
    });
    return file;
  }

  // Pour les fichiers normaux, créer un contenu réel
  const content = new Array(Math.ceil(size / 1024)).fill("a".repeat(1024)).join("");
  const blob = new Blob([content.slice(0, size)], { type: "application/pdf" });
  return new File([blob], name, { type: "application/pdf" });
};

// Helper pour simuler la sélection de fichier
const simulateFileSelection = (file: File) => {
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

  try {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    Object.defineProperty(fileInput, "files", {
      value: dataTransfer.files,
      writable: false,
      configurable: true,
    });
  } catch (e) {
    // Fallback si DataTransfer ne fonctionne pas
    Object.defineProperty(fileInput, "files", {
      value: [file],
      writable: false,
      configurable: true,
    });
  }

  fireEvent.change(fileInput);
};

describe("FileUpload - Tests de Performance", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    mockOnClose.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /* ==================== TEST 1: Chargement initial du modal ==================== */
  it("TEST 1: Le modal devrait s'ouvrir rapidement", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <ProfilerWrapper
        id="fileupload-mount"
        onRender={(m) => {
          metrics.push(m);
          console.log(`📊 ${m.phase}: ${m.actualDuration.toFixed(2)}ms`);
        }}
      >
        <FileUpload isOpen={true} onClose={mockOnClose} userId={1} />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Ajouter un fichier")).toBeInTheDocument();
    });

    const mountMetrics = metrics.find((m) => m.phase === "mount");

    console.log("\n✅ TEST 1 - Chargement initial du modal");
    console.log(`   Temps de mount: ${mountMetrics?.actualDuration.toFixed(2)}ms`);
    console.log(`   Nombre total de rendus: ${metrics.length}`);

    expect(mountMetrics?.actualDuration).toBeLessThan(200);
  }, 15000);

  /* ==================== TEST 2: Performance de sélection de fichier ==================== */
  it("TEST 2: La sélection de fichier devrait être fluide", async () => {
    const metrics: ProfilerMetrics[] = [];
    const mockFile = createMockFile("document.pdf", 5 * 1024 * 1024);

    render(
      <ProfilerWrapper id="fileupload-select" onRender={(m) => metrics.push(m)}>
        <FileUpload isOpen={true} onClose={mockOnClose} userId={1} />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Ajouter un fichier")).toBeInTheDocument();
    });

    const beforeSelection = metrics.length;
    simulateFileSelection(mockFile);

    await waitFor(() => {
      expect(screen.getByText("document.pdf")).toBeInTheDocument();
    });

    const selectionUpdates = metrics.slice(beforeSelection);
    const selectionDuration = selectionUpdates.reduce((sum, m) => sum + m.actualDuration, 0);

    console.log("\n✅ TEST 2 - Performance de sélection de fichier");
    console.log(`   Nombre de re-rendus: ${selectionUpdates.length}`);
    console.log(`   Durée totale: ${selectionDuration.toFixed(2)}ms`);

    expect(selectionUpdates.length).toBeLessThan(5);
    expect(selectionDuration).toBeLessThan(150);
  }, 15000);

  /* ==================== TEST 3: Performance de saisie mot de passe ==================== */
  it("TEST 3: La saisie du mot de passe devrait être fluide", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <ProfilerWrapper id="fileupload-password" onRender={(m) => metrics.push(m)}>
        <FileUpload isOpen={true} onClose={mockOnClose} userId={1} />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    });

    const beforeTyping = metrics.length;
    const passwordInput = screen.getByLabelText(/mot de passe/i);

    fireEvent.change(passwordInput, { target: { value: "mySecretPassword123" } });

    await waitFor(() => expect(metrics.length).toBeGreaterThan(beforeTyping));

    const typingUpdates = metrics.slice(beforeTyping);
    const typingDuration = typingUpdates.reduce((sum, m) => sum + m.actualDuration, 0);

    console.log("\n✅ TEST 3 - Performance de saisie mot de passe");
    console.log(`   Nombre de re-rendus: ${typingUpdates.length}`);
    console.log(`   Durée totale: ${typingDuration.toFixed(2)}ms`);

    expect(typingUpdates.length).toBeLessThan(5);
    expect(typingDuration).toBeLessThan(100);
  }, 15000);

  /* ==================== TEST 4: Performance du changement d'expiration ==================== */
  it("TEST 4: Le changement de durée d'expiration devrait être instantané", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <ProfilerWrapper id="fileupload-expiration" onRender={(m) => metrics.push(m)}>
        <FileUpload isOpen={true} onClose={mockOnClose} userId={1} />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/expiration/i)).toBeInTheDocument();
    });

    const beforeChange = metrics.length;
    const expirationSelect = screen.getByLabelText(/expiration/i);

    fireEvent.change(expirationSelect, { target: { value: "7" } });
    fireEvent.change(expirationSelect, { target: { value: "14" } });
    fireEvent.change(expirationSelect, { target: { value: "30" } });

    await waitFor(() => expect(metrics.length).toBeGreaterThan(beforeChange));

    const changeUpdates = metrics.slice(beforeChange);
    const changeDuration = changeUpdates.reduce((sum, m) => sum + m.actualDuration, 0);

    console.log("\n✅ TEST 4 - Performance changement d'expiration");
    console.log(`   Nombre de re-rendus: ${changeUpdates.length}`);
    console.log(`   Durée totale: ${changeDuration.toFixed(2)}ms`);

    expect(changeDuration).toBeLessThan(150);
  }, 15000);

  /* ==================== TEST 5: Performance de soumission du formulaire ==================== */
  it("TEST 5: La soumission du formulaire devrait être performante", async () => {
    const metrics: ProfilerMetrics[] = [];
    const mockFile = createMockFile("test.pdf", 2 * 1024 * 1024);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUploadSuccess),
    });

    render(
      <ProfilerWrapper id="fileupload-submit" onRender={(m) => metrics.push(m)}>
        <FileUpload isOpen={true} onClose={mockOnClose} userId={1} />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Ajouter un fichier")).toBeInTheDocument();
    });

    simulateFileSelection(mockFile);

    await waitFor(() => {
      expect(screen.getByText("test.pdf")).toBeInTheDocument();
    });

    const beforeSubmit = metrics.length;

    const submitButton = screen.getByRole("button", { name: /téléverser/i });
    fireEvent.click(submitButton);

    await waitFor(
      () => {
        expect(screen.getByText(/félicitations/i)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    const submitUpdates = metrics.slice(beforeSubmit);
    const submitDuration = submitUpdates.reduce((sum, m) => sum + m.actualDuration, 0);

    console.log("\n✅ TEST 5 - Soumission du formulaire");
    console.log(`   Nombre de re-rendus: ${submitUpdates.length}`);
    console.log(`   Durée totale: ${submitDuration.toFixed(2)}ms`);

    expect(submitDuration).toBeLessThan(300);
  }, 20000);

  /* ==================== TEST 6: Performance d'affichage du succès ==================== */
  it("TEST 6: L'affichage du succès devrait être rapide", async () => {
    const metrics: ProfilerMetrics[] = [];
    const mockFile = createMockFile("success-test.pdf");

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUploadSuccess),
    });

    render(
      <ProfilerWrapper id="fileupload-success" onRender={(m) => metrics.push(m)}>
        <FileUpload isOpen={true} onClose={mockOnClose} userId={1} />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Ajouter un fichier")).toBeInTheDocument();
    });

    simulateFileSelection(mockFile);

    await waitFor(() => {
      expect(screen.getByText("success-test.pdf")).toBeInTheDocument();
    });

    const beforeSubmit = metrics.length;
    const submitButton = screen.getByRole("button", { name: /téléverser/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/félicitations/i)).toBeInTheDocument();
    });

    const successUpdates = metrics.slice(beforeSubmit);
    const successDuration = successUpdates.reduce((sum, m) => sum + m.actualDuration, 0);

    console.log("\n✅ TEST 6 - Affichage du succès");
    console.log(`   Nombre de re-rendus: ${successUpdates.length}`);
    console.log(`   Durée totale: ${successDuration.toFixed(2)}ms`);

    expect(successDuration).toBeLessThan(300);
  }, 20000);

  /* ==================== TEST 7: Gestion des erreurs ==================== */
  it("TEST 7: L'affichage des erreurs devrait être rapide", async () => {
    const metrics: ProfilerMetrics[] = [];
    const mockFile = createMockFile("error-test.pdf");

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve(mockUploadError),
    });

    render(
      <ProfilerWrapper id="fileupload-error" onRender={(m) => metrics.push(m)}>
        <FileUpload isOpen={true} onClose={mockOnClose} userId={1} />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Ajouter un fichier")).toBeInTheDocument();
    });

    simulateFileSelection(mockFile);

    await waitFor(() => {
      expect(screen.getByText("error-test.pdf")).toBeInTheDocument();
    });

    const beforeSubmit = metrics.length;
    const submitButton = screen.getByRole("button", { name: /téléverser/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/erreur lors de l'upload/i)).toBeInTheDocument();
    });

    const errorUpdates = metrics.slice(beforeSubmit);
    const errorDuration = errorUpdates.reduce((sum, m) => sum + m.actualDuration, 0);

    console.log("\n✅ TEST 7 - Affichage des erreurs");
    console.log(`   Nombre de re-rendus: ${errorUpdates.length}`);
    console.log(`   Durée totale: ${errorDuration.toFixed(2)}ms`);

    expect(errorDuration).toBeLessThan(200);
  }, 20000);

  /* ==================== TEST 8: Validation de fichier trop volumineux ==================== */
  it("TEST 8: La validation de taille devrait être instantanée", async () => {
    const metrics: ProfilerMetrics[] = [];
    const largeFile = createMockFile("huge-file.pdf", 2 * 1024 * 1024 * 1024); // 2GB

    render(
      <ProfilerWrapper id="fileupload-validation" onRender={(m) => metrics.push(m)}>
        <FileUpload isOpen={true} onClose={mockOnClose} userId={1} />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Ajouter un fichier")).toBeInTheDocument();
    });

    const beforeValidation = metrics.length;
    simulateFileSelection(largeFile);

    await waitFor(() => {
      expect(screen.getByText(/la taille des fichiers est limitée/i)).toBeInTheDocument();
    });

    const validationUpdates = metrics.slice(beforeValidation);
    const validationDuration = validationUpdates.reduce((sum, m) => sum + m.actualDuration, 0);

    console.log("\n✅ TEST 8 - Validation de taille");
    console.log(`   Nombre de re-rendus: ${validationUpdates.length}`);
    console.log(`   Durée totale: ${validationDuration.toFixed(2)}ms`);

    expect(validationDuration).toBeLessThan(100);
  }, 15000);

  /* ==================== TEST 9: Pas de nested updates ==================== */
  it("TEST 9: Ne devrait pas avoir de nested-updates", async () => {
    const metrics: ProfilerMetrics[] = [];

    render(
      <ProfilerWrapper id="fileupload-nested" onRender={(m) => metrics.push(m)}>
        <FileUpload isOpen={true} onClose={mockOnClose} userId={1} />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Ajouter un fichier")).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/mot de passe/i);
    fireEvent.change(passwordInput, { target: { value: "test123" } });

    const expirationSelect = screen.getByLabelText(/expiration/i);
    fireEvent.change(expirationSelect, { target: { value: "7" } });

    await new Promise((resolve) => setTimeout(resolve, 500));

    const nestedUpdates = metrics.filter((m) => m.phase === "nested-update");

    console.log("\n✅ TEST 9 - Nested updates");
    console.log(`   Nombre: ${nestedUpdates.length}`);

    expect(nestedUpdates.length).toBe(0);
  }, 15000);

  /* ==================== TEST 10: Performance du bouton copier ==================== */
  it("TEST 10: Le clic sur le bouton copier devrait être instantané", async () => {
    const metrics: ProfilerMetrics[] = [];
    const mockFile = createMockFile("copy-test.pdf");

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUploadSuccess),
    });

    render(
      <ProfilerWrapper id="fileupload-copy" onRender={(m) => metrics.push(m)}>
        <FileUpload isOpen={true} onClose={mockOnClose} userId={1} />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Ajouter un fichier")).toBeInTheDocument();
    });

    simulateFileSelection(mockFile);

    await waitFor(() => {
      expect(screen.getByText("copy-test.pdf")).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /téléverser/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/copier le lien/i)).toBeInTheDocument();
    });

    const beforeCopy = metrics.length;
    const copyButton = screen.getByText(/copier le lien/i);

    const startTime = performance.now();
    fireEvent.click(copyButton);
    const clickDuration = performance.now() - startTime;

    await new Promise((resolve) => setTimeout(resolve, 100));

    const copyUpdates = metrics.slice(beforeCopy);

    console.log("\n✅ TEST 10 - Performance du bouton copier");
    console.log(`   Nombre de re-rendus: ${copyUpdates.length}`);
    console.log(`   Durée du clic: ${clickDuration.toFixed(2)}ms`);

    expect(copyUpdates.length).toBeLessThanOrEqual(2);
    expect(clickDuration).toBeLessThan(50);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockUploadSuccess.downloadLink);
  }, 20000);

  /* ==================== TEST 11: Rapport complet de performance ==================== */
  it("TEST 11: Rapport complet de performance", async () => {
    const metrics: ProfilerMetrics[] = [];
    const mockFile = createMockFile("complete-test.pdf", 3 * 1024 * 1024);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUploadSuccess),
    });

    render(
      <ProfilerWrapper id="fileupload-report" onRender={(m) => metrics.push(m)}>
        <FileUpload isOpen={true} onClose={mockOnClose} userId={1} />
      </ProfilerWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Ajouter un fichier")).toBeInTheDocument();
    });

    simulateFileSelection(mockFile);

    await waitFor(() => {
      expect(screen.getByText("complete-test.pdf")).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/mot de passe/i);
    fireEvent.change(passwordInput, { target: { value: "myPassword123" } });

    const expirationSelect = screen.getByLabelText(/expiration/i);
    fireEvent.change(expirationSelect, { target: { value: "14" } });

    const submitButton = screen.getByRole("button", { name: /téléverser/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/félicitations/i)).toBeInTheDocument();
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mountMetrics = metrics.filter((m) => m.phase === "mount");
    const updateMetrics = metrics.filter((m) => m.phase === "update");
    const nestedMetrics = metrics.filter((m) => m.phase === "nested-update");

    const totalDuration = metrics.reduce((sum, m) => sum + m.actualDuration, 0);
    const avgDuration = metrics.length > 0 ? totalDuration / metrics.length : 0;

    console.log("\n" + "=".repeat(60));
    console.log("📊 RAPPORT COMPLET - FileUpload");
    console.log("=".repeat(60));
    console.log(`\n📈 Statistiques:`);
    console.log(`   - Total rendus: ${metrics.length}`);
    console.log(`   - Durée totale: ${totalDuration.toFixed(2)}ms`);
    console.log(`   - Durée moyenne: ${avgDuration.toFixed(2)}ms`);

    console.log(`\n🆕 Mount:`);
    if (mountMetrics.length > 0) {
      const d = mountMetrics[0].actualDuration;
      const s = d < 150 ? "🟢" : d < 250 ? "🟡" : "🔴";
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
    expect(mountMetrics[0]?.actualDuration).toBeLessThan(250);
  }, 25000);
});
