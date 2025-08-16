
## Badges

<div align="center">

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Visits Badge](https://badges.pufler.dev/visits/BasheerRajeh/config-prettier-js)](https://github.com/BasheerRajeh/config-prettier-js)
[![Created Badge](https://badges.pufler.dev/created/BasheerRajeh/config-prettier-js)](https://www.npmjs.com/package/config-prettier)
[![Updated Badge](https://badges.pufler.dev/updated/BasheerRajeh/config-prettier-js)](https://www.npmjs.com/package/config-prettier)

</div>

# Config-Prettier

Config-Prettier is a JavaScript package that provides a set of best practice configurations for Prettier, a code formatter that helps you maintain consistent code style in your projects. This package aims to simplify the setup process for Prettier by providing a predefined configuration and a set of recommended plugins.


## Features

- Consistent and opinionated code formatting rules.
- Preconfigured to work with popular plugins.
- Easy installation and integration into your projects.



## Installation

```bash
  npm install --save-dev config-prettier
```
    
## Usage/Examples
Once Config-Prettier is installed, you can add it to your project's `package.json` file to set up Prettier scripts. Here's an example of how to add the scripts to your `package.json`:

```json
"scripts": {
    // ...
  "lint:check": "prettier --check \"**/*.{js,ts,tsx,md,mdx,json}\"",
  "lint:fix": "prettier --write \"**/*.{js,ts,tsx,md,mdx,json}\""
}, 
"prettier": "config-prettier",
// ...
```

The `lint:check` script will check your code for Prettier formatting violations, and the `lint:fix` script will automatically fix them.

### .prettierrc.cjs

```javascript
module.exports = {
  ...require('config-prettier'),
  // Override rules if needed, check https://prettier.io/docs
};
```

This configuration file extends the rules defined in Config-Prettier and allows you to override them if necessary.

## Plugins
Config-Prettier depends on several Prettier plugins to enhance its functionality. You do not need to install these plugins separately; they are included with Config-Prettier by default.:

- [prettier-plugin-prisma](https://www.npmjs.com/package/prettier-plugin-prisma)
- [prettier-plugin-sort-json](https://www.npmjs.com/package/prettier-plugin-sort-json)
- [prettier-plugin-tailwindcss](https://www.npmjs.com/package/prettier-plugin-tailwindcss)
- [prettier-plugin-package-perfection](https://www.npmjs.com/package/prettier-plugin-package-perfection)

With Config-Prettier and its bundled plugins in place, your project's code formatting will adhere to best practices and remain consistent throughout development. Happy coding!


## Authors

- [@BasheerRajeh](https://www.github.com/BasheerRajeh)

