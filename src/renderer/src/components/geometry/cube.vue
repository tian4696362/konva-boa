<template>
  <div class="mask" ref="mask">
    <canvas id="canvas" ref="canvas"></canvas>
    <!-- <div class="type">
      {{ type }}
      <div class="num">
        <div @click="handleSelectType(1411)">1411</div>
        <div @click="handleSelectType(1412)">1412</div>
        <div @click="handleSelectType(1413)">1413</div>
        <div @click="handleSelectType(1414)">1414</div>
        <div @click="handleSelectType(1415)">1415</div>
        <div @click="handleSelectType(1416)">1416</div>
        <div @click="handleSelectType(1321)">1321</div>
        <div @click="handleSelectType(1322)">1322</div>
        <div @click="handleSelectType(1323)">1323</div>
        <div @click="handleSelectType(222)">222</div>
        <div @click="handleSelectType(33)">33</div>
      </div>
      <img src="../../assets/rect3d.jpg" alt="" />
    </div> -->
    <div class="closeBtn" v-show="draggable">
      <!-- <button @click="handeleCreate">创建立方体</button> -->
      <el-button text bg @click="handleAnimate" v-show="!open">展开</el-button>
      <el-button text bg @click="handleCloseAll" v-show="open">收起</el-button>
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
        <el-color-picker
          v-model="themeColor"
          @change="handleColor"
          :teleported="false"
        />
      </div>
      <div class="btnType">
        <div>宽度</div>
        <el-input-number
          v-model="box.width"
          :min="4"
          :max="10"
          @change="handleWaChange"
          size="small"
        />
      </div>
      <div class="btnType">
        <div>高度</div>
        <el-input-number
          v-model="box.height"
          :min="4"
          :max="10"
          @change="handleHaChange"
          size="small"
        />
      </div>
      <div class="btnType">
        <div>长度</div>
        <el-input-number
          v-model="box.length"
          :min="4"
          :max="10"
          @change="handleLaChange"
          size="small"
        />
      </div>
    </div>
  </div>
  <!-- <div style="margin-top: 10px; display: flex">
    时间轴
    <el-slider
      v-model="timer"
      :min="0"
      :max="1"
      :step="0.01"
      @input="handleChange"
    />
  </div> -->
</template>
<script setup>
import * as THREE from "three";
import TWEEN from "tween.js";
import gsap from "gsap";
import { throttle } from "lodash";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { onMounted, ref, reactive, watch } from "vue";
import eventBus from "@/utils/eventBus";
import CubeGroup from "./cubeGroup.js";
import cubeAnimate from "./cubeAnimate.js";
import { raycasterTarget } from "../../utils/geometry.js";

const props = defineProps({
  draggable: {
    type: Boolean,
    default: false,
  },
  cubeType: {
    type: Number,
  },
  top: {
    type: Number,
    default: 0,
  },
  left: {
    type: Number,
    default: 0,
  },
});

const {
  rectAnimateOpen33,
  rectAnimateOpen222,
  rectAnimateOpen1321,
  rectAnimateOpen1322,
  rectAnimateOpen1323,
  rectAnimateOpen1411,
  rectAnimateOpen1412,
  rectAnimateOpen1413,
  rectAnimateOpen1414,
  rectAnimateOpen1415,
  rectAnimateOpen1416,
  rectAnimateClose33,
  rectAnimateClose222,
  rectAnimateClose1321,
  rectAnimateClose1322,
  rectAnimateClose1323,
  rectAnimateClose1411,
  rectAnimateClose1412,
  rectAnimateClose1413,
  rectAnimateClose1414,
  rectAnimateClose1415,
  rectAnimateClose1416,
} = cubeAnimate(); //动画

let mask = ref(null);
let open = ref(false);
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xf0ffff); // 背景
const gridHelper = new THREE.GridHelper(20, 20); // 网格大小为 10x10，分割为 10x10 的格子

const camera = new THREE.PerspectiveCamera(100, 100 / 500, 0.1, 500);
camera.position.set(-6, 6, 8); // 设置相机位置
camera.lookAt(10, 12, 0);
let canvas = ref(null);
let renderer = null;
let controls = null;
let enableRotate = ref(false);
let enableGrid = ref(true);
// const axesHelper = new THREE.AxesHelper(10); //添加坐标系

scene.add(gridHelper);
// scene.add(axesHelper);

const box = reactive({
  width: 4, //宽
  height: 4, //高
  length: 4, //长
});

