import {useState} from 'react';

type Props = {
    onQuery2: (params: {
        dayType: string;
        startHour: number;
        endHour: number;
        k: number;
    }) => void;
};

export default function QueryForm2({onQuery2}: Props) {
    const [dayType, setDayType] = useState('A');
    const [startHour, setStartHour] = useState(0);
    const [endHour, setEndHour] = useState(1);
    const [k, setK] = useState(5);

    return (
        <form className="d-flex flex-wrap justify-content-center gap-3 bg-light p-3 rounded shadow-sm mt-4">
            <div>
                <label className="form-label">Day Type:</label>
                <select
                    className="form-select"
                    value={dayType}
                    onChange={(e) => setDayType(e.target.value)}
                >
                    <option value="A">Weekdays</option>
                    <option value="B">Weekends</option>
                    <option value="C">All days</option>
                </select>
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
                <label className="form-label">Hotspots to Visualize:</label>
                <input
                    type="number"
                    className="form-control"
                    value={k}
                    onChange={(e) => setK(parseInt(e.target.value))}
                />
            </div>

            <div className="align-self-end">
                <button
                    type="button"
                    className="btn btn-success"
                    onClick={

                        () => {
                            if (isNaN(startHour) || isNaN(endHour) || startHour < 0 || endHour > 23 || startHour >= endHour) {
                                alert('Please enter valid timeframe (0-23) and start hours must be less than  end hours.');
                                return;
                            }
                            if (isNaN(k) || k <= 0) {
                                alert('Please enter a positive integer for the number of hotspots to visualize.');
                                return;
                            }

                            onQuery2({dayType, startHour, endHour, k})
                        }
                    }
                >
                    Query
                </button>
            </div>
        </form>
    );
}
