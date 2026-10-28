import http from 'node:http';
import * as psn from 'psn-api';

const PORT = Number(process.env.PORT || 3000);
const ORIGIN = process.env.YLTA_ORIGIN || 'https://yourlta.pages.dev';
const MAX_BODY = 3072;
const MAX_ACTIVE = Math.max(1, Math.min(10, Number(process.env.YLTA_MAX_ACTIVE || 3)));
const WINDOW_MS = 60_000;
const LIMIT = Math.max(1, Math.min(30, Number(process.env.YLTA_RATE_LIMIT || 6)));
const clients = new Map();
let active = 0;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const send = (res, code, data) => { if (!res.headersSent) res.writeHead(code); res.end(JSON.stringify(data)); };
const errorText = 'Import could not complete. Verify your PSN token or retry later. Sony may be limiting requests.';
async function retry(fn) {
  for (let n=0;n<3;n++) {
    try { return await fn(); }
    catch(e) {
      if (n===2 || !/429|timeout|fetch failed|5\d\d/i.test(String(e))) throw e;
      await sleep(1000*(n+1));
    }
  }
}
const server = http.createServer(async (req,res) => {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Vary','Origin');
  if (req.headers.origin === ORIGIN) res.setHeader('Access-Control-Allow-Origin',ORIGIN);
  if (req.method==='GET' && req.url==='/health') return send(res,200,{ok:true});
  if (req.method==='OPTIONS' && req.url==='/import') {
    if(req.headers.origin!==ORIGIN) return send(res,403,{error:'Origin not allowed'});
    res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type');
    res.setHeader('Access-Control-Max-Age','600');
    return send(res,204,{});
  }
  if(req.url!=='/import' || req.method!=='POST') return send(res,404,{error:'Not found'});
  // Origin checking helps prevent accidental cross-site browser calls, but is not authentication.
  if(req.headers.origin!==ORIGIN) return send(res,403,{error:'Origin not allowed'});
  if(!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json')) return send(res,415,{error:'JSON required'});
  const key=req.socket.remoteAddress||'unknown';
  const now=Date.now();
  for(const [k,v] of clients) if(now-v.start>WINDOW_MS*2) clients.delete(k);
  const state=clients.get(key);
  const slot=(!state||now-state.start>=WINDOW_MS)?{start:now,count:0}:state;
  slot.count++;clients.set(key,slot);
  if(slot.count>LIMIT){res.setHeader('Retry-After','60');return send(res,429,{error:'Too many requests. Wait a minute and try again.'});}
  if(active>=MAX_ACTIVE) return send(res,503,{error:'Import service busy. Please retry shortly.'});
  if(Number(req.headers['content-length']||0)>MAX_BODY) return send(res,413,{error:'Request too large'});
  active++;
  const deadline=setTimeout(()=>req.destroy(),110_000);
  try {
    let body='';
    for await (const chunk of req) { body+=chunk; if(Buffer.byteLength(body)>MAX_BODY) throw new Error('Invalid request'); }
    const payload=JSON.parse(body);
    const npsso=payload.npsso;
    const start=Number(payload.offset??0);
    if(typeof npsso!=='string'||!/^[A-Za-z0-9._~-]{16,2048}$/.test(npsso)) return send(res,400,{error:'Invalid NPSSO format'});
    if(!Number.isSafeInteger(start)||start<0||start>100000) return send(res,400,{error:'Invalid offset'});
    const toCode=psn.exchangeNpssoForAccessCode??psn.exchangeNpssoForCode;
    const toTokens=psn.exchangeAccessCodeForAuthTokens??psn.exchangeCodeForAccessToken;
    const code=await retry(()=>toCode(npsso));
    const tokens=await retry(()=>toTokens(code));
    const auth={accessToken:tokens.accessToken};
    const page=await retry(()=>psn.getUserTitles(auth,'me',{limit:20,offset:start}));
    const games=page.trophyTitles||[],trophies=[],skipped=[];
    for(const g of games){
      if(req.destroyed) break;
      try {
        const opt={npServiceName:g.npServiceName||'trophy'};
        const [catalog,earned]=await Promise.all([
          retry(()=>psn.getTitleTrophies(auth,g.npCommunicationId,'all',opt)),
          retry(()=>psn.getUserTrophiesEarnedForTitle(auth,'me',g.npCommunicationId,'all',opt))
        ]);
        const earnedMap=new Map((earned.trophies||[]).map(t=>[t.trophyId,t]));
        for(const d of catalog.trophies||[]){
          const m=earnedMap.get(d.trophyId)||{};
          const rate=Number(m.trophyEarnedRate??d.trophyEarnedRate);
          trophies.push({gameId:g.npCommunicationId,trophyId:d.trophyId,game:g.trophyTitleName,platform:g.trophyTitlePlatform,name:d.trophyName,description:d.trophyDetail,type:d.trophyType,rarity:Number.isFinite(rate)?rate:null,earned:m.earned?m.earnedDateTime:null,hidden:!!(d.trophyHidden??m.trophyHidden),dlc:!!d.trophyGroupId&&d.trophyGroupId!=='default'});
        }
      } catch {skipped.push(g.trophyTitleName||'Unknown game'); }
    }
    const next=start+games.length;
    const total=Number(page.totalItemCount||next);
    return send(res,200,{trophies,skipped,nextOffset:games.length&&next<total?next:null,total,processed:next});
  } catch { if(!res.destroyed) send(res,400,{error:errorText}); }
  finally {clearTimeout(deadline);active--;}
});
server.requestTimeout=120_000;
server.headersTimeout=15_000;
server.listen(PORT,()=>console.log('YLTA mobile API listening on',PORT));
