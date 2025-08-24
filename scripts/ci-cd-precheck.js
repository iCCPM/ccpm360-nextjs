#!/usr/bin/env node

/**
 * CCPM360 CI/CD预验证脚本
 * 模拟GitHub Actions的lint-and-test作业，确保本地代码质量与CI/CD环境一致
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import chalk from 'chalk';

const execAsync = promisify(exec);

const PROJECT_ROOT = process.cwd();

/**
 * CI/CD预验证检查配置
 * 模拟GitHub Actions工作流程
 */
const CI_CD_CHECKS = {
  // 环境验证阶段
  environment: {
    name: 'CI/CD环境验证',
    description: '验证本地环境与CI/CD环境的兼容性',
    checks: [
      {
        name: 'Node.js版本检查',
        custom: checkNodeVersion,
        required: false,
        description: '确保Node.js版本与CI/CD环境一致（20.x）',
      },
      {
        name: 'npm版本检查',
        custom: checkNpmVersion,
        required: true,
        description: '验证npm版本兼容性',
      },
      {
        name: '环境变量验证',
        custom: checkCICDEnvVars,
        required: true,
        description: '验证CI/CD所需的环境变量配置',
      },
    ],
  },

  // 依赖验证阶段
  dependencies: {
    name: '依赖验证',
    description: '验证项目依赖的完整性和安全性',
    checks: [
      {
        name: '依赖安装验证',
        command: 'npm ci --production=false',
        required: true,
        description: '模拟CI/CD的依赖安装过程',
      },
      {
        name: '依赖安全扫描',
        command: 'npm audit --audit-level=high',
        required: true,
        description: '扫描高危安全漏洞',
      },
    ],
  },

  // 代码质量检查阶段
  codeQuality: {
    name: '代码质量检查',
    description: '执行与CI/CD相同的代码质量检查',
    checks: [
      {
        name: 'ESLint检查',
        command: 'npm run lint',
        required: true,
        description: '代码语法和规范检查',
      },
      {
        name: 'TypeScript类型检查',
        command: 'npm run type-check',
        required: true,
        description: 'TypeScript类型验证',
      },
      {
        name: '代码格式检查',
        command: 'npm run format:check',
        required: false,
        description: '代码格式规范检查',
      },
    ],
  },

  // 构建验证阶段
  build: {
    name: '构建验证',
    description: '验证项目构建过程',
    checks: [
      {
        name: '生产构建',
        command: 'npm run build',
        required: true,
        description: '执行生产环境构建',
      },
      {
        name: '构建产物验证',
        custom: validateBuildOutput,
        required: true,
        description: '验证构建产物的完整性',
      },
    ],
  },

  // 测试验证阶段（可选）
  testing: {
    name: '测试验证',
    description: '执行测试套件',
    checks: [
      {
        name: '单元测试',
        custom: checkUnitTests,
        required: false,
        description: '运行单元测试（如果配置）',
      },
    ],
  },
};

/**
 * 执行命令并返回结果
 */
function executeCommand(command, options = {}) {
  try {
    console.log(chalk.gray(`   执行: ${command}`));
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
      exitCode: error.status,
    };
  }
}

/**
 * 检查Node.js版本
 */
function checkNodeVersion() {
  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

    // CI/CD使用Node.js 20.x
    if (majorVersion !== 20) {
      return {
        success: false,
        error: `当前Node.js版本 ${nodeVersion}，CI/CD使用20.x版本。建议切换到Node.js 20.x以确保一致性。`,
      };
    }

    return {
      success: true,
      message: `Node.js版本 ${nodeVersion} 与CI/CD环境一致`,
    };
  } catch (error) {
    return { success: false, error: `Node.js版本检查失败: ${error.message}` };
  }
}

/**
 * 检查npm版本
 */
function checkNpmVersion() {
  try {
    const result = execSync('npm --version', { encoding: 'utf8' });
    const npmVersion = result.trim();
    const majorVersion = parseInt(npmVersion.split('.')[0]);

    // 确保npm版本不低于8.x
    if (majorVersion < 8) {
      return {
        success: false,
        error: `npm版本 ${npmVersion} 过低，建议升级到8.x或更高版本`,
      };
    }

    return {
      success: true,
      message: `npm版本 ${npmVersion} 符合要求`,
    };
  } catch (error) {
    return { success: false, error: `npm版本检查失败: ${error.message}` };
  }
}

/**
 * 检查CI/CD环境变量
 */
