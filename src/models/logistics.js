import mongoose from "mongoose";

const { Schema, model } = mongoose;

const logisticsSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },

  state: { type: String, required: true },
  localGovernment: { type: String },

  coordinates: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
  },
});

export default model("Logistics", logisticsSchema);
