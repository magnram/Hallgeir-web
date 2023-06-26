import { useState } from "react";
import type { ChangeEvent} from "react";
import type { NameAmountItem } from "~/models/transaction.server";
import { v4 as uuidv4 } from 'uuid';
import { isEmpty, isEqual, xorWith } from "lodash";

export interface ManagementModalProps {
	title: string;
	listItems: NameAmountItem[];
	onSave: (listItems: NameAmountItem[]) => void;
	onClose: () => void;
}

interface ManageModalItem extends NameAmountItem {
	new?: boolean;
}

export const isArrayEqual = (x: NameAmountItem[], y: NameAmountItem[]) => isEmpty(xorWith(x, y, isEqual));

export const ManageModal = ({ title, listItems, onSave, onClose }: ManagementModalProps) => {
	const [items, setItems] = useState<ManageModalItem[]>([...listItems.map(a => ({ ...a }))]);

	const handleSave = () => {
		onSave(items.map((item) => {
			const newItem = { ...item };
			delete newItem.new;
			return newItem;
		}));
	}

	const handleCancel = () => onClose();

	const canSave = !isArrayEqual(items, listItems) && !items.some(item => !item.description);
	const showToggleWarning = title == "personer" && !isEqual(items.map((i) => i.active), listItems.map((i) => i.active));

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		const index = items.findIndex((item) => item.id === name);
		const newItems = [...items];
		newItems[index].description = value;
		setItems(newItems);
	}

	const handleActiveChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = event.target;
		const index = items.findIndex((item) => item.id === name);
		const newItems = [...items];
		newItems[index].active = checked;
		setItems(newItems);
	}

	const handleAddNew = () => {
		const newItems = [...items];
		newItems.push({ id: uuidv4(), description: "", active: true, order: newItems.length+1, new: true });
		setItems(newItems);
	}

	const handleMove = (up: boolean, index: number) => {
		const targetIndex = up ? index-1 : index+1;
		
		const newItems = [...items];
		const item = newItems[index]
		newItems[index] = newItems[targetIndex];
		newItems[targetIndex] = item;

		setItems(newItems.map((item, idx) => ({...item, order: idx+1})))
	}
	
	const sortItems = (items: ManageModalItem[]) => items.sort((a, b) => (a.order || 1000) - (b.order || 1000));
	
	return (
		<div tabIndex={-1} className="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
			<div className="relative w-full max-w-lg max-h-full m-auto">
				<div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
					<div className="flex items-center justify-between p-5 border-b rounded-t dark:border-gray-600">
						<h3 className="text-xl font-medium text-gray-900 dark:text-white">
							Administrer {title}
						</h3>
						<button onClick={handleCancel} type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="medium-modal">
							<svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
							<span className="sr-only">Close modal</span> 
						</button>
					</div>
					<div className="p-6 space-y-2">
						{ sortItems(items).map((item, idx) => (
							<div key={idx} className="flex items-center justify-between gap-2">
								<div className="flex flex-col justify-center align-center">
									<button onClick={() => handleMove(true, idx)} disabled={idx == 0} className="disabled:text-gray-200 text-gray-500 w-6 h-5 flex justify-center align-center">
										<svg className="w-3 h-3 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
											<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7 7.674 1.3a.91.91 0 0 0-1.348 0L1 7"/>
										</svg>
									</button>
									<button onClick={() => handleMove(false, idx)} disabled={idx == items.length-1} className="disabled:text-gray-200 text-gray-500 w-6 h-5 flex justify-center align-center">
										<svg className="w-3 h-3 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
											<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1"/>
										</svg>
									</button>
								</div>
								<input name={item.id} value={item.description} onChange={handleInputChange} type="text" id={"modalElement"+idx} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required/>
								<label className="relative inline-flex items-center cursor-pointer">
									<input name={item.id} type="checkbox" checked={!!item.active} onChange={handleActiveChange} className="sr-only peer" />
									<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
								</label>
								<button type="button" className={`text-red-500 p-2 ${!item.new && "invisible"}`} onClick={() => setItems(items.filter((i) => i.id !== item.id))}>X</button>
							</div>
						))}
						<button className="text-gray-500 p-2" onClick={handleAddNew}>+ Legg til ny</button>
						{showToggleWarning && <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-2" role="alert">
							<p className="text-xs"> Dersom du deaktiverer en person, vil alle ubetalte transaksjoner som er tilknyttet til den deaktiverte personen bli frigjort. </p>
						</div>}
					</div>
					<div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
						<button type="button" disabled={!canSave} onClick={handleSave} className="disabled:bg-gray-500 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"> Lagre </button>
						<button type="button" onClick={handleCancel} className="text-red-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-red-900 focus:z-10 dark:bg-red-700 dark:text-red-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">Avbryt</button>
					</div>
				</div>
			</div>
		</div>
	)
}