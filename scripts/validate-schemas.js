"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var glob_1 = require("glob");
var ts = require("typescript");
var fs = require("fs");
function validateFile(filePath) {
    var issues = [];
    var warnings = [];
    var sourceFile = ts.createSourceFile(filePath, fs.readFileSync(filePath, 'utf8'), ts.ScriptTarget.Latest, true);
    function visit(node) {
        // Check for API calls without validation
        if (ts.isCallExpression(node) &&
            ts.isPropertyAccessExpression(node.expression) &&
            ts.isIdentifier(node.expression.name) &&
            node.expression.name.text === 'json') {
            var parent_1 = node.parent;
            if (parent_1 && ts.isAwaitExpression(parent_1)) {
                if (!isApiResponseValidated(parent_1, sourceFile)) {
                    // Get line and column information
                    var _a = sourceFile.getLineAndCharacterOfPosition(node.getStart()), line = _a.line, character = _a.character;
                    // Get a code snippet for context
                    var startPos = Math.max(0, node.getStart() - 25);
                    var endPos = Math.min(sourceFile.text.length, node.getEnd() + 25);
                    var codeSnippet = sourceFile.text.substring(startPos, endPos).trim();
                    var methodName = findContainingMethod(node);
                    var suggestion = "validate with an appropriate schema";
                    // Add specific suggestions based on method name
                    if (methodName) {
                        if (methodName.includes('getForm') && !methodName.includes('getFormResponses') && !methodName.includes('getFormAnalytics')) {
                            suggestion = "Use validateForm(data) to validate form data";
                        }
                        else if (methodName.includes('Response')) {
                            suggestion = "Use z.array(formResponseSchema).parse(data) to validate responses";
                        }
                        else if (methodName.includes('Analytics')) {
                            suggestion = "Use validateFormAnalytics(data) to validate analytics data";
                        }
                    }
                    warnings.push("API response at ".concat(filePath, ":").concat(line + 1, ":").concat(character + 1, " is not validated: \"").concat(codeSnippet, "\". Suggestion: ").concat(suggestion));
                }
            }
        }
        // Check for direct type usage instead of Zod-derived types
        if (ts.isTypeReferenceNode(node)) {
            var typeName = node.typeName.getText();
            if (['Form', 'User', 'FormResponse', 'FormAnalytics'].includes(typeName)) {
                var importDecl = findImportDeclaration(sourceFile, typeName);
                if (importDecl && importDecl.moduleSpecifier &&
                    ts.isStringLiteral(importDecl.moduleSpecifier) &&
                    !importDecl.moduleSpecifier.text.includes('schemas')) {
                    issues.push("Type ".concat(typeName, " should be imported from schemas"));
                }
            }
        }
        ts.forEachChild(node, visit);
    }
    visit(sourceFile);
    return { file: filePath, issues: issues, warnings: warnings };
}
function isValidated(node) {
    // Check direct validation call
    if (ts.isCallExpression(node)) {
        var callName = node.expression.getText();
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
        var callName = node.expression.expression.getText();
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
    var result;
    ts.forEachChild(sourceFile, function (node) {
        if (ts.isImportDeclaration(node)) {
            var importClause = node.importClause;
            if (importClause && importClause.namedBindings) {
                if (ts.isNamedImports(importClause.namedBindings)) {
                    var hasType = importClause.namedBindings.elements.some(function (element) { return element.name.text === typeName; });
                    if (hasType) {
                        result = node;
                    }
                }
            }
        }
    });
    return result;
}
function getApiPath(node) {
    var current = node;
    while (current && current.parent) {
        if (ts.isCallExpression(current.parent) &&
            ts.isIdentifier(current.parent.expression) &&
            current.parent.expression.text === 'fetch') {
            // Found the fetch call, extract the URL path
            if (current.parent.arguments.length > 0) {
                var urlArg = current.parent.arguments[0];
                if (ts.isTemplateExpression(urlArg)) {
                    return urlArg.getText();
                }
                else if (ts.isStringLiteral(urlArg)) {
                    return urlArg.text;
                }
            }
        }
        current = current.parent;
    }
    return undefined;
}
function findContainingMethod(node) {
    var current = node;
    while (current && current.parent) {
        if (ts.isMethodDeclaration(current) && current.name) {
            return current.name.getText();
        }
        else if (ts.isFunctionDeclaration(current) && current.name) {
            return current.name.getText();
        }
        else if (ts.isArrowFunction(current) && current.parent && ts.isVariableDeclaration(current.parent) && current.parent.name) {
            return current.parent.name.getText();
        }
        current = current.parent;
    }
    return undefined;
}
function isApiResponseValidated(node, sourceFile) {
    // Special case for utility functions - validation.ts and api/index.ts don't need validation
    var containingFile = sourceFile.fileName;
    if (containingFile.includes('validation.ts') || containingFile.includes('api/index.ts')) {
        return true;
    }
    // If the parent or grandparent calls validateApiResponse or validateApiResponseWithProperty
    var current = node;
    for (var i = 0; i < 4 && current; i++) { // Check up to 4 levels up
        if (ts.isCallExpression(current)) {
            var callName = current.expression.getText();
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
            var expr = current.expression;
            if (expr && ((ts.isCallExpression(expr) && expr.expression.getText().includes('validate')) ||
                (ts.isAwaitExpression(expr) && ts.isCallExpression(expr.expression) &&
                    expr.expression.expression.getText().includes('validateApiResponse')))) {
                return true;
            }
        }
        current = current.parent;
    }
    // If no special case, use the normal validation check
    return isValidated(node);
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var files, results, hasIssues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, glob_1.glob)('src/**/*.{ts,tsx}')];
                case 1:
                    files = _a.sent();
                    results = files.map(function (file) { return validateFile(file); });
                    hasIssues = results.some(function (result) { return result.issues.length > 0; });
                    results.forEach(function (result) {
                        if (result.issues.length > 0) {
                            console.log("\nIssues in ".concat(result.file, ":"));
                            result.issues.forEach(function (issue) { return console.log("  - ".concat(issue)); });
                        }
                        if (result.warnings.length > 0) {
                            console.log("\nWarnings in ".concat(result.file, ":"));
                            result.warnings.forEach(function (warning) { return console.log("  - ".concat(warning)); });
                        }
                    });
                    if (hasIssues) {
                        process.exit(1);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error(error);
    process.exit(1);
});
