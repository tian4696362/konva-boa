<template>
  <div>
    <el-dropdown split-button type="primary">
      正方体
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="(item, index) in cubeList"
            @click="handleCreate('cube', item)"
            >{{ item }}</el-dropdown-item
          >
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <el-button type="primary" @click="handleCreate('cylinder')">圆柱</el-button>

    <div v-for="(item, index) in componentsList" :key="index">
      <resizableDraggable
        v-slot="{ draggable, top, left }"
        v-if="item.type == 'cube'"
        :x="item.x"
        :y="item.y"
      >
        <cube
          :draggable="draggable"
          :cubeType="item.cubeType"
          :top="top"
          :left="left"
        />
        <el-icon class="close" :size="18" color="#409EFC" v-show="draggable">
          <CircleClose @click="close(index)" />
        </el-icon>
      </resizableDraggable>

      <resizableDraggable
        v-slot="{ draggable }"
        v-else-if="item.type == 'cylinder'"
        :x="item.x"
        :y="item.y"
      >
        <cylinder :draggable="draggable" />
        <el-icon class="close" :size="18" color="#409EFC" v-show="draggable">
          <CircleClose @click="close(index)" />
        </el-icon>
      </resizableDraggable>

      <div v-else-if="item.type == 'empty'"></div>
    </div>
  </div>
</template>
<script setup>
import { CircleClose, Search } from "@element-plus/icons-vue";
import { onMounted, ref, reactive } from "vue";
import resizableDraggable from "@/components/resizableDraggable.vue";
import cube from "@/views/geometry/cube.vue";
import cylinder from "@/views/geometry/cylinder.vue";
const componentsList = ref([]);
const cubeList = ref([
  33, 222, 1321, 1322, 1323, 1411, 1412, 1413, 1414, 1415, 1416,
]);
const handleCreate = (type, cubeType, x, y) => {
  console.log(type, cubeType, x, y);
  componentsList.value.push({ type: type, cubeType: cubeType, x: x, y: y });
};

function close(index) {
  componentsList.value[index].type = "empty";
}
onMounted(() => {
  // document.addEventListener("mouseup", function (e) {
  //   console.log(e.clientX, e.clientY);
  //   handleCreate("cube", 1414, e.clientX, e.clientY);
  // });
});
</script>
<style scoped>
.close {
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
}
</style>
