-- Triggers for data integrity

-- 1) trigger for increment puzzle count when a user solves a puzzle
CREATE OR REPLACE FUNCTION update_puzzle_count() 
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user
    SET n_puzzles_solved = n_puzzles_solved + 1
    WHERE user_id = NEW.fk_user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_puzzle_count
AFTER INSERT ON puzzles_solved_by_user
FOR EACH ROW EXECUTE FUNCTION update_puzzle_count();


-- 2) trigger for increment coins when a user buys a product
CREATE OR REPLACE FUNCTION update_coins_after_purchase() 
RETURNS TRIGGER AS $$
BEGIN
    -- Disminuir current_coins en la cantidad del producto comprado
    UPDATE user
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


-- 3) trigger for increment likes when a user likes a post
CREATE OR REPLACE FUNCTION update_likes_on_insert() 
RETURNS TRIGGER AS $$
BEGIN
    -- Incrementar el total de likes
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
    -- Disminuir el total de likes
    UPDATE post_of_club
    SET total_likes = total_likes - 1
    WHERE post_id = OLD.fk_post_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_likes_on_delete
AFTER DELETE ON like_in_post_of_club
FOR EACH ROW EXECUTE FUNCTION update_likes_on_delete();



-- 4) trigger for update date_solved when a user solves a puzzle that he already solved
-- or allow the insertion of a new record if the user solves a puzzle for the first time
DELIMITER $$

CREATE TRIGGER before_insert_puzzle_solved
BEFORE INSERT ON puzzles_solved_by_user
FOR EACH ROW
BEGIN
  -- Verificar si ya existe un registro para el usuario y el puzzle
  IF EXISTS (
    SELECT 1
    FROM puzzles_solved_by_user
    WHERE fk_user_id = NEW.fk_user_id
      AND fk_puzzle_id = NEW.fk_puzzle_id
  ) THEN
    -- Si ya existe, actualizamos la fecha de resolución
    UPDATE puzzles_solved_by_user
    SET date_solved = NEW.date_solved
    WHERE fk_user_id = NEW.fk_user_id
      AND fk_puzzle_id = NEW.fk_puzzle_id;
      
    -- Evitar la inserción de un nuevo registro
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Puzzle already solved, updating date_solved instead.';
    
  ELSE
    -- Si no existe, el trigger permite la inserción normalmente
    -- No se necesita hacer nada en este caso, la inserción continuará
  END IF;
END$$

DELIMITER ;



-- TODO: poner un trigger para eliminar notificaciones vistas de más de 1 mes? o esto se hace de lógica en el backend