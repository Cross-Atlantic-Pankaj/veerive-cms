import React, { useContext } from 'react';
import '../../html/css/sidebar.css'; // Import the centralized styles
import { HomeFeedContext } from '../../context/HomeFeedContext';

export default function SidebarTrendingOpinion() {
    const { posts } = useContext(HomeFeedContext);

    // Filter and sort the posts to find the most recent expert opinions that are trending
    const trendingOpinions = posts
        .filter(post => post.postType === "Expert Opinion" && post.isTrending) // Filter for trending expert opinions
        .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date (most recent first)
        .slice(0, 5); // Get the top 5 recent posts

    return (
        <div className="latest-news-feed">
            <div className="header">
                <h1 className="latest">Trending Expert Opinions</h1>
            </div>
            <ul className="news-list">
                {trendingOpinions.length > 0 ? (
                    trendingOpinions.map(opinion => (
                        <li className="news-item" key={opinion._id}>
                            <h2 className="news-title">{opinion.postTitle}</h2> {/* Dynamic title based on filtered posts */}
                        </li>
                    ))
                ) : (
                    <li className="news-item">
                        <h2 className="news-title">No trending expert opinions available.</h2>
                    </li>
                )}
            </ul>
            <a href="#" className="see-all">See all latest ›</a>
        </div>
    );
}