// 创建时间轴动画
const timelineGroup = gsap.timeline();
const timeline = ref(null);
const speed = 1000; //动画速度
let type = ref(props.cubeType); //当前展开类型
let timer = ref(0);
let themeColor = ref("#00e5ee");
let themeColorUse = ref(false);
//33
const faceLeftTop33 = {
  group: null,
  points: [],
  position: { x: -2, y: 0, z: 0 },
  rotation: { x: -Math.PI / 2, y: Math.PI / 2, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      name: "groupleft",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: -2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "left",
          bgColor: 0xffdab9,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    {
      group: null,
      name: "grouptop",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: -4, y: 0, z: 0 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "top",
          bgColor: 0x00e5ee,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: -2, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
};
const faceBottom33 = {
  group: null,
  points: [],
  position: { x: 0, y: 0, z: 0 },
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      childs: [
        {
          plane: null,
          name: "bottom",
          bgColor: 0x000000,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
  rotation: { x: Math.PI / 2, y: 0, z: 0 },
};
const faceBackRightFront33 = {
  group: null,
  points: [],
  position: { x: 0, y: 0, z: -2 },
  rotation: { x: 0, y: 0, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      name: "groupback",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 2, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "back",
          bgColor: 0xee6363,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },

    {
      group: null,
      name: "rightfront",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 2, y: 0, z: 0 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      axesHelper: false,
      childs: [
        {
          group: null,
          name: "groupright",
          translate: { x: 0, y: 0, z: 0 },
          position: { x: -2, y: 2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
          childs: [
            {
              plane: null,
              name: "right",
              bgColor: 0xffffff,
              translate: { x: 0, y: 0, z: 0 },
              position: { x: 0, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              axesHelper: false,
            },
          ],
        },
        {
          group: null,
          name: "groupfront",
          translate: { x: 0, y: 0, z: 0 },
          position: { x: -4, y: 2, z: 0 },
          rotation: { x: 0, y: -Math.PI / 2, z: 0 },
          axesHelper: false,
          childs: [
            {
              plane: null,
              name: "front",
              bgColor: 0xffff00,
              translate: { x: 0, y: 0, z: 0 },
              position: { x: -2, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              axesHelper: false,
            },
          ],
        },
      ],
    },
  ],
};

//22
const faceRightBackTop222 = {
  group: null,
  name: "faceRightTopFront1415",
  points: [],
  position: { x: 2, y: 0, z: 0 },
  rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      name: "groupright",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "right",
          bgColor: 0xffffff,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    {
      group: null,
      name: "topbackgroup",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: -2, z: 0 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      axesHelper: false,
      childs: [
        {
          group: null,
          name: "back",
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 2, y: 0, z: 2 },
          rotation: { x: Math.PI / 2, y: 0, z: 0 },
          axesHelper: false,
          childs: [
            {
              plane: null,
              name: "back",
              bgColor: 0xee6363,
              name: "backback",
              translate: { x: 0, y: 0, z: 0 },
              position: { x: 0, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              axesHelper: false,
            },
          ],
        },
        {
          group: null,
          name: "top",
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 4 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
          childs: [
            {
              plane: null,
              name: "top",
              bgColor: 0x00e5ee,
              name: "toptop",
              translate: { x: 0, y: 0, z: 0 },
              position: { x: 2, y: 2, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              axesHelper: false,
            },
          ],
        },
      ],
    },
  ],
};
const faceBottom222 = {
  group: null,
  points: [],
  position: { x: 0, y: 0, z: 0 },
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      childs: [
        {
          plane: null,
          name: "bottom",
          bgColor: 0x000000,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
  rotation: { x: Math.PI / 2, y: 0, z: 0 },
};
const faceFrontLeft222 = {
  group: null,
  points: [],
  position: { x: 0, y: 0, z: 2 },
  rotation: { x: 0, y: 0, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      name: "groupfront",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "front",
          bgColor: 0xffff00,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    {
      group: null,
      name: "groupleft",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: -2, y: 0, z: 0 },
      rotation: { x: 0, y: -Math.PI / 2, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "left",
          bgColor: 0xffdab9,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: -2, y: 2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
};
//1321
const faceRightTop1321 = {
  group: null,
  points: [],
  position: { x: 2, y: 0, z: 0 },
  rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "right",
          bgColor: 0xffffff,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 4, y: 0, z: 0 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "top",
          bgColor: 0x00e5ee,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 2, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
  ],
};
const faceBottom1321 = {
  group: null,
  points: [],
  position: { x: 0, y: 0, z: 0 },
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      childs: [
        {
          plane: null,
          name: "bottom",
          bgColor: 0x000000,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
  rotation: { x: Math.PI / 2, y: 0, z: 0 },
};
const faceFront1321 = {
  group: null,
  points: [],
  position: { x: 0, y: 0, z: 2 },
  translate: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "front",
          bgColor: 0xffff00,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
};
const faceBackLeft1321 = {
  group: null,
  points: [],
  position: { x: 0, y: 0, z: -2 },
  rotation: { x: 0, y: 0, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "back",
          bgColor: 0xee6363,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: -2, y: 0, z: 0 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "left",
          bgColor: 0xffdab9,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: -2, y: 2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
};
//1322
const faceLeft1322 = {
  group: null,
  points: [],
  position: { x: -2, y: 0, z: 0 },
  rotation: { x: -Math.PI / 2, y: Math.PI / 2, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: -2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "left",
          bgColor: 0xffdab9,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
};
const faceFront1322 = {
  group: null,
  points: [],
  position: { x: 0, y: 0, z: 2 },
  translate: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "front",
          bgColor: 0xffff00,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
};
const faceRightBackTop1322 = {
  group: null,
  name: "faceRightTopFront1415",
  points: [],
  position: { x: 2, y: 0, z: 0 },
  rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      name: "groupright",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "right",
          bgColor: 0xffffff,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    {
      group: null,
      name: "topbackgroup",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: -2, z: 0 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      axesHelper: false,
      childs: [
        {
          group: null,
          name: "back",
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 2, y: 0, z: 2 },
          rotation: { x: Math.PI / 2, y: 0, z: 0 },
          axesHelper: false,
          childs: [
            {
              plane: null,
              bgColor: 0xee6363,
              name: "back",
              translate: { x: 0, y: 0, z: 0 },
              position: { x: 0, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              axesHelper: false,
            },
          ],
        },
        {
          group: null,
          name: "top",
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 4 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
          childs: [
            {
              plane: null,
              bgColor: 0x00e5ee,
              name: "top",
              translate: { x: 0, y: 0, z: 0 },
              position: { x: 2, y: 2, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              axesHelper: false,
            },
          ],
        },
      ],
    },
  ],
};
const faceBottom1322 = {
  group: null,
  points: [],
  position: { x: 0, y: 0, z: 0 },
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      childs: [
        {
          plane: null,
          name: "bottom",
          bgColor: 0x000000,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
  rotation: { x: Math.PI / 2, y: 0, z: 0 },
};
//1323
const faceRightBackTop1323 = {
  group: null,
  name: "faceRightTopFront1415",
  points: [],
  position: { x: 2, y: 0, z: 0 },
  rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      name: "groupright",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "right",
          bgColor: 0xffffff,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    {
      group: null,
      name: "topbackgroup",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: -2, z: 0 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      axesHelper: false,
      childs: [
        {
          group: null,
          name: "back",
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 2, y: 0, z: 2 },
          rotation: { x: Math.PI / 2, y: 0, z: 0 },
          axesHelper: false,
          childs: [
            {
              plane: null,
              bgColor: 0xee6363,
              name: "back",
              translate: { x: 0, y: 0, z: 0 },
              position: { x: 0, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              axesHelper: false,
            },
          ],
        },
        {
          group: null,
          name: "top",
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 4 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
          childs: [
            {
              plane: null,
              bgColor: 0x00e5ee,
              name: "top",
              translate: { x: 0, y: 0, z: 0 },
              position: { x: 2, y: 2, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              axesHelper: false,
            },
          ],
        },
      ],
    },
  ],
};
const faceLeftFront1323 = {
  group: null,
  name: "faceLeftFront1323",
  points: [],
  position: { x: -2, y: 0, z: 0 },
  rotation: { x: -Math.PI / 2, y: Math.PI / 2, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      name: "groupleft",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: -2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "left",
          bgColor: 0xffdab9,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    {
      group: null,
      name: "faceFront",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: -2, y: -2, z: 0 },
      rotation: { x: -Math.PI / 2, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "front",
          bgColor: 0xffff00,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: -2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
};
const faceBottom1323 = {
  group: null,
  points: [],
  position: { x: 0, y: 0, z: 0 },
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      childs: [
        {
          plane: null,
          name: "bottom",
          bgColor: 0x000000,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
  rotation: { x: Math.PI / 2, y: 0, z: 0 },
};

//1411
const faceLeftBack1411 = {
  group: null,
  name: "faceLeftBack1411",
  points: [],
  position: { x: -2, y: 0, z: 0 },
  rotation: { x: -Math.PI / 2, y: Math.PI / 2, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      name: "groupleft",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: -2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "left",
          bgColor: 0xffdab9,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    {
      group: null,
      name: "groupback",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 2, z: 0 },
      rotation: { x: Math.PI / 2, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "back",
          bgColor: 0xee6363,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: -2, y: 2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
};
const faceRightTopFront1411 = {
  group: null,
  points: [],
  position: { x: 2, y: 0, z: 0 },
  rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "right",
          bgColor: 0xffffff,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    {
      group: null,
      name: "topFrontgroup",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 4, y: 0, z: 0 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      axesHelper: false,
      childs: [
        {
          group: null,
          name: "topgroup",
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 2, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
          childs: [
            {
              plane: null,
              name: "top",
              bgColor: 0x00e5ee,
              translate: { x: 0, y: 0, z: 0 },
              position: { x: 0, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              axesHelper: false,
            },
          ],
        },
        {
          group: null,
          name: "Frontgroup",
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 2, y: 2, z: 0 },
          rotation: { x: 0, y: 0, z: Math.PI / 2 },
          axesHelper: false,
          childs: [
            {
              plane: null,
              name: "front",
              bgColor: 0xffff00,
              translate: { x: 0, y: 0, z: 0 },
              position: { x: 0, y: 0, z: -2 },
              rotation: { x: 0, y: Math.PI / 2, z: 0 },
              axesHelper: false,
            },
          ],
        },
      ],
    },
  ],
};
const faceBottom1411 = {
  group: null,
  points: [],
  position: { x: 0, y: 0, z: 0 },
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      childs: [
        {
          plane: null,
          name: "bottom",
          bgColor: 0x000000,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
  rotation: { x: Math.PI / 2, y: 0, z: 0 },
};
//1412
const faceLeftBack1412 = {
  group: null,
  name: "faceLeftBack1412",
  points: [],
  position: { x: -2, y: 0, z: 0 },
  rotation: { x: -Math.PI / 2, y: Math.PI / 2, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      name: "groupleft",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: -2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "left",
          bgColor: 0xffdab9,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    {
      group: null,
      name: "groupback",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 2, z: 0 },
      rotation: { x: Math.PI / 2, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "back",
          bgColor: 0xee6363,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: -2, y: 2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
};
const faceRightTop1412 = {
  group: null,
  points: [],
  position: { x: 2, y: 0, z: 0 },
  rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "right",
          bgColor: 0xffffff,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 4, y: 0, z: 0 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "top",
          bgColor: 0x00e5ee,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 2, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
  ],
};
const faceFront1412 = {
  group: null,
  points: [],
  position: { x: 0, y: 0, z: 2 },
  translate: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "front",
          bgColor: 0xffff00,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
};
const faceBottom1412 = {
  group: null,
  points: [],
  position: { x: 0, y: 0, z: 0 },
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      childs: [
        {
          plane: null,
          name: "bottom",
          bgColor: 0x000000,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
  rotation: { x: Math.PI / 2, y: 0, z: 0 },
};
//1413
const faceBottom1413 = {
  group: null,
  points: [],
  position: { x: 0, y: 0, z: 0 },
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      childs: [
        {
          plane: null,
          name: "bottom",
          bgColor: 0x000000,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
  rotation: { x: Math.PI / 2, y: 0, z: 0 },
};
const faceRightTopFront1413 = {
  group: null,
  name: "faceRightTopFront1415",
  points: [],
  position: { x: 2, y: 0, z: 0 },
  rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      name: "groupright",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "right",
          bgColor: 0xffffff,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    {
      group: null,
      name: "grouptop",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 4, y: 0, z: 0 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "top",
          bgColor: 0x00e5ee,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 2, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    {
      group: null,
      name: "groupfront",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 2, z: 0 },
      rotation: { x: Math.PI / 2, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "front",
          bgColor: 0xffff00,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 2, y: -2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
  ],
};
const faceLeftBack1413 = {
  group: null,
  name: "faceLeftBack1413",
  points: [],
  position: { x: -2, y: 0, z: 0 },
  rotation: { x: -Math.PI / 2, y: Math.PI / 2, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      name: "groupleft",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: -2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "left",
          bgColor: 0xffdab9,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    {
      group: null,
      name: "groupback",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 2, z: 0 },
      rotation: { x: Math.PI / 2, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "back",
          bgColor: 0xee6363,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: -2, y: 2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
};
//1414
const faceBottom1414 = {
  group: null,
  points: [],
  position: { x: 0, y: 0, z: 0 },
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      childs: [
        {
          plane: null,
          name: "bottom",
          bgColor: 0x000000,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
  rotation: { x: Math.PI / 2, y: 0, z: 0 },
};
const faceRightTop1414 = {
  group: null,
  points: [],
  position: { x: 2, y: 0, z: 0 },
  rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "right",
          bgColor: 0xffffff,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 4, y: 0, z: 0 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "top",
          bgColor: 0x00e5ee,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 2, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
  ],
};
const faceLeftBackFront1414 = {
  group: null,
  points: [],
  position: { x: -2, y: 0, z: 0 },
  rotation: { x: -Math.PI / 2, y: Math.PI / 2, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      name: "groupleft",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: -2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "left",
          bgColor: 0xffdab9,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    {
      group: null,
      name: "groupfront",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: -2, z: 0 },
      rotation: { x: Math.PI / 2, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "front",
          bgColor: 0xffff00,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: -2, y: 2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    {
      group: null,
      name: "groupback",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 2, z: 0 },
      rotation: { x: Math.PI / 2, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "back",
          bgColor: 0xee6363,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: -2, y: 2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
};
//1415
const faceBottom1415 = {
  group: null,
  points: [],
  position: { x: 0, y: 0, z: 0 },
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      childs: [
        {
          plane: null,
          name: "bottom",
          bgColor: 0x000000,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
  rotation: { x: Math.PI / 2, y: 0, z: 0 },
};
const faceLeft1415 = {
  group: null,
  points: [],
  position: { x: -2, y: 0, z: 0 },
  rotation: { x: -Math.PI / 2, y: Math.PI / 2, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: -2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "left",
          bgColor: 0xffdab9,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
};
const faceBack1415 = {
  group: null,
  points: [],
  position: { x: 0, y: 0, z: -2 },
  rotation: { x: 0, y: 0, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "back",
          bgColor: 0xee6363,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
};

const faceRightTopFront1415 = {
  group: null,
  name: "faceRightTopFront1415",
  points: [],
  position: { x: 2, y: 0, z: 0 },
  rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      name: "groupright",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "right",
          bgColor: 0xffffff,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    {
      group: null,
      name: "grouptop",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 4, y: 0, z: 0 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "top",
          bgColor: 0x00e5ee,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 2, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    {
      group: null,
      name: "groupfront",
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 2, z: 0 },
      rotation: { x: Math.PI / 2, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          name: "front",
          bgColor: 0xffff00,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 2, y: -2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
  ],
};

// 1416数据
const faceBottom = {
  group: null,
  points: [],
  position: { x: 0, y: 0, z: 0 },
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      childs: [
        {
          plane: null,
          bgColor: 0x000000,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
  rotation: { x: Math.PI / 2, y: 0, z: 0 },
};

const faceLeft = {
  group: null,
  points: [],
  position: { x: -2, y: 0, z: 0 },
  rotation: { x: -Math.PI / 2, y: Math.PI / 2, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: -2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          bgColor: 0xffdab9,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
};

const faceBack = {
  group: null,
  points: [],
  position: { x: 0, y: 0, z: -2 },
  rotation: { x: 0, y: 0, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          bgColor: 0xee6363,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
};

const faceFront = {
  group: null,
  points: [],
  position: { x: 0, y: 0, z: 2 },
  translate: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          bgColor: 0xffff00,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    ,
  ],
};

const faceRightTop = {
  group: null,
  points: [],
  position: { x: 2, y: 0, z: 0 },
  rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 },
  axesHelper: false,
  face: [
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          bgColor: 0xffffff,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
    {
      group: null,
      translate: { x: 0, y: 0, z: 0 },
      position: { x: 4, y: 0, z: 0 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      axesHelper: false,
      childs: [
        {
          plane: null,
          bgColor: 0x00e5ee,
          translate: { x: 0, y: 0, z: 0 },
          position: { x: 2, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          axesHelper: false,
        },
      ],
    },
  ],
};

onMounted(() => {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas.value,
  });
  renderer.setClearAlpha(0);

  controls = new OrbitControls(camera, renderer.domElement); // 创建OrbitControls
  controls.enableRotate = enableRotate.value; // 禁用相机旋转
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    TWEEN.update();
    renderer.render(scene, camera);
  }
  animate(); // 动画循环

  // 监听鼠标滚轮事件
  mask.value.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault(); // 阻止默认行为
      const delta = event.deltaY; // 获取滚轮的滚动量
      // 调整相机的 zoom 属性
      if (delta > 0) {
        camera.zoom -= 0.1; // 放大
      } else {
        camera.zoom += 0.1; // 缩小
      }
      // 确保 zoom 值在合理范围内
      camera.zoom = Math.max(0.1, Math.min(5, camera.zoom));
      // 更新相机的投影矩阵
      camera.updateProjectionMatrix();
    },
    { passive: false }
  ); // 明确指定该事件监听器不是被动的

  const observer = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const width = entry.contentRect.width;
      const height = entry.contentRect.height;
      console.log(width, height);
      // 更新渲染器和摄像机
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  });

  observer.observe(mask.value);

  // 监听鼠标点击事件
  // .style.cursor = 'url("path/to/your/custom/cursor.png"), auto'; // 自定义光标图片
  mask.value.addEventListener("click", (event) => {
    if (!themeColorUse.value) {
      return;
    }
    const intersectedObject = raycasterTarget(
      scene,
      camera,
      mask,
      props.left,
      props.top,
      event
    );
    //改变颜色

    if (intersectedObject) {
      intersectedObject.material.color.set(themeColor.value);
      themeColorUse.value = false;
    }
  });
});


function handleChange(e) {
  console.log(e, timer.value);
  timelineGroup.pause();
  timelineGroup.progress(timer.value);
}
function getxxxx() {
  console.log(scene);
}
function waListener() {
  console.log(box.width, box.width / 2);
  if (type.value == "33") {
    rectBottom33.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectLeftTop33.face[1].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectBackRightFront33.face[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.height);
    rectBackRightFront33.face[1].childs[1].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.height);
    rectLeftTop33.group.position.x = -box.width / 2;
    rectLeftTop33.face[1].childs[0].plane.position.x = -box.width / 2;
    rectBackRightFront33.face[1].group.position.x = box.width / 2;
    rectBackRightFront33.face[1].childs[1].childs[0].plane.position.x =
      -box.width / 2;
  }
  if (type.value == "222") {
    rectBottom222.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectRightBackTop222.face[1].childs[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.height);
    rectRightBackTop222.face[1].childs[1].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.length);
    rectRightBackTop222.face[0].group.position.z = (box.width - 4) / 2;
    rectRightBackTop222.face[0].childs[0].plane.position.z =
      -(box.width - 4) / 2;
    rectRightBackTop222.face[1].childs[0].childs[0].plane.position.x =
      (box.width - 4) / 2;
    rectRightBackTop222.face[1].childs[1].childs[0].plane.position.x =
      box.width / 2;
    rectRightBackTop222.group.position.x = box.width / 2;
    rectFrontLeft222.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.height
    );
    rectFrontLeft222.face[1].group.position.x = -box.width / 2;
  }
  if (type.value == "1323") {
    rectBottom1323.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectRightBackTop1323.face[1].childs[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.height);
    rectRightBackTop1323.face[1].childs[1].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.length);
    rectRightBackTop1323.face[0].group.position.z = (box.width - 4) / 2;
    rectRightBackTop1323.face[0].childs[0].plane.position.z =
      -(box.width - 4) / 2;
    rectRightBackTop1323.face[1].childs[0].childs[0].plane.position.x =
      (box.width - 4) / 2;
    rectRightBackTop1323.face[1].childs[1].childs[0].plane.position.x =
      box.width / 2;
    rectRightBackTop1323.group.position.x = box.width / 2;

    rectLeftFront1323.face[1].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.width);
    rectLeftFront1323.group.position.x = -box.width / 2;
    rectLeftFront1323.face[1].childs[0].plane.position.y = -box.width / 2;
  }
  if (type.value == "1322") {
    rectLeft1322.group.position.x = -box.width / 2;
    rectBottom1322.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectFront1322.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.height
    );
    rectFront1322.group.position.z = 2 + (box.length - 4) / 2;
    rectRightBackTop1322.face[1].childs[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.height);
    rectRightBackTop1322.face[1].childs[1].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.length);
    rectRightBackTop1322.face[0].group.position.z = (box.width - 4) / 2;
    rectRightBackTop1322.face[0].childs[0].plane.position.z =
      -(box.width - 4) / 2;
    rectRightBackTop1322.face[1].childs[0].childs[0].plane.position.x =
      (box.width - 4) / 2;
    rectRightBackTop1322.face[1].childs[1].childs[0].plane.position.x =
      box.width / 2;
    rectRightBackTop1322.group.position.x = box.width / 2;
  }
  if (type.value == "1321") {
    rectFront1321.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.height
    );
    rectBackLeft1321.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.height
    );
    rectBottom1321.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectRightTop1321.face[1].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectRightTop1321.group.position.x = box.width / 2;
    rectRightTop1321.face[1].childs[0].plane.position.x = box.width / 2;
    rectBackLeft1321.face[1].group.position.x = -box.width / 2;
  }
  if (type.value == "1411") {
    rectBottom1411.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectLeftBack1411.face[1].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.width
    );
    rectLeftBack1411.group.position.x = -box.width / 2;
    rectLeftBack1411.face[1].childs[0].plane.position.y = box.width / 2;
    rectRightTopFront1411.face[1].childs[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.length);
    rectRightTopFront1411.face[1].childs[1].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.width);

    rectRightTopFront1411.group.position.x = box.width / 2;
    rectRightTopFront1411.face[1].childs[0].group.position.x = box.width / 2;

    rectRightTopFront1411.face[1].childs[1].group.position.x = box.width / 2;
  }
  if (type.value == "1412") {
    rectBottom1412.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectFront1412.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.height
    );
    rectLeftBack1412.face[1].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.width
    );
    rectLeftBack1412.group.position.x = -box.width / 2;
    rectLeftBack1412.face[1].childs[0].plane.position.y = box.width / 2;
    rectRightTop1412.face[1].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectRightTop1412.group.position.x = box.width / 2;
    rectRightTop1412.face[1].childs[0].plane.position.x = box.width / 2;
  }
  if (type.value == "1413") {
    rectLeftBack1413.face[1].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.width
    );
    rectLeftBack1413.group.position.x = -box.width / 2;
    rectLeftBack1413.face[1].childs[0].plane.position.y = box.width / 2;
    rectBottom1413.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectRightTopFront1413.face[1].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.length);
    rectRightTopFront1413.face[2].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.width);
    rectRightTopFront1413.group.position.x = box.width / 2;
    rectRightTopFront1413.face[1].childs[0].plane.position.x = box.width / 2;
    rectRightTopFront1413.face[2].childs[0].plane.position.y = -box.width / 2;
  }
  if (type.value == "1414") {
    rectBottom1414.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.height
    );
    rectRightTop1414.face[1].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.height
    );
    rectLeftBackFront1414.face[1].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.width);
    rectLeftBackFront1414.face[2].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.width);
    rectRightTop1414.group.position.x = box.width / 2;
    rectRightTop1414.face[1].childs[0].plane.position.x = box.width / 2;
    rectLeftBackFront1414.group.position.x = -(box.width / 2);
    rectLeftBackFront1414.face[1].childs[0].plane.position.y = box.width / 2;
    rectLeftBackFront1414.face[2].childs[0].plane.position.y = box.width / 2;
  }
  if (type.value == "1415") {
    rectBack1415.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.height
    );
    rectBottom1415.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectRightTopFront1415.face[1].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.length);
    rectRightTopFront1415.face[2].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.width);
    rectLeft1415.group.position.x = -box.width / 2;
    rectRightTopFront1415.group.position.x = box.width / 2;
    rectRightTopFront1415.face[1].childs[0].plane.position.x = box.width / 2;
    rectRightTopFront1415.face[2].childs[0].plane.position.y = -box.width / 2;
  }
  if (type.value == "1416") {
    rectFront.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.height
    );

    rectBack.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.height
    );
    rectBottom.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.height
    );
    rectRightTop.face[1].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectLeft.group.position.x = -box.width / 2;

    rectRightTop.group.position.x = box.width / 2;
    rectRightTop.face[1].childs[0].plane.position.x = box.width / 2;
  }
}

function haListener() {
  topGroup.position.y = (box.height - 4) / 2;
  if (type.value == "33") {
    rectBottom33.group.position.y = -(box.height - 4) / 2;
    rectBackRightFront33.group.position.y = -(box.height - 4) / 2;
    rectLeftTop33.group.position.y = -(box.height - 4) / 2;
    rectLeftTop33.face[0].group.position.x = -box.height / 2;
    rectLeftTop33.face[1].group.position.x = -box.height;
    rectLeftTop33.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectBackRightFront33.face[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.height);
    rectBackRightFront33.face[1].childs[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.length, box.height);
    rectBackRightFront33.face[1].childs[1].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.height);
    rectBackRightFront33.face[0].group.position.y = box.height / 2;
    rectBackRightFront33.face[1].childs[0].group.position.y = box.height / 2;
    rectBackRightFront33.face[1].childs[1].group.position.y = box.height / 2;
  }
  if (type.value == "222") {
    rectBottom222.group.position.y = -(box.height - 4) / 2;
    rectRightBackTop222.face[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.length);
    rectRightBackTop222.face[1].childs[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.height);

    rectRightBackTop222.group.position.y = -(box.height - 4) / 2;

    rectRightBackTop222.face[0].group.position.x = box.height / 2;
    rectRightBackTop222.face[1].childs[0].childs[0].plane.position.y =
      (box.height - 4) / 2;
    rectRightBackTop222.face[1].childs[1].group.position.z = box.height;
    rectFrontLeft222.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.height
    );
    rectFrontLeft222.face[1].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.length,
      box.height
    );

    rectFrontLeft222.group.position.y = -(box.height - 4) / 2;
    rectFrontLeft222.face[0].childs[0].plane.position.y = box.height / 2;
    rectFrontLeft222.face[1].childs[0].plane.position.y = box.height / 2;
  }
  if (type.value == "1323") {
    rectBottom1323.group.position.y = -(box.height - 4) / 2;
    rectRightBackTop1323.face[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.length);
    rectRightBackTop1323.face[1].childs[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.height);

    rectRightBackTop1323.group.position.y = -(box.height - 4) / 2;

    rectRightBackTop1323.face[0].group.position.x = box.height / 2;
    rectRightBackTop1323.face[1].childs[0].childs[0].plane.position.y =
      (box.height - 4) / 2;
    rectRightBackTop1323.face[1].childs[1].group.position.z = box.height;

    rectLeftFront1323.face[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.length);
    rectLeftFront1323.face[1].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.width);
    rectLeftFront1323.group.position.y = -(box.height - 4) / 2;
    rectLeftFront1323.face[0].childs[0].plane.position.x =
      -(box.height - 4) / 2;
    rectLeftFront1323.face[1].childs[0].plane.position.x =
      -(box.height - 4) / 2;
  }
  if (type.value == "1322") {
    rectBottom1322.group.position.y = -(box.height - 4) / 2;
    rectFront1322.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.height
    );
    rectFront1322.group.position.y = -(box.height - 4) / 2;
    rectFront1322.face[0].group.position.y = (box.height - 4) / 2;
    rectLeft1322.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectLeft1322.group.position.y = -(box.height - 4) / 2;
    rectLeft1322.face[0].group.position.x = -(2 + (box.height - 4) / 2);

    rectRightBackTop1322.face[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.length);
    rectRightBackTop1322.face[1].childs[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.height);

    rectRightBackTop1322.group.position.y = -(box.height - 4) / 2;

    rectRightBackTop1322.face[0].group.position.x = box.height / 2;
    rectRightBackTop1322.face[1].childs[0].childs[0].plane.position.y =
      (box.height - 4) / 2;
    rectRightBackTop1322.face[1].childs[1].group.position.z = box.height;
  }
  if (type.value == "1321") {
    rectBottom1321.group.position.y = -(box.height - 4) / 2;

    rectFront1321.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.height
    );
    rectFront1321.group.position.y = -(box.height - 4) / 2;
    rectFront1321.face[0].group.position.y = (box.height - 4) / 2;
    rectBackLeft1321.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.height
    );
    rectBackLeft1321.face[1].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.length,
      box.height
    );
    rectBackLeft1321.group.position.y = -(box.height - 4) / 2;
    rectBackLeft1321.face[0].group.position.y = (box.height - 4) / 2;
    rectBackLeft1321.face[1].group.position.y = (box.height - 4) / 2;

    rectRightTop1321.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectRightTop1321.face[1].group.position.x = 4 + (box.height - 4) / 2;

    rectRightTop1321.group.position.y = -(box.height - 4) / 2;
    rectRightTop1321.face[0].group.position.x = 2 + (box.height - 4) / 2;

    rectRightTop1321.face[1].group.position.x = box.height;
  }
  if (type.value == "1411") {
    rectBottom1411.group.position.y = -(box.height - 4) / 2;
    rectLeftBack1411.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectLeftBack1411.face[1].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.width
    );
    rectLeftBack1411.group.position.y = -(box.height - 4) / 2;
    rectLeftBack1411.face[0].group.position.x = -box.height / 2;
    rectLeftBack1411.face[1].group.position.x = -(box.height - 4) / 2;

    rectRightTopFront1411.face[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.length);
    rectRightTopFront1411.face[1].childs[1].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.width);

    rectRightTopFront1411.group.position.y = -(box.height - 4) / 2;
    rectRightTopFront1411.face[0].group.position.x = box.height / 2;
    rectRightTopFront1411.face[1].childs[1].childs[0].plane.position.z =
      -box.height / 2;
    rectRightTopFront1411.face[1].group.position.x = box.height;
  }
  if (type.value == "1412") {
    rectBottom1412.group.position.y = -(box.height - 4) / 2;
    rectLeftBack1412.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectLeftBack1412.face[1].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.width
    );
    rectLeftBack1412.group.position.y = -(box.height - 4) / 2;
    rectLeftBack1412.face[0].group.position.x = -box.height / 2;
    rectLeftBack1412.face[1].group.position.x = -(box.height - 4) / 2;

    rectFront1412.group.position.y = -(box.height - 4) / 2;
    rectFront1412.face[0].group.position.y = (box.height - 4) / 2;
    rectFront1412.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.height
    );
    rectRightTop1412.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectRightTop1412.face[1].group.position.x = 4 + (box.height - 4) / 2;
    rectRightTop1412.group.position.y = -(box.height - 4) / 2;
    rectRightTop1412.face[0].group.position.x = 2 + (box.height - 4) / 2;

    rectRightTop1412.face[1].group.position.x = box.height;
  }
  if (type.value == "1413") {
    rectBottom1413.group.position.y = -(box.height - 4) / 2;

    rectRightTopFront1413.face[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.length);
    rectRightTopFront1413.face[2].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.width);
    rectRightTopFront1413.face[1].group.position.x = 4 + (box.height - 4) / 2;

    rectRightTopFront1413.group.position.y = -(box.height - 4) / 2;
    rectRightTopFront1413.face[0].group.position.x = box.height / 2;
    rectRightTopFront1413.face[1].group.position.x = box.height;
    rectRightTopFront1413.face[2].group.position.x = (box.height - 4) / 2;
    rectLeftBack1413.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectLeftBack1413.face[1].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.width
    );
    rectLeftBack1413.group.position.y = -(box.height - 4) / 2;
    rectLeftBack1413.face[0].group.position.x = -box.height / 2;
    rectLeftBack1413.face[1].group.position.x = -(box.height - 4) / 2;
  }
  if (type.value == "1414") {
    rectRightTop1414.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectLeftBackFront1414.face[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.length);
    rectLeftBackFront1414.face[1].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.width);
    rectLeftBackFront1414.face[2].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.width);
    rectRightTop1414.face[1].group.position.x = 4 + (box.height - 4) / 2;
    rectBottom1414.group.position.y = -(box.height - 4) / 2;
    rectLeftBackFront1414.group.position.y = -(box.height - 4) / 2;
    rectLeftBackFront1414.face[0].group.position.x = -2 - (box.height - 4) / 2;
    rectLeftBackFront1414.face[1].group.position.x = -(box.height - 4) / 2;
    rectLeftBackFront1414.face[2].group.position.x = -(box.height - 4) / 2;
    rectRightTop1414.group.position.y = -(box.height - 4) / 2;
    rectRightTop1414.face[0].group.position.x = 2 + (box.height - 4) / 2;

    rectRightTop1414.face[1].group.position.x = box.height;
  }
  if (type.value == "1415") {
    rectBack1415.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.height
    );
    rectLeft1415.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectRightTopFront1415.face[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.length);
    rectRightTopFront1415.face[2].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.width);
    rectLeft1415.group.position.y = -(box.height - 4) / 2;
    rectLeft1415.face[0].group.position.x = -(2 + (box.height - 4) / 2);
    rectBack1415.group.position.y = -(box.height - 4) / 2;
    rectBack1415.face[0].group.position.y = (box.height - 4) / 2;

    rectBottom1415.group.position.y = -(box.height - 4) / 2;
    rectRightTopFront1415.face[1].group.position.x = 4 + (box.height - 4) / 2;

    rectRightTopFront1415.group.position.y = -(box.height - 4) / 2;
    rectRightTopFront1415.face[0].group.position.x = box.height / 2;
    rectRightTopFront1415.face[1].group.position.x = box.height;
    rectRightTopFront1415.face[2].group.position.x = (box.height - 4) / 2;

    // rectRightTop.face[1].group.position.x = box.height;
  }
  if (type.value == "1416") {
    rectFront.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.height
    );

    rectBack.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.height
    );
    rectLeft.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectRightTop.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectRightTop.face[1].group.position.x = 4 + (box.height - 4) / 2;

    rectBottom.group.position.y = -(box.height - 4) / 2;

    rectFront.group.position.y = -(box.height - 4) / 2;
    rectFront.face[0].group.position.y = (box.height - 4) / 2;

    rectLeft.group.position.y = -(box.height - 4) / 2;
    rectLeft.face[0].group.position.x = -(2 + (box.height - 4) / 2);

    rectBack.group.position.y = -(box.height - 4) / 2;
    rectBack.face[0].group.position.y = (box.height - 4) / 2;

    rectRightTop.group.position.y = -(box.height - 4) / 2;
    rectRightTop.face[0].group.position.x = 2 + (box.height - 4) / 2;

    rectRightTop.face[1].group.position.x = box.height;
  }
}

