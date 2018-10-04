declare module 'vue-socket.io' {
    import {PluginFunction} from 'vue';

    const VueSocketIO: VueSocketIO;
    export default VueSocketIO;

    export interface VueSocketIO {
        install: PluginFunction<string>;
    }
}
