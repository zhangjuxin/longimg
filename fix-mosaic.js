// 马赛克功能修复脚本 - Canvas统一实现
(function() {
    console.log('加载马赛克功能修复脚本 - Canvas统一实现');

    // 确保toolSettings对象存在并正确初始化
    if (!window.toolSettings) {
        window.toolSettings = {};
    }

    // 只保留blockSize设置
    if (!window.toolSettings.mosaic) {
        window.toolSettings.mosaic = {
            blockSize: 15 // 默认马赛克块大小
        };
    } else {
        // 移除笔刷大小设置
        if (window.toolSettings.mosaic.brushSize) {
            delete window.toolSettings.mosaic.brushSize;
        }
    }

    // 完全替代上传功能 - 创建一个新的上传按钮
    function createNewUploadButton() {
        console.log('[上传] 创建全新的上传按钮');

        // 获取上传区域
        const dropZone = document.getElementById('drop-zone');
        if (!dropZone) {
            console.error('[上传] 找不到上传区域');
            return;
        }

        // 获取文件输入
        let fileInput = document.getElementById('file-input');
        if (!fileInput) {
            // 如果找不到现有的file input，创建一个新的
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'file-input';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
        }

        // 创建明显的上传按钮
        const uploadButton = document.createElement('button');
        uploadButton.id = 'direct-upload-button';
        uploadButton.innerHTML = '点击上传图片';
        uploadButton.style.padding = '12px 24px';
        uploadButton.style.backgroundColor = '#4a89dc';
        uploadButton.style.color = 'white';
        uploadButton.style.border = 'none';
        uploadButton.style.borderRadius = '4px';
        uploadButton.style.fontSize = '16px';
        uploadButton.style.fontWeight = 'bold';
        uploadButton.style.cursor = 'pointer';
        uploadButton.style.margin = '20px auto';
        uploadButton.style.display = 'block';
        uploadButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

        // 添加悬停效果
        uploadButton.onmouseover = function() {
            this.style.backgroundColor = '#3b7ddb';
        };
        uploadButton.onmouseout = function() {
            this.style.backgroundColor = '#4a89dc';
        };

        // 添加点击事件
        uploadButton.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[上传] 点击了直接上传按钮');

            // 强制触发文件选择
            fileInput.click();

            return false;
        };

        // 在上传区域中添加按钮
        dropZone.innerHTML = '<p>将图片拖放到此处，或使用下方按钮</p>';
        dropZone.appendChild(uploadButton);

        // 处理文件选择
        fileInput.onchange = function() {
            if (!this.files || this.files.length === 0) {
                console.log('[上传] 未选择文件');
                return;
            }

            const file = this.files[0];
            console.log('[上传] 选择了文件:', file.name);

            if (!file.type.match('image.*')) {
                alert('请选择图片文件');
                return;
            }

            // 显示加载指示器
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'block';
            }

            // 处理文件
            manuallyLoadImage(file);
        };

        console.log('[上传] 新上传按钮创建完成');
    }

    // 在DOM加载完成后立即创建新的上传按钮
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createNewUploadButton);
    } else {
        // DOM已经加载完成，直接执行
        createNewUploadButton();
    }

    // 也在500ms后尝试执行一次，以防万一
    setTimeout(createNewUploadButton, 500);

    // 修复文件上传功能
    function fixFileUpload() {
        // 获取上传按钮和文件输入框
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');

        if (!dropZone || !fileInput) {
            console.error('[错误] 找不到上传区域或文件输入框');
            return;
        }

        console.log('[上传] 重新绑定文件上传事件');

        // 彻底移除可能已经存在的事件
        const newDropZone = dropZone.cloneNode(true);
        dropZone.parentNode.replaceChild(newDropZone, dropZone);

        // 获取新的元素引用
        const fileInputNew = document.getElementById('file-input');

        // 修复点击上传区域触发文件选择 - 直接添加内联点击事件
        newDropZone.onclick = function(e) {
            console.log('[上传] 点击上传区域，直接触发文件选择');
            // 阻止事件冒泡和默认行为
            e.preventDefault();
            e.stopPropagation();

            // 强制触发文件选择对话框
            setTimeout(function() {
                fileInputNew.click();
            }, 10);

            return false;
        };

        // 确保文件选择触发处理函数
        fileInputNew.onchange = function(e) {
            console.log('[上传] 文件选择事件触发 (onchange)');

            if (this.files && this.files.length > 0) {
                const file = this.files[0];
                console.log('[上传] 选择了文件:', file.name, file.type);

                // 确认是图片文件
                if (file.type.match('image.*')) {
                    // 在原始handleFileSelect可能失败的情况下，尝试我们自己的加载逻辑
                    setTimeout(function() {
                        const canvasContainer = document.getElementById('canvas-container');
                        // 如果300ms后图片容器仍未创建，说明原始加载可能失败了
                        if (!document.getElementById('image-container')) {
                            console.log('[上传] 原始加载可能失败，尝试手动处理文件');
                            // 使用备用方法创建图片
                            manuallyLoadImage(file);
                        } else {
                            console.log('[上传] 原始加载已成功');
                        }
                    }, 300);
                }
            }
        };

        // 也添加标准监听器作为备份
        fileInputNew.addEventListener('change', function(e) {
            console.log('[上传] 文件选择事件触发 (addEventListener)');
        }, false);

        // 调试信息
        console.log('[上传] 文件上传功能修复完成');
        console.log('[上传] 上传区域:', newDropZone);
        console.log('[上传] 文件输入:', fileInputNew);

        // 添加拖拽事件处理
        newDropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.backgroundColor = '#e1e7f0';
        }, false);

        newDropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.backgroundColor = '';
        }, false);

        newDropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.backgroundColor = '';

            const dt = e.dataTransfer;
            const files = dt.files;

            if (files && files.length > 0) {
                const file = files[0];
                if (file.type.match('image.*')) {
                    console.log('[上传] 拖拽上传文件:', file.name);
                    manuallyLoadImage(file);
                } else {
                    alert('请上传图片文件');
                }
            }
        }, false);

        // 直接暴露到全局作用域，以便其他地方可能需要使用
        window._fixedDropZone = newDropZone;
        window._fixedFileInput = fileInputNew;
    }

    // 立即执行文件上传修复
    setTimeout(function() {
        console.log('[上传] 执行立即修复');
        fixFileUpload();
    }, 500); // 等待500ms确保页面元素已加载

    // 备用图片加载方法
    function manuallyLoadImage(file) {
        console.log('[上传] 使用备用方法加载图片');

        const canvasContainer = document.getElementById('canvas-container');
        if (!canvasContainer) {
            console.error('[上传] 找不到canvas容器');
            return;
        }

        // 清空容器
        canvasContainer.innerHTML = '';
        canvasContainer.style.display = 'flex';

        // 隐藏上传区域
        const dropZone = document.getElementById('drop-zone');
        if (dropZone) dropZone.style.display = 'none';

        // 创建图片容器
        const imageContainer = document.createElement('div');
        imageContainer.id = 'image-container';
        imageContainer.style.position = 'relative';
        imageContainer.style.width = '100%';
        canvasContainer.appendChild(imageContainer);

        // 使用FileReader读取文件
        const reader = new FileReader();
        reader.onload = function(e) {
            // 创建图片元素
            const img = document.createElement('img');
            img.id = 'displayed-image';
            img.src = e.target.result;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.draggable = false;

            // 图片加载完成后
            img.onload = function() {
                console.log('[上传] 图片加载完成', img.naturalWidth, img.naturalHeight);
                // 添加图片到容器
                imageContainer.appendChild(img);

                // 检查是否需要转换为Canvas
                if (typeof convertImageToCanvas === 'function') {
                    setTimeout(function() {
                        convertImageToCanvas(img);
                    }, 100);
                }
            };
        };

        reader.onerror = function() {
            console.error('[上传] 文件读取失败');
            alert('文件读取失败，请重试');
        };

        reader.readAsDataURL(file);
    }

    // 设置header始终固定在顶部
    function fixHeaderPosition() {
        const header = document.querySelector('header');
        if (!header) {
            console.log('[警告] 未找到header元素');
            return;
        }

        // 计算header高度
        const headerHeight = header.offsetHeight;
        console.log(`[布局] Header高度: ${headerHeight}px`);

        // 设置header固定在顶部
        header.style.position = 'fixed';
        header.style.top = '0';
        header.style.left = '0';
        header.style.width = '100%';
        header.style.zIndex = '1000'; // 确保在其他元素之上
        header.style.backgroundColor = '#fff'; // 设置背景色，避免透明
        header.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'; // 添加阴影效果

        // 获取主内容区域
        const mainContent = document.querySelector('#image-container') || document.querySelector('main');
        if (mainContent) {
            // 为内容区域添加上边距，防止被header遮挡
            mainContent.style.marginTop = `${headerHeight + 10}px`;
            console.log(`[布局] 已为内容区域添加 ${headerHeight + 10}px 上边距`);
        } else {
            // 如果找不到主内容区，为body添加padding
            document.body.style.paddingTop = `${headerHeight + 10}px`;
            console.log('[布局] 未找到主内容区，已为body添加上边距');
        }
    }

    // 当前缩放比例
    let canvasZoomLevel = 80; // 默认80%宽度

    // 当前活动工具
    let activeToolName = 'mosaic'; // 默认马赛克工具

    // 存储马赛克区域
    const mosaicAreas = [];

    // Canvas和上下文
    let mainCanvas = null;
    let mainCtx = null;

    // 原始图像数据，用于重置和撤销操作
    let originalImageData = null;

    // Canvas创建初始化完成标志
    let canvasInitialized = false;

    // 添加全局存储的箭头数组
    let arrows = [];
    // 箭头状态变量
    let arrowStart = null;
    let arrowEnd = null;
    let isDrawingArrow = false;
    let selectedArrowIndex = -1;

    // 箭头样式设置
    let arrowSettings = {
        strokeColor: '#ff0000', // 默认红色
        strokeWidth: 3, // 默认3px粗
        headSize: 15 // 箭头头部大小
    };

    // 设置Canvas样式 - 修改为更可靠的居中方法
    function setCanvasSize(imgElement) {
        // 获取当前Canvas元素
        const canvas = document.getElementById('main-edit-canvas');
        if (!canvas) return;

        // 获取图片容器
        const imageContainer = canvas.closest('#image-container') || canvas.parentElement;
        if (!imageContainer) return;

        // 确保容器具有适当的样式
        imageContainer.style.position = 'relative';
        imageContainer.style.textAlign = 'center'; // 额外的居中支持

        // 重置Canvas样式 - 使用更可靠的居中方法
        canvas.style.width = `${canvasZoomLevel}%`;
        canvas.style.height = 'auto';
        canvas.style.position = 'relative'; // 改为相对定位
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.margin = '0 auto'; // 使用margin: auto实现居中
        canvas.style.display = 'block'; // 确保是块级元素
        canvas.style.zIndex = '5';

        // 同时调整交互覆盖层
        const overlay = document.getElementById('canvas-interaction-overlay');
        if (overlay) {
            overlay.style.width = `${canvasZoomLevel}%`;
            overlay.style.height = '100%';
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.right = '0';
            overlay.style.margin = '0 auto'; // 使用margin: auto实现居中
        }

        // 强制重绘以确保更新
        setTimeout(() => {
            if (canvas) canvas.style.display = 'block';
            if (overlay) overlay.style.display = 'block';
        }, 0);

        console.log(`[缩放] Canvas宽度已设置为: ${canvasZoomLevel}%, 居中方式: margin auto`);
    }

    // 缩小功能
    function zoomOut() {
        if (canvasZoomLevel <= 30) return; // 最小宽度限制
        canvasZoomLevel -= 10;
        setCanvasSize();
    }

    // 放大功能
    function zoomIn() {
        if (canvasZoomLevel >= 150) return; // 最大宽度限制
        canvasZoomLevel += 10;
        setCanvasSize();
    }

    // 当页面加载后直接执行
    (function directInit() {
        console.log('[直接初始化] 立即检查图片并转换为Canvas');

        // 立即查找图片元素
        const img = document.querySelector('#displayed-image');
        if (img && img.complete) {
            forceCreateCanvas(img);
        } else if (img) {
            // 如果图片还未加载完成，等待加载
            img.onload = function() {
                forceCreateCanvas(img);
            };
        }

        // 定时器确保转换一定会执行
        setTimeout(function() {
            const currentImg = document.querySelector('#displayed-image');
            if (currentImg && !document.querySelector('#main-edit-canvas')) {
                console.log('[定时检查] 发现图片但没有Canvas，强制转换');
                forceCreateCanvas(currentImg);
            }
        }, 500);
    })();

    // 强制创建Canvas替换图片
    function forceCreateCanvas(imgElement) {
        if (!imgElement) {
            console.error('[错误] 没有找到图片元素');
            return;
        }

        console.log('[强制转换] 开始将图片转换为Canvas');

        // 获取图片容器
        const imageContainer = imgElement.closest('#image-container') || imgElement.parentElement;
        if (!imageContainer) {
            console.error('[错误] 图片没有父容器');
            return;
        }

        // 确保容器样式正确
        imageContainer.style.position = 'relative';
        imageContainer.style.width = imgElement.offsetWidth + 'px';
        imageContainer.style.height = imgElement.offsetHeight + 'px';
        imageContainer.style.textAlign = 'center'; // 额外的居中支持

        // 创建Canvas
        if (!mainCanvas) {
            mainCanvas = document.createElement('canvas');
            mainCanvas.id = 'main-edit-canvas';
            mainCanvas.width = imgElement.naturalWidth || imgElement.width;
            mainCanvas.height = imgElement.naturalHeight || imgElement.height;

            // 设置默认Canvas样式 - 使用改进的居中方法
            mainCanvas.style.width = `${canvasZoomLevel}%`;
            mainCanvas.style.height = 'auto';
            mainCanvas.style.position = 'relative'; // 改为相对定位
            mainCanvas.style.top = '0';
            mainCanvas.style.left = '0';
            mainCanvas.style.margin = '0 auto'; // 使用margin实现居中
            mainCanvas.style.display = 'block'; // 确保是块级元素
            mainCanvas.style.zIndex = '5';
        }

        // 获取上下文
        mainCtx = mainCanvas.getContext('2d');

        try {
            // 将图片绘制到Canvas
            mainCtx.drawImage(imgElement, 0, 0, mainCanvas.width, mainCanvas.height);

            // 保存原始图像数据
            originalImageData = mainCtx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);

            // 隐藏现有的drawing-overlay
            const existingOverlay = document.querySelector('.drawing-overlay');
            if (existingOverlay) {
                existingOverlay.style.display = 'none';
            }

            // 设置图片样式但保持可见
            imgElement.style.opacity = '0';
            imgElement.style.position = 'absolute';

            // 插入Canvas
            imageContainer.insertBefore(mainCanvas, imgElement);

            // 创建交互覆盖层 - 使用改进的居中方法
            const overlay = document.createElement('div');
            overlay.id = 'canvas-interaction-overlay';
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.right = '0';
            overlay.style.margin = '0 auto'; // 使用margin实现居中
            overlay.style.width = `${canvasZoomLevel}%`; // 与Canvas宽度一致
            overlay.style.height = '100%';
            overlay.style.zIndex = '10';
            overlay.style.pointerEvents = 'auto';
            imageContainer.appendChild(overlay);

            console.log('[成功] 强制转换图片为Canvas完成');
            canvasInitialized = true;

            // 确保居中显示
            setTimeout(() => setCanvasSize(), 10);

            // 更新下载功能
            updateDownloadFunction();

            // 如果当前工具是马赛克，设置交互
            if (activeToolName === 'mosaic') {
                setupMosaicInteraction();
            }
        } catch (e) {
            console.error('[错误] Canvas转换失败:', e, e.stack);
        }
    }

    // 监听DOMContentLoaded事件确保在DOM加载后执行
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[初始化] 开始检查现有图片');

        // 添加全局样式
        addGlobalStyles();

        // 固定header位置
        fixHeaderPosition();

        // 处理窗口大小变化时重新计算header位置
        window.addEventListener('resize', function() {
            fixHeaderPosition();
        });

        // 修复文件上传功能
        fixFileUpload();

        // 移除现有的drawing-overlay
        const existingOverlay = document.querySelector('.drawing-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
            console.log('[清理] 移除现有drawing-overlay');
        }

        // 监听图片加载事件
        document.addEventListener('load', function(e) {
            if (e.target.tagName === 'IMG') {
                console.log('[加载] 检测到新图片加载，准备转换为Canvas');
                convertImageToCanvas(e.target);
            }
        }, true);

        // 记录原始函数
        const originalActivateMosaicTool = window.activateMosaicTool;
        const originalSetActiveToolButton = window.setActiveToolButton;

        // 禁用其他工具函数，确保使用我们的Canvas版本
        disableOriginalTools();

        // 重写setActiveToolButton函数，记录当前激活的工具
        if (typeof window.setActiveToolButton === 'function') {
            window.setActiveToolButton = function(toolName) {
                console.log(`[工具切换] 从 ${activeToolName} 切换到 ${toolName}`);
                activeToolName = toolName;

                // 清理之前的工具事件监听器
                clearToolEvents();

                // 如果切换到马赛克工具，立即设置交互
                if (toolName === 'mosaic' && canvasInitialized) {
                    setupMosaicInteraction();
                }

                // 更新工具按钮状态
                updateToolButtonState(toolName);

                // 调用原始函数
                if (originalSetActiveToolButton) {
                    originalSetActiveToolButton(toolName);
                }
            };
        }

        // 重写马赛克工具激活函数
        window.activateMosaicTool = function(imageElement) {
            console.log('[激活工具] Canvas版马赛克工具');

            // 确保Canvas已初始化
            if (!canvasInitialized) {
                // 如果Canvas未初始化，尝试初始化
                if (!initCanvasFromImage(imageElement)) {
                    console.error('[错误] 无法初始化Canvas');
                    if (typeof showError === 'function') {
                        showError('请先上传图片');
                    }
                    return;
                }
            }

            // 标记当前工具为马赛克
            activeToolName = 'mosaic';

            // 设置激活按钮状态
            if (typeof originalSetActiveToolButton === 'function') {
                originalSetActiveToolButton('mosaic');
            }

            // 更新工具按钮状态
            updateToolButtonState('mosaic');

            // 显示设置面板
            if (typeof showToolSettings === 'function') {
                showToolSettings('mosaic');

                // 延迟执行，确保DOM已更新
                setTimeout(() => {
                    // 隐藏笔刷大小相关UI元素
                    const brushSizeInput = document.querySelector('#mosaic-brush-size, [name="mosaic-brush-size"]');
                    if (brushSizeInput) {
                        const container = brushSizeInput.closest('.setting-item, .control-group') || brushSizeInput.parentElement;
                        if (container) {
                            container.style.display = 'none';
                        } else {
                            brushSizeInput.style.display = 'none';

                            const label = document.querySelector('label[for="mosaic-brush-size"]');
                            if (label) label.style.display = 'none';
                        }
                    }

                    // 更新设置面板标题
                    const settingsTitle = document.querySelector('.tool-settings-title');
                    if (settingsTitle && settingsTitle.textContent.includes('马赛克')) {
                        settingsTitle.textContent = '马赛克块大小设置';
                    }

                    // 更新块大小标签文本
                    const blockSizeLabel = document.querySelector('label[for="mosaic-block-size"]');
                    if (blockSizeLabel) {
                        blockSizeLabel.textContent = '马赛克块大小：';
                    }

                    // 删除模糊设置部分
                    const settingsContent = document.querySelector('.settings-content');
                    if (settingsContent) {
                        // 遍历所有设置项，查找并删除模糊设置
                        const settingItems = settingsContent.querySelectorAll('.setting-item');
                        settingItems.forEach(item => {
                            // 查找包含"模糊"文本的标签
                            const label = item.querySelector('label');
                            if (label && (label.textContent.includes('模糊') ||
                                    label.textContent.includes('blur') ||
                                    label.textContent.toLowerCase().includes('blur'))) {
                                console.log('[删除] 模糊设置项: ' + label.textContent);
                                item.style.display = 'none';
                            }
                        });

                        // 如果找到特定ID的模糊设置元素，也进行隐藏
                        const blurElements = document.querySelectorAll('#mosaic-blur, [name="mosaic-blur"], [id*="blur"], [name*="blur"]');
                        blurElements.forEach(element => {
                            const container = element.closest('.setting-item, .control-group') || element.parentElement;
                            if (container) {
                                console.log('[删除] 模糊设置容器: ' + container.className);
                                container.style.display = 'none';
                            } else {
                                console.log('[删除] 模糊设置元素: ' + element.id || element.name);
                                element.style.display = 'none';
                            }
                        });
                    }

                    console.log('[设置] 马赛克工具设置面板已更新');
                }, 100);
            }

            // 显示操作提示
            if (typeof showMessage === 'function') {
                showMessage('马赛克工具已激活 - 在图片上点击并拖动，松开鼠标将应用马赛克效果');
            }

            // 设置马赛克工具的交互
            setupMosaicInteraction();
        };

        // 绑定马赛克工具按钮
        const mosaicBtn = document.getElementById('mosaic-tool');
        if (mosaicBtn) {
            // 移除可能的旧事件监听器
            const newMosaicBtn = mosaicBtn.cloneNode(true);
            if (mosaicBtn.parentNode) {
                mosaicBtn.parentNode.replaceChild(newMosaicBtn, mosaicBtn);
            }

            // 添加新的事件监听器
            newMosaicBtn.addEventListener('click', function() {
                console.log('[点击] 马赛克工具按钮');
                window.activateMosaicTool();
            });
        }

        // 清除原始函数
        if (window.activateRectangleTool && !window.activateRectangleTool._isCustom) {
            window.activateRectangleTool = function() {
                console.log('使用新的矩形工具');
                // 确保Canvas已初始化
                if (!canvasInitialized) {
                    if (typeof showError === 'function') {
                        showError('请先上传图片');
                    }
                    return;
                }

                console.log('[激活] 矩形绘制工具');
                // 标记为矩形工具
                activeToolName = 'rectangle';

                // 清理之前的工具事件
                clearToolEvents();

                // 更新工具按钮状态
                updateToolButtonState('rectangle');

                // 设置矩形工具交互
                setupRectangleInteraction();

                // 显示矩形工具设置面板
                showRectangleSettings();

                // 显示操作提示
                if (typeof showMessage === 'function') {
                    showMessage('矩形工具已激活 - 点击并拖动创建矩形，点击已有矩形可选中，按ESC键删除');
                }
            };
            window.activateRectangleTool._isCustom = true;
        }

        if (window.activateTextTool && !window.activateTextTool._isCustom) {
            window.activateTextTool = function() {
                console.log('使用新的文本工具');
                // 确保Canvas已初始化
                if (!canvasInitialized) {
                    if (typeof showError === 'function') {
                        showError('请先上传图片');
                    }
                    return;
                }

                console.log('[激活] 文字编辑工具');
                // 标记为文字工具
                activeToolName = 'text';

                // 清理之前的工具事件
                clearToolEvents();

                // 更新工具按钮状态
                updateToolButtonState('text');

                // 设置文字工具交互
                setupTextInteraction();

                // 显示操作提示
                if (typeof showMessage === 'function') {
                    showMessage('文字工具已激活 - 点击Canvas在任意位置添加文字');
                }
            };
            window.activateTextTool._isCustom = true;
        }

        // 设置缩放按钮监听
        const zoomOutBtn = document.getElementById('zoom-out');
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', function(e) {
                console.log('[点击] 缩小按钮');
                zoomOut();
                e.preventDefault();
            });
        }

        const zoomInBtn = document.getElementById('zoom-in');
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', function(e) {
                console.log('[点击] 放大按钮');
                zoomIn();
                e.preventDefault();
            });
        }

        // 添加箭头工具按钮
        addArrowButton();

        console.log('[初始化] 缩放按钮和箭头按钮已绑定');
    });

    // 禁用原始工具函数，确保使用我们的Canvas版本
    function disableOriginalTools() {
        // 查找所有工具按钮
        const toolButtons = document.querySelectorAll('[id$="-tool"]');

        // 克隆并替换所有按钮，移除原有事件监听器
        toolButtons.forEach(btn => {
            if (btn.id === 'mosaic-tool') return; // 马赛克按钮我们已经单独处理

            const newBtn = btn.cloneNode(true);
            if (btn.parentNode) {
                btn.parentNode.replaceChild(newBtn, btn);
            }

            // 不再添加禁用消息的事件监听器
            // 让新的工具功能可以正常工作
        });

        // 清除原始函数
        if (window.activateRectangleTool && !window.activateRectangleTool._isCustom) {
            window.activateRectangleTool = function() {
                console.log('使用新的矩形工具');
                // 确保Canvas已初始化
                if (!canvasInitialized) {
                    if (typeof showError === 'function') {
                        showError('请先上传图片');
                    }
                    return;
                }

                console.log('[激活] 矩形绘制工具');
                // 标记为矩形工具
                activeToolName = 'rectangle';

                // 清理之前的工具事件
                clearToolEvents();

                // 更新工具按钮状态
                updateToolButtonState('rectangle');

                // 设置矩形工具交互
                setupRectangleInteraction();

                // 显示矩形工具设置面板
                showRectangleSettings();

                // 显示操作提示
                if (typeof showMessage === 'function') {
                    showMessage('矩形工具已激活 - 点击并拖动创建矩形，点击已有矩形可选中，按ESC键删除');
                }
            };
            window.activateRectangleTool._isCustom = true;
        }

        if (window.activateTextTool && !window.activateTextTool._isCustom) {
            window.activateTextTool = function() {
                console.log('使用新的文本工具');
                // 确保Canvas已初始化
                if (!canvasInitialized) {
                    if (typeof showError === 'function') {
                        showError('请先上传图片');
                    }
                    return;
                }

                console.log('[激活] 文字编辑工具');
                // 标记为文字工具
                activeToolName = 'text';

                // 清理之前的工具事件
                clearToolEvents();

                // 更新工具按钮状态
                updateToolButtonState('text');

                // 设置文字工具交互
                setupTextInteraction();

                // 显示操作提示
                if (typeof showMessage === 'function') {
                    showMessage('文字工具已激活 - 点击Canvas在任意位置添加文字');
                }
            };
            window.activateTextTool._isCustom = true;
        }
    }

    // 拦截图片加载，将图片转换为Canvas
    function interceptImageLoading() {
        // 监听图片上传完成事件
        if (typeof window.loadImageFromFile === 'function') {
            const originalLoadImageFromFile = window.loadImageFromFile;
            window.loadImageFromFile = function(file) {
                console.log('[拦截] 图片加载，准备转换为Canvas');

                // 先处理loading状态
                const loadingIndicator = document.getElementById('loading-indicator');
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'flex';
                }

                // 创建FileReader读取文件
                const reader = new FileReader();
                reader.onload = function(e) {
                    // 图片加载完成后，创建新图片对象
                    const img = new Image();
                    img.onload = function() {
                        // 隐藏上传区域
                        const dropZone = document.getElementById('drop-zone');
                        if (dropZone) {
                            dropZone.style.display = 'none';
                        }

                        // 显示Canvas容器
                        const canvasContainer = document.getElementById('canvas-container');
                        if (canvasContainer) {
                            canvasContainer.style.display = 'block';

                            // 创建图片容器
                            const imageContainer = document.createElement('div');
                            imageContainer.id = 'image-container';
                            imageContainer.style.position = 'relative';
                            imageContainer.style.width = '100%';
                            canvasContainer.innerHTML = '';
                            canvasContainer.appendChild(imageContainer);

                            // 添加临时图片元素
                            img.id = 'displayed-image';
                            img.style.maxWidth = '100%';
                            img.style.height = 'auto';
                            img.style.display = 'block';
                            img.draggable = false;
                            imageContainer.appendChild(img);

                            // 转换为Canvas
                            convertImageToCanvas(img);

                            // 隐藏加载指示器
                            if (loadingIndicator) {
                                loadingIndicator.style.display = 'none';
                            }
                        }
                    };

                    img.onerror = function() {
                        console.error('[错误] 图片加载失败');
                        if (typeof showError === 'function') {
                            showError('图片加载失败，请重试');
                        }
                        if (loadingIndicator) {
                            loadingIndicator.style.display = 'none';
                        }
                    };

                    // 设置图片源
                    img.src = e.target.result;
                };

                reader.onerror = function() {
                    console.error('[错误] 文件读取失败');
                    if (typeof showError === 'function') {
                        showError('文件读取失败，请重试');
                    }
                    if (loadingIndicator) {
                        loadingIndicator.style.display = 'none';
                    }
                };

                // 开始读取文件
                reader.readAsDataURL(file);
            };
        }
    }

    // 将图片转换为Canvas
    function convertImageToCanvas(imageElement) {
        if (!imageElement) return;

        console.log('[转换] 开始将图片转换为Canvas');

        // 获取图片父容器
        const parent = imageElement.parentElement;
        if (!parent) {
            console.error('[错误] 图片元素没有父容器');
            return;
        }

        // 设置父容器样式以支持居中
        parent.style.position = 'relative';
        parent.style.textAlign = 'center'; // 额外的居中支持

        // 确保图片已完全加载
        if (!imageElement.complete) {
            console.log('[等待] 图片尚未完全加载，等待加载完成');
            imageElement.onload = () => convertImageToCanvas(imageElement);
            return;
        }

        // 创建Canvas元素
        mainCanvas = document.createElement('canvas');
        mainCanvas.id = 'main-edit-canvas';
        mainCanvas.className = 'main-edit-canvas';

        // 设置Canvas尺寸与图片一致
        mainCanvas.width = imageElement.naturalWidth || imageElement.width;
        mainCanvas.height = imageElement.naturalHeight || imageElement.height;

        // 设置Canvas样式 - 使用改进的居中方法
        mainCanvas.style.width = `${canvasZoomLevel}%`;
        mainCanvas.style.height = 'auto';
        mainCanvas.style.display = 'block';
        mainCanvas.style.position = 'relative'; // 改为相对定位
        mainCanvas.style.top = '0';
        mainCanvas.style.left = '0';
        mainCanvas.style.margin = '0 auto'; // 使用margin实现居中
        mainCanvas.style.zIndex = '10';

        console.log(`[尺寸] Canvas设置为: ${mainCanvas.width} x ${mainCanvas.height}, 显示宽度: ${canvasZoomLevel}%`);

        // 获取Canvas上下文
        mainCtx = mainCanvas.getContext('2d');

        try {
            // 将图片绘制到Canvas
            mainCtx.drawImage(imageElement, 0, 0, mainCanvas.width, mainCanvas.height);

            // 保存原始图像数据
            originalImageData = mainCtx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
            console.log('[成功] 已保存原始图像数据');

            // 隐藏原始图片
            imageElement.style.display = 'none';

            // 将Canvas添加到DOM
            parent.appendChild(mainCanvas);

            // 创建交互覆盖层 - 使用改进的居中方法
            const interactionOverlay = document.createElement('div');
            interactionOverlay.id = 'canvas-interaction-overlay';
            interactionOverlay.className = 'canvas-interaction-overlay';
            interactionOverlay.style.position = 'absolute';
            interactionOverlay.style.top = '0';
            interactionOverlay.style.left = '0';
            interactionOverlay.style.right = '0';
            interactionOverlay.style.margin = '0 auto'; // 使用margin实现居中
            interactionOverlay.style.width = `${canvasZoomLevel}%`; // 与Canvas宽度一致
            interactionOverlay.style.height = '100%';
            interactionOverlay.style.pointerEvents = 'auto';
            interactionOverlay.style.zIndex = '20';
            parent.appendChild(interactionOverlay);

            console.log('[成功] Canvas和交互层已添加到DOM');
            canvasInitialized = true;

            // 确保居中显示
            setTimeout(() => setCanvasSize(), 10);

            // 更新下载功能以使用Canvas
            updateDownloadFunction();

            // 如果当前工具是马赛克，重新设置交互
            if (activeToolName === 'mosaic') {
                setupMosaicInteraction();
            }
        } catch (e) {
            console.error('[错误] Canvas转换失败:', e);
            // 恢复显示原始图片
            imageElement.style.display = 'block';
        }
    }

    // 从已有图片初始化Canvas
    function initCanvasFromImage(imageElement) {
        if (canvasInitialized) return true;

        if (!imageElement) {
            imageElement = document.querySelector('#image-container img');
            if (!imageElement) {
                console.error('[错误] 找不到图像元素');
                return false;
            }
        }

        convertImageToCanvas(imageElement);
        return canvasInitialized;
    }

    // 清理工具事件
    function clearToolEvents() {
        // 清理马赛克事件
        const overlay = document.getElementById('canvas-interaction-overlay');
        if (overlay) {
            if (typeof overlay._mosaicCleanup === 'function') {
                overlay._mosaicCleanup();
                overlay._mosaicCleanup = null;
            }

            // 清理文本编辑事件
            if (typeof overlay._textCleanup === 'function') {
                overlay._textCleanup();
                overlay._textCleanup = null;
            }

            // 清理矩形工具事件
            if (typeof overlay._rectangleCleanup === 'function') {
                overlay._rectangleCleanup();
                overlay._rectangleCleanup = null;
            }

            // 移除所有选择框
            const selectionBoxes = document.querySelectorAll('.mosaic-selection-box, .text-editor-container, .rectangle-selection-box');
            selectionBoxes.forEach(box => box.remove());
        }
    }

    // 设置马赛克工具的交互
    function setupMosaicInteraction() {
        console.log('[设置] 马赛克工具交互');

        // 获取交互覆盖层
        const overlay = document.getElementById('canvas-interaction-overlay');
        if (!overlay) {
            console.error('[错误] 找不到交互覆盖层');
            return;
        }

        // 先移除可能存在的事件监听
        if (typeof overlay._mosaicCleanup === 'function') {
            overlay._mosaicCleanup();
        }

        // 选择框状态
        let isSelecting = false;
        let startX = 0;
        let startY = 0;
        let currentBox = null;

        // 添加选择框样式
        if (!document.getElementById('mosaic-style')) {
            const style = document.createElement('style');
            style.id = 'mosaic-style';
            style.textContent = `
                .mosaic-selection-box {
                    position: absolute;
                    border: 2px dashed #ff0000;
                    background-color: rgba(255, 0, 0, 0.2);
                    box-sizing: border-box;
                    pointer-events: none;
                    z-index: 30;
                }
                @keyframes blink-border {
                    0% { border-color: #ff0000; }
                    50% { border-color: #ffff00; }
                    100% { border-color: #ff0000; }
                }
                .mosaic-label {
                    position: absolute;
                    color: white;
                    background-color: rgba(0, 0, 0, 0.6);
                    padding: 2px 5px;
                    font-size: 12px;
                    border-radius: 3px;
                    pointer-events: none;
                }
            `;
            document.head.appendChild(style);
        }

        // 创建选择框
        function createSelectionBox(x, y) {
            console.log(`[创建] 选择框，位置: (${x}, ${y})`);

            // 移除已有选择框
            if (currentBox) {
                currentBox.remove();
            }

            currentBox = document.createElement('div');
            currentBox.className = 'mosaic-selection-box';
            currentBox.style.animation = 'blink-border 1s infinite';
            currentBox.style.left = `${x}px`;
            currentBox.style.top = `${y}px`;
            currentBox.style.width = '1px';
            currentBox.style.height = '1px';

            // 添加提示标签
            const label = document.createElement('div');
            label.className = 'mosaic-label';
            label.style.top = '-25px';
            label.style.left = '0';
            label.textContent = '松开鼠标应用马赛克';
            currentBox.appendChild(label);

            // 添加尺寸标签
            const sizeLabel = document.createElement('div');
            sizeLabel.className = 'mosaic-label size-label';
            sizeLabel.style.bottom = '-25px';
            sizeLabel.style.right = '0';
            sizeLabel.textContent = '1 × 1';
            currentBox.appendChild(sizeLabel);

            overlay.appendChild(currentBox);
            return currentBox;
        }

        // 更新选择框
        function updateSelectionBox(width, height) {
            if (!currentBox) return;

            // 确保最小尺寸
            width = Math.max(10, width);
            height = Math.max(10, height);

            currentBox.style.width = `${width}px`;
            currentBox.style.height = `${height}px`;

            // 更新尺寸标签
            const sizeLabel = currentBox.querySelector('.size-label');
            if (sizeLabel) {
                sizeLabel.textContent = `${width} × ${height}`;
            }
        }

        // 应用马赛克效果
        function applyMosaicEffect() {
            if (!currentBox || !mainCanvas || !mainCtx) {
                console.error('[错误] 无法应用马赛克，缺少必要元素');
                return;
            }

            console.log('[应用] 马赛克效果');

            // 获取选择框在画布上的位置
            const boxRect = currentBox.getBoundingClientRect();
            const canvasRect = mainCanvas.getBoundingClientRect();

            // 计算相对于Canvas的位置
            const scaleX = mainCanvas.width / canvasRect.width;
            const scaleY = mainCanvas.height / canvasRect.height;

            const x = Math.round((boxRect.left - canvasRect.left) * scaleX);
            const y = Math.round((boxRect.top - canvasRect.top) * scaleY);
            const width = Math.round(boxRect.width * scaleX);
            const height = Math.round(boxRect.height * scaleY);

            console.log(`[计算] 马赛克区域: 屏幕坐标(${boxRect.left},${boxRect.top}) 相对坐标(${x},${y}) 尺寸: ${width}x${height}`);

            // 获取马赛克块大小，修复语法错误
            const blockSize = (window.toolSettings && window.toolSettings.mosaic && window.toolSettings.mosaic.blockSize) || 15;

            // 边界检查
            const safeX = Math.max(0, Math.min(x, mainCanvas.width - 1));
            const safeY = Math.max(0, Math.min(y, mainCanvas.height - 1));
            const safeWidth = Math.min(mainCanvas.width - safeX, width);
            const safeHeight = Math.min(mainCanvas.height - safeY, height);

            if (safeWidth <= 0 || safeHeight <= 0) {
                console.log('[警告] 选择区域超出Canvas范围');
                return;
            }

            // 获取区域图像数据
            try {
                console.log(`[获取] 图像数据: (${safeX},${safeY}) 尺寸: ${safeWidth}x${safeHeight}`);
                const imageData = mainCtx.getImageData(safeX, safeY, safeWidth, safeHeight);

                // 应用马赛克效果
                applyMosaicToImageData(imageData.data, safeWidth, safeHeight, blockSize);

                // 绘制回Canvas
                mainCtx.putImageData(imageData, safeX, safeY);

                // 保存马赛克区域信息
                mosaicAreas.push({
                    x: safeX,
                    y: safeY,
                    width: safeWidth,
                    height: safeHeight,
                    blockSize: blockSize
                });

                console.log('[成功] 马赛克效果已应用');
            } catch (e) {
                console.error('[错误] 应用马赛克效果失败:', e);
            }

            // 移除选择框
            if (currentBox) {
                currentBox.remove();
                currentBox = null;
            }
        }

        // 鼠标事件处理
        function onMouseDown(e) {
            // 确保当前工具是马赛克工具
            if (activeToolName !== 'mosaic') {
                console.log(`[忽略] 鼠标按下事件，当前工具: ${activeToolName}`);
                return;
            }

            console.log('[事件] 鼠标按下');

            e.preventDefault();
            e.stopPropagation();

            // 获取鼠标位置
            const rect = overlay.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;

            // 创建选择框
            createSelectionBox(startX, startY);
            isSelecting = true;
        }

        function onMouseMove(e) {
            // 确保当前工具是马赛克工具且正在选择
            if (activeToolName !== 'mosaic' || !isSelecting || !currentBox) return;

            // 获取鼠标位置
            const rect = overlay.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // 计算宽度和高度
            let width = x - startX;
            let height = y - startY;

            // 处理负值情况（向左上方向拖动）
            let newX = startX;
            let newY = startY;

            if (width < 0) {
                width = Math.abs(width);
                newX = startX - width;
            }

            if (height < 0) {
                height = Math.abs(height);
                newY = startY - height;
            }

            // 更新选择框位置和大小
            currentBox.style.left = `${newX}px`;
            currentBox.style.top = `${newY}px`;
            updateSelectionBox(width, height);
        }

        function onMouseUp(e) {
            // 确保当前工具是马赛克工具
            if (activeToolName !== 'mosaic') return;

            // 如果不在选择状态，直接返回
            if (!isSelecting) return;

            console.log('[事件] 鼠标松开');

            // 获取选择框的宽度和高度
            if (currentBox) {
                const width = parseInt(currentBox.style.width);
                const height = parseInt(currentBox.style.height);

                // 如果选择框过小，直接移除
                if (width < 10 || height < 10) {
                    console.log('[取消] 选择框过小，已移除');
                    currentBox.remove();
                    currentBox = null;
                } else {
                    // 应用马赛克效果
                    applyMosaicEffect();
                }
            }

            isSelecting = false;
        }

        // 触摸事件处理
        function onTouchStart(e) {
            if (e.touches.length !== 1) return;

            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });

            onMouseDown(mouseEvent);
        }

        function onTouchMove(e) {
            if (e.touches.length !== 1) return;

            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });

            onMouseMove(mouseEvent);
        }

        function onTouchEnd(e) {
            const mouseEvent = new MouseEvent('mouseup');
            onMouseUp(mouseEvent);
        }

        // 添加事件监听器
        overlay.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove); // 使用document以捕获拖动超出元素范围的情况
        document.addEventListener('mouseup', onMouseUp); // 使用document以捕获松开鼠标超出元素范围的情况
        overlay.addEventListener('touchstart', onTouchStart);
        overlay.addEventListener('touchmove', onTouchMove);
        overlay.addEventListener('touchend', onTouchEnd);

        // Escape键取消选择
        const keyHandler = function(e) {
            if (activeToolName === 'mosaic' && e.key === 'Escape' && currentBox) {
                console.log('[取消] 按下Escape键取消选择');
                currentBox.remove();
                currentBox = null;
                isSelecting = false;
            }
        };
        document.addEventListener('keydown', keyHandler);

        // 存储清理函数
        overlay._mosaicCleanup = function() {
            console.log('[清理] 马赛克工具事件监听器');
            overlay.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            overlay.removeEventListener('touchstart', onTouchStart);
            overlay.removeEventListener('touchmove', onTouchMove);
            overlay.removeEventListener('touchend', onTouchEnd);
            document.removeEventListener('keydown', keyHandler);

            if (currentBox) {
                currentBox.remove();
                currentBox = null;
            }
        };

        console.log('[完成] 马赛克工具交互设置');
    }

    // 将马赛克效果应用到图像数据
    function applyMosaicToImageData(data, width, height, blockSize) {
        // 确保块大小合理
        blockSize = Math.max(2, blockSize);

        console.log(`[马赛克] 应用效果 - 块大小: ${blockSize}, 区域: ${width}x${height}`);

        // 按块处理图像
        for (let y = 0; y < height; y += blockSize) {
            for (let x = 0; x < width; x += blockSize) {
                // 确定块的实际大小（处理边缘）
                const blockW = Math.min(blockSize, width - x);
                const blockH = Math.min(blockSize, height - y);

                if (blockW <= 0 || blockH <= 0) continue;

                // 计算块的平均颜色
                let sumR = 0,
                    sumG = 0,
                    sumB = 0,
                    sumA = 0;
                let count = 0;

                for (let by = 0; by < blockH; by++) {
                    for (let bx = 0; bx < blockW; bx++) {
                        const px = x + bx;
                        const py = y + by;
                        const i = (py * width + px) * 4;

                        if (i >= 0 && i < data.length - 3) {
                            sumR += data[i];
                            sumG += data[i + 1];
                            sumB += data[i + 2];
                            sumA += data[i + 3];
                            count++;
                        }
                    }
                }

                // 计算平均值
                if (count > 0) {
                    const avgR = Math.round(sumR / count);
                    const avgG = Math.round(sumG / count);
                    const avgB = Math.round(sumB / count);
                    const avgA = Math.round(sumA / count);

                    // 应用平均颜色到整个块
                    for (let by = 0; by < blockH; by++) {
                        for (let bx = 0; bx < blockW; bx++) {
                            const px = x + bx;
                            const py = y + by;
                            const i = (py * width + px) * 4;

                            if (i >= 0 && i < data.length - 3) {
                                data[i] = avgR;
                                data[i + 1] = avgG;
                                data[i + 2] = avgB;
                                data[i + 3] = avgA;
                            }
                        }
                    }
                }
            }
        }
    }

    // 更新下载功能，确保使用Canvas内容
    function updateDownloadFunction() {
        if (typeof window.downloadImage === 'function') {
            const originalDownloadImage = window.downloadImage;

            window.downloadImage = function() {
                console.log('[下载] 使用Canvas版本的下载功能');

                if (mainCanvas) {
                    try {
                        // 直接从Canvas创建下载链接
                        const link = document.createElement('a');
                        link.download = 'edited-image.png';

                        // 优先使用toBlob方法（内存效率更高）
                        if (typeof mainCanvas.toBlob === 'function') {
                            mainCanvas.toBlob(function(blob) {
                                const url = URL.createObjectURL(blob);
                                link.href = url;
                                link.click();

                                // 清理URL对象
                                setTimeout(function() {
                                    URL.revokeObjectURL(url);
                                }, 100);
                            });
                        } else {
                            // 回退到toDataURL
                            link.href = mainCanvas.toDataURL('image/png');
                            link.click();
                        }

                        console.log('[成功] 图片下载完成');
                        return true;
                    } catch (e) {
                        console.error('[错误] Canvas下载失败:', e);
                    }
                }

                // 如果Canvas下载失败，尝试使用原始下载函数
                return originalDownloadImage.apply(this, arguments);
            };
        }
    }

    // 重置Canvas到原始图像
    function resetCanvas() {
        if (mainCanvas && mainCtx && originalImageData) {
            mainCtx.putImageData(originalImageData, 0, 0);
            mosaicAreas.length = 0; // 清空马赛克区域记录
            console.log('[重置] Canvas已重置为原始图像');
        }
    }

    // 设置文字编辑工具的交互
    function setupTextInteraction() {
        console.log('[设置] 文字编辑工具交互');

        // 获取交互覆盖层
        const overlay = document.getElementById('canvas-interaction-overlay');
        if (!overlay) {
            console.error('[错误] 找不到交互覆盖层');
            return;
        }

        // 先移除可能存在的事件监听
        if (typeof overlay._textCleanup === 'function') {
            overlay._textCleanup();
        }

        // 添加文字编辑样式
        if (!document.getElementById('text-editor-style')) {
            const style = document.createElement('style');
            style.id = 'text-editor-style';
            style.textContent = `
                .text-editor-container {
                    position: absolute;
                    min-width: 100px;
                    min-height: 40px;
                    padding: 8px;
                    background-color: rgba(255, 255, 255, 0.8);
                    border: 1px dashed #3498db;
                    border-radius: 4px;
                    z-index: 30;
                }
                
                .text-editor {
                    width: 100%;
                    min-height: 30px;
                    outline: none;
                    border: none;
                    background: transparent;
                    font-family: Arial, sans-serif;
                    font-size: 16px;
                    resize: both;
                    overflow: auto;
                }
                
                .text-controls {
                    position: absolute;
                    top: -40px;
                    left: 0;
                    display: flex;
                    gap: 5px;
                    background-color: rgba(0, 0, 0, 0.7);
                    border-radius: 4px;
                    padding: 5px;
                    z-index: 31;
                }
                
                .text-control-btn {
                    width: 24px;
                    height: 24px;
                    border-radius: 3px;
                    border: 1px solid #ccc;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .text-color-btn {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 1px solid white;
                    cursor: pointer;
                }
                
                .text-apply-btn {
                    background-color: #2ecc71;
                    color: white;
                    border: none;
                    padding: 3px 8px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 12px;
                }
                
                .text-cancel-btn {
                    background-color: #e74c3c;
                    color: white;
                    border: none;
                    padding: 3px 8px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 12px;
                }
                
                .text-selection-overlay {
                    position: absolute;
                    border: 2px dashed #3498db;
                    background-color: rgba(52, 152, 219, 0.1);
                    pointer-events: none;
                    z-index: 25;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(style);
        }

        let currentEditor = null;
        let textStyle = {
            color: '#000000',
            fontSize: 16,
            fontFamily: 'Arial, sans-serif'
        };

        // 存储所有添加的文本
        const textElements = [];

        // 当前选中的文本索引
        let selectedTextIndex = -1;

        // 当前选中文本的选择框
        let selectionOverlay = null;

        // 标记正在编辑状态
        let isEditing = false;

        // 标记是新文本还是编辑现有文本
        let isEditingExisting = false;

        // 创建文本编辑器
        function createTextEditor(x, y, existingText = null) {
            console.log(`[创建] 文本编辑器，位置: (${x}, ${y})`);

            // 如果已在编辑，先关闭之前的编辑器
            if (currentEditor) {
                removeCurrentEditor();
            }

            // 设置编辑标志
            isEditing = true;
            isEditingExisting = existingText !== null;

            // 创建编辑器容器
            const container = document.createElement('div');
            container.className = 'text-editor-container';
            container.style.left = `${x}px`;
            container.style.top = `${y}px`;

            // 创建可编辑区域
            const editor = document.createElement('div');
            editor.className = 'text-editor';
            editor.contentEditable = true;
            editor.placeholder = '输入文本...';

            // 如果是编辑现有文本，使用其样式和内容
            if (existingText) {
                textStyle.color = existingText.color;
                textStyle.fontSize = existingText.fontSize;
                textStyle.fontFamily = existingText.fontFamily;
                editor.innerHTML = existingText.text;
            }

            editor.style.color = textStyle.color;
            editor.style.fontSize = `${textStyle.fontSize}px`;
            editor.style.fontFamily = textStyle.fontFamily;
            container.appendChild(editor);

            // 创建控制面板
            const controls = document.createElement('div');
            controls.className = 'text-controls';

            // 阻止控制面板上的点击事件冒泡
            controls.addEventListener('click', function(e) {
                e.stopPropagation();
            });

            // 颜色选择按钮
            const colors = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00'];
            colors.forEach(color => {
                const colorBtn = document.createElement('div');
                colorBtn.className = 'text-color-btn';
                colorBtn.style.backgroundColor = color;
                colorBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // 阻止事件冒泡
                    textStyle.color = color;
                    editor.style.color = color;
                });
                controls.appendChild(colorBtn);
            });

            // 字体大小按钮
            const sizes = [{
                    name: 'S',
                    value: 12
                },
                {
                    name: 'M',
                    value: 16
                },
                {
                    name: 'L',
                    value: 24
                },
                {
                    name: 'XL',
                    value: 32
                }
            ];

            sizes.forEach(size => {
                const sizeBtn = document.createElement('button');
                sizeBtn.textContent = size.name;
                sizeBtn.className = 'text-control-btn';
                sizeBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // 阻止事件冒泡
                    textStyle.fontSize = size.value;
                    editor.style.fontSize = `${size.value}px`;
                });
                controls.appendChild(sizeBtn);
            });

            // 确认按钮
            const applyBtn = document.createElement('button');
            applyBtn.textContent = '确认';
            applyBtn.className = 'text-apply-btn';
            applyBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                applyText();
            });
            controls.appendChild(applyBtn);

            // 取消按钮
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = '取消';
            cancelBtn.className = 'text-cancel-btn';
            cancelBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                removeCurrentEditor();
            });
            controls.appendChild(cancelBtn);

            // 阻止在编辑器内的点击事件冒泡
            container.addEventListener('click', function(e) {
                e.stopPropagation();
            });

            // 添加到DOM
            overlay.appendChild(container);
            overlay.appendChild(controls);

            // 使编辑器可拖动
            makeDraggable(container, controls);

            // 设置聚焦
            setTimeout(() => editor.focus(), 10);

            // 更新控制面板位置
            updateControlsPosition(container, controls);

            currentEditor = {
                container: container,
                editor: editor,
                controls: controls,
                editingIndex: isEditingExisting ? selectedTextIndex : -1
            };

            return currentEditor;
        }

        // 移除当前编辑器
        function removeCurrentEditor() {
            if (!currentEditor) return;

            currentEditor.container.remove();
            currentEditor.controls.remove();
            currentEditor = null;
            isEditing = false;

            // 如果是编辑现有文本但取消了，恢复选择状态
            if (isEditingExisting && selectedTextIndex !== -1) {
                showSelectionOverlay(selectedTextIndex);
            }

            isEditingExisting = false;
        }

        // 创建选择覆盖层
        function showSelectionOverlay(index) {
            // 移除已有的选择覆盖层
            if (selectionOverlay) {
                selectionOverlay.remove();
                selectionOverlay = null;
            }

            if (index < 0 || index >= textElements.length) {
                selectedTextIndex = -1;
                return;
            }

            selectedTextIndex = index;
            const text = textElements[index];

            // 创建选择覆盖层
            selectionOverlay = document.createElement('div');
            selectionOverlay.className = 'text-selection-overlay';

            // 计算扩大后的尺寸（每个方向扩大8像素）
            const padding = 8;

            // 使用精确计算的屏幕位置和尺寸，并添加边距
            selectionOverlay.style.left = `${text.screenX - padding}px`;
            selectionOverlay.style.top = `${text.screenY - padding}px`;
            selectionOverlay.style.width = `${text.screenWidth + padding * 2}px`;
            selectionOverlay.style.height = `${text.screenHeight + padding * 2}px`;

            overlay.appendChild(selectionOverlay);

            console.log(`[选择] 显示文本选择框: 位置(${selectionOverlay.style.left}, ${selectionOverlay.style.top}), 尺寸${selectionOverlay.style.width}x${selectionOverlay.style.height}`);
        }

        // 隐藏选择覆盖层
        function hideSelectionOverlay() {
            if (selectionOverlay) {
                selectionOverlay.remove();
                selectionOverlay = null;
            }
            selectedTextIndex = -1;
        }

        // 更新控制面板位置
        function updateControlsPosition(container, controls) {
            controls.style.left = `${container.offsetLeft}px`;
            controls.style.top = `${container.offsetTop - 40}px`;
        }

        // 设置元素可拖动
        function makeDraggable(element, controlsElement) {
            let isDragging = false;
            let startX, startY;
            let startLeft, startTop;

            element.addEventListener('mousedown', onMouseDown);

            function onMouseDown(e) {
                // 如果点击的是编辑区域，不启动拖动
                if (e.target.classList.contains('text-editor')) return;

                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                startLeft = element.offsetLeft;
                startTop = element.offsetTop;

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);

                // 防止默认行为和冒泡
                e.preventDefault();
                e.stopPropagation();
            }

            function onMouseMove(e) {
                if (!isDragging) return;

                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                element.style.left = `${startLeft + dx}px`;
                element.style.top = `${startTop + dy}px`;

                // 更新控制面板位置
                updateControlsPosition(element, controlsElement);
            }

            function onMouseUp() {
                isDragging = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
        }

        // 应用文本到Canvas
        function applyText() {
            if (!currentEditor || !mainCanvas || !mainCtx) {
                console.error('[错误] 无法应用文本，缺少必要元素');
                return;
            }

            const editorContent = currentEditor.editor.innerText.trim();
            if (!editorContent) {
                removeCurrentEditor();
                return;
            }

            console.log(`[应用] 文本: "${editorContent}"`);

            try {
                // 获取文本编辑器的位置和尺寸
                const containerRect = currentEditor.container.getBoundingClientRect();
                const canvasRect = mainCanvas.getBoundingClientRect();

                // 计算相对于Canvas的位置
                const scaleX = mainCanvas.width / canvasRect.width;
                const scaleY = mainCanvas.height / canvasRect.height;

                const x = Math.round((containerRect.left - canvasRect.left + 8) * scaleX); // 加上padding
                const y = Math.round((containerRect.top - canvasRect.top + 8 + textStyle.fontSize) * scaleY); // 加上padding和字体大小

                // 设置绘制样式
                mainCtx.fillStyle = textStyle.color;
                mainCtx.font = `${textStyle.fontSize * scaleY}px ${textStyle.fontFamily}`;

                // 如果是编辑现有文本，先擦除原来的区域
                if (isEditingExisting && currentEditor.editingIndex !== -1) {
                    const oldText = textElements[currentEditor.editingIndex];
                    if (oldText) {
                        // 使用原始图像数据恢复该区域
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = oldText.width;
                        tempCanvas.height = oldText.height;
                        const tempCtx = tempCanvas.getContext('2d');

                        // 从原始图像数据复制该区域
                        try {
                            // 尝试从原始图像数据中恢复区域
                            if (originalImageData) {
                                // 计算在原始图像中的位置
                                const sourceX = Math.max(0, Math.min(oldText.x, mainCanvas.width));
                                const sourceY = Math.max(0, Math.min(oldText.y - oldText.fontSize, mainCanvas.height));
                                const sourceWidth = Math.min(oldText.width, mainCanvas.width - sourceX);
                                const sourceHeight = Math.min(oldText.height, mainCanvas.height - sourceY);

                                // 创建临时ImageData并复制原始区域
                                const tempData = new ImageData(sourceWidth, sourceHeight);

                                // 逐像素复制
                                for (let sy = 0; sy < sourceHeight; sy++) {
                                    for (let sx = 0; sx < sourceWidth; sx++) {
                                        const sourceIndex = ((sourceY + sy) * mainCanvas.width + (sourceX + sx)) * 4;
                                        const destIndex = (sy * sourceWidth + sx) * 4;

                                        if (sourceIndex >= 0 && sourceIndex < originalImageData.data.length - 3 &&
                                            destIndex >= 0 && destIndex < tempData.data.length - 3) {
                                            tempData.data[destIndex] = originalImageData.data[sourceIndex];
                                            tempData.data[destIndex + 1] = originalImageData.data[sourceIndex + 1];
                                            tempData.data[destIndex + 2] = originalImageData.data[sourceIndex + 2];
                                            tempData.data[destIndex + 3] = originalImageData.data[sourceIndex + 3];
                                        }
                                    }
                                }

                                // 绘制恢复的区域
                                tempCtx.putImageData(tempData, 0, 0);
                                mainCtx.drawImage(tempCanvas, sourceX, sourceY);
                            } else {
                                // 如果没有原始图像数据，使用纯色填充
                                mainCtx.clearRect(oldText.x, oldText.y - oldText.fontSize, oldText.width, oldText.height);
                            }
                        } catch (e) {
                            console.error('[错误] 恢复原始区域失败:', e);
                            // 使用纯色填充
                            mainCtx.clearRect(oldText.x, oldText.y - oldText.fontSize, oldText.width, oldText.height);
                        }

                        // 从数组中移除旧文本
                        textElements.splice(currentEditor.editingIndex, 1);
                    }
                }

                // 计算文本的宽度
                const lines = editorContent.split('\n');
                const lineHeight = textStyle.fontSize * 1.2 * scaleY; // 行高为字体大小的1.2倍

                // 计算文本尺寸
                let maxTextWidth = 0;
                for (let i = 0; i < lines.length; i++) {
                    const textWidth = mainCtx.measureText(lines[i]).width;
                    maxTextWidth = Math.max(maxTextWidth, textWidth);
                }

                // 绘制文本
                for (let i = 0; i < lines.length; i++) {
                    mainCtx.fillText(lines[i], x, y + i * lineHeight);
                }

                // 获取Canvas上的实际坐标和尺寸
                const canvasX = x;
                const canvasY = y - textStyle.fontSize * scaleY; // 文本基线位置调整
                const canvasWidth = maxTextWidth;
                const canvasHeight = lineHeight * lines.length;

                // 将Canvas坐标转换为屏幕坐标
                const screenX = canvasRect.left + (canvasX / scaleX);
                const screenY = canvasRect.top + (canvasY / scaleY);
                const screenWidth = canvasWidth / scaleX;
                const screenHeight = canvasHeight / scaleY;

                // 计算相对于overlay的坐标
                const overlayRect = overlay.getBoundingClientRect();
                const relativeX = screenX - overlayRect.left;
                const relativeY = screenY - overlayRect.top;

                console.log(`[位置] Canvas坐标: (${canvasX}, ${canvasY}), 尺寸: ${canvasWidth}x${canvasHeight}`);
                console.log(`[位置] 屏幕坐标: (${screenX}, ${screenY}), 尺寸: ${screenWidth}x${screenHeight}`);
                console.log(`[位置] 相对坐标: (${relativeX}, ${relativeY})`);

                // 存储文本信息用于后续编辑
                const textInfo = {
                    text: editorContent,
                    x: canvasX,
                    y: canvasY + textStyle.fontSize * scaleY, // 存储基线位置
                    fontSize: textStyle.fontSize * scaleY,
                    fontFamily: textStyle.fontFamily,
                    color: textStyle.color,
                    width: canvasWidth,
                    height: canvasHeight,
                    screenX: relativeX,
                    screenY: relativeY,
                    screenWidth: screenWidth,
                    screenHeight: screenHeight
                };

                // 添加到文本数组
                textElements.push(textInfo);
                const newIndex = textElements.length - 1;

                console.log('[成功] 文本已应用到Canvas');

                // 移除编辑器并显示选择框
                removeCurrentEditor();
                showSelectionOverlay(newIndex);
            } catch (e) {
                console.error('[错误] 应用文本失败:', e);
            }
        }

        // 删除选中的文本
        function deleteSelectedText() {
            if (selectedTextIndex === -1 || selectedTextIndex >= textElements.length) return;

            const text = textElements[selectedTextIndex];
            console.log(`[删除] 文本: "${text.text}"`);

            try {
                // 恢复原始图像区域
                if (originalImageData) {
                    const sourceX = Math.max(0, Math.min(text.x, mainCanvas.width));
                    const sourceY = Math.max(0, Math.min(text.y - text.fontSize, mainCanvas.height));
                    const sourceWidth = Math.min(text.width, mainCanvas.width - sourceX);
                    const sourceHeight = Math.min(text.height, mainCanvas.height - sourceY);

                    // 创建临时canvas进行区域恢复
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = sourceWidth;
                    tempCanvas.height = sourceHeight;
                    const tempCtx = tempCanvas.getContext('2d');

                    // 从原始图像数据复制区域
                    const tempData = new ImageData(sourceWidth, sourceHeight);

                    // 逐像素复制
                    for (let sy = 0; sy < sourceHeight; sy++) {
                        for (let sx = 0; sx < sourceWidth; sx++) {
                            const sourceIndex = ((sourceY + sy) * mainCanvas.width + (sourceX + sx)) * 4;
                            const destIndex = (sy * sourceWidth + sx) * 4;

                            if (sourceIndex >= 0 && sourceIndex < originalImageData.data.length - 3 &&
                                destIndex >= 0 && destIndex < tempData.data.length - 3) {
                                tempData.data[destIndex] = originalImageData.data[sourceIndex];
                                tempData.data[destIndex + 1] = originalImageData.data[sourceIndex + 1];
                                tempData.data[destIndex + 2] = originalImageData.data[sourceIndex + 2];
                                tempData.data[destIndex + 3] = originalImageData.data[sourceIndex + 3];
                            }
                        }
                    }

                    // 绘制恢复的区域
                    tempCtx.putImageData(tempData, 0, 0);
                    mainCtx.drawImage(tempCanvas, sourceX, sourceY);
                } else {
                    // 如果没有原始图像数据，使用纯色填充
                    mainCtx.clearRect(text.x, text.y - text.fontSize, text.width, text.height);
                }

                // 从数组中删除文本
                textElements.splice(selectedTextIndex, 1);

                // 清除选择状态
                hideSelectionOverlay();

                console.log('[成功] 文本已删除');
            } catch (e) {
                console.error('[错误] 删除文本失败:', e);
            }
        }

        // 检查点击是否在现有文本上
        function findTextAtPosition(x, y) {
            // 将屏幕坐标转换为相对于overlay的坐标
            const rect = overlay.getBoundingClientRect();
            const localX = x - rect.left;
            const localY = y - rect.top;

            console.log(`[检测] 检查点击位置 (${localX}, ${localY}) 是否在文本上`);

            // 添加点击检测的边距，与选择框显示一致
            const clickPadding = 8;

            // 检查每个文本区域
            for (let i = textElements.length - 1; i >= 0; i--) {
                const text = textElements[i];

                // 使用精确计算的屏幕位置和尺寸，并添加相同的边距
                const textX = text.screenX - clickPadding;
                const textY = text.screenY - clickPadding;
                const textWidth = text.screenWidth + clickPadding * 2;
                const textHeight = text.screenHeight + clickPadding * 2;

                console.log(`[检测] 文本 ${i}: 扩展检测区域(${textX}, ${textY}), 尺寸${textWidth}x${textHeight}`);

                // 检查点击是否在文本区域内（包括边距）
                if (localX >= textX && localX <= textX + textWidth &&
                    localY >= textY && localY <= textY + textHeight) {
                    console.log(`[检测] 命中文本 ${i}: "${text.text}"`);
                    return i;
                }
            }

            console.log(`[检测] 未找到文本`);
            return -1;
        }

        // 点击事件处理
        function onCanvasClick(e) {
            // 确保当前工具是文本工具
            if (activeToolName !== 'text') {
                console.log(`[忽略] 点击事件，当前工具: ${activeToolName}`);
                return;
            }

            // 如果正在编辑，点击空白处应该应用当前文本
            if (isEditing && currentEditor) {
                applyText();
                return;
            }

            console.log('[事件] 文本工具点击');

            // 检查是否点击了现有文本
            const textIndex = findTextAtPosition(e.clientX, e.clientY);
            if (textIndex !== -1) {
                console.log(`[选择] 文本索引 ${textIndex}: "${textElements[textIndex].text}"`);
                showSelectionOverlay(textIndex);
                return;
            }

            // 如果有选中的文本，取消选择
            hideSelectionOverlay();

            // 获取点击位置并创建新的文本编辑器
            const rect = overlay.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            createTextEditor(x, y);
        }

        // 双击事件处理
        function onCanvasDblClick(e) {
            // 确保当前工具是文本工具
            if (activeToolName !== 'text') return;

            // 检查是否双击了现有文本
            const textIndex = findTextAtPosition(e.clientX, e.clientY);
            if (textIndex !== -1) {
                console.log(`[编辑] 文本索引 ${textIndex}: "${textElements[textIndex].text}"`);

                const text = textElements[textIndex];

                // 创建编辑器并加载现有文本
                createTextEditor(text.screenX, text.screenY, text);

                // 阻止事件冒泡
                e.stopPropagation();
            }
        }

        // 添加事件监听器
        overlay.addEventListener('click', onCanvasClick);
        overlay.addEventListener('dblclick', onCanvasDblClick);

        // 按Esc键取消编辑或删除选中文本
        function onKeyDown(e) {
            // 如果当前不是文本工具，忽略
            if (activeToolName !== 'text') return;

            // ESC键处理
            if (e.key === 'Escape') {
                // 如果正在编辑，取消编辑
                if (currentEditor) {
                    console.log('[取消] 按下Escape键取消文本编辑');
                    removeCurrentEditor();
                    return;
                }

                // 如果有选中的文本，删除它
                if (selectedTextIndex !== -1) {
                    console.log('[删除] 按下Escape键删除选中文本');
                    deleteSelectedText();
                    return;
                }
            }

            // Enter+Ctrl键应用文本
            if (e.key === 'Enter' && e.ctrlKey && currentEditor) {
                console.log('[应用] 按下Ctrl+Enter应用文本');
                applyText();
            }
        }
        document.addEventListener('keydown', onKeyDown);

        // 存储清理函数
        overlay._textCleanup = function() {
            console.log('[清理] 文本工具事件监听器');
            overlay.removeEventListener('click', onCanvasClick);
            overlay.removeEventListener('dblclick', onCanvasDblClick);
            document.removeEventListener('keydown', onKeyDown);

            if (currentEditor) {
                removeCurrentEditor();
            }

            hideSelectionOverlay();
        };

        console.log('[完成] 文本工具交互设置');
    }

    // 绑定文字工具按钮
    document.addEventListener('DOMContentLoaded', function() {
        const textBtn = document.getElementById('text-tool');
        if (textBtn) {
            // 移除可能的旧事件监听器
            const newTextBtn = textBtn.cloneNode(true);
            if (textBtn.parentNode) {
                textBtn.parentNode.replaceChild(newTextBtn, textBtn);
            }

            // 添加新的事件监听器
            newTextBtn.addEventListener('click', function() {
                console.log('[点击] 文本工具按钮');
                if (typeof window.activateTextTool === 'function') {
                    window.activateTextTool();
                }
            });
            console.log('[绑定] 已绑定文本工具按钮');
        }
    });

    // 设置矩形工具的交互
    function setupRectangleInteraction() {
        console.log('[设置] 矩形工具交互');

        // 获取交互覆盖层
        const overlay = document.getElementById('canvas-interaction-overlay');
        if (!overlay) {
            console.error('[错误] 找不到交互覆盖层');
            return;
        }

        // 先移除可能存在的事件监听
        if (typeof overlay._rectangleCleanup === 'function') {
            overlay._rectangleCleanup();
        }

        // 存储创建的矩形
        const rectangles = [];

        // 当前选中的矩形索引
        let selectedRectangleIndex = -1;

        // 当前选中的矩形的选择框
        let selectionOverlay = null;

        // 矩形样式配置 - 使用全局变量以便能在设置面板中修改
        if (!window.rectangleSettings) {
            window.rectangleSettings = {
                strokeColor: '#ff0000',
                strokeWidth: 2,
                fillColor: 'rgba(255, 0, 0, 0.1)'
            };
        }

        // 添加矩形样式
        if (!document.getElementById('rectangle-style')) {
            const style = document.createElement('style');
            style.id = 'rectangle-style';
            style.textContent = `
                .rectangle-drawing-box {
                    position: absolute;
                    border: 2px solid #ff0000;
                    background-color: rgba(255, 0, 0, 0.1);
                    box-sizing: border-box;
                    pointer-events: none;
                    z-index: 30;
                }
                
                .rectangle-selection-box {
                    position: absolute;
                    border: 2px dashed #3498db;
                    background-color: rgba(52, 152, 219, 0.1);
                    box-sizing: border-box;
                    pointer-events: none;
                    z-index: 25;
                    cursor: pointer;
                }
                
                .rectangle-settings-panel {
                    position: absolute;
                    left: 0;
                    right: 0;
                    background-color: #f8f9fa;
                    border-bottom: 1px solid #ddd;
                    padding: 8px 15px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    z-index: 100;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-wrap: nowrap;
                    gap: 20px;
                }
                
                .rectangle-settings-panel h3 {
                    margin: 0;
                    font-size: 14px;
                    color: #333;
                    margin-right: 10px;
                    white-space: nowrap;
                }
                
                .setting-group {
                    display: flex;
                    align-items: center;
                    margin: 0;
                    flex-shrink: 0;
                }
                
                .setting-group label {
                    margin: 0 8px 0 0;
                    font-size: 12px;
                    color: #555;
                    white-space: nowrap;
                }
                
                .color-options {
                    display: flex;
                    gap: 5px;
                }
                
                .color-option {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: transform 0.2s;
                }
                
                .color-option.active {
                    border-color: #333;
                    transform: scale(1.1);
                }
                
                .width-options {
                    display: flex;
                    gap: 5px;
                }
                
                .width-option {
                    height: 20px;
                    min-width: 24px;
                    background: #fff;
                    border: 1px solid #ddd;
                    text-align: center;
                    line-height: 20px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 12px;
                }
                
                .width-option.active {
                    background: #007bff;
                    color: white;
                    border-color: #0056b3;
                }
                
                .opacity-slider {
                    width: 100px;
                    margin: 0;
                    vertical-align: middle;
                }
                
                /* 关闭按钮 */
                .settings-close-btn {
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: #666;
                }
                
                .settings-close-btn:hover {
                    color: #333;
                }
            `;
            document.head.appendChild(style);
        }

        // 绘制状态
        let isDrawing = false;
        let startX = 0;
        let startY = 0;
        let currentRect = null;

        // 创建矩形绘制框
        function createDrawingBox(x, y) {
            console.log(`[创建] 矩形绘制框，位置: (${x}, ${y})`);

            // 移除已有绘制框
            if (currentRect) {
                currentRect.remove();
            }

            // 获取当前边框宽度
            const borderWidth = window.rectangleSettings.strokeWidth;

            currentRect = document.createElement('div');
            currentRect.className = 'rectangle-drawing-box';

            // 精确定位，确保边框不影响位置计算
            currentRect.style.left = `${x}px`;
            currentRect.style.top = `${y}px`;
            currentRect.style.width = '1px';
            currentRect.style.height = '1px';
            currentRect.style.border = `${borderWidth}px solid ${window.rectangleSettings.strokeColor}`;
            currentRect.style.backgroundColor = window.rectangleSettings.fillColor;
            // 确保边框宽度不影响盒子大小计算
            currentRect.style.boxSizing = 'border-box';

            // 记录原始位置，用于后续计算
            currentRect.dataset.originX = x;
            currentRect.dataset.originY = y;

            overlay.appendChild(currentRect);
            return currentRect;
        }

        // 更新矩形绘制框
        function updateDrawingBox(width, height) {
            if (!currentRect) return;

            // 获取绝对宽高
            const absWidth = Math.abs(width);
            const absHeight = Math.abs(height);

            // 获取原始起始位置
            const startX = parseFloat(currentRect.dataset.originX || startX);
            const startY = parseFloat(currentRect.dataset.originY || startY);

            // 设置新的宽高
            currentRect.style.width = `${absWidth}px`;
            currentRect.style.height = `${absHeight}px`;

            // 处理负值情况（向左上方向拖动）
            if (width < 0) {
                currentRect.style.left = `${startX + width}px`;
            }

            if (height < 0) {
                currentRect.style.top = `${startY + height}px`;
            }

            // 记录当前位置和尺寸，便于调试
            console.log(`[更新] 绘制框: 位置(${currentRect.style.left}, ${currentRect.style.top}), 尺寸: ${currentRect.style.width}x${currentRect.style.height}`);
        }

        // 完成矩形绘制
        function completeRectangle() {
            if (!currentRect || !mainCanvas || !mainCtx) {
                console.error('[错误] 无法完成矩形绘制，缺少必要元素');
                return;
            }

            console.log('[完成] 矩形绘制');

            // 获取矩形在画布上的位置和尺寸
            const boxRect = currentRect.getBoundingClientRect();
            const canvasRect = mainCanvas.getBoundingClientRect();

            // 计算相对于Canvas的位置和尺寸
            const scaleX = mainCanvas.width / canvasRect.width;
            const scaleY = mainCanvas.height / canvasRect.height;

            const x = Math.round((boxRect.left - canvasRect.left) * scaleX);
            const y = Math.round((boxRect.top - canvasRect.top) * scaleY);
            const width = Math.round(boxRect.width * scaleX);
            const height = Math.round(boxRect.height * scaleY);

            // 绘制矩形到Canvas
            mainCtx.lineWidth = window.rectangleSettings.strokeWidth;
            mainCtx.strokeStyle = window.rectangleSettings.strokeColor;
            mainCtx.fillStyle = window.rectangleSettings.fillColor;

            // 填充矩形
            mainCtx.fillRect(x, y, width, height);

            // 描边矩形
            mainCtx.strokeRect(x, y, width, height);

            // 获取准确的屏幕坐标（直接从DOM元素获取）
            // 这些是用户实际看到的矩形位置
            const screenX = parseFloat(currentRect.style.left);
            const screenY = parseFloat(currentRect.style.top);
            const screenWidth = parseFloat(currentRect.style.width);
            const screenHeight = parseFloat(currentRect.style.height);

            // 获取边框宽度
            const borderWidth = window.rectangleSettings.strokeWidth;

            console.log(`[位置] 矩形区域: 屏幕坐标(${screenX}, ${screenY}) 尺寸: ${screenWidth}x${screenHeight}, 边框宽度: ${borderWidth}`);

            // 存储矩形信息
            const newRect = {
                x: x,
                y: y,
                width: width,
                height: height,
                strokeColor: window.rectangleSettings.strokeColor,
                strokeWidth: borderWidth,
                fillColor: window.rectangleSettings.fillColor,
                // 屏幕坐标，用于点击检测和选择框显示
                screenX: screenX,
                screenY: screenY,
                screenWidth: screenWidth,
                screenHeight: screenHeight,
                // 原始DOM元素的样式信息
                borderWidth: borderWidth
            };

            rectangles.push(newRect);
            const newIndex = rectangles.length - 1;

            console.log(`[存储] 矩形数据: ${JSON.stringify(newRect)}`);

            // 移除绘制框
            currentRect.remove();
            currentRect = null;

            // 显示选择框
            showSelectionOverlay(newIndex);
        }

        // 创建选择覆盖层
        function showSelectionOverlay(index) {
            // 移除已有的选择覆盖层
            if (selectionOverlay) {
                selectionOverlay.remove();
                selectionOverlay = null;
            }

            if (index < 0 || index >= rectangles.length) {
                selectedRectangleIndex = -1;
                return;
            }

            selectedRectangleIndex = index;
            const rect = rectangles[index];

            // 创建选择覆盖层
            selectionOverlay = document.createElement('div');
            selectionOverlay.className = 'rectangle-selection-box';

            // 计算选择框边距
            const padding = 8;

            // 打印当前矩形信息以便调试
            console.log(`[选择框] 矩形信息: 位置(${rect.screenX}, ${rect.screenY}), 尺寸: ${rect.screenWidth}x${rect.screenHeight}, 边框: ${rect.borderWidth}px`);

            // 精确定位选择框 - 确保完全覆盖原矩形
            // 使用精确的屏幕坐标，加上边距
            selectionOverlay.style.left = `${rect.screenX - padding}px`;
            selectionOverlay.style.top = `${rect.screenY - padding}px`;
            selectionOverlay.style.width = `${rect.screenWidth + padding * 2}px`;
            selectionOverlay.style.height = `${rect.screenHeight + padding * 2}px`;

            // 确保边框不会改变尺寸计算
            selectionOverlay.style.boxSizing = 'border-box';
            selectionOverlay.style.borderWidth = '2px';

            // 添加到DOM
            overlay.appendChild(selectionOverlay);

            // 验证位置
            const overlayRect = selectionOverlay.getBoundingClientRect();
            console.log(`[选择框] 实际位置: 左(${selectionOverlay.style.left}), 上(${selectionOverlay.style.top}), 宽: ${selectionOverlay.style.width}, 高: ${selectionOverlay.style.height}`);
        }

        // 隐藏选择覆盖层
        function hideSelectionOverlay() {
            if (selectionOverlay) {
                selectionOverlay.remove();
                selectionOverlay = null;
            }
            selectedRectangleIndex = -1;
        }

        // 删除选中的矩形
        function deleteSelectedRectangle() {
            if (selectedRectangleIndex === -1 || selectedRectangleIndex >= rectangles.length) return;

            const rect = rectangles[selectedRectangleIndex];
            console.log(`[删除] 矩形: 索引 ${selectedRectangleIndex}`);

            try {
                // 恢复原始图像区域
                if (originalImageData) {
                    // 计算在原始图像中的位置，确保包含边框
                    const strokeWidth = rect.strokeWidth || 2;
                    const safeMargin = Math.ceil(strokeWidth / 2); // 为了确保边框也被完全覆盖

                    // 使用略大的区域以确保完全覆盖包括边框
                    const sourceX = Math.max(0, Math.min(rect.x - safeMargin, mainCanvas.width));
                    const sourceY = Math.max(0, Math.min(rect.y - safeMargin, mainCanvas.height));
                    const sourceWidth = Math.min(rect.width + safeMargin * 2, mainCanvas.width - sourceX);
                    const sourceHeight = Math.min(rect.height + safeMargin * 2, mainCanvas.height - sourceY);

                    console.log(`[恢复] 原始区域: (${sourceX}, ${sourceY}) 尺寸: ${sourceWidth}x${sourceHeight}`);

                    try {
                        // 直接从原始图像数据绘制该区域
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = sourceWidth;
                        tempCanvas.height = sourceHeight;
                        const tempCtx = tempCanvas.getContext('2d');

                        // 从原始图像数据复制
                        const tempData = new ImageData(sourceWidth, sourceHeight);

                        // 逐像素复制
                        for (let sy = 0; sy < sourceHeight; sy++) {
                            for (let sx = 0; sx < sourceWidth; sx++) {
                                // 注意这里要处理边界情况
                                const sourcePixelX = sourceX + sx;
                                const sourcePixelY = sourceY + sy;

                                if (sourcePixelX >= 0 && sourcePixelX < mainCanvas.width &&
                                    sourcePixelY >= 0 && sourcePixelY < mainCanvas.height) {

                                    const sourceIndex = (sourcePixelY * mainCanvas.width + sourcePixelX) * 4;
                                    const destIndex = (sy * sourceWidth + sx) * 4;

                                    if (sourceIndex >= 0 && sourceIndex < originalImageData.data.length - 3 &&
                                        destIndex >= 0 && destIndex < tempData.data.length - 3) {
                                        tempData.data[destIndex] = originalImageData.data[sourceIndex];
                                        tempData.data[destIndex + 1] = originalImageData.data[sourceIndex + 1];
                                        tempData.data[destIndex + 2] = originalImageData.data[sourceIndex + 2];
                                        tempData.data[destIndex + 3] = originalImageData.data[sourceIndex + 3];
                                    }
                                }
                            }
                        }

                        // 将临时数据绘制到画布上
                        tempCtx.putImageData(tempData, 0, 0);
                        mainCtx.drawImage(tempCanvas, sourceX, sourceY);

                        console.log('[成功] 已恢复原始图像区域');
                    } catch (e) {
                        console.error('[错误] 恢复原始区域失败:', e);
                        // 备用方法：清除区域
                        mainCtx.clearRect(sourceX, sourceY, sourceWidth, sourceHeight);
                    }

                    // 完全删除当前矩形后，重新绘制所有其他矩形
                    console.log('[重绘] 其他矩形');
                    rectangles.forEach((r, idx) => {
                        if (idx !== selectedRectangleIndex) {
                            mainCtx.lineWidth = r.strokeWidth;
                            mainCtx.strokeStyle = r.strokeColor;
                            mainCtx.fillStyle = r.fillColor;
                            mainCtx.fillRect(r.x, r.y, r.width, r.height);
                            mainCtx.strokeRect(r.x, r.y, r.width, r.height);
                        }
                    });

                } else {
                    // 如果没有原始图像数据，使用纯色填充一个略大的区域确保覆盖边框
                    const strokeWidth = rect.strokeWidth || 2;
                    const safeMargin = Math.ceil(strokeWidth);

                    mainCtx.clearRect(
                        rect.x - safeMargin,
                        rect.y - safeMargin,
                        rect.width + safeMargin * 2,
                        rect.height + safeMargin * 2
                    );

                    // 重新绘制其他矩形
                    rectangles.forEach((r, idx) => {
                        if (idx !== selectedRectangleIndex) {
                            mainCtx.lineWidth = r.strokeWidth;
                            mainCtx.strokeStyle = r.strokeColor;
                            mainCtx.fillStyle = r.fillColor;
                            mainCtx.fillRect(r.x, r.y, r.width, r.height);
                            mainCtx.strokeRect(r.x, r.y, r.width, r.height);
                        }
                    });
                }

                // 从数组中删除矩形
                rectangles.splice(selectedRectangleIndex, 1);

                // 清除选择状态
                hideSelectionOverlay();

                console.log('[成功] 矩形已完全删除');
            } catch (e) {
                console.error('[错误] 删除矩形失败:', e);
            }
        }

        // 检查点击是否在现有矩形上
        function findRectangleAtPosition(x, y) {
            // 将屏幕坐标转换为相对于overlay的坐标
            const rect = overlay.getBoundingClientRect();
            const localX = x - rect.left;
            const localY = y - rect.top;

            console.log(`[检测] 检查点击位置 (${localX}, ${localY}) 是否在矩形上`);

            // 检查每个矩形区域
            for (let i = rectangles.length - 1; i >= 0; i--) {
                const rectInfo = rectangles[i];

                // 计算扩大后的检测区域（每个方向扩大8像素）
                const detectPadding = 8;
                const detectX = rectInfo.screenX - detectPadding;
                const detectY = rectInfo.screenY - detectPadding;
                const detectWidth = rectInfo.screenWidth + detectPadding * 2;
                const detectHeight = rectInfo.screenHeight + detectPadding * 2;

                // 检查点击是否在矩形区域内
                if (localX >= detectX && localX <= detectX + detectWidth &&
                    localY >= detectY && localY <= detectY + detectHeight) {
                    console.log(`[检测] 命中矩形 ${i}`);
                    return i;
                }
            }

            console.log(`[检测] 未找到矩形`);
            return -1;
        }

        // 鼠标事件处理
        function onMouseDown(e) {
            // 确保当前工具是矩形工具
            if (activeToolName !== 'rectangle') {
                console.log(`[忽略] 鼠标按下事件，当前工具: ${activeToolName}`);
                return;
            }

            console.log('[事件] 鼠标按下');

            e.preventDefault();
            e.stopPropagation();

            // 检查是否点击了现有矩形
            const rectangleIndex = findRectangleAtPosition(e.clientX, e.clientY);
            if (rectangleIndex !== -1) {
                console.log(`[选择] 矩形索引 ${rectangleIndex}`);
                showSelectionOverlay(rectangleIndex);
                return;
            }

            // 如果有选中的矩形，取消选择
            hideSelectionOverlay();

            // 获取鼠标位置
            const rect = overlay.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;

            // 创建绘制框
            createDrawingBox(startX, startY);
            isDrawing = true;
        }

        function onMouseMove(e) {
            // 确保当前工具是矩形工具且正在绘制
            if (activeToolName !== 'rectangle' || !isDrawing || !currentRect) return;

            // 获取鼠标位置
            const rect = overlay.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // 计算宽度和高度
            const width = x - startX;
            const height = y - startY;

            // 更新绘制框
            updateDrawingBox(width, height);
        }

        function onMouseUp(e) {
            // 确保当前工具是矩形工具
            if (activeToolName !== 'rectangle') return;

            // 如果不在绘制状态，直接返回
            if (!isDrawing) return;

            console.log('[事件] 鼠标松开');

            // 获取绘制框的宽度和高度
            if (currentRect) {
                const width = parseFloat(currentRect.style.width);
                const height = parseFloat(currentRect.style.height);

                // 如果绘制框过小，直接移除
                if (width < 5 || height < 5) {
                    console.log('[取消] 绘制框过小，已移除');
                    currentRect.remove();
                    currentRect = null;
                } else {
                    // 完成矩形绘制
                    completeRectangle();
                }
            }

            isDrawing = false;
        }

        // 触摸事件处理
        function onTouchStart(e) {
            if (e.touches.length !== 1) return;

            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });

            onMouseDown(mouseEvent);
        }

        function onTouchMove(e) {
            if (e.touches.length !== 1) return;

            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });

            onMouseMove(mouseEvent);
        }

        function onTouchEnd(e) {
            const mouseEvent = new MouseEvent('mouseup');
            onMouseUp(mouseEvent);
        }

        // 添加事件监听器
        overlay.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove); // 使用document以捕获拖动超出元素范围的情况
        document.addEventListener('mouseup', onMouseUp); // 使用document以捕获松开鼠标超出元素范围的情况
        overlay.addEventListener('touchstart', onTouchStart);
        overlay.addEventListener('touchmove', onTouchMove);
        overlay.addEventListener('touchend', onTouchEnd);

        // Escape键或Delete键删除选中矩形
        const keyHandler = function(e) {
            if (activeToolName !== 'rectangle') return;

            // 处理ESC键
            if (e.key === 'Escape') {
                // 如果正在绘制，取消绘制
                if (isDrawing && currentRect) {
                    console.log('[取消] 按下Escape键取消绘制');
                    currentRect.remove();
                    currentRect = null;
                    isDrawing = false;
                    return;
                }

                // 如果有选中的矩形，删除它
                if (selectedRectangleIndex !== -1) {
                    console.log('[删除] 按下Escape键删除选中矩形');
                    deleteSelectedRectangle();
                    return;
                }
            }

            // 处理Delete键
            if (e.key === 'Delete' && selectedRectangleIndex !== -1) {
                console.log('[删除] 按下Delete键删除选中矩形');
                deleteSelectedRectangle();
                return;
            }
        };
        document.addEventListener('keydown', keyHandler);

        // 存储清理函数
        overlay._rectangleCleanup = function() {
            console.log('[清理] 矩形工具事件监听器');
            overlay.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            overlay.removeEventListener('touchstart', onTouchStart);
            overlay.removeEventListener('touchmove', onTouchMove);
            overlay.removeEventListener('touchend', onTouchEnd);
            document.removeEventListener('keydown', keyHandler);

            if (currentRect) {
                currentRect.remove();
                currentRect = null;
            }

            hideSelectionOverlay();

            // 移除设置面板
            removeRectangleSettings();
        };

        console.log('[完成] 矩形工具交互设置');
    }

    // 绑定矩形工具按钮
    document.addEventListener('DOMContentLoaded', function() {
        // 绑定矩形工具按钮
        const rectangleBtn = document.getElementById('rectangle-tool');
        if (rectangleBtn) {
            // 移除可能的旧事件监听器
            const newRectangleBtn = rectangleBtn.cloneNode(true);
            if (rectangleBtn.parentNode) {
                rectangleBtn.parentNode.replaceChild(newRectangleBtn, rectangleBtn);
            }

            // 添加新的事件监听器
            newRectangleBtn.addEventListener('click', function() {
                console.log('[点击] 矩形工具按钮');
                if (typeof window.activateRectangleTool === 'function') {
                    window.activateRectangleTool();
                }
            });
            console.log('[绑定] 已绑定矩形工具按钮');
        }

        // ... existing code for other tool buttons ...
    });

    // 扩展导出功能
    window.canvasEditor = {
        getCanvas: function() {
            return mainCanvas;
        },
        getContext: function() {
            return mainCtx;
        },
        isInitialized: function() {
            return canvasInitialized;
        },
        reset: resetCanvas,
        getMosaicAreas: function() {
            return mosaicAreas;
        },
        activateMosaicTool: function() {
            if (canvasInitialized) {
                activeToolName = 'mosaic';
                setupMosaicInteraction();
                return true;
            }
            return false;
        },
        activateTextTool: function() {
            if (canvasInitialized) {
                activeToolName = 'text';
                setupTextInteraction();
                return true;
            }
            return false;
        }
    };

    console.log('马赛克功能修复完成（Canvas统一实现）');

    // 添加CSS样式
    function addGlobalStyles() {
        if (document.getElementById('canvas-global-styles')) return;

        const style = document.createElement('style');
        style.id = 'canvas-global-styles';
        style.textContent = `
            /* 矩形工具按钮提醒样式 */
            .tool-reminder {
                position: relative;
            }
            
            .tool-reminder::after {
                content: "";
                position: absolute;
                top: -5px;
                right: -5px;
                width: 10px;
                height: 10px;
                background-color: #ff4757;
                border-radius: 50%;
                animation: pulse 1.5s infinite;
            }
            
            @keyframes pulse {
                0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.7); }
                70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(255, 71, 87, 0); }
                100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 71, 87, 0); }
            }
            
            /* 工具按钮选中状态 */
            .tool-active {
                background-color: rgba(52, 152, 219, 0.2) !important;
                border: 1px solid rgba(52, 152, 219, 0.5) !important;
                box-shadow: 0 0 5px rgba(52, 152, 219, 0.5) !important;
                transform: translateY(1px) !important;
            }
            
            /* 矩形样式面板 */
            .rectangle-settings-panel {
                position: absolute;
                left: 0;
                right: 0;
                background-color: #f8f9fa;
                border-bottom: 1px solid #ddd;
                padding: 8px 15px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                z-index: 100;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-wrap: nowrap;
                gap: 20px;
            }
            
            .rectangle-settings-panel h3 {
                margin: 0;
                font-size: 14px;
                color: #333;
                margin-right: 10px;
                white-space: nowrap;
            }
            
            .setting-group {
                display: flex;
                align-items: center;
                margin: 0;
                flex-shrink: 0;
            }
            
            .setting-group label {
                margin: 0 8px 0 0;
                font-size: 12px;
                color: #555;
                white-space: nowrap;
            }
            
            .color-options {
                display: flex;
                gap: 5px;
            }
            
            .color-option {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                cursor: pointer;
                border: 2px solid transparent;
                transition: transform 0.2s;
            }
            
            .color-option.active {
                border-color: #333;
                transform: scale(1.1);
            }
            
            .width-options {
                display: flex;
                gap: 5px;
            }
            
            .width-option {
                height: 20px;
                min-width: 24px;
                background: #fff;
                border: 1px solid #ddd;
                text-align: center;
                line-height: 20px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
            }
            
            .width-option.active {
                background: #007bff;
                color: white;
                border-color: #0056b3;
            }
            
            .opacity-slider {
                width: 100px;
                margin: 0;
                vertical-align: middle;
            }
            
            /* 关闭按钮 */
            .settings-close-btn {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #666;
            }
            
            .settings-close-btn:hover {
                color: #333;
            }
            
            /* 矩形选择框 */
            .rectangle-selection-box {
                position: absolute;
                border: 2px dashed #3498db;
                background-color: rgba(52, 152, 219, 0.1);
                box-sizing: border-box;
                pointer-events: none;
                z-index: 25;
                cursor: pointer;
            }
            
            /* 矩形绘制框 */
            .rectangle-drawing-box {
                position: absolute;
                box-sizing: border-box;
                pointer-events: none;
                z-index: 30;
            }
        `;
        document.head.appendChild(style);
    }

    // 更新矩形按钮的状态
    function updateRectangleButtonState(isMosaicActive) {
        const rectangleBtn = document.getElementById('rectangle-tool');
        if (!rectangleBtn) return;

        if (isMosaicActive) {
            // 添加提醒样式
            rectangleBtn.classList.add('tool-reminder');
        } else {
            // 移除提醒样式
            rectangleBtn.classList.remove('tool-reminder');
        }
    }

    // 显示矩形工具设置面板
    function showRectangleSettings() {
        // 确保rectangleSettings对象存在
        if (!window.rectangleSettings) {
            window.rectangleSettings = {
                strokeColor: '#ff0000',
                strokeWidth: 2,
                fillColor: 'rgba(255, 0, 0, 0.1)'
            };
        }

        // 如果不是矩形工具模式，不显示设置面板
        if (activeToolName !== 'rectangle') {
            removeRectangleSettings();
            return;
        }

        // 移除已有的设置面板
        removeRectangleSettings();

        // 获取header元素
        const header = document.querySelector('header');
        if (!header) {
            console.error('[错误] 未找到header元素');
            return;
        }

        // 创建矩形设置面板
        const settingsPanel = document.createElement('div');
        settingsPanel.id = 'rectangle-settings-panel';
        settingsPanel.className = 'rectangle-settings-panel';
        settingsPanel.style.width = '100%';
        settingsPanel.style.backgroundColor = '#f5f5f5';
        settingsPanel.style.borderTop = '1px solid #ddd';
        settingsPanel.style.padding = '8px 15px';
        settingsPanel.style.display = 'flex';
        settingsPanel.style.alignItems = 'center';
        settingsPanel.style.justifyContent = 'center';
        settingsPanel.style.flexWrap = 'wrap';
        settingsPanel.style.gap = '15px';
        settingsPanel.style.marginTop = '5px';
        settingsPanel.style.zIndex = '1000';
        settingsPanel.style.boxSizing = 'border-box';

        // 定义可选颜色
        const colors = [
            '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#000000'
        ];

        // 定义可选线条粗细
        const widths = [1, 2, 3, 5];

        // 设置面板内容 - 横向布局
        settingsPanel.innerHTML = `
            <div style="display: flex; align-items: center; padding-right: 15px; font-weight: bold; color: #333; min-width: 80px;">
                矩形设置:
            </div>
            
            <!-- 颜色设置 -->
            <div style="display: flex; align-items: center; gap: 8px;">
                <label style="font-size: 14px; color: #666; white-space: nowrap;">
                    线条颜色:
                </label>
                <div style="display: flex; gap: 5px;" class="color-options">
                    ${colors.map(color => `
                        <div class="color-option" data-color="${color}" style="width: 20px; height: 20px; background-color: ${color}; border-radius: 50%; cursor: pointer; border: 2px solid ${color === window.rectangleSettings.strokeColor ? '#333' : 'transparent'};"></div>
                    `).join('')}
                </div>
            </div>
            
            <!-- 粗细设置 -->
            <div style="display: flex; align-items: center; gap: 8px;">
                <label style="font-size: 14px; color: #666; white-space: nowrap;">
                    线条粗细:
                </label>
                <div style="display: flex; gap: 5px;" class="width-options">
                    ${widths.map(width => `
                        <div class="width-option" data-width="${width}" style="width: 24px; height: 24px; border-radius: 4px; cursor: pointer; background-color: ${width === window.rectangleSettings.strokeWidth ? '#e3e3e3' : '#fff'}; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px;">${width}</div>
                    `).join('')}
                </div>
            </div>
        `;

        // 添加到header底部
        header.appendChild(settingsPanel);

        // 添加颜色选项的点击事件
        const colorOptions = settingsPanel.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                const color = this.getAttribute('data-color');

                // 更新设置
                window.rectangleSettings.strokeColor = color;

                // 更新填充颜色，保持透明度不变
                const rgb = hexToRgb(color);
                if (rgb) {
                    window.rectangleSettings.fillColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
                }

                // 更新选中状态
                colorOptions.forEach(opt => {
                    opt.style.border = '2px solid transparent';
                });
                this.style.border = '2px solid #333';

                console.log(`[矩形] 线条颜色设置为: ${color}`);
            });
        });

        // 添加线条粗细选项的点击事件
        const widthOptions = settingsPanel.querySelectorAll('.width-option');
        widthOptions.forEach(option => {
            option.addEventListener('click', function() {
                const width = parseInt(this.getAttribute('data-width'));

                // 更新设置
                window.rectangleSettings.strokeWidth = width;

                // 更新选中状态
                widthOptions.forEach(opt => {
                    opt.style.backgroundColor = '#fff';
                });
                this.style.backgroundColor = '#e3e3e3';

                console.log(`[矩形] 线条粗细设置为: ${width}px`);
            });
        });
    }

    // 移除矩形工具设置面板
    function removeRectangleSettings() {
        const settingsPanel = document.getElementById('rectangle-settings-panel');
        if (settingsPanel) {
            settingsPanel.remove();
            console.log('[矩形] 移除矩形设置面板');
        }
    }

    // 辅助函数：转换HEX颜色为RGB
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // 更新工具按钮的激活状态
    function updateToolButtonState(toolName) {
        console.log(`[工具] 更新工具按钮状态: ${toolName}`);

        // 更新activeToolName
        activeToolName = toolName;

        // 移除所有工具按钮的选中状态
        const allButtons = document.querySelectorAll('.tool-button, [id$="-tool"]');
        allButtons.forEach(button => {
            button.classList.remove('tool-active');
        });

        // 根据当前工具名称选择要高亮的按钮
        let targetButton = null;

        if (toolName === 'mosaic') {
            targetButton = document.getElementById('mosaic-tool');
            removeArrowSettings(); // 确保箭头设置面板被移除
        } else if (toolName === 'text') {
            targetButton = document.getElementById('text-tool');
            removeArrowSettings(); // 确保箭头设置面板被移除
        } else if (toolName === 'rectangle') {
            targetButton = document.getElementById('rectangle-tool');
            removeArrowSettings(); // 确保箭头设置面板被移除
        } else if (toolName === 'arrow') {
            targetButton = document.getElementById('arrow-tool');
            // 箭头工具会显示其设置面板，由单独的showArrowSettings函数处理
        }

        // 添加选中状态
        if (targetButton) {
            targetButton.classList.add('tool-active');
        }

        // 控制设置面板显示
        removeRectangleSettings();

        if (toolName === 'rectangle') {
            showRectangleSettings();
        } else if (toolName === 'arrow') {
            showArrowSettings();
        }
    }

    // 箭头工具按钮添加
    function addArrowButton() {
        // 获取工具组元素
        const toolGroup = document.querySelector('.tool-group');
        if (!toolGroup) {
            console.error('[错误] 找不到工具组元素，尝试获取工具栏');
            // 尝试获取工具栏
            const toolBar = document.querySelector('.tool-bar');
            if (!toolBar) {
                console.error('[错误] 无法找到工具栏，无法添加箭头按钮');
                return;
            }
        }

        // 检查是否已经添加了箭头按钮
        if (document.getElementById('arrow-tool')) {
            console.log('[箭头] 箭头按钮已存在');
            return;
        }

        // 创建箭头按钮
        const arrowButton = document.createElement('button');
        arrowButton.id = 'arrow-tool';
        arrowButton.className = 'tool-btn'; // 使用tool-btn类保持与其他按钮一致的样式
        arrowButton.type = 'button';
        arrowButton.title = '箭头工具';

        // SVG箭头图标 - 更详细、美观的箭头图标
        arrowButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
        `;

        // 添加点击事件监听
        arrowButton.addEventListener('click', function() {
            console.log('[箭头] 按钮点击');

            // 检查是否已经有图片被加载并转换为Canvas
            if (!canvasInitialized || !mainCanvas) {
                // 没有图片，显示提示
                showUploadPrompt();
                return;
            }

            // 有图片，正常处理箭头功能
            console.log('[箭头] 激活箭头工具');
            // 设置当前工具为箭头
            activeToolName = 'arrow';
            // 更新工具按钮状态
            updateToolButtonState('arrow');
            // 清除其他工具事件
            clearToolEvents();
            // 设置箭头交互
            setupArrowInteraction();
            // 显示箭头设置面板
            showArrowSettings();
        });

        // 将按钮添加到工具组
        if (toolGroup) {
            toolGroup.appendChild(arrowButton);
            console.log('[箭头] 箭头按钮已添加到工具组');
        } else {
            // 如果找不到工具组，则添加到工具栏
            const toolBar = document.querySelector('.tool-bar');
            toolBar.appendChild(arrowButton);
            console.log('[箭头] 箭头按钮已添加到工具栏');
        }
    }

    // 显示上传提示函数
    function showUploadPrompt() {
        console.log('[提示] 显示上传图片提示');

        // 检查是否已存在提示框
        let promptElement = document.getElementById('upload-prompt');
        if (promptElement) {
            // 如果已存在，更新并显示
            promptElement.style.display = 'flex';
            return;
        }

        // 创建提示框
        promptElement = document.createElement('div');
        promptElement.id = 'upload-prompt';
        promptElement.style.position = 'fixed';
        promptElement.style.top = '50%';
        promptElement.style.left = '50%';
        promptElement.style.transform = 'translate(-50%, -50%)';
        promptElement.style.backgroundColor = '#fff';
        promptElement.style.padding = '20px';
        promptElement.style.borderRadius = '8px';
        promptElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        promptElement.style.zIndex = '10000';
        promptElement.style.display = 'flex';
        promptElement.style.flexDirection = 'column';
        promptElement.style.alignItems = 'center';
        promptElement.style.maxWidth = '90%';
        promptElement.style.width = '350px';

        // 设置提示内容
        promptElement.innerHTML = `
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333;">请先上传图片</div>
            <div style="font-size: 14px; color: #666; margin-bottom: 20px; text-align: center;">
                您需要先上传一张图片，才能使用箭头工具进行编辑。
            </div>
            <button id="close-prompt" style="padding: 8px 16px; background-color: #4a89dc; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                确定
            </button>
        `;

        // 添加到文档
        document.body.appendChild(promptElement);

        // 添加关闭按钮点击事件
        document.getElementById('close-prompt').addEventListener('click', function() {
            promptElement.style.display = 'none';
        });

        // 点击空白处关闭提示
        promptElement.addEventListener('click', function(e) {
            if (e.target === promptElement) {
                promptElement.style.display = 'none';
            }
        });
    }

    function setupArrowInteraction() {
        console.log('[箭头] 设置箭头交互');

        // 重置箭头状态
        arrowStart = null;
        arrowEnd = null;
        isDrawingArrow = false;

        // 获取Canvas交互覆盖层
        const overlay = document.getElementById('canvas-interaction-overlay');
        if (!overlay) {
            console.error('[错误] 找不到Canvas交互覆盖层');
            return;
        }

        // 声明函数引用变量
        let onMouseDown, onMouseMove, onMouseUp, keyHandler;

        // 清除之前的事件监听
        overlay.removeEventListener('mousedown', onMouseDown);
        overlay.removeEventListener('mousemove', onMouseMove);
        overlay.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('keydown', keyHandler);

        // 创建临时箭头元素
        let tempArrow = null;

        // 键盘事件 - ESC取消绘制，DELETE删除选中箭头
        keyHandler = function(e) {
            if (activeToolName !== 'arrow') return;

            // ESC键 - 取消箭头绘制
            if (e.key === 'Escape') {
                console.log('[箭头] 取消箭头绘制');

                if (selectedArrowIndex >= 0) {
                    // 删除选中的箭头
                    deleteSelectedArrow();
                } else {
                    // 取消绘制中的箭头
                    arrowStart = null;
                    arrowEnd = null;
                    isDrawingArrow = false;

                    // 移除临时箭头
                    if (tempArrow) {
                        tempArrow.remove();
                        tempArrow = null;
                    }
                }
            }

            // DELETE键 - 删除选中箭头
            if (e.key === 'Delete') {
                if (selectedArrowIndex >= 0) {
                    console.log('[箭头] 删除选中箭头');
                    deleteSelectedArrow();
                }
            }
        };

        // 鼠标按下事件 - 设置箭头起点
        onMouseDown = function(e) {
            if (activeToolName !== 'arrow') return;

            // 计算Canvas上的坐标
            const rect = overlay.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (mainCanvas.width / overlay.clientWidth);
            const y = (e.clientY - rect.top) * (mainCanvas.height / overlay.clientHeight);

            // 检查是否点击了已有的箭头
            const clickedArrowIndex = findArrowAtPosition(x, y);
            if (clickedArrowIndex >= 0) {
                // 选中现有箭头
                if (selectedArrowIndex !== clickedArrowIndex) {
                    // 隐藏之前的选择框
                    hideSelectionOverlay();
                    // 显示新的选择框
                    showSelectionOverlay(clickedArrowIndex);
                }
                return;
            }

            // 隐藏选择框
            hideSelectionOverlay();

            // 如果已经设置了起点
            if (arrowStart && !isDrawingArrow) {
                // 箭头已经完成，开始新的箭头
                arrowStart = {
                    x,
                    y
                };
                console.log(`[箭头] 设置新箭头起点: (${x.toFixed(2)}, ${y.toFixed(2)})`);
                isDrawingArrow = true;
            }
            // 如果没有设置起点
            else if (!arrowStart) {
                arrowStart = {
                    x,
                    y
                };
                console.log(`[箭头] 设置箭头起点: (${x.toFixed(2)}, ${y.toFixed(2)})`);
                isDrawingArrow = true;
            }

            // 创建临时箭头元素用于预览
            if (!tempArrow && isDrawingArrow) {
                tempArrow = document.createElement('div');
                tempArrow.style.position = 'absolute';
                tempArrow.style.zIndex = '30';
                tempArrow.style.pointerEvents = 'none';
                overlay.appendChild(tempArrow);
            }
        };

        // 鼠标移动事件 - 实时预览箭头
        onMouseMove = function(e) {
            if (!isDrawingArrow || !arrowStart || activeToolName !== 'arrow') return;

            // 计算Canvas上的坐标
            const rect = overlay.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (mainCanvas.width / overlay.clientWidth);
            const y = (e.clientY - rect.top) * (mainCanvas.height / overlay.clientHeight);

            // 更新临时箭头位置和样式
            if (tempArrow) {
                // 获取箭头的screen坐标
                const startX = arrowStart.x * (overlay.clientWidth / mainCanvas.width);
                const startY = arrowStart.y * (overlay.clientHeight / mainCanvas.height);
                const endX = (e.clientX - rect.left);
                const endY = (e.clientY - rect.top);

                // 绘制SVG箭头
                const angle = Math.atan2(endY - startY, endX - startX);
                const headSize = arrowSettings.headSize;

                // 创建SVG箭头
                tempArrow.innerHTML = `
                    <svg width="${overlay.clientWidth}" height="${overlay.clientHeight}" style="position:absolute;top:0;left:0;pointer-events:none;">
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="${arrowSettings.strokeColor}" />
                            </marker>
                        </defs>
                        <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" 
                              stroke="${arrowSettings.strokeColor}" 
                              stroke-width="${arrowSettings.strokeWidth}" 
                              marker-end="url(#arrowhead)" />
                    </svg>
                `;
            }
        };

        // 鼠标松开事件 - 完成箭头绘制
        onMouseUp = function(e) {
            if (!isDrawingArrow || !arrowStart || activeToolName !== 'arrow') return;

            // 计算Canvas上的坐标
            const rect = overlay.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (mainCanvas.width / overlay.clientWidth);
            const y = (e.clientY - rect.top) * (mainCanvas.height / overlay.clientHeight);

            // 设置箭头终点
            arrowEnd = {
                x,
                y
            };
            console.log(`[箭头] 设置箭头终点: (${x.toFixed(2)}, ${y.toFixed(2)})`);

            // 绘制永久箭头
            drawArrow();

            // 重置状态
            isDrawingArrow = false;
            arrowStart = null;
            arrowEnd = null;

            // 移除临时箭头
            if (tempArrow) {
                tempArrow.remove();
                tempArrow = null;
            }
        };

        // 在Canvas上绘制箭头
        function drawArrow() {
            if (!arrowStart || !arrowEnd) return;

            // 计算箭头角度和长度
            const dx = arrowEnd.x - arrowStart.x;
            const dy = arrowEnd.y - arrowStart.y;
            const length = Math.sqrt(dx * dx + dy * dy);

            // 如果长度太短，不绘制箭头
            if (length < 5) {
                console.log('[箭头] 箭头太短，取消绘制');
                return;
            }

            // 在Canvas上绘制箭头
            mainCtx.save();

            // 设置绘制样式
            mainCtx.strokeStyle = arrowSettings.strokeColor;
            mainCtx.lineWidth = arrowSettings.strokeWidth;
            mainCtx.lineJoin = 'round';
            mainCtx.lineCap = 'round';

            // 绘制箭头主干
            mainCtx.beginPath();
            mainCtx.moveTo(arrowStart.x, arrowStart.y);
            mainCtx.lineTo(arrowEnd.x, arrowEnd.y);
            mainCtx.stroke();

            // 绘制箭头头部
            const angle = Math.atan2(dy, dx);
            const headSize = arrowSettings.headSize;

            mainCtx.beginPath();
            mainCtx.moveTo(arrowEnd.x, arrowEnd.y);
            mainCtx.lineTo(
                arrowEnd.x - headSize * Math.cos(angle - Math.PI / 6),
                arrowEnd.y - headSize * Math.sin(angle - Math.PI / 6)
            );
            mainCtx.lineTo(
                arrowEnd.x - headSize * Math.cos(angle + Math.PI / 6),
                arrowEnd.y - headSize * Math.sin(angle + Math.PI / 6)
            );
            mainCtx.closePath();
            mainCtx.fillStyle = arrowSettings.strokeColor;
            mainCtx.fill();

            mainCtx.restore();

            // 将箭头添加到数组
            const arrow = {
                startX: arrowStart.x,
                startY: arrowStart.y,
                endX: arrowEnd.x,
                endY: arrowEnd.y,
                color: arrowSettings.strokeColor,
                width: arrowSettings.strokeWidth,
                headSize: arrowSettings.headSize,
                // 添加屏幕坐标用于选择检测
                screenStartX: arrowStart.x * (overlay.clientWidth / mainCanvas.width),
                screenStartY: arrowStart.y * (overlay.clientHeight / mainCanvas.height),
                screenEndX: arrowEnd.x * (overlay.clientWidth / mainCanvas.width),
                screenEndY: arrowEnd.y * (overlay.clientHeight / mainCanvas.height)
            };

            arrows.push(arrow);
            console.log(`[箭头] 绘制完成，当前共有 ${arrows.length} 个箭头`);
        }

        // 查找指定位置的箭头
        function findArrowAtPosition(x, y) {
            // 转换为屏幕坐标
            const screenX = x * (overlay.clientWidth / mainCanvas.width);
            const screenY = y * (overlay.clientHeight / mainCanvas.height);

            // 设置点击容差
            const tolerance = 10;

            for (let i = arrows.length - 1; i >= 0; i--) {
                const arrow = arrows[i];

                // 计算点到线段的距离
                const lineLength = Math.sqrt(
                    Math.pow(arrow.screenEndX - arrow.screenStartX, 2) +
                    Math.pow(arrow.screenEndY - arrow.screenStartY, 2)
                );

                if (lineLength === 0) continue;

                // 使用向量点积计算投影长度
                const t = Math.max(0, Math.min(1, (
                    (screenX - arrow.screenStartX) * (arrow.screenEndX - arrow.screenStartX) +
                    (screenY - arrow.screenStartY) * (arrow.screenEndY - arrow.screenStartY)
                ) / (lineLength * lineLength)));

                // 计算投影点
                const projX = arrow.screenStartX + t * (arrow.screenEndX - arrow.screenStartX);
                const projY = arrow.screenStartY + t * (arrow.screenEndY - arrow.screenStartY);

                // 计算点到投影点的距离
                const distance = Math.sqrt(
                    Math.pow(screenX - projX, 2) +
                    Math.pow(screenY - projY, 2)
                );

                // 如果距离在容差范围内，返回箭头索引
                if (distance <= tolerance) {
                    return i;
                }
            }

            return -1;
        }

        // 显示箭头选择覆盖层
        function showSelectionOverlay(index) {
            if (index < 0 || index >= arrows.length) return;

            selectedArrowIndex = index;
            const arrow = arrows[index];

            // 创建或获取选择覆盖层
            let selectionOverlay = document.getElementById('arrow-selection-overlay');
            if (!selectionOverlay) {
                selectionOverlay = document.createElement('div');
                selectionOverlay.id = 'arrow-selection-overlay';
                selectionOverlay.style.position = 'absolute';
                selectionOverlay.style.pointerEvents = 'none';
                selectionOverlay.style.zIndex = '25';
                overlay.appendChild(selectionOverlay);
            }

            // 计算箭头长度和角度
            const dx = arrow.screenEndX - arrow.screenStartX;
            const dy = arrow.screenEndY - arrow.screenStartY;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);

            // 创建选择指示器
            const padding = 8; // 选择框的padding
            selectionOverlay.innerHTML = `
                <div style="
                    position: absolute;
                    top: ${Math.min(arrow.screenStartY, arrow.screenEndY) - padding}px;
                    left: ${Math.min(arrow.screenStartX, arrow.screenEndX) - padding}px;
                    width: ${length + padding * 2}px;
                    height: ${Math.max(arrow.width * 3, 20) + padding * 2}px;
                    transform: rotate(${angle}deg);
                    transform-origin: ${Math.min(arrow.screenStartX, arrow.screenEndX) + length/2}px ${Math.min(arrow.screenStartY, arrow.screenEndY) + (Math.max(arrow.width * 3, 20))/2}px;
                    border: 2px dashed rgba(52, 152, 219, 0.8);
                    background-color: rgba(52, 152, 219, 0.1);
                    box-sizing: border-box;
                    cursor: pointer;
                "></div>
            `;

            console.log(`[箭头] 选中箭头 ${index}`);
        }

        // 隐藏箭头选择覆盖层
        function hideSelectionOverlay() {
            const selectionOverlay = document.getElementById('arrow-selection-overlay');
            if (selectionOverlay) {
                selectionOverlay.innerHTML = '';
            }
            selectedArrowIndex = -1;
        }

        // 删除选中的箭头
        function deleteSelectedArrow() {
            if (selectedArrowIndex < 0 || selectedArrowIndex >= arrows.length) return;

            console.log(`[箭头] 删除箭头 ${selectedArrowIndex}`);

            // 从数组中移除箭头
            arrows.splice(selectedArrowIndex, 1);

            // 隐藏选择覆盖层
            hideSelectionOverlay();

            // 重绘Canvas
            redrawCanvas();
        }

        // 重绘Canvas，包括所有箭头
        function redrawCanvas() {
            // 首先恢复原始图像
            if (originalImageData) {
                mainCtx.putImageData(originalImageData, 0, 0);
            }

            // 重新绘制所有箭头
            for (const arrow of arrows) {
                // 设置绘制样式
                mainCtx.save();
                mainCtx.strokeStyle = arrow.color;
                mainCtx.lineWidth = arrow.width;
                mainCtx.lineJoin = 'round';
                mainCtx.lineCap = 'round';

                // 绘制箭头主干
                mainCtx.beginPath();
                mainCtx.moveTo(arrow.startX, arrow.startY);
                mainCtx.lineTo(arrow.endX, arrow.endY);
                mainCtx.stroke();

                // 计算箭头角度
                const angle = Math.atan2(arrow.endY - arrow.startY, arrow.endX - arrow.startX);
                const headSize = arrow.headSize;

                // 绘制箭头头部
                mainCtx.beginPath();
                mainCtx.moveTo(arrow.endX, arrow.endY);
                mainCtx.lineTo(
                    arrow.endX - headSize * Math.cos(angle - Math.PI / 6),
                    arrow.endY - headSize * Math.sin(angle - Math.PI / 6)
                );
                mainCtx.lineTo(
                    arrow.endX - headSize * Math.cos(angle + Math.PI / 6),
                    arrow.endY - headSize * Math.sin(angle + Math.PI / 6)
                );
                mainCtx.closePath();
                mainCtx.fillStyle = arrow.color;
                mainCtx.fill();
                mainCtx.restore();
            }

            console.log(`[箭头] Canvas重绘完成，共 ${arrows.length} 个箭头`);
        }

        // 添加事件监听
        overlay.addEventListener('mousedown', onMouseDown);
        overlay.addEventListener('mousemove', onMouseMove);
        overlay.addEventListener('mouseup', onMouseUp);
        document.addEventListener('keydown', keyHandler);
    }

    // 显示箭头设置面板
    function showArrowSettings() {
        console.log('[箭头] 显示箭头设置面板');

        // 移除可能已存在的设置面板
        removeArrowSettings();

        // 获取header元素
        const header = document.querySelector('header');
        if (!header) {
            console.error('[错误] 未找到header元素');
            return;
        }

        // 创建箭头设置面板
        const settingsPanel = document.createElement('div');
        settingsPanel.id = 'arrow-settings-panel';
        settingsPanel.className = 'arrow-settings-panel';
        settingsPanel.style.width = '100%';
        settingsPanel.style.backgroundColor = '#f5f5f5';
        settingsPanel.style.borderTop = '1px solid #ddd';
        settingsPanel.style.padding = '8px 15px';
        settingsPanel.style.display = 'flex';
        settingsPanel.style.alignItems = 'center';
        settingsPanel.style.justifyContent = 'center';
        settingsPanel.style.flexWrap = 'wrap';
        settingsPanel.style.gap = '15px';
        settingsPanel.style.marginTop = '5px';
        settingsPanel.style.zIndex = '1000';
        settingsPanel.style.boxSizing = 'border-box';

        // 设置面板内容 - 横向布局
        settingsPanel.innerHTML = `
            <div style="display: flex; align-items: center; padding-right: 15px; font-weight: bold; color: #333; min-width: 80px;">
                箭头设置:
            </div>
            
            <!-- 颜色设置 -->
            <div style="display: flex; align-items: center; gap: 8px;">
                <label style="font-size: 14px; color: #666; white-space: nowrap;">
                    颜色:
                </label>
                <div style="display: flex; gap: 5px;">
                    <div class="color-option" data-color="#ff0000" style="width: 20px; height: 20px; background-color: #ff0000; border-radius: 50%; cursor: pointer; border: 2px solid ${arrowSettings.strokeColor === '#ff0000' ? '#333' : 'transparent'};"></div>
                    <div class="color-option" data-color="#00ff00" style="width: 20px; height: 20px; background-color: #00ff00; border-radius: 50%; cursor: pointer; border: 2px solid ${arrowSettings.strokeColor === '#00ff00' ? '#333' : 'transparent'};"></div>
                    <div class="color-option" data-color="#0000ff" style="width: 20px; height: 20px; background-color: #0000ff; border-radius: 50%; cursor: pointer; border: 2px solid ${arrowSettings.strokeColor === '#0000ff' ? '#333' : 'transparent'};"></div>
                    <div class="color-option" data-color="#ffff00" style="width: 20px; height: 20px; background-color: #ffff00; border-radius: 50%; cursor: pointer; border: 2px solid ${arrowSettings.strokeColor === '#ffff00' ? '#333' : 'transparent'};"></div>
                    <div class="color-option" data-color="#000000" style="width: 20px; height: 20px; background-color: #000000; border-radius: 50%; cursor: pointer; border: 2px solid ${arrowSettings.strokeColor === '#000000' ? '#333' : 'transparent'};"></div>
                </div>
            </div>
            
            <!-- 粗细设置 -->
            <div style="display: flex; align-items: center; gap: 8px; min-width: 180px;">
                <label for="arrow-width" style="font-size: 14px; color: #666; white-space: nowrap;">
                    线条粗细: <span id="width-value">${arrowSettings.strokeWidth}</span>px
                </label>
                <input type="range" id="arrow-width" min="1" max="10" value="${arrowSettings.strokeWidth}" style="width: 80px;">
            </div>
            
            <!-- 箭头大小设置 -->
            <div style="display: flex; align-items: center; gap: 8px; min-width: 180px;">
                <label for="arrow-head-size" style="font-size: 14px; color: #666; white-space: nowrap;">
                    箭头大小: <span id="head-size-value">${arrowSettings.headSize}</span>px
                </label>
                <input type="range" id="arrow-head-size" min="5" max="30" value="${arrowSettings.headSize}" style="width: 80px;">
            </div>
        `;

        // 添加到header底部
        header.appendChild(settingsPanel);

        // 添加事件监听
        const colorOptions = settingsPanel.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                const color = this.getAttribute('data-color');
                arrowSettings.strokeColor = color;

                // 更新选中状态
                colorOptions.forEach(opt => {
                    opt.style.border = '2px solid transparent';
                });
                this.style.border = '2px solid #333';

                console.log(`[箭头] 颜色设置为: ${color}`);
            });
        });

        // 线条粗细事件
        const widthSlider = document.getElementById('arrow-width');
        const widthValue = document.getElementById('width-value');
        if (widthSlider && widthValue) {
            widthSlider.addEventListener('input', function() {
                arrowSettings.strokeWidth = parseInt(this.value);
                widthValue.textContent = this.value;
                console.log(`[箭头] 线条粗细设置为: ${this.value}px`);
            });
        }

        // 箭头大小事件
        const headSizeSlider = document.getElementById('arrow-head-size');
        const headSizeValue = document.getElementById('head-size-value');
        if (headSizeSlider && headSizeValue) {
            headSizeSlider.addEventListener('input', function() {
                arrowSettings.headSize = parseInt(this.value);
                headSizeValue.textContent = this.value;
                console.log(`[箭头] 箭头大小设置为: ${this.value}px`);
            });
        }
    }

    // 移除箭头设置面板
    function removeArrowSettings() {
        const settingsPanel = document.getElementById('arrow-settings-panel');
        if (settingsPanel) {
            settingsPanel.remove();
            console.log('[箭头] 移除箭头设置面板');
        }
    }
})();