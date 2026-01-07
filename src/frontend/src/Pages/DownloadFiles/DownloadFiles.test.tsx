/**
 * @jest-environment jsdom
 */
// src/Pages/DownloadFiles/DownloadFiles.test.tsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DownloadFiles from "./Index";

// Mock des dépendances
jest.mock("react-router-dom", () => ({
  __esModule: true,
  useParams: () => ({ fileId: "123" }),
  useNavigate: () => jest.fn(),
}));

jest.mock("../../Components/Header/Index", () => ({
  __esModule: true,
  default: ({ logoStyle, buttonStyle }: any) => <div data-testid="header-mock">Header Mock</div>,
}));

jest.mock("../../Components/Footer/Index", () => ({
  __esModule: true,
  default: ({ containerStyle, textStyle }: any) => <div data-testid="footer-mock">Footer Mock</div>,
}));

// Mock des données de test
const mockFileInfo = {
  id: 123,
  fileName: "test-document.pdf",
  hasPassword: false,
  creationDate: "2026-01-01T00:00:00Z",
  expirationDate: "2026-01-31T00:00:00Z",
  isExpired: false,
  uploadedBy: {
    id: 1,
    email: "user@example.com",
  },
};

const mockFileInfoWithPassword = {
  ...mockFileInfo,
  hasPassword: true,
};

const mockExpiredFile = {
  ...mockFileInfo,
  isExpired: true,
};

