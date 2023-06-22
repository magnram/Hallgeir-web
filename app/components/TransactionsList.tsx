import type { Member } from '~/models/member.server';

import TransactionCard from './TransactionCard';
import type { Transaction } from '~/models/transaction.server';

interface TransactionListProps {
    transactions: Transaction[];
		onMemberChange: (id: string, memberId: string | null) => void;
    members: Member[];
}

const TransactionsList = ({ transactions, members, onMemberChange }: TransactionListProps) => (
	<div>
		{transactions.map((transaction) => (
			<TransactionCard key={transaction.id} {...transaction} members={members} onMemberChange={onMemberChange}   />
		))}
	</div>
);

export default TransactionsList;
