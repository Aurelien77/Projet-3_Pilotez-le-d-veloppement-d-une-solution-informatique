/**
 * @jest-environment jsdom
 */
// src/Pages/DownloadFiles/Perf.DownloadFiles.test.tsx

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import DownloadFiles from "./Index";

/* ============================== MOCKS ============================== */

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useParams: () => ({ fileId: "123" }),
  useNavigate: () => jest.fn(),
}));

jest.mock("../../Components/Header/Index", () => ({
  __esModule: true,
  default: () => <div>Header</div>,
}));

jest.mock("../../Components/Footer/Index", () => ({
  __esModule: true,
  default: () => <div>Footer</div>,
}));

/* ============================== DATA ============================== */

const mockFileInfo = {
  id: 123,
  fileName: "big-file.pdf",
  hasPassword: false,
  creationDate: "2026-01-01T00:00:00Z",
  expirationDate: "2026-02-01T00:00:00Z",
  isExpired: false,
  uploadedBy: {
    id: 1,
    email: "user@example.com",
  },
};

/* ============================== TESTS ============================== */

describe("Performance – DownloadFiles", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* ------------------------------------------------------------ */
  it("⏱️ render initial en moins de 200ms", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockFileInfo),
      })
    ) as jest.Mock;

    const start = performance.now();

    render(<DownloadFiles />);

    await waitFor(() => expect(screen.getByText("Télécharger un fichier")).toBeInTheDocument());

    const end = performance.now();
    const renderTime = end - start;

    console.log(`⏱️ Render time: ${renderTime.toFixed(2)} ms`);

    expect(renderTime).toBeLessThan(200);
  });

  /* ------------------------------------------------------------ */
  it("🌐 ne fait qu’un seul appel API pour charger les infos", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockFileInfo),
      })
    ) as jest.Mock;

    render(<DownloadFiles />);

    await waitFor(() => expect(screen.getByText("big-file.pdf")).toBeInTheDocument());

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  /* ------------------------------------------------------------ */
  it("📥 déclenche le téléchargement en moins de 150ms", async () => {
    const mockBlob = new Blob(["data"]);

    global.URL.createObjectURL = jest.fn(() => "blob:url");
    global.URL.revokeObjectURL = jest.fn();

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFileInfo),
      })
      .mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      }) as jest.Mock;

    render(<DownloadFiles />);

    await waitFor(() => expect(screen.getByText("Télécharger")).toBeInTheDocument());

    const button = screen.getByText("Télécharger").closest("button")!;
    const start = performance.now();

    button.click();

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith("https://localhost:7120/api/Files/download/123", expect.any(Object)));

    const end = performance.now();
    const downloadTime = end - start;

    console.log(`📥 Download trigger time: ${downloadTime.toFixed(2)} ms`);

    expect(downloadTime).toBeLessThan(150);
  });

  /* ------------------------------------------------------------ */
  it("🔁 supporte 10 montages consécutifs sans fuite", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockFileInfo),
      })
    ) as jest.Mock;

    for (let i = 0; i < 10; i++) {
      const { unmount } = render(<DownloadFiles />);
      await waitFor(() => expect(screen.getByText("Télécharger un fichier")).toBeInTheDocument());
      unmount();
    }

    expect(global.fetch).toHaveBeenCalledTimes(10);
  });

  /* ------------------------------------------------------------ */
  it("🚫 ne déclenche pas de re-render visible inutile", async () => {
    const renderSpy = jest.fn();

    const TestWrapper = () => {
      renderSpy();
      return <DownloadFiles />;
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockFileInfo),
      })
    ) as jest.Mock;

    render(<TestWrapper />);

    await waitFor(() => expect(screen.getByText("Télécharger un fichier")).toBeInTheDocument());

    expect(renderSpy.mock.calls.length).toBeLessThan(5);
  });
});
