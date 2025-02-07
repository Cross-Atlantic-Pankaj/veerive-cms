import Post from '../models/post-model.js'
const postsCltr = {}

// postsCltr.list = async (req, res) => {
//     try{
//         const posts = await Post.find({})
//         res.json(posts)
//         console.log(posts)
//     } catch(err) {
//         console.log(err)
//         res.json(err)
//     }
    
// }
postsCltr.list = async (req, res) => {
    try {
        const { context, postType, startDate, endDate, page = 1, limit = 10 } = req.query;

        let query = {};
        
        // Filter by context
        if (context) {
            const contextArray = context.split(',').map(id => id.trim());
            query.context = { $in: contextArray };
        }

        // Filter by postType
        if (postType) {
            query.postType = postType;
        }

        // Filter by date range
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                query.date = { $gte: start, $lte: end };
            }
        }

        // Pagination options
        const options = {
            skip: (page - 1) * limit,
            limit: parseInt(limit)
        };

        // Fetch posts with applied filters
        const posts = await Post.find(query).skip(options.skip).limit(options.limit);
        const totalPosts = await Post.countDocuments(query);

        res.json({
            success: true,
            total: totalPosts,
            page: parseInt(page),
            limit: parseInt(limit),
            posts
        });
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).json({ error: "Server Error" });
    }
};


// postsCltr.list = async (req, res) => {
//     try {
//         // Extract context query parameter from the request
//         const { context } = req.query;

//         // If a context ID is provided, filter posts by context
//         let query = {};
//         if (context) {
//             const contextArray = context.split(',').map(id => id.trim());
//             query.context = { $in: contextArray };
//         }

//         // Fetch posts based on the query
//         const posts = await Post.find(query);
//         res.json(posts);
//         console.log('Filtered posts:', posts);
//     } catch (err) {
//         console.error('Error fetching posts:', err);
//         res.status(500).json({ error: err.message });
//     }
// };


postsCltr.date = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Validate and convert startDate and endDate
        if (!startDate || !endDate) {
            return res.status(400).send('Start date and end date are required');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).send('Invalid date format');
        }

        // Ensure endDate is inclusive
        end.setDate(end.getDate() + 1);

        // Fetch posts within the date range
        const posts = await Post.find({
            date: {
                $gte: start,
                $lt: end
            }
        });

        res.json(posts);
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).send('Server Error');
    }
};

// postsCltr.create = async (req, res) => {

//     try{
//         const post = new Post(req.body)
//         await post.save()
//         res.status(201).json(post)
//     }catch(err){
//         console.log(err)
//         res.status(500).json({error: 'something went wrong'})
//     }
// }
postsCltr.create = async (req, res) => {
    try {
        console.log("Received Post Data:", req.body); // Debugging

        // Check for required fields before saving
        if (!req.body.summary || !req.body.sourceUrl) {
            return res.status(400).json({ error: 'Summary and Source URL are required.' });
        }

        const post = new Post(req.body);
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

// postsCltr.update = async (req, res) => {

//     try{
//         let post
//         const id = req.params.id
//         const body = req.body
//         post = await Post.findByIdAndUpdate(id, body, {new: true})
        
//         if(!post){
//             return res.status(404).json({ message: 'Post not found' })
//         }
//         return res.json(post)

//     }catch(err){
//         console.log(err)
//         res.status(500).json({error: 'something went wrong'})
//     }
// }

postsCltr.update = async (req, res) => {
    try {
        const id = req.params.id;
        const body = req.body;

        console.log("Updating Post ID:", id, "Data:", body);

        if (!body.postTitle || !body.date || !body.postType) {
            return res.status(400).json({ error: "Post Title, Date, and Post Type are required." });
        }

        // Ensure the post exists
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        // Update the post
        const updatedPost = await Post.findByIdAndUpdate(id, body, { new: true });

        res.json({
            success: true,
            message: "Post updated successfully.",
            updatedPost
        });
    } catch (err) {
        console.error("Error updating post:", err);
        res.status(500).json({ error: "Server Error" });
    }
};

postsCltr.delete = async (req, res) => {
    try {
        const id = req.params.id;
        
        console.log("Deleting Post ID:", id);

        // Check if the post exists
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        await Post.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Post deleted successfully."
        });
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).json({ error: "Server Error" });
    }
};

export default postsCltr