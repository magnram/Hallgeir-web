import type { ChangeEvent } from 'react';
import type { Member, Transaction } from '~/routes/home';

interface TransactionCardProps extends Transaction {
  onMemberChange: (id: number, memberId: number) => void;
  members: Member[];
}

const TransactionCard: React.FC<TransactionCardProps> = ({ id, name, amount, completed, memberId, onMemberChange, members }) => {

  const handleMemberChange = (event: ChangeEvent<HTMLInputElement>) => {
    onMemberChange(id, Number(event.target.value));
  };

  const handleMemberClick = (event: React.MouseEvent<HTMLInputElement>) => {
    const value = Number((event.target as any).value)
    if(value == memberId) onMemberChange(id, Number(event.target))
  }

  return (
    <div className={`m-2 p-1 rounded-md ${completed ? 'bg-green-100' : 'bg-gray-100'}`}>
      <div className="p-2 flex place-content-between">
        <h3 className="text-lg">{name}</h3>
        <p className="text-lg font-bold">{amount}&nbsp;kr</p>
      </div>
      <div className="flex justify-between">
        {members.map((member) => (
          <label key={member.id} htmlFor={`${id}-${member.id}`} className={`border-x-2 border-b-2 border-gray-100 cursor-pointer w-full p-3 ${memberId === member.id ? 'bg-violet-200' : 'bg-white'}`}>
            <input
              type="radio"
              id={`${id}-${member.id}`}
              name={`member-${id}`}
              value={member.id}
              checked={memberId === member.id}
              onChange={handleMemberChange}
              onClick={handleMemberClick}
              className="hidden"
            />
            <span>
              {member.name}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

interface TransactionListProps {
    transactions: Transaction[];
    setTransactions: (id: number, memberId: number) => void;
    members: Member[];
}

const TransactionsList = ({ transactions, setTransactions, members }: TransactionListProps) => {

  const handleMemberChange = (id: number, memberId: number) => {
    setTransactions(id, memberId);
  };

  return (
    <div>
      {transactions.map((transaction) => (
        <TransactionCard key={transaction.id} {...transaction} onMemberChange={handleMemberChange} members={members} />
      ))}
    </div>
  );
};

export default TransactionsList;
