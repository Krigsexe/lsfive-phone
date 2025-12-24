# LSFive Phone - A Modern Universal FiveM Phone Resource

[![Visitors Badge](https://api.visitorbadge.io/api/VisitorHit?user=Krigsexe&repo=lsfive-phone&countColor=%237B1E7A)](https://github.com/Krigsexe/lsfive-phone)

[DEMO](https://lsfive-krigs-phone-550776260716.us-west1.run.app)

![Phone Preview with Gemini & Krigs Brain](https://www.proxitek.fr/wp-content/uploads/2025/08/fivem-phone.png)

LSFive Phone is a **modern, universal, and plug-n-play** phone resource for FiveM, built with React and TypeScript. It works out-of-the-box with **ESX**, **QBCore**, or as a **standalone** resource - no manual framework integration needed!

## Key Features

### Universal Framework Support
- **Automatic Framework Detection**: Automatically detects and integrates with ESX, QBCore, or runs standalone
- **Zero Configuration Required**: Works immediately after installation on any server
- **Full Framework Integration**: Bank transfers, vehicle spawning, job-specific apps - all work automatically

### Core Applications
- **Phone**: Full call system with voice chat support (pma-voice/mumble-voip)
- **Messages**: SMS with conversations, read receipts, and contact integration
- **Contacts**: Add, edit, delete contacts with custom avatars
- **Browser**: Full-featured web browser with tabs and history
- **Settings**: Theme, language, wallpaper, and more

### Functional Applications
- **Bank**: Balance, transfers, transaction history
- **Garage**: View and spawn your vehicles directly from the phone
- **Dispatch**: Emergency alert system for police, EMS, fire
- **Businesses**: Directory with GPS navigation
- **Social**: Instagram-like feed with posts and likes
- **Music**: YouTube integration and audio player
- **Mail**: Email client with inbox management
- **Weather**: Real-time weather via wttr.in API
- **Camera**: Photo capture (with fallback mock)

### Customization
- **Themes**: Light and dark mode
- **Wallpapers**: Built-in selection + custom URL support
- **App Management**: Install/uninstall apps via App Store
- **Customizable Dock**: Drag-and-drop to organize your layout
- **Localization**: English and French included (easily extensible)

## Dependencies

These resources must be started **before** lsfive-phone:

1. **[ox_lib](https://github.com/overextended/ox_lib)** - Required for shared libraries and notifications
2. **[oxmysql](https://github.com/overextended/oxmysql)** - Required for all database interactions

## Quick Installation (5 minutes)

### Step 1: Download
```bash
cd resources
git clone https://github.com/Krigsexe/lsfive-phone.git
# or download and extract the ZIP
```

### Step 2: Database Setup
Import the SQL script from `SQL.md` into your database. This creates all necessary tables.

```sql
-- Copy the content from SQL.md and execute in your MySQL client
```

### Step 3: Server Configuration
Add to your `server.cfg`:

```cfg
# Dependencies first
ensure ox_lib
ensure oxmysql

# Your framework (ESX or QBCore)
ensure es_extended  # or qb-core

# Then the phone
ensure lsfive-phone
```

### Step 4: Done!
Start your server. The phone will automatically:
- Detect your framework (ESX/QBCore/Standalone)
- Generate phone numbers for players
- Handle all integrations

**Default keybind: F1 or /phone**

## Configuration

Edit `config.lua` to customize:

```lua
Config = {}

-- General
Config.Command = 'phone'           -- Command to open phone (false to disable)
Config.Keybind = 'F1'              -- Keybinding
Config.Framework = 'auto'          -- 'auto', 'esx', 'qb-core', 'standalone'

-- Defaults
Config.DefaultLanguage = 'fr'      -- 'en' or 'fr'
Config.DefaultWallpaper = '...'    -- URL
Config.DefaultTheme = 'dark'       -- 'dark' or 'light'

-- Features
Config.EnableVoiceCalls = true     -- pma-voice/mumble-voip integration
Config.EnableGarageSpawn = true    -- Spawn vehicles from phone
Config.AllowOfflineTransfers = true -- Bank transfers to offline players

-- And many more options...
```

See the full `config.lua` for all available options.

## Voice Call Integration

The phone supports voice calls with:
- **[pma-voice](https://github.com/AvarianKnight/pma-voice)** - Recommended
- **[mumble-voip](https://github.com/FrazzIe/mumble-voip)** - Alternative

Enable with `Config.EnableVoiceCalls = true`

## Server Exports

```lua
-- Get a player's phone number
local phoneNumber = exports['lsfive-phone']:GetPlayerPhoneNumber(source)

-- Send an SMS from your script
exports['lsfive-phone']:SendSMS('555-1234', '555-5678', 'Hello!')

-- Send an email
exports['lsfive-phone']:SendMail('sender@ls.mail', 'recipient@ls.mail', 'Subject', 'Body')

-- Create a dispatch alert
exports['lsfive-phone']:CreateDispatchAlert('police', 'Robbery', 'Armed robbery in progress', 'Fleeca Bank')
```

## Client Exports

```lua
-- Check if phone is open
local isOpen = exports['lsfive-phone']:IsPhoneOpen()

-- Open/close phone programmatically
exports['lsfive-phone']:OpenPhone()
exports['lsfive-phone']:ClosePhone()

-- Send notification
exports['lsfive-phone']:SendNotification('Title', 'Message', 'success')
```

## File Structure

```
lsfive-phone/
├── fxmanifest.lua      # Resource manifest
├── config.lua          # Configuration
├── SQL.md              # Database schema
├── client/
│   └── main.lua        # Client-side logic
├── server/
│   └── main.lua        # Server-side logic
├── shared/
│   └── functions.lua   # Shared utilities
├── html/               # React UI (built)
│   ├── index.html
│   └── ...
├── locales/            # Language files
│   ├── en.json
│   └── fr.json
└── components/         # React components (source)
```

## Framework-Specific Notes

### ESX
- Uses `identifier` from `users` table
- Bank account: `xPlayer.getAccount('bank')`
- Vehicles from `owned_vehicles` table

### QBCore
- Uses `citizenid` from `players` table
- Bank account: `Player.PlayerData.money.bank`
- Vehicles from `player_vehicles` table

### Standalone
- Uses `license` identifier
- No money/vehicle integration (customize as needed)

## Adding New Languages

1. Copy `locales/en.json` to `locales/xx.json`
2. Translate all values
3. Add the language option in Settings app

## Troubleshooting

### Phone doesn't open
- Check if `ox_lib` and `oxmysql` are started before the phone
- Verify the keybind isn't conflicting with another resource
- Check server console for errors

### No phone number assigned
- Ensure the SQL tables were created correctly
- Check that your framework is detected (enable `Config.Debug = true`)

### Bank transfers not working
- Verify your framework is correctly detected
- Check that the player has sufficient funds
- Enable `Config.LogBankTransactions = true` for debugging

### Vehicles not spawning
- Ensure `Config.EnableGarageSpawn = true`
- Verify the vehicle exists in your framework's database
- Check that the vehicle model is valid

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Credits

- **Krigs** - Original development and UI design
- **Gemini AI** - Framework integration and plug-n-play features
- **Community** - Testing and feedback

## License

This project is open source. Feel free to use, modify, and distribute.

---

**Stars, Forks & Contributions Welcome!**

![Profile Views](https://komarev.com/ghpvc/?username=Krigsexe&color=blueviolet&style=for-the-badge)
![GitHub Stars](https://img.shields.io/github/stars/Krigsexe?style=for-the-badge&logo=github)

---

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=footer&text=Thank%20you%20for%20visiting!&fontSize=16&fontAlignY=65&desc=Merci%20pour%20votre%20visite!&descAlignY=80&descAlign=62"/>
</div>
