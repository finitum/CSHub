import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./post";
import { Study } from "./study";
import { ITopic } from "../../../../cshub-shared/src/entities/topic";
import { Question } from "./question";

@Entity({
    name: "topics"
})
export class Topic implements ITopic {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(type => Topic, topic => topic.children, {
        nullable: true,
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT"
    })
    @JoinColumn({ name: "parentid" })
    parent!: Topic | null;

    @OneToMany(type => Topic, topic => topic.parent)
    children!: Topic[];

    @Column({
        type: "text"
    })
    name!: string;

    @Column({
        unique: true
    })
    hash!: number;

    @OneToOne(type => Study, study => study.topTopic, {
        nullable: true
    })
    study?: Study;

    // Not sent to client
    @OneToMany(type => Post, post => post.topic)
    posts?: Post[];

    @OneToMany(type => Question, question => question.topic)
    questions?: Question[];
}
