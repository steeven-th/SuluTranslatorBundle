<div align="center">
    <img width="150" src="./doc/images/logo.png" alt="Itech World logo">
</div>

<h1 align="center">Translator Bundle for <a href="https://sulu.io" target="_blank">Sulu</a></h1>

<h3 align="center">Developed by <a href="https://github.com/steeven-th" target="_blank">Steeven THOMAS</a></h3>
<p align="center">
    <a href="LICENSE" target="_blank">
        <img src="https://img.shields.io/badge/license-MIT-green" alt="GitHub license">
    </a>
    <a href="https://sulu.io/" target="_blank">
        <img src="https://img.shields.io/badge/sulu_compatibility-%3E=3.0-cyan" alt="Sulu compatibility">
    </a>
</p>

SuluTranslatorBundle integrates [DeepL](https://www.deepl.com/) automatic translation into the Sulu CMS 3.x admin interface. Translate your page and article content with a single click, directly from the edit form.

## 📂 Requirements

* PHP ^8.2
* Sulu ^3.0
* A [DeepL API key](https://www.deepl.com/pro-api) (Free or Pro)

## 🛠️ Features

* **Per-field translation button** on `text_line`, `text_area` and `text_editor` fields
* **Bulk "Translate all" button** in the form toolbar to translate every text field at once
* **Auto-detection** of the source language by DeepL
* **Target language** automatically set to the locale selected in the admin dropdown
* **Undo button** to revert a translation to the previous value
* **HTML preservation** for rich text fields (CKEditor content)
* **DeepL usage statistics** page in admin settings
* **Pages and articles** support

## 🇬🇧 Available translations

* English
* French

## 📝 Installation

### Composer

```bash
composer require itech-world/sulu-translator-bundle
```

### Symfony Flex

If you don't use Symfony Flex, you can add the bundle to your `config/bundles.php` file:

```php
return [
    // ...
    ItechWorld\SuluTranslatorBundle\ItechWorldSuluTranslatorBundle::class => ['all' => true],
];
```

### Configuration

#### Step 1: Configure your DeepL API key

Add your DeepL API key to your `.env` or `.env.local` file:

```dotenv
DEEPL_API_KEY=your_deepl_api_key_here
```

#### Step 2: Create the bundle configuration

Create the file `config/packages/itech_world_sulu_translator.yaml`:

```yaml
itech_world_sulu_translator:
    deepl_api_key: "%env(DEEPL_API_KEY)%"
    locale_mapping:
        en: "en-GB"
        fr: "fr"
        de: "de"
```

> **Note:** The `locale_mapping` is optional. It maps Sulu locale codes to DeepL language codes. If a locale is not mapped, it will be converted to uppercase automatically (e.g. `fr` becomes `FR`). See [DeepL supported languages](https://developers.deepl.com/docs/resources/supported-languages) for valid codes.

#### Step 3: Register the admin JavaScript

Edit the `assets/admin/app.js` to add the bundle in imports:

```javascript
import 'sulu-itech-world-sulu-translator-bundle';
```

#### Step 4: Build admin assets

In the `assets/admin/` folder, run the following command:

```bash
npm install
npm run build
```

or

```bash
yarn install
yarn build
```

#### Step 5: Clear cache

```bash
php bin/adminconsole cache:clear
```

## ⚙️ Configuration Reference

```yaml
itech_world_sulu_translator:
    # Required: Your DeepL API key
    deepl_api_key: "%env(DEEPL_API_KEY)%"

    # Optional: Map Sulu locales to DeepL language codes
    # Useful when Sulu uses short codes (e.g. "en") but DeepL requires
    # regional variants (e.g. "en-GB" or "en-US")
    locale_mapping:
        en: "en-GB"     # English (British)
        fr: "fr"        # French
        de: "de"        # German
        es: "es"        # Spanish
        it: "it"        # Italian
        nl: "nl"        # Dutch
        pt: "pt-PT"     # Portuguese (European)
```

## 🔤 Per-field Translation

Once installed, a **translate button** (language icon) appears on every `text_line`, `text_area` and `text_editor` field in the page and article edit forms.

1. Select the **target language** in the Sulu locale dropdown (top of the page)
2. Click the **translate button** on any field
3. The field content is sent to DeepL and replaced with the translation
4. Click the **undo button** (appears after translation) to revert to the original value

## 🌍 Bulk Translation

A **"Translate all"** button is available in the form toolbar:

1. Select the target language in the locale dropdown
2. Click **"Translate all"** in the toolbar
3. Confirm the action in the dialog
4. All text fields are translated simultaneously

## 📊 DeepL Usage Statistics

The bundle provides a settings view showing your DeepL API usage:
- Characters used vs. plan limit
- Visual progress bar with color coding (green/yellow/red)
- Direct link to your DeepL dashboard

## 🔌 REST API Endpoints

The bundle exposes two admin API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/api/translator/translate` | Translate text content |
| `GET` | `/admin/api/translator/usage` | Get DeepL API usage stats |

### POST /admin/api/translator/translate

**Request body:**

```json
{
    "text": "Bonjour le monde",
    "target": "en",
    "source": "fr"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | Text content to translate (supports HTML) |
| `target` | string | Yes | Target Sulu locale code |
| `source` | string | No | Source language (auto-detected if omitted) |

**Response:**

```json
{
    "translation": "Hello world"
}
```

### GET /admin/api/translator/usage

**Response:**

```json
{
    "character_count": 42500,
    "character_limit": 500000
}
```

## 📋 Supported Field Types

| Sulu Field Type | Support | Notes |
|-----------------|---------|-------|
| `text_line` | ✅ | Single-line text input |
| `text_area` | ✅ | Multi-line text area |
| `text_editor` | ✅ | Rich text (HTML preserved via `tag_handling: html`) |

## 📁 Bundle Structure

```
SuluTranslatorBundle/
├── config/
│   └── services.yaml              # Service definitions
├── src/
│   ├── ItechWorldSuluTranslatorBundle.php   # Bundle entry point
│   ├── Admin/
│   │   └── TranslatorAdmin.php    # Toolbar actions registration
│   ├── Controller/Admin/
│   │   └── TranslationController.php  # REST API endpoints
│   └── Service/
│       └── DeeplTranslationService.php # DeepL API wrapper
├── assets/admin/
│   ├── index.js                   # JS entry point
│   ├── translator.css             # Button styles
│   ├── components/TranslatorButton/
│   │   ├── TranslatorButton.js    # React button component
│   │   └── withTranslatorButton.js # HOC for field wrapping
│   ├── stores/
│   │   └── translatorQueueStore.js # MobX bulk queue store
│   └── views/
│       ├── TranslatorToolbarAction.js  # Toolbar action
│       └── TranslatorConfig.js    # Settings/stats view
├── translations/
│   ├── admin.en.json              # English translations
│   └── admin.fr.json              # French translations
├── composer.json
├── package.json
└── README.md
```

## 🐛 Bug and Idea

See the [open issues](https://github.com/steeven-th/SuluTranslatorBundle/issues) for a list of proposed features (and known issues).

## 💰 Support me

You can buy me a coffee to support me **this plugin is 100% free**.

[Buy me a coffee](https://www.buymeacoffee.com/steeven.th)

## 👨‍💻 Contact

<a href="https://steeven-th.dev"><img src="https://avatars.githubusercontent.com/u/82022828?s=96&v=4" width="48"></a>
<a href="https://x.com/ThomasSteeven2"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Twitter_X.png/640px-Twitter_X.png" width="48"></a>

## 📘&nbsp; License

This bundle is under the [MIT License](LICENSE).
