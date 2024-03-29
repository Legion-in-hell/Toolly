# Toolly - Your Personal Toolbox

![Badge](https://img.shields.io/badge/version-0.1.0-blue.svg) ![Badge](https://img.shields.io/badge/status-in%20development-orange.svg) ![Badge](https://img.shields.io/badge/license-MIT-green.svg) ![MySQL](https://img.shields.io/badge/MySQL-Database-blue)

## Table of Contents

- [English](#english)
  - [Features](#features)
  - [Quick Start](#quick-start)
  - [Technologies Used](#technologies-used)
  - [Contribution](#contribution)
  - [License](#license)
  - [Contact](#contact)
- [Français](#français)
  - [Fonctionnalités](#fonctionnalités)
  - [Démarrage Rapide](#démarrage-rapide)
  - [Technologies Utilisées](#technologies-utilisées)
  - [Contribution](#contribution-1)
  - [Licence](#licence)
  - [Contact](#contact-1)

---

## English

Toolly is an interactive web application designed to simplify your daily task management. With its intuitive user interface, Toolly combines several essential tools including a drawing space, a todo-list system, and a sticky note feature, all integrated into an elegant and user-friendly dashboard.

### Features

- **Drawing Space**: An intuitive tool for sketching out your ideas.
- **Todo-List**: Manage your tasks with an interactive list.
- **Sticky Notes**: Jot down your important thoughts and ideas in a click.
- **Customizable Interface**: Customize the interface according to your preferences.

### Quick Start

To get Toolly running locally, follow these steps:

Fork or git clone :

```bash
git clone https://github.com/Legion-in-hell/Toolly.git
```

Create databse :

```sql
CREATE TABLE `users` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`username` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_general_ci',
	`password` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_general_ci',
	`email` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=8
;
```

```sql
CREATE TABLE `folders` (
	`name` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_general_ci',
	`user_id` INT(11) NOT NULL DEFAULT '0',
	`created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
	`id` INT(11) NOT NULL,
	INDEX `user_id` (`user_id`) USING BTREE,
	CONSTRAINT `fk_folders_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
	CONSTRAINT `folders_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
	CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
;
```

Create .env file :

```
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_DATABASE=
JWT_SECRET=
```

```bash
npm install
node server.js
npm start
```

Your application should now be running on localhost:3001.

## Technologies Used

- React.js
- Material-UI
- React Router
- Axios
- Mysql2

## Contribution

Contributions are always welcome! To contribute to the project, please follow these steps:

- Fork the project
- Create your feature branch (git checkout -b feature/AmazingFeature)
- Commit your changes (git commit -m 'Add some AmazingFeature')
- Push to the branch (git push origin feature/AmazingFeature)
- Open a Pull Request

## License

Distributed under the MIT License. See LICENSE for more information.

## Français

# Toolly - Votre Boîte à Outils Personnelle

Toolly est une application web interactive conçue pour faciliter la gestion de vos tâches quotidiennes. Avec son interface utilisateur intuitive, Toolly combine plusieurs outils essentiels, dont un espace de dessin, un système de todo-list et un pense-bête, le tout intégré dans un tableau de bord élégant et facile à utiliser.

## Fonctionnalités

- **Espace de Dessin** : Un outil intuitif pour esquisser vos idées.
- **Todo-List** : Gérez vos tâches avec une liste interactive.
- **Pense-Bête** : Notez vos pensées et idées importantes en un clic.
- **Interface Personnalisable** : Personnalisez l'interface selon vos préférences.

## Démarrage Rapide

Pour lancer Toolly localement, suivez ces étapes :

Fork ou git clone le repo :

```bash
git clone https://github.com/Legion-in-hell/Toolly.git
```

Crée la base de données :

```sql
CREATE TABLE `users` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`username` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_general_ci',
	`password` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_general_ci',
	`email` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=8
;
```

```sql
CREATE TABLE `folders` (
	`name` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_general_ci',
	`user_id` INT(11) NOT NULL DEFAULT '0',
	`created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
	`id` INT(11) NOT NULL,
	INDEX `user_id` (`user_id`) USING BTREE,
	CONSTRAINT `fk_folders_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
	CONSTRAINT `folders_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
	CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
;
```

Crée le fichier .env :

```
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_DATABASE=
JWT_SECRET=
```

```bash
npm install
node server.js
npm start
```

Votre application devrait maintenant être en cours d'exécution sur localhost:3001.

## Technologies Utilisées

- React.js
- Material-UI
- React Router
- Axios
- Mysql2

## Contribution

Les contributions sont toujours les bienvenues! Pour contribuer au projet, veuillez suivre ces étapes :

- Forker le projet
- Créer votre branche de fonctionnalité (git checkout -b feature/AmazingFeature)
- Committer vos changements (git commit -m 'Add some AmazingFeature')
- Push vers la branche (git push origin feature/AmazingFeature)
- Ouvrir une Pull Request

## Licence

Distribué sous la licence MIT. Voir LICENSE pour plus d'informations.
