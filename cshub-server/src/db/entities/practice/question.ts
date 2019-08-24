import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    RelationId
} from "typeorm";
import { Topic } from "../topic";
import { IQuestion, QuestionType } from "../../../../../cshub-shared/src/entities/question";
import { Exclude, Expose } from "class-transformer";
import { Choice } from "./choice";

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
    type!: QuestionType;

    @Expose()
    @OneToMany(type => Choice, answer => answer.question, {
        nullable: false,
        cascade: true
    })
    answers!: Choice[];

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
    @OneToOne(type => Question, question => question.replacedByQuestion, {
        nullable: true
    })
    @JoinColumn()
    replacesQuestion?: Question | null;

    // not the nicest solution, but it works. This marks which question will be set to inactive if this question is accepted
    @OneToOne(type => Question, question => question.replacesQuestion, {
        nullable: true
    })
    replacedByQuestion?: Question | null;

    @RelationId((question: Question) => question.replacesQuestion)
    replacesQuestionId?: number | null;
}
