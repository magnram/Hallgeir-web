import { useState } from "react";
import invariant from "tiny-invariant";
import type { LoaderArgs} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import Header from "~/components/Header";
import TransactionsList from "~/components/TransactionsList";
import RadioButtonList from "~/components/RadioButtonList";
import { ManageModal } from "~/components/ManagementModal";
import { requireUserId } from "~/session.server";
import { getPayment } from "~/models/payment.server";
import { getMemberListItems } from "~/models/member.server";

import type { Payment } from "~/models/payment.server";
import type { Member } from "~/models/member.server";
import type { NameAmountItem, Transaction} from "~/models/transaction.server";
import type { ManagementModalProps } from "~/components/ManagementModal";

interface LoaderData {
  payment: Payment;
	memberListItems: Member[];
};

export async function loader ({ request, params }: LoaderArgs) {
  const user_id = await requireUserId(request);
	invariant(params.paymentId, "paymentId not found");
	
  const payment = await getPayment({ user_id, payment_id: params.paymentId });
	const memberListItems = await getMemberListItems({ user_id });

	return json({ payment, memberListItems });
};

export default function PaymentDetailsPage() {
  const { payment, memberListItems } = useLoaderData<typeof loader>() as LoaderData;
	const [members, setMembers] = useState<Member[]>(memberListItems);
	const [paymentCompleted, setPaymentCompleted] = useState(payment && payment.completed);
	const [transactions, setTransactions] = useState<Transaction[]>(payment && payment.transactions!);
  const [selectedMember, setSelectedMember] = useState<string | null>("0");
	const [modal, setModal] = useState<ManagementModalProps>();

	const includedTransactions = transactions && transactions.filter(transaction => transaction.excluded === false)
	const excludedTransactions = transactions && transactions.filter(transaction => transaction.excluded === true && (selectedMember == '0' || selectedMember ==(members.length+1).toString()) )
	
  const handleMemberChange = (id: string) => setSelectedMember(id);

	const handleManageClick = (name: string) => {
		setModal({
			title: name,
			listItems: members,
			onClose: () => setModal(undefined),
			onSave: (listItems: NameAmountItem[]) => handleManageSave(listItems)
		});
	};

	const handleManageSave = (listItems: NameAmountItem[]) => {
		fetch('/members/update', {
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

			setMembers(listItems as Member[]);
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
		fetch('/payments/setMember', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id, member_id }),
		})
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

	const handleTransactionExcluded = (id: string, excluded: boolean) => {
		setTransactions(transactions.map(transaction => {
			if (transaction.id == id) {
				transaction.loading = true;
			}
			return transaction;
		}));
		fetch('/transactions/exclude', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id, excluded: excluded }),
		})
		.then(_ => setTransactions(transactions.map(transaction => {
			if (transaction.id == id) {
				transaction.excluded = excluded;
				transaction.loading = undefined;
			}
			return transaction;
		})))
	}

	const handlePaymentCompleted = (completed: boolean) => {
		fetch('/payments/complete', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: payment.id, completed: completed }),
		})
		.then(_ => setPaymentCompleted(completed))
	}
    
  const filteredTransactions = includedTransactions.filter(transaction => selectedMember == '0' 
                        || (transaction.member_id && selectedMember == transaction.member_id.toString())
                        || (!transaction.member_id && selectedMember == (members.length + 1).toString())
    );

		const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

  return (
    <div className="flex min-h-screen flex-col mx-auto bg-gray-100">
      <Header showBackButton showLogoutButton={false} headerText={`Betaling lastet opp ${new Date(payment.created_at).toLocaleDateString("no-NO", dateOptions)}`}/>
			{modal && <ManageModal {...modal} />}
      <main className="flex flex-col m-2 p-2 max-w-3xl mx-auto w-full">
				<div className="pb-4 flex flex-col gap-3 items-center">
					<div className="flex gap-5 items-center">
						<h1 className="text-2xl font-bold">{payment.name} ({payment.account.description})</h1>
					</div>
					<div className="flex gap-4 items-center">
						<button 
							onClick={() => handlePaymentCompleted(true)}
							disabled={paymentCompleted}
							className="disabled:bg-transparent disabled:text-green-700 bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded max-w-[25rem]">
							{paymentCompleted ? "Betaling er fullført" : "Marker betaling som fullført"}
						</button>
						{paymentCompleted &&
							<button 
								onClick={() => handlePaymentCompleted(false)}
								className="disabled:hidden text-sm underline py-2 rounded text-gray-500">
									Gjenåpne betaling
							</button>
						}
						<button 
							onClick={() => {}}
							className="disabled:hidden text-sm underline py-2 rounded text-gray-600">
								Rediger
						</button>
					</div>
				</div>
        <div>
          <h6 className="font-bold text-sm">Velg en person</h6>
					<RadioButtonList 
						listItems={members}
						transactionItems={includedTransactions.map(a => ({ id: a.member_id || undefined, description: a.description, amount: a.amount }))}
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
						onExcludedChange={handleTransactionExcluded}
						members={members}
					/>
				</div>}
				{ filteredTransactions.filter(a => a.member_id).length != 0 &&
				<div className="pt-2 flex flex-col justify-center">
					<h6 className="font-bold text-sm"> Tildelte transaksjoner </h6>
					<TransactionsList 
						transactions={filteredTransactions.filter(a => a.member_id)} 
						onMemberChange={handleTransactionMemberChange}
						onExcludedChange={handleTransactionExcluded}
						members={members}
					/>
				</div>}
				{ excludedTransactions.length != 0 &&
				<div className="pt-2 flex flex-col justify-center">
					<h6 className="font-bold text-sm"> Ekskluderte transaksjoner </h6>
					<TransactionsList 
						transactions={excludedTransactions} 
						onMemberChange={() => {}}
						onExcludedChange={handleTransactionExcluded}
						members={[]}
					/>
				</div>}
      </main>
    </div>
  );
}