
import dbConnect from "@/lib/connectDB";
import mongoose from "mongoose";

const productCatalog = {
  "lipstick-1": {
    name: "Classic Matte Lipstick",
    price: 450,
  },
  "lipstick-2": {
    name: "Luxury Velvet Lipstick",
    price: 550,
  },
};

const OrderSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    paymentMethod: {
      type: String,
      default: "Cash on Delivery",
    },
    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order =
  mongoose.models.LipstickOrder ||
  mongoose.model("LipstickOrder", OrderSchema);

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      productId,
      name,
      phone,
      address,
      quantity,
    } = body;

    const product = productCatalog[productId];
    const qty = Number(quantity);

    if (!product) {
      return Response.json(
        { success: false, message: "Invalid product" },
        { status: 400 }
      );
    }

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 100 ||
      typeof address !== "string" ||
      !address.trim() ||
      address.trim().length > 500 ||
      typeof phone !== "string" ||
      !/^01\d{9}$/.test(phone.trim()) ||
      !Number.isInteger(qty) ||
      qty < 1 ||
      qty > 20
    ) {
      return Response.json(
        { success: false, message: "Invalid order details" },
        { status: 400 }
      );
    }

    await dbConnect();

    const order = await Order.create({
      productId,
      productName: product.name,
      price: product.price,
      quantity: qty,
      totalPrice: product.price * qty,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });

    return Response.json(
      {
        success: true,
        message: "Order placed successfully",
        orderId: order._id.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to place order",
      },
      { status: 500 }
    );
  }
}
