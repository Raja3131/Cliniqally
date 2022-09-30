import mongoose from "mongoose";

const { Schema } = mongoose;
const PrivateNotesSchema = new Schema(
  {
    provider_id: {
      type: String,
    },
    note_id: {
      type: String,
    },
    note: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: String,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: String,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: String,
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "privateNotes",
  }
);

const PrivateNotes = mongoose.model("privateNotes", PrivateNotesSchema);
export default PrivateNotes;
