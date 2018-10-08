import {Vue} from "vue/types/vue";

// Now IntelliJ suddenly knows the components
import Post from "./components/posts/Post.vue";
import NavDrawer from "./components/global/NavDrawer.vue";
import NavDrawerItem from "./components/global/NavDrawerItem.vue";
import Toolbar from "./components/global/Toolbar.vue";

declare var process: {
    env: {
        NODE_ENV: string,
        VUE_APP_SOCKETURL: string,
        VUE_APP_DEBUG: string
    }
};

declare module "vue/types/vue" {
    export interface Vue   {
        errors?: any;
    }
}
