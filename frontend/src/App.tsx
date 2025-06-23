
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Query1Page from './pages/Query1Page';
import Query2Page from './pages/Query2Page';
import Query3Page from './pages/Query3Page';

function App() {
    return (
        <Router>
            <div className="container mt-3">
                <nav className="mb-4 navbar navbar-expand-lg navbar-light bg-light rounded px-3">
                    <div className="navbar-nav">
                        <Link className="nav-link" to="/query1">Query 1</Link>
                        <Link className="nav-link" to="/query2">Query 2</Link>
                        <Link className="nav-link" to="/query3">Query 3</Link>
                    </div>
                </nav>

                <Routes>
                    <Route path="/" element={<Query1Page />} />
                    <Route path="/query1" element={<Query1Page />} />
                    <Route path="/query2" element={<Query2Page />} />
                    <Route path="/query3" element={<Query3Page />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
