# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.7.5](https://github.com/rocwind/react-native-webview-comlink/compare/v0.7.4...v0.7.5) (2021-09-24)


### Bug Fixes

* move dom type definitions to d.ts to avoid conflicts with ts dom lib referenced in web projects ([76fa271](https://github.com/rocwind/react-native-webview-comlink/commit/76fa271e160c334c000cb72e525a48c2dee00af9))

### [0.7.4](https://github.com/rocwind/react-native-webview-comlink/compare/v0.7.3...v0.7.4) (2021-08-17)


### Bug Fixes

* workaround for the android inject issue by try inject for more times on loading ([868bb2f](https://github.com/rocwind/react-native-webview-comlink/commit/868bb2f81b19494d487e583bc90cfcc618068251))

### [0.7.3](https://github.com/rocwind/react-native-webview-comlink/compare/v0.7.2...v0.7.3) (2021-08-17)


### Bug Fixes

* try to workaround js inject issue on some Android devices by adding inject call on progress event ([e92626a](https://github.com/rocwind/react-native-webview-comlink/commit/e92626a8d565dcb5f4b0682ee4fe76d8cb986308))

### [0.7.2](https://github.com/rocwind/react-native-webview-comlink/compare/v0.7.1...v0.7.2) (2021-08-16)


### Bug Fixes

* remove the deprecated `injectOnLoadStart` option ([8294b10](https://github.com/rocwind/react-native-webview-comlink/commit/8294b10036a81c7f1740ef430f7eed568aa3878d))
* try to workaround js inject issue on some Android devices ([b69699f](https://github.com/rocwind/react-native-webview-comlink/commit/b69699fc6452e2df6c5554aa800aa9bf741546e5))

### [0.7.1](https://github.com/rocwind/react-native-webview-comlink/compare/v0.7.0...v0.7.1) (2021-08-12)


### Features

* remote function instance keeps the same if using the same local function, use a more compact protocol for messaging ([a4fac95](https://github.com/rocwind/react-native-webview-comlink/commit/a4fac95fcd5c44da8ddbd4a6a30995404884ea08))

## [0.7.0](https://github.com/rocwind/react-native-webview-comlink/compare/v0.6.4...v0.7.0) (2021-08-10)


### ⚠ BREAKING CHANGES

* - rename `withComlinkExpose()` to `withJavascriptInterface()`
- message protocol changed so it is no longer compatible with v0.5.x client(web side) code
* message protocol changed, handled message will not trigger `onMessage` prop anymore

### Features

* rewrite the core messaging part, remove the Comlink dependency. ([aa69b26](https://github.com/rocwind/react-native-webview-comlink/commit/aa69b261c233d1afe36d7b58d3e68c07cfb875a3))
* support expose mutiple objects to window ([01a6830](https://github.com/rocwind/react-native-webview-comlink/commit/01a683073194f764a96d5a7ed78a94d1ecb0db06))


### Bug Fixes

* compatible with Android 5 browser ([2b88f30](https://github.com/rocwind/react-native-webview-comlink/commit/2b88f300864ae656823efe9b70423a3544c917f7))

### [0.6.4](https://github.com/rocwind/react-native-webview-comlink/compare/v0.6.3...v0.6.4) (2021-08-05)


### Features

* inject can be triggered from web side by post message ([2dae324](https://github.com/rocwind/react-native-webview-comlink/commit/2dae32465d893c7ff31c7c3a1497d9004572bfa8))

### [0.6.3](https://github.com/rocwind/react-native-webview-comlink/compare/v0.6.2...v0.6.3) (2021-08-03)


### Features

* add injectOnLoadStart option ([0552bd5](https://github.com/rocwind/react-native-webview-comlink/commit/0552bd5871d4f990c6aba3571685aa0bb47fc13d))


### Bug Fixes

* **deps:** update jest, ts-jest to v27 ([0cbffe1](https://github.com/rocwind/react-native-webview-comlink/commit/0cbffe1262548604ffbad6142e2170f905b61335))
* inject script to webview on page load start to get the interface available earlier ([4fd5a8c](https://github.com/rocwind/react-native-webview-comlink/commit/4fd5a8cbac4772f61c2c66edd2f1679f17511330))

### [0.6.2](https://github.com/rocwind/react-native-webview-comlink/compare/v0.6.1...v0.6.2) (2021-04-19)


### Bug Fixes

* inject script after page loaded ([cce2d71](https://github.com/rocwind/react-native-webview-comlink/commit/cce2d7112e67cfd7bce670bbd489a1e322e6c73b))
* simplify web side script, do not export functions and remove wait-ready ([e3fee01](https://github.com/rocwind/react-native-webview-comlink/commit/e3fee01cc24897442ff62f07636524372b03f2f9))

### [0.6.1](https://github.com/rocwind/react-native-webview-comlink/compare/v0.6.0...v0.6.1) (2021-04-16)


### Bug Fixes

* **examples:** update deps version to address android webview crash issue on Android 5.0 ([535af33](https://github.com/rocwind/react-native-webview-comlink/commit/535af336eeb301d623c91517e73482bcf6e328e8))
* **examples:** update examples and README according to Android 5.0 compatibility check ([d15e58c](https://github.com/rocwind/react-native-webview-comlink/commit/d15e58cca2f39986642aaf5734129e4ab2c336e5))
* get injected js interface works on iOS ([e1b4ea5](https://github.com/rocwind/react-native-webview-comlink/commit/e1b4ea53029297ad02dabf9d33a0ac36702a6a9c))

## [0.6.0](https://github.com/rocwind/react-native-webview-comlink/compare/v0.5.1...v0.6.0) (2021-04-12)


### ⚠ BREAKING CHANGES

* withComlinkExpose() now needs a name param to define the interface name on web side
* change the option name whitelistUrls to whitelistURLs

### Features

* support inject a interface from native to web ([3e4ca72](https://github.com/rocwind/react-native-webview-comlink/commit/3e4ca7227a9d76d8ad9c79c2c3348af797d29e2d))


* change the option name whitelistUrls to whitelistURLs ([4e61886](https://github.com/rocwind/react-native-webview-comlink/commit/4e618861c5c203e4b0a3952a5030e158019834de))

### [0.5.1](https://github.com/rocwind/react-native-webview-comlink/compare/v0.5.0...v0.5.1) (2020-05-16)

## [0.5.0](https://github.com/rocwind/react-native-webview-comlink/compare/v0.4.4...v0.5.0) (2020-04-27)


### ⚠ BREAKING CHANGES

* rename options.debug to options.log and support input a logger function

* rename options.debug to options.log and support input a logger function ([830ce36](https://github.com/rocwind/react-native-webview-comlink/commit/830ce36c6125a922f324d85255d7ceb623913fe4))

### [0.4.4](https://github.com/rocwind/react-native-webview-comlink/compare/v0.4.3...v0.4.4) (2020-03-30)