describe("DownloadFiles Component", () => {
  let createElementSpy: jest.SpyInstance;

  // Sauvegarder les fonctions originales
  const originalCreateObjectURL = global.URL.createObjectURL;
  const originalRevokeObjectURL = global.URL.revokeObjectURL;

  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();

    // Nettoyer le spy de createElement s'il existe
    if (createElementSpy) {
      createElementSpy.mockRestore();
    }

    // Réinitialiser URL mocks
    if (originalCreateObjectURL) {
      global.URL.createObjectURL = originalCreateObjectURL;
    }
    if (originalRevokeObjectURL) {
      global.URL.revokeObjectURL = originalRevokeObjectURL;
    }
  });

  afterEach(() => {
    // Nettoyer les mocks après chaque test
    if (global.fetch) {
      (global.fetch as jest.Mock).mockClear();
    }

    // Restaurer createElement
    if (createElementSpy) {
      createElementSpy.mockRestore();
    }

    // Restaurer URL mocks
    if (originalCreateObjectURL) {
      global.URL.createObjectURL = originalCreateObjectURL;
    }
    if (originalRevokeObjectURL) {
      global.URL.revokeObjectURL = originalRevokeObjectURL;
    }
  });

  it("devrait afficher le loading au chargement initial", () => {
    // Mock fetch qui ne résout jamais (simule le chargement)
    global.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;

    render(<DownloadFiles />);

    expect(screen.getByText(/chargement du fichier/i)).toBeInTheDocument();
    expect(screen.getByText("Header Mock")).toBeInTheDocument();
    expect(screen.getByText("Footer Mock")).toBeInTheDocument();
  });

  it("devrait afficher les informations du fichier après le chargement", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockFileInfo),
      })
    ) as jest.Mock;

    render(<DownloadFiles />);

    // Attendre que les informations du fichier s'affichent
    await waitFor(() => {
      expect(screen.getByText("Télécharger un fichier")).toBeInTheDocument();
    });

    expect(screen.getByText("test-document.pdf")).toBeInTheDocument();
    expect(screen.getByText(/ce fichier expirera dans/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /télécharger/i })).toBeInTheDocument();
  });

  it("devrait afficher un message d'erreur si le fichier n'existe pas", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      })
    ) as jest.Mock;

    render(<DownloadFiles />);

    await waitFor(() => {
      expect(screen.getByText(/ce fichier n'est plus disponible/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/car il a expiré/i)).toBeInTheDocument();

    const homeButton = screen.getByText(/retour à l'accueil/i).closest("button");
    expect(homeButton).toBeInTheDocument();
  });

  it("devrait afficher un message si le fichier est expiré", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockExpiredFile),
      })
    ) as jest.Mock;

    render(<DownloadFiles />);

    await waitFor(() => {
      expect(screen.getByText(/ce fichier n'est plus disponible/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/car il a expiré/i)).toBeInTheDocument();
  });

  it("devrait afficher le champ mot de passe si le fichier est protégé", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockFileInfoWithPassword),
      })
    ) as jest.Mock;

    render(<DownloadFiles />);

    await waitFor(() => {
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/saisissez le mot de passe/i)).toBeInTheDocument();
  });

  it("permet de taper un mot de passe dans le champ", async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockFileInfoWithPassword),
      })
    ) as jest.Mock;

    render(<DownloadFiles />);

    await waitFor(() => {
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/mot de passe/i);
    await user.type(passwordInput, "secret123");

    expect(passwordInput).toHaveValue("secret123");
  });

  it("devrait télécharger un fichier sans mot de passe", async () => {
    const user = userEvent.setup();
    const mockBlob = new Blob(["file content"], { type: "application/pdf" });

    // Mock des méthodes DOM pour le téléchargement
    const mockCreateObjectURL = jest.fn(() => "blob:mock-url");
    const mockRevokeObjectURL = jest.fn();
    const mockClick = jest.fn();
    const mockRemove = jest.fn();

    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    const originalCreateElement = document.createElement.bind(document);
    createElementSpy = jest.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "a") {
        const element = originalCreateElement("a");
        element.click = mockClick;
        element.remove = mockRemove;
        return element;
      }
      return originalCreateElement(tagName);
    });

    // Premier appel pour fetchFileInfo
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFileInfo),
      })
      // Deuxième appel pour le téléchargement
      .mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      }) as jest.Mock;

    render(<DownloadFiles />);

    await waitFor(() => {
      expect(screen.getByText("test-document.pdf")).toBeInTheDocument();
    });

    const downloadButton = screen.getByText(/^télécharger$/i).closest("button");
    await user.click(downloadButton!);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "https://localhost:7120/api/Files/download/123",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        })
      );
    });

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockClick).toHaveBeenCalled();
    });
  });

  it("devrait afficher une erreur si le téléchargement échoue", async () => {
    const user = userEvent.setup();

    // Premier appel pour fetchFileInfo
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFileInfo),
      })
      // Deuxième appel pour le téléchargement qui échoue
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: "Erreur de téléchargement" }),
      }) as jest.Mock;

    render(<DownloadFiles />);

    await waitFor(() => {
      expect(screen.getByText("test-document.pdf")).toBeInTheDocument();
    });

    const downloadButton = screen.getByText(/^télécharger$/i).closest("button");
    await user.click(downloadButton!);

    await waitFor(() => {
      expect(screen.getByText(/erreur de téléchargement/i)).toBeInTheDocument();
    });
  });

  it("devrait désactiver le bouton de téléchargement si un mot de passe est requis mais non fourni", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockFileInfoWithPassword),
      })
    ) as jest.Mock;

    render(<DownloadFiles />);

    await waitFor(() => {
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    });

    // Utiliser getAllByText pour obtenir tous les éléments et sélectionner le span du bouton
    const downloadTexts = screen.getAllByText(/^télécharger$/i);
    const downloadButton = downloadTexts[downloadTexts.length - 1].closest("button");
    expect(downloadButton).toBeDisabled();
  });

  it("devrait activer le bouton de téléchargement quand un mot de passe est fourni", async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockFileInfoWithPassword),
      })
    ) as jest.Mock;

    render(<DownloadFiles />);

    await waitFor(() => {
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/mot de passe/i);
    await user.type(passwordInput, "secret123");

    // Utiliser getAllByText pour obtenir tous les éléments et sélectionner le span du bouton
    const downloadTexts = screen.getAllByText(/^télécharger$/i);
    const downloadButton = downloadTexts[downloadTexts.length - 1].closest("button");
    expect(downloadButton).not.toBeDisabled();
  });

  it("devrait afficher le texte 'Téléchargement...' pendant le téléchargement", async () => {
    const user = userEvent.setup();

    // Mock des méthodes DOM
    global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = jest.fn();

    // Premier appel pour fetchFileInfo
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFileInfo),
      })
      // Deuxième appel pour le téléchargement qui prend du temps
      .mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  blob: () => Promise.resolve(new Blob()),
                }),
              100
            )
          )
      ) as jest.Mock;

    render(<DownloadFiles />);

    await waitFor(() => {
      expect(screen.getByText("test-document.pdf")).toBeInTheDocument();
    });

    const downloadButton = screen.getByText(/^télécharger$/i).closest("button");
    await user.click(downloadButton!);

    // Vérifier que le texte change pendant le téléchargement
    await waitFor(() => {
      expect(screen.getByText(/téléchargement\.\.\./i)).toBeInTheDocument();
    });
  });
});
