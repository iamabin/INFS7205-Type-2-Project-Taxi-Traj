import {useState} from 'react';
import MapView from '../MapView';
import QueryForm from '../QueryForm';
import axios from 'axios';

export default function Query1Page() {
    const [selectedCoord, setSelectedCoord] = useState<{ lat: number; lng: number } | null>(null);
    const [trajectories, setTrajectories] = useState<any[]>([]);
    const [showCircle, setShowCircle] = useState(false);

    const handleQuery = async (params: any) => {
        try {
            const res = await axios.post('http://localhost:5001/query1', params);
            setTrajectories(res.data);
            setShowCircle(true);
        } catch (err) {
            alert('Query1 failed');
        }
    };

    return (
        <div style={{width: '100%', maxWidth: '1200px', margin: '0 auto'}}>
            <h2 className="mb-3  text-center">Query 1: Taxi Trajectories by Start Location and Time Range</h2>
            <QueryForm onQuery={handleQuery} coord={selectedCoord}/>
            <MapView
                mode="query1"

                selectedCoord={selectedCoord}
                onMapClick={(lat, lng) => {
                    setSelectedCoord({lat, lng});
                    setShowCircle(false);
                }}
                trajectories={trajectories}
                hotspots={[]}
                showCircle={showCircle}
            />
                    <h6 className="mt-3 text-center">Please click on the map to select a staring point.</h6>

        </div>
    );
}
