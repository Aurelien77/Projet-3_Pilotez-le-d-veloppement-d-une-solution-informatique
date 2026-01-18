🔐 SECURITY.md — État actuel de la sécurité (DataShare)

Ce document décrit uniquement les mécanismes de sécurité actuellement en place dans l’application DataShare, sans proposer de correctifs ou d’améliorations.

Stack technique :

Frontend : React + TypeScript

Backend : C# ASP.NET Core (.NET)

Base de données : PostgreSQL (Entity Framework Core)

🧱 Architecture générale
[ Navigateur ]
↓ HTTPS
[ React + TypeScript ]
↓ CORS (origine contrôlée)
[ ASP.NET Core API ]
↓ ORM sécurisé
[ PostgreSQL ]

Tests : Jest (frontend), xUnit (backend)

✅ Sécurité côté frontend
React

React échappe automatiquement les données affichées dans le DOM.

Aucune utilisation de dangerouslySetInnerHTML.

Aucun rendu direct de HTML fourni par le backend.

➡️ Le XSS réfléchi côté frontend est bloqué par défaut.

TypeScript

Typage strict des données échangées avec l’API.

Réduction des erreurs de logique (types incorrects, valeurs nulles).

✅ Sécurité côté backend (ASP.NET Core)
🔹 Validation des entrées

Emails, logins et mots de passe validés par expressions régulières.

Vérification de l’unicité des emails et logins.

Contrôle des dates pour les fichiers (upload et expiration).

➡️ Réduction des entrées malformées ou anormales et prévention d’erreurs logiques.

🔹 Accès à la base de données

Utilisation exclusive d’Entity Framework Core.

Aucune requête SQL brute.

➡️ Protection native contre les injections SQL.

🔹 Upload et gestion des fichiers

Les fichiers sont uploadés uniquement via des DTO contrôlés (UploadFileDto).

Stockage dans des chemins contrôlés (ContentRootPath / dossier temporaire), évitant l’accès arbitraire aux fichiers système.

Les mots de passe de fichiers sont hachés avant stockage.

Les liens de téléchargement sont basés sur des identifiants sécurisés (FileId) et non sur les noms originaux.

Validation des dates d’expiration pour chaque fichier.

Vérification que seul le propriétaire peut supprimer un fichier.

🔹 Gestion des mots de passe et utilisateurs

Mots de passe utilisateur hachés avant stockage.

Les mots de passe et autres données sensibles ne sont jamais retournés par l’API.

Vérification d’unicité des emails et logins pour éviter la création de comptes en double.

🔹 Authentification & session

Utilisation de JWT pour l’authentification.

JWT stocké dans un cookie avec les attributs :

HttpOnly = true

Secure = true

SameSite = Strict

➡️ Protection contre :

Vol de session via XSS

Accès JavaScript aux tokens

Attaques CSRF classiques

🔹 CORS (Cross-Origin Resource Sharing)

Une seule origine autorisée : http://localhost:3000.

Méthodes HTTP autorisées : toutes.

Headers autorisés : tous.

Cookies autorisés (AllowCredentials).

➡️ Les appels API sont limités au frontend déclaré.

🔹 HTTPS / SSL

En développement : HTTPS activé via UseHttpsRedirection(), certificat fourni par .NET dev-certs.

En production : HTTPS supposé géré par l’infrastructure (serveur ou hébergeur).

🔹 Exposition des endpoints

Routes API définies explicitement dans les contrôleurs ASP.NET Core.

Aucune exécution de code dynamique côté serveur.

🧪 Tests unitaires de sécurité implicites

UploadFile_UserNotFound_ReturnsBadRequest → empêche l’upload pour des utilisateurs inexistants.

UploadFile_ExpiredDate_ReturnsBadRequest → empêche l’upload avec date passée.

DeleteFile_NotOwner_ReturnsForbid → empêche la suppression par un utilisateur non propriétaire.

UploadFile_WithPassword_Success → garantit le hachage correct des mots de passe fichiers.

GetFileInfo_NotFound_ReturnsNotFound → évite l’accès à des fichiers inexistants.

                 ┌───────────────┐
                 │  Navigateur   │
                 │  (Frontend)   │
                 └───────┬───────┘
                         │ HTTPS + JWT Cookie (HttpOnly, Secure, SameSite=Strict)
                         ▼
                 ┌───────────────┐
                 │  API React    │
                 │  (Validation  │
                 │   côté front) │
                 └───────┬───────┘
                         │ CORS limité
                         ▼
                 ┌────────────────────────┐
                 │ ASP.NET Core API       │
                 │------------------------│
                 │ 1. Validation DTO      │
                 │    - Email regex       │
                 │    - Password regex    │
                 │    - Dates & IDs       │
                 │ 2. Auth JWT            │
                 │ 3. Accès DB via EFCore │
                 │    - Pas de SQL brut   │
                 │ 4. Upload fichiers     │
                 │    - Chemins contrôlés │
                 │    - Password hashé    │
                 │    - Vérif propriétaire│
                 │ 5. Soft delete         │
                 └─────────┬──────────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │ PostgreSQL (DB)    │
                 │ - Données utilisateurs
                 │ - Données fichiers
                 │ - Mots de passe hachés
                 └────────────────────┘

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


🧠 Résumé de la posture de sécurité actuelle

✔️ Frontend React sûr par défaut contre le XSS réfléchi
✔️ Backend structuré avec validation stricte des entrées
✔️ ORM protégeant contre les injections SQL
✔️ Upload de fichiers sécurisé et mots de passe hachés
✔️ Authentification par JWT stocké de manière sécurisée
✔️ Contrôle strict des droits d’accès aux fichiers
✔️ CORS configuré avec une origine explicite
✔️ HTTPS actif en développement

📅 Dernière mise à jour : 2026
✍️ Projet : DataShare