function laListener() {
  if (type.value == "33") {
    rectBottom33.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );

    rectBackRightFront33.face[1].childs[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.length, box.height);
    rectLeftTop33.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectLeftTop33.face[1].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectBackRightFront33.group.position.z = -box.length / 2;
    rectBackRightFront33.face[1].childs[0].group.position.x = -box.length / 2;
    rectBackRightFront33.face[1].childs[1].group.position.x = -box.length;
  }
  if (type.value == "222") {
    rectBottom222.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectRightBackTop222.face[1].childs[1].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.length);
    rectRightBackTop222.face[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.length);

    rectRightBackTop222.face[1].childs[1].childs[0].plane.position.y =
      box.length / 2;
    rectRightBackTop222.face[1].group.position.y = -box.length / 2;
    rectFrontLeft222.face[1].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.length,
      box.height
    );
    rectFrontLeft222.group.position.z = box.length / 2;
    rectFrontLeft222.face[1].childs[0].plane.position.x = -box.length / 2;
  }
  if (type.value == "1323") {
    rectBottom1323.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectRightBackTop1323.face[1].childs[1].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.length);
    rectRightBackTop1323.face[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.length);

    rectRightBackTop1323.face[1].childs[1].childs[0].plane.position.y =
      box.length / 2;
    rectRightBackTop1323.face[1].group.position.y = -box.length / 2;

    rectLeftFront1323.face[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.length);
    rectLeftFront1323.face[1].group.position.y = -box.length / 2;
  }
  if (type.value == "1322") {
    rectLeft1322.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectBottom1322.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectFront1322.group.position.z = 2 + (box.length - 4) / 2;
    rectRightBackTop1322.face[1].childs[1].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.length);
    rectRightBackTop1322.face[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.length);

    rectRightBackTop1322.face[1].childs[1].childs[0].plane.position.y =
      box.length / 2;
    rectRightBackTop1322.face[1].group.position.y = -box.length / 2;
  }
  if (type.value == "1321") {
    rectBottom1321.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectRightTop1321.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectRightTop1321.face[1].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectBackLeft1321.face[1].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.length,
      box.height
    );
    rectBackLeft1321.face[1].childs[0].plane.position.x = -box.length / 2;
    rectFront1321.group.position.z = box.length / 2;
    rectBackLeft1321.group.position.z = -box.length / 2;
  }
  if (type.value == "1411") {
    rectBottom1411.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectLeftBack1411.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectLeftBack1411.face[1].group.position.y = box.length / 2;
    faceRightTopFront1411.face[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.length);
    faceRightTopFront1411.face[1].childs[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.length);
    faceRightTopFront1411.face[1].childs[0].position.x = box.length / 2;
    faceRightTopFront1411.face[1].childs[1].group.position.y = box.length / 2;
  }
  if (type.value == "1412") {
    rectBottom1412.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectLeftBack1412.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectLeftBack1412.face[1].group.position.y = box.length / 2;
    rectRightTop1412.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectRightTop1412.face[1].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectFront1412.group.position.z = 2 + (box.length - 4) / 2;
  }
  if (type.value == "1413") {
    rectLeftBack1413.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectBottom1413.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );

    rectRightTopFront1413.face[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.length);
    rectRightTopFront1413.face[1].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.length);
    rectRightTopFront1413.face[2].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.width);
    rectRightTopFront1413.face[2].group.position.y = box.length / 2;
    rectLeftBack1413.face[1].group.position.y = box.length / 2;
  }
  if (type.value == "1414") {
    rectBottom1414.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );

    rectRightTop1414.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectRightTop1414.face[1].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    faceLeftBackFront1414.face[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.length);
    faceLeftBackFront1414.face[1].group.position.y = -box.length / 2;
    faceLeftBackFront1414.face[2].group.position.y = box.length / 2;
  }
  if (type.value == "1415") {
    rectLeft1415.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectBottom1415.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );

    rectRightTopFront1415.face[0].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.length);
    rectRightTopFront1415.face[1].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.width, box.length);
    rectRightTopFront1415.face[2].childs[0].plane.geometry =
      new THREE.PlaneGeometry(box.height, box.width);
    rectRightTopFront1415.face[2].group.position.y = box.length / 2;
    rectBack1415.group.position.z = -(2 + (box.length - 4) / 2);
  }
  if (type.value == "1416") {
    rectLeft.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectBottom.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );

    rectRightTop.face[0].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.height,
      box.length
    );
    rectRightTop.face[1].childs[0].plane.geometry = new THREE.PlaneGeometry(
      box.width,
      box.length
    );
    rectFront.group.position.z = 2 + (box.length - 4) / 2;
    rectBack.group.position.z = -(2 + (box.length - 4) / 2);
  }
}

