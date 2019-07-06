import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Post} from "./post";

@Entity({
    name: "topics"
})
export class Topic {

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

    @OneToMany(type => Post, post => post.id)
    posts: Post[];

    @Column({
        type: "text"
    })
    name: string;

    @Column({
        unique: true
    })
    hash: number;
}
