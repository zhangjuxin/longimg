// 全局变量
let canvas;
let currentZoom = 1;
let isDragging = false;
let lastPosX = 0;
let lastPosY = 0;
let activeTool = null;
let undoStack = [];
const maxUndoSteps = 20; // 最大撤销步骤数
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 兼容性检查
const compatibilityCheck = {
    hasCanvas: !!window.HTMLCanvasElement,
    hasFileReader: !!window.FileReader,
    hasFabric: typeof fabric !== 'undefined',
    webGL: (function() {
        try {
            return !!window.WebGLRenderingContext &&
                !!document.createElement('canvas').getContext('webgl');
        } catch (e) {
            return false;
        }
    })()
};

// 工具设置
const toolSettings = {
    rectangle: {
        borderWidth: 3,
        borderColor: '#ff0000'
    },
    mosaic: {
        blockSize: 15,
        brushSize: 30
    },
    text: {
        fontSize: 16,
        fontFamily: 'Arial',
        textColor: '#000000',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        isBold: false,
        isItalic: false
    }
};

// DOM 元素
let dropZone, fileInput, canvasContainer, tipsElement, loadingIndicator, errorMessage,
    rectangleTool, mosaicTool, textTool, undoBtn, zoomIn, zoomOut, resetZoom, downloadBtn, backBtn;

// 增加一个函数来安全地获取DOM元素
function initDOMReferences() {
    try {
        console.log('正在初始化DOM引用...');

        // 使用前清空全局变量引用，避免旧的无效引用
        dropZone = null;
        fileInput = null;
        canvasContainer = null;
        tipsElement = null;
        loadingIndicator = null;
        errorMessage = null;
        rectangleTool = null;
        mosaicTool = null;
        textTool = null;
        undoBtn = null;
        zoomIn = null;
        zoomOut = null;
        resetZoom = null;
        downloadBtn = null;
        backBtn = null;

        // 逐个获取元素，并记录结果
        dropZone = document.getElementById('drop-zone');
        fileInput = document.getElementById('file-input');
        canvasContainer = document.getElementById('canvas-container');
        tipsElement = document.getElementById('tips');
        loadingIndicator = document.getElementById('loading-indicator');
        errorMessage = document.getElementById('error-message');
        rectangleTool = document.getElementById('rectangle-tool');
        mosaicTool = document.getElementById('mosaic-tool');
        textTool = document.getElementById('text-tool');
        undoBtn = document.getElementById('undo-btn');
        zoomIn = document.getElementById('zoom-in');
        zoomOut = document.getElementById('zoom-out');
        resetZoom = document.getElementById('reset-zoom');
        downloadBtn = document.getElementById('download-btn');
        backBtn = document.getElementById('back-btn');

        // 记录获取结果，方便调试
        const elements = {
            dropZone: !!dropZone,
            fileInput: !!fileInput,
            canvasContainer: !!canvasContainer,
            tipsElement: !!tipsElement,
            loadingIndicator: !!loadingIndicator,
            errorMessage: !!errorMessage,
            rectangleTool: !!rectangleTool,
            mosaicTool: !!mosaicTool,
            textTool: !!textTool,
            undoBtn: !!undoBtn,
            zoomIn: !!zoomIn,
            zoomOut: !!zoomOut,
            resetZoom: !!resetZoom,
            downloadBtn: !!downloadBtn,
            backBtn: !!backBtn
        };

        console.log('DOM元素引用状态:', elements);

        // 检查关键元素
        let missingElements = [];
        if (!dropZone) missingElements.push('drop-zone');
        if (!fileInput) missingElements.push('file-input');
        if (!canvasContainer) missingElements.push('canvas-container');

        if (missingElements.length > 0) {
            console.warn(`以下关键DOM元素不存在: ${missingElements.join(', ')}`);

            // 尝试创建缺失的关键元素
            const mainElement = document.querySelector('main');
            if (mainElement) {
                // 如果缺少drop-zone，尝试创建
                if (!dropZone) {
                    dropZone = document.createElement('div');
                    dropZone.id = 'drop-zone';
                    dropZone.className = 'upload-area';
                    dropZone.innerHTML = '<p>将图片拖放到此处，或点击上传</p>';
                    mainElement.appendChild(dropZone);
                    console.log('已创建缺失的drop-zone元素');
                }

                // 如果缺少file-input，尝试创建
                if (!fileInput) {
                    fileInput = document.createElement('input');
                    fileInput.id = 'file-input';
                    fileInput.type = 'file';
                    fileInput.accept = 'image/*';
                    fileInput.style.display = 'none';
                    if (dropZone) {
                        dropZone.appendChild(fileInput);
                    } else {
                        mainElement.appendChild(fileInput);
                    }
                    console.log('已创建缺失的file-input元素');
                }

                // 如果缺少canvas-container，尝试创建
                if (!canvasContainer) {
                    canvasContainer = document.createElement('div');
                    canvasContainer.id = 'canvas-container';
                    canvasContainer.className = 'canvas-container';
                    canvasContainer.style.display = 'none';

                    const canvasElement = document.createElement('canvas');
                    canvasElement.id = 'editor-canvas';
                    canvasContainer.appendChild(canvasElement);

                    mainElement.appendChild(canvasContainer);
                    console.log('已创建缺失的canvas-container元素');
                }
            } else {
                console.error('无法找到main元素，无法创建缺失的关键DOM元素');
            }
        }

        // 再次检查关键元素是否已创建
        if (!dropZone || !fileInput || !canvasContainer) {
            return false;
        }

        return true;
    } catch (error) {
        console.error('初始化DOM引用时出错:', error);
        // 尝试创建并显示错误信息
        try {
            const errorDiv = document.createElement('div');
            errorDiv.style.position = 'fixed';
            errorDiv.style.top = '20px';
            errorDiv.style.left = '50%';
            errorDiv.style.transform = 'translateX(-50%)';
            errorDiv.style.padding = '10px 20px';
            errorDiv.style.backgroundColor = '#ff4d4f';
            errorDiv.style.color = 'white';
            errorDiv.style.borderRadius = '4px';
            errorDiv.style.zIndex = '9999';
            errorDiv.textContent = '初始化DOM引用时出错: ' + error.message;
            document.body.appendChild(errorDiv);

            // 3秒后自动删除
            setTimeout(() => {
                document.body.removeChild(errorDiv);
            }, 3000);
        } catch (e) {
            // 如果连错误显示都失败，只能记录到控制台
            console.error('无法显示错误信息:', e);
        }
        return false;
    }
}

// 添加样式
const style = document.createElement('style');
style.textContent = `
  #editor-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: auto;
    overflow: hidden;
  }
  
  #tool-bar {
    display: flex;
    background-color: #f5f5f5;
    padding: 10px;
    gap: 10px;
    border-bottom: 1px solid #e8e8e8;
  }
  
  .tool-button {
    padding: 8px 16px;
    background-color: white;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    font-size: 14px;
    transition: all 0.3s;
  }
  
  .tool-button:hover {
    color: #1890ff;
    border-color: #1890ff;
  }
  
  .tool-button.active {
    color: #fff;
    background-color: #1890ff;
    border-color: #1890ff;
  }
  
  #tool-settings-panel {
    display: none;
    background-color: #f5f5f5;
    padding: 10px;
    border-bottom: 1px solid #e8e8e8;
  }
  
  .settings-group {
    display: none;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .settings-group.active {
    display: flex;
  }
  
  .setting-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 8px;
  }
  
  .setting-item label {
    font-size: 12px;
    margin-bottom: 4px;
    color: #333;
  }
  
  .setting-item input[type="range"] {
    width: 100%;
  }
  
  .setting-item input[type="color"] {
    width: 36px;
    height: 36px;
    padding: 0;
    border: none;
    cursor: pointer;
  }
  
  .setting-item select {
    height: 32px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    padding: 0 8px;
  }
  
  #upload-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    flex: 1;
    background-color: #fafafa;
    padding: 20px;
  }
  
  #drop-zone {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 80%;
    max-width: 600px;
    height: 300px;
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    background-color: white;
    transition: all 0.3s;
  }
  
  #drop-zone:hover, .upload-area-active {
    border-color: #1890ff;
    background-color: #e6f7ff;
  }
  
  #upload-icon {
    font-size: 48px;
    margin-bottom: 20px;
    color: #1890ff;
  }
  
  #canvas-container {
    flex: 1;
    display: none;
    overflow: auto;
    position: relative;
    background-color: #f0f0f0;
    border: 1px solid #d9d9d9;
  }
  
  #canvas-container.image-view-mode {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 20px;
  }
  
  #image-container {
    position: relative;
    max-width: 100%;
    max-height: 100%;
    display: flex;
    justify-content: center;
    align-items: baseline;
  }
  
  #image-container img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: transform 0.3s ease;
  }
  
  #tips {
    margin-top: 20px;
    color: #888;
    text-align: center;
  }
  
  #error-message {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    background-color: #ff4d4f;
    color: white;
    border-radius: 4px;
    display: none;
    z-index: 1000;
  }
  
  .rectangle-annotation {
    position: absolute;
    pointer-events: none;
    box-sizing: border-box;
  }
  
  .mosaic-block {
    position: absolute;
    pointer-events: none;
  }
  
  .text-annotation {
    position: absolute;
    z-index: 11;
  }
  
  .drawing-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
  }
  
  /* 虚化效果样式 */
  .blur-area {
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
  
  /* 新增拖动调整功能样式 */
  .annotation-container {
    position: absolute;
    box-sizing: border-box;
    cursor: move;
  }
  
  .annotation-handle {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: white;
    border: 1px solid #1890ff;
    border-radius: 50%;
  }
  
  .handle-tl { top: -5px; left: -5px; cursor: nw-resize; }
  .handle-tr { top: -5px; right: -5px; cursor: ne-resize; }
  .handle-bl { bottom: -5px; left: -5px; cursor: sw-resize; }
  .handle-br { bottom: -5px; right: -5px; cursor: se-resize; }
  
  .text-control-panel {
    position: absolute;
    background: white;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    padding: 5px;
    display: flex;
    gap: 5px;
    z-index: 12;
  }
  
  .text-control-button {
    padding: 3px;
    border: 1px solid #d9d9d9;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
  }
  
  .text-control-button:hover {
    background-color: #f0f0f0;
  }
  
  /* 缩放指示器 */
  #zoom-indicator {
    position: fixed;
    bottom: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1000;
  }
`;
document.head.appendChild(style);

