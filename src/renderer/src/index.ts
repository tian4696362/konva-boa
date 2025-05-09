import { App } from 'vue';
import Whiteboard from './components/Whiteboard.vue';
import VueKonva from 'vue-konva';

const WhiteboardPlugin = {
    install(app: App) {
        app.use(VueKonva);
        app.component('WhiteboardApp', Whiteboard);
        // 可以在这里注册更多组件、指令等
    }
};
export default WhiteboardPlugin;  