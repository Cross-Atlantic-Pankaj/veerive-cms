import React, { useContext, useState, useMemo } from 'react';
import PostContext from '../../context/PostContext';
import axios from '../../config/axios';
import '../../html/css/Post.css'; // Ensure this CSS file is created

export default function PostList() {
    const { posts, postsDispatch, handleAddClick, handleEditClick, contexts } = useContext(PostContext);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'postTitle', direction: 'ascending' });

    // Helper functions
    const getContextName = (ids, data) => {
        if (!Array.isArray(ids)) return 'Unknown';
        const contextNames = ids.map(id => {
            const item = data.find(ele => ele._id === id);
            return item ? item.contextTitle : 'Unknown';
        });
        return contextNames.join(', ');
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // const sortedPosts = useMemo(() => {
    //     let sortablePosts = [...(posts.data || [])];

    //     if (sortConfig !== null) {
    //         sortablePosts.sort((a, b) => {
    //             let aValue, bValue;

    //             switch (sortConfig.key) {
    //                 case 'postTitle':
    //                 case 'postType':
    //                     aValue = a[sortConfig.key].toLowerCase();
    //                     bValue = b[sortConfig.key].toLowerCase();
    //                     break;
    //                 case 'date':
    //                     aValue = new Date(a.date);
    //                     bValue = new Date(b.date);
    //                     break;
    //                 case 'context':
    //                     aValue = getContextName(a.context, contexts.data).toLowerCase();
    //                     bValue = getContextName(b.context, contexts.data).toLowerCase();
    //                     break;
    //                 case 'isTrending':
    //                 case 'homePageShow':
    //                     aValue = a[sortConfig.key] ? 1 : 0;
    //                     bValue = b[sortConfig.key] ? 1 : 0;
    //                     break;
    //                 default:
    //                     aValue = a[sortConfig.key];
    //                     bValue = b[sortConfig.key];
    //                     break;
    //             }

    //             if (aValue < bValue) {
    //                 return sortConfig.direction === 'ascending' ? -1 : 1;
    //             }
    //             if (aValue > bValue) {
    //                 return sortConfig.direction === 'ascending' ? 1 : -1;
    //             }
    //             return 0;
    //         });
    //     }
    //     return sortablePosts;
    // }, [posts.data, sortConfig, contexts.data]);

    const sortedPosts = useMemo(() => {
        let sortablePosts = Array.isArray(posts?.data) ? [...posts.data] : [];
    
        if (sortConfig !== null) {
            sortablePosts.sort((a, b) => {
                let aValue, bValue;
    
                switch (sortConfig.key) {
                    case 'postTitle':
                    case 'postType':
                        aValue = (a[sortConfig.key] || '').toLowerCase();
                        bValue = (b[sortConfig.key] || '').toLowerCase();
                        break;
                    case 'date':
                        aValue = new Date(a.date || 0);
                        bValue = new Date(b.date || 0);
                        break;
                    case 'context':
                        aValue = getContextName(a.context, Array.isArray(contexts?.data) ? contexts.data : []).toLowerCase();
                        bValue = getContextName(b.context, Array.isArray(contexts?.data) ? contexts.data : []).toLowerCase();
                        break;
                    case 'isTrending':
                    case 'homePageShow':
                        aValue = a[sortConfig.key] ? 1 : 0;
                        bValue = b[sortConfig.key] ? 1 : 0;
                        break;
                    default:
                        aValue = a[sortConfig.key] || '';
                        bValue = b[sortConfig.key] || '';
                        break;
                }
    
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortablePosts;
    }, [posts?.data, sortConfig, contexts?.data]);
    
    const filteredPosts = sortedPosts.filter(post =>
        (post.postTitle || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRemove = async (id) => {
        const userInput = window.confirm('Are you sure you want to remove this post?');
        if (userInput) {
            try {
                const response = await axios.delete(`/api/admin/posts/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                postsDispatch({ type: 'REMOVE_POST', payload: response.data._id });
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const handleSearch = () => {
        // Perform additional logic on search if needed
    };

    return (
        <div className="post-list-container">
            <button className="add-post-btn" onClick={handleAddClick}>Add Post</button>
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
                <button className="search-btn" onClick={handleSearch}>Search</button>
            </div>
            <table className="post-table">
                <thead>
                    <tr>
                        <th onClick={() => requestSort('postTitle')}>
                            Post Title {sortConfig.key === 'postTitle' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th onClick={() => requestSort('date')}>
                            Date {sortConfig.key === 'date' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th onClick={() => requestSort('context')}>
                            Context {sortConfig.key === 'context' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th onClick={() => requestSort('postType')}>
                            Post Type {sortConfig.key === 'postType' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th onClick={() => requestSort('isTrending')}>
                            Is Trending {sortConfig.key === 'isTrending' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th onClick={() => requestSort('homePageShow')}>
                            Home Page Show {sortConfig.key === 'homePageShow' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPosts.map(post => (
                        <tr key={post._id}>
                            <td>{post.postTitle}</td>
                            <td>{post.date}</td>
                            <td>{getContextName(post.context, contexts.data)}</td>
                            <td>{post.postType}</td>
                            <td>{post.isTrending ? 'Yes' : 'No'}</td>
                            <td>{post.homePageShow ? 'Yes' : 'No'}</td>
                            <td>
                                <button className="edit-btn" onClick={() => handleEditClick(post._id)}>Edit</button>
                                <button className="remove-btn" onClick={() => handleRemove(post._id)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