// 初始化函数
function init() {
    console.log('初始化应用', {
        isMobile,
        compatibilityCheck
    });

    try {
        // 初始化DOM元素引用
        const domInitResult = initDOMReferences();
        if (!domInitResult) {
            console.warn('DOM引用初始化未完全成功，将尝试继续');
        }

        // 检查是否缺少关键功能
        if (!compatibilityCheck.hasCanvas || !compatibilityCheck.hasFileReader) {
            showError('您的浏览器不支持图片编辑功能，请使用最新版Chrome/Firefox/Safari浏览器');
            console.error('浏览器兼容性问题', compatibilityCheck);
            return false;
        }

        // 检查fabric.js是否已加载
        if (typeof fabric === 'undefined') {
            console.error('Fabric.js库未加载');
            showError('图像编辑库未加载，请刷新页面重试');

            // 尝试动态加载Fabric.js
            try {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js';
                script.onload = function() {
                    console.log('动态加载Fabric.js成功，即将重新初始化');
                    setTimeout(init, 500); // 重新初始化
                };
                script.onerror = function() {
                    console.error('动态加载Fabric.js失败');
                    showError('无法加载图像编辑库，请检查网络连接并刷新页面');
                };
                document.head.appendChild(script);
            } catch (e) {
                console.error('尝试动态加载Fabric.js时出错', e);
            }

            return false;
        }

        // 如果是移动设备，添加特殊类和提示
        if (isMobile) {
            document.body.classList.add('mobile-device');
        }

        // 分步初始化，每步都添加错误处理
        try {
            // 创建工具设置面板
            createToolSettingsPanel();
            console.log('工具设置面板初始化完成');
        } catch (e) {
            console.error('创建工具设置面板时出错', e);
            showError('初始化编辑工具时出错，可能影响部分功能');
        }

        try {
            // 初始化画布
            initCanvas();
            console.log('画布初始化完成');
        } catch (e) {
            console.error('初始化画布时出错', e);
            showError('初始化编辑画布时出错，可能影响图片编辑功能');
        }

        try {
            // 初始化事件监听
            initEventListeners();
            console.log('事件监听初始化完成');
        } catch (e) {
            console.error('初始化事件监听时出错', e);
            showError('初始化交互功能时出错，可能影响部分操作');
        }

        try {
            // 初始化侧边栏
            initSidebar();
            console.log('侧边栏初始化完成');
        } catch (e) {
            console.error('初始化侧边栏时出错', e);
            // 这个错误相对不太重要，不向用户显示
        }

        try {
            // 初始化拖放区域
            initDropZone();
            console.log('拖放区域初始化完成');
        } catch (e) {
            console.error('初始化拖放区域时出错', e);
            showError('初始化上传功能时出错，您可能无法拖放上传图片');
        }

        // 添加全局调试功能
        window.checkCompatibility = function() {
            return {
                ...compatibilityCheck,
                userAgent: navigator.userAgent,
                screenWidth: window.innerWidth,
                screenHeight: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio || 1,
                isMobile
            };
        };

        // 添加全局错误处理函数
        window.onerror = function(message, source, lineno, colno, error) {
            console.error('全局错误', {
                message,
                source,
                lineno,
                colno,
                error
            });
            return false; // 让浏览器继续处理错误
        };

        console.log('应用初始化完成');
        return true;
    } catch (error) {
        console.error('初始化过程中发生错误:', error);
        showError('初始化应用程序时出错: ' + error.message);
        return false;
    }
}

// 创建工具设置面板
function createToolSettingsPanel() {
    // 检查editor-container是否存在，如果不存在则创建
    let editorContainer = document.getElementById('editor-container');
    if (!editorContainer) {
        console.log('创建editor-container元素');
        editorContainer = document.createElement('div');
        editorContainer.id = 'editor-container';

        // 将canvas-container移入editor-container
        const canvasContainerElement = document.getElementById('canvas-container');
        if (canvasContainerElement) {
            // 获取canvas-container的父元素
            const parent = canvasContainerElement.parentElement;
            // 在canvas-container的父元素中插入editor-container
            parent.insertBefore(editorContainer, canvasContainerElement);
            // 将canvas-container移入editor-container
            editorContainer.appendChild(canvasContainerElement);
        } else {
            // 如果canvas-container也不存在，直接添加到body
            document.body.appendChild(editorContainer);
        }
    }

    // 创建工具设置面板容器
    const toolSettingsPanel = document.createElement('div');
    toolSettingsPanel.id = 'tool-settings-panel';

    // 创建矩形工具设置组
    const rectangleSettings = document.createElement('div');
    rectangleSettings.className = 'settings-group';
    rectangleSettings.id = 'rectangle-settings';
    rectangleSettings.innerHTML = `
        <div class="setting-item">
            <label>边框粗细</label>
            <input type="range" id="rectangle-border-width" min="1" max="10" value="${toolSettings.rectangle.borderWidth}">
            <span id="rectangle-border-width-value">${toolSettings.rectangle.borderWidth}px</span>
        </div>
        <div class="setting-item">
            <label>边框颜色</label>
            <input type="color" id="rectangle-border-color" value="${toolSettings.rectangle.borderColor}">
        </div>
    `;

    // 创建马赛克工具设置组
    const mosaicSettings = document.createElement('div');
    mosaicSettings.className = 'settings-group';
    mosaicSettings.id = 'mosaic-settings';
    mosaicSettings.innerHTML = `
        <div class="setting-item">
            <label>虚化强度</label>
            <input type="range" id="mosaic-block-size" min="2" max="20" value="${toolSettings.mosaic.blockSize}">
            <span id="mosaic-block-size-value">${toolSettings.mosaic.blockSize}px</span>
        </div>
        <div class="setting-item">
            <label>笔刷大小</label>
            <input type="range" id="mosaic-brush-size" min="10" max="100" value="${toolSettings.mosaic.brushSize}">
            <span id="mosaic-brush-size-value">${toolSettings.mosaic.brushSize}px</span>
        </div>
    `;

    // 创建文字工具设置组
    const textSettings = document.createElement('div');
    textSettings.className = 'settings-group';
    textSettings.id = 'text-settings';
    textSettings.innerHTML = `
        <div class="setting-item">
            <label>字体大小</label>
            <input type="range" id="text-font-size" min="10" max="48" value="${toolSettings.text.fontSize}">
            <span id="text-font-size-value">${toolSettings.text.fontSize}px</span>
        </div>
        <div class="setting-item">
            <label>字体</label>
            <select id="text-font-family">
                <option value="Arial" ${toolSettings.text.fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
                <option value="Times New Roman" ${toolSettings.text.fontFamily === 'Times New Roman' ? 'selected' : ''}>Times New Roman</option>
                <option value="Courier New" ${toolSettings.text.fontFamily === 'Courier New' ? 'selected' : ''}>Courier New</option>
                <option value="Georgia" ${toolSettings.text.fontFamily === 'Georgia' ? 'selected' : ''}>Georgia</option>
                <option value="Verdana" ${toolSettings.text.fontFamily === 'Verdana' ? 'selected' : ''}>Verdana</option>
            </select>
        </div>
        <div class="setting-item">
            <label>文字颜色</label>
            <input type="color" id="text-color" value="${toolSettings.text.textColor}">
        </div>
        <div class="setting-item">
            <label>背景颜色</label>
            <input type="color" id="text-background-color" value="#ffffff">
            <div>
                <label>透明度</label>
                <input type="range" id="text-background-opacity" min="0" max="100" value="80">
                <span id="text-background-opacity-value">80%</span>
            </div>
        </div>
        <div class="setting-item">
            <label>样式</label>
            <div>
                <input type="checkbox" id="text-bold" ${toolSettings.text.isBold ? 'checked' : ''}>
                <label for="text-bold">粗体</label>
                <input type="checkbox" id="text-italic" ${toolSettings.text.isItalic ? 'checked' : ''}>
                <label for="text-italic">斜体</label>
            </div>
        </div>
    `;

    // 添加设置组到面板
    toolSettingsPanel.appendChild(rectangleSettings);
    toolSettingsPanel.appendChild(mosaicSettings);
    toolSettingsPanel.appendChild(textSettings);

    // 添加缩放指示器
    const zoomIndicator = document.createElement('div');
    zoomIndicator.id = 'zoom-indicator';
    zoomIndicator.textContent = '缩放: 100%';
    zoomIndicator.style.display = 'none';

    // 添加工具设置面板到页面
    editorContainer.insertBefore(toolSettingsPanel, document.getElementById('canvas-container'));
    document.body.appendChild(zoomIndicator);

    // 添加设置更改事件监听器
    addSettingsEventListeners();
}

