import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { Topic } from "../topic";
import { User } from "../user";
import { IQuestion, QuestionType } from "../../../../../cshub-shared/src/entities/question";
import { Exclude, Expose } from "class-transformer";
import { Answer } from "./answer";

@Exclude()
@Entity({
    name: "question"
})
export class Question implements IQuestion {
    @Expose()
    @PrimaryGeneratedColumn()
    id!: number;

    @Expose()
    @Column({
        type: "text"
    })
    question!: string;

    @Expose()
    @Column({
        type: "text"
    })
    questionType!: QuestionType;

    @Expose()
    @OneToMany(type => Answer, answer => answer.question)
    answers!: Answer[];

    @Column({
        type: "text"
    })
    explanation!: string;

    @ManyToOne(type => Topic, topic => topic.questions, {
        nullable: false
    })
    topic!: Topic;

    @RelationId((question: Question) => question.topic)
    topicId!: number;

    @Column({
        default: false
    })
    active!: boolean;

    // not the nicest solution, but it works. This marks which question will be set to inactive if this question is accepted
    @OneToOne(type => Question, question => question.id, {
        nullable: true
    })
    replacesQuestion?: Question;

    @RelationId((question: Question) => question.replacesQuestion)
    replacesQuestionId?: number;

    // Just for statistics
    @ManyToOne(type => User, user => user.approvedQuestions, {
        nullable: true
    })
    approvedBy?: User;
}
