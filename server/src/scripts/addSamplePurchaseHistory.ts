import mongoose from "mongoose";
import { PurchaseHistory } from "../../../shared/models/PurchaseHistory.js";
import { config } from "../config/index.js";

// Sample purchase history data
const samplePurchases = [
  {
    userId: "65f1a2b3c4d5e6f7g8h9i0j1", // Replace with actual user ID
    productId: 123,
    productName: "Naruto Uzumaki Action Figure",
    category: "Naruto",
    series: "Naruto",
    quantity: 50,
    price: 2500,
    totalAmount: 125000,
    orderDate: new Date("2024-01-15"),
    status: "delivered",
  },
  {
    userId: "65f1a2b3c4d5e6f7g8h9i0j1",
    productId: 124,
    productName: "Dragon Ball Z Goku Figure",
    category: "Dragon Ball",
    series: "Dragon Ball Z",
    quantity: 30,
    price: 3200,
    totalAmount: 96000,
    orderDate: new Date("2024-01-14"),
    status: "delivered",
  },
  {
    userId: "65f1a2b3c4d5e6f7g8h9i0j1",
    productId: 125,
    productName: "One Piece Luffy Figure",
    category: "One Piece",
    series: "One Piece",
    quantity: 40,
    price: 2800,
    totalAmount: 112000,
    orderDate: new Date("2024-01-13"),
    status: "delivered",
  },
  {
    userId: "65f1a2b3c4d5e6f7g8h9i0j1",
    productId: 126,
    productName: "Demon Slayer Tanjiro Figure",
    category: "Demon Slayer",
    series: "Demon Slayer",
    quantity: 25,
    price: 2100,
    totalAmount: 52500,
    orderDate: new Date("2024-01-12"),
    status: "delivered",
  },
  {
    userId: "65f1a2b3c4d5e6f7g8h9i0j1",
    productId: 127,
    productName: "Attack on Titan Eren Figure",
    category: "Attack on Titan",
    series: "Attack on Titan",
    quantity: 35,
    price: 3500,
    totalAmount: 122500,
    orderDate: new Date("2024-01-10"),
    status: "delivered",
  },
];

async function addSamplePurchaseHistory() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB");

    // Clear existing sample data
    await PurchaseHistory.deleteMany({});
    console.log("Cleared existing purchase history");

    // Add sample purchases
    await PurchaseHistory.insertMany(samplePurchases);
    console.log("Added sample purchase history data");

    console.log("Sample purchase history data added successfully!");
  } catch (error) {
    console.error("Error adding sample data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
addSamplePurchaseHistory();
