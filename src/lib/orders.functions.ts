import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createOrder, fetchOrder, fetchOrders, lookupOrder } from "./orders.server";

const code = z.string().trim().min(4).max(24).regex(/^[A-Za-z0-9-]+$/);

const placeOrderSchema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().min(1).max(60),
        pack: z.enum(["starter", "colony", "breeder"]),
        qty: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(30),
  country: z.enum(["US", "CA", "GB", "DE", "NL", "FR", "ES", "IT", "JP"]),
  zip: z.string().trim().min(3).max(12),
  currency: z.enum(["USD", "EUR", "GBP", "JPY"]),
  customerName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30),
  addressLine: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(100),
  paymentMethod: z.enum(["card", "apple_pay"]),
  lagAgreed: z.literal(true),
});

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => placeOrderSchema.parse(d))
  .handler(async ({ data }) => createOrder(data));

export const getOrder = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ orderNumber: code }).parse(d))
  .handler(async ({ data }) => fetchOrder(data.orderNumber.toUpperCase()));

export const getOrders = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ orderNumbers: z.array(code).max(50) }).parse(d))
  .handler(async ({ data }) => fetchOrders(data.orderNumbers));

export const findOrder = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ query: code }).parse(d))
  .handler(async ({ data }) => lookupOrder(data.query));
