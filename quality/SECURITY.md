# 🔐 SECURITY.md — État actuel de la sécurité (DataShare)

Ce document décrit **uniquement les mécanismes de sécurité actuellement en place** dans l’application **DataShare**, sans proposer de correctifs ou d’améliorations.

Stack technique :

- Frontend : **React + TypeScript**
- Backend : **C# ASP.NET Core (.NET)**
- Base de données : **PostgreSQL (Entity Framework Core)**

---

## 🧱 Architecture générale

```
[ Navigateur ]
      ↓ HTTPS
[ React + TypeScript ]
      ↓ CORS (origine contrôlée)
[ ASP.NET Core API ]
      ↓ ORM sécurisé
[ PostgreSQL ]
```

---

## ✅ Sécurité côté frontend

### React

- React échappe automatiquement les données affichées dans le DOM
- Aucune utilisation de `dangerouslySetInnerHTML`
- Aucun rendu direct de HTML fourni par le backend

➡️ Le **XSS réfléchi côté frontend est bloqué par défaut**.

### TypeScript

- Typage strict des données échangées avec l’API
- Réduction des erreurs de logique (types incorrects, valeurs nulles)

## ✅ Sécurité côté backend (ASP.NET Core)

### Validation des entrées

Les données reçues sont contrôlées avant traitement :

- Email validé par expression régulière
- Mot de passe validé par expression régulière (complexité)
- Login validé par expression régulière
- Vérification d’unicité (email, login)

➡️ Réduction des entrées malformées ou anormales.

### Accès base de données

- Utilisation exclusive d’**Entity Framework Core**
- Aucune requête SQL brute

➡️ Protection native contre les injections SQL.

---

### Gestion des mots de passe

- Mot de passe **haché avant stockage** via un service dédié
- Aucun mot de passe en clair stocké ou retourné

---

## ✅ Authentification & session

### JWT

- Token JWT généré côté backend

### Cookie de session

Le JWT est stocké dans un cookie avec les attributs suivants :

- `HttpOnly = true`
- `Secure = true`
- `SameSite = Strict`

➡️ Protection contre :

- Accès JavaScript au token
- Vol de session via XSS
- Attaques CSRF classiques

---

## ✅ CORS (Cross-Origin Resource Sharing)

Configuration actuelle :

- Une seule origine autorisée : `http://localhost:3000`
- Méthodes HTTP autorisées : toutes
- Headers autorisés : tous
- Cookies autorisés (`AllowCredentials`)

➡️ Les appels API sont limités au frontend déclaré.

---

## ✅ HTTPS / SSL

### En environnement de développement

- HTTPS activé via `UseHttpsRedirection()`
- Certificat de développement fourni par .NET (`dotnet dev-certs`)

### Environnement de production

- ASP.NET Core **n’inclut pas** la gestion des certificats SSL
- Le framework suppose que le HTTPS est géré par l’infrastructure (serveur ou hébergeur)

---

## ✅ Exposition des endpoints

- API exposée uniquement via des contrôleurs ASP.NET Core
- Routes explicitement définies
- Aucune exécution de code dynamique côté serveur

---

## 🧠 Résumé de la posture de sécurité actuelle

✔️ Frontend React sûr par défaut contre le XSS réfléchi
✔️ Backend structuré avec validation des entrées
✔️ ORM protégeant contre les injections SQL
✔️ Authentification par JWT stocké de manière sécurisée
✔️ CORS configuré avec une origine explicite
✔️ HTTPS actif en développement

---

📅 Dernière mise à jour : 2026
✍️ Projet : DataShare
