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
        
        theme = await Theme.findByIdAndDelete(id)
        
        if(!theme){
            return res.status(404).json({ message: 'Theme not found' })
        }
        return res.json(theme)

    }catch(err){
        console.log(err)
        res.status(500).json({error: 'something went wrong'})
    }
}


// Get paginated themes
themesCltr.list = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Get page and limit from query params
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const themes = await Theme.find({})
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const totalThemes = await Theme.countDocuments();

        res.json({
            themes,
            totalPages: Math.ceil(totalThemes / limitNumber),
            currentPage: pageNumber,
            totalThemes
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};


themesCltr.getAllThemes = async (req, res) => {
    try {
        const allThemes = await Theme.find({}); // ✅ No pagination, fetch all themes
        res.json({ success: true, themes: allThemes });
    } catch (err) {
        console.error("Error fetching all themes:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
};

// Get a single theme by ID
themesCltr.getOne = async (req, res) => {
    try {
        const id = req.params.id;
        const theme = await Theme.findById(id);
        
        if (!theme) {
            return res.status(404).json({ message: 'Theme not found' });
        }
        
        res.json(theme);
    } catch (err) {
        console.error("Error fetching theme:", err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export default themesCltr