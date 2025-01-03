import jwt from 'jwt-simple';

export default async function Home() {
  const METABASE_SITE_URL = "http://localhost:3000";

  async function getToken() {
    'use server'
    const METABASE_SECRET_KEY = "c311748c5c2238cd1646b53de7a99495f3d9a7143102b579fe9ec7d937a1a6a3";
    
    const payload = {
      resource: { dashboard: 2 },
      params: {},
      exp: Math.round(Date.now() / 1000) + (10 * 60) // 10 minute expiration
    };
    const token = jwt.encode(payload, METABASE_SECRET_KEY);
    return token
    
  }

  const token = await getToken()

    const iframeUrl = METABASE_SITE_URL + "/embed/dashboard/" + token +
      "#bordered=true&titled=true";


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <iframe
        src={iframeUrl}
        frameBorder={0}
        width={800}
        height={800}
        allowTransparency
      />
      </main>
    </div>
  );
}
