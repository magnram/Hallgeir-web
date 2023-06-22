import type { ActionFunction} from "@remix-run/node";
import { json } from "@remix-run/node";
import { setTransactionMember } from "~/models/transaction.server";

export const action: ActionFunction = async ({ request }) => {
	console.log(request);
  let data = await request.json();
	
  await setTransactionMember(data.id, data.member_id);

	return json({ status: "success" });
};