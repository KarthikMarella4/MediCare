import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Home from '@/pages/Home';
import Upload from '@/pages/Upload';
import Compare from '@/pages/Compare';
import Schedule from '@/pages/Schedule';

function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/schedule" element={<Schedule />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
