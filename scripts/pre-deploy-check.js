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

// 渐进式质量控制检查配置
// 按照执行优先级排序：基础检查 → 依赖检查 → 安全扫描 → Vercel模拟
const CHECK_PHASES = {
  // 阶段1: 基础代码质量检查（必须通过才能继续）
  basicQuality: {
    name: '基础代码质量检查',
    description: '执行基础的代码质量检查，包括语法、类型和格式',
    stopOnFailure: true,
    checks: [
      {
        name: 'ESLint语法检查',
        command: 'npm run lint',
        required: true,
        fixCommand: 'npm run lint -- --fix',
        description: '检查代码语法和编码规范',
      },
      {
        name: 'TypeScript类型检查',
        command: 'npx tsc --noEmit',
        required: true,
        description: '检查TypeScript类型错误',
      },
      {
        name: '代码格式化检查',
        command: 'npm run format:check',
        required: true,
        fixCommand: 'npm run format',
        description: '检查代码格式是否符合规范',
      },
    ],
  },

  // 阶段2: 依赖完整性检查
  dependencyCheck: {
    name: '依赖完整性检查',
    description: '验证项目依赖的完整性和一致性',
    stopOnFailure: true,
    checks: [
      {
        name: 'package.json一致性检查',
        command: null,
        required: true,
        custom: checkPackageConsistency,
        description: '检查package.json文件的一致性',
      },
      {
        name: '缺失组件检查',
        command: null,
        required: true,
        custom: checkMissingComponents,
        description: '检查是否有缺失的组件依赖',
      },
      {
        name: '依赖完整性验证',
        command: null,
        required: true,
        custom: checkDependencyIntegrity,
        description: '验证所有依赖是否正确安装',
      },
      {
        name: 'Radix UI组件依赖检查',
        command: null,
        required: true,
        custom: checkRadixDependencies,
        description: '检查Radix UI组件的依赖关系',
      },
    ],
  },

  // 阶段3: 安全检查
  securityCheck: {
    name: '安全检查',
    description: '执行安全相关的检查，包括依赖漏洞和环境变量',
    stopOnFailure: true,
    checks: [
      {
        name: '依赖安全扫描',
        command: 'npm audit --audit-level=high',
        required: true,
        fixCommand: 'npm audit fix',
        description: '扫描依赖包的安全漏洞',
      },
      {
        name: '环境变量安全检查',
        command: null,
        required: true,
        custom: checkEnvSecurity,
        description: '检查环境变量的安全配置',
      },
    ],
  },

  // 阶段4: 构建验证
  buildValidation: {
    name: '构建验证',
    description: '验证项目能够正确构建',
    stopOnFailure: true,
    checks: [
      {
        name: '生产环境构建检查',
        command: 'npm run build',
        required: true,
        description: '验证项目能够成功构建',
      },
      {
        name: '构建产物检查',
        command: null,
        required: true,
        custom: checkBuildOutput,
        description: '检查构建产物的完整性',
      },
    ],
  },

  // 阶段5: Vercel环境模拟（最后执行）
  vercelSimulation: {
    name: 'Vercel环境模拟',
    description: '模拟Vercel部署环境进行最终验证',
    stopOnFailure: false, // 这个阶段失败不会阻止后续检查
    checks: [
      {
        name: 'Node.js版本检查',
        command: null,
        required: true,
        custom: checkNodeVersion,
        description: '检查Node.js版本兼容性',
      },
      {
        name: 'Vercel环境变量验证',
        command: null,
        required: true,
        custom: checkVercelEnvVars,
        description: '验证Vercel部署所需的环境变量',
      },
      {
        name: 'Vercel构建模拟',
        command: null,
        required: true,
        custom: simulateVercelBuild,
        description: '模拟Vercel的构建过程',
      },
    ],
  },

  // 阶段6: 可选测试验证
  testValidation: {
    name: '测试验证',
    description: '执行单元测试和组件测试（可选）',
    stopOnFailure: false,
    checks: [
      {
        name: '单元测试',
        command: 'npm run test:run',
        required: false,
        description: '运行单元测试',
      },
      {
        name: '组件测试',
        command: 'npm run test:components',
        required: false,
        description: '运行组件测试',
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
function checkEnvSecurity() {
  const envFiles = ['.env', '.env.local', '.env.example'];
  const issues = [];

  for (const envFile of envFiles) {
    const envPath = join(PROJECT_ROOT, envFile);
    if (existsSync(envPath)) {
      try {
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
        if (
          [
            'fs',
            'fs/promises',
            'path',
            'crypto',
            'util',
            'os',
            'child_process',
            'http',
            'https',
            'url',
            'events',
            'stream',
            'buffer',
            'querystring',
            'zlib',
          ].includes(importPath)
        )
          continue;

        // 跳过TypeScript路径别名（如@/services, @/lib等）
        if (importPath.startsWith('@/')) continue;

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

        if (requirePath.startsWith('.') || requirePath.startsWith('/'))
          continue;
        if (
          [
            'fs',
            'fs/promises',
            'path',
            'crypto',
            'util',
            'os',
            'child_process',
            'http',
            'https',
            'url',
            'events',
            'stream',
            'buffer',
            'querystring',
            'zlib',
          ].includes(requirePath)
        )
          continue;

        // 跳过TypeScript路径别名（如@/services, @/lib等）
        if (requirePath.startsWith('@/')) continue;

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
    const uiFiles = glob.sync('src/components/ui/*.{ts,tsx}', {
      cwd: PROJECT_ROOT,
    });
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
      message: `Radix UI依赖检查通过 (使用了 ${usedRadixComponents.size} 个组件)`,
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
        error: `当前Node.js版本 ${nodeVersion} 不被Vercel支持。支持的版本: ${supportedVersions.map((v) => `${v}.x`).join(', ')}`,
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
    const installResult = executeCommand('npm ci --production=false', {
      silent: true,
    });
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
    console.log(chalk.red(`   ❌ 错误: ${result.error}`));

    // 显示详细的错误输出（如果有）
    if (result.output) {
      const output = result.output.trim();
      if (output.length > 300) {
        console.log(chalk.gray(`   📄 输出预览: ${output.slice(0, 300)}...`));
        console.log(chalk.gray(`   💡 提示: 完整输出可能包含更多错误详情`));
      } else {
        console.log(chalk.gray(`   📄 详细输出: ${output}`));
      }
    }

    // 根据错误类型提供具体建议
    if (result.error.includes('TypeScript')) {
      console.log(
        chalk.yellow(`   💡 建议: 运行 'npm run type-check' 查看详细类型错误`)
      );
    } else if (result.error.includes('ESLint')) {
      console.log(
        chalk.yellow(
          `   💡 建议: 运行 'npm run lint -- --fix' 自动修复部分问题`
        )
      );
    } else if (result.error.includes('test')) {
      console.log(
        chalk.yellow(`   💡 建议: 运行 'npm run test' 查看详细测试失败信息`)
      );
    } else if (result.error.includes('build')) {
      console.log(chalk.yellow(`   💡 建议: 检查构建配置和依赖项`));
    }
  } else if (result.message) {
    console.log(chalk.green(`   ✅ ${result.message}`));
  }
}

/**
 * 尝试自动修复问题
 */
function tryAutoFix(check) {
  if (!check.fixCommand) {
    return { success: false, message: '无可用的自动修复命令' };
  }

  console.log(chalk.yellow(`   🔧 尝试自动修复: ${check.fixCommand}`));
  const fixResult = executeCommand(check.fixCommand, { silent: true });

  if (fixResult.success) {
    console.log(chalk.green('   ✅ 自动修复成功'));
    return { success: true, message: '自动修复成功' };
  } else {
    console.log(chalk.red(`   ❌ 自动修复失败: ${fixResult.error}`));
    return { success: false, message: `自动修复失败: ${fixResult.error}` };
  }
}

/**
 * 执行单个检查阶段
 */
async function runPhase(phaseName, phase, options = {}) {
  console.log(chalk.yellow.bold(`\n📂 ${phase.name}`));
  console.log(chalk.gray(`   ${phase.description}`));
  console.log('─'.repeat(60));

  let phaseResults = {
    total: 0,
    passed: 0,
    failed: 0,
    requiredFailed: 0,
  };

  for (const check of phase.checks) {
    phaseResults.total++;
    let result;

    console.log(chalk.cyan(`\n🔍 ${check.name}`));
    if (check.description) {
      console.log(chalk.gray(`   ${check.description}`));
    }

    // 执行检查
    if (check.custom) {
      result = await check.custom();
    } else if (check.command) {
      result = executeCommand(check.command, { silent: true });
    } else {
      result = { success: true, message: '跳过检查' };
    }

    // 如果检查失败且支持自动修复
    if (!result.success && options.autoFix && check.fixCommand) {
      const fixResult = tryAutoFix(check);
      if (fixResult.success) {
        // 重新执行检查
        if (check.custom) {
          result = await check.custom();
        } else if (check.command) {
          result = executeCommand(check.command, { silent: true });
        }
      }
    }

    printResult(check.name, result, check.required);

    if (result.success) {
      phaseResults.passed++;
    } else {
      phaseResults.failed++;
      if (check.required) {
        phaseResults.requiredFailed++;
      }
    }

    // 如果是必需检查失败且该阶段要求立即停止
    if (!result.success && check.required && phase.stopOnFailure) {
      console.log(chalk.red.bold(`\n🛑 ${phase.name} 阶段检查失败！`));
      console.log(
        chalk.red(`必需检查项 "${check.name}" 未通过，停止后续检查。`)
      );
      console.log(chalk.red('为确保代码质量，必须修复此问题才能继续。'));

      // 显示错误详情
      console.log(chalk.red.bold('\n📋 错误详情:'));
      console.log(chalk.red(`   ${result.error}`));

      // 提供修复建议
      console.log(chalk.yellow.bold('\n🔧 修复建议:'));

      if (check.fixCommand) {
        console.log(chalk.yellow(`1. 🚀 快速修复: ${check.fixCommand}`));
        console.log(chalk.yellow('2. 🔄 重新运行检查脚本'));
      } else {
        console.log(chalk.yellow('1. 📝 根据上述错误信息手动修复问题'));
        console.log(chalk.yellow('2. 🔄 重新运行检查脚本'));
      }

      console.log(chalk.yellow('3. 💡 或使用 --fix-first 选项尝试自动修复'));
      console.log(
        chalk.yellow('4. 📚 查看 QUALITY_CONTROL.md 获取详细修复指南')
      );

      // 显示相关命令
      console.log(chalk.cyan.bold('\n⚡ 常用命令:'));
      console.log(chalk.cyan('   npm run check        # 运行完整检查'));
      console.log(chalk.cyan('   npm run lint -- --fix # 自动修复ESLint问题'));
      console.log(chalk.cyan('   npm run type-check   # 检查TypeScript类型'));
      console.log(chalk.cyan('   npm run test         # 运行测试'));

      return { success: false, results: phaseResults, stopExecution: true };
    }
  }

  // 阶段总结
  console.log(chalk.blue(`\n📊 ${phase.name} 阶段总结:`));
  console.log(`   总检查项: ${phaseResults.total}`);
  console.log(`   通过: ${phaseResults.passed}`);
  console.log(`   失败: ${phaseResults.failed}`);
  console.log(`   必需项失败: ${phaseResults.requiredFailed}`);

  const phaseSuccess = phaseResults.requiredFailed === 0;
  if (phaseSuccess) {
    console.log(chalk.green.bold(`   ✅ ${phase.name} 阶段通过`));
  } else {
    console.log(chalk.red.bold(`   ❌ ${phase.name} 阶段失败`));
  }

  return { success: phaseSuccess, results: phaseResults, stopExecution: false };
}

/**
 * 主执行函数
 */
async function runQualityChecks() {
  // 解析命令行参数
  const args = process.argv.slice(2);
  const options = {
    autoFix: args.includes('--fix-first'),
    skipOptional: args.includes('--skip-optional'),
    verbose: args.includes('--verbose'),
  };

  console.log(chalk.blue.bold('\n🚀 CCPM360 渐进式质量控制检查'));
  console.log(chalk.gray('采用分阶段检查策略，确保代码质量逐步提升\n'));

  if (options.autoFix) {
    console.log(chalk.yellow('🔧 自动修复模式已启用'));
  }

  let totalResults = {
    phases: 0,
    passedPhases: 0,
    totalChecks: 0,
    passedChecks: 0,
    totalFailures: 0,
  };

  // 按阶段执行检查
  for (const [phaseName, phase] of Object.entries(CHECK_PHASES)) {
    totalResults.phases++;

    // 跳过可选阶段（如果指定）
    if (options.skipOptional && !phase.stopOnFailure) {
      console.log(chalk.gray(`\n⏭️  跳过可选阶段: ${phase.name}`));
      continue;
    }

    const phaseResult = await runPhase(phaseName, phase, options);

    totalResults.totalChecks += phaseResult.results.total;
    totalResults.passedChecks += phaseResult.results.passed;
    totalResults.totalFailures += phaseResult.results.failed;

    if (phaseResult.success) {
      totalResults.passedPhases++;
    }

    // 如果阶段要求停止执行
    if (phaseResult.stopExecution) {
      console.log(chalk.red.bold('\n🛑 检查流程提前终止'));
      console.log(chalk.red('请修复上述问题后重新运行检查。'));
      process.exit(1);
    }
  }

  // 最终总结
  console.log(chalk.blue.bold('\n🎯 最终检查总结'));
  console.log('═'.repeat(60));
  console.log(
    `检查阶段: ${totalResults.passedPhases}/${totalResults.phases} 通过`
  );
  console.log(
    `检查项目: ${totalResults.passedChecks}/${totalResults.totalChecks} 通过`
  );
  console.log(`失败项目: ${totalResults.totalFailures}`);

  const allPassed =
    totalResults.passedPhases === totalResults.phases &&
    totalResults.totalFailures === 0;

  if (allPassed) {
    console.log(chalk.green.bold('\n🎉 所有质量控制检查通过！'));
    console.log(chalk.green('✅ 代码已准备好进行部署。'));
    console.log(chalk.cyan('\n🚀 可以安全地推送到生产环境。'));
    process.exit(0);
  } else {
    console.log(chalk.red.bold('\n❌ 质量控制检查未完全通过'));
    console.log(chalk.red(`发现 ${totalResults.totalFailures} 个问题需要修复`));

    // 分类显示问题
    console.log(chalk.yellow.bold('\n🔧 修复建议:'));
    console.log(chalk.yellow('1. 📋 查看上述失败的检查项和详细错误信息'));
    console.log(chalk.yellow('2. 🎯 优先修复必需检查项（标记为❌的项目）'));
    console.log(chalk.yellow('3. 🚀 使用 --fix-first 选项尝试自动修复'));
    console.log(chalk.yellow('4. 🔄 修复后重新运行检查脚本'));

    console.log(chalk.cyan.bold('\n⚡ 快速修复命令:'));
    console.log(
      chalk.cyan(
        '   node scripts/pre-deploy-check.js --fix-first  # 自动修复模式'
      )
    );
    console.log(
      chalk.cyan(
        '   npm run lint -- --fix                        # 修复ESLint问题'
      )
    );
    console.log(
      chalk.cyan(
        '   npm run type-check                           # 检查类型错误'
      )
    );
    console.log(
      chalk.cyan('   npm run test                                 # 运行测试')
    );
    console.log(
      chalk.cyan('   npm run build                               # 验证构建')
    );

    console.log(
      chalk.gray('\n📚 详细指南: 查看 QUALITY_CONTROL.md 获取完整的修复指南')
    );
    console.log(
      chalk.gray('💡 提示: 建议逐个修复问题，每次修复后重新运行检查')
    );
    process.exit(1);
  }
}

// 执行检查
runQualityChecks().catch((error) => {
  console.error(chalk.red.bold('\n💥 检查脚本执行失败:'));
  console.error(chalk.red(`错误: ${error.message}`));

  if (error.stack) {
    console.error(chalk.gray('\n📋 错误堆栈:'));
    console.error(chalk.gray(error.stack));
  }

  console.error(chalk.yellow('\n🔧 故障排除建议:'));
  console.error(chalk.yellow('1. 检查Node.js和npm版本是否符合要求'));
  console.error(chalk.yellow('2. 确保所有依赖已正确安装 (npm install)'));
  console.error(chalk.yellow('3. 检查项目根目录和文件权限'));
  console.error(chalk.yellow('4. 查看上述错误堆栈获取详细信息'));

  console.error(chalk.cyan('\n💡 如果问题持续存在，请检查:'));
  console.error(chalk.cyan('   - package.json 配置'));
  console.error(chalk.cyan('   - 环境变量设置'));
  console.error(chalk.cyan('   - 文件系统权限'));

  process.exit(1);
});

export { runQualityChecks };
