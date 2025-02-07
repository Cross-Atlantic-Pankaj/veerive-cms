// import React, { useContext } from 'react';
// import { Link } from 'react-router-dom'; // Import Link from react-router-dom
// import '../../html/css/bootstrap.min.css';
// import '../../html/css/swiper-bundle.min.css';
// import '../../html/css/main.css';
// import { HomeFeedContext } from '../../context/HomeFeedContext';

// export default function HomeTrendingStats () {
//   const { posts, themes, subSectorMap } = useContext(HomeFeedContext);
//   console.log('posts in HomeTrendingStats', posts)
//   // Filter and sort the posts to find the most recent expert opinions that are trending
//   const trendingOpinions = posts
//       .filter(post => post.postType === "Expert Opinion" && post.isTrending) // Filter for trending expert opinions
//       .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date (most recent first)
//       .slice(0, 5); // Get the top 5 recent posts

//   // Filter and sort the posts to find the most recent infographics that are trending
//   const trendingInfographics = posts
//       .filter(post => post.postType === "Infographic" && post.isTrending) // Filter for trending infographics
//       .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date (most recent first)
//       .slice(0, 5); // Get the top 5 recent posts

//   // Create trendingStories based on themes
//   const trendingStories = themes
//     .filter(theme => theme.overallScore) // Only include themes that have a score
//     .map(theme => ({
//         trendingScore: theme.trendingScore,
//         impactScore: theme.impactScore,
//         predictiveMomentumScore: theme.predictiveMomentumScore,
//         score: theme.overallScore,
//         title: theme.themeTitle,
//         themeDescription: theme.themeDescription,
//         subSectors: theme.subSectors.map(id => subSectorMap[id]).filter(Boolean).join(', ') || 'Uncategorized' // Convert object IDs to names
//     }))
//     .sort((a, b) => b.score - a.score) // Sort by score in descending order
//     .slice(0, 5); // Get the top 5 trending stories
//     console.log('trendingStories', trendingStories)
//   return (
//     <>
//       <section className="sectionPadding lightBG">
//         <div className="container">
//           <div className="row">
//             <div className="col-xl-6 col-lg-6">
//               <div className="row">
//                 <div className="col-xl-8 col-8">
//                   <h3 className="h5 text-uppercase">Trending Opinions</h3>
//                 </div>
//                 <div className="col-xl-4 col-4 text-end">
//                   <a href="#" className="simpleLink text-uppercase font14">
//                     <i className="fa-solid fa-right-long"></i>
//                   </a>
//                 </div>
//                 <div className="col-xl-12 mb-4">
//                   <hr className="my-0" />
//                 </div>
//               </div>

//               {/* Render Trending Opinions */}
//               {trendingOpinions.map((post, index) => (
//                 <div key={index} className="row align-items-center mb-4">
//                   <div className="col-xl-3 col-6 col-md-4">
//                     <a href="#">
//                       <img
//                         src="images/svgs/1000x630.svg"
//                         alt="1000x630"
//                         className="img-fluid"
//                       />
//                     </a>
//                   </div>
//                   <div className="col-xl-9 col-6 col-md-8">
//                     <a href="#" className="h6 simpleLinkDark">
//                       {post.postTitle}
//                     </a>
//                     <p className="font14 mb-0">{new Date(post.date).toLocaleDateString()}</p> {/* Format date */}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="col-xl-6 col-lg-6">
//               <div className="row">
//                 <div className="col-xl-8 col-8">
//                   <h3 className="h5 text-uppercase">Trending Infographics</h3>
//                 </div>
//                 <div className="col-xl-4 col-4 text-end">
//                   <a href="#" className="simpleLink text-uppercase font14">
//                     <i className="fa-solid fa-right-long"></i>
//                   </a>
//                 </div>
//                 <div className="col-xl-12 mb-4">
//                   <hr className="my-0" />
//                 </div>
//               </div>

