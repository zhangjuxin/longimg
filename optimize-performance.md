<!--
 * @Author: zhangjuxin zhangjuxin@zhuge.com
 * @Date: 2025-03-14 17:55:38
 * @LastEditors: zhangjuxin zhangjuxin@zhuge.com
 * @LastEditTime: 2025-03-14 21:32:05
 * @FilePath: /长图编辑工具/optimize-performance.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
# 长图编辑工具性能优化

## 性能优化摘要

为了解决编辑长图片时卡顿的问题，我们实施了以下优化：

### 1. 事件处理优化
- **使用请求动画帧(requestAnimationFrame)**: 将高频率的鼠标移动事件通过RAF节流，确保以显示器刷新率同步更新UI
- **使用事件节流**: 限制事件处理频率，避免过度频繁的计算和DOM操作
- **在document级别捕获事件**: 提高对快速鼠标移动的响应能力

### 2. 渲染优化
- **使用CSS Transform替代top/left**: 利用GPU加速，减少重排(reflow)开销
- **添加will-change提示**: 告知浏览器元素将发生变化，优化渲染路径
- **减少DOM操作**: 合并相邻的模糊区域，减少创建的DOM元素数量

### 3. 模糊区域批处理
- **延迟创建**: 不立即创建每个模糊区域，而是收集坐标后批量处理
- **区域合并**: 当多个模糊区域靠近时，合并为一个较大的区域
- **周期性刷新**: 每100ms处理一次待创建的模糊区域，平衡响应性和性能

### 4. 工具功能优化
- **优化拖动函数**: 更高效的元素拖动实现，减少不必要的计算
- **优化调整大小**: 使用四角调整手柄，通过transform实现更高效的大小调整
- **全局状态管理**: 防止同时拖动和调整大小引起的冲突

### 5. 性能监控
- **FPS计数器**: 实时监控应用性能，显示当前帧率
- **内存使用**: 追踪内存使用情况（在支持的浏览器中）
- **视觉反馈**: 根据性能状况提供颜色编码反馈

## 关键文件和函数

1. **optimize-performance.js**: 包含所有性能优化代码的核心文件
   - `throttleEvent()`: 使用requestAnimationFrame控制事件频率
   - `optimizedMakeElementDraggable()`: 高性能的元素拖动实现
   - `optimizedMakeHandleResizable()`: 高性能的大小调整实现
   - `optimizedCreateBlurArea()`: 优化的模糊区域创建函数

2. **app.js**: 修改了以下函数以使用优化版本
   - `activateMosaicTool()`: 优化马赛克工具，减少DOM操作
   - `addResizeHandles()`: 更新为使用四角调整手柄
   - `onRectangleCreated()`: 新增辅助函数，简化矩形创建流程

## 使用说明

优化后的工具使用方式与之前相同，但应该有以下改进：

1. 编辑长图片时响应更流畅
2. 拖动和调整矩形大小更加平滑
3. 使用马赛克工具时不再卡顿
4. 屏幕右下角显示性能监视器，帮助评估性能状况

## 后续优化建议

1. 考虑使用Canvas绘制马赛克/模糊效果，而非创建大量DOM元素
2. 实现视图分块渲染(Chunking)，只渲染可见区域的内容
3. 对超大图片实现动态降采样，保持编辑时的流畅度
4. 使用Web Worker处理复杂计算，避免阻塞主线程