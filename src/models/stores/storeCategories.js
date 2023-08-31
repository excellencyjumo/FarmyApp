import mongoose from 'mongoose';

const storeCategorySchema = mongoose.Schema({
    userId: {
        type : String,
        required : true
    },
    name:{
        type: String
    },
    slug: {
        type: String
    }
},
{
    timestamps: true,
}
)

const StoreCategory = mongoose.model('StoreCategory', storeCategorySchema);

export default StoreCategory;