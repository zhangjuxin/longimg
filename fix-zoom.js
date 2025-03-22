// 修复滚轮缩放功能
(function() {
    console.log('加载缩放功能修复脚本');
    
    // 定义滚轮缩放支持函数
    window.addWheelZoomSupport = function(container, image) {
        if (!container || !image) {
            console.error('添加滚轮缩放失败: 容器或图片不存在');
            return;
        }
        
        console.log('添加鼠标滚轮缩放支持');
        
        // 移除之前的事件监听器（如果有）
        if (container._wheelHandler) {
            container.removeEventListener('wheel', container._wheelHandler);
        }
        
        // 创建新的事件处理函数
        container._wheelHandler = function(e) {
            // 仅在按住Ctrl键时进行缩放操作
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                
                // 获取当前缩放比例
                const currentScale = getCurrentScale(image);
                let newScale = currentScale;
                
                // 根据滚轮方向调整缩放比例
                if (e.deltaY < 0) {
                    // 向上滚动 - 放大
                    newScale = Math.min(currentScale + 0.1, 3);
                } else {
                    // 向下滚动 - 缩小
                    newScale = Math.max(currentScale - 0.1, 0.5);
                }
                
                // 应用新的缩放比例
                if (newScale !== currentScale) {
                    applyZoom(image, newScale);
                }
            }
        };
        
        // 添加事件监听器
        container.addEventListener('wheel', container._wheelHandler, { passive: false });
    };
    
    // 添加缺失的更新缩放指示器函数
    window.updateZoomIndicator = function(scale) {
        console.log('更新缩放指示器:', Math.round(scale * 100) + '%');
        
        // 查找或创建缩放指示器
        let zoomIndicator = document.getElementById('zoom-indicator');
        
        if (!zoomIndicator) {
            // 创建缩放指示器
            zoomIndicator = document.createElement('div');
            zoomIndicator.id = 'zoom-indicator';
            zoomIndicator.style.position = 'fixed';
            zoomIndicator.style.bottom = '20px';
            zoomIndicator.style.left = '50%';
            zoomIndicator.style.transform = 'translateX(-50%)';
            zoomIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            zoomIndicator.style.color = 'white';
            zoomIndicator.style.padding = '5px 10px';
            zoomIndicator.style.borderRadius = '4px';
            zoomIndicator.style.fontSize = '14px';
            zoomIndicator.style.zIndex = '1000';
            zoomIndicator.style.pointerEvents = 'none';
            document.body.appendChild(zoomIndicator);
        }
        
        // 更新缩放指示器内容
        zoomIndicator.textContent = `缩放: ${Math.round(scale * 100)}%`;
        zoomIndicator.style.display = 'block';
        
        // 3秒后自动隐藏
        clearTimeout(zoomIndicator._timer);
        zoomIndicator._timer = setTimeout(function() {
            zoomIndicator.style.display = 'none';
        }, 3000);
    };
    
    console.log('缩放功能修复脚本加载完成');
})();
