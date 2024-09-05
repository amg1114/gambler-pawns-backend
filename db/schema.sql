CREATE TABLE IF NOT EXISTS user_avatar_img (
  user_avatar_img_id SMALLINT PRIMARY KEY AUTO_INCREMENT,
  file_name VARCHAR(255) NOT NULL
);


CREATE TABLE IF NOT EXISTS user (
  user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nickname  VARCHAR(255) NOT NULL UNIQUE,
  email  VARCHAR(255) NOT NULL UNIQUE,
  password  VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  country_flag  VARCHAR(255),
  about text,
  fk_user_avatar_img_id SMALLINT NOT NULL,
  elo_rapid INT,
  elo_blitz INT,
  elo_bullet INT,
  elo_arcade INT,
  current_money DECIMAL(10, 2),
  acumulated_alltime_money DECIMAL(10, 2),
  n_puzzles_solved INT,
  streak_days INT,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  FOREIGN KEY (fk_user_avatar_img_id) REFERENCES user_avatar_img(user_avatar_img_id)
);


CREATE TABLE IF NOT EXISTS game_mode (
    game_mode_id SMALLINT PRIMARY KEY AUTO_INCREMENT,
    mode VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS game (
  game_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  game_timestamp TIMESTAMPTZ NOT NULL,
  pgn TEXT NOT NULL,
  fk_whites_player_id BIGINT,
  fk_blacks_player_id BIGINT,
  fk_winner_player_id BIGINT,
  whites_player_time INT, --in seconds
  blacks_player_time INT, --in seconds
  fk_game_mode_id SMALLINT NOT NULL,
  result_type  ENUM('On Time', 'Draw', 'Abandon', 'Resign', 'Stalemate', 'N Moves Rule', 'Check Mate'),
  arcade_modifiers SET('Blood Squares', 'Vengeful Rider', 'Borders of Blood', 'Random Freeze'),
  type_pairing ENUM('Link Shared', 'Friend Req', 'Random Pairing'),
  FOREIGN KEY (fk_whites_player_id) REFERENCES user(user_id),
  FOREIGN KEY (fk_blacks_player_id) REFERENCES user(user_id),
  FOREIGN KEY (fk_winner_player_id) REFERENCES user(user_id),
  FOREIGN KEY (fk_game_mode_id) REFERENCES game_mode(game_mode_id)
);


CREATE TABLE IF NOT EXISTS friendship (
  friendship_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id_1 BIGINT NOT NULL,
  user_id_2 BIGINT NOT NULL,
  friendship_since DATE NOT NULL,
  FOREIGN KEY (user_id_1) REFERENCES user(user_id),
  FOREIGN KEY (user_id_2) REFERENCES user(user_id)
);

CREATE TABLE IF NOT EXISTS puzzle (
  puzzle_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  fen TEXT NOT NULL,
  moves VARCHAR(255) NOT NULL,
  rating INT NOT NULL,
  popularity INT
);

CREATE TABLE IF NOT EXISTS puzzles_solved_by_user (
  fk_user_id BIGINT,
  fk_puzzle_id BIGINT,
  date_solved date NOT NULL,
  FOREIGN KEY (fk_user_id) REFERENCES user(user_id),
  FOREIGN KEY (fk_puzzle_id) REFERENCES puzzle(puzzle_id),
  PRIMARY KEY (fk_user_id, fk_puzzle_id)
);

CREATE TABLE IF NOT EXISTS product_asset (
  product_asset_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  coins_cost DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  content JSON NOT NULL,
  type ENUM('Board', 'Pieces', 'Board and Pieces', 'Reaction')
);

CREATE TABLE IF NOT EXISTS product_asset_bought_by_user (
  fk_product_asset_id BIGINT,
  fk_user_id BIGINT,
  FOREIGN KEY (fk_product_asset_id) REFERENCES product_asset(product_asset_id),
  FOREIGN KEY (fk_user_id) REFERENCES user(user_id),
  PRIMARY KEY (fk_product_asset_id, fk_user_id)
);

CREATE TABLE IF NOT EXISTS notification_type (
  type_id SMALLINT PRIMARY KEY AUTO_INCREMENT,
  type_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_of_user (
  notification_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  fk_user_who_sent_id BIGINT,
  fk_user_who_receive_id BIGINT,
  title VARCHAR(255) NOT NULL,
  text_content TEXT,
  fk_notification_type_id smallint NOT NULL,
  action_text_1 VARCHAR(255),
  action_link_1 VARCHAR(255),
  action_text_2 VARCHAR(255),
  action_link_2 VARCHAR(255),
  created_timestamp TIMESTAMPTZ NOT NULL,
  viewed boolean,
  FOREIGN KEY (fk_user_who_sent_id) REFERENCES user(user_id),
  FOREIGN KEY (fk_user_who_receive_id) REFERENCES user(user_id),
  FOREIGN KEY (fk_notification_type_id) REFERENCES notification_type(type_id)
);


CREATE TABLE IF NOT EXISTS club (
  club_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  about TEXT NOT NULL,
  profile_pic VARCHAR(255) NOT NULL,
  created_at DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS users_members_of_club (
  fk_club_id BIGINT,
  fk_user_id BIGINT,
  role ENUM('user', 'admin'),
  member_since DATE NOT NULL,
  FOREIGN KEY (fk_club_id) REFERENCES club(club_id),
  FOREIGN KEY (fk_user_id) REFERENCES user(user_id),
  PRIMARY KEY (fk_club_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_of_club (
  post_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  fk_user_id BIGINT,
  fk_club_id BIGINT,
  text_content TEXT,
  img_id VARCHAR(255),
  publication_date DATE NOT NULL,
  total_likes INT NOT NULL,
  FOREIGN KEY (fk_user_id) REFERENCES user(user_id),
  FOREIGN KEY (fk_club_id) REFERENCES club(club_id)
);

CREATE TABLE IF NOT EXISTS like_in_post_of_club (
  fk_post_id BIGINT,
  fk_user_id BIGINT,
  FOREIGN KEY (fk_post_id) REFERENCES post_of_club(post_id),
  FOREIGN KEY (fk_user_id) REFERENCES user(user_id),
  PRIMARY KEY (fk_post_id, fk_user_id)
);

CREATE TABLE IF NOT EXISTS comment_in_post (
  comment_in_post_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  fk_user_id BIGINT,
  fk_post_id BIGINT,
  comment_text text NOT NULL,
  comment_date date NOT NULL,
  FOREIGN KEY (fk_user_id) REFERENCES user(user_id),
  FOREIGN KEY (fk_post_id) REFERENCES post_of_club(post_id)
);

-- TODO: TIMESTAMPTZ vs TIMESTAMP, cual debo usar?
-- TODO: Duda, tabla users fk_whites_player_id y fk_blacks_player_id deben ser NOT NULL - integridad referencial
-- TODO: el maldito postgresql no soporta enums y sets??
-- TODO: agregar constraint de las cascadas
-- TODO: debo implementar indices para mejoarar la rapidez en ciertas busquedas ?
-- CREATE INDEX idx_game_players ON game (fk_whites_player_id, fk_blacks_player_id);
-- TODO: habrá que implementar algún trigger ??

/* Chat gpt
Te recomiendo mover los campos arcade_modifiers, result_type, y type_pairing
a tablas separadas. Los tipos ENUM y SET pueden ser problemáticos para el
mantenimiento a largo plazo si necesitas agregar o modificar valores. Con
una tabla separada, podrías fácilmente hacer referencia a nuevos valores o
incluso localizarlos en múltiples idiomas.


CREATE TABLE IF NOT EXISTS result_type (
  result_type_id SMALLINT PRIMARY KEY AUTO_INCREMENT,
  result_name VARCHAR(255) NOT NULL
);

Considera agregar índices en los campos que serán utilizados para consultas frecuentes,
como los campos fk_user_id en la tabla post_of_club, game, y notification_of_user,
para mejorar el rendimiento de las consultas.


Relación friendship
Simetría en friendship:

    Para la tabla friendship, si user_id_1 y user_id_2 deben representar una relación simétrica (amistad mutua), asegúrate de que no existan duplicados (por ejemplo, user_id_1 = 1, user_id_2 = 2 y user_id_1 = 2, user_id_2 = 1 no deben coexistir).
    Solución: Puedes agregar una restricción para que siempre el primer ID sea el menor:

    Usar JSON es una buena opción si planeas almacenar estructuras complejas, pero si tienes una estructura definida (como colores de tablero y piezas), podrías normalizar estos atributos en una tabla separada para optimizar consultas
    y garantizar la integridad de los datos.


usar triggers allí donde allá utilizado normalización
n_puzzles
total_likes
*/