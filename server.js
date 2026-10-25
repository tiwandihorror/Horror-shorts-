const http=require("http"),fs=require("fs"),path=require("path"),crypto=require("crypto");
const PORT=Number(process.env.PORT||3030),HOST=process.env.HOST||"0.0.0.0";
const DAILY_AUTOMATION=process.env.DAILY_AUTOMATION==="true", PROVIDER_MODE=process.env.VIDEO_PROVIDER||"stub";
const DATA=path.join(__dirname,"data"),JOBS=path.join(DATA,"jobs.json"),PUBLIC=path.join(__dirname,"public");
fs.mkdirSync(DATA,{recursive:true}); if(!fs.existsSync(JOBS))fs.writeFileSync(JOBS,"[]");
const stories=[
{id:"floor",title:"The Knock Beneath the Floor",text:"At 3:17 every morning, three knocks came from beneath the bedroom floor. Tonight, the knocks answered from inside the room."},
{id:"train",title:"The Last Train Home",text:"The last train was empty except for one passenger. When the lights flickered, the passenger had moved into the seat beside him."},
{id:"room09",title:"Room 09",text:"The hotel had rooms 1 through 8. Yet every night the lift stopped at 09, and something waited behind the doors."},
{id:"window",title:"The Face in the Window",text:"She lived on the third floor. Every night a face appeared in the opposite window, even though the building had been empty for years."},
{id:"recording",title:"The Birthday Recording",text:"He found an old birthday recording on his phone. The final voice on it was his own, whispering a date that had not happened yet."}];
function jobs(){try{return JSON.parse(fs.readFileSync(JOBS,"utf8"))}catch{return[]}} function save(x){fs.writeFileSync(JOBS,JSON.stringify(x,null,2))}
function scenes(s,sec){const n=Math.max(3,Math.min(8,Math.ceil(sec/6))), b=[
["Hook","Dark cartoon-horror establishing shot, exaggerated shadows, cinematic moonlight.","Slow push-in; subtle shadow movement."],
["Discovery","Character notices the impossible detail from the story.","Slow pan; character reaction; environmental motion."],
["Escalation","Supernatural presence becomes unmistakable, creepy but non-graphic.","Faster push-in; flicker; drifting dust."],
["Reveal","Disturbing visual reveal reframes the situation.","Snap zoom; brief freeze; controlled shake."],
["Final Beat","Hold on the final frightening image for the punchline caption.","Very slow zoom; fade to black."]];
return Array.from({length:n},(_,i)=>({scene:i+1,title:b[i%5][0],visual_prompt:b[i%5][1]+" Story: "+s.title,motion_prompt:b[i%5][2],duration:Math.max(3,Math.round(sec/n))}))}
function make(body){const s=stories.find(x=>x.id===body.story_id)||stories[0],sec=Number(body.duration||30);return{id:crypto.randomUUID(),created_at:new Date().toISOString(),status:"queued",story_id:s.id,story_title:s.title,duration:sec,visual_style:body.visual_style||"professional cartoon horror",narration:body.narration||"deep cinematic whisper",provider:PROVIDER_MODE,scenes:scenes(s,sec),outputs:{video:null,audio:null,thumbnail:null,publish:null},notes:"Provider adapter required for real rendering."}}
function out(res,c,d){const x=JSON.stringify(d);res.writeHead(c,{"Content-Type":"application/json","Content-Length":Buffer.byteLength(x)});res.end(x)}
function read(req){return new Promise((ok,no)=>{let s="";req.on("data",c=>s+=c);req.on("end",()=>{try{ok(s?JSON.parse(s):{})}catch(e){no(e)}})})}
async function api(req,res){const u=new URL(req.url,"http://x");
if(req.method==="GET"&&u.pathname==="/api/health")return out(res,200,{ok:true,version:"4.1",provider:PROVIDER_MODE,automation:DAILY_AUTOMATION});
if(req.method==="GET"&&u.pathname==="/api/stories")return out(res,200,stories);
if(req.method==="GET"&&u.pathname==="/api/jobs")return out(res,200,jobs());
if(req.method==="POST"&&u.pathname==="/api/jobs"){const j=make(await read(req));const a=jobs();a.unshift(j);save(a);return out(res,201,j)}
if(req.method==="POST"&&/\/api\/jobs\/[^/]+\/render$/.test(u.pathname)){const id=u.pathname.split("/")[3],a=jobs(),j=a.find(x=>x.id===id);if(!j)return out(res,404,{error:"job not found"});j.status="provider_pending";save(a);return out(res,202,{ok:true,job:j})}
if(req.method==="POST"&&/\/api\/jobs\/[^/]+\/publish$/.test(u.pathname))return out(res,501,{error:"Publishing adapter not configured"});
return out(res,404,{error:"unknown endpoint"})}
const srv=http.createServer(async(req,res)=>{try{if(req.url.startsWith("/api/"))return await api(req,res);let p=new URL(req.url,"http://x").pathname;if(p==="/")p="/index.html";const f=path.join(PUBLIC,p);if(!f.startsWith(PUBLIC))return out(res,403,{error:"forbidden"});fs.readFile(f,(e,d)=>{if(e)return out(res,404,{error:"not found"});res.writeHead(200,{"Content-Type":path.extname(f)===".html"?"text/html":"text/plain"});res.end(d)})}catch(e){out(res,500,{error:"server error"})}});
srv.listen(PORT,HOST,()=>console.log("Daily Nightmare V4.1 on port "+PORT));
if(DAILY_AUTOMATION)setInterval(()=>{const n=new Date();if(n.getHours()===9&&n.getMinutes()===0){const a=jobs(),s=stories[(n.getDate()+n.getMonth())%stories.length];a.unshift(make({story_id:s.id,duration:30}));save(a)}},60000);