// 初始化画布
function initCanvas() {
    // 确保canvasContainer已经准备好
    if (!canvasContainer) {
        console.error('Canvas容器未找到');
        showError('初始化失败：Canvas容器未找到');
        return;
    }

    try {
        // 强制设置Canvas容器的可见性和尺寸，以便正确获取尺寸
        canvasContainer.style.display = 'block';
        canvasContainer.style.visibility = 'hidden'; // 暂时隐藏，但保持布局

        // 确保容器有最小尺寸
        if (canvasContainer.clientWidth <= 10) {
            canvasContainer.style.width = '100%';
            canvasContainer.style.height = '500px';
        }

        // 使用安全的尺寸值（确保为正数）
        const containerWidth = Math.max(canvasContainer.clientWidth, 300);
        const containerHeight = Math.max(canvasContainer.clientHeight, 300);

        const initialWidth = Math.min(containerWidth - 20, window.innerWidth - 40);
        const initialHeight = Math.min(containerHeight - 20, window.innerHeight * 0.6);

        console.log('画布初始化参数（修复后）', {
            width: initialWidth,
            height: initialHeight,
            containerWidth,
            containerHeight,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight
        });

        // 创建Fabric画布
        canvas = new fabric.Canvas('editor-canvas', {
            width: initialWidth > 0 ? initialWidth : 300,
            height: initialHeight > 0 ? initialHeight : 300,
            backgroundColor: '#ffffff',
            preserveObjectStacking: true
        });

        // 重置容器显示
        canvasContainer.style.display = 'none';
        canvasContainer.style.visibility = 'visible';

        console.log('画布初始化完成');

        // 窗口大小改变时调整画布大小
        window.addEventListener('resize', () => {
            if (canvasContainer.style.display !== 'none') {
                const newWidth = Math.max(canvasContainer.clientWidth - 20, 100);
                const newHeight = Math.max(canvasContainer.clientHeight - 20, 100);
                canvas.setWidth(newWidth);
                canvas.setHeight(newHeight);
                canvas.renderAll();
                console.log('窗口调整，画布大小更新', {
                    newWidth,
                    newHeight
                });
            }
        });
    } catch (error) {
        console.error('初始化画布失败', error);
        showError('初始化画布失败: ' + error.message);
    }
}

// 初始化事件监听
function initEventListeners() {
    try {
        console.log('正在初始化事件监听...');

        // 检查必要的DOM元素是否存在
        if (!dropZone || !fileInput) {
            console.error('初始化事件监听失败：必要的DOM元素不存在');
            return false;
        }

        // 拖放区域相关事件
        try {
            dropZone.addEventListener('dragover', handleDragOver);
            dropZone.addEventListener('dragleave', handleDragLeave);
            dropZone.addEventListener('drop', handleDrop);
            dropZone.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', handleFileSelect);
            console.log('拖放和文件选择事件已初始化');
        } catch (e) {
            console.error('初始化拖放事件失败:', e);
        }

        // 工具按钮事件 - 使用安全的事件绑定方式
        const safeAddToolClickEvent = (element, toolFunction, toolName) => {
            if (!element) {
                console.warn(`${toolName}工具按钮未找到`);
                return;
            }

            try {
                element.addEventListener('click', () => {
                    console.log(`点击${toolName}工具按钮`);

                    // 检查是否有显示的图片
                    const displayedImage = document.querySelector('#image-container img');
                    if (displayedImage && typeof toolFunction === 'function') {
                        toolFunction(displayedImage);
                        if (typeof setActiveToolButton === 'function') {
                            setActiveToolButton(toolName);
                        }
                    } else {
                        showError('请先上传或选择一张图片');
                    }
                });
                console.log(`${toolName}工具按钮事件已初始化`);
            } catch (e) {
                console.error(`初始化${toolName}工具按钮事件失败:`, e);
            }
        };

        // 使用安全绑定方式添加工具事件
        safeAddToolClickEvent(rectangleTool, activateRectangleTool, '红框标注');
        safeAddToolClickEvent(mosaicTool, activateMosaicTool, '马赛克');
        safeAddToolClickEvent(textTool, activateTextTool, '文字');

        // 缩放控制 - 使用安全的事件绑定方式
        const safeAddZoomEvent = (element, zoomAction, actionName) => {
            if (!element) {
                console.warn(`${actionName}按钮未找到`);
                return;
            }

            try {
                element.addEventListener('click', () => {
                    console.log(`点击${actionName}按钮`);

                    // 检查是否有显示的图片
                    const displayedImage = document.querySelector('#image-container img');
                    if (displayedImage) {
                        if (typeof zoomAction === 'function') {
                            zoomAction(displayedImage);
                        } else if (actionName === '放大') {
                            const currentScale = getCurrentScale(displayedImage);
                            const newScale = Math.min(currentScale + 0.1, 3);
                            applyZoom(displayedImage, newScale);
                        } else if (actionName === '缩小') {
                            const currentScale = getCurrentScale(displayedImage);
                            const newScale = Math.max(currentScale - 0.1, 0.5);
                            applyZoom(displayedImage, newScale);
                        } else if (actionName === '重置缩放') {
                            applyZoom(displayedImage, 1);

                            // 不移除标注，只重置工具按钮状态
                            if (rectangleTool) rectangleTool.classList.remove('active');
                            if (mosaicTool) mosaicTool.classList.remove('active');
                            if (textTool) textTool.classList.remove('active');

                            // 隐藏工具设置面板
                            if (typeof showToolSettings === 'function') {
                                showToolSettings(null);
                            }
                        }
                    } else {
                        showError('请先上传或选择一张图片');
                    }
                });
                console.log(`${actionName}按钮事件已初始化`);
            } catch (e) {
                console.error(`初始化${actionName}按钮事件失败:`, e);
            }
        };

        // 添加缩放控制事件
        safeAddZoomEvent(zoomIn, null, '放大');
        safeAddZoomEvent(zoomOut, null, '缩小');
        safeAddZoomEvent(resetZoom, null, '重置缩放');

        // 初始化画布拖动功能
        try {
            if (canvas) {
                canvas.on('mouse:down', (opt) => {
                    const evt = opt.e;
                    if (evt.altKey === true) {
                        isDragging = true;
                        lastPosX = evt.clientX;
                        lastPosY = evt.clientY;
                        canvas.selection = false;
                    }
                });

                canvas.on('mouse:move', (opt) => {
                    if (isDragging) {
                        const evt = opt.e;
                        const vpt = canvas.viewportTransform;
                        vpt[4] += evt.clientX - lastPosX;
                        vpt[5] += evt.clientY - lastPosY;
                        lastPosX = evt.clientX;
                        lastPosY = evt.clientY;
                        canvas.requestRenderAll();
                    }
                });

                canvas.on('mouse:up', () => {
                    isDragging = false;
                    canvas.selection = true;
                });

                // 监听对象添加事件，保存撤销状态
                canvas.on('object:added', typeof saveCanvasState === 'function' ? saveCanvasState : () => {});
                canvas.on('object:modified', typeof saveCanvasState === 'function' ? saveCanvasState : () => {});
                canvas.on('object:removed', typeof saveCanvasState === 'function' ? saveCanvasState : () => {});

                console.log('画布事件已初始化');
            } else {
                console.warn('画布未初始化，跳过画布事件绑定');
            }
        } catch (e) {
            console.error('初始化画布事件失败:', e);
        }

        // 下载按钮事件 - 确保函数已定义
        if (downloadBtn) {
            try {
                downloadBtn.addEventListener('click', function() {
                    console.log('点击下载按钮');
                    if (typeof downloadImage === 'function') {
                        downloadImage();
                    } else {
                        showError('下载功能暂时不可用，请稍后再试');
                        console.error('下载函数未定义');
                    }
                });
                console.log('下载按钮事件已初始化');
            } catch (e) {
                console.error('初始化下载按钮事件失败:', e);
            }
        } else {
            console.warn('下载按钮未找到');
        }

        // 返回按钮事件 - 确保函数已定义
        if (backBtn) {
            try {
                backBtn.addEventListener('click', function() {
                    console.log('点击返回按钮');
                    if (typeof backToUpload === 'function') {
                        backToUpload();
                    } else {
                        // 简单的后备实现
                        if (canvasContainer) {
                            canvasContainer.innerHTML = '';
                            canvasContainer.classList.remove('image-view-mode');
                            canvasContainer.style.display = 'none';
                        }

                        if (dropZone) dropZone.style.display = 'flex';
                        if (tipsElement) tipsElement.style.display = 'block';

                        if (fileInput) fileInput.value = '';

                        console.log('已返回上传页面');
                    }
                });
                console.log('返回按钮事件已初始化');
            } catch (e) {
                console.error('初始化返回按钮事件失败:', e);
            }
        } else {
            console.warn('返回按钮未找到');
        }

        // 撤销按钮事件
        if (undoBtn) {
            try {
                undoBtn.addEventListener('click', function() {
                    console.log('点击撤销按钮');
                    if (typeof undo === 'function') {
                        undo();
                    } else {
                        showError('撤销功能暂时不可用，请稍后再试');
                        console.error('撤销函数未定义');
                    }
                });
                console.log('撤销按钮事件已初始化');
            } catch (e) {
                console.error('初始化撤销按钮事件失败:', e);
            }
        } else {
            console.warn('撤销按钮未找到');
        }

        console.log('所有事件监听器初始化完成');
        return true;
    } catch (error) {
        console.error('初始化事件监听时出错:', error);
        showError('初始化事件监听时出错: ' + error.message);
        return false;
    }
}

