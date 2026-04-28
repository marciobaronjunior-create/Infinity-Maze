/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import Profile from './pages/Profile';
import Missions from './pages/Missions';
import Achievements from './pages/Achievements';
import Security from './pages/Security';
import Store from './pages/Store';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/security" element={<Security />} />
        <Route path="/store" element={<Store />} />
      </Routes>
    </BrowserRouter>
  );
}
