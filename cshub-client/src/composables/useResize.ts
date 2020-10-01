import { onMounted, onUnmounted } from "@vue/composition-api";

export function useResize(cb: () => void, target: EventTarget = window) {
    onMounted(() => {
        target.addEventListener("resize", cb);
    });

    onUnmounted(() => {
        target.removeEventListener("resize", cb);
    });
}