const topGroup = new THREE.Group();
topGroup.name = "topGroup";
// topGroup.add(new THREE.AxesHelper(20));

const rectLeftTop33 = new CubeGroup(scene);
const rectBottom33 = new CubeGroup(scene);
const rectBackRightFront33 = new CubeGroup(scene);
const createRect33 = () => {
  topGroup.add(
    rectLeftTop33.create(
      box,
      "faceLeftTop33",
      faceLeftTop33.position,
      faceLeftTop33.rotation,
      faceLeftTop33.face
    )
  );
  topGroup.add(
    rectBottom33.create(
      box,
      "faceBottom33",
      faceBottom33.position,
      faceBottom33.rotation,
      faceBottom33.face
    )
  );
  topGroup.add(
    rectBackRightFront33.create(
      box,
      "faceBackRightFront33",
      faceBackRightFront33.position,
      faceBackRightFront33.rotation,
      faceBackRightFront33.face
    )
  );
};
// createRect33();

const rectRightBackTop222 = new CubeGroup(scene);
const rectBottom222 = new CubeGroup(scene);
const rectFrontLeft222 = new CubeGroup(scene);
const createRect222 = () => {
  topGroup.add(
    rectRightBackTop222.create(
      box,
      "faceRightBackTop222",
      faceRightBackTop222.position,
      faceRightBackTop222.rotation,
      faceRightBackTop222.face
    )
  );
  topGroup.add(
    rectBottom222.create(
      box,
      "faceBottom222",
      faceBottom222.position,
      faceBottom222.rotation,
      faceBottom222.face
    )
  );
  topGroup.add(
    rectFrontLeft222.create(
      box,
      "faceFrontLeft222",
      faceFrontLeft222.position,
      faceFrontLeft222.rotation,
      faceFrontLeft222.face
    )
  );
};
// createRect222();
const rectRightTop1321 = new CubeGroup(scene);
const rectBottom1321 = new CubeGroup(scene);
const rectFront1321 = new CubeGroup(scene);
const rectBackLeft1321 = new CubeGroup(scene);
const createRect1321 = () => {
  topGroup.add(
    rectRightTop1321.create(
      box,
      "rectRightTop1321",
      faceRightTop1321.position,
      faceRightTop1321.rotation,
      faceRightTop1321.face
    )
  );
  topGroup.add(
    rectBottom1321.create(
      box,
      "rectBottom1321",
      faceBottom1321.position,
      faceBottom1321.rotation,
      faceBottom1321.face
    )
  );
  topGroup.add(
    rectFront1321.create(
      box,
      "rectFront1321",
      faceFront1321.position,
      faceFront1321.rotation,
      faceFront1321.face
    )
  );
  topGroup.add(
    rectBackLeft1321.create(
      box,
      "faceBackLeft1321",
      faceBackLeft1321.position,
      faceBackLeft1321.rotation,
      faceBackLeft1321.face
    )
  );
};
// createRect1321();
const rectRightBackTop1322 = new CubeGroup(scene);
const rectFront1322 = new CubeGroup(scene);
const rectLeft1322 = new CubeGroup(scene);
const rectBottom1322 = new CubeGroup(scene);

