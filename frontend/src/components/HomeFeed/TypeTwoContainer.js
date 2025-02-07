import React, { useContext } from 'react';
import { HomeFeedContext } from '../../context/HomeFeedContext';
import '../../html/css/TypeTwoContainer.css'; // Use centralized styles

export default function TypeTwoContainer({ context }) {
  const { sectorMap, subSectorMap, posts } = useContext(HomeFeedContext); // Access posts from context
  const { sectors, subSectors, contextTitle } = context;

  // Map the IDs to their respective names
  const sectorNames = sectors.map(id => sectorMap[id]).filter(Boolean);
  const subSectorNames = subSectors.map(id => subSectorMap[id]).filter(Boolean);

  // Join the sector and subSector names with "|"
  const categories = `${sectorNames.join(' | ')} | ${subSectorNames.join(' | ')}`;
  
  // Fetch the relevant posts based on context
  const relatedPostIds = context.posts.map(post => post.postId); // Extract post IDs tagged to the context
  console.log('relatedPostIds', relatedPostIds);

  // Filter and sort posts by date
  const filteredPosts = posts.filter(post => 
    relatedPostIds.includes(post._id) && post.includeInContainer // Check for matching IDs and includeInContainer
  );

  // Sort by date (most recent first)
  const sortedPosts = filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Get the 2 most recent posts
  const recentPosts = sortedPosts.slice(0, 2);
  
  return (
    <div className="container">
      <div className="exclusive">EXCLUSIVE</div>
      <h1 className="main-headline">{contextTitle}</h1>
      <div className="category">
        <span>{categories}</span> {/* Updated to display dynamic categories */}
      </div>

      <div className="related-articles">
        {recentPosts.length > 0 ? recentPosts.map((post, index) => (
          <div className="related-article" key={post._id}>
            <h2 className="related-headline">{post.postTitle}</h2> {/* Display post title */}
          </div>
        )) : (
          <p>No related articles found.</p> // Fallback if no posts are available
        )}
      </div>
    </div>
  );
}
