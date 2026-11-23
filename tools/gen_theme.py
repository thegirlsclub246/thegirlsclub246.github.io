import re,sys
src=open(sys.argv[1]).read()
# collect style blocks except sb-css and tiny color-scheme one
blocks=[]
for m in re.finditer(r'<style([^>]*)>(.*?)</style>',src,re.S):
    if 'sb-css' in m.group(1) or 'sb-shop-theme' in m.group(1): continue
    blocks.append(m.group(2))
css='\n'.join(blocks)
css=re.sub(r'/\*.*?\*/','',css,flags=re.S)
CM={'#ff4d94':'#00267F','#ff5fa0':'#00267F','#f2408a':'#00267F','#e8418a':'#00267F','#f06292':'#00267F',
'#c4256b':'#001447','#4a1636':'#00267F','#4a143d':'#00267F','#240820':'#001447',
'#85506b':'#4A5675','#7a4a6a':'#4A5675','#6b3a5c':'#4A5675','#c9a9b9':'#9AA6C2','#e7cfe0':'#DCE4F5',
'#ffc9df':'#DCE4F5','#ffc2dc':'#DCE4F5','#ffe3ef':'#EEF3FF','#ffe6f0':'#EEF3FF','#ffeaf4':'#EEF3FF','#fff5fa':'#EEF3FF',
'#fff4f8':'#FFF9EC','#fff6fa':'#FFF9EC','#fff27a':'#FFC72C','#fff4b0':'#FFC72C','#fff6b0':'#FFC72C',
'#fffbd1':'#FFF3C7','#fff9d9':'#FFF3C7','#fff8c9':'#FFF3C7','#fff6c9':'#FFF3C7'}
RG={'232,65,138':'0,38,127','150,20,80':'0,20,71','74,22,54':'0,20,71','255,77,148':'0,38,127'}
SER='"Fraunces",Georgia,serif'
def fixval(prop,v):
    o=v
    v=re.sub(r'#[0-9a-fA-F]{6}\b',lambda m:CM.get(m.group(0).lower(),m.group(0)),v)
    v=re.sub(r'rgba\((\d+,\d+,\d+)(,[^)]*)\)',lambda m:'rgba('+RG.get(m.group(1),m.group(1))+m.group(2)+')',v)
    if 'Pacifico' in v: v=SER
    return v if v!=o else None
def prefix(sel):
    out=[]
    for s in sel.split(','):
        s=s.strip()
        if not s or s.startswith(':root'): continue
        if re.match(r'html\b',s): s='html:where([data-site=shop])'+s[4:]
        else: s=':where(html[data-site=shop]) '+s
        out.append(s)
    return ','.join(out)
def walk(txt):
    res=[];i=0
    while i<len(txt):
        j=txt.find('{',i)
        if j<0: break
        head=txt[i:j].strip()
        # find matching brace
        d=0;k=j
        while k<len(txt):
            if txt[k]=='{':d+=1
            elif txt[k]=='}':
                d-=1
                if d==0:break
            k+=1
        body=txt[j+1:k];i=k+1
        if head.startswith('@keyframes'): continue
        if head.startswith('@'):
            inner=walk(body)
            if inner: res.append(head+'{'+''.join(inner)+'}')
            continue
        decls=[];pac=False
        for dcl in body.split(';'):
            if ':' not in dcl: continue
            p,v=dcl.split(':',1);p=p.strip();imp='!important' if '!important' in v else '';v=v.replace('!important','').strip()
            if p.startswith('--'): continue
            nv=fixval(p,v)
            if 'Pacifico' in v: pac=True
            if p in('background','background-image') and 'radial-gradient(circle' in v:
                decls.append(p+':'+('var(--blush)' if p=='background' else 'none')+imp);continue
            if nv: decls.append(p+':'+nv+imp)
        if pac: decls.append('font-weight:800;letter-spacing:-.01em')
        ps=prefix(head)
        if decls and ps: res.append(ps+'{'+';'.join(decls)+'}')
    return res
rules=walk(css)
print('\n'.join(rules))
