import React, { useContext } from 'react';
import { HomeFeedContext } from '../../context/HomeFeedContext';
import TypeNumContainer from './TypeNumContainer';
import TypeOneContainer from './TypeOneContainer';
import TypeTwoContainer from './TypeTwoContainer';
import TypeThreeContainer from './TypeThreeContainer';
import TypeFourContainer from './TypeFourContainer';
import TypeFiveContainer from './TypeFiveContainer';
import SidebarNewsletter from './SidebarNewsletter'; // Import your additional components
import SidebarTrendingOpinion from './SidebarTrendingOpinion';
import SidebarTrendingTheme from './SidebarTrendingTheme';
import '../../html/css/global.css'; // Import your centralized styles here

export default function ContainerMapper() {
  const { loading, contexts } = useContext(HomeFeedContext);
  
  if (loading) {
    return <p>Loading...</p>;  // Display loading indicator
  }

  const sortedContexts = [...contexts].sort((a, b) => {
    const dateDifference = new Date(b.date) - new Date(a.date);
    if (dateDifference !== 0) {
      return dateDifference; // Return difference for date sorting
    }
    return a.displayOrder - b.displayOrder; // Ascending order for displayOrder
  });

  console.log('sortedContexts', sortedContexts);

  const containerTypeComponents = {
    'Type-One': TypeOneContainer,
    'Type-Two': TypeTwoContainer,
    'Type-Three': TypeThreeContainer,
    'Type-Four': TypeFourContainer,
    'Type-Five': TypeFiveContainer,
    'Type-Num': TypeNumContainer,
  };

  // Initialize the counter
  let counter = 0;

  return (
    <div className="container"> {/* Main container for all contexts */}
      {sortedContexts.map(context => {
        const ContainerComponent = containerTypeComponents[context.containerType];
        if (!ContainerComponent) {
          return null; // Skip if no matching container type
        }

        // Determine the CSS class based on container type
        const articleClass = context.containerType === 'Type-One' 
          ? 'article-container four-per-row' 
          : 'article-container one-per-row';

        console.log('context.containerType', context.containerType, 'counter', counter);
        
        // Increment the counter based on container type
        switch (context.containerType) {
          case 'Type-One':
            counter += 0;
            break;
          case 'Type-Two':
          case 'Type-Three':
          case 'Type-Four':
          case 'Type-Five':
          //case 'Type-Num':
            counter += 1;
            break;
          default:
            break;
        }

        // Render the additional components based on counter value
        let additionalComponents = [];
        if (counter === 1) {
          additionalComponents.push(<SidebarNewsletter key="sidebarNewsletter" />);
          counter += 1; // Increment the counter after rendering
        }
        if (counter === 3) {
          additionalComponents.push(<SidebarTrendingOpinion key="sidebarTrendingOpinion" />);
          counter += 1; // Increment the counter after rendering
        }
        if (counter === 6) {
          additionalComponents.push(<TypeNumContainer key="typeNumContainer" />);
          counter += 1; // Increment the counter after rendering
        }
        if (counter === 7) {
          additionalComponents.push(<SidebarTrendingTheme key="sidebarTrendingTheme" />);
          counter += 1; // Increment the counter after rendering
        }
     

        return (
          <div key={context._id} className={articleClass}>
            <ContainerComponent context={{
              sectors: context.sectors,
              subSectors: context.subSectors,
              contextTitle: context.contextTitle,
              posts: context.posts,
              summary: context.summary,
              dataForTypeNum: context.dataForTypeNum
            }} />
            {additionalComponents} {/* Render additional components */}
          </div>
        );
      })}
    </div>
  );
}
