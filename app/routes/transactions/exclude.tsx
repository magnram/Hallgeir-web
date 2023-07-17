import { json } from "@remix-run/node";
import { setTransactionExcluded } from "~/models/transaction.server";
import { requireUserId } from "~/session.server";


export let action = async ({ request }: any) => {
	await requireUserId(request);
  let data = await request.json();
	
	setTransactionExcluded(data.id, data.excluded);

  return json({ status: "success" });
};