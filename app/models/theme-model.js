import {Schema, model} from 'mongoose'

const themeSchema = new Schema ({
    themeTitle: { type: String, required: true },
    themeDescription: { type: String, required: true },
    isTrending: {type: Boolean, default: false},
    sectors: [{ type: Schema.Types.ObjectId, ref: 'Sector', required: true}],
    subSectors: [{ type: Schema.Types.ObjectId, ref: 'SubSector', required: false}],
    overallScore: {type: Number, default: 0},
    trendingScore: {type: Number, default: 0},
    impactScore: {type: Number, default: 0},
    predictiveMomentumScore: {type: Number, default: 0},
    trendingScoreImage: {type: String},
    impactScoreImage: {type: String},
    predictiveMomentumScoreImage: {type: String},

    generalComment: { type: String, required: false },
    

    seoData: {
        seoURL: { type: String, required: false }, 
        metaTitle: { type: String, required: false },
        metaKeyword: { type: String, required: false },
        metaDescription: { type: Boolean, default: false },
        header: {},
        footer: {},
      },
}, {timestamps: true})

const Theme = model('Theme', themeSchema)

export default Theme