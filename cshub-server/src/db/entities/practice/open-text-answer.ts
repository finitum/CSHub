import { ChildEntity, Column } from "typeorm";
import { Exclude } from "class-transformer";
import { Answer } from "./answer";

@Exclude()
@ChildEntity()
export class OpenTextAnswer extends Answer {
    @Column()
    openAnswerText!: string;
}
