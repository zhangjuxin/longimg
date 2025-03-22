/**
 * 修复图片下载功能，确保虚化区域和文本正确显示
 */

// 重写下载图片函数
function downloadImage() {
    try {
        console.log('开始生成下载图片');

        // 获取图片元素和覆盖层
        const imageContainer = document.querySelector('#image-container');
        if (!imageContainer) {
            console.error('找不到图片容器');
            showError('找不到图片，无法生成下载');
            return;
        }

        // 获取图片元素
        const imgElement = imageContainer.querySelector('img');
        if (!imgElement) {
            console.error('找不到图片元素');
            showError('找不到图片元素，无法生成下载');
            return;
        }

        // 获取绘图覆盖层
        const overlay = imageContainer.querySelector('.drawing-overlay');
        if (!overlay) {
            console.error('找不到绘图覆盖层');
            showError('找不到绘图覆盖层，无法获取编辑内容');
            return;
        }

        // 获取图片原始尺寸
        const naturalWidth = imgElement.naturalWidth;
        const naturalHeight = imgElement.naturalHeight;

        console.log('图片原始尺寸', {
            naturalWidth,
            naturalHeight
        });

        // 获取当前图片显示尺寸和位置
        const imageRect = imgElement.getBoundingClientRect();
        const containerRect = imageContainer.getBoundingClientRect();

        // 获取当前缩放比例
        const transformValue = imgElement.style.transform;
        let currentScale = 1;
        const scaleMatch = transformValue.match(/scale\(([0-9.]+)\)/);
        if (scaleMatch) {
            currentScale = parseFloat(scaleMatch[1]);
        }

        console.log('当前缩放比例', currentScale);

        // 创建Canvas来合成最终图片
        const canvas = document.createElement('canvas');
        canvas.width = naturalWidth;
        canvas.height = naturalHeight;
        const ctx = canvas.getContext('2d');

        // 清空Canvas并设置为白色背景（如果需要）
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制原始图片
        ctx.drawImage(imgElement, 0, 0, naturalWidth, naturalHeight);

        // 计算偏移量，处理当图片被居中显示时的情况
        const offsetX = (containerRect.width - imageRect.width) / 2;
        const offsetY = (containerRect.height - imageRect.height) / 2;

        console.log('绘制原始图片完成，开始处理标注');

        // 处理所有标注元素，按类型分别处理

        // 1. 处理矩形框
        console.log('开始处理矩形标注...');
        const rectangles = overlay.querySelectorAll('.rectangle-annotation');
        console.log(`找到 ${rectangles.length} 个矩形框`);

        rectangles.forEach(rect => {
            try {
                // 获取样式和位置
                const style = window.getComputedStyle(rect);
                const rect_rect = rect.getBoundingClientRect();

                // 计算相对于图片的坐标
                const x = (rect_rect.left - containerRect.left - offsetX) / currentScale;
                const y = (rect_rect.top - containerRect.top - offsetY) / currentScale;
                const width = rect_rect.width / currentScale;
                const height = rect_rect.height / currentScale;

                // 转换为画布上的坐标
                const canvasX = Math.max(0, Math.round(x * naturalWidth / imageRect.width));
                const canvasY = Math.max(0, Math.round(y * naturalHeight / imageRect.height));
                const canvasWidth = Math.min(naturalWidth - canvasX, Math.round(width * naturalWidth / imageRect.width));
                const canvasHeight = Math.min(naturalHeight - canvasY, Math.round(height * naturalHeight / imageRect.height));

                console.log('矩形框坐标', {
                    canvasX,
                    canvasY,
                    canvasWidth,
                    canvasHeight
                });

                // 检查坐标有效性
                if (canvasWidth <= 0 || canvasHeight <= 0) {
                    console.warn('矩形框尺寸无效，跳过绘制');
                    return;
                }

                // 从边框样式提取颜色和宽度
                const borderColor = style.borderColor || '#ff0000';
                let borderWidth = parseInt(style.borderWidth) || 3;

                // 根据实际图片大小调整边框宽度
                const scaleFactor = Math.max(naturalWidth / imageRect.width, naturalHeight / imageRect.height);
                borderWidth = Math.max(1, Math.round(borderWidth * scaleFactor));

                // 绘制矩形边框
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = borderWidth;
                ctx.strokeRect(canvasX, canvasY, canvasWidth, canvasHeight);

                console.log('矩形框绘制完成');
            } catch (err) {
                console.error('处理矩形框时出错', err);
            }
        });

        // 2. 处理马赛克区域
        console.log('开始处理马赛克区域...');

        // 检查是否使用Canvas版本的马赛克
        if (window._hasMosaicCanvas && typeof window.getMosaicImageData === 'function') {
            try {
                console.log('使用Canvas版本的马赛克处理...');
                const mosaicCanvas = window.getMosaicImageData();
                if (mosaicCanvas && mosaicCanvas instanceof HTMLCanvasElement) {
                    // 获取马赛克Canvas的上下文
                    const mosaicCtx = mosaicCanvas.getContext('2d');

                    // 获取图片和马赛克Canvas的尺寸比例
                    const widthRatio = naturalWidth / imageRect.width;
                    const heightRatio = naturalHeight / imageRect.height;

                    // 获取马赛克Canvas中的图像数据
                    const mosaicData = mosaicCtx.getImageData(0, 0, mosaicCanvas.width, mosaicCanvas.height);

                    // 检查像素数据是否有非透明像素
                    let hasNonTransparentPixels = false;
                    for (let i = 3; i < mosaicData.data.length; i += 4) {
                        if (mosaicData.data[i] > 0) {
                            hasNonTransparentPixels = true;
                            break;
                        }
                    }

                    if (hasNonTransparentPixels) {
                        // 计算Canvas马赛克在原始图片上的实际位置和大小
                        const canvasX = 0;
                        const canvasY = 0;
                        const canvasWidth = naturalWidth;
                        const canvasHeight = naturalHeight;

                        console.log('Canvas马赛克尺寸信息:', {
                            mosaicCanvasWidth: mosaicCanvas.width,
                            mosaicCanvasHeight: mosaicCanvas.height,
                            targetWidth: canvasWidth,
                            targetHeight: canvasHeight
                        });

                        // 创建临时canvas以保持虚化效果
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = mosaicCanvas.width;
                        tempCanvas.height = mosaicCanvas.height;
                        const tempCtx = tempCanvas.getContext('2d');
                        
                        // 复制原始马赛克canvas内容
                        tempCtx.drawImage(mosaicCanvas, 0, 0);
                        
                        // 确保以下设置能够保留模糊效果
                        ctx.globalCompositeOperation = 'source-over';
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';

                        // 绘制马赛克Canvas到最终Canvas上
                        ctx.drawImage(
                            tempCanvas,
                            0, 0, mosaicCanvas.width, mosaicCanvas.height,
                            canvasX, canvasY, canvasWidth, canvasHeight
                        );

                        // 恢复默认设置
                        ctx.globalCompositeOperation = 'source-over';

                        console.log('Canvas马赛克已合并到最终图片');
                    } else {
                        console.log('马赛克Canvas中没有非透明像素，跳过合并');
                    }
                } else {
                    console.warn('未找到有效的马赛克Canvas');
                }
            } catch (e) {
                console.error('处理Canvas马赛克时出错', e);
            }
        } else {
            // 传统DOM元素马赛克处理（模糊区域）
            console.log('使用传统马赛克处理方式...');
            // 更精确的选择器，确保能找到所有虚化区域
            const blurAreas = overlay.querySelectorAll('.blur-area, .mosaic-area-container');
            console.log(`找到 ${blurAreas.length} 个虚化区域`);

            blurAreas.forEach(blurArea => {
                try {
                    // 获取位置和尺寸
                    const rect = blurArea.getBoundingClientRect();

                    // 计算相对于图片的坐标
                    const x = (rect.left - containerRect.left - offsetX) / currentScale;
                    const y = (rect.top - containerRect.top - offsetY) / currentScale;
                    const width = rect.width / currentScale;
                    const height = rect.height / currentScale;

                    // 转换为画布上的坐标
                    const canvasX = Math.max(0, Math.round(x * naturalWidth / imageRect.width));
                    const canvasY = Math.max(0, Math.round(y * naturalHeight / imageRect.height));
                    const canvasWidth = Math.min(naturalWidth - canvasX, Math.round(width * naturalWidth / imageRect.width));
                    const canvasHeight = Math.min(naturalHeight - canvasY, Math.round(height * naturalHeight / imageRect.height));

                    console.log('虚化区域坐标', {
                        canvasX,
                        canvasY,
                        canvasWidth,
                        canvasHeight
                    });

                    // 检查坐标有效性
                    if (canvasWidth <= 0 || canvasHeight <= 0) {
                        console.warn('虚化区域尺寸无效，跳过处理');
                        return;
                    }

                    // 从虚化区域的样式中获取块大小
                    const computedStyle = window.getComputedStyle(blurArea);
                    let blurIntensity = toolSettings.mosaic.blockSize;

                    // 尝试从backdropFilter中提取blur值
                    const backdropFilterStyle = computedStyle.backdropFilter || computedStyle.webkitBackdropFilter || '';
                    const blurMatch = backdropFilterStyle.match(/blur\((\d+)px\)/);
                    if (blurMatch && blurMatch[1]) {
                        blurIntensity = parseInt(blurMatch[1]);
                    }

                    console.log('应用虚化效果', {
                        blurIntensity
                    });

                    try {
                        // 获取该区域的图像数据
                        const imageData = ctx.getImageData(canvasX, canvasY, canvasWidth, canvasHeight);
                        const pixelData = imageData.data;

                        // 马赛克块大小，根据虚化强度调整
                        const blockSize = Math.max(2, Math.min(20, blurIntensity));

                        // 处理每个像素块
                        for (let blockY = 0; blockY < canvasHeight; blockY += blockSize) {
                            for (let blockX = 0; blockX < canvasWidth; blockX += blockSize) {
                                // 计算块的实际大小
                                const bw = Math.min(blockSize, canvasWidth - blockX);
                                const bh = Math.min(blockSize, canvasHeight - blockY);

                                if (bw <= 0 || bh <= 0) continue;

                                // 收集块中所有像素的平均颜色
                                let r = 0,
                                    g = 0,
                                    b = 0,
                                    a = 0,
                                    count = 0;

                                for (let dy = 0; dy < bh; dy++) {
                                    for (let dx = 0; dx < bw; dx++) {
                                        const index = ((blockY + dy) * canvasWidth + (blockX + dx)) * 4;
                                        if (index >= 0 && index < pixelData.length - 3) {
                                            r += pixelData[index];
                                            g += pixelData[index + 1];
                                            b += pixelData[index + 2];
                                            a += pixelData[index + 3];
                                            count++;
                                        }
                                    }
                                }

                                if (count > 0) {
                                    // 计算平均颜色
                                    r = Math.floor(r / count);
                                    g = Math.floor(g / count);
                                    b = Math.floor(b / count);
                                    a = Math.floor(a / count);

                                    // 用平均颜色填充整个块
                                    for (let dy = 0; dy < bh; dy++) {
                                        for (let dx = 0; dx < bw; dx++) {
                                            const index = ((blockY + dy) * canvasWidth + (blockX + dx)) * 4;
                                            if (index >= 0 && index < pixelData.length - 3) {
                                                pixelData[index] = r;
                                                pixelData[index + 1] = g;
                                                pixelData[index + 2] = b;
                                                pixelData[index + 3] = a;
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // 将处理后的图像数据放回画布
                        ctx.putImageData(imageData, canvasX, canvasY);
                        console.log('虚化区域处理完成');
                    } catch (e) {
                        console.error('处理虚化区域图像数据时出错', e);
                    }
                } catch (err) {
                    console.error('处理虚化区域时出错', err);
                }
            });
        }

        // 3. 处理文字标注
        console.log('开始处理文字标注...');
        const textContainers = overlay.querySelectorAll('.text-container');
        console.log(`找到 ${textContainers.length} 个文字标注`);

        textContainers.forEach(container => {
            try {
                const textElement = container.querySelector('.text-annotation');
                if (!textElement) return;

                const text = textElement.textContent;
                if (!text || text.trim() === '') return;

                // 获取位置和尺寸
                const rect = container.getBoundingClientRect();

                // 计算相对于图片的坐标
                const x = (rect.left - containerRect.left - offsetX) / currentScale;
                const y = (rect.top - containerRect.top - offsetY) / currentScale;
                const width = rect.width / currentScale;
                const height = rect.height / currentScale;

                // 转换为画布上的坐标
                const canvasX = Math.max(0, Math.round(x * naturalWidth / imageRect.width));
                const canvasY = Math.max(0, Math.round(y * naturalHeight / imageRect.height));
                const canvasWidth = Math.min(naturalWidth - canvasX, Math.round(width * naturalWidth / imageRect.width));
                const canvasHeight = Math.min(naturalHeight - canvasY, Math.round(height * naturalHeight / imageRect.height));

                // 检查坐标有效性
                if (canvasWidth <= 0 || canvasHeight <= 0) {
                    console.warn('文字标注尺寸无效，跳过处理');
                    return;
                }

                // 获取样式
                const style = window.getComputedStyle(textElement);
                const fontSize = parseInt(style.fontSize) || toolSettings.text.fontSize;
                const fontFamily = style.fontFamily || toolSettings.text.fontFamily;
                const textColor = style.color || toolSettings.text.textColor;
                const bgColor = style.backgroundColor || toolSettings.text.backgroundColor;

                // 计算适合原始图片的字体大小
                const canvasFontSize = Math.max(12, Math.round(fontSize * naturalHeight / imageRect.height / currentScale));

                // 绘制背景
                ctx.fillStyle = bgColor;
                ctx.fillRect(canvasX, canvasY, canvasWidth, canvasHeight);

                // 绘制文字
                ctx.fillStyle = textColor;
                const fontWeight = style.fontWeight;
                const fontStyle = style.fontStyle;
                ctx.font = `${fontWeight} ${fontStyle} ${canvasFontSize}px ${fontFamily}`;
                ctx.textBaseline = 'top';

                // 计算内边距
                const padding = Math.round(5 * naturalWidth / imageRect.width / currentScale);

                // 自动换行处理文字
                const words = text.split(' ');
                let line = '';
                let lineY = canvasY + padding;
                const lineHeight = canvasFontSize * 1.2;

                for (let i = 0; i < words.length; i++) {
                    const testLine = line + words[i] + ' ';
                    const metrics = ctx.measureText(testLine);

                    if (metrics.width > canvasWidth - padding * 2 && i > 0) {
                        ctx.fillText(line, canvasX + padding, lineY);
                        line = words[i] + ' ';
                        lineY += lineHeight;
                    } else {
                        line = testLine;
                    }
                }

                ctx.fillText(line, canvasX + padding, lineY);
                console.log('文字标注处理完成', {
                    text: text.substring(0, 20) + (text.length > 20 ? '...' : '')
                });
            } catch (err) {
                console.error('处理文字标注时出错', err);
            }
        });

        // 生成下载链接
        const downloadLink = document.createElement('a');
        downloadLink.download = '编辑后的图片.png';

        try {
            // 尝试使用toBlob来优化内存使用
            canvas.toBlob(function(blob) {
                if (blob) {
                    downloadLink.href = URL.createObjectURL(blob);
                    downloadLink.click();

                    // 释放内存
                    setTimeout(function() {
                        URL.revokeObjectURL(downloadLink.href);
                    }, 1000);

                    console.log('图片生成完成，已触发下载');
                } else {
                    throw new Error('无法创建Blob');
                }
            }, 'image/png');
        } catch (e) {
            console.error('使用toBlob失败，回退到toDataURL', e);

            // 回退到较旧的方法
            downloadLink.href = canvas.toDataURL('image/png');
            downloadLink.click();
            console.log('使用toDataURL生成图片完成，已触发下载');
        }

        return true;
    } catch (error) {
        console.error('生成下载图片时出错', error);
        showError('生成下载图片时出错: ' + error.message);
        return false;
    }
}

// 重写文件加载完成后，替换原有的downloadImage函数
console.log('增强下载功能已加载');

// 如果DOM已经加载完成，直接替换函数
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('立即替换下载函数');
    window.downloadImage = downloadImage;
} else {
    // 否则等待DOM加载完成后替换函数
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM加载完成后替换下载函数');
        window.downloadImage = downloadImage;
    });
}