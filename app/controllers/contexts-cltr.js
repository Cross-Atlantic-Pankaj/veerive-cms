import Context from '../models/context-model.js'
const contextsCltr = {}

contextsCltr.list = async (req, res) => {
    try{
        const contexts = await Context.find({})
        res.json(contexts)
        console.log(contexts)
    } catch(err) {
        console.log(err)
        res.json(err)
    }
    
}

contextsCltr.show = async (req, res) => {
    try {
        const contextId = req.params.id; // Get the context ID from the request parameters
        if (!contextId) {
            return res.status(400).json({ message: 'Context ID is required' });
        }

        const context = await Context.findById(contextId); // Find the context by ID
        if (!context) {
            return res.status(404).json({ message: 'Context not found' });
        }

        res.json(context); // Send the found context as the response
        console.log(context); // Log the context for debugging
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
    const { postId, includeInContainer } = req.body;
    const { contextId } = req.params;

    if (!contextId || !postId) {
        console.error("❌ Missing Data in Request:", { contextId, postId });
        return res.status(400).json({ message: 'Context ID and Post ID are required.' });
    }

    try {
        console.log("🔄 Updating Context with Post:", { contextId, postId, includeInContainer });

        const updatedContext = await Context.findByIdAndUpdate(
            contextId,
            { $push: { posts: { postId, includeInContainer } } }, 
            { new: true, useFindAndModify: false }
        );

        if (!updatedContext) {
            console.error("❌ Context Not Found:", contextId);
            return res.status(404).json({ message: 'Context not found.' });
        }

        console.log("✅ Context updated successfully:", updatedContext);
        res.status(200).json({ message: 'Post ID added successfully', updatedContext });
    } catch (error) {
        console.error('❌ Error updating context with postId:', error);
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