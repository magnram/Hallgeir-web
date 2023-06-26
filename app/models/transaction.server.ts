import moment from "moment";
import type { User} from "./user.server";
import { supabase } from "./user.server";


export interface NameAmountItem {
	id?: string
	description: string
	amount?: number
	order?: number
	active?: boolean
}

export interface Transaction extends NameAmountItem {
	amount: number
	completed?: boolean
	loading?: boolean
	account_id: string
	user_id?: string
	member_id: string | null
	date: string
	curve: boolean
}

export async function getTransactionListItems({ user_id }: { user_id: User["id"] }) {
  const { data } = await supabase
    .from("transactions")
    .select("id, description, date, amount, curve, member_id, account_id, created_at")
		.order('date', { ascending: false })
    .eq("user_id", user_id)
  return data;
}

export async function createTransactions(transactions: Transaction[], user_id: User["id"]) {
	let { data: response, error } = await supabase
		.from('transactions')
		.insert(transactions.map((item) => ({
			date: moment(item.date, "D.M.YYYY").format('YYYY-MM-DD'),
			description: item.description,
			amount: item.amount,
			curve: item.curve,
			user_id: user_id,
			account_id: item.account_id,
		})));
	if (error) {
		console.error("Error: ", error);
		return null;
	}
	console.info("Transaction created");
	return response;
}

export async function setTransactionMember(transactionId: string, member_id: string | null) {
	let { data: response, error } = await supabase
		.from('transactions')  // table name
		.update({ member_id: member_id }) // new value to update
		.match({ id: transactionId }); // condition for row(s) to update

	if (error) {
		console.error("Error: ", error);
		return null;
	}
	console.info("Transaction member set");
	return response;
}