
import { hash, compare } from "bcryptjs";
import { UserModel } from "@/models/User";
import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";
import { connectToDB } from "./db";

interface SessionData {
  user?: {
    id: string;
    username: string;
  };
}

const sessionOptions = {
  cookieName: "pixie-talk-session",
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession() {
  await connectToDB();
  const cookieStore = await cookies();
  return await getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function register(username: string, password: string) {
  await connectToDB();

  const existingUser = await UserModel.findOne({ username });
  if (existingUser) {
    throw new Error("Username already exists");
  }

  const hashedPassword = await hash(password, 10);
  const newUser = new UserModel({ username, password: hashedPassword });

  await newUser.save();
  // return newUser;

  // Create and return session immediately after registration
  const session = await getSession();
  session.user = { id: newUser._id.toString(), username: newUser.username };
  await session.save();

  return { user: session.user };
}

export async function login(username: string, password: string) {
  await connectToDB();

  const user = await UserModel.findOne({ username });
  if (!user) {
    throw new Error("User not found");
  }

  const isValid = await compare(password, user.password);
  if (!isValid) {
    throw new Error("Invalid username or password");
  }

  const session = await getSession();
  session.user = { id: user._id.toString(), username: user.username };
  await session.save();

  return { message: "Login successful", user: session.user };
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  return { message: "Logged out successfully" };
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session.user) return null;

  await connectToDB();
  return await UserModel.findById(session.user.id);
}