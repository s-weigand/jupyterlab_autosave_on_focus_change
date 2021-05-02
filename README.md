# Jupyterlab Autosave on Focus Change

[![PyPi Version](https://img.shields.io/pypi/v/jupyterlab_autosave_on_focus_change.svg)](https://pypi.org/project/jupyterlab_autosave_on_focus_change/)
[![Supported Python Versions](https://img.shields.io/pypi/pyversions/jupyterlab_autosave_on_focus_change.svg)](https://pypi.org/project/jupyterlab_autosave_on_focus_change/)
![Github Actions Status](https://github.com/s-weigand/jupyterlab_autosave_on_focus_change/workflows/Build/badge.svg)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/s-weigand/jupyterlab_autosave_on_focus_change/main?urlpath=lab)
[![Docs](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://s-weigand.github.io/jupyterlab_autosave_on_focus_change/)

A Jupyterlab extension to autosave files on focus change.

<br>

<img style="display: block; margin: auto;" src="https://github.com/s-weigand/jupyterlab_autosave_on_focus_change/blob/main/assets/demo.gif?raw=true">

Who doesn't know this scenario, you changed some code or input file and the changes don't apply because (**again!**)
you forgot to save the file.

This is where editor settings to save files when the tab (or the whole editor) loose focus come in super handy.

This extension aims to do the same for jupyterlab as the following setting in VS-Code.

```json
  "files.autoSave": "onFocusChange",
```

## Features

- Autosave on focus change
- De-/Activation via Settings Menu
- File exclusion with glob patterns

## Requirements

- JupyterLab >= 3.0

## Install

```bash
pip install jupyterlab-autosave-on-focus-change
```

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jupyterlab_autosave_on_focus_change directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm run build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm run watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm run build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Uninstall

```bash
pip uninstall jupyterlab-autosave-on-focus-change
```