const createRect1322 = () => {
  topGroup.add(
    rectRightBackTop1322.create(
      box,
      "faceRightTopFront1415",
      faceRightBackTop1322.position,
      faceRightBackTop1322.rotation,
      faceRightBackTop1322.face
    )
  );
  topGroup.add(
    rectFront1322.create(
      box,
      "rectFront1322",
      faceFront1322.position,
      faceFront1322.rotation,
      faceFront1322.face
    )
  );
  topGroup.add(
    rectLeft1322.create(
      box,
      "rectLeft1322",
      faceLeft1322.position,
      faceLeft1322.rotation,
      faceLeft1322.face
    )
  );
  topGroup.add(
    rectBottom1322.create(
      box,
      "rectBottom1322",
      faceBottom1322.position,
      faceBottom1322.rotation,
      faceBottom1322.face
    )
  );
};
// createRect1322();

const rectRightBackTop1323 = new CubeGroup(scene);
const rectLeftFront1323 = new CubeGroup(scene);
const rectBottom1323 = new CubeGroup(scene);
const createRect1323 = () => {
  topGroup.add(
    rectRightBackTop1323.create(
      box,
      "rectBottom1411",
      faceRightBackTop1323.position,
      faceRightBackTop1323.rotation,
      faceRightBackTop1323.face
    )
  );
  topGroup.add(
    rectLeftFront1323.create(
      box,
      "faceLeftFront1323",
      faceLeftFront1323.position,
      faceLeftFront1323.rotation,
      faceLeftFront1323.face
    )
  );
  topGroup.add(
    rectBottom1323.create(
      box,
      "faceBottom1323",
      faceBottom1323.position,
      faceBottom1323.rotation,
      faceBottom1323.face
    )
  );
};
// createRect1323();

