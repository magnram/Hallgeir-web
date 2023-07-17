import type { Member } from '~/models/member.server';

import TransactionCard from './TransactionCard';
import type { Transaction } from '~/models/transaction.server';

interface TransactionListProps {
    transactions: Transaction[];
		onMemberChange: (id: string, memberId: string | null) => void;
		onExcludedChange: (id: string, excluded: boolean) => void;
    members: Member[];
}

const TransactionsList = ({ transactions, members, onMemberChange, onExcludedChange }: TransactionListProps) => (
	<div>
		{transactions.map((transaction) => (
			<TransactionCard key={transaction.id} {...transaction} members={members} onMemberChange={onMemberChange} onExcludedChange={onExcludedChange} />
		))}
	</div>
);

export default TransactionsList;
