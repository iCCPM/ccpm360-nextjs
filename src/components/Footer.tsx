'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

const services = [
  { name: '关键链项目管理培训', href: '/services' },
  { name: '项目管理咨询服务', href: '/services' },
  { name: '定制化解决方案', href: '/services' },
  { name: '企业内训课程', href: '/services' },
];

// const resources = [
//   { name: '行业资讯', href: '/resources' },
//   { name: '技术文章', href: '/resources' },
//   { name: '最佳实践', href: '/resources' },
//   { name: '下载资源', href: '/resources' },
// ];

export default function Footer() {
  const [contactInfo, setContactInfo] = useState({
    contact_email: 'info@ccpm360.com',
    contact_phone: '400-123-4567',
    contact_address: '北京市朝阳区商务中心区',
  });

  // 加载联系信息
  useEffect(() => {
    const loadContactInfo = async () => {
      try {
        const response = await fetch('/api/contact-info');
        if (!response.ok) {
          throw new Error('获取联系信息失败');
        }

        const data = await response.json();

        setContactInfo((prev) => ({
          ...prev,
          contact_email: data.email || prev.contact_email,
          contact_phone: data.phone || prev.contact_phone,
          contact_address: data.address || prev.contact_address,
        }));
      } catch (error) {
        console.error('加载联系信息失败:', error);
        // 保持默认值
      }
    };

    loadContactInfo();
  }, []);

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      <div className="relative container-responsive py-16">
        <div className="grid-responsive-4">
          {/* 公司信息 */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center p-2">
                <Image
                  src="/ccpm360-logo.png"
                  alt="CCPM360"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  关键链项目管理研究院
                </h3>
                <div className="text-lg font-bold text-gradient-primary bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  CCPM360
                </div>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              专注于关键链项目管理（CCPM）的培训与咨询服务，帮助企业提升项目管理效率，实现项目成功交付。
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 rounded-full border border-blue-400/30">
              <span className="text-sm text-blue-300 font-semibold">
                国内领先的关键链项目管理专业服务机构
              </span>
            </div>
          </div>

          {/* 服务项目 */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
              服务项目
            </h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className="group flex items-center gap-3 text-gray-300 hover:text-blue-400 transition-all duration-300 p-2 rounded-lg hover:bg-white/5"
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full group-hover:scale-125 transition-transform"></div>
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 联系方式 */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-emerald-400 rounded-full"></div>
              联系我们
            </h3>
            <div className="space-y-4">
              <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  {contactInfo.contact_phone}
                </span>
              </div>
              <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  {contactInfo.contact_email}
                </span>
              </div>
              <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  {contactInfo.contact_address.split('\n')[0]}
                </span>
              </div>
              <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  周一至周五 9:00-18:00
                </span>
              </div>
            </div>
          </div>

          {/* 微信公众号 */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-emerald-400 rounded-full"></div>
              关注我们
            </h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full border border-green-400/30 mb-4">
                  <span className="text-sm text-green-300 font-semibold">
                    微信公众号：ccpm360
                  </span>
                </div>
                <div className="w-36 h-36 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl border-4 border-white/10">
                  <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-lg">
                          微信
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">二维码</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-3">
                  扫码关注获取更多资讯
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部版权信息 */}
        <div className="mt-16 pt-8 border-t border-gradient-to-r from-transparent via-gray-700 to-transparent">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <p className="text-gray-400 text-sm font-medium">
                &copy; 2024 关键链项目管理研究院. 保留所有权利.
              </p>
            </div>
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className="group text-gray-400 hover:text-blue-400 text-sm transition-all duration-300 relative"
              >
                <span className="relative z-10">隐私政策</span>
                <div className="absolute inset-0 bg-blue-400/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </Link>
              <Link
                href="/"
                className="group text-gray-400 hover:text-blue-400 text-sm transition-all duration-300 relative"
              >
                <span className="relative z-10">服务条款</span>
                <div className="absolute inset-0 bg-blue-400/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </Link>
              <Link
                href="/"
                className="group text-gray-400 hover:text-blue-400 text-sm transition-all duration-300 relative"
              >
                <span className="relative z-10">网站地图</span>
                <div className="absolute inset-0 bg-blue-400/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
