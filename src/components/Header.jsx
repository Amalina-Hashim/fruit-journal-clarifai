import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';


function Header() {
  const navigate = useNavigate();

  
  const goToHome = () => {
    navigate('/');
  };
  return (
    <header>
      <h1 onClick={goToHome}>Kyra's Fruit Journal</h1>
      <nav>
        <ul className="nav">
          <li>
            <Link to="/fruits-video" className= "nav-link"><FontAwesomeIcon className= "youtube-icon" icon={faYoutube} style={{color: "#feffff", width:"20px", height: "20px", marginRight: "10px", alignItems: "center"}}></FontAwesomeIcon>Fruits Video</Link> 
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
