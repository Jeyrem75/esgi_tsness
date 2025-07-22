# Fitness Challenge API

## Description
API pour la gestion de défis d'entraînement physique selon les spécifications du sujet.

## Fonctionnalités Implémentées selon le Sujet

### Côté Super Admin
✅ **Gestion des Salles d'Entraînement**
- Création, modification et suppression de salles d'entraînement
- Approbation des salles de sport faisant une demande
- Définition du nom, capacité d'accueil, équipements disponibles

✅ **Gestion des Types d'Exercices**
- Ajout, modification et suppression des types d'exercices
- Définition avec nom, description et muscles ciblés

✅ **Création de Badges et Récompenses**
- Création de badges avec règles dynamiques
- Attribution aux utilisateurs selon leurs accomplissements

✅ **Gestion des Utilisateurs**
- Désactivation ou suppression des comptes d'utilisateurs
- Suppression des comptes de propriétaires de salle

### Côté Propriétaire de Salle de Sport
✅ **Informations sur la Salle de Sport**
- Informations de base (nom, adresse, contact)
- Description des installations et équipements
- Types d'activités proposées

✅ **Proposition de Défis Spécifiques**
- Création de défis associés à la salle de sport
- Défis basés sur les équipements disponibles
- Augmentation du score de joueur

### Côté Utilisateur Client
✅ **Création et Partage de Défis**
- Création de défis avec objectifs spécifiques
- Exercices recommandés et durée définie
- Partage avec la communauté

✅ **Exploration des Défis**
- Exploration des défis créés par d'autres utilisateurs
- Filtres par difficulté et salle

✅ **Suivi de l'Entraînement**
- Enregistrement des séances d'entraînement
- Suivi calories brûlées et statistiques

✅ **Défis Sociaux**
- Invitation d'amis à rejoindre des défis
- Défis collaboratifs avec autres utilisateurs

✅ **Récompenses et Badges**
- Attribution automatique de badges selon accomplissements
- Classements des utilisateurs les plus actifs

## API Endpoints

### Authentification
- `POST /auth/login` - Connexion
- `POST /auth/subscribe` - Inscription
- `GET /auth/me` - Profil utilisateur

### Gestion Utilisateurs  
- `GET /users/leaderboard` - Classement par score (accomplissements)

### Gestion Utilisateurs (Super Admin)
- `PATCH /users/:id/deactivate` - Désactiver utilisateur
- `DELETE /users/:id` - Supprimer utilisateur
- `DELETE /users/gym-owner/:id` - Supprimer propriétaire

### Gestion Salles
- `GET /gyms` - Liste des salles
- `GET /gyms/leaderboard/gym-owners` - Classement propriétaires par score
- `POST /gyms` - Créer salle (Propriétaire)
- `PATCH /gyms/:id/approve` - Approuver (Super Admin)
- `PATCH /gyms/:id/reject` - Rejeter (Super Admin)

### Types d'Exercices
- `GET /exercise-types` - Liste des exercices
- `POST /exercise-types` - Créer (Super Admin)
- `PUT /exercise-types/:id` - Modifier (Super Admin)
- `DELETE /exercise-types/:id` - Supprimer (Super Admin)

### Défis
- `GET /challenges` - Explorer les défis
- `POST /challenges` - Créer un défi
- `POST /challenges/:id/join` - Rejoindre un défi
- `POST /challenges/:id/invite` - Inviter des amis

### Badges
- `GET /badges` - Liste des badges
- `POST /badges` - Créer badge (Super Admin)
- `GET /badges/my/badges` - Mes badges

### Séances d'Entraînement
- `POST /workout-sessions` - Enregistrer séance
- `GET /workout-sessions/my/stats` - Mes statistiques
- `GET /workout-sessions/leaderboard` - Classement par activité

## Installation

1. **Cloner et installer**
```bash
git clone <repo>
cd esgi_tsness
npm install
```

2. **Configuration**
```bash
cp .env.example .env
# Modifier les variables dans .env
```

3. **Lancer la base de données**
```bash
docker-compose up -d
```

4. **Démarrer l'API**
```bash
npm run build
npm start
```

L'API sera disponible sur `http://localhost:3001`
