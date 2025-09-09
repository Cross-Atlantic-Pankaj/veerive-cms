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
        const pageNumber = parseInt(page) || 1;
        const limitNumber = Math.min(parseInt(limit) || 10, 50); // Cap at 50 items per page

        // Use Promise.all for parallel execution
        const [posts, totalPosts] = await Promise.all([
            Post.find()
                .populate("contexts", "contextTitle _id")
                .populate("marketDataDocuments", "title _id")
                .sort({ date: -1 })
                .skip((pageNumber - 1) * limitNumber)
                .limit(limitNumber)
                .lean()
                .maxTimeMS(10000), // 10 second timeout for this query
            Post.countDocuments().maxTimeMS(5000) // 5 second timeout for count
        ]);

        // Optimize the mapping
        const optimizedPosts = posts.map(post => ({
            ...post,
            contexts: post.contexts?.map(ctx => ({ _id: ctx._id, contextTitle: ctx.contextTitle })) || []
        }));

        res.json({
            success: true,
            total: totalPosts,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(totalPosts / limitNumber),
            posts: optimizedPosts
        });
    } catch (err) {
        console.error("❌ Error fetching posts:", err);
        if (err.name === 'MongoTimeoutError') {
            res.status(408).json({ error: "Request timeout - please try again" });
        } else {
            res.status(500).json({ error: "Server Error" });
        }
    }
};



