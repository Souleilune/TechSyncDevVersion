// backend/utils/languageBasedEvaluator.js
// Language-based code evaluation system - NO Judge0 required
// Evaluates code by checking for proper language-specific functions, keywords, and patterns

const supabase = require('../config/supabase');

/**
 * Get language-specific functions and keywords from database or predefined list
 * @param {number} languageId - Programming language ID
 * @param {string} languageName - Programming language name
 * @returns {Object} Language features (functions, keywords, patterns)
 */
async function getLanguageFeatures(languageId, languageName) {
  // Define comprehensive language features
  const languageFeatures = {
    'JavaScript': {
      functions: ['function', 'const', 'let', 'var', 'arrow', '=>', 'return', 'async', 'await'],
      keywords: ['if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'throw'],
      methods: ['map', 'filter', 'reduce', 'forEach', 'find', 'findIndex', 'some', 'every', 'includes', 'push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'concat', 'join', 'split', 'toString', 'parseInt', 'parseFloat'],
      patterns: {
        functionDeclaration: /function\s+\w+\s*\([^)]*\)/g,
        arrowFunction: /(?:const|let|var)\s+\w+\s*=\s*(?:\([^)]*\)|[^=]*)\s*=>/g,
        variableDeclaration: /(?:const|let|var)\s+\w+/g,
        conditionals: /\b(?:if|else if|else|switch)\b/g,
        loops: /\b(?:for|while|do)\b/g,
        asyncAwait: /\b(?:async|await)\b/g,
        tryCatch: /\b(?:try|catch|finally)\b/g,
        classes: /class\s+\w+/g,
        imports: /\b(?:import|require)\b/g,
        exports: /\b(?:export|module\.exports)\b/g
      },
      structures: ['array', 'object', 'class', 'module']
    },
    'Python': {
      functions: ['def', 'lambda', 'return', 'yield', 'async', 'await'],
      keywords: ['if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'import', 'from', 'as', 'pass', 'break', 'continue', 'raise'],
      methods: ['print', 'input', 'len', 'range', 'enumerate', 'zip', 'map', 'filter', 'sorted', 'reversed', 'sum', 'min', 'max', 'abs', 'round', 'isinstance', 'type', 'str', 'int', 'float', 'list', 'dict', 'tuple', 'set'],
      patterns: {
        functionDeclaration: /def\s+\w+\s*\([^)]*\)\s*:/g,
        lambdaFunction: /lambda\s+[^:]+:/g,
        classDeclaration: /class\s+\w+/g,
        conditionals: /\b(?:if|elif|else)\b/g,
        loops: /\b(?:for|while)\b/g,
        tryCatch: /\b(?:try|except|finally)\b/g,
        imports: /\b(?:import|from)\b/g,
        listComprehension: /\[[^\]]+\s+for\s+[^\]]+\]/g,
        dictComprehension: /\{[^}]+\s+for\s+[^}]+\}/g,
        decorators: /@\w+/g
      },
      structures: ['list', 'dict', 'tuple', 'set', 'class']
    },
    'Java': {
      functions: ['public', 'private', 'protected', 'static', 'void', 'return', 'class', 'interface'],
      keywords: ['if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'throws', 'new', 'this', 'super', 'extends', 'implements'],
      methods: ['System.out.println', 'System.out.print', 'Scanner', 'ArrayList', 'HashMap', 'HashSet', 'String.valueOf', 'Integer.parseInt', 'Double.parseDouble', 'Math.', 'equals', 'toString', 'length', 'size', 'add', 'remove', 'get', 'set', 'contains'],
      patterns: {
        classDeclaration: /(?:public|private|protected)?\s*class\s+\w+/g,
        methodDeclaration: /(?:public|private|protected)\s+(?:static\s+)?[\w<>\[\]]+\s+\w+\s*\([^)]*\)/g,
        mainMethod: /public\s+static\s+void\s+main\s*\(\s*String\[\]\s+\w+\s*\)/g,
        conditionals: /\b(?:if|else if|else|switch)\b/g,
        loops: /\b(?:for|while|do)\b/g,
        tryCatch: /\b(?:try|catch|finally)\b/g,
        objectCreation: /new\s+\w+\s*\(/g,
        imports: /import\s+[\w.]+/g,
        interfaces: /interface\s+\w+/g
      },
      structures: ['class', 'interface', 'enum', 'array', 'ArrayList', 'HashMap']
    },
    'C++': {
      functions: ['int', 'void', 'char', 'float', 'double', 'bool', 'return', 'class', 'struct'],
      keywords: ['if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'throw', 'new', 'delete', 'const', 'static', 'public', 'private', 'protected'],
      methods: ['cout', 'cin', 'printf', 'scanf', 'malloc', 'free', 'sizeof', 'strlen', 'strcpy', 'strcmp', 'vector', 'push_back', 'pop_back', 'size', 'clear', 'sort', 'find', 'begin', 'end'],
      patterns: {
        functionDeclaration: /(?:int|void|char|float|double|bool|string|auto)\s+\w+\s*\([^)]*\)/g,
        mainFunction: /int\s+main\s*\([^)]*\)/g,
        classDeclaration: /class\s+\w+/g,
        conditionals: /\b(?:if|else if|else|switch)\b/g,
        loops: /\b(?:for|while|do)\b/g,
        tryCatch: /\b(?:try|catch)\b/g,
        includes: /#include\s*[<"][^>"]+[>"]/g,
        namespace: /using\s+namespace\s+\w+/g,
        pointers: /\w+\s*\*\s*\w+/g,
        references: /\w+\s*&\s*\w+/g,
        templates: /template\s*<[^>]+>/g
      },
      structures: ['class', 'struct', 'array', 'vector', 'map', 'set', 'pair']
    },
    'C#': {
      functions: ['public', 'private', 'protected', 'static', 'void', 'return', 'class', 'interface', 'async', 'await'],
      keywords: ['if', 'else', 'for', 'foreach', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'base', 'using', 'namespace'],
      methods: ['Console.WriteLine', 'Console.ReadLine', 'String.Format', 'int.Parse', 'double.Parse', 'List', 'Dictionary', 'Array', 'LINQ', 'ToString', 'Add', 'Remove', 'Contains', 'Count', 'Length', 'Where', 'Select', 'FirstOrDefault'],
      patterns: {
        classDeclaration: /(?:public|private|protected)?\s*class\s+\w+/g,
        methodDeclaration: /(?:public|private|protected)\s+(?:static\s+)?(?:async\s+)?[\w<>\[\]]+\s+\w+\s*\([^)]*\)/g,
        mainMethod: /static\s+void\s+Main\s*\([^)]*\)/g,
        conditionals: /\b(?:if|else if|else|switch)\b/g,
        loops: /\b(?:for|foreach|while|do)\b/g,
        tryCatch: /\b(?:try|catch|finally)\b/g,
        asyncAwait: /\b(?:async|await)\b/g,
        usingStatements: /using\s+[\w.]+/g,
        lambdaExpression: /=>\s*(?:\{|[^;])/g,
        properties: /(?:public|private|protected)\s+\w+\s+\w+\s*\{\s*get;/g
      },
      structures: ['class', 'interface', 'struct', 'enum', 'List', 'Dictionary', 'Array']
    },
    'Go': {
      functions: ['func', 'return', 'defer', 'go', 'chan', 'interface', 'struct'],
      keywords: ['if', 'else', 'for', 'switch', 'case', 'break', 'continue', 'fallthrough', 'goto', 'range', 'select', 'var', 'const', 'type', 'import', 'package'],
      methods: ['fmt.Println', 'fmt.Printf', 'fmt.Scanf', 'len', 'cap', 'make', 'append', 'copy', 'delete', 'close', 'panic', 'recover'],
      patterns: {
        functionDeclaration: /func\s+(?:\w+\s+)?(\w+)\s*\([^)]*\)/g,
        mainFunction: /func\s+main\s*\(\s*\)/g,
        structDeclaration: /type\s+\w+\s+struct/g,
        interfaceDeclaration: /type\s+\w+\s+interface/g,
        conditionals: /\b(?:if|else if|else|switch)\b/g,
        loops: /\bfor\b/g,
        goroutines: /\bgo\b\s+\w+/g,
        channels: /\bchan\b/g,
        imports: /import\s+(?:\([\s\S]*?\)|"[^"]+")/g,
        defer: /\bdefer\b/g
      },
      structures: ['struct', 'interface', 'map', 'slice', 'array', 'channel']
    },
    'Rust': {
      functions: ['fn', 'return', 'impl', 'trait', 'struct', 'enum', 'async', 'await'],
      keywords: ['if', 'else', 'for', 'while', 'loop', 'match', 'break', 'continue', 'return', 'let', 'mut', 'const', 'use', 'mod', 'pub', 'impl', 'trait', 'struct', 'enum'],
      methods: ['println!', 'print!', 'format!', 'vec!', 'panic!', 'assert!', 'unwrap', 'expect', 'map', 'filter', 'collect', 'iter', 'push', 'pop', 'len', 'is_empty', 'to_string', 'parse', 'clone'],
      patterns: {
        functionDeclaration: /fn\s+\w+\s*(?:<[^>]+>)?\s*\([^)]*\)/g,
        mainFunction: /fn\s+main\s*\(\s*\)/g,
        structDeclaration: /struct\s+\w+/g,
        enumDeclaration: /enum\s+\w+/g,
        traitDeclaration: /trait\s+\w+/g,
        implBlock: /impl\s+(?:<[^>]+>)?\s*\w+/g,
        conditionals: /\b(?:if|else if|else|match)\b/g,
        loops: /\b(?:for|while|loop)\b/g,
        macros: /\w+!/g,
        borrowing: /&(?:mut\s+)?\w+/g,
        lifetimes: /'[a-z]/g
      },
      structures: ['struct', 'enum', 'trait', 'Vec', 'HashMap', 'Option', 'Result']
    },
    'TypeScript': {
      functions: ['function', 'const', 'let', 'var', 'arrow', '=>', 'return', 'async', 'await', 'type', 'interface'],
      keywords: ['if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'throw', 'type', 'interface', 'enum', 'namespace', 'module'],
      methods: ['console.log', 'map', 'filter', 'reduce', 'forEach', 'find', 'findIndex', 'some', 'every', 'includes', 'push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'concat', 'join', 'split'],
      patterns: {
        functionDeclaration: /function\s+\w+\s*(?:<[^>]+>)?\s*\([^)]*\)\s*:\s*\w+/g,
        arrowFunction: /(?:const|let|var)\s+\w+\s*=\s*(?:\([^)]*\)|[^=]*)\s*=>/g,
        typeAnnotation: /:\s*(?:string|number|boolean|any|unknown|void|never|object|\w+\[\]|Promise<\w+>)/g,
        interface: /interface\s+\w+/g,
        typeAlias: /type\s+\w+\s*=/g,
        genericTypes: /<[^>]+>/g,
        conditionals: /\b(?:if|else if|else|switch)\b/g,
        loops: /\b(?:for|while|do)\b/g,
        asyncAwait: /\b(?:async|await)\b/g,
        classes: /class\s+\w+/g,
        enum: /enum\s+\w+/g
      },
      structures: ['interface', 'type', 'class', 'enum', 'array', 'object', 'Promise', 'Map', 'Set']
    },
    'PHP': {
      functions: ['function', 'return', 'echo', 'print', 'class', 'interface', 'trait'],
      keywords: ['if', 'else', 'elseif', 'for', 'foreach', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'use', 'namespace', 'const'],
      methods: ['echo', 'print', 'var_dump', 'print_r', 'strlen', 'strpos', 'substr', 'str_replace', 'explode', 'implode', 'array_push', 'array_pop', 'count', 'isset', 'empty', 'is_array', 'json_encode', 'json_decode'],
      patterns: {
        phpTag: /<\?php/g,
        functionDeclaration: /function\s+\w+\s*\([^)]*\)/g,
        classDeclaration: /class\s+\w+/g,
        conditionals: /\b(?:if|elseif|else|switch)\b/g,
        loops: /\b(?:for|foreach|while|do)\b/g,
        tryCatch: /\b(?:try|catch|finally)\b/g,
        variables: /\$\w+/g,
        echoOrPrint: /\b(?:echo|print)\b/g,
        namespace: /namespace\s+[\w\\]+/g,
        use: /use\s+[\w\\]+/g
      },
      structures: ['array', 'class', 'interface', 'trait', 'namespace']
    },
    'Ruby': {
      functions: ['def', 'return', 'yield', 'lambda', 'proc', 'class', 'module'],
      keywords: ['if', 'elsif', 'else', 'unless', 'case', 'when', 'for', 'while', 'until', 'loop', 'break', 'next', 'redo', 'rescue', 'ensure', 'raise', 'begin', 'end', 'do'],
      methods: ['puts', 'print', 'p', 'gets', 'chomp', 'length', 'size', 'empty?', 'include?', 'map', 'select', 'reject', 'each', 'times', 'upto', 'downto', 'push', 'pop', 'shift', 'unshift', 'join', 'split'],
      patterns: {
        methodDefinition: /def\s+\w+(?:\([^)]*\))?/g,
        classDeclaration: /class\s+\w+/g,
        moduleDeclaration: /module\s+\w+/g,
        conditionals: /\b(?:if|elsif|else|unless|case|when)\b/g,
        loops: /\b(?:for|while|until|loop|each|times)\b/g,
        blocks: /\bdo\b|\{[^}]*\}/g,
        symbols: /:\w+/g,
        stringInterpolation: /#\{[^}]+\}/g,
        rescue: /\b(?:begin|rescue|ensure|raise)\b/g
      },
      structures: ['class', 'module', 'array', 'hash', 'symbol', 'block']
    },
    'Swift': {
      functions: ['func', 'return', 'class', 'struct', 'enum', 'protocol', 'extension', 'init'],
      keywords: ['if', 'else', 'guard', 'for', 'while', 'repeat', 'switch', 'case', 'break', 'continue', 'fallthrough', 'return', 'let', 'var', 'in', 'try', 'catch', 'throw', 'defer'],
      methods: ['print', 'Array', 'Dictionary', 'Set', 'map', 'filter', 'reduce', 'forEach', 'compactMap', 'flatMap', 'append', 'remove', 'count', 'isEmpty', 'first', 'last', 'contains'],
      patterns: {
        functionDeclaration: /func\s+\w+\s*(?:<[^>]+>)?\s*\([^)]*\)/g,
        classDeclaration: /class\s+\w+/g,
        structDeclaration: /struct\s+\w+/g,
        enumDeclaration: /enum\s+\w+/g,
        protocolDeclaration: /protocol\s+\w+/g,
        conditionals: /\b(?:if|else if|else|guard|switch)\b/g,
        loops: /\b(?:for|while|repeat)\b/g,
        optionals: /\?|\!/g,
        closures: /\{[^}]*in[^}]*\}/g,
        tryCatch: /\b(?:try|catch|throw|defer)\b/g
      },
      structures: ['class', 'struct', 'enum', 'protocol', 'extension', 'Array', 'Dictionary', 'Set', 'Optional']
    },
    'Kotlin': {
      functions: ['fun', 'return', 'class', 'interface', 'object', 'companion', 'suspend'],
      keywords: ['if', 'else', 'when', 'for', 'while', 'do', 'break', 'continue', 'return', 'val', 'var', 'in', 'is', 'as', 'try', 'catch', 'finally', 'throw'],
      methods: ['println', 'print', 'readLine', 'toInt', 'toDouble', 'toString', 'listOf', 'mutableListOf', 'mapOf', 'mutableMapOf', 'setOf', 'mutableSetOf', 'map', 'filter', 'forEach', 'any', 'all', 'none', 'first', 'last', 'size'],
      patterns: {
        functionDeclaration: /fun\s+(?:<[^>]+>)?\s*\w+\s*\([^)]*\)/g,
        classDeclaration: /(?:class|data class|sealed class)\s+\w+/g,
        objectDeclaration: /object\s+\w+/g,
        conditionals: /\b(?:if|else if|else|when)\b/g,
        loops: /\b(?:for|while|do)\b/g,
        tryCatch: /\b(?:try|catch|finally)\b/g,
        nullSafety: /\?\.|\?\:/g,
        lambdas: /\{[^}]*->[^}]*\}/g,
        extensionFunction: /fun\s+\w+\.\w+/g,
        coroutines: /\b(?:suspend|launch|async|await)\b/g
      },
      structures: ['class', 'data class', 'interface', 'object', 'List', 'Map', 'Set', 'Array']
    },
    'C': {
      functions: ['int', 'void', 'char', 'float', 'double', 'return', 'struct', 'union', 'typedef'],
      keywords: ['if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'goto', 'return', 'const', 'static', 'extern', 'register', 'auto', 'sizeof'],
      methods: ['printf', 'scanf', 'malloc', 'calloc', 'realloc', 'free', 'strlen', 'strcpy', 'strcmp', 'strcat', 'memcpy', 'memset', 'fopen', 'fclose', 'fprintf', 'fscanf', 'fgets', 'fputs'],
      patterns: {
        functionDeclaration: /(?:int|void|char|float|double|struct\s+\w+|\w+\*)\s+\w+\s*\([^)]*\)/g,
        mainFunction: /int\s+main\s*\([^)]*\)/g,
        structDeclaration: /struct\s+\w+\s*\{/g,
        conditionals: /\b(?:if|else if|else|switch)\b/g,
        loops: /\b(?:for|while|do)\b/g,
        includes: /#include\s*[<"][^>"]+[>"]/g,
        define: /#define\s+\w+/g,
        pointers: /\w+\s*\*+\s*\w+/g,
        arrays: /\w+\s+\w+\s*\[[^\]]*\]/g
      },
      structures: ['struct', 'union', 'enum', 'array', 'pointer']
    }
  };

  // Return features for the specified language
  const normalizedName = languageName || 'JavaScript';
  return languageFeatures[normalizedName] || languageFeatures['JavaScript'];
}

