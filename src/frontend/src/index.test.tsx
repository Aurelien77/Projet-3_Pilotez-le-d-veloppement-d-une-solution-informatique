/**
 * @jest-environment jsdom
 */
import React from "react";

describe("index.tsx", () => {
  let rootElement: HTMLElement;
  let mockRender: jest.Mock;
  let mockCreateRoot: jest.Mock;

  beforeEach(() => {
    // 1. Réinitialiser tous les modules pour partir d'un état propre
    jest.resetModules();

    // 2. Créer l'élément root dans le DOM
    rootElement = document.createElement("div");
    rootElement.id = "root";
    document.body.appendChild(rootElement);

    // 3. Créer les mocks
    mockRender = jest.fn();
    mockCreateRoot = jest.fn(() => ({
      render: mockRender,
      unmount: jest.fn(),
    }));

    // 4. Configurer les mocks AVANT le require
    jest.doMock("react-dom/client", () => ({
      createRoot: mockCreateRoot,
    }));

    jest.doMock("./App", () => ({
      __esModule: true,
      default: () => <div>App Mock</div>,
    }));
  });

  afterEach(() => {
    // Nettoyer le DOM
    if (document.body.contains(rootElement)) {
      document.body.removeChild(rootElement);
    }
    jest.resetModules();
  });

  it("devrait créer une racine React et rendre l'App", () => {
    // Importer le fichier index.tsx (cela va l'exécuter)
    require("./index");

    // Vérifier que createRoot a été appelé avec le bon élément
    expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);

    // Vérifier que render a été appelé
    expect(mockRender).toHaveBeenCalledTimes(1);

    // Vérifier que le contenu rendu contient StrictMode
    const renderCall = mockRender.mock.calls[0][0];
    expect(renderCall.type).toBe(React.StrictMode);
  });

  it("devrait trouver l'élément root dans le DOM", () => {
    const foundElement = document.getElementById("root");
    expect(foundElement).toBe(rootElement);
  });
});
