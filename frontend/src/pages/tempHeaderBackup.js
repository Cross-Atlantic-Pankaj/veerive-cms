import React from 'react';
import {useState, useEffect, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

import '../html/css/bootstrap.min.css';
import '../html/css/swiper-bundle.min.css';
import '../html/css/main.css';

import logoDark from '../html/images/svgs/logo-dark.svg';
import pulseIcon from '../html/images/svgs/pulse.svg';
import thinkTankIcon from '../html/images/svgs/think-tank.svg';

export default function Header () {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const navigate = useNavigate();  // Add useNavigate hook
  const [navigatePath, setNavigatePath] = useState(null);
  const {handleLogout} = useContext(AuthContext)

  const handleClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setMenuId(id);
};

const handleClose = () => {
    setAnchorEl(null);
    setMenuId(null);
};

const handleMenuItemClick = (path) => {
    navigate(path);  // Navigate to the specified path
    handleClose();
};

return (
      <>
        <header id="header">
          <div className="container">
            <div className="row align-items-center my-2">
              <div className="col-xl-3 col-6 col-md-6 col-lg-3 order-1 order-lg-1">
                <a href="index.html">
                  <img src={logoDark} alt="Veerive Insights" />
                </a>
              </div>
              <div className="col-xl-6 order-3 order-lg-2 col-lg-6">
                <ul className="navigation">
                  <li>
                    <a href="pulse-today.html">
                      <span>
                        <img src={pulseIcon} alt="Pulse Today" />
                      </span>
                      Pulse Today
                    </a>
                  </li>
                  <li>
                    <a href="think-tank.html">
                      <span>
                        <img src={thinkTankIcon} alt="Think Tank" />
                      </span>
                      Think Tank
                    </a>
                    <ul>
                      <li>
                        <a href="influencer-comment.html">Influencer Comment</a>
                      </li>
                      <li>
                        <a href="reports.html">Reports</a>
                      </li>
                      <li>
                        <a href="interviews.html">Interviews</a>
                      </li>
                      <li>
                        <a href="infographics-and-statistics.html">
                          Infographics & Statistics
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="analyzer.html">
                      <span>
                        <img src="images/svgs/analyzer.svg" alt="Analyzer" />
                      </span>
                      Analyzer
                    </a>
                    <ul>
                      <li>
                        <a href="#">Sector Analyzer</a>
                      </li>
                      <li>
                        <a href="#">Company Analyzer</a>
                      </li>
                      <li>
                        <a href="#">Trend Analyzer</a>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="#">
                      <span>
                        <img src="images/svgs/pulse.svg" alt="Pulse Today" />
                      </span>
                      My Dashboard
                    </a>
                  </li>
                </ul>
              </div>
              <div className="col-xl-3 col-6 col-md-6 col-lg-3 text-end order-2 order-lg-3">
                <span className="searchIcon cursorPointer transition me-3">
                  <i className="fa fa-magnifying-glass"></i>
                </span>
                <span
                  className="buttonStyle cursorPointer transition"
                  data-bs-toggle="modal"
                  data-bs-target="#registerPopup"
                >
                  Get Started
                </span>
              </div>
            </div>
          </div>
        </header>
</>
    )
}  