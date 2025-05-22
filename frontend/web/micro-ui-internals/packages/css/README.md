# @tekdi/djibouti-ui-css

A customized CSS library for DJIBOUTI UI with Inter font as the default font family.

## Features

- Inter font set as the default font throughout the application
- Complete tailwind configuration customized for DJIBOUTI UI
- Pre-configured components styling
- Mobile responsive design
- Font utility classes for easy typography

## Install

```bash
npm install --save @tekdi/djibouti-ui-css
```

## Usage

After adding the dependency in your package.json:

```json
"@tekdi/djibouti-ui-css": "^0.0.8"
```

### Method 1: Add to HTML directly

Add the following to your HTML head:

```html
<link rel="stylesheet" href="https://unpkg.com/@tekdi/djibouti-ui-css@0.0.8/dist/index.css" />
```

### Method 2: Import in JavaScript

If you're using a bundler like webpack, you can import the styles directly:

```javascript
import "@tekdi/djibouti-ui-css/dist/index.css";
```

## Font Configuration

This package uses Inter as the default font. All elements automatically use Inter without requiring explicit font-family declarations in your components.

### Font Weights Available:

- Regular (400)
- Medium (500)
- Semi-bold (600)
- Bold (700)

### Using Font Utility Classes

The package comes with utility classes for easy font usage:

```css
/* Base font class */
.font-inter {
  font-family: "Inter", sans-serif;
}

/* Font weight variants */
.font-inter-regular {
  font-family: "Inter", sans-serif;
  font-weight: 400;
}

.font-inter-medium {
  font-family: "Inter", sans-serif;
  font-weight: 500;
}

.font-inter-semibold {
  font-family: "Inter", sans-serif;
  font-weight: 600;
}

.font-inter-bold {
  font-family: "Inter", sans-serif;
  font-weight: 700;
}
```

## Tailwind Configuration

This package includes a customized Tailwind configuration specifically for DJIBOUTI UI applications.
The configuration sets Inter as the default font for all component classes.

## Components

The package includes CSS for all DJIBOUTI UI components with Inter font styling applied.

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the issues page if you want to contribute.

## License

MIT © Tekdi Technologies Pvt. Ltd.

## Credits

This package is a customized version of the original DJIBOUTI CSS components, optimized for use with Inter font.

# digit-ui-css

## Install

```bash
npm install --save @egovernments/digit-ui-components-css
```

## Limitation

```bash
This Package is more specific to DIGIT-UI's can be used across mission's
It is the base css for all Digit UI's
```

## Usage

After adding the dependency make sure you have this dependency in

```bash
frontend/micro-ui/web/package.json
```

```json
"@egovernments/digit-ui-components-css":"0.0.2",
```

then navigate to App.js

```bash
frontend/micro-ui/web/public/index.html
```

```jsx
/** add this import **/

<link rel="stylesheet" href="https://unpkg.com/@egovernments/digit-ui-components-css@0.0.2/dist/index.css" />
```

## Changelog

### Summary for Version [0.0.2] - 2024-06-03

#### New Changes

- Added Error Message Component.
- Added Info Button Component.
- Added Panels Component.
- Added Popup Component with two variants: `default` and `alert`.
- Added RemoveableTag Component.
- Added Stepper Component.
- Added TextBlock Component.
- Added Timeline Component.
- Added Uploader Component with three variants: `UploadFile`, `UploadPopup`, and `UploadImage`.
- Added PanelCard Molecule.

#### Enhancements

- Updated Button Component Styles.
- Updated Dropdown Component Styles and added SelectAll Option.
- Updated InfoCard Component Styles.
- Added Animation for Toast.
- Added new prop `type` for Toast, replacing the separate props for `info`, `warning`, and `error`.
- Updated Typography with lineHeight.
- Updated Color Typography.

For a detailed changelog, see the [CHANGELOG.md](./CHANGELOG.md) file.

## Published from DIGIT-UI-LIBRARIES

DIGIT-UI-LIBRARIES Repo (https://github.com/egovernments/DIGIT-UI-LIBRARIES/tree/master)

# Contributors

[nabeelmd-egov] [bhavya-eGov] [nipunarora-eGov] [swathi-egov] [jagankumar-egov] [Tulika-eGov] [Ramkrishna-egov]

# Reference

Storybook (https://unified-dev.digit.org/storybook/)

Documentation (https://core.digit.org/guides/developer-guide/ui-developer-guide/digit-ui/ui-components-standardisation/digit-ui-components0.2.0)

## License

MIT © [jagankumar-egov](https://github.com/jagankumar-egov)

![Logo](https://s3.ap-south-1.amazonaws.com/works-dev-asset/mseva-white-logo.png)