const rectBottom1411 = new CubeGroup(scene);
const rectLeftBack1411 = new CubeGroup(scene);
const rectRightTopFront1411 = new CubeGroup(scene);
const createRect1411 = () => {
  topGroup.add(
    rectBottom1411.create(
      box,
      "rectBottom1411",
      faceBottom1411.position,
      faceBottom1411.rotation,
      faceBottom1411.face
    )
  );
  topGroup.add(
    rectLeftBack1411.create(
      box,
      "rectLeftBack1411",
      faceLeftBack1411.position,
      faceLeftBack1411.rotation,
      faceLeftBack1411.face
    )
  );
  topGroup.add(
    rectRightTopFront1411.create(
      box,
      "faceRightTopFront1411",
      faceRightTopFront1411.position,
      faceRightTopFront1411.rotation,
      faceRightTopFront1411.face
    )
  );
};
// createRect1411();
const rectFront1412 = new CubeGroup(scene);
const rectBottom1412 = new CubeGroup(scene);
const rectRightTop1412 = new CubeGroup(scene);
const rectLeftBack1412 = new CubeGroup(scene);
const createRect1412 = () => {
  topGroup.add(
    rectFront1412.create(
      box,
      "rectFront1412",
      faceFront1412.position,
      faceFront1412.rotation,
      faceFront1412.face
    )
  );
  topGroup.add(
    rectLeftBack1412.create(
      box,
      "faceLeftBack1412",
      faceLeftBack1412.position,
      faceLeftBack1412.rotation,
      faceLeftBack1412.face
    )
  );
  topGroup.add(
    rectRightTop1412.create(
      box,
      "rectRightTop1412",
      faceRightTop1412.position,
      faceRightTop1412.rotation,
      faceRightTop1412.face
    )
  );
  topGroup.add(
    rectBottom1412.create(
      box,
      "rectBottom1412",
      faceBottom1412.position,
      faceBottom1412.rotation,
      faceBottom1412.face
    )
  );
};
// createRect1412();
const rectRightTopFront1413 = new CubeGroup(scene);
const rectBottom1413 = new CubeGroup(scene);
const rectLeftBack1413 = new CubeGroup(scene);
const createRect1413 = () => {
  topGroup.add(
    rectRightTopFront1413.create(
      box,
      "rectRightTopFront1413",
      faceRightTopFront1413.position,
      faceRightTopFront1413.rotation,
      faceRightTopFront1413.face
    )
  );
  topGroup.add(
    rectBottom1413.create(
      box,
      "rectBottom1413",
      faceBottom1413.position,
      faceBottom1413.rotation,
      faceBottom1413.face
    )
  );
  topGroup.add(
    rectLeftBack1413.create(
      box,
      "faceLeftBack1413",
      faceLeftBack1413.position,
      faceLeftBack1413.rotation,
      faceLeftBack1413.face
    )
  );
};
// createRect1413();
const rectLeftBackFront1414 = new CubeGroup(scene);
const rectBottom1414 = new CubeGroup(scene);
const rectRightTop1414 = new CubeGroup(scene);
const createRect1414 = () => {
  topGroup.add(
    rectLeftBackFront1414.create(
      box,
      "rectLeftBackFront1414",
      faceLeftBackFront1414.position,
      faceLeftBackFront1414.rotation,
      faceLeftBackFront1414.face
    )
  );

  topGroup.add(
    rectBottom1414.create(
      box,
      "faceBottom1414",
      faceBottom1414.position,
      faceBottom1414.rotation,
      faceBottom1414.face
    )
  );

  topGroup.add(
    rectRightTop1414.create(
      box,
      "faceRightTop1414",
      faceRightTop1414.position,
      faceRightTop1414.rotation,
      faceRightTop1414.face
    )
  );
};
// createRect1414();
const rectBottom1415 = new CubeGroup(scene);
const rectLeft1415 = new CubeGroup(scene);
const rectBack1415 = new CubeGroup(scene);
const rectRightTopFront1415 = new CubeGroup(scene);

