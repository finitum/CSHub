import { Entity, ManyToOne, PrimaryGeneratedColumn, RelationId, TableInheritance } from "typeorm";
import { Question } from "./question";
import { IAnswer } from "../../../../../cshub-shared/src/entities/answer";
import { Exclude, Expose } from "class-transformer";

@Exclude()
@Entity({
    name: "answer"
})
@TableInheritance({ column: { type: "varchar", name: "type" } })
export abstract class Answer implements IAnswer {
    @Expose()
    @PrimaryGeneratedColumn()
    id!: number;

    @Expose()
    @ManyToOne(type => Question, question => question.answers, {
        nullable: false
    })
    question!: Question;

    @RelationId((answer: Answer) => answer.question)
    questionId!: number;
}
