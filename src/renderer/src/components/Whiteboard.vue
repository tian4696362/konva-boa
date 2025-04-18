<template>
  <div>
    <button @click="toggleSelection">选中</button>
    <button @click.stop="toggleDrawing">画笔</button>
    <button @click.stop="toggleQuadrilateral">四边形</button>
    <div v-show="showBrushOptions" class="brush-options" @click.stop>
      <div class="color-picker">
        <button @click="setBrushColor('#ff0000')" style="background: #ff0000"></button>
        <button @click="setBrushColor('#00ff00')" style="background: #00ff00"></button>
        <button @click="setBrushColor('#0000ff')" style="background: #0000ff"></button>
        <button @click="setBrushColor('#ff00ff')" style="background: #ff00ff"></button>
        <button @click="setBrushColor('#000000')" style="background: #000000"></button>
      </div>
      <div class="size-picker">
        <button @click="setBrushWidth(3)">细</button>
        <button @click="setBrushWidth(5)">中</button>
        <button @click="setBrushWidth(8)">粗</button>
      </div>
    </div>
    <button @click="toggleEraser">橡皮擦</button>
    <button @click="toggleCompass">圆</button>
    <button @click="undo">撤销</button>
    <button @click="clearScreen">清屏</button>
    <button @click="logAllPoints">智能识别</button>
    <button @click="saveCanvas">保存</button>
    <v-stage
      ref="stageRef"
      :config="stageConfig"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
    >
      <v-layer>
        <v-rect
          v-for="(rect, index) in rectangles"
          :key="index"
          :config="rect"
          @click="handleRectClick(rect)"
          :draggable="false"
          @transformstart="handleTransformStart"
          @transformend="handleTransformEnd"
        />
        <v-transformer
          ref="transformerRef"
          :config="transformerConfig"
          :enabled="isSelectionEnabled && selectedItems.length > 0"
        />
        <v-line
          v-if="isDrawing && currentLinePoints.length > 0"
          :config="{
            points: currentLinePoints,
            stroke: selectColor,
            strokeWidth: brushWidth,
            tension: 0.5
          }"
        />
        <v-circle
          v-if="isCompassing && currentCircleCenter && currentCircleRadius > 0"
          :config="{
            x: currentCircleCenter.x,
            y: currentCircleCenter.y,
            radius: currentCircleRadius,
            stroke: selectColor,
            strokeWidth: brushWidth,
            fill: 'transparent'
          }"
        />
        <v-line
          v-for="(line, index) in drawnLines"
          :key="index"
          :config="line"
          @click="handleLineClick(line)"
          :draggable="false"
        />
        <v-circle
          v-for="(circle, index) in drawnCircles"
          :key="index"
          :config="circle"
          @click="handleCircleClick(circle)"
          :draggable="false"
        />
        <!-- 四边形 -->
        <v-rect
          v-for="(quadrilateral, index) in drawnQuadrilaterals"
          :key="index"
          :config="quadrilateral"
          @click="handleQuadrilateralClick(quadrilateral)"
          :draggable="false"
        />
        <v-rect
          v-if="isQuadrilateralDrawing && currentQuadrilateral"
          :config="currentQuadrilateral"
        />
        <!-- 智能识别文字 -->
        <v-text
          v-for="(text, index) in drawnLines.filter((l) => l.type === 'text')"
          :key="`text-${index}`"
          :config="{
            text: text.text,
            x: text.x,
            y: text.y,
            fontSize: text.fontSize,
            fill: text.fill,
            draggable: isSelectionEnabled,
            id: text.id
          }"
          @click="handleTextClick(text)"
          @dragend="handleDragEnd"
        />
      </v-layer>
      <!-- @transformend="handleTextTransform" -->
    </v-stage>
    <!-- <div style="width: 500px; height: 500px" v-html="recoHtml"></div> -->
  </div>
</template>

