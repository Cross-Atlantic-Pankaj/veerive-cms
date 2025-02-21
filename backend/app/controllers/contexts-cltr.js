import Context from '../models/context-model.js'


const contextsCltr = {}

contextsCltr.getAllContexts = async (req, res) => {
    try {
        console.log("🔍 Fetching all contexts...");

        // Fetch all contexts from the database, sorted alphabetically
        const contexts = await Context.find({})
            .sort({ contextTitle: 1 })
            .lean();

        console.log(`✅ Total Contexts Fetched: ${contexts.length}`);

        res.json({ success: true, contexts });
    } catch (err) {
        console.error("❌ Error fetching all contexts:", err);
        res.status(500).json({ error: "Server Error" });
    }
};



contextsCltr.list = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        console.log(`API Request - Page: ${page}, Search: ${search}`);

        let query = {};

        if (search) {
            const isDateSearch = /^\d{4}-\d{2}-\d{2}$/.test(search);

            if (isDateSearch) {
                const parsedDate = new Date(search);

                if (!isNaN(parsedDate.getTime())) {
                    const startDate = new Date(parsedDate);
                    startDate.setUTCHours(0, 0, 0, 0); // Force UTC start time

                    const endDate = new Date(startDate);
                    endDate.setUTCHours(23, 59, 59, 999); // End of the same day

                    query.date = { $gte: startDate, $lte: endDate };
                    console.log("🔍 Date Search Query:", query.date);
                }
            } else {
                query.contextTitle = { $regex: search, $options: "i" }; // Text search
            }
        }

        console.log("🔥 Executing MongoDB Query:", query);

        const totalContexts = await Context.countDocuments(query);

        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10;
        const skipRecords = (pageNumber - 1) * pageSize;

        const contexts = await Context.find(query)
            .sort({ date: -1 })
            .skip(skipRecords)
            .limit(pageSize)
            .lean();

        console.log("✅ API Response:", { totalContexts, totalPages: Math.ceil(totalContexts / pageSize), page: pageNumber, returnedRecords: contexts.length });

        res.json({
            success: true,
            total: totalContexts,
            page: pageNumber,
            limit: pageSize,
            totalPages: Math.ceil(totalContexts / pageSize),
            contexts
        });
    } catch (err) {
        console.error("❌ Error fetching contexts:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
};

contextsCltr.show = async (req, res) => {
    try {
        const contextId = req.params.id;

        // ✅ Handle case when ID is "all" by calling getAllContexts
        if (contextId === "all") {
            return contextsCltr.getAllContexts(req, res);
        }

        // ✅ Validate ObjectId format before searching
        if (!contextId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid Context ID format' });
        }

        const context = await Context.findById(contextId);
        if (!context) {
            return res.status(404).json({ message: 'Context not found' });
        }

        res.json(context);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error', error: err });
    }
};

contextsCltr.postContext = async (req, res) => {
    const { postId } = req.params;
    console.log(req.params)
    try {
        const contexts = await Context.find({ 'posts.postId': postId });
        res.json(contexts);
    } catch (error) {
        res.status(500).send('Server error');
    }
};

contextsCltr.create = async (req, res) => {
    try {
        console.log("Received Request Body:", req.body); // Debugging

        // Check if containerType exists in req.body
        if (!req.body.containerType) {
            return res.status(400).json({ error: 'containerType is required.' });
        }

        const context = new Context(req.body);
        await context.save();
        res.status(201).json(context);
    } catch (err) {
        console.error('Error creating context:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};



contextsCltr.update = async (req, res) => {

    try{
        let context
        const id = req.params.id
        const body = req.body
        context = await Context.findByIdAndUpdate(id, body, {new: true})
        
        if(!context){
            return res.status(404).json({ message: 'Context not found' })
        }
        return res.json(context)

    }catch(err){
        console.log(err)
        res.status(500).json({error: 'something went wrong'})
    }
}



// for updating postId in context when a post is saved
    
    contextsCltr.updatePostId = async (req, res) => {
    const { postId, includeInContainer } = req.body; // postId and includeInContainer being sent in the request body
    const { contextId } = req.params; // contextId from the URL params

    try {
        // Ensure contextId, postId, and includeInContainer are provided
        if (!contextId || !postId) {
            return res.status(400).json({ message: 'Context ID, Post ID, and includeInContainer are required.' });
        }

        // Use the $push operator to add the new post object to the posts array
        const updatedContext = await Context.findByIdAndUpdate(
            contextId, // Find the context by its ID
            { $push: { posts: { postId, includeInContainer } } }, // Push the new post object into the posts array
            { new: true, useFindAndModify: false } // Return the updated document
        );

        // Check if the context was found and updated
        if (!updatedContext) {
            return res.status(404).json({ message: 'Context not found.' });
        }

        // Respond with the updated context
        res.status(200).json({ message: 'Post ID added successfully', updatedContext });
    } catch (error) {
        console.error('Error updating context with postId:', error);
        res.status(500).json({ message: 'An error occurred while updating the context.' });
    }
};


contextsCltr.delete = async (req, res) => {
    try{
        let context
        const id = req.params.id
        
        context = await Context.findByIdAndDelete(id)
        
        if(!context){
            return res.status(404).json({ message: 'Context not found' })
        }
        return res.json(context)

    }catch(err){
        console.log(err)
        res.status(500).json({error: 'something went wrong'})
    }
}

export default contextsCltr