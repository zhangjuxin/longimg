// 性能优化脚本 - 提高图片编辑流畅度
(function() {
    console.log('加载性能优化脚本');
    
    // 全局变量和状态
    let lastTime = 0;
    let pendingRafUpdate = false;
    let lastAnimationFrame = null;
    
    // 事件节流函数 - 使用requestAnimationFrame控制更新频率
    window.throttleEvent = function(callback) {
        return function(e) {
            e.preventDefault();
            
            if (!pendingRafUpdate) {
                pendingRafUpdate = true;
                
                lastAnimationFrame = requestAnimationFrame(() => {
                    callback(e);
                    pendingRafUpdate = false;
                });
            }
        };
    };
    
    // 时间间隔节流函数 - 用于限制调用频率
    window.throttleByTime = function(callback, limit = 16) {
        return function(e) {
            const now = Date.now();
            
            if (now - lastTime >= limit) {
                lastTime = now;
                callback(e);
            }
        };
    };
    
    // 使用transform进行更高效的位置更新
    window.updateElementTransform = function(element, x, y) {
        if (!element) return;
        
        // 使用transform代替top/left，启用硬件加速
        element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        element.style.webkitTransform = `translate3d(${x}px, ${y}px, 0)`;
    };
    
    // 优化的拖动函数
    window.optimizedMakeElementDraggable = function(element, parent) {
        if (!element || !parent) return;
        
        // 给元素添加硬件加速提示
        element.style.willChange = 'transform';
        element.style.position = 'absolute';
        element.style.cursor = 'move';
        
        // 初始化元素位置为translate(0,0)
        const initialRect = element.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        
        // 保存初始位置
        const initialX = initialRect.left - parentRect.left;
        const initialY = initialRect.top - parentRect.top;
        
        // 保存当前变换
        element._transform = { x: initialX, y: initialY };
        
        // 应用初始变换
        updateElementTransform(element, initialX, initialY);
        
        // 标记拖动状态
        let isDragging = false;
        let startX, startY;
        
        // 拖动事件处理
        const onMouseDown = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (window.isResizing) return;
            
            // 标记全局拖动状态
            window.isDragging = true;
            isDragging = true;
            
            // 保存起始位置
            const rect = parent.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
            
            // 在document上监听事件，更可靠地捕获快速移动
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };
        
        // 优化的鼠标移动处理 - 使用requestAnimationFrame
        const onMouseMove = throttleEvent(function(e) {
            if (!isDragging) return;
            
            const rect = parent.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            
            // 计算偏移量
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            
            // 更新元素位置
            element._transform.x = initialX + deltaX;
            element._transform.y = initialY + deltaY;
            
            // 应用变换
            updateElementTransform(element, element._transform.x, element._transform.y);
        });
        
        // 鼠标释放处理
        const onMouseUp = function() {
            isDragging = false;
            window.isDragging = false;
            
            // 移除document上的事件监听器
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        // 添加事件监听器
        element.addEventListener('mousedown', onMouseDown);
        
        // 保存引用以便日后清理
        element._dragHandlers = {
            mousedown: onMouseDown,
            mousemove: onMouseMove,
            mouseup: onMouseUp
        };
        
        return element._dragHandlers;
    };
    
    // 优化的调整大小函数
    window.optimizedMakeHandleResizable = function(handle, element, handleClass, parent) {
        if (!handle || !element || !parent) return;
        
        // 添加硬件加速提示
        handle.style.willChange = 'transform';
        element.style.willChange = 'transform, width, height';
        
        // 初始化状态
        let isResizing = false;
        let startX, startY;
        let startWidth, startHeight;
        let startLeft, startTop;
        
        // 辅助函数 - 获取元素变换中的实际位置
        const getElementPosition = function() {
            return {
                x: element._transform ? element._transform.x : parseFloat(element.style.left) || 0,
                y: element._transform ? element._transform.y : parseFloat(element.style.top) || 0
            };
        };
        
        // 鼠标按下事件
        const onMouseDown = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 阻止同时拖动和调整大小
            if (window.isDragging) return;
            
            // 设置全局调整大小状态
            window.isResizing = true;
            isResizing = true;
            
            // 保存初始状态
            const rect = parent.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
            
            // 获取元素当前位置和尺寸
            const pos = getElementPosition();
            startLeft = pos.x;
            startTop = pos.y;
            startWidth = parseFloat(element.style.width) || element.offsetWidth;
            startHeight = parseFloat(element.style.height) || element.offsetHeight;
            
            // 在document上监听事件
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };
        
        // 优化的鼠标移动处理 - 使用requestAnimationFrame
        const onMouseMove = throttleEvent(function(e) {
            if (!isResizing) return;
            
            const rect = parent.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            
            // 计算偏移量
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            
            // 根据手柄类型调整元素
            if (handleClass === 'handle-se') {
                // 右下角 - 只调整宽度和高度
                element.style.width = (startWidth + deltaX) + 'px';
                element.style.height = (startHeight + deltaY) + 'px';
            } 
            else if (handleClass === 'handle-sw') {
                // 左下角 - 调整左边距、宽度和高度
                const newWidth = startWidth - deltaX;
                if (newWidth > 10) {
                    element.style.width = newWidth + 'px';
                    element._transform.x = startLeft + deltaX;
                    updateElementTransform(element, element._transform.x, element._transform.y);
                }
                element.style.height = (startHeight + deltaY) + 'px';
            } 
            else if (handleClass === 'handle-ne') {
                // 右上角 - 调整顶边距、宽度和高度
                element.style.width = (startWidth + deltaX) + 'px';
                const newHeight = startHeight - deltaY;
                if (newHeight > 10) {
                    element.style.height = newHeight + 'px';
                    element._transform.y = startTop + deltaY;
                    updateElementTransform(element, element._transform.x, element._transform.y);
                }
            } 
            else if (handleClass === 'handle-nw') {
                // 左上角 - 调整左边距、顶边距、宽度和高度
                const newWidth = startWidth - deltaX;
                const newHeight = startHeight - deltaY;
                if (newWidth > 10) {
                    element.style.width = newWidth + 'px';
                    element._transform.x = startLeft + deltaX;
                }
                if (newHeight > 10) {
                    element.style.height = newHeight + 'px';
                    element._transform.y = startTop + deltaY;
                }
                updateElementTransform(element, element._transform.x, element._transform.y);
            }
        });
        
        // 鼠标释放处理
        const onMouseUp = function() {
            isResizing = false;
            window.isResizing = false;
            
            // 移除document上的事件监听器
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        // 添加事件监听器
        handle.addEventListener('mousedown', onMouseDown);
        
        // 保存引用以便日后清理
        handle._resizeHandlers = {
            mousedown: onMouseDown,
            mousemove: onMouseMove,
            mouseup: onMouseUp
        };
        
        return handle._resizeHandlers;
    };
    
    // 优化的模糊区域创建函数 - 减少DOM操作
    // 维护一个模糊区块池，并在适当时机合并接近的区块
    let blurAreas = [];
    let lastBlurTime = 0;
    const MERGE_DISTANCE = 15; // 合并的距离阈值
    const BLUR_BATCH_INTERVAL = 100; // 合并区块的时间间隔
    
    window.optimizedCreateBlurArea = function(x, y, parent, size = 20) {
        if (!parent) return null;
        
        // 获取设置的模糊大小
        const blurSize = window.toolSettings?.mosaic?.blockSize || 10;
        
        // 添加到待处理队列
        blurAreas.push({x, y, size});
        
        // 检查是否应该进行合并
        const now = Date.now();
        if (now - lastBlurTime > BLUR_BATCH_INTERVAL) {
            processBlurAreas(parent, blurSize);
            lastBlurTime = now;
        }
    };
    
    // 处理和合并模糊区域
    function processBlurAreas(parent, blurSize) {
        if (blurAreas.length === 0) return;
        
        // 首先尝试合并接近的区域
        const mergedAreas = [];
        
        while (blurAreas.length > 0) {
            const area = blurAreas.shift();
            let merged = false;
            
            // 检查是否可以合并到现有区域
            for (let i = 0; i < mergedAreas.length; i++) {
                const existing = mergedAreas[i];
                const distance = Math.sqrt(
                    Math.pow(existing.x - area.x, 2) + 
                    Math.pow(existing.y - area.y, 2)
                );
                
                if (distance < MERGE_DISTANCE) {
                    // 扩展现有区域
                    const newX = Math.min(existing.x, area.x);
                    const newY = Math.min(existing.y, area.y);
                    const newRight = Math.max(existing.x + existing.width, area.x + area.size);
                    const newBottom = Math.max(existing.y + existing.height, area.y + area.size);
                    
                    existing.x = newX;
                    existing.y = newY;
                    existing.width = newRight - newX;
                    existing.height = newBottom - newY;
                    
                    merged = true;
                    break;
                }
            }
            
            // 如果不能合并，创建新区域
            if (!merged) {
                mergedAreas.push({
                    x: area.x,
                    y: area.y,
                    width: area.size,
                    height: area.size
                });
            }
        }
        
        // 现在创建实际的DOM元素
        mergedAreas.forEach(area => {
            createActualBlurArea(area.x, area.y, area.width, area.height, parent, blurSize);
        });
    }
    
    // 创建实际的模糊区域DOM元素
    function createActualBlurArea(x, y, width, height, parent, blurSize) {
        const area = document.createElement('div');
        area.className = 'blur-area';
        area.style.position = 'absolute';
        area.style.left = x + 'px';
        area.style.top = y + 'px';
        area.style.width = width + 'px';
        area.style.height = height + 'px';
        area.style.backdropFilter = `blur(${blurSize}px)`;
        area.style.webkitBackdropFilter = `blur(${blurSize}px)`;
        area.style.pointerEvents = 'none';
        
        // 启用硬件加速
        area.style.willChange = 'backdrop-filter';
        area.style.transform = 'translateZ(0)';
        
        parent.appendChild(area);
        return area;
    }
    
    // 清理模糊区域队列
    window.flushBlurAreas = function(parent, blurSize) {
        if (blurAreas.length > 0) {
            processBlurAreas(parent, blurSize);
            blurAreas = []; // 清空队列
        }
    };
    
    // 初始化性能监控
    let frameCounter = 0;
    let lastFpsTime = performance.now();
    let fps = 0;
    
    // 显示性能信息
    function updatePerformanceStats() {
        frameCounter++;
        const now = performance.now();
        const elapsed = now - lastFpsTime;
        
        if (elapsed >= 1000) {
            fps = Math.round((frameCounter * 1000) / elapsed);
            frameCounter = 0;
            lastFpsTime = now;
            
            // 创建或更新性能信息显示
            let perfIndicator = document.getElementById('perf-indicator');
            
            if (!perfIndicator) {
                perfIndicator = document.createElement('div');
                perfIndicator.id = 'perf-indicator';
                perfIndicator.style.position = 'fixed';
                perfIndicator.style.bottom = '50px';
                perfIndicator.style.right = '20px';
                perfIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                perfIndicator.style.color = 'white';
                perfIndicator.style.padding = '5px 10px';
                perfIndicator.style.borderRadius = '4px';
                perfIndicator.style.fontSize = '12px';
                perfIndicator.style.fontFamily = 'monospace';
                perfIndicator.style.zIndex = '9999';
                document.body.appendChild(perfIndicator);
            }
            
            // 获取内存使用情况（如果可用）
            let memoryInfo = '';
            if (window.performance && window.performance.memory) {
                const memory = window.performance.memory;
                const usedHeapSizeMB = Math.round(memory.usedJSHeapSize / (1024 * 1024));
                const totalHeapSizeMB = Math.round(memory.totalJSHeapSize / (1024 * 1024));
                memoryInfo = `内存: ${usedHeapSizeMB}MB / ${totalHeapSizeMB}MB`;
            }
            
            perfIndicator.textContent = `FPS: ${fps} ${memoryInfo}`;
            
            // 根据FPS设置颜色
            if (fps >= 45) {
                perfIndicator.style.color = '#7CFC00'; // 流畅 - 亮绿色
            } else if (fps >= 30) {
                perfIndicator.style.color = '#FFFF00'; // 尚可 - 黄色
            } else {
                perfIndicator.style.color = '#FF0000'; // 卡顿 - 红色
            }
        }
        
        requestAnimationFrame(updatePerformanceStats);
    }
    
    // 启动性能监控
    requestAnimationFrame(updatePerformanceStats);
    
    // 替换原始函数
    window.addEventListener('DOMContentLoaded', function() {
        // 保存原始函数的引用
        const originalCreateBlurArea = window.createBlurArea;
        const originalMakeElementDraggable = window.makeElementDraggable;
        const originalMakeHandleResizable = window.makeHandleResizable;
        
        // 替换为优化版本
        window.createBlurArea = window.optimizedCreateBlurArea;
        window.makeElementDraggable = window.optimizedMakeElementDraggable;
        window.makeHandleResizable = window.optimizedMakeHandleResizable;
        
        console.log('性能优化函数已替换原始函数');
    });
    
    // 全局状态追踪
    window.isDragging = false;
    window.isResizing = false;
    
    console.log('性能优化脚本加载完成');
})(); 