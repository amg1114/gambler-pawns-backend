-- Triggers for data integrity

-- 1) trigger for increment puzzle count when a users solves a puzzle
CREATE OR REPLACE FUNCTION update_puzzle_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET n_puzzles_solved = n_puzzles_solved + 1
  WHERE user_id = NEW.fk_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_puzzle_count
AFTER INSERT ON puzzles_solved_by_user
FOR EACH ROW EXECUTE FUNCTION update_puzzle_count();


-- 2) trigger for increment coins when a users buys a product
CREATE OR REPLACE FUNCTION update_coins_after_purchase()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET current_coins = current_coins - (
    SELECT coins_cost FROM product_asset WHERE product_asset_id = NEW.fk_product_asset_id
  )
  WHERE user_id = NEW.fk_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_coins_after_purchase
AFTER INSERT ON product_asset_bought_by_user
FOR EACH ROW EXECUTE FUNCTION update_coins_after_purchase();


-- 3) trigger for increment likes when a users likes a post
CREATE OR REPLACE FUNCTION update_likes_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE post_of_club
  SET total_likes = total_likes + 1
  WHERE post_id = NEW.fk_post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_likes_on_insert
AFTER INSERT ON like_in_post_of_club
FOR EACH ROW EXECUTE FUNCTION update_likes_on_insert();

CREATE OR REPLACE FUNCTION update_likes_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE post_of_club
  SET total_likes = total_likes - 1
  WHERE post_id = OLD.fk_post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_likes_on_delete
AFTER DELETE ON like_in_post_of_club
FOR EACH ROW EXECUTE FUNCTION update_likes_on_delete();



-- 4) trigger for update date_solved when a users solves a puzzle that he already solved
-- or allow the insertion of a new record if the users solves a puzzle for the first time
CREATE OR REPLACE FUNCTION before_insert_puzzle_solved()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a record already exists for the user and puzzle
  IF EXISTS (
    SELECT 1
    FROM puzzles_solved_by_user
    WHERE fk_user_id = NEW.fk_user_id
    AND fk_puzzle_id = NEW.fk_puzzle_id
  ) THEN
    -- If it exists, update the solved date
    UPDATE puzzles_solved_by_user
    SET date_solved = NEW.date_solved
    WHERE fk_user_id = NEW.fk_user_id
    AND fk_puzzle_id = NEW.fk_puzzle_id;
    
    -- Raise exception to prevent insertion of a new record
    RAISE EXCEPTION 'Puzzle already solved, updating date_solved instead.';
  END IF;
  
  -- If no existing record, the insertion will proceed normally
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_before_insert_puzzle_solved
BEFORE INSERT ON puzzles_solved_by_user
FOR EACH ROW EXECUTE FUNCTION before_insert_puzzle_solved();



-- TODO: poner un trigger para eliminar notificaciones vistas de más de 1 mes? o esto se hace de lógica en el backend
-- opcion de implementar esto en pg_cron