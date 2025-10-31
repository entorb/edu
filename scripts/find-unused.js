#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import readline from 'readline'

/**
 * Recursively extract all translation keys from the TEXT_DE object
 */
function extractTranslationKeys(obj, prefix = '') {
  const keys = []

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively extract nested keys
      keys.push(...extractTranslationKeys(value, fullKey))
    } else {
      // Leaf node - this is a translation key
      keys.push({
        key,
        fullKey,
        type: 'translation'
      })
    }
  }

  return keys
}

/**
 * Extract exported constants from a TypeScript file
 */
function extractConstants(filePath, appName) {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const constants = []

  // Match: export const CONSTANT_NAME = ...
  const exportRegex = /export const\s+([A-Z_][A-Z0-9_]*)\s*=/g
  let match

  while ((match = exportRegex.exec(fileContent)) !== null) {
    const name = match[1]
    // Skip BASE_PATH and STATS_DB_COL as they're special
    if (name !== 'BASE_PATH' && name !== 'STATS_DB_COL') {
      constants.push({
        key: name,
        fullKey: name,
        type: 'constant',
        app: appName,
        file: filePath
      })
    }
  }

  // Also match re-exports: export { ... } from '@flashcards/shared'
  const reexportRegex = /export\s*{\s*([^}]+)\s*}\s*from/g
  while ((match = reexportRegex.exec(fileContent)) !== null) {
    const reexports = match[1].split(',').map(item => {
      const parts = item.trim().split(/\s+as\s+/)
      return parts[parts.length - 1] // Get the exported name
    })

    for (const name of reexports) {
      if (name && name !== 'BASE_PATH' && name !== 'STATS_DB_COL') {
        constants.push({
          key: name,
          fullKey: name,
          type: 'constant',
          app: appName,
          file: filePath
        })
      }
    }
  }

  return constants
}

/**
 * Extract words from cspell-words.txt
 */
function extractCspellWords(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const words = fileContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(word => ({
      key: word,
      fullKey: word,
      type: 'spellword',
      file: filePath
    }))

  return words
}

/**
 * Extract CSS/SCSS class names from style files and Vue <style> blocks
 */
function extractCSSClasses(dirPath, ignore = []) {
  const classes = []
  const styleFiles = findFiles(dirPath, ['css', 'scss', 'sass'], ignore)
  const vueFiles = findFiles(dirPath, ['vue'], ignore)
  const skipPatterns = ['quasar', 'bootstrap', 'animate']

  // Helper function to extract classes from CSS content
  function extractFromCSSContent(content, file) {
    // Match: .classname { or .classname,
    // Handles: .class-name, .className, .class_name
    const classRegex = /\.([a-zA-Z_][\w-]*)\s*[{,]/g
    let match

    while ((match = classRegex.exec(content)) !== null) {
      const className = match[1]

      // Skip common utility/framework classes and pseudo-selectors
      if (
        !className.match(
          /^(w-|h-|p-|m-|text-|bg-|border-|flex|grid|hidden|block|inline|absolute|relative|fixed|sticky|container|row|col|col-|breakpoint-|before|after|first|last|hover|active|focus|disabled)/
        )
      ) {
        classes.push({
          key: className,
          fullKey: className,
          type: 'cssclass',
          file
        })
      }
    }
  }

  // Extract from standalone CSS/SCSS/SASS files
  for (const file of styleFiles) {
    // Skip framework/library files
    if (skipPatterns.some(pattern => file.includes(pattern))) {
      continue
    }

    try {
      const content = fs.readFileSync(file, 'utf-8')
      extractFromCSSContent(content, file)
    } catch {
      continue
    }
  }

  // Extract from Vue file <style> blocks
  for (const file of vueFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8')

      // Extract content between <style> tags
      const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
      let match

      while ((match = styleRegex.exec(content)) !== null) {
        const styleContent = match[1]
        extractFromCSSContent(styleContent, file)
      }
    } catch {
      continue
    }
  }

  // Remove duplicates
  const seen = new Set()
  return classes.filter(c => {
    if (seen.has(c.fullKey)) return false
    seen.add(c.fullKey)
    return true
  })
}

