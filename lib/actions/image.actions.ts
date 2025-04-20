"use server";

import { v2 as cloudinary } from "cloudinary";
import { Document, Query } from "mongoose";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Image, { IImage } from "../database/models/image.model";
import User from "../database/models/user.model";
import { connectToDb } from "../database/mongoose";
import { handleError } from "../utils";
interface CloudinaryResource {
  public_id: string;
}
interface GetAllImagesResult {
  data: IImage[];
  totalPage: number;
  savedImages: number;
}
const populateUser = <T extends Document>(query: Query<T, T>) =>
  query.populate({
    path: "author",
    model: User,
    select: "_id firstName lastName clerkId",
  });

//  Add image
export async function addImage({ image, userId, path }: AddImageParams) {
  try {
    await connectToDb();
    const author = await User.findById(userId);
    if (!author) {
      throw new Error("User not found");
    }
    const newImage = await Image.create({
      ...image,
      author: author._id,
    });
    revalidatePath(path);
    return JSON.parse(JSON.stringify(newImage));
  } catch (error) {
    handleError(error);
  }
}
//  update image
export async function updateImage({ image, userId, path }: UpdateImageParams) {
  try {
    await connectToDb();
    const imageToUpdate = await Image.findById(image._id);
    if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId) {
      throw new Error("Unauthorized or image not found");
    }
    const updatedImage = await Image.findByIdAndUpdate(
      imageToUpdate._id,
      image,
      { new: true }
    );
    revalidatePath(path);
    return JSON.parse(JSON.stringify(updatedImage));
  } catch (error) {
    handleError(error);
  }
}
//  delete image
export async function deleteImage(imageId: string) {
  try {
    await connectToDb();
    await Image.findByIdAndDelete(imageId);
  } catch (error) {
    handleError(error);
  } finally {
    redirect("/");
  }
}

// get image
export async function getImageByIdI(imageId: string) {
  try {
    await connectToDb();
    const image = await populateUser(Image.findById(imageId));
    if (!image) throw new Error("Image not found");

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    handleError(error);
  }
}
// get All Image
export async function getAllImages({
  limit = 9,
  page = 1,
  searchQuery = "",
}: {
  limit?: number;
  page: number;
  searchQuery?: string;
}): Promise<GetAllImagesResult | undefined> {
  try {
    await connectToDb();

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    let expression = "folder=imaginify";

    if (searchQuery) {
      expression += ` AND ${searchQuery}`;
    }

    const { resources }: { resources: CloudinaryResource[] } =
      await cloudinary.search.expression(expression).execute();

    const resourceIds = resources.map(
      (resource: CloudinaryResource) => resource.public_id
    );

    let query = {};

    if (searchQuery) {
      query = {
        publicId: {
          $in: resourceIds,
        },
      };
    }

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find(query))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find(query).countDocuments();
    const savedImages = await Image.find().countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPage: Math.ceil(totalImages / limit),
      savedImages,
    };
  } catch (error) {
    handleError(error);
    return undefined;
  }
}
export async function getUserImages({
  limit = 9,
  page = 1,
  userId,
}: {
  limit?: number;
  page: number;
  userId: string;
}) {
  try {
    await connectToDb();
    const skipAmount = (Number(page) - 1) * limit;
    const images = await populateUser(Image.find({ author: userId }))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);
    const totalImages = await Image.find({ author: userId }).countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    handleError(error);
  }
}
