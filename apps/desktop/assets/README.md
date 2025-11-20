# Icon Assets

Place your application icons in this directory:

- `icon.png` - Main application icon (512x512 px recommended)
- `icon.ico` - Windows icon file (multi-size ICO)

## Creating icon.ico

You can use online tools to convert PNG to ICO:
- https://convertico.com/
- https://icoconvert.com/
- https://cloudconvert.com/png-to-ico

The ICO file should contain multiple sizes:
- 16x16
- 32x32
- 48x48
- 256x256

## Quick Icon Generation

If you have a square PNG logo (512x512), you can use these tools:

**ImageMagick** (if installed):
```bash
magick convert icon.png -define icon:auto-resize=256,128,96,64,48,32,16 icon.ico
```

**Online**:
1. Go to https://favicon.io/favicon-converter/
2. Upload your PNG
3. Download the ICO file
4. Place it here as `icon.ico`

## Default Icon

Until you add your own icon, electron-builder will use a default icon.
For production, always use a custom icon!
