import { Schema, model } from "mongoose";

// Sellers wallets
const sellerSchema = new Schema({
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'Store', // Reference to the seller model
    },
    balance: {
        type: Number,
        default: 0, // Initial balance is set to 0
    },
});

// Logistics Wallet
const logisticsSchema = new Schema({
    logistics: {
        type: Schema.Types.ObjectId,
        ref: 'Logistics', // Reference to the logistics model
    },
    balance: {
        type: Number,
        default: 0, // Initial balance is set to 0
    },
});

const SellersWallet = model('SellersWallet', sellerSchema);
const LogisticsWallet = model('LogisticsWallet', logisticsSchema);

export { SellersWallet, LogisticsWallet };
