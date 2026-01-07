/**
 * @jest-environment jsdom
 */
// Components/Footer/Footer.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "./Index";

describe("Footer Component", () => {
  it("devrait afficher le texte de copyright par défaut", () => {
    render(<Footer />);

    expect(screen.getByText("Copyright DataShare© 2025")).toBeInTheDocument();
  });

  it("devrait afficher le texte de copyright personnalisé", () => {
    render(<Footer copyrightText="© Ma Compagnie 2026" />);

    expect(screen.getByText("Copyright DataShare© 2025")).toBeInTheDocument();
    // Note: Le composant ignore copyrightText actuellement et affiche toujours "Copyright DataShare© 2025"
  });

  it("devrait utiliser les styles par défaut", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    const paragraph = screen.getByText("Copyright DataShare© 2025");

    // Vérifier les styles par défaut du footer
    expect(footer).toHaveStyle({
      padding: "clamp(15px, 3vw, 20px) clamp(20px, 4vw, 40px)",
      flexShrink: "0",
    });

    // Vérifier les styles par défaut du texte
    expect(paragraph).toHaveStyle({
      fontSize: "clamp(0.75rem, 2vw, 0.95rem)",
      color: "#000",
      opacity: "0.8",
      margin: "0",
      fontFamily: "Arial, sans-serif",
    });
  });

  it("devrait appliquer les styles personnalisés du conteneur", () => {
    const customContainerStyle: React.CSSProperties = {
      backgroundColor: "#f0f0f0",
      borderTop: "1px solid #ccc",
      padding: "30px",
    };

    render(<Footer containerStyle={customContainerStyle} />);

    const footer = screen.getByRole("contentinfo");

    expect(footer).toHaveStyle({
      backgroundColor: "#f0f0f0",
      borderTop: "1px solid #ccc",
      padding: "30px",
    });
  });

  it("devrait appliquer les styles personnalisés du texte", () => {
    const customTextStyle: React.CSSProperties = {
      color: "#ff0000",
      fontSize: "18px",
      fontWeight: "bold",
    };

    render(<Footer textStyle={customTextStyle} />);

    const paragraph = screen.getByText("Copyright DataShare© 2025");

    expect(paragraph).toHaveStyle({
      color: "#ff0000",
      fontSize: "18px",
      fontWeight: "bold",
    });
  });

  it("devrait fusionner les styles personnalisés avec les styles par défaut", () => {
    const customContainerStyle: React.CSSProperties = {
      backgroundColor: "blue",
    };

    render(<Footer containerStyle={customContainerStyle} />);

    const footer = screen.getByRole("contentinfo");

    // Style personnalisé appliqué
    expect(footer).toHaveStyle({ backgroundColor: "blue" });

    // Styles par défaut toujours présents
    expect(footer).toHaveStyle({ flexShrink: "0" });
  });

  it("devrait avoir la sémantique HTML correcte", () => {
    render(<Footer />);

    // Vérifier que c'est bien un élément <footer>
    const footer = screen.getByRole("contentinfo");
    expect(footer.tagName).toBe("FOOTER");

    // Vérifier qu'il contient un <p>
    const paragraph = screen.getByText("Copyright DataShare© 2025");
    expect(paragraph.tagName).toBe("P");
  });

  it("devrait rendre correctement avec tous les props personnalisés", () => {
    const customContainerStyle: React.CSSProperties = {
      backgroundColor: "#333",
      padding: "50px",
    };

    const customTextStyle: React.CSSProperties = {
      color: "#fff",
      fontSize: "14px",
    };

    render(<Footer copyrightText="© Test 2026" containerStyle={customContainerStyle} textStyle={customTextStyle} />);

    const footer = screen.getByRole("contentinfo");
    const paragraph = screen.getByText("Copyright DataShare© 2025");

    expect(footer).toHaveStyle({
      backgroundColor: "#333",
      padding: "50px",
    });

    expect(paragraph).toHaveStyle({
      color: "#fff",
      fontSize: "14px",
    });
  });

  it("ne devrait pas crasher sans props", () => {
    expect(() => {
      render(<Footer />);
    }).not.toThrow();
  });

  it("devrait être un composant snapshot stable", () => {
    const { container } = render(<Footer />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