//               {/* Render Trending Infographics */}
//               {trendingInfographics.map((post, index) => (
//                 <div key={index} className="row align-items-center mb-4">
//                   <div className="col-xl-3 col-6 col-md-4">
//                     <a href="#">
//                       <img
//                         src="images/svgs/1000x630.svg"
//                         alt="1000x630"
//                         className="img-fluid"
//                       />
//                     </a>
//                   </div>
//                   <div className="col-xl-9 col-6 col-md-8">
//                     <a href="#" className="h6 simpleLinkDark">
//                       {post.postTitle}
//                     </a>
//                     <p className="font14 mb-0">{new Date(post.date).toLocaleDateString()}</p> {/* Format date */}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className="sectionPadding pb-0">
//   <div className="container">
//     <div className="row">
//       <div className="col-xl-8 col-8">
//         <h3 className="h5 text-uppercase">Trending Themes</h3>
//       </div> 
//       <div className="col-xl-4 col-4 text-end">
//         <a href="" className="simpleLink text-uppercase font14">View all <i className="fa-solid fa-circle-arrow-right"></i></a>
//       </div> 
//       <div className="col-xl-12 mb-4"><hr className="my-0" /></div>
//     </div> 

//     <div className="row">
//       <div className="col-xl-6 col-lg-6">
//         <div className="newsBoxOne">
//           <a href=""><img src="images/svgs/1000x630.svg" alt="1000x630" className="img-fluid" /></a>
//           <h6 className="lightGreenBorder d-inline-block my-3 pb-1">{trendingStories[0].subSectors}</h6>
//           <p><a href="" className="newsBoxOneHead mb-3">{trendingStories[0].title}</a></p>
//           <p>{trendingStories[0].themeDescription}</p>
//           <a href="" className="buttonStyle mb-4 mb-lg-0">Continue reading</a>
//         </div>
//       </div>

//       <div className="col-xl-6 col-lg-6">
//         <div className="row border-bottom">
//           <div className="col-xl-6 col-md-6 border-end">
//             <div className="newsBoxOne">
//               <a href=""><img src="images/svgs/1000x630.svg" alt="1000x630" className="img-fluid" /></a>
//               <h6 className="lightGreenBorder d-inline-block my-3 pb-1">{trendingStories[1].subSectors}</h6>
//               <p><a href="" className="newsBoxOneHead mb-3">{trendingStories[1].title}</a></p>
//               </div>
//           </div>
//           <div className="col-xl-6 col-md-6">
//             <div className="newsBoxOne">
//               <a href=""><img src="images/svgs/1000x630.svg" alt="1000x630" className="img-fluid" /></a>
//               <h6 className="purpleBorder d-inline-block my-3 pb-1">{trendingStories[2].subSectors}</h6>
//               <p><a href="" className="newsBoxOneHead mb-3">{trendingStories[2].title}</a></p>
//               </div>
//           </div>
//         </div>

//         <div className="row">
//           <div className="col-xl-6 col-md-6 pt-3 border-end">
//             <div className="newsBoxOne">
//               <a href=""><img src="images/svgs/1000x630.svg" alt="1000x630" className="img-fluid" /></a>
//               <h6 className="cyanBorder d-inline-block my-3 pb-1">{trendingStories[3].subSectors}</h6>
//               <p><a href="" className="newsBoxOneHead mb-3">{trendingStories[3].title}</a></p>
//               </div>
//           </div>
//           <div className="col-xl-6 col-md-6 pt-3">
//             <div className="newsBoxOne">
//               <a href=""><img src="images/svgs/1000x630.svg" alt="1000x630" className="img-fluid" /></a>
//               <h6 className="redBorder d-inline-block my-3 pb-1">{trendingStories[4].subSectors}</h6>
//               <p><a href="" className="newsBoxOneHead mb-3">{trendingStories[4].title}</a></p>
//               </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// </section>

// <section className="sectionPadding">
//   <div className="container">
//     <div className="row">
//       <div className="col-xl-8 col-8">
//         <h3 className="h5 text-uppercase">Analyzer</h3>
//       </div> 
//       <div className="col-xl-4 col-4 text-end">
//         <a href="" className="simpleLink text-uppercase font14">View all <i className="fa-solid fa-circle-arrow-right"></i></a>
//       </div> 
//       <div className="col-xl-12 mb-4"><hr className="my-0" /></div>
//     </div> 