postsCltr.create = async (req, res) => {
    try {
        console.log("Received Post Data:", req.body); // Debugging
        console.log("🖼️ ImageUrl in request:", req.body.imageUrl);
        console.log("🔍 Request headers:", req.headers);
        console.log("🔍 Request body keys:", Object.keys(req.body || {}));
        console.log("🔍 Full request body:", JSON.stringify(req.body, null, 2));
        console.log("🔍 ImageUrl type:", typeof req.body.imageUrl);
        console.log("🔍 ImageUrl value:", req.body.imageUrl);
        console.log("🔍 ImageUrl truthy:", !!req.body.imageUrl);
        console.log("🔍 ImageUrl length:", req.body.imageUrl ? req.body.imageUrl.length : 'null/undefined');
        console.log("🔍 Has imageUrl key:", 'imageUrl' in req.body);
        console.log("🔍 All body keys containing 'image':", Object.keys(req.body).filter(key => key.toLowerCase().includes('image')));

        const cleanSummary = req.body.summary ? req.body.summary.replace(/<[^>]*>/g, '').trim() : "";

        if (!cleanSummary) {
            return res.status(400).json({ error: "Summary cannot be empty." });
        }

        if (!Array.isArray(req.body.sourceUrls) || req.body.sourceUrls.length === 0) {
            return res.status(400).json({ error: "At least one Source URL is required." });
        }

        // Explicitly handle imageUrl to ensure it's not lost
        const imageUrlValue = req.body.imageUrl || null;
        console.log('🔍 Explicit imageUrl value:', imageUrlValue);
        console.log('🔍 Explicit imageUrl type:', typeof imageUrlValue);
        
        const formattedPost = {
            ...req.body,
            summary: cleanSummary,
            tileTemplateId: req.body.tileTemplateId || null, // ✅ Handle tileTemplateId
            imageUrl: imageUrlValue // ✅ Explicitly set imageUrl
        };
        
        console.log('📝 Formatted post data for creation:', formattedPost);
        console.log('🖼️ ImageUrl in formatted post:', formattedPost.imageUrl);
        console.log('🔍 Formatted post imageUrl type:', typeof formattedPost.imageUrl);
        console.log('🔍 Formatted post imageUrl truthy:', !!formattedPost.imageUrl);
        console.log('🔍 Formatted post imageUrl length:', formattedPost.imageUrl ? formattedPost.imageUrl.length : 'null/undefined');
        console.log('🔍 Formatted post keys containing image:', Object.keys(formattedPost).filter(key => key.toLowerCase().includes('image')));

        let post = new Post(formattedPost);
        console.log('📝 Creating new Post with data:', post.toObject());
        console.log('🖼️ ImageUrl before save:', post.imageUrl);
        console.log('🔍 Post schema fields:', Object.keys(post.schema.paths));
        console.log('🔍 Post imageUrl field definition:', post.schema.paths.imageUrl);
        console.log('🔍 Post imageUrl type before save:', typeof post.imageUrl);
        console.log('🔍 Post imageUrl truthy before save:', !!post.imageUrl);
        console.log('🔍 Post imageUrl length before save:', post.imageUrl ? post.imageUrl.length : 'null/undefined');
        console.log('🔍 Post document keys before save:', Object.keys(post.toObject()));
        console.log('🔍 Post document keys containing image before save:', Object.keys(post.toObject()).filter(key => key.toLowerCase().includes('image')));
        
        // Explicitly set imageUrl to ensure it's not lost
        if (imageUrlValue) {
            post.imageUrl = imageUrlValue;
            console.log('🔧 Explicitly set imageUrl to:', post.imageUrl);
        }
        
        console.log('💾 About to save post to MongoDB...');
        console.log('💾 Final imageUrl before save:', post.imageUrl);
        await post.save();
        console.log('💾 Post saved to MongoDB successfully!');
        
        console.log('💾 Post saved to database successfully');
        console.log('🖼️ ImageUrl after save:', post.imageUrl);
        console.log('📄 Full saved post object:', JSON.stringify(post.toObject(), null, 2));
        
        // Backup: If imageUrl is not saved, try direct MongoDB update
        if (imageUrlValue && !post.imageUrl) {
            console.log('🔧 Backup: imageUrl not saved, attempting direct MongoDB update...');
            try {
                await Post.findByIdAndUpdate(post._id, { imageUrl: imageUrlValue });
                console.log('🔧 Backup: Direct MongoDB update successful');
                // Refresh the post object
                const refreshedPost = await Post.findById(post._id);
                console.log('🔧 Backup: Refreshed post imageUrl:', refreshedPost.imageUrl);
            } catch (backupError) {
                console.error('🔧 Backup: Direct MongoDB update failed:', backupError);
            }
        }
        
        // Verify the post was actually saved with imageUrl in MongoDB
        console.log('🔍 Starting verification process...');
        const verificationPost = await Post.findById(post._id);
        console.log('🔍 Verification: Post retrieved from MongoDB:', verificationPost.imageUrl);
        console.log('🔍 Verification: imageUrl type:', typeof verificationPost.imageUrl);
        console.log('🔍 Verification: imageUrl truthy:', !!verificationPost.imageUrl);
        console.log('🔍 Verification: imageUrl length:', verificationPost.imageUrl ? verificationPost.imageUrl.length : 'null/undefined');
        console.log('🔍 Verification: Full verification post:', JSON.stringify(verificationPost.toObject(), null, 2));
        
        // Check the raw document fields
        const rawPost = await Post.findById(post._id).lean();
        console.log('🔍 Raw document fields:', Object.keys(rawPost));
        console.log('🔍 Raw imageUrl field:', rawPost.imageUrl);
        console.log('🔍 Raw imageURL field:', rawPost.imageURL);
        console.log('🔍 All fields containing "image":', Object.keys(rawPost).filter(key => key.toLowerCase().includes('image')));
        console.log('🔍 Raw post imageUrl type:', typeof rawPost.imageUrl);
        console.log('🔍 Raw post imageUrl truthy:', !!rawPost.imageUrl);
        console.log('🔍 Raw post imageUrl length:', rawPost.imageUrl ? rawPost.imageUrl.length : 'null/undefined');

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
        console.log("🖼️ ImageUrl in update request:", body.imageUrl);

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

        // Explicitly handle imageUrl for update
        const imageUrlValue = body.imageUrl || null;
        console.log('🔍 Update explicit imageUrl value:', imageUrlValue);
        console.log('🔍 Update explicit imageUrl type:', typeof imageUrlValue);
        
        const updatedData = { 
            ...body, 
            summary: cleanSummary,
            tileTemplateId: body.tileTemplateId || null, // ✅ Handle tileTemplateId on update
            imageUrl: imageUrlValue // ✅ Explicitly set imageUrl
        };
        
        console.log('📝 Updated data for post update:', updatedData);
        console.log('🖼️ ImageUrl in updated data:', updatedData.imageUrl);

        console.log('📝 Updating post with data:', updatedData);
        console.log('🖼️ ImageUrl in update data:', updatedData.imageUrl);
        
        // Ensure imageUrl is explicitly set in the update
        if (imageUrlValue) {
            updatedData.imageUrl = imageUrlValue;
            console.log('🔧 Update explicitly set imageUrl to:', updatedData.imageUrl);
        }
        
        console.log('💾 About to update post in MongoDB...');
        console.log('💾 Final update imageUrl:', updatedData.imageUrl);
        const updatedPost = await Post.findByIdAndUpdate(id, updatedData, { new: true });
        
        console.log('💾 Post updated in database successfully');
        console.log('🖼️ ImageUrl in updated post:', updatedPost.imageUrl);
        console.log('📄 Full updated post object:', JSON.stringify(updatedPost.toObject(), null, 2));

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
            .populate("marketDataDocuments", "title _id") // ✅ Populate market data documents
            .sort({ date: -1 })
            .lean();

        console.log(`✅ Total Posts Fetched: ${posts.length}`);

        res.json({ success: true, posts });
    } catch (err) {
        console.error("❌ Error fetching all posts:", err);
        res.status(500).json({ error: "Server Error" });
    }
};

