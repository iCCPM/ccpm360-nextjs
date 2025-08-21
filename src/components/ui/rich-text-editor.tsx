'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Underline } from '@tiptap/extension-underline';
import { Strike } from '@tiptap/extension-strike';
import { Highlight } from '@tiptap/extension-highlight';
import { Button } from './button';
import { cn } from '@/lib/utils';

import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  ImageIcon,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  Link as LinkIcon,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

// 自定义图片扩展，支持大小调整、边框和对齐
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute('width'),
        renderHTML: (attributes) => {
          if (!attributes['width']) {
            return {};
          }
          return {
            width: attributes['width'],
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute('height'),
        renderHTML: (attributes) => {
          if (!attributes['height']) {
            return {};
          }
          return {
            height: attributes['height'],
          };
        },
      },
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) => {
          if (!attributes['style']) {
            return {};
          }
          return {
            style: attributes['style'],
          };
        },
      },
      align: {
        default: 'left',
        parseHTML: (element) => element.getAttribute('data-align') || 'left',
        renderHTML: (attributes) => {
          return {
            'data-align': attributes['align'],
          };
        },
      },
      border: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-border'),
        renderHTML: (attributes) => {
          if (!attributes['border']) {
            return {};
          }
          return {
            'data-border': attributes['border'],
          };
        },
      },
    };
  },
  addNodeView() {
    return ({ node, getPos, editor }) => {
      const container = document.createElement('div');
      container.className = 'image-container relative inline-block';

      const img = document.createElement('img');
      img.src = node.attrs['src'];
      img.alt = node.attrs['alt'] || '';
      img.className =
        'max-w-full h-auto rounded-lg cursor-pointer transition-all duration-200';

      // 应用样式属性
      if (node.attrs['width']) img.style.width = node.attrs['width'] + 'px';
      if (node.attrs['height']) img.style.height = node.attrs['height'] + 'px';
      if (node.attrs['style']) img.style.cssText += ';' + node.attrs['style'];

      // 应用对齐
      if (node.attrs['align'] === 'center') {
        container.style.display = 'block';
        container.style.margin = '0 auto';
        container.style.width = 'fit-content';
        img.style.display = 'block';
      } else if (node.attrs['align'] === 'right') {
        container.style.display = 'block';
        container.style.marginLeft = 'auto';
        container.style.marginRight = '0';
        container.style.width = 'fit-content';
        img.style.display = 'block';
      } else {
        container.style.display = 'inline-block';
        container.style.margin = '0';
        container.style.width = 'auto';
        img.style.display = 'inline-block';
      }

      // 应用边框
      if (node.attrs['border']) {
        img.style.border = node.attrs['border'];
      }

      // 点击事件
      img.addEventListener('click', () => {
        if (typeof getPos === 'function') {
          const pos = getPos();
          if (typeof pos === 'number') {
            editor.commands.setNodeSelection(pos);
          }
        }
      });

      container.appendChild(img);
      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'image') return false;
          img.src = updatedNode.attrs['src'];
          img.alt = updatedNode.attrs['alt'] || '';

          // 更新尺寸
          if (updatedNode.attrs['width']) {
            img.style.width = updatedNode.attrs['width'] + 'px';
          } else {
            img.style.width = '';
          }
          if (updatedNode.attrs['height']) {
            img.style.height = updatedNode.attrs['height'] + 'px';
          } else {
            img.style.height = '';
          }
          if (updatedNode.attrs['style']) {
            img.style.cssText = updatedNode.attrs['style'];
          }
          if (updatedNode.attrs['border']) {
            img.style.border = updatedNode.attrs['border'];
          } else {
            img.style.border = '';
          }

          // 更新对齐
          if (updatedNode.attrs['align'] === 'center') {
            container.style.display = 'block';
            container.style.margin = '0 auto';
            container.style.width = 'fit-content';
            img.style.display = 'block';
          } else if (updatedNode.attrs['align'] === 'right') {
            container.style.display = 'block';
            container.style.marginLeft = 'auto';
            container.style.marginRight = '0';
            container.style.width = 'fit-content';
            img.style.display = 'block';
          } else {
            container.style.display = 'inline-block';
            container.style.margin = '0';
            container.style.width = 'auto';
            img.style.display = 'inline-block';
          }

          return true;
        },
      };
    };
  },
});

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = '请输入内容...',
  className,
  disabled = false,
}) => {
  const [showImageControls, setShowImageControls] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [selectedImageAttrs, setSelectedImageAttrs] = useState<any>(null);
  const [tempImageAttrs, setTempImageAttrs] = useState<any>(null); // 临时图片属性
  const [aspectRatioLocked, setAspectRatioLocked] = useState(false); // 纵横比锁定状态
  const [originalImageSize, setOriginalImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null); // 原始图片尺寸
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // 确保组件只在客户端渲染
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      Underline,
      Strike,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      CustomImage.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg cursor-pointer',
        },
        inline: true,
        allowBase64: true,
      }),
    ],
    content: value,
    editable: !disabled,
    immediatelyRender: false, // 解决SSR兼容性问题
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    onSelectionUpdate: ({ editor }) => {
      // 检测图片选中状态
      const { selection } = editor.state;
      const node = selection.$anchor.node();

      if (node && node.type.name === 'image') {
        const imageAttrs = {
          width: node.attrs['width'] || '',
          height: node.attrs['height'] || '',
          align: node.attrs['align'] || 'left',
          border: node.attrs['border'] || '',
        };
        setSelectedImageAttrs(imageAttrs);
        setTempImageAttrs(imageAttrs); // 初始化临时属性

        // 获取图片的原始尺寸
        const imgElement = selection.$anchor.node()
          .firstChild as unknown as HTMLImageElement;
        if (imgElement && imgElement.tagName === 'IMG') {
          const img = new window.Image();
          img.onload = () => {
            setOriginalImageSize({
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
          };
          img.src = imgElement.src || node.attrs['src'];
        }

        setShowImageControls(true);
      } else if (editor.isActive('image')) {
        const attrs = editor.getAttributes('image');
        const imageAttrs = {
          width: attrs['width'] || '',
          height: attrs['height'] || '',
          align: attrs['align'] || 'left',
          border: attrs['border'] || '',
        };
        setSelectedImageAttrs(imageAttrs);
        setTempImageAttrs(imageAttrs); // 初始化临时属性

        // 获取图片的原始尺寸
        const imgSrc = attrs['src'];
        if (imgSrc) {
          const img = new window.Image();
          img.onload = () => {
            setOriginalImageSize({
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
          };
          img.src = imgSrc;
        }

        setShowImageControls(true);
      } else {
        setSelectedImageAttrs(null);
        setTempImageAttrs(null);
        setOriginalImageSize(null);
        setAspectRatioLocked(false);
        setShowImageControls(false);
      }
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
          'prose-headings:font-semibold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline',
          'prose-strong:text-gray-900 prose-em:text-gray-700',
          'prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4',
          'prose-ul:list-disc prose-ol:list-decimal',
          'prose-li:my-1 prose-p:my-2'
        ),
        placeholder: placeholder,
      },
    },
  });

  // 图片上传处理
  const handleImageUpload = useCallback(
    async (file: File) => {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('图片上传失败');
        }

        const data = await response.json();
        const imageUrl = data.url;

        // 插入图片到编辑器
        if (editor && imageUrl) {
          editor.chain().focus().setImage({ src: imageUrl }).run();
        }
      } catch (error) {
        console.error('图片上传错误:', error);
        alert('图片上传失败，请重试');
      }
    },
    [editor]
  );

  // 处理文件选择
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
      }
      // 清空input值，允许重复选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleImageUpload]
  );

  // 处理拖拽上传
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const files = Array.from(event.dataTransfer.files);
      const imageFile = files.find((file) => file.type.startsWith('image/'));
      if (imageFile) {
        handleImageUpload(imageFile);
      }
    },
    [handleImageUpload]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  // 链接处理函数
  const handleAddLink = useCallback(() => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);

    if (selectedText) {
      setLinkText(selectedText);
    } else {
      setLinkText('');
    }

    const existingLink = editor.getAttributes('link');
    if (existingLink['href']) {
      setLinkUrl(existingLink['href']);
    } else {
      setLinkUrl('');
    }

    setShowLinkDialog(true);
  }, [editor]);

  const handleSaveLink = useCallback(() => {
    if (!linkUrl.trim() || !editor) return;

    // 格式化URL，确保有正确的协议前缀
    let formattedUrl = linkUrl.trim();

    // 如果URL不包含协议，自动添加https://
    if (
      !formattedUrl.match(/^https?:\/\//i) &&
      !formattedUrl.match(/^mailto:/i) &&
      !formattedUrl.match(/^tel:/i)
    ) {
      // 检查是否是相对路径（以/开头）
      if (formattedUrl.startsWith('/')) {
        // 保持相对路径不变
      } else {
        // 为普通域名添加https://前缀
        formattedUrl = 'https://' + formattedUrl;
      }
    }

    if (linkText && !editor.state.selection.empty) {
      // 如果有选中文本，直接添加链接
      editor.chain().focus().setLink({ href: formattedUrl }).run();
    } else if (linkText) {
      // 如果没有选中文本但有链接文本，插入新的链接
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${formattedUrl}">${linkText}</a>`)
        .run();
    } else {
      // 只有URL，插入URL作为文本
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${formattedUrl}">${formattedUrl}</a>`)
        .run();
    }

    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  }, [editor, linkUrl, linkText]);

  const handleRemoveLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  // 临时更新图片属性（不立即应用到编辑器）
  const updateTempImageAttributes = useCallback(
    (attrs: any) => {
      setTempImageAttrs((prev: any) => {
        const newAttrs = { ...prev, ...attrs };

        // 如果启用了纵横比锁定且有原始尺寸信息
        if (aspectRatioLocked && originalImageSize) {
          const aspectRatio =
            originalImageSize.width / originalImageSize.height;

          // 如果修改了宽度，自动计算高度
          if (attrs.width !== undefined && attrs.height === undefined) {
            const newWidth = attrs.width || originalImageSize.width;
            const newHeight = Math.round(newWidth / aspectRatio);
            newAttrs.height = newHeight;
          }
          // 如果修改了高度，自动计算宽度
          else if (attrs.height !== undefined && attrs.width === undefined) {
            const newHeight = attrs.height || originalImageSize.height;
            const newWidth = Math.round(newHeight * aspectRatio);
            newAttrs.width = newWidth;
          }
        }

        return newAttrs;
      });
    },
    [aspectRatioLocked, originalImageSize]
  );

  // 应用图片属性到编辑器
  const applyImageAttributes = useCallback(() => {
    if (!editor || !tempImageAttrs) return;

    editor.chain().focus().updateAttributes('image', tempImageAttrs).run();
    setSelectedImageAttrs(tempImageAttrs);
    setShowImageControls(false);
    setTempImageAttrs(null);
  }, [editor, tempImageAttrs]);

  // 取消图片属性修改
  const cancelImageAttributes = useCallback(() => {
    setTempImageAttrs(null);
    setShowImageControls(false);
  }, []);

  // 在服务端或编辑器未初始化时显示加载状态
  if (!isMounted || !editor) {
    return (
      <div
        className={cn(
          'border rounded-lg p-4 min-h-[200px] bg-gray-50',
          className
        )}
      >
        <div className="flex items-center justify-center h-full text-gray-500">
          加载编辑器中...
        </div>
      </div>
    );
  }

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* 工具栏 */}
      <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor?.isActive('bold') && 'bg-gray-200'
          )}
          disabled={disabled}
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor?.isActive('italic') && 'bg-gray-200'
          )}
          disabled={disabled}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor?.isActive('underline') && 'bg-gray-200'
          )}
          disabled={disabled}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor?.isActive('strike') && 'bg-gray-200'
          )}
          disabled={disabled}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor?.isActive('bulletList') && 'bg-gray-200'
          )}
          disabled={disabled}
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor?.isActive('orderedList') && 'bg-gray-200'
          )}
          disabled={disabled}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor?.isActive('blockquote') && 'bg-gray-200'
          )}
          disabled={disabled}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <div className="flex items-center space-x-1">
          <input
            type="color"
            onChange={(e) =>
              editor?.chain().focus().setColor(e.target.value).run()
            }
            value={editor?.getAttributes('textStyle')['color'] || '#000000'}
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            title="文字颜色"
            disabled={disabled}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleHighlight().run()}
            className={cn(
              'h-8 w-8 p-0',
              editor?.isActive('highlight') && 'bg-gray-200'
            )}
            disabled={disabled}
            title="高亮"
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <div className="flex items-center space-x-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddLink}
            className={cn(
              'h-8 w-8 p-0',
              editor?.isActive('link') && 'bg-gray-200'
            )}
            disabled={disabled}
            title="添加链接"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveLink}
            disabled={disabled || !editor?.isActive('link')}
            className="h-8 w-8 p-0"
            title="移除链接"
          >
            <Unlink className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowImageControls(!showImageControls)}
          className={cn('h-8 w-8 p-0', showImageControls && 'bg-gray-200')}
          disabled={disabled}
          title="图片设置"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().undo()}
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo() || disabled}
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* 图片控制面板 */}
      {showImageControls && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {selectedImageAttrs ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">图片设置</h4>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={cancelImageAttributes}
                    className="text-sm"
                  >
                    取消
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={applyImageAttributes}
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    应用
                  </Button>
                </div>
              </div>

              {/* 锁定纵横比 */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="aspectRatioLock"
                  checked={aspectRatioLocked}
                  onChange={(e) => setAspectRatioLocked(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="aspectRatioLock"
                  className="text-xs font-medium text-gray-600"
                >
                  锁定纵横比
                </label>
              </div>

              {/* 大小调整 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    宽度 (px)
                  </label>
                  <input
                    type="number"
                    value={tempImageAttrs?.width || ''}
                    onChange={(e) =>
                      updateTempImageAttributes({
                        width: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="自动"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    高度 (px)
                  </label>
                  <input
                    type="number"
                    value={tempImageAttrs?.height || ''}
                    onChange={(e) =>
                      updateTempImageAttributes({
                        height: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="自动"
                    min="1"
                  />
                </div>
              </div>

              {/* 对齐方式 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  对齐方式
                </label>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => updateTempImageAttributes({ align: 'left' })}
                    className={cn(
                      'h-8 w-8 p-0',
                      (tempImageAttrs?.align || selectedImageAttrs.align) ===
                        'left' && 'bg-gray-200'
                    )}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      updateTempImageAttributes({ align: 'center' })
                    }
                    className={cn(
                      'h-8 w-8 p-0',
                      (tempImageAttrs?.align || selectedImageAttrs.align) ===
                        'center' && 'bg-gray-200'
                    )}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      updateTempImageAttributes({ align: 'right' })
                    }
                    className={cn(
                      'h-8 w-8 p-0',
                      (tempImageAttrs?.align || selectedImageAttrs.align) ===
                        'right' && 'bg-gray-200'
                    )}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 边框设置 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  边框
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={
                      (
                        tempImageAttrs?.border || selectedImageAttrs.border
                      )?.split(' ')[0] || '0px'
                    }
                    onChange={(e) => {
                      const width = e.target.value;
                      const currentBorder =
                        tempImageAttrs?.border ||
                        selectedImageAttrs.border ||
                        '0px solid #000000';
                      const parts = currentBorder.split(' ');
                      const newBorder =
                        width === '0px'
                          ? null
                          : `${width} ${parts[1] || 'solid'} ${parts[2] || '#000000'}`;
                      updateTempImageAttributes({ border: newBorder });
                    }}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="0px">无边框</option>
                    <option value="1px">1px</option>
                    <option value="2px">2px</option>
                    <option value="3px">3px</option>
                    <option value="4px">4px</option>
                    <option value="5px">5px</option>
                  </select>
                  <select
                    value={
                      (
                        tempImageAttrs?.border || selectedImageAttrs.border
                      )?.split(' ')[1] || 'solid'
                    }
                    onChange={(e) => {
                      const style = e.target.value;
                      const currentBorder =
                        tempImageAttrs?.border ||
                        selectedImageAttrs.border ||
                        '1px solid #000000';
                      const parts = currentBorder.split(' ');
                      const newBorder = `${parts[0] || '1px'} ${style} ${parts[2] || '#000000'}`;
                      updateTempImageAttributes({ border: newBorder });
                    }}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={
                      !(tempImageAttrs?.border || selectedImageAttrs.border) ||
                      (
                        tempImageAttrs?.border || selectedImageAttrs.border
                      ).startsWith('0px')
                    }
                  >
                    <option value="solid">实线</option>
                    <option value="dashed">虚线</option>
                    <option value="dotted">点线</option>
                  </select>
                  <input
                    type="color"
                    value={
                      (
                        tempImageAttrs?.border || selectedImageAttrs.border
                      )?.split(' ')[2] || '#000000'
                    }
                    onChange={(e) => {
                      const color = e.target.value;
                      const currentBorder =
                        tempImageAttrs?.border ||
                        selectedImageAttrs.border ||
                        '1px solid #000000';
                      const parts = currentBorder.split(' ');
                      const newBorder = `${parts[0] || '1px'} ${parts[1] || 'solid'} ${color}`;
                      updateTempImageAttributes({ border: newBorder });
                    }}
                    className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                    title="边框颜色"
                    disabled={
                      !(tempImageAttrs?.border || selectedImageAttrs.border) ||
                      (
                        tempImageAttrs?.border || selectedImageAttrs.border
                      ).startsWith('0px')
                    }
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">请先选择一张图片</div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowImageControls(false)}
                className="text-sm"
              >
                关闭
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 链接对话框 */}
      {showLinkDialog && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">添加链接</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl('');
                  setLinkText('');
                }}
                className="text-sm"
              >
                取消
              </Button>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                链接地址
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                显示文字
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="链接文字"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl('');
                  setLinkText('');
                }}
              >
                取消
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveLink}
                disabled={!linkUrl.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                确定
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑器内容区域 */}
      <div className="relative" onDrop={handleDrop} onDragOver={handleDragOver}>
        <EditorContent
          editor={editor}
          className={cn(
            'prose-editor',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
