import Image from "next/image";
import Link from "next/link";
import { Github, Twitter } from "lucide-react";

export default function Home() {
  return (
    <>
      <div className="w-[97%] mx-auto mt-9 sm:mt-10 pb-12 rounded-lg h-[calc(100vh-6rem)]">
        <div className="flex flex-col w-full h-full justify-between gap-3 lg:flex-row">

          <div className="w-full bg-white flex flex-col gap-3">
            {/* upper */}
            <div className="min-h-[70%] sm:min-h-[60%] md:min-h-[61.1%] border w-full rounded-4xl bg-[#f7fa3e] flex flex-col justify-between p-10">
              {/* bg-[#dbfa51] */}
              {/* <div className="h-[62%] border w-full rounded-4xl bg-[#dddddd] flex flex-col justify-between p-10"> */}

              {/* <div className="w-full h-full text-4xl sm:text-5xl md:text-8xl font-bold">
                <h1>BUY AND SELL</h1>
                <h1>DIGITAL GOODS</h1>
                <h1>ANONYMOUSLY!</h1>
              </div> */}

              <div className="w-full h-full text-4xl sm:text-5xl md:text-[4.5vw] font-black tracking-tighter">
                <h1 className="leading-[0.9] mb-2">BUY AND SELL</h1>
                <h1 className="leading-[0.9] mb-2">DIGITAL GOODS</h1>
                <h1 className="leading-[0.9] ">ANONYMOUSLY!</h1>
              </div>

              <div className="text-base sm:text-lg md:text-xl lg:text-[1.25vw] font-medium w-[90%] xs:w-[80%] mt-4 mb-5 sm:mb-10 md:mb-0">
                <h3>
                  {/* Sell digital assets anonymously. Get instant one-time download links after payment via Solana.  */}
                  Pay via Solana.
                  <br className="block sm:hidden" />
                  <span className="sm:ml-1">
                    Get instant one-time download link.
                  </span>
                  <br />                 
                    No platform fees.
                  <br className="block sm:hidden" />
                  <span className="sm:ml-1.5">
                    No middlemen.
                  </span>
                  <br className="block sm:hidden" />
                  <span className="sm:ml-1.5">
                    Just pure value exchange!
                  </span>
                </h3>
              </div>
            </div>

            {/* lower */}
            <div className="flex w-full justify-between h-[38%] gap-3">
              {/* lower left */}
              <Link href="/create" className="w-1/2">
                <div className="w-full bg-[#3ffd7e] h-full rounded-4xl flex flex-col justify-end p-10 cursor-pointer hover:bg-[#00ff40] transition-colors hover:text-white">
                  <div>
                    <h1 className="text-lg xs:text-3xl sm:text-5xl md:text-[3.72vw] font-bold">
                      START💸
                    </h1>
                    <h1 className="text-xl xs:text-3xl sm:text-5xl md:text-[3.72vw] font-bold">
                      SELLING
                    </h1>
                  </div>
                </div>
              </Link>
              {/* lower right */}
              <Link href="/marketplace" className="w-1/2">
                <div className="w-full bg-fuchsia-300 h-full rounded-4xl flex flex-col justify-end p-10 cursor-pointer hover:bg-fuchsia-400 transition-colors hover:text-white">
                  <div>
                    <h1 className="text-xl xs:text-3xl sm:text-5xl md:text-[3.72vw] font-bold">
                      START 🛍️
                    </h1>
                    <h1 className="text-xl xs:text-3xl sm:text-5xl md:text-[3.72vw] font-bold">
                      SHOPPING
                    </h1>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="min-w-[99%] md:min-w-[41.7vw] bg-white h-[80%] md:h-[100%] pb-5 sm:pb-0">
            <Image src="/anon-1.jpg" alt="nect" width={1000} height={1000} className="w-full h-full object-cover rounded-4xl" />
          </div>
        </div>

        {/* Video Demo Section */}
        <div className="mt-20 mb-20 bg-white rounded-3xl border-2 border-[#dddddd] p-8">
          <h2 className="text-6xl text-white text-shadow-2xs md:text-shadow-md md:text-black sm:text-7xl md:text-8xl font-black tracking-tighter text-center mb-12">
            1 Minute Demo
          </h2>
          <div className="aspect-video w-full max-w-[1200px] mx-auto rounded-3xl overflow-hidden border-[5px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/WdVtl4wed58?vq=hd1080"
              title="NECT Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white rounded-3xl border-2 border-[#dddddd] p-8">
          <div className="flex flex-col gap-8">
            {/* CTA Section */}
            <div className="bg-[#f7fa3e] px-10 py-8 rounded-3xl">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-4">
                  <h2 className="text-5xl font-bold text-black">Start Shopping Now</h2>
                  <p className="text-black/80 text-xl max-w-2xl">
                    Experience the future of digital commerce on Solana
                    <br />
                    secure, decentralized, and fee-free transactions for creators and buyers.
                  </p>
                  <Link href="/marketplace">
                    <button className="bg-black text-white px-8 py-4 rounded-[10px] font-medium text-2xl cursor-pointer hover:bg-fuchsia-300 hover:text-black transition-colors">
                      Go to Marketplace
                    </button>
                  </Link>
                </div>
                <div className="w-full max-w-xs">
                  <div className="aspect-square rounded-2xl backdrop-blur-sm flex items-center justify-center">
                    <Image 
                      src="/nect-logo.png" 
                      alt="NECT" 
                      width={500} 
                      height={500}
                      className="w-full h-auto" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Links and Social */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 px-4">
              <div className="text-lg text-gray-600">
                © 2025 NECT. All rights reserved.
              </div>
              <div className="flex items-center gap-4">
                <Link 
                  href="https://twitter.com/HeySkidee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:text-[#EE2B69] transition-colors flex items-center gap-2"
                >
                  <Twitter size={24} /> Twitter
                </Link>
                <Link 
                  href="https://github.com/HeySkidee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:text-[#EE2B69] transition-colors flex items-center gap-2 "
                >
                  <Github size={24} /> Github
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}