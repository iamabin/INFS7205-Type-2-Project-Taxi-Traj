import {useState} from 'react';
import axios from 'axios';
import MapView from '../MapView';
import QueryForm3 from '../QueryForm3';

export default function Query3Page() {
    const [query3Trajectories, setQuery3Trajectories] = useState<any[]>([]);
    const [startCoord, setStartCoord] = useState<{ lat: number; lng: number } | null>(null);
    const [endCoord, setEndCoord] = useState<{ lat: number; lng: number } | null>(null);
    const [clickCount, setClickCount] = useState(0);
    const [totalCount, setTotalCount] = useState<number>(0);

    const handleMapClick = (lat: number, lng: number) => {
        if (clickCount % 2 === 0) {
            setStartCoord({lat, lng});
        } else {
            setEndCoord({lat, lng});
        }
        setClickCount(clickCount + 1);
    };

    const handleQuery3 = async (params: {
        lat1: number;
        lng1: number;
        lat2: number;
        lng2: number;
        dowList: number[];
        startHour: number;
        endHour: number;
        k: number;
    }) => {
        try {
            const res = await axios.post('http://localhost:5001/query3', params);
            setQuery3Trajectories(res.data.results);
            setTotalCount(res.data.total);
        } catch (err) {
            console.error('Query3 failed:', err);
        }
    };

    return (
        <div style={{width: '100%', maxWidth: '1200px', margin: '0 auto'}}>
            <h2 className="mb-4 text-center">Query 3: Taxi Trajectories Between Selected Start and End Areas</h2>
            <QueryForm3
                onQuery3={handleQuery3}
                startCoord={startCoord}
                endCoord={endCoord}
            />
            <MapView
                mode="query3"
                totalCount={totalCount}

                selectedCoord={null}
                onMapClick={handleMapClick}
                trajectories={[]}
                hotspots={[]}
                query3Trajectories={query3Trajectories}
                startCoord={startCoord}
                endCoord={endCoord}
            />
        </div>
    );
}
