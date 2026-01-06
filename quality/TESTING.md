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



| Type / Répertoire      | % Stmts | % Branch | % Funcs | % Lines | Commentaire rapide                       |

| ---------------------- | ------- | -------- | ------- | ------- | ---------------------------------------- |

| \*\*Global (All files)\*\* | 27.68   | 28.03    | 20.86   | 28.15   | Couverture globale faible                |

| \*\*Root / src\*\*         | 4.54    | 0        | 20      | 4.54    | Majorité du code non testé               |

| \*\*Components\*\*         | 83.33   | 50       | 100     | 83.33   | Bien testé, composants critiques         |

| - Footer               | 100     | 100      | 100     | 100     | Couverture complète                      |

| - Header               | 53.84   | 50       | 14.28   | 58.33   | Partiellement couvert                    |

| - Upload               | 0       | 0        | 0       | 0       | Non testé                                |

| \*\*Config / Themes\*\*    | 50      | 0        | 0       | 50      | Partiellement testé                      |

| \*\*Helpers\*\*            | 0       | 0        | 0       | 0       | Non testé (`AuthContext`)                |

| \*\*Pages\*\*              |         |          |         |         |                                          |

| - Accueil              | 0       | 0        | 0       | 0       | Non testé                                |

| - Connexion            | 80      | 79.41    | 61.53   | 80      | Bien couvert, tests perf inclus          |

| - Default              | 0       | 100      | 0       | 0       | Partiellement testé                      |

| - DownloadFiles        | 0       | 0        | 0       | 0       | Non testé                                |

| - Inscription          | 0       | 0        | 0       | 0       | Non testé                                |

| - UsersFiles           | 65.69   | 48.42    | 40      | 67.5    | Tests présents mais coverage perfectible |

💡 La couverture frontend est encore faible sur certaines pages (Accueil, DownloadFiles, Inscription) et helpers (AuthContext).



✅ Bonnes pratiques de tests



Nommer les tests clairement (UploadFile\_Success, DeleteFile\_NotOwner\_ReturnsForbid)



Isoler le contexte : chaque test crée un contexte de DB ou un composant indépendant



Mocker les dépendances externes : fetch, localStorage, IFormFile, IWebHostEnvironment



Mesurer les performances critiques : re-rendus React via ProfilerWrapper, durée < 150ms



Vérifier la sécurité fonctionnelle : validations d’entrées, droits d’accès, mot de passe haché



📅 Dernière mise à jour



Janvier 2026 — couverture tests frontend et backend mise à jour, tests perf ajoutés

