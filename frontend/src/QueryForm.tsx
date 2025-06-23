import {useState, useEffect} from 'react';

type Props = {
    onQuery: (params: {
        date: string;
        startHour: number;
        endHour: number;
        k: number;
        lat: number;
        lng: number;
    }) => void;
    coord: { lat: number; lng: number } | null;
};

export default function QueryForm({onQuery, coord}: Props) {
    const [date, setDate] = useState('');
    const [startHour, setStartHour] = useState<number>(0);
    const [endHour, setEndHour] = useState<number>(1);
    const [k, setK] = useState(5);

    useEffect(() => {
        setDate('2013-07-01');
    }, []);

    return (
        <form className="d-flex flex-wrap justify-content-center gap-3 bg-light p-3 rounded shadow-sm mt-4">

            <div>
                <label className="form-label">Date: </label>
                <input
                    type="date"
                    className="form-control"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>

            <div>
                <label className="form-label">Timeframe:</label>
                <div className="d-flex align-items-center">
                    <input
                        type="number"
                        min={0}
                        max={23}
                        className="form-control"
                        value={startHour}
                        onChange={(e) => setStartHour(parseInt(e.target.value))}
                        style={{width: '80px'}}
                    />
                    <span className="mx-2">–</span>
                    <input
                        type="number"
                        min={0}
                        max={23}
                        className="form-control"
                        value={endHour}
                        onChange={(e) => setEndHour(parseInt(e.target.value))}
                        style={{width: '80px'}}
                    />
                </div>
            </div>

            <div>
                <label className="form-label">Trajectories to visualize:</label>
                <input
                    type="number"
                    className="form-control"
                    value={k}
                    onChange={(e) => setK(parseInt(e.target.value))}
                />
            </div>

            <div>
                <label className="form-label">Latitude: </label>
                <input
                    type="text"
                    className="form-control"
                    value={coord?.lat || ''}
                    readOnly
                />
            </div>

            <div>
                <label className="form-label">Longitude：</label>
                <input
                    type="text"
                    className="form-control"
                    value={coord?.lng || ''}
                    readOnly
                />
            </div>

            <div className="align-self-end">
                <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => {
                        if (!coord) {
                            alert('Please select a location first by clicking on the map.');
                            return;
                        }
                        if (isNaN(startHour) || isNaN(endHour) || startHour < 0 || endHour > 23 || startHour >= endHour) {
                            alert('Please enter valid timeframe (0-23) and start hours must be less than  end hours');
                            return;
                        }
                        if (isNaN(k) || k <= 0) {
                            alert('Please enter a positive integer for the number of trajectories to visualize.');
                            return;
                        }
                        onQuery({
                            date,
                            startHour,
                            endHour,
                            k,
                            lat: coord.lat,
                            lng: coord.lng,
                        });
                    }}
                >
                    Query
                </button>
            </div>
        </form>
    );
}
