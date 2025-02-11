import Post from '../models/post-model.js'
const postsCltr = {}



postsCltr.list = async (req, res) => {
    try {
        const { context, postType, startDate, endDate, page = 1, limit = 10, search } = req.query;

        let query = {};

        // 🔹 Search by Post Title (Case-Insensitive)
        if (search) {
            query.postTitle = { $regex: search, $options: "i" };
        }

        // 🔹 Filter by Context
        if (context) {
            const contextArray = context.split(',').map(id => id.trim());
            query.context = { $in: contextArray };
        }

        // 🔹 Filter by Post Type
        if (postType) {
            query.postType = postType;
        }

        // 🔹 Filter by Date Range
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                query.date = { $gte: start, $lte: end };
            }
        }

        // 🔹 If searching, ignore pagination and return all matching posts
        let posts;
        if (search) {
            posts = await Post.find(query);
        } else {
            posts = await Post.find(query)
                .skip((page - 1) * limit)
                .limit(parseInt(limit));
        }

        const totalPosts = await Post.countDocuments(query);

        res.json({
            success: true,
            total: totalPosts,
            page: search ? 1 : parseInt(page),  // Reset to page 1 for search
            limit: parseInt(limit),
            totalPages: search ? 1 : Math.ceil(totalPosts / limit),
            posts
        });
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).json({ error: "Server Error" });
    }
};



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