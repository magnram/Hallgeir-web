import { Form, NavLink, useLocation, useNavigate } from "@remix-run/react";
import { useUser } from "~/utils";

interface HeaderProps {
	showBackButton?: boolean;
	showLogoutButton?: boolean;
	headerText?: string;
}

export default function Header ({ showBackButton, showLogoutButton, headerText }: HeaderProps) {
  const user = useUser();
	const navigate = useNavigate()
	const goBack = () => navigate(-1);

	return (
    <header className="bg-violet-800 w-full">
			<div className="flex items-center gap-5 p-2 text-white max-w-3xl m-auto">
				{showBackButton && <button
					onClick={goBack}
					className="flex flex-col items-center rounded bg-violet-600 py-1 px-5 text text-white hover:bg-white-500 active:bg-blue-600"
				> 
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
						<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
					</svg>
				</button>}
				{!showBackButton && !headerText && <p className="flex-1"> {user.email} </p>}
				{headerText && <p className="flex-1 text-center"> {headerText} </p>}
				<div className={`flex gap-4 ${showLogoutButton == false && "invisible"}` }>
					<Form action="/logout" method="post">
						<button
							type="submit"
							className="rounded bg-violet-600 py-1 px-2 text-white hover:bg-white-500 active:bg-blue-600"
						>
							Logg ut
						</button>
					</Form>
				</div>
				
			</div>
    </header>
  );
}