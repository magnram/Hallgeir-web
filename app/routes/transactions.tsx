import type { LoaderArgs} from "@remix-run/node";
import type { NameAmountItem, Transaction} from "~/models/transaction.server";

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
import RadioButtonList, { sum } from "~/components/RadioButtonList";
import { ManageModal } from "~/components/ManagementModal";
import type { ManagementModalProps } from "~/components/ManagementModal";


interface LoaderData {
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
	const [accounts, setAccounts] = useState<Account[]>(accountListItems);
	const [members, setMembers] = useState<Member[]>(memberListItems);
	const [transactions, setTransactions] = useState<Transaction[]>(transactionListItems);
  const [selectedAccount, setSelectedAccount] = useState<string | null>("0");
  const [selectedMember, setSelectedMember] = useState<string | null>("0");
	const [modal, setModal] = useState<ManagementModalProps>();

  const handleAccountChange = (id: string) => setSelectedAccount(id);

  const handleMemberChange = (id: string) => setSelectedMember(id);

	const handleManageClick = (name: string) => {
		const listItems = name == 'kontoer' ? accounts : members;

		setModal({
			title: name,
			listItems: listItems,
			onClose: () => setModal(undefined),
			onSave: (listItems: NameAmountItem[]) => handleManageSave(name, listItems)
		});
	};

	const handleManageSave = (name: string, listItems: NameAmountItem[]) => {
		const urlPrefix = name == 'kontoer' ? 'accounts' : 'members';
		fetch(urlPrefix + '/update', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ listItems }),
		})
		.then(response => response.json())
		.then((data) => {
			setModal(undefined);
			if(data.inactiveMembers) setTransactions(transactions.map(transaction => {
				if (data.inactiveMembers.includes(transaction.member_id)) {
					transaction.member_id = null;
				}
				return transaction;
			}))

			if(name == 'kontoer') setAccounts(listItems as Account[]);
			else setMembers(listItems as Member[]);
		})
		.catch((error) => { console.error(error); });
	};

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
  
  const filteredTransactionsAccount = transactions && transactions
    .filter(transaction => selectedAccount == '0' || selectedAccount == transaction.account_id);
    
  const filteredTransactions = filteredTransactionsAccount && filteredTransactionsAccount
    .filter(transaction => selectedMember == '0' 
                        || (transaction.member_id && selectedMember == transaction.member_id.toString())
                        || (!transaction.member_id && selectedMember == (members.length + 1).toString())
    );

		const transactionsToPay = filteredTransactions && filteredTransactions
		.filter(transaction => transaction.member_id !== null)
		.filter(transaction => transaction.member_id == selectedMember || selectedMember == "0");

  return (
    <div className="flex min-h-screen flex-col mx-auto bg-gray-100">
      <Header />
			{modal && <ManageModal {...modal} />}
      <main className="flex flex-col m-2 p-2 max-w-3xl mx-auto w-full">
        <div>
          <h6 className="font-bold text-sm">Velg en konto</h6>
					<RadioButtonList 
						listItems={accounts}
						transactionItems={transactions.map(a => ({ id: a.account_id, description: a.description, amount: a.amount }))}
						onChange={handleAccountChange}
						name="kontoer"
						includeUnassigned={false}
						includeManageButton={true}
						onManageClick={handleManageClick}
					/>
        </div>
        <div className="pt-2">
          <h6 className="font-bold text-sm">Velg en person</h6>
					<RadioButtonList 
						listItems={members}
						transactionItems={filteredTransactionsAccount.map(a => ({ id: a.member_id || undefined, description: a.description, amount: a.amount }))}
						onChange={handleMemberChange}
						name="personer"
						includeUnassigned={true}
						includeManageButton={true}
						onManageClick={handleManageClick}
					/>
        </div>
				{filteredTransactions.filter(a => !a.member_id).length != 0 &&
				<div className="pt-2">
					<h6 className="font-bold text-sm"> Transaksjoner som må tildeles </h6>
					<TransactionsList 
						transactions={filteredTransactions.filter(a => !a.member_id)} 
						onMemberChange={handleTransactionMemberChange}
						members={members}
					/>
				</div>}
				{ filteredTransactions.filter(a => a.member_id).length != 0 &&
				<div className="pt-2 flex flex-col justify-center">
					<h6 className="font-bold text-sm"> Tildelte transaksjoner </h6>
					<button 
						disabled={!transactionsToPay.length}
						className="disabled:hidden bg-violet-500 hover:bg-violet-700 text-white font-bold my-2 py-2 px-4 rounded max-w-[25rem] mx-auto">
						Betal tildelte transaksjoner&nbsp;&nbsp;({sum(transactionsToPay)}&nbsp;kr)
					</button>
					<TransactionsList 
						transactions={filteredTransactions.filter(a => a.member_id)} 
						onMemberChange={handleTransactionMemberChange}
						members={members}
					/>
				</div>}
      </main>
    </div>
  );
}