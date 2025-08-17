#!/usr/bin/env node

/**
 * CCPM360 部署前质量控制检查脚本
 * 执行完整的代码质量、构建验证和安全检查
 */

import { execSync } from 'child_process';
import { existsSync, statSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

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
        required: false,
        custom: checkPackageConsistency,
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
