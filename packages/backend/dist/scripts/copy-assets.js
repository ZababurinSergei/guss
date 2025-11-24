import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) return;

    const stats = fs.statSync(src);

    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        const files = fs.readdirSync(src);
        files.forEach(file => {
            copyRecursive(path.join(src, file), path.join(dest, file));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

// Копируем package.json и другие необходимые файлы
const filesToCopy = [
    'package.json',
    'config'
];

filesToCopy.forEach(file => {
    const srcPath = path.join(__dirname, '..', file);
    const destPath = path.join(__dirname, '..', 'dist', file);

    if (fs.existsSync(srcPath)) {
        console.log(`Copying ${file} to dist...`);
        copyRecursive(srcPath, destPath);
    }
});