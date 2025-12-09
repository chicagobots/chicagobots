import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InteractiveMap from './InteractiveMap';
import StaticView from './StaticView';

export default function App() {
  return (
    <Router basename="/chicagobots">
      <Routes>
        {/* --- */}
        <Route path="/" element={<InteractiveMap />} />

        {/* --- */}
        <Route path="/static-view" element={<StaticView />} />
      </Routes>
    </Router>
  );
}