# BlackList Code Action

This GitHub Action scans your codebase for disallowed comments or pragmas and fails the workflow if any forbidden occurrences are found, unless explicitly allowed in a whitelist file.

## Disallowed Code Patterns
The following code comments/pragmas are disallowed by default:

- `// ts-expect`
- `// ts-ignore`
- `// eslint-disable`

These patterns are commonly used to suppress TypeScript or ESLint errors and should be avoided unless explicitly whitelisted.

## Features
- Recursively scans all `.js`, `.jsx`, `.ts`, `.tsx` files in your repository
- Detects forbidden patterns listed above
- Supports an allow-list file to whitelist specific occurrences
- Configurable working directory and allow-list path

## Inputs
| Name         | Description                                         | Default                                 |
|--------------|-----------------------------------------------------|-----------------------------------------|
| allow-list   | Whitelist file for allowed occurrences              | `.github/allowed-code-exceptions.txt`   |
| working-directory | Directory to scan for code files                | `.`                                     |

## Allow-list Format
Each line in the allow-list file should be in the format:
```
<filepath>:<line-number>:<pattern>
```
Example:
```
src/index.js:10:ts-ignore
```

## Usage
Add the following to your workflow YAML:
```yaml
- name: BlackList Code
  uses: cossth/blacklisted-code-action@v1
  with:
    allow-list: .github/allowed-code-exceptions.txt # optional
    working-directory: src # optional
```

## Example Workflow
```yaml
name: Check for Blacklisted Code
on: [push, pull_request]
jobs:
  blacklist:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: BlackList Code
        uses: cossth/blacklisted-code-action@v1
        with:
          allow-list: .github/allowed-code-exceptions.txt
```

## Output
- If disallowed comments/pragmas are found (not whitelisted), the action fails and lists all violations.
- If no disallowed comments/pragmas are found, the action passes.

## License
ISC

## Author
Shubham Sharma
