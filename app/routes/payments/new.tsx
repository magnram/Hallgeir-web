import { json } from "@remix-run/node";
import { createPayment } from "~/models/payment.server";
import { requireUserId } from "~/session.server";


export let action = async ({ request }: any) => {
	const user_id = await requireUserId(request);
  let data = await request.json();
	
	createPayment(data.payment, user_id, data.transactions);

  return json({ status: "success" });
};