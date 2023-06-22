import { json } from "@remix-run/node";
import { createTransactions } from "~/models/transaction.server";
import { requireUserId } from "~/session.server";


export let action = async ({ request }: any) => {
	const user_id = await requireUserId(request);
  let data = await request.json();
	
	createTransactions(data, user_id);

  return json({ status: "success" });
};