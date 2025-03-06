// CommonJS version of the validation script
const glob = require('glob');
const ts = require('typescript');
const fs = require('fs');

// Add a test warning
console.log("Validation script running in CommonJS mode");

function validateFile(filePath) {
  const issues = [];
  const warnings = [];
  const sourceFile = ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  );

  function visit(node) {
    // Check for API calls without validation
    if (ts.isCallExpression(node) && 
        ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.name) &&
        node.expression.name.text === 'json') {
      const parent = node.parent;
      if (parent && ts.isAwaitExpression(parent)) {
        if (!isApiResponseValidated(parent, sourceFile)) {
          // Get line and column information
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          
          // Get a code snippet for context
          const startPos = Math.max(0, node.getStart() - 25);
          const endPos = Math.min(sourceFile.text.length, node.getEnd() + 25);
          const codeSnippet = sourceFile.text.substring(startPos, endPos).trim();
          
          const methodName = findContainingMethod(node);
          let suggestion = "validate with an appropriate schema";
          
          // Add specific suggestions based on method name
          if (methodName) {
            if (methodName.includes('getForm') && !methodName.includes('getFormResponses') && !methodName.includes('getFormAnalytics')) {
              suggestion = "Use validateForm(data) to validate form data";
            } else if (methodName.includes('Response')) {
              suggestion = "Use z.array(formResponseSchema).parse(data) to validate responses";
            } else if (methodName.includes('Analytics')) {
              suggestion = "Use validateFormAnalytics(data) to validate analytics data";
            }
          }
          
          warnings.push(`API response at ${filePath}:${line+1}:${character+1} is not validated: "${codeSnippet}". Suggestion: ${suggestion}`);
        }
      }
    }

    // Check for direct type usage instead of Zod-derived types
    if (ts.isTypeReferenceNode(node)) {
      const typeName = node.typeName.getText();
      if (['Form', 'User', 'FormResponse', 'FormAnalytics'].includes(typeName)) {
        const importDecl = findImportDeclaration(sourceFile, typeName);
        if (importDecl && importDecl.moduleSpecifier && 
            ts.isStringLiteral(importDecl.moduleSpecifier) && 
            !importDecl.moduleSpecifier.text.includes('schemas')) {
          issues.push(`Type ${typeName} should be imported from schemas`);
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return { file: filePath, issues, warnings };
}

function isValidated(node) {
  // Check direct validation call
  if (ts.isCallExpression(node)) {
    const callName = node.expression.getText();
    return callName.includes('validate') || 
           callName.includes('parse') || 
           callName.includes('schema') || 
           callName.includes('apiErrorSchema');
  }
  
  // Check if it's a property access that ends with a validation call
  if (ts.isPropertyAccessExpression(node) && node.parent && ts.isCallExpression(node.parent)) {
    return isValidated(node.parent);
  }
  
  // Check if it's a variable declaration with validation
  if (ts.isVariableDeclaration(node) && node.initializer && ts.isCallExpression(node.initializer)) {
    return isValidated(node.initializer);
  }
  
  // Check for validateApiResponse and validateApiResponseWithProperty calls
  if (ts.isAwaitExpression(node) && node.expression && ts.isCallExpression(node.expression)) {
    const callName = node.expression.expression.getText();
    return callName.includes('validateApiResponse');
  }
  
  // Check for return statements with validation
  if (ts.isReturnStatement(node) && node.expression) {
    if (ts.isCallExpression(node.expression) || ts.isAwaitExpression(node.expression)) {
      return isValidated(node.expression);
    }
  }
  
  return false;
}

function findImportDeclaration(sourceFile, typeName) {
  let result;
  
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

function findContainingMethod(node) {
  let current = node;
  while (current && current.parent) {
    if (ts.isMethodDeclaration(current) && current.name) {
      return current.name.getText();
    } else if (ts.isFunctionDeclaration(current) && current.name) {
      return current.name.getText();
    } else if (ts.isArrowFunction(current) && current.parent && ts.isVariableDeclaration(current.parent) && current.parent.name) {
      return current.parent.name.getText();
    }
    current = current.parent;
  }
  return undefined;
}

function isApiResponseValidated(node, sourceFile) {
  // Special case for utility functions - validation.ts and api/index.ts don't need validation
  const containingFile = sourceFile.fileName;
  if (containingFile.includes('validation.ts') || containingFile.includes('api/index.ts')) {
    return true;
  }
  
  // If the parent or grandparent calls validateApiResponse or validateApiResponseWithProperty
  let current = node;
  for (let i = 0; i < 4 && current; i++) { // Check up to 4 levels up
    if (ts.isCallExpression(current)) {
      const callName = current.expression.getText();
      if (callName.includes('validateApiResponse')) {
        return true;
      }
    }
    current = current.parent;
  }
  
  // Check if the node is part of a return statement that returns a validated result
  current = node;
  while (current && !ts.isBlock(current)) {
    if (ts.isReturnStatement(current)) {
      const expr = current.expression;
      if (expr && (
          (ts.isCallExpression(expr) && expr.expression.getText().includes('validate')) ||
          (ts.isAwaitExpression(expr) && ts.isCallExpression(expr.expression) && 
           expr.expression.expression.getText().includes('validateApiResponse'))
      )) {
        return true;
      }
    }
    current = current.parent;
  }
  
  // If no special case, use the normal validation check
  return isValidated(node);
}

async function main() {
  try {
    const files = await glob.glob('src/**/*.{ts,tsx}');
    const results = files.map(file => validateFile(file));
    const hasIssues = results.some(result => result.issues.length > 0);

    results.forEach(result => {
      if (result.issues.length > 0) {
        console.log(`\nIssues in ${result.file}:`);
        result.issues.forEach(issue => console.log(`  - ${issue}`));
      }
      
      if (result.warnings.length > 0) {
        console.log(`\nWarnings in ${result.file}:`);
        result.warnings.forEach(warning => console.log(`  - ${warning}`));
      }
    });

    if (hasIssues) {
      process.exit(1);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main(); 