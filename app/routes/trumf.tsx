import { useEffect, useState } from "react";
import Header from "~/components/Header";
import Toast from "~/components/Toast";
import CopyIcon from "~/icons/CopyIcon";

import type { ToastProps } from "~/components/Toast";
import { ActionArgs, json} from "@remix-run/node";
import { uploadTrumf } from "~/models/trumf.server";
import { requireUserId } from "~/session.server";
import { Form } from "@remix-run/react";


export async function action({ request }: ActionArgs) {
	const user_id = await requireUserId(request);
	const body = await request.formData();
	const response = await uploadTrumf({
		token: body.get("token") as string,
		user_id
	});

	return json({ status: "success", transactionCount: response?.transactionCount || 0, receiptElementCount: response?.receiptElementCount || 0 });
}

export default function TrumfPage() {

	const [token, setToken] = useState<string>("");
	const [copied, setCopied] = useState<boolean>(false);
	const [toast, setToast] = useState<ToastProps>();
	
	useEffect(() => {
		if(copied) {
			setTimeout(() => setCopied(false), 3000);
		}
	}, [copied]);

  return (
		<div className="flex flex-col mx-auto bg-gray-100">
			<Header showBackButton={true} showLogoutButton={false} headerText="Synkroniser transaksjoner med Trumf" />
			{ toast && <Toast {...toast} onClose={() => setToast(undefined)} /> }

			<main className="flex flex-col m-2 p-2 max-w-3xl mx-auto w-full bg-white">
				<div className="space-y-2 pb-4">
					<h1 className="text-2xl font-bold"> Synkroniser transaksjoner med Trumf </h1>
					<p className="text-gray-500">
						Denne siden lar deg synkronisere dine transaksjoner fra Trumf med denne tjenesten. 
						Dette gjør det enkelt å holde oversikt over hvem som har betalt for hva, og hvor mye.
					</p>
				</div>
				<ol className="space-y-1 list-decimal list-inside dark:text-gray-400">
					<li>
						Kopier kodesnutten nedenfor
					</li>
					<li> 
						Gå til <a target="_blank" href="https://trumf.no" rel="noreferrer" className="text-violet-500 underline">trumf.no</a>
						<span className="text-gray-400"> (åpnes i ny fane) </span>
					</li>
					<li> Logg inn med brukernavn og passord. </li>
					<li> 
						Gå til <a target="_blank" href="https://trumf.no" rel="noreferrer" className="text-violet-500 underline">historikk</a>-siden
						<span className="text-gray-400"> (åpnes i ny fane) </span>
					</li>
					<li>
						Åpne konsollen ( <Code text="F12"/> på Windows, <Code text="Option"/> + <Code text="CMD"/> + <Code text="J"/> på Mac)
					</li>
					<li>
						Lim inn kodesnutten i tekst-feltet nederst i konsollen og trykk <Code text="Enter"/>. Dette vil kopiere tokenen din, slik at du kan lime den inn i tekstfeltet nedenfor.
					</li>
				</ol>
				<div className="flex items-center gap-2 pt-2">
					<Code text="copy(window._siteGlobalSettings.userToken)" className="p-2 w-96 text-lg" />
					<button onClick={() => {
						navigator.clipboard.writeText("copy(window._siteGlobalSettings.userToken)");
						setCopied(true);
					}} className="p-2 border-2 bg-gray-100 rounded-lg">
						<CopyIcon className="w-6 h-6 text-gray-800 dark:text-white" />
					</button>
					{copied && <p className="text-gray-500"> Kopiert til utklippstavle! </p>}
				</div>
				<Form method="post">
				<div className="pt-2">
					<label className="text-xs" htmlFor="name"> Lim inn koden du får fra konsollen fra trumf.no </label>
					<textarea required id="name" name="token" placeholder="eyXXXXXXX..." value={token} onChange={(e) => setToken(e.target.value)} 
					className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
											focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
				</div>
				<div className="flex justify-center">
					<button 
						disabled={token.length == 0}
						type="submit"
						// onClick={() => {
						// 	console.log(token);
						// 	setToken("");
						// 	setToast({ 
						// 		type: ToastType.Success, 
						// 		message: "Transaksjonene dine er nå synkronisert med Trumf!", 
						// 		autoCloseDuration: 3000, 
						// 		onClose: () => setToast(undefined)
						// 	});
						// }}
						className="disabled:bg-gray-500 bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded mt-2 text-center w-60 m-auto"
					> Send inn </button>
					</div>
				</Form>
			</main>	
		</div>
  );
}

const Code = ({ text, className }: { text: string, className?: string }) => (
	<span className={"bg-gray-100 dark:bg-gray-800 border-2 dark:text-gray-400 px-1 rounded " + className }>{text}</span>
);