import React, { useState } from "react";
import { parse } from "papaparse";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { convertDates } from "~/utils";
import ColumnSelector from "~/components/ColumnSelector";
import ColumnPreview from "~/components/ColumnPreview";
import { requireUserId } from "~/session.server";
import { getAccountListItems } from "~/models/account.server";
import { ToastType } from "~/components/Toast";
import Toast from "~/components/Toast";
import Header from "~/components/Header";

import { getPaymentNames } from "~/models/payment.server";
import PenIcon from "~/icons/PenIcon";
import { ManageModal } from "~/components/ManagementModal";

import type { ChangeEvent} from "react";
import type { LoaderArgs } from "@remix-run/node";
import type { Account} from "~/models/account.server";
import type { ToastProps} from "~/components/Toast";
import type { ManagementModalProps } from "~/components/ManagementModal";
import type { NameAmountItem } from "~/models/transaction.server";

export interface CSVData {
	[key: string]: string;
}

export interface ColumnData {
	name?: string,
	idx: number, 
	value: string, 
	required: boolean,
	active: boolean,
	csvColumns: string[]
}

export interface ColumnDataObject {
  [key: string]: ColumnData
}

type LoaderData = {
	accountListItems: Account[];
	paymentNames: { name: string, account_id: string }[];
};

export async function loader ({ request }: LoaderArgs) {
  const user_id = await requireUserId(request);
	const accountListItems = await getAccountListItems({ user_id });
	const paymentNames = await getPaymentNames({ user_id });
  return json({ accountListItems, paymentNames });
};

const monthNames = ["Januar", "Februar", "Mars", "April", "Mai", "Juni",
"Juli", "August", "September", "Oktober", "November", "Desember"];

