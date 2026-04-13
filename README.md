# 🖥️ Manuel Technique Ultime — Frontend OSINT Intelligence Dashboard (CIRT Edition)

**Organisation :** Centre de Réponse aux Incidents Informatiques (CIRT) — ANTIC
**Projet :** OSINT Intelligence Platform — Frontend Interface
**Auteur :** Tchuente Kenmegne Joel Parfait
**Fonction :** Développeur Frontend | Analyste OSINT
**Version :** Production-Ready Documentation v1.0

---

# 1. Objectif du Document

Ce document constitue la documentation complète du Frontend du **OSINT Intelligence Dashboard**.

Il décrit :

* l'architecture de l'interface utilisateur
* le fonctionnement des composants principaux
* l'intégration avec le moteur de recherche backend
* la gestion de l'autocomplétion
* les optimisations de performance
* les procédures d'installation
* la maintenance opérationnelle
* les bonnes pratiques de sécurité

Ce manuel est conçu pour garantir la continuité de service et permettre à tout développeur ou analyste technique de comprendre, maintenir et déployer l'interface sans dépendance à l'auteur original.

---

# 2. Présentation du Système

Le Frontend du **OSINT Dashboard** est une application web développée en **React.js** permettant aux analystes de rechercher, analyser et visualiser rapidement des données issues de bases de données massives (leaks, registres, bases externes).

L'interface est optimisée pour :

* l'investigation rapide
* la visualisation de données
* la performance en environnement critique
* la simplicité d'utilisation
* la stabilité opérationnelle

Cette interface fonctionne dans des environnements :

* CIRT
* SOC
* CERT
* Investigation numérique
* Analyse OSINT

---

# 3. Architecture du Frontend

## Diagramme d’Architecture Frontend Détaillé

```text

                        UTILISATEUR / ANALYSTE CIRT
                                   │
                                   │ HTTPS
                                   ▼
                         ┌──────────────────────────┐
                         │       Navigateur Web      │
                         │     (Chrome / Firefox)    │
                         └──────────────────────────┘
                                   │
                                   ▼
                         ┌──────────────────────────┐
                         │        React App          │
                         │   Single Page Application │
                         └──────────────────────────┘
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
             ▼                     ▼                     ▼
   ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
   │    Navbar      │   │   Dashboard    │   │    Login Page   │
   │ Navigation UI  │   │ Global State   │   │ Authentication  │
   └────────────────┘   └────────────────┘   └────────────────┘
             │                     │
             │                     │
             ▼                     ▼
   ┌────────────────┐   ┌──────────────────────────────┐
   │   SearchBar    │   │        Charts Module         │
   │ Autocomplete   │   │ Statistics & Visualization   │
   └────────────────┘   └──────────────────────────────┘
             │
             ▼
   ┌──────────────────────────────┐
   │        DataTable Module      │
   │ Pagination / Sorting / View  │
   └──────────────────────────────┘
             │
             ▼
   ┌──────────────────────────────┐
   │         API Service Layer    │
   │          (Axios Client)      │
   └──────────────────────────────┘
             │
             ▼
   ┌──────────────────────────────┐
   │        REST API Backend      │
   │        Spring Boot           │
   └──────────────────────────────┘
             │
             ▼
   ┌──────────────────────────────┐
   │     Search & Data Layer      │
   │ Elasticsearch / MongoDB /    │
   │ Redis Cache                  │
   └──────────────────────────────┘


Performance Layer:

Debounce (300ms)
Pagination (20 results)
Lazy Rendering

Security Layer:

Authentication Token
Session Management
API Validation

```

Le Frontend est conçu comme une **Single Page Application (SPA)** communiquant avec le backend via des API REST sécurisées.

Architecture logique :

Utilisateur
↓
Navigateur Web
↓
React Frontend
↓
API REST Backend
↓
Elasticsearch / MongoDB / Redis

---

## Composants principaux

### Dashboard.js

Responsabilités :

* gestion de l'état global
* coordination des composants
* affichage des statistiques
* gestion de la pagination
* déclenchement des recherches

---

### SearchBar.js

Responsabilités :

* saisie des recherches
* autocomplétion en temps réel
* gestion des suggestions
* validation des requêtes utilisateur

---

### DataTable.js

Responsabilités :

* affichage des résultats
* pagination
* tri des données
* performance sur grands volumes

---

### Charts.js

Responsabilités :

* visualisation des statistiques
* graphiques interactifs
* analyse des données

---

### Navbar.js

Responsabilités :

* navigation utilisateur
* gestion des sessions
* accès aux fonctionnalités

---

# 4. Fonctionnalités Principales

## Recherche de données

Le système permet :

