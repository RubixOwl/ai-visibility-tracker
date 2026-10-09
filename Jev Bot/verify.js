// Exercise the actual bundled browser search without external dependencies.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/Jev Docs.html','utf8');
const data=JSON.parse(html.split('id="data">')[1].split('</script>')[0]);
const code=html.split('<script>')[1].split('</script>')[0];
function element(){return {textContent:'',value:'',append(){},replaceChildren(){},scrollIntoView(){}}}
const elements=new Map;const document={getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},createElement:element};
document.getElementById('data').textContent=JSON.stringify(data);
const ctx=vm.createContext({document,fetch:async()=>({json:async()=>({ready:true,model:'test'})})});vm.runInContext(code,ctx);
for(const c of data.chunks)assert.equal(c.text,data.docs[c.doc].lines.slice(c.start-1,c.end).join('\n'));
const cases=[['What is Noul?','primitives/noul.md'],['How does confidence work?','confidence.md'],['What is the difference between Choice and Noul?','primitives'],['quick start','introduction/quickstart.md'],['Python','sdk/python'],['Does Jev support images?','concepts/system-one.md']];
for(const [q,expected] of cases){const matches=vm.runInContext('find('+JSON.stringify(q)+')',ctx);const paths=matches.map(x=>data.docs[data.chunks[x.i].doc].path);console.log(q,JSON.stringify(paths));assert(paths.some(p=>p.includes(expected)),'Missing expected source: '+expected)}
for(const q of ['chocolate banana pancakes','zzzxxyy','', '   '])assert.equal(vm.runInContext('find('+JSON.stringify(q)+').length',ctx),0);
vm.runInContext('search("What is Noul?");openDoc(0)',ctx);
assert(!/<script[^>]+src=|https?:\/\//.test(code));
console.log('PASS: '+data.chunks.length+' exact excerpts; retrieval cases; no-match cases; UI handlers; no external scripts or URLs.');
if(process.argv[2])console.log('AI candidates:',JSON.stringify(vm.runInContext('find('+JSON.stringify(process.argv[2])+',8).map(x=>x.i)',ctx)));
