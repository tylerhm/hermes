<img src=".erb/img/erb-banner.svg" width="100%" />

## Usage

Hermes makes frequent use of the shell for compilation and checking. In order for this to work, you _must_ have the following installed and in your PATH.

- [python3](https://realpython.com/installing-python/)
- [Apollo](https://github.com/TylerMathis/apollo)
- Compiler / Interpreter for your languages
- [xdg-open-wsl](https://github.com/cpbotha/xdg-open-wsl)

Of the above, the following are installable through Hermes UI:
- [Apollo](https://github.com/TylerMathis/apollo)
- [xdg-open-wsl](https://github.com/cpbotha/xdg-open-wsl)

## Starting Development

Ensure that you have the following dependencies

- make
- g++
- node

Install `node_modules`:

```bash
npm install
```

Start the app in the `dev` environment:

```bash
npm start
```

## Packaging for Production

To package apps for the local platform:

```bash
npm run package
```

## License

MIT © [Electron React Boilerplate](https://github.com/electron-react-boilerplate)
