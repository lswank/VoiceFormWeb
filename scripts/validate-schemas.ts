import { glob } from 'glob';
import { readFile } from 'fs/promises';
import typescript from 'typescript';

interface ValidationResult {
  file: string;
  issues: string[];
}

async function validateFile(filePath: string): Promise<ValidationResult> {
  const issues: string[] = [];
  const sourceFile = typescript.createSourceFile(
    filePath,
    await readFile(filePath, 'utf8'),
    typescript.ScriptTarget.Latest,
    true
  );

  function visit(node: typescript.Node) {
    // Check for API calls without validation
    if (typescript.isCallExpression(node) && 
        typescript.isPropertyAccessExpression(node.expression) &&
        typescript.isIdentifier(node.expression.name) &&
        node.expression.name.text === 'json') {
      const parent = node.parent;
      if (parent && typescript.isAwaitExpression(parent)) {
        const grandParent = parent.parent;
        if (grandParent && !isValidated(grandParent)) {
          issues.push(`API response at ${node.getStart()} is not validated`);
        }
      }
    }

    // Check for direct type usage instead of Zod-derived types
    if (typescript.isTypeReferenceNode(node)) {
      const typeName = node.typeName.getText();
      if (['Form', 'User', 'FormResponse', 'FormAnalytics'].includes(typeName)) {
        const importDecl = findImportDeclaration(sourceFile, typeName);
        if (importDecl && typescript.isStringLiteral(importDecl.moduleSpecifier) && !importDecl.moduleSpecifier.text.includes('schemas')) {
          issues.push(`Type ${typeName} should be imported from schemas`);
        }
      }
    }

    typescript.forEachChild(node, visit);
  }

  visit(sourceFile);
  return { file: filePath, issues };
}

function isValidated(node: typescript.Node): boolean {
  if (typescript.isCallExpression(node)) {
    const callName = node.expression.getText();
    return callName.includes('validate') || callName.includes('parse');
  }
  return false;
}

function findImportDeclaration(sourceFile: typescript.SourceFile, typeName: string): typescript.ImportDeclaration | undefined {
  let result: typescript.ImportDeclaration | undefined;
  
  typescript.forEachChild(sourceFile, node => {
    if (typescript.isImportDeclaration(node)) {
      const importClause = node.importClause;
      if (importClause && importClause.namedBindings) {
        if (typescript.isNamedImports(importClause.namedBindings)) {
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
  const results = await Promise.all(files.map(file => validateFile(file)));
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