//     <div className="row text-center">
//       <div className="col-xl-4 col-md-4">
//         <div className="newsBoxOne mb-4">
//           <a href=""><img src="images/svgs/1000x630.svg" alt="1000x630" className="img-fluid" /></a>
//           <a href="" className="newsBoxOneHead mt-2">Sector Analyzer</a>
//         </div>
//       </div>
//       <div className="col-xl-4 col-md-4">
//         <div className="newsBoxOne mb-4">
//           <a href=""><img src="images/svgs/1000x630.svg" alt="1000x630" className="img-fluid" /></a>
//           <a href="" className="newsBoxOneHead mt-2">Company Analyzer</a>
//         </div>
//       </div>
//       <div className="col-xl-4 col-md-4">
//         <div className="newsBoxOne mb-4">
//           <a href=""><img src="images/svgs/1000x630.svg" alt="1000x630" className="img-fluid" /></a>
//           <a href="" className="newsBoxOneHead mt-2">Trend Analyzer</a>
//         </div>
//       </div>
//     </div>
//   </div>
// </section>

// <section id="newsLetter" className="themeColorBG py-5">
//   <div className="container">
//     <div className="row justify-content-center">
//       <div className="col-xl-5 col-md-8 text-center">
//         <h6 className="text-white fw-normal">Get Started</h6>
//         <h4 className="display-6 fw-normal text-white">Enter your e-mail address and get started for free</h4>
//       </div> 
//     </div> 
//     <div className="row justify-content-center mt-4">
//       <div className="col-xl-8">
//         <form action="" className="newsLetterForm">
//           <input type="text" placeholder="Your Name" required />
//           <input type="email" placeholder="Your Email address" required />
//           <button type="submit">Subscribe</button>
//         </form>
//         <p className="text-light font14 text-center mt-3 mb-0">(We will never share your email with anyone, anywhere. Promise.)</p>
//       </div>
//     </div>
//   </div>
// </section>

// <section className="py-4">
//   <div className="container">
//     <div className="row">
//       <div className="col-xl-2 col-md-2 col-6">
//         <div className="border p-2 mb-3 mb-mb-0">
//           <img src="images/svgs/1000x630.svg" alt="1000x630" className="img-fluid" />
//         </div>
//       </div>
//       <div className="col-xl-2 col-md-2 col-6">
//         <div className="border p-2 mb-3 mb-mb-0">
//           <img src="images/svgs/1000x630.svg" alt="1000x630" className="img-fluid" />
//         </div>
//       </div>
//       <div className="col-xl-2 col-md-2 col-6">
//         <div className="border p-2 mb-3 mb-mb-0">
//           <img src="images/svgs/1000x630.svg" alt="1000x630" className="img-fluid" />
//         </div>
//       </div>
//       <div className="col-xl-2 col-md-2 col-6">
//         <div className="border p-2 mb-3 mb-mb-0">
//           <img src="images/svgs/1000x630.svg" alt="1000x630" className="img-fluid" />
//         </div>
//       </div>
//       <div className="col-xl-2 col-md-2 col-6">
//         <div className="border p-2 mb-3 mb-mb-0">
//           <img src="images/svgs/1000x630.svg" alt="1000x630" className="img-fluid" />
//         </div>
//       </div>
//       <div className="col-xl-2 col-md-2 col-6">
//         <div className="border p-2 mb-3 mb-mb-0">
//           <img src="images/svgs/1000x630.svg" alt="1000x630" className="img-fluid" />
//         </div>
//       </div>
//     </div>
//   </div>
// </section>


//   </>
//     )

// }
  
import React, { useContext } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import '../../html/css/bootstrap.min.css';
import '../../html/css/swiper-bundle.min.css';
import '../../html/css/main.css';
import { HomeFeedContext } from '../../context/HomeFeedContext';