<script>
import VueKonva from 'vue-konva'
import useRecognizer from '../utils/useRecognizer'
export default {
  name: 'DrawingCanvas',
  components: {
    ...VueKonva
  },
  data() {
    return {
      isSelectionEnabled: false, // 是否启用选择功能
      isDrawing: false, // 是否正在绘制
      isErasing: false, // 是否正在擦除
      isCompassing: false, // 是否正在画圆
      isQuadrilateralDrawing: false, //  是否正在画四边形
      isIntellect: false, //是否智能识别
      isMouseDown: false, // 是否鼠标按下
      stageConfig: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      showBrushOptions: false, //    是否显示画笔选项
      brushWidth: 5, // 画笔宽度
      selectColor: '#000000', // 画笔颜色
      rectangles: [
        {
          x: window.innerWidth / 2 - 60,
          y: window.innerHeight / 2 - 60,
          width: 0,
          height: 0,
          fill: 'red',
          draggable: false,
          id: 'rect1',
          name: 'my-rect'
        },
        {
          x: window.innerWidth / 2 + 10,
          y: window.innerHeight / 2 + 10,
          width: 0,
          height: 0,
          fill: 'green',
          draggable: false,
          id: 'rect2',
          name: 'my-rect'
        }
      ],
      transformerConfig: {
        nodes: [],
        rotateEnabled: true,
        resizeEnabled: true,
        keepRatio: false, // 文字允许自由缩放
        enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        boundBoxFunc: (oldBox, newBox) => {
          // 限制最小尺寸
          if (newBox.width < 30 || newBox.height < 30) {
            return oldBox
          }
          return newBox
        }
      },
      selectedItems: [], //选中的元素
      drawnLines: [], //绘制的线条
      intellectLines: [], // 新增：智能识别后的线条
      drawnCircles: [], //绘制的圆
      drawnQuadrilaterals: [], //绘制的四边形
      currentLinePoints: [], //当前线条的坐标点
      currentCircleCenter: null, //当前圆的中心点
      currentCircleRadius: 0, //当前圆的半径
      lineIdCounter: 0, //线条id计数器
      circleIdCounter: 0, //圆id计数器
      quadrilateralIdCounter: 0, // 四边形id计数器
      currentQuadrilateral: null, //当前四边形
      isDragging: false, //是否正在拖动
      dragStartPos: null, //拖动开始的位置
      historyStack: [], //历史记录
      AllPoints: [], //所有线条的坐标点
      currentLineTimestamps: [], //当前线条的时间戳
      recoData: '', //获取识别以后返回的html
      debounceTimer: null, // 防抖定时器
      lastDrawTime: 0, // 上次绘制的时间
      exportConfig: {
        quality: 0.8,// 图片质量 0-1
        pixelRatio: 2,// 提高分辨率
        mimeType: 'image/png'//格式
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      const transformer = this.$refs.transformerRef.getNode()
      transformer.boundBoxFunc(this.boundBoxFunc)
    })
    window.addEventListener('resize', this.handleResize)
    this.saveState()
  },
  beforeDestroy() {
    // 移除事件监听器
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    // 点击保存生成图片
    saveCanvas() {
      const stage = this.$refs.stageRef.getNode()
      const dataURL = stage.toDataURL({
        quality: 0.8, // 图片质量 0-1
        pixelRatio: 2 // 提高分辨率
      })

      // 创建下载链接
      const link = document.createElement('a')
      link.download = `whiteboard-${Date.now()}.png`
      link.href = dataURL

      // 触发下载
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    //挪动文字以后记录位置
    handleDragEnd(e) {
      const textNode = e.target
      const textItem = this.drawnLines.find((t) => t.id === textNode.id())
      if (textItem && textItem.type === 'text') {
        // 更新文字位置
        textItem.x = textNode.x()
        textItem.y = textNode.y()
        this.saveState()
        // 更新变换器位置
        this.updateTransformerNodes()
      }
    },
    // 文字点击处理
    handleTextClick(text) {
      if (this.isSelectionEnabled) {
        const index = this.selectedItems.indexOf(text)
        if (index === -1) {
          this.selectedItems.push(text)
        } else {
          this.selectedItems.splice(index, 1)
        }
        this.updateTransformerNodes()
      }
    },
    // 点击智能识别  保留画笔功能
    async logAllPoints() {
      this.isIntellect = !this.isIntellect
      this.isDrawing = this.isIntellect
      this.isSelectionEnabled = false
      this.isErasing = false
      this.isCompassing = false
      this.isQuadrilateralDrawing = false
      this.isMouseDown = false
      if (!this.isDrawing) {
        this.currentLinePoints = []
      }
      if (this.isIntellect) {
        this.currentLinePoints = []
      }
      this.showBrushOptions = this.isDrawing
      // const recognizer = useRecognizer()
      // this.AllPoints = []
      // this.drawnLines.forEach((line, index) => {
      //   const points = []
      //   for (let i = 0; i < line.points.length; i += 2) {
      //     points.push({
      //       x: line.points[i],
      //       y: line.points[i + 1],
      //       t: line.timestamps[i / 2],
      //       p: this.brushWidth
      //     })
      //   }
      //   this.AllPoints.push({
      //     id: line.id,
      //     stroke: line.stroke,
      //     pointerType: 'pen',
      //     length: 100,
      //     creationTime: 1,
      //     modificationDate: 1,
      //     style: {
      //       width: 1
      //     },
      //     type: 'stroke',
      //     pointers: points,
      //     pointCount: points.length
      //   })
      // })
      // try {
      //   const result = await recognizer.send(this.AllPoints, 'zh').then((res) => {
      //     console.log(res,'resreds');
      //     this.recoData = res
      //   })
      //   console.log('识别结果:', result)
      // } catch (error) {
      //   console.error('识别失败:', error)
      // }
    },
    setBrushColor(color) {
      this.selectColor = color
    },
    setBrushWidth(width) {
      this.brushWidth = width
    },
    clearScreen() {
      this.rectangles = []
      this.drawnLines = []
      this.drawnCircles = []
      this.drawnQuadrilaterals = []
      this.AllPoints = []
      this.saveState()
    },
    toggleSelection() {
      this.isSelectionEnabled = !this.isSelectionEnabled
      if (!this.isSelectionEnabled) {
        this.selectedItems = []
        const transformer = this.$refs.transformerRef.getNode()
        transformer.nodes([])
      }
      this.isDrawing = false
      this.isErasing = false
      this.isCompassing = false
      this.isQuadrilateralDrawing = false
      this.isMouseDown = false
      this.isIntellect = false
    },
    toggleDrawing() {
      this.isDrawing = !this.isDrawing
      this.isSelectionEnabled = false
      this.isErasing = false
      this.isCompassing = false
      this.isQuadrilateralDrawing = false
      this.isMouseDown = false
      this.isIntellect = false
      if (!this.isDrawing) {
        this.currentLinePoints = []
      }
      this.showBrushOptions = this.isDrawing
    },
    toggleEraser() {
      this.isErasing = !this.isErasing
      this.isSelectionEnabled = false
      this.isDrawing = false
      this.isCompassing = false
      this.isQuadrilateralDrawing = false
      this.isMouseDown = false
      this.isIntellect = false
    },
    toggleCompass() {
      this.isCompassing = !this.isCompassing
      this.isSelectionEnabled = false
      this.isDrawing = false
      this.isErasing = false
      this.isQuadrilateralDrawing = false
      this.isMouseDown = false
      this.currentCircleCenter = null
      this.currentCircleRadius = 0
      this.isIntellect = false
    },
    toggleQuadrilateral() {
      console.log(this.drawnLines, 'drawnLines')
      this.isQuadrilateralDrawing = !this.isQuadrilateralDrawing
      this.isSelectionEnabled = false
      this.isDrawing = false
      this.isErasing = false
      this.isCompassing = false
      this.isMouseDown = false
      this.isIntellect = false
      this.currentLinePoints = []
    },
    handleRectClick(rect) {
      if (this.isSelectionEnabled) {
        const index = this.selectedItems.indexOf(rect)
        if (index === -1) {
          this.selectedItems.push(rect)
        } else {
          this.selectedItems.splice(index, 1)
        }
        this.updateTransformerNodes()
      }
    },
    handleLineClick(line) {
      if (this.isSelectionEnabled) {
        const index = this.selectedItems.indexOf(line)
        if (index === -1) {
          this.selectedItems.push(line)
        } else {
          this.selectedItems.splice(index, 1)
        }
        this.updateTransformerNodes()
      }
    },
    handleCircleClick(circle) {
      if (this.isSelectionEnabled) {
        const index = this.selectedItems.indexOf(circle)
        if (index === -1) {
          this.selectedItems.push(circle)
        } else {
          this.selectedItems.splice(index, 1)
        }
        this.updateTransformerNodes()
      }
    },
    handleQuadrilateralClick(quadrilateral) {
      if (this.isSelectionEnabled) {
        const index = this.selectedItems.indexOf(quadrilateral)
        if (index === -1) {
          this.selectedItems.push(quadrilateral)
        } else {
          this.selectedItems.splice(index, 1)
        }
        this.updateTransformerNodes()
      }
    },
    isRectSelected(rect) {
      return this.selectedItems.includes(rect)
    },
    isLineSelected(line) {
      return this.selectedItems.includes(line)
    },
    isCircleSelected(circle) {
      return this.selectedItems.includes(circle)
    },
    isQuadrilateralSelected(quadrilateral) {
      return this.selectedItems.includes(quadrilateral)
    },
    getCorner(pivotX, pivotY, diffX, diffY, angle) {
      const distance = Math.sqrt(diffX * diffX + diffY * diffY)
      angle += Math.atan2(diffY, diffX)
      const x = pivotX + distance * Math.cos(angle)
      const y = pivotY + distance * Math.sin(angle)
      return { x, y }
    },
    getClientRect(rotatedBox) {
      const { x, y, width, height } = rotatedBox
      const rad = rotatedBox.rotation || 0
      const p1 = this.getCorner(x, y, 0, 0, rad)
      const p2 = this.getCorner(x, y, width, 0, rad)
      const p3 = this.getCorner(x, y, width, height, rad)
      const p4 = this.getCorner(x, y, 0, height, rad)
      const minX = Math.min(p1.x, p2.x, p3.x, p4.x)
      const minY = Math.min(p1.y, p2.y, p3.y, p4.y)
      const maxX = Math.max(p1.x, p2.x, p3.x, p4.x)
      const maxY = Math.max(p1.y, p2.y, p3.y, p4.y)
      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      }
    },
    getTotalBox(boxes) {
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      boxes.forEach((box) => {
        minX = Math.min(minX, box.x)
        minY = Math.min(minY, box.y)
        maxX = Math.max(maxX, box.x + box.width)
        maxY = Math.max(maxY, box.y + box.height)
      })
      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      }
    },
    boundBoxFunc(oldBox, newBox) {
      const box = this.getClientRect(newBox)
      const isOut =
        box.x < 0 ||
        box.y < 0 ||
        box.x + box.width > this.stageConfig.width ||
        box.y + box.height > this.stageConfig.height
      if (isOut) {
        return oldBox
      }
      return newBox
    },
    handleRectDragMove(e) {
      const node = e.target
      const newX = node.x()
      const newY = node.y()
      const rectConfig = this.rectangles.find((rect) => rect.id === node.id())
      if (rectConfig) {
        rectConfig.x = newX
        rectConfig.y = newY
      }
    },
    handleTransformStart() {
      // 可以在这里添加变换开始时的逻辑
    },
    handleTransformEnd() {
      this.saveState()
      // 可以在这里添加变换结束时的逻辑
    },
    handleResize() {
      this.stageConfig.width = window.innerWidth
      this.stageConfig.height = window.innerHeight
    },
    handleMouseDown(e) {
      this.showBrushOptions = false
      if (this.isSelectionEnabled && this.selectedItems.length > 0) {
        const pos = e.target.getStage().getPointerPosition()
        const transformer = this.$refs.transformerRef.getNode()
        const box = this.getTotalBox(transformer.nodes().map((node) => node.getClientRect()))
        if (
          pos.x >= box.x &&
          pos.x <= box.x + box.width &&
          pos.y >= box.y &&
          pos.y <= box.y + box.height
        ) {
          this.isDragging = true
          this.dragStartPos = pos
        }
      }
      if (this.isDrawing) {
        const pos = e.target.getStage().getPointerPosition()
        this.currentLinePoints = [pos.x, pos.y]
      }
      if (this.isErasing) {
        this.isMouseDown = true
      }
      if (this.isCompassing) {
        const pos = e.target.getStage().getPointerPosition()
        this.currentCircleCenter = pos
      }
      if (this.isQuadrilateralDrawing) {
        const pos = e.target.getStage().getPointerPosition()
        this.currentLinePoints = [pos.x, pos.y]
      }
    },
    handleMouseMove(e) {
      if (this.isDragging) {
        const pos = e.target.getStage().getPointerPosition()
        const dx = pos.x - this.dragStartPos.x
        const dy = pos.y - this.dragStartPos.y
        const transformer = this.$refs.transformerRef.getNode()
        const nodes = transformer.nodes()
        nodes.forEach((node) => {
          const newX = node.x() + dx
          const newY = node.y() + dy
          node.position({ x: newX, y: newY })
        })
        this.dragStartPos = pos
      }
      if (this.isDrawing && this.currentLinePoints.length > 0) {
        const pos = e.target.getStage().getPointerPosition()
        this.currentLinePoints = [...this.currentLinePoints, pos.x, pos.y]
        this.currentLineTimestamps.push(Date.now())
      }
      if (this.isErasing && this.isMouseDown) {
        const pos = e.target.getStage().getPointerPosition()
        this.rectangles = this.rectangles.filter((rect) => {
          return (
            pos.x < rect.x ||
            pos.x > rect.x + rect.width ||
            pos.y < rect.y ||
            pos.y > rect.y + rect.height
          )
        })
        this.drawnLines = this.drawnLines.flatMap((line) => {
          const lineNode = this.$refs.transformerRef.getNode().getStage().findOne(`#${line.id}`)
          if (!lineNode) return []
          // 缺少对文字元素的处理 ↓↓↓
          if (line.type === 'text') {
            // 计算文字边界框
            const textWidth = line.text.length * line.fontSize * 0.6 // 估算文字宽度
            const textHeight = line.fontSize
            // 检查是否在擦除区域内
            if (
              pos.x >= line.x &&
              pos.x <= line.x + textWidth &&
              pos.y >= line.y &&
              pos.y <= line.y + textHeight
            ) {
              return [] // 擦除该文字
            }
            return [line] // 保留未擦到的文字
          }
          const transform = lineNode.getAbsoluteTransform().copy()
          transform.invert()
          const localPos = transform.point(pos)
          const segments = []
          let currentSegment = []
          for (let i = 0; i < line.points.length; i += 2) {
            const x = line.points[i]
            const y = line.points[i + 1]
            const distance = this.pointToLineDistance(
              localPos.x,
              localPos.y,
              x,
              y,
              line.points[i + 2] || x,
              line.points[i + 3] || y
            )
            if (distance > 10) {
              currentSegment.push(x, y)
            } else if (currentSegment.length > 0) {
              segments.push([...currentSegment])
              currentSegment = []
            }
          }
          if (currentSegment.length > 0) {
            segments.push(currentSegment)
          }
          return segments.map((points) => ({
            ...line,
            points,
            id: `${line.id}-${Math.random().toString(36).substr(2, 5)}`
          }))
        })
        this.drawnCircles = this.drawnCircles.filter((circle) => {
          const distance = Math.sqrt((pos.x - circle.x) ** 2 + (pos.y - circle.y) ** 2)
          return distance > circle.radius + this.brushWidth / 2
        })
        this.drawnQuadrilaterals = this.drawnQuadrilaterals.filter((quad) => {
          const startX = quad.x
          const startY = quad.y
          const endX = quad.x + quad.width
          const endY = quad.y + quad.height
          return !(
            pos.x >= Math.min(startX, endX) &&
            pos.x <= Math.max(startX, endX) &&
            pos.y >= Math.min(startY, endY) &&
            pos.y <= Math.max(startY, endY)
          )
        })
      }
      if (this.isCompassing && this.currentCircleCenter) {
        const pos = e.target.getStage().getPointerPosition()
        this.currentCircleRadius = Math.sqrt(
          (pos.x - this.currentCircleCenter.x) ** 2 + (pos.y - this.currentCircleCenter.y) ** 2
        )
      }
      if (this.isQuadrilateralDrawing && this.currentLinePoints.length > 0) {
        const pos = e.target.getStage().getPointerPosition()
        const startX = this.currentLinePoints[0]
        const startY = this.currentLinePoints[1]
        this.currentQuadrilateral = {
          x: Math.min(startX, pos.x),
          y: Math.min(startY, pos.y),
          width: Math.abs(pos.x - startX),
          height: Math.abs(pos.y - startY),
          stroke: this.selectColor,
          strokeWidth: this.brushWidth,
          fill: 'transparent',
          id: `temp-quad-${Date.now()}`
        }
      }
    },
    handleMouseUp(e) {
      if (this.isDragging) {
        const transformer = this.$refs.transformerRef.getNode()
        const nodes = transformer.nodes()
        // if (!nodes.length) return
        // const boxes = nodes.map((node) => node.getClientRect())
        // const box = this.getTotalBox(boxes)
        // const pos = e.target.getStage().getPointerPosition()
        // const dx = pos.x - this.dragStartPos.x
        // const dy = pos.y - this.dragStartPos.y
        // nodes.forEach((shape) => {
        //   const absPos = shape.getAbsolutePosition()
        //   const offsetX = box.x - absPos.x
        //   const offsetY = box.y - absPos.y
        //   const newAbsPos = { x: absPos.x, y: absPos.y }
        //   if (box.x < 0) {
        //     newAbsPos.x = -offsetX
        //   }
        //   if (box.y < 0) {
        //     newAbsPos.y = -offsetY
        //   }
        //   if (box.x + box.width > this.stageConfig.width) {
        //     newAbsPos.x = this.stageConfig.width - box.width - offsetX
        //   }
        //   if (box.y + box.height > this.stageConfig.height) {
        //     newAbsPos.y = this.stageConfig.height - box.height - offsetY
        //   }
        //   shape.setAbsolutePosition(newAbsPos)
        //   if (shape.getClassName() === 'Line') {
        //     const line = this.drawnLines.find((l) => l.id === shape.id())
        //     if (line) {
        //       const transform = shape.getAbsoluteTransform()
        //       const points = shape.points()
        //       const transformedPoints = []
        //       for (let i = 0; i < points.length; i += 2) {
        //         const point = transform.point({
        //           x: points[i],
        //           y: points[i + 1]
        //         })
        //         transformedPoints.push(point.x, point.y)
        //       }
        //       line.points = transformedPoints
        //       line.x = shape.x()
        //       line.y = shape.y()
        //       line.rotation = shape.rotation()
        //       line.scaleX = shape.scaleX()
        //       line.scaleY = shape.scaleY()
        //     }
        //   }
        // })
        nodes.forEach((shape) => {
          console.log(shape, 'shapeshapeshapeshapeshape')

          if (shape.getClassName() === 'Line') {
            const line = this.drawnLines.find((l) => l.id === shape.id())
            if (line) {
              // 获取绝对位置和变换矩阵
              const absPos = shape.getAbsolutePosition()
              const scaleX = shape.scaleX()
              const scaleY = shape.scaleY()
              const rotation = shape.rotation()

              // 重置变换属性避免重复计算
              shape.scaleX(1)
              shape.scaleY(1)
              shape.rotation(0)

              // 直接获取相对坐标点
              line.points = shape.points()
              line.x = absPos.x
              line.y = absPos.y

              // 还原变换属性
              shape.scaleX(scaleX)
              shape.scaleY(scaleY)
              shape.rotation(rotation)
            }
          }
        })
        this.saveState()
        this.isDragging = false
      }
      this.isMouseDown = false
      this.isDragging = false
      if (this.isDrawing && this.currentLinePoints.length > 0) {
        const newLine = {
          points: this.currentLinePoints,
          stroke: this.selectColor,
          strokeWidth: this.brushWidth,
          tension: 0.5,
          id: `line-${this.lineIdCounter++}`,
          timestamps:
            this.currentLineTimestamps.length === this.currentLinePoints.length / 2
              ? this.currentLineTimestamps
              : Array(this.currentLinePoints.length / 2)
                  .fill()
                  .map((_, i) => Date.now() + i)
        }
        if (this.isIntellect) {
          this.AllPoints = [] // 清空之前的智能识别线条
          // 把点击智能识别以后的线条存起来
          this.intellectLines.push(newLine)
          this.drawnLines.push(newLine)
          // 存储当前智能识别线条的ID集合
          const tempLineIds = new Set(this.intellectLines.map((line) => line.id))
          const currentLines = [...this.intellectLines]
          const currentWidth = this.brushWidth
          // 清除之前的定时器
          clearTimeout(this.debounceTimer)
          // 记录最后绘制时间
          this.lastDrawTime = Date.now()
          this.debounceTimer = setTimeout(async () => {
            // 检查2秒内是否有新绘制
            if (Date.now() - this.lastDrawTime < 1000) return

            try {
              const recognizer = useRecognizer()
              this.AllPoints = []
              currentLines.forEach((line, index) => {
                // 判断线条是否存在 || 判断是否缺少坐标点
                if (!line.points || line.points.length % 2 !== 0) return
                const points = []
                for (let i = 0; i < line.points.length; i += 2) {
                  points.push({
                    x: line.points[i],
                    y: line.points[i + 1],
                    t: line.timestamps[i / 2],
                    p: currentWidth
                  })
                }
                this.AllPoints.push({
                  id: line.id,
                  stroke: line.stroke,
                  pointerType: 'pen',
                  length: 100,
                  creationTime: 1,
                  modificationDate: 1,
                  style: {
                    width: 1
                  },
                  type: 'stroke',
                  pointers: points,
                  pointCount: points.length
                })
              })
              console.log(this.AllPoints, 'this.AllPoints')

              await recognizer.send(this.AllPoints, 'zh').then((res) => {
                console.log(res, 'resreds')
                try {
                  const result = typeof res === 'string' ? JSON.parse(res) : res
                  this.recoData = result
                  this.createTextElements(result) // 传递解析后的结果
                  // 识别成功后移除临时线条
                  this.drawnLines = this.drawnLines.filter((line) => !tempLineIds.has(line.id))
                  this.saveState()
                  this.intellectLines = [] // 清空智能识别线条
                } catch (error) {
                  console.error('解析识别结果失败:', error)
                }
                // this.recoData = res
                // // 新增：创建文字元素
                // this.createTextElements(res)
                // // 新增：识别成功后移除临时线条
                // this.drawnLines = this.drawnLines.filter((line) => !tempLineIds.has(line.id))
                // this.saveState()
              })
              // console.log('识别结果:', result)
            } catch (error) {
              console.error('识别失败:', error)
            }
          }, 1000)
        } else {
          this.drawnLines.push(newLine)
        }
        // this.drawnLines.push(newLine)
        this.currentLineTimestamps = []
        this.currentLinePoints = []
        this.saveState()
      }
      if (this.isCompassing && this.currentCircleCenter && this.currentCircleRadius > 0) {
        const newCircle = {
          x: this.currentCircleCenter.x,
          y: this.currentCircleCenter.y,
          radius: this.currentCircleRadius,
          stroke: this.selectColor,
          strokeWidth: this.brushWidth,
          fill: 'transparent',
          id: `circle-${this.circleIdCounter++}`
        }
        this.drawnCircles.push(newCircle)
        this.currentCircleCenter = null
        this.currentCircleRadius = 0
        this.saveState()
      }
      if (this.isErasing) {
        this.saveState()
      }
      if (this.isQuadrilateralDrawing && this.currentLinePoints.length > 0) {
        this.drawnQuadrilaterals.push({
          ...this.currentQuadrilateral,
          id: `quadrilateral-${this.quadrilateralIdCounter}`
        })
        this.quadrilateralIdCounter++
        this.currentLinePoints = []
        this.currentQuadrilateral = null
        this.saveState()
      }
    },
    // 新增方法：创建文字元素
    createTextElements(recoData) {
      // 添加数据格式校验
      if (!Array.isArray(recoData)) {
        console.error('无效的识别数据格式:', recoData)
        return
      }
      recoData.forEach((item, index) => {
        const correspondingLine = this.intellectLines[index]
        if (correspondingLine && correspondingLine.points.length > 0) {
          const [x, y] = correspondingLine.points
          // 通过坐标点计算包围盒
          let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity
          correspondingLine.points.forEach((val, i) => {
            if (i % 2 === 0) {
              // x坐标
              minX = Math.min(minX, val)
              maxX = Math.max(maxX, val)
            } else {
              // y坐标
              minY = Math.min(minY, val)
              maxY = Math.max(maxY, val)
            }
          })
          const fontSize = Math.max(
            // 24, // 最小字号
            Math.max(
              (maxY - minY) * 1.5, // 根据高度计算
              (maxX - minX) * 1.5 // 根据宽度计算
            )
          )
          console.log(fontSize, 'fontSizefontSizefontSize')

          this.drawnLines.push({
            type: 'text',
            text: item.label,
            x,
            y: y - 20,
            fontSize: fontSize,
            fill: this.selectColor,
            id: `text-${Date.now()}-${index}`
          })
        }
      })
    },

    updateTransformerNodes() {
      const transformer = this.$refs.transformerRef.getNode()
      const nodes = this.selectedItems.map((item) => {
        const node = transformer.getStage().findOne(`#${item.id}`)
        if (node && item.type === 'text') {
          // 重置缩放比例以保证文字清晰
          node.scaleX(1)
          node.scaleY(1)
        }
        return node
        // return transformer.getStage().findOne(`#${item.id}`)
      })
      transformer.nodes(nodes.filter((n) => n)) // 过滤空节点
      // transformer.nodes(nodes)
    },
    pointToLineDistance(x, y, x1, y1, x2, y2) {
      const A = x - x1
      const B = y - y1
      const C = x2 - x1
      const D = y2 - y1
      const dot = A * C + B * D
      const len_sq = C * C + D * D
      let param = -1
      if (len_sq !== 0) {
        param = dot / len_sq
      }
      let xx, yy
      if (param < 0) {
        xx = x1
        yy = y1
      } else if (param > 1) {
        xx = x2
        yy = y2
      } else {
        xx = x1 + param * C
        yy = y1 + param * D
      }
      const dx = x - xx
      const dy = y - yy
      return Math.sqrt(dx * dx + dy * dy)
    },
    saveState() {
      const currentState = {
        rectangles: [...this.rectangles],
        drawnLines: [...this.drawnLines],
        drawnCircles: [...this.drawnCircles],
        drawnQuadrilaterals: [...this.drawnQuadrilaterals]
      }
      this.historyStack.push(currentState)
    },
    undo() {
      if (this.historyStack.length > 1) {
        this.historyStack.pop()
        const previousState = this.historyStack[this.historyStack.length - 1]
        this.rectangles = [...previousState.rectangles]
        this.drawnLines = [...previousState.drawnLines]
        this.drawnCircles = [...previousState.drawnCircles]
        this.drawnQuadrilaterals = [...previousState.drawnQuadrilaterals]
      }
    }
  }
}
</script>

<style scoped>
button {
  margin: 10px;
  padding: 5px 10px;
  font-size: 16px;
}
.brush-options {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  padding: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 999;
}
.brush-options .color-picker {
  display: flex;
  gap: 2px;
  margin-bottom: 5px;
}
.brush-options .color-picker button {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 2px;
  padding: 0;
  cursor: pointer;
}
.brush-options .size-picker button {
  display: block;
  margin: 2px 0;
  padding: 3px 10px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}
.brush-options button:hover {
  opacity: 0.8;
}
</style>