// 获取当前缩放比例
function getCurrentScale(element) {
    const transform = element.style.transform;
    if (!transform || transform === 'none') return 1;

    const match = transform.match(/scale\(([0-9.]+)\)/);
    return match ? parseFloat(match[1]) : 1;
}

// 应用缩放到图片和标注
function applyZoom(imageElement, scale) {
    // 应用缩放到图片
    imageElement.style.transform = `scale(${scale})`;
    imageElement.style.transformOrigin = 'center center'; // 确保缩放始终从中心点开始

    // 确保图片父容器样式正确
    const container = imageElement.parentElement;
    if (container) {
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
    }

    // 更新缩放指示器
    updateZoomIndicator(scale);

    // 获取图片容器和覆盖层
    const overlay = container.querySelector('.drawing-overlay');

    // 如果没有覆盖层，说明没有激活任何编辑工具，返回
    if (!overlay) return;

    // 缩放所有标注元素，使它们与图片保持相对大小
    scaleAnnotations(overlay, scale);
}

// 缩放标注元素
function scaleAnnotations(overlay, scale) {
    // 缩放矩形框
    const rectangles = overlay.querySelectorAll('.rectangle-annotation');
    rectangles.forEach(rect => {
        // 获取当前边框宽度
        const borderWidth = parseInt(rect.style.borderWidth) || toolSettings.rectangle.borderWidth;

        // 应用新的边框宽度，保持与缩放比例一致
        const scaledWidth = Math.max(1, Math.round(borderWidth * scale));
        rect.style.borderWidth = `${scaledWidth}px`;
    });

    // 缩放马赛克块
    const mosaicBlocks = overlay.querySelectorAll('.mosaic-block');
    mosaicBlocks.forEach(block => {
        // 如果马赛克块不需要随缩放而缩放，则移除这部分代码
    });

    // 缩放文本
    const textAnnotations = overlay.querySelectorAll('.text-annotation');
    textAnnotations.forEach(text => {
        // 获取当前字体大小
        let fontSize = parseInt(text.style.fontSize);
        if (!fontSize) {
            fontSize = toolSettings.text.fontSize;
        } else {
            // 移除"px"后缀
            if (text.style.fontSize.endsWith('px')) {
                fontSize = parseInt(text.style.fontSize.slice(0, -2));
            }
        }

        // 应用新的字体大小，保持与缩放比例一致
        const scaledFontSize = Math.max(10, Math.round(fontSize * scale));
        text.style.fontSize = `${scaledFontSize}px`;
    });
}

// 处理拖拽进入事件
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('拖拽文件进入区域');
    if (dropZone) {
        dropZone.classList.add('upload-area-active');
    }
}

// 处理拖拽离开事件
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    if (dropZone) {
        dropZone.classList.remove('upload-area-active');
    }
}

// 处理拖放事件
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    // 从拖拽事件获取文件
    const files = e.dataTransfer.files;

    if (files.length > 0) {
        const file = files[0];

        // 检查是否为图片
        if (file.type.match('image.*')) {
            // 隐藏上传区域，显示加载指示器
            document.getElementById('drop-zone').style.display = 'none';
            document.getElementById('loading-indicator').style.display = 'flex';

            // 加载图片
            loadImageFromFile(file);
        } else {
            showError('请上传图片文件');
        }
    }
}

// 处理文件选择事件
function handleFileSelect(e) {
    console.log('文件选择事件触发');

    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        console.log('已选择文件:', fileInput.files[0].name);
        const file = fileInput.files[0];
        if (file.type.match('image.*')) {
            loadImageToContainer(file);
        } else {
            showError('请上传图片文件');
        }
    } else {
        console.warn('文件选择未包含有效文件');
    }
}

// 设置当前激活的工具
function setActiveTool(tool) {
    // 移除所有工具按钮的活跃状态
    rectangleTool.classList.remove('active');
    mosaicTool.classList.remove('active');
    textTool.classList.remove('active');

    // 设置当前工具的活跃状态
    activeTool = tool;

    // 重置画布事件绑定
    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');

    // 设置基本的拖动功能
    canvas.on('mouse:down', (opt) => {
        const evt = opt.e;
        if (evt.altKey === true) {
            isDragging = true;
            lastPosX = evt.clientX;
            lastPosY = evt.clientY;
            canvas.selection = false;
        }
    });

    canvas.on('mouse:move', (opt) => {
        if (isDragging) {
            const evt = opt.e;
            const vpt = canvas.viewportTransform;
            vpt[4] += evt.clientX - lastPosX;
            vpt[5] += evt.clientY - lastPosY;
            lastPosX = evt.clientX;
            lastPosY = evt.clientY;
            canvas.requestRenderAll();
        }
    });

    canvas.on('mouse:up', () => {
        isDragging = false;
        canvas.selection = true;
    });

    // 根据当前工具设置活跃状态
    switch (tool) {
        case 'rectangle':
            rectangleTool.classList.add('active');
            break;
        case 'mosaic':
            mosaicTool.classList.add('active');
            break;
        case 'text':
            textTool.classList.add('active');
            break;
    }
}

