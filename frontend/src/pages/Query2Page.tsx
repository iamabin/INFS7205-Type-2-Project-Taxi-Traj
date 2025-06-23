import {useState} from 'react';
import axios from 'axios';
import MapView from '../MapView';
import QueryForm2 from '../QueryForm2';

export default function Query2Page() {
    const [hotspots, setHotspots] = useState<any[]>([]);
    const [selectedCoord, setSelectedCoord] = useState<{ lat: number; lng: number } | null>(null);

    const handleQuery2 = async (params: {
        dayType: string;
        startHour: number;
        endHour: number;
        k: number;
    }) => {
        try {
            const {dayType, startHour, endHour, k} = params;


            let dowList: number[] = [];
            if (dayType === 'A') {
                dowList = [1, 2, 3, 4, 5];
            } else if (dayType === 'B') {
                dowList = [0, 6];
            } else {
                dowList = [0, 1, 2, 3, 4, 5, 6];
            }

            const res = await axios.post('http://localhost:5001/query2', {
                dowList,
                startHour,
                endHour,
                k,
            });

            setHotspots(res.data);
        } catch (err) {
            console.error('Query2 error:', err);
        }
    };

    return (
        <div style={{width: '100%', maxWidth: '1200px', margin: '0 auto'}}>
            <h2 className="mb-4 text-center">Query 2: High-Frequency Taxi Pick-up Locations</h2>
            <QueryForm2 onQuery2={handleQuery2}/>

            <MapView
                mode="query2"

                selectedCoord={selectedCoord}
                onMapClick={(lat, lng) => setSelectedCoord({lat, lng})}
                trajectories={[]}
                hotspots={hotspots}
            />

        </div>

    );
}
