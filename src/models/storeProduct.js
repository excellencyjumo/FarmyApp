import { Schema, model  } from "mongoose";
import StoreProduct from "./stores/storeProductModel";

const storeProductSchema = new Schema({
    name: {
           type: String, 
           required: true
        },
    description: {
         type: String
    },
    price: {
     type: Number,
     required: true
    },
    state:{
          type: String,
          required: true
       },
    localGovernment: {
        type: String,
    },
    coordinates: {
      type: {
        type: String,
        enum: [ 'Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
    },
   
});
export default model (StoreProduct, storeProductSchema);