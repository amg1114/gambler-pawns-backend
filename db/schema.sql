CREATE TABLE IF NOT EXISTS user_avatar_img (
  user_avatar_img_id SMALLSERIAL PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL
);
-- avatar images are stored in: public/user_avatars/<file_name>


CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  nickname  VARCHAR(255) NOT NULL UNIQUE,
  email  VARCHAR(255) NOT NULL UNIQUE,
  password  VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  country_code  VARCHAR(255) NOT NULL,
  about text NOT NULL,
  fk_user_avatar_img_id SMALLINT NOT NULL,
  elo_rapid INT NOT NULL,
  elo_blitz INT NOT NULL,
  elo_bullet INT NOT NULL,
  elo_arcade INT NOT NULL,
  -- TODO: don't use trigger to increase this when solving a puzzle +2 coins and winning a game +45 coin,
  -- do it in the business logic of the api (current_coins) and (alltime_coins)
  current_coins INT NOT NULL,
  acumulated_alltime_coins INT NOT NULL,
  -- NOTE: trigger implemented for data integrity
  n_puzzles_solved INT NOT NULL DEFAULT 0,
  -- TODO: don't use trigger to increase streak_days, do it in the business logic of the api
  -- only when a puzzle is solved or a game is played
  streak_days INT DEFAULT 0,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  FOREIGN KEY (fk_user_avatar_img_id) REFERENCES user_avatar_img(user_avatar_img_id),
  CONSTRAINT chk_elo_positive_constraint CHECK (elo_rapid >= 0 AND elo_blitz >= 0 AND elo_bullet >= 0 AND elo_arcade >= 0),
  CONSTRAINT chk_coins_positive_constraint CHECK (current_coins >= 0 AND acumulated_alltime_coins >= 0)
);



CREATE TABLE IF NOT EXISTS game_mode (
    game_mode_id SMALLSERIAL PRIMARY KEY,
    mode VARCHAR(255) NOT NULL
);

CREATE TYPE enum_result_type AS ENUM('On Time', 'Draw offer', 'Abandon', 'Resign', 'Stalemate', 'N Moves Rule', 'Check Mate');
CREATE TYPE enum_type_pairing AS ENUM('Link Shared', 'Friend Req', 'Random Pairing');
CREATE TYPE enum_winner AS ENUM('White', 'Black', 'Draw');


CREATE TABLE IF NOT EXISTS game (
  game_id SERIAL PRIMARY KEY,
  game_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  pgn TEXT NOT NULL,
  fk_whites_player_id INT,
  fk_blacks_player_id INT,
  winner enum_winner,
  whites_player_time INT, --in seconds
  blacks_player_time INT, --in seconds
  elo_whites_before_game INT,
  elo_blacks_before_game INT,
  elo_whites_after_game INT,
  elo_blacks_after_game INT,
  fk_game_mode_id SMALLINT NOT NULL,
  result_type enum_result_type,
  type_pairing enum_type_pairing NOT NULL,
  FOREIGN KEY (fk_whites_player_id) REFERENCES users(user_id),
  FOREIGN KEY (fk_blacks_player_id) REFERENCES users(user_id),
  FOREIGN KEY (fk_game_mode_id) REFERENCES game_mode(game_mode_id),
  CONSTRAINT chk_positive_time CHECK( whites_player_time >= 0 AND blacks_player_time >= 0),
  CONSTRAINT chk_positive_elo_before_after_game CHECK (elo_whites_before_game >= 0 AND elo_blacks_before_game >= 0 AND elo_whites_after_game >= 0 AND elo_blacks_after_game >= 0)
);

-- alternative for SETS datatype in other DBMS like MySQL or SqlServer
CREATE TABLE IF NOT EXISTS arcade_modifiers (
  arcade_modifier_id SMALLSERIAL PRIMARY KEY,
  modifier_name VARCHAR(255) NOT NULL
);

-- A game of mode arcade can have one or many arcade_modifiers
-- like a multivalued attribute 
CREATE TABLE IF NOT EXISTS game_with_arcade_modifiers (
  fk_game_id INT NOT NULL,
  fk_arcade_modifier_id SMALLINT NOT NULL,
  FOREIGN KEY (fk_game_id) REFERENCES game(game_id),
  FOREIGN KEY (fk_arcade_modifier_id) REFERENCES arcade_modifiers(arcade_modifier_id),
  PRIMARY KEY (fk_game_id, fk_arcade_modifier_id)
);


CREATE TABLE IF NOT EXISTS friendship (
  friendship_id SERIAL PRIMARY KEY,
  user_id_1 INT NOT NULL,
  user_id_2 INT NOT NULL,
  friendship_since DATE NOT NULL,
  FOREIGN KEY (user_id_1) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (user_id_2) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CHECK (user_id_1 < user_id_2) -- to avoid duplicate friendships
);

