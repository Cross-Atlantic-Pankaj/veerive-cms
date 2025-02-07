function selectPostsForContainer(posts, containerCapacity) {
    // Group posts by type
    const postTypes = {
        news: [],
        expertOpinion: [],
        researchReport: [],
        infographic: [],
        interview: []
    };

    // Populate the postTypes object
    posts.forEach(post => {
        if (postTypes[post.postType]) {
            postTypes[post.postType].push(post);
        }
    });

    // Sort posts within each type by isTrending first, then by date (most recent first)
    for (let type in postTypes) {
        postTypes[type].sort((a, b) => {
            if (a.isTrending === b.isTrending) {
                return new Date(b.date) - new Date(a.date); // Sort by date if isTrending is the same
            }
            return b.isTrending - a.isTrending; // Sort by isTrending (true first)
        });
    }

    const selectedPosts = [];

    // Case 1: Number of posts equals container capacity
    if (posts.length === containerCapacity) {
        return posts.slice(0, containerCapacity);
    }

    // Case 2: Number of posts is more than container capacity
    // First, try to select one post from each available type
    for (let type in postTypes) {
        if (postTypes[type].length > 0 && selectedPosts.length < containerCapacity) {
            selectedPosts.push(postTypes[type].shift()); // Add one post from each type
        }
    }

    // Fill remaining slots with highest-priority posts across all types
    let remainingPosts = [];
    for (let type in postTypes) {
        remainingPosts = remainingPosts.concat(postTypes[type]);
    }

    // Sort remaining posts by isTrending and date
    remainingPosts.sort((a, b) => {
        if (a.isTrending === b.isTrending) {
            return new Date(b.date) - new Date(a.date);
        }
        return b.isTrending - a.isTrending;
    });

    // Add remaining posts until the container is full
    while (selectedPosts.length < containerCapacity && remainingPosts.length > 0) {
        selectedPosts.push(remainingPosts.shift());
    }

    return selectedPosts;
}
