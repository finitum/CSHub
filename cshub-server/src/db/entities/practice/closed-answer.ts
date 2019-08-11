import { ChildEntity, Column } from "typeorm";
import { Exclude, Expose } from "class-transformer";
import { Answer } from "./answer";

@Exclude()
@ChildEntity()
export class ClosedAnswer extends Answer {
    @Expose()
    @Column()
    closedAnswerText!: string;

    @Column()
    correct!: boolean;
}
