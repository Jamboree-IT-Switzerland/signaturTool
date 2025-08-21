# Mova Signature Generator

A pure JavaScript application to generate multilingual email signatures for the Mova organization.

## Features

- **Pure JavaScript**: No server-side dependencies - runs entirely in the browser
- **Multilingual Support**: German, French, and Italian translations
- **Configuration-Based**: Easy to maintain through JSON configuration files
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Preview**: Instant signature generation and preview
- **Copy to Clipboard**: Easy copying of generated HTML signatures

## Architecture

This application has been converted from PHP to a pure client-side JavaScript solution for better maintainability and easier deployment.

### File Structure

```
├── index.html              # Main application page
├── src/
│   ├── config/
│   │   ├── app-config.json     # Application configuration
│   │   └── translations.json   # Multilingual translations and role mappings
│   ├── css/
│   │   ├── main.css           # Main styles with signature display
│   │   └── process.css        # Legacy styles (can be removed)
│   ├── js/
│   │   └── main.js           # Application logic
│   └── img/
│       └── Mova_Logo_*.png   # Logo assets
├── package.json
└── README.md
```

### Configuration Files

**src/config/app-config.json**: Contains application settings, validation rules, and UI configuration.

**src/config/translations.json**: Contains all translations for:
- UI text in German, French, and Italian
- Role translations by gender and language
- Sector/department translations

## Development

### Prerequisites
- Node.js (for the development server)
- Modern web browser with ES6+ support

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:8080 in your browser

### Adding New Languages

1. Add language to `src/config/app-config.json` in `supportedLanguages`
2. Add translations to `src/config/translations.json` for:
   - UI text
   - Role translations
   - Sector translations

### Adding New Roles or Sectors

Edit `src/config/translations.json` and add entries to the `roles` or `sectors` objects with translations for all supported languages.

## Deployment

Since this is a pure client-side application, it can be deployed to any static hosting service:

- **Static Hosting**: GitHub Pages, Netlify, Vercel, etc.
- **CDN**: Any CDN that serves static files
- **Web Server**: Apache, Nginx, or any HTTP server

### Build for Production

No build step is required - just upload the files to your hosting service.

```bash
# For production deployment, you can use:
npm run start
```

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers

## Configuration

### Form Validation

Validation rules are configured in `src/config/app-config.json`:

```json
{
  "form": {
    "validation": {
      "required": ["gender", "firstname", "role", "Comission"],
      "emailPattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
      "phonePattern": "^[+]?[0-9\\s\\-\\(\\)]{10,}$"
    }
  }
}
```

### Signature Appearance

Signature styling is configured in the same file:

```json
{
  "signature": {
    "websiteUrl": "www.mova.ch",
    "logoPath": "src/img/Mova_Logo_black_rgb_Mailsignatur_marginright_big.png",
    "logoHeight": "150px",
    "fontFamily": "arial, sans-serif",
    "fontSize": "12.5px"
  }
}
```

## License

MIT License
