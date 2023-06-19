import type { ChangeEvent} from "react";
import React, { useState } from "react";
import { parse } from "papaparse";
import { Header } from "./home";
import ColumnSelector from "~/components/ColumnSelector";
import ColumnPreview from "~/components/ColumnPreview";
import { convertDates } from "~/utils";

export interface CSVData {
  [key: string]: string
}

interface TransactionData {
	date: string
	description: string
	amount: number
}

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
	const [data, setData] = useState<CSVData[]>();
	const [account, setAccount] = useState("");
	const accountList = ["DNB", "AMEX"];
	const requiredColumns = ["Dato", "Beskrivelse", "Beløp"];

	const csvColumns = data && Object.keys(data[0]);

	const [dateCol, setDateCol] = useState<string>("");
	const [descCol, setDescCol] = useState<string>("");
	const [amountCol, setAmountCol] = useState<string>("");
	const selectedColumns = [dateCol, descCol, amountCol];
	const setSelectedColumns = [setDateCol, setDescCol, setAmountCol];
	
	const colNameWithRows =  data && Object.keys(data[0]).map((colName) => [colName, data.map((row) => row[colName])]) as [string, string[]]
	const dateColumns = colNameWithRows && colNameWithRows.filter((a) => a[1].length == convertDates(a[1] as unknown as string[])?.filter(b => b).length).map(a => a[0]);
	const amountColumns = colNameWithRows && colNameWithRows
		.filter((a) => (a[1].length == (a[1] as unknown as string[]).filter(b => b.match("[0-9]+(\.|,)[0-9]+") && parseInt(b) > -60000 && parseInt(b) < 60000).length))
		.map(a => a[0])
		.filter(a => !dateColumns?.includes(a));
	if(!dateCol && dateColumns?.length == 1) setDateCol(dateColumns[0]);
	if(!amountCol && amountColumns?.length == 1) setAmountCol(amountColumns[0]);
	const descriptionColumns = csvColumns && csvColumns.filter((a) => !dateColumns!.includes(a) && !amountColumns!.includes(a))
	if(!descCol && descriptionColumns && descriptionColumns.length == 1) setDescCol(descriptionColumns[0]);


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		for(let setCol of setSelectedColumns) { setCol(""); }
		if (data) setData(undefined);

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
				setData(result.data);
      };
      reader.readAsText(file);
		}
  };

  const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const transactionData: TransactionData[] | undefined = data && data
			.map((row) => ({ date: row[dateCol], description: row[descCol].replace(", Vilnius, LTU", ""), amount: parseFloat(row[amountCol].replace(",", ".")) }));
		console.log("submitted", transactionData)
  };

	const handleAccountChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    if(e.target.value) setAccount(e.target.value);
  };

  return (
    <div className="min-h-screen mx-auto max-w-4xl bg-white">
    <Header />
      <div className="flex flex-col items-center w-full justify-center sm:pt-4">
        <div>
          <h2 className="mt-4 sm:mt-6 text-center text-3xl font-extrabold text-gray-900">Last opp din CSV-fil</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Vennligst velg en konto og last opp en CSV-fil med transaksjoner.
          </p>
        </div>
				
        <form onSubmit={handleSubmit} className="sm:mt-4 space-y-3 sm:space-y-6 w-full flex flex-col items-center w-[90%] max-w-[50rem] bg-white px-4 sm:px-6 py-2 sm:py-4">
					<div className="w-full">
						<label className="font-bold text-xs" htmlFor="dateCol"> Velg en konto </label><br/>
						<select value={account} onChange={handleAccountChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
							{accountList.length > 1 ? <option value=""> Velg en konto </option> : null }
							{accountList.map((acc, idx) => 
								<option key={idx} value={acc} className="w-full"> {acc} </option>
							)}
						</select>
					</div>
					{ account && <div className="w-full">
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
					{ data && csvColumns && account && <ColumnSelector 
							data={data} 
							requiredColumns={requiredColumns}
							csvColumns={csvColumns}
							cols={selectedColumns}
							setCols={setSelectedColumns}
					/>}
					{ data && account && <ColumnPreview 
						data={data} 
						requiredColumns={requiredColumns} 
						selectedColumns={selectedColumns} 
					/>}
					
					{ data && account &&
						<button type="submit" disabled={selectedColumns.includes("")} className={`disabled:bg-gray-400 group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}>
							Last opp
						</button>
					}
				</form>
			</div>
		</div>
  );
}