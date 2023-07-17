import { json } from "@remix-run/node";
import { setPaymentCompleted } from "~/models/payment.server";
import { requireUserId } from "~/session.server";


export let action = async ({ request }: any) => {
	await requireUserId(request);
  let data = await request.json();
	
	setPaymentCompleted(data.id, data.completed);

  return json({ status: "success" });
};