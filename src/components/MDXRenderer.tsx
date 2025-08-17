'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MDXRendererProps {
  content: string;
}

export function MDXRenderer({ content }: MDXRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // 自定义代码块渲染
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={tomorrow}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code
              className={
                inline
                  ? 'bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono'
                  : className
              }
              {...props}
            >
              {children}
            </code>
          );
        },
        // 自定义标题渲染
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3">
            {children}
          </h4>
        ),
        // 自定义段落渲染
        p: ({ children }) => (
          <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
        ),
        // 自定义列表渲染
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        // 自定义链接渲染
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-blue-600 hover:text-blue-700 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        // 自定义引用块渲染
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 text-gray-700 italic">
            {children}
          </blockquote>
        ),
        // 自定义表格渲染
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-gray-50">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody className="bg-white divide-y divide-gray-200">
            {children}
          </tbody>
        ),
        tr: ({ children }) => <tr>{children}</tr>,
        th: ({ children }) => (
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200 last:border-r-0">
            {children}
          </td>
        ),
        // 自定义强调文本渲染
        strong: ({ children }) => (
          <strong className="font-bold text-gray-900">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-gray-700">{children}</em>
        ),
        // 自定义水平线渲染
        hr: () => <hr className="my-8 border-gray-300" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default MDXRenderer;