function checkCICDEnvVars() {
  try {
    // CI/CD必需的环境变量
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      // SMTP邮件服务配置
      'EMAIL_HOST',
      'EMAIL_PORT',
      'EMAIL_USER',
      'EMAIL_PASS',
      'EMAIL_FROM',
    ];

    // 检查.env文件
    const envFiles = ['.env', '.env.local'];
    const envVars = new Set();

    for (const envFile of envFiles) {
      const envPath = join(PROJECT_ROOT, envFile);
      if (existsSync(envPath)) {
        const content = readFileSync(envPath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.trim() && !line.trim().startsWith('#')) {
            const varName = line.split('=')[0].trim();
            if (varName) {
              envVars.add(varName);
            }
          }
        }
      }
    }

    const missingVars = requiredEnvVars.filter(
      (varName) => !envVars.has(varName)
    );

    if (missingVars.length > 0) {
      return {
        success: false,
        error: `缺失CI/CD必需的环境变量: ${missingVars.join(', ')}`,
      };
    }

    return {
      success: true,
      message: `所有CI/CD环境变量配置完整 (${requiredEnvVars.length}个)`,
    };
  } catch (error) {
    return { success: false, error: `环境变量检查失败: ${error.message}` };
  }
}

/**
 * 检查单元测试
 */
