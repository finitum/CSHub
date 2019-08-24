import { ChildEntity, Column } from "typeorm";
import { Exclude, Expose } from "class-transformer";
import { Choice } from "./choice";

@Exclude()
@ChildEntity()
export class ClosedAnswer extends Choice {
    @Expose()
    @Column()
    closedAnswerText!: string;

    @Column()
    correct!: boolean;

    constructor(closedAnswerText: string, correct: boolean) {
        super();
        this.closedAnswerText = closedAnswerText;
        this.correct = correct;
    }
}
