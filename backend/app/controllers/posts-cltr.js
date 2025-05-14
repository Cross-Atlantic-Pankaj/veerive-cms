import Post from '../models/post-model.js'
import Context from '../models/context-model.js'
const postsCltr = {}
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

// postsCltr.list = async (req, res) => {
//     try {
//         const { page = 1, limit = 10 } = req.query;

//         let posts = await Post.find()
//             .populate("contexts", "contextTitle _id") // ✅ Populate contexts here
//             .skip((page - 1) * parseInt(limit))
//             .limit(parseInt(limit))
//             .lean();

//         posts = posts.map(post => ({
//             ...post,
//             contexts: post.contexts?.map(ctx => ({ _id: ctx._id, contextTitle: ctx.contextTitle })) || []
//         }));

//         const totalPosts = await Post.countDocuments();

//         res.json({
//             success: true,
//             total: totalPosts,
//             page: parseInt(page),
//             limit: parseInt(limit),
//             totalPages: Math.ceil(totalPosts / limit),
//             posts
//         });
//     } catch (err) {
//         console.error("❌ Error fetching posts:", err);
//         res.status(500).json({ error: "Server Error" });
//     }
// };

postsCltr.list = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        let posts = await Post.find()
            .populate("contexts", "contextTitle _id") // ✅ Populate contexts here
            .sort({ date: -1 }) // ✅ Ensure descending order (latest first)
            .skip((page - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .lean();

        posts = posts.map(post => ({
            ...post,
            contexts: post.contexts?.map(ctx => ({ _id: ctx._id, contextTitle: ctx.contextTitle })) || []
        }));

        const totalPosts = await Post.countDocuments();

        res.json({
            success: true,
            total: totalPosts,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalPosts / limit),
            posts
        });
    } catch (err) {
        console.error("❌ Error fetching posts:", err);
        res.status(500).json({ error: "Server Error" });
    }
};



postsCltr.create = async (req, res) => {
    try {
        console.log("Received Post Data:", req.body); // Debugging

        const cleanSummary = req.body.summary ? req.body.summary.replace(/<[^>]*>/g, '').trim() : "";

        if (!cleanSummary) {
            return res.status(400).json({ error: "Summary cannot be empty." });
        }

        if (!Array.isArray(req.body.sourceUrls) || req.body.sourceUrls.length === 0) {
            return res.status(400).json({ error: "At least one Source URL is required." });
        }

        const formattedPost = {
            ...req.body,
            summary: cleanSummary,
            contexts: req.body.contexts.map(ctx => ctx._id) // ✅ Store only context IDs
        };

        let post = new Post(formattedPost);
        await post.save();

        // ✅ Populate contexts so frontend sees `contextTitle`
        post = await post.populate("contexts", "contextTitle _id");

        res.status(201).json({ success: true, message: "Post created successfully.", post });

    } catch (err) {
        console.error("❌ Error creating post:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
};


postsCltr.update = async (req, res) => {
    try {
        const id = req.params.id;
        const body = req.body;

        console.log("Updating Post ID:", id, "Data:", body);

        const cleanSummary = body.summary ? body.summary.replace(/<[^>]*>/g, '').trim() : "";

        if (!body.postTitle || !body.date || !body.postType || !cleanSummary) {
            return res.status(400).json({ error: "Post Title, Date, Post Type, and Summary are required." });
        }

        if (!Array.isArray(body.sourceUrls) || body.sourceUrls.length === 0) {
            return res.status(400).json({ error: "At least one Source URL is required." });
        }

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        const updatedPost = await Post.findByIdAndUpdate(id, { ...body, summary: cleanSummary }, { new: true });

        res.json({
            success: true,
            message: "Post updated successfully.",
            updatedPost
        });

    } catch (err) {
        console.error("❌ Error updating post:", err);
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

        // Remove the post from all contexts that reference it
        await Context.updateMany(
            { 'posts.postId': id },
            { $pull: { posts: { postId: id } } }
        );

        // Delete the post
        await Post.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Post deleted successfully and removed from all contexts."
        });
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).json({ error: "Server Error" });
    }
};
postsCltr.getAllPosts = async (req, res) => {
    try {
        console.log("🔍 Fetching all posts...");

        // Fetch all posts and populate the contexts for better UI display
        const posts = await Post.find({})
            .populate("contexts", "contextTitle _id")
            .sort({ date: -1 })
            .lean();

        console.log(`✅ Total Posts Fetched: ${posts.length}`);

        res.json({ success: true, posts });
    } catch (err) {
        console.error("❌ Error fetching all posts:", err);
        res.status(500).json({ error: "Server Error" });
    }
};



export default postsCltr