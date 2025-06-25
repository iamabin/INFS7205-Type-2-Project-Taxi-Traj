## 1. Project Overview

### Motivation

This application is designed as a decision-support tool to address urban traffic congestion. By visualizing historical taxi trajectory data, authorities can identify high-frequency congestion sections and hot spots, so as to optimise traffic management and planning decisions.

The app allows real-time querying of historical trajectories and supports spatial analysis, providing a solid foundation for urban road optimization, taxi dispatching, and the planning of new taxi stands.

### Web Application Functions

- Three query page:

  1) Taxi Trajectories by Start Location and Time Range:
     This query retrieves all trajectories that originate from a specified area within a given time range. 

  2) High-Frequency Taxi Pick-up Locations: 
     This query aggregates the spatial distribution of trip origins to identify the most frequent pick-up locations during a specified time interval. To avoid bias from fixed taxi stands, all trips originating from a designated taxi stand were excluded.

  3) Taxi trajectories between two areas:
     The query retrieves a complete set of trajectories that simultaneously meet both the criteria for a specified start and end area within a certain time frame. 

- Visualize  trajactories to the Leaflet map.

- Click map to input coordinates.

- Invalid input handling.

---

## 2. Technology Stack

### Programming Languages & Frameworks

- Backend: (Python with Flask)
- Frontend: (React, HTML/Bootstrap/TypeScript)
- Database: (PostgreSQL with PostGIS)

### Packages & Dependencies

- `psycopg2`: Used in the backend (Python) to establish a connection to the PostgreSQL database and execute SQL queries.
- `Axios:`: To send queries to the backend API endpoints.
- `leaflet`: To rendering map at frontend.
- `bootstrap`: CSS Lib

---

## 3. Setup Instructions

### Environment Setup

```bash
# under frontend directory run
npm install --legacy-peer-deps
# backend dependency
pip install Flask Flask-Cors psycopg2-binary
```

### Database Configuration

- **Database Schema**: 

  ​	![GitHub Logo](https://raw.githubusercontent.com/iamabin/TrajVis/main/assets/schema.png)

- **How to Load Data**:

  To load dataset:

  ```bash
  python load.py
  ```

​		Before performing above code block, the connection details (Lines 7:13) 		and dataset location (Line 38) in load.py need to be modified. For example:

```python
# connection
conn = psycopg2.connect(
    dbname="your_database_name",
    user="your_username",
    password="your_password",
    host="localhost",
    port="5432"
)
# data location 
with open("path_of_dataset, "r") as f:

```

- **Data cleaning**

  Run clean.sql to clean data.

  

---

## 4. Code Structure

### Frontend

- Location of frontend code:  `frontend/`
- `MapView.tsx`: Interactive input handler and trajectory renderer.
- `QueryForm.tsx`,  `QueryForm2.tsx`,  `QueryForm3.tsx` : The form component of the query function.
- `Query1Page.tsx`,  `Query2Page.tsx`,  `Query3Page.tsx` : Three query pages.

### Backend

- Location of backend code: e.g., `backend/`
- `query1/`: Retrieves taxi trajectories that originate within 500 meters of a user-defined location and occur within a specified date and time range. 
- `query2/`: Aggregates high-frequency taxi pick-up locations for trips that occurred during specified day types and time intervals.
- `query3/`: Retrieves all taxi trajectories that both start and end within 500 meters of two user-defined locations, and occur during specified day types and time frames.

### Database Connection

- Location of the code that connects the backend to the database: `backend/db_config.py`

- Example of how the application connects to the database:

  ```bash
    conn = psycopg2.connect(
        dbname="your_database_name",
        user="your_username",
        password="your_password",
        host="localhost",
        port="5432"
    )
  ```

---

## 5. Queries Implemented

### Query 1: (Task Description)

- Taxi Trajectories by Start Location and Time Range: It enables traffic authorities to identify commonly used routes during peak hours. Based on these historical data they can proactively anticipate potential congestion and implement control measures in advance.
- ![q1](https://raw.githubusercontent.com/iamabin/TrajVis/main/assets/q1.png)
  
### Query 1: (SQL Query)

```sql
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
cursor.execute(query, (start_time, end_time, lng, lat, k))

```

- Variables:

​		`lng`: longitude of the clicked point

​		`lat`: latitude of the clicked point

​		`day_type`:  used for determining daytype.

​		`start_time`: start time

​		`end_time`: end time

​		`k`: how many data to request 

### Query 1: Unexpected Value Handling

- Invalid timeframe input

  A pop up window will warning user: "Please enter a valid timeframe (0–23), and ensure the start hour is earlier than the end hour."

- Invalid number of  trajectories to visualize

  A pop up window will warning user: "Please enter a positive integer for the number of trajectories to visualize."

- Invalid coordinates 

  User cannot input manually. It can only be inputted by click map and user cannot modify input box.

### **Query 2: (Task Description)**

- High-Frequency Taxi Pick-up Locations: The results of this query can help to uncover potential areas with dense passenger demand, enabling the authorities to optimize existing taxi stand or establish new pick-up points, thereby reducing the risk of local congestion caused by instantaneous high peak traffic.
- ![GitHub Logo](https://raw.githubusercontent.com/iamabin/TrajVis/main/assets/q2.png)

### Query 2: (SQL Query)

```sql
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

cursor.execute(query, (day_type, start_time, end_time, k))

```

- Variables:

​		`day_type`:  used for determining daytype.

​		`start_time`: start time

​		`end_time`: end time

​		`k`: how many data to return 

### Query 2: Unexpected Value Handling

- Invalid timeframe input

  A pop up window will warning user: "Please enter a valid timeframe (0–23), and ensure the start hour is earlier than the end hour."

- Invalid number of  hotspots to visualize

  A pop up window will warning user: "Please enter a positive integer for the number of hotspots to visualize."

- Invalid day type input

  User can only select one of following day type: weekdays, weekends and all days.

### **Query 3: (Task Description)**

- Taxi trajectories between two areas: By visualize the route distribution of these trajectories, the commonly congested segments can be identified, which provides a basis for urban road optimization and traffic flow adjustment.
- ![GitHub Logo](https://raw.githubusercontent.com/iamabin/TrajVis/main/assets/q3.png)

### Query 3: (SQL Query)

```sql
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
cur.execute(data_query, (lng1, lat1, lng2, lat2, day_type, start_time, end_time, k))


```

​	Variables:

​		`lng1`: longitude of the start area

​		`lat1`: latitude of the start area

​		`lng2`: longitude of the end area

​		`lat2`: latitude of the end area

​		`day_type`:  used for determining daytype.

​		`start_time`: start time

​		`end_time`: end time

​		`k`: how many data to return  

### Query 3: Unexpected Value Handling

- Invalid timeframe input

  A pop up window will warning user: "Please enter a valid timeframe (0–23), and ensure the start hour is earlier than the end hour."

- Invalid number of  trajectories to visualize

  A pop up window will warning user: "Please enter a positive integer for the number of trajectories to visualize."

- Invalid coordinates 

  User cannot input manually. It can only be inputted by click map and user cannot modify input box.

- Invalid day type input

  User can only select one of following day type: weekdays, weekends and all days.

---

## 6. How to Run the Application

```bash
# Start Backend Server
cd backend
python app.py

# Start Frontend
cd frontend
npm run dev

```

---

## 7. Port Usage

- Backend Port: 5001
- Frontend Port: 5173

## 8. UI Address

http://localhost:5173/

