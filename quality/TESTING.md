🧪 TESTING.md — Stratégie et état des tests (DataShare)



Ce document décrit la stratégie de tests actuelle, comment exécuter les tests et lire les résultats.



📦 Stack et outils

Côté	Technologies / Outils

Frontend	React + TypeScript, Jest, React Testing Library, Coverage via --coverage

Backend	C# ASP.NET Core, xUnit, InMemoryDatabase, ITestOutputHelper

Base de données	PostgreSQL (tests backend via EF Core InMemory)

🎯 Objectifs des tests



Vérifier le fonctionnement correct des composants frontend.



Tester la logique métier côté backend (CRUD fichiers, utilisateurs, authentification).



Garantir la sécurité fonctionnelle (validation des entrées, accès aux fichiers, soft delete).



Contrôler la performance minimale de certaines actions critiques (ex. affichage des erreurs, saisie de formulaire).



🧩 Types de tests

Frontend



Unitaires : tests des composants React isolés.



Tests de performance : utilisation de ProfilerWrapper pour mesurer les re-rendus et la durée.



Tests d’intégration : vérification de l’interaction entre plusieurs composants (ex. formulaire de connexion + affichage des erreurs).



Outils : Jest, @testing-library/react.



Backend



Unitaires : tests des méthodes des services (PasswordService, validation).



Integration tests : tests des contrôleurs avec InMemoryDatabase.



Tests de sécurité : vérification des droits d’accès, soft delete et validation des entrées.



Tests de succès et erreurs : ex. UploadFile\_Success, UploadFile\_UserNotFound.



Outils : xUnit, Microsoft.EntityFrameworkCore.InMemory, ITestOutputHelper.



⚡ Exécution des tests

Frontend

\# Lancer tous les tests

npm run test



\# Lancer tous les tests et afficher la couverture

npm run test -- --coverage





La couverture est générée dans coverage/lcov-report/index.html



Les métriques principales :



Stmts / Branch / Funcs / Lines



Exemple actuel : All files: 27.68% Stmts, 28.03% Branch, 20.86% Funcs, 28.15% Lines



Backend

\# Avec dotnet

dotnet test





Les tests utilisent une base InMemory pour chaque scénario



Les logs détaillés apparaissent via ITestOutputHelper



Les assertions couvrent les scénarios succès / erreur / sécurité / performances



📊 Couverture des tests

Test Coverage Backend :



| Type de couverture | %   |

| ------------------ | --- |

| Line               | 43% |

| Branch             | 62% |

| Method             | 82% |







Test Coverage Frontend :



| Catégorie / Dossier       | Couverture Statements (%) | Branch (%) | Functions (%) | Lines (%) | Commentaires rapides                                                        |
| ------------------------- | ------------------------- | ---------- | ------------- | --------- | --------------------------------------------------------------------------- |
| **Global (All files)**    | 62.66                     | 48.88      | 39.56         | 64.27     | Couverture globale moyenne, reste à augmenter surtout branches et fonctions |
| **src/**                  | 4.54                      | 0          | 20            | 4.54      | Fichiers racines peu testés (index, reportWebVitals)                        |
| **Composants**            | 83.33                     | 50         | 100           | 83.33     | ProfilerWrapper bien testé, mais branches à compléter                       |
| **Footer**                | 100                       | 100        | 100           | 100       | Complet                                                                     |
| **Header**                | 47.05                     | 28.57      | 14.28         | 47.05     | Beaucoup de code non testé, branches et fonctions à compléter               |
| **Upload**                | 34.69                     | 16.17      | 4.16          | 36.49     | Faible couverture, tester tous les cas de fichier uploadé                   |
| **Config / Themes**       | 50                        | 0          | 0             | 50        | Thèmes partiellement testés                                                 |
| **Helpers**               | 0                         | 0          | 0             | 0         | AuthContext non testé du tout                                               |
| **Pages / Accueil**       | 70.58                     | 59.37      | 36.36         | 72.91     | Couverture correcte, mais certaines lignes non couvertes                    |
| **Pages / Connexion**     | 75.38                     | 76.47      | 53.84         | 75.38     | Bon niveau de tests, peut encore améliorer fonctions et branches            |
| **Pages / Default**       | 100                       | 100        | 100           | 100       | Complet                                                                     |
| **Pages / DownloadFiles** | 97.53                     | 78.04      | 87.5          | 98.75     | Très bon niveau, presque complet                                            |
| **Pages / Inscription**   | 79.77                     | 67.56      | 65            | 80.68     | Bon, mais certaines lignes restent à tester                                 |
| **Pages / UsersFiles**    | 65.69                     | 48.42      | 40            | 67.5      | Couverture moyenne, branches et fonctions à compléter                       |


Nommer les tests clairement (UploadFile\_Success, DeleteFile\_NotOwner\_ReturnsForbid)



Isoler le contexte : chaque test crée un contexte de DB ou un composant indépendant



Mocker les dépendances externes : fetch, localStorage, IFormFile, IWebHostEnvironment



Mesurer les performances critiques : re-rendus React via ProfilerWrapper, durée < 150ms



Vérifier la sécurité fonctionnelle : validations d’entrées, droits d’accès, mot de passe haché



📅 Dernière mise à jour



Janvier 2026 — couverture tests frontend et backend mise à jour, tests perf ajoutés

