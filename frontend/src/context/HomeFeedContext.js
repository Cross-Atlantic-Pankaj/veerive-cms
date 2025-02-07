// import React, { createContext, useState, useEffect } from 'react';
// import axios from '../config/axios';

// // Create Context
// export const HomeFeedContext = createContext();

// // Create Provider
// export const HomeFeedProvider = ({ children }) => {
//   const [contexts, setContexts] = useState([]);
//   const [posts, setPosts] = useState([]);
//   const [sectors, setSectors] = useState([]);
//   const [subSectors, setSubSectors] = useState([]);
//   const [themes, setThemes] = useState([]);
//   const [signalCategories, setSignalCategories] = useState([]);
//   const [subSignalCategories, setSubSignalCategories] = useState([]);
//   const [countries, setCountries] = useState([]);
  
//   // Add loading state
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchContexts = async () => {
//       try {
//         const response = await axios.get('/api/contexts', { 
//           headers: { 'Authorization': localStorage.getItem('token') } 
//         });
//         const allContexts = response.data;
//         setContexts(allContexts);
//       } catch (error) {
//         console.error('Error fetching contexts:', error);
//       } finally {
//         setLoading(false); // Set loading to false after fetching
//       }
//     };

//     fetchContexts(); // Call the fetch function
//   }, []);


//   useEffect(() => {
//     const fetchAdditionalData = async () => {
//       try {
//         const [sectorsRes, subSectorsRes, themesRes, signalCategoriesRes, subSignalCategoriesRes, countriesRes, postsRes] = await Promise.all([
//           axios.get('/api/sectors', { headers: { 'Authorization': localStorage.getItem('token') } }),
//           axios.get('/api/sub-sectors', { headers: { 'Authorization': localStorage.getItem('token') } }),
//           axios.get('/api/themes', { headers: { 'Authorization': localStorage.getItem('token') } }),
//           axios.get('/api/signals', { headers: { 'Authorization': localStorage.getItem('token') } }),
//           axios.get('/api/sub-signals', { headers: { 'Authorization': localStorage.getItem('token') } }),
//           axios.get('/api/countries', { headers: { 'Authorization': localStorage.getItem('token') } }),
//           axios.get('/api/posts', { headers: { 'Authorization': localStorage.getItem('token') } })

//         ]);

//         setSectors(sectorsRes.data);
//         setSubSectors(subSectorsRes.data);
//         setThemes(themesRes.data);
//         setSignalCategories(signalCategoriesRes.data);
//         setSubSignalCategories(subSignalCategoriesRes.data);
//         setCountries(countriesRes.data);
//         setPosts(postsRes.data);
//         setLoading(false); // Set loading to false once all data is fetched
//       } catch (error) {
//         console.error('Error fetching additional data:', error);
//         setLoading(false); // In case of error, stop loading
//       }
//     };

//     fetchAdditionalData();
//   }, []);

//   // Create a lookup map for all data modules
//   const sectorMap = sectors.reduce((map, sector) => {
//     map[sector._id] = sector.sectorName; 
//     return map;
//   }, {});

//   const subSectorMap = subSectors.reduce((map, subSector) => {
//     map[subSector._id] = subSector.subSectorName; 
//     return map;
//   }, {});

//   const signalCategoriesMap = signalCategories.reduce((map, signalCategory) => {
//     map[signalCategory._id] = signalCategory.signalName; 
//     return map;
//   }, {});

//   const subSignalCategoriesMap = subSignalCategories.reduce((map, subSignalCategory) => {
//     map[subSignalCategory._id] = subSignalCategory.subSignalName; 
//     return map;
//   }, {});

//   const themeMap = themes.reduce((map, theme) => {
//     map[theme._id] = theme.themeTitle; 
//     return map;
//   }, {});

//   const countryMap = countries.reduce((map, country) => {
//     map[country._id] = country.countryName; 
//     return map;
//   }, {});

//   console.log('posts', posts)
  

//   return (
//     <HomeFeedContext.Provider value={{ 
//       contexts,
//       posts, 
//       sectors,
//       sectorMap,
//       subSectors, 
//       subSectorMap,
//       themes, 
//       signalCategories, 
//       subSignalCategories, 
//       countries,
//       loading  // Pass loading state to context consumers
//     }}>
//       {children}
//     </HomeFeedContext.Provider>
//   );
// };
import React, { createContext, useState, useEffect } from 'react';
import axios from '../config/axios';

// Create Context
export const HomeFeedContext = createContext();

// Create Provider
export const HomeFeedProvider = ({ children }) => {
  const [contexts, setContexts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [subSectors, setSubSectors] = useState([]);
  const [themes, setThemes] = useState([]);
  const [signalCategories, setSignalCategories] = useState([]);
  const [subSignalCategories, setSubSignalCategories] = useState([]);
  const [countries, setCountries] = useState([]);

  // Add loading state
  const [loading, setLoading] = useState(true);

  // Function to get the token with "Bearer" prefix
  const getBearerToken = () => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : null;
  };

  // Fetch contexts
  useEffect(() => {
    const fetchContexts = async () => {
      try {
        const response = await axios.get('/api/contexts', {
          headers: { Authorization: getBearerToken() },
        });
        const allContexts = response.data || [];
        setContexts(allContexts);
      } catch (error) {
        console.error('Error fetching contexts:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchContexts(); // Call the fetch function
  }, []);

  // Fetch additional data
  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        const [
          sectorsRes,
          subSectorsRes,
          themesRes,
          signalCategoriesRes,
          subSignalCategoriesRes,
          countriesRes,
          postsRes,
        ] = await Promise.all([
          axios.get('/api/sectors', { headers: { Authorization: getBearerToken() } }),
          axios.get('/api/sub-sectors', { headers: { Authorization: getBearerToken() } }),
          axios.get('/api/themes', { headers: { Authorization: getBearerToken() } }),
          axios.get('/api/signals', { headers: { Authorization: getBearerToken() } }),
          axios.get('/api/sub-signals', { headers: { Authorization: getBearerToken() } }),
          axios.get('/api/countries', { headers: { Authorization: getBearerToken() } }),
          axios.get('/api/posts', { headers: { Authorization: getBearerToken() } }),
        ]);

        // Set the state for all the fetched data
        setSectors(sectorsRes.data || []);
        setSubSectors(subSectorsRes.data || []);
        setThemes(themesRes.data || []);
        setSignalCategories(signalCategoriesRes.data || []);
        setSubSignalCategories(subSignalCategoriesRes.data || []);
        setCountries(countriesRes.data || []);
        setPosts(postsRes.data || []);
      } catch (error) {
        console.error('Error fetching additional data:', error);
      } finally {
        setLoading(false); // Set loading to false once all data is fetched
      }
    };

    fetchAdditionalData();
  }, []);

  // Create a lookup map for all data modules
  const sectorMap = (sectors || []).reduce((map, sector) => {
    map[sector._id] = sector.sectorName;
    return map;
  }, {});

  const subSectorMap = (subSectors || []).reduce((map, subSector) => {
    map[subSector._id] = subSector.subSectorName;
    return map;
  }, {});

  const signalCategoriesMap = (signalCategories || []).reduce((map, signalCategory) => {
    map[signalCategory._id] = signalCategory.signalName;
    return map;
  }, {});

  const subSignalCategoriesMap = (subSignalCategories || []).reduce((map, subSignalCategory) => {
    map[subSignalCategory._id] = subSignalCategory.subSignalName;
    return map;
  }, {});

  const themeMap = (themes || []).reduce((map, theme) => {
    map[theme._id] = theme.themeTitle;
    return map;
  }, {});

  const countryMap = (countries || []).reduce((map, country) => {
    map[country._id] = country.countryName;
    return map;
  }, {});

  console.log('posts:', posts);

  return (
    <HomeFeedContext.Provider
      value={{
        contexts,
        posts,
        sectors,
        sectorMap,
        subSectors,
        subSectorMap,
        themes,
        signalCategories,
        subSignalCategories,
        countries,
        loading, // Pass loading state to context consumers
      }}
    >
      {children}
    </HomeFeedContext.Provider>
  );
};
