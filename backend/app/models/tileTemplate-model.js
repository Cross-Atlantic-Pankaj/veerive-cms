import { Schema, model } from 'mongoose';

const tileTemplateSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    type: {
        type: String,
        required: true
    },
    jsxCode: {
        type: String,
        required: true
    },
    backgroundColor: {
        type: String
    },
    iconName: {
        type: String
    }
}, { timestamps: true });

const TileTemplate = model('TileTemplate', tileTemplateSchema);

export default TileTemplate; 