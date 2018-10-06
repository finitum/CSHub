import {Vue} from "vue/types/vue";

declare var process: {
    env: {
        NODE_ENV: string,
        VUE_APP_SOCKETURL: string
    }
};
