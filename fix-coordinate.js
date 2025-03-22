// 修复编辑工具坐标计算问题
(function() {
    console.log('加载编辑工具坐标修复脚本');

    // 定义获取鼠标坐标的通用函数
    window.getMousePosition = function(e, parent) {
        if (!parent) {
            console.error('缺少父元素参数');
            return {
                x: 0,
                y: 0
            };
        }

        const rect = parent.getBoundingClientRect();
        const scrollLeft = parent.scrollLeft || 0;
        const scrollTop = parent.scrollTop || 0;

        // 计算实际位置，考虑滚动和缩放
        const canvasContainer = document.getElementById('canvas-container');
        const containerScrollTop = canvasContainer ? canvasContainer.scrollTop : 0;
        const containerScrollLeft = canvasContainer ? canvasContainer.scrollLeft : 0;

        const x = e.clientX - rect.left + containerScrollLeft;
        const y = e.clientY - rect.top + containerScrollTop;

        // 调试信息
        console.log('鼠标坐标信息:', {
            clientX: e.clientX,
            clientY: e.clientY,
            rectTop: rect.top,
            rectLeft: rect.left,
            scrollTop: scrollTop,
            scrollLeft: scrollLeft,
            containerScrollTop: containerScrollTop,
            containerScrollLeft: containerScrollLeft,
            finalX: x,
            finalY: y
        });

        return {
            x,
            y
        };
    };

    // 修复绘图覆盖层的初始化
    window.fixDrawingOverlay = function() {
        console.log('检查和修复绘图覆盖层');

        const imageContainer = document.getElementById('image-container');
        if (!imageContainer) {
            console.error('找不到图片容器');
            return false;
        }

        // 检查是否已有绘图覆盖层
        let overlay = imageContainer.querySelector('.drawing-overlay');

        if (!overlay) {
            console.log('创建新的绘图覆盖层');
            overlay = document.createElement('div');
            overlay.className = 'drawing-overlay';
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.pointerEvents = 'auto'; // 关键 - 确保可以接收鼠标事件
            overlay.style.zIndex = '10'; // 确保在图片上层
            imageContainer.appendChild(overlay);

            console.log('绘图覆盖层创建完成');
        } else {
            console.log('已存在绘图覆盖层，更新设置');
            overlay.style.pointerEvents = 'auto';
            overlay.style.zIndex = '10';
        }

        return true;
    };

    // 移植修复后的矩形工具激活函数
    const originalActivateRectangleTool = window.activateRectangleTool;

    window.activateRectangleTool = function(imageElement) {
        console.log('使用修复后的矩形工具');

        // 先尝试修复绘图覆盖层
        const fixed = window.fixDrawingOverlay();
        if (!fixed) {
            console.error('无法修复绘图覆盖层');
            return;
        }

        // 如果存在原始函数，则调用它
        if (typeof originalActivateRectangleTool === 'function') {
            return originalActivateRectangleTool(imageElement);
        }
    };

    // 移植修复后的马赛克工具激活函数
    const originalActivateMosaicTool = window.activateMosaicTool;

    window.activateMosaicTool = function(imageElement) {
        console.log('使用修复后的马赛克工具');

        // 先尝试修复绘图覆盖层
        const fixed = window.fixDrawingOverlay();
        if (!fixed) {
            console.error('无法修复绘图覆盖层');
            return;
        }

        // 如果存在原始函数，则调用它
        if (typeof originalActivateMosaicTool === 'function') {
            return originalActivateMosaicTool(imageElement);
        }
    };

    // 移植修复后的文字工具激活函数
    const originalActivateTextTool = window.activateTextTool;

    window.activateTextTool = function(imageElement) {
        console.log('使用修复后的文字工具');

        // 先尝试修复绘图覆盖层
        const fixed = window.fixDrawingOverlay();
        if (!fixed) {
            console.error('无法修复绘图覆盖层');
            return;
        }

        // 如果存在原始函数，则调用它
        if (typeof originalActivateTextTool === 'function') {
            return originalActivateTextTool(imageElement);
        }
    };

    // 在图片加载完成后自动修复覆盖层
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                const displayedImage = document.getElementById('displayed-image');
                if (displayedImage) {
                    console.log('检测到图片加载，自动修复覆盖层');
                    setTimeout(window.fixDrawingOverlay, 500);
                }
            }
        });
    });

    // 开始观察DOM变化
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log('编辑工具坐标修复脚本加载完成');
})();