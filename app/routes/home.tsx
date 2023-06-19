import { Form, NavLink, useLocation, useNavigate } from "@remix-run/react";
import type { ChangeEvent, ReactNode} from "react";
import { useState } from "react";
import TransactionsList from "~/components/TransactionsList";
import { useUser } from "~/utils";

/*
type LoaderData = {
  accountListItems: Account[];
};

export async function loader ({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const accountListItems = await getAccountListItems({ userId });
  return json({ accountListItems });
};
*/

interface RadioButtonProps {
  id: number;
  name: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isChecked: boolean;
  children: ReactNode;
  disabled?: boolean;
}

const RadioButton: React.FC<RadioButtonProps> = ({ children, id, name, onChange, isChecked, disabled }) => (
  <label
    className={`${disabled ? 'bg-gray-100' : 'cursor-pointer'} flex flex-col items-center py-1 m-1 border-2 space-y-1 w-24 ${isChecked && 'border-green-500 bg-green-100'}`}
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


interface Account {
  id: number;
  name: string;
}

export interface Member {
  id: number;
  name: string;
}

export interface Transaction {
  id: number;
  name: string;
  amount: number;
  completed: boolean;
  accountId: number;
  memberId?: number;
}

const defaultTransactions: Transaction[] = [
  { id: 1, name: 'Hyre As* Bid:744426 Oslo', amount: 200, completed: false, accountId: 1 },
  { id: 2, name: 'Kiwi 364 Byporten Oslo', amount: 120, completed: false, accountId: 2 },
  { id: 3, name: 'Hyre As* Bid:744426 Oslo', amount: 1000, completed: false, accountId: 1 },
  { id: 4, name: 'Spotifyse Stockholm', amount: 150, completed: false, accountId: 1 },
  { id: 5, name: 'Uavhengig Taxi Oslo', amount: 50, completed: false, accountId: 2 },
  { id: 6, name: 'Matchi*matchi - 5657272 Goteborg', amount: 250, completed: false, accountId: 2 },
  { id: 7, name: 'Point 5013010 Stjoerdal', amount: 300, completed: false, accountId: 2 },
  { id: 8, name: 'Scandic Bystranda Fo 78 Kristiansand', amount: 75, completed: false, accountId: 1 },
  { id: 9, name: 'Kiwi 713 Markens Kristiansand S', amount: 90, completed: false, accountId: 1 },
  { id: 10, name: 'Scandic Bystranda Fo 78 Kristiansand', amount: 500, completed: false, accountId: 2 }
]; 

export default function HomePage() {
  //const data = useLoaderData<typeof loader>() as LoaderData;

  const [selectedAccount, setSelectedAccount] = useState<string | null>("0");
  const [selectedMember, setSelectedMember] = useState<string | null>("0");
  const [transactions, setTransactions] = useState(defaultTransactions);


  const accounts: Account[] = [
    { id: 1, name: 'AMEX'},
    { id: 2, name: 'DNB'}
  ];

  const members: Member[] = [
    { id: 1, name: 'Vy' },
    { id: 2, name: 'Magnus' },
    { id: 3, name: 'Felles' },
  ]; 

  const handleAccountChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedAccount(event.target.value);
  };

  const handleMemberChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedMember(event.target.value);
  };

  const handleTransactionsChange = (id: number, memberId: number) => {
    setTransactions(transactions.map((transaction) => {
      if (transaction.id === id) {
        console.log(transaction)
        if (transaction.memberId === memberId) {
          console.log("ye")
          // Create a new object without the memberId property
          const { memberId, ...rest } = transaction;
          return rest;
        } else {
          // Set the memberId
          return { ...transaction, memberId };
        }
      } else {
        return transaction;
      }
    }));
  }
  
  const filteredTransactionsAccount = transactions
    .filter(transaction => selectedAccount == '0' || selectedAccount == transaction.accountId.toString());
    
  const filteredTransactions = filteredTransactionsAccount
    .filter(transaction => selectedMember == '0' 
                        || (transaction.memberId && selectedMember == transaction.memberId.toString())
                        || (!transaction.memberId && selectedMember == (members.length + 1).toString())
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
                id={0}
                name={"account"}
                onChange={handleAccountChange}
                isChecked={selectedAccount === "0"}
              >
                <p className="text-m text-gray-600">Alle</p>
                <p className="text-m font-bold text-green-500">{transactions.reduce((partialSum, a) => partialSum + a.amount, 0)} kr</p>
              </RadioButton>
            {accounts.map((account) => {
              const amount: number = transactions.filter((a) => a.accountId == account.id && !a.completed).reduce((partialSum, a) => partialSum + a.amount, 0);
              return (
                <RadioButton
                  key={account.id}
                  id={account.id}
                  name={"account"}
                  onChange={handleAccountChange}
                  isChecked={selectedAccount === account.id.toString()}
                >
                  <p className="text-m text-gray-600">{account.name}</p>
                  <p className="text-m font-bold text-green-500">{amount} kr</p>
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
                id={0}
                disabled={!filteredTransactionsAccount.filter((a) => !a.completed).reduce((partialSum, a) => partialSum + a.amount, 0)}
                name={"member"}
                onChange={handleMemberChange}
                isChecked={selectedMember === "0"}
              >
                <p className="text-m text-gray-600"> Alle </p>
                <p className="text-m font-bold text-green-500">
                  {filteredTransactionsAccount.filter((a) => !a.completed).reduce((partialSum, a) => partialSum + a.amount, 0)} kr
                </p>
              </RadioButton>
            {members.map((member) => {
              const amount: number = filteredTransactionsAccount.filter((a) => a.memberId == member.id && !a.completed).reduce((partialSum, a) => partialSum + a.amount, 0);
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
                  <p className="text-m font-bold text-green-500">{amount} kr</p>
                </RadioButton>
              );
            })}
              <RadioButton
                key={members.length+1}
                id={members.length+1}
                name={"member"}
                disabled={!filteredTransactionsAccount.filter((a) => !a.completed && !a.memberId).reduce((partialSum, a) => partialSum + a.amount, 0)}
                onChange={handleMemberChange}
                isChecked={selectedMember === (members.length+1).toString()}
              >
                <p className="text-m text-gray-600"> ? </p>
                <p className="text-m font-bold text-green-500">
                  {filteredTransactionsAccount.filter((a) => !a.completed && !a.memberId).reduce((partialSum, a) => partialSum + a.amount, 0)} kr
                </p>
              </RadioButton>
          </div>
        </div>
        {filteredTransactions.filter(a => !a.memberId).length != 0 &&
        <div>
          <h6 className="font-bold text-xs"> Transaksjoner som må tildeles </h6>
          <TransactionsList 
            transactions={filteredTransactions.filter(a => !a.memberId)} 
            setTransactions={handleTransactionsChange}
            members={members}
          />
        </div>}
        { filteredTransactions.filter(a => a.memberId).length != 0 &&
        <div>
          <h6 className="font-bold text-xs"> Tildelte transaksjoner </h6>
          <TransactionsList 
            transactions={filteredTransactions.filter(a => a.memberId)} 
            setTransactions={handleTransactionsChange}
            members={members}
          />
        </div>
        }
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
