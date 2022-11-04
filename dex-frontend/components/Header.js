import { ConnectButton } from "web3uikit";
import Link from "next/link";
export default function Header() {
  return (
    <div className="flex items-center justify-between p-5 border-b-2 w-100 bg-slate-200">
      <h1 className="py-4 px-4 font-bold text-3xl"> Decentralized Exchange</h1>
      <div className="flex flex-row items-center">
        <ConnectButton moralisAuth={false} />
      </div>
    </div>
  );
}
