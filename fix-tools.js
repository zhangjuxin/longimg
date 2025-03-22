// 修复工具设置面板功能
(function() {
    console.log('加载工具设置面板修复脚本');
    
    // 初始化工具设置对象
    if (!window.toolSettings) {
        window.toolSettings = {
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
    }
    
    // 检查工具设置面板是否存在
    window.showToolSettings = function(toolType) {
        console.log('显示工具设置面板:', toolType);
        
        // 查找或创建工具设置面板
        let toolSettingsPanel = document.getElementById('tool-settings-panel');
        
        if (!toolSettingsPanel) {
            // 创建工具设置面板
            toolSettingsPanel = document.createElement('div');
            toolSettingsPanel.id = 'tool-settings-panel';
            toolSettingsPanel.className = 'tool-settings-panel';
            toolSettingsPanel.style.position = 'absolute';
            toolSettingsPanel.style.top = '60px';
            toolSettingsPanel.style.right = '20px';
            toolSettingsPanel.style.width = '250px';
            toolSettingsPanel.style.padding = '15px';
            toolSettingsPanel.style.backgroundColor = 'white';
            toolSettingsPanel.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
            toolSettingsPanel.style.borderRadius = '8px';
            toolSettingsPanel.style.zIndex = '1000';
            toolSettingsPanel.style.display = 'none';
            
            // 添加到页面
            document.body.appendChild(toolSettingsPanel);
            
            console.log('已创建工具设置面板');
        } else {
            // 清空现有面板内容
            toolSettingsPanel.innerHTML = '';
        }
        
        // 根据工具类型填充设置选项
        let settingsContent = '';
        
        if (toolType === 'rectangle') {
            settingsContent = `
                <h3>红框设置</h3>
                <div class="setting-group">
                    <label>边框宽度:</label>
                    <input type="range" id="rectangleBorderWidth" min="1" max="10" value="${toolSettings.rectangle.borderWidth}">
                    <span id="rectangleBorderWidthValue">${toolSettings.rectangle.borderWidth}px</span>
                </div>
                <div class="setting-group">
                    <label>边框颜色:</label>
                    <input type="color" id="rectangleBorderColor" value="${toolSettings.rectangle.borderColor}">
                </div>
            `;
        } else if (toolType === 'mosaic') {
            settingsContent = `
                <h3>模糊设置</h3>
                <div class="setting-group">
                    <label>模糊强度:</label>
                    <input type="range" id="mosaicBlockSize" min="5" max="30" value="${toolSettings.mosaic.blockSize}">
                    <span id="mosaicBlockSizeValue">${toolSettings.mosaic.blockSize}px</span>
                </div>
                <div class="setting-group">
                    <label>笔刷大小:</label>
                    <input type="range" id="mosaicBrushSize" min="10" max="100" value="${toolSettings.mosaic.brushSize}">
                    <span id="mosaicBrushSizeValue">${toolSettings.mosaic.brushSize}px</span>
                </div>
            `;
        } else if (toolType === 'text') {
            settingsContent = `
                <h3>文字设置</h3>
                <div class="setting-group">
                    <label>字体:</label>
                    <select id="textFontFamily">
                        <option value="Arial" ${toolSettings.text.fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
                        <option value="Verdana" ${toolSettings.text.fontFamily === 'Verdana' ? 'selected' : ''}>Verdana</option>
                        <option value="Times New Roman" ${toolSettings.text.fontFamily === 'Times New Roman' ? 'selected' : ''}>Times New Roman</option>
                        <option value="Courier New" ${toolSettings.text.fontFamily === 'Courier New' ? 'selected' : ''}>Courier New</option>
                        <option value="SimSun" ${toolSettings.text.fontFamily === 'SimSun' ? 'selected' : ''}>宋体</option>
                        <option value="Microsoft YaHei" ${toolSettings.text.fontFamily === 'Microsoft YaHei' ? 'selected' : ''}>微软雅黑</option>
                    </select>
                </div>
                <div class="setting-group">
                    <label>字体大小:</label>
                    <input type="range" id="textFontSize" min="10" max="72" value="${toolSettings.text.fontSize}">
                    <span id="textFontSizeValue">${toolSettings.text.fontSize}px</span>
                </div>
                <div class="setting-group">
                    <label>文字颜色:</label>
                    <input type="color" id="textColor" value="${toolSettings.text.textColor}">
                </div>
                <div class="setting-group">
                    <label>背景颜色:</label>
                    <input type="color" id="textBackgroundColor" value="#ffffff">
                    <input type="range" id="textBgOpacity" min="0" max="100" value="80">
                    <span id="textBgOpacityValue">80%</span>
                </div>
                <div class="setting-group">
                    <label>文字样式:</label>
                    <label class="checkbox">
                        <input type="checkbox" id="textBold" ${toolSettings.text.isBold ? 'checked' : ''}>
                        粗体
                    </label>
                    <label class="checkbox">
                        <input type="checkbox" id="textItalic" ${toolSettings.text.isItalic ? 'checked' : ''}>
                        斜体
                    </label>
                </div>
            `;
        }
        

        
        // 显示面板
        toolSettingsPanel.style.display = 'block';
        
        // 关闭按钮事件
        const closeBtn = document.getElementById('close-settings');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                toolSettingsPanel.style.display = 'none';
            });
        }
        
        // 添加事件监听
        if (toolType === 'rectangle') {
            // 矩形边框宽度
            const borderWidthInput = document.getElementById('rectangleBorderWidth');
            const borderWidthValue = document.getElementById('rectangleBorderWidthValue');
            if (borderWidthInput && borderWidthValue) {
                borderWidthInput.addEventListener('input', function() {
                    const value = parseInt(this.value);
                    borderWidthValue.textContent = `${value}px`;
                    toolSettings.rectangle.borderWidth = value;
                });
            }
            
            // 矩形边框颜色
            const borderColorInput = document.getElementById('rectangleBorderColor');
            if (borderColorInput) {
                borderColorInput.addEventListener('input', function() {
                    toolSettings.rectangle.borderColor = this.value;
                });
            }
        } else if (toolType === 'mosaic') {
            // 马赛克块大小
            const blockSizeInput = document.getElementById('mosaicBlockSize');
            const blockSizeValue = document.getElementById('mosaicBlockSizeValue');
            if (blockSizeInput && blockSizeValue) {
                blockSizeInput.addEventListener('input', function() {
                    const value = parseInt(this.value);
                    blockSizeValue.textContent = `${value}px`;
                    toolSettings.mosaic.blockSize = value;
                    
                    // 更新所有现有的模糊区域
                    const blurAreas = document.querySelectorAll('.blur-area');
                    blurAreas.forEach(area => {
                        area.style.backdropFilter = `blur(${value}px)`;
                        area.style.webkitBackdropFilter = `blur(${value}px)`;
                    });
                });
            }
            
            // 马赛克笔刷大小
            const brushSizeInput = document.getElementById('mosaicBrushSize');
            const brushSizeValue = document.getElementById('mosaicBrushSizeValue');
            if (brushSizeInput && brushSizeValue) {
                brushSizeInput.addEventListener('input', function() {
                    const value = parseInt(this.value);
                    brushSizeValue.textContent = `${value}px`;
                    toolSettings.mosaic.brushSize = value;
                });
            }
        } else if (toolType === 'text') {
            // 字体
            const fontFamilySelect = document.getElementById('textFontFamily');
            if (fontFamilySelect) {
                fontFamilySelect.addEventListener('change', function() {
                    toolSettings.text.fontFamily = this.value;
                });
            }
            
            // 字体大小
            const fontSizeInput = document.getElementById('textFontSize');
            const fontSizeValue = document.getElementById('textFontSizeValue');
            if (fontSizeInput && fontSizeValue) {
                fontSizeInput.addEventListener('input', function() {
                    const value = parseInt(this.value);
                    fontSizeValue.textContent = `${value}px`;
                    toolSettings.text.fontSize = value;
                });
            }
            
            // 文字颜色
            const textColorInput = document.getElementById('textColor');
            if (textColorInput) {
                textColorInput.addEventListener('input', function() {
                    toolSettings.text.textColor = this.value;
                });
            }
            
            // 背景颜色和透明度
            const bgColorInput = document.getElementById('textBackgroundColor');
            const bgOpacityInput = document.getElementById('textBgOpacity');
            const bgOpacityValue = document.getElementById('textBgOpacityValue');
            
            if (bgColorInput && bgOpacityInput && bgOpacityValue) {
                const updateBgColor = function() {
                    const color = bgColorInput.value;
                    const opacity = parseInt(bgOpacityInput.value) / 100;
                    // 将HEX转换为RGB，然后添加透明度
                    const r = parseInt(color.slice(1, 3), 16);
                    const g = parseInt(color.slice(3, 5), 16);
                    const b = parseInt(color.slice(5, 7), 16);
                    toolSettings.text.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                };
                
                bgColorInput.addEventListener('input', updateBgColor);
                bgOpacityInput.addEventListener('input', function() {
                    bgOpacityValue.textContent = `${this.value}%`;
                    updateBgColor();
                });
                
                updateBgColor();
            }
            
            // 粗体
            const boldCheckbox = document.getElementById('textBold');
            if (boldCheckbox) {
                boldCheckbox.addEventListener('change', function() {
                    toolSettings.text.isBold = this.checked;
                });
            }
            
            // 斜体
            const italicCheckbox = document.getElementById('textItalic');
            if (italicCheckbox) {
                italicCheckbox.addEventListener('change', function() {
                    toolSettings.text.isItalic = this.checked;
                });
            }
        }
    };
    
    console.log('工具设置面板修复脚本加载完成');
})(); 