export default function HomeTrendingStats() {
  const { posts, themes, subSectorMap } = useContext(HomeFeedContext);

  console.log('posts in HomeTrendingStats', posts);

  // Filter and sort the posts to find the most recent expert opinions that are trending
  const trendingOpinions = posts
    ?.filter((post) => post.postType === 'Expert Opinion' && post.isTrending) // Filter for trending expert opinions
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date (most recent first)
    .slice(0, 5) || []; // Get the top 5 recent posts (fallback to an empty array)

  // Filter and sort the posts to find the most recent infographics that are trending
  const trendingInfographics = posts
    ?.filter((post) => post.postType === 'Infographic' && post.isTrending) // Filter for trending infographics
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date (most recent first)
    .slice(0, 5) || []; // Get the top 5 recent posts (fallback to an empty array)

  // Create trendingStories based on themes
  const trendingStories = themes
    ?.filter((theme) => theme.overallScore) // Only include themes that have a score
    .map((theme) => ({
      trendingScore: theme.trendingScore,
      impactScore: theme.impactScore,
      predictiveMomentumScore: theme.predictiveMomentumScore,
      score: theme.overallScore,
      title: theme.themeTitle,
      themeDescription: theme.themeDescription,
      subSectors: theme.subSectors
        ? theme.subSectors.map((id) => subSectorMap[id] || 'Unknown Sector').filter(Boolean).join(', ')
        : 'Uncategorized', // Convert object IDs to names or use 'Uncategorized'
    }))
    .sort((a, b) => b.score - a.score) // Sort by score in descending order
    .slice(0, 5) || []; // Get the top 5 trending stories (fallback to an empty array)

  console.log('trendingStories', trendingStories);

  return (
    <>
      <section className="sectionPadding lightBG">
        <div className="container">
          <div className="row">
            <div className="col-xl-6 col-lg-6">
              <div className="row">
                <div className="col-xl-8 col-8">
                  <h3 className="h5 text-uppercase">Trending Opinions</h3>
                </div>
                <div className="col-xl-4 col-4 text-end">
                  <a href="#" className="simpleLink text-uppercase font14">
                    <i className="fa-solid fa-right-long"></i>
                  </a>
                </div>
                <div className="col-xl-12 mb-4">
                  <hr className="my-0" />
                </div>
              </div>

              {/* Render Trending Opinions */}
              {trendingOpinions.map((post, index) => (
                <div key={index} className="row align-items-center mb-4">
                  <div className="col-xl-3 col-6 col-md-4">
                    <a href="#">
                      <img
                        src="images/svgs/1000x630.svg"
                        alt="1000x630"
                        className="img-fluid"
                      />
                    </a>
                  </div>
                  <div className="col-xl-9 col-6 col-md-8">
                    <a href="#" className="h6 simpleLinkDark">
                      {post.postTitle}
                    </a>
                    <p className="font14 mb-0">{new Date(post.date).toLocaleDateString()}</p> {/* Format date */}
                  </div>
                </div>
              ))}
            </div>

            <div className="col-xl-6 col-lg-6">
              <div className="row">
                <div className="col-xl-8 col-8">
                  <h3 className="h5 text-uppercase">Trending Infographics</h3>
                </div>
                <div className="col-xl-4 col-4 text-end">
                  <a href="#" className="simpleLink text-uppercase font14">
                    <i className="fa-solid fa-right-long"></i>
                  </a>
                </div>
                <div className="col-xl-12 mb-4">
                  <hr className="my-0" />
                </div>
              </div>

              {/* Render Trending Infographics */}
              {trendingInfographics.map((post, index) => (
                <div key={index} className="row align-items-center mb-4">
                  <div className="col-xl-3 col-6 col-md-4">
                    <a href="#">
                      <img
                        src="images/svgs/1000x630.svg"
                        alt="1000x630"
                        className="img-fluid"
                      />
                    </a>
                  </div>
                  <div className="col-xl-9 col-6 col-md-8">
                    <a href="#" className="h6 simpleLinkDark">
                      {post.postTitle}
                    </a>
                    <p className="font14 mb-0">{new Date(post.date).toLocaleDateString()}</p> {/* Format date */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="sectionPadding pb-0">
        <div className="container">
          <div className="row">
            <div className="col-xl-8 col-8">
              <h3 className="h5 text-uppercase">Trending Themes</h3>
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
              <div key={index} className="col-xl-6 col-lg-6">
                <div className="newsBoxOne">
                  <a href="#">
                    <img src="images/svgs/1000x630.svg" alt="1000x630" className="img-fluid" />
                  </a>
                  <h6 className="lightGreenBorder d-inline-block my-3 pb-1">{story.subSectors}</h6>
                  <p>
                    <a href="#" className="newsBoxOneHead mb-3">{story.title}</a>
                  </p>
                  <p>{story.themeDescription}</p>
                  <a href="#" className="buttonStyle mb-4 mb-lg-0">Continue reading</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
