const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const render = require('./render');

const forbiddenDirs = ['node_modules'];
class Runner {
    constructor() {
        this.testFiles = [];
    }

    async runTests() {
        for (let file of this.testFiles) {
            console.log(chalk.gray(` ---- ${file.shortName}`));
            const beforeEaches = [];
            // Exposing global variables
            global.render = render;
            global.beforeEach = fn => {
                beforeEaches.push(fn);
            }
            global.it = async (desc, fn) => {
                beforeEaches.forEach(fn => fn());
                try {
                    await fn();
                    console.log(chalk.green(`\tOK - ${desc}`));
                } catch (error) {
                    const message = error.message.replace(/\n/g, '\n\t\t');
                    console.log(chalk.red(`\tX - ${desc}`));
                    console.log(chalk.red('\t', message));
                }

            }
            try {
                require(file.name);
            } catch (error) {
                console.log(chalk.red('\t', error));
            }

        }
    }
    async collectFiles(targetPath) {
        const files = await fs.promises.readdir(targetPath);
        for (let file of files) {
            const filePath = path.join(targetPath, file);
            const stats = await fs.promises.lstat(filePath);
            if (stats.isFile() && file.includes('.test.js')) {
                this.testFiles.push({
                    name: filePath,
                    shortName: file
                });
            } else if (stats.isDirectory() && !forbiddenDirs.includes(file)) {
                const childFiles = await fs.promises.readdir(filePath);
                files.push(...childFiles.map(f => path.join(file, f)));
            }
        }
    }
}

module.exports = Runner;