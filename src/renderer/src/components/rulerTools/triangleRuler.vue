<template>
  <div
    class="sbbox"
    :style="{
      position: 'relative',
      top: `${top}px`,
      left: `${left}px`,
      transform: `rotate(0deg)`,
    }"
  >
    <div
      class="triangleRuler"
      ref="triangleRuler"
      :style="{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${rotate}deg)`,
      }"
    >
      <div class="a" :style="{ width: `${aWidth}px` }">
        <div class="usePenBox">
          <div class="numbox">
            <span class="num" v-for="(item, index) in rulerDataAB" :key="index">
              <span v-if="item.val != 0">{{ item.val }}</span>
              <span v-if="item.val == 0"></span>
            </span>
          </div>
          <div
            class="usePen"
            @mouseenter.stop="penEnter($event, 'a')"
            @mouseleave.stop="penLeave"
            @mousedown.stop=""
          ></div>
        </div>
      </div>
      <div class="b" :style="{ width: `${bWidth}px` }">
        <div class="usePenBox">
          <div class="numbox">
            <span class="num" v-for="(item, index) in rulerDataAB" :key="index">
              <span v-if="item.val != 0">{{ item.val }}</span>
              <span v-if="item.val == 0"></span>
            </span>
          </div>
          <div
            class="usePen"
            @mouseenter.stop="penEnter($event, 'b')"
            @mouseleave.stop="penLeave"
            @mousedown.stop=""
          ></div>
        </div>
      </div>
      <div
        class="cbox"
        :style="{ width: `${cboxWidth}px`, height: `${cboxHeight}px` }"
      >
        <div class="cc">
          <div
            class="c"
            :style="{
              width: `${cWidth}px`,
            }"
          >
            <div class="numbox">
              <span
                class="num"
                v-for="(item, index) in rulerDataC"
                :key="index"
              >
                <span v-if="item.val != 0">{{ item.val }}</span>
                <span v-if="item.val == 0"></span>
              </span>
            </div>
            <div
              class="dragbox"
              @mousedown="startDrag"
              :style="{
                left: `calc(50% - ${dboxWidth / 2}px)`,
                bottom: `calc(50% - ${dboxHeight}px)`,
                width: `${dboxWidth}px`,
                height: `${dboxHeight}px`,
              }"
            ></div>
            <div class="controls">
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
              <div
                class="usePen"
                @mouseenter.stop="penEnter($event, 'c')"
                @mouseleave.stop="penLeave"
                @mousedown.stop=""
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div class="cmDeg">
        <span v-if="cmNum > 0">{{ cmNum }}cm</span>
        <span v-if="textDeg != 0">{{ textDeg }}°</span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, reactive, watch } from "vue";
import { Close, RefreshRight, Sort } from "@element-plus/icons-vue";

const props = defineProps({
  cm: {
    type: Number,
    default: 0,
  },
});

const textDeg = computed(() => {
  return rotate.value.toFixed(0);
});

const top = ref(120);
const left = ref(220);
const width = ref(500);
const height = ref(500);
const rotate = ref(0);

let aWidth = ref(400);
let bWidth = ref(400);
let cWidth = ref(550);
let cboxWidth = ref(54);
let cboxHeight = ref(54);
let dboxWidth = ref(640);
let dboxHeight = ref(350);
let isSizeDragging = false;
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
let edge = null;
let triangleRuler = ref(null);
let cmNum = ref(props.cm);
let rulerDataAB = reactive([
  { val: 0 },
  { val: 1 },
  { val: 2 },
  { val: 3 },
  { val: 4 },
  { val: 5 },
  { val: 6 },
  { val: 7 },
  { val: 8 },
]);

let rulerDataC = reactive([
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
]);
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
  centerX =
    triangleRuler.value.offsetLeft + triangleRuler.value.clientWidth / 2;
  centerY =
    triangleRuler.value.offsetTop + triangleRuler.value.clientHeight / 2;
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
  isSizeDragging = true;
  document.addEventListener("mousemove", onDragSize);
  document.addEventListener("mouseup", stopDragSize);
}
const onDragSize = (event) => {
  if (isSizeDragging) {
    aWidth.value += event.clientX - aWidth.value - left.value + 66;
    bWidth.value = aWidth.value;
    cWidth.value = Math.sqrt(2) * aWidth.value - 16;
    dboxWidth.value = Math.sqrt(2) * aWidth.value;
    dboxHeight.value = dboxWidth.value;
    width.value = aWidth.value + 100;
    height.value = aWidth.value + 100;
  }
};

const stopDragSize = () => {
  isSizeDragging = false;
  console.log("bWidth", bWidth.value);
  document.removeEventListener("mousemove", onDragSize);
  document.removeEventListener("mouseup", stopDragSize);
};

const penEnter = (e, edge) => {
  usePen = true;
  edge = edge;
};
const penLeave = () => {
  usePen = false;
  edge = null;
};
const handleClose = () => {
  return false;
};
function handleAdd() {
  width.value += 10;
  height.value += 10;
}
function handleAddccc() {}

