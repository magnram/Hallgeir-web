import { json} from "@remix-run/node";
import { updateAndInsertMembers } from "~/models/member.server";
import { requireUserId } from "~/session.server";
import type { ActionFunction} from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
	const userId = await requireUserId(request);
	let data = await request.json();
	
	const obj = await updateAndInsertMembers(data.listItems, userId);
	return json({ status: "success", inactiveMembers: obj?.inactiveMembers });
}