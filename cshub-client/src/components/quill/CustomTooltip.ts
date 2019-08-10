import Quill, { BoundsStatic } from "quill";

const Tooltip = Quill.import("ui/tooltip");

export class CustomTooltip extends Tooltip {
    constructor(quill: Quill, boundsContainer: BoundsStatic, innerElement: HTMLElement) {
        super(quill, boundsContainer);
        super.root.remove();
        super.root = quill.addContainer(innerElement);
        if (this.quill.root === this.quill.scrollingContainer) {
            this.quill.root.addEventListener("scroll", () => {
                this.root.style.marginTop = `${-1 * this.quill.root.scrollTop}px`;
            });
        }
        this.hide();
    }
}