// 加载图片到容器（不使用Fabric.js画布）
function loadImageToContainer(file) {
    try {
        console.log('开始使用原生方式加载图片...');

        // 确保canvasContainer存在
        if (!canvasContainer) {
            console.error('画布容器不存在');
            showError('无法加载图片：画布容器不存在');
            return;
        }

        // 清空画布容器
        canvasContainer.innerHTML = '';

        // 创建图片容器
        const imageContainer = document.createElement('div');
        imageContainer.id = 'image-container';
        imageContainer.style.width = '100%';
        imageContainer.style.position = 'relative';
        canvasContainer.appendChild(imageContainer);

        // 检查文件是否有效
        if (!file || !(file instanceof Blob)) {
            console.error('无效的文件对象', file);
            showError('无效的文件对象');
            return;
        }

        // 显示加载指示器
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }

        // 使用FileReader读取文件
        const reader = new FileReader();

        reader.onload = function(e) {
            // 创建图片元素
            const img = document.createElement('img');
            img.src = e.target.result;

            // 设置图片加载事件
            img.onload = function() {
                console.log('图片加载完成', {
                    width: img.width,
                    height: img.height,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight
                });

                // 设置容器样式
                canvasContainer.classList.add('image-view-mode');
                canvasContainer.style.display = 'flex';
                canvasContainer.style.alignItems = 'center'; // 确保垂直居中
                canvasContainer.style.justifyContent = 'center'; // 确保水平居中

                // 判断是否为长图，调整容器高度
                const isLongImage = img.naturalHeight > img.naturalWidth * 2;
                if (isLongImage) {
                    console.log('检测到长图，调整容器样式');
                    // 长图时仍然保持居中，但启用滚动
                    canvasContainer.style.overflowY = 'auto';

                    // 添加提示信息
                    showMessage('检测到长图，可滚动查看完整内容');
                }

                // 确保图片宽度适应容器
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.transformOrigin = 'center center'; // 确保缩放始终从中心点开始

                // 隐藏上传区域和提示
                if (dropZone) dropZone.style.display = 'none';
                if (tipsElement) tipsElement.style.display = 'none';

                // 添加鼠标滚轮缩放事件
                addWheelZoomSupport(imageContainer, img);

                // 隐藏加载指示器
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }

                // 显示工具栏
                console.log('显示工具栏');
            };

            // 设置图片加载错误事件
            img.onerror = function() {
                console.error('图片加载失败');
                showError('图片加载失败，请重试');

                // 返回上传页面
                canvasContainer.style.display = 'none';
                if (dropZone) dropZone.style.display = 'flex';
                if (tipsElement) tipsElement.style.display = 'block';

                // 隐藏加载指示器
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
            };

            // 将图片添加到容器
            imageContainer.appendChild(img);
        };

        // 添加读取错误处理
        reader.onerror = function(error) {
            console.error('读取文件时出错', error);
            showError('读取文件时出错: ' + (error.message || '未知错误'));

            // 隐藏加载指示器
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        };

        // 读取文件
        reader.readAsDataURL(file);

        console.log('图片加载请求已发送');
    } catch (error) {
        console.error('加载图片时出错', error);
        showError('加载图片时出错: ' + error.message);

        // 隐藏加载指示器
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
}

// 显示错误信息
function showError(message) {
    console.error(message);

    // 确保DOM元素存在
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }

    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';

        // 3秒后自动隐藏错误信息
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    } else {
        // 如果错误消息元素不存在，创建一个临时的错误提示
        const tempError = document.createElement('div');
        tempError.textContent = message;
        tempError.style.position = 'fixed';
        tempError.style.top = '20px';
        tempError.style.left = '50%';
        tempError.style.transform = 'translateX(-50%)';
        tempError.style.padding = '10px 20px';
        tempError.style.backgroundColor = '#ff4d4f';
        tempError.style.color = 'white';
        tempError.style.borderRadius = '4px';
        tempError.style.zIndex = '1000';
        document.body.appendChild(tempError);

        // 3秒后移除临时错误提示
        setTimeout(() => {
            document.body.removeChild(tempError);
        }, 3000);
    }
}

// 调整画布容器大小
function adjustCanvasContainerSize() {
    const width = canvas.getWidth();
    const height = canvas.getHeight();

    // 如果图片过长，调整画布容器的高度
    if (height > window.innerHeight * 0.7) {
        canvasContainer.style.height = '80vh';
    } else {
        canvasContainer.style.height = '70vh';
    }
}

// 激活矩形工具（红框标注）
function activateRectangleTool(imageElement) {
    // 如果没有提供图像元素，尝试查找
    if (!imageElement) {
        imageElement = document.getElementById('displayed-image');
        if (!imageElement) {
            console.error('找不到图像元素，无法激活矩形工具');
            return;
        }
    }

    console.log('激活矩形工具');

    // 获取父容器
    const parent = imageElement.parentElement;
    // 查找绘图覆盖层
    let overlay = parent.querySelector('.drawing-overlay');

    if (!overlay) {
        console.error('找不到绘图覆盖层，尝试创建');
        overlay = document.createElement('div');
        overlay.className = 'drawing-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.pointerEvents = 'auto';
        overlay.style.zIndex = '10';
        parent.appendChild(overlay);
    } else {
        // 确保覆盖层设置正确
        overlay.style.pointerEvents = 'auto';
        overlay.style.zIndex = '10';
    }

    // 清除之前的事件监听器
    clearOverlayEventListeners(overlay);

    // 标记当前工具
    setActiveToolButton('rectangle');

    // 显示设置面板
    if (typeof showToolSettings === 'function') {
        showToolSettings('rectangle');
    }

    // 更新覆盖层大小，确保与图片大小匹配
    updateOverlaySize();

    // 显示操作提示
    showMessage('红框标注工具已激活 - 请在图片上点击并拖动创建矩形');

    // 打印调试信息
    console.log('矩形工具初始化完成, overlay状态:', {
        width: overlay.offsetWidth,
        height: overlay.offsetHeight,
        pointerEvents: overlay.style.pointerEvents
    });

    // 变量定义
    let isDrawing = false;
    let startX, startY;
    let element = null;

    // 设置鼠标事件处理
    overlay.onmousedown = onMouseDown;
    overlay.onmousemove = onMouseMove;
    overlay.onmouseup = onMouseUp;
    overlay.onmouseleave = onMouseLeave;

    // 确保mouseleave和mouseup清理状态
    document.addEventListener('mouseup', onMouseUp);

    // 为保证响应正常，添加鼠标进入事件
    overlay.onmouseenter = function() {
        console.log('鼠标进入overlay区域');
    };

    // 检查事件绑定情况
    console.log('事件绑定状态:', {
        mousedown: !!overlay.onmousedown,
        mousemove: !!overlay.onmousemove,
        mouseup: !!overlay.onmouseup,
        mouseleave: !!overlay.onmouseleave
    });

    // 更新覆盖层大小的函数
    function updateOverlaySize() {
        // 确保覆盖层尺寸与图片匹配
        overlay.style.width = imageElement.offsetWidth + 'px';
        overlay.style.height = imageElement.offsetHeight + 'px';
    }

    // 鼠标按下时的事件处理
    function onMouseDown(e) {
        e.preventDefault();

        console.log('鼠标按下', e.type);

        // 获取鼠标坐标 - 优先使用修复脚本中的函数
        let pos;
        if (typeof window.getMousePosition === 'function') {
            pos = window.getMousePosition(e, overlay);
        } else {
            const rect = overlay.getBoundingClientRect();
            pos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }

        startX = pos.x;
        startY = pos.y;

        console.log(`矩形起始点: (${startX}, ${startY})`);

        isDrawing = true;

        // 创建新矩形
        element = document.createElement('div');
        element.className = 'rectangle-annotation';
        element.style.position = 'absolute';
        element.style.border = `${window.toolSettings?.rectangle?.borderWidth || 3}px solid ${window.toolSettings?.rectangle?.borderColor || '#ff0000'}`;
        element.style.backgroundColor = 'transparent';
        element.style.top = startY + 'px';
        element.style.left = startX + 'px';
        element.style.width = '0px';
        element.style.height = '0px';
        element.style.boxSizing = 'border-box';
        element.style.pointerEvents = 'none';

        overlay.appendChild(element);
    }

    // 鼠标移动时的事件处理
    function onMouseMove(e) {
        if (!isDrawing) return;

        // 获取鼠标坐标
        let pos;
        if (typeof window.getMousePosition === 'function') {
            pos = window.getMousePosition(e, overlay);
        } else {
            const rect = overlay.getBoundingClientRect();
            pos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }

        const currentX = pos.x;
        const currentY = pos.y;

        // 计算宽高
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);

        // 计算左上角坐标
        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);

        // 更新矩形位置和大小
        element.style.left = left + 'px';
        element.style.top = top + 'px';
        element.style.width = width + 'px';
        element.style.height = height + 'px';

        // 打印调试信息
        console.log(`矩形调整: (${left}, ${top}, ${width}, ${height})`);
    }

    // 鼠标释放时的事件处理
    function onMouseUp() {
        if (!isDrawing) return;

        console.log('完成矩形绘制');
        isDrawing = false;

        if (element) {
            const width = parseInt(element.style.width);
            const height = parseInt(element.style.height);

            // 如果矩形太小，则删除
            if (width < 5 || height < 5) {
                console.log('矩形太小，移除');
                overlay.removeChild(element);
                return;
            }

            // 使用优化后的矩形创建完成处理函数
            if (typeof onRectangleCreated === 'function') {
                onRectangleCreated(element, overlay);
            } else {
                // 兼容旧版处理
                element.style.pointerEvents = 'auto';
                addResizeHandles(element, overlay);
                makeElementDraggable(element, overlay);
            }
        }
    }

    // 鼠标离开时的事件处理
    function onMouseLeave() {
        console.log('鼠标离开覆盖层');
        // 注意：不要在这里结束绘制，可能会导致误操作
        // 只在真正完成时才调用onMouseUp
    }

    // 监听窗口大小变化，更新覆盖层大小
    window.addEventListener('resize', updateOverlaySize);

    // 初始更新一次覆盖层大小
    updateOverlaySize();
}