/**
 * Extract exported functions from TypeScript/JavaScript files
 */
function extractExportedFunctions(dirPath, ignore = []) {
  const functions = []
  const sourceFiles = findFiles(dirPath, ['ts', 'js'], ignore) // Only .ts and .js, not .vue
  const ignorePatterns = ['dist', '.cache', '.test', '.spec']

  for (const file of sourceFiles) {
    // Skip test files and build artifacts
    if (ignorePatterns.some(pattern => file.includes(pattern))) {
      continue
    }

    try {
      const content = fs.readFileSync(file, 'utf-8')

      // Match: export function name(...) - only actual function declarations
      const functionRegex = /export\s+(?:async\s+)?function\s+([a-zA-Z_$][\w$]*)\s*\(/g
      let match

      while ((match = functionRegex.exec(content)) !== null) {
        const functionName = match[1]

        // Skip common patterns that are not actual functions
        if (!functionName.match(/^(computed|ref|watch|provide|inject|use|get|set)/i)) {
          functions.push({
            key: functionName,
            fullKey: functionName,
            type: 'function',
            file
          })
        }
      }
    } catch {
      continue
    }
  }

  // Remove duplicates
  const seen = new Set()
  return functions.filter(f => {
    const key = `${f.key}:${f.file}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Parse .gitignore patterns and return normalized ignore list
 */
function parseGitignore(gitignorePath) {
  const ignorePatterns = []

  try {
    const content = fs.readFileSync(gitignorePath, 'utf-8')
    const lines = content.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue
      }
      // Skip negation patterns (we're building an ignore list)
      if (trimmed.startsWith('!')) {
        continue
      }
      // Remove trailing slash for directory patterns
      const pattern = trimmed.replace(/\/$/, '')
      ignorePatterns.push(pattern)
    }
  } catch {
    // If .gitignore doesn't exist, return empty
  }

  return ignorePatterns
}

/**
 * Check if a path matches any gitignore pattern
 */
function shouldIgnorePath(filePath, ignorePatterns) {
  const relativePath = filePath.replace(process.cwd(), '').replace(/^\//, '')

  for (const pattern of ignorePatterns) {
    // Handle wildcard patterns like *.tsbuildinfo
    if (pattern.includes('*')) {
      const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*')
      const regex = new RegExp(`(^|/)${regexPattern}($|/)`)
      if (regex.test(relativePath)) {
        return true
      }
    } else {
      // Exact path matching
      if (relativePath.includes(pattern)) {
        return true
      }
    }
  }

  return false
}

/**
 * Recursively find all files in a directory
 */
function findFiles(dir, extensions = ['ts', 'vue', 'js'], ignorePatterns = []) {
  const files = []

  function traverse(currentPath) {
    let entries = []
    try {
      entries = fs.readdirSync(currentPath, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name)

      // Skip ignored paths (from .gitignore)
      if (shouldIgnorePath(fullPath, ignorePatterns)) {
        continue
      }

      if (entry.isDirectory()) {
        traverse(fullPath)
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).slice(1)
        if (extensions.includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  }

  traverse(dir)
  return files
}

/**
 * Search for usage of a translation key in the codebase
 */
function findKeyUsage(key, files) {
  // Build multiple patterns to catch different access patterns:
  // TEXT_DE.voc.cards.export
  // TEXT_DE['voc']['cards']['export']
  // TEXT_DE['voc'].cards['export']

  const parts = key.split('.')

  const patterns = [
    // Dot notation: TEXT_DE.voc.cards.export
    new RegExp(`TEXT_DE\\.${key.replace(/\./g, '\\.')}\\b`),
    // Bracket notation with various combinations
    new RegExp(`TEXT_DE\\['${parts[0]}'\\]\\['${parts[1]}'\\]`),
    new RegExp(`TEXT_DE\\['${parts[0]}'\\]\\.${parts[1]}`),
    new RegExp(`TEXT_DE\\.${parts[0]}\\['${parts[1]}'\\]`)
  ]

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8')
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          return true
        }
      }
    } catch {
      continue
    }
  }

  return false
}

/**
 * Search for usage of a constant in the codebase
 */
function findConstantUsage(constantName, files, excludeFile = null) {
  // Match: CONSTANT_NAME (as word boundary)
  const pattern = new RegExp(`\\b${constantName}\\b`)

  for (const file of files) {
    // Skip the constants file itself
    if (excludeFile && file === excludeFile) {
      continue
    }

    try {
      const content = fs.readFileSync(file, 'utf-8')
      if (pattern.test(content)) {
        return true
      }
    } catch {
      continue
    }
  }

  return false
}

/**
 * Search for usage of a cspell word in the codebase
 * Words can appear anywhere: in text, comments, strings, camelCase, etc.
 */
function findSpellWordUsage(word, files, cspellFile) {
  // Create a case-insensitive pattern to match the word
  // Match: word boundaries OR within camelCase (preceded/followed by non-letter)
  // This handles: "word", "Word", "oneWord", "wordOne", "oneWordTwo", etc.
  const pattern = new RegExp(word, 'i')

  for (const file of files) {
    // Skip the cspell-words.txt file itself
    if (file === cspellFile) {
      continue
    }

    try {
      const content = fs.readFileSync(file, 'utf-8')
      if (pattern.test(content)) {
        return true
      }
    } catch {
      continue
    }
  }

  return false
}

/**
 * Search for usage of a CSS class in the codebase
 */
function findCSSClassUsage(className, files, styleFile) {
  // Match: class="...classname..." or :class="...classname..." or :class="{ 'classname': ... }"
  // Also match: @apply classname or use of .classname in CSS
  const patterns = [
    // Simple class attribute: class="classname" or class='classname'
    new RegExp(`class\\s*=\\s*[\"'][^\"']*\\b${className}\\b[^\"']*[\"']`),
    // Dynamic class binding with string: :class="classname" or :class='classname'
    new RegExp(`:class\\s*=\\s*[\"'][^\"']*\\b${className}\\b[^\"']*[\"']`),
    // Dynamic class binding with object: :class="{ 'classname': condition }" with quotes
    new RegExp(`:class\\s*=\\s*[\"']\\{[^}]*[\\'\"]${className}[\\'\"][^}]*\\}`),
    // Dynamic class binding with object: :class="{ classname: condition }" without quotes
    new RegExp(`:class\\s*=\\s*[\"']\\{[^}]*\\b${className}\\b[^}]*\\}`),
    // CSS @apply
    new RegExp(`@apply\\s+.*\\b${className}\\b`),
    // Direct CSS reference: .classname
    new RegExp(`\\.${className}\\b`)
  ]

  for (const file of files) {
    try {
      let content = fs.readFileSync(file, 'utf-8')

      // If this is the style file (Vue file), only search the template/script, not the style block
      if (file === styleFile) {
        // Remove the <style> block to avoid matching the class definition itself
        content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      }

      for (const pattern of patterns) {
        if (pattern.test(content)) {
          return true
        }
      }
    } catch {
      continue
    }
  }

  return false
}

/**
 * Remove comments from code to avoid false positives
 */
function stripComments(content) {
  let result = content

  // Remove single-line comments (// ...)
  result = result.replace(/\/\/.*$/gm, '')

  // Remove multi-line comments (/* ... */)
  result = result.replace(/\/\*[\s\S]*?\*\//g, '')

  // Remove HTML comments (<!-- ... -->)
  result = result.replace(/<!--[\s\S]*?-->/g, '')

  return result
}

/**
 * Search for usage of an exported function in the codebase
 */
function findFunctionUsage(functionName, files, sourceFile) {
  // Match function usage in any context (calls, callbacks, imports, etc)
  const patterns = [
    // Function call: functionName() or functionName ()
    new RegExp(`\\b${functionName}\\s*\\(`),
    // Callback usage: functionName passed as argument (not followed by opening paren of that function)
    new RegExp(`[,([\\s=]${functionName}(?=[,)\\]\\s;:])`),
    // Import/export reference
    new RegExp(`(?:import|export)\\s*.*\\b${functionName}\\b`),
    // As property: .functionName
    new RegExp(`\\.${functionName}\\b`),
    // Generic word boundary match (catches any other usage as a standalone identifier)
    new RegExp(`\\b${functionName}\\b(?!\\s*:)`) // Exclude object keys like { functionName: ... }
  ]

  // Pattern to match the function declaration (to exclude it from usage check)
  const declarationPattern = new RegExp(
    `^\\s*export\\s+(?:async\\s+)?function\\s+${functionName}\\s*\\(`,
    'm'
  )

  for (const file of files) {
    try {
      let content = fs.readFileSync(file, 'utf-8')
      // Strip comments to avoid false positives
      content = stripComments(content)

      // If this is the source file, remove the function declaration line
      if (file === sourceFile) {
        content = content.replace(declarationPattern, '')
      }

      for (const pattern of patterns) {
        if (pattern.test(content)) {
          return true
        }
      }
    } catch {
      continue
    }
  }

  return false
}

/**
 * Search for all usage of a key and return file paths
 */
function findKeyUsageFiles(key, files, searchType = 'translation') {
  let patterns = []

  if (searchType === 'translation') {
    const parts = key.split('.')
    patterns = [
      new RegExp(`TEXT_DE\\.${key.replace(/\./g, '\\.')}\\b`),
      new RegExp(`TEXT_DE\\['${parts[0]}'\\]\\['${parts[1]}'\\]`),
      new RegExp(`TEXT_DE\\['${parts[0]}'\\]\\.${parts[1]}`),
      new RegExp(`TEXT_DE\\.${parts[0]}\\['${parts[1]}'\\]`)
    ]
  } else if (searchType === 'constant') {
    patterns = [new RegExp(`\\b${key}\\b`)]
  }

  const matchingFiles = []
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8')
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          matchingFiles.push(file)
          break
        }
      }
    } catch {
      continue
    }
  }

  return matchingFiles
}

