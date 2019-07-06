import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";

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

    @Column()
    name: string;

    @Column({
        unique: true
    })
    hash: number;
}
