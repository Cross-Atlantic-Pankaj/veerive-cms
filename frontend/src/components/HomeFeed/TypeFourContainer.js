import React, { useContext } from 'react';
import '../../html/css/TypeFourContainer.css';
import { HomeFeedContext } from '../../context/HomeFeedContext';

export default function TypeFourContainer({ context }) {
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

  // Get the first four posts for rendering
  const selectedPosts = sortedPosts.slice(0, 4); // Adjust this based on your need

  return (
    <div className="grid-container">
      <article className="article main-article">
        <div className="exclusive">EXCLUSIVE</div>
        <h1 className="main-title">{contextTitle}</h1> {/* Dynamic context title */}
      </article>
      {selectedPosts.length > 0 ? (
        <>
          <article className="article secondary-article-1">
            <h2 className="secondary-title">{selectedPosts[0]?.postTitle || "No Title Available"}</h2> {/* Title for secondary article 1 */}
          </article>
          <article className="article secondary-article-2">
            <h2 className="secondary-title">{selectedPosts[1]?.postTitle || "No Title Available"}</h2> {/* Title for secondary article 2 */}
          </article>
          <article className="article bottom-article">
            <h2 className="secondary-title">{selectedPosts[2]?.postTitle || "No Title Available"}</h2> {/* Title for bottom article */}
          </article>
          <article className="article bottom-article">
            <h2 className="secondary-title">{selectedPosts[3]?.postTitle || "No Title Available"}</h2> {/* Title for bottom article */}
          </article>
        </>
      ) : (
        <p>No related articles found.</p> // Fallback if no posts are available
      )}
    </div>
  );
}