export default function TransactionUpload() {
	const navigate = useNavigate();
	const { accountListItems, paymentNames } = useLoaderData<typeof loader>() as LoaderData;
  const [file, setFile] = useState<File | null>(null);
	const [data, setData] = useState<CSVData[]>();
	const [accountId, setAccountId] = useState("");
	const [toast, setToast] = useState<ToastProps>();
	const [modal, setModal] = useState<ManagementModalProps>();
	const [listItems, setListItems] = useState<NameAmountItem[]>(accountListItems);


	const getSuggestedName = (name?: string) => {
		let suggestedName = name || monthNames[new Date().getMonth()] + " " + new Date().getFullYear()
		const existingWithSameName = paymentNames.filter(a => a.account_id == accountId && a.name == suggestedName).length + 1;
		suggestedName += existingWithSameName == 1 ? "" : " (nr " + existingWithSameName + ")";
		return suggestedName;
	}

	const handleManageClick = (name: string) => {
		setModal({
			title: name,
			listItems: listItems,
			onClose: () => setModal(undefined),
			onSave: (listItems: NameAmountItem[]) => handleManageSave(listItems)
		});
	};

	const handleManageSave = (listItems: NameAmountItem[]) => {
		fetch('/accounts/update', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ listItems }),
		})
		.then(response => response.json())
		.then(_ => {
			setModal(undefined);
			setListItems(listItems as Account[])
			if(listItems.filter(a => a.id == accountId && a.active).length == 0) setAccountId("")
		});
	}

	console.log(listItems.filter(a => a.id == accountId))
	console.log(accountId)
	
	const [paymentName, setPaymentName] = useState<string>(getSuggestedName());

	const requiredColumns = ["Dato", "Beskrivelse", "Beløp"];
	const optionalColumns = ["Kortbruker"];

	const defaultColumns: ColumnDataObject = Object.fromEntries(
		requiredColumns.map((colName, idx) => [colName, {idx, value: "", required: true, active: true, csvColumns: []}]).concat(
		optionalColumns.map((colName, idx) => [colName, {idx: idx + requiredColumns.length, value: "", required: false, active: false, csvColumns: []}])));

	const [columns, setColumns] = useState(defaultColumns);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		// Reset data and selected columns
		
		setColumns(defaultColumns);
		if (data) setData(undefined);

		// Read file
    const file = e.target.files ? e.target.files[0] : null;
    setFile(file);
		if (file) {
      const reader = new FileReader();
      reader.onload = async function (evt) {
        const csvContent = evt.target?.result as string;
        const result = parse<CSVData>(csvContent, { header: true });

				const fields = Object.keys(result.data[0]);

				if (fields.includes("Ut") && fields.includes("Inn")) {
					result.data = result.data.filter((el) => el["Dato"]);
					result.data = result.data.map((row) => ({ 
						...row, 
						"Inn": "", 
						"Ut": row["Ut"] ? row["Ut"] : "" + -row["Inn"] 
					}));
					result.data.forEach(a => {
						delete a["Inn"];
						delete a["Valuta"]
						delete a["Kurs"]
					})
				}

				const colNameWithRows =  Object.keys(result.data[0]).map((colName) => [colName, result.data.map((row) => row[colName])]) as [string, string[]]
				const dateColumnsWithDates = colNameWithRows.filter((a) => convertDates(a[1] as unknown as string[]));
				const dateColumnsWithConvertedDates: [string, Date[]][] = dateColumnsWithDates.map(a => [a[0], convertDates(a[1] as unknown as string[])] as unknown as [string, Date[]]);
				
				// Replace dates in data with converted dates
				const newData = result.data.map((row) => {
					const newRow = {...row};
					for (let [colName, dates] of dateColumnsWithConvertedDates) {
						newRow[colName] = dates.shift()?.toLocaleDateString("no-NO") || "";
					}
					return newRow;
				});
				setData(newData);
		
				const dateColumns = dateColumnsWithDates.map(a => a[0])

				console.log(colNameWithRows)
				const amountColumns = colNameWithRows
					.filter((a) => (a[1].length*0.9 <= (a[1] as unknown as string[]).filter(b => b && b.match(/^[+-]?\d+([\.,]\d+)?$/g) && parseInt(b) > -60000 && parseInt(b) < 60000).length))
					.map(a => a[0])
					.filter(a => !dateColumns.includes(a));
				
				const restColumns = Object.keys(newData[0]).filter((a) => !dateColumns!.includes(a) && !amountColumns!.includes(a))

				setColumns({
					"Dato": {...columns["Dato"], csvColumns: dateColumns, value: dateColumns.length == 1 ? dateColumns[0] : ""},
					"Beskrivelse": {...columns["Beskrivelse"], csvColumns: restColumns, value: restColumns && restColumns.length == 1 ? restColumns[0] : ""},
					"Beløp": {...columns["Beløp"], csvColumns: amountColumns, value: dateColumns.length == 1 ? dateColumns[0] : ""},
					"Kortbruker": {...columns["Kortbruker"], csvColumns: restColumns},
				})
      };
      reader.readAsText(file);
		}
  };

	const handleAccountChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    if(e.target.value) setAccountId(e.target.value);
		setPaymentName(getSuggestedName(paymentName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const transactionData = data && data
			.map((row) => ({ 
				date: row[columns["Dato"].value], 
				description: row[columns["Beskrivelse"].value], 
				amount: parseFloat(row[columns["Beløp"].value].replace(",", ".")), 
				cardUser: row[columns["Kortbruker"].value] || "",
				excluded: false 
			}))
			.map((row) => ({ ...row, description: row.description.replace(", Vilnius, LTU", "") }))
			.map((row) => ({ ...row, account_id: accountId, member_id: null }))
			.map((row) => ({ ...row, 
				tags: [
					row.description.toLowerCase().includes("crv*") && "curve", 
					row.description.toLowerCase().includes("vipps*") && "vipps",
					row.description.toLowerCase().includes("klarna*") && "klarna",
					row.description.toLowerCase().includes("paypal*") && "paypal",
					row.description.toLowerCase().includes("nets *") && "nets",
					row.description.toLowerCase().includes("tise as*") && "tise",
					row.description.toLowerCase().includes("hyre as*") && "hyre",

				].filter(a => a), 
				description: 
				row.description
					.replace(/crv\*/ig, "") 
					.replace(/vipps\*/ig, "")
					.replace(/klarna\*/ig, "")
					.replace(/paypal\*/ig, "")
					.replace(/nets \*/ig, "")
					.replace(/tise as\*/ig, "")
					.replace(/hyre as\*/ig, "Hyre:")
			}))

		if (transactionData) {
			fetch('/payments/new', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					transactions: transactionData,
					payment: {
						account: { id: accountId },
						completed: false,
						name: paymentName,
					}
				}),
			})
			.then(response => response.json())
			.then(_ => { 
				setToast({ 
					type: ToastType.Success, 
					message: "Transaksjonene ble lastet opp!", 
					autoCloseDuration: 2000, 
					onClose: () => setToast(undefined)
				});
				setTimeout(() => navigate("/payments"), 1500);
			})
			.catch((error) => {
				setToast({ 
					type: ToastType.Error, 
					message: "Det skjedde en feil ved opplastning", 
					autoCloseDuration: 2000, 
					onClose: () => setToast(undefined)
				});
			});
		}
	};

	const handleActivateColumn = (name: string, active: boolean) => {
		const newColumns = {...columns};
		newColumns[name].active = active;
		setColumns(newColumns);
	}

	const handleSetColumnValue = (name: string, value: string) => {
		const newColumns = {...columns};
		newColumns[name].value = value;
		setColumns(newColumns);
	}

	const columnList: ColumnData[] = Object.entries(columns).map(([name, value]) => ({name, ...value})).sort((a, b) => a.idx - b.idx)

  return (
		<div className="flex flex-col mx-auto bg-gray-100">
			<Header showBackButton headerText="Last opp ny betaling" showLogoutButton={false} />
			{modal && <ManageModal {...modal} />}

			{ toast && <Toast {...toast} onClose={() => setToast(undefined)} /> }
			<main className="flex flex-col m-2 p-2 max-w-3xl mx-auto w-full">
				<div className="flex flex-col items-center w-full justify-center sm:pt-4">
					<div>
						<h2 className="mt-4 sm:mt-6 text-center text-3xl font-extrabold text-gray-900">Last opp din betaling</h2>
						<p className="mt-2 text-center text-sm text-gray-600">
							Vennligst velg en konto og last opp en CSV-fil med transaksjoner.
						</p>
					</div>
					
					<form onSubmit={handleSubmit} className="sm:mt-4 space-y-3 sm:space-y-6 w-full flex flex-col items-center w-[90%] max-w-[50rem] bg-white px-4 sm:px-6 py-2 sm:py-4">
						<div className="w-full flex flex-col gap-2">
							<div id="setAccount">
									<label className="font-bold text-xs" htmlFor="dateCol"> Velg en konto </label>
								<div className="flex items-center gap-2">
									<select required value={accountId} onChange={handleAccountChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
										{listItems.length > 1 ? <option value=""> Velg en konto </option> : null }
										{listItems.filter(a => a.active).map((acc, idx) => 
											<option key={idx} value={acc.id} className="w-full"> {acc.description} </option>
										)}
									</select>
									<button className="w-10 border-2 p-2 rounded-md flex items-center justify-center" onClick={() => handleManageClick("kontoer")}>
										<PenIcon className="w-4 h-4 text-gray-500 dark:text-white" />
									</button>
								</div>
							</div>
							<div>
								<label className="font-bold text-xs" htmlFor="name"> Gi betalingen et navn </label>
								<input required type="text" id="name" name="name" value={paymentName} onChange={(e) => setPaymentName(e.target.value)} 
								className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
														focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
							</div>
						</div>
						{ accountId && <div id="fileInput" className="w-full">
							<label className="block rounded-full shadow-sm">
								<span className="sr-only">Velg CSV fil du ønsker å laste opp</span>
								<input type="file" accept=".csv" className="block w-full text-sm text-slate-500
									file:mr-4 file:py-2 file:px-4
									rounded-full file:border-0
									file:text-sm file:font-semibold
									file:bg-violet-50 file:text-violet-700
									hover:file:bg-violet-100
								"
									onChange={handleFileChange}
								/>
							</label>
						</div> }
						{ data  && accountId && <ColumnSelector data={data} columns={columnList} setActive={handleActivateColumn} setColumnValue={handleSetColumnValue} />}
						{ data && accountId && <ColumnPreview data={data} columns={columnList} />}
						
						{ data && accountId &&
							<button type="submit" 
								disabled={Object.values(columns).some(column => (column.required || column.active) && column.value == "") || !!toast } 
								className={`disabled:bg-gray-400 group relative w-full flex justify-center 
														py-2 px-4 border border-transparent text-sm font-medium rounded-md 
														text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none
														focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}>
								Last opp
							</button>
						}
					</form>

				</div>
			</main>
		</div>
  );
}