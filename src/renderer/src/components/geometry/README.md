# 参数必传，区分 type:cube cylinder 点击按钮的时候获取鼠标的 xy 传递参数 top left

```js
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
```

# 删除的时候给空
```js
function close(index) {
  componentsList.value[index].type = "empty";
}

<div v-else-if="item.type == 'empty'"></div>;
```
