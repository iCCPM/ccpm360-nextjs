'use client';

import { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  User,
  MessageSquare,
  Building,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { contactAPI, type ContactSubmission } from '@/lib/supabase';
// EmailJS导入已移除，现在使用API路由发送邮件
import BaiduMap from '@/components/BaiduMap';

interface FormData {
  name: string;
  company: string;
  position: string;
  phone: string;
  email: string;
  serviceType: string;
  message: string;
}

const serviceTypes = [
  { value: 'training', label: 'CCPM培训课程' },
  { value: 'consulting', label: '项目管理咨询' },
  { value: 'implementation', label: 'CCPM实施指导' },
  { value: 'assessment', label: '项目管理评估' },
  { value: 'other', label: '其他服务' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    company: '',
    position: '',
    phone: '',
    email: '',
    serviceType: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    contact_email: 'business@ccpm360.com',
    contact_phone: '400-888-9999',
    contact_address: '北京市海淀区中关村科技园区\n创新大厦A座15层1501室',
    direct_phone: '010-8888-9999',
    support_email: 'support@ccpm360.com',
    business_hours_weekday: '周一至周五：9:00 - 18:00',
    business_hours_weekend: '周六：9:00 - 12:00',
    wechat_account_name: 'CCPM360项目管理',
    wechat_description: '获取最新行业资讯、管理技巧和培训信息',
    wechat_qr_code: '',
    subway_route: '地铁4号线/10号线海淀黄庄站A2出口，步行约5分钟',
    bus_route:
      '乘坐26路、302路、332路、394路、608路、614路、681路、683路、717路、732路、801路、808路、814路、运通105线、运通106线、运通205线等公交车至中关村站下车',
    driving_route: '导航至"中关村大街27号"，周边有多个停车场可供选择',
    traffic_tips:
      '建议优先选择地铁出行，避开早晚高峰时段。如需驾车前往，请提前了解停车位情况。',
    map_title: 'CCPM360办公室',
    map_description: '欢迎您到访我们的办公室',
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
          direct_phone: data.phone || prev.direct_phone,
          support_email: data.email || prev.support_email,
          business_hours_weekday: data.working_hours || '周一至周五 9:00-18:00',
          business_hours_weekend:
            data.weekend_hours || '周六日及节假日 08:00~22:00',
          wechat_account_name: data.wechat || 'CCPM360咨询',
          wechat_description: '关注获取最新项目管理资讯',
          wechat_qr_code: '/placeholder-qr-code.svg',
          subway_route: data.subway_route || prev.subway_route,
          bus_route: data.bus_route || prev.bus_route,
          driving_route: data.driving_route || prev.driving_route,
          traffic_tips: data.traffic_tips || prev.traffic_tips,
          map_title: data.map_title || 'CCPM360办公室',
          map_description: data.map_description || '欢迎您到访我们的办公室',
        }));
      } catch (error) {
        console.error('加载联系信息失败:', error);
        // 保持默认值
      }
    };

    loadContactInfo();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setEmailSent(false);

    try {
      // 1. 通过API路由发送邮件通知
      try {
        const emailResponse = await fetch('/api/assessment/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientEmail: 'business@ccpm360.com', // 发送到业务邮箱
            type: 'contact_inquiry',
            data: {
              userName: formData.name,
              userEmail: formData.email,
              userPhone: formData.phone,
              userCompany: formData.company || '未填写',
              userPosition: formData.position || '未填写',
              serviceType:
                serviceTypes.find((t) => t.value === formData.serviceType)
                  ?.label || '未选择',
              userMessage: formData.message,
            },
          }),
        });

        if (emailResponse.ok) {
          setEmailSent(true);
        } else {
          console.warn('邮件发送失败，但继续保存到数据库');
        }
      } catch (emailError) {
        console.warn('邮件发送失败，但继续保存到数据库:', emailError);
      }

      // 2. 保存到数据库
      const submissionData: ContactSubmission = {
        name: formData.name,
        ...(formData.company && { company: formData.company }),
        ...(formData.position && { position: formData.position }),
        phone: formData.phone,
        email: formData.email,
        service_type: formData.serviceType,
        message: formData.message,
      };

      await contactAPI.submitForm(submissionData);

      setIsSubmitting(false);
      setIsSubmitted(true);

      // 重置表单
      setTimeout(() => {
        setIsSubmitted(false);
        setEmailSent(false);
        setFormData({
          name: '',
          company: '',
          position: '',
          phone: '',
          email: '',
          serviceType: '',
          message: '',
        });
      }, 5000);
    } catch (error) {
      setIsSubmitting(false);
      setSubmitError(
        error instanceof Error ? error.message : '提交失败，请稍后重试'
      );
    }
  };

  return (
    <div>
      {/* 页面标题 */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-6">
              <Mail className="w-4 h-4 mr-2" />
              联系咨询
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                联系我们
              </span>
            </h1>
            <p className="mt-8 text-xl leading-9 text-blue-100 max-w-2xl mx-auto">
              专业的项目管理咨询团队，随时为您提供个性化解决方案
            </p>
            <div className="mt-8 flex items-center justify-center space-x-8 text-blue-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>专业团队</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>快速响应</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>定制方案</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 联系信息和表单 */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* 联系信息 */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
                  联系方式
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Phone className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        咨询热线
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {contactInfo.contact_phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        电子邮箱
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {contactInfo.contact_email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        办公地址
                      </h3>
                      <p className="text-gray-600 mt-1 whitespace-pre-line">
                        {contactInfo.contact_address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        营业时间
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {contactInfo.business_hours_weekday}
                      </p>
                      <p className="text-sm text-gray-500">
                        {contactInfo.business_hours_weekend}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 微信公众号 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    关注微信公众号
                  </h3>
                  <div className="inline-block bg-white p-4 rounded-xl shadow-sm">
                    {contactInfo.wechat_qr_code ? (
                      <img
                        src={contactInfo.wechat_qr_code}
                        alt="微信公众号二维码"
                        className="w-32 h-32 mx-auto"
                      />
                    ) : (
                      <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-sm">加载中...</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="font-semibold text-gray-900">
                      {contactInfo.wechat_account_name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {contactInfo.wechat_description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 咨询表单 */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
                  在线咨询
                </h2>
                <p className="text-lg text-gray-600">
                  填写您的需求，我们将为您提供专业的解决方案
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-800 mb-3"
                    >
                      姓名 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white"
                        placeholder="请输入您的姓名"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-semibold text-gray-800 mb-3"
                    >
                      公司名称
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white"
                        placeholder="请输入公司名称"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="position"
                      className="block text-sm font-semibold text-gray-800 mb-3"
                    >
                      职位
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white"
                        placeholder="请输入您的职位"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-gray-800 mb-3"
                    >
                      联系电话 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white"
                        placeholder="请输入联系电话"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-800 mb-3"
                  >
                    电子邮箱 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white"
                      placeholder="请输入电子邮箱"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="serviceType"
                    className="block text-sm font-semibold text-gray-800 mb-3"
                  >
                    咨询服务类型 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    required
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white"
                  >
                    <option value="">请选择服务类型</option>
                    {serviceTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-800 mb-3"
                  >
                    详细需求 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white"
                      placeholder="请详细描述您的需求，我们将为您提供专业的解决方案..."
                    />
                  </div>
                </div>

                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      <p className="text-sm text-red-800">{submitError}</p>
                    </div>
                  </div>
                )}

                {isSubmitted && emailSent && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <p className="text-sm text-green-800">
                        <strong>提交成功！</strong>您的咨询信息已发送到
                        business@ccpm360.com，我们将在24小时内回复您。
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || isSubmitted}
                  className={`w-full py-4 px-8 rounded-2xl font-bold text-lg text-white transition-all duration-300 flex items-center justify-center transform hover:scale-105 ${
                    isSubmitted
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl'
                      : isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 shadow-xl hover:shadow-2xl focus:ring-4 focus:ring-orange-300 focus:ring-offset-2'
                  }`}
                >
                  {isSubmitted ? (
                    <>
                      <CheckCircle className="h-6 w-6 mr-3" />
                      <span className="animate-pulse">
                        {emailSent ? '提交成功，邮件已发送' : '提交成功'}
                      </span>
                    </>
                  ) : isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      <span className="animate-pulse">发送邮件中...</span>
                    </>
                  ) : (
                    <div className="group flex items-center">
                      <Send className="h-6 w-6 mr-3 group-hover:translate-x-1 transition-transform duration-200" />
                      <span>提交咨询</span>
                    </div>
                  )}
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>温馨提示：</strong>
                  我们将在24小时内回复您的咨询，请保持电话畅通。如有紧急需求，请直接拨打咨询热线。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 地图区域 */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
              办公位置
            </h2>
            <p className="text-lg text-gray-600">
              欢迎您到访我们的办公室进行面对面交流
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid lg:grid-cols-3 gap-0">
              {/* 地址信息卡片 */}
              <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <MapPin className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        办公地址
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {contactInfo.contact_address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Clock className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        工作时间
                      </h3>
                      <p className="text-gray-700 whitespace-pre-line">
                        {contactInfo.business_hours_weekday ||
                          '周一至周五 9:00-18:00'}
                        {'\n'}
                        {contactInfo.business_hours_weekend ||
                          '周六日及节假日 08:00~22:00'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 百度交互式地图 */}
              <div className="lg:col-span-2 relative h-96 lg:h-auto min-h-[400px]">
                <BaiduMap
                  className="rounded-r-2xl lg:rounded-r-2xl lg:rounded-l-none overflow-hidden"
                  height="100%"
                  address={contactInfo.contact_address}
                  zoom={16}
                  title={contactInfo.map_title}
                  description={contactInfo.map_description}
                />
              </div>
            </div>
          </div>

          {/* 交通指南 */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">交通指南</h3>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    地
                  </span>
                  地铁路线
                </h4>
                <p className="text-gray-600 ml-9 whitespace-pre-line">
                  {contactInfo.subway_route ||
                    '地铁4号线/10号线海淀黄庄站A2出口，步行约5分钟'}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    公
                  </span>
                  公交路线
                </h4>
                <p className="text-gray-600 ml-9 whitespace-pre-line">
                  {contactInfo.bus_route ||
                    '乘坐26路、302路、332路、394路、608路、614路、681路、683路、717路、732路、801路、808路、814路、运通105线、运通106线、运通205线等公交车至中关村站下车'}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    车
                  </span>
                  自驾路线
                </h4>
                <p className="text-gray-600 ml-9 whitespace-pre-line">
                  {contactInfo.driving_route ||
                    '导航至"中关村大街27号"，周边有多个停车场可供选择'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 whitespace-pre-line">
                <strong>温馨提示：</strong>
                {contactInfo.traffic_tips ||
                  '建议优先选择地铁出行，避开早晚高峰时段。如需驾车前往，请提前了解停车位情况。'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ区域 */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              常见问题
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              快速了解我们的服务和合作方式
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Q: CCPM培训课程的周期是多长？
                </h3>
                <p className="text-gray-600">
                  A:
                  我们提供不同层次的培训课程，基础课程为2-3天，高级课程为5-7天，企业定制培训可根据需求灵活安排。
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Q: 咨询服务的收费标准是什么？
                </h3>
                <p className="text-gray-600">
                  A:
                  咨询费用根据项目复杂度、服务周期和客户需求确定。我们提供免费的初步评估，详细报价会在需求分析后提供。
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Q: 是否提供远程咨询服务？
                </h3>
                <p className="text-gray-600">
                  A:
                  是的，我们支持线上线下相结合的服务模式，可通过视频会议、在线协作工具等方式提供远程咨询和培训服务。
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Q: 如何保证项目实施效果？
                </h3>
                <p className="text-gray-600">
                  A:
                  我们采用阶段性评估和持续跟踪的方式，确保项目按计划推进。同时提供后续支持服务，保障实施效果的持续性。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
