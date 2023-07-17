import { supabase } from "./user.server";
import type { User } from "./user.server";
import type { Transaction} from "./transaction.server";
import { createTransactions } from "./transaction.server";
import type { Account } from "./account.server";

export interface Payment {
	id?: string
	name: string
	completed: boolean
	created_at: string
	account: Account
	transactions?: Transaction[]
}

export async function getPaymentListItems({ user_id }: { user_id: User["id"] }) {
  const { data, error } = await supabase
    .from("payments")
    .select("id, name, completed, created_at, transactions(amount, excluded), account:accounts(id, description)")
		.order('created_at', { ascending: false })
    .eq("user_id", user_id)

	if (error) {
		console.error("Error: ", error);
		return [];	
	}
  return data;
}

export async function getPaymentNames({ user_id }: { user_id: User["id"] }) {
  const { data, error } = await supabase
    .from("payments")
    .select("name, account_id")
		.order('created_at', { ascending: false })
    .eq("user_id", user_id)

	if (error) {
		console.error("Error: ", error);
		return [];	
	}
  return data;
}

export async function getPayment({ user_id, payment_id }: { user_id: User["id"], payment_id: string }) {
	const { data, error } = await supabase
		.from("payments")
		.select("id, name, completed, created_at, transactions(*), account:accounts(description)")
		.eq("id", payment_id)
		.eq("user_id", user_id)
		.order("date", { foreignTable: 'transactions', ascending: false })
		.single();
	
	if (error) {
		console.error("Error: ", error);
		return null;	
	}
	return data;
}

export async function createPayment(payment: Payment, user_id: User["id"], transactions?: Transaction[]) {
	let { data: response, error } = await supabase
		.from('payments')
		.insert({
			name: payment.name,
			completed: payment.completed,
			account_id: payment.account.id,
			user_id: user_id
		});
	if (error) {
		console.error("Error: ", error);
		return null;
	}

	if(transactions) {
		createTransactions(transactions, user_id, response![0].id);	
	}
	console.info("Payment created");
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

export async function setPaymentCompleted(paymentId: string, completed: boolean) {
	let { data: response, error } = await supabase
		.from('payments')  // table name
		.update({ completed: completed }) // new value to update
		.match({ id: paymentId }); // condition for row(s) to update

	if (error) {
		console.error("Error: ", error);
		return null;
	}
	return response;
}