<img src=".erb/img/erb-banner.svg" width="100%" />

## Usage

### Installation

Grab and run the correct installer or binary for your system from our [releases](https://github.com/TylerMathis/hermes/releases/) page.

### Notes

Hermes makes frequent use of the shell for compilation and checking. In order for this to work, you _must_ have the following installed and in your PATH.

- [python3](https://realpython.com/installing-python/)
- [Apollo](https://github.com/TylerMathis/apollo)
- Compiler / Interpreter for your languages
- [xdg-open-wsl](https://github.com/cpbotha/xdg-open-wsl) *Only for WSL users*
- [wsl](https://docs.microsoft.com/en-us/windows/wsl/install) *Only for Windows users*

Of the above, the following are installable through Hermes UI:
- [Apollo](https://github.com/TylerMathis/apollo)
- [xdg-open-wsl](https://github.com/cpbotha/xdg-open-wsl) *Only for WSL users*

## Supported Languages

Hermes currently supports the following languages:
* C
* C++
* Java
* Python

## Starting Development

Ensure that you have the following dependencies

- make
- g++
- node

Install `node_modules`:

```bash
npm install
```

Build binaries:
`make`

Start the app in the `dev` environment:

```bash
npm start
```

## Debugging Checklist

1. Our C++ scripts might have changed since you last built, have you run `make`?

### Adding Language Support

1. Add your language identifier to [`src/main/utils.ts`](https://github.com/TylerMathis/hermes/blob/83313fe9243a5ed6d861b6548bc1ed9461f78bb4/src/main/utils.ts#L33-L48), and include all possible file extensions for your language in the `getLang()` switch.
2. Add your `lang type`'s compilation directive to [`src/main/runner/compile.ts`](https://github.com/TylerMathis/hermes/blob/83313fe9243a5ed6d861b6548bc1ed9461f78bb4/src/main/runner/compile.ts#L21-L26). If your language is interpretted rather than compiled, follow the example for `python`, copying your file to the cache.
3. Add your `lang type`'s execution directive to [`src/main/runner/runguard.cpp`](https://github.com/TylerMathis/hermes/blob/83313fe9243a5ed6d861b6548bc1ed9461f78bb4/src/main/runner/runguard.cpp#L35-L41), and ensure to pipe the input and output to the locations provided in the script.
4. Submit a PR with evidence of Hermes compiling, running, and judging a solution in your language.

## Packaging for Production

To package apps for the local platform:

1. Compile binaries and ship them to correct location
```bash
make
```
2. Package
```bash
npm run package
```

## License

MIT © [Electron React Boilerplate](https://github.com/electron-react-boilerplate)
