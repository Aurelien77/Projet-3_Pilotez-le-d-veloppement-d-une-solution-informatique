// src/Pages/Default/Default.performance.test.tsx
import React from "react";
import { render } from "@testing-library/react";
import Default from "./Index";

// Mock de useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  __esModule: true,
  useNavigate: () => mockNavigate,
}));

describe("Performance – Default Page", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test("√ ⏱️ render initial de la page en moins de 50ms", () => {
    const start = performance.now();
    render(<Default />);
    const end = performance.now();

    const renderTime = end - start;
    console.log(`⏱️ Render initial Default: ${renderTime.toFixed(2)} ms`);

    expect(renderTime).toBeLessThan(50); // Ajuste la limite selon tes besoins
  });

  test("√ 🔁 clic utilisateur rapide", () => {
    const { getByTestId } = render(<Default />);
    const div = getByTestId("default-page");

    const start = performance.now();
    div.click();
    const end = performance.now();

    const clickTime = end - start;
    console.log(`⏱️ Temps interaction clic: ${clickTime.toFixed(2)} ms`);

    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(clickTime).toBeLessThan(20); // interaction rapide
  });
});
