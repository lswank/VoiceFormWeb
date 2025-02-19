import { glob } from 'glob';
import * as ts from 'typescript';
import * as path from 'path';

interface ValidationResult {
  file: string;
  issues: string[];
}

function validateFile(filePath: string): ValidationResult {
  const issues: string[] = [];
  const sourceFile = ts.createSourceFile(
    filePath,
    require('fs').readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  );

  function visit(node: ts.Node) {
    // Check for API calls without validation
    if (ts.isCallExpression(node) && 
        ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.name) &&
        node.expression.name.text === 'json') {
      const parent = node.parent;
      if (parent && ts.isAwaitExpression(parent)) {
        const grandParent = parent.parent;
        if (grandParent && !isValidated(grandParent)) {
          issues.push(`API response at ${node.getStart()} is not validated`);
        }
      }
    }

    // Check for direct type usage instead of Zod-derived types
    if (ts.isTypeReferenceNode(node)) {
      const typeName = node.typeName.getText();
      if (['Form', 'User', 'FormResponse', 'FormAnalytics'].includes(typeName)) {
        const importDecl = findImportDeclaration(sourceFile, typeName);
        if (importDecl && !importDecl.moduleSpecifier.text.includes('schemas')) {
          issues.push(`Type ${typeName} should be imported from schemas`);
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return { file: filePath, issues };
}

function isValidated(node: ts.Node): boolean {
  if (ts.isCallExpression(node)) {
    const callName = node.expression.getText();
    return callName.includes('validate') || callName.includes('parse');
  }
  return false;
}

function findImportDeclaration(sourceFile: ts.SourceFile, typeName: string): ts.ImportDeclaration | undefined {
  let result: ts.ImportDeclaration | undefined;
  
  ts.forEachChild(sourceFile, node => {
    if (ts.isImportDeclaration(node)) {
      const importClause = node.importClause;
      if (importClause && importClause.namedBindings) {
        if (ts.isNamedImports(importClause.namedBindings)) {
          const hasType = importClause.namedBindings.elements.some(
            element => element.name.text === typeName
          );
          if (hasType) {
            result = node;
          }
        }
      }
    }
  });

  return result;
}

async function main() {
  const files = await glob('src/**/*.{ts,tsx}');
  const results = files.map(file => validateFile(file));
  const hasIssues = results.some(result => result.issues.length > 0);

  results.forEach(result => {
    if (result.issues.length > 0) {
      console.log(`\nIssues in ${result.file}:`);
      result.issues.forEach(issue => console.log(`  - ${issue}`));
    }
  });

  if (hasIssues) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
}); 