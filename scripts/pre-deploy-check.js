#!/usr/bin/env node

/**
 * CCPM360 部署前质量控制检查脚本
 * 执行完整的代码质量、构建验证和安全检查
 */

import { execSync } from 'child_process';
import { existsSync, statSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { glob } from 'glob';

const PROJECT_ROOT = process.cwd();

// 检查项目配置
const CHECKS = {
  // 代码质量检查
  codeQuality: {
    name: '代码质量检查',
    checks: [
      { name: 'ESLint检查', command: 'npm run lint', required: false },
      {
        name: 'TypeScript类型检查',
        command: 'npm run type-check',
        required: false,
      },
      {
        name: '代码格式化检查',
        command: 'npm run format:check',
        required: false,
      },
    ],
  },
  // 构建验证
  buildValidation: {
    name: '构建验证',
    checks: [
      { name: '构建验证', command: 'npm run build', required: false },
      {
        name: '构建产物检查',
        command: null,
        required: false,
        custom: checkBuildOutput,
      },
    ],
  },
  // 测试验证
  testValidation: {
    name: '测试验证',
    checks: [
      { name: '单元测试', command: 'npm run test:unit', required: false },
      { name: '组件测试', command: 'npm run test:components', required: false },
    ],
  },
  // 安全检查
  securityCheck: {
    name: '安全检查',
    checks: [
      {
        name: '依赖安全扫描',
        command: 'npm audit --audit-level=high',
        required: true,
      },
      {
        name: '环境变量检查',
        command: null,
        required: true,
        custom: checkEnvSecurity,
      },
    ],
  },
  // 依赖检查
  dependencyCheck: {
    name: '依赖完整性检查',
    checks: [
      {
        name: '缺失组件检查',
        command: null,
        required: true,
        custom: checkMissingComponents,
      },
      {
        name: 'package.json一致性',
        command: null,
        required: true,
        custom: checkPackageConsistency,
      },
      {
        name: '依赖完整性验证',
        command: null,
        required: true,
        custom: checkDependencyIntegrity,
      },
      {
        name: 'Radix UI组件依赖检查',
        command: null,
        required: true,
        custom: checkRadixDependencies,
      },
    ],
  },
  // TypeScript严格检查
  typeScriptCheck: {
    name: 'TypeScript严格检查',
    checks: [
      {
        name: '严格类型检查',
        command: 'npx tsc --noEmit --strict',
        required: true,
      },
      {
        name: '生产环境构建检查',
        command: 'npm run build',
        required: true,
      },
    ],
  },
  // Vercel环境模拟
  vercelSimulation: {
    name: 'Vercel环境模拟',
    checks: [
      {
        name: 'Node.js版本检查',
        command: null,
        required: true,
        custom: checkNodeVersion,
      },
      {
        name: '环境变量验证',
        command: null,
        required: true,
        custom: checkVercelEnvVars,
      },
      {
        name: '构建缓存清理',
        command: 'npm run clean',
        required: false,
      },
      {
        name: 'Vercel构建模拟',
        command: null,
        required: true,
        custom: simulateVercelBuild,
      },
    ],
  },
};

/**
 * 执行命令并返回结果
 */
function executeCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    });
    return { success: true, output: result };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: error.stdout || error.stderr || '',
    };
  }
}

/**
 * 检查构建产物
 */
function checkBuildOutput() {
  const buildDir = join(PROJECT_ROOT, '.next');
  if (!existsSync(buildDir)) {
    return { success: false, error: '构建目录 .next 不存在' };
  }

  const buildManifest = join(buildDir, 'build-manifest.json');
  if (!existsSync(buildManifest)) {
    return { success: false, error: '构建清单文件不存在' };
  }

  return { success: true, message: '构建产物检查通过' };
}

/**
 * 检查环境变量安全性
 */
