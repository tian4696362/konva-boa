<template>
  <div class="box" ref="box" :style="{}">
    <div
      ref="ruler"
      class="ruler"
      :style="{
        position: 'absolute',
        width: `${width}px`,
        height: `${height}px`,
        top: `${top}px`,
        left: `${left}px`,
        transform: `rotate(${rotate}deg)`,
      }"
      @mousedown="startDrag"
    >
      <!-- <span class="cmNum" v-if="cm > 0">{{ cm }}cm</span> -->
      <div class="controls">
        <span class="deg">{{ textDeg }}°</span>
        <el-button
          class="close"
          :icon="Close"
          circle
          @click.stop="handleClose"
          size="large"
        />

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

        <!-- <svg ref="svg" id="mySVG" width="120%" height="120%">
          <line
            :x1="line.x1"
            :y1="line.y1"
            :x2="line.x2"
            :y2="line.y2"
            :stroke="line.stroke"
            :stroke-width="line.strokeWidth"
          />
        </svg> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  useTemplateRef,
  watch,
  nextTick,
  onMounted,
  computed,
  reactive,
} from "vue";
import { Close, RefreshRight, Sort } from "@element-plus/icons-vue";
defineProps({
  deg: {
    type: Number,
    default: 0,
  },
});
const textDeg = computed(() => {
  return rotate.value.toFixed(0);
});
let ruler = ref(null);
let box = ref(null);
let svg = ref(null);
const top = ref(120);
const left = ref(220);
const width = ref(640);
const height = ref(320);
const rotate = ref(0);

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
// const line = reactive({
//   // x1: left.value+width.value/2,
//   // y1: top.value+height.value,
//   // x2:left.value+width.value/2+100,
//   // y2: left.value+width.value/2-100,
//   x1: 0, // 初始 x1 坐标
//   y1: 0, // 初始 y1 坐标
//   x2: 50, // 初始 x2 坐标
//   y2: 50, // 初始 y2 坐标
//   stroke: "blue",
//   strokeWidth: 2,
// });
// console.log(line);

// watch(
//   [() => top.value, () => left.value],
//   ([newValue1, newValue2], [oldValue1, oldValue2]) => {
//     setSvg();
//   }
// );

// onMounted(() => {
//   setSvg();
// });

// const setSvg = () => {
//   console.log(svg.value.clientWidth / 2, svg.value.clientWidth * 0.8);
//   line.x1 = svg.value.clientWidth / 2;
//   line.y1 = svg.value.clientHeight * 0.95;
// };

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
  width.value += event.clientX - width.value - left.value + 140;
  height.value = width.value / 2;
};
const stopDragSize = () => {
  document.removeEventListener("mousemove", onDragSize);
  document.removeEventListener("mouseup", stopDragSize);
};
const handleClose = () => {
  return false;
};
const handleAdd = () => {
  width.value += 10;
  height.value = width.value / 2;
};

/**
 * 暴露方法
 * @param {*} top 距离顶部
 * @param {*} left 距离左边
 * @param {*} width 宽度
 * @param {*} height 高度
 * @param {*} rotate 旋转角度
 * @param {*} handleClose 关闭
 */
defineExpose({
  top,
  left,
  width,
  height,
  rotate,
  handleClose,
});
</script>

<style lang="scss" scoped>
.ruler {
  // background-color: aqua;
  background-image: url("@/assets/compass.webp");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  transform-origin: 50% bottom;
  cursor: move;

  .controls {
    height: 100%;
    width: 100%;
    // background-color: red;
    position: relative;
    #mySVG {
      position: absolute;
      left: -10%;
      bottom: -5%;
      background-color: rgba(250, 235, 215, 0.5);
    }
    .el-button + .el-button {
      margin-left: 0px;
    }
    .rotation {
      position: absolute;
      left: 120px;
      bottom: 20px;
      z-index: 1;
    }
    .size {
      position: absolute;
      right: 120px;
      bottom: 20px;
      transform: rotate(90deg);
      z-index: 1;
    }
    .close {
      position: absolute;
      top: 30%;
      left: calc(50% - 20px);
      z-index: 1;
    }

    .deg {
      position: absolute;
      bottom: 5px;
      right: calc(50% - 25px);
      width: 50px;
      text-align: center;
      font-size: 24px;
    }
  }
}
</style>