* recherche par nom
* recherche par email
* recherche par téléphone
* recherche par adresse
* recherche multi-critères

---

## Autocomplétion intelligente

Le système utilise une fonctionnalité d'autocomplétion basée sur le moteur de recherche backend.

Fonctionnement :

1. L'utilisateur saisit un texte
2. Le frontend attend 300 ms
3. Une requête est envoyée au backend
4. Les suggestions sont affichées

---

## Paramètres d'autocomplétion

Debounce :

300 ms

Seuil de déclenchement :

2 caractères minimum

API utilisée :

GET /search/suggest

---

## Flux de données

Saisie utilisateur :

ffr

Requête envoyée :

GET /search/suggest?value=ffr

Réponse :

[
"[ffrancis@example.com](mailto:ffrancis@example.com)",
"[ffrancis@example.net](mailto:ffrancis@example.net)"
]

Résultat :

Affichage d'une liste de suggestions.

---

## Visualisation des données

L'interface fournit :

* graphiques interactifs
* statistiques en temps réel
* répartition par pays
* analyse par type de données

---

## Export des résultats

Formats supportés :

* JSON
* CSV
* PDF

Utilisation :

* rapports d'incident
* investigations
* archivage

---

## Mode sombre

Support :

* Dark Mode
* Light Mode

Objectif :

* confort visuel
* utilisation prolongée

---

## Statistiques en temps réel

Affichage :

* nombre total de résultats
* temps de réponse
* état du système
* performance du cache

---

# 5. Gestion des États UI

Le système gère les états suivants :

Loading

Affichage :

Loading spinner

---

Error

Affichage :

Message d'erreur utilisateur

---

Empty

Affichage :

Aucun résultat trouvé

---

Timeout

Action :

Nouvelle tentative automatique

---

# 6. Optimisations de Performance

Les optimisations suivantes ont été implémentées :

* debounce des requêtes
* pagination des résultats
* limitation du nombre de requêtes
* affichage conditionnel
* mise à jour dynamique des composants

---

Pagination :

Taille par défaut :

20 résultats par page

---

# 7. Sécurité

Mesures implémentées :

* authentification utilisateur
* gestion de session
* validation des entrées
* protection contre les erreurs API

---

## Modèle d'authentification

Processus :

1. L'utilisateur se connecte
2. Le serveur retourne un token
3. Le token est stocké côté client
4. Le token est envoyé dans les requêtes

---

# 8. Technologies Utilisées

## Frontend

* React.js 18
* JavaScript ES6+
* HTML5
* CSS3

---

## Bibliothèques

* Axios
* Chart.js
* Lucide React
* React Hooks

---

# 9. Installation

## Étape 1 — Installation des dépendances

npm install

---

## Étape 2 — Configuration de l'API

Créer un fichier :

.env

---

Configuration :

REACT_APP_API_URL=[http://localhost:8080](http://localhost:8080)

---

## Étape 3 — Lancement du serveur

npm start

---

Application accessible :

[http://localhost:3000](http://localhost:3000)

---

# 10. Build Production

Commande :

npm run build

---

Résultat :

Création du dossier :

build/

---

Déploiement :

Serveur Web

---

# 11. Maintenance

## Vérification de fonctionnement

Ouvrir :

[http://localhost:3000](http://localhost:3000)

---

Tester :

Login utilisateur

Recherche de données

Affichage des résultats

---

## Logs Frontend

Les logs sont disponibles dans la console navigateur.

Préfixe :

[FRONTEND]

---

# 12. Dépannage

## Le frontend ne démarre pas

Exécuter :

npm install

npm start

---

## Erreur de connexion API

Vérifier :

* backend actif
* port 8080 disponible
* URL API correcte

---

## Port déjà utilisé

Linux :

lsof -i :3000

kill -9 PID

---

# 13. Bonnes Pratiques

Recommandations :

* tester les performances après modification
* vérifier les requêtes réseau
* surveiller les temps de réponse
* maintenir la stabilité UI

---

# 14. Roadmap

Fonctionnalités futures :

* filtres dynamiques
* recherche floue
* pagination avancée
* interface responsive
* tableau de bord analytique avancé
* optimisation performance
* mode hors ligne
* audit des actions utilisateur

---

# 15. Conclusion

Le Frontend du OSINT Dashboard constitue une interface robuste conçue pour des environnements opérationnels critiques.

Il permet :

* une recherche rapide
* une visualisation claire des données
* une interaction fluide avec le backend
* une expérience utilisateur optimisée
* une exploitation fiable du système

Le système est prêt pour une utilisation en environnement CIRT / SOC.

---

# Maintenu par

Tchuente Kenmegne Joel Parfait

Développeur Frontend

Analyste OSINT

CIRT — ANTIC
