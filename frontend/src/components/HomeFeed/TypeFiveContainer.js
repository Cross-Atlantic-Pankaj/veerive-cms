import React, { useContext } from 'react';
import { HomeFeedContext } from '../../context/HomeFeedContext';
import '../../html/css/TypeFiveContainer.css'; // Use centralized styles

export default function TypeFiveContainer({ context }) {
  const { sectorMap, subSectorMap, posts } = useContext(HomeFeedContext); // Access posts from context
  const { sectors, subSectors, contextTitle } = context;

  // Map the IDs to their respective names
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

  // Get the first five posts for rendering
  const selectedPosts = sortedPosts.slice(0, 5); // Adjust this based on your need

  return (
    <div className="grid-container">
      <article className="article main-article">
        <div className="exclusive">EXCLUSIVE</div>
        <h1 className="main-title">{contextTitle}</h1> {/* Dynamic context title */}
      </article>
      {selectedPosts.length > 0 ? (
        selectedPosts.map((post, index) => (
          <article className="article" key={post._id}>
            <h2 className="secondary-title">{post.postTitle || "No Title Available"}</h2> {/* Render post title */}
          </article>
        ))
      ) : (
        <p>No related articles found.</p> // Fallback if no posts are available
      )}
    </div>
  );
}
