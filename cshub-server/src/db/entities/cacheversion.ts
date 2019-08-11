import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name: "cacheversion"
})
export class CacheVersion {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "text"
    })
    type!: string;

    @Column()
    version!: number;
}
