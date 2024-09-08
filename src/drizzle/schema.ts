import {
    pgTable,
    serial,
    varchar,
    text,
    smallserial,
    date,
    integer,
    boolean,
    pgEnum,
    timestamp,
    primaryKey,
} from "drizzle-orm/pg-core";

// Enums
export const resultTypeEnum = pgEnum("enum_result_type", [
    "On Time",
    "Draw offer",
    "Abandon",
    "Resign",
    "Stalemate",
    "N Moves Rule",
    "Check Mate",
]);
export const typePairingEnum = pgEnum("enum_type_pairing", [
    "Link Shared",
    "Friend Req",
    "Random Pairing",
]);
export const winnerEnum = pgEnum("enum_winner", ["White", "Black", "Draw"]);
export const productAssetTypeEnum = pgEnum("enum_product_asset_type", [
    "Board",
    "Pieces",
    "Board and Pieces",
    "Reaction",
]);
export const usersMembersOfClubRoleEnum = pgEnum(
    "enum_users_members_of_club_role",
    ["Public", "Private"],
);

// Tables
export const userAvatarImg = pgTable("user_avatar_img", {
    userAvatarImgId: smallserial("user_avatar_img_id").primaryKey(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
});

export const users = pgTable("users", {
    userId: serial("user_id").primaryKey(),
    nickname: varchar("nickname", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    dateOfBirth: date("date_of_birth"),
    countryFlag: varchar("country_flag", { length: 255 }),
    about: text("about"),
    fkUserAvatarImgId: integer("fk_user_avatar_img_id")
        .notNull()
        .references(() => userAvatarImg.userAvatarImgId),
    eloRapid: integer("elo_rapid").notNull(),
    eloBlitz: integer("elo_blitz").notNull(),
    eloBullet: integer("elo_bullet").notNull(),
    eloArcade: integer("elo_arcade").notNull(),
    currentCoins: integer("current_coins").notNull(),
    acumulatedAlltimeCoins: integer("acumulated_alltime_coins").notNull(),
    nPuzzlesSolved: integer("n_puzzles_solved").notNull().default(0),
    streakDays: integer("streak_days").default(0),
    isDeleted: boolean("is_deleted").notNull().default(false),
});

export const gameMode = pgTable("game_mode", {
    gameModeId: smallserial("game_mode_id").primaryKey(),
    mode: varchar("mode", { length: 255 }).notNull(),
});

export const game = pgTable("game", {
    gameId: serial("game_id").primaryKey(),
    gameTimestamp: timestamp("game_timestamp", {
        withTimezone: true,
    }).notNull(),
    pgn: text("pgn").notNull(),
    fkWhitesPlayerId: integer("fk_whites_player_id").references(
        () => users.userId,
    ),
    fkBlacksPlayerId: integer("fk_blacks_player_id").references(
        () => users.userId,
    ),
    winner: winnerEnum("winner"),
    whitesPlayerTime: integer("whites_player_time"),
    blacksPlayerTime: integer("blacks_player_time"),
    eloWhitesBeforeGame: integer("elo_whites_before_game"),
    eloBlacksBeforeGame: integer("elo_blacks_before_game"),
    eloWhitesAfterGame: integer("elo_whites_after_game"),
    eloBlacksAfterGame: integer("elo_blacks_after_game"),
    fkGameModeId: integer("fk_game_mode_id")
        .notNull()
        .references(() => gameMode.gameModeId),
    resultType: resultTypeEnum("result_type"),
    typePairing: typePairingEnum("type_pairing").notNull(),
});

export const arcadeModifiers = pgTable("arcade_modifiers", {
    arcadeModifierId: smallserial("arcade_modifier_id").primaryKey(),
    modifierName: varchar("modifier_name", { length: 255 }).notNull(),
});

export const gameWithArcadeModifiers = pgTable(
    "game_with_arcade_modifiers",
    {
        fkGameId: integer("fk_game_id")
            .notNull()
            .references(() => game.gameId),
        fkArcadeModifierId: integer("fk_arcade_modifier_id")
            .notNull()
            .references(() => arcadeModifiers.arcadeModifierId),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.fkGameId, table.fkArcadeModifierId] }),
    }),
);

export const friendship = pgTable("friendship", {
    friendshipId: serial("friendship_id").primaryKey(),
    userId1: integer("user_id_1")
        .notNull()
        .references(() => users.userId),
    userId2: integer("user_id_2")
        .notNull()
        .references(() => users.userId),
    friendshipSince: date("friendship_since").notNull(),
});

