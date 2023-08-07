import { getTransactionListItems } from "./transaction.server";
import { supabase } from "./user.server";

export interface Trumf {
	id: string
	transaction_id: string
	description: string
	qty: number
	amount: number
	unit_type: string
	bonus_percent: number
	created_at: string
}

function sameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

export async function getTrumfListItems(transaction_id: string) {
  const { data } = await supabase
    .from("trumf")
    .select("id, description, qty, amount, unit_type, bonus_percent")
		.eq("transaction_id", transaction_id);
  return data;
}

export async function uploadTrumf({ user_id, token }: { user_id: string, token: string}) {
	const trumfTransactionsUrl = "https://platform-rest-prod.ngdata.no/trumf/medlemskap/transaksjoner";

	const trumfResponse = await fetch(trumfTransactionsUrl, {
		method: "GET",
		headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});
	const trumfTransactions = await trumfResponse.json();

	if (trumfTransactions.code && trumfTransactions.code == 401) {
		console.error("Error: ", trumfTransactions.message);
		return null;
	}

	const databaseTransactions = await getTransactionListItems({ user_id: user_id });
	
	const matchingTransactions = databaseTransactions && trumfTransactions && trumfTransactions.filter((trumfTransaction: any) => {
		const databaseTransaction = databaseTransactions.find((databaseTransaction) => {
			return !databaseTransaction.trumf_bonus && Math.abs(databaseTransaction.amount-trumfTransaction.belop) < 0.1  && sameDay(new Date(databaseTransaction.date), new Date(trumfTransaction.transaksjonsTidspunkt));
		});
		if (databaseTransaction) {
			trumfTransaction.transaction_id = databaseTransaction.id;
			return true;
		}
		return false;
	});

	console.log("matching transactions", matchingTransactions.length)

	const trumfReceiptsUrl = "https://platform-rest-prod.ngdata.no/trumf/medlemskap/transaksjoner/digitalkvittering?";
	
	let receiptElementCount = 0;
	matchingTransactions.forEach(async (transaction: any) => {
		const trumfReceiptsResponse = await fetch(trumfReceiptsUrl + new URLSearchParams({
			batchId: transaction.batchId,
		}), {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
		const trumfReceipts = await trumfReceiptsResponse.json();

		if (trumfReceipts.code && trumfReceipts.code == 401) {
			console.error("Error: ", trumfReceipts.message);
			return null;
		}

		receiptElementCount += trumfReceipts.varelinjer.length;

		const { data: response, error } = await supabase
		.from('trumf')
		.insert(trumfReceipts.varelinjer.map((item: any) => ({
			transaction_id: transaction.transaction_id,
			description: item.produktBeskrivelse,
			qty: item.antall,
			amount: item.belop,
			unit_type: item.enhetsType,
			bonus_percent: item.bonusProsent,
			ean: item.ean,
			})));
		if (error) {
			console.error("Error: ", error);
			return null;
		}

		console.log("trumf receipt elements inserted", trumfReceipts.varelinjer.length)
		const { data, error: err } = await supabase.from('transactions')
			.update({ trumf_bonus: transaction.bonus })
			.eq("id", transaction.transaction_id)
			.single();
		if (err) {
			console.error("Error: ", err);
			return null;
		}
		console.log("Updated transaction with bonus", data.id, data.trumf_bonus)

	});
	return {transactionCount: matchingTransactions.length as number, receiptElementCount: receiptElementCount}

}