watch(
  [() => aWidth.value, () => cWidth.value],
  ([newValue1, newValue2], [oldValue1, oldValue2]) => {
    console.log("watch", newValue1, newValue2);
    rulerDataAB = [];
    for (let i = 0; i < (newValue1 / 50).toFixed(0); i++) {
      rulerDataAB.push({ val: i });
    }
    rulerDataC = [];
    for (let i = 0; i < (newValue2 / 50).toFixed(0); i++) {
      rulerDataC.push({ val: i });
    }
  }
);

/**
 * 方法
 * @param {*} top 距离顶部
 * @param {*} left 距离左边
 * @param {*} width 宽度
 * @param {*} height 高度
 * @param {*} rotate 旋转角度
 * @param {*} usePen 是否使用画笔
 * @param {*} edge 边界
 * @param {*} handleClose 关闭
 */
defineExpose({
  top,
  left,
  width,
  height,
  rotate,
  usePen,
  edge,
  handleClose,
});
</script>
<style lang="scss" scoped>
.sbbox {
  width: 100px;
  height: 100px;
}
.usePen{
  // background-color: rgba(250, 235, 215, 0.705);
}
.triangleRuler {
  // background: #ccc;
  background-image: url("@/assets/ruler-bg.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  .a {
    height: 24px;
    transform: rotate(-90deg);
    transform-origin: left top;
    // background-color: green;
    background-image: url("@/assets/ruler.png");
    // background-repeat: repeat-x;
    background-size: 750px 24px;
    background-position: left top;
    position: absolute;
    left: 0px;
    bottom: 0px;
    .usePenBox {
      .usePen {
        width: 100%;
        height: 30px;
        
        position: absolute;
        left: 0px;
        top: -20px;
        cursor: pointer;
      }
      .numbox {
        width: 100%;
        height: 100%;
        display: flex;
        flex-wrap: nowrap; /* 禁止换行 */
        // overflow-y: hidden;
        .num {
          width: 50px;
          // background-color: rgba($color: #000000, $alpha: 0.3);
          transform: translate(-23.5px, 20px);
          text-align: center;
          flex-shrink: 0;
        }
      }
    }
  }
  .b {
    height: 24px;
    margin-left: 24px;
    // background-color: cadetblue;
    background-image: url("@/assets/ruler-b.png");
    background-repeat: repeat-x;
    background-size: 750px 24px;
    background-position: left top;
    position: absolute;
    left: 0px;
    bottom: 0px;
    .usePenBox {
      .usePen {
        width: 100%;
        height: 30px;
       
        position: absolute;
        left: 0px;
        top: 18px;
        cursor: pointer;
      }
      .numbox {
        width: 100%;
        height: 100%;
        display: flex;
        flex-wrap: nowrap; /* 禁止换行 */
        .num {
          width: 50px;
          // background-color: rgba($color: #000000, $alpha: 0.3);
          transform: rotate(0deg) translate(-24px, -20px);
          text-align: center;
          flex-shrink: 0;
        }
      }
    }
  }
  .cbox {
    position: absolute;
    left: 25px;
    bottom: 25px;
    transform: rotate(-45deg);
    .cc {
      position: relative;
      width: 100%;
      height: 100%;
      // background-color: red;
    }
    .c {
      height: 24px;
      // background-color: goldenrod;
      background-image: url("@/assets/ruler.png");
      // background-repeat: repeat-x;
      background-size: 750px 24px;
      transform: rotate(90deg);
      position: absolute;
      left: calc(50% - 6px);
      top: calc(50% - 12px);
      transform: rotate(90deg);
    
      .numbox {
        width: 100%;
        height: 100%;
        display: flex;
        flex-wrap: nowrap; /* 禁止换行 */
        // overflow-y: hidden;
        .num {
          width: 50px;
          // background-color: rgba($color: #000000, $alpha: 0.3);
          transform: translate(-23.5px, 20px);
          text-align: center;
          flex-shrink: 0;
        }
      }
      .dragbox {
        position: absolute;
        cursor: move;
        // background-color: rgba(0, 255, 255, 0.288);
      }
      .controls {
        height: 100%;
        width: 100%;
        position: relative;
        .usePen {
        width: 100%;
        height: 30px;
        
        position: absolute;
        left: 0px;
        top: -42px;
        cursor: pointer;
      }
        .close {
          position: absolute;
          left: 80px;
          bottom: -40px;
          transform: rotate(45deg);
          z-index: 1;
        }
        .rotation {
          position: absolute;
          left: calc(50% - 40px);
          top: calc(50% + 20px);
          z-index: 1;
        }
        .size {
          position: absolute;
          right: 80px;
          bottom: -40px;
          transform: rotate(45deg);
          z-index: 1;
        }
      }
    }
  }
  .usePenBox {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .cmDeg {
    position: absolute;
    left: calc(50% - 160px);
    bottom: calc(50% - 140px);
    z-index: 1;
    font-size: 24px;
    width: 80px;
    text-align: center;
  }
}
</style>
