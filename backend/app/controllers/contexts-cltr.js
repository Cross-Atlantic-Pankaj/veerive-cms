import Context from '../models/context-model.js'
import { Sector, SubSector } from '../models/sector-model.js';
import { Signal, SubSignal } from '../models/signal-model.js';
import Theme from '../models/theme-model.js';
import Company from '../models/company-model.js';
import Source from '../models/source-model.js';
import { Country, Region } from '../models/geography-model.js';
import PostType from '../models/postType-model.js';
import crypto from 'crypto';


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

// Temporary session storage for secure filtering
const filterSessions = new Map();

// Create a secure filter session
contextsCltr.createFilterSession = async (req, res) => {
    const { contextIds } = req.body;
    console.log('Creating secure filter session');
    try {
        if (!contextIds || !Array.isArray(contextIds) || contextIds.length === 0) {
            return res.status(400).json({ success: false, error: 'Context IDs are required' });
        }
        
        // Generate a secure session token
        const sessionToken = crypto.randomBytes(32).toString('hex');
        
        // Store the context IDs with the session token (expires in 30 minutes)
        filterSessions.set(sessionToken, {
            contextIds,
            expires: Date.now() + 30 * 60 * 1000 // 30 minutes (extended from 10)
        });
        
        console.log(`Created filter session for ${contextIds.length} contexts`);
        res.json({ success: true, sessionToken });
    } catch (error) {
        console.error('Error creating filter session:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Get contexts by filter session
contextsCltr.getContextsByFilterSession = async (req, res) => {
    const { sessionToken } = req.params;
    console.log('🔒 Retrieving contexts by filter session, token length:', sessionToken?.length);
    try {
        if (!sessionToken) {
            console.log('❌ No session token provided');
            return res.status(400).json({ success: false, error: 'Session token is required' });
        }
        
        console.log('🔍 Looking up session in memory store...');
        const session = filterSessions.get(sessionToken);
        if (!session) {
            console.log('❌ Session not found in memory store');
            console.log('📊 Current sessions in store:', filterSessions.size);
            return res.status(404).json({ success: false, error: 'Invalid or expired session' });
        }
        
        console.log('✅ Session found, checking expiry...');
        // Check if session has expired
        const now = Date.now();
        const timeLeft = session.expires - now;
        console.log('⏰ Session time left (minutes):', Math.round(timeLeft / 60000));
        
        if (now > session.expires) {
            console.log('❌ Session has expired');
            filterSessions.delete(sessionToken);
            return res.status(404).json({ success: false, error: 'Session expired' });
        }
        
        console.log('🔍 Fetching contexts from database, contextIds count:', session.contextIds.length);
        
        // Fetch contexts by IDs
        const contexts = await Context.find({ _id: { $in: session.contextIds } });
        
        console.log('📋 Database query results:', {
            requestedIds: session.contextIds.length,
            foundContexts: contexts.length,
            contextTitles: contexts.map(c => c.contextTitle?.substring(0, 30) + '...')
        });
        
        // Clean up expired sessions periodically
        let cleanedCount = 0;
        for (const [token, sessionData] of filterSessions.entries()) {
            if (Date.now() > sessionData.expires) {
                filterSessions.delete(token);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            console.log('🧹 Cleaned up', cleanedCount, 'expired sessions');
        }
        
        console.log(`✅ Successfully retrieved ${contexts.length} contexts from filter session`);
        res.json({ success: true, contexts });
    } catch (error) {
        console.error('❌ Error retrieving contexts by filter session:', error);
        res.status(500).json({ success: false, error: 'Server error', details: error.message });
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