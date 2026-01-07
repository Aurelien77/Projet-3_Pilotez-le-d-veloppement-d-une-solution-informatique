/**
 * @jest-environment jsdom
 */
import React from "react";

describe("index.tsx", () => {
  let rootElement: HTMLElement;
  let mockRender: jest.Mock;
  let mockCreateRoot: jest.Mock;

  beforeEach(() => {
    // Réinitialiser tous les modules
    jest.resetModules();

    // Créer l'élément root dans le DOM
    rootElement = document.createElement("div");
    rootElement.id = "root";
    document.body.appendChild(rootElement);

    // Créer les mocks
    mockRender = jest.fn();
    mockCreateRoot = jest.fn(() => ({
      render: mockRender,
      unmount: jest.fn(),
    }));

    // Configurer les mocks
    jest.doMock("react-dom/client", () => ({
      createRoot: mockCreateRoot,
    }));

    jest.doMock("./App", () => ({
      __esModule: true,
      default: () => <div>App Mock</div>,
    }));
  });

  afterEach(() => {
    if (document.body.contains(rootElement)) {
      document.body.removeChild(rootElement);
    }
    jest.resetModules();
  });

  it("devrait créer une racine React et rendre l'App", () => {
    // ✅ NE PAS ASSIGNER - juste require pour exécuter le code
    require("./index");

    expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);
    expect(mockRender).toHaveBeenCalledTimes(1);

    const renderCall = mockRender.mock.calls[0][0];
    expect(renderCall.type).toBe(React.StrictMode);
  });
});
