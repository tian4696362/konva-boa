<template>
  <canvas id="canvas" width="600" height="600"></canvas>
  <!-- <button @click="changePlane">开始</button> -->
  <!-- <button @click="ex">获取</button>
  <div style="width: 600px; margin: 10px">
    <div style="width: 50px">高度</div>
    <el-input-number
      v-model="box.height"
      :min="2"
      :max="10"
      @change="handleRHChange"
      :disabled="!isHalfCircle"
    />
    <div style="width: 50px">半径</div>
    <el-input-number
      v-model="box.radius"
      :min="2"
      :max="10"
      @change="handleRHChange"
      :disabled="!isHalfCircle"
    />
  </div> -->
</template>

<script setup>
import * as THREE from "three";
import TWEEN from "tween.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry.js";
import { ref, onMounted, reactive } from "vue";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0ffff);
const gridHelper = new THREE.GridHelper(20, 20);

const camera = new THREE.PerspectiveCamera(100, 500 / 500, 0.1, 500);
camera.position.set(9, 6, -2);
camera.lookAt(0, 0, 0);
let renderer = null;
const axesHelper = new THREE.AxesHelper(10);

scene.add(gridHelper);
scene.add(axesHelper);


onMounted(() => {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.getElementById("canvas"),
    alpha: true,
  });
  renderer.setSize(600, 600);

  const controls = new OrbitControls(camera, renderer.domElement);

  // 添加光源以便能看清3D形状
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

  // 绘制圆锥体
  const radius =2; // 底部半径
  const height = 3; // 高度
  
  // 参数化函数，生成圆锥体的点
  const coneFunction = (u, v, target) => {
    const r = radius * (1 - v); // 从底部到顶部，半径逐渐变小
    
    // 将u映射到π/2到5π/2的范围，跳过第一象限
    const theta = (u * Math.PI * 1.5) + Math.PI / 2; // 角度从π/2到2π再到5π/2
    
    const x = r * Math.cos(theta);
    const y = height * v; // v从0到1，对应高度从0到height
    const z = r * Math.sin(theta);
    
    target.set(x, y, z);
  };
  
  // 创建参数化几何体，分段数决定了模型的精细程度
  const coneGeometry = new ParametricGeometry(coneFunction, 32, 16);
  
  // 创建材质，设置颜色为#00e5ee
  const coneMaterial = new THREE.MeshPhongMaterial({
    color: 0x00e5ee,
    side: THREE.DoubleSide,
    flatShading: false,
  });
  
  // 创建圆锥体网格并添加到场景
  const coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);
    coneMesh.rotation.set(Math.PI/2,3*Math.PI/4,0)
  // coneMesh.position.set(0,3,0)
  scene.add(coneMesh);

  function animate() {
    requestAnimationFrame(animate);
    TWEEN.update(); // 更新TWEEN动画
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // 监听鼠标滚轮事件
  window.addEventListener(
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

});

function changePlane() {}


</script>

<style lang="scss" scoped></style>
