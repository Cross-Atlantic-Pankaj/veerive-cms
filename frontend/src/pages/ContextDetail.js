import React, { useContext } from 'react';
import { HomeFeedContext } from '../context/HomeFeedContext';
import { useParams } from 'react-router-dom';
import ContextTitle from '../components/ContextDetail/ContextTitle';
import SectorsRow from '../components/ContextDetail/SectorsRow';
import ThemeTitle from '../components/ThemeTitle';
import ScoresRow from '../components/ContextDetail/ScoresRow';
import Slider from '../components/ContextDetail/Slider';
import DisplayPostTile from '../components/ContextDetail/DisplayPostTile'; // Import the DisplayPostTile component
import '../html/css/DisplayPostTile.css'; // Import the CSS file for styling the DisplayPostTile component

const ContextDetail = () => {
  const { id } = useParams(); // Get the context id from URL params
  const { contexts, posts, sectors, subSectors, signalCategories, subSignalCategories, themes } = useContext(HomeFeedContext);

  // Find the selected context based on the id from params
  const context = contexts.find(context => context._id === id);
  
  if (!context) {
    return <div>Context not found</div>;
  }

  // Extract scores and other details from the selected context
  const { overallScore, trendingScore, impactScore, predictiveMomentumScore, themeId, sectorId, subSectorId, signalCategoryId, subSignalCategoryId } = context;

  // Find related sector, sub-sector, and theme information
  const sector = sectors.find(sector => sector._id === sectorId);
  const subSector = subSectors.find(subSector => subSector._id === subSectorId);
  const signalCategory = signalCategories.find(signalCategory => signalCategory._id === signalCategoryId);
  const subSignalCategory = subSignalCategories.find(subSignalCategory => subSignalCategory._id === subSignalCategoryId);
  const theme = themes.find(theme => theme._id === themeId);

  // Filter posts where includeInContainer is true and get the corresponding post details
  const filteredPosts = context.posts
    .filter(contextPost => contextPost.includeInContainer)
    .map(contextPost => posts.find(post => post._id === contextPost.postId)); // Get the actual post data
  console.log('filteredPosts', filteredPosts)
  console.log('context.posts', context.posts)
  return (
    <div>
      <h1>Context Detail Page</h1>
      
      {/* Context Title */}
      <ContextTitle title={context.title} />

      {/* Row for sectors, subSectors, signalCategories */}
      <SectorsRow
        sector={sector}
        subSector={subSector}
        signalCategory={signalCategory}
        subSignalCategory={subSignalCategory}
      />

      {/* Theme Title */}
      <ThemeTitle theme={theme?.title} />

      {/* Row for Scores */}
      <ScoresRow
        overallScore={overallScore}
        trendingScore={trendingScore}
        impactScore={impactScore}
        predictiveMomentumScore={predictiveMomentumScore}
      />

      {/* Slider */}
      <Slider />

      {/* DisplayPostTiles based on filtered posts */}
      <div className="post-tiles">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <DisplayPostTile
              key={post._id}
              postTitle={post.postTitle} // Assuming 'title' is a field in the post
              summary={post.summary} // Assuming 'summary' is a field in the post
            />
          ))
        ) : (
          <p>No posts available for this context</p>
        )}
      </div>
    </div>
  );
};

export default ContextDetail;
