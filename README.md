# LSFive Phone - Universal FiveM Phone Resource

[![Visitors Badge](https://api.visitorbadge.io/api/VisitorHit?user=Krigsexe&repo=lsfive-phone&countColor=%237B1E7A)](https://github.com/Krigsexe/lsfive-phone)

[DEMO](https://lsfive-krigs-phone-550776260716.us-west1.run.app)


LSFive Phone est un telephone **moderne, universel et plug-n-play** pour FiveM, construit avec React et TypeScript. Il fonctionne immediatement avec **ESX**, **QBCore**, ou en mode **standalone** - aucune integration manuelle requise!

## Fonctionnalites

### Support Universel des Frameworks
- **Detection Automatique**: Detecte automatiquement ESX, QBCore, ou fonctionne en standalone
- **Zero Configuration**: Fonctionne immediatement apres l'installation
- **Integration Complete**: Virements bancaires, spawn de vehicules, apps metiers - tout fonctionne automatiquement

### Applications
| Core | Fonctionnelles | Optionnelles |
|------|----------------|--------------|
| Telephone (appels vocaux) | Banque | Social (Instagram-like) |
| Messages SMS | Garage | Musique (YouTube) |
| Contacts | Dispatch | Meteo |
| Navigateur | Entreprises | Photos |
| Parametres | Mail | Notes |

### Personnalisation
- Themes clair/sombre
- Fonds d'ecran personnalises
- Installation/desinstallation d'apps
- Dock personnalisable par drag-n-drop
- Localisation FR/EN

---

## Dependances

> **Important (Decembre 2025)**: [Overextended](https://github.com/overextended) a archive ses repositories en avril 2025. Les versions maintenues sont disponibles chez [CommunityOx](https://github.com/CommunityOx). Voir [coxdocs.dev](https://coxdocs.dev/) pour la documentation.

Ces ressources doivent etre demarrees **AVANT** lsfive-phone:

| Ressource | Repository | Notes |
|-----------|------------|-------|
| **oxmysql** | [CommunityOx/oxmysql](https://github.com/CommunityOx/oxmysql) | v2.13.1 supporte Node.js 22 |
| **ox_lib** | [CommunityOx/ox_lib](https://github.com/CommunityOx/ox_lib) | v3.32.2 (Dec 2025) |

**Ordre de demarrage recommande**: oxmysql → ox_lib → framework → lsfive-phone

---

## Installation Rapide

### 1. Telecharger
```bash
cd resources
git clone https://github.com/Krigsexe/lsfive-phone.git
```

### 2. Base de Donnees
```bash
mysql -u root -p votre_database < install.sql
```

> **Recommandation**: Utilisez **MariaDB** plutot que MySQL 8 pour une meilleure compatibilite avec FiveM.

### 3. Configuration server.cfg

```cfg
# Connection BDD (IMPORTANT: utilisez 'set' pas 'setr' pour la securite)
set mysql_connection_string "mysql://user:password@localhost/fivem"

# Ordre de demarrage
ensure oxmysql
ensure ox_lib
ensure es_extended  # ou qb-core
ensure lsfive-phone
```

### 4. C'est tout!

Le telephone detecte automatiquement votre framework et fonctionne immediatement.

**Keybind: F1 | Commande: /phone**

---

## Configuration

Editez `config.lua`:

```lua
Config = {}

Config.Command = 'phone'           -- Commande (false pour desactiver)
Config.Keybind = 'F1'              -- Touche
Config.Framework = 'auto'          -- 'auto', 'esx', 'qb-core', 'standalone'

Config.DefaultLanguage = 'fr'      -- 'en' ou 'fr'
Config.DefaultTheme = 'dark'       -- 'dark' ou 'light'

Config.EnableVoiceCalls = true     -- pma-voice/mumble-voip
Config.EnableGarageSpawn = true    -- Spawn vehicules
Config.AllowOfflineTransfers = true -- Virements hors-ligne
```

---

## Node.js 22 (Optionnel)

FiveM supporte maintenant Node.js 22. Pour l'activer, decommentez dans `fxmanifest.lua`:

```lua
node_version '22'
```

---

## Exports

### Serveur
```lua
exports['lsfive-phone']:GetPlayerPhoneNumber(source)
exports['lsfive-phone']:SendSMS(from, to, message)
exports['lsfive-phone']:SendMail(from, to, subject, body)
exports['lsfive-phone']:CreateDispatchAlert(dept, title, details, location)
```

### Client
```lua
exports['lsfive-phone']:IsPhoneOpen()
exports['lsfive-phone']:OpenPhone()
exports['lsfive-phone']:ClosePhone()
exports['lsfive-phone']:SendNotification(title, msg, type)
```

---

## Voice Chat

Support:
- [pma-voice](https://github.com/AvarianKnight/pma-voice) (recommande)
- [mumble-voip](https://github.com/FrazzIe/mumble-voip)

---

## Build Frontend

```bash
npm install
npm run build  # Output dans html/
```

Compatible Node.js 16.9+ (runtime FiveM par defaut)

---

## Notes Framework

| Framework | Identifier | Compte Bancaire | Vehicules |
|-----------|------------|-----------------|-----------|
| ESX | `users.identifier` | `xPlayer.getAccount('bank')` | `owned_vehicles` |
| QBCore | `players.citizenid` | `Player.PlayerData.money.bank` | `player_vehicles` |
| Standalone | `license` | - | - |

---

## Depannage

| Probleme | Solution |
|----------|----------|
| Telephone ne s'ouvre pas | Verifiez l'ordre de demarrage des ressources |
| Pas de numero | Verifiez que les tables SQL existent |
| Virements echouent | Activez `Config.Debug = true` |

---

## References

- [FiveM Resource Manifest](https://docs.fivem.net/docs/scripting-reference/resource-manifest/resource-manifest/)
- [CommunityOx Documentation](https://coxdocs.dev/)
- [FiveM JavaScript Runtime](https://docs.fivem.net/docs/scripting-manual/runtimes/javascript/)
- [Node.js 22 Support PR](https://github.com/citizenfx/fivem/pull/2479)

---

## Credits

- **Krigs** - Developpement et UI
- **Community** - Tests et contributions

---

**Stars & Contributions Welcome!**

![Profile Views](https://komarev.com/ghpvc/?username=Krigsexe&color=blueviolet&style=for-the-badge)
