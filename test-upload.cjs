// 测试文件上传API的简单脚本
const fs = require('fs');
const path = require('path');

// 创建一个测试PDF文件内容（简单的文本文件，但扩展名为.pdf）
const testContent =
  '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF';

// 写入测试文件
fs.writeFileSync('test.pdf', testContent);
console.log('测试PDF文件已创建: test.pdf');

// 测试上传
async function testUpload() {
  try {
    const FormData = require('form-data');
    const { default: fetch } = await import('node-fetch');

    const form = new FormData();
    form.append('file', fs.createReadStream('test.pdf'), {
      filename: 'test.pdf',
      contentType: 'application/pdf',
    });

    console.log('开始测试文件上传...');
    const response = await fetch('http://localhost:3000/api/upload/file', {
      method: 'POST',
      body: form,
    });

    const result = await response.text();
    console.log('响应状态:', response.status);
    console.log('响应内容:', result);

    // 清理测试文件
    fs.unlinkSync('test.pdf');
    console.log('测试文件已清理');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testUpload();
