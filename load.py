import csv
import ast
import psycopg2
from shapely.geometry import LineString, Point
from datetime import datetime

conn = psycopg2.connect(
    dbname="chiwang",
    user="chiwang",
    password="1234",
    host="localhost",
    port="5432"
)
cur = conn.cursor()
cur.execute("CREATE EXTENSION IF NOT EXISTS postgis;")

cur.execute("""
DROP TABLE IF EXISTS trajectories;
CREATE TABLE trajectories (
  trip_id TEXT PRIMARY KEY,
  call_type TEXT,
  origin_call TEXT,
  origin_stand TEXT,
  taxi_id TEXT,
  timestamp TIMESTAMP,
  day_type TEXT,
  missing_data BOOLEAN,
  trajectory_geom GEOMETRY(LINESTRING, 4326),
  start_point GEOMETRY(POINT, 4326),
  end_point GEOMETRY(POINT, 4326)
);
CREATE INDEX idx_geom ON trajectories USING GIST (trajectory_geom);
CREATE INDEX idx_start ON trajectories USING GIST (start_point);
CREATE INDEX idx_end ON trajectories USING GIST (end_point);
""")
conn.commit()

with open("/Users/chiwang/Downloads/train.csv", "r") as f:
    reader = csv.DictReader(f)
    batch = []
    count = 0

    for row in reader:
        try:
            trip_id = row["TRIP_ID"]
            call_type = row["CALL_TYPE"]
            origin_call = row["ORIGIN_CALL"] or None
            origin_stand = row["ORIGIN_STAND"] or None
            taxi_id = row["TAXI_ID"]
            timestamp = datetime.utcfromtimestamp(int(row["TIMESTAMP"]))
            day_type = row["DAY_TYPE"]
            missing_data = row["MISSING_DATA"].lower() == "true"

            polyline = row["POLYLINE"]
            if polyline == "[]" or polyline.strip() == "":
                continue
            coords = ast.literal_eval(polyline)
            if len(coords) < 2:
                continue

            line = LineString(coords)
            start = Point(coords[0])
            end = Point(coords[-1])

            batch.append((
                trip_id, call_type, origin_call, origin_stand, taxi_id,
                timestamp, day_type, missing_data,
                line.wkt, start.wkt, end.wkt
            ))

            count += 1
            if count % 10000 == 0:
                cur.executemany("""
                    INSERT INTO trajectories (
                      trip_id, call_type, origin_call, origin_stand, taxi_id,
                      timestamp, day_type, missing_data,
                      trajectory_geom, start_point, end_point
                    )
                    VALUES (
                      %s, %s, %s, %s, %s,
                      %s, %s, %s,
                      ST_GeomFromText(%s, 4326), ST_GeomFromText(%s, 4326), ST_GeomFromText(%s, 4326)
                    )
                    ON CONFLICT (trip_id) DO NOTHING
                """, batch)
                conn.commit()
                print(f"Inserted {count} rows")
                batch.clear()


        except Exception as e:
            print(f"Error）: {e}")

if batch:
    cur.executemany("""
        INSERT INTO trajectories (
          trip_id, call_type, origin_call, origin_stand, taxi_id,
          timestamp, day_type, missing_data,
          trajectory_geom, start_point, end_point
        )
        VALUES (
          %s, %s, %s, %s, %s,
          %s, %s, %s,
          ST_GeomFromText(%s, 4326), ST_GeomFromText(%s, 4326), ST_GeomFromText(%s, 4326)
        )
        ON CONFLICT (trip_id) DO NOTHING
    """, batch)
    conn.commit()

cur.close()
conn.close()
print("done")
