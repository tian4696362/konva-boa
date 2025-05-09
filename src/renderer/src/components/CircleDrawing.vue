<template>
  <div>
    <!-- 圆规工具组件不需要直接的 UI，所有绘制都通过 Konva 完成 -->
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { Stage, Layer, Circle, Line } from 'vue-konva';

// 定义组件 props，接收 Konva 舞台和当前工具状态
const props = defineProps({
  stage: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
});

// 定义组件状态
const isSettingCenter = ref(true);
const centerX = ref(0);
const centerY = ref(0);
const startAngle = ref(0);
const currentAngle = ref(0);
const radius = ref(0);
const isDrawing = ref(false);
const isCounterClockwise = ref(false);
const mouseX = ref(0);
const mouseY = ref(0);
const strokeColor = ref('blue');

// 绘制层
const drawingLayer = ref(null);
const circle = ref(null);
const guideLine = ref(null);

// 初始化绘制层
onMounted(() => {
  if (props.stage) {
    // 创建绘制层
    drawingLayer.value = new window.Konva.Layer();
    props.stage.add(drawingLayer.value);
    
    // 添加圆和辅助线
    createDrawingShapes();
    
    // 添加事件监听
    addEventListeners();
  }
});

// 清理资源
onUnmounted(() => {
  removeEventListeners();
  if (drawingLayer.value) {
    drawingLayer.value.destroy();
  }
});

// 创建绘制图形
const createDrawingShapes = () => {
  // 创建圆
  circle.value = new window.Konva.Circle({
    x: 0,
    y: 0,
    radius: 0,
    stroke: strokeColor.value,
    strokeWidth: 2,
    angleStart: 0,
    angleEnd: 0,
    anticlockwise: false
  });
  
  // 创建辅助线
  guideLine.value = new window.Konva.Line({
    points: [0, 0, 0, 0],
    stroke: strokeColor.value,
    strokeWidth: 1,
    dash: [5, 5]
  });
  
  drawingLayer.value.add(circle.value);
  drawingLayer.value.add(guideLine.value);
};

// 添加事件监听器
const addEventListeners = () => {
  const stage = props.stage;
  
  // 鼠标按下事件
  stage.on('mousedown touchstart', handleMouseDown);
  
  // 鼠标移动事件
  stage.on('mousemove touchmove', handleMouseMove);
  
  // 鼠标释放事件
  stage.on('mouseup touchend', handleMouseUp);
};

// 移除事件监听器
const removeEventListeners = () => {
  const stage = props.stage;
  
  stage.off('mousedown touchstart', handleMouseDown);
  stage.off('mousemove touchmove', handleMouseMove);
  stage.off('mouseup touchend', handleMouseUp);
};

// 处理鼠标按下事件
const handleMouseDown = (e) => {
  if (!props.isActive) return;
  
  // 阻止事件冒泡到其他工具
  e.cancelBubble = true;
  
  if (isSettingCenter.value) {
    const pos = props.stage.getPointerPosition();
    centerX.value = pos.x;
    centerY.value = pos.y;
    isSettingCenter.value = false;
    isDrawing.value = true;
    
    const dx = pos.x - centerX.value;
    const dy = pos.y - centerY.value;
    startAngle.value = Math.atan2(dy, dx);
    currentAngle.value = startAngle.value;
    radius.value = Math.sqrt(dx * dx + dy * dy);
    
    // 更新圆和辅助线
    updateCircle();
    updateGuideLine();
  }
};

// 处理鼠标移动事件
const handleMouseMove = (e) => {
  if (!props.isActive || !isDrawing.value) return;
  
  const pos = props.stage.getPointerPosition();
  mouseX.value = pos.x;
  mouseY.value = pos.y;
  
  const dx = pos.x - centerX.value;
  const dy = pos.y - centerY.value;
  radius.value = Math.sqrt(dx * dx + dy * dy);
  currentAngle.value = Math.atan2(dy, dx);
  
  // 首次移动，确定绘制方向
  if (isCounterClockwise.value === undefined && startAngle.value !== currentAngle.value) {
    const angleDiff = currentAngle.value - startAngle.value;
    isCounterClockwise.value = angleDiff < 0;
  }
  
  // 更新圆和辅助线
  updateCircle();
  updateGuideLine();
};

// 处理鼠标释放事件
const handleMouseUp = () => {
  if (!props.isActive || !isDrawing.value) return;
  
  isDrawing.value = false;
  isSettingCenter.value = true;
  
  // 绘制完成后，触发事件通知父组件
  emit('circleDrawn', {
    center: { x: centerX.value, y: centerY.value },
    radius: radius.value,
    startAngle: startAngle.value,
    endAngle: currentAngle.value,
    anticlockwise: isCounterClockwise.value,
    strokeColor: strokeColor.value
  });
};

// 更新圆的属性
const updateCircle = () => {
  if (!circle.value) return;
  
  circle.value.setAttrs({
    x: centerX.value,
    y: centerY.value,
    radius: radius.value,
    angleStart: startAngle.value * (180 / Math.PI),
    angleEnd: currentAngle.value * (180 / Math.PI),
    anticlockwise: isCounterClockwise.value
  });
  
  drawingLayer.value.draw();
};

// 更新辅助线
const updateGuideLine = () => {
  if (!guideLine.value) return;
  
  guideLine.value.setAttrs({
    points: [centerX.value, centerY.value, mouseX.value, mouseY.value]
  });
  
  drawingLayer.value.draw();
};

// 监听工具激活状态
watch(() => props.isActive, (newVal) => {
  if (!newVal) {
    // 工具停用，重置状态
    resetDrawingState();
  }
});

// 重置绘制状态
const resetDrawingState = () => {
  isSettingCenter.value = true;
  isDrawing.value = false;
  isCounterClockwise.value = undefined;
};

// 定义事件
const emit = defineEmits(['circleDrawn']);
</script>