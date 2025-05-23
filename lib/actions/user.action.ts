"use server";

import { revalidatePath } from "next/cache";
import User from "../database/models/user.model";
import { connectToDb } from "../database/mongoose";
import { handleError } from "../utils";

export async function createUser(user: CreateUserParams) {
  try {
    await connectToDb();
    const newUser = await User.create(user);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
}
export async function getUserById(userId: string) {
  try {
    await connectToDb();
    const user = await User.findOne({ clerkId: userId });
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDb();
    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    });
    if (!updatedUser) throw new Error("User update failed");
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

export async function deleteUser(clerkId: string) {
  try {
    await connectToDb();
    const userToDelete = await User.findOne({ clerkId });
    if (!userToDelete) throw new Error("User not found");
    // delete user
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath("/");
    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
  }
}

// user credits

export async function updateCredits(userId: string, creditFee: number) {
  try {
    await connectToDb();
    const updatedUserCredits = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { creditBalance: creditFee } },
      { new: true }
    );
    if (!updatedUserCredits) throw new Error("User credits update failed");
    return JSON.parse(JSON.stringify(updatedUserCredits));
  } catch (error) {
    handleError(error);
  }
}