async function checkEnvSecurity() {
  const envFiles = ['.env', '.env.local', '.env.example'];
  const issues = [];

  for (const envFile of envFiles) {
    const envPath = join(PROJECT_ROOT, envFile);
    if (existsSync(envPath)) {
      try {
        const { readFileSync } = await import('fs');
        const content = readFileSync(envPath, 'utf8');
        // 检查是否有硬编码的敏感信息（排除正常的环境变量）
        const lines = content.split('\n');
        for (const line of lines) {
          // 跳过注释和空行
          if (line.trim().startsWith('#') || !line.trim()) continue;

          // 跳过已知的安全环境变量
          if (
            line.includes('NEXT_PUBLIC_SUPABASE_') ||
            line.includes('SUPABASE_SERVICE_ROLE_KEY') ||
            line.includes('SUPABASE_URL')
          )
            continue;

          // 检查可疑的敏感信息
          const sensitivePatterns = [
            /password\s*=\s*["']?[^\s"']+/i,
            /secret\s*=\s*["']?[^\s"']+/i,
            /private.*key\s*=\s*["']?[^\s"']+/i,
          ];

          for (const pattern of sensitivePatterns) {
            if (pattern.test(line)) {
              issues.push(
                `${envFile} 第${lines.indexOf(line) + 1}行可能包含硬编码的敏感信息`
              );
            }
          }
        }
      } catch (error) {
        issues.push(`无法读取 ${envFile}: ${error.message}`);
      }
    }
  }

  if (issues.length > 0) {
    return { success: false, error: issues.join('; ') };
  }

  return { success: true, message: '环境变量安全检查通过' };
}

/**
 * 检查缺失的组件
 */
function checkMissingComponents() {
  const commonMissingComponents = [
    'src/components/ui/textarea.tsx',
    'src/components/ui/checkbox.tsx',
    'src/components/ui/select.tsx',
    'src/components/ui/radio-group.tsx',
  ];

  const missingComponents = commonMissingComponents.filter((component) => {
    const componentPath = join(PROJECT_ROOT, component);
    return !existsSync(componentPath);
  });

  if (missingComponents.length > 0) {
    return {
      success: false,
      error: `缺失组件: ${missingComponents.join(', ')}`,
    };
  }

  return { success: true, message: '组件完整性检查通过' };
}

/**
 * 检查package.json一致性
 */
function checkPackageConsistency() {
  try {
    const packageJsonPath = join(PROJECT_ROOT, 'package.json');
    const packageLockPath = join(PROJECT_ROOT, 'package-lock.json');

    if (!existsSync(packageJsonPath)) {
      return { success: false, error: 'package.json 不存在' };
    }

    if (!existsSync(packageLockPath)) {
      return {
        success: false,
        error: 'package-lock.json 不存在，请运行 npm install',
      };
    }

    // 检查package-lock.json是否比package.json新
    const packageStat = statSync(packageJsonPath);
    const lockStat = statSync(packageLockPath);

    if (packageStat.mtime > lockStat.mtime) {
      return {
        success: false,
        error: 'package.json 比 package-lock.json 新，请运行 npm install',
      };
    }

    return { success: true, message: 'package.json 一致性检查通过' };
  } catch (error) {
    return { success: false, error: `依赖检查失败: ${error.message}` };
  }
}

/**
 * 检查依赖完整性 - 扫描代码中的import语句并验证依赖是否在package.json中
 */
function checkDependencyIntegrity() {
  try {
    // 读取package.json
    const packageJsonPath = join(PROJECT_ROOT, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    // 扫描所有TypeScript和JavaScript文件
    const files = [
      ...glob.sync('src/**/*.{ts,tsx,js,jsx}', { cwd: PROJECT_ROOT }),
      ...glob.sync('app/**/*.{ts,tsx,js,jsx}', { cwd: PROJECT_ROOT }),
      ...glob.sync('components/**/*.{ts,tsx,js,jsx}', { cwd: PROJECT_ROOT }),
    ];

    const missingDependencies = new Set();
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    const requireRegex = /require\(['"]([^'"]+)['"]\)/g;

    for (const file of files) {
      const filePath = join(PROJECT_ROOT, file);
      if (!existsSync(filePath)) continue;
      
      const content = readFileSync(filePath, 'utf8');
      
      // 检查import语句
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        
        // 跳过相对路径和内置模块
        if (importPath.startsWith('.') || importPath.startsWith('/')) continue;
        if (['fs', 'path', 'crypto', 'util', 'os', 'child_process'].includes(importPath)) continue;
        
        // 提取包名（处理scoped packages）
        const packageName = importPath.startsWith('@') 
          ? importPath.split('/').slice(0, 2).join('/')
          : importPath.split('/')[0];
        
        if (!allDependencies[packageName]) {
          missingDependencies.add(packageName);
        }
      }
      
      // 检查require语句
      while ((match = requireRegex.exec(content)) !== null) {
        const requirePath = match[1];
        
        if (requirePath.startsWith('.') || requirePath.startsWith('/')) continue;
        if (['fs', 'path', 'crypto', 'util', 'os', 'child_process'].includes(requirePath)) continue;
        
        const packageName = requirePath.startsWith('@') 
          ? requirePath.split('/').slice(0, 2).join('/')
          : requirePath.split('/')[0];
        
        if (!allDependencies[packageName]) {
          missingDependencies.add(packageName);
        }
      }
    }

    if (missingDependencies.size > 0) {
      return {
        success: false,
        error: `缺失依赖: ${Array.from(missingDependencies).join(', ')}`,
      };
    }

    return { success: true, message: '依赖完整性检查通过' };
  } catch (error) {
    return { success: false, error: `依赖完整性检查失败: ${error.message}` };
  }
}

/**
 * 检查Radix UI组件依赖
 */
function checkRadixDependencies() {
  try {
    // 读取package.json
    const packageJsonPath = join(PROJECT_ROOT, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    // 常用的Radix UI组件依赖
    const radixComponents = [
      '@radix-ui/react-switch',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-select',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-popover',
      '@radix-ui/react-tabs',
      '@radix-ui/react-accordion',
    ];

    // 扫描UI组件文件，检查是否使用了Radix组件
    const uiFiles = glob.sync('src/components/ui/*.{ts,tsx}', { cwd: PROJECT_ROOT });
    const usedRadixComponents = new Set();
    const missingRadixDeps = [];

    for (const file of uiFiles) {
      const filePath = join(PROJECT_ROOT, file);
      if (!existsSync(filePath)) continue;
      
      const content = readFileSync(filePath, 'utf8');
      
      for (const component of radixComponents) {
        if (content.includes(component)) {
          usedRadixComponents.add(component);
          if (!allDependencies[component]) {
            missingRadixDeps.push(component);
          }
        }
      }
    }

    if (missingRadixDeps.length > 0) {
      return {
        success: false,
        error: `缺失Radix UI依赖: ${missingRadixDeps.join(', ')}`,
      };
    }

    return { 
      success: true, 
      message: `Radix UI依赖检查通过 (使用了 ${usedRadixComponents.size} 个组件)` 
    };
  } catch (error) {
    return { success: false, error: `Radix UI依赖检查失败: ${error.message}` };
  }
}

/**
 * 检查Node.js版本是否与Vercel兼容
 */
function checkNodeVersion() {
  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    // Vercel支持的Node.js版本
    const supportedVersions = [18, 20, 22];
    
    if (!supportedVersions.includes(majorVersion)) {
      return {
        success: false,
        error: `当前Node.js版本 ${nodeVersion} 不被Vercel支持。支持的版本: ${supportedVersions.map(v => `${v}.x`).join(', ')}`,
      };
    }
    
    return {
      success: true,
      message: `Node.js版本 ${nodeVersion} 与Vercel兼容`,
    };
  } catch (error) {
    return { success: false, error: `Node.js版本检查失败: ${error.message}` };
  }
}

/**
 * 检查Vercel环境变量
 */
function checkVercelEnvVars() {
  try {
    // 检查.env.example文件
    const envExamplePath = join(PROJECT_ROOT, '.env.example');
    if (!existsSync(envExamplePath)) {
      return {
        success: false,
        error: '.env.example 文件不存在，无法验证环境变量配置',
      };
    }
    
    const envExample = readFileSync(envExamplePath, 'utf8');
    const requiredVars = [];
    
    // 提取必需的环境变量
    const lines = envExample.split('\n');
    for (const line of lines) {
      if (line.trim() && !line.trim().startsWith('#')) {
        const varName = line.split('=')[0].trim();
        if (varName) {
          requiredVars.push(varName);
        }
      }
    }
    
    // 检查.env.local文件
    const envLocalPath = join(PROJECT_ROOT, '.env.local');
    const missingVars = [];
    
    if (existsSync(envLocalPath)) {
      const envLocal = readFileSync(envLocalPath, 'utf8');
      for (const varName of requiredVars) {
        if (!envLocal.includes(`${varName}=`)) {
          missingVars.push(varName);
        }
      }
    } else {
      missingVars.push(...requiredVars);
    }
    
    if (missingVars.length > 0) {
      return {
        success: false,
        error: `缺失环境变量: ${missingVars.join(', ')}`,
      };
    }
    
    return {
      success: true,
      message: `环境变量配置完整 (${requiredVars.length} 个变量)`,
    };
  } catch (error) {
    return { success: false, error: `环境变量检查失败: ${error.message}` };
  }
}

/**
 * 模拟Vercel构建过程
 */
function simulateVercelBuild() {
  try {
    console.log('\n🔄 模拟Vercel构建过程...');
    
    // 1. 清理构建缓存
    console.log('1. 清理构建缓存...');
    const cleanResult = executeCommand('rm -rf .next', { silent: true });
    
    // 2. 安装依赖（模拟Vercel的npm ci）
    console.log('2. 验证依赖安装...');
    const installResult = executeCommand('npm ci --production=false', { silent: true });
    if (!installResult.success) {
      return {
        success: false,
        error: `依赖安装失败: ${installResult.error}`,
      };
    }
    
    // 3. 运行构建
    console.log('3. 执行生产构建...');
    const buildResult = executeCommand('npm run build', { silent: true });
    if (!buildResult.success) {
      return {
        success: false,
        error: `构建失败: ${buildResult.error}`,
      };
    }
    
    // 4. 检查构建产物
    console.log('4. 验证构建产物...');
    const buildDir = join(PROJECT_ROOT, '.next');
    if (!existsSync(buildDir)) {
      return {
        success: false,
        error: '构建目录不存在',
      };
    }
    
    // 检查关键文件
    const criticalFiles = [
      '.next/build-manifest.json',
      '.next/static',
      '.next/server',
    ];
    
    for (const file of criticalFiles) {
      const filePath = join(PROJECT_ROOT, file);
      if (!existsSync(filePath)) {
        return {
          success: false,
          error: `关键构建文件缺失: ${file}`,
        };
      }
    }
    
    // 5. 检查构建大小
    const buildSize = statSync(buildDir).size;
    const maxSize = 250 * 1024 * 1024; // 250MB Vercel限制
    
    if (buildSize > maxSize) {
      return {
        success: false,
        error: `构建产物过大: ${(buildSize / 1024 / 1024).toFixed(2)}MB (限制: 250MB)`,
      };
    }
    
    return {
      success: true,
      message: `Vercel构建模拟成功 (构建大小: ${(buildSize / 1024 / 1024).toFixed(2)}MB)`,
    };
  } catch (error) {
    return { success: false, error: `Vercel构建模拟失败: ${error.message}` };
  }
}

/**
 * 打印检查结果
 */
function printResult(checkName, result, required = true) {
  const prefix = required ? '🔍' : '📋';
  const status = result.success ? '✅' : required ? '❌' : '⚠️';

  console.log(`${prefix} ${checkName}: ${status}`);

  if (!result.success) {
    console.log(chalk.red(`   错误: ${result.error}`));
    if (result.output) {
      console.log(chalk.gray(`   输出: ${result.output.slice(0, 200)}...`));
    }
  } else if (result.message) {
    console.log(chalk.green(`   ${result.message}`));
  }
}

/**
 * 主执行函数
 */
async function runQualityChecks() {
  console.log(chalk.blue.bold('\n🚀 CCPM360 部署前质量控制检查\n'));

  let totalChecks = 0;
  let passedChecks = 0;
  let requiredFailures = 0;

  for (const [categoryKey, category] of Object.entries(CHECKS)) {
    console.log(chalk.yellow.bold(`\n📂 ${category.name}`));
    console.log('─'.repeat(50));

    for (const check of category.checks) {
      totalChecks++;
      let result;

      if (check.custom) {
        result = await check.custom();
      } else if (check.command) {
        result = executeCommand(check.command, { silent: true });
      } else {
        result = { success: true, message: '跳过检查' };
      }

      printResult(check.name, result, check.required);

      if (result.success) {
        passedChecks++;
      } else if (check.required) {
        requiredFailures++;
      }
    }
  }

  // 打印总结
  console.log(chalk.blue.bold('\n📊 检查总结'));
  console.log('─'.repeat(50));
  console.log(`总检查项: ${totalChecks}`);
  console.log(`通过检查: ${passedChecks}`);
  console.log(`必需项失败: ${requiredFailures}`);

  if (requiredFailures > 0) {
    console.log(chalk.red.bold('\n❌ 质量控制检查失败！'));
    console.log(chalk.red('请修复上述必需检查项后再次尝试部署。'));
    console.log(
      chalk.yellow('\n💡 提示: 查看 QUALITY_CONTROL.md 获取详细的修复指南。')
    );
    process.exit(1);
  } else {
    console.log(chalk.green.bold('\n✅ 所有质量控制检查通过！'));
    console.log(chalk.green('代码已准备好进行部署。'));
    process.exit(0);
  }
}

// 执行检查
runQualityChecks().catch((error) => {
  console.error(chalk.red.bold('\n💥 检查脚本执行失败:'));
  console.error(chalk.red(error.message));
  process.exit(1);
});

export { runQualityChecks };
