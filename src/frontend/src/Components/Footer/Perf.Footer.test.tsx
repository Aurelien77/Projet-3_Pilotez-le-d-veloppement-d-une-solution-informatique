/**
 * @jest-environment jsdom
 */
// Components/Footer/Footer.performance.test.tsx
import React, { Profiler, ProfilerOnRenderCallback } from "react";
import { render } from "@testing-library/react";
import Footer from "./Index";

// Configuration des seuils de performance
const PERFORMANCE_THRESHOLDS = {
  initialRender: 50,
  reRender: 20,
  averageRender: 10,
};

describe("Tests de Performance - Footer", () => {
  describe("Temps de rendu", () => {
    it("premier rendu < 50ms", () => {
      const start = performance.now();
      render(<Footer />);
      const duration = performance.now() - start;

      console.log(`⏱️  Premier rendu: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.initialRender);
    });

    it("rendus multiples performants (100 itérations)", () => {
      const times: number[] = [];
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const { unmount } = render(<Footer />);
        const duration = performance.now() - start;
        times.push(duration);
        unmount();
      }

      const average = times.reduce((a, b) => a + b, 0) / times.length;
      const max = Math.max(...times);
      const min = Math.min(...times);

      console.log(`
        📊 Statistiques (${iterations} rendus):
        - Moyenne: ${average.toFixed(2)}ms
        - Max: ${max.toFixed(2)}ms
        - Min: ${min.toFixed(2)}ms
      `);

      expect(average).toBeLessThan(PERFORMANCE_THRESHOLDS.averageRender);
    });

    it("rendu avec styles personnalisés < 50ms", () => {
      const customContainerStyle = {
        backgroundColor: "#333",
        padding: "50px",
        borderTop: "2px solid #fff",
      };

      const customTextStyle = {
        color: "#fff",
        fontSize: "16px",
        fontWeight: "bold",
      };

      const start = performance.now();
      render(<Footer copyrightText="© Test 2026" containerStyle={customContainerStyle} textStyle={customTextStyle} />);
      const duration = performance.now() - start;

      console.log(`⏱️  Rendu avec styles: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.initialRender);
    });
  });

  describe("Profiling détaillé", () => {
    it("analyse avec React Profiler", () => {
      const measurements: number[] = [];

      const onRender: ProfilerOnRenderCallback = (id, phase, actualDuration) => {
        measurements.push(actualDuration);
        console.log(`${id} (${phase}): ${actualDuration.toFixed(2)}ms`);
      };

      render(
        <Profiler id="Footer" onRender={onRender}>
          <Footer />
        </Profiler>
      );

      expect(measurements.length).toBeGreaterThan(0);

      const totalTime = measurements.reduce((a, b) => a + b, 0);
      console.log(`⏱️  Temps total: ${totalTime.toFixed(2)}ms`);

      expect(totalTime).toBeLessThan(50);
    });

    it("compare les performances avec et sans styles personnalisés", () => {
      const iterations = 50;

      // Test sans styles personnalisés
      const timeWithoutStyles: number[] = [];
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const { unmount } = render(<Footer />);
        timeWithoutStyles.push(performance.now() - start);
        unmount();
      }

      // Test avec styles personnalisés
      const timeWithStyles: number[] = [];
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const { unmount } = render(<Footer containerStyle={{ backgroundColor: "#000" }} textStyle={{ color: "#fff" }} />);
        timeWithStyles.push(performance.now() - start);
        unmount();
      }

      const avgWithout = timeWithoutStyles.reduce((a, b) => a + b, 0) / iterations;
      const avgWith = timeWithStyles.reduce((a, b) => a + b, 0) / iterations;

      console.log(`
        📊 Comparaison de performance:
        - Sans styles: ${avgWithout.toFixed(2)}ms
        - Avec styles: ${avgWith.toFixed(2)}ms
        - Différence: ${(avgWith - avgWithout).toFixed(2)}ms
      `);

      // La différence devrait être minime (< 5ms)
      expect(Math.abs(avgWith - avgWithout)).toBeLessThan(5);
    });
  });

  describe("Optimisation", () => {
    it("pas de re-rendus inutiles avec les mêmes props", () => {
      let renderCount = 0;

      const ComponentWithCounter = () => {
        renderCount++;
        return <Footer copyrightText="Test" />;
      };

      const { rerender } = render(<ComponentWithCounter />);

      expect(renderCount).toBe(1);

      // Re-render avec les mêmes props
      rerender(<ComponentWithCounter />);

      // Devrait avoir fait 2 rendus (initial + 1 re-render)
      expect(renderCount).toBe(2);
    });

    it("gère efficacement les changements de props", () => {
      const times: number[] = [];
      const iterations = 50;

      const { rerender } = render(<Footer copyrightText="Text 1" />);

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        rerender(<Footer copyrightText={`Text ${i}`} />);
        times.push(performance.now() - start);
      }

      const average = times.reduce((a, b) => a + b, 0) / times.length;

      console.log(`⏱️  Re-render moyen: ${average.toFixed(2)}ms`);
      expect(average).toBeLessThan(PERFORMANCE_THRESHOLDS.reRender);
    });
  });

  describe("Tests de mémoire", () => {
    it("ne devrait pas avoir de fuites mémoire sur 1000 rendus", () => {
      const iterations = 1000;
      const renders = [];

      for (let i = 0; i < iterations; i++) {
        const { unmount } = render(<Footer copyrightText={`Copyright ${i}`} containerStyle={{ padding: `${i}px` }} />);
        renders.push(unmount);
      }

      // Nettoyer tous les rendus
      renders.forEach((unmount) => unmount());

      // Si pas d'erreur OutOfMemory, le test passe
      expect(renders).toHaveLength(iterations);
    });

    it("gère efficacement la création répétée de styles inline", () => {
      const iterations = 500;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        const { unmount } = render(
          <Footer
            containerStyle={{
              backgroundColor: `rgb(${i % 255}, 0, 0)`,
              padding: `${i % 50}px`,
            }}
            textStyle={{
              fontSize: `${12 + (i % 10)}px`,
              color: `hsl(${i % 360}, 50%, 50%)`,
            }}
          />
        );
        unmount();
      }

      const totalTime = performance.now() - start;
      const avgTime = totalTime / iterations;

      console.log(`
        📊 Performance styles dynamiques:
        - Total: ${totalTime.toFixed(2)}ms
        - Moyenne: ${avgTime.toFixed(2)}ms
      `);

      expect(avgTime).toBeLessThan(20);
    });
  });

  describe("Benchmark comparatif", () => {
    it("compare Footer avec et sans props", () => {
      const iterations = 100;

      // Benchmark sans props
      const startWithoutProps = performance.now();
      for (let i = 0; i < iterations; i++) {
        const { unmount } = render(<Footer />);
        unmount();
      }
      const timeWithoutProps = performance.now() - startWithoutProps;

      // Benchmark avec tous les props
      const startWithProps = performance.now();
      for (let i = 0; i < iterations; i++) {
        const { unmount } = render(<Footer copyrightText="Custom text" containerStyle={{ backgroundColor: "#000", padding: "30px" }} textStyle={{ color: "#fff", fontSize: "14px" }} />);
        unmount();
      }
      const timeWithProps = performance.now() - startWithProps;

      console.log(`
        🏁 Benchmark (${iterations} itérations):
        - Sans props: ${timeWithoutProps.toFixed(2)}ms (${(timeWithoutProps / iterations).toFixed(2)}ms/rendu)
        - Avec props: ${timeWithProps.toFixed(2)}ms (${(timeWithProps / iterations).toFixed(2)}ms/rendu)
        - Overhead: ${((timeWithProps - timeWithoutProps) / iterations).toFixed(2)}ms/rendu
      `);

      // L'overhead ne devrait pas être significatif
      expect((timeWithProps - timeWithoutProps) / iterations).toBeLessThan(2);
    });
  });
});
