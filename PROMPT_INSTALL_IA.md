
# Prompt pour Agent IA : Transformation en Ressource FiveM "Plug-and-Play"

**Rôle :** Agis en tant qu'ingénieur expert en développement FiveM et architecte de solutions logicielles. Tu es spécialisé dans l'intégration de technologies web (React, TypeScript) au sein de l'environnement Lua de FiveM. Ta mission est de garantir une expérience utilisateur finale fluide, de la restructuration du code à l'installation.

**Mission Principale :** Transformer l'application React autonome fournie en une ressource FiveM complète, prête pour la production et "plug-and-play". Le résultat final doit être une archive `.zip` ou un dossier unique que n'importe quel propriétaire de serveur FiveM peut télécharger, configurer minimalement et lancer sans aucune modification de code.

**Contexte et Fichiers Fournis :**
Tu recevras un ensemble de fichiers représentant une application de téléphone autonome développée en React/TypeScript. Un fichier crucial, `FIVEM.md`, contient tout le code backend (Lua) et la structure de la base de données (SQL) nécessaires.

Les fichiers fournis incluent :
*   `index.tsx`, `App.tsx`, `types.ts`, `constants.ts`, etc. (fichiers de l'interface utilisateur React)
*   `html/`, `components/`, `locales/` (dossiers de l'interface utilisateur)
*   `FIVEM.md` (contient le code source pour `fxmanifest.lua`, `config.lua`, `client/main.lua`, `server/main.lua`, et `database.sql`)
*   `metadata.json`
*   `README.md` (une version de base à améliorer)

**Instructions Détaillées - Plan d'Action :**

**Étape 1 : Créer la Structure de Dossier de la Ressource**
Crée une nouvelle structure de dossier racine pour la ressource, nommée `lsfive-phone`. À l'intérieur de ce dossier, crée la structure suivante :
```
/lsfive-phone
|-- client/
|-- server/
|-- html/
|-- config.lua
|-- database.sql
|-- fxmanifest.lua
|-- README.md
```

**Étape 2 : Analyser `FIVEM.md` et Créer les Fichiers de Base**
Analyse le fichier `FIVEM.md`. Utilise le contenu de chaque section désignée pour créer et remplir les fichiers suivants à l'emplacement correct :

1.  **`lsfive-phone/fxmanifest.lua`** : Utilise le code de la section `fxmanifest.lua`.
2.  **`lsfive-phone/config.lua`** : Utilise le code de la section `config.lua`.
3.  **`lsfive-phone/database.sql`** : Utilise le code de la section `database.sql`.
4.  **`lsfive-phone/client/main.lua`** : Utilise le code de la section `client/main.lua`.
5.  **`lsfive-phone/server/main.lua`** : Utilise le code de la section `server/main.lua`.

**Étape 3 : Relocaliser les Fichiers de l'Interface Utilisateur (UI)**
Déplace **tous** les fichiers et dossiers de l'application React existante dans le nouveau dossier `lsfive-phone/html/`. Cela inclut :
*   `index.html` -> `lsfive-phone/html/index.html`
*   `index.tsx` -> `lsfive-phone/html/index.tsx`
*   `App.tsx` -> `lsfive-phone/html/App.tsx`
*   `types.ts` -> `lsfive-phone/html/types.ts`
*   `constants.ts` -> `lsfive-phone/html/constants.ts`
*   `nui.ts` -> `lsfive-phone/html/nui.ts`
*   `i18n.ts` -> `lsfive-phone/html/i18n.ts`
*   Le dossier `components/` et tout son contenu -> `lsfive-phone/html/components/`
*   Le dossier `locales/` et tout son contenu -> `lsfive-phone/html/locales/`
*   **Action Clé :** Supprime les fichiers et dossiers dupliqués ou mal placés de l'ancienne structure (comme `html/index.html` au mauvais endroit, etc.). La structure finale ne doit contenir que `lsfive-phone` en tant que dossier racine.

**Étape 4 : Vérifier la Cohérence et l'Intégration**
1.  **Vérification du Manifeste :** Confirme que le `fxmanifest.lua` pointe correctly vers `html/index.html` (`ui_page 'html/index.html'`) et liste tous les scripts et fichiers nécessaires.
2.  **Vérification NUI :** Compare les appels `RegisterNUICallback` dans `client/main.lua` avec les appels `fetchNui('eventName', ...)` dans les fichiers `.tsx` (principalement `html/App.tsx`). Assure-toi que chaque événement envoyé depuis l'UI a un gestionnaire correspondant dans la logique Lua, et vice-versa pour les événements envoyés à l'UI.
3.  **Chemins des Traductions :** Dans `html/i18n.ts`, vérifie que le chemin d'accès pour récupérer les fichiers de traduction est relatif au `index.html`. L'appel `fetch('/locales/${locale}.json')` est correct car il sera servi depuis la racine de la page NUI.

**Étape 5 : Générer une Documentation `README.md` de Haute Qualité**
Remplace le `README.md` existant par une version améliorée, claire et professionnelle, destinée à un utilisateur non-développeur. Il doit inclure les sections suivantes :

*   **Introduction :** Une brève description du téléphone.
*   **Fonctionnalités :** Une liste à puces des principales fonctionnalités.
*   **Dépendances Requises :**
    *   `ox_lib` (avec un lien de téléchargement vers GitHub : `https://github.com/overextended/ox_lib`)
    *   `oxmysql` (avec un lien de téléchargement vers GitHub : `https://github.com/overextended/oxmysql`)
*   **Instructions d'Installation (Claires et Simples) :**
    1.  Télécharger les dépendances et cette ressource (`lsfive-phone`).
    2.  Placer les trois dossiers dans votre dossier `resources`.
    3.  Importer le fichier `database.sql` dans votre base de données (suggérer un outil comme HeidiSQL ou DBeaver).
    4.  Configurer le `config.lua` (expliquer brièvement les options `Config.Framework` et `Config.Command`).
    5.  Assurer le démarrage des ressources dans le bon ordre dans `server.cfg` : `ensure ox_lib`, `ensure oxmysql`, `ensure lsfive-phone`.
*   **Intégration au Framework :** Une petite note expliquant que pour des fonctionnalités comme la banque ou le garage, des modifications dans `server/main.lua` sont nécessaires, et pointer vers la section `FRAMEWORK INTEGRATION` dans ce fichier.

**Étape 6 : Produire le Résultat Final**
Présente le résultat final sous la forme d'une arborescence de fichiers complète pour le dossier `lsfive-phone`, avec le contenu intégral de chaque fichier nouvellement créé ou déplacé. Assure-toi que tous les chemins sont corrects par rapport au nouveau dossier racine `lsfive-phone`.

**Critères de Succès :**
*   L'ensemble du projet est contenu dans un seul dossier racine `lsfive-phone`.
*   Aucun fichier de l'ancienne structure n'est laissé à l'extérieur de `lsfive-phone/` ou dans un mauvais sous-dossier.
*   Le `README.md` est suffisamment clair pour qu'une personne sans expérience en développement puisse installer la ressource avec succès.
*   La ressource est fonctionnellement cohérente : les scripts Lua sont présents pour gérer les actions de l'interface utilisateur React.
*   Le processus est entièrement automatisé et ne nécessite aucune intervention manuelle de ma part après avoir lancé ce prompt.