// Get a single post by ID for editing
postsCltr.getOne = async (req, res) => {
    try {
        const id = req.params.id;
        console.log("🔍 Fetching single post with ID:", id);

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid Post ID format' 
            });
        }

        const post = await Post.findById(id)
            .populate("contexts", "contextTitle _id")
            .populate("countries", "countryName _id")
            .populate("primaryCompanies", "companyName _id")
            .populate("secondaryCompanies", "companyName _id")
            .populate("source", "sourceName _id")
            .populate("marketDataDocuments", "title _id dataDescription") // ✅ Populate market data documents
            .lean();

        if (!post) {
            return res.status(404).json({ 
                success: false, 
                message: 'Post not found' 
            });
        }

        console.log("✅ Successfully fetched post:", post.postTitle);
        res.json({ success: true, post });
    } catch (err) {
        console.error("❌ Error fetching single post:", err);
        res.status(500).json({ 
            success: false, 
            error: "Server Error",
            message: err.message 
        });
    }
};

// Test endpoint to check database field names
postsCltr.testFields = async (req, res) => {
    try {
        console.log('🔍 Testing database field names...');
        
        // Get the most recent post
        const recentPost = await Post.findOne().sort({ createdAt: -1 });
        
        if (!recentPost) {
            return res.json({ message: 'No posts found in database' });
        }
        
        const rawPost = recentPost.toObject();
        console.log('🔍 Raw post fields:', Object.keys(rawPost));
        
        // Check for image-related fields
        const imageFields = Object.keys(rawPost).filter(key => 
            key.toLowerCase().includes('image')
        );
        
        console.log('🔍 Image-related fields:', imageFields);
        
        res.json({
            message: 'Field analysis complete',
            allFields: Object.keys(rawPost),
            imageFields: imageFields,
            imageUrl: rawPost.imageUrl,
            imageURL: rawPost.imageURL,
            recentPost: rawPost
        });
    } catch (error) {
        console.error('Error testing fields:', error);
        res.status(500).json({ error: 'Failed to test fields' });
    }
};

export default postsCltr