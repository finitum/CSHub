import {uiStoreBuilder} from "./state";

export const drawerState = uiStoreBuilder.read((state) => state.navbar.open, "drawerState");

export const editDialogState = uiStoreBuilder.read((state) => state.editDialogState, "editDialogState");

export const paginationPageState = uiStoreBuilder.read((state) => state.paginationPageState, "paginationPageState");

export const notificationDialog = uiStoreBuilder.read((state) => state.notificationDialog, "notificationDialog");

export const markdownDialog = uiStoreBuilder.read((state) => state.markdownDialog, "markdownDialog");
