import {Vue} from 'vue/types/vue';

declare module 'vue/types/options' {

    interface ComponentOptions<V extends Vue> {
        sockets?: any
    }
}

declare module 'vue/types/vue' {
    export interface Vue   {
        $socket: any;
    }
}

declare var process: {
    env: {
        NODE_ENV: string,
        VUE_APP_SOCKETURL: string
    }
};