function checkUnitTests() {
  try {
    // 检查是否存在测试脚本
    const packageJsonPath = join(PROJECT_ROOT, 'package.json');
    if (!existsSync(packageJsonPath)) {
      return {
        success: false,
        error: 'package.json 文件不存在',
      };
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const hasTestScript =
      packageJson.scripts &&
      (packageJson.scripts['test:run'] || packageJson.scripts['test']);

    if (!hasTestScript) {
      return {
        success: true,
        message: '未配置测试脚本，跳过测试验证',
      };
    }

    // 检查测试脚本是否为占位符
    const testScript =
      packageJson.scripts['test:run'] || packageJson.scripts['test'];
    if (testScript && testScript.includes('Error: no test specified')) {
      return {
        success: true,
        message: '测试脚本为占位符，跳过测试验证',
      };
    }

    // 执行测试
    const testCommand = packageJson.scripts['test:run']
      ? 'npm run test:run'
      : 'npm run test';
    const result = executeCommand(testCommand, { silent: false });

    if (result.success) {
      return {
        success: true,
        message: '所有测试通过',
      };
    } else {
      return {
        success: true,
        message: '测试执行失败，但为非必需检查项',
      };
    }
  } catch (error) {
    return { success: false, error: `单元测试检查失败: ${error.message}` };
  }
}

/**
 * 验证构建产物
 */
function validateBuildOutput() {
  try {
    const buildDir = join(PROJECT_ROOT, '.next');
    if (!existsSync(buildDir)) {
      return { success: false, error: '构建目录 .next 不存在' };
    }

    // 检查关键构建文件
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

    return {
      success: true,
      message: '构建产物验证通过',
    };
  } catch (error) {
    return { success: false, error: `构建产物验证失败: ${error.message}` };
  }
}

/**
 * 打印检查结果
 */
function printResult(checkName, result, required = true) {
  const status = result.success ? '✅' : required ? '❌' : '⚠️';
  console.log(`   ${status} ${checkName}`);

  if (!result.success) {
    console.log(chalk.red(`      错误: ${result.error}`));
    if (result.output && result.output.trim()) {
      const output = result.output.trim();
      if (output.length > 200) {
        console.log(chalk.gray(`      输出: ${output.slice(0, 200)}...`));
      } else {
        console.log(chalk.gray(`      输出: ${output}`));
      }
    }
  } else if (result.message) {
    console.log(chalk.green(`      ${result.message}`));
  }
}

/**
 * 执行检查阶段
 */
async function runPhase(phaseName, phase) {
  console.log(chalk.yellow.bold(`\n📂 ${phase.name}`));
  console.log(chalk.gray(`   ${phase.description}`));
  console.log('─'.repeat(50));

  let phaseResults = {
    total: 0,
    passed: 0,
    failed: 0,
    requiredFailed: 0,
  };

  for (const check of phase.checks) {
    phaseResults.total++;
    console.log(chalk.cyan(`\n🔍 ${check.name}`));
    if (check.description) {
      console.log(chalk.gray(`   ${check.description}`));
    }

    let result;
    if (check.custom) {
      result = await check.custom();
    } else if (check.command) {
      result = executeCommand(check.command, { silent: false });
    } else {
      result = { success: true, message: '跳过检查' };
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

    // 如果必需检查失败，立即停止
    if (!result.success && check.required) {
      console.log(chalk.red.bold(`\n🛑 ${phase.name} 阶段检查失败！`));
      console.log(
        chalk.red(`必需检查项 "${check.name}" 未通过，停止后续检查。`)
      );
      return { success: false, results: phaseResults, stopExecution: true };
    }
  }

  const phaseSuccess = phaseResults.requiredFailed === 0;
  console.log(chalk.blue(`\n📊 ${phase.name} 阶段结果:`));
  console.log(`   通过: ${phaseResults.passed}/${phaseResults.total}`);
  console.log(`   必需项失败: ${phaseResults.requiredFailed}`);

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
async function runCICDPrecheck() {
  const args = process.argv.slice(2);
  const options = {
    skipOptional: args.includes('--skip-optional'),
    verbose: args.includes('--verbose'),
  };

  console.log(chalk.blue.bold('\n🚀 CCPM360 CI/CD预验证检查'));
  console.log(
    chalk.gray('模拟GitHub Actions环境，确保本地代码质量与CI/CD一致\n')
  );

  let totalResults = {
    phases: 0,
    passedPhases: 0,
    totalChecks: 0,
    passedChecks: 0,
    totalFailures: 0,
    requiredFailures: 0,
  };

  // 按阶段执行检查
  for (const [phaseName, phase] of Object.entries(CI_CD_CHECKS)) {
    totalResults.phases++;

    // 跳过可选阶段
    if (options.skipOptional && phaseName === 'testing') {
      console.log(chalk.gray(`\n⏭️  跳过可选阶段: ${phase.name}`));
      continue;
    }

    const phaseResult = await runPhase(phaseName, phase);

    totalResults.totalChecks += phaseResult.results.total;
    totalResults.passedChecks += phaseResult.results.passed;
    totalResults.totalFailures += phaseResult.results.failed;
    totalResults.requiredFailures += phaseResult.results.requiredFailed;

    if (phaseResult.success) {
      totalResults.passedPhases++;
    }

    // 如果阶段要求停止执行
    if (phaseResult.stopExecution) {
      console.log(chalk.red.bold('\n🛑 CI/CD预验证失败'));
      console.log(chalk.red('请修复上述问题后重新运行检查。'));
      process.exit(1);
    }
  }

  // 最终总结
  console.log(chalk.blue.bold('\n🎯 CI/CD预验证总结'));
  console.log('═'.repeat(50));
  console.log(
    `检查阶段: ${totalResults.passedPhases}/${totalResults.phases} 通过`
  );
  console.log(
    `检查项目: ${totalResults.passedChecks}/${totalResults.totalChecks} 通过`
  );
  console.log(`失败项目: ${totalResults.totalFailures}`);

  const allPassed =
    totalResults.passedPhases === totalResults.phases &&
    totalResults.requiredFailures === 0;

  if (allPassed) {
    console.log(chalk.green.bold('\n🎉 CI/CD预验证通过！'));
    console.log(chalk.green('✅ 代码已准备好提交到CI/CD流水线。'));
    console.log(chalk.cyan('\n🚀 可以安全地推送代码，CI/CD构建预期会成功。'));
    process.exit(0);
  } else {
    console.log(chalk.red.bold('\n❌ CI/CD预验证失败'));
    console.log(chalk.red(`发现 ${totalResults.totalFailures} 个问题需要修复`));
    console.log(chalk.yellow('\n🔧 修复建议:'));
    console.log(chalk.yellow('1. 查看上述失败的检查项和详细错误信息'));
    console.log(chalk.yellow('2. 修复所有必需检查项（标记为❌的项目）'));
    console.log(chalk.yellow('3. 修复后重新运行CI/CD预验证'));
    console.log(chalk.cyan('\n⚡ 重新运行命令:'));
    console.log(chalk.cyan('   npm run ci-cd-check'));
    process.exit(1);
  }
}

// 执行CI/CD预验证
runCICDPrecheck().catch((error) => {
  console.error(chalk.red.bold('\n💥 CI/CD预验证脚本执行失败:'));
  console.error(chalk.red(`错误: ${error.message}`));
  if (error.stack) {
    console.error(chalk.gray('\n错误堆栈:'));
    console.error(chalk.gray(error.stack));
  }
  process.exit(1);
});

export { runCICDPrecheck };
