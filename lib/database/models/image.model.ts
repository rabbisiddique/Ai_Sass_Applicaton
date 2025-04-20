import { model, models, Schema } from "mongoose";

export interface IImage extends Document {
  _id: string;
  title: string;
  transformationType: TransformationTypeKey;
  publicId: string;
  secureURL: string;
  width?: number;
  height?: number;
  config?: Record<string, unknown>;
  transformationURL?: string;
  aspectRatio?: string;
  color?: string;
  prompt?: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    clerkId: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const ImageSchema = new Schema<IImage>({
  title: { type: String, required: true },
  transformationType: {
    type: String,
    required: true,
    enum: ["restore", "fill", "remove", "recolor", "removeBackground"],
  },
  publicId: { type: String, required: true },
  secureURL: { type: String, required: true },
  width: { type: Number },
  height: { type: Number },
  config: { type: Object },
  transformationURL: { type: String },
  aspectRatio: { type: String },
  color: { type: String },
  prompt: { type: String },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Image = models.Image || model<IImage>("Image", ImageSchema);

export default Image;
