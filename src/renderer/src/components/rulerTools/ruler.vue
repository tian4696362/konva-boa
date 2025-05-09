<template>
  <div
    ref="ruler"
    class="ruler"
    :style="{
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      height: `${height}px`,
      transform: `rotate(${rotate}deg)`,
    }"
  >
    <div class="usePen" @mouseenter="penEnter" @mouseleave="penLeave"></div>

    <div class="box" @mousedown="startDrag">
      <div class="cm">
        <span class="num" v-for="(item, index) in rulerData" :key="index">
          {{ item.val }}
        </span>
      </div>
      <span class="cmNum" v-if="cm > 0">{{ cm }}cm</span>
      <el-button
        class="close"
        :icon="Close"
        circle
        @click="handleClose"
        size="large"
      />
      <span class="deg">{{ textDeg }}°</span>
      <el-button
        class="rotation"
        :icon="RefreshRight"
        circle
        @mousedown.stop="startRotation"
        size="large"
      />
      <el-button
        class="size"
        :icon="Sort"
        circle
        @mousedown.stop="handleSize"
        size="large"
      />
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onBeforeUnmount, computed, reactive } from "vue";
import { Close, RefreshRight, Sort } from "@element-plus/icons-vue";
defineProps({
  cm: {
    type: Number,
    default: 0,
  },
});
let ruler = ref(null);
const top = ref(120);
const left = ref(220);
const width = ref(750);
const height = ref(120);
const rotate = ref(0);
let rulerData = reactive([
  { val: 0 },
  { val: 1 },
  { val: 2 },
  { val: 3 },
  { val: 4 },
  { val: 5 },
  { val: 6 },
  { val: 7 },
  { val: 8 },
  { val: 9 },
  { val: 10 },
  { val: 11 },
  { val: 12 },
  { val: 13 },
  { val: 14 },
  { val: 15 },
]);
let isDragging = false;
let initialMouseX = 0;
let initialMouseY = 0;
let initialTop = 0;
let initialLeft = 0;

let dragging = false;
let startAngle = 0;
let currentRotation = 0;
let centerX, centerY;
let usePen = false;

watch(
  () => width.value,
  (newValue, oldValue) => {
    rulerData = [];
    for (let i = 0; i < (newValue / 47.2).toFixed(0); i++) {
      rulerData.push({ val: i });
    }
  }
);

const textDeg = computed(() => {
  return rotate.value.toFixed(0);
});

const startDrag = (event) => {
  isDragging = true;
  initialMouseX = event.clientX;
  initialMouseY = event.clientY;
  initialTop = top.value;
  initialLeft = left.value;
  document.addEventListener("mousemove", onDragging);
  document.addEventListener("mouseup", stopDrag);
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
};

const startRotation = (e) => {
  dragging = true;
  centerX = ruler.value.offsetLeft + ruler.value.clientWidth / 2;
  centerY = ruler.value.offsetTop + ruler.value.clientHeight / 2;
  startAngle =
    (Math.atan2(centerY - e.clientY, centerX - e.clientX) * 180) / Math.PI -
    currentRotation;
  document.addEventListener("mousemove", onDragRotation);
  document.addEventListener("mouseup", stopDragRotation);
};
const onDragRotation = (e) => {
  if (dragging) {
    const angle =
      (Math.atan2(centerY - e.clientY, centerX - e.clientX) * 180) / Math.PI;
    const rotation = angle - startAngle;
    currentRotation = rotation;
    rotate.value = rotation;
  }
};
const stopDragRotation = (event) => {
  dragging = false;
  document.removeEventListener("mousemove", onDragRotation);
  document.removeEventListener("mouseup", stopDragRotation);
};

function handleSize(e) {
  document.addEventListener("mousemove", onDragSize);
  document.addEventListener("mouseup", stopDragSize);
}
const onDragSize = (event) => {
  // console.log(event);
  // if(width.value < 516) return;
  width.value += event.clientX - width.value - left.value + 40;
};

const stopDragSize = () => {
  document.removeEventListener("mousemove", onDragSize);
  document.removeEventListener("mouseup", stopDragSize);
};
const penEnter = () => {
  usePen = true;
  console.log("来了");
};
const penLeave = () => {
  usePen = false;
  console.log("走了");
};
const handleClose = () => {
  return false;
};

/**
 * 暴露方法
 * @param {*} top 距离顶部
 * @param {*} left 距离左边
 * @param {*} width 宽度
 * @param {*} height 高度
 * @param {*} rotate 旋转角度
 * @param {*} usePen 是否使用画笔
 * @param {*} handleClose 关闭
 */
defineExpose({
  top,
  left,
  width,
  height,
  rotate,
  usePen,
  handleClose,
});
</script>
<style lang="scss" scoped>
.ruler {
  background-color: beige;
  position: relative;
  box-sizing: border-box;
  border-radius: 4px;
  // padding-left: 10px;
  // padding-right: 10px;
  .box {
    width: 100%;
    height: 100%;
    cursor: move;
    padding-left: 20px;
    padding-right: 20px;
    box-sizing: border-box;
    // background-color: red;
    .cm {
      width: 100%;
      height: 24px;
      // background-color: red;
      background-image: url("@/assets/ruler.png");
      background-repeat: repeat-x;
      background-size: 710px 24px;
      display: flex;
      flex-wrap: nowrap; /* 禁止换行 */
      .num {
        width: 47.2px;
        // background-color: rgba($color: #000000, $alpha: 0.3);
        transform: translate(-23.5px, 20px);
        text-align: center;
        flex-shrink: 0;
      }
    }
    .cmNum {
      position: absolute;
      top: 35px;
      left: 50%;
    }
    .deg {
      position: absolute;
      top: 55px;
      right: 140px;
      font-size: 24px;
    }
    .close {
      position: absolute;
      left: 20px;
      top: 55px;
    }
    .rotation {
      position: absolute;
      right: 70px;
      top: 55px;
    }
    .size {
      position: absolute;
      right: 20px;
      top: 55px;
      transform: rotate(90deg);
    }
  }

  .usePen {
    width: 100%;
    height: 20px;
    position: absolute;
    background-color: rgba(0, 255, 255, 0.123);
    position: absolute;
    left: 0px;
    top: -18px;
  }
}
</style>
