import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './components/App';
import YoutubeFruitsForKids from './components/YoutubeFruitsForKids';

ReactDOM.render(
  <Router>
    <Routes>
      <Route exact path="/" element={<App />} />
      <Route path="/fruits-video" element={<YoutubeFruitsForKids />} />
    </Routes>
  </Router>,
  document.getElementById('root')
);
