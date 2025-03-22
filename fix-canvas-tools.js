// Canvas工具集 - 实现红框标注和文本编辑
(function() {
    // 立即执行，不等待DOMContentLoaded事件
    console.log('开始执行Canvas工具集 - 红框标注和文本编辑');

    // 确认脚本加载
    alert('Canvas工具集已加载'); // 使用alert确认脚本执行

    // 工具状态
    let activeToolName = null;

    // 获取Canvas编辑器
    function getCanvasEditor() {
        return window.canvasEditor || null;
    }

    // 清理工具事件监听器
    function clearToolEvents() {
        const overlay = document.getElementById('canvas-interaction-overlay');
        if (overlay) {
            // 清理矩形工具事件
            if (typeof overlay._rectangleCleanup === 'function') {
                overlay._rectangleCleanup();
                overlay._rectangleCleanup = null;
            }

            // 清理文字工具事件
            if (typeof overlay._textCleanup === 'function') {
                overlay._textCleanup();
                overlay._textCleanup = null;
            }

            // 移除任何选择框或编辑UI
            const selectionElements = overlay.querySelectorAll('.rectangle-selection-box, .text-editor, .text-controls');
            selectionElements.forEach(el => el.remove());
        }
    }

    // 设置红框标注工具交互
    function setupRectangleInteraction() {
        console.log('[设置] 红框标注工具交互');

        // 清理其他工具事件
        clearToolEvents();

        // 获取Canvas编辑器
        const canvasEditor = getCanvasEditor();
        if (!canvasEditor) {
            console.error('[错误] Canvas编辑器不可用');
            return;
        }

        const canvas = canvasEditor.getCanvas();
        const ctx = canvasEditor.getContext();
        if (!canvas || !ctx) {
            console.error('[错误] Canvas或上下文不可用');
            return;
        }

        // 获取交互覆盖层
        const overlay = document.getElementById('canvas-interaction-overlay');
        if (!overlay) {
            console.error('[错误] 找不到交互覆盖层');
            return;
        }

        // 红框状态变量
        let isDrawing = false;
        let startX = 0;
        let startY = 0;
        let currentBox = null;

        // 添加矩形样式
        if (!document.getElementById('rectangle-style')) {
            const style = document.createElement('style');
            style.id = 'rectangle-style';
            style.textContent = `
                .rectangle-selection-box {
                    position: absolute;
                    border: 3px solid #ff0000;
                    background-color: transparent;
                    box-sizing: border-box;
                    pointer-events: none;
                    z-index: 30;
                }
                .rectangle-label {
                    position: absolute;
                    color: white;
                    background-color: rgba(0, 0, 0, 0.6);
                    padding: 2px 5px;
                    font-size: 12px;
                    border-radius: 3px;
                    pointer-events: none;
                }
                .rectangle-handle {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    background-color: white;
                    border: 2px solid #ff0000;
                    border-radius: 50%;
                    cursor: pointer;
                    z-index: 31;
                }
                .rectangle-handle.tl { top: -7px; left: -7px; cursor: nwse-resize; }
                .rectangle-handle.tr { top: -7px; right: -7px; cursor: nesw-resize; }
                .rectangle-handle.bl { bottom: -7px; left: -7px; cursor: nesw-resize; }
                .rectangle-handle.br { bottom: -7px; right: -7px; cursor: nwse-resize; }
            `;
            document.head.appendChild(style);
        }

        // 存储所有矩形
        let rectangles = [];

        // 创建选择框
        function createSelectionBox(x, y) {
            console.log(`[创建] 矩形选择框，位置: (${x}, ${y})`);

            // 移除当前选择框
            if (currentBox) {
                currentBox.remove();
            }

            // 创建新选择框
            currentBox = document.createElement('div');
            currentBox.className = 'rectangle-selection-box';
            currentBox.style.left = `${x}px`;
            currentBox.style.top = `${y}px`;
            currentBox.style.width = '1px';
            currentBox.style.height = '1px';

            // 添加尺寸标签
            const sizeLabel = document.createElement('div');
            sizeLabel.className = 'rectangle-label size-label';
            sizeLabel.style.bottom = '-25px';
            sizeLabel.style.right = '0';
            sizeLabel.textContent = '1 × 1';
            currentBox.appendChild(sizeLabel);

            // 添加到覆盖层
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

        // 完成矩形创建
        function finalizeRectangle() {
            if (!currentBox) return;

            // 获取选择框位置和尺寸
            const boxRect = currentBox.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();

            // 计算相对于Canvas的位置
            const scaleX = canvas.width / canvasRect.width;
            const scaleY = canvas.height / canvasRect.height;

            const x = Math.round((boxRect.left - canvasRect.left) * scaleX);
            const y = Math.round((boxRect.top - canvasRect.top) * scaleY);
            const width = Math.round(boxRect.width * scaleX);
            const height = Math.round(boxRect.height * scaleY);

            console.log(`[添加] 矩形: (${x}, ${y}), 尺寸: ${width}x${height}`);

            // 添加到Canvas
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3 * scaleX; // 保持与CSS一致的线宽
            ctx.strokeRect(x, y, width, height);

            // 存储矩形信息
            rectangles.push({
                x,
                y,
                width,
                height,
                color: '#ff0000',
                lineWidth: 3 * scaleX
            });

            // 移除当前选择框
            currentBox.remove();
            currentBox = null;
        }

        // 鼠标事件处理
        function onMouseDown(e) {
            // 确保当前工具是矩形工具
            if (activeToolName !== 'rectangle') {
                console.log(`[忽略] 鼠标事件, 当前工具: ${activeToolName}`);
                return;
            }

            console.log('[事件] 矩形工具鼠标按下');

            e.preventDefault();
            e.stopPropagation();

            // 获取鼠标位置
            const rect = overlay.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;

            // 创建选择框
            createSelectionBox(startX, startY);
            isDrawing = true;
        }

        function onMouseMove(e) {
            // 确保当前工具是矩形工具且正在绘制
            if (activeToolName !== 'rectangle' || !isDrawing || !currentBox) return;

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
            // 确保当前工具是矩形工具
            if (activeToolName !== 'rectangle') return;

            // 确保正在绘制
            if (!isDrawing) return;

            console.log('[事件] 矩形工具鼠标松开');

            // 获取选择框的宽度和高度
            if (currentBox) {
                const width = parseInt(currentBox.style.width);
                const height = parseInt(currentBox.style.height);

                // 如果选择框过小，直接移除
                if (width < 10 || height < 10) {
                    console.log('[取消] 矩形过小，已移除');
                    currentBox.remove();
                    currentBox = null;
                } else {
                    // 完成矩形创建
                    finalizeRectangle();
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
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        overlay.addEventListener('touchstart', onTouchStart);
        overlay.addEventListener('touchmove', onTouchMove);
        overlay.addEventListener('touchend', onTouchEnd);

        // Escape键取消绘制
        const keyHandler = function(e) {
            if (activeToolName === 'rectangle' && e.key === 'Escape' && currentBox) {
                console.log('[取消] 按下Escape键取消矩形');
                currentBox.remove();
                currentBox = null;
                isDrawing = false;
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

            if (currentBox) {
                currentBox.remove();
                currentBox = null;
            }
        };

        console.log('[完成] 矩形工具交互设置');
    }

    // 设置文字编辑工具交互
    function setupTextInteraction() {
        console.log('[设置] 文字编辑工具交互');

        // 清理其他工具事件
        clearToolEvents();

        // 获取Canvas编辑器
        const canvasEditor = getCanvasEditor();
        if (!canvasEditor) {
            console.error('[错误] Canvas编辑器不可用');
            return;
        }

        const canvas = canvasEditor.getCanvas();
        const ctx = canvasEditor.getContext();
        if (!canvas || !ctx) {
            console.error('[错误] Canvas或上下文不可用');
            return;
        }

        // 获取交互覆盖层
        const overlay = document.getElementById('canvas-interaction-overlay');
        if (!overlay) {
            console.error('[错误] 找不到交互覆盖层');
            return;
        }

        // 添加文字编辑样式
        if (!document.getElementById('text-editor-style')) {
            const style = document.createElement('style');
            style.id = 'text-editor-style';
            style.textContent = `
                .text-editor {
                    position: absolute;
                    min-width: 100px;
                    min-height: 30px;
                    padding: 5px;
                    border: 1px dashed #007bff;
                    background-color: rgba(255, 255, 255, 0.8);
                    z-index: 30;
                    cursor: move;
                }
                .text-editor textarea {
                    width: 100%;
                    height: 100%;
                    border: none;
                    outline: none;
                    background: transparent;
                    resize: none;
                    font-family: Arial, sans-serif;
                    font-size: 16px;
                }
                .text-controls {
                    position: absolute;
                    top: -40px;
                    left: 0;
                    background-color: rgba(0, 0, 0, 0.7);
                    border-radius: 5px;
                    padding: 5px;
                    display: flex;
                    gap: 5px;
                    z-index: 31;
                }
                .color-btn {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 1px solid white;
                    cursor: pointer;
                }
                .size-btn {
                    background-color: transparent;
                    color: white;
                    border: 1px solid white;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 12px;
                    padding: 2px 5px;
                }
                .confirm-btn {
                    background-color: #28a745;
                    color: white;
                    border: none;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 12px;
                    padding: 2px 8px;
                }
                .cancel-btn {
                    background-color: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 12px;
                    padding: 2px 8px;
                }
            `;
            document.head.appendChild(style);
        }

        // 文字编辑状态
        let currentEditor = null;
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;

        // 存储所有文本
        let texts = [];

        // 默认文本样式
        let textStyle = {
            color: '#000000',
            fontSize: 16,
            fontFamily: 'Arial, sans-serif'
        };

        // 创建文本编辑器
        function createTextEditor(x, y) {
            console.log(`[创建] 文本编辑器，位置: (${x}, ${y})`);

            // 如果已有编辑器，先应用当前文本
            if (currentEditor) {
                applyText();
            }

            // 创建编辑器容器
            const editor = document.createElement('div');
            editor.className = 'text-editor';
            editor.style.left = `${x}px`;
            editor.style.top = `${y}px`;

            // 创建文本输入区域
            const textarea = document.createElement('textarea');
            textarea.placeholder = '输入文本...';
            textarea.rows = 2;
            textarea.style.color = textStyle.color;
            textarea.style.fontSize = `${textStyle.fontSize}px`;
            textarea.style.fontFamily = textStyle.fontFamily;
            editor.appendChild(textarea);

            // 创建控制面板
            const controls = document.createElement('div');
            controls.className = 'text-controls';

            // 添加颜色选择按钮
            const colors = ['#000000', '#ff0000', '#0000ff', '#008000', '#ffff00'];
            colors.forEach(color => {
                const colorBtn = document.createElement('div');
                colorBtn.className = 'color-btn';
                colorBtn.style.backgroundColor = color;
                colorBtn.addEventListener('click', () => {
                    textStyle.color = color;
                    textarea.style.color = color;
                });
                controls.appendChild(colorBtn);
            });

            // 添加字体大小按钮
            const sizes = ['小', '中', '大'];
            const sizePx = [12, 16, 24];
            for (let i = 0; i < sizes.length; i++) {
                const sizeBtn = document.createElement('button');
                sizeBtn.className = 'size-btn';
                sizeBtn.textContent = sizes[i];
                sizeBtn.addEventListener('click', () => {
                    textStyle.fontSize = sizePx[i];
                    textarea.style.fontSize = `${sizePx[i]}px`;
                });
                controls.appendChild(sizeBtn);
            }

            // 添加确认和取消按钮
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'confirm-btn';
            confirmBtn.textContent = '确认';
            confirmBtn.addEventListener('click', applyText);
            controls.appendChild(confirmBtn);

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'cancel-btn';
            cancelBtn.textContent = '取消';
            cancelBtn.addEventListener('click', () => {
                editor.remove();
                controls.remove();
                currentEditor = null;
            });
            controls.appendChild(cancelBtn);

            // 添加到覆盖层
            overlay.appendChild(editor);
            overlay.appendChild(controls);

            // 更新控制面板位置
            updateControlsPosition(editor, controls);

            // 设置为可拖动
            setupDraggable(editor, controls);

            // 聚焦文本区域
            setTimeout(() => textarea.focus(), 10);

            currentEditor = {
                container: editor,
                textarea: textarea,
                controls: controls,
                position: {
                    x,
                    y
                }
            };

            return currentEditor;
        }

        // 更新控制面板位置
        function updateControlsPosition(editor, controls) {
            const rect = editor.getBoundingClientRect();
            controls.style.left = `${editor.offsetLeft}px`;
            controls.style.top = `${editor.offsetTop - 40}px`;
        }

        // 设置编辑器可拖动
        function setupDraggable(editor, controls) {
            editor.addEventListener('mousedown', function(e) {
                // 如果点击的是文本区域，不启动拖动
                if (e.target.tagName === 'TEXTAREA') return;

                isDragging = true;
                dragStartX = e.clientX - editor.offsetLeft;
                dragStartY = e.clientY - editor.offsetTop;

                // 防止选中文本
                e.preventDefault();
            });

            // 使用document以捕获拖动超出元素的情况
            document.addEventListener('mousemove', function(e) {
                if (!isDragging || !currentEditor) return;

                const newLeft = e.clientX - dragStartX;
                const newTop = e.clientY - dragStartY;

                editor.style.left = `${newLeft}px`;
                editor.style.top = `${newTop}px`;

                // 更新控制面板位置
                updateControlsPosition(editor, controls);

                // 更新位置信息
                currentEditor.position = {
                    x: newLeft,
                    y: newTop
                };
            });

            document.addEventListener('mouseup', function() {
                isDragging = false;
            });
        }

        // 应用文本到Canvas
        function applyText() {
            if (!currentEditor) return;

            const text = currentEditor.textarea.value.trim();
            if (!text) {
                currentEditor.container.remove();
                currentEditor.controls.remove();
                currentEditor = null;
                return;
            }

            console.log(`[应用] 文本: "${text}"`);

            // 获取位置和样式
            const canvasRect = canvas.getBoundingClientRect();
            const editorRect = currentEditor.container.getBoundingClientRect();

            // 计算相对于Canvas的位置
            const scaleX = canvas.width / canvasRect.width;
            const scaleY = canvas.height / canvasRect.height;

            const x = Math.round((editorRect.left - canvasRect.left) * scaleX);
            const y = Math.round((editorRect.top - canvasRect.top) * scaleY);

            // 设置文字样式
            ctx.fillStyle = textStyle.color;
            ctx.font = `${textStyle.fontSize * scaleY}px ${textStyle.fontFamily}`;

            // 绘制文本到Canvas
            const lines = text.split('\n');
            const lineHeight = textStyle.fontSize * 1.2 * scaleY;

            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], x, y + (i + 1) * lineHeight);
            }

            // 存储文本信息
            texts.push({
                text: text,
                x: x,
                y: y,
                color: textStyle.color,
                fontSize: textStyle.fontSize * scaleY,
                fontFamily: textStyle.fontFamily
            });

            // 移除编辑器
            currentEditor.container.remove();
            currentEditor.controls.remove();
            currentEditor = null;
        }

        // 点击事件处理
        function onClick(e) {
            // 确保当前工具是文字工具
            if (activeToolName !== 'text') {
                console.log(`[忽略] 点击事件, 当前工具: ${activeToolName}`);
                return;
            }

            console.log('[事件] 文本工具点击');

            // 获取点击位置
            const rect = overlay.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // 创建文本编辑器
            createTextEditor(x, y);
        }

        // 添加事件监听器
        overlay.addEventListener('click', onClick);

        // 键盘事件处理
        const keyHandler = function(e) {
            // Escape键取消编辑
            if (e.key === 'Escape' && currentEditor) {
                console.log('[取消] 按下Escape键取消文本编辑');
                currentEditor.container.remove();
                currentEditor.controls.remove();
                currentEditor = null;
            }

            // Enter+Ctrl键应用文本
            if (e.key === 'Enter' && e.ctrlKey && currentEditor) {
                console.log('[应用] 按下Ctrl+Enter应用文本');
                applyText();
            }
        };
        document.addEventListener('keydown', keyHandler);

        // 存储清理函数
        overlay._textCleanup = function() {
            console.log('[清理] 文本工具事件监听器');
            overlay.removeEventListener('click', onClick);
            document.removeEventListener('keydown', keyHandler);

            if (currentEditor) {
                currentEditor.container.remove();
                currentEditor.controls.remove();
                currentEditor = null;
            }
        };

        console.log('[完成] 文本工具交互设置');
    }

    // 移除所有现有的事件监听器
    function removeExistingListeners() {
        // 获取工具栏容器
        const toolbarContainer = document.querySelector('.toolbar-container') || document.querySelector('.tools-container');
        if (toolbarContainer) {
            // 克隆并替换工具栏容器，移除所有事件监听器
            const newToolbar = toolbarContainer.cloneNode(true);
            toolbarContainer.parentNode.replaceChild(newToolbar, toolbarContainer);
            console.log('[清理] 已移除工具栏原有事件监听器');
        }

        // 移除单个按钮的事件监听器
        ['rectangle-tool', 'text-tool'].forEach(toolId => {
            const btn = document.getElementById(toolId);
            if (btn) {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                console.log(`[清理] 已移除 ${toolId} 的事件监听器`);
            }
        });
    }

    // 隐藏"功能开发中"提示
    function hideDevMessage() {
        // 查找所有包含"开发中"文本的元素
        const messages = document.evaluate(
            "//*[contains(text(), '开发中') or contains(text(), '尚未实现') or contains(text(), '正在开发')]",
            document,
            null,
            XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
            null
        );

        // 隐藏找到的元素
        for (let i = 0; i < messages.snapshotLength; i++) {
            const element = messages.snapshotItem(i);
            if (element.style) {
                element.style.display = 'none';
            }
            // 如果元素是文本节点的父节点，清空其内容
            if (element.childNodes.length === 1 && element.childNodes[0].nodeType === 3) {
                element.textContent = '';
            }
        }
    }

    // 重新绑定工具按钮
    function rebindToolButtons() {
        console.log('[绑定] 开始重新绑定工具按钮');

        // 绑定矩形工具
        const rectangleBtn = document.getElementById('rectangle-tool');
        if (rectangleBtn) {
            rectangleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[点击] 激活矩形工具');
                hideDevMessage();
                window.canvasTools.activateRectangleTool();
            });
            console.log('[绑定] 矩形工具按钮绑定成功');
        }

        // 绑定文字工具
        const textBtn = document.getElementById('text-tool');
        if (textBtn) {
            textBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[点击] 激活文字工具');
                hideDevMessage();
                window.canvasTools.activateTextTool();
            });
            console.log('[绑定] 文字工具按钮绑定成功');
        }
    }

    // 初始化工具
    function initializeTools() {
        console.log('[初始化] 开始初始化工具');

        // 移除现有事件监听器
        removeExistingListeners();

        // 隐藏开发中提示
        hideDevMessage();

        // 重新绑定按钮
        rebindToolButtons();

        // 覆盖原始函数
        window.activateRectangleTool = function() {
            console.log('[调用] 激活矩形工具');
            window.canvasTools.activateRectangleTool();
        };

        window.activateTextTool = function() {
            console.log('[调用] 激活文字工具');
            window.canvasTools.activateTextTool();
        };

        // 确保工具栏可见
        const toolbar = document.querySelector('.toolbar-container') || document.querySelector('.tools-container');
        if (toolbar) {
            toolbar.style.display = 'block';
        }

        console.log('[初始化] 工具初始化完成');
    }

    // 导出工具函数
    window.canvasTools = {
        activateRectangleTool: function() {
            activeToolName = 'rectangle';
            setupRectangleInteraction();
            if (typeof showMessage === 'function') {
                showMessage('矩形工具已激活 - 点击并拖动创建矩形');
            }
        },
        activateTextTool: function() {
            activeToolName = 'text';
            setupTextInteraction();
            if (typeof showMessage === 'function') {
                showMessage('文字工具已激活 - 点击添加文字');
            }
        },
        cleanup: clearToolEvents
    };

    // 确保在页面加载完成后执行初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTools);
    } else {
        initializeTools();
    }

    // 定期检查并隐藏开发中提示
    setInterval(hideDevMessage, 1000);

    // 定期检查并重新绑定按钮（以防其他脚本覆盖）
    setInterval(function() {
        const rectangleBtn = document.getElementById('rectangle-tool');
        const textBtn = document.getElementById('text-tool');

        if (rectangleBtn && !rectangleBtn._bound) {
            rebindToolButtons();
        }
    }, 2000);

    console.log('Canvas工具集加载完成');
})();