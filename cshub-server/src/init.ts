import { getRepository } from "typeorm";
import { Study } from "./db/entities/study";
import { Topic } from "./db/entities/topic";
import { User } from "./db/entities/user";
import { EmailDomain } from "./db/entities/emaildomain";
import logger from "./utilities/Logger";
import { generateRandomTopicHash } from "./utilities/TopicsUtils";
import { getRandomNumberLarge } from "../../cshub-shared/src/utilities/Random";
import { hashPassword } from "./auth/HashPassword";

export async function initializeDatabase(): Promise<void> {
    // Create a default topic and study if it doesn't exist so you aren't stuck.
    // From this default topic, an Admin can create more studies/topics
    // The default topic doesn't seem strictly necessary but no studies can exist without
    // a root topic
    const defaultTopicName = "DefaultTopic";
    const defaultStudyName = "DefaultStudy";
    const defaultAdminName = "DefaultAdmin";
    const defaultDomainName = "DefaultDomain";

    const studyRepository = getRepository(Study);
    const topicRepository = getRepository(Topic);
    const userRepository = getRepository(User);
    const domainRepository = getRepository(EmailDomain);

    const studyCount = await studyRepository.count();
    const amountOfAdmins = await userRepository.count({
        where: {
            admin: true,
        },
    });

    logger.info("Testing for default topic, study, domain and admin!");

    let topic = await topicRepository.findOne();
    if (!topic) {
        logger.info("Creating default topic");

        // If so, create new topic
        const hash = await generateRandomTopicHash();

        const newTopic = new Topic();
        newTopic.name = defaultTopicName;
        newTopic.parentid = null;
        newTopic.hash = hash;
        topic = await topicRepository.save(newTopic);
    }

    if (studyCount === 0) {
        logger.info("Creating default study");

        const study = new Study();
        study.name = defaultStudyName;
        study.topTopic = topic;
        await studyRepository.save(study);
    }

    let domain = await domainRepository.findOne();
    if (!domain) {
        logger.info("Creating default domain");

        const newDomain = new EmailDomain();
        newDomain.domain = defaultDomainName;
        domain = await domainRepository.save(newDomain);
    }

    if (amountOfAdmins === 0) {
        logger.info("Creating default admin");

        const newAdmin = new User();
        newAdmin.admin = true;
        newAdmin.email = defaultAdminName;
        newAdmin.domain = domain;
        newAdmin.verified = true;
        newAdmin.firstname = "admin";
        newAdmin.lastname = "admin";

        const password = getRandomNumberLarge().toString();
        newAdmin.password = await hashPassword(password);
        logger.info(`Created new admin, username: ${defaultAdminName}, password: ${password}`);

        await userRepository.insert(newAdmin);
    }
}
