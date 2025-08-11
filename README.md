
# LSFive Phone - A Modern FiveM Phone Resource

![Phone Preview with Gemini & Krigs Brain](https://www.proxitek.fr/wp-content/uploads/2025/08/fivem-phone.png)
![Phone Code with Gemini & Krigs Brain]([https://i.imgur.com/your-image-url.png](https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221JX1sDJRu9-gDT4CBi-alZjc12q1fdjvw%22%5D,%22action%22:%22open%22,%22userId%22:%22109541760888863960722%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing)) 
LSFive Phone is a modern, feature-rich, and performance-oriented phone resource for FiveM, built with React and TypeScript. It is designed to be plug-and-play while offering deep customization possibilities for any server framework (ESX, QBCore, or standalone).

## Features

*   **Modern UI:** A clean, iOS-inspired interface that is both beautiful and intuitive.
*   **Core Apps:** Phone, Messages, Settings, Browser.
*   **Functional Apps:** Bank, Garage, Businesses, Dispatch, Mail, Social, Music, Weather, and more.
*   **Customization:**
    *   Change themes (light/dark mode).
    *   Set custom wallpapers via URL or file upload.
    *   Install/uninstall optional apps via the App Store.
    *   **Customizable Dock:** Drag and drop apps to and from the dock to organize your layout.
*   **Performance:** Optimized client and server code to ensure minimal impact on performance.
*   **Localization:** Full support for English and French out of the box. Adding new languages is simple.
*   **Framework Agnostic:** Designed to work as a standalone resource, with easy integration points for ESX and QBCore.
*   **Well-Documented:** Clear instructions for installation, configuration, and integration.

## Dependencies

*   [ox_lib](https://github.com/overextended/ox_lib): Required for its libraries and notification system.
*   [oxmysql](https://github.com/overextended/oxmysql): Required for all database interactions.

## Installation

1.  **Download:** Clone or download this repository into your `resources` directory.
2.  **Database:** Import the `database.sql` file into your server's MySQL database. This will create all the necessary tables for the phone to function.
3.  **Configuration:** Open `config.lua` and adjust the settings to your liking. At a minimum, you should set `Config.Framework` to match your server ('esx', 'qb-core', or 'standalone').
4.  **Server CFG:** Ensure the resource is started in your `server.cfg` file. **Make sure it starts after your framework (`esx_legacy` or `qb-core`) and the dependencies (`ox_lib`, `oxmysql`).**
    ```cfg
    ensure ox_lib
    ensure oxmysql
    ensure lsfive-phone
    ```

## Configuration (`config.lua`)

| Setting                    | Description                                                                                               |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| `Config.Command`           | The command to open the phone (e.g., 'phone'). Set to `false` to disable.                                 |
| `Config.Keybind`           | The key mapping to open the phone. See FiveM docs for key codes.                                          |
| `Config.Framework`         | Your server framework: 'standalone', 'esx', or 'qb-core'. **This is a critical setting.**                  |
| `Config.DefaultLanguage`   | The default language for new users ('en' or 'fr').                                                        |
| `Config.DefaultWallpaper`  | The default wallpaper URL for new users.                                                                  |
| `Config.UseOxLibNotifications` | Set to `true` to use `ox_lib` notifications for a consistent server look. `false` uses a basic fallback. |


## Framework Integration

To make the phone work with your framework's data (player identifiers, money, etc.), you **must** edit the `FRAMEWORK INTEGRATION` section at the top of `server/main.lua`.

**Example for `GetPlayerFromSource`:**
You need to make sure this function correctly returns your framework's player object. The provided examples for ESX and QBCore should work for most recent versions.

```lua
-- server/main.lua

function GetPlayerFromSource(source)
    if Config.Framework == 'esx' then
        -- For ESX
        return exports.esx:GetPlayerFromId(source)
    elseif Config.Framework == 'qb-core' then
        -- For QBCore
        return exports['qb-core']:GetPlayer(source)
    else 
        -- For Standalone (no changes needed unless you have a custom player system)
        return {
            identifier = 'steam:' .. GetPlayerIdentifier(source, 0):gsub('steam:', ''),
            name = GetPlayerName(source),
        }
    end
end
```
You will also need to implement the logic for features like bank transfers within the corresponding NUI callbacks in `server/main.lua`, using your framework's functions to add/remove money.

## NUI Callbacks & Events

The resource is event-driven. The UI communicates with the server via NUI callbacks. Here is a list of events you may need to interact with.

### Client -> Server (NUI Callbacks)

These are handled in `server/main.lua`.

| Event Name                    | Payload Data (`data`)                               | Server-Side Action                                                              |
| ----------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------- |
| `phone:server:requestData`    | `{}`                                                | Requests all phone data for the player.                                         |
| `call:start`                  | `{ phoneNumber: "123-4567" }`                       | Initiate a call.                                                                |
| `messages:send`               | `{ recipientNumber: "...", message: "..." }`        | Send a text message.                                                            |
| `bank:transfer`               | `{ recipient: "...", amount: "...", reason: "..." }`| Perform a bank transfer. **(Requires framework logic)**                         |
| `dispatch:createAlert`        | `{ title: "...", details: "...", location: "..." }` | Create a new dispatch alert.                                                    |
| `garage:requestVehicle`       | `{ vehicleId: 1 }`                                  | Spawn the requested vehicle. **(Requires framework logic)**                     |
| `mail:send`                   | `{ to: "a@b.c", subject: "...", body: "..." }`      | Send an email.                                                                  |
| `social:createPost`           | `{ imageUrl: "...", caption: "..." }`               | Create a new social media post.                                                 |
| `social:likePost`             | `{ postId: "..." }`                                 | Toggle a like on a post.                                                        |
| `phone:updateSettings`        | `{ settings: '{"theme":"dark", ...}' }`             | Update the player's phone settings (theme, etc.).                               |
| `...`                         | `...`                                               | See `server/main.lua` for the full list of callbacks.                           |

### Server -> Client (Net Events)

These are handled in `client/main.lua`.

| Event Name                    | Payload Data                                        | Client-Side Action                                                              |
| ----------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------- |
| `phone:client:loadData`       | `{ userData, contacts, calls, ... }`                | Sends the player's complete phone data to the UI.                               |
| `phone:client:incomingCall`   | `{ contact: { id, name, ... } }`                    | Notifies the UI of an incoming call, forcing the phone to open.                 |
| `phone:client:notify`         | `{ title, description, type }`                      | Displays a notification to the player.                                          |

---

*This phone was developed by Krigs and enhanced for plug-and-play integration by Gemini AI.*
