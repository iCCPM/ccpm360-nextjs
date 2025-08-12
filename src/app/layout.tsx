import type { Metadata } from "next";
import "./globals.css";
import Layout from "../components/Layout";

export const metadata: Metadata = {
  title: "CCPM360 - 关键链项目管理研究院",
  description: "专注于关键链项目管理（CCPM）的培训与咨询服务，帮助企业提升项目管理效率，实现项目成功交付。",
  keywords: "关键链项目管理,CCPM,项目管理培训,项目管理咨询,企业培训",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
