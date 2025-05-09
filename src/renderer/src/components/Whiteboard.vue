<template>
  <div style="position: relative; width: 100%; height: 100%; overflow: hidden">
    <button @click="toggleSelection">选中</button>
    <button @click.stop="toggleDrawing">画笔</button>
    <button @click.stop="toggleQuadrilateral">四边形</button>
    <div v-show="state.showBrushOptions" class="brush-options" @click.stop>
      <div class="color-picker">
        <button
          @click="setBrushColor('#ff0000')"
          style="background: #ff0000"
        ></button>
        <button
          @click="setBrushColor('#00ff00')"
          style="background: #00ff00"
        ></button>
        <button
          @click="setBrushColor('#0000ff')"
          style="background: #0000ff"
        ></button>
        <button
          @click="setBrushColor('#ff00ff')"
          style="background: #ff00ff"
        ></button>
        <button
          @click="setBrushColor('#000000')"
          style="background: #000000"
        ></button>
      </div>
      <div class="size-picker">
        <button @click="setBrushWidth(3)">细</button>
        <button @click="setBrushWidth(5)">中</button>
        <button @click="setBrushWidth(8)">粗</button>
      </div>
    </div>
    <button @click="toggleEraser">橡皮擦</button>
    <button @click="toggleCompass">圆</button>
    <button @click="undo">撤销</button>
    <button @click="clearScreen">清屏</button>
    <button @click="logAllPoints">智能识别</button>
    <button @click="saveCanvas">保存</button>
    <button @click="open">放大镜</button>
    <v-stage
      ref="stageRef"
      :style="{ 'pointer-events': activedBol ? 'auto' : 'none' }"
      :config="state.stageConfig"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @touchmove="handleMouseMove"
      @touchend="handleMouseUp"
      @touchstart="handleMouseDown"
    >
      <v-layer>
        <v-rect
          v-for="(rect, index) in state.rectangles"
          :key="index"
          :config="rect"
          @click="handleRectClick(rect)"
          @touchstart="handleRectClick(rect)"
          :draggable="false"
        />
        <!-- @transformend="handleTransformEnd"  @transformstart="handleTransformStart" -->
        <v-transformer
          ref="transformerRef"
          :config="{
            ...state.transformerConfig,
            // 添加移动端适配配置
            rotationSnaps: [0, 90, 180, 270],
            rotationSnapTolerance: 45,
            anchorSize: 20,
            borderStrokeWidth: 2,
          }"
          :enabled="state.isSelectionEnabled && state.selectedItems.length > 0"
        />
        <v-line
          v-if="state.isDrawing && state.currentLinePoints.length > 0"
          :config="{
            points: state.currentLinePoints,
            stroke: state.selectColor,
            strokeWidth: state.brushWidth,
            tension: 0.5,
          }"
        />
        <v-circle
          v-if="
            state.isCompassing &&
            state.currentCircleCenter &&
            state.currentCircleRadius > 0
          "
          :config="{
            x: state.currentCircleCenter.x,
            y: state.currentCircleCenter.y,
            radius: state.currentCircleRadius,
            stroke: state.selectColor,
            strokeWidth: state.brushWidth,
            fill: 'transparent',
          }"
        />
        <!-- @touchstart="handleLineClick(line)" -->
        <v-line
          v-for="(line, index) in state.drawnLines"
          :key="index"
          :config="line"
          @click="handleLineClick(line)"
          @touchstart="handleLineClick(line)"
          :draggable="false"
        />
        <v-circle
          v-for="(circle, index) in state.drawnCircles"
          :key="index"
          :config="circle"
          @click="handleCircleClick(circle)"
          :draggable="false"
        />
        <!-- 四边形 -->
        <v-rect
          v-for="(quadrilateral, index) in state.drawnQuadrilaterals"
          :key="index"
          :config="quadrilateral"
          @click="handleQuadrilateralClick(quadrilateral)"
          :draggable="false"
        />
        <v-rect
          v-if="state.isQuadrilateralDrawing && state.currentQuadrilateral"
          :config="state.currentQuadrilateral"
        />
        <!-- 智能识别文字 -->
        <template v-if="state.drawnLines">
          <v-text
            v-for="(text, index) in state.drawnLines.filter(
              (l) => l.type === 'text'
            )"
            :key="`text-${index}`"
            :config="{
              text: text.text,
              x: text.x,
              y: text.y,
              fontSize: text.fontSize,
              fill: text.fill,
              draggable: state.isSelectionEnabled,
              id: text.id,
            }"
            @click="handleTextClick(text)"
            @dragend="handleDragEnd"
          />
        </template>
      </v-layer>
      <!-- @transformend="handleTextTransform" -->
    </v-stage>
    <div
      ref="virtualCursor"
      v-show="isVirtualCursorVisible"
      class="virtual-cursor"
    ></div>
    <!-- v-show="isVirtualCursorVisible" <div style="width: 500px; height: 500px" v-html="recoHtml"></div> -->
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
} from "vue";
import useRecognizer from "../utils/useRecognizer";

