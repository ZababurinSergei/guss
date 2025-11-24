#!/usr/bin/env node

import { buildProject, createProjectConfig } from './build.config.mjs'

const args = process.argv.slice(2)
const projectName = args[0]
const watchMode = args.includes('--watch')

async function main() {
    if (!projectName) {
        console.log('Usage: node build.js <project-name> [--watch]')
        console.log('')
        console.log('Available projects:')
        console.log('  chat      - Chat application')
        console.log('  youtube   - YouTube integration')
        console.log('  database  - Database management')
        console.log('  wysiwyg   - WYSIWYG editor')
        console.log('  guss      - Guss project')
        console.log('')
        console.log('Examples:')
        console.log('  node build.js chat')
        console.log('  node build.js chat --watch')
        process.exit(1)
    }

    const config = createProjectConfig(projectName)

    if (!config) {
        console.error(`❌ Project "${projectName}" not found`)
        process.exit(1)
    }

    config.watch = watchMode

    try {
        if (watchMode) {
            console.log(`👀 Starting watch build for ${projectName}...`)
            console.log(`   Press Ctrl+C to stop watching`)
        } else {
            console.log(`🔨 Starting build for ${projectName}...`)
        }

        await buildProject(config)

        if (!watchMode) {
            console.log(`✅ Build completed successfully for ${projectName}`)
        }
    } catch (error) {
        console.error(`❌ Build failed for ${projectName}:`, error.message)
        process.exit(1)
    }
}

// Обработка Ctrl+C
process.on('SIGINT', () => {
    console.log('\n👋 Build process stopped')
    process.exit(0)
})

main().catch(error => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
})