
import dbConnect from "@/lib/connectDB";
import Order from "@/models/Order";

const productCatalog = {
  "lipstick-1": {
    name: "Makup Rich Lipstick Set",
    price: 500,
  },
  "lipstick-2": {
    name: "Luxury Lipstick Set",
    price: 550,
  },
};

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

    // Validate product
    const product =
      typeof productId === "string" &&
      Object.prototype.hasOwnProperty.call(
        productCatalog,
        productId
      )
        ? productCatalog[productId]
        : null;

    if (!product) {
      return Response.json(
        {
          success: false,
          message: "Invalid product selected",
        },
        { status: 400 }
      );
    }

    const qty = Number(quantity);

    // Validate customer details
    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 100 ||
      typeof phone !== "string" ||
      !/^01\d{9}$/.test(phone.trim()) ||
      typeof address !== "string" ||
      !address.trim() ||
      address.trim().length > 500 ||
      !Number.isInteger(qty) ||
      qty < 1 ||
      qty > 20
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid order details",
        },
        { status: 400 }
      );
    }

    // Connect MongoDB
    await dbConnect();

    const totalPrice = product.price * qty;

    // Save order
    const order = await Order.create({
      productId,
      productName: product.name,
      price: product.price,
      quantity: qty,
      totalPrice,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      paymentMethod: "Cash on Delivery",
      status: "pending",
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
    // Show actual error in terminal
    console.error("ORDER SAVE ERROR:", error);

    return Response.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Failed to place order",
      },
      { status: 500 }
    );
  }
}
