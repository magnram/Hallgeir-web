import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import Header from "~/components/Header";
import type { ManagementModalProps } from "~/components/ManagementModal";
import { ManageModal } from "~/components/ManagementModal";
import PaymentCard from "~/components/PaymentCard";
import RadioButtonList from "~/components/RadioButtonList";
import PlusIcon from "~/icons/PlusIcon";
import type { Account} from "~/models/account.server";
import { getAccountListItems } from "~/models/account.server";
import type { Payment} from "~/models/payment.server";
import { getPaymentListItems } from "~/models/payment.server";
import type { NameAmountItem } from "~/models/transaction.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  paymentListItems: Payment[];
	accountListItems: Account[];
};

export async function loader ({ request }: LoaderArgs) {
  const user_id = await requireUserId(request);
  const paymentListItems = await getPaymentListItems({ user_id });
	const accountListItems = await getAccountListItems({ user_id });
  return json({ paymentListItems, accountListItems });
};

export default function PaymentsPage() {
  const data = useLoaderData<typeof loader>() as LoaderData;
	const [accounts, setAccounts] = useState<Account[]>(data.accountListItems);
	const [accountId, setAccountId] = useState<string>("0");
	const [modal, setModal] = useState<ManagementModalProps>();

	if(!data) return (<div>loading...</div>);
	if(!data.paymentListItems) return (<div>loading...</div>);

	const payments = data.paymentListItems.filter(a => accountId === "0" || a.account.id == accountId);
	
	const handleManageClick = (name: string) => {
		setModal({
			title: name,
			listItems: accounts,
			onClose: () => setModal(undefined),
			onSave: (listItems: NameAmountItem[]) => handleManageSave(listItems)
		});
	};

	const handleManageSave = (listItems: NameAmountItem[]) => {
		fetch('accounts/update', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ listItems }),
		})
		.then(response => response.json())
		.then(_ => {
			setModal(undefined);
			setAccounts(listItems as Account[]);
		})
		.catch(error => { console.error(error); });
	};

  return (
		<div className="flex flex-col mx-auto bg-gray-100">
			<Header />
			{modal && <ManageModal {...modal} />}
			<main className="flex flex-col m-2 p-2 max-w-3xl mx-auto w-full">
				<h6 className="font-bold text-sm">Velg en konto</h6>
				<RadioButtonList 
					listItems={accounts} 
					onChange={setAccountId}
					onManageClick={handleManageClick}
					name={"kontoer"} 
					includeManageButton={true}
				/> 

				<a href="/upload" className="hidden sm:block bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded mt-2 text-center w-60 m-auto">Legg til ny betaling</a>

				<h1 className="text-2xl pb-2 pt-3"> Aktive betalinger </h1>
				<div className="flex flex-col space-y-2">
					{payments.filter(a => !a.completed).map((paymentListItem) => (
						<PaymentCard key={paymentListItem.id} payment={paymentListItem} />
					))}
				</div>

				<h1 className="text-2xl pb-2 pt-3"> Fullførte betalinger </h1>
				<div className="flex flex-col space-y-2">
					{payments.filter(a => a.completed).map((paymentListItem) => (
						<PaymentCard key={paymentListItem.id} payment={paymentListItem} />
					))}
				</div>
			</main>
			<a href="/upload" className="sm:hidden block fixed right-5 bottom-5 bg-violet-500 hover:bg-violet-700 
																		text-white font-bold p-6 rounded-full w-24 h-24 text-center m-auto">
				<PlusIcon/>
			</a>
		</div>
  );
}