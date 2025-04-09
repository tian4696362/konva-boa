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
    <button @click="logAllPoints">输出所有坐标</button>
    <v-stage
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
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import VueKonva from 'vue-konva'

export default {
  components: {
    ...VueKonva
  },
  data() {
    return {
      isSelectionEnabled: false, // 是否启用选择模式
      isDrawing: false, // 当前状态是否为画笔
      isErasing: false, // 当前状态是否为橡皮擦
      isCompassing: false, // 当前状态是否为画圆模式
      isQuadrilateralDrawing: false, // 当前状态是否为画四边形模式
      isMouseDown: false, // 鼠标是否按下
      stageConfig: {
        width: window.innerWidth, // 初始宽度
        height: window.innerHeight // 初始高度
      },
      showBrushOptions: false, // 画笔选项是否显示
      brushWidth: 5, // 画笔宽度
      selectColor: '#000000', // 画笔颜色
      rectangles: [
        // 矩形数组
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
        enabledAnchors:
          'top-left,top-center,top-right,right-center,bottom-right,bottom-center,bottom-left,left-center,rotation',
        boundBoxFunc: null
      },
      selectedItems: [], // 选中的矩形和线条
      drawnLines: [], // 绘制的线条数组
      drawnCircles: [], // 绘制的圆数组
      drawnQuadrilaterals: [], // 绘制的四边形数组
      currentLinePoints: [], // 当前绘制的线条点
      currentCircleCenter: null, // 当前圆的圆心
      currentCircleRadius: 0, // 当前圆的半径
      lineIdCounter: 0, // 线条ID计数器
      circleIdCounter: 0, // 圆ID计数器
      quadrilateralIdCounter: 0, // 四边形ID计数器
      currentQuadrilateral: null, // 当前绘制的四边形
      isDragging: false, // 是否正在拖动
      dragStartPos: null, // 拖动起始位置
      historyStack: [] // 历史记录栈
    }
  },
  mounted() {
    this.$nextTick(() => {
      const transformer = this.$refs.transformerRef.getNode()
      transformer.boundBoxFunc(this.boundBoxFunc)
    })
    window.addEventListener('resize', this.handleResize)
    // 初始化时将初始状态压入栈中
    this.saveState()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    logAllPoints() {
      this.drawnLines.forEach((line, index) => {
        // 将连续的点位数组转换为坐标对象数组
        const points = []
        for (let i = 0; i < line.points.length; i += 2) {
          points.push({
            x: line.points[i],
            y: line.points[i + 1]
          })
        }
        console.log(`线条 ${index} (ID: ${line.id}) 坐标点：`, {
          id: line.id,
          stroke: line.stroke,
          points: points,
          pointCount: points.length
        })
      })
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
    },
    toggleDrawing() {
      this.isDrawing = !this.isDrawing
      this.isSelectionEnabled = false
      this.isErasing = false
      this.isCompassing = false
      this.isQuadrilateralDrawing = false
      this.isMouseDown = false
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
    },
    toggleQuadrilateral() {
      console.log(this.drawnLines, 'drawnLines')
      this.isQuadrilateralDrawing = !this.isQuadrilateralDrawing
      this.isSelectionEnabled = false
      this.isDrawing = false
      this.isErasing = false
      this.isCompassing = false
      this.isMouseDown = false
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
      // 是否在拖动
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
        console.log(transformer, 'transformertransformer')
      }
      if (this.isDrawing && this.currentLinePoints.length > 0) {
        const pos = e.target.getStage().getPointerPosition()
        this.currentLinePoints = [...this.currentLinePoints, pos.x, pos.y]
        console.log(pos.x, pos.y, 'this.currentLinePoints')
      }
      // 擦除
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

          // 转换鼠标坐标到线条本地坐标系
          const transform = lineNode.getAbsoluteTransform().copy()
          transform.invert()
          const localPos = transform.point(pos)

          // 优化线段分割算法
          const segments = []
          let currentSegment = []

          for (let i = 0; i < line.points.length; i += 2) {
            const x = line.points[i]
            const y = line.points[i + 1]

            // 检测当前点是否在擦除范围内
            const distance = this.pointToLineDistance(
              localPos.x,
              localPos.y,
              x,
              y,
              line.points[i + 2] || x,
              line.points[i + 3] || y
            )

            if (distance > 10) {
              // 调整擦除敏感度
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
            id: `${line.id}-${Math.random().toString(36).substr(2, 5)}` // 生成新ID
          }))
        })
        // 擦圆
        this.drawnCircles = this.drawnCircles.filter((circle) => {
          const distance = Math.sqrt((pos.x - circle.x) ** 2 + (pos.y - circle.y) ** 2)
          return distance > circle.radius + this.brushWidth / 2
        })
        // 擦四边形
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
      // 画圆
      if (this.isCompassing && this.currentCircleCenter) {
        const pos = e.target.getStage().getPointerPosition()
        this.currentCircleRadius = Math.sqrt(
          (pos.x - this.currentCircleCenter.x) ** 2 + (pos.y - this.currentCircleCenter.y) ** 2
        )
      }
      // 画四边形
      if (this.isQuadrilateralDrawing && this.currentLinePoints.length > 0) {
        console.log('huizhi')
        const pos = e.target.getStage().getPointerPosition()
        console.log(this.currentLinePoints, 'this.currentLinePoints')
        const startX = this.currentLinePoints[0]
        const startY = this.currentLinePoints[1]
        this.currentQuadrilateral = {
          x: Math.min(startX, pos.x),
          y: Math.min(startY, pos.y),
          width: Math.abs(pos.x - startX),
          height: Math.abs(pos.y - startY),
          stroke: this.selectColor, // 确保包含样式属性
          strokeWidth: this.brushWidth,
          fill: 'transparent',
          id: `temp-quad-${Date.now()}` // 使用时间戳确保唯一性
        }
      }
    },
    handleMouseUp(e) {
      if (this.isDragging) {
        const transformer = this.$refs.transformerRef.getNode()
        const nodes = transformer.nodes()
        if (!nodes.length) return
        const boxes = nodes.map((node) => node.getClientRect())
        const box = this.getTotalBox(boxes)
        const pos = e.target.getStage().getPointerPosition()
        const dx = pos.x - this.dragStartPos.x
        const dy = pos.y - this.dragStartPos.y
        nodes.forEach((shape) => {
          const absPos = shape.getAbsolutePosition()
          const offsetX = box.x - absPos.x
          const offsetY = box.y - absPos.y
          const newAbsPos = { x: absPos.x, y: absPos.y }
          if (box.x < 0) {
            newAbsPos.x = -offsetX
          }
          if (box.y < 0) {
            newAbsPos.y = -offsetY
          }
          if (box.x + box.width > this.stageConfig.width) {
            newAbsPos.x = this.stageConfig.width - box.width - offsetX
          }
          if (box.y + box.height > this.stageConfig.height) {
            newAbsPos.y = this.stageConfig.height - box.height - offsetY
          }
          shape.setAbsolutePosition(newAbsPos)
          if (shape.getClassName() === 'Line') {
            const line = this.drawnLines.find((l) => l.id === shape.id())
            if (line) {
              // 获取变换后的绝对坐标
              const transform = shape.getAbsoluteTransform()
              const points = shape.points()

              // 转换所有点到舞台坐标
              const transformedPoints = []
              for (let i = 0; i < points.length; i += 2) {
                const point = transform.point({
                  x: points[i],
                  y: points[i + 1]
                })
                transformedPoints.push(point.x, point.y)
              }
              line.points = transformedPoints
              // 同步变换矩阵到数据模型
              line.x = shape.x()
              line.y = shape.y()
              line.rotation = shape.rotation()
              line.scaleX = shape.scaleX()
              line.scaleY = shape.scaleY()
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
          points: this.currentLinePoints, // 保存原始点坐标
          stroke: this.selectColor, // 线条颜色
          strokeWidth: this.brushWidth, // 线条宽度
          tension: 0.5, // 线条平滑度
          id: `line-${this.lineIdCounter++}` // 生成唯一ID
        }
        this.drawnLines.push(newLine)
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
        console.log('开始绘制四边形')

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
    updateTransformerNodes() {
      const transformer = this.$refs.transformerRef.getNode()
      const nodes = this.selectedItems.map((item) => {
        return transformer.getStage().findOne(`#${item.id}`)
      })
      transformer.nodes(nodes)
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
/* 可选样式，可根据需要调整 */
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
