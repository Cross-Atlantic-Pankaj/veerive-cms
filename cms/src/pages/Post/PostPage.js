import React, { useContext } from 'react';
import PostContext from '../../context/PostContext';
import PostList from './PostList'; 
import PostForm from './PostForm'; 
import '../../html/css/Post.css';

const PostPage = () => {
    const {  isFormVisible,  handleFormSubmit } = useContext(PostContext);

    return (
        <div className="posts-container">
            <h2>Posts Master</h2>
            {!isFormVisible ? (
                <PostList />
            ) : (
                <PostForm handleFormSubmit={handleFormSubmit} />
            )}
        </div>
    );
};

export default PostPage;
