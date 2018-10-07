import {uiStoreBuilder} from "./state";

export const drawerState = uiStoreBuilder.read((state) => state.navbar.open, "drawerState");

export const postHeight = uiStoreBuilder.read((state) => state.post.height, "postHeight");
