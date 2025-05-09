<template>
  <div>
    <el-button @click="handleAdd">add</el-button>
    <compass ref="compassDom"></compass>
  </div>
</template>

<script setup>
import { ref, useTemplateRef } from "vue";
import compass from "@/views/rulerTools/compass.vue";
let compassDom = ref(null);
const handleAdd = () => {
  //获取参数 
  console.log(compassDom.value.top, compassDom.value.left, compassDom.value.rotate, compassDom.value.handleClose());
};
</script>

<style lang="scss" scoped></style>
