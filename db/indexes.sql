-- Indexes implemented for quick search for some colums

-- For users's: nicknames, emails, clubs and friends 
CREATE INDEX idx_nickname ON users(nickname);
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_users_clubs_user_id ON users_members_of_club(fk_user_id);
CREATE INDEX idx_friendship_user_ids ON friendship(user_id_1, user_id_2);

-- For Game History
CREATE INDEX idx_game_whites_player_ids ON game(fk_whites_player_id);
CREATE index idx_game_blacks_player_ids ON game(fk_blacks_player_id);


-- For Clubs: members and posts
CREATE INDEX idx_members_club_id ON users_members_of_club(fk_club_id);
CREATE INDEX idx_posts_club_id ON post_of_club(fk_club_id);
CREATE INDEX idx_likes_post_id ON like_in_post_of_club(fk_post_id);
CREATE INDEX idx_comments_post_id ON comment_in_post(fk_post_id);

-- For Leadboard:
CREATE INDEX idx_elo_rapid ON users(elo_rapid);
CREATE INDEX idx_elo_blitz ON users(elo_blitz);
CREATE INDEX idx_elo_bullet ON users(elo_bullet);
CREATE INDEX idx_elo_arcade ON users(elo_arcade);


-- For Notifications:
CREATE INDEX idx_notifications_user_id ON notification_of_user(fk_user_who_receive_id);

-- For Store:
-- Multicolumn index to check products bought by users
CREATE INDEX idx_assets_user_product ON product_asset_bought_by_user(fk_user_id, fk_product_asset_id);
