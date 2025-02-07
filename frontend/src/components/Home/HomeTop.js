import React from 'react';
import '../../html/css/bootstrap.min.css';
import '../../html/css/swiper-bundle.min.css';
import '../../html/css/main.css';

import logoDark from '../../html/images/svgs/logo-dark.svg';
import pulseIcon from '../../html/images/svgs/pulse.svg';
import thinkTankIcon from '../../html/images/svgs/think-tank.svg';

// import analyzerIcon from '../html/images/svgs/analyzer.svg';
// import infographImage from '../html/images/infograph.png';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
//import 'font-awesome/css/font-awesome.min.css';


export default function HomeTop () {
  return (
    <>
      <section id="heroArea" className="sectionPadding themeColorBG">
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-xl-5 col-lg-6">
              <h1>Decode global fintech market dynamics</h1>
              <p>
                Join Veerive for free and get deeper understanding of opportunities and risks in the fintech sector
              </p>
              <form action="#" className="subscriberForm">
                <input type="email" placeholder="Enter your email address" required />
                <button type="submit">Subscribe</button>
              </form>
            </div>
            <div className="col-xl-4 col-lg-6">
              <img src="images/infograph.png" alt="infograph" className="img-fluid" />
            </div>
          </div>
        </div>
      </section>

    </>
  );
};
