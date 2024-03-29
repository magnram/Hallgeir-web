import moment from 'moment';
import type { ChangeEvent} from 'react';
import { useState} from 'react';
import type { Member } from '~/models/member.server';
import type { Transaction } from '~/models/transaction.server';
import { capitalizeFirstLetterOfEachWord } from '~/utils';
import AngleDownIcon from '~/icons/AngleDownIcon';
import AngleUpIcon from '~/icons/AngleUpIcon';

import trumfIcon from "../../public/trumf.png";

import curveIcon from "../../public/tag_logos/curve.jpeg";
import vippsIcon from "../../public/tag_logos/vipps.svg";
import klarnaIcon from "../../public/tag_logos/klarna.png";
import paypalIcon from "../../public/tag_logos/paypal.png";
import netsIcon from "../../public/tag_logos/nets.jpeg";
import tiseIcon from "../../public/tag_logos/tise.jpeg";
import hyreIcon from "../../public/tag_logos/hyre.png";
import ReceiptModal from './ReceiptModal';

const allIcons = {
	curve: curveIcon,
	vipps: vippsIcon,
	klarna: klarnaIcon,
	paypal: paypalIcon,
	nets: netsIcon,
	tise: tiseIcon,
	hyre: hyreIcon,
}
type ObjectKey = keyof typeof allIcons;

interface TransactionCardProps extends Transaction {
  members: Member[];
	onMemberChange: (id: string, memberId: string | null) => void;
	onExcludedChange: (id: string, excluded: boolean) => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ id, description, amount, date, member_id, payment_id, cardUser, trumf_bonus, tags, loading, members, excluded, onMemberChange, onExcludedChange }) => {
	const [expanded, setExpanded] = useState(false);
	const [showReceipt, setShowReceipt] = useState(false);
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
		temp = temp.slice(0, 60) + (temp.length > 60 ? "..." : "");
		return temp;
	}

	let icons: string[] = []
	tags.forEach((tag) => {
		icons.push(allIcons[tag as ObjectKey])
	});

	const handleShowReceipt = () => {
		setShowReceipt(true);
	}

	return (
		<>
			{ showReceipt && <ReceiptModal transaction_id={id} onClose={() => setShowReceipt(false)}  /> }
			<div className={`my-2 shadow-sm cursor-pointer bg-white`}>
				<div onClick={() => setExpanded(!expanded)}>
					<div className={`p-2 pb-0 flex justify-between ${trumf_bonus && "mb-[-1rem]"}`}>
						<div className='flex gap-1 w-full'> 
							{ icons && icons.map((icon: string, idx: number) => (
								<img src={icon} key={idx} className="h-[1.45rem] w-[1.45rem] rounded-xl" alt="icon showing the account and more" />
							))
							}
						</div>
						<div className="text-gray-500"> {moment(date).format("DD.MM.YYYY")} </div>
						<div id="amount" className="text-right w-full flex flex-col">
							<span className='font-bold'>{amount}&nbsp;kr</span>
							{trumf_bonus && <span className='text-gray-500 text-sm'> 
								<img src={trumfIcon} className="w-[2rem] inline-block" alt="trumf logo" />: {trumf_bonus}&nbsp;kr</span> 
							}
						</div>
					</div>
					<div className='p-2 pb-0'>
						<h3 className="text-2xl"> { formatDescription(description) } </h3>
					</div>
					{cardUser && (
						<div className='px-2 py-0'>
							<p className="text-gray-500 text-sm"> Kortbruker: {cardUser} </p>
						</div>
					)}
					<button className='flex justify-center pb-1 w-full border-b-[1px] border-solid border-gray-200'>
						{!expanded && <AngleDownIcon className='w-4 h-4 text-gray-300' />}
						{expanded && <AngleUpIcon className='w-4 h-4 text-gray-300' />}
					</button>
				</div>
				{expanded && (
					<div className='flex text-gray-500 flex-col divide-y'>
						{/* <button className=''>
							Legg til kommentar
						</button> */}
						<button disabled={!trumf_bonus} className={`disabled:text-gray-300 ${trumf_bonus ? 'py-2' : ""}`} onClick={() => handleShowReceipt()}>
							{ trumf_bonus ? "Vis Trumf-kvittering" : "Fant ingen Trumf-kvittering" }
						</button>
						{/* <button className=''>
							Velg kategori
						</button> */}
						<button className='text-red-500 py-2' onClick={() => onExcludedChange(id, !excluded)}>
							{excluded ? 'Vis transaksjon' : 'Skjul transaksjon'}
						</button>
					</div>
				)}
				{!excluded && (
					<div id="choosePerson" className="flex justify-between border-t-[1px] divide-x-[1px]">
						{members && members.filter(member => member.active).map((member) => (
							<label key={member.id} htmlFor={`${id}-${member.id}`} className={`cursor-pointer w-full p-2 text-center ${member_id === member.id ? ' bg-violet-50 ring-violet-500 z-10 ring-[1px]' : 'border-gray-200'}`}>
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
				)}
				{ loadingBar }
			</div>
		</>
  );
};

export default TransactionCard;