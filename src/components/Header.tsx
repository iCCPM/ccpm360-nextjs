'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

const navigation = [
  { name: '首页home', href: '/' },
  { name: '关于我们', href: '/about' },
  { name: '服务项目', href: '/services' },
  { name: '成功案例', href: '/cases' },
  { name: '资源中心', href: '/resources' },
  { name: 'CCPM博客', href: '/blog' },
  { name: '联系我们', href: '/contact' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-100 sticky top-0 z-50">
      <nav className="container-responsive flex items-center justify-between py-4" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <Image 
              src="/ccpm360-logo.png" 
              alt="CCPM360" 
              width={40}
              height={40}
              className="h-10 w-auto"
              style={{ width: 'auto', height: 'auto' }}
            />
            <span className="text-xl font-bold text-blue-800 hidden sm:block font-ethnocentric">CCPM360</span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">打开主菜单</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`relative px-3 py-2 text-sm font-semibold leading-6 transition-all duration-300 rounded-lg hover:bg-gray-50 ${
                pathname === item.href
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {item.name}
              {pathname === item.href && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
              )}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Link
            href="/contact"
            className="btn-gradient-primary inline-flex items-center gap-2"
          >
            <Phone className="h-4 w-4" />
            立即咨询
          </Link>
        </div>
      </nav>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="fixed inset-y-0 right-0 z-[9999] w-full h-screen overflow-y-auto bg-white/95 backdrop-blur-md px-6 py-6 sm:max-w-sm border-l border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                <Image 
                  src="/ccpm360-logo.png" 
                  alt="CCPM360" 
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                  style={{ width: 'auto', height: 'auto' }}
                />
                <span className="text-xl font-bold text-blue-800 font-ethnocentric">CCPM360</span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-xl p-2.5 text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">关闭菜单</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-8 flow-root">
              <div className="space-y-6">
                <div className="space-y-3">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block rounded-xl px-4 py-3 text-base font-semibold leading-7 transition-all duration-200 ${
                        pathname === item.href
                          ? 'text-blue-600 bg-blue-50 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    href="/contact"
                    className="btn-gradient-primary w-full justify-center inline-flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Phone className="h-4 w-4" />
                    立即咨询
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}