const createRect1415 = () => {
  topGroup.add(
    rectBottom1415.create(
      box,
      "rectBottom",
      faceBottom1415.position,
      faceBottom1415.rotation,
      faceBottom1415.face
    )
  );

  topGroup.add(
    rectLeft1415.create(
      box,
      "rectLeft",
      faceLeft1415.position,
      faceLeft1415.rotation,
      faceLeft1415.face
    )
  );

  topGroup.add(
    rectBack1415.create(
      box,
      "rectBack",
      faceBack1415.position,
      faceBack1415.rotation,
      faceBack1415.face
    )
  );
  topGroup.add(
    rectRightTopFront1415.create(
      box,
      "faceRightTopFront1415",
      faceRightTopFront1415.position,
      faceRightTopFront1415.rotation,
      faceRightTopFront1415.face
    )
  );
};
// createRect1415();
const rectRightTop = new CubeGroup(scene);
const rectBottom = new CubeGroup(scene);
const rectLeft = new CubeGroup(scene);
const rectFront = new CubeGroup(scene);
const rectBack = new CubeGroup(scene);
const createRect1416 = () => {
  topGroup.add(
    rectRightTop.create(
      box,
      "rectRightTop",
      faceRightTop.position,
      faceRightTop.rotation,
      faceRightTop.face
    )
  );

  topGroup.add(
    rectBottom.create(
      box,
      "rectBottom",
      faceBottom.position,
      faceBottom.rotation,
      faceBottom.face
    )
  );

  topGroup.add(
    rectLeft.create(
      box,
      "rectLeft",
      faceLeft.position,
      faceLeft.rotation,
      faceLeft.face
    )
  );

  topGroup.add(
    rectFront.create(
      box,
      "rectFront",
      faceFront.position,
      faceFront.rotation,
      faceFront.face
    )
  );

  topGroup.add(
    rectBack.create(
      box,
      "rectBack",
      faceBack.position,
      faceBack.rotation,
      faceBack.face
    )
  );
};
// createRect1416();

