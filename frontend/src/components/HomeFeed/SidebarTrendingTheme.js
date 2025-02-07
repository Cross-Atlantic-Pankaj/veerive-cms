import React, { useContext } from 'react';
import '../../html/css/sidebar.css'; // Import the centralized styles
import { HomeFeedContext } from '../../context/HomeFeedContext';

export default function SidebarTrendingTheme() {
    const { themes, subSectorMap } = useContext(HomeFeedContext); // Access themes from context

    // Create trendingStories based on themes
    const trendingStories = themes
        .filter(theme => theme.overallScore) // Only include themes that have a score
        .map(theme => ({
            score: theme.overallScore,
            title: theme.themeTitle,
            category: theme.subSectors.map(id => subSectorMap[id]).filter(Boolean).join(', ') || 'Uncategorized' // Convert object IDs to names
        }))
        .sort((a, b) => b.score - a.score) // Sort by score in descending order
        .slice(0, 5); // Get the top 5 trending stories (adjust as needed)

    return (
        <aside className="sidebar">
            <h2 className="sidebar-header">Trending Themes</h2>
            <ul className="trending-list">
                {trendingStories.length > 0 ? (
                    trendingStories.map((story, index) => (
                        <li key={index} className="trending-item">
                            <div className="trending-score">{story.score}</div>
                            <div className="trending-content">
                                <div className="trending-title">{story.title}</div>
                                <div className="trending-category">{story.category}</div>
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="trending-item">No trending themes available.</li> // Fallback message
                )}
            </ul>
        </aside>
    );
}
