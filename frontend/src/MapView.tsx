import {MapContainer, TileLayer, Circle, Popup, useMapEvents, GeoJSON, Marker} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

type Props = {
    selectedCoord: { lat: number; lng: number } | null;
    onMapClick: (lat: number, lng: number) => void;
    trajectories: any[];
    hotspots: any[];
    showCircle?: boolean;
    query3Trajectories?: any[];
    startCoord?: { lat: number; lng: number } | null;
    endCoord?: { lat: number; lng: number } | null;
    mode: 'query1' | 'query2' | 'query3';
    totalCount?: number;

};

function ClickCapture({onMapClick}: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        }
    });
    return null;
}

export default function MapView({
                                    selectedCoord,
                                    onMapClick,
                                    trajectories,
                                    hotspots,
                                    showCircle,
                                    query3Trajectories,
                                    startCoord,
                                    mode,
                                    endCoord,
                                    totalCount

                                }: Props) {
    const maxFreq = hotspots.length > 0 ? Math.max(...hotspots.map(p => p.freq)) : 1;
    const redIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    const blueIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });


    const markerIcons: { [key: string]: L.Icon } = {
        red: new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
        }),
        orange: new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
        }),
        yellow: new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
        }),
        green: new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
        }),
    };
    const getIconByFreq = (freq: number): L.Icon => {
        const ratio = freq / maxFreq;
        if (ratio > 0.8) return markerIcons.red;
        if (ratio > 0.5) return markerIcons.orange;
        if (ratio > 0.2) return markerIcons.yellow;
        return markerIcons.green;
    };

    return (
        <div style={{position: 'relative'}}>
            <MapContainer
                center={[41.15, -8.61]}
                zoom={13}
                style={{height: '600px', width: '100%'}}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ClickCapture onMapClick={onMapClick}/>

                {/* Query1 Red Circle */}
                {mode === 'query1' && selectedCoord && (
                    <>
                        <Marker position={[selectedCoord.lat, selectedCoord.lng]} icon={redIcon}/>
                        {showCircle && (
                            <Circle
                                center={[selectedCoord.lat, selectedCoord.lng]}
                                radius={500}
                                color="red"
                            />
                        )}
                    </>
                )}

                {/* Query1 trajectories */}
                {trajectories.map((traj, idx) => (
                    <GeoJSON key={`t1-${idx}-${Date.now()}`} data={traj.geometry}/>
                ))}

                {/* Query2 hopspots  */}
                {hotspots.map((point, idx) => {
                    const freq = point.freq;
                    const icon = getIconByFreq(freq);

                    return (
                        <Marker
                            key={`hotspot-${idx}`}
                            position={[
                                point.geometry.coordinates[1],
                                point.geometry.coordinates[0],
                            ]}
                            icon={icon}
                        >
                            <Popup>Frequency: {freq}</Popup>
                        </Marker>
                    );
                })}

                {/* Query3 Start and end points popup */}
                {startCoord && (
                    <Marker position={[startCoord.lat, startCoord.lng]} icon={redIcon}>
                        <Popup>Start point</Popup>
                    </Marker>
                )}

                {endCoord && (
                    <Marker position={[endCoord.lat, endCoord.lng]} icon={blueIcon}>
                        <Popup>End point</Popup>
                    </Marker>
                )}

                {/* Query3 trajectories */}
                {query3Trajectories && query3Trajectories.map((traj, idx) => (
                    <GeoJSON
                        key={`q3-${idx}-${Date.now()}`}
                        data={traj.geometry}
                    />
                ))}
            </MapContainer>
            {mode === 'query2' && maxFreq > 0 && (
                <div className="text-center mt-3">
                    <h6> Color Legend for Hotspot Frequency: </h6>
                    <div className="d-flex justify-content-center gap-3">
                        {maxFreq <= 1 ? (
                            <>
                                <span style={{background: '#a5413b', padding: '5px 10px', color: 'white'}}>＞80%</span>
                                <span
                                    style={{background: '#b38b41', padding: '5px 10px', color: 'white'}}>50%–80%</span>
                                <span
                                    style={{background: '#edd655', padding: '5px 10px', color: 'black'}}>20%–50%</span>
                                <span style={{background: '#6aa43d', padding: '5px 10px', color: 'black'}}>＜20%</span>
                            </>
                        ) : (
                            <>
                                  <span style={{background: '#a5413b', padding: '5px 10px', color: 'white'}}>
                                    ≥ {Math.floor(maxFreq * 0.8)}
                                  </span>
                                <span style={{background: '#b38b41', padding: '5px 10px', color: 'white'}}>
                                    {Math.floor(maxFreq * 0.5)} – {Math.floor(maxFreq * 0.8 - 1)}
                                  </span>
                                <span style={{background: '#edd655', padding: '5px 10px', color: 'black'}}>
                                    {Math.floor(maxFreq * 0.2)} – {Math.floor(maxFreq * 0.5 - 1)}
                                  </span>
                                <span style={{background: '#6aa43d', padding: '5px 10px', color: 'black'}}>
                                    ＜ {Math.floor(maxFreq * 0.2)}
                      </span>
                            </>
                        )}
                    </div>

                </div>
            )}


            {mode === 'query3' && (
                <div className="mt-3 text-center">
                    <h6>Please click on the map to select the start and end points.</h6>
                    <div className="d-flex justify-content-center gap-4">
                        <div className="d-flex align-items-center gap-2">
                            <img
                                src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
                                />
                            <span>Start point</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <img
                                src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png"
                                />
                            <span>End point</span>
                        </div>
                        <div className="ms-4">
                            <strong>Total trajectories that satisfy the conditions:</strong> {totalCount}

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
