import { Entity, ManyToOne, PrimaryGeneratedColumn, RelationId, TableInheritance } from "typeorm";
import { Question } from "./question";
import { IChoice } from "../../../../../cshub-shared/src/entities/answer";
import { Exclude, Expose } from "class-transformer";

@Exclude()
@Entity({
    name: "answer"
})
@TableInheritance({ column: { type: "varchar", name: "type" } })
export abstract class Choice implements IChoice {
    @Expose()
    @PrimaryGeneratedColumn()
    id!: number;

    @Expose()
    @ManyToOne(type => Question, question => question.answers, {
        nullable: false
    })
    question!: Question;

    @RelationId((answer: Choice) => answer.question)
    questionId!: number;
}
