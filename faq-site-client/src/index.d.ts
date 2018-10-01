import {Vue} from "vue/types/vue";

declare module 'vue/types/options' {

    interface ComponentOptions<V extends Vue> {
        sockets?: any
    }
}