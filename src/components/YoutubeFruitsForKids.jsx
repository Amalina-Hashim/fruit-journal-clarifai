import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import Header from "./Header"

const YoutubeFruitsForKids = () => {
  const videoId = 'KRqg3RJFWPo';
  const youtubeUrl = `https://www.youtube.com/embed/${videoId}`;

  

  return (
    <>
    <Header />
    <div className="youtube-fruits-container">
      <h3>Learning About Fruits - Fun Video for Kids!</h3>
      <div className="video-wrapper">
        <iframe
          width="560"
          height="315"
          src={youtubeUrl}
          title="Fruits for Kids"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        <Link to="/" className="back-link">Back to Kyra's Fruit Journal
          <FontAwesomeIcon icon={faCamera} size="4x" className="camera-icon"  style={{color: "#C8F902"}} />
        </Link>
      </div>
    </div>
    </>
  );
};

export default YoutubeFruitsForKids;

