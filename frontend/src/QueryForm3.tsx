import {useState, useEffect} from 'react';

type Props = {
    onQuery3: (params: {
        lat1: number;
        lng1: number;
        lat2: number;
        lng2: number;
        dowList: number[];
        startHour: number;
        endHour: number;
        k: number;
    }) => void;
    startCoord?: { lat: number; lng: number } | null;
    endCoord?: { lat: number; lng: number } | null;
};

export default function QueryForm3({onQuery3, startCoord, endCoord}: Props) {
    const [lat1, setLat1] = useState(41.15);
    const [lng1, setLng1] = useState(-8.61);
    const [lat2, setLat2] = useState(41.16);
    const [lng2, setLng2] = useState(-8.60);
    const [dayType, setDayType] = useState('A');
    const [startHour, setStartHour] = useState(9);
    const [endHour, setEndHour] = useState(10);
    const [k, setK] = useState(30);
    useEffect(() => {
        if (startCoord) {
            setLat1(startCoord.lat);
            setLng1(startCoord.lng);
        }
    }, [startCoord]);

    useEffect(() => {
        if (endCoord) {
            setLat2(endCoord.lat);
            setLng2(endCoord.lng);
        }
    }, [endCoord]);


    const getDowList = (type: string): number[] => {
        if (type === 'A') return [1, 2, 3, 4, 5];
        if (type === 'B') return [0, 6];
        return [0, 1, 2, 3, 4, 5, 6];
    };


    return (

        <div className="mb-4 p-3  bg-light">

            <div className="row mb-2">
                <div className="col">
                    <label className="form-label">Start Latitude</label>
                    <input className="form-control" type="number" value={lat1} readOnly
                           onChange={(e) => setLat1(parseFloat(e.target.value))}/>
                </div>
                <div className="col">
                    <label className="form-label">Start Longitude</label>
                    <input className="form-control" type="number" value={lng1} readOnly
                           onChange={(e) => setLng1(parseFloat(e.target.value))}/>
                </div>
                <div className="col">
                    <label className="form-label">End Latitude</label>
                    <input className="form-control" type="number" value={lat2} readOnly
                           onChange={(e) => setLat2(parseFloat(e.target.value))}/>
                </div>
                <div className="col">
                    <label className="form-label">End Longitude</label>
                    <input className="form-control" type="number" value={lng2} readOnly
                           onChange={(e) => setLng2(parseFloat(e.target.value))}/>
                </div>
            </div>

            <div className="row mb-2 align-items-end">
                <div className="col">
                    <label className="form-label">Day type</label>
                    <select className="form-select" value={dayType} onChange={(e) => setDayType(e.target.value)}>
                        <option value="A">Weekdays</option>
                        <option value="B">Weekends</option>
                        <option value="C">All days</option>
                    </select>
                </div>
                <div className="col">
                    <label className="form-label">Timeframe</label>
                    <div className="d-flex align-items-center">
                        <input
                            className="form-control"
                            type="number"
                            min={0}
                            max={23}
                            value={startHour}
                            onChange={(e) => setStartHour(Number(e.target.value))}
                            style={{width: '80px'}}
                        />
                        <span className="mx-2">–</span>
                        <input
                            className="form-control"
                            type="number"
                            min={0}
                            max={23}
                            value={endHour}
                            onChange={(e) => setEndHour(Number(e.target.value))}
                            style={{width: '80px'}}
                        />
                    </div>
                </div>
                <div className="col">
                    <label className="form-label">Trajectories to visualize</label>
                    <input className="form-control" type="number" value={k} min={10}
                           onChange={(e) => setK(Number(e.target.value))}/>
                </div>
                <div className="col-auto">
                    <button
                        className="btn btn-success mt-4"
                        onClick={() => {
                            const dowList = getDowList(dayType);

                            if (
                                isNaN(startHour) || isNaN(endHour) || startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23 || startHour >= endHour
                            ) {
                                alert("Please enter valid timeframe (0-23) and start hours must be less than  end hours.");
                                return;
                            }

                            if (isNaN(k) || k <= 0) {
                                alert("Please enter a positive integer for the number of trajectories to visualize.");
                                return;
                            }


                            onQuery3({lat1, lng1, lat2, lng2, dowList, startHour, endHour, k});
                        }}
                    >
                        Query
                    </button>
                </div>
            </div>
        </div>
    );
}
