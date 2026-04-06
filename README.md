# 🛡️ OSINT Intelligence Dashboard — Frontend (React)

**Auteur :** Tchuente Kenmegne Joel Parfait
**Organisation :** CIRT / ANTIC
**Projet :** Plateforme d’analyse OSINT des fuites de données
**Type :** Interface utilisateur (Frontend)
**Statut :** En développement actif

---

# 📌 Description

Ce projet constitue l’interface utilisateur (UI) de la plateforme **OSINT Intelligence Dashboard**, développée pour permettre aux analystes du **CIRT (Centre de Réponse aux Incidents Informatiques)** d’effectuer des recherches rapides et efficaces dans des bases de données de fuites de données.

L’interface a été conçue pour offrir :

* une expérience utilisateur fluide
* une recherche rapide et intuitive
* une visualisation claire des données
* une interaction sécurisée avec l’API backend

Ce README couvre uniquement le **frontend** de la plateforme.
La documentation du backend sera fournie séparément.

---

# 🚀 Fonctionnalités principales

## 🔎 Recherche de données

Le système permet :

* Recherche par nom
* Recherche par email
* Recherche par téléphone
* Recherche par adresse
* Recherche multi-critères

Exemple :

```text
Nom : John Doe
Téléphone : +237XXXXXXXXX
Email : john@example.com
```

---

## ⚡ Indicateurs de cache

Le système affiche :

* si les données proviennent de MongoDB
* ou du cache Redis

Objectif :

* améliorer la performance
* informer l’analyste sur la source des données

---

## 📊 Visualisation des données

L’interface fournit :

* graphiques interactifs
* statistiques en temps réel
* répartition des fuites par pays
* analyse par type de données

---

## 📤 Export des résultats

Les résultats peuvent être exportés en :

* JSON
* CSV
* PDF

Utilisation :

* rapports d’incident
* investigations
* archivage

---

## 🔐 Authentification utilisateur

Le système inclut :

* connexion sécurisée
* gestion de session
* changement de mot de passe
* déconnexion

---

## 🌙 Mode sombre

Support :

* Dark Mode
* Light Mode

---

## 📈 Statistiques en temps réel

Affichage :

* nombre total de résultats
* temps de réponse
* état du système
* performance du cache

---

# 🛠️ Technologies utilisées

## Frontend

* React.js 18
* JavaScript (ES6+)
* HTML5
* CSS3

## Bibliothèques

* Axios — communication avec l’API REST
* Chart.js — visualisation des données
* Lucide React — icônes modernes
* React Hooks — gestion d’état

---

# 📋 Prérequis

Avant d’installer le frontend, assurez-vous d’avoir :

Node.js :

```bash
node -v
```

Version recommandée :

```text
Node.js 16 ou supérieur
npm 8 ou supérieur
```

---

# 📦 Installation

## 1. Cloner le projet

```bash
git clone https://github.com/Kenlab-c/osint-dashboard.git
```

---

## 2. Naviguer dans le dossier frontend

```bash
cd frontend
```

---

## 3. Installer les dépendances

```bash
npm install
```

---

## 4. Lancer le serveur de développement

```bash
npm start
```

Le frontend sera accessible sur :

```text
http://localhost:3000
```

---

# 🔗 Configuration de l’API

Le frontend communique avec le backend via une API REST.

Port par défaut :

```text
http://localhost:8080
```

Configuration typique :

```javascript
const API_BASE_URL = "http://localhost:8080";
```

---

# 📁 Structure du projet

```text
frontend/
│
├── public/
│
├── src/
│   │
│   ├── components/
│   │   ├── SearchForm.js
│   │   ├── ResultsTable.js
│   │   ├── Dashboard.js
│   │   ├── Charts.js
│   │   └── Navbar.js
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Search.js
│   │   └── Dashboard.js
│   │
│   ├── styles/
│   │
│   ├── App.js
│   └── index.js
│
└── package.json
```

---

# 🧪 Tests de fonctionnement

## Vérifier que le frontend fonctionne

Ouvrir :

```text
http://localhost:3000
```

---

## Vérifier la connexion avec le backend

Test :

```text
Login utilisateur
Effectuer une recherche
Afficher les résultats
```

---

# 🔑 Identifiants par défaut

```text
Username : admin
Password : admin123
```

⚠️ Important :

Changer le mot de passe après la première connexion.

---

# 🐛 Dépannage (Troubleshooting)

## Le frontend ne démarre pas

Exécuter :

```bash
npm install
npm start
```

---

## Erreur de connexion à l’API

Vérifier :

* que le backend est lancé
* que le port 8080 est actif
* que l’URL de l’API est correcte

---

## Port 3000 déjà utilisé

Linux :

```bash
lsof -i :3000
kill -9 <PID>
```

Windows :

```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

# 🔐 Variables d’environnement (optionnel)

Créer un fichier :

```text
.env
```

Exemple :

```env
REACT_APP_API_URL=http://localhost:8080
```

---

# 📊 Fonctionnalités prévues (Roadmap)

Les améliorations futures incluent :

* Autocomplétion des recherches
* Recherche floue (Fuzzy Search)
* Filtres dynamiques
* Pagination
* Interface responsive avancée
* Mode hors ligne
* Tableau de bord avancé
* Intégration Elasticsearch

---

# 🤝 Contribution

Étapes :

```bash
git checkout -b feature/new-feature
git commit -m "Add new feature"
git push origin feature/new-feature
```

---

# 📄 Licence

Projet développé dans un cadre académique et de recherche en cybersécurité.

---

# 👨‍💻 Auteur

Tchuente Kenmegne Joel Parfait

Développeur Web
Analyste OSINT
CIRT / ANTIC

---

# 🙏 Remerciements

* Centre de Réponse aux Incidents Informatiques (CIRT)
* Agence Nationale des Technologies de l’Information et de la Communication (ANTIC)
