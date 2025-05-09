<template>
  <div
    ref="resizableDraggable"
    :class="
      cubeRotation ? 'resizableDraggable' : 'resizableDraggable cubeRotation'
    "
    :style="{
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      border: `1px solid ${draggable ? '#87d8f2' : '#ccc'}`,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      zIndex: `${draggable ? 1 : 0}`, //放置最顶端
    }"
    @click="handleResizerShow"
    @mousedown="startDrag"
  >
    <slot :draggable="draggable" :top="top" :left="left"></slot>
    <div
      class="resizer topLeft"
      v-if="draggable"
      @mousedown="startResize('topLeft')"
    ></div>
    <div
      class="resizer topRight"
      v-if="draggable"
      @mousedown="startResize('topRight')"
    ></div>
    <div
      class="resizer bottomLeft"
      v-if="draggable"
      @mousedown="startResize('bottomLeft')"
    ></div>
    <div
      class="resizer bottomRight"
      v-if="draggable"
      @mousedown="startResize('bottomRight')"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import eventBus from "@/utils/eventBus";
const props = defineProps({
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
});

const top = ref(props.y);
const left = ref(props.x);
const width = ref(400);
const height = ref(400);
const resizableDraggable = ref(null);
const draggable = ref(false);
const cubeRotation = ref(false); // 子组件在旋转 组件不可进行移动

let isDragging = false;
let isResizing = false;
let resizeType = "";
let initialMouseX = 0;
let initialMouseY = 0;
let initialTop = 0;
let initialLeft = 0;
let initialWidth = 0;
let initialHeight = 0;

const startDrag = (event) => {
  if (cubeRotation.value) return;
  isDragging = true;
  initialMouseX = event.clientX;
  initialMouseY = event.clientY;
  initialTop = top.value;
  initialLeft = left.value;
  document.addEventListener("mousemove", onDragging);
  document.addEventListener("mouseup", stopDrag);

  document.addEventListener("touchmove", function (event) {
    // 防止触摸事件和鼠标事件冲突
    event.preventDefault();
    onDragging(event);
  });
  document.addEventListener("touchend", function (event) {
    // 防止触摸事件和鼠标事件冲突
    event.preventDefault();
    stopDrag(event);
  });
};

const onDragging = (event) => {
  if (isDragging) {
    top.value = initialTop + event.clientY - initialMouseY;
    left.value = initialLeft + event.clientX - initialMouseX;
  }
};

const stopDrag = () => {
  isDragging = false;
  document.removeEventListener("mousemove", onDragging);
  document.removeEventListener("mouseup", stopDrag);

  document.removeEventListener("touchmove", onDragging);
  document.removeEventListener("touchend", stopDrag);
};

const startResize = (type) => {
  isResizing = true;
  resizeType = type;
  initialMouseX = event.clientX;
  initialMouseY = event.clientY;
  initialTop = top.value;
  initialLeft = left.value;
  initialWidth = width.value;
  initialHeight = height.value;
  document.addEventListener("mousemove", onResizing);
  document.addEventListener("mouseup", stopResize);

  document.addEventListener("touchmove", function (event) {
    // 防止触摸事件和鼠标事件冲突
    event.preventDefault();
    onResizing(event);
  });
  document.addEventListener("touchend", function (event) {
    // 防止触摸事件和鼠标事件冲突
    event.preventDefault();
    stopResize(event);
  });
};

const onResizing = (event) => {
  if (isResizing) {
    const deltaX = event.clientX - initialMouseX;
    const deltaY = event.clientY - initialMouseY;

    switch (resizeType) {
      case "topLeft":
        top.value = initialTop + deltaY;
        left.value = initialLeft + deltaX;
        width.value = initialWidth - deltaX;
        height.value = initialHeight - deltaY;
        break;
      case "topRight":
        top.value = initialTop + deltaY;
        width.value = initialWidth + deltaX;
        height.value = initialHeight - deltaY;
        break;
      case "bottomLeft":
        left.value = initialLeft + deltaX;
        width.value = initialWidth - deltaX;
        height.value = initialHeight + deltaY;
        break;
      case "bottomRight":
        width.value = initialWidth + deltaX;
        height.value = initialHeight + deltaY;
        break;
    }
  }
};

const stopResize = () => {
  isResizing = false;
  document.removeEventListener("mousemove", onResizing);
  document.removeEventListener("mouseup", stopResize);
  document.removeEventListener("touchmove", onResizing);
  document.removeEventListener("touchend", stopResize);
};

const handleResizerShow = () => {
  draggable.value = true;
};

const enableMove = (value) => {
  console.log("接收到子组件传递的值xxx:", value);
  cubeRotation.value = value;
};

onMounted(() => {
  eventBus.on("enableMove", enableMove);
  // 添加点击事件监听到document
  document.addEventListener("click", function (event) {
    // 检查点击的目标是否是我的div或其子元素
    if (!resizableDraggable.value.contains(event.target)) {
      // 如果点击的元素不是myDiv或其子元素，执行你的代码
      console.log("点击了div以外的地方");
      // 在这里添加你的代码
      draggable.value = false;
    }
  });
});
</script>

<style lang="scss" scoped>
.resizableDraggable {
  position: relative;

  .resizer {
    width: 8px;
    height: 8px;
    background-color: #ffffff;
    border: 2px solid #87d8f2;
    border-radius: 2px;
    position: absolute;
    cursor: pointer;
  }

  .topLeft {
    top: -5px;
    left: -5px;
  }

  .topRight {
    top: -5px;
    right: -5px;
  }

  .bottomLeft {
    bottom: -5px;
    left: -5px;
  }

  .bottomRight {
    bottom: -5px;
    right: -5px;
  }
}
.cubeRotation {
  cursor: move;
}
</style>
