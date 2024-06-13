-- CreateTable
CREATE TABLE `Games` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nickUser` VARCHAR(255) NOT NULL,
    `nameGame` VARCHAR(255) NOT NULL,
    `codeGame` INTEGER NOT NULL,
    `detailGame` VARCHAR(255) NULL,

    UNIQUE INDEX `Games_codeGame_key`(`codeGame`),
    INDEX `Games_codeGame_idx`(`codeGame`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Asks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gameId` INTEGER NOT NULL,
    `ask` VARCHAR(255) NOT NULL,
    `a` VARCHAR(255) NOT NULL,
    `b` VARCHAR(255) NOT NULL,
    `c` VARCHAR(255) NOT NULL,
    `d` VARCHAR(255) NOT NULL,
    `answer` VARCHAR(1) NOT NULL,

    INDEX `Asks_gameId_idx`(`gameId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Asks` ADD CONSTRAINT `Asks_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Games`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
