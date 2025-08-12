import React from 'react';
import { MDXProvider } from '@mdx-js/react';
import type { MDXComponents } from 'mdx/types';

// 自定义组件映射
const components: MDXComponents = {
  // 标题组件
  h1: ({ children, ...props }: any) => (
    <h1 className="text-4xl font-bold text-gray-900 mb-6 border-b-2 border-blue-600 pb-2" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className="text-3xl font-semibold text-gray-800 mb-4 mt-8" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="text-2xl font-medium text-gray-700 mb-3 mt-6" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: any) => (
    <h4 className="text-xl font-semibold text-gray-800 mb-2 mt-4" {...props}>
      {children}
    </h4>
  ),
  
  // 段落组件
  p: ({ children, ...props }: any) => (
    <p className="text-gray-600 leading-relaxed mb-4" {...props}>
      {children}
    </p>
  ),
  
  // 列表组件
  ul: ({ children, ...props }: any) => (
    <ul className="list-disc list-inside mb-4 space-y-2 text-gray-600" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-600" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="ml-4" {...props}>
      {children}
    </li>
  ),
  
  // 代码组件
  code: ({ children, className, ...props }: any) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: any) => (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4" {...props}>
      {children}
    </pre>
  ),
  
  // 引用组件
  blockquote: ({ children, ...props }: any) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 text-gray-700 italic" {...props}>
      {children}
    </blockquote>
  ),
  
  // 链接组件
  a: ({ children, href, ...props }: any) => (
    <a 
      href={href} 
      className="text-blue-600 hover:text-blue-800 underline" 
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  ),
  
  // 图片组件
  img: ({ src, alt, ...props }: any) => (
    <img 
      src={src} 
      alt={alt} 
      className="max-w-full h-auto rounded-lg shadow-md mb-4" 
      {...props} 
    />
  ),
  
  // 分割线
  hr: (props: any) => (
    <hr className="border-gray-300 my-8" {...props} />
  ),
  
  // 表格组件
  table: ({ children, ...props }: any) => (
    <div className="overflow-x-auto mb-4">
      <table className="min-w-full border-collapse border border-gray-300" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: any) => (
    <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: any) => (
    <td className="border border-gray-300 px-4 py-2" {...props}>
      {children}
    </td>
  ),
};

interface MDXRendererProps {
  children: React.ReactNode;
  customComponents?: MDXComponents;
}

export default function MDXRenderer({ children, customComponents = {} }: MDXRendererProps) {
  const mergedComponents = { ...components, ...customComponents };
  
  return (
    <MDXProvider components={mergedComponents}>
      <div className="prose prose-lg max-w-none">
        {children}
      </div>
    </MDXProvider>
  );
}