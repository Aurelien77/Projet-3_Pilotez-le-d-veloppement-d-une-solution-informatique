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



-------------------------|---------|----------|---------|---------|--------------------------------------------------------------------------------------------
File                     | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------------|---------|----------|---------|---------|--------------------------------------------------------------------------------------------
All files                |   78.91 |    63.93 |   60.74 |    80.5 |                                                                                            
 src                     |     100 |      100 |     100 |     100 |                                                                                            
  App.tsx                |     100 |      100 |     100 |     100 |                                                                                            
  index.tsx              |     100 |      100 |     100 |     100 |                                                                                            
 src/Components          |   83.33 |     62.5 |     100 |   83.33 |                                                                                           
  ProfilerWrapper.tsx    |   83.33 |     62.5 |     100 |   83.33 | 46,50                                                                                     
 src/Components/Footer   |     100 |      100 |     100 |     100 |                                                                                           
  Index.tsx              |     100 |      100 |     100 |     100 |                                                                                           
 src/Components/Header   |     100 |      100 |     100 |     100 |                                                                                           
  Index.tsx              |     100 |      100 |     100 |     100 |                                                                                           
 src/Components/Upload   |   74.82 |    69.11 |   41.66 |    78.1 |                                                                                           
  index.tsx              |   74.82 |    69.11 |   41.66 |    78.1 | 67-69,83-84,91-92,115-120,153-161,165-166,445-474,520                                     
 src/Config/Themes       |     100 |      100 |     100 |     100 |                                                                                           
  Index.tsx              |     100 |      100 |     100 |     100 |                                                                                           
 src/Helpers             |     100 |      100 |     100 |     100 |                                                                                           
  AuthContext.tsx        |     100 |      100 |     100 |     100 |                                                                                           
 src/Pages/Accueil       |   88.23 |    81.25 |    90.9 |    87.5 |                                                                                           
  Index.tsx              |   88.23 |    81.25 |    90.9 |    87.5 | 82-83,90-94                                                                               
 src/Pages/Connexion     |   75.38 |    76.47 |   53.84 |   75.38 |                                                                                           
  Index.tsx              |   75.38 |    76.47 |   53.84 |   75.38 | 85-87,92,298-334                                                                          
 src/Pages/Default       |     100 |      100 |     100 |     100 |                                                                                           
  Index.tsx              |     100 |      100 |     100 |     100 |                                                                                           
 src/Pages/DownloadFiles |   97.53 |    78.04 |    87.5 |   98.75 |                                                                                           
  Index.tsx              |   97.53 |    78.04 |    87.5 |   98.75 | 351                                                                                       
 src/Pages/Inscription   |   79.77 |    67.56 |      65 |   80.68 |                                                                                           
  Index.tsx              |   79.77 |    67.56 |      65 |   80.68 | 71-72,100-105,115-116,121,125,451-456,471-512                                             
 src/Pages/UsersFiles    |   65.69 |    48.42 |      40 |    67.5 |                                                                                           
  Index.tsx              |   65.69 |    48.42 |      40 |    67.5 | 67-69,90,96-98,109,126,132,144,148,155-171,176-182,186,197-204,222-236,632-685,691,711-764
-------------------------|---------|----------|---------|---------|--------------------------------------------------------------------------------------------



Nommer les tests clairement (UploadFile\_Success, DeleteFile\_NotOwner\_ReturnsForbid)



Isoler le contexte : chaque test crée un contexte de DB ou un composant indépendant



Mocker les dépendances externes : fetch, localStorage, IFormFile, IWebHostEnvironment



Mesurer les performances critiques : re-rendus React via ProfilerWrapper, durée < 150ms



Vérifier la sécurité fonctionnelle : validations d’entrées, droits d’accès, mot de passe haché



📅 Dernière mise à jour



Janvier 2026 — couverture tests frontend et backend mise à jour, tests perf ajoutés