CREATE TABLE IF NOT EXISTS puzzle (
  puzzle_id SERIAL PRIMARY KEY,
  fen TEXT NOT NULL,
  moves VARCHAR(255) NOT NULL,
  rating INT NOT NULL,
  popularity INT
);

CREATE TABLE IF NOT EXISTS puzzles_solved_by_user (
  fk_user_id INT,
  fk_puzzle_id INT,
  date_solved date NOT NULL,
  FOREIGN KEY (fk_user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (fk_puzzle_id) REFERENCES puzzle(puzzle_id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (fk_user_id, fk_puzzle_id)
);

CREATE TYPE enum_product_asset_type AS ENUM('Board', 'Pieces', 'Board and Pieces', 'Reaction');

CREATE TABLE IF NOT EXISTS product_asset (
  product_asset_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  coins_cost INT NOT NULL,
  description TEXT NOT NULL,
  content JSON NOT NULL,
  type enum_product_asset_type NOT NULL,
  CONSTRAINT chk_coins_cost_positive CHECK (coins_cost >= 0)
);
/*
Sample content JSON:

 {
		"dark_squares_color": "#fff"
		"light_squares_color": "#fff"
		"pieces": ["pawn_w.png", "queen_w.png" ... ]
	}
*/
-- assets are stored in public/gameStoreAssets/<product_asset_id>/ e.g. public/gameStoreAssets/1/pawn_w.png

CREATE TABLE IF NOT EXISTS product_asset_bought_by_user (
  fk_product_asset_id INT,
  fk_user_id INT,
  FOREIGN KEY (fk_product_asset_id) REFERENCES product_asset(product_asset_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (fk_user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (fk_product_asset_id, fk_user_id)
);

CREATE TABLE IF NOT EXISTS notification_type (
  type_id SMALLSERIAL PRIMARY KEY,
  type_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_of_user (
  notification_id SERIAL PRIMARY KEY,
  fk_user_who_sent_id INT,
  fk_user_who_receive_id INT,
  title VARCHAR(255) NOT NULL,
  text_content TEXT,
  fk_notification_type_id SMALLINT NOT NULL,
  action_text_1 VARCHAR(255),
  action_link_1 VARCHAR(255),
  action_text_2 VARCHAR(255),
  action_link_2 VARCHAR(255),
  created_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  viewed BOOLEAN DEFAULT false,
  FOREIGN KEY (fk_user_who_sent_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (fk_user_who_receive_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (fk_notification_type_id) REFERENCES notification_type(type_id) ON DELETE CASCADE ON UPDATE CASCADE
);
-- NOTE: when users who sent is NULL is because it was a system notification


CREATE TABLE IF NOT EXISTS club (
  club_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  about TEXT NOT NULL,
  profile_pic VARCHAR(255) NOT NULL,
  created_at DATE NOT NULL
);
-- NOTE: profile pics are stored in firebase, where profile_pic is the id of the image

CREATE TYPE enum_users_members_of_club_role AS ENUM('Member', 'Admin');

CREATE TABLE IF NOT EXISTS users_members_of_club (
  fk_club_id INT,
  fk_user_id INT,
  member_role enum_users_members_of_club_role NOT NULL,
  member_since DATE NOT NULL,
  FOREIGN KEY (fk_club_id) REFERENCES club(club_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (fk_user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (fk_club_id, fk_user_id)
);

CREATE TABLE IF NOT EXISTS post_of_club (
  post_id SERIAL PRIMARY KEY,
  fk_user_id INT,
  fk_club_id INT,
  text_content TEXT,
  img_id VARCHAR(255),
  publication_date DATE NOT NULL,
  -- NOTE: trigger implemented for data integrity
  total_likes INT NOT NULL,
  FOREIGN KEY (fk_user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (fk_club_id) REFERENCES club(club_id) ON DELETE CASCADE ON UPDATE CASCADE
);
-- NOTE: img_id is the id of the image stored in firebase

CREATE TABLE IF NOT EXISTS like_in_post_of_club (
  fk_post_id INT,
  fk_user_id INT,
  FOREIGN KEY (fk_post_id) REFERENCES post_of_club(post_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (fk_user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (fk_post_id, fk_user_id)
);

CREATE TABLE IF NOT EXISTS comment_in_post (
  comment_in_post_id SERIAL PRIMARY KEY,
  fk_user_id INT,
  fk_post_id INT,
  comment_text text NOT NULL,
  comment_date date NOT NULL,
  FOREIGN KEY (fk_user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (fk_post_id) REFERENCES post_of_club(post_id) ON DELETE CASCADE ON UPDATE CASCADE
);