/**
 * Evaluate code submission based on language-specific features
 * @param {string} submittedCode - User's code submission
 * @param {Object} challenge - Challenge details
 * @param {Object} project - Project details
 * @returns {Object} Evaluation result
 */
async function evaluateCodeWithLanguageFeatures(submittedCode, challenge, project) {
  try {
    const code = String(submittedCode || '').trim();
    
    // Get language information
    const languageName = challenge?.programming_languages?.name || 
                        project?.project_languages?.find(pl => pl.is_primary)?.programming_languages?.name || 
                        'JavaScript';
    
    const languageId = challenge?.programming_language_id || 
                      project?.project_languages?.find(pl => pl.is_primary)?.language_id || 
                      null;

    console.log('🔍 Evaluating code with language features:', {
      languageName,
      languageId,
      codeLength: code.length
    });

    // Get language features
    const features = await getLanguageFeatures(languageId, languageName);
    
    // Initialize scoring variables
    let score = 0;
    const maxScore = 100;
    const details = {
      languageName,
      hasFunction: false,
      hasLogic: false,
      hasComments: false,
      properStructure: false,
      languageMatch: false,
      complexity: 0,
      foundFeatures: [],
      missingFeatures: [],
      patternMatches: {}
    };

    // 1. Minimum length check (5 points)
    if (code.length >= 20) {
      score += 5;
      details.foundFeatures.push('Adequate code length');
    } else {
      details.missingFeatures.push('Code is too short');
    }

    // 2. Check for language-specific functions (20 points)
    let functionCount = 0;
    for (const func of features.functions) {
      const regex = new RegExp(`\\b${func}\\b`, 'gi');
      if (regex.test(code)) {
        functionCount++;
        details.foundFeatures.push(`Uses '${func}'`);
      }
    }
    if (functionCount > 0) {
      score += Math.min(20, functionCount * 4);
      details.hasFunction = true;
    } else {
      details.missingFeatures.push('No language-specific functions found');
    }

    // 3. Check for keywords and control structures (25 points)
    let keywordCount = 0;
    for (const keyword of features.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      if (regex.test(code)) {
        keywordCount++;
      }
    }
    if (keywordCount > 0) {
      score += Math.min(25, keywordCount * 3);
      details.hasLogic = true;
      details.foundFeatures.push(`Uses ${keywordCount} control structure(s)`);
    } else {
      details.missingFeatures.push('No control structures (if/for/while)');
    }

    // 4. Check for common methods (15 points)
    let methodCount = 0;
    for (const method of features.methods) {
      const regex = new RegExp(method.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      if (regex.test(code)) {
        methodCount++;
      }
    }
    if (methodCount > 0) {
      score += Math.min(15, methodCount * 3);
      details.foundFeatures.push(`Uses ${methodCount} built-in method(s)`);
    }

    // 5. Check for advanced patterns (20 points)
    let patternScore = 0;
    for (const [patternName, pattern] of Object.entries(features.patterns)) {
      const matches = code.match(pattern);
      if (matches && matches.length > 0) {
        patternScore += 3;
        details.patternMatches[patternName] = matches.length;
        details.foundFeatures.push(`Uses ${patternName} (${matches.length}x)`);
      }
    }
    score += Math.min(20, patternScore);
    details.properStructure = patternScore > 0;

    // 6. Check for comments (5 points)
    const commentPatterns = [
      /\/\/.*/g,              // Single line comments (// C-style)
      /\/\*[\s\S]*?\*\//g,    // Multi-line comments (/* C-style */)
      /#.*/g,                 // Hash comments (# Python/Ruby)
      /""".+?"""/gs,          // Python docstrings
      /'''.+?'''/gs,          // Python docstrings
      /<!--[\s\S]*?-->/g      // HTML comments
    ];
    
    let hasComments = false;
    for (const pattern of commentPatterns) {
      if (pattern.test(code)) {
        hasComments = true;
        break;
      }
    }
    
    if (hasComments) {
      score += 5;
      details.hasComments = true;
      details.foundFeatures.push('Includes comments');
    }

    // 7. Complexity analysis (10 points)
    const complexityIndicators = [
      { pattern: /\bclass\b/gi, weight: 3, name: 'classes' },
      { pattern: /\binterface\b/gi, weight: 2, name: 'interfaces' },
      { pattern: /\basync\b/gi, weight: 2, name: 'async operations' },
      { pattern: /\btry\b/gi, weight: 2, name: 'error handling' },
      { pattern: /\bimport\b|\brequire\b|\buse\b/gi, weight: 1, name: 'imports' },
      { pattern: /\breturn\b/gi, weight: 1, name: 'return statements' }
    ];

    let complexityScore = 0;
    for (const indicator of complexityIndicators) {
      const matches = code.match(indicator.pattern);
      if (matches) {
        complexityScore += matches.length * indicator.weight;
        details.complexity += matches.length;
      }
    }
    score += Math.min(10, Math.floor(complexityScore / 2));

    // 8. Code organization bonus (5 points)
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 10 && lines.length < 500) {
      score += 5;
      details.foundFeatures.push('Well-organized code structure');
    }

    // Ensure score doesn't exceed maximum
    score = Math.min(maxScore, Math.round(score));

    // Determine if passed (70% threshold)
    const passed = score >= 70;
    const status = passed ? 'passed' : 'completed';

    // Generate detailed feedback
    let feedback = generateFeedback(score, details, languageName);

    // Add difficulty-based encouragement
    if (challenge?.difficulty_level === 'hard' || challenge?.difficulty_level === 'expert') {
      feedback += ' This is a challenging problem - great effort tackling it!';
    }

    console.log('✅ Language-based evaluation complete:', {
      score,
      passed,
      foundFeatures: details.foundFeatures.length,
      missingFeatures: details.missingFeatures.length
    });

    return {
      score,
      passed,
      status,
      feedback,
      details,
      evaluation: {
        score,
        feedback,
        details,
        usedLanguageFeatures: true,
        languageName
      }
    };

  } catch (error) {
    console.error('❌ Language-based evaluation error:', error);
    
    // Fallback to basic evaluation
    return {
      score: 50,
      passed: false,
      status: 'completed',
      feedback: 'Code submitted but could not be fully evaluated. Please review your solution.',
      details: {
        error: error.message
      },
      evaluation: {
        score: 50,
        feedback: 'Evaluation error occurred',
        usedLanguageFeatures: false
      }
    };
  }
}