export const puzzle = pgTable("puzzle", {
    puzzleId: serial("puzzle_id").primaryKey(),
    fen: text("fen").notNull(),
    moves: varchar("moves", { length: 255 }).notNull(),
    rating: integer("rating").notNull(),
    popularity: integer("popularity"),
});

export const puzzlesSolvedByUser = pgTable(
    "puzzles_solved_by_user",
    {
        fkUserId: integer("fk_user_id")
            .notNull()
            .references(() => users.userId),
        fkPuzzleId: integer("fk_puzzle_id")
            .notNull()
            .references(() => puzzle.puzzleId),
        dateSolved: date("date_solved").notNull(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.fkUserId, table.fkPuzzleId] }),
    }),
);

export const productAsset = pgTable("product_asset", {
    productAssetId: serial("product_asset_id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    coinsCost: integer("coins_cost").notNull(),
    description: text("description").notNull(),
    content: text("content").notNull(),
    type: productAssetTypeEnum("type").notNull(),
});

export const productAssetBoughtByUser = pgTable(
    "product_asset_bought_by_user",
    {
        fkProductAssetId: integer("fk_product_asset_id")
            .notNull()
            .references(() => productAsset.productAssetId),
        fkUserId: integer("fk_user_id")
            .notNull()
            .references(() => users.userId),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.fkProductAssetId, table.fkUserId] }),
    }),
);

export const notificationType = pgTable("notification_type", {
    typeId: smallserial("type_id").primaryKey(),
    typeName: varchar("type_name", { length: 255 }).notNull(),
});

export const notificationOfUser = pgTable("notification_of_user", {
    notificationId: serial("notification_id").primaryKey(),
    fkUserWhoSentId: integer("fk_user_who_sent_id").references(
        () => users.userId,
    ),
    fkUserWhoReceiveId: integer("fk_user_who_receive_id").references(
        () => users.userId,
    ),
    title: varchar("title", { length: 255 }).notNull(),
    textContent: text("text_content"),
    fkNotificationTypeId: integer("fk_notification_type_id")
        .notNull()
        .references(() => notificationType.typeId),
    actionText1: varchar("action_text_1", { length: 255 }),
    actionLink1: varchar("action_link_1", { length: 255 }),
    actionText2: varchar("action_text_2", { length: 255 }),
    actionLink2: varchar("action_link_2", { length: 255 }),
    createdTimestamp: timestamp("created_timestamp", {
        withTimezone: true,
    }).notNull(),
    viewed: boolean("viewed").default(false),
});

export const club = pgTable("club", {
    clubId: serial("club_id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    about: text("about").notNull(),
    profilePic: varchar("profile_pic", { length: 255 }).notNull(),
    createdAt: date("created_at").notNull(),
});

export const usersMembersOfClub = pgTable(
    "users_members_of_club",
    {
        fkClubId: integer("fk_club_id")
            .notNull()
            .references(() => club.clubId),
        fkUserId: integer("fk_user_id")
            .notNull()
            .references(() => users.userId),
        memberRole: usersMembersOfClubRoleEnum("member_role").notNull(),
        memberSince: date("member_since").notNull(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.fkClubId, table.fkUserId] }),
    }),
);

export const postOfClub = pgTable("post_of_club", {
    postId: serial("post_id").primaryKey(),
    fkUserId: integer("fk_user_id").references(() => users.userId),
    fkClubId: integer("fk_club_id").references(() => club.clubId),
    textContent: text("text_content"),
    imgId: varchar("img_id", { length: 255 }),
    publicationDate: date("publication_date").notNull(),
    totalLikes: integer("total_likes").notNull(),
});

export const likeInPostOfClub = pgTable(
    "like_in_post_of_club",
    {
        fkPostId: integer("fk_post_id")
            .notNull()
            .references(() => postOfClub.postId),
        fkUserId: integer("fk_user_id")
            .notNull()
            .references(() => users.userId),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.fkPostId, table.fkUserId] }),
    }),
);

export const commentInPost = pgTable("comment_in_post", {
    commentInPostId: serial("comment_in_post_id").primaryKey(),
    fkUserId: integer("fk_user_id").references(() => users.userId),
    fkPostId: integer("fk_post_id").references(() => postOfClub.postId),
    commentText: text("comment_text").notNull(),
    commentDate: date("comment_date").notNull(),
});
