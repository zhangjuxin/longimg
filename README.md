<!--
 * @Author: zhangjuxin 
 * @Date: 2025-03-14 14:14:17
 * @LastEditors: zhangjuxin 
 * @LastEditTime: 2025-03-15 14:21:31
 * @FilePath: /长图编辑工具/README.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
# 长图编辑工具

一个简单而强大的网页长图编辑工具，支持图片上传、编辑和下载功能。

## 功能特点

- **图片上传**：支持拖放或点击上传图片
- **红框标注**：为图片添加红色边框标注
- **马赛克处理**：为敏感信息添加马赛克效果
- **文字编辑**：在图片上添加并编辑文字
- **缩放控制**：放大、缩小和重置图片视图
- **一键下载**：下载编辑后的图片

## 使用方法

1. 打开网页，将图片拖入上传区域，或点击上传区域选择图片
2. 图片加载后，使用顶部工具栏中的工具进行编辑：
   - 红框标注：点击红框工具，然后在图片上拖拽绘制矩形框
   - 马赛克：点击马赛克工具，然后在需要隐藏的区域涂抹
   - 文字编辑：点击文字工具，然后点击图片上的位置添加文字
3. 使用缩放工具查看图片细节
   - 按住Alt键并拖动可以移动画布视图
4. 编辑完成后点击"下载"按钮保存图片

## 技术实现

- HTML5 + CSS3 + JavaScript
- Fabric.js 用于canvas绘图和交互处理
- 响应式设计，支持各种尺寸的设备

## 本地部署

1. 下载所有文件到本地文件夹
2. 使用任意现代浏览器直接打开`index.html`文件
3. 无需安装任何依赖，可以直接使用

## 浏览器兼容性

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 注意事项

- 支持大多数图片格式（JPG, PNG, GIF等）
- 图片过大可能会影响性能
- 编辑操作在浏览器端完成，不会上传到服务器 

<script src="fix-download.js"></script> 

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation(); // 阻止事件冒泡
    
    // 其他代码...
} # longimg