/**
 * Prompt user for confirmation
 */
function promptConfirmation(message) {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question(`${message} (y/N): `, answer => {
      rl.close()
      resolve(answer.toLowerCase() === 'y')
    })
  })
}

/**
 * Remove unused translation keys from TEXT_DE
 */
function cleanupTranslations(textFile, unusedKeys) {
  let fileContent = fs.readFileSync(textFile, 'utf-8')

  for (const key of unusedKeys) {
    // Build pattern to match: TEXT_DE.key or "key": value pattern
    const keyParts = key.fullKey.split('.')
    const lastKey = keyParts[keyParts.length - 1]

    // Remove the line with this key: "key": ...
    // This regex matches the key and its value across multiple lines if needed
    const pattern = new RegExp(`^\\s*${lastKey}:\\s*[^,}]+(?:,\\n)?`, 'm')
    fileContent = fileContent.replace(pattern, '')
  }

  fs.writeFileSync(textFile, fileContent, 'utf-8')
}

/**
 * Remove unused constants from constants file
 */
function cleanupConstants(constantsFile, unusedConstants) {
  let fileContent = fs.readFileSync(constantsFile, 'utf-8')

  for (const constant of unusedConstants) {
    // Remove the export const line: export const NAME = ...
    const pattern = new RegExp(`^export const ${constant.key}\\s*=.*?$`, 'm')
    fileContent = fileContent.replace(pattern, '')
  }

  // Clean up multiple blank lines
  fileContent = fileContent.replace(/\n\n\n+/g, '\n\n')

  fs.writeFileSync(constantsFile, fileContent, 'utf-8')
}

