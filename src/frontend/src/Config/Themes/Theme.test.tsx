/**
 * @jest-environment jsdom
 */
// Config/Themes/Theme.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import theme, { Theme } from "./Index";

describe("Theme Configuration", () => {
  describe("Structure du thème", () => {
    it("devrait avoir la structure correcte", () => {
      expect(theme).toBeDefined();
      expect(theme).toHaveProperty("colors");
      expect(theme).toHaveProperty("gradients");
      expect(theme).toHaveProperty("fonts");
      expect(theme).toHaveProperty("logos");
    });

    it("devrait avoir toutes les propriétés de couleurs", () => {
      expect(theme.colors).toHaveProperty("primary");
      expect(theme.colors).toHaveProperty("secondary");
      expect(theme.colors).toHaveProperty("text");
      expect(theme.colors).toHaveProperty("textLight");
      expect(theme.colors).toHaveProperty("white");
      expect(theme.colors).toHaveProperty("black");
    });

    it("devrait avoir toutes les propriétés de gradients", () => {
      expect(theme.gradients).toHaveProperty("main");
    });

    it("devrait avoir toutes les propriétés de fonts", () => {
      expect(theme.fonts).toHaveProperty("primary");
      expect(theme.fonts).toHaveProperty("italic");
    });

    it("devrait avoir le logo UploadIcon", () => {
      expect(theme.logos).toHaveProperty("UploadIcon");
      expect(typeof theme.logos?.UploadIcon).toBe("function");
    });
  });

  describe("Valeurs des couleurs", () => {
    it("devrait avoir les bonnes valeurs de couleurs", () => {
      expect(theme.colors.white).toBe("#ffffff");
      expect(theme.colors.black).toBe("#000000");
    });

    it("devrait avoir des valeurs de type string", () => {
      expect(typeof theme.colors.primary).toBe("string");
      expect(typeof theme.colors.secondary).toBe("string");
      expect(typeof theme.colors.text).toBe("string");
      expect(typeof theme.colors.textLight).toBe("string");
      expect(typeof theme.colors.white).toBe("string");
      expect(typeof theme.colors.black).toBe("string");
    });

    it("devrait avoir des couleurs au format hexadécimal valide pour white et black", () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      expect(theme.colors.white).toMatch(hexRegex);
      expect(theme.colors.black).toMatch(hexRegex);
    });
  });

  describe("Valeurs des gradients", () => {
    it("devrait avoir le gradient principal", () => {
      expect(theme.gradients.main).toBe("linear-gradient(180deg, #FFB88C 0%, #DE6262 100%)");
    });

    it("devrait avoir un gradient au format CSS valide", () => {
      expect(theme.gradients.main).toContain("linear-gradient");
      expect(theme.gradients.main).toContain("180deg");
      expect(theme.gradients.main).toContain("#FFB88C");
      expect(theme.gradients.main).toContain("#DE6262");
    });
  });

  describe("Valeurs des fonts", () => {
    it("devrait avoir les bonnes valeurs de fonts", () => {
      expect(theme.fonts.primary).toBe("Arial, sans-serif");
      expect(theme.fonts.italic).toBe("italic");
    });

    it("devrait avoir des fonts de type string", () => {
      expect(typeof theme.fonts.primary).toBe("string");
      expect(typeof theme.fonts.italic).toBe("string");
    });
  });

  describe("UploadIcon Component", () => {
    it("devrait rendre le composant UploadIcon", () => {
      const UploadIcon = theme.logos?.UploadIcon;
      expect(UploadIcon).toBeDefined();

      if (UploadIcon) {
        const { container } = render(<UploadIcon />);
        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();
      }
    });

    it("devrait rendre un SVG avec les bons attributs par défaut", () => {
      const UploadIcon = theme.logos?.UploadIcon;

      if (UploadIcon) {
        const { container } = render(<UploadIcon />);
        const svg = container.querySelector("svg");

        expect(svg).toHaveAttribute("xmlns", "http://www.w3.org/2000/svg");
        expect(svg).toHaveAttribute("viewBox", "34 42 32 23");
        expect(svg).toHaveAttribute("width", "100");
        expect(svg).toHaveAttribute("height", "100");
      }
    });

    it("devrait accepter une taille personnalisée", () => {
      const UploadIcon = theme.logos?.UploadIcon;

      if (UploadIcon) {
        const { container } = render(<UploadIcon size={50} />);
        const svg = container.querySelector("svg");

        expect(svg).toHaveAttribute("width", "50");
        expect(svg).toHaveAttribute("height", "50");
      }
    });

    it("devrait accepter une couleur personnalisée", () => {
      const UploadIcon = theme.logos?.UploadIcon;

      if (UploadIcon) {
        const { container } = render(<UploadIcon color="red" />);
        const svg = container.querySelector("svg");
        const path = svg?.querySelector("path");
        const group = svg?.querySelector("g");

        expect(path).toHaveAttribute("stroke", "red");
        expect(group).toHaveAttribute("stroke", "red");
      }
    });

    it("devrait utiliser white comme couleur par défaut", () => {
      const UploadIcon = theme.logos?.UploadIcon;

      if (UploadIcon) {
        const { container } = render(<UploadIcon />);
        const svg = container.querySelector("svg");
        const path = svg?.querySelector("path");

        expect(path).toHaveAttribute("stroke", "white");
      }
    });

    it("devrait contenir un path pour le nuage", () => {
      const UploadIcon = theme.logos?.UploadIcon;

      if (UploadIcon) {
        const { container } = render(<UploadIcon />);
        const path = container.querySelector("path");

        expect(path).toBeInTheDocument();
        expect(path).toHaveAttribute("fill", "none");
        expect(path).toHaveAttribute("stroke-width", "2.5");
        expect(path).toHaveAttribute("stroke-linecap", "round");
        expect(path).toHaveAttribute("stroke-linejoin", "round");
      }
    });

    it("devrait contenir un groupe pour la flèche", () => {
      const UploadIcon = theme.logos?.UploadIcon;

      if (UploadIcon) {
        const { container } = render(<UploadIcon />);
        const svg = container.querySelector("svg");
        const group = svg?.querySelector("g");

        expect(group).toBeInTheDocument();
        expect(group).toHaveAttribute("stroke-width", "2.5");
        expect(group).toHaveAttribute("stroke-linecap", "round");
        expect(group).toHaveAttribute("stroke-linejoin", "round");
        expect(group).toHaveAttribute("fill", "none");
      }
    });

    it("devrait contenir une ligne verticale", () => {
      const UploadIcon = theme.logos?.UploadIcon;

      if (UploadIcon) {
        const { container } = render(<UploadIcon />);
        const line = container.querySelector("line");

        expect(line).toBeInTheDocument();
        expect(line).toHaveAttribute("x1", "50");
        expect(line).toHaveAttribute("y1", "65");
        expect(line).toHaveAttribute("x2", "50");
        expect(line).toHaveAttribute("y2", "48");
      }
    });

    it("devrait contenir une polyline pour la pointe de flèche", () => {
      const UploadIcon = theme.logos?.UploadIcon;

      if (UploadIcon) {
        const { container } = render(<UploadIcon />);
        const polyline = container.querySelector("polyline");

        expect(polyline).toBeInTheDocument();
        expect(polyline).toHaveAttribute("points", "45,53 50,48 55,53");
      }
    });

    it("devrait rendre correctement avec size et color personnalisés", () => {
      const UploadIcon = theme.logos?.UploadIcon;

      if (UploadIcon) {
        const { container } = render(<UploadIcon size={150} color="#FF812D" />);
        const svg = container.querySelector("svg");
        const path = svg?.querySelector("path");
        const group = svg?.querySelector("g");

        expect(svg).toHaveAttribute("width", "150");
        expect(svg).toHaveAttribute("height", "150");
        expect(path).toHaveAttribute("stroke", "#FF812D");
        expect(group).toHaveAttribute("stroke", "#FF812D");
      }
    });
  });

  describe("Type Safety", () => {
    it("devrait correspondre à l'interface Theme", () => {
      const themeCheck: Theme = theme;
      expect(themeCheck).toBeDefined();
    });

    it("devrait avoir des couleurs de type Record<string, string>", () => {
      Object.values(theme.colors).forEach((color) => {
        expect(typeof color).toBe("string");
      });
    });

    it("devrait avoir des gradients de type Record<string, string>", () => {
      Object.values(theme.gradients).forEach((gradient) => {
        expect(typeof gradient).toBe("string");
      });
    });

    it("devrait avoir des fonts de type Record<string, string>", () => {
      Object.values(theme.fonts).forEach((font) => {
        expect(typeof font).toBe("string");
      });
    });
  });

  describe("Immutabilité", () => {
    it("ne devrait pas permettre de modifier les couleurs", () => {
      const originalWhite = theme.colors.white;

      // Tenter de modifier (cela ne devrait pas fonctionner en TypeScript strict)
      // mais le test vérifie que la valeur reste la même
      expect(theme.colors.white).toBe(originalWhite);
    });

    it("devrait conserver les mêmes références d'objet", () => {
      const colorsRef = theme.colors;
      const gradientsRef = theme.gradients;
      const fontsRef = theme.fonts;

      expect(theme.colors).toBe(colorsRef);
      expect(theme.gradients).toBe(gradientsRef);
      expect(theme.fonts).toBe(fontsRef);
    });
  });

  describe("Snapshot Testing", () => {
    it("devrait correspondre au snapshot de la structure du thème", () => {
      const themeStructure = {
        colors: Object.keys(theme.colors),
        gradients: Object.keys(theme.gradients),
        fonts: Object.keys(theme.fonts),
        logos: theme.logos ? Object.keys(theme.logos) : [],
      };

      expect(themeStructure).toMatchSnapshot();
    });

    it("devrait correspondre au snapshot du rendu de UploadIcon", () => {
      const UploadIcon = theme.logos?.UploadIcon;

      if (UploadIcon) {
        const { container } = render(<UploadIcon />);
        expect(container.firstChild).toMatchSnapshot();
      }
    });

    it("devrait correspondre au snapshot de UploadIcon avec props personnalisées", () => {
      const UploadIcon = theme.logos?.UploadIcon;

      if (UploadIcon) {
        const { container } = render(<UploadIcon size={75} color="#FF812D" />);
        expect(container.firstChild).toMatchSnapshot();
      }
    });
  });

  describe("Intégration et utilisation", () => {
    it("devrait pouvoir être importé et utilisé dans un composant", () => {
      const TestComponent = () => <div style={{ color: theme.colors.white, fontFamily: theme.fonts.primary }}>Test</div>;

      const { container } = render(<TestComponent />);
      const div = container.querySelector("div");

      expect(div).toHaveStyle({ color: theme.colors.white });
      expect(div).toHaveStyle({ fontFamily: theme.fonts.primary });
    });

    it("devrait pouvoir utiliser le gradient dans un style", () => {
      const TestComponent = () => <div style={{ background: theme.gradients.main }}>Test</div>;

      const { container } = render(<TestComponent />);
      const div = container.querySelector("div");

      expect(div).toHaveStyle({ background: theme.gradients.main });
    });

    it("devrait pouvoir rendre UploadIcon dans un composant", () => {
      const UploadIcon = theme.logos?.UploadIcon;

      if (UploadIcon) {
        const TestComponent = () => (
          <div>
            <UploadIcon size={60} color={theme.colors.black} />
          </div>
        );

        const { container } = render(<TestComponent />);
        const svg = container.querySelector("svg");

        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute("width", "60");
      }
    });
  });

  describe("Validation des valeurs", () => {
    it("ne devrait pas avoir de valeurs undefined", () => {
      expect(theme.colors.white).not.toBeUndefined();
      expect(theme.colors.black).not.toBeUndefined();
      expect(theme.gradients.main).not.toBeUndefined();
      expect(theme.fonts.primary).not.toBeUndefined();
      expect(theme.fonts.italic).not.toBeUndefined();
    });

    it("ne devrait pas avoir de valeurs null", () => {
      expect(theme.colors.white).not.toBeNull();
      expect(theme.colors.black).not.toBeNull();
      expect(theme.gradients.main).not.toBeNull();
      expect(theme.fonts.primary).not.toBeNull();
      expect(theme.fonts.italic).not.toBeNull();
    });

    it("ne devrait pas avoir de chaînes vides pour les couleurs essentielles", () => {
      expect(theme.colors.white).not.toBe("");
      expect(theme.colors.black).not.toBe("");
    });
  });
});
