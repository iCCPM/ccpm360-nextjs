import { NextRequest, NextResponse } from 'next/server';
import { generateAssessmentPDF } from '@/lib/puppeteerPDFGenerator';

export async function POST(request: NextRequest) {
  try {
    const assessmentData = await request.json();

    console.log('收到PDF生成请求:', {
      userInfo: assessmentData.userInfo,
      totalScore: assessmentData.totalScore,
      dimensionScoresLength: assessmentData.dimensionScores?.length,
    });

    // 生成PDF
    const pdfBuffer = await generateAssessmentPDF(assessmentData);

    console.log('PDF生成成功，大小:', pdfBuffer.length, '字节');

    // 返回PDF文件
    const response = new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CCPM360-assessment-report-${new Date().toISOString().split('T')[0]}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

    return response;
  } catch (error) {
    console.error('PDF生成失败:', error);
    return NextResponse.json(
      {
        error: 'PDF生成失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
