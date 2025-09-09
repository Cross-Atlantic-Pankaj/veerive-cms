import Context from '../models/context-model.js'
import { Sector, SubSector } from '../models/sector-model.js';
import { Signal, SubSignal } from '../models/signal-model.js';
import Theme from '../models/theme-model.js';
import Company from '../models/company-model.js';
import Source from '../models/source-model.js';
import { Country, Region } from '../models/geography-model.js';
import PostType from '../models/postType-model.js';


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
    console.log('Fetching contexts for post ID:', postId);
    try {
        const contexts = await Context.find({ 'posts.postId': postId });
        console.log(`Found ${contexts.length} contexts for post ID:`, postId);
        res.json({ success: true, contexts });
    } catch (error) {
        console.error('Error fetching contexts for post:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Secure endpoint - POST request with postId in body instead of URL
contextsCltr.getContextsByPost = async (req, res) => {
    const { postId } = req.body;
    console.log('Fetching contexts for post (secure)');
    try {
        if (!postId) {
            return res.status(400).json({ success: false, error: 'Post ID is required' });
        }
        
        const contexts = await Context.find({ 'posts.postId': postId });
        console.log(`Found ${contexts.length} contexts for post`);
        res.json({ success: true, contexts });
    } catch (error) {
        console.error('Error fetching contexts for post:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};



contextsCltr.create = async (req, res) => {
    try {
        console.log("Received Request Body:", req.body); // Debugging
        console.log("🖼️ ImageUrl in context request:", req.body.imageUrl);
        console.log("🔍 Context request headers:", req.headers);
        console.log("🔍 Context request body keys:", Object.keys(req.body || {}));
        console.log("🔍 Full context request body:", JSON.stringify(req.body, null, 2));
        console.log("🔍 Context imageUrl type:", typeof req.body.imageUrl);
        console.log("🔍 Context imageUrl truthy:", !!req.body.imageUrl);
        console.log("🔍 Context imageUrl length:", req.body.imageUrl ? req.body.imageUrl.length : 'null/undefined');
        console.log("🔍 Context has imageUrl key:", 'imageUrl' in req.body);
        console.log("🔍 Context all body keys containing 'image':", Object.keys(req.body).filter(key => key.toLowerCase().includes('image')));

        // Check if containerType exists in req.body
        if (!req.body.containerType) {
            return res.status(400).json({ error: 'containerType is required.' });
        }

        // Explicitly handle imageUrl to ensure it's not lost
        const imageUrlValue = req.body.imageUrl || null;
        console.log('🔍 Context explicit imageUrl value:', imageUrlValue);
        console.log('🔍 Context explicit imageUrl type:', typeof imageUrlValue);
        
        const contextData = {
            ...req.body,
            imageUrl: imageUrlValue // ✅ Explicitly set imageUrl
        };
        const context = new Context(contextData);
        console.log("📝 Creating new Context with data:", context.toObject());
        console.log("🖼️ ImageUrl before save:", context.imageUrl);
        console.log("🔍 Context imageUrl type before save:", typeof context.imageUrl);
        console.log("🔍 Context imageUrl truthy before save:", !!context.imageUrl);
        console.log("🔍 Context imageUrl length before save:", context.imageUrl ? context.imageUrl.length : 'null/undefined');
        console.log("🔍 Context document keys before save:", Object.keys(context.toObject()));
        console.log("🔍 Context document keys containing image before save:", Object.keys(context.toObject()).filter(key => key.toLowerCase().includes('image')));
        
        // Explicitly set imageUrl to ensure it's not lost
        if (imageUrlValue) {
            context.imageUrl = imageUrlValue;
            console.log('🔧 Context explicitly set imageUrl to:', context.imageUrl);
        }
        
        console.log("💾 About to save context to MongoDB...");
        console.log("💾 Final context imageUrl before save:", context.imageUrl);
        await context.save();
        console.log("💾 Context saved to MongoDB successfully!");
        
        console.log("💾 Context saved to database successfully");
        console.log("🖼️ ImageUrl after save:", context.imageUrl);
        console.log("📄 Full saved context object:", JSON.stringify(context.toObject(), null, 2));
        
        // Backup: If imageUrl is not saved, try direct MongoDB update
        if (imageUrlValue && !context.imageUrl) {
            console.log('🔧 Context Backup: imageUrl not saved, attempting direct MongoDB update...');
            try {
                await Context.findByIdAndUpdate(context._id, { imageUrl: imageUrlValue });
                console.log('🔧 Context Backup: Direct MongoDB update successful');
                // Refresh the context object
                const refreshedContext = await Context.findById(context._id);
                console.log('🔧 Context Backup: Refreshed context imageUrl:', refreshedContext.imageUrl);
            } catch (backupError) {
                console.error('🔧 Context Backup: Direct MongoDB update failed:', backupError);
            }
        }
        
        // Verify the context was actually saved with imageUrl in MongoDB
        console.log("🔍 Starting context verification process...");
        const verificationContext = await Context.findById(context._id);
        console.log("🔍 Verification: Context retrieved from MongoDB:", verificationContext.imageUrl);
        console.log("🔍 Verification: Context imageUrl type:", typeof verificationContext.imageUrl);
        console.log("🔍 Verification: Context imageUrl truthy:", !!verificationContext.imageUrl);
        console.log("🔍 Verification: Context imageUrl length:", verificationContext.imageUrl ? verificationContext.imageUrl.length : 'null/undefined');
        console.log("🔍 Verification: Full verification context:", JSON.stringify(verificationContext.toObject(), null, 2));
        
        // Check the raw document fields
        const rawContext = await Context.findById(context._id).lean();
        console.log("🔍 Raw context document fields:", Object.keys(rawContext));
        console.log("🔍 Raw context imageUrl field:", rawContext.imageUrl);
        console.log("🔍 Raw context imageURL field:", rawContext.imageURL);
        console.log("🔍 All context fields containing 'image':", Object.keys(rawContext).filter(key => key.toLowerCase().includes('image')));
        console.log("🔍 Raw context imageUrl type:", typeof rawContext.imageUrl);
        console.log("🔍 Raw context imageUrl truthy:", !!rawContext.imageUrl);
        console.log("🔍 Raw context imageUrl length:", rawContext.imageUrl ? rawContext.imageUrl.length : 'null/undefined');
        
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
        
        console.log("🖼️ ImageUrl in context update request:", body.imageUrl);
        
        console.log("📝 Updating context with data:", body);
        console.log("🖼️ ImageUrl in update data:", body.imageUrl);
        
        // Explicitly handle imageUrl for context update
        const imageUrlValue = body.imageUrl || null;
        console.log('🔍 Context update explicit imageUrl value:', imageUrlValue);
        console.log('🔍 Context update explicit imageUrl type:', typeof imageUrlValue);
        
        const updateData = {
            ...body,
            imageUrl: imageUrlValue // ✅ Explicitly set imageUrl
        };
        
        // Ensure imageUrl is explicitly set in the context update
        if (imageUrlValue) {
            updateData.imageUrl = imageUrlValue;
            console.log('🔧 Context update explicitly set imageUrl to:', updateData.imageUrl);
        }
        
        console.log('💾 About to update context in MongoDB...');
        console.log('💾 Final context update imageUrl:', updateData.imageUrl);
        context = await Context.findByIdAndUpdate(id, updateData, {new: true})
        
        console.log("💾 Context updated in database successfully");
        console.log("🖼️ ImageUrl in updated context:", context.imageUrl);
        console.log("📄 Full updated context object:", JSON.stringify(context.toObject(), null, 2));
        
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

// Modular API to fetch all master data for context editing
contextsCltr.getEditContextData = async (req, res) => {
    try {
        // Fetch all master data in parallel
        const [
            sectors,
            subSectors,
            signals,
            subSignals,
            themes,
            companies,
            sources,
            countries,
            regions,
            postTypes
        ] = await Promise.all([
            Sector.find({}),
            SubSector.find({}),
            Signal.find({}),
            SubSignal.find({}),
            Theme.find({}),
            Company.find({}),
            Source.find({}),
            Country.find({}),
            Region.find({}),
            PostType.find({})
        ]);

        // User management: restrict data if needed (currently all users can view all master data)
        // If you want to restrict, filter here based on req.user.role

        res.json({
            success: true,
            data: {
                sectors,
                subSectors,
                signals,
                subSignals,
                themes,
                companies,
                sources,
                countries,
                regions,
                postTypes
            }
        });
    } catch (err) {
        console.error('Error fetching edit context data:', err);
        res.status(500).json({ error: 'Server Error' });
    }
};

export default contextsCltr