import { ChildEntity, Column } from "typeorm";
import { Exclude } from "class-transformer";
import { Choice } from "./choice";

@Exclude()
@ChildEntity()
export class OpenTextAnswer extends Choice {
    @Column()
    openAnswerText!: string;

    constructor(openAnswerText: string) {
        super();
        this.openAnswerText = openAnswerText;
    }
}
