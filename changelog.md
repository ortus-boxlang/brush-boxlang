# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

* * *

## [Unreleased]

## [1.1.0]

- Added highlighting for the range operators (`..`, `..<`, `>..`, `>..<`)
- Added highlighting for the spread/rest operator (`...`) used in array literals, struct literals, function arguments, and destructuring
- Added soft-keyword highlighting for the `set{}` and `sb{}` / `stringbuilder{}` literals
- Fixed the BoxLang variable scope highlighting rule, which was incorrectly sharing the `color2` CSS class with template interpolation, to use its own `color7` class

## [1.0.1]

- First Version
