import { Link } from "@remix-run/react";
import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();

  return (
    <main className="relative min-h-full sm:bg-white flex items-center sm:justify-center bg-violet-300 overflow-y-scroll no-scrollbar">
      <div className="relative w-full">
        <div className="mx-auto max-w-4xl sm:max-h-4xl sm:px-6 lg:px-8">
          <div className="relative sm:overflow-hidden sm:rounded-2xl">
            <div className="absolute inset-0 shadow-xl invisible sm:visible">
              <img
                className="h-full w-full object-cover"
                src="https://pengeverkstedet.no/pengeverkstedet/wp-content/uploads/2015/12/15temHallgeir_Kvad_5054617a-e1455744894715.jpg"
                alt="Hallgeir som blar opp tusenlapper"
              />
              <div className="absolute inset-0 bg-[color:rgba(139,92,246,0.5)] mix-blend-multiply" />
            </div>
            <div className="lg:pb-18 relative px-4 pt-16 pb-8 sm:px-6 sm:pt-24 sm:pb-14 lg:px-8 lg:pt-32">
              <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
                <span className="block uppercase text-violet-500 drop-shadow-md">
                  HALLGEIR
                </span>
              </h1>
              <img
                className="w-[90%] aspect-video object-cover m-[1rem] rounded-xl sm:hidden"
                src="https://pengeverkstedet.no/pengeverkstedet/wp-content/uploads/2015/12/15temHallgeir_Kvad_5054617a-e1455744894715.jpg"
                alt="Hallgeir som blar opp tusenlapper"
              />
              <p className="mx-auto mt-6 max-w-lg text-center text-xl text-white sm:max-w-3xl">
                Hallgeir lar deg laste opp regninger og få full oversikt over utlegg og forbruk.
              </p>
              <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                {user ? (
                  <Link
                    to="/transactions"
                    className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-violet-700 shadow-sm hover:bg-violet-50 sm:px-8"
                  >
                    Gå videre ({user.email})
                  </Link>
                ) : (
                  <div className="sm:inline-grid">
                    <Link
                      to="/login"
                      className="flex items-center justify-center rounded-md bg-violet-500 px-4 py-3 font-medium text-white hover:bg-violet-600  "
                    >
                      Logg inn
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
