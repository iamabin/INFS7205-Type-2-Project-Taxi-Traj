from flask import Flask, request, jsonify
from db_config import get_db_connection
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello():
    return "Hello world!"


@app.route('/query1', methods=['POST'])
def query1():
    try:
        data = request.get_json()
        date = data["date"]
        start_hour = int(data["startHour"])
        end_hour = int(data["endHour"])
        lat = float(data["lat"])
        lng = float(data["lng"])
        k = int(data["k"])
        start_time = f"{date} {start_hour:02d}:00:00"
        end_time = f"{date} {end_hour:02d}:59:59"
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            SELECT trip_id, ST_AsGeoJSON(trajectory_geom)::json AS geometry
            FROM trajectories
            WHERE missing_data = false
              AND timestamp BETWEEN %s AND %s
              AND ST_DWithin(
                    start_point::geography,
                    ST_SetSRID(ST_Point(%s, %s), 4326)::geography,
                    500
                )
            LIMIT %s;
        """
        cursor.execute(query, (start_time, end_time, lng, lat, k))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        result = [
            {
                "trip_id": row[0],
                "geometry": row[1]
            }
            for row in rows
        ]
        return jsonify(result)
    except Exception as e:
        print("Error in /query1:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/query2", methods=["POST"])
def query2():
    try:

        data = request.get_json()
        day_type = data["dowList"]
        start_hour = int(data["startHour"])
        end_hour = int(data["endHour"])
        k = int(data["k"])

        start_time = f"{start_hour:02d}:00:00"
        end_time = f"{end_hour:02d}:59:59"

        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
             SELECT 
               ST_AsGeoJSON(ST_Centroid(ST_Collect(start_point)))::json AS geometry,
               COUNT(*) AS freq
             FROM trajectories
             WHERE call_type IN ('A', 'C')
                  AND EXTRACT(DOW FROM timestamp) = ANY(%s)
                  AND missing_data = false
                  AND timestamp::time BETWEEN %s AND %s
             GROUP BY ST_SnapToGrid(start_point, 0.0005, 0.0005)
             ORDER BY freq DESC
             LIMIT %s;
         """
        cursor.execute(query, (day_type, start_time, end_time, k))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        result = [
            {"geometry": row[0], "freq": row[1]}
            for row in rows
        ]

        return jsonify(result)

    except Exception as e:
        print("Error in /query2:", e)
        return jsonify({"error": str(e)}), 500


@app.route('/query3', methods=['POST'])
def query3():
    try:
        data = request.json
        lat1 = data['lat1']
        lng1 = data['lng1']
        lat2 = data['lat2']
        lng2 = data['lng2']
        day_type = data['dowList']
        start_hour = int(data['startHour'])
        end_hour = int(data['endHour'])
        k = int(data['k'])

        start_time = f"{start_hour:02d}:00:00"
        end_time = f"{end_hour:02d}:59:59"

        conn = get_db_connection()
        cur = conn.cursor()

        count_query = """
        SELECT COUNT(*) FROM trajectories
        WHERE 
          ST_DWithin(start_point::geography, ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography, 500)
          AND ST_DWithin(end_point::geography, ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography, 500)
          AND missing_data = false
          AND EXTRACT(DOW FROM timestamp) = ANY(%s)
          AND timestamp::time BETWEEN %s AND %s;
        """
        cur.execute(count_query, (lng1, lat1, lng2, lat2, day_type, start_time, end_time))
        total_count = cur.fetchone()[0]

        data_query = """
        SELECT 
          trip_id, 
          ST_AsGeoJSON(trajectory_geom)::json AS geometry
        FROM trajectories
        WHERE 
          ST_DWithin(start_point::geography, ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography, 500)
          AND ST_DWithin(end_point::geography, ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography, 500)
          AND missing_data = false
          AND EXTRACT(DOW FROM timestamp) = ANY(%s)
          AND timestamp::time BETWEEN %s AND %s
        ORDER BY timestamp
        LIMIT %s;
        """
        cur.execute(data_query, (lng1, lat1, lng2, lat2, day_type, start_time, end_time, k))
        rows = cur.fetchall()
        cur.close()
        conn.close()

        results = [{"trip_id": row[0], "geometry": row[1]} for row in rows]

        return jsonify({
            "total": total_count,
            "results": results
        })

    except Exception as e:
        print("Error in /query3:", e)
        return jsonify({'error': str(e)}), 500




if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5001)

