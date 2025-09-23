
//signup

import { NextResponse } from "next/server";
import { login, register, logout, getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    console.log("Auth API called");

    const { action, username, password } = await req.json();
    
    if (!action || !username || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    console.log(`Action: ${action}, Username: ${username}`);

    if (action === "login") {
      console.log("Attempting login...");
      const user = await login(username, password);
      
      if (!user) {
        console.log("Login failed: Invalid credentials");
        return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
      }

      console.log("Login successful:", user);
      return NextResponse.json({ message: "Logged in successfully", user, isLoggedIn: true  });
    }

    // if (action === "register") {
    //   console.log("Attempting registration...");
    //   const newUser = await register(username, password);
      
    //   console.log("Registration successful:", newUser);
    //   return NextResponse.json({ message: "User registered successfully", newUser, isLoggedIn: true  });
    // }

    if (action === "register") {
      console.log("Attempting registration...");
      const newUser = await register(username, password);
      
      // Automatically log in the user after registration
      const user = await login(username, password);
      
      console.log("Registration and auto-login successful:", user);
      return NextResponse.json({ 
        message: "User registered successfully", 
        user: user.user, 
        isLoggedIn: true 
      });
    }

    if (action === "logout") {
      console.log("Attempting logout...");
      await logout();
      console.log("Logout successful");
      return NextResponse.json({ message: "Logged out successfully", isLoggedIn: true  });
    }

    console.log("Invalid action received:", action);
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("Auth API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log("Fetching current user...");
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      console.log("No user logged in");
      return NextResponse.json({ message: "No user logged in" }, { status: 401 });
    }

    console.log("Current user:", currentUser);
    return NextResponse.json({ message: "Current user", currentUser, isLoggedIn: !!currentUser });

  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}