scene.add(topGroup);
console.log("scene", scene);
function handleAnimate() {
  open.value = true;
  if (type.value == "33") {
    rectAnimateOpen33(rectLeftTop33, rectBackRightFront33, speed);
  }
  if (type.value == "222") {
    rectAnimateOpen222(rectFrontLeft222, rectRightBackTop222, speed);
  }
  if (type.value == "1321") {
    rectAnimateOpen1321(
      rectFront1321,
      rectBackLeft1321,
      rectRightTop1321,
      speed
    );
  }
  if (type.value == "1322") {
    rectAnimateOpen1322(
      rectRightBackTop1322,
      rectFront1322,
      rectLeft1322,
      speed
    );
  }
  if (type.value == "1323") {
    rectAnimateOpen1323(rectRightBackTop1323, rectLeftFront1323, speed);
  }
  if (type.value == "1411") {
    rectAnimateOpen1411(rectLeftBack1411, rectRightTopFront1411, speed);
  }
  if (type.value == "1412") {
    rectAnimateOpen1412(
      rectLeftBack1412,
      rectFront1412,
      rectRightTop1412,
      speed
    );
  }
  if (type.value == "1413") {
    rectAnimateOpen1413(rectLeftBack1413, rectRightTopFront1413, speed);
  }
  if (type.value == "1414") {
    rectAnimateOpen1414(rectLeftBackFront1414, rectRightTop1414, speed);
  }
  if (type.value == "1415") {
    rectAnimateOpen1415(
      rectRightTopFront1415,
      rectLeft1415,
      rectBack1415,
      speed
    );
  }
  if (type.value == "1416") {
    rectAnimateOpen1416(rectFront, rectLeft, rectRightTop, rectBack, speed);
  }
  const timer = setTimeout(() => {
    // 目标位置和角度
    const targetPosition = new THREE.Vector3(0, 10, 0);
    // 创建相机位置的 Tween 动画
    new TWEEN.Tween(camera.position)
      .to(targetPosition, 1000) // 1秒内过渡到目标位置
      .easing(TWEEN.Easing.Quadratic.Out) // 使用二次缓动函数
      .start()
      .onComplete(function () {
        clearTimeout(timer);
      });
  }, 2000);
}
function handleCloseAll() {
  open.value = false;
  // 目标位置和角度
  const targetPosition = new THREE.Vector3(0, 6, 8);
  // 创建相机位置的 Tween 动画
  new TWEEN.Tween(camera.position)
    .to(targetPosition, 1000) // 1秒内过渡到目标位置
    .easing(TWEEN.Easing.Quadratic.Out) // 使用二次缓动函数
    .start()
    .onComplete(function () {
      //镜头旋转后执行关闭动画
      if (type.value == "33") {
        rectAnimateClose33(rectLeftTop33, rectBackRightFront33, speed);
      }
      if (type.value == "222") {
        rectAnimateClose222(rectFrontLeft222, rectRightBackTop222, speed);
      }
      if (type.value == "1321") {
        rectAnimateClose1321(
          rectFront1321,
          rectBackLeft1321,
          rectRightTop1321,
          speed
        );
      }
      if (type.value == "1322") {
        rectAnimateClose1322(
          rectRightBackTop1322,
          rectFront1322,
          rectLeft1322,
          speed
        );
      }
      if (type.value == "1323") {
        rectAnimateClose1323(rectRightBackTop1323, rectLeftFront1323, speed);
      }
      if (type.value == "1411") {
        rectAnimateClose1411(rectLeftBack1411, rectRightTopFront1411, speed);
      }
      if (type.value == "1412") {
        rectAnimateClose1412(
          rectLeftBack1412,
          rectFront1412,
          rectRightTop1412,
          speed
        );
      }
      if (type.value == "1413") {
        rectAnimateClose1413(rectLeftBack1413, rectRightTopFront1413, speed);
      }
      if (type.value == "1414") {
        rectAnimateClose1414(rectLeftBackFront1414, rectRightTop1414, speed);
      }
      if (type.value == "1415") {
        rectAnimateClose1415(
          rectRightTopFront1415,
          rectLeft1415,
          rectBack1415,
          speed
        );
      }
      if (type.value == "1416") {
        rectAnimateClose1416(
          rectFront,
          rectLeft,
          rectRightTop,
          rectBack,
          speed
        );
      }
    });
}

function handleSelectType(val) {
  type.value = val;
  box.width = 4;
  box.height = 4;
  box.length = 4;
  for (let i = scene.children.length - 1; i >= 0; i--) {
    const child = scene.children[i];
    if (!(child.type == "GridHelper")) {
      scene.remove(child);
    }
  }

  for (let i = topGroup.children.length - 1; i >= 0; i--) {
    topGroup.remove(topGroup.children[i]);
  }

  eval("createRect" + val + "()");
  scene.add(topGroup);
  // handleAnimate();
}

function handleColor() {
  themeColorUse.value = true;
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
function handleWaChange() {
  console.log("xasdasd", props.draggable);
  waListener();
}
function handleHaChange() {
  haListener();
}
function handleLaChange() {
  laListener();
}
handeleCreate();
function handeleCreate() {
  eval("createRect" + type.value + "()");
}
</script>
<style lang="scss" scoped>
.type {
  position: relative;
  width: 163px;
  height: 336px;
  margin-left: 50px;
  .num {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    width: 100%;
    height: 100%;
    // background-color: rgba($color: #000000, $alpha: 0.2);
    display: flex;
    flex-wrap: wrap;
    div {
      width: 48px;
      height: 60px;
      padding-top: 20px;
      margin-bottom: 10px;
      margin-left: 5px;
      color: transparent;
      cursor: pointer;
      // background-color: rgba($color: red, $alpha: 0.2);
    }
  }
}
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
      font-size: 14px; user-select: none;
      > div {
        margin-right: 8px;
      }
    }
  }
}
</style>
