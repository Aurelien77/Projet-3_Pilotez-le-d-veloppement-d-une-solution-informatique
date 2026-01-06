🛠 MAINTENANCE.md — Guide de maintenance (DataShare)



Ce document décrit les procédures et bonnes pratiques pour maintenir le projet DataShare, tant côté frontend que backend.



📦 Structure du projet

Partie	Dossier principal	Description

Frontend	src/	React + TypeScript, composants, pages, styles

Backend	DataShareBackend/	ASP.NET Core, Controllers, Models, DTO, Services

Tests	src/\_\_tests\_\_ / DataShareBackend.Tests/	Tests unitaires et d’intégration

Config	src/Config	Thèmes, variables globales, paramètres

🔄 Mise à jour des dépendances

Frontend

\# Vérifier les outdated packages

npm outdated



\# Mettre à jour

npm update



\# Ou mettre à jour un package spécifique

npm install <package>@latest



Backend

\# Vérifier les packages NuGet

dotnet list package --outdated



\# Mettre à jour tous les packages

dotnet list package --update





💡 Après chaque mise à jour :



Vérifier que les tests unitaires frontend et backend passent



Vérifier la compilation du proj

🧹 Nettoyage



Supprimer les builds précédents :



\# Frontend

rm -rf node\_modules/ build/ coverage/



\# Backend

dotnet clean





Supprimer les fichiers temporaires / logs si nécessaire



Supprimer les bases InMemory créées pour les tests



🛡 Sécurité et sauvegarde



Mots de passe : jamais en clair dans le code ou la base



Base de données : sauvegardes régulières (PostgreSQL)



HTTPS : vérifier les certificats de développement et de production



Logs : conserver les logs critiques et purger les logs temporaires



🧪 Tests et couverture



Exécuter les tests après chaque modification :



\# Frontend

npm run test -- --coverage



\# Backend

dotnet test





Vérifier les métriques de couverture :



Frontend : Statements / Branches / Functions / Lines



Backend : Tests unitaires et d’intégration sur tous les Controllers et Services



📈 Monitoring et performance



Vérifier les performances critiques (tests perf existants) :



Frontend : affichage des erreurs < 150ms, re-rendus limités



Backend : UploadFile, DeleteFile et GetFileInfo avec InMemoryDb



Surveiller les logs et alertes de production



🧾 Bonnes pratiques de maintenance



Toujours créer un commit clair : correction, ajout de tests, refactoring



Mettre à jour le SECURITY.md si de nouvelles sécurités sont ajoutées



Mettre à jour le PERF.md si de nouvelles métriques de performance sont mesurées



Ne jamais pousser de mot de passe ou clé dans Git



Documenter toute modification importante dans README.md et/ou CHANGELOG.md



📅 Historique et version



Janvier 2026 — Guide de maintenance initial



Prévu : mise à jour après chaque release majeure ou ajout de fonctionnalité critique

