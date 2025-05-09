# 直尺 三角尺 量角器

```js
<template>
  <div>
    <el-button @click="handle">获取参数</el-button>
    <compass ref="compassDom"></compass>
  </div>
</template>


import { ref, useTemplateRef } from "vue";
import compass from "@/views/rulerTools/compass.vue";
let compassDom = ref(null);
const handle = () => {
  //获取参数
  console.log(compassDom.value.top, compassDom.value.left, compassDom.value.rotate, compassDom.value.handleClose());
};


```

```js
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
```