import eventBus from "../utils/eventBus";
// import Hammer from "hammerjs";
// 响应式数据
const state = reactive({
  isManualEraser: false, // 新增手动擦除标志
  isSelectionEnabled: false,
  isDrawing: false,
  isErasing: false,
  isCompassing: false,
  isQuadrilateralDrawing: false, // 四边形绘制状态
  isIntellect: false, // 智能识别状态
  isMouseDown: false, // 鼠标按下状态
  stageConfig: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  showBrushOptions: false,
  brushWidth: 5,
  selectColor: "#000000",
  rectangles: [
    {
      x: window.innerWidth / 2 - 60,
      y: window.innerHeight / 2 - 60,
      width: 0,
      height: 0,
      fill: "red",
      draggable: false,
      id: "rect1",
      name: "my-rect",
    },
    {
      x: window.innerWidth / 2 + 10,
      y: window.innerHeight / 2 + 10,
      width: 0,
      height: 0,
      fill: "green",
      draggable: false,
      id: "rect2",
      name: "my-rect",
    },
  ],
  transformerConfig: {
    nodes: [],
    rotateEnabled: true,
    resizeEnabled: true,
    keepRatio: true,
    enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
    boundBoxFunc: (oldBox, newBox) => {
      if (newBox.width < 30 || newBox.height < 30) {
        return oldBox;
      }
      return newBox;
    },
  },
  selectedItems: [],
  drawnLines: [], // 存储所有的线条和文字
  intellectLines: [],
  drawnCircles: [],
  drawnQuadrilaterals: [],
  currentLinePoints: [],
  currentCircleCenter: null,
  currentCircleRadius: 0,
  lineIdCounter: 0,
  circleIdCounter: 0,
  quadrilateralIdCounter: 0,
  currentQuadrilateral: null,
  isDragging: false, // 拖动状态
  dragStartPos: null,
  historyStack: [],
  AllPoints: [],
  currentLineTimestamps: [],
  recoData: "",
  debounceTimer: null,
  lastDrawTime: 0,
  maxFingerCount: 0,
  exportConfig: {
    quality: 0.8,
    pixelRatio: 2,
    mimeType: "image/png",
  },
});

// 组件引用
const isVirtualCursorVisible = ref(false); // 虚拟光标可见性
const virtualCursor = ref(null); // 虚拟光标元素
const touchArea = ref(null);
const fingerCount = ref(0);
const stageRef = ref(null);
const transformerRef = ref(null);
const activedBol = ref(true);
const drawnLinesBol = ref(false);
const recoing = ref(false);
const eraserUrl = new URL("./eraser.png", import.meta.url).href;
const handleActive = (val) => {
  activedBol.value = val;
};


