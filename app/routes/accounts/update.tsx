import { json} from "@remix-run/node";
import { updateAndInsertAccounts } from "~/models/account.server";
import { requireUserId } from "~/session.server";
import type { ActionFunction} from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
	const userId = await requireUserId(request);
	let data = await request.json();
	
	await updateAndInsertAccounts(data.listItems, userId);

	return json({ status: "success" });
}