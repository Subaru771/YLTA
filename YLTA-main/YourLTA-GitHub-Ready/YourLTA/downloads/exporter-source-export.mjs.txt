import * as psn from "psn-api";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const directory = dirname(fileURLToPath(import.meta.url));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const message = e => e instanceof Error ? e.message : String(e);
const csv = x => {
  const s = x == null ? "" : String(x);
  return /[",\r\n]/.test(s) ? `"${s.replaceAll('"','""')}"` : s;
};
async function request(label, action, getAuth) {
  for (let attempt=1; attempt<=5; attempt++) {
    try {
      const response = await action(await getAuth());
      if (response?.error) throw Error(message(response.error.message ?? response.error));
      await sleep(350);
      return response;
    } catch (error) {
      const retryable = /429|rate.limit|too many|timeout|ECONNRESET|ETIMEDOUT|fetch failed|\b5\d\d\b/i.test(message(error));
      if (!retryable || attempt===5) throw Error(`${label}: ${message(error)}`);
      const wait = Math.min(30000, 2500 * 2**(attempt-1));
      console.log(`${label}: retry ${attempt}/5 in ${wait/1000}s`);
      await sleep(wait);
    }
  }
}
async function main() {
  console.log("YourLTA PSN exporter — manual JSON");
  console.log("Your token stays on this PC. Never share it.");
  const rl = createInterface({input:stdin,output:stdout});
  let npsso;
  try { npsso=(await rl.question("Paste NPSSO token: ")).trim(); }
  finally { rl.close(); }
  if (!npsso) throw Error("No NPSSO token entered.");
  console.log("Authenticating with Sony...");
  const toCode = psn.exchangeNpssoForAccessCode ?? psn.exchangeNpssoForCode;
  const toTokens = psn.exchangeAccessCodeForAuthTokens ?? psn.exchangeCodeForAccessToken;
  if (!toCode || !toTokens) throw Error("Incompatible psn-api installation.");
  let token=await toTokens(await toCode(npsso));
  npsso=null;
  if (!token?.accessToken) throw Error("Sony did not return an access token.");
  let expiry=Date.now()+Number(token.expiresIn || 3600)*1000;
  async function getAuth() {
    if (Date.now()>=expiry-120000 && token.refreshToken && psn.exchangeRefreshTokenForAuthTokens) {
      token=await psn.exchangeRefreshTokenForAuthTokens(token.refreshToken);
      expiry=Date.now()+Number(token.expiresIn || 3600)*1000;
    }
    return {accessToken:token.accessToken};
  }
  const profile={syncedAt:new Date().toISOString()};
  try {
    const p=await request("Profile",a=>psn.getUserTrophyProfileSummary(a,"me"),getAuth);
    profile.level=Number(p.trophyLevel)||undefined;
    profile.progress=Number(p.progress)||undefined;
    profile.tier=Number(p.tier)||undefined;
    profile.earned=p.earnedTrophies;
    console.log("Trophy level:",profile.level??"unknown");
  } catch(e) {console.log("Profile summary unavailable; continuing:",message(e));}
  console.log("Fetching game library...");
  const games=[];
  let offset=0;
  while (true) {
    const page=await request("Games",a=>psn.getUserTitles(a,"me",{limit:800,offset}),getAuth);
    const batch=page.trophyTitles??[];
    games.push(...batch);
    const next=page.nextOffset??(offset+batch.length < (page.totalItemCount??0) ? offset+batch.length:null);
    if (!batch.length || next===null || next===offset) break;
    offset=next;
  }
  if (!games.length) throw Error("No trophy games found.");
  console.log(`Found ${games.length} games.`);
  const trophies=[], skipped=[];
  for (const [index,g] of games.entries()) {
    const options={npServiceName:g.npServiceName || "trophy"};
    try {
      const [catalog,earned]=await Promise.all([
        request("Trophy definitions",a=>psn.getTitleTrophies(a,g.npCommunicationId,"all",options),getAuth),
        request("Earned trophies",a=>psn.getUserTrophiesEarnedForTitle(a,"me",g.npCommunicationId,"all",options),getAuth)
      ]);
      const earnedById=new Map((earned.trophies??[]).map(t=>[t.trophyId,t]));
      for (const d of catalog.trophies??[]) {
        const m=earnedById.get(d.trophyId)??{};
        const rarity=Number(m.trophyEarnedRate??d.trophyEarnedRate);
        trophies.push({
          gameId:g.npCommunicationId,trophyId:d.trophyId,
          game:g.trophyTitleName,platform:g.trophyTitlePlatform,
          name:d.trophyName,description:d.trophyDetail,type:d.trophyType,
          rarity:Number.isFinite(rarity)?rarity:null,
          earned:m.earned?m.earnedDateTime:null,
          hidden:!!(d.trophyHidden??m.trophyHidden),
          dlc:!!d.trophyGroupId&&d.trophyGroupId!=="default"
        });
      }
      console.log(`[${index+1}/${games.length}] ${g.trophyTitleName} (${(catalog.trophies??[]).length})`);
    } catch(e) {
      skipped.push({game:g.trophyTitleName,error:message(e)});
      console.log(`[${index+1}/${games.length}] SKIPPED ${g.trophyTitleName}: ${message(e)}`);
    }
  }
  if (!trophies.length) throw Error("No trophies retrieved. No empty export will be written.");
  await mkdir(directory,{recursive:true});
  const data={app:"trophy-ledger",version:1,profile,trophies};
  const fields=["game","name","type","rarity","earned","description","platform","hidden","dlc","gameId","trophyId"];
  await writeFile(join(directory,"trophy-ledger-export.json"),JSON.stringify(data,null,2),"utf8");
  await writeFile(join(directory,"trophy-ledger-export.csv"),[fields.join(","),...trophies.map(t=>fields.map(f=>csv(t[f])).join(","))].join("\r\n"),"utf8");
  if (skipped.length) await writeFile(join(directory,"skipped-games.json"),JSON.stringify(skipped,null,2),"utf8");
  console.log(`\nComplete: ${trophies.length} trophies, ${trophies.filter(t=>t.earned).length} earned, ${games.length-skipped.length}/${games.length} games.`);
  console.log("Saved trophy-ledger-export.json next to this script.");
  if(skipped.length) console.log(`WARNING: ${skipped.length} games skipped; see skipped-games.json.`);
  console.log("Import JSON manually in YourLTA.");
}
main().catch(e=>{console.error("\nEXPORT FAILED:",message(e));process.exitCode=1;});
