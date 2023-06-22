import type { LoaderArgs} from "@remix-run/node";
import type { ChangeEvent, ReactNode} from "react";
import type { Transaction} from "~/models/transaction.server";

import { useState } from "react";
import { Form, NavLink, useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import { json } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import TransactionsList from "~/components/TransactionsList";
import { getTransactionListItems } from "~/models/transaction.server";
import type { Account} from "~/models/account.server";
import { getAccountListItems } from "~/models/account.server";
import type { Member } from "~/models/member.server";
import { getMemberListItems } from "~/models/member.server";


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

interface RadioButtonProps {
  id: string;
  name: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isChecked: boolean;
  children: ReactNode;
  disabled?: boolean;
}

const RadioButton: React.FC<RadioButtonProps> = ({ children, id, name, onChange, isChecked, disabled }) => (
  <label
    className={`${disabled ? 'bg-gray-100' : 'cursor-pointer'} flex flex-col items-center p-1 m-1 border-2 space-y-1 max-w-[6rem] ${isChecked && 'border-green-500 bg-green-100'}`}
    htmlFor={name + id.toString()}
  >
    <input
      disabled={disabled}
      type="radio"
      id={name + id.toString()}
      name={name}
      value={id}
      checked={isChecked}
      onChange={onChange}
      className="hidden"
    />
    {children}
  </label>
);

export default function TransactionsPage() {
  const { transactionListItems, accountListItems, memberListItems } = useLoaderData<typeof loader>() as LoaderData;
	const [transactions, setTransactions] = useState<Transaction[]>(transactionListItems);
  const [selectedAccount, setSelectedAccount] = useState<string | null>("0");
  const [selectedMember, setSelectedMember] = useState<string | null>("0");

  const handleAccountChange = (event: ChangeEvent<HTMLInputElement>) => {
		console.log(event.target.value)
    setSelectedAccount(event.target.value);
  };

  const handleMemberChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedMember(event.target.value);
  };

	const handleTransactionMemberChange = async (id: string, member_id: string | null) => {
		setTransactions(transactions.map(transaction => {
			if (transaction.id == id) {
				transaction.member_id = member_id;
			}
			return transaction;
		}));

		fetch('/transactions/setMember', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id, member_id }),
		})
		.then(response => response.json())
		.then(_ => {})
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
    <div className="flex min-h-screen flex-col mx-auto max-w-4xl bg-white">
      <Header />
      <main className="flex flex-col bg-white m-2">
        <div>
          <h6 className="font-bold text-xs">Velg en konto</h6>
          <div className="flex overflow-x-scroll items-center">
              <RadioButton
                key={0}
                id={"0"}
                name={"account"}
                onChange={handleAccountChange}
                isChecked={selectedAccount === "0"}
              >
                <p className="text-m text-gray-600">Alle</p>
                <p className="text-m font-bold text-green-500">{Math.round(transactionListItems.reduce((partialSum, a) => partialSum + a.amount, 0)*100)/100} kr</p>
              </RadioButton>
            {accountListItems.map((account) => {
              const amount: number = transactionListItems.filter((a) => a.account_id == account.id && !a.completed).reduce((partialSum, a) => partialSum + a.amount, 0);
              return (
                <RadioButton
                  key={account.id}
                  id={account.id}
                  name="account"
                  onChange={handleAccountChange}
                  isChecked={selectedAccount === account.id.toString()}
                >
                  <p className="text-m text-gray-600">{account.name}</p>
                  <p className="text-sm font-bold text-green-500">{Math.round(amount*100)/100}&nbsp;kr</p>
                </RadioButton>
              );
            })}
            {/* <button className={`flex flex-col justify-center items-center py-1 m-1 border-2 border-slate-300 space-y-1 w-12 h-12 rounded-full text-3xl`}>
              +
            </button> */}
          </div>
        </div>
        <div>
          <h6 className="font-bold text-xs">Velg en person</h6>
          <div className="flex overflow-x-scroll">
              <RadioButton
                key={0}
                id={"0"}
                disabled={!filteredTransactionsAccount.filter((a) => !a.completed).reduce((partialSum, a) => partialSum + a.amount, 0)}
                name={"member"}
                onChange={handleMemberChange}
                isChecked={selectedMember === "0"}
              >
                <p className="text-m text-gray-600"> Alle </p>
                <p className="text-m font-bold text-green-500">
                  {Math.round(filteredTransactionsAccount.filter((a) => !a.completed).reduce((partialSum, a) => partialSum + a.amount, 0)*100)/100}&nbsp;kr
                </p>
              </RadioButton>
            {memberListItems.map((member) => {
              const amount: number = filteredTransactionsAccount.filter((a) => a.member_id == member.id && !a.completed).reduce((partialSum, a) => partialSum + a.amount, 0);
              return (
                <RadioButton
                  key={member.id}
                  id={member.id}
                  name={"member"}
                  disabled={!amount}
                  onChange={handleMemberChange}
                  isChecked={selectedMember === member.id.toString()}
                >
                  <p className="text-m text-gray-600">{member.name}</p>
                  <p className="text-m font-bold text-green-500">{Math.round(amount*100)/100}&nbsp;kr</p>
                </RadioButton>
              );
            })}
              <RadioButton
                key={memberListItems.length+1}
                id={(memberListItems.length+1).toString()}
                name={"member"}
                disabled={!filteredTransactionsAccount.filter((a) => !a.completed && !a.member_id).reduce((partialSum, a) => partialSum + a.amount, 0)}
                onChange={handleMemberChange}
                isChecked={selectedMember === (memberListItems.length+1).toString()}
              >
                <p className="text-m text-gray-600"> ? </p>
                <p className="text-m font-bold text-green-500">
                  {Math.round(filteredTransactionsAccount.filter((a) => !a.completed && !a.member_id).reduce((partialSum, a) => partialSum + a.amount, 0)*100)/100}&nbsp;kr
                </p>
              </RadioButton>
          </div>
        </div>
					{filteredTransactions.filter(a => !a.member_id).length != 0 &&
					<div>
						<h6 className="font-bold text-xs"> Transaksjoner som må tildeles </h6>
						<TransactionsList 
							transactions={filteredTransactions.filter(a => !a.member_id)} 
							onMemberChange={handleTransactionMemberChange}
							members={memberListItems}
						/>
					</div>}
					{ filteredTransactions.filter(a => a.member_id).length != 0 &&
					<div>
						<h6 className="font-bold text-xs"> Tildelte transaksjoner </h6>
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


export function Header() {
  const user = useUser();
	const navigate = useNavigate()
	const location = useLocation();
	const goBack = () => navigate(-1)
	console.log()
  return (
    <header className="flex items-center justify-between bg-violet-800 p-2 text-white">
      <p>{location.pathname === "/home" ? user.email : <button 
				onClick={goBack}
				className="flex flex-col items-center rounded bg-violet-600 py-1 px-5 text text-white hover:bg-white-500 active:bg-blue-600"
			> 
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
					<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
				</svg>
			</button>}</p>
      <div className="flex gap-4">

        
        <NavLink to="/upload">
          <button
            type="submit"
            className="flex flex-col items-center rounded bg-violet-600 py-1 px-5 text text-white hover:bg-white-500 active:bg-blue-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </button>
        </NavLink>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-violet-600 py-1 px-2 text-white hover:bg-white-500 active:bg-blue-600"
          >
            Logg ut
          </button>
        </Form>
      </div>
    </header>
  );
}
