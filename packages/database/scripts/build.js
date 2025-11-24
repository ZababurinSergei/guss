import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) return;

    const stats = fs.statSync(src);

    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        const files = fs.readdirSync(src);
        for (const file of files) {
            await copyRecursive(path.join(src, file), path.join(dest, file));
        }
    } else {
        fs.copyFileSync(src, dest);
    }
}

function fixImports(filePath) {
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    const dirPath = path.dirname(filePath);

    let fixedContent = content;

    // Регулярное выражение для поиска импортов
    const importRegex = /from\s+['"]([^'"]+)['"]/g;
    let match;
    const importsToFix = [];

    // Находим все импорты
    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];

        // Пропускаем абсолютные пути и npm пакеты
        if (importPath.startsWith('.') || importPath.startsWith('/')) {
            importsToFix.push(importPath);
        }
    }

    // Исправляем каждый импорт
    for (const importPath of importsToFix) {
        const fullImportPath = path.resolve(dirPath, importPath);

        // Проверяем, существует ли файл или папка
        let resolvedPath = null;

        // Проверяем файл с расширением .js
        if (fs.existsSync(fullImportPath + '.js')) {
            resolvedPath = importPath + '.js';
        }
        // Проверяем папку с index.js
        else if (fs.existsSync(fullImportPath) && fs.statSync(fullImportPath).isDirectory()) {
            if (fs.existsSync(path.join(fullImportPath, 'index.js'))) {
                resolvedPath = importPath + '/index.js';
            }
        }
        // Проверяем файл без расширения (уже скомпилированный .js)
        else if (fs.existsSync(fullImportPath) && fs.statSync(fullImportPath).isFile()) {
            // Уже правильный путь
            continue;
        }

        // Если нашли правильный путь, заменяем импорт
        if (resolvedPath) {
            fixedContent = fixedContent.replace(
                new RegExp(`from\\s+['"]${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
                `from '${resolvedPath}'`
            );
        }
    }

    if (content !== fixedContent) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        console.log(`🔧 Fixed imports in ${path.relative(process.cwd(), filePath)}`);
    }
}

function processDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;

    const items = fs.readdirSync(dirPath);

    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (item.endsWith('.js') && !item.endsWith('.d.ts')) {
            fixImports(fullPath);
        }
    }
}

function createIndexFiles(dirPath) {
    if (!fs.existsSync(dirPath)) return;

    const items = fs.readdirSync(dirPath);
    const jsFiles = items.filter(item =>
        item.endsWith('.js') &&
        !item.endsWith('.d.ts') &&
        item !== 'index.js'
    );

    // Если в директории есть .js файлы и нет index.js, создаем его
    if (jsFiles.length > 0 && !items.includes('index.js')) {
        const exportStatements = jsFiles.map(file => {
            const baseName = path.basename(file, '.js');
            return `export { ${baseName} } from './${baseName}.js';`;
        }).join('\n');

        const indexContent = `// Auto-generated index file\n${exportStatements}\n`;
        fs.writeFileSync(path.join(dirPath, 'index.js'), indexContent, 'utf8');
        console.log(`📄 Created index.js in ${path.relative(process.cwd(), dirPath)}`);
    }

    // Рекурсивно обрабатываем поддиректории
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        if (fs.statSync(fullPath).isDirectory()) {
            createIndexFiles(fullPath);
        }
    }
}

async function build() {
    try {
        // Очищаем dist директорию
        const distPath = path.join(__dirname, '..', 'dist');
        if (fs.existsSync(distPath)) {
            console.log('🧹 Cleaning dist directory...');
            fs.rmSync(distPath, { recursive: true, force: true });
        }

        // Компилируем TypeScript с composite mode
        console.log('🔨 Compiling TypeScript with composite mode...');
        execSync('npx tsc --build', {
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit'
        });

        // Создаем index.js файлы для директорий
        console.log('📄 Creating index files...');
        createIndexFiles(distPath);

        // Исправляем импорты в скомпилированных JS файлах
        console.log('🔧 Fixing imports in compiled files...');
        processDirectory(distPath);

        // Копируем необходимые файлы и директории
        console.log('📁 Copying configuration files...');

        const itemsToCopy = [
            'package.json'
        ];

        for (const item of itemsToCopy) {
            const srcPath = path.join(__dirname, '..', item);
            const destPath = path.join(__dirname, '..', 'dist', item);

            if (fs.existsSync(srcPath)) {
                await copyRecursive(srcPath, destPath);
                console.log(`✅ Copied ${item}`);
            } else {
                console.log(`⚠️  ${item} not found, skipping`);
            }
        }

        // Копируем скрипты
        console.log('📜 Copying scripts...');
        const scriptsSrc = path.join(__dirname, '..', 'scripts');
        const scriptsDest = path.join(__dirname, '..', 'dist', 'scripts');

        if (fs.existsSync(scriptsSrc)) {
            await copyRecursive(scriptsSrc, scriptsDest);
            console.log('✅ Scripts copied');
        }

        // Проверяем структуру dist
        console.log('📊 Checking dist structure...');
        const checkPaths = [
            'dist/index.js',
            'dist/config/database.js',
            'dist/models/index.js',
            'dist/types/index.js'
        ];

        for (const checkPath of checkPaths) {
            const fullPath = path.join(__dirname, '..', checkPath);
            if (fs.existsSync(fullPath)) {
                console.log(`✅ ${checkPath} exists`);
            } else {
                console.log(`❌ ${checkPath} missing`);
            }
        }

        console.log('🎉 Database build completed successfully!');
        console.log('📁 Dist structure:');

        function printTree(dir, prefix = '') {
            const items = fs.readdirSync(dir);
            items.forEach((item, index) => {
                const fullPath = path.join(dir, item);
                const isLast = index === items.length - 1;
                const connector = isLast ? '└── ' : '├── ';

                console.log(prefix + connector + item);

                if (fs.statSync(fullPath).isDirectory()) {
                    const newPrefix = prefix + (isLast ? '    ' : '│   ');
                    printTree(fullPath, newPrefix);
                }
            });
        }

        if (fs.existsSync(distPath)) {
            printTree(distPath);
        }

    } catch (error) {
        console.error('❌ Database build failed:', error.message);
        process.exit(1);
    }
}

build();