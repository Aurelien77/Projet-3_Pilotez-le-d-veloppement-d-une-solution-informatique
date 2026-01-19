DataShare - Application de Partage de Fichiers
📋 Description
DataShare est une application full-stack de partage de fichiers sécurisée permettant aux utilisateurs de télécharger, gérer et partager des fichiers avec authentification JWT.
🏗️ Architecture
L'application est composée de deux parties principales :

Backend : API REST en ASP.NET Core 8.0 avec Entity Framework Core
Frontend : Application React 18 avec TypeScript et React Router

🔧 Technologies Utilisées
Backend (.NET 8.0)
Frameworks & Bibliothèques

ASP.NET Core 8.0 - Framework web
Entity Framework Core 8.0.11 - ORM pour l'accès aux données
Npgsql.EntityFrameworkCore.PostgreSQL 8.0.11 - Provider PostgreSQL
Swashbuckle.AspNetCore 6.9.0 - Documentation API (Swagger/OpenAPI)

Sécurité & Authentication

Microsoft.AspNetCore.Authentication.JwtBearer 8.0.11 - Authentication JWT
System.IdentityModel.Tokens.Jwt 8.2.1 - Gestion des tokens JWT
Microsoft.IdentityModel.Tokens 8.2.1 - Validation et génération de tokens

Frontend (React 18)
Core

React 18.3.1 - Bibliothèque UI
React DOM 18.3.1 - Rendu React
TypeScript 4.9.5 - Typage statique
React Scripts 5.0.1 - Configuration et scripts de build

Routing & Navigation

React Router DOM 7.11.0 - Gestion du routing
History 5.3.0 - Gestion de l'historique de navigation

UI & Icons

React Icons 5.5.0 - Bibliothèque d'icônes

Testing

@testing-library/react 16.3.1 - Tests de composants React
@testing-library/jest-dom 6.9.1 - Matchers Jest personnalisés
@testing-library/user-event 14.6.1 - Simulation d'interactions utilisateur
MSW 1.2.3 (Mock Service Worker) - Mocking des requêtes API
Identity-obj-proxy 3.0.0 - Mock des imports CSS pour les tests

🚀 Installation et Démarrage
Prérequis

.NET 8.0 SDK
Node.js 16+ et npm
PostgreSQL

Backend

Cloner le repository

bashgit clone [url-du-repo]
cd DataShareBackend

Configurer la base de données dans appsettings.json

json{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=datashare;Username=your_user;Password=your_password"
  }
}

Appliquer les migrations

bashdotnet ef database update

Lancer l'application

bashdotnet run
L'API sera accessible sur https://localhost:5001 (ou le port configuré)
Frontend

Naviguer vers le dossier frontend

bashcd frontend

Installer les dépendances

bashnpm install

Lancer l'application en mode développement

bashnpm start
L'application sera accessible sur http://localhost:3000
📝 Scripts Disponibles
Backend

dotnet run - Démarre l'application
dotnet test - Lance les tests
dotnet ef migrations add [nom] - Crée une nouvelle migration
dotnet ef database update - Applique les migrations

Frontend

npm start - Démarre le serveur de développement
npm test - Lance les tests en mode interactif
npm run test:perf - Lance les tests de performance
npm run coverage - Génère le rapport de couverture de tests
npm run build - Crée un build de production
npm run eject - Éjecte la configuration (irréversible)

🔐 Fonctionnalités

✅ Inscription et connexion des utilisateurs
✅ Authentification JWT
✅ Téléchargement de fichiers
✅ Gestion des fichiers personnels
✅ Téléchargement de fichiers partagés
✅ Interface responsive
✅ Tests unitaires et d'intégration

🧪 Tests
Le projet inclut des tests complets pour assurer la qualité du code :

Tests unitaires des composants React
Tests d'intégration avec MSW pour les appels API
Tests de performance
Couverture de code configurée

📄 License
Ce projet n'est actuellement pas sous licence.
👥 Contributeurs
Aurélien Monceau - Développeur Full Stack

Note : Assurez-vous de configurer correctement les variables d'environnement et les secrets (JWT, connexion DB) avant de déployer en production.
