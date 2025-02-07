import React, { useContext } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import '../../html/css/bootstrap.min.css';
import '../../html/css/swiper-bundle.min.css';
import '../../html/css/main.css';
import { HomeFeedContext } from '../../context/HomeFeedContext';

export default function HomeTrendingEvents () {
  const { contexts, subSectorMap, sectorMap } = useContext(HomeFeedContext); // Access contexts from HomeFeedContext

  // Create trending stories based on contexts
  const trendingStories = contexts
      .map(context => ({
          contextId: context._id,
          title: context.contextTitle, // Replace themeTitle with contextTitle
          // Combine sectors and subSectors
          category: [
            ...context.sectors.map(id => sectorMap[id]), // Map sector IDs to sector names
            ...context.subSectors.map(id => subSectorMap[id]) // Map subSector IDs to subSector names
          ]
          .filter(Boolean) // Filter out undefined/null values
          .join(', ') || 'Uncategorized' // Default to 'Uncategorized' if no sectors/subSectors
      }))
      .sort((a, b) => b.score - a.score) // Sort by score or any other sorting method
      .slice(0, 4); // Get the top 4 trending stories

   return (
    <section className="sectionPadding">
      <div className="container">
        <div className="row">
          <div className="col-xl-8 col-8">
            <h3 className="h5 text-uppercase">Trending Events</h3>
          </div>
          <div className="col-xl-4 col-4 text-end">
            <a href="#" className="simpleLink text-uppercase font14">
              View all <i className="fa-solid fa-circle-arrow-right"></i>
            </a>
          </div>
          <div className="col-xl-12 mb-4">
            <hr className="my-0" />
          </div>
        </div>

        <div className="row">
          {trendingStories.map((story, index) => (
            <div key={index} className="col-xl-3 col-lg-3 col-md-6 mb-3">
              <div className="newsBoxOne">
                <a href="#">
                </a>
                <h6 className="lightGreenBorder d-inline-block my-3 pb-1">{story.category}</h6>
                <a href="#" className="newsBoxOneHead mb-3">
                <Link to={`/context/${story.contextId}`}>{story.title} </Link> {/* Display dynamic contextTitle */}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
