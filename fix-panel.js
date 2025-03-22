// 修复工具设置面板初始化问题
(function() {
    console.log('加载工具设置面板初始化修复脚本');
    
    // 确保全局变量存在
    window.currentScale = window.currentScale || 1;
    window.toolSettings = window.toolSettings || {
        rectangle: { borderWidth: 3, borderColor: '#ff0000' },
        mosaic: { blockSize: 10, brushSize: 20 },
        text: { 
            fontFamily: 'Arial', 
            fontSize: 16, 
            textColor: '#000000', 
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            isBold: false,
            isItalic: false
        }
    };
    
    // 添加缺失的设置事件监听器函数
    window.addSettingsEventListeners = function() {
        console.log('添加工具设置事件监听器');
        
        // 矩形工具设置
        const rectangleBorderWidth = document.getElementById('rectangleBorderWidth');
        const rectangleBorderWidthValue = document.getElementById('rectangleBorderWidthValue');
        const rectangleBorderColor = document.getElementById('rectangleBorderColor');
        
        if (rectangleBorderWidth && rectangleBorderWidthValue) {
            rectangleBorderWidth.addEventListener('input', function() {
                const value = parseInt(this.value);
                rectangleBorderWidthValue.textContent = `${value}px`;
                
                if (window.toolSettings && window.toolSettings.rectangle) {
                    window.toolSettings.rectangle.borderWidth = value;
                }
            });
        }
        
        if (rectangleBorderColor) {
            rectangleBorderColor.addEventListener('input', function() {
                if (window.toolSettings && window.toolSettings.rectangle) {
                    window.toolSettings.rectangle.borderColor = this.value;
                }
            });
        }
        
        // 马赛克/模糊工具设置
        const mosaicBlockSize = document.getElementById('mosaicBlockSize');
        const mosaicBlockSizeValue = document.getElementById('mosaicBlockSizeValue');
        const mosaicBrushSize = document.getElementById('mosaicBrushSize');
        const mosaicBrushSizeValue = document.getElementById('mosaicBrushSizeValue');
        
        if (mosaicBlockSize && mosaicBlockSizeValue) {
            mosaicBlockSize.addEventListener('input', function() {
                const value = parseInt(this.value);
                mosaicBlockSizeValue.textContent = `${value}px`;
                
                if (window.toolSettings && window.toolSettings.mosaic) {
                    window.toolSettings.mosaic.blockSize = value;
                    
                    // 更新所有现有的模糊区域
                    const blurAreas = document.querySelectorAll('.blur-area');
                    blurAreas.forEach(area => {
                        area.style.backdropFilter = `blur(${value}px)`;
                        area.style.webkitBackdropFilter = `blur(${value}px)`;
                    });
                }
            });
        }
        
        if (mosaicBrushSize && mosaicBrushSizeValue) {
            mosaicBrushSize.addEventListener('input', function() {
                const value = parseInt(this.value);
                mosaicBrushSizeValue.textContent = `${value}px`;
                
                if (window.toolSettings && window.toolSettings.mosaic) {
                    window.toolSettings.mosaic.brushSize = value;
                }
            });
        }
        
        // 文字工具设置
        const textFontFamily = document.getElementById('textFontFamily');
        const textFontSize = document.getElementById('textFontSize');
        const textFontSizeValue = document.getElementById('textFontSizeValue');
        const textColor = document.getElementById('textColor');
        const textBackgroundColor = document.getElementById('textBackgroundColor');
        const textBgOpacity = document.getElementById('textBgOpacity');
        const textBgOpacityValue = document.getElementById('textBgOpacityValue');
        const textBold = document.getElementById('textBold');
        const textItalic = document.getElementById('textItalic');
        
        if (textFontFamily) {
            textFontFamily.addEventListener('change', function() {
                if (window.toolSettings && window.toolSettings.text) {
                    window.toolSettings.text.fontFamily = this.value;
                }
            });
        }
        
        if (textFontSize && textFontSizeValue) {
            textFontSize.addEventListener('input', function() {
                const value = parseInt(this.value);
                textFontSizeValue.textContent = `${value}px`;
                
                if (window.toolSettings && window.toolSettings.text) {
                    window.toolSettings.text.fontSize = value;
                }
            });
        }
        
        if (textColor) {
            textColor.addEventListener('input', function() {
                if (window.toolSettings && window.toolSettings.text) {
                    window.toolSettings.text.textColor = this.value;
                }
            });
        }
        
        // 文字背景颜色与透明度
        if (textBackgroundColor && textBgOpacity && textBgOpacityValue) {
            const updateBgColor = function() {
                if (!window.toolSettings || !window.toolSettings.text) return;
                
                const color = textBackgroundColor.value;
                const opacity = parseInt(textBgOpacity.value) / 100;
                
                // 将HEX转换为RGB，然后添加透明度
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                window.toolSettings.text.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            };
            
            textBackgroundColor.addEventListener('input', updateBgColor);
            textBgOpacity.addEventListener('input', function() {
                textBgOpacityValue.textContent = `${this.value}%`;
                updateBgColor();
            });
        }
        
        if (textBold) {
            textBold.addEventListener('change', function() {
                if (window.toolSettings && window.toolSettings.text) {
                    window.toolSettings.text.isBold = this.checked;
                }
            });
        }
        
        if (textItalic) {
            textItalic.addEventListener('change', function() {
                if (window.toolSettings && window.toolSettings.text) {
                    window.toolSettings.text.isItalic = this.checked;
                }
            });
        }
        
        console.log('工具设置事件监听器添加完成');
    };
    
    // 添加一个辅助函数用于显示错误
    window.showError = window.showError || function(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // 3秒后隐藏错误消息
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 3000);
        } else {
            console.error('错误:', message);
        }
    };
    
    console.log('工具设置面板初始化修复脚本加载完成');
})(); 