/**
 * Remove unused cspell words
 */
function cleanupCspellWords(cspellFile, unusedWords) {
  const words = fs.readFileSync(cspellFile, 'utf-8').split('\n')

  const unusedWordSet = new Set(unusedWords.map(w => w.key))
  const cleanedWords = words.filter(word => !unusedWordSet.has(word.trim()))

  fs.writeFileSync(cspellFile, cleanedWords.join('\n'), 'utf-8')
}

/**
 * Remove unused CSS classes
 */
function cleanupCSSClasses(styleFile, unusedClasses) {
  let fileContent = fs.readFileSync(styleFile, 'utf-8')

  for (const cssClass of unusedClasses) {
    // Remove the entire class definition: .classname { ... }
    const pattern = new RegExp(`\\.${cssClass.key}\\s*\\{[^}]*\\}`, 'g')
    fileContent = fileContent.replace(pattern, '')
  }

  // Clean up multiple blank lines
  fileContent = fileContent.replace(/\n\n\n+/g, '\n\n')

  fs.writeFileSync(styleFile, fileContent, 'utf-8')
}

/**
 * Print information
 */
function printInfo() {
  console.log(`
🔍 Scanning for unused translations, constants, cspell words, styles, and functions...
`)
}

/**
 * Main function
 */
async function main() {
  const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
  const textFile = path.join(projectRoot, 'packages/shared/src/text-de.ts')
  const constants1x1File = path.join(projectRoot, 'apps/1x1/src/constants.ts')
  const constantsVocFile = path.join(projectRoot, 'apps/voc/src/constants.ts')
  const cspellFile = path.join(projectRoot, 'cspell-words.txt')
  const sourceDir = projectRoot

  printInfo()

  // Parse .gitignore and use its patterns
  const gitignorePatterns = parseGitignore(path.join(projectRoot, '.gitignore'))
  const files = findFiles(sourceDir, ['ts', 'vue', 'js', 'md'], gitignorePatterns)
  console.log(`📂 Scanning ${files.length} files...\n`)

  // ============================================
  // TRANSLATIONS
  // ============================================
  let allAssets = []
  let usedCount = 0
  let unusedCount = 0

  console.log('🔍 Checking translations...')
  if (!fs.existsSync(textFile)) {
    console.error(`❌ Text file not found: ${textFile}`)
  } else {
    const fileContent = fs.readFileSync(textFile, 'utf-8')
    const textDeMatch = fileContent.match(/export const TEXT_DE = \{([\s\S]*?)\} as const/)

    if (!textDeMatch) {
      console.error('❌ Could not parse TEXT_DE object')
    } else {
      let textDe
      try {
        textDe = new Function(`return {${textDeMatch[1]}}`)()
        const keys = extractTranslationKeys(textDe)
        console.log(`  ✅ Found ${keys.length} translation keys`)

        for (const key of keys) {
          const isUsed = findKeyUsage(key.fullKey, files)
          if (!isUsed) {
            allAssets.push(key)
          } else {
            usedCount++
          }
        }
      } catch (error) {
        console.error('❌ Error parsing TEXT_DE object:', error.message)
      }
    }
  }

  // ============================================
  // CONSTANTS
  // ============================================
  console.log('🔍 Checking constants...')

  for (const [appName, constantsFile] of [
    ['1x1', constants1x1File],
    ['voc', constantsVocFile]
  ]) {
    if (fs.existsSync(constantsFile)) {
      const constants = extractConstants(constantsFile, appName)
      console.log(`  ✅ Found ${constants.length} constants in ${appName}`)

      for (const constant of constants) {
        const isUsed = findConstantUsage(constant.key, files, constantsFile)
        if (!isUsed) {
          allAssets.push(constant)
        } else {
          usedCount++
        }
      }
    }
  }

  // ============================================
  // CSPELL WORDS
  // ============================================
  console.log('🔍 Checking cspell words...')
  if (fs.existsSync(cspellFile)) {
    const words = extractCspellWords(cspellFile)
    console.log(`  ✅ Found ${words.length} cspell words`)

    for (const word of words) {
      const isUsed = findSpellWordUsage(word.key, files, cspellFile)
      if (!isUsed) {
        allAssets.push(word)
      } else {
        usedCount++
      }
    }
  }

  // ============================================
  // CSS CLASSES
  // ============================================
  console.log('🔍 Checking CSS classes...')
  const cssClasses = extractCSSClasses(sourceDir, gitignorePatterns)
  console.log(`  ✅ Found ${cssClasses.length} CSS classes`)

  for (const cssClass of cssClasses) {
    const isUsed = findCSSClassUsage(cssClass.key, files, cssClass.file)
    if (!isUsed) {
      allAssets.push(cssClass)
    } else {
      usedCount++
    }
  }

  // ============================================
  // EXPORTED FUNCTIONS
  // ============================================
  console.log('🔍 Checking exported functions...')
  const functions = extractExportedFunctions(sourceDir, gitignorePatterns)
  console.log(`  ✅ Found ${functions.length} exported functions\n`)

  for (const func of functions) {
    const isUsed = findFunctionUsage(func.key, files, func.file)
    if (!isUsed) {
      allAssets.push(func)
    } else {
      usedCount++
    }
  }

  // ============================================
  // RESULTS
  // ============================================
  unusedCount = allAssets.length

  if (unusedCount === 0) {
    console.log('✅ All assets are being used!')
  } else {
    console.log(`⚠️  Found ${unusedCount} unused assets:\n`)
    console.log('-------------------------------------------')

    // Group by type
    const assetsByType = {}
    for (const asset of allAssets) {
      if (!assetsByType[asset.type]) {
        assetsByType[asset.type] = []
      }
      assetsByType[asset.type].push(asset)
    }

    const typeOrder = ['translation', 'constant', 'spellword', 'cssclass', 'function']
    for (const type of typeOrder) {
      if (!assetsByType[type]) continue

      const displayName =
        type === 'translation'
          ? 'Translations'
          : type === 'constant'
            ? 'Constants'
            : type === 'spellword'
              ? 'Cspell Words'
              : type === 'cssclass'
                ? 'CSS Classes'
                : 'Exported Functions'
      console.log(`\n${displayName}:`)

      const sortedAssets = assetsByType[type].sort((a, b) => a.fullKey.localeCompare(b.fullKey))

      for (const asset of sortedAssets) {
        let prefix = ''
        if (asset.type === 'translation') {
          prefix = 'TEXT_DE.'
        } else if (asset.type === 'constant') {
          prefix = `[${asset.app}] `
        } else if (asset.type === 'cssclass') {
          prefix = '.'
        } else if (asset.type === 'function') {
          prefix = '👁️ '
        }

        console.log(`  ${prefix}${asset.fullKey}`)
      }
    }

    console.log('\n-------------------------------------------')
    console.log(`\n📊 Summary:`)
    console.log(`  Used assets: ${usedCount}`)
    console.log(`  Unused assets: ${unusedCount}`)
    console.log(`  Total: ${usedCount + unusedCount}`)

    if (assetsByType['translation']) {
      console.log(`\n  Translations: ${assetsByType['translation'].length} unused`)
    }
    if (assetsByType['constant']) {
      console.log(`  Constants: ${assetsByType['constant'].length} unused`)
    }
    if (assetsByType['spellword']) {
      console.log(`  Cspell words: ${assetsByType['spellword'].length} unused`)
    }
    if (assetsByType['cssclass']) {
      console.log(`  CSS classes: ${assetsByType['cssclass'].length} unused`)
    }
    if (assetsByType['function']) {
      console.log(`  Exported functions: ${assetsByType['function'].length} unused (ℹ️ view-only)`)
    }

    // ============================================
    // PROMPT FOR CLEANUP
    // ============================================
    console.log('\n-------------------------------------------')

    const shouldCleanup = await promptConfirmation(
      '\n❓ Do you want to clean up these unused assets?'
    )

    if (shouldCleanup) {
      console.log('\n🧹 Cleaning up...\n')
      console.log('The following assets will be REMOVED:\n')

      // Only cleanup these types - functions are view-only
      const typeOrder = ['translation', 'constant', 'spellword', 'cssclass']
      for (const type of typeOrder) {
        if (!assetsByType[type]) continue
        const displayName =
          type === 'translation'
            ? 'Translations'
            : type === 'constant'
              ? 'Constants'
              : type === 'spellword'
                ? 'Cspell Words'
                : 'CSS Classes'
        console.log(`${displayName}: ${assetsByType[type].length}`)
        for (const asset of assetsByType[type].slice(0, 3)) {
          let prefix = ''
          if (asset.type === 'translation') {
            prefix = 'TEXT_DE.'
          } else if (asset.type === 'constant') {
            prefix = `[${asset.app}] `
          } else if (asset.type === 'cssclass') {
            prefix = '.'
          }
          console.log(`  • ${prefix}${asset.fullKey}`)
        }
        if (assetsByType[type].length > 3) {
          console.log(`  ... and ${assetsByType[type].length - 3} more`)
        }
      }

      if (assetsByType['function']) {
        console.log(
          `\n⚠️  ${assetsByType['function'].length} unused functions found (view-only - not cleaned up)`
        )
      }

      // Cleanup translations
      if (assetsByType['translation']) {
        try {
          cleanupTranslations(textFile, assetsByType['translation'])
          console.log(`✅ Removed ${assetsByType['translation'].length} translation keys`)
        } catch (error) {
          console.error(`❌ Error cleaning up translations: ${error.message}`)
        }
      }

      // Cleanup constants
      const constantsByFile = {}
      if (assetsByType['constant']) {
        for (const constant of assetsByType['constant']) {
          if (!constantsByFile[constant.file]) {
            constantsByFile[constant.file] = []
          }
          constantsByFile[constant.file].push(constant)
        }

        for (const [file, constants] of Object.entries(constantsByFile)) {
          try {
            cleanupConstants(file, constants)
            console.log(
              `✅ Removed ${constants.length} constants from ${path.relative(projectRoot, file)}`
            )
          } catch (error) {
            console.error(`❌ Error cleaning up constants: ${error.message}`)
          }
        }
      }

      // Cleanup cspell words
      if (assetsByType['spellword']) {
        try {
          cleanupCspellWords(cspellFile, assetsByType['spellword'])
          console.log(`✅ Removed ${assetsByType['spellword'].length} cspell words`)
        } catch (error) {
          console.error(`❌ Error cleaning up cspell words: ${error.message}`)
        }
      }

      // Cleanup CSS classes
      const cssClassesByFile = {}
      if (assetsByType['cssclass']) {
        for (const cssClass of assetsByType['cssclass']) {
          if (!cssClassesByFile[cssClass.file]) {
            cssClassesByFile[cssClass.file] = []
          }
          cssClassesByFile[cssClass.file].push(cssClass)
        }

        for (const [file, classes] of Object.entries(cssClassesByFile)) {
          try {
            cleanupCSSClasses(file, classes)
            console.log(
              `✅ Removed ${classes.length} CSS classes from ${path.relative(projectRoot, file)}`
            )
          } catch (error) {
            console.error(`❌ Error cleaning up CSS classes: ${error.message}`)
          }
        }
      }

      console.log('\n🎉 Cleanup complete!')
    } else {
      console.log('\n❌ Cleanup cancelled.')
    }
  }
}

await main()
