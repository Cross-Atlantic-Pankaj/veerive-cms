import Theme from '../models/theme-model.js'
const themesCltr = {}

themesCltr.list = async (req, res) => {
    try{
        const allThemes = await Theme.find({})
        res.json(allThemes)
        console.log(allThemes)
    } catch(err) {
        console.log(err)
        res.json(err)
    }
    
} 

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

export default themesCltr