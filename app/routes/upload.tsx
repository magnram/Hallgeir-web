import React, { useState } from "react";
import { parse } from "papaparse";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { convertDates } from "~/utils";
import { Header } from "./transactions";
import ColumnSelector from "~/components/ColumnSelector";
import ColumnPreview from "~/components/ColumnPreview";
import { requireUserId } from "~/session.server";
import { getAccountListItems } from "~/models/account.server";

import type { ChangeEvent} from "react";
import type { LoaderArgs } from "@remix-run/node";
import type { Transaction} from "~/models/transaction.server";
import type { Account} from "~/models/account.server";
import { ToastProps, ToastType } from "~/components/Toast";
import Toast from "~/components/Toast";

export interface CSVData {
  [key: string]: string
}

type LoaderData = {
	accountListItems: Account[];
};

export async function loader ({ request }: LoaderArgs) {
  const user_id = await requireUserId(request);
	const accountListItems = await getAccountListItems({ user_id });
  return json({ accountListItems });
};

export default function TransactionUpload() {
	const navigate = useNavigate();
	const { accountListItems } = useLoaderData<typeof loader>() as LoaderData;
  const [file, setFile] = useState<File | null>(null);
	const [data, setData] = useState<CSVData[]>();
	const [accountId, setAccountId] = useState("");
	const [toast, setToast] = useState<ToastProps>();


	const [dateCol, setDateCol] = useState<string>("");
	const [descCol, setDescCol] = useState<string>("");
	const [amountCol, setAmountCol] = useState<string>("");
	const selectedColumns = [dateCol, descCol, amountCol];
	const setSelectedColumns = [setDateCol, setDescCol, setAmountCol];
	
	const requiredColumns = ["Dato", "Beskrivelse", "Beløp"];
	let [csvColumns, setCsvColumns] = useState<string[][]>([[], [], []]);


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		// Reset data and selected columns
		
		for(let setCol of setSelectedColumns) { setCol(""); }
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
				const amountColumns = colNameWithRows
					.filter((a) => (a[1].length == (a[1] as unknown as string[]).filter(b => b.match("[0-9]+(.|,)[0-9]+") && parseInt(b) > -60000 && parseInt(b) < 60000).length))
					.map(a => a[0])
					.filter(a => !dateColumns.includes(a));

				if(dateColumns.length == 1) setDateCol(dateColumns[0]);
				if(amountColumns?.length == 1) setAmountCol(amountColumns[0]);
				
				const descriptionColumns = Object.keys(newData[0]).filter((a) => !dateColumns!.includes(a) && !amountColumns!.includes(a))

				if(descriptionColumns && descriptionColumns.length == 1) setDescCol(descriptionColumns[0]);

				setCsvColumns([dateColumns, descriptionColumns, amountColumns]);
      };
      reader.readAsText(file);
		}
  };

	const handleAccountChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    if(e.target.value) setAccountId(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const transactionData: Transaction[] | undefined = data && data
			.map((row) => ({ date: row[dateCol], description: row[descCol], amount: parseFloat(row[amountCol].replace(",", ".")) }))
			.map((row) => ({ ...row, description: row.description.replace(", Vilnius, LTU", "") }))
			.map((row) => ({ ...row, account_id: accountId, member_id: null }))
			.map((row) => ({ ...row, curve: row.description.includes("CRV*"), description: row.description.replace("CRV*", "") }))

		if (transactionData) {
			let data = JSON.stringify(transactionData);

			fetch('/transactions/new', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: data,
			})
			.then(response => response.json())
			.then(_ => { 
				setToast({ 
					type: ToastType.Success, 
					message: "Transaksjonene ble lastet opp!", 
					autoCloseDuration: 2000, 
					onClose: () => setToast(undefined)
				});
				setTimeout(() => navigate("/transactions"), 1500);
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

  return (
    <div className="min-h-screen mx-auto max-w-4xl bg-white">
			<Header />
			{ toast && <Toast {...toast} onClose={() => setToast(undefined)} /> }

      <div className="flex flex-col items-center w-full justify-center sm:pt-4">
        <div>
          <h2 className="mt-4 sm:mt-6 text-center text-3xl font-extrabold text-gray-900">Last opp din CSV-fil</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Vennligst velg en konto og last opp en CSV-fil med transaksjoner.
          </p>
        </div>
				
        <form onSubmit={handleSubmit} className="sm:mt-4 space-y-3 sm:space-y-6 w-full flex flex-col items-center w-[90%] max-w-[50rem] bg-white px-4 sm:px-6 py-2 sm:py-4">
					<div id="setAccount" className="w-full">
						<label className="font-bold text-xs" htmlFor="dateCol"> Velg en konto </label><br/>
						<select value={accountId} onChange={handleAccountChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
							{accountListItems.length > 1 ? <option value=""> Velg en konto </option> : null }
							{accountListItems.map((acc, idx) => 
								<option key={idx} value={acc.id} className="w-full"> {acc.name} </option>
							)}
						</select>
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
					{ data  && accountId && <ColumnSelector 
							data={data} 
							requiredColumns={requiredColumns}
							csvColumns={csvColumns}
							cols={selectedColumns}
							setCols={setSelectedColumns}
					/>}
					{ data && accountId && <ColumnPreview data={data} requiredColumns={requiredColumns} selectedColumns={selectedColumns} />}
					
					{ data && accountId &&
						<button type="submit" 
							disabled={selectedColumns.includes("") || !!toast } 
							className={`disabled:bg-gray-400 group relative w-full flex justify-center 
													py-2 px-4 border border-transparent text-sm font-medium rounded-md 
													text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none
													focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}>
							Last opp
						</button>
					}
				</form>

			</div>
		</div>
  );
}