// 清除覆盖层上的事件监听器
function clearOverlayEventListeners(overlay) {
    if (overlay && overlay._eventListeners) {
        for (const [eventName, handler] of Object.entries(overlay._eventListeners)) {
            overlay.removeEventListener(eventName, handler);
        }
        overlay._eventListeners = null;
    }

    // 调用清理函数（如果存在）
    if (overlay && typeof overlay._cleanup === 'function') {
        overlay._cleanup();
        overlay._cleanup = null;
    }
}

// 激活马赛克工具（现改为虚化工具）
function activateMosaicTool(imageElement) {
    // 如果没有提供图像元素，尝试查找
    if (!imageElement) {
        imageElement = document.getElementById('displayed-image');
        if (!imageElement) {
            console.error('找不到图像元素，无法激活马赛克工具');
            return;
        }
    }

    console.log('激活马赛克工具');

    // 获取父容器
    const parent = imageElement.parentElement;
    let overlay = parent.querySelector('.drawing-overlay');

    if (!overlay) {
        console.error('找不到绘图覆盖层，尝试创建');
        overlay = document.createElement('div');
        overlay.className = 'drawing-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.pointerEvents = 'auto';
        overlay.style.zIndex = '10';
        parent.appendChild(overlay);
    } else {
        // 确保覆盖层设置正确
        overlay.style.pointerEvents = 'auto';
    }

    // 清除之前的事件监听器
    clearOverlayEventListeners(overlay);

    // 标记当前工具
    setActiveToolButton('mosaic');

    // 显示设置面板
    if (typeof showToolSettings === 'function') {
        showToolSettings('mosaic');
    }

    // 显示操作提示
    showMessage('马赛克工具已激活 - 请在图片上拖动创建马赛克/模糊效果');

    // 变量定义
    let isDrawing = false;
    let lastX, lastY;

    // 使用节流来处理mousemove事件
    const throttledMouseMove = typeof throttleEvent === 'function' ?
        throttleEvent(onMouseMove) : onMouseMove;

    // 设置事件监听器
    overlay.addEventListener('mousedown', onMouseDown);
    overlay.addEventListener('mousemove', throttledMouseMove);
    overlay.addEventListener('mouseup', onMouseUp);
    overlay.addEventListener('mouseleave', onMouseLeave);

    // 为了确保性能，我们需要在鼠标释放和离开时刷新缓冲区
    function handleDrawingEnd() {
        if (isDrawing && typeof flushBlurAreas === 'function') {
            // 获取设置
            const blurSize = window.toolSettings && window.toolSettings.mosaic ? window.toolSettings.mosaic.blockSize : 10;
            flushBlurAreas(overlay, blurSize);
        }
        isDrawing = false;
    }

    // 鼠标移动事件处理
    function onMouseMove(e) {
        if (!isDrawing) return;

        // 获取鼠标坐标
        let pos;
        if (typeof window.getMousePosition === 'function') {
            pos = window.getMousePosition(e, overlay);
        } else {
            const rect = overlay.getBoundingClientRect();
            pos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }

        const currentX = pos.x;
        const currentY = pos.y;

        // 获取设置
        const brushSize = window.toolSettings && window.toolSettings.mosaic ? window.toolSettings.mosaic.brushSize : 20;

        if (lastX && lastY) {
            // 计算当前点和上一点之间的距离
            const distance = Math.sqrt(Math.pow(currentX - lastX, 2) + Math.pow(currentY - lastY, 2));

            // 如果距离很大，在两点之间插入额外的模糊区域
            if (distance > brushSize / 2) {
                const steps = Math.ceil(distance / (brushSize / 2));
                for (let i = 1; i < steps; i++) {
                    const ratio = i / steps;
                    const interpX = lastX + (currentX - lastX) * ratio;
                    const interpY = lastY + (currentY - lastY) * ratio;

                    // 使用优化的模糊区域创建函数
                    if (typeof optimizedCreateBlurArea === 'function') {
                        optimizedCreateBlurArea(interpX - brushSize / 2, interpY - brushSize / 2, overlay, brushSize);
                    } else if (typeof createBlurArea === 'function') {
                        createBlurArea(interpX, interpY, overlay);
                    }
                }
            }
        }

        // 在当前位置创建模糊区域
        if (typeof optimizedCreateBlurArea === 'function') {
            optimizedCreateBlurArea(currentX - brushSize / 2, currentY - brushSize / 2, overlay, brushSize);
        } else if (typeof createBlurArea === 'function') {
            createBlurArea(currentX, currentY, overlay);
        }

        // 更新上一个点的位置
        lastX = currentX;
        lastY = currentY;
    }

    // 鼠标按下事件处理
    function onMouseDown(e) {
        e.preventDefault();

        // 获取鼠标坐标
        let pos;
        if (typeof window.getMousePosition === 'function') {
            pos = window.getMousePosition(e, overlay);
        } else {
            const rect = overlay.getBoundingClientRect();
            pos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }

        lastX = pos.x;
        lastY = pos.y;
        isDrawing = true;

        // 获取设置
        const brushSize = window.toolSettings && window.toolSettings.mosaic ? window.toolSettings.mosaic.brushSize : 20;

        // 创建第一个模糊区域
        if (typeof optimizedCreateBlurArea === 'function') {
            optimizedCreateBlurArea(lastX - brushSize / 2, lastY - brushSize / 2, overlay, brushSize);
        } else if (typeof createBlurArea === 'function') {
            createBlurArea(lastX, lastY, overlay);
        }
    }

    // 鼠标释放事件处理
    function onMouseUp() {
        handleDrawingEnd();
    }

    // 鼠标离开事件处理
    function onMouseLeave() {
        handleDrawingEnd();
    }
}

// 设置工具按钮激活状态
function setActiveToolButton(toolName) {
    // 移除所有工具按钮的活跃状态
    if (rectangleTool) rectangleTool.classList.remove('active');
    if (mosaicTool) mosaicTool.classList.remove('active');
    if (textTool) textTool.classList.remove('active');

    // 设置当前工具的活跃状态
    activeTool = toolName;

    // 更新工具按钮UI
    switch (toolName) {
        case 'rectangle':
            if (rectangleTool) rectangleTool.classList.add('active');
            break;
        case 'mosaic':
            if (mosaicTool) mosaicTool.classList.add('active');
            break;
        case 'text':
            if (textTool) textTool.classList.add('active');
            break;
    }
}

