#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

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
        fullKey
      })
    }
  }

  return keys
}

/**
 * Recursively find all files in a directory
 */
function findFiles(dir, extensions = ['ts', 'vue', 'js'], ignore = []) {
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

      // Skip ignored directories
      if (ignore.some(pattern => fullPath.includes(pattern))) {
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
 * Search for all usage of a translation key and return file paths
 */
function findKeyUsageFiles(key, files) {
  const parts = key.split('.')

  const patterns = [
    // Dot notation: TEXT_DE.voc.cards.export
    new RegExp(`TEXT_DE\\.${key.replace(/\./g, '\\.')}\\b`),
    // Bracket notation with various combinations
    new RegExp(`TEXT_DE\\['${parts[0]}'\\]\\['${parts[1]}'\\]`),
    new RegExp(`TEXT_DE\\['${parts[0]}'\\]\\.${parts[1]}`),
    new RegExp(`TEXT_DE\\.${parts[0]}\\['${parts[1]}'\\]`)
  ]

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
 * Print usage information
 */
function printHelp() {
  console.log(`
Usage: pnpm find-unused-translations [OPTIONS]

Options:
  -v, --verbose    Show which files use each unused key
  -h, --help       Show this help message
`)
}

/**
 * Main function
 */
function main() {
  if (process.argv.includes('-h') || process.argv.includes('--help')) {
    printHelp()
    process.exit(0)
  }

  const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
  const textFile = path.join(projectRoot, 'packages/shared/src/text-de.ts')
  const sourceDir = projectRoot
  const verbose = process.argv.includes('--verbose') || process.argv.includes('-v')

  if (!fs.existsSync(textFile)) {
    console.error(`❌ Text file not found: ${textFile}`)
    process.exit(1)
  }

  console.log('📖 Reading translation file...')
  const fileContent = fs.readFileSync(textFile, 'utf-8')

  // Extract the TEXT_DE object using regex
  const textDeMatch = fileContent.match(/export const TEXT_DE = \{([\s\S]*?)\} as const/)
  if (!textDeMatch) {
    console.error('❌ Could not parse TEXT_DE object')
    process.exit(1)
  }

  let textDe

  try {
    // Using Function constructor to safely evaluate the object
    textDe = new Function(`return {${textDeMatch[1]}}`)()
  } catch (error) {
    console.error('❌ Error parsing TEXT_DE object:', error.message)
    process.exit(1)
  }

  const keys = extractTranslationKeys(textDe)
  console.log(`✅ Found ${keys.length} translation keys\n`)

  const ignore = ['node_modules', 'dist', '.git', 'scripts', '.cache']
  const files = findFiles(sourceDir, ['ts', 'vue', 'js'], ignore)
  console.log(`📂 Scanning ${files.length} files...\n`)

  const unusedKeys = []
  const usedKeys = []

  console.log('🔍 Searching for usage...')
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const isUsed = findKeyUsage(key.fullKey, files)

    if (!isUsed) {
      unusedKeys.push(key)
    } else {
      usedKeys.push(key)
    }

    // Progress indicator
    if ((i + 1) % 10 === 0) {
      process.stdout.write(`\r${i + 1}/${keys.length}`)
    }
  }

  console.log(`\r${keys.length}/${keys.length}\n`)

  if (unusedKeys.length === 0) {
    console.log('✅ All translation keys are being used!')
  } else {
    console.log(`⚠️  Found ${unusedKeys.length} unused translation keys:\n`)
    console.log('-------------------------------------------')

    const keysBySection = {}
    for (const key of unusedKeys) {
      const section = key.fullKey.split('.')[0]
      if (!keysBySection[section]) {
        keysBySection[section] = []
      }
      keysBySection[section].push(key)
    }

    for (const [section, sectionKeys] of Object.entries(keysBySection).sort()) {
      console.log(`\n${section}:`)
      for (const key of sectionKeys.sort((a, b) => a.fullKey.localeCompare(b.fullKey))) {
        if (verbose) {
          const usageFiles = findKeyUsageFiles(key.fullKey, files)
          console.log(`  TEXT_DE.${key.fullKey}`)
          if (usageFiles.length > 0) {
            usageFiles.forEach(f => console.log(`    → ${path.relative(projectRoot, f)}`))
          }
        } else {
          console.log(`  TEXT_DE.${key.fullKey}`)
        }
      }
    }

    console.log('\n-------------------------------------------')
    console.log(`\n📊 Summary:`)
    console.log(`  Used keys: ${usedKeys.length}`)
    console.log(`  Unused keys: ${unusedKeys.length}`)
    console.log(`  Total: ${keys.length}`)
  }
}

main()
