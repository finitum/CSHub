import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Post} from "./post";
import {Study} from "./study";
import {ITopic} from "../../../../cshub-shared/src/entities/topic";

@Entity({
    name: "topics"
})
export class Topic implements ITopic {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Topic, topic => topic.children, {
        nullable: true,
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT"
    })
    @JoinColumn({ name: "parentid" })
    parent: Topic;

    @OneToMany(type => Topic, topic => topic.parent)
    children: Topic[];

    @OneToMany(type => Post, post => post.topic)
    posts: Post[];

    @OneToOne(type => Study, study => study.topTopic, {
        nullable: true
    })
    study: Study;

    @Column({
        type: "text"
    })
    name: string;

    @Column({
        unique: true
    })
    hash: number;

    @Column({
        nullable: true
    })
    cacheVersion: number;
}
