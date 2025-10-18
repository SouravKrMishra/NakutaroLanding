import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "../../../shared/models/User.js";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables - try multiple paths
const possiblePaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(__dirname, "../../../.env"),
  path.join(process.cwd(), ".env"),
];

let envLoaded = false;
for (const envPath of possiblePaths) {
  console.log("Trying .env at:", envPath);
  const result = dotenv.config({ path: envPath });
  if (!result.error && process.env.MONGODB_URI) {
    console.log("✅ .env loaded from:", envPath);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.error("❌ Failed to load .env file from any path");
  console.log("Current working directory:", process.cwd());
  console.log("Script directory:", __dirname);

  // Hardcode the MongoDB URI as fallback (temporarily)
  if (!process.env.MONGODB_URI) {
    console.log("⚠️  Using environment variable if available...");
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI not found. Please set it manually.");
      process.exit(1);
    }
  }
}

// Custom connectDB function that doesn't throw if env var is not set
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await connectDB();

    const adminEmail = "admin@animeindia.org";
    const adminPassword = "12345678"; // Change this to a secure password

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin user already exists. Updating power attribute...");
      existingAdmin.power = true;
      await existingAdmin.save();
      console.log("✅ Admin user updated successfully!");
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      name: "Admin User",
      companyName: "Anime India",
      phoneNumber: "9266767696",
      businessType: "E-commerce",
      industry: "Retail",
      companySize: "Small",
      address: "129C, Rajpur Khurd Extension, Chhattarpur",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110068",
      isVerified: true,
      isActive: true,
      power: true,
    });

    await adminUser.save();

    console.log("✅ Admin user created successfully!");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log("You can now login to the admin panel with these credentials.");
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run the script
createAdminUser();
