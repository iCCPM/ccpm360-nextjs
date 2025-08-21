'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';

// 声明百度地图全局变量类型
declare global {
  interface Window {
    BMap: any;
    initBaiduMap: () => void;
  }
}

interface BaiduMapProps {
  width?: string;
  height?: string;
  className?: string;
  center?: { lng: number; lat: number };
  zoom?: number;
  markers?: Array<{
    lng: number;
    lat: number;
    title?: string;
    content?: string;
  }>;
  address?: string; // 新增：支持地址输入进行地理编码
  title?: string; // 新增：地图标记标题
  description?: string; // 新增：地图标记描述
}

const BAIDU_AK = process.env['NEXT_PUBLIC_BAIDU_MAP_AK'] || '';

// 默认公司位置（北京中关村）
const DEFAULT_CENTER = { lng: 116.3074, lat: 39.9776 };
const DEFAULT_ZOOM = 16;

export default function BaiduMap({
  width = '100%',
  height = '400px',
  className = '',
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  markers = [
    {
      lng: DEFAULT_CENTER.lng,
      lat: DEFAULT_CENTER.lat,
      title: 'CCPM360办公室',
      content: '北京市海淀区中关村科技园区<br/>创新大厦A座15层1501室',
    },
  ],
  address,
  title = 'CCPM360办公室',
  description = '北京市海淀区中关村科技园区<br/>创新大厦A座15层1501室',
}: BaiduMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [lastGeocodedAddress, setLastGeocodedAddress] = useState<string>('');

  // 地理编码函数
  const geocodeAddress = async (
    addressText: string
  ): Promise<{ lng: number; lat: number } | null> => {
    if (!addressText || !(window as any).BMap) {
      return null;
    }

    return new Promise((resolve) => {
      const BMap = (window as any).BMap;
      const geocoder = new BMap.Geocoder();

      geocoder.getPoint(
        addressText,
        (point: any) => {
          if (point) {
            resolve({ lng: point.lng, lat: point.lat });
          } else {
            console.warn(`地理编码失败: ${addressText}`);
            resolve(null);
          }
        },
        '中国'
      );
    });
  };

  // 处理地址变化的useEffect - 只更新地图中心点和标记，不重新初始化地图
  useEffect(() => {
    if (!address || !mapInstance) return;

    // 检查地址是否真的发生了变化，避免不必要的地理编码
    if (address === lastGeocodedAddress) return;

    // 添加防抖机制，避免频繁的地理编码请求
    const debounceTimer = setTimeout(() => {
      const performGeocoding = async () => {
        setIsGeocoding(true);
        try {
          const result = await geocodeAddress(address);
          let finalCenter;

          if (result) {
            // 地理编码成功，使用编码结果
            finalCenter = result;
          } else {
            // 地理编码失败，使用默认坐标作为降级处理
            console.warn(`地理编码失败，使用默认坐标: ${address}`);
            finalCenter = DEFAULT_CENTER;
          }

          // 更新地图中心点
          const BMap = (window as any).BMap;
          const newPoint = new BMap.Point(finalCenter.lng, finalCenter.lat);
          mapInstance.centerAndZoom(newPoint, zoom);

          // 清除旧标记并添加新标记
          mapInstance.clearOverlays();
          const marker = new BMap.Marker(newPoint);
          mapInstance.addOverlay(marker);

          // 添加信息窗口
          const infoWindow = new BMap.InfoWindow(
            `<div style="padding: 8px;">
              <h4 style="margin: 0 0 8px 0; font-weight: bold;">${title}</h4>
              <p style="margin: 0; line-height: 1.4;">${address}</p>
              ${description ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">${description}</p>` : ''}
              ${!result ? '<p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">（使用默认位置）</p>' : ''}
            </div>`,
            { width: 250, height: (result ? 80 : 100) + (description ? 20 : 0) }
          );

          marker.addEventListener('click', () => {
            mapInstance.openInfoWindow(infoWindow, newPoint);
          });

          // 默认打开信息窗口
          setTimeout(() => {
            mapInstance.openInfoWindow(infoWindow, newPoint);
          }, 500);

          // 更新最后地理编码的地址
          setLastGeocodedAddress(address);
        } catch (err) {
          console.error('地理编码过程中出错:', err);
          // 发生异常时也使用默认坐标
          const BMap = (window as any).BMap;
          const defaultPoint = new BMap.Point(
            DEFAULT_CENTER.lng,
            DEFAULT_CENTER.lat
          );
          mapInstance.centerAndZoom(defaultPoint, zoom);

          mapInstance.clearOverlays();
          const marker = new BMap.Marker(defaultPoint);
          mapInstance.addOverlay(marker);

          const infoWindow = new BMap.InfoWindow(
            `<div style="padding: 8px;">
              <h4 style="margin: 0 0 8px 0; font-weight: bold;">${title}</h4>
              <p style="margin: 0; line-height: 1.4;">${address}</p>
              ${description ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">${description}</p>` : ''}
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">（定位失败，使用默认位置）</p>
            </div>`,
            { width: 250, height: 100 + (description ? 20 : 0) }
          );

          marker.addEventListener('click', () => {
            mapInstance.openInfoWindow(infoWindow, defaultPoint);
          });

          setTimeout(() => {
            mapInstance.openInfoWindow(infoWindow, defaultPoint);
          }, 500);
        } finally {
          setIsGeocoding(false);
        }
      };

      performGeocoding();
    }, 1000); // 1秒防抖延迟

    // 清理定时器
    return () => {
      clearTimeout(debounceTimer);
    };
  }, [address, mapInstance, zoom]);

  // 地图初始化useEffect - 只在组件挂载时执行一次
  useEffect(() => {
    let isMounted = true;

    const loadBaiduMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 检查是否已经加载了百度地图API
        if (typeof window !== 'undefined' && (window as any).BMap) {
          initializeMap();
          return;
        }

        // 动态加载百度地图API
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://api.map.baidu.com/api?v=3.0&ak=${BAIDU_AK}&callback=initBaiduMap`;
        script.async = true;

        // 设置全局回调函数
        (window as any).initBaiduMap = () => {
          if (isMounted) {
            initializeMap();
          }
        };

        script.onerror = (_event) => {
          if (isMounted) {
            // 检测是否是浏览器阻止导致的错误
            const userAgent = navigator.userAgent;
            const isEdge = userAgent.includes('Edg/');
            const isChrome = userAgent.includes('Chrome/');

            let errorMessage = '百度地图API加载失败';

            // 针对不同浏览器提供特定的解决方案
            if (isEdge) {
              errorMessage =
                'Edge浏览器的跟踪保护功能阻止了地图加载。请在浏览器设置中允许此网站加载第三方内容，或暂时关闭跟踪保护功能。';
            } else if (isChrome) {
              errorMessage =
                '地图加载被浏览器阻止。请检查是否启用了广告拦截器或隐私保护扩展，并将此网站添加到白名单。';
            } else {
              errorMessage =
                '地图加载失败。可能是浏览器安全设置或扩展程序阻止了第三方内容加载。';
            }

            setError(errorMessage);
            setIsLoading(false);
          }
        };

        // 添加超时检测，防止脚本加载卡住
        const timeoutId = setTimeout(() => {
          if (isMounted && !window.BMap) {
            const userAgent = navigator.userAgent;
            const isEdge = userAgent.includes('Edg/');

            let timeoutMessage = '地图加载超时';
            if (isEdge) {
              timeoutMessage =
                'Edge浏览器可能阻止了地图加载。请检查浏览器的跟踪保护设置。';
            }

            setError(timeoutMessage);
            setIsLoading(false);
          }
        }, 10000); // 10秒超时

        document.head.appendChild(script);

        // 清理函数
        return () => {
          clearTimeout(timeoutId);
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }
          delete (window as any).initBaiduMap;
        };
      } catch (err) {
        if (isMounted) {
          setError('地图初始化失败');
          setIsLoading(false);
        }
        return;
      }
    };

    const initializeMap = () => {
      if (!mapRef.current || !(window as any).BMap) {
        setError('地图容器或API未准备就绪');
        setIsLoading(false);
        return;
      }

      try {
        const BMap = (window as any).BMap;

        // 创建地图实例
        const map = new BMap.Map(mapRef.current);

        // 设置中心点和缩放级别
        const point = new BMap.Point(center.lng, center.lat);
        map.centerAndZoom(point, zoom);

        // 启用滚轮缩放
        map.enableScrollWheelZoom(true);

        // 添加地图控件
        map.addControl(new BMap.MapTypeControl());
        map.addControl(new BMap.ScaleControl());
        map.addControl(new BMap.OverviewMapControl());
        map.addControl(new BMap.NavigationControl());

        // 添加标记点（如果没有提供地址，使用默认标记）
        if (!address) {
          markers.forEach((marker) => {
            const markerPoint = new BMap.Point(marker.lng, marker.lat);
            const mapMarker = new BMap.Marker(markerPoint);
            map.addOverlay(mapMarker);

            // 添加信息窗口
            if (marker.title || marker.content) {
              const infoWindow = new BMap.InfoWindow(
                `<div style="padding: 8px;">
                  ${marker.title ? `<h4 style="margin: 0 0 8px 0; font-weight: bold;">${marker.title}</h4>` : ''}
                  ${marker.content ? `<p style="margin: 0; line-height: 1.4;">${marker.content}</p>` : ''}
                  ${description ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">${description}</p>` : ''}
                </div>`,
                {
                  width: 250,
                  height: description ? 100 : 80,
                }
              );

              mapMarker.addEventListener('click', () => {
                map.openInfoWindow(infoWindow, markerPoint);
              });

              // 默认打开第一个标记的信息窗口
              if (markers.indexOf(marker) === 0) {
                setTimeout(() => {
                  map.openInfoWindow(infoWindow, markerPoint);
                }, 500);
              }
            }
          });
        }

        setMapInstance(map);
        setIsLoading(false);
      } catch (err) {
        console.error('地图初始化错误:', err);
        setError('地图初始化失败，请稍后重试');
        setIsLoading(false);
      }
    };

    loadBaiduMap();

    return () => {
      isMounted = false;
      if (mapInstance) {
        try {
          mapInstance.clearOverlays();
        } catch (err) {
          console.warn('清理地图覆盖物时出错:', err);
        }
      }
    };
  }, []); // 空依赖数组，只在组件挂载时执行一次

  if (error) {
    const isEdgeError = error.includes('Edge浏览器');
    const isChromeError = error.includes('广告拦截器');

    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ width, height }}
      >
        <div className="text-center p-6 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            地图加载失败
          </h3>
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">{error}</p>

          {isEdgeError && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
              <h4 className="font-semibold text-blue-900 mb-2">解决步骤：</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. 点击地址栏右侧的盾牌图标</li>
                <li>2. 选择"关闭此站点的跟踪保护"</li>
                <li>3. 或者进入设置 → 隐私、搜索和服务</li>
                <li>4. 在跟踪保护中添加此网站为例外</li>
              </ol>
            </div>
          )}

          {isChromeError && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-left">
              <h4 className="font-semibold text-green-900 mb-2">解决步骤：</h4>
              <ol className="text-sm text-green-800 space-y-1">
                <li>1. 检查浏览器扩展（如AdBlock）</li>
                <li>2. 将此网站添加到白名单</li>
                <li>3. 或暂时禁用广告拦截器</li>
              </ol>
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {(isLoading || isGeocoding) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {isGeocoding ? '正在定位地址...' : '正在加载地图...'}
            </p>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg"
        style={{ width, height }}
      />
    </div>
  );
}
