import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { getInput, setFailed } from '@actions/core';

const forbiddenPatterns = [ 'ts-expect', 'ts-ignore', 'eslint-disable' ];
const allowedFile = getInput('allow-list') || '.github/allowed-code-exceptions.txt';


let allowedOccurrences = new Set();
if (existsSync(allowedFile)) {
  readFileSync(allowedFile, 'utf-8')
    .split('\n')
    .forEach(line => { if (line.trim()) allowedOccurrences.add(line.trim()); });
}

function scanFile(filepath) {
  const lines = readFileSync(filepath, 'utf-8').split('\n');
  let violations = [];
  lines.forEach((line, idx) => {
    forbiddenPatterns.forEach(pattern => {
      if (line.includes(pattern)) {
        const key = `${filepath}:${idx+1}:${pattern}`;
        if (!allowedOccurrences.has(key)) {
          violations.push({filepath, line: idx+1, pattern, code: line.trim()});
        }
      }
    });
  });
  return violations;
}

// Recursively scan code files
function getAllCodeFiles(dir) {
  let results = [];
  readdirSync(dir).forEach(file => {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);
    if (stat.isDirectory() && !['node_modules', '.git'].includes(file)) {
      results = results.concat(getAllCodeFiles(fullPath));
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      results.push(fullPath);
    }
  });
  return results;
}

async function run() {
  try {
    const workingDirectory = getInput('working-directory') || '.';
    const allFiles = getAllCodeFiles(workingDirectory);
    let allViolations = [];
    allFiles.forEach(file => {
      allViolations.push(...scanFile(file));
    });

    if (allViolations.length > 0) {
      setFailed('Forbidden comments found:\n' +
        allViolations.map(v =>
          `  ${v.filepath}:${v.line}: ${v.pattern} -> ${v.code}`
        ).join('\n')
      );
    } else {
      console.log('No forbidden comments/pragmas found. All good!');
    }
  } catch (error) {
    setFailed(error.message);
  }
}

run();
