<template>
  <div id="app">
     <button @click="parentBtn">Clear</button>
    <Whiteboard ref="white" />
   
  </div>
</template>

<script>
import Whiteboard from './components/Whiteboard.vue'

export default {
  name: 'App',
  components: {
    Whiteboard
  },
  methods: {
    parentBtn() {
      this.$refs.white.toggleDrawing()
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>    