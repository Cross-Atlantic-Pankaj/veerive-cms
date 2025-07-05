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
            tileTemplateId: req.body.tileTemplateId || null // ✅ Handle tileTemplateId
        };

        let post = new Post(formattedPost);
        await post.save();

        // ✅ Automatically tag the post to contexts and save context
        if (req.body.contexts && Array.isArray(req.body.contexts) && req.body.contexts.length > 0) {
            try {
                // Update each context with the new post
                const contextUpdates = req.body.contexts.map(contextId => 
                    Context.findByIdAndUpdate(
                        contextId,
                        { 
                            $addToSet: { 
                                posts: { 
                                    postId: post._id, 
                                    includeInContainer: req.body.includeInContainer || true 
                                } 
                            } 
                        },
                        { new: true }
                    )
                );

                await Promise.all(contextUpdates);
                console.log(`✅ Successfully tagged post ${post._id} to ${req.body.contexts.length} contexts`);
            } catch (contextError) {
                console.error("❌ Error updating contexts with post:", contextError);
                // Don't fail the post creation if context update fails
            }
        }

        // ✅ Populate contexts so frontend sees `contextTitle`
        post = await post.populate("contexts", "contextTitle _id");

        res.status(201).json({ success: true, message: "Post created successfully and tagged to contexts.", post });

    } catch (err) {
        console.error("❌ Error creating post:", err);
        res.status(500).json({ 
            error: "Something went wrong",
            message: err.message,
            errors: err.errors
        });
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

        const updatedData = { 
            ...body, 
            summary: cleanSummary,
            tileTemplateId: body.tileTemplateId || null // ✅ Handle tileTemplateId on update
        };

        const updatedPost = await Post.findByIdAndUpdate(id, updatedData, { new: true });

        // ✅ Handle context updates when post contexts change
        if (body.contexts && Array.isArray(body.contexts)) {
            try {
                // First, remove this post from all contexts
                await Context.updateMany(
                    { 'posts.postId': id },
                    { $pull: { posts: { postId: id } } }
                );

                // Then add the post to the new contexts
                if (body.contexts.length > 0) {
                    const contextUpdates = body.contexts.map(contextId => 
                        Context.findByIdAndUpdate(
                            contextId,
                            { 
                                $addToSet: { 
                                    posts: { 
                                        postId: id, 
                                        includeInContainer: body.includeInContainer || true 
                                    } 
                                } 
                            },
                            { new: true }
                        )
                    );

                    await Promise.all(contextUpdates);
                    console.log(`✅ Successfully updated post ${id} contexts: removed from all, added to ${body.contexts.length} contexts`);
                }
            } catch (contextError) {
                console.error("❌ Error updating contexts with post:", contextError);
                // Don't fail the post update if context update fails
            }
        }

        res.json({
            success: true,
            message: "Post updated successfully and contexts synchronized.",
            updatedPost
        });

    } catch (err) {
        console.error("❌ Error updating post:", err);
        res.status(500).json({ 
            error: "Server Error",
            message: err.message,
            errors: err.errors
        });
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