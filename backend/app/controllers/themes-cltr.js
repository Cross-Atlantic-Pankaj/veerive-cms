import Theme from '../models/theme-model.js'
const themesCltr = {}

// themesCltr.list = async (req, res) => {
//     try{
//         const allThemes = await Theme.find({})
//         res.json(allThemes)
//         console.log(allThemes)
//     } catch(err) {
//         console.log(err)
//         res.json(err)
//     }
    
// }

themesCltr.create = async (req, res) => {

    try{
        const theme = new Theme(req.body)
        await theme.save()
        res.status(201).json(theme)
    }catch(err){
        console.log(err)
        res.status(500).json({error: 'something went wrong'})
    }
}

themesCltr.update = async (req, res) => {

    try{
        let theme
        const id = req.params.id
        const body = req.body
        theme = await Theme.findByIdAndUpdate(id, body, {new: true})
        
        if(!theme){
            return res.status(404).json({ message: 'Theme not found' })
        }
        return res.json(theme)

    }catch(err){
        console.log(err)
        res.status(500).json({error: 'something went wrong'})
    }
}

themesCltr.delete = async (req, res) => {
    try{
        let theme
        const id = req.params.id
        
        // First, find the theme to get its details
        theme = await Theme.findById(id)
        
        if(!theme){
            return res.status(404).json({ message: 'Theme not found' })
        }

        // Remove the theme from all contexts that reference it
        const Context = (await import('../models/context-model.js')).default;
        await Context.updateMany(
            { themes: id },
            { $pull: { themes: id } }
        );

        console.log(`✅ Removed theme ${theme.themeTitle} from all contexts`);

        // Now delete the theme
        await Theme.findByIdAndDelete(id)
        
        return res.json({
            success: true,
            message: "Theme deleted successfully and removed from all contexts",
            theme: theme
        })

    }catch(err){
        console.log(err)
        res.status(500).json({error: 'something went wrong'})
    }
}

// Helper to always return sectors/subSectors as array of ObjectId strings
function toIdArray(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => (item && item._id ? String(item._id) : String(item)));
}

// Get paginated themes
themesCltr.list = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page) || 1;
        const limitNumber = Math.min(parseInt(limit) || 10, 50); // Cap at 50 items per page

        // Use Promise.all for parallel execution with timeouts
        const [themes, totalThemes] = await Promise.all([
            Theme.find({})
                .populate('sectors', 'sectorName _id')
                .populate('subSectors', 'subSectorName _id')
                .skip((pageNumber - 1) * limitNumber)
                .limit(limitNumber)
                .lean()
                .maxTimeMS(10000), // 10 second timeout
            Theme.countDocuments().maxTimeMS(5000) // 5 second timeout
        ]);

        // Optimize the mapping
        const optimizedThemes = themes.map(theme => {
            const t = theme;
            t.sectors = toIdArray(t.sectors);
            t.subSectors = toIdArray(t.subSectors);
            return t;
        });

        res.json({
            themes: optimizedThemes,
            totalPages: Math.ceil(totalThemes / limitNumber),
            currentPage: pageNumber,
            totalThemes
        });

    } catch (err) {
        console.log(err);
        if (err.name === 'MongoTimeoutError') {
            res.status(408).json({ error: "Request timeout - please try again" });
        } else {
            res.status(500).json({ error: 'Something went wrong' });
        }
    }
};

themesCltr.getAllThemes = async (req, res) => {
    try {
        let allThemes = await Theme.find({})
            .populate('sectors', 'sectorName _id')
            .populate('subSectors', 'subSectorName _id')
            .lean()
            .maxTimeMS(15000); // 15 second timeout for all themes
        
        allThemes = allThemes.map(theme => {
            const t = theme;
            t.sectors = toIdArray(t.sectors);
            t.subSectors = toIdArray(t.subSectors);
            return t;
        });
        res.json({ success: true, themes: allThemes });
    } catch (err) {
        console.error("Error fetching all themes:", err);
        if (err.name === 'MongoTimeoutError') {
            res.status(408).json({ error: "Request timeout - please try again" });
        } else {
            res.status(500).json({ error: "Something went wrong" });
        }
    }
};

// Get a single theme by ID
themesCltr.getOne = async (req, res) => {
    try {
        const id = req.params.id;
        let theme = await Theme.findById(id)
            .populate('sectors')
            .populate('subSectors');
        if (!theme) {
            return res.status(404).json({ message: 'Theme not found' });
        }
        theme = theme.toObject();
        theme.sectors = toIdArray(theme.sectors);
        theme.subSectors = toIdArray(theme.subSectors);
        res.json(theme);
    } catch (err) {
        console.error("Error fetching theme:", err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export default themesCltr