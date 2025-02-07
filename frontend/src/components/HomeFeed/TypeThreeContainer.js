import React, { useContext } from 'react';
import '../../html/css/TypeThreeContainer.css';
import { HomeFeedContext } from '../../context/HomeFeedContext';

export default function TypeThreeContainer({ context }) {
  const { sectorMap, subSectorMap, posts } = useContext(HomeFeedContext); // Access posts from context
  const { sectors, subSectors, contextTitle } = context;

  // Map the IDs to their respective names for bullet points or additional information
  const sectorNames = sectors.map(id => sectorMap[id]).filter(Boolean);
  const subSectorNames = subSectors.map(id => subSectorMap[id]).filter(Boolean);

  // Fetch the relevant posts based on context
  const relatedPostIds = context.posts.map(post => post.postId); // Extract post IDs tagged to the context

  // Filter and sort posts by date
  const filteredPosts = posts.filter(post => 
    relatedPostIds.includes(post._id) && post.includeInContainer // Check for matching IDs and includeInContainer
  );

  // Sort by date (most recent first)
  const sortedPosts = filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Get the first three posts for rendering in related articles
  const selectedPosts = sortedPosts.slice(0, 3); // Adjust this based on your need

  return (
    <article>
      <div className="exclusive">EXCLUSIVE</div>
      <h1 className="main-headline">{contextTitle}</h1> {/* Dynamic context title */}
      
      <ul className="bullet-points">
        {sectorNames.length > 0 ? (
          sectorNames.map((name, index) => (
            <li key={index}>{name}</li> // Render bullet points from sectors
          ))
        ) : (
          <li>No sectors available</li> // Fallback if no sectors are available
        )}
      </ul>

      <div className="related-articles">
        {selectedPosts.length > 0 ? (
          selectedPosts.map((post, index) => (
            <div className="article" key={post._id}>
              <h2 className="article-headline">{post.postTitle || "No Title Available"}</h2> {/* Render post title */}
            </div>
          ))
        ) : (
          <p>No related articles found.</p> // Fallback if no posts are available
        )}
      </div>
    </article>
  );
}
