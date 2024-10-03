""" 
PuzzleId = puzzleId
FEN = fen
Moves = solution
Rating = rating
Popularity = popularity

RatingDeviation,NbPlays,Themes,GameUrl,OpeningTags """

import pandas as pd

# Leer el archivo CSV
df = pd.read_csv("lichess_db_puzzle.csv")

# Filtrar los puzles que contienen "endgame" o "short" en la columna 'Themes'
filtered_df = df[df['Themes'].str.contains(
    'endgame|short', case=False, na=False)]

# Ordenar los puzles por la columna 'Rating' en orden descendente
sorted_df = filtered_df.sort_values(by='Rating', ascending=False)

# Seleccionar los primeros 2000 puzles
top_2000_puzzles = sorted_df.head(2000)

# Crear la consulta SQL para insertar los datos en la tabla 'Puzzle'
values = []
for _, row in top_2000_puzzles.iterrows():
    value = f"('{row['PuzzleId']}', '{row['FEN']}', '{
        row['Moves']}', {row['Rating']}, {row['Popularity']})"
    values.append(value)

# Unir todos los valores en una sola consulta
insert_query = f"""
INSERT INTO puzzle (lichess_id, fen, solution, rating, popularity) VALUES
{',\n'.join(values)};
"""

# Guardar la consulta SQL en un archivo
with open('insert_puzzles.sql', 'w', encoding='utf-8') as f:
    f.write(insert_query)

print("La consulta SQL para insertar los puzles ha sido guardada en 'insert_puzzles.sql'.")
