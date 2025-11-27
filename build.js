#!/usr/bin/env node

import { buildProject, createProjectConfig } from './build.config.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Функция для рекурсивного удаления директории
async function removeDirectory(dirPath) {
    try {
        const stats = await fs.promises.stat(dirPath)
        if (stats.isDirectory()) {
            const files = await fs.promises.readdir(dirPath)

            // Рекурсивно удаляем все содержимое
            for (const file of files) {
                const filePath = path.join(dirPath, file)
                await removeDirectory(filePath)
            }

            // Удаляем саму директорию
            await fs.promises.rmdir(dirPath)
            console.log(`🗑️ Удалена директория: ${path.basename(dirPath)}`)
        } else {
            // Удаляем файл
            await fs.promises.unlink(dirPath)
            console.log(`🗑️ Удален файл: ${path.basename(dirPath)}`)
        }
    } catch (error) {
        console.error(`❌ Ошибка удаления ${dirPath}:`, error.message)
        throw error
    }
}

// Функция для очистки каталога public
async function cleanPublicDirectory(projectName) {
    const publicDir = path.join(__dirname, 'packages', 'public')

    try {
        if (fs.existsSync(publicDir)) {
            // Создаем backup оригинального index.html если он существует
            const originalIndexPath = path.join(__dirname, 'packages', 'frontend', 'src', 'index.html')
            const backupIndexPath = path.join(__dirname, 'packages', 'frontend', 'src', 'index.html.backup')

            if (fs.existsSync(originalIndexPath)) {
                // Создаем backup
                await fs.promises.copyFile(originalIndexPath, backupIndexPath)
                console.log(`📁 Backup создан: ${backupIndexPath}`)
            }

            // Очищаем public directory рекурсивно
            const items = await fs.promises.readdir(publicDir)

            for (const item of items) {
                const itemPath = path.join(publicDir, item)
                await removeDirectory(itemPath)
            }

            console.log(`✅ Каталог public очищен`)
        } else {
            // Создаем каталог public если он не существует
            await fs.promises.mkdir(publicDir, { recursive: true })
            console.log(`📁 Каталог public создан`)
        }
    } catch (error) {
        console.error(`❌ Ошибка очистки каталога public:`, error)
        throw error
    }
}

// Функция для копирования index.html в public
async function copyIndexHtmlToPublic(projectName) {
    try {
        const sourceIndexPath = path.join(__dirname, 'packages', 'frontend', 'src', 'index.html')
        const destIndexPath = path.join(__dirname, 'packages', 'public', 'index.html')

        if (!fs.existsSync(sourceIndexPath)) {
            throw new Error(`Исходный index.html не найден: ${sourceIndexPath}`)
        }

        // Создаем директорию public если не существует
        const publicDir = path.dirname(destIndexPath)
        if (!fs.existsSync(publicDir)) {
            await fs.promises.mkdir(publicDir, { recursive: true })
        }

        // Копируем index.html
        await fs.promises.copyFile(sourceIndexPath, destIndexPath)
        console.log(`📄 index.html скопирован в public`)

        // Восстанавливаем оригинальный index.html из backup если он существует
        const backupIndexPath = path.join(__dirname, 'packages', 'frontend', 'src', 'index.html.backup')
        if (fs.existsSync(backupIndexPath)) {
            await fs.promises.copyFile(backupIndexPath, sourceIndexPath)
            await fs.promises.unlink(backupIndexPath)
            console.log(`📁 Оригинальный index.html восстановлен`)
        }

        return true
    } catch (error) {
        console.error(`❌ Ошибка копирования index.html:`, error)

        // Пытаемся восстановить оригинальный файл в случае ошибки
        try {
            const backupIndexPath = path.join(__dirname, 'packages', 'frontend', 'src', 'index.html.backup')
            const sourceIndexPath = path.join(__dirname, 'packages', 'frontend', 'src', 'index.html')

            if (fs.existsSync(backupIndexPath)) {
                await fs.promises.copyFile(backupIndexPath, sourceIndexPath)
                await fs.promises.unlink(backupIndexPath)
                console.log(`🔧 Оригинальный index.html восстановлен после ошибки`)
            }
        } catch (restoreError) {
            console.error(`❌ Ошибка восстановления оригинального index.html:`, restoreError)
        }

        throw error
    }
}

// Функция для подготовки к сборке
async function prepareForBuild(projectName) {
    console.log(`🔧 Подготовка к сборке проекта ${projectName}...`)

    try {
        // Очищаем каталог public
        await cleanPublicDirectory(projectName)

        // Копируем index.html в public
        await copyIndexHtmlToPublic(projectName)

        console.log(`✅ Подготовка к сборке завершена`)
        return true
    } catch (error) {
        console.error(`❌ Ошибка подготовки к сборке:`, error)
        throw error
    }
}

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

        // Подготавливаем проект к сборке
        await prepareForBuild(projectName)

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