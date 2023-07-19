import { useEffect, useState } from "react";
import type { Trumf } from "~/models/trumf.server";
import { sum } from "./RadioButtonList";

export interface ReceiptModalProps {
	transaction_id: string;
	onClose: () => void;
}

const ReceiptModal = ({ transaction_id, onClose}: ReceiptModalProps) => {
	const [trumfListItems, setTrumfListItems] = useState<Trumf[]>([]);

	useEffect(() => {
		setTrumfListItems([]);
		const fetchReceipt = async () => {
			const response = await fetch('/trumf/get', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ transaction_id })
			});
			const data = await response.json();
			setTrumfListItems(data.trumfListItems);
		}
		fetchReceipt();
	}, [transaction_id]);


	const handleClose = () => {
		onClose();
	}

	console.log(trumfListItems)
	
	return (
		<div className="fixed inset-0 z-40">
			<div className="fixed inset-0 bg-black opacity-50" data-modal-hide="medium-modal" onClick={handleClose}></div>
			<div className="fixed inset-0 flex flex-col items-center max-h-[80%] mx-auto max-w-[40rem] w-[90%] mt-[10%] bg-white rounded-lg shadow dark:bg-gray-700">
				<div className="flex items-center justify-between p-5 border-b rounded-t dark:border-gray-600 w-full">
					<span></span>
					<h3 className="text-xl font-medium text-gray-900 dark:text-white">
						Trumf-kvittering
					</h3>
					<button onClick={handleClose} type="button" className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="medium-modal">
						<svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
						<span className="sr-only">Close modal</span> 
					</button>
				</div>
				<div className="relative overflow-auto w-full">
					<div className="flex flex-col p-5">
						{trumfListItems.map((item) => (
							<div key={item.id} className="flex flex-col mb-5">
								<div className="flex flex-row justify-between">
									<div className="flex flex-col">
										<span className="text-md text-gray-900 dark:text-white">{item.description}</span>
									</div>
									<span className="text-sm font-semibold text-gray-900 dark:text-white">{item.amount}&nbsp;kr</span>
								</div>
								<div className="flex flex-row gap-2 items-center">
									<span className="text-xs text-gray-500 dark:text-gray-300">Antall</span>
									<span className="text-sm font-semibold text-gray-900 dark:text-white">{item.qty}</span>
								</div>
							</div>
						))}
					</div>
					<div>
						<div className="flex flex-row justify-between p-5 border-t rounded-b dark:border-gray-600">
							<span className="text-md font-semibold text-gray-900 dark:text-white">Totalt</span>
							<span className="text-md font-semibold text-gray-900 dark:text-white">{sum(trumfListItems)}&nbsp;kr</span>
						</div>
					</div>
				</div>
			</div>
		</div>
  );
};

export default ReceiptModal;