// 生命周期钩子
onMounted(() => {
  eventBus.on("child-active", handleActive);
  nextTick(() => {
    if (!transformerRef.value) return;
    const transformer = transformerRef.value.getNode();
    transformer.boundBoxFunc(state.transformerConfig.boundBoxFunc);
  });
  window.addEventListener("resize", handleResize);
  saveState();
  stageRef.value.getStage().container().style.cursor = "default";

  if (stageRef.value) {
    // const stageContainer = stageRef.value.getStage().container();
    // const mc = new Hammer(stageContainer, {
    //   recognizers: [
    //     // [Hammer.Pinch, { enable: true }],
    //     // [Hammer.Pan, { enable: true }]
    //     [
    //       Hammer.Pinch,
    //       {
    //         enable: true,
    //         threshold: 0, // 降低 pinch 手势的识别阈值
    //       },
    //     ],
    //     [
    //       Hammer.Pan,
    //       {
    //         enable: true,
    //         threshold: 0, // 降低 pan 手势的识别阈值
    //       },
    //     ],
    //   ],
    // });
    // console.log("mc", mc);

    // mc.on("pinch", (event) => {
    //   console.log("pinch", event);

    //   fingerCount.value = event.pointers.length;
    //   console.log("手指数量pinch", fingerCount.value);
    // });

    // mc.on("pan", (event) => {
    //   fingerCount.value = event.pointers.length;
    //   console.log("手指数量pan", fingerCount.value);
    // });

    //  const stageContainer = stageRef.value.getStage().container();
    // stageContainer.addEventListener('touchstart', (e) => {
    //     const fingerCount = e.touches.length;
    //     console.log("原生 touchstart 事件手指数量", fingerCount);
    // });
    // stageContainer.addEventListener('touchmove', (e) => {
    //     const fingerCount = e.touches.length;
    //     console.log("原生 touchmove 事件手指数量", fingerCount);
    // });
    // stageContainer.addEventListener('touchend', (e) => {
    //     const fingerCount = e.touches.length;
    //     console.log("原生 touchend 事件手指数量", fingerCount);
    // });

    const stageContainer = stageRef.value.getStage().container();
    state.maxFingerCount = 0;

    stageContainer.addEventListener("touchstart", (e) => {
      const currentFingerCount = e.touches.length;
      // 更新最大手指数量
      if (currentFingerCount > state.maxFingerCount) {
        state.maxFingerCount = currentFingerCount;
      }
      // console.log("当前触摸手指数量", currentFingerCount);
      // if (state.maxFingerCount === 4) {
      //   toggleEraser();
      //   handleMouseMove();
      // }
    });

    stageContainer.addEventListener("touchmove", (e) => {
      const currentFingerCount = e.touches.length;
      if (currentFingerCount === 4) {
        toggleEraser();
        state.isErasing = true; // 直接设置为true
        state.isManualEraser = false; // 标记为自动擦除模式
        const touch = e.touches[0];
        const pos = stageRef.value.getStage().getPointerPosition(touch);
        updateVirtualCursorPosition(pos);
        handleMouseMove({
          target: stageRef.value.getStage(),
          evt: e,
        });
      } else if (!state.isManualEraser) {
        state.isErasing = false;
      }
    }),
      stageContainer.addEventListener("touchend", (e) => {
        const remainingFingerCount = e.touches.length;
        if (remainingFingerCount === 0) {
          // 所有手指都已抬起，输出最大手指数量
          // if(state.maxFingerCount === 4){
          //   toggleEraser()
          // }
          emit("fingerCountChange", state.maxFingerCount);
          console.log("最大手指数量", state.maxFingerCount);
          // 重置最大手指数量
          state.maxFingerCount = 0;
        }
      });
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});
const getDrawnLines = () => {
  return state.drawnLines.length > 0;
};
const open = () => {
  const magnifier = new HTMLMagnifier({
    zoom: 2,
    shape: "circle",
    width: 300,
    height: 300,
  });
  magnifier.show();
};
// 方法定义
const saveCanvas = () => {
  const stage = stageRef.value.getNode();
  const dataURL = stage.toDataURL({
    quality: state.exportConfig.quality,
    pixelRatio: state.exportConfig.pixelRatio,
  });

  const link = document.createElement("a");
  link.download = `whiteboard-${Date.now()}.png`;
  link.href = dataURL;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handleDragEnd = (e) => {
  const textNode = e.target;
  const textItem = state.drawnLines.find((t) => t.id === textNode.id());
  if (textItem && textItem.type === "text") {
    textItem.x = textNode.x();
    textItem.y = textNode.y();
    saveState();
    updateTransformerNodes();
  }
};

const handleTextClick = (text) => {
  if (state.isSelectionEnabled) {
    const index = state.selectedItems.indexOf(text);
    if (index === -1) {
      state.selectedItems.push(text);
    } else {
      state.selectedItems.splice(index, 1);
    }
    updateTransformerNodes();
  }
};

const logAllPoints = async () => {
  state.isIntellect = !state.isIntellect;
  state.isDrawing = state.isIntellect;
  state.isSelectionEnabled = false;
  state.isErasing = false;
  state.isCompassing = false;
  state.isQuadrilateralDrawing = false;
  state.isMouseDown = false;
  if (!state.isDrawing) {
    state.currentLinePoints = [];
  }
  if (state.isIntellect) {
    state.currentLinePoints = [];
  }
  state.showBrushOptions = state.isDrawing;
};

const setBrushColor = (color) => {
  state.selectColor = color;
};

const setBrushWidth = (width) => {
  state.brushWidth = width;
};

const clearScreen = () => {
  state.rectangles = [];
  state.drawnLines = [];
  state.drawnCircles = [];
  state.drawnQuadrilaterals = [];
  state.AllPoints = [];
  saveState();
};

const toggleSelection = () => {
  state.isSelectionEnabled = !state.isSelectionEnabled;
  if (!state.isSelectionEnabled) {
    state.selectedItems = [];
    if (transformerRef.value) {
      const transformer = transformerRef.value.getNode();
      transformer.nodes([]);
    }
  }
  state.isDrawing = false;
  state.isErasing = false;
  state.isCompassing = false;
  state.isQuadrilateralDrawing = false;
  state.isMouseDown = false;
  state.isIntellect = false;
  isVirtualCursorVisible.value = false;
};

const toggleDrawing = () => {
  state.isDrawing = true;
  state.isSelectionEnabled = false;
  state.isErasing = false;
  state.isCompassing = false;
  state.isQuadrilateralDrawing = false;
  state.isMouseDown = false;
  state.isIntellect = false;
  const container = stageRef.value.getStage().container();
  container.style.cursor = "default";
  isVirtualCursorVisible.value = false;
  // nextTick(() => {
  //   if(stageRef.value) {
  //     stageRef.value.getStage().draw()
  //   }
  // })
  if (!state.isDrawing) {
    state.currentLinePoints = [];
  }
  state.showBrushOptions = state.isDrawing;
};
watch(
  // () => state.isErasing,
  // (isErasing) => {
  //   const container = stageRef.value.getStage().container();
  //   if (isErasing) {
  //     container.style.cursor = `url(${eraserUrl}) 16 16, auto`;
  //     // 触摸模式下强制显示虚拟光标
  //     isVirtualCursorVisible.value = true;
  //   } else {
  //     container.style.cursor = "default";
  //     isVirtualCursorVisible.value = false;
  //   }
  // }
  () => state.isErasing || !state.isManualEraser,
  (isErasingOrManual) => {
    const container = stageRef.value.getStage().container();
    if (isErasingOrManual) {
      // 修改判断条件
      container.style.cursor = `url(${eraserUrl}) 16 16, auto`;
      isVirtualCursorVisible.value = navigator.maxTouchPoints > 0;
    } else {
      container.style.cursor = "default";
      isVirtualCursorVisible.value = false;
    }
  }
);
const emit = defineEmits(["recognition-status", "fingerCountChange"]);
const reset = () => {
  state.isErasing = false;
  state.isSelectionEnabled = false;
  state.isDrawing = false;
  state.isCompassing = false;
  state.isQuadrilateralDrawing = false;
  state.isMouseDown = false;
  state.isIntellect = false;
  state.isManualEraser = false;
  isVirtualCursorVisible.value = false;
};
const toggleEraser = () => {
  state.isErasing = true;
  state.isSelectionEnabled = false;
  state.isManualEraser = true;
  state.isDrawing = false;
  state.isCompassing = false;
  state.isQuadrilateralDrawing = false;
  state.isMouseDown = false;
  state.isIntellect = false;
  const container = stageRef.value.getStage().container();
  container.style.cursor = `url(${eraserUrl}) 16 16, auto`;
  isVirtualCursorVisible.value = false;
};

const toggleCompass = () => {
  state.isCompassing = !state.isCompassing;
  state.isSelectionEnabled = false;
  state.isDrawing = false;
  state.isErasing = false;
  state.isQuadrilateralDrawing = false;
  state.isMouseDown = false;
  state.currentCircleCenter = null;
  state.currentCircleRadius = 0;
  state.isIntellect = false;
  isVirtualCursorVisible.value = false;
};

const toggleQuadrilateral = () => {
  state.isQuadrilateralDrawing = !state.isQuadrilateralDrawing;
  state.isSelectionEnabled = false;
  state.isDrawing = false;
  state.isErasing = false;
  state.isCompassing = false;
  state.isMouseDown = false;
  state.isIntellect = false;
  state.currentLinePoints = [];
  isVirtualCursorVisible.value = false;
};

const handleRectClick = (rect) => {
  if (state.isSelectionEnabled) {
    const stage = rect.getStage();
    const pos = stage.getRelativePointerPosition();

    // 添加边界检查
    const { x, y } = pos;
    const { width, height } = rect.getClientRect();
    if (x < 0 || x > width || y < 0 || y > height) {
      const index = state.selectedItems.indexOf(rect);
      if (index === -1) {
        state.selectedItems.push(rect);
      } else {
        state.selectedItems.splice(index, 1);
      }
      updateTransformerNodes();
    }

    // const index = state.selectedItems.indexOf(rect);
    // if (index === -1) {
    //   state.selectedItems.push(rect);
    // } else {
    //   state.selectedItems.splice(index, 1);
    // }
    // updateTransformerNodes();
  }
};

const handleLineClick = (line) => {
  if (state.isSelectionEnabled) {
    const index = state.selectedItems.indexOf(line);
    if (index === -1) {
      state.selectedItems.push(line);
    } else {
      state.selectedItems.splice(index, 1);
    }
    updateTransformerNodes();
  }
};

const handleCircleClick = (circle) => {
  if (state.isSelectionEnabled) {
    const index = state.selectedItems.indexOf(circle);
    if (index === -1) {
      state.selectedItems.push(circle);
    } else {
      state.selectedItems.splice(index, 1);
    }
    updateTransformerNodes();
  }
};

const handleQuadrilateralClick = (quadrilateral) => {
  if (state.isSelectionEnabled) {
    const index = state.selectedItems.indexOf(quadrilateral);
    if (index === -1) {
      state.selectedItems.push(quadrilateral);
    } else {
      state.selectedItems.splice(index, 1);
    }
    updateTransformerNodes();
  }
};

const isRectSelected = (rect) => {
  return state.selectedItems.includes(rect);
};

const isLineSelected = (line) => {
  return state.selectedItems.includes(line);
};

const isCircleSelected = (circle) => {
  return state.selectedItems.includes(circle);
};

const isQuadrilateralSelected = (quadrilateral) => {
  return state.selectedItems.includes(quadrilateral);
};

const getCorner = (pivotX, pivotY, diffX, diffY, angle) => {
  const distance = Math.sqrt(diffX * diffX + diffY * diffY);
  angle += Math.atan2(diffY, diffX);
  const x = pivotX + distance * Math.cos(angle);
  const y = pivotY + distance * Math.sin(angle);
  return { x, y };
};

const getClientRect = (rotatedBox) => {
  const { x, y, width, height } = rotatedBox;
  const rad = rotatedBox.rotation || 0;
  const p1 = getCorner(x, y, 0, 0, rad);
  const p2 = getCorner(x, y, width, 0, rad);
  const p3 = getCorner(x, y, width, height, rad);
  const p4 = getCorner(x, y, 0, height, rad);
  const minX = Math.min(p1.x, p2.x, p3.x, p4.x);
  const minY = Math.min(p1.y, p2.y, p3.y, p4.y);
  const maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
  const maxY = Math.max(p1.y, p2.y, p3.y, p4.y);
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const getTotalBox = (boxes) => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  boxes.forEach((box) => {
    minX = Math.min(minX, box.x);
    minY = Math.min(minY, box.y);
    maxX = Math.max(maxX, box.x + box.width);
    maxY = Math.max(maxY, box.y + box.height);
  });
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const boundBoxFunc = (oldBox, newBox) => {
  const box = getClientRect(newBox);
  const isOut =
    box.x < 0 ||
    box.y < 0 ||
    box.x + box.width > state.stageConfig.width ||
    box.y + box.height > state.stageConfig.height;
  if (isOut) {
    return oldBox;
  }
  return newBox;
};

const handleRectDragMove = (e) => {
  const node = e.target;
  const newX = node.x();
  const newY = node.y();
  const rectConfig = state.rectangles.find((rect) => rect.id === node.id());
  if (rectConfig) {
    rectConfig.x = newX;
    rectConfig.y = newY;
  }
};

// const handleTransformStart = () => {
//   // 可以在这里添加变换开始时的逻辑
// };

// const handleTransformEnd = () => {
//   saveState();
//   // 可以在这里添加变换结束时的逻辑
// };

const handleResize = () => {
  state.stageConfig.width = window.innerWidth;
  state.stageConfig.height = window.innerHeight;
};

const handleMouseDown = (e) => {

  state.showBrushOptions = false;
  const isTouchEvent = e.evt.type.startsWith("touch");
  const pos = isTouchEvent
    ? e.target.getStage().getPointerPosition(e.evt.touches[0])
    : e.target.getStage().getPointerPosition();

  if (state.isSelectionEnabled && state.selectedItems.length > 0) {
    // const pos = e.target.getStage().getPointerPosition();

    if (!transformerRef.value) return;

    const transformer = transformerRef.value.getNode();
    const box = getTotalBox(
      transformer.nodes().map((node) => node.getClientRect())
    );
    if (
      pos.x >= box.x &&
      pos.x <= box.x + box.width &&
      pos.y >= box.y &&
      pos.y <= box.y + box.height
    ) {
      state.isDragging = true;
      state.dragStartPos = pos;
    }
  }
  if (state.isDrawing) {
    // const pos = e.target.getStage().getPointerPosition();
    state.currentLinePoints = [pos.x, pos.y];
  }
  if (state.isErasing) {
    state.isMouseDown = true;
    isVirtualCursorVisible.value = isTouchEvent;
    virtualCursor.value.classList.add("active");
    updateVirtualCursorPosition(pos);
  }
  if (state.isCompassing) {
    // const pos = e.target.getStage().getPointerPosition();
    state.currentCircleCenter = pos;
  }
  if (state.isQuadrilateralDrawing) {
    // const pos = e.target.getStage().getPointerPosition();
    state.currentLinePoints = [pos.x, pos.y];
  }
};

const handleMouseMove = (e) => {
  if (state.isDragging) {
    if (!transformerRef.value) return;
    const isTouchEvent = e.evt.type === "touchmove";
    const pos =
      isTouchEvent && e.evt.touches
        ? e.target.getStage().getPointerPosition(e.evt.touches[0])
        : e.target.getStage().getPointerPosition();
    // const pos = e.target.getStage().getPointerPosition();

    const dx = pos.x - state.dragStartPos.x;
    const dy = pos.y - state.dragStartPos.y;
    const transformer = transformerRef.value.getNode();
    const nodes = transformer.nodes();
    nodes.forEach((node) => {
      const newX = node.x() + dx;
      const newY = node.y() + dy;
      node.position({ x: newX, y: newY });
    });
    state.dragStartPos = pos;
  }

  if (state.isDrawing && state.currentLinePoints.length > 0) {
    const pos = e.target.getStage().getPointerPosition();
    state.currentLinePoints = [...state.currentLinePoints, pos.x, pos.y];
    state.currentLineTimestamps.push(Date.now());
  }
  if (state.isErasing) {
    if (e.evt.type.startsWith("touch")) {
      const touch = e.evt.touches[0];
      const pos = {
        x: touch.clientX,
        y: touch.clientY,
      };
      updateVirtualCursorPosition(pos);
    }
    if (state.isMouseDown) {
      eraserFun(e);
    } else if (e.evt.type === "touchmove") {
      isVirtualCursorVisible.value = navigator.maxTouchPoints > 0;
      virtualCursor.value.classList.add("active");
      const touch = e.evt.touches[0];
      const pos = stageRef.value.getStage().getPointerPosition(touch);
      eraserFun({ ...e, pos }); // 传入修正后的坐标
    }
  }

  if (state.isCompassing && state.currentCircleCenter) {
    const pos = e.target.getStage().getPointerPosition();
    state.currentCircleRadius = Math.sqrt(
      (pos.x - state.currentCircleCenter.x) ** 2 +
        (pos.y - state.currentCircleCenter.y) ** 2
    );
  }
  if (state.isQuadrilateralDrawing && state.currentLinePoints.length > 0) {
    const pos = e.target.getStage().getPointerPosition();
    const startX = state.currentLinePoints[0];
    const startY = state.currentLinePoints[1];
    state.currentQuadrilateral = {
      x: Math.min(startX, pos.x),
      y: Math.min(startY, pos.y),
      width: Math.abs(pos.x - startX),
      height: Math.abs(pos.y - startY),
      stroke: state.selectColor,
      strokeWidth: state.brushWidth,
      fill: "transparent",
      id: `temp-quad-${Date.now()}`,
    };
  }
};
const updateVirtualCursorPosition = (touch) => {
  // const { clientX, clientY } = touch;
  virtualCursor.value.style.left = `${touch.x - 16}px`;
  virtualCursor.value.style.top = `${touch.y - 16}px`;
};
const eraserFun = (e) => {
  const pos = e.pos || e.target.getStage().getPointerPosition();
  if (isVirtualCursorVisible.value) {
    updateVirtualCursorPosition(pos);
  }
  state.rectangles = state.rectangles.filter((rect) => {
    return (
      pos.x < rect.x ||
      pos.x > rect.x + rect.width ||
      pos.y < rect.y ||
      pos.y > rect.y + rect.height
    );
  });
  state.drawnLines = state.drawnLines.flatMap((line) => {
    const lineNode = transformerRef.value
      .getNode()
      .getStage()
      .findOne(`#${line.id}`);
    if (!lineNode) return [];
    if (line.type === "text") {
      const textWidth = line.text.length * line.fontSize * 0.6;
      const textHeight = line.fontSize;
      if (
        pos.x >= line.x &&
        pos.x <= line.x + textWidth &&
        pos.y >= line.y &&
        pos.y <= line.y + textHeight
      ) {
        return [];
      }
      return [line];
    }
    const transform = lineNode.getAbsoluteTransform().copy();
    transform.invert();
    const localPos = transform.point(pos);
    const segments = [];
    let currentSegment = [];
    for (let i = 0; i < line.points.length; i += 2) {
      const x = line.points[i];
      const y = line.points[i + 1];
      const distance = pointToLineDistance(
        localPos.x,
        localPos.y,
        x,
        y,
        line.points[i + 2] || x,
        line.points[i + 3] || y
      );
      if (distance > 30) {
        currentSegment.push(x, y);
      } else if (currentSegment.length > 0) {
        segments.push([...currentSegment]);
        currentSegment = [];
      }
    }
    if (currentSegment.length > 0) {
      segments.push(currentSegment);
    }
    return segments.map((points) => ({
      ...line,
      points,
      id: `${line.id}-${Math.random().toString(36).substr(2, 5)}`,
    }));
  });
  state.drawnCircles = state.drawnCircles.filter((circle) => {
    const distance = Math.sqrt(
      (pos.x - circle.x) ** 2 + (pos.y - circle.y) ** 2
    );
    return distance > circle.radius + state.brushWidth;
  });
  state.drawnQuadrilaterals = state.drawnQuadrilaterals.filter((quad) => {
    const startX = quad.x - 10;
    const startY = quad.y - 10;
    const endX = quad.x + quad.width + 10;
    const endY = quad.y + quad.height + 10;
    return !(
      pos.x >= Math.min(startX, endX) &&
      pos.x <= Math.max(startX, endX) &&
      pos.y >= Math.min(startY, endY) &&
      pos.y <= Math.max(startY, endY)
    );
  });
};
const handleMouseUp = (e) => {

  isVirtualCursorVisible.value = false;
  if (state.isDragging) {
    if (!transformerRef.value) return;
    const transformer = transformerRef.value.getNode();
    const nodes = transformer.nodes();
    nodes.forEach((shape) => {
      if (shape.getClassName() === "Line") {
        const line = state.drawnLines.find((l) => l.id === shape.id());
        if (line) {
          const absPos = shape.getAbsolutePosition();
          const scaleX = shape.scaleX();
          const scaleY = shape.scaleY();
          const rotation = shape.rotation();

          shape.scaleX(1);
          shape.scaleY(1);
          shape.rotation(0);

          line.points = shape.points();
          line.x = absPos.x;
          line.y = absPos.y;

          shape.scaleX(scaleX);
          shape.scaleY(scaleY);
          shape.rotation(rotation);
        }
      }
    });
    saveState();
    state.isDragging = false;
  }
  state.isMouseDown = false;
  state.isDragging = false;
  if (state.isDrawing && state.currentLinePoints.length > 0) {
    if (state.currentLinePoints.length < 4) {
      state.currentLineTimestamps = [];
      state.currentLinePoints = [];
      return;
    }

    const newLine = {
      points: state.currentLinePoints,
      stroke: state.selectColor,
      strokeWidth: state.brushWidth,
      tension: 0.5,
      id: `line-${state.lineIdCounter++}`,
      timestamps:
        state.currentLineTimestamps.length ===
        state.currentLinePoints.length / 2
          ? state.currentLineTimestamps
          : Array(state.currentLinePoints.length / 2)
              .fill()
              .map((_, i) => Date.now() + i),
    };
    if (state.isIntellect) {
      state.AllPoints = [];
      state.intellectLines.push(newLine);
      state.drawnLines.push(newLine);
      const tempLineIds = new Set(state.intellectLines.map((line) => line.id));
      const currentLines = [...state.intellectLines];
      const currentWidth = state.brushWidth;
      clearTimeout(state.debounceTimer);
      state.lastDrawTime = Date.now();
      state.debounceTimer = setTimeout(async () => {
        if (Date.now() - state.lastDrawTime < 1000) return;
        try {
          const recognizer = useRecognizer();
          state.AllPoints = [];
          currentLines.forEach((line, index) => {
            if (!line.points || line.points.length % 2 !== 0) return;
            const points = [];
            for (let i = 0; i < line.points.length; i += 2) {
              points.push({
                x: line.points[i],
                y: line.points[i + 1],
                t: line.timestamps[i / 2],
                p: currentWidth,
              });
            }
            state.AllPoints.push({
              id: line.id,
              stroke: line.stroke,
              pointerType: "pen",
              length: 100,
              creationTime: 1,
              modificationDate: 1,
              style: {
                width: 1,
              },
              type: "stroke",
              pointers: points,
              pointCount: points.length,
            });
          });
          emit("recognition-status", {
            status: "loading",
            data: "正在识别",
          });
          await recognizer.send(state.AllPoints, "zh").then((res) => {
            try {
              const result = typeof res === "string" ? JSON.parse(res) : res;
              state.recoData = result;
              createTextElements(result);
              state.drawnLines = state.drawnLines.filter(
                (line) => !tempLineIds.has(line.id)
              );
              saveState();
              state.intellectLines = [];
              state.AllPoints = [];
              emit("recognition-status", {
                status: "success",
                data: result,
              });
            } catch (error) {
              emit("recognition-status", {
                status: "error",
                message: "解析识别结果失败",
              });
              console.error("解析识别结果失败:", error);
            }
          });
        } catch (error) {
          console.error("识别失败:", error);
        }
      }, 1000);
    } else {
      state.drawnLines.push(newLine);
    }
    state.currentLineTimestamps = [];
    state.currentLinePoints = [];
    saveState();
  }
  if (
    state.isCompassing &&
    state.currentCircleCenter &&
    state.currentCircleRadius > 0
  ) {
    const newCircle = {
      x: state.currentCircleCenter.x,
      y: state.currentCircleCenter.y,
      radius: state.currentCircleRadius,
      stroke: state.selectColor,
      strokeWidth: state.brushWidth,
      fill: "transparent",
      id: `circle-${state.circleIdCounter++}`,
    };
    state.drawnCircles.push(newCircle);
    state.currentCircleCenter = null;
    state.currentCircleRadius = 0;
    saveState();
  }
  if (state.isErasing) {
    saveState();
  }
  if (state.isQuadrilateralDrawing && state.currentLinePoints.length > 0) {
    state.drawnQuadrilaterals.push({
      ...state.currentQuadrilateral,
      id: `quadrilateral-${state.quadrilateralIdCounter}`,
    });
    state.quadrilateralIdCounter++;
    state.currentLinePoints = [];
    state.currentQuadrilateral = null;
    saveState();
  }
};

const createTextElements = (recoData) => {
  if (!Array.isArray(recoData)) {
    console.error("无效的识别数据格式:", recoData);
    return;
  }
  recoData.forEach((item, index) => {
    const correspondingLine = state.intellectLines[index];
    if (correspondingLine && correspondingLine.points.length > 0) {
      const [x, y] = correspondingLine.points;
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      correspondingLine.points.forEach((val, i) => {
        if (i % 2 === 0) {
          minX = Math.min(minX, val);
          maxX = Math.max(maxX, val);
        } else {
          minY = Math.min(minY, val);
          maxY = Math.max(maxY, val);
        }
      });
      const fontSize = Math.max(
        Math.max((maxY - minY) * 1.5, (maxX - minX) * 1.5)
      );
      state.drawnLines.push({
        type: "text",
        text: item.label,
        x,
        y: y - 20,
        fontSize: fontSize,
        fill: state.selectColor,
        id: `text-${Date.now()}-${index}`,
      });
    }
  });
};

const updateTransformerNodes = () => {
  if (!transformerRef.value) return;
  const transformer = transformerRef.value.getNode();
  const nodes = state.selectedItems.map((item) => {
    const node = transformer.getStage().findOne(`#${item.id}`);
    if (node && item.type === "text") {
      node.scaleX(1);
      node.scaleY(1);
    }
    return node;
  });
  transformer.nodes(nodes.filter((n) => n));
};

const pointToLineDistance = (x, y, x1, y1, x2, y2) => {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;
  if (len_sq !== 0) {
    param = dot / len_sq;
  }
  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
};

const saveState = () => {
  const currentState = {
    rectangles: [...state.rectangles],
    drawnLines: [...state.drawnLines],
    drawnCircles: [...state.drawnCircles],
    drawnQuadrilaterals: [...state.drawnQuadrilaterals],
  };
  state.historyStack.push(currentState);
};

const undo = () => {
  if (state.historyStack.length > 1) {
    state.historyStack.pop();
    const previousState = state.historyStack[state.historyStack.length - 1];
    state.rectangles = [...previousState.rectangles];
    state.drawnLines = [...previousState.drawnLines];
    state.drawnCircles = [...previousState.drawnCircles];
    state.drawnQuadrilaterals = [...previousState.drawnQuadrilaterals];
  }
};
defineExpose({
  toggleDrawing,
  toggleEraser,
  clearScreen,
  toggleSelection,
  setBrushColor,
  logAllPoints,
  getDrawnLines,
  setBrushWidth,
  reset,
});
</script>

<style scoped>
.virtual-cursor {
  position: absolute;
  width: 64px;
  height: 64px;
  pointer-events: none;
  background: url(./eraser.png) no-repeat center/contain;
  z-index: 1000;
  display: none; /* 默认隐藏 */
}

.virtual-cursor.active {
  display: block; /* 激活时显示 */
}
v-deep .konvajs-content {
  width: 100% !important;
  height: 100% !important;
}
button {
  margin: 10px;
  padding: 5px 10px;
  font-size: 16px;
}
.brush-options {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  padding: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 999;
}
.brush-options .color-picker {
  display: flex;
  gap: 2px;
  margin-bottom: 5px;
}
.brush-options .color-picker button {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 2px;
  padding: 0;
  cursor: pointer;
}
.brush-options .size-picker button {
  display: block;
  margin: 2px 0;
  padding: 3px 10px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}
.brush-options button:hover {
  opacity: 0.8;
}
</style>
