-- Insert arcade modifiers
INSERT INTO arcade_modifiers (modifier_name) VALUES
('Blood Squares'),
('Vengeful Rider'),
('Borders of Blood'),
('Random Freeze');

-- Insert game modes
INSERT INTO game_mode (mode) VALUES
('Rapid, 15 min, +10 sec increment'),
('Rapid, 10 min'),
('Blitz, 5 min'),
('Blitz, 3 min, +2 sec increment'),
('Bullet, 1 min'),
('Bullet, 2 min +1sec increment'),
('Arcade');

-- Insert user avatar images
INSERT INTO user_avatar_img (file_name) VALUES
('1.png'), ('2.png'), ('3.png'), ('4.png'), ('5.png'),
('6.png'), ('7.png'), ('8.png'), ('9.png'), ('10.png'),
('11.png'), ('12.png'), ('13.png'), ('14.png'), ('15.png'),
('16.png'), ('17.png'), ('18.png'), ('19.png'), ('20.png'),
('21.png'), ('22.png'), ('23.png'), ('24.png'), ('25.png');

-- Insert notification types
INSERT INTO notification_type (type_name) VALUES
('Want to play with you'),
('Accepted to play with you'),
('Want to Join Club'),
('Accepted in club'),
('Made a post'),
('Request to be your friend'),
('Accepted your friend request'),
('You are admin now of club'),
('System Notification');