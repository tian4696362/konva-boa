<template>
  <div class="mask" ref="mask">
    <canvas id="canvas" ref="canvas" width="600" height="600"></canvas>

    <div class="closeBtn" v-show="draggable">
      <!-- <button @click="handeleCreate">创建立方体</button> -->
      <el-button text bg @click="handleAnimate" v-show="isHalfCircle"
        >展开</el-button
      >
      <el-button text bg @click="handleCloseAll" v-show="!isHalfCircle"
        >收起</el-button
      >
      <el-button
        text
        bg
        :type="enableRotate ? 'primary' : ''"
        @click="handleRotation"
        >旋转</el-button
      >
      <el-button text bg :type="enableGrid ? 'primary' : ''" @click="handleGrid"
        >网格</el-button
      >
    </div>

    <div class="sizeBtn" v-show="draggable">
      <div class="btnType">
        <div>颜色</div>
        <el-color-picker v-model="themeColor" @change="handleColor" :teleported="false" />
      </div>
      <div class="btnType">
        <div>高度</div>
        <el-input-number
          v-model="box.height"
          :min="2"
          :max="10"
          @change="handleRHChange"
          :disabled="!isHalfCircle"
          size="small"
        />
      </div>
      <div class="btnType">
        <div>半径</div>
        <el-input-number
          v-model="box.radius"
          :min="2"
          :max="10"
          @change="handleRHChange"
          :disabled="!isHalfCircle"
          size="small"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import * as THREE from "three";
import TWEEN from "tween.js";
import eventBus from "@/utils/eventBus";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry.js";
import { ref, onMounted, reactive } from "vue";
const props = defineProps({
  draggable: {
    type: Boolean,
    default: true,
  },
  
});
const box = reactive({
  radius: 2, //半径
  height: 4, //高
});

const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xf0ffff);
const gridHelper = new THREE.GridHelper(20, 20);

const camera = new THREE.PerspectiveCamera(100, 500 / 500, 0.1, 500);
camera.position.set(-9, 4, 0);
camera.lookAt(0, 0, 0);
let renderer = null;
const axesHelper = new THREE.AxesHelper(10);

scene.add(gridHelper);
// scene.add(axesHelper);

const isHalfCircle = ref(true);
let canvas = ref(null);
let controls = null;
let currentMesh = null;
let isAnimating = false;
let animationProgress = 0;
let animationDirection = 1; // 1 for circle to plane, -1 for plane to circle
let groupTop = null;
let groupBottom = null;
let mask = ref(null);
let enableRotate = ref(false);
let enableGrid = ref(true);
let themeColor = ref("#00e5ee");
// 圆
let topMaterial = null;
function circle() {
  const topGeometry = new THREE.CircleGeometry(box.radius, 32);
  topMaterial = new THREE.MeshBasicMaterial({
    color: themeColor.value,
    wireframe: false,
    transparent: true,
    side: THREE.DoubleSide,
    opacity: 0.8,
  });

  const circleTop = new THREE.Mesh(topGeometry, topMaterial);
  circleTop.name = "removeMesh";
  circleTop.position.set(-box.radius, 0, 0);
  circleTop.rotation.set(0, 0, 0);

  groupTop = new THREE.Group();
  groupTop.name = "removeMesh";
  groupTop.position.set(box.radius, box.height / 2, 0);
  groupTop.rotation.set(Math.PI / 2, 0, 0);
  groupTop.add(circleTop);
  scene.add(groupTop);

  const circleBottom = new THREE.Mesh(topGeometry, topMaterial);
  circleBottom.name = "removeMesh";
  circleBottom.position.set(-box.radius, 0, 0);
  circleBottom.rotation.set(0, 0, 0);

  groupBottom = new THREE.Group();
  groupBottom.name = "removeMesh";
  groupBottom.position.set(box.radius, -box.height / 2, 0);
  groupBottom.rotation.set(Math.PI / 2, 0, 0);
  groupBottom.add(circleBottom);
  scene.add(groupBottom);
}

function circleAnimate() {
  new TWEEN.Tween(groupTop.rotation)
    .to({ y: isHalfCircle.value ? -Math.PI / 2 : 0 }, 800) // 旋转到360度，持续2秒
    .yoyo(false)
    .start()
    .onComplete(function () {
      console.log("end");
    });

  new TWEEN.Tween(groupBottom.rotation)
    .to({ y: isHalfCircle.value ? Math.PI / 2 : 0 }, 800) // 旋转到360度，持续2秒
    .yoyo(false)
    .start()
    .onComplete(function () {
      console.log("end");
    });
}
// 定义参数化函数 - 根据动画进度在扇形和平面之间插值
function parametricAnimatedSurface(u, v, target) {
  const radius = box.radius; // 直接设置半径为4
  const sectorAngle = 360 * (Math.PI / 180); // 240度的扇形（大于180度）
  const circumference = sectorAngle * radius; // 扇形弧长

  const height = box.height; // 高度为6

  // u范围[0,1]映射到[-sectorAngle/2, sectorAngle/2]，使扇形左右对称
  const theta = u * sectorAngle - sectorAngle / 2;

  // 在扇形和平面之间插值
  // animationProgress: 0 = 扇形, 1 = 平面
  const circleX = radius * Math.cos(theta);
  const circleZ = radius * Math.sin(theta);

  // 映射u到平面的z坐标
  // 映射应该对称，从-circumference/2到circumference/2
  const planeZ = circumference * (u - 0.5);

  // 设置平面位于x=4的位置
  const planeX = box.radius;

  // 根据动画进度进行线性插值
  const x = circleX * (1 - animationProgress) + planeX * animationProgress;
  const z = circleZ * (1 - animationProgress) + planeZ * animationProgress;
  // 将y轴中心移到原点，需要将高度减半
  const y = v * height - height / 2;

  target.set(x, y, z);
  return target;
}

// 创建材质
const material = new THREE.MeshPhongMaterial({
  color: themeColor.value,
  wireframe: false,
  side: THREE.DoubleSide,
});

// 创建当前状态的几何体
function createCurrentGeometry() {
  const geometry = new ParametricGeometry(parametricAnimatedSurface, 75, 75);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "removeMesh";
  return mesh;
}

// 初始显示半圆
animationProgress = 0; // 0 = 半圆
currentMesh = createCurrentGeometry();
circle();
scene.add(currentMesh);

// 更新动画
function updateAnimation() {
  if (!isAnimating) return;

  // 根据方向更新动画进度
  animationProgress += 0.02 * animationDirection;

  // 限制动画进度在0到1之间
  if (animationProgress >= 1) {
    animationProgress = 1;
    isAnimating = false;
    isHalfCircle.value = false;
  } else if (animationProgress <= 0) {
    animationProgress = 0;
    isAnimating = false;
    isHalfCircle.value = true;
  }

  // 更新几何体
  scene.remove(currentMesh);
  currentMesh = createCurrentGeometry();
  scene.add(currentMesh);
}

// 切换几何体
function handleAnimate() {
  changePlane();
}
function handleCloseAll() {
  changePlane();
}
function changePlane() {
  if (isAnimating) return; // 如果正在动画中，忽略点击

  isAnimating = true;

  // 设置动画方向
  if (isHalfCircle.value) {
    // 从半圆到平面
    animationDirection = 1;
  } else {
    // 从平面到半圆
    animationDirection = -1;
  }
  circleAnimate();
}

onMounted(() => {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas.value,
    alpha: true,
  });
  renderer.setSize(600, 600);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableRotate = enableRotate.value; // 禁用相机旋转
  // 添加光源以便能看清3D形状
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    updateAnimation(); // 在每一帧更新动画
    TWEEN.update();
    renderer.render(scene, camera);
  }
  animate();

  // 监听鼠标滚轮事件
  mask.value.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const delta = event.deltaY;
      if (delta > 0) {
        camera.zoom -= 0.1;
      } else {
        camera.zoom += 0.1;
      }
      camera.zoom = Math.max(0.1, Math.min(5, camera.zoom));
      camera.updateProjectionMatrix();
    },
    { passive: false }
  );
  onWindowResize();
});
function onWindowResize() {
  const observer = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const width = entry.contentRect.width;
      const height = entry.contentRect.height;
      // 更新渲染器和摄像机
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  });

  observer.observe(mask.value); // targetElement 是要监听的 DOM 元素
}

function handleGrid() {
  enableGrid.value = !enableGrid.value;
  gridHelper.visible = enableGrid.value;
}
function handleRotation() {
  enableRotate.value = !enableRotate.value;
  controls.enableRotate = enableRotate.value;
  console.log("父controls.enableRotate");
  eventBus.emit("enableMove", enableRotate.value);
}
function handleRHChange() {
  removeMesh();
  currentMesh = createCurrentGeometry();
  circle();
  scene.add(currentMesh);
}

function removeMesh() {
  for (let i = scene.children.length - 1; i >= 0; i--) {
    const child = scene.children[i];
    if (child.name == "removeMesh") {
      disposeChild(child);
      scene.remove(child);
    }
  }
}

function disposeChild(child) {
  if (child.geometry) {
    child.geometry.dispose();
  }
  if (child.material) {
    if (Array.isArray(child.material)) {
      child.material.forEach((mat) => mat.dispose());
    } else {
      child.material.dispose();
    }
  }
}
function handleColor(e) {
  topMaterial.color.set(e);
  material.color.set(e);
}
function ex() {
  console.log(scene);
}
</script>

<style lang="scss" scoped>
.mask {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
  #canvas {
  }
  .closeBtn {
    position: absolute;
    bottom: 10px;
    left: 10px;
    display: flex;
    align-items: center;
  }
  .sizeBtn {
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 0;
    .btnType {
      display: flex;
      align-items: center;
      margin-top: 10px;
      font-size: 14px;
      z-index: 0; user-select: none;
      > div {
        margin-right: 8px;
      }
    }
  }
}
</style>
