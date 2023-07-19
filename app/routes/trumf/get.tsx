import { json} from "@remix-run/node";
import { getTrumfListItems } from "~/models/trumf.server";
import type { ActionFunction} from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
	let data = await request.json();
	
	const trumfListItems = await getTrumfListItems(data.transaction_id);

	return json({ status: "success", trumfListItems });
}