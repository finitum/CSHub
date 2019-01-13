import {Vue} from "vue/types/vue";

declare var process: {
    env: {
        NODE_ENV: string,
        VUE_APP_API_URL: string,
        VUE_APP_DEBUG: string
    }
};

declare module "vue/types/vue" {

    export interface Vue   {
        $socket: any;
        sockets: any;
    }
}

declare module 'vue/types/options' {
    interface ComponentOptions<V extends Vue> {
        sockets?: any;
    }
}