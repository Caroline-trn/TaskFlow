# Reproduire la base de donnees TaskFlow

Le fichier `schema.sql` contient le schema PostgreSQL actuel, sans donnees utilisateurs ni mots de passe.

## Methode recommandee : migrations TypeORM

Depuis le dossier `taskflow-backend`, copier `.env.example` vers `.env`, renseigner les parametres PostgreSQL, puis executer :

```powershell
npm install
npm run migration:run
```

Cette methode applique les migrations versionnees du projet et facilite les futures evolutions du schema.

## Methode SQL directe

Creer une base PostgreSQL vide, puis executer depuis la racine du projet :

```powershell
psql -U postgres -d taskflow -f database/schema.sql
```

Adapter `postgres`, `taskflow` et l'hote selon votre installation. Ensuite, demarrer le backend avec :

```powershell
npm --prefix taskflow-backend run start:dev
```

## Important

- Le dump ne contient aucune donnee reelle.
- Ne jamais ajouter `.env` au depot : il contient les mots de passe PostgreSQL, SMTP et le secret JWT.
- Pour les donnees de demonstration, creer un compte depuis l'interface TaskFlow.
