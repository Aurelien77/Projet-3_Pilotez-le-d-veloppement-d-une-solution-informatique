⚡ PERF.md — Performance DataShare

Ce document résume les tests de performance réalisés sur l’application DataShare, côté frontend et backend, avec les métriques observées et recommandations.

🟢 Stack technique

Frontend : React + TypeScript

Backend : ASP.NET Core (.NET)

Base de données : PostgreSQL (Entity Framework Core)

Tests : Jest (frontend), xUnit (backend), Profiler React

📈 Frontend — Tests de performance
1️⃣ Saisie des champs du formulaire de connexion
Champ Nombre de re-rendus Durée totale (ms) Observations
Email 1 1.73 Excellent, saisie rapide
Mot de passe 1 1.84 Excellent, saisie rapide

Commentaire :
Les composants de saisie utilisent React de façon optimale. Les mises à jour sont minimales et évitent les re-rendus inutiles.

2️⃣ Soumission du formulaire de connexion
Action Nombre de re-rendus Durée totale (ms) Observations
Soumission login 0 0 Très rapide
Affichage erreur 1 1.95 Rapidité acceptable

Commentaire :
L’affichage des erreurs côté frontend est rapide (< 2 ms), respectant l’objectif de performance.

3️⃣ Nested updates & Render total
Mesure Valeur
Nested updates 0
Total montées (mount) 1
Total mises à jour 2
Total rendus 3
Durée totale (ms) 4.69
Durée moyenne par rendu 1.17

Commentaire :
Aucun nested update détecté. La performance globale du formulaire est très bonne.

⚡ Backend — Tests de performance

Les tests backend utilisent xUnit et se concentrent sur les opérations CRUD des fichiers et les uploads.

1️⃣ Upload de fichiers
Test Observations
UploadFile_Success ✅ Fichier uploadé correctement, lien /download/ généré, mot de passe hashé si fourni
UploadFile_WithPassword_Success ✅ Hash du mot de passe vérifié, fichier sécurisé
UploadFile_UserNotFound ❌ Utilisateur inexistant rejeté correctement
UploadFile_ExpiredDate ❌ Date expirée rejetée correctement

Commentaire :
Le backend valide les entrées et génère des liens sécurisés. Les opérations sont rapides grâce à EF Core.

2️⃣ Récupération des fichiers
Test Observations
GetFileInfo_Success ✅ Fichier trouvé et info renvoyée
GetFileInfo_NotFound ❌ Fichier inexistant renvoie NotFound
GetUserFiles_Success ✅ Récupération de plusieurs fichiers efficace
3️⃣ Suppression de fichiers
Test Observations
DeleteFile_Success ✅ Soft delete correctement appliqué
DeleteFile_NotOwner ❌ Non propriétaire interdit de supprimer le fichier

Commentaire :
Les vérifications de droits et soft delete sont correctes. La performance de suppression est satisfaisante.

4️⃣ Notes générales backend

Tous les tests unitaires passent rapidement (< 20 ms pour la plupart des opérations en mémoire).

EF Core protège contre les injections SQL, aucune requête brute.

Les opérations critiques comme hash du mot de passe et validation d’entrée sont instantanées.

🔹 Recommandations générales

Frontend

Continuer à profiler avec React Profiler pour identifier tout futur nested update.

Optimiser les composants lourds si de nouveaux champs sont ajoutés.

Backend

Les tests en mémoire sont rapides, mais vérifier les performances avec une vraie base PostgreSQL en staging.

Contrôler la taille des fichiers uploadés pour éviter des ralentissements.

Monitorer le temps de génération des liens /download/ si l’API évolue.

📅 Dernière mise à jour

Date : 2026

Projet : DataShare
