import type { LoaderArgs} from "@remix-run/node";
import type { ChangeEvent} from "react";
import type { Transaction} from "~/models/transaction.server";

import { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import TransactionsList from "~/components/TransactionsList";
import { getTransactionListItems } from "~/models/transaction.server";
import type { Account} from "~/models/account.server";
import { getAccountListItems } from "~/models/account.server";
import type { Member } from "~/models/member.server";
import { getMemberListItems } from "~/models/member.server";
import Header from "~/components/Header";
import RadioButton from "~/components/RadioButton";
import RadioButtonList from "~/components/RadioButtonList";


type LoaderData = {
  transactionListItems: Transaction[];
	accountListItems: Account[];
	memberListItems: Member[];
};

export async function loader ({ request }: LoaderArgs) {
  const user_id = await requireUserId(request);
  const transactionListItems = await getTransactionListItems({ user_id });
	const accountListItems = await getAccountListItems({ user_id });
	const memberListItems = await getMemberListItems({ user_id });

	return json({ transactionListItems, accountListItems, memberListItems });
};

export default function TransactionsPage() {
  const { transactionListItems, accountListItems, memberListItems } = useLoaderData<typeof loader>() as LoaderData;
	const [transactions, setTransactions] = useState<Transaction[]>(transactionListItems);
  const [selectedAccount, setSelectedAccount] = useState<string | null>("0");
  const [selectedMember, setSelectedMember] = useState<string | null>("0");

  const handleAccountChange = (id: string) => setSelectedAccount(id);

  const handleMemberChange = (id: string) => setSelectedMember(id);

	const handleTransactionMemberChange = async (id: string, member_id: string | null) => {
		setTransactions(transactions.map(transaction => {
			if (transaction.id == id) {
				transaction.loading = true;
			}
			return transaction;
		}));
		fetch('/transactions/setMember', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id, member_id }),
		})
		.then(response => response.json())
		.then(_ => {
			setTransactions(transactions.map(transaction => {
				if (transaction.id == id) {
					transaction.member_id = member_id;
					transaction.loading = undefined;
				}
				return transaction;
			}));
		})
		.catch((error) => { console.error('Error:', error) });
	};
  
  const filteredTransactionsAccount = transactions
    .filter(transaction => selectedAccount == '0' || selectedAccount == transaction.account_id);
    
  const filteredTransactions = filteredTransactionsAccount
    .filter(transaction => selectedMember == '0' 
                        || (transaction.member_id && selectedMember == transaction.member_id.toString())
                        || (!transaction.member_id && selectedMember == (memberListItems.length + 1).toString())
    );

  return (
    <div className="flex min-h-screen flex-col mx-auto bg-gray-100">
      <Header />
      <main className="flex flex-col m-2 p-2 max-w-3xl m-auto w-full">
        <div>
          <h6 className="font-bold text-sm">Velg en konto</h6>
          <RadioButtonList 
						listItems={accountListItems}
						transactionItems={transactions.map(a => ({ id: a.account_id, description: a.description, amount: a.amount }))}
						onChange={handleAccountChange}
						name="account"
						includeUnassigned={false}
					/>
        </div>
        <div className="pt-2">
          <h6 className="font-bold text-sm">Velg en person</h6>
					<RadioButtonList 
						listItems={memberListItems}
						transactionItems={filteredTransactionsAccount.map(a => ({ id: a.member_id || undefined, description: a.description, amount: a.amount }))}
						onChange={handleMemberChange}
						name="member"
						includeUnassigned={true}
					/>
        </div>
					{filteredTransactions.filter(a => !a.member_id).length != 0 &&
					<div className="pt-2">
						<h6 className="font-bold text-sm"> Transaksjoner som må tildeles </h6>
						<TransactionsList 
							transactions={filteredTransactions.filter(a => !a.member_id)} 
							onMemberChange={handleTransactionMemberChange}
							members={memberListItems}
						/>
					</div>}
					{ filteredTransactions.filter(a => a.member_id).length != 0 &&
					<div className="pt-2">
						<h6 className="font-bold text-sm"> Tildelte transaksjoner </h6>
						<TransactionsList 
							transactions={filteredTransactions.filter(a => a.member_id)} 
							onMemberChange={handleTransactionMemberChange}
							members={memberListItems}
						/>
					</div>}
      </main>
    </div>
  );
}
