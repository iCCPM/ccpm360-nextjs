#!/usr/bin/env node

/**
 * 依赖检查工具
 * 验证所有import的包都在package.json中声明
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';

class DependencyChecker {
  constructor() {
    this.packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    this.allDeps = {
      ...this.packageJson.dependencies,
      ...this.packageJson.devDependencies,
    };
    this.missingDeps = new Set();
    this.unusedDeps = new Set(Object.keys(this.allDeps));
    this.errors = [];
  }

  /**
   * 检查文件中的import语句
   */
  checkFileImports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // 匹配各种import语句
      const importPatterns = [
        /import.*from\s+['"]([^'"]+)['"]/g,
        /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
        /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      ];

      importPatterns.forEach((pattern) => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const importPath = match[1];
          this.validateImport(importPath, filePath);
        }
      });
    } catch (error) {
      this.errors.push(`Error reading file ${filePath}: ${error.message}`);
    }
  }

  /**
   * 验证单个import路径
   */
  validateImport(importPath, filePath) {
    // 跳过相对路径和绝对路径
    if (importPath.startsWith('.') || importPath.startsWith('/')) {
      return;
    }

    // 跳过TypeScript路径别名
    if (importPath.startsWith('@/')) {
      return;
    }

    // 跳过Node.js内置模块
    const builtinModules = [
      'fs',
      'fs/promises',
      'path',
      'http',
      'https',
      'url',
      'crypto',
      'os',
      'util',
      'events',
      'stream',
      'buffer',
      'querystring',
      'zlib',
      'child_process',
      'assert',
      'cluster',
      'dgram',
      'dns',
      'domain',
      'module',
      'net',
      'punycode',
      'readline',
      'repl',
      'string_decoder',
      'timers',
      'tls',
      'tty',
      'v8',
      'vm',
      'worker_threads',
    ];
    if (builtinModules.includes(importPath)) {
      return;
    }

    // 获取包名（处理scoped packages）
    const packageName = this.getPackageName(importPath);

    // 检查是否在依赖中声明
    if (this.allDeps[packageName]) {
      this.unusedDeps.delete(packageName);
    } else {
      this.missingDeps.add(packageName);
    }
  }

  /**
   * 从import路径中提取包名
   */
  getPackageName(importPath) {
    if (importPath.startsWith('@')) {
      // Scoped package: @scope/package/subpath -> @scope/package
      const parts = importPath.split('/');
      return `${parts[0]}/${parts[1]}`;
    } else {
      // Regular package: package/subpath -> package
      return importPath.split('/')[0];
    }
  }

  /**
   * 扫描所有源文件
   */
  async scanFiles() {
    console.log(chalk.blue('🔍 扫描项目文件...'));

    const patterns = [
      'src/**/*.{ts,tsx,js,jsx}',
      'pages/**/*.{ts,tsx,js,jsx}',
      'components/**/*.{ts,tsx,js,jsx}',
      'lib/**/*.{ts,tsx,js,jsx}',
      'utils/**/*.{ts,tsx,js,jsx}',
      '*.{ts,tsx,js,jsx}',
    ];

    const files = [];
    for (const pattern of patterns) {
      try {
        const matchedFiles = await glob(pattern, {
          ignore: ['node_modules/**', '.next/**', 'dist/**'],
        });
        files.push(...matchedFiles);
      } catch (error) {
        // 忽略不存在的目录
      }
    }

    const uniqueFiles = [...new Set(files)];
    console.log(chalk.gray(`找到 ${uniqueFiles.length} 个文件`));

    uniqueFiles.forEach((file) => {
      this.checkFileImports(file);
    });
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log('\n' + chalk.bold('📊 依赖检查报告'));
    console.log('=' + '='.repeat(50));

    // 缺失的依赖
    if (this.missingDeps.size > 0) {
      console.log('\n' + chalk.red.bold('❌ 缺失的依赖:'));
      this.missingDeps.forEach((dep) => {
        console.log(chalk.red(`  - ${dep}`));
      });
      console.log(chalk.yellow('\n💡 修复建议:'));
      console.log(
        chalk.yellow(`npm install ${[...this.missingDeps].join(' ')}`)
      );
    } else {
      console.log('\n' + chalk.green('✅ 所有依赖都已正确声明'));
    }

    // 可能未使用的依赖
    if (this.unusedDeps.size > 0) {
      console.log('\n' + chalk.yellow.bold('⚠️  可能未使用的依赖:'));
      this.unusedDeps.forEach((dep) => {
        console.log(chalk.yellow(`  - ${dep}`));
      });
      console.log(
        chalk.gray('\n💡 注意: 这些依赖可能在配置文件或其他地方使用')
      );
    }

    // 错误信息
    if (this.errors.length > 0) {
      console.log('\n' + chalk.red.bold('🚨 扫描错误:'));
      this.errors.forEach((error) => {
        console.log(chalk.red(`  - ${error}`));
      });
    }

    console.log('\n' + '='.repeat(52));

    return this.missingDeps.size === 0 && this.errors.length === 0;
  }

  /**
   * 运行完整检查
   */
  async run() {
    console.log(chalk.blue.bold('🔍 CCPM360 依赖完整性检查'));
    console.log(chalk.gray('检查所有import的包是否在package.json中声明\n'));

    await this.scanFiles();
    const success = this.generateReport();

    if (success) {
      console.log(chalk.green.bold('\n✅ 依赖检查通过!'));
      process.exit(0);
    } else {
      console.log(chalk.red.bold('\n❌ 依赖检查失败!'));
      process.exit(1);
    }
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new DependencyChecker();
  checker.run().catch((error) => {
    console.error(chalk.red('检查过程中发生错误:'), error);
    process.exit(1);
  });
}

export default DependencyChecker;
