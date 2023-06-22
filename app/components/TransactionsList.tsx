import type { ChangeEvent} from 'react';
import type { Member } from '~/models/member.server';
import type { Transaction } from '~/models/transaction.server';

interface TransactionCardProps extends Transaction {
  members: Member[];
	onMemberChange: (id: string, memberId: string | null) => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ id, description, amount, completed, member_id, loading, members, onMemberChange }) => {
	if(!id) return null;

  const handleMemberChange = (event: ChangeEvent<HTMLInputElement> | null) => {
    onMemberChange(id, event?.target.value || null);
  };

  const handleMemberClick = (event: React.MouseEvent<HTMLInputElement>) => {
    if((event.target as any).value == member_id) handleMemberChange(null);
  }

	return (
    <div className={`m-2 p-1 rounded-md ${completed ? 'bg-green-100' : 'bg-gray-100'}`}>
      <div className="p-2 flex place-content-between">
        <h3 className="text-lg">{description}</h3>
        <p className="text-lg font-bold">{amount}&nbsp;kr</p>
      </div>
      <div className="flex justify-between">
        {members.map((member) => (
          <label key={member.id} htmlFor={`${id}-${member.id}`} className={`border-x-2 border-b-2 border-gray-100 cursor-pointer w-full p-3 ${member_id === member.id ? 'bg-violet-200' : 'bg-white'}`}>
            <input
              type="radio"
              id={`${id}-${member.id}`}
              name={`member-${id}`}
              value={member.id}
              checked={member_id === member.id}
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
			{loading && 
			<div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
				<div className="aspect-content animate-slide bg-blue-500 h-full"></div>
			</div>}
    </div>
  );
};

interface TransactionListProps {
    transactions: Transaction[];
		onMemberChange: (id: string, memberId: string | null) => void;
    members: Member[];
}

const TransactionsList = ({ transactions, members, onMemberChange }: TransactionListProps) => {

  return (
    <div>
      {transactions.map((transaction) => (
        <TransactionCard key={transaction.id} {...transaction} members={members} onMemberChange={onMemberChange}   />
      ))}
    </div>
  );
};

export default TransactionsList;