/**
 * Generate detailed feedback based on score and code analysis
 * @param {number} score - Calculated score
 * @param {Object} details - Analysis details
 * @param {string} languageName - Programming language
 * @returns {string} Feedback message
 */
function generateFeedback(score, details, languageName) {
  let feedback = '';

  if (score >= 90) {
    feedback = `🎉 Excellent work! Your ${languageName} code demonstrates exceptional programming skills and best practices.`;
  } else if (score >= 80) {
    feedback = `🌟 Great job! Your ${languageName} code shows strong understanding and good structure.`;
  } else if (score >= 70) {
    feedback = `👍 Good effort! Your ${languageName} code demonstrates solid programming fundamentals.`;
  } else if (score >= 60) {
    feedback = `💪 Nice try! Your ${languageName} solution shows promise.`;
  } else if (score >= 40) {
    feedback = `📚 Keep practicing! Your ${languageName} code needs more structure.`;
  } else {
    feedback = `🌱 Good start! Focus on using ${languageName} functions and control structures.`;
  }

  // Add specific suggestions
  if (details.missingFeatures.length > 0) {
    feedback += '\n\n💡 Suggestions:';
    details.missingFeatures.slice(0, 3).forEach(missing => {
      feedback += `\n• ${missing}`;
    });
  }

  // Highlight strengths
  if (details.foundFeatures.length > 3) {
    feedback += '\n\n✨ Strengths:';
    details.foundFeatures.slice(0, 3).forEach(feature => {
      feedback += `\n• ${feature}`;
    });
  }

  return feedback;
}

module.exports = {
  evaluateCodeWithLanguageFeatures,
  getLanguageFeatures
};