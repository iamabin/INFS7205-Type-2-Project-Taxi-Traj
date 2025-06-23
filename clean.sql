DELETE FROM trajectories
WHERE trip_id IN (
  WITH traj_points AS (
    SELECT
      trip_id,
      (ST_DumpPoints(trajectory_geom)).path[1] AS pt_index,
      ST_X((ST_DumpPoints(trajectory_geom)).geom) AS lon,
      ST_Y((ST_DumpPoints(trajectory_geom)).geom) AS lat
    FROM trajectories
  ), with_lag AS (
    SELECT
      t1.trip_id,
      ST_Distance(
        ST_MakePoint(t1.lon, t1.lat)::geography,
        ST_MakePoint(t2.lon, t2.lat)::geography
      ) / 15.0 AS speed_mps
    FROM traj_points t1
    JOIN traj_points t2
      ON t1.trip_id = t2.trip_id AND t1.pt_index = t2.pt_index + 1
  ), drift_trips AS (
    SELECT DISTINCT trip_id
    FROM with_lag
    WHERE speed_mps > 41.67
  )
  SELECT trip_id FROM drift_trips
);
