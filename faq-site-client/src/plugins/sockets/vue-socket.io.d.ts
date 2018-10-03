declare module 'Vue-Socket.io' {
    import {PluginFunction} from "vue";

    const VueSocketIO: VueSocketIO
    export default VueSocketIO

    export interface VueSocketIO {
        install: PluginFunction<string>
    }
}