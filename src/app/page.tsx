import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="w-[97%] mx-auto mt-10 pb-12 rounded-lg h-[calc(100vh-6rem)]">
        <div className="flex w-full h-full justify-between gap-3">
          <div className="w-full bg-white flex flex-col gap-3">

            {/* upper */}
            <div className="h-[62%] border w-full rounded-4xl bg-[#f7fa3e] flex flex-col justify-between p-10">
              {/* bg-[#dbfa51] */}
              {/* <div className="h-[62%] border w-full rounded-4xl bg-[#dddddd] flex flex-col justify-between p-10"> */}
              <div className="w-full h-full text-8xl font-bold">
                <h1>BUY AND SELL</h1>
                <h1>DIGITAL GOODS</h1>
                <h1>ANONYMOUSLY!</h1>
              </div>

              <div className="text-xl font-medium w-[80%] mt-4">
                <h3>
                  {/* Sell digital assets anonymously. Get instant one-time download links after payment via Solana.  */}
                  Pay via Solana. Get instant one-time download link.
                  <br />
                  No platform fees. No middlemen. Just pure value exchange!
                </h3>
              </div>
            </div>

            {/* lower */}
            <div className="flex w-full justify-between h-[38%] gap-3">
              {/* lower left */}
              <Link href="/create" className="w-1/2">
                <div className="w-full bg-[#3ffd7e] h-full rounded-4xl flex flex-col justify-end p-10 cursor-pointer hover:bg-[#00ff40] transition-colors hover:text-white">
                  <div>
                    <h1 className="text-7xl font-bold">
                      START💸
                    </h1>
                    <h1 className="text-7xl font-bold">
                      SELLING
                    </h1>
                  </div>
                </div>
              </Link>
              {/* lower right */}
              <Link href="/marketplace" className="w-1/2">
                <div className="w-full bg-fuchsia-300 h-full rounded-4xl flex flex-col justify-end p-10 cursor-pointer hover:bg-fuchsia-400 transition-colors hover:text-white">
                  <div>
                    <h1 className="text-7xl font-bold">
                      START 🛍️
                    </h1>
                    <h1 className="text-7xl font-bold">
                      SHOPPING
                    </h1>
                  </div>
                </div>
              </Link>
            </div>

          </div>
          <div className="min-w-[800px] bg-white">
            <Image src="/anon-1.jpg" alt="nect" width={1000} height={1000} className="w-full h-full object-cover rounded-4xl" />
          </div>
        </div>
      </div>
    </>
  );
}
