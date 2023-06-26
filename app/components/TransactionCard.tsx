import moment from 'moment';
import type { ChangeEvent} from 'react';
import type { Member } from '~/models/member.server';
import type { Transaction } from '~/models/transaction.server';
import { capitalizeFirstLetterOfEachWord } from '~/utils';
import dnbIcon from "../../public/dnb.png";
import amexIcon from "../../public/amex.png";
import curveIcon from "../../public/curve.jpeg";


interface TransactionCardProps extends Transaction {
  members: Member[];
	onMemberChange: (id: string, memberId: string | null) => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ id, description, amount, date, completed, member_id, account_id, curve, loading, members, onMemberChange }) => {
	if(!id) return null;

  const handleMemberChange = (event: ChangeEvent<HTMLInputElement> | null) => {
    onMemberChange(id, event?.target.value || null);
  };

  const handleMemberClick = (event: React.MouseEvent<HTMLInputElement>) => {
    if((event.target as any).value == member_id) handleMemberChange(null);
  }

	const loadingBar = loading && (
	<div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
		<div className="aspect-content animate-slide bg-violet-500 h-full"></div>
	</div>
	);

	const formatDescription = (description: string): string => {
		let temp = capitalizeFirstLetterOfEachWord(description);
		const descAndLocation: string[] = temp.split(/\s\s+/g);
		temp = descAndLocation[0];
		const location = descAndLocation.length > 1 && descAndLocation[descAndLocation.length - 1];
		if(location) temp += ` (${location})`;
		temp = temp.slice(0, 30) + (temp.length > 30 ? "..." : "");
		return temp;
	}
		


	let icons: any = []
	if(account_id == "f1a0b126-d5a0-4fbd-bdf0-f2b6973302e7") icons.push(dnbIcon);
	if(account_id == "4fe602eb-9edd-4c3e-8f9b-4333a7917a87") icons.push(amexIcon);
	if(curve) icons.push(curveIcon);

	return (
    <div className={`my-2 shadow-sm ${completed ? 'bg-green-100' : 'bg-white'}`}>
      <div className="p-2 pb-0 flex justify-between">
				<div className='flex gap-1 w-full'> 
					{ icons && icons.map((icon: string, idx: number) => (
						<img src={icon} key={idx} className="h-[1.45rem] w-[1.45rem]" alt="icon showing the account and more" />
					))
					}
				</div>
				<div className="text-gray-500"> {moment(date).format("DD.MM.YYYY")} </div>
				<div id="amount" className="font-bold w-full text-right">{amount}&nbsp;kr</div>
        </div>
			<div className='p-2'>
				<h3 className="text-2xl"> { formatDescription(description) } </h3>
			</div>
      <div className="flex justify-between border-t-[1px] gap-[1px] bg-gray-200">
        {members && members.filter(member => member.active).map((member) => (
          <label key={member.id} htmlFor={`${id}-${member.id}`} className={`cursor-pointer w-full p-2 text-center ${member_id === member.id ? ' bg-violet-50 border-violet-500 border-[1px]' : 'bg-white border-gray-100'}`}>
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
              {member.description}
            </span>
          </label>
        ))}
      </div>
			{ loadingBar }
    </div>
  );
};

export default TransactionCard;