// 激活文字工具
function activateTextTool(imageElement) {
    // 不再移除现有的标注
    // removeAllAnnotations();

    // 显示工具设置面板
    showToolSettings('text');

    // 通知用户
    showMessage('文字工具已激活 - 请在图片上点击添加文字');

    // 获取父容器
    const container = imageElement.parentElement;

    // 检查是否已存在覆盖层，不存在则创建新的覆盖层
    let overlay = container.querySelector('.drawing-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'drawing-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.zIndex = '10';
        overlay.style.cursor = 'text';
        container.style.position = 'relative';
        container.appendChild(overlay);
    } else {
        // 如果已存在覆盖层，更改其光标样式
        overlay.style.cursor = 'text';
    }

    // 清除覆盖层上之前工具可能添加的事件监听器
    clearOverlayEventListeners(overlay);

    // 点击事件
    function onClick(e) {
        // 如果点击的是文本标签或控制面板，则不创建新的文本框
        if (e.target.classList.contains('text-annotation') ||
            e.target.closest('.text-annotation') ||
            e.target.closest('.text-control-panel')) {
            return;
        }

        // 获取相对于覆盖层的坐标
        const rect = overlay.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 创建文本输入框
        const textInput = document.createElement('textarea');
        textInput.className = 'text-annotation';
        textInput.style.position = 'absolute';
        textInput.style.left = x + 'px';
        textInput.style.top = y + 'px';
        textInput.style.width = '200px';
        textInput.style.minHeight = '40px';
        textInput.style.padding = '5px';
        textInput.style.border = '1px solid #1890ff';
        textInput.style.borderRadius = '4px';
        textInput.style.fontFamily = toolSettings.text.fontFamily;
        textInput.style.fontSize = toolSettings.text.fontSize + 'px';
        textInput.style.color = toolSettings.text.textColor;
        textInput.style.backgroundColor = toolSettings.text.backgroundColor;
        textInput.style.fontWeight = toolSettings.text.isBold ? 'bold' : 'normal';
        textInput.style.fontStyle = toolSettings.text.isItalic ? 'italic' : 'normal';
        textInput.style.zIndex = '11';
        textInput.style.resize = 'both';
        textInput.placeholder = '请输入文字...';
        overlay.appendChild(textInput);

        // 自动聚焦
        textInput.focus();

        // 失去焦点事件
        textInput.addEventListener('blur', function() {
            // 如果文本框为空，则移除
            if (textInput.value.trim() === '') {
                overlay.removeChild(textInput);
                return;
            }

            // 否则，转换为文本标签容器
            const textContainer = document.createElement('div');
            textContainer.className = 'annotation-container text-container';
            textContainer.style.position = 'absolute';
            textContainer.style.left = textInput.style.left;
            textContainer.style.top = textInput.style.top;
            textContainer.style.minWidth = '40px';
            textContainer.style.minHeight = '24px';

            // 创建文本标签
            const textLabel = document.createElement('div');
            textLabel.className = 'text-annotation';
            textLabel.style.position = 'relative';
            textLabel.style.padding = '5px';
            textLabel.style.backgroundColor = toolSettings.text.backgroundColor;
            textLabel.style.border = '1px solid #1890ff';
            textLabel.style.borderRadius = '4px';
            textLabel.style.fontFamily = toolSettings.text.fontFamily;
            textLabel.style.fontSize = toolSettings.text.fontSize + 'px';
            textLabel.style.color = toolSettings.text.textColor;
            textLabel.style.fontWeight = toolSettings.text.isBold ? 'bold' : 'normal';
            textLabel.style.fontStyle = toolSettings.text.isItalic ? 'italic' : 'normal';
            textLabel.style.cursor = 'move';
            textLabel.style.wordBreak = 'break-word';
            textLabel.textContent = textInput.value;
            textContainer.appendChild(textLabel);

            // 添加调整大小的手柄
            addResizeHandles(textContainer, overlay);

            // 添加双击编辑功能
            addDoubleClickToEdit(textContainer, textLabel, overlay);

            // 替换文本输入框
            overlay.replaceChild(textContainer, textInput);

            // 使文本容器可拖动
            makeElementDraggable(textContainer, overlay);

            console.log('创建文本标签', {
                text: textLabel.textContent
            });
        });

        console.log('添加文字输入框', {
            x,
            y
        });
    }

    // 允许拖放
    function onDragOver(e) {
        e.preventDefault();
    }

    // 添加事件监听器
    overlay.addEventListener('click', onClick);
    overlay.addEventListener('dragover', onDragOver);

    // 保存事件监听器引用，方便后续清除
    overlay._eventListeners = {
        click: onClick,
        dragover: onDragOver
    };

    // 添加调整大小的手柄
    function addResizeHandles(element, parent) {
        // 添加四个角的调整手柄
        const positions = [{
                className: 'handle-nw',
                cursor: 'nw-resize'
            },
            {
                className: 'handle-ne',
                cursor: 'ne-resize'
            },
            {
                className: 'handle-sw',
                cursor: 'sw-resize'
            },
            {
                className: 'handle-se',
                cursor: 'se-resize'
            }
        ];

        positions.forEach(position => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${position.className}`;
            handle.style.position = 'absolute';
            handle.style.width = '8px';
            handle.style.height = '8px';
            handle.style.backgroundColor = 'white';
            handle.style.border = '1px solid red';
            handle.style.cursor = position.cursor;

            if (position.className === 'handle-nw') {
                handle.style.top = '-4px';
                handle.style.left = '-4px';
            } else if (position.className === 'handle-ne') {
                handle.style.top = '-4px';
                handle.style.right = '-4px';
            } else if (position.className === 'handle-sw') {
                handle.style.bottom = '-4px';
                handle.style.left = '-4px';
            } else if (position.className === 'handle-se') {
                handle.style.bottom = '-4px';
                handle.style.right = '-4px';
            }

            element.appendChild(handle);

            // 使用优化版本的调整大小函数
            if (typeof optimizedMakeHandleResizable === 'function') {
                optimizedMakeHandleResizable(handle, element, position.className, parent);
            } else {
                makeHandleResizable(handle, element, position.className, parent);
            }
        });
    }

    // 矩形创建完成的处理
    function onRectangleCreated(element, overlay) {
        if (!element) return;

        // 启用交互
        element.style.pointerEvents = 'auto';

        // 添加调整大小的手柄
        addResizeHandles(element, overlay);

        // 使元素可拖动 - 使用优化版本
        if (typeof optimizedMakeElementDraggable === 'function') {
            optimizedMakeElementDraggable(element, overlay);
        } else {
            makeElementDraggable(element, overlay);
        }

        console.log('矩形创建完成');
    }

    // 添加双击编辑功能
    function addDoubleClickToEdit(container, textElement, parent) {
        container.addEventListener('dblclick', function(e) {
            // 创建新的文本输入框
            const newTextInput = document.createElement('textarea');
            newTextInput.className = 'text-annotation';
            newTextInput.style.position = 'absolute';
            newTextInput.style.left = container.style.left;
            newTextInput.style.top = container.style.top;
            newTextInput.style.width = (container.offsetWidth) + 'px';
            newTextInput.style.minHeight = (container.offsetHeight) + 'px';
            newTextInput.style.padding = '5px';
            newTextInput.style.border = '1px solid #1890ff';
            newTextInput.style.borderRadius = '4px';
            newTextInput.style.fontFamily = textElement.style.fontFamily;
            newTextInput.style.fontSize = textElement.style.fontSize;
            newTextInput.style.color = textElement.style.color;
            newTextInput.style.backgroundColor = textElement.style.backgroundColor;
            newTextInput.style.fontWeight = textElement.style.fontWeight;
            newTextInput.style.fontStyle = textElement.style.fontStyle;
            newTextInput.style.zIndex = '11';
            newTextInput.style.resize = 'both';
            newTextInput.value = textElement.textContent;

            parent.replaceChild(newTextInput, container);
            newTextInput.focus();

            // 失去焦点事件
            newTextInput.addEventListener('blur', function() {
                if (newTextInput.value.trim() === '') {
                    parent.removeChild(newTextInput);
                    return;
                }

                // 更新文本内容
                textElement.textContent = newTextInput.value;
                parent.replaceChild(container, newTextInput);
            });
        });
    }

    // 使手柄可以调整大小
    function makeHandleResizable(handle, element, handleClass, parent) {
        let isResizing = false;
        let startX, startY;
        let startWidth, startHeight;

        handle.addEventListener('mousedown', function(e) {
            isResizing = true;

            // 获取开始位置
            startX = e.clientX;
            startY = e.clientY;
            startWidth = element.offsetWidth;
            startHeight = element.offsetHeight;

            // 阻止事件冒泡
            e.stopPropagation();
        });

        parent.addEventListener('mousemove', function(e) {
            if (!isResizing) return;

            // 计算移动距离
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            // 调整大小
            if (handleClass === 'handle-br') {
                element.style.width = Math.max(40, startWidth + dx) + 'px';
                element.style.height = Math.max(24, startHeight + dy) + 'px';
            }
        });

        parent.addEventListener('mouseup', function() {
            isResizing = false;
        });

        parent.addEventListener('mouseleave', function() {
            isResizing = false;
        });
    }

    // 使元素可拖动
    function makeElementDraggable(element, parent) {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        element.addEventListener('mousedown', function(e) {
            // 如果点击的是手柄，则不启动拖动
            if (e.target.classList.contains('annotation-handle')) {
                return;
            }

            isDragging = true;
            const rect = element.getBoundingClientRect();
            const parentRect = parent.getBoundingClientRect();

            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            element.style.cursor = 'move';

            // 阻止事件冒泡
            e.stopPropagation();
        });

        parent.addEventListener('mousemove', function(e) {
            if (!isDragging) return;

            const parentRect = parent.getBoundingClientRect();
            const x = e.clientX - parentRect.left - offsetX;
            const y = e.clientY - parentRect.top - offsetY;

            // 确保不超出父容器边界
            const maxX = parentRect.width - element.offsetWidth;
            const maxY = parentRect.height - element.offsetHeight;

            element.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
            element.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
        });

        parent.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                element.style.cursor = '';
            }
        });

        parent.addEventListener('mouseleave', function() {
            if (isDragging) {
                isDragging = false;
                element.style.cursor = '';
            }
        });
    }
}

// 移除所有标注
function removeAllAnnotations() {
    // 移除绘图覆盖层
    const overlays = document.querySelectorAll('.drawing-overlay');
    overlays.forEach(overlay => overlay.remove());
}

// 显示消息
function showMessage(message) {
    console.log(message);
    showError(message);
}

// 从侧边栏加载图片
function loadImageFromSidebar(imgPath) {
    try {
        console.log('从侧边栏加载图片:', imgPath);

        // 确保canvasContainer存在
        if (!canvasContainer) {
            console.error('画布容器不存在');
            showError('无法加载图片：画布容器不存在');
            return;
        }

        // 清空画布容器
        canvasContainer.innerHTML = '';

        // 创建图片容器
        const imageContainer = document.createElement('div');
        imageContainer.id = 'image-container';
        imageContainer.style.width = '100%';
        imageContainer.style.position = 'relative';
        imageContainer.style.display = 'flex';
        imageContainer.style.justifyContent = 'center';
        imageContainer.style.alignItems = 'center';
        canvasContainer.appendChild(imageContainer);

        // 显示加载指示器
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }

        // 创建新图片元素
        const img = document.createElement('img');
        img.src = imgPath;

        // 设置图片加载事件
        img.onload = function() {
            console.log('图片加载完成', {
                width: img.width,
                height: img.height,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight
            });

            // 设置容器样式
            canvasContainer.classList.add('image-view-mode');
            canvasContainer.style.display = 'flex';
            canvasContainer.style.alignItems = 'center'; // 确保垂直居中
            canvasContainer.style.justifyContent = 'center'; // 确保水平居中

            // 判断是否为长图，调整容器高度
            const isLongImage = img.naturalHeight > img.naturalWidth * 2;
            if (isLongImage) {
                console.log('检测到长图，调整容器样式');
                // 长图时仍然保持居中，但启用滚动
                canvasContainer.style.overflowY = 'auto';

                // 添加提示信息
                showMessage('检测到长图，可滚动查看完整内容');
            }

            // 确保图片宽度适应容器
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.transformOrigin = 'center center'; // 确保缩放始终从中心点开始

            // 隐藏上传区域和提示
            if (dropZone) dropZone.style.display = 'none';
            if (tipsElement) tipsElement.style.display = 'none';

            // 添加鼠标滚轮缩放事件
            addWheelZoomSupport(imageContainer, img);

            // 隐藏加载指示器
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }

            // 显示工具栏
            console.log('显示工具栏');
        };

        // 设置图片加载错误事件
        img.onerror = function() {
            console.error('图片加载失败');
            showError('图片加载失败，请重试');

            // 返回上传页面
            canvasContainer.style.display = 'none';
            if (dropZone) dropZone.style.display = 'flex';
            if (tipsElement) tipsElement.style.display = 'block';

            // 隐藏加载指示器
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        };

        // 将图片添加到容器
        imageContainer.appendChild(img);
    } catch (error) {
        console.error('加载图片时出错', error);
        showError('加载图片时出错: ' + error.message);

        // 隐藏加载指示器
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
}

// 初始化拖放区域
function initDropZone() {
    console.log('初始化拖放区域...');
    if (!dropZone || !fileInput) {
        console.error('初始化拖放区域失败：必要的DOM元素不存在');
        return false;
    }

    try {
        // 确保dropZone有正确的类名
        dropZone.className = 'upload-area';

        // 为已经在initEventListeners中添加的事件添加兜底措施
        if (typeof handleDragOver !== 'function' || typeof handleDrop !== 'function') {
            console.warn('拖放处理函数未定义，重新添加事件处理');

            // 重新定义拖放事件处理函数
            window.handleDragOver = function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (dropZone) {
                    dropZone.classList.add('upload-area-active');
                }
            };

            window.handleDragLeave = function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (dropZone) {
                    dropZone.classList.remove('upload-area-active');
                }
            };

            window.handleDrop = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('文件已拖放');
                if (dropZone) {
                    dropZone.classList.remove('upload-area-active');
                }

                if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const file = e.dataTransfer.files[0];
                    if (file.type.match('image.*')) {
                        loadImageToContainer(file);
                    } else {
                        showError('请上传图片文件');
                    }
                }
            };

            // 重新添加事件监听器
            dropZone.addEventListener('dragover', handleDragOver, false);
            dropZone.addEventListener('dragleave', handleDragLeave, false);
            dropZone.addEventListener('drop', handleDrop, false);
        }

        // 确保点击上传区域触发文件选择
        dropZone.addEventListener('click', function() {
            console.log('点击上传区域');
            if (fileInput) {
                fileInput.click();
            }
        });

        return true;
    } catch (error) {
        console.error('初始化拖放区域时出错', error);
        return false;
    }
}

// 确保在文档加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    console.log('文档加载完成，开始初始化应用...');
    try {
        // 初始化应用
        init();
    } catch (e) {
        console.error('应用初始化失败:', e);
        showError('应用初始化失败，请刷新页面重试');
    }
});

// 以防万一DOMContentLoaded已经触发过，再次检查
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('文档已加载完成，立即初始化应用...');
    setTimeout(init, 1);
}

function loadImageToContainer(imageUrl) {
    const canvasContainer = document.getElementById('canvas-container');
    canvasContainer.innerHTML = '';
    canvasContainer.style.display = 'flex';
    canvasContainer.style.visibility = 'visible';

    // 创建图片元素
    const img = document.createElement('img');
    img.id = 'displayed-image';
    img.src = imageUrl;
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.draggable = false; // 防止拖动图片

    // 创建图片容器div
    const imageContainer = document.createElement('div');
    imageContainer.id = 'image-container';
    imageContainer.style.position = 'relative';
    imageContainer.style.width = '100%';
    imageContainer.appendChild(img);

    // 添加到canvas容器
    canvasContainer.appendChild(imageContainer);

    // 等待图片加载
    img.onload = function() {
        console.log(`图片加载完成: ${img.naturalWidth} x ${img.naturalHeight}`);

        // 创建绘图覆盖层 - 确保正确创建和配置
        const overlay = document.createElement('div');
        overlay.className = 'drawing-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.pointerEvents = 'auto'; // 关键 - 确保可以接收鼠标事件
        overlay.style.zIndex = '10'; // 确保在图片上层
        imageContainer.appendChild(overlay);

        console.log('绘图覆盖层已创建', {
            width: overlay.offsetWidth,
            height: overlay.offsetHeight,
            pointerEvents: overlay.style.pointerEvents,
            zIndex: overlay.style.zIndex
        });

        // 添加滚轮缩放支持
        if (typeof addWheelZoomSupport === 'function') {
            addWheelZoomSupport(canvasContainer, img);
        }

        // 使编辑工具可用
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.disabled = false;
        });

        // 隐藏加载指示器和上传区域
        document.getElementById('loading-indicator').style.display = 'none';
        document.getElementById('drop-zone').style.display = 'none';

        // 设置初始缩放为1
        currentScale = 1;
        if (typeof updateZoomIndicator === 'function') {
            updateZoomIndicator(currentScale);
        }

        // 调用修复函数（如果存在）
        if (typeof fixDrawingOverlay === 'function') {
            setTimeout(fixDrawingOverlay, 200);
        }
    };

    // 处理加载错误
    img.onerror = function() {
        console.error('图片加载失败');
        showError('无法加载图片，请检查图片格式是否正确');
        document.getElementById('loading-indicator').style.display = 'none';
        document.getElementById('drop-zone').style.display = 'flex';
    };
}

// 添加新的函数处理文件上传
function loadImageFromFile(file) {
    // 创建文件读取器
    const reader = new FileReader();

    // 设置读取完成后的处理函数
    reader.onload = function(e) {
        // 读取完成后的图片数据URL
        const imageUrl = e.target.result;
        // 加载图片到容器
        loadImageToContainer(imageUrl);
    };

    // 设置读取错误的处理函数
    reader.onerror = function() {
        console.error('读取文件时出错');
        showError('读取文件时出错，请重试');
        document.getElementById('loading-indicator').style.display = 'none';
        document.getElementById('drop-zone').style.display = 'flex';
    };

    // 以DataURL形式读取文件
    reader.readAsDataURL(file);
}