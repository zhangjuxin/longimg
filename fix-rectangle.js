// 矩形工具性能优化脚本
(function() {
    console.log('加载矩形工具性能优化脚本');

    // 保存原始的矩形拖动处理函数，以便后续修改
    window.origMakeElementDraggable = window.makeElementDraggable;
    window.origMakeHandleResizable = window.makeHandleResizable;

    // 优化的拖动处理函数
    window.optimizedMakeElementDraggable = function(element, parent) {
        if (!element || !parent) {
            console.warn('makeElementDraggable: 元素或父容器不存在');
            return;
        }

        // 使用transform代替top/left以提高性能
        element.style.transform = 'translate(0px, 0px)';
        
        let startX, startY, startLeft, startTop;
        let isDragging = false;
        
        // 防抖函数 - 限制事件处理频率
        let lastFrameTime = 0;
        const frameDelay = 1000 / 60; // 目标60fps
        
        const handleDragStart = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 获取初始位置
            const rect = element.getBoundingClientRect();
            const parentRect = parent.getBoundingClientRect();
            
            startX = e.clientX;
            startY = e.clientY;
            startLeft = rect.left - parentRect.left;
            startTop = rect.top - parentRect.top;
            
            isDragging = true;
            
            // 添加临时类，用于CSS调整
            element.classList.add('dragging');
            
            // 直接添加到document上，防止鼠标快速移动导致失去拖动
            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('mouseup', handleDragEnd);
            
            // 设置当前活动的拖动元素，避免多个元素同时拖动
            window.currentDraggingElement = element;
        };
        
        const handleDragMove = function(e) {
            if (!isDragging) return;
            
            // 使用requestAnimationFrame和时间限制提高性能
            const now = performance.now();
            if (now - lastFrameTime < frameDelay) return;
            lastFrameTime = now;
            
            // 计算新位置 - 用transform代替直接修改top/left
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            // 使用transform进行移动，性能更好
            element.style.transform = `translate(${dx}px, ${dy}px)`;
        };
        
        const handleDragEnd = function() {
            if (!isDragging) return;
            isDragging = false;
            
            // 移除临时类
            element.classList.remove('dragging');
            
            // 提交最终位置 - 转换transform到实际位置
            const transform = element.style.transform;
            const matches = transform.match(/translate\(([^,]+)px, ([^)]+)px\)/);
            
            if (matches && matches.length === 3) {
                const dx = parseFloat(matches[1]);
                const dy = parseFloat(matches[2]);
                
                // 更新实际位置
                element.style.left = (startLeft + dx) + 'px';
                element.style.top = (startTop + dy) + 'px';
                element.style.transform = 'translate(0px, 0px)';
            }
            
            // 移除临时事件监听器
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
            
            // 清除当前活动拖动元素
            window.currentDraggingElement = null;
        };
        
        // 添加鼠标事件监听器
        element.addEventListener('mousedown', handleDragStart);
        
        // 存储事件处理函数引用，便于后续清除
        element._handleDragStart = handleDragStart;
    };

    // 优化的调整大小处理函数
    window.optimizedMakeHandleResizable = function(handle, element, handleClass, parent) {
        if (!handle || !element || !parent) {
            console.warn('makeHandleResizable: 参数不完整');
            return;
        }
        
        let startX, startY, startWidth, startHeight, startLeft, startTop;
        let isResizing = false;
        
        // 防抖函数参数
        let lastFrameTime = 0;
        const frameDelay = 1000 / 60; // 目标60fps
        
        function onHandleDown(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 如果有其他元素正在拖动，不启动调整大小
            if (window.currentDraggingElement) return;
            
            const rect = element.getBoundingClientRect();
            
            startX = e.clientX;
            startY = e.clientY;
            startWidth = rect.width;
            startHeight = rect.height;
            startLeft = parseFloat(element.style.left);
            startTop = parseFloat(element.style.top);
            
            isResizing = true;
            
            // 添加临时类，用于CSS调整
            element.classList.add('resizing');
            
            // 直接监听document事件，防止鼠标快速移动导致失去控制
            document.addEventListener('mousemove', onDocumentMouseMove);
            document.addEventListener('mouseup', onDocumentMouseUp);
            
            // 设置当前活动的调整大小元素
            window.currentResizingElement = element;
        }
        
        function onDocumentMouseMove(e) {
            if (!isResizing) return;
            
            // 使用requestAnimationFrame和时间限制提高性能
            const now = performance.now();
            if (now - lastFrameTime < frameDelay) return;
            lastFrameTime = now;
            
            let newWidth, newHeight, newLeft, newTop;
            
            // 根据不同的调整柄计算新的尺寸和位置
            if (handleClass === 'nw-resize') {
                newWidth = startWidth - (e.clientX - startX);
                newHeight = startHeight - (e.clientY - startY);
                newLeft = startLeft + (e.clientX - startX);
                newTop = startTop + (e.clientY - startY);
                
                // 限制最小尺寸
                if (newWidth < 20) {
                    newWidth = 20;
                    newLeft = startLeft + startWidth - 20;
                }
                if (newHeight < 20) {
                    newHeight = 20;
                    newTop = startTop + startHeight - 20;
                }
            } else if (handleClass === 'ne-resize') {
                newWidth = startWidth + (e.clientX - startX);
                newHeight = startHeight - (e.clientY - startY);
                newLeft = startLeft;
                newTop = startTop + (e.clientY - startY);
                
                // 限制最小尺寸
                if (newWidth < 20) newWidth = 20;
                if (newHeight < 20) {
                    newHeight = 20;
                    newTop = startTop + startHeight - 20;
                }
            } else if (handleClass === 'sw-resize') {
                newWidth = startWidth - (e.clientX - startX);
                newHeight = startHeight + (e.clientY - startY);
                newLeft = startLeft + (e.clientX - startX);
                newTop = startTop;
                
                // 限制最小尺寸
                if (newWidth < 20) {
                    newWidth = 20;
                    newLeft = startLeft + startWidth - 20;
                }
                if (newHeight < 20) newHeight = 20;
            } else if (handleClass === 'se-resize') {
                newWidth = startWidth + (e.clientX - startX);
                newHeight = startHeight + (e.clientY - startY);
                newLeft = startLeft;
                newTop = startTop;
                
                // 限制最小尺寸
                if (newWidth < 20) newWidth = 20;
                if (newHeight < 20) newHeight = 20;
            }
            
            // 使用transform速度更快，避免频繁改变DOM布局
            element.style.transform = `translate(${newLeft - startLeft}px, ${newTop - startTop}px)`;
            element.style.width = newWidth + 'px';
            element.style.height = newHeight + 'px';
        }
        
        function onDocumentMouseUp() {
            if (!isResizing) return;
            
            // 移除临时类
            element.classList.remove('resizing');
            
            // 提交最终位置 - 转换transform到实际位置
            const transform = element.style.transform;
            if (transform && transform !== 'none') {
                const matches = transform.match(/translate\(([^,]+)px, ([^)]+)px\)/);
                
                if (matches && matches.length === 3) {
                    const dx = parseFloat(matches[1]);
                    const dy = parseFloat(matches[2]);
                    
                    // 更新实际位置
                    element.style.left = (startLeft + dx) + 'px';
                    element.style.top = (startTop + dy) + 'px';
                    element.style.transform = '';
                }
            }
            
            isResizing = false;
            
            // 移除临时事件监听器
            document.removeEventListener('mousemove', onDocumentMouseMove);
            document.removeEventListener('mouseup', onDocumentMouseUp);
            
            // 清除当前活动调整大小元素
            window.currentResizingElement = null;
        }
        
        // 添加鼠标事件监听器
        handle.addEventListener('mousedown', onHandleDown);
        
        // 存储事件处理函数引用，便于后续清除
        handle._handleDown = onHandleDown;
    };

    // 劫持原始函数，替换为优化版本
    const origActivateRectangleTool = window.activateRectangleTool;
    if (origActivateRectangleTool) {
        window.activateRectangleTool = function(imageElement) {
            // 替换拖动和调整大小函数
            const origMakeElementDraggable = window.makeElementDraggable;
            const origMakeHandleResizable = window.makeHandleResizable;
            
            window.makeElementDraggable = window.optimizedMakeElementDraggable;
            window.makeHandleResizable = window.optimizedMakeHandleResizable;
            
            // 调用原始函数
            origActivateRectangleTool(imageElement);
            
            // 还原原始函数
            window.makeElementDraggable = origMakeElementDraggable;
            window.makeHandleResizable = origMakeHandleResizable;
        };
    }

    // 添加CSS样式优化
    const style = document.createElement('style');
    style.textContent = `
        .rectangle-annotation {
            will-change: transform, width, height;
            transition: border-color 0.3s ease;
        }
        .dragging, .resizing {
            cursor: grabbing !important;
            opacity: 0.9;
            z-index: 100 !important;
        }
        .resize-handle {
            will-change: transform;
            background-color: white;
            border: 1px solid rgba(0,0,0,0.3);
            width: 10px;
            height: 10px;
        }
    `;
    document.head.appendChild(style);

    console.log('矩形工具性能优化脚本